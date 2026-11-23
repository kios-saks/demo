/**
 * Build 24 human-curated, draft infographic SVGs. No network access, no
 * copied diagrams, and no claim of clinical review or source endorsement.
 * Safe to re-run; outputs are deterministic and gitignored.
 */
import {readFileSync,writeFileSync,mkdirSync,readdirSync,unlinkSync} from "node:fs";
import {join} from "node:path";
import {fileURLToPath} from "node:url";
import assert from "node:assert/strict";

const root=new URL("../",import.meta.url);
const read=name=>JSON.parse(readFileSync(new URL(name,root),"utf8"));
const d=read("packages/content/articles.json");
const manifest=read("packages/content/mock/infographic-cards.json");
const dest=fileURLToPath(new URL("apps/web/public/media/",root));
mkdirSync(dest,{recursive:true});
assert.equal(manifest.editorialStatus,"draft");
assert.equal(manifest.cards.length,24);
const stages=new Map(d.stages.map(s=>[s.slug,s]));
const articles=new Map(d.articles.map(a=>[a.slug,a]));
const palette={
 "chuan-bi-mang-thai":["#fff1e5","#efc7cf","#9c6678"],
 "thai-ky-3-thang-dau":["#fff0e7","#e7c3e1","#9a678f"],
 "thai-ky-3-thang-giua":["#eff8e9","#c7e4d5","#6d9b81"],
 "thai-ky-3-thang-cuoi":["#f1eefc","#d9cbe8","#8572a6"],
 "hau-san":["#fff0ec","#f1d0d6","#ae7e85"],
 "so-sinh":["#edf6ff","#c8dced","#7597b9"],
 "nhu-nhi":["#fff5e7","#d7ead1","#8d9d69"],
 "tap-di":["#fff4e9","#f4d7bf","#c18f71"],
 "mam-non":["#faeefd","#ead0f0","#997bad"],
 "tieu-hoc":["#edf8f4","#cfe8e3","#6e9a94"],
 "thieu-nien":["#f3eefb","#edd6e9","#9679aa"],
 "truong-thanh":["#eff5f8","#d6e4ed","#7598ae"]
};
const xml=s=>String(s).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;"}[ch]));
function wrap(str,width,maxLines){
 const words=String(str).split(/\s+/); const lines=[];let line="";
 for(const word of words){
  if((line?line.length+1:0)+word.length>width&&line){lines.push(line);line=word;}
  else line+=(line?" ":"")+word;
 }
 if(line)lines.push(line);
 assert(lines.length<=maxLines,"Text too long for infographic: "+str);
 return lines;
}
function drawLines(lines,x,y,lineHeight,fontSize,color,weight){
 return lines.map((line,i)=>'<text x="'+x+'" y="'+(y+lineHeight*i)+'" fill="'+color+'" font-family="Arial,system-ui,sans-serif" font-size="'+fontSize+'" font-weight="'+weight+'">'+xml(line)+'</text>').join("");
}
function draw(card,i,article){
 const stage=stages.get(article.stage);
 const [bg,tint,accent]=palette[article.stage];
 const headline=wrap(card.title,34,2);
 const cards=card.points.map((point,n)=>{
  const x=64+n*381, top=257;
  const lines=wrap(point,25,4);
  return '<g>'+
    '<rect x="'+x+'" y="'+top+'" width="357" height="320" rx="26" fill="#fff" stroke="'+tint+'" stroke-width="3"/>'+
    '<path d="M'+(x+25)+' '+(top+81)+'h92" stroke="'+tint+'" stroke-width="7" stroke-linecap="round"/>'+
    '<circle cx="'+(x+60)+'" cy="'+(top+55)+'" r="31" fill="'+accent+'" opacity=".17"/>'+
    '<text x="'+(x+60)+'" y="'+(top+67)+'" text-anchor="middle" font-size="33" font-weight="800" font-family="Arial,sans-serif" fill="'+accent+'">'+(n+1)+'</text>'+
    '<path d="M'+(x+278)+' '+(top+60)+'q22 -29 44 0q-22 29 -44 0Z" fill="'+tint+'" opacity=".8"/>'+
    drawLines(lines,x+28,top+136,45,27,"#493844","700")+
    '<path d="M'+(x+29)+' '+(top+273)+'h75" stroke="'+accent+'" opacity=".28" stroke-width="7" stroke-linecap="round"/>'+
    '</g>';
 }).join("");
 return '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720" viewBox="0 0 1200 720" role="img" aria-label="'+xml(card.title)+'">'+
  '<defs><linearGradient id="paper" x1="0" y1="0" x2="1" y2="1"><stop stop-color="'+bg+'"/><stop offset="1" stop-color="'+tint+'"/></linearGradient></defs>'+
  '<rect width="1200" height="720" fill="url(#paper)"/>'+
  '<circle cx="1145" cy="6" r="230" fill="#fff" opacity=".24"/><circle cx="14" cy="690" r="230" fill="#fff" opacity=".20"/>'+
  '<circle cx="78" cy="62" r="21" fill="'+accent+'"/><path d="M69 63Q63 50 79 56Q95 49 92 62L80 74Z" fill="#fff"/>'+
  '<text x="115" y="70" fill="'+accent+'" font-size="20" font-weight="750" font-family="Arial,sans-serif">HÀNH TRÌNH MẸ &amp; BÉ</text>'+
  '<text x="65" y="127" fill="'+accent+'" font-size="21" font-weight="750" font-family="Arial,sans-serif">'+xml(stage.title.toLocaleUpperCase("vi-VN"))+' • 3 GỢI Ý THỰC HÀNH</text>'+
  drawLines(headline,65,188,52,43,"#44303e","800")+
  cards+
  '<text x="65" y="631" fill="'+accent+'" font-family="Arial,sans-serif" font-size="22" font-weight="750">Nguồn đọc thêm: '+xml(card.sourceLabel)+'</text>'+
  '<text x="65" y="669" fill="#715e68" font-family="Arial,sans-serif" font-size="18">Nội dung biên tập độc lập • Bản nháp DEV • Không thay thế tư vấn chuyên môn</text>'+
  '<path d="M65 684h1069" stroke="'+accent+'" stroke-width="3" opacity=".19"/>'+
  '</svg>\n';
}
const counts=new Map(),seen=new Set(),expected=new Set();
for(let i=0;i<manifest.cards.length;i++){
 const card=manifest.cards[i],article=articles.get(card.articleSlug);
 assert(article&&article.status==="draft","Missing or public article: "+card.articleSlug);
 assert(!seen.has(card.articleSlug),"Duplicate infographic: "+card.articleSlug);
 seen.add(card.articleSlug);
 assert(card.points.length===3&&card.points.every(p=>p.length>=18&&p.length<=85),"Invalid infographic points");
 assert(article.sources.some(s=>s.url===card.sourceUrl),"Unlinked infographic source: "+card.articleSlug);
 assert(card.sourceLabel.length<38&&/^[a-z0-9.-]+$/.test(card.sourceLabel),"Unsafe source label");
 counts.set(article.stage,(counts.get(article.stage)||0)+1);
 const file="auto-infographic-"+article.slug+".svg";
 expected.add(file);
 writeFileSync(join(dest,file),draw(card,i,article),"utf8");
}
assert.equal(counts.size,12);
assert([...counts.values()].every(n=>n===2),"Expected two infographics per stage");
for(const file of readdirSync(dest))if(/^auto-infographic-[a-z0-9-]+\.svg$/.test(file)&&!expected.has(file))unlinkSync(join(dest,file));
console.log("Generated 24 sourced editorial infographic SVGs across 12 stages");
