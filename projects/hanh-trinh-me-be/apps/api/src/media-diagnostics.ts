import {MediaError} from "./media-storage.js";
const allowed=new Set(["MEDIA_EDITOR_TOKEN_INVALID","MEDIA_REVIEWER_TOKEN_INVALID","MEDIA_PREVIEW_TOKEN_INVALID","MEDIA_TOKENS_NOT_DISTINCT","MEDIA_DB_TARGET_MISMATCH","MEDIA_PRIMARY_NOT_SUPABASE","MEDIA_STORAGE_CONFIG_MISSING","MEDIA_UPLOAD_FAILED","MEDIA_SIGN_FAILED","STORAGE_UPLOAD_FAILED","STORAGE_SIGN_FAILED","ANCHOR_MISMATCH","INVALID_WEBP","INVALID_IMAGE","INVALID_DIMENSIONS","INVALID_STORAGE_HASH","MEDIA_UNAVAILABLE","MEDIA_DISABLED","NOT_FOUND","INVALID_METADATA","ACTIVE_REVISION_CHANGED","NOT_APPROVED"]);
export class BootstrapError extends Error{
 constructor(readonly code:string){super(code);}
}
export function safeMediaFailure(error:unknown):string{
 if(error instanceof BootstrapError||error instanceof MediaError)return allowed.has(error.code)?error.code:"MEDIA_ERROR";
 if(error instanceof Error&&error.name==="AssertionError")return "ASSERTION_FAILED";
 if(error instanceof Error&&error.name==="TimeoutError")return "TIMEOUT";
 const code=error&&typeof error==="object"&&"code" in error?String(error.code):"";
 if(["08000","08001","08003","08004","08006","08P01","28P01","42501","42P01","23503","23505","23514","57014","53300","57P01","ECONNREFUSED","ECONNRESET","ETIMEDOUT","ENOTFOUND","EAI_AGAIN","ENOENT","EACCES"].includes(code))return code;
 return "UNKNOWN";
}
export function validateMediaTokens(env:Record<string,string|undefined>){
 const editor=env.MEDIA_DEV_EDITOR_TOKEN,reviewer=env.MEDIA_DEV_REVIEWER_TOKEN,preview=env.DEV_CONTENT_PREVIEW_TOKEN;
 const valid=(v:string|undefined,min:number):v is string=>typeof v==="string"&&v.length>=min&&v.length<=4096&&v.trim()===v;
 if(!valid(editor,32))throw new BootstrapError("MEDIA_EDITOR_TOKEN_INVALID");
 if(!valid(reviewer,32))throw new BootstrapError("MEDIA_REVIEWER_TOKEN_INVALID");
 if(!valid(preview,24))throw new BootstrapError("MEDIA_PREVIEW_TOKEN_INVALID");
 if(new Set([editor,reviewer,preview]).size!==3)throw new BootstrapError("MEDIA_TOKENS_NOT_DISTINCT");
 return {editor,reviewer,preview};
}
export function apiFailureCode(reply:{statusCode:number;json:()=>any}){
 if(reply.statusCode===200)return;
 let code="";try{code=reply.json()?.error;}catch{}
 // Never output response payload, headers, URLs, arbitrary error strings or secrets.
 throw new BootstrapError(allowed.has(code)?code:"MEDIA_UNAVAILABLE");
}
