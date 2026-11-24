/** Original Warm Lifestyle Editorial vector artwork. No network or third-party assets. */
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {createHash} from "node:crypto";
import assert from "node:assert/strict";
const root=new URL("../",import.meta.url),read=p=>JSON.parse(readFileSync(new URL(p,root),"utf8"));
const d=read("packages/content/articles.json"),briefs=read("packages/content/mock/editorial-visual-briefs.json"),info=read("packages/content/mock/infographic-cards.json");
const out=new URL("apps/web/public/media/",root);mkdirSync(out,{recursive:true});
const xml=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;"}[c]));
const palettes=[
 ["#f6eddf","#e6c7b4","#658775","#bd8067","#b8c9ad"],
 ["#f0f2e8","#dbe4d0","#466f5d","#c38e72","#c1aa8c"],
 ["#f5e9e1","#eed9c7","#78958a","#a45e50","#d8bf91"],
 ["#eef2eb","#cbdad1","#4d7569","#d6a28b","#b9c8ab"],
 ["#f6efe4","#e8dcca","#658879","#b5785d","#d4bf9e"]
];
const skins=["#edbd9e","#d99e7b","#b97f5c","#f1cbb0"];
const hair=["#47362e","#392e2d","#655043"];
const rect=(x,y,w,h,r,fill)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+r+'" fill="'+fill+'"/>';
const ellipse=(x,y,rx,ry,fill)=>'<ellipse cx="'+x+'" cy="'+y+'" rx="'+rx+'" ry="'+ry+'" fill="'+fill+'"/>';
const path=(d,fill,stroke="",w=0)=>'<path d="'+d+'" fill="'+fill+'"'+(stroke?' stroke="'+stroke+'" stroke-width="'+w+'" stroke-linecap="round" stroke-linejoin="round"':'')+'/>';
const g=(x,y,scale,body,flip=1)=>'<g transform="translate('+x+' '+y+') scale('+(scale*flip)+' '+scale+')">'+body+'</g>';
function plant(x,y,s,p){return g(x,y,s,rect(-25,35,50,52,8,p[3])+path("M0 39V-75M0-6Q-35-58-45-26M0-35Q40-85 48-49","none",p[2],5)+ellipse(-34,-26,28,12,p[4])+ellipse(35,-48,30,13,p[2])+ellipse(0,-76,12,29,p[2]));}
function room(type,p,n){
 const wall=rect(0,0,1200,675,0,p[0])+rect(0,488,1200,187,0,p[1])+path("M0 488H1200","none","#fffaf1",5);
 const win=(x)=>rect(x,58,280,272,105,"#fffaf1")+rect(x+14,72,252,244,94,"#d8e7dd")+ellipse(x+191,140,36,36,"#f7d6a5")+path("M"+(x+14)+" 270 Q"+(x+92)+" 165 "+(x+160)+" 251 T"+(x+266)+" 225 V316H"+(x+14)+"Z","#afc8b1")+path("M"+(x+140)+" 75V314M"+(x+15)+" 195H"+(x+265),"none","#fffaf1",8);
 if(type==="garden")return rect(0,0,1200,675,0,"#e6eee0")+ellipse(1015,116,72,72,"#f4d7a9")+path("M0 401Q220 211 470 400Q760 203 1200 399V675H0Z","#bdcfae")+path("M0 505Q450 390 1200 507V675H0Z","#d6ddbc")+plant(96,430,1.5,p)+plant(1110,420,1.3,p);
 if(type==="clinic")return wall+win(72)+rect(913,80,217,265,18,"#fffaf1")+rect(936,106,171,40,8,p[4])+rect(936,167,120,10,5,"#d4dfd1")+rect(936,199,141,10,5,"#d4dfd1")+rect(936,231,101,10,5,"#d4dfd1")+rect(973,373,147,104,12,p[4]);
 if(type==="entry")return wall+rect(865,53,220,435,105,p[4])+rect(884,75,182,413,90,"#f8f2e8")+ellipse(1039,289,7,7,p[3])+plant(100,405,1,p)+rect(75,445,230,33,12,p[2]);
 if(type==="kitchen")return wall+win(63)+rect(825,92,305,165,14,"#e0e8d9")+rect(831,259,299,28,9,p[2])+rect(837,287,287,201,8,"#f8f3e8")+path("M936 291V485M1036 291V485","none","#d2d9c7",4)+rect(1056,210,50,48,12,p[3]);
 if(type==="bedroom")return wall+win(805)+rect(74,277,289,193,40,p[2])+rect(74,361,315,114,28,"#fff9f0")+rect(110,362,279,113,22,p[4])+rect(88,371,110,62,20,"#f6e7d8")+plant(1138,415,.7,p);
 if(type==="desk")return wall+win(64)+rect(860,112,258,23,6,p[3])+rect(891,49,45,61,5,p[2])+rect(949,66,36,44,4,p[4])+rect(1000,44,40,66,5,p[3])+plant(1100,410,.85,p);
 if(type==="playroom")return wall+win(818)+rect(55,265,244,221,15,"#f9f3e9")+path("M60 370H293M174 270V483","none",p[4],8)+rect(82,302,59,58,8,p[3])+ellipse(231,335,32,28,p[2])+rect(83,399,65,68,9,p[4])+ellipse(239,434,36,26,"#e4bfa4");
 return wall+win(n%2?68:835)+rect(n%2?867:75,359,255,126,25,p[4])+rect(n%2?878:87,340,228,42,20,p[2])+plant(n%2?1133:70,410,.8,p);
}
function person(x,y,s,kind,p,i,flip=1,pose=0){
 const skin=skins[i%skins.length],h=hair[i%hair.length],shirt=p[(i%2)+2],kid=["baby","infant","toddler","preschool","school"].includes(kind),preg=kind==="pregnant",doctor=kind==="doctor",long=i%3!==1;
 const head=kid?53:46, torso=doctor?"#fffaf1":shirt;
 const legs=kid?path("M-39 160L-41 207M36 160L39 207","none","#6f8176",23):path("M-40 155L-52 247M35 155L51 247","none","#6a7768",30);
 const body=preg?path("M-60 18Q-32-3 23 17Q79 29 85 102Q89 147 62 162H-67Q-80 66-60 18Z",torso):path("M-58 20Q-36 3 0 5Q44 3 63 28L76 164H-76Z",torso);
 const backHair=long?ellipse(0,-58,head+11,head+29,h):"";
 const face=ellipse(0,-62,head,head+5,skin)+ellipse(-head+2,-59,9,12,skin)+ellipse(head-2,-59,9,12,skin);
 const cap=path("M-"+head+" -62 Q-"+(head+12)+" -124 0 -124 Q"+(head+14)+" -122 "+head+" -59 Q16-81 0-96 Q-16-74 -"+head+" -62Z",h);
 const eyes=ellipse(-17,-61,3.3,4,h)+ellipse(17,-61,3.3,4,h)+path("M-7-39Q0-34 8-40","none","#925d53",2.8)+ellipse(-27,-45,7,3,"#e7a797")+ellipse(27,-45,7,3,"#e7a797");
 const arms=pose===1?path("M-47 40Q-68 83-23 110M46 41Q77 63 98 28","none",skin,kid?17:22):path("M-47 39Q-72 82-26 115M47 39Q72 82 27 115","none",skin,kid?17:22);
 return g(x,y,s,ellipse(0,257,75,12,"#b6a38a")+legs+backHair+body+rect(-12,-16,24,35,8,skin)+face+cap+eyes+arms+(doctor?path("M-28 22L0 67L28 22M0 67V143","none",p[2],4):"")+(preg?ellipse(30,101,44,47,torso):""),flip);
}
// Context-only portrait of a baby close to a caregiver; no feeding, sleeping,
// clinical procedures, developmental milestones or instructional positions are depicted.
function heldBaby(x,y,s,p,i){
 const skin=skins[i%skins.length],h=hair[i%hair.length];
 return g(x,y,s,path("M-58 18Q0-8 58 18L49 109Q0 135-49 109Z",p[4])+ellipse(0,-19,42,45,skin)+path("M-35-38Q-5-63 24-41","none",h,8)+ellipse(-13,-19,3,3,h)+ellipse(13,-19,3,3,h)+path("M-5-1Q0 3 5-1","none","#925d53",2.5)+path("M-38 34Q2 55 37 34","none","#fffaf1",8));
}
function prop(type,x,y,s,p){
 const a=p[2],b=p[3],c=p[4],cream="#fffaf1";let v="";
 switch(type){
 case "notebook":case "journal":case "book":case "folder":v=rect(-44,-31,88,66,8,type==="folder"?b:cream)+path("M0-25V28M-31-13H-10M10-13H31M-31 1H-10M10 1H31","none",a,3);break;
 case "calendar":v=rect(-42,-39,84,76,9,cream)+rect(-42,-39,84,20,8,b)+path("M-25-48V-27M24-48V-27M-28-6H28M-28 9H28M-28 24H16","none",a,4);break;
 case "pencil":v=path("M-40 22L27-30L38-19L-30 34Z",b)+path("M-40 22L-46 39L-30 34Z",a);break;
 case "tea":case "water":v=rect(-27,-27,54,57,10,type==="tea"?cream:"#c1d9d5")+ellipse(0,-26,27,7,type==="tea"?b:"#83b5ae")+path("M28-16Q63-14 51 9Q44 20 28 17","none",cream,7);break;
 case "bowl":case "plate":v=ellipse(0,-3,58,25,cream)+ellipse(0,-5,41,14,"#d8bd86")+(type==="bowl"?path("M-55 0Q-43 43 0 43Q43 43 55 0",c):"")+ellipse(-15,-8,10,6,a)+ellipse(15,-1,10,6,b);break;
 case "spoon":v=ellipse(28,-22,18,25,c)+path("M17-7L-39 36","none",a,9);break;
 case "bag":case "backpack":v=rect(-44,-33,88,85,20,b)+path("M-23-33V-44Q0-67 23-44V-33","none",a,7)+rect(-27,4,54,28,8,c);break;
 case "clothes":v=path("M-17-36L-54-10L-32 16L-17 6V48H36V6L50 16L63-10L27-36Q6-14-17-36Z",c);break;
 case "basket":v=path("M-57-8H57L44 47H-44Z",b)+path("M-38-8Q-30-61 0-61Q30-61 38-8M-38 6L-30 36M-12 6L-8 36M12 6L8 36M38 6L30 36","none",cream,5);break;
 case "clock":v=ellipse(0,0,43,43,cream)+path("M0-26V0L22 13","none",a,5)+ellipse(0,0,5,5,b);break;
 case "blocks":v=rect(-48,2,40,41,5,b)+rect(-2,2,40,41,5,a)+rect(-23,-41,42,41,5,c);break;
 case "ball":v=ellipse(0,0,41,41,b)+path("M-38 0Q0-43 38 0M0-41Q-30 0 0 41","none",cream,5);break;
 case "shelf":v=rect(-49,-41,98,84,9,cream)+path("M-46 0H46M0-40V42","none",a,6)+rect(-39,-33,25,29,4,b)+ellipse(23,23,15,14,c);break;
 case "phone":v=rect(-23,-47,46,94,8,a)+rect(-17,-39,34,73,4,"#e1e8dc")+ellipse(0,40,3,3,cream);break;
 case "laptop":v=rect(-53,-44,106,71,7,a)+rect(-46,-37,92,55,3,"#e1e8dc")+path("M-53 27H53L68 40H-68Z",b);break;
 case "shoes":v=path("M-49-8Q-20 17 9 4L17 27H-53Q-64 15-49-8ZM22-15Q42 6 65-5L73 17H16Z",a);break;
 case "keys":v=ellipse(-13,-19,19,19,"#d8b57c")+ellipse(-13,-19,9,9,cream)+path("M0-5L46 38L35 47L21 31L12 37L-5 14Z","#d8b57c");break;
 case "photo":v=rect(-48,-43,96,86,8,b)+rect(-39,-34,78,68,3,cream)+ellipse(-17,-4,14,16,c)+ellipse(15,-8,14,16,a)+path("M-35 30Q-35 5-17 5Q0 5 0 30M0 30Q0 3 15 3Q34 3 34 30",a);break;
 case "lamp":v=path("M-30-36H30L46 14H-46Z",c)+path("M0 14V49M-29 49H29","none",a,7);break;
 case "cushion":v=rect(-46,-30,92,64,18,c)+path("M-30-15L30 17M-30 17L30-15","none",cream,3);break;
 case "plant":return plant(x,y,s*.6,p);
 default:throw Error("Unknown prop "+type);
 }return g(x,y,s,v);
}
const configurations={
 couple:["adult","adult"],consult:["adult","doctor"],"pregnant-consult":["pregnant","doctor"],pregnant:["pregnant"],"pregnant-couple":["pregnant","adult"],adult:["adult"],"newborn-family":["adult","baby"],"baby-consult":["adult","baby","doctor"],"infant-family":["adult","infant"],"toddler-family":["adult","toddler"],"preschool-family":["adult","preschool"],"school-family":["adult","school"],"school-friends":["school","school"],"teen-family":["adult","teen"],"grown-family":["adult","grown"],grown:["grown"],family:["adult","infant","adult"]
};
function artwork(key,brief,title){
 const hash=createHash("sha256").update(key).digest(),n=hash[0],p=palettes[n%palettes.length];
 const [scene,setting,first,second]=brief, people=configurations[scene];assert(people,key);
 const table=setting==="desk"||setting==="clinic"||setting==="kitchen";
 let body=room(setting,p,n)+ellipse(600,576,405,69,"#f8f2e8")+ellipse(600,587,335,46,p[4]);
 people.forEach((kind,i)=>{
  const minor=["baby","infant","toddler","preschool","school"].includes(kind);
  const scale=kind==="baby"?.36:kind==="infant"?.52:kind==="toddler"?.64:kind==="preschool"?.74:kind==="school"?.88:kind==="teen"?.96:1.12;
  const pos=people.length===1?600:people.length===2?(i===0?445:744):[345,600,855][i];
  const x=pos+(hash[1]%21)-10;
  if(kind==="baby"||kind==="infant"){
   // The caregiver immediately preceding the infant is the contextual anchor.
   // Avoid presenting infants as standing or walking in generic cover artwork.
   const anchor=people.length===2?445:345;
   const babyX=anchor+110+(hash[1]%21)-10;
   body+=heldBaby(babyX,357,kind==="baby"?.66:.8,p,(hash[2]+i)%12);
  }else body+=person(x,550-257*scale,scale,kind,p,(hash[2]+i)%12,i%2?-1:1,(n+i)%2);
 });
 if(table)body+=rect(340,482,520,28,12,"#b7977a")+rect(365,510,20,90,7,"#a88d73")+rect(814,510,20,90,7,"#a88d73");
 const spots=table?[[532,470],[673,470]]:n%2?[[263,533],[945,535]]:[[320,535],[870,530]];
 body+=prop(first,...spots[0],table?.72:1.02,p)+prop(second,...spots[1],table?.72:.93,p);
 // Small decorative leaf/stitch motifs, never clinical instructions.
 body+=path("M25 645Q190 621 330 650","none","#fffaf1",2)+path("M870 646Q1050 618 1180 645","none","#fffaf1",2);
 return '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675" role="img" aria-label="'+xml("Minh họa biên tập: "+title)+'">'+body+'</svg>\n';
}
function write(name,svg){writeFileSync(new URL(name+".svg",out),svg,"utf8")}
const stageMap=new Map(d.stages.map(s=>[s.slug,s.title]));
assert.equal(Object.keys(briefs.coverBriefs).length,72);
assert.equal(Object.keys(briefs.navigation).length,19);
for(const a of d.articles){assert(briefs.coverBriefs[a.slug],"Missing brief "+a.slug);write("editorial-cover-"+a.slug,artwork(a.slug,briefs.coverBriefs[a.slug],a.title))}
for(const [key,brief] of Object.entries(briefs.navigation))write("editorial-"+key,artwork("navigation-"+key,brief,key==="hero"?"Gia đình cùng nhau đọc và trò chuyện":stageMap.get(key.replace(/^(group|stage)-/,""))||"Hành trình gia đình"));
const curated=read("packages/content/mock/editorial-curated-infographics.json");
const lines=(s,limit)=>{let result=[],line="";for(const word of s.split(/\s+/)){if(line&&(line+" "+word).length>limit){result.push(line);line=word}else line+=(line?" ":"")+word}if(line)result.push(line);return result};
const text=(s,x,y,size,weight,color)=>'<text x="'+x+'" y="'+y+'" fill="'+color+'" font-family="Arial, sans-serif" font-size="'+size+'" font-weight="'+weight+'">'+xml(s)+'</text>';
const drawLines=(s,x,y,size,limit,step,weight,color)=>lines(s,limit).map((l,i)=>text(l,x,y+i*step,size,weight,color)).join("");
const allInfo=new Map(info.cards.map(c=>[c.articleSlug,c]));
for(const [slug,c] of Object.entries(curated))allInfo.set(slug,c);
const transcripts={};
for(const a of d.articles){
 if(!a.media?.inline?.length)continue;
 const c=allInfo.get(a.slug);assert(c,"Missing infographic "+a.slug);
 const count=c.points.length,height=count===4?1320:1100;
 const titleLines=lines(c.title,28);assert(titleLines.length<=3,a.slug);
 let body=rect(0,0,720,height,0,"#faf9f5")+rect(28,28,664,12,6,"#285b46");
 body+=drawLines(c.title,42,90,37,28,45,700,"#24362d");
 body+=text("Gợi ý đọc và đối chiếu nguồn",42,218,26,400,"#536459");
 c.points.forEach((point,i)=>{
  const y=247+i*204;assert(lines(point,26).length<=4,a.slug);
  body+=rect(32,y,656,185,22,i%2?"#f4e7de":"#e9f2e9")+ellipse(81,y+50,28,28,"#285b46")+text(String(i+1),72,y+61,29,700,"#fff")+drawLines(point,130,y+47,31,26,39,600,"#24362d");
 });
 const footer=247+count*204+32;
 body+=drawLines("Nguồn: "+c.sourceLabel,42,footer,26,41,32,700,"#285b46")+text("Chưa thẩm định y khoa.",42,footer+72,24,400,"#536459")+text("Không thay thế tư vấn chuyên môn.",42,footer+103,24,400,"#536459");
 write("editorial-infographic-"+a.slug,'<svg xmlns="http://www.w3.org/2000/svg" width="720" height="'+height+'" viewBox="0 0 720 '+height+'" role="img" aria-label="'+xml(c.title)+'">'+body+'</svg>\n');
 transcripts[a.slug]={height,points:c.points,sourceUrl:a.media.inline[0].sourceUrl};
}
assert.equal(Object.keys(transcripts).length,27);
console.log("PASS editorial artwork: 1 hero, 6 group, 12 stage, 72 individual covers, 27 portrait infographics");
