import {notFound} from "next/navigation";
import {openDevReader} from "../../lib/open-dev-reader";
import LearningHub from "./learning-hub";
export const dynamic="force-dynamic";
export const metadata={title:"Học cùng con — Kiến thức theo độ tuổi",robots:{index:false,follow:false}};
export default function Page(){if(!openDevReader())notFound();return <LearningHub/>;}
