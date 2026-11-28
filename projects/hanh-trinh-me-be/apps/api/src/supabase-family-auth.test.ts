import {test} from "node:test";
import assert from "node:assert/strict";
import {authConfig,createSupabaseAuth,AuthUnavailable} from "../../../packages/auth/src/supabase-auth.js";
const config={url:"https://fixture.supabase.co",publishableKey:"sb_publishable_fixture_not_real_key"};
const token="fixture.valid.jwt",id="00000000-0000-4000-8000-000000000001";
test("provider config denies unsafe endpoints and secret keys",()=>{
 assert.equal(authConfig({FAMILY_SUPABASE_URL:config.url,FAMILY_SUPABASE_PUBLISHABLE_KEY:config.publishableKey})?.url,config.url);
 for(const url of ["http://fixture.supabase.co","https://fixture.supabase.co.evil.test","https://fixture.supabase.co/other","https://u:p@fixture.supabase.co","https://fixture.supabase.co:9999"]){
  assert.equal(authConfig({FAMILY_SUPABASE_URL:url,FAMILY_SUPABASE_PUBLISHABLE_KEY:config.publishableKey}),null);
 }
 assert.equal(authConfig({FAMILY_SUPABASE_URL:config.url,FAMILY_SUPABASE_PUBLISHABLE_KEY:"sb_secret_fixture"}),null);
});
test("identity is provider-verified, email-confirmed and not anonymous",async()=>{
 let status=200,anon=false,confirmed=true;
 const adapter=createSupabaseAuth(config,async(input,init)=>{
  assert.equal(String(input),config.url+"/auth/v1/user");
  assert.equal(new Headers(init?.headers).get("authorization"),"Bearer "+token);
  assert.equal(init?.redirect,"error");assert.equal(init?.cache,"no-store");
  return Response.json({id,email:"fixture@example.invalid",is_anonymous:anon,email_confirmed_at:confirmed?"2026-01-01":null,user_metadata:{role:"owner"}},{status});
 });
 assert.equal(await adapter.verifyIdentity(token),id);
 assert.equal(await adapter.verifyIdentity("forged"),null);
 anon=true;assert.equal(await adapter.verifyIdentity(token),null);
 anon=false;confirmed=false;assert.equal(await adapter.verifyIdentity(token),null);
 confirmed=true;status=401;assert.equal(await adapter.verifyIdentity(token),null);
 status=503;await assert.rejects(()=>adapter.verifyIdentity(token),AuthUnavailable);
});
test("signup, password login and logout use provider; refresh token not returned",async()=>{
 const calls:string[]=[];
 const a=createSupabaseAuth(config,async(input,init)=>{
  const path=new URL(String(input)).pathname;calls.push(path);
  assert.equal(new Headers(init?.headers).get("apikey"),config.publishableKey);
  if(path.endsWith("/signup"))return Response.json({id});
  if(path.endsWith("/token"))return Response.json({access_token:token,refresh_token:"not-retained",expires_in:3600});
  if(path.endsWith("/user"))return Response.json({id,email:"fixture@example.invalid",email_confirmed_at:"2026-01-01",is_anonymous:false});
  return new Response(null,{status:204});
 });
 assert.equal(await a.signup("fixture@example.invalid","test-password","https://example.invalid/gia-dinh"),"accepted");
 assert.deepEqual(await a.login("fixture@example.invalid","test-password"),{token,maxAge:900});
 await a.logout(token);assert.deepEqual(calls,["/auth/v1/signup","/auth/v1/token","/auth/v1/user","/auth/v1/logout"]);
});
