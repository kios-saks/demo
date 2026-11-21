import type { MetadataRoute } from "next";
import { getWebRepository } from "../lib/repository";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
 const stages=await getWebRepository().listStages();
 const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
 // DRAFT articles must not be indexed until professional review and publication.
 return [{url:base,changeFrequency:"weekly",priority:1},...stages.map(s=>({url:base+"/"+s.slug,changeFrequency:"monthly" as const,priority:0.6}))];
}
