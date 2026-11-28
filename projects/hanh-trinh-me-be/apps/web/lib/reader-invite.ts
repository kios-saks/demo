import {createHash,timingSafeEqual} from "node:crypto";
export const READER_COOKIE="mebe_reader";
export function validReaderInvite(token:string):boolean{
 const hash=process.env.READER_INVITE_SHA256||"";
 if(!/^[a-f0-9]{64}$/.test(hash)||!(/^[A-Za-z0-9_-]{32,128}$/.test(token)))return false;
 return timingSafeEqual(Buffer.from(hash,"hex"),createHash("sha256").update(token).digest());
}
export function hasReaderSession(request:Request):boolean{
 const cookie=(request.headers.get("cookie")||"").split(";").map(v=>v.trim()).find(v=>v.startsWith(READER_COOKIE+"="));
 return Boolean(cookie&&validReaderInvite(cookie.slice(READER_COOKIE.length+1)));
}
