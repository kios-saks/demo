import manifest from "../../../packages/content/mock/contextual-inline-illustrations.json";
type Entry={src:string;alt:string;caption:string;afterSection:number;anchorHeading:string;kind:string;reviewStatus:string};
const assets:Record<string,Entry>=manifest.assets;
export function inlineContextIllustration(slug:string,index:number,heading:string){
 const entry=assets[slug];
 return entry?.reviewStatus==="dev-context-only"&&entry.src==="/media/editorial-inline-context-"+slug+".svg"&&entry.afterSection===index&&entry.anchorHeading===heading?entry:undefined;
}
