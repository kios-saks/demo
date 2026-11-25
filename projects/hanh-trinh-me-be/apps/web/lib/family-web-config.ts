import {authConfig} from "../../../packages/auth/src/supabase-auth";
export function familyWebConfig(){
 if(process.env.FAMILY_WEB_ENABLED!=="true"||process.env.MEBE_COMBINED_DEV!=="true"||process.env.RENDER!=="true"||process.env.RENDER_SERVICE_ID!=="srv-dc19cibl550s73drji5g")return null;
 const auth=authConfig(process.env);
 const origin="https://hanh-trinh-me-be-web-jn5v.onrender.com";
 // Explicit loopback only; never send an account bearer to an arbitrary URL.
 if(!auth||process.env.CONTENT_API_INTERNAL_URL!=="http://127.0.0.1:4000")return null;
 return {auth,origin,api:"http://127.0.0.1:4000"};
}
