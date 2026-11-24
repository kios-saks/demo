import visuals from "../../../packages/content/mock/editorial-visual-briefs.json";
import generated from "../../../packages/content/mock/infographic-cards.json";
import curated from "../../../packages/content/mock/editorial-curated-infographics.json";

const keys=new Set(Object.keys(visuals.coverBriefs));
const navigation=new Set(Object.keys(visuals.navigation));
const cards=new Map(generated.cards.map(c=>[c.articleSlug,c]));
const knownCurated:Record<string,{src:string;sourceUrl:string;points:string[]}>=curated;
export const editorialHero="/media/editorial-hero.svg";
export function groupVisual(key:string){return navigation.has("group-"+key)?"/media/editorial-group-"+key+".svg":editorialHero}
export function stageVisual(key:string){return navigation.has("stage-"+key)?"/media/editorial-stage-"+key+".svg":editorialHero}
export function articleCover(slug:string,fallback?:string){return keys.has(slug)?"/media/editorial-cover-"+slug+".svg":fallback}
export function coverAlt(title:string){return "Tranh minh họa biên tập theo chủ đề: "+title}
export function inlineAsset(slug:string,v:{src:string;sourceUrl?:string;points?:readonly string[]}){
 const card=cards.get(slug),original=knownCurated[slug];
 const samePoints=card&&v.points&&card.points.length===v.points.length&&card.points.every((p,i)=>p===v.points?.[i]);
 const points=card&&samePoints&&v.sourceUrl===card.sourceUrl&&v.src==="/media/auto-infographic-"+slug+".svg"?card.points:
  original&&v.src===original.src&&v.sourceUrl===original.sourceUrl?original.points:undefined;
 return points?{src:"/media/editorial-infographic-"+slug+".svg",width:720,height:points.length===4?1320:1100,points}:
  {src:v.src,width:1200,height:v.src.startsWith("/media/auto-infographic-")?720:640,points:v.points};
}
