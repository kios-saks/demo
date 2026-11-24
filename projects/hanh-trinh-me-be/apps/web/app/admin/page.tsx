import type {Metadata} from "next";
import {notFound} from "next/navigation";
import CmsWorkbench from "./workbench";
import MediaWorkbench from "./media-workbench";
import "./admin.css";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"CMS quản trị — Hành Trình Mẹ & Bé",robots:{index:false,follow:false}};
export default function AdminPage(){
 const media=process.env.WEB_MEDIA_ADMIN_ENABLED==="true";
 const demo=process.env.NODE_ENV!=="production";
 if(!media&&!demo)notFound();
 return <div className="wrap inner-page admin-shell">
 <span className="eyebrow">HÀNH TRÌNH MẸ & BÉ · DEV CMS</span>
 <h1>Trung tâm quản trị</h1>
 {media?<MediaWorkbench/>:null}
 {demo?<section><h2>Biên tập nội dung (mock)</h2><p className="lead">Demo quản lý bản nháp. Không tự động xuất bản và không sử dụng PostgreSQL thật.</p><CmsWorkbench/></section>:null}
 </div>;
}
