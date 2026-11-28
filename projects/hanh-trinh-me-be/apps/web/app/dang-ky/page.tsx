import FamilyScreen from "../gia-dinh/family-screen";
import {familyWebConfig} from "../../lib/family-web-config";
import {notFound} from "next/navigation";
export const dynamic="force-dynamic";
export const metadata={title:"Đăng ký",robots:{index:false,follow:false}};
export default function Page(){
 if(process.env.NODE_ENV==="production"&&!(process.env.MEBE_COMBINED_DEV==="true"&&process.env.RENDER_SERVICE_ID==="srv-dc19cibl550s73drji5g"))notFound();
 return <FamilyScreen enabled={Boolean(familyWebConfig())} initialMode="signup"/>;
}
