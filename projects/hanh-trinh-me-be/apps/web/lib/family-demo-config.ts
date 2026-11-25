/** Public synthetic demo ONLY on the designated Combined DEV. Never a real identity. */
export function familyDemoEnabled(env:Record<string,string|undefined>=process.env){
 return env.RENDER==="true"&&env.MEBE_COMBINED_DEV==="true"&&env.RENDER_SERVICE_ID==="srv-dc19cibl550s73drji5g";
}
