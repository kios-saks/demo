// Owner-approved link-access DEV only. Never open production or another Render service.
export function openDevReader():boolean {
 return process.env.MEBE_COMBINED_DEV==="true" && process.env.RENDER==="true" &&
   process.env.RENDER_SERVICE_ID==="srv-dc19cibl550s73drji5g";
}
