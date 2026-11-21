import type { MetadataRoute } from "next";
import data from "../../../packages/content/articles.json";
export default function sitemap(): MetadataRoute.Sitemap {
 const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
 // DRAFT articles must not be indexed until professional review and publication.
 return [{url:base,changeFrequency:"weekly",priority:1},...data.stages.map(s=>({url:base+"/"+s.slug,changeFrequency:"monthly" as const,priority:0.6}))];
}
