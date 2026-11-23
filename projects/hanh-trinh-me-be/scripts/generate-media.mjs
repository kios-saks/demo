/**
 * Generate original, deterministic editorial SVG covers for the 66 article
 * drafts that do not have a hand-drawn cover. No remote assets or AI claims.
 *
 * Run before checking content, launching Next.js locally, or building Web.
 * The generated auto-cover-*.svg files are build artefacts (gitignored).
 */
import {readFileSync,writeFileSync,readdirSync,unlinkSync,mkdirSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {join} from "node:path";
import assert from "node:assert/strict";

const root=new URL("../",import.meta.url);
const dataset=JSON.parse(readFileSync(new URL("packages/content/articles.json",root),"utf8"));
const output=fileURLToPath(new URL("apps/web/public/media/",root));
mkdirSync(output,{recursive:true});

const themes={
 "chuan-bi-mang-thai": ["#fff3e6","#f8d9cc","#a36277","#fffdf5"],
 "thai-ky-3-thang-dau": ["#fff0e8","#f9cad8","#995b89","#fff9ef"],
 "thai-ky-3-thang-giua": ["#fff3dc","#d9e8db","#6f9381","#fffef5"],
 "thai-ky-3-thang-cuoi": ["#f9ebea","#ddd9ef","#7974a5","#fffaf7"],
 "hau-san": ["#fff1e9","#e9d6d8","#9a6d83","#fffdf7"],
 "so-sinh": ["#eef4ff","#f7dcdf","#718bad","#ffffff"],
 "nhu-nhi": ["#fff3de","#d8e9dc","#7b9a78","#fffefa"],
 "tap-di": ["#fff0dc","#f4d2c0","#c08866","#fffbf5"],
 "mam-non": ["#fcecec","#e1e4fa","#8a78ae","#ffffff"],
 "tieu-hoc": ["#edf5f4","#f2e3d5","#70918c","#fffdfa"],
 "thieu-nien": ["#f1efff","#f9dfea","#9373a7","#fffefd"],
 "truong-thanh": ["#f6f3e8","#dae8ef","#7799a5","#ffffff"]
};

const motifs={
 "chuan-bi-mang-thai": '<path d="M-75 110Q-146 42-102-26Q-78-65-23-50Q9-36 20-5Q40-61 95-52Q141-34 127 24Q106 79 20 132Z" fill="#d98e9b"/><path d="M8 115V-3M8 54Q-39 26-41-5M8 23Q55-9 61-31" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round"/><circle cx="12" cy="-95" r="27" fill="#fff" opacity=".75"/>',
 "thai-ky-3-thang-dau": '<rect x="-143" y="-120" width="275" height="258" rx="35" fill="#fff"/><rect x="-143" y="-120" width="275" height="74" rx="35" fill="#ca88a3"/><path d="M-110-50H104" stroke="#f8dbe7" stroke-width="10"/><path d="M-86-147V-103M74-147V-103" stroke="#fff" stroke-width="20" stroke-linecap="round"/><circle cx="-50" cy="25" r="20" fill="#f5dce3"/><circle cx="30" cy="25" r="20" fill="#dca2b4"/><path d="M-32 88L-3 112L64 49" fill="none" stroke="#6b9788" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/>',
 "thai-ky-3-thang-giua": '<path d="M-88 138Q-120 65-66-12Q-35-49 17-38Q104-6 102 138Z" fill="#de9da4"/><circle cx="-15" cy="-87" r="59" fill="#edb9a6"/><path d="M-74-99Q-58-168 9-149Q60-136 38-83Q5-103-20-114Q-40-87-74-99Z" fill="#73556b"/><ellipse cx="26" cy="76" rx="63" ry="59" fill="#efc4b3"/><path d="M-46 27Q14-4 58 43" stroke="#fff" stroke-width="12" fill="none" stroke-linecap="round"/>',
 "thai-ky-3-thang-cuoi": '<rect x="-114" y="-64" width="232" height="216" rx="34" fill="#fff"/><path d="M-60-65V-96Q-60-123-33-123H34Q61-123 61-96V-65" fill="none" stroke="#947dba" stroke-width="17"/><rect x="-65" y="-28" width="135" height="18" rx="9" fill="#e6d7ee"/><rect x="-65" y="11" width="104" height="18" rx="9" fill="#e6d7ee"/><circle cx="85" cy="91" r="30" fill="#cba8ce"/><path d="M84 72V108M66 90H102" stroke="#fff" stroke-width="9" stroke-linecap="round"/>',
 "hau-san": '<circle cy="-45" cx="-44" r="56" fill="#e8b5a3"/><path d="M-157 146Q-140-7-44-7Q61-10 79 146Z" fill="#aa8598"/><circle cx="60" cy="33" r="48" fill="#f0c6ad"/><path d="M-30 144Q-15 59 61 57Q145 64 158 144Z" fill="#e5c4cb"/><path d="M-86 59Q2 112 58 88" fill="none" stroke="#fff" stroke-width="19" stroke-linecap="round"/>',
 "so-sinh": '<path d="M-146 25H155V111Q0 176-146 111Z" fill="#fff"/><path d="M-131 30Q-74-49 20-40Q110-33 142 30" fill="#a4bbd5"/><circle cx="-31" cy="-19" r="51" fill="#ecc2ad"/><path d="M-53-24Q-31-12-13-23" stroke="#967a79" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M-161 13H168" stroke="#6e93b5" stroke-width="16" stroke-linecap="round"/><path d="M-106 131L-127 167M115 132L134 167" stroke="#6e93b5" stroke-width="13" stroke-linecap="round"/>',
 "nhu-nhi": '<path d="M-149 15Q-131 146 8 149Q144 144 154 15Z" fill="#fff"/><path d="M-146 14H150" stroke="#7ca18b" stroke-width="17" stroke-linecap="round"/><path d="M-60-41Q-76-97-39-122Q-11-133-2-87Q-10-45 15-2" fill="none" stroke="#a7c4a9" stroke-width="13" stroke-linecap="round"/><path d="M49-87L108-152" stroke="#c29180" stroke-width="14" stroke-linecap="round"/><ellipse cx="38" cy="-64" rx="31" ry="25" transform="rotate(-40 38 -64)" fill="#c29180"/><circle cx="-53" cy="64" r="18" fill="#f0c6a2"/><circle cx="-5" cy="83" r="15" fill="#f4d9a5"/>',
 "tap-di": '<path d="M-123 101Q-108 48-56 55L9 93Q53 111 43 148H-121Q-149 134-123 101Z" fill="#fff"/><path d="M-33-11Q-16-62 29-56L105-20Q141-4 140 38H-42Q-57 19-33-11Z" fill="#f0c6a9"/><path d="M-105 145H34M-35 34H126" stroke="#bf8f7c" stroke-width="10" stroke-linecap="round"/><circle cx="-82" cy="-77" r="14" fill="#fff" opacity=".8"/><circle cx="-46" cy="-109" r="10" fill="#fff" opacity=".8"/>',
 "mam-non": '<rect x="-125" y="-8" width="110" height="155" rx="15" fill="#e6a3a1"/><rect x="-5" y="34" width="112" height="113" rx="15" fill="#a4b5db"/><path d="M47-122L141 19H-51Z" fill="#e9cd88"/><circle cx="-65" cy="-88" r="41" fill="#fff"/><circle cx="-65" cy="-88" r="17" fill="#f8ced7"/><path d="M-69 13V123M20 78H87" stroke="#fff" stroke-width="12" stroke-linecap="round"/>',
 "tieu-hoc": '<path d="M-155-101Q-61-139-3-90V144Q-70 105-155 130Z" fill="#fff"/><path d="M-3-90Q53-139 150-101V130Q68 105-3 144Z" fill="#e2f0ec"/><path d="M-3-90V144" stroke="#83a6a2" stroke-width="10"/><path d="M-124-48H-37M-124-12H-46M26-48H120M26-12H114" stroke="#b2cec6" stroke-width="11" stroke-linecap="round"/><path d="M113-131L149-86L94-32L56-69Z" fill="#e1b2a5"/>',
 "thieu-nien": '<path d="M-134-112H91Q139-112 139-66V60Q139 103 91 103H5L-65 155V103H-134Q-169 103-169 60V-66Q-169-112-134-112Z" fill="#fff"/><circle cx="-90" cy="-9" r="16" fill="#a78dc2"/><circle cx="-18" cy="-9" r="16" fill="#e0b0c2"/><circle cx="55" cy="-9" r="16" fill="#a78dc2"/><path d="M-94 47H64" stroke="#eadbea" stroke-width="12" stroke-linecap="round"/>',
 "truong-thanh": '<circle cx="41" cy="-68" r="93" fill="#e8c9a7"/><path d="M-170 152Q-59-64 35 48Q96 119 168 4" fill="none" stroke="#fff" stroke-width="25" stroke-linecap="round"/><path d="M116-9L168 4L143 56" fill="none" stroke="#fff" stroke-width="19" stroke-linecap="round" stroke-linejoin="round"/><path d="M-133-116L-117-146M-99-93L-64-103" stroke="#86a8b2" stroke-width="11" stroke-linecap="round"/>'
};

const escapeXml=value=>String(value).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;"}[ch]));
function wrapTitle(title) {
 const words=title.split(/\s+/).filter(Boolean);
 const lines=[]; let line="";
 for(const word of words){
  const candidate=line ? line+" "+word : word;
  if(candidate.length>27 && line){lines.push(line);line=word;}else line=candidate;
 }
 if(line)lines.push(line);
 if(lines.length>4){const kept=lines.slice(0,3);kept.push(lines.slice(3).join(" ").slice(0,27)+"…");return kept;}
 return lines;
}
function svgFor(a,i){
 const stage=dataset.stages.find(s=>s.slug===a.stage);
 assert(stage,"Unknown stage "+a.stage);
 const [bg1,bg2,accent,paper]=themes[a.stage];
 const left=a.order%2===0 ? 26 : 0;
 const motif=motifs[a.stage];
 const lines=wrapTitle(a.title);
 const fontSize=lines.length===4?40:lines.some(x=>x.length>24)?44:48;
 const lineHeight=fontSize+13;
 const titleSvg=lines.map((line,j)=>'<text x="78" y="'+(299+j*lineHeight)+'" fill="#463747" font-size="'+fontSize+'" font-weight="750" font-family="Arial, sans-serif">'+escapeXml(line)+'</text>').join("");
 const circles=Array.from({length:6},(_,k)=>{
  const cx=885+((i*43+k*61)%255)-125,cy=90+((i*71+k*103)%485);
  return '<circle cx="'+cx+'" cy="'+cy+'" r="'+(4+k%3*3)+'" fill="'+accent+'" opacity=".17"/>';
 }).join("");
 return '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675" role="img" aria-label="'+escapeXml("Minh họa chủ đề: "+a.title)+'">'+
 '<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="'+bg1+'"/><stop offset="1" stop-color="'+bg2+'"/></linearGradient><filter id="drop" x="-25%" y="-25%" width="150%" height="150%"><feDropShadow dx="0" dy="15" stdDeviation="23" flood-color="'+accent+'" flood-opacity=".19"/></filter></defs>'+
 '<rect width="1200" height="675" fill="url(#bg)"/>'+
 '<circle cx="1132" cy="12" r="280" fill="#fff" opacity=".34"/><circle cx="113" cy="670" r="195" fill="#fff" opacity=".23"/>'+
 '<path d="M0 567Q183 520 346 586T755 570T1200 572V675H0Z" fill="#fff" opacity=".21"/>'+
 '<circle cx="80" cy="77" r="25" fill="'+accent+'"/><path d="M69 78Q63 61 80 68Q98 56 96 77L80 91Z" fill="#fff"/>'+
 '<text x="120" y="85" fill="'+accent+'" font-size="22" font-weight="750" font-family="Arial, sans-serif">HÀNH TRÌNH MẸ &amp; BÉ</text>'+
 '<rect x="78" y="177" width="9" height="48" rx="4" fill="'+accent+'"/>'+
 '<text x="103" y="207" fill="'+accent+'" font-size="23" font-weight="700" font-family="Arial, sans-serif">'+escapeXml(stage.title.toLocaleUpperCase("vi-VN"))+'</text>'+
 titleSvg+
 '<g filter="url(#drop)"><rect x="742" y="122" width="384" height="433" rx="170" fill="'+paper+'" opacity=".93"/></g>'+
 '<circle cx="'+(952+left)+'" cy="320" r="166" fill="'+accent+'" opacity=".11"/>'+
 '<g transform="translate('+(941+left)+' 345) scale(1.02)">'+motif+'</g>'+
 circles+
 '<rect x="78" y="605" width="148" height="8" rx="4" fill="'+accent+'" opacity=".39"/>'+
 '<text x="78" y="645" fill="#785e6e" font-size="18" font-family="Arial,sans-serif">Minh họa nguyên bản • Nội dung đang biên tập</text>'+
 '</svg>\n';
}
const expected=new Set();
let generated=0;
for(let i=0;i<dataset.articles.length;i++){
 const a=dataset.articles[i];
 if(!a.media?.cover?.src?.startsWith("/media/auto-cover-"))continue;
 const name="auto-cover-"+a.slug+".svg";
 assert.equal(a.media.cover.src,"/media/"+name,"Unexpected generated cover URL");
 assert(/^[a-z0-9-]+$/.test(a.slug),"Unsafe slug");
 expected.add(name);
 writeFileSync(join(output,name),svgFor(a,i),"utf8");
 generated++;
}
for(const file of readdirSync(output))if(/^auto-cover-[a-z0-9-]+\.svg$/.test(file)&&!expected.has(file))unlinkSync(join(output,file));
assert.equal(generated,66,"Expected exactly 66 generated covers, preserve six custom originals");
console.log("Generated "+generated+" original article SVG covers in "+output);

// Build source-linked inline illustrations within the same media pipeline.
await import("./generate-infographics.mjs");
