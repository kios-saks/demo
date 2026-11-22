import type {Metadata} from "next";
import CmsWorkbench from "./workbench";
import "./admin.css";
export const metadata:Metadata={title:"CMS quản trị nội dung — Demo",robots:{index:false,follow:false}};
export default function AdminPage(){return <div className="wrap inner-page admin-shell">
<span className="eyebrow">DỰ ÁN MẸ & BÉ · CMS MOCK</span>
<h1>Trung tâm biên tập nội dung</h1>
<p className="lead">Demo quản lý bản nháp, phiên bản, gửi duyệt và phản hồi theo vai trò. Không có xác minh chứng chỉ y khoa, không tự động xuất bản và không sử dụng PostgreSQL thật.</p>
<CmsWorkbench/>
</div>}