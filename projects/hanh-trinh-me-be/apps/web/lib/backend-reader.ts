import {createHash} from "node:crypto";

type Buffered={status:number;headers:[string,string][];body:Uint8Array};
type Options={budgetMs?:number;attemptMs?:number;maxBytes?:number;accept?:RegExp};
type Dependencies={fetcher?:typeof fetch;now?:()=>number;sleep?:(ms:number)=>Promise<void>};
const transient=(s:number)=>[502,503,504].includes(s);
const json=/^application\/json(?:;|$)/i;
const retryable=(e:unknown)=>e instanceof BackendUnavailable||e instanceof TypeError||e instanceof DOMException&&(e.name==="TimeoutError"||e.name==="AbortError");
export class BackendUnavailable extends Error{constructor(){super("Backend temporarily unavailable");this.name="BackendUnavailable";}}
class InvalidBody extends Error{constructor(){super("Backend response too large");this.name="InvalidBody";}}
/** GET only. In-flight sharing is scoped to URL, all headers (hashed), and policy.
 * No completed-response cache; no credentials or content in logs.
 */
export function createBackendReader(deps:Dependencies={}){
 const now=deps.now||Date.now,sleep=deps.sleep||((ms:number)=>new Promise<void>(r=>setTimeout(r,ms)));
 const inflight=new Map<string,Promise<Buffered>>();
 const readiness=new Map<string,Promise<void>>();
 const fetcher=deps.fetcher||((input,init)=>fetch(input,init));
 function remaining(deadline:number){const ms=deadline-now();if(ms<=0)throw new BackendUnavailable();return ms;}
 async function bounded(response:Response,max:number):Promise<Uint8Array>{
  if(Number(response.headers.get("content-length")||0)>max){void response.body?.cancel().catch(()=>{});throw new InvalidBody();}
  if(!response.body)return new Uint8Array();
  const reader=response.body.getReader(),chunks:Uint8Array[]=[];let size=0;
  try{for(;;){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>max){void reader.cancel().catch(()=>{});throw new InvalidBody();}chunks.push(value);}}
  finally{reader.releaseLock();}
  return new Uint8Array(Buffer.concat(chunks));
 }
 async function once(url:string,headers:Headers,deadline:number,attemptMs:number,maxBytes:number,accept:RegExp):Promise<Buffered>{
  const response=await fetcher(url,{method:"GET",headers:Object.fromEntries(headers.entries()),cache:"no-store",redirect:"error",signal:AbortSignal.timeout(Math.max(1,Math.min(attemptMs,remaining(deadline))))} as RequestInit & {cache:"no-store"});
  if(transient(response.status)||(response.ok&&!accept.test(response.headers.get("content-type")||""))){
   void response.body?.cancel().catch(()=>{});throw new BackendUnavailable();
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
    let delay=500;
    for(;;){
     try{
      const result=await once(origin+"/health/ready",new Headers({accept:"application/json"}),deadline,attemptMs,16384,json);
      if(result.status===200&&JSON.parse(Buffer.from(result.body).toString("utf8")).ok===true)return;
      // A permanent HTTP error on readiness must not spin indefinitely.
      if(result.status>=400&&result.status<500)throw new InvalidBody();
     }catch(e){if(!retryable(e)&&!(e instanceof SyntaxError))throw e;}
     await sleep(Math.min(delay,remaining(deadline)));delay=Math.min(delay*2,5000);
    }
   })();
   readiness.set(key,flight);
   void flight.finally(()=>{if(readiness.get(key)===flight)readiness.delete(key);}).catch(()=>{});
  }
  // A later waiter can join an earlier readiness check but never exceed its own budget.
  await flight;
  remaining(deadline);
 }
 async function execute(url:URL,headers:Headers,o:Required<Options>):Promise<Buffered>{
  const deadline=now()+o.budgetMs;
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
 return async function readBackend(url:string,headersInit:ConstructorParameters<typeof Headers>[0]={},options:Options={}):Promise<Response>{
  const target=new URL(url);
  if(!["http:","https:"].includes(target.protocol)||target.username||target.password||target.hash)throw Error("Invalid backend origin");
  const headers=new Headers(headersInit);
  const o={budgetMs:options.budgetMs??65000,attemptMs:options.attemptMs??20000,maxBytes:options.maxBytes??3*1024*1024,accept:options.accept??json};
  const key=createHash("sha256").update(JSON.stringify([target.href,Array.from(headers.entries()),o.budgetMs,o.attemptMs,o.maxBytes,o.accept.source,o.accept.flags])).digest("hex");
  let flight=inflight.get(key);
  if(!flight){
   // Bound memory/concurrency for unique requests, including attacker-supplied CMS credentials.
   if(inflight.size>=32)throw new BackendUnavailable();
   flight=execute(target,headers,o);inflight.set(key,flight);
   void flight.finally(()=>{if(inflight.get(key)===flight)inflight.delete(key);}).catch(()=>{});
  }
  const result=await flight;
  return new Response([204,205,304].includes(result.status)?null:new Uint8Array(result.body),{status:result.status,headers:result.headers});
 };
}
export const readBackend=createBackendReader();
