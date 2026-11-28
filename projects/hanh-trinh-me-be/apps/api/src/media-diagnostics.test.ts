import test from "node:test";
import assert from "node:assert/strict";
import {MediaError} from "./media-storage.js";
import {validateMediaTokens,safeMediaFailure,apiFailureCode} from "./media-diagnostics.js";
test("bootstrap configuration errors identify missing role without exposing secret values",()=>{
 const e={MEDIA_DEV_EDITOR_TOKEN:"e".repeat(40),MEDIA_DEV_REVIEWER_TOKEN:"r".repeat(40),DEV_CONTENT_PREVIEW_TOKEN:"p".repeat(40)};
 assert.equal(validateMediaTokens(e).editor,e.MEDIA_DEV_EDITOR_TOKEN);
 for(const [key,code] of [["MEDIA_DEV_EDITOR_TOKEN","MEDIA_EDITOR_TOKEN_INVALID"],["MEDIA_DEV_REVIEWER_TOKEN","MEDIA_REVIEWER_TOKEN_INVALID"],["DEV_CONTENT_PREVIEW_TOKEN","MEDIA_PREVIEW_TOKEN_INVALID"]] as const){
   assert.throws(()=>validateMediaTokens({...e,[key]:"placeholder"}),new RegExp(code));
 }
 assert.throws(()=>validateMediaTokens({...e,MEDIA_DEV_REVIEWER_TOKEN:e.MEDIA_DEV_EDITOR_TOKEN}),/MEDIA_TOKENS_NOT_DISTINCT/);
});
test("diagnostics suppress arbitrary upstream errors and secrets",()=>{
 assert.equal(safeMediaFailure(new Error("postgresql://sensitive-secret")), "UNKNOWN");
 assert.equal(safeMediaFailure(Object.assign(new Error("secret"),{code:"42501"})), "42501");
 assert.throws(()=>apiFailureCode({statusCode:503,json:()=>({error:"private-secret"})}),/MEDIA_UNAVAILABLE/);
 assert.throws(()=>apiFailureCode({statusCode:503,json:()=>({error:"STORAGE_UPLOAD_FAILED"})}),/STORAGE_UPLOAD_FAILED/);
});

test("runtime diagnostics distinguish private storage integrity, status and transport without leaking values",()=>{
 for(const kind of ["STORAGE_READ_FAILED","STORAGE_SIGN_FAILED","MEDIA_INTEGRITY","INVALID_STORAGE_PATH"])
  assert.equal(safeMediaFailure(new MediaError(503,kind)),kind);
 assert.equal(safeMediaFailure(new TypeError("private URL with token",{cause:{code:"ECONNRESET"}})),"ECONNRESET");
 assert.equal(safeMediaFailure(new DOMException("private detail","AbortError")),"TIMEOUT");
 assert.equal(safeMediaFailure(new MediaError(503,"arbitrary-secret")),"MEDIA_ERROR");
 assert.equal(safeMediaFailure(new TypeError("secret",{cause:{code:"secret"}})),"UNKNOWN");
});
