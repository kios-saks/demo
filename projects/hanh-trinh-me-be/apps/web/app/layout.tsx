import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: { default: "Hành Trình Mẹ & Bé | Kiến thức cùng gia đình", template: "%s | Hành Trình Mẹ & Bé" },
  description: "Một thư viện kiến thức theo hành trình từ chuẩn bị mang thai đến khi con trưởng thành. Nội dung mẫu đang chờ thẩm định chuyên môn.",
  openGraph: { type: "website", locale: "vi_VN", siteName: "Hành Trình Mẹ & Bé" },
  robots: { index: false, follow: false } // No reviewed content yet; do not index the prototype.
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <header className="topbar">
          <div className="wrap nav">
            <Link href="/" className="brand"><span className="brand-mark">♡</span><span>Hành Trình <b>Mẹ & Bé</b></span></Link>
            <nav aria-label="Điều hướng chính"><Link href="/">Khám phá</Link><Link href="/tim-kiem">Tra cứu</Link>{process.env.WEB_CONTENT_PROVIDER==="api"&&process.env.NODE_ENV==="production"?null:<Link href="/bien-tap">Góc biên tập</Link>}{process.env.DEV_CONTENT_PREVIEW_TOKEN&&process.env.DEV_CONTENT_PREVIEW_TOKEN.length>=24?<Link href="/dev-review">Thư viện DEV 🔒</Link>:null}</nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="footer"><div className="wrap">
          <p><b>Hành Trình Mẹ & Bé</b> — Đồng hành qua từng chặng lớn lên.</p>
          <small>Nội dung bản nháp để minh họa sản phẩm; chưa được thẩm định y khoa. Không thay thế tư vấn chuyên môn hoặc dịch vụ cấp cứu.</small>
        </div></footer>
      </body>
    </html>
  );
}
