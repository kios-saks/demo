/** Read-only index contracts for TypeScript consumers outside the Web workspace. */
export type KnowledgeKind="legacy"|"article"|"lesson";
export type KnowledgeReference={kind:string;id:string;stage:string};
export type KnowledgeEntry={key:string;kind:KnowledgeKind;id:string;stage:string;pillar:string;title:string;summary:string;href:string;status:"draft"};
export const knowledgeGroups:{id:string;label:string;stages:string[]}[];
export const knowledgeKinds:KnowledgeKind[];
export function knowledgeHref(kind:string,id:string):string;
export function compatibilityHref(ref:KnowledgeReference):string;
export function findKnowledgeReference<T extends KnowledgeReference>(inventory:{refs:readonly T[]},kind:string,id:string):T|undefined;
export function filterKnowledge<T extends {stage:string}>(entries:readonly T[],group:string,stage:string):T[];
export function buildKnowledgeIndex(inventory:{refs:readonly unknown[];cells:readonly unknown[]},atlas:{stages:readonly {id:string}[];pillars:readonly {id:string}[]},legacy:readonly unknown[],articles:readonly unknown[],lessons:readonly unknown[]):KnowledgeEntry[];
