import {createHash} from "node:crypto";

export const MAX_MEDIA_BYTES=2*1024*1024;
export const MEDIA_BUCKET="mebe-draft-media";
export class MediaError extends Error {
 constructor(readonly status:number,readonly code:string){super(code);}
}
export const digest=(bytes:Buffer)=>createHash("sha256").update(bytes).digest("hex");
export function readWebp(value:unknown){
 if(typeof value!=="string"||value.length>Math.ceil(MAX_MEDIA_BYTES/3)*4||!(/^[A-Za-z0-9+/]+={0,2}$/).test(value))
   throw new MediaError(400,"INVALID_IMAGE");
 const b=Buffer.from(value,"base64");
 if(b.toString("base64")!==value||b.length<30||b.length>MAX_MEDIA_BYTES||b.toString("ascii",0,4)!=="RIFF"||b.toString("ascii",8,12)!=="WEBP"||b.readUInt32LE(4)+8!==b.length)
   throw new MediaError(400,"INVALID_WEBP");
 let width=0,height=0;
 const type=b.toString("ascii",12,16);
 if(type==="VP8X"&&!(b[20]&2)){width=b.readUIntLE(24,3)+1;height=b.readUIntLE(27,3)+1;}
 else if(type==="VP8L"&&b[20]===47){const bits=b.readUInt32LE(21);width=(bits&16383)+1;height=((bits>>>14)&16383)+1;}
 else if(type==="VP8 "&&b[23]===157&&b[24]===1&&b[25]===42){width=b.readUInt16LE(26)&16383;height=b.readUInt16LE(28)&16383;}
 if(!width||!height||width>4096||height>4096||width*height>16777216)throw new MediaError(400,"INVALID_DIMENSIONS");
 // Reject malformed chunk bounds and animation; browser decode is still a separate QA gate.
 let pos=12;while(pos+8<=b.length){const tag=b.toString("ascii",pos,pos+4),size=b.readUInt32LE(pos+4);if(tag==="ANIM"||tag==="ANMF")throw new MediaError(400,"ANIMATION_NOT_ALLOWED");pos+=8+size+(size%2);if(pos>b.length)throw new MediaError(400,"INVALID_WEBP");}
 if(pos!==b.length)throw new MediaError(400,"INVALID_WEBP");
 return {bytes:b,id:digest(b),width,height};
}
export class PrivateMediaStorage{
 private readonly origin:string;
 constructor(url:string,private readonly key:string,private readonly request:typeof fetch=fetch){
   const u=new URL(url);if(u.protocol!=="https:"||u.username||u.password||u.pathname!=="/"||u.search||u.hash||!u.hostname.endsWith(".supabase.co"))throw new Error("Invalid media storage origin");
   this.origin=u.origin;
 }
 private path(path:string){if(!/^[0-9a-f]{64}\.(webp|svg|png|jpg)$/.test(path))throw new MediaError(500,"INVALID_STORAGE_PATH");return MEDIA_BUCKET+"/"+path;}
 private headers(extra:Record<string,string>={}){return {apikey:this.key,Authorization:"Bearer "+this.key,...extra};}
 async upload(path:string,bytes:Buffer,mime:"image/webp"|"image/svg+xml"="image/webp"){
   if(path!==digest(bytes)+(mime==="image/webp"?".webp":".svg"))throw new MediaError(400,"INVALID_STORAGE_HASH");
   const suffix=this.path(path);
   const res=await this.request(this.origin+"/storage/v1/object/"+suffix,{method:"POST",headers:this.headers({"Content-Type":mime,"x-upsert":"false"}),body:new Uint8Array(bytes),signal:AbortSignal.timeout(15000),redirect:"error"});
   if(res.ok)return;
   // A retry may find the same immutable object. Never overwrite; verify bytes.
   if(res.status===400||res.status===409){
     const existing=await this.request(this.origin+"/storage/v1/object/authenticated/"+suffix,{headers:this.headers(),signal:AbortSignal.timeout(15000),redirect:"error"});
     if(existing.ok&&digest(Buffer.from(await existing.arrayBuffer()))===digest(bytes))return;
   }
   console.warn("MEDIA_STORAGE_HTTP_FAILURE",JSON.stringify({operation:"upload",status:res.status}));
   throw new MediaError(503,"STORAGE_UPLOAD_FAILED");
 }
 async signedUrl(path:string){
   const suffix=this.path(path);
   const res=await this.request(this.origin+"/storage/v1/object/sign/"+suffix,{method:"POST",headers:this.headers({"Content-Type":"application/json"}),body:JSON.stringify({expiresIn:120}),signal:AbortSignal.timeout(10000),redirect:"error"});
   if(!res.ok){console.warn("MEDIA_STORAGE_HTTP_FAILURE",JSON.stringify({operation:"sign",status:res.status}));throw new MediaError(503,"STORAGE_SIGN_FAILED");}
   const data=await res.json() as {signedURL?:string};
   const expected="/storage/v1/object/sign/"+suffix;
   if(typeof data.signedURL!=="string")throw new MediaError(503,"STORAGE_SIGN_FAILED");
   const raw=data.signedURL.startsWith("/object/sign/")?"/storage/v1"+data.signedURL:data.signedURL;
   const u=new URL(raw,this.origin);
   if(u.origin!==this.origin||u.pathname!==expected||!u.searchParams.get("token")||u.hash||u.username||u.password)throw new MediaError(503,"STORAGE_SIGN_FAILED");
   return u.toString();
 }
}
