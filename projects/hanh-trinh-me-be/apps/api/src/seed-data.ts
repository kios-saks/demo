import {readFileSync} from "node:fs";
import type {MockContentDataset} from "../../../packages/data/src/contracts.js";
/** Shared immutable seed file loader; never reads user/child data. */
export function loadSeedDataset():MockContentDataset{
 const read=(p:string)=>JSON.parse(readFileSync(new URL("../../../packages/content/"+p,import.meta.url),"utf8"));
 const main=read("articles.json"),manifest=read("mock/manifest.json");
 return {...main,topics:read("mock/topics.json"),sources:read("mock/sources.json"),
   researchCards:read("mock/research-cards.json"),seededAt:manifest.generatedAt};
}
