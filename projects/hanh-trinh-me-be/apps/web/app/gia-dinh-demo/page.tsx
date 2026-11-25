import {notFound} from "next/navigation";
import {familyDemoEnabled} from "../../lib/family-demo-config";
import FamilyDemo from "./family-demo-screen";
export const dynamic="force-dynamic";
export const metadata={title:"Trải nghiệm gia đình mẫu",robots:{index:false,follow:false}};
export default function Page(){if(!familyDemoEnabled())notFound();return <FamilyDemo/>;}
