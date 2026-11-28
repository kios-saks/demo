/** Types for the shared, server-side knowledge search module. */
import type {PreviewSearchArticle} from "../../../packages/data/src/contracts.js";

export interface SearchInventory {
 readonly refs: readonly unknown[];
 readonly cells: readonly unknown[];
}
export interface SearchAtlas {
 readonly stages: readonly {id:string;age:string;title:string}[];
 readonly pillars: readonly {id:string;title:string}[];
}
export interface SearchArticle {
 id:string;
 stage:string;
 pillar:string;
 title:string;
 summary:string;
 status:string;
 sections?: readonly {heading:string;body:unknown}[];
 tags?: readonly string[];
 practice?:unknown;
 limits?:unknown;
}
export interface SearchLesson {
 id:string;
 age:string;
 title:string;
 goal:string;
 status:string;
 knowledge:unknown;
 practice:unknown;
 reflection:unknown;
 tags?: readonly string[];
}
export interface SearchRow {
 key:string;
 kind:"legacy"|"article"|"lesson";
 id:string;
 stage:string;
 originalStage:string;
 pillar:string;
 title:string;
 summary:string;
 href:string;
 status:"draft";
 stageLabel:string;
 topicLabel:string;
 fields:{title:string;meta:string;body:string};
}
export interface SearchFilters {q?:string;stage?:string;topic?:string;kind?:string}
export function normalizeKnowledge(value:unknown):string;
export function createSearchIndex(inventory:SearchInventory,atlas:SearchAtlas,legacy:readonly PreviewSearchArticle[],articles:readonly SearchArticle[],lessons:readonly SearchLesson[]):SearchRow[];
export function parseSearchParams(params:URLSearchParams,atlas:SearchAtlas,legacyStages?:readonly string[]):Required<SearchFilters>;
export function searchKnowledge(index:readonly SearchRow[],filters?:SearchFilters):SearchRow[];
