import type { Metadata } from "next";
import Link from "next/link";
import {familyDemoEnabled} from "../lib/family-demo-config";
import {familyWebConfig} from "../lib/family-web-config";
import "./globals.css";
import "./ui-ux-pro-max.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: { default: "Hành Trình Mẹ & Bé | Đồng hành cùng gia đình", template: "%s | Hành Trình Mẹ & Bé" },
  description: "Khám phá 12 chặng từ chuẩn bị mang thai đến lúc con trưởng thành, với bài viết, câu hỏi thực hành và nguồn tham khảo rõ ràng.",
  openGraph: { type: "website", locale: "vi_VN", siteName: "Hành Trình Mẹ & Bé" },
  robots: { index: false, follow: false } // No reviewed content yet. Never index drafts.
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
 return (
  <html lang="vi">
   <body>
    <a className="skip-to-content" href="#noi-dung-chinh">Đi thẳng đến nội dung chính</a>
    <header className="topbar">
     <div className="wrap nav">
      <Link href="/" className="brand" aria-label="Hành Trình Mẹ & Bé – về trang chủ">
       <span className="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
         <path d="M16 27.5 5.7 17.3a7 7 0 0 1 10.3-9.4 7 7 0 0 1 10.3 9.4L16 27.5Z" stroke="currentColor" strokeWidth="2.1" strokeLinejoin="round"/>
         <path d="M16 21.5c0-5.5 2.4-9.3 6.5-11.5M16 19.5c-.2-3-2.2-5.2-4.6-6.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
       </span>
       <span>Hành Trình <b>Mẹ & Bé</b></span>
      </Link>
      <nav className="site-nav" aria-label="Điều hướng chính">
       {familyDemoEnabled()?<Link href="/kham-pha">Khám phá</Link>:<Link href="/#hanh-trinh">Các giai đoạn</Link>}
       <Link href="/tim-kiem">Tìm kiếm</Link>
       <Link href="/nguon-tham-khao">Nguồn tham khảo</Link>
       {familyWebConfig()&&<Link href="/gia-dinh">Gia đình</Link>}
       {process.env.WEB_CONTENT_PROVIDER==="api"&&process.env.NODE_ENV==="production"?null:<Link href="/bien-tap">Góc biên tập</Link>}
       
      </nav>
     </div>
    </header>
    <main id="noi-dung-chinh">{children}</main>
    <footer className="footer">
     <div className="wrap footer-inner">
      <div>
       <p><strong>Hành Trình Mẹ & Bé</strong> — Đồng hành bằng kiến thức và sự thấu hiểu.</p>
       <small>Nội dung chưa được thẩm định y khoa. Không dùng để tự chẩn đoán, điều trị hoặc thay thế dịch vụ cấp cứu.</small>
      </div>
      <nav className="footer-links" aria-label="Liên kết cuối trang">
       <Link href="/#hanh-trinh">12 giai đoạn</Link>
       <Link href="/nguon-tham-khao">Nguồn tham khảo</Link>
       
      </nav>
     </div>
    </footer>
   </body>
  </html>
 );
}
