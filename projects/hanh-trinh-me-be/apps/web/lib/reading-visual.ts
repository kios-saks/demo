/** A supplemental reading aid, rendered from the article that the user is authorized to read.
 * No draft paragraphs are copied into public static media; no new medical advice is generated.
 */
type Section={heading:string;paragraphs:readonly string[]};
type Article={slug:string;sections:readonly Section[];media?:{inline?:readonly unknown[]}|null};
const escape=(v:string)=>v.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;"}[c]!));
function wrap(text:string,max=32){
 const lines:string[]=[];let line="";
 for(const word of text.trim().split(/\s+/)){if(line&&(line+" "+word).length>max){lines.push(line);line=word}else line+=(line?" ":"")+word}
 if(line)lines.push(line);return lines;
}
export function readingVisual(a:Article,index:number){
 if(index!==1||a.media?.inline?.length||a.sections.length<2)return null;
 const [first,second]=a.sections;
 const points=[first,second].map(s=>({heading:s.heading,text:s.paragraphs[0]||""}));
 if(points.some(p=>!p.text.trim()||p.text.length>480||p.heading.length>120))return null;
 const palettes=[["#e9f2e9","#285b46"],["#f4e7de","#8f4638"]];
 let y=108;const blocks=points.map((p,i)=>{
  const heading=wrap(p.heading,27),lines=wrap(p.text,32);
  const height=108+heading.length*39+lines.length*38;
  const [fill,accent]=palettes[i];
  const top=y;y+=height+16;
  const icon=i===0?'<path d="M0 4Q16-4 32 4V36Q16 28 0 36ZM32 4Q48-4 64 4V36Q48 28 32 36Z" fill="none" stroke="'+accent+'" stroke-width="3" stroke-linejoin="round"/>':'<rect x="9" y="2" width="43" height="40" rx="7" fill="none" stroke="'+accent+'" stroke-width="3"/><path d="m17 14 5 5 8-9m4 8h11m-28 9 5 5 8-9m4 8h11" fill="none" stroke="'+accent+'" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>';
  const header=heading.map((s,j)=>'<text x="118" y="'+(top+48+j*39)+'" font-size="29" font-weight="700" fill="#24362d">'+escape(s)+'</text>').join("");
  const body=lines.map((s,j)=>'<text x="64" y="'+(top+99+heading.length*39+j*38)+'" font-size="28" fill="#24362d">'+escape(s)+'</text>').join("");
  return '<g><rect x="28" y="'+top+'" width="664" height="'+height+'" rx="24" fill="'+fill+'"/><g transform="translate(45 '+(top+18)+')">'+icon+'</g>'+header+body+'</g>';
 });
 const height=y+88;
 const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 '+height+'" width="720" height="'+height+'" role="img" aria-label="Hai điểm trích từ bài viết" class="reading-visual-svg"><title>Hai điểm trích từ bài viết</title><desc>'+escape(points.map(p=>p.heading+": "+p.text).join(" "))+'</desc><rect width="720" height="'+height+'" rx="28" fill="#faf9f5"/><g font-family="Arial, sans-serif"><text x="36" y="47" font-size="29" font-weight="700" fill="#285b46">Hai điểm trích từ bài viết</text><text x="36" y="79" font-size="21" fill="#536459">Hiểu nội dung · Xem phần giải thích bên trên</text>'+blocks.join("")+'<text x="36" y="'+(y+24)+'" font-size="21" font-weight="600" fill="#536459">Trích nguyên văn từ bài viết.</text><text x="36" y="'+(y+53)+'" font-size="21" fill="#536459">Chưa thẩm định y khoa.</text></g></svg>';
 return {svg,points};
}
