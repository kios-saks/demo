import type { MetadataRoute } from "next";
import {openDevReader} from "../lib/open-dev-reader";
export default function robots(): MetadataRoute.Robots {
  if(openDevReader())return {rules:[{userAgent:"*",disallow:"/"}]};
  const base=process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return {rules:[{userAgent:"*",allow:"/",disallow:["/bai-viet/","/bien-tap/","/goc-nghien-cuu/","/nguon-tham-khao/"]}],sitemap:base+"/sitemap.xml"};
}
