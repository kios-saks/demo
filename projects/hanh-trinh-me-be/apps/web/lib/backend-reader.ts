import {createHash} from "node:crypto";
import {request as httpsRequest} from "node:https";
import {createReadLane,ReadLaneError} from "./read-lane";
import {openDevReader} from "./open-dev-reader";

type Buffered={status:number;headers:[string,string][];body:Uint8Array};
type Options={budgetMs?:number;attemptMs?:number;maxBytes?:number;accept?:RegExp};
type Dependencies={fetcher?:typeof fetch;readinessFetcher?:typeof fetch;now?:()=>number;sleep?:(ms:number)=>Promise<void>;diagnostic?:(event:string,data:Record<string,number|string>)=>void;mediaLaneEnabled?:()=>boolean};
const transient=(s:number)=>[502,503,504].includes(s);
const json=/^application\/json(?:;|$)/i;
const retryable=(e:unknown)=>e instanceof BackendUnavailable||e instanceof TypeError||e instanceof DOMException&&(e.name==="TimeoutError"||e.name==="AbortError");
export class BackendUnavailable extends Error{constructor(readonly reason="UNAVAILABLE",readonly status=0){super("Backend temporarily unavailable");this.name="BackendUnavailable";}}
export function transportKind(error:unknown){
 if(error instanceof ReadLaneError)return error.reason;
 if(error instanceof InvalidBody)return "BODY_TOO_LARGE";
 if(error instanceof BackendUnavailable)return error.reason;
 if(error instanceof SyntaxError)return "INVALID_JSON";
 if(error instanceof DOMException&&["TimeoutError","AbortError"].includes(error.name))return "TIMEOUT";
 const e=error as {code?:string;cause?:{code?:string}}|null;
 const code=e?.code||e?.cause?.code||"";
 if(["ENOTFOUND","EAI_AGAIN","ENODATA"].includes(code))return "DNS";
 if(["CERT_HAS_EXPIRED","UNABLE_TO_VERIFY_LEAF_SIGNATURE","ERR_TLS_CERT_ALTNAME_INVALID","SELF_SIGNED_CERT_IN_CHAIN"].includes(code)||code.startsWith("ERR_SSL")||code.startsWith("ERR_TLS"))return "TLS";
 if(["ETIMEDOUT","UND_ERR_CONNECT_TIMEOUT","UND_ERR_HEADERS_TIMEOUT","UND_ERR_BODY_TIMEOUT","ABORT_ERR"].includes(code))return "TIMEOUT";
 if(["ECONNREFUSED","ECONNRESET","EHOSTUNREACH","ENETUNREACH","EPIPE"].includes(code))return code;
 return "TRANSPORT";
}
/** Plain HTTPS GET to the configured public service, through system DNS and
 * standard TLS verification. No redirect, token, cookie, proxy or reused socket.
 * This isolates the wake path from Next's patched fetch / pooled connections.
 */
const nativeReadiness:typeof fetch=(async(input,init)=>{
 const url=new URL(String(input));
 if(url.protocol!=="https:"||url.username||url.password||url.pathname!=="/health/ready"||url.search||url.hash)throw Error("Invalid readiness URL");
 return new Promise<Response>((resolve,reject)=>{
  const req=httpsRequest(url,{method:"GET",agent:false,signal:init?.signal??undefined,headers:{accept:"application/json","accept-encoding":"identity","cache-control":"no-cache","user-agent":"mebe-web-readiness/1.0"}},res=>{
   const chunks:Buffer[]=[];let size=0;
   res.on("data",(chunk:Buffer)=>{size+=chunk.length;if(size>16384){res.destroy();reject(new InvalidBody());return;}chunks.push(chunk);});
   res.on("error",reject);
   res.on("aborted",()=>reject(new TypeError("Readiness response aborted")));
   res.on("end",()=>{const status=res.statusCode||503;const type=res.headers["content-type"];try{resolve(new Response([204,205,304].includes(status)?null:new Uint8Array(Buffer.concat(chunks)),{status,headers:typeof type==="string"?{"content-type":type}:{}}));}catch(e){reject(e);}});
  });
  req.on("error",e=>{const error=new TypeError("Readiness transport failed",{cause:e});reject(error);});
  req.end();
 });
}) as typeof fetch;
function useNativeReadiness(origin:string){
 if(process.env.RENDER!=="true"||!process.env.CONTENT_API_INTERNAL_URL)return false;
 try{const configured=new URL(process.env.CONTENT_API_INTERNAL_URL);return configured.origin===origin&&configured.protocol==="https:"&&configured.hostname.endsWith(".onrender.com")&&!configured.username&&!configured.password;}catch{return false;}
}
class InvalidBody extends Error{constructor(){super("Backend response too large");this.name="InvalidBody";}}
/** GET only. In-flight sharing is scoped to URL, all headers (hashed), and policy.
 * No completed-response cache; no credentials or content in logs.
 */
export function createBackendReader(deps:Dependencies={}){
 const now=deps.now||Date.now,sleep=deps.sleep||((ms:number)=>new Promise<void>(r=>setTimeout(r,ms)));
 const inflight=new Map<string,Promise<Buffered>>();
 const mediaFlights=new Map<string,Promise<Buffered>>();
 const mediaLane=createReadLane(6,80);
 const laneEnabled=deps.mediaLaneEnabled||openDevReader;
 const readiness=new Map<string,Promise<void>>();
 const fetcher=deps.fetcher||((input,init)=>fetch(input,init));
 const diagnostic=deps.diagnostic||((event,data)=>{if(process.env.RENDER==="true")console.info(event,JSON.stringify(data));});
 function remaining(deadline:number){const ms=deadline-now();if(ms<=0)throw new BackendUnavailable();return ms;}
 async function bounded(response:Response,max:number):Promise<Uint8Array>{
  if(Number(response.headers.get("content-length")||0)>max){void response.body?.cancel().catch(()=>{});throw new InvalidBody();}
  if(!response.body)return new Uint8Array();
  const reader=response.body.getReader(),chunks:Uint8Array[]=[];let size=0;
  try{for(;;){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>max){void reader.cancel().catch(()=>{});throw new InvalidBody();}chunks.push(value);}}
  finally{reader.releaseLock();}
  return new Uint8Array(Buffer.concat(chunks));
 }
 async function once(url:string,headers:Headers,deadline:number,attemptMs:number,maxBytes:number,accept:RegExp,transport=fetcher):Promise<Buffered>{
  const response=await transport(url,{method:"GET",headers:Object.fromEntries(headers.entries()),cache:"no-store",redirect:"error",signal:AbortSignal.timeout(Math.max(1,Math.min(attemptMs,remaining(deadline))))} as RequestInit & {cache:"no-store"});
  if(transient(response.status)||(response.ok&&!accept.test(response.headers.get("content-type")||""))){
   void response.body?.cancel().catch(()=>{});throw new BackendUnavailable(transient(response.status)?"HTTP_"+response.status:"UNEXPECTED_CONTENT_TYPE",response.status);
  }
  const body=await bounded(response,maxBytes);
  return {status:response.status,headers:Array.from(response.headers.entries()),body};
 }
 async function waitReady(origin:string,deadline:number,attemptMs:number,budgetMs:number){
  // Distinct policy budgets must not make a short public request cancel a private waiter.
  const key=origin+"|"+budgetMs+"|"+attemptMs;
  let flight=readiness.get(key);
  if(!flight){
   flight=(async()=>{
    let delay=500,attempt=0;const started=now();
    const native=useNativeReadiness(origin)&&!deps.fetcher;
    const probe=deps.readinessFetcher||(native?nativeReadiness:fetcher);
    const mode=native?"native-https":"fetch";
    diagnostic("BACKEND_WAKE_START",{mode,budgetMs:remaining(deadline)});
    try{
     for(;;){
      attempt++;const probeStarted=now();
      try{
       // A native health GET can stay connected during the platform's cold start;
       // it shares the original total deadline, not a new unbounded timeout.
       const result=await once(origin+"/health/ready",new Headers({accept:"application/json"}),deadline,native?45000:attemptMs,16384,json,probe);
       if(result.status===200&&JSON.parse(Buffer.from(result.body).toString("utf8")).ok===true){
        diagnostic("BACKEND_WAKE_READY",{mode,attempt,elapsedMs:now()-started});return;
       }
       diagnostic("BACKEND_WAKE_PROBE",{mode,attempt,status:result.status,kind:"NOT_READY",elapsedMs:now()-probeStarted});
       if(result.status>=400&&result.status<500)throw new InvalidBody();
      }catch(e){
       if(!retryable(e)&&!(e instanceof SyntaxError))throw e;
       diagnostic("BACKEND_WAKE_PROBE",{mode,attempt,status:e instanceof BackendUnavailable?e.status:0,kind:transportKind(e),elapsedMs:now()-probeStarted});
      }
      await sleep(Math.min(delay,remaining(deadline)));delay=Math.min(delay*2,5000);
     }
    }catch(e){diagnostic("BACKEND_WAKE_FAIL",{mode,attempt,kind:transportKind(e),elapsedMs:now()-started});throw e;}
   })();
   readiness.set(key,flight);
   void flight.finally(()=>{if(readiness.get(key)===flight)readiness.delete(key);}).catch(()=>{});
  }
  // A later waiter can join an earlier readiness check but never exceed its own budget.
  await flight;
  remaining(deadline);
 }
 async function execute(url:URL,headers:Headers,o:Required<Options>,deadline=now()+o.budgetMs):Promise<Buffered>{
  let delay=500;
  for(;;){
   try{return await once(url.href,headers,deadline,o.attemptMs,o.maxBytes,o.accept);}
   catch(e){
    if(!retryable(e))throw e;
    remaining(deadline);
    await waitReady(url.origin,deadline,o.attemptMs,o.budgetMs);
    // Delay between repeated application-level 503s even if readiness itself is green.
    await sleep(Math.min(delay,remaining(deadline)));delay=Math.min(delay*2,5000);
   }
  }
 }
 async function readBackend(url:string,headersInit:ConstructorParameters<typeof Headers>[0]={},options:Options={}):Promise<Response>{
  const target=new URL(url);
  if(!["http:","https:"].includes(target.protocol)||target.username||target.password||target.hash)throw Error("Invalid backend origin");
  const headers=new Headers(headersInit);
  const o={budgetMs:options.budgetMs??65000,attemptMs:options.attemptMs??20000,maxBytes:options.maxBytes??3*1024*1024,accept:options.accept??json};
  const key=createHash("sha256").update(JSON.stringify([target.href,Array.from(headers.entries()),o.budgetMs,o.attemptMs,o.maxBytes,o.accept.source,o.accept.flags])).digest("hex");
  // Only authorized internal preview binary paths use the separate DEV lane.
  // Metadata, CMS, search, public and family traffic keep the original reader.
  const media=laneEnabled()&&headers.has("x-preview-token")&&
    /^\/v1\/dev-preview\/(?:media-catalog\/[a-z0-9-]{1,180}\.(?:webp|svg)|media\/[a-z0-9-]{1,160}\/(?:cover|inline))$/.test(target.pathname);
  const flights=media?mediaFlights:inflight;
  let flight=flights.get(key);
  if(!flight){
   const start=now(),deadline=start+o.budgetMs;
   if(!media&&inflight.size>=32){
    diagnostic("BACKEND_READ_REJECTED",{lane:"content",kind:"INFLIGHT_LIMIT",active:inflight.size});
    throw new BackendUnavailable("INFLIGHT_LIMIT");
   }
   const task=()=>execute(target,headers,o,deadline);
   flight=media?mediaLane.run(task,Math.max(0,deadline-now())):task();
   flights.set(key,flight);
   void flight.then(()=>{},e=>{
    diagnostic("BACKEND_READ_FAILED",{lane:media?"media":"content",kind:transportKind(e),status:e instanceof BackendUnavailable?e.status:0,elapsedMs:now()-start,active:media?mediaLane.stats().active:inflight.size,queued:media?mediaLane.stats().queued:0});
   }).catch(()=>{});
   void flight.finally(()=>{if(flights.get(key)===flight)flights.delete(key);}).catch(()=>{});
  }
  const result=await flight;
  return new Response([204,205,304].includes(result.status)?null:new Uint8Array(result.body),{status:result.status,headers:result.headers});
 }
 return Object.assign(readBackend,{ready:async(origin:string,budgetMs=65000,attemptMs=20000)=>{
  const url=new URL(origin);
  if(!["http:","https:"].includes(url.protocol)||url.username||url.password||url.search||url.hash||url.pathname!=="/")throw Error("Invalid readiness origin");
  await waitReady(url.origin,now()+budgetMs,attemptMs,budgetMs);
 }});
}
export const readBackend=createBackendReader();
