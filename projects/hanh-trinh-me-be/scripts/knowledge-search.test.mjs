import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createSearchIndex,normalizeKnowledge,parseSearchParams,searchKnowledge} from "../apps/web/lib/knowledge-search.mjs";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const base="apps/web/app/hoc-cung-con/";
const inv=read(base+"life-course-inventory.json"),atlas=read(base+"life-course-atlas.json"),a=read(base+"life-course-articles.json").articles,l=read(base+"learning-catalog.json").lessons,legacy=read("packages/content/articles.json").articles;
const rows=createSearchIndex(inv,atlas,legacy,a,l);
const run=(q,filters={})=>searchKnowledge(rows,{q,...filters});
const fixtures=[
 ["legacy","cuoc-tro-chuyen-truoc-khi-co-con","cuộc trò chuyện trước khi có em bé"],
 ["legacy","hen-tu-van-tien-thai","cuộc hẹn tiền thai"],
 ["legacy","axit-folic-truoc-khi-mang-thai","axit folic truoc mang thai"],
 ["legacy","kham-suc-khoe-tien-thai","khám sức khỏe tiền thai"],
 ["legacy","thuoc-tiem-chung-va-ke-hoach-thai-ky","rà soát thuốc và tiêm chủng"],
 ["legacy","ke-hoach-ho-tro-tien-thai","ke hoach ho tro gia dinh truoc khi co con"],
 ["legacy","lan-kham-thai-dau-tien","lần khám thai đầu tiên"],
 ["legacy","cam-xuc-dau-thai-ky","cam xuc thay doi trong dau thai ky"],
 ["legacy","lich-kham-thai-ba-thang-dau","khám thai 3 tháng đầu"],
 ["legacy","om-nghen-va-an-uong-dau-thai-ky","om nghen va an uong"],
 ["lesson","choi-tu-duy","chơi để luyện chú ý"],
 ["lesson","cam-xuc-va-ban-be","làm hòa với bạn"],
 ["lesson","con-va-cong-nghe","lam quen cong nghe"],
 ["lesson","hoc-khong-so-sai","điểm số sai lầm"],
 ["lesson","kiem-chung-thong-tin","thám tử thông tin"],
 ["lesson","tien-tieu-vat","tien tieu vat"],
 ["lesson","day-thi-thay-doi","dậy thì hiểu thay đổi cơ thể"],
 ["lesson","ban-be-va-ap-luc","ap luc dong trang lua"],
 ["lesson","ai-co-the-sai","ai co the sai"],
 ["lesson","quan-he-va-dong-thuan","quan hệ lành mạnh đồng thuận"],
 ["article","bua-an-di-hoc-6-10","bữa sáng bữa phụ và bữa ăn tại trường"],
 ["article","chon-tieu-hoc-theo-nhu-cau","chon truong tieu hoc"],
 ["article","chuyen-cap-thcs","chuyển cấp THCS"],
 ["article","du-an-hoc-tap-thoi-ai","học tập tuổi 14 17 trong thời đại ai"],
 ["article","an-uong-khi-di-lam","an uong khi di lam"],
 ["article","van-dong-va-nhip-song-trung-nien","xây nhịp vận động nghỉ ngơi"],
 ["article","phong-te-nga-tuoi-60-74","giảm nguy cơ té ngã"],
 ["article","nghi-huu-va-ket-noi","nghi huu va suc khoe tinh than"],
 ["article","ke-hoach-cham-soc-75-plus","kế hoạch chăm sóc tôn trọng khả năng"],
 ["article","gan-bo-va-dap-ung-nam-dau","gắn bó năm đầu đời"]
];
test("UX02 inventory, exact titles and accent equivalence",()=>{
 assert.equal(rows.length,219);assert.equal(new Set(rows.map(x=>x.key)).size,219);
 const counts=new Map();for(const row of rows){const t=normalizeKnowledge(row.title);counts.set(t,(counts.get(t)||0)+1);}
 for(const row of rows){if(counts.get(normalizeKnowledge(row.title))===1)assert.equal(run(row.title)[0]?.key,row.key,row.title);}
 assert.deepEqual(run("dậy thì").map(x=>x.key),run("day thi").map(x=>x.key));assert.equal(normalizeKnowledge("ĐỘ TUỔI"),"do tuoi");
 console.log("UX02_EXACT_TITLES_PASS",counts.size);
});
test("UX02 candidate relevance benchmark (30 fixed human-authored query/ID pairs; owner review pending)",()=>{
 const misses=[];for(const [kind,id,q] of fixtures){const expected=kind+":"+id;assert(rows.some(x=>x.key===expected),expected);if(!run(q).slice(0,3).some(x=>x.key===expected))misses.push(expected);}
 console.log("UX02_TOP3",JSON.stringify({total:fixtures.length,passed:fixtures.length-misses.length,misses}));assert(misses.length<=3);
});
test("UX02 synonym, one edit, no results, strict filters",()=>{
 assert(run("tri tue nhan tao").some(x=>x.key==="lesson:ai-co-the-sai"));
 assert(run("tham tu thong tinn").slice(0,3).some(x=>x.key==="lesson:kiem-chung-thong-tin"));
 // Short typo must have exact title context; a lone short typo is not expanded.
 const sample={key:"lesson:fixture",kind:"lesson",stage:"school",pillar:"thinking",fields:{title:"tham tu thong tin",meta:"",body:""}};
 assert.equal(searchKnowledge([sample],{q:"tinn"}).length,0);
 assert.equal(searchKnowledge([sample],{q:"thong tinn"}).length,0);
 assert.equal(searchKnowledge([sample],{q:"tham tu thong tinn"})[0]?.key,sample.key);
 assert.equal(searchKnowledge([sample],{q:"tham tu thong tixx"}).length,0);
 assert.equal(run("zzzxxyyqqq").length,0);assert.equal(run("!!!").length,0);
 for(const kind of ["legacy","lesson","article"])assert.equal(run("",{kind}).length,({legacy:72,lesson:21,article:126})[kind]);
 const f=rows.find(x=>x.kind==="article");assert(run("",{stage:f.stage,topic:f.pillar,kind:f.kind}).every(x=>x.stage===f.stage&&x.pillar===f.pillar&&x.kind===f.kind));
 assert.equal(run("",{stage:"so-sinh"}).length,legacy.filter(x=>x.stage==="so-sinh").length);
 assert.deepEqual(parseSearchParams(new URLSearchParams("stage=bad&topic=bad&kind=bad"),atlas),{q:"",stage:"",topic:"",kind:""});
 const altered=legacy.map((x,i)=>i===0?{...x,title:"Unique updated live title 987"}:x);
 const refreshed=createSearchIndex(inv,atlas,altered,a,l);assert.equal(searchKnowledge(refreshed,{q:"Unique updated live title 987"})[0].title,"Unique updated live title 987");
 assert.throws(()=>createSearchIndex(inv,atlas,legacy.slice(1),a,l));
 console.log("UX02_FILTERS_PASS");
 const sentinel="zzbodyonlysentinel";const modified=legacy.map((x,i)=>i===0?{...x,sections:[...x.sections,{heading:"Body-only",paragraphs:[sentinel]}]}:x);
 const full=createSearchIndex(inv,atlas,modified,a,l);assert.equal(full.filter(x=>x.kind==="legacy"&&x.fields.body.length>0).length,72);
 assert.equal(searchKnowledge(full,{q:sentinel})[0]?.key,"legacy:"+legacy[0].slug);
 assert.equal(searchKnowledge(rows,{q:sentinel}).length,0);
 assert.throws(()=>createSearchIndex(inv,atlas,legacy.map((x,i)=>i===0?{...x,sections:[]}:x),a,l));
 console.log("UX02_LEGACY_FULLTEXT_PASS 72");
});

test("UX02 behavior review: intent queries with stage and content filters",()=>{
 const intent=[
 ["cách khám sức khỏe tiền thai","legacy:kham-suc-khoe-tien-thai",{kind:"legacy"}],
 ["axit folic truoc mang thai la gi","legacy:axit-folic-truoc-khi-mang-thai",{kind:"legacy"}],
 ["dậy thì hiểu thay đổi cơ thể","lesson:day-thi-thay-doi",{kind:"lesson"}],
 ["tham tu thong tinn","lesson:kiem-chung-thong-tin",{kind:"lesson"}],
 ["tiền tiêu vặt là gì","lesson:tien-tieu-vat",{kind:"lesson"}],
 ["ai co the sai","lesson:ai-co-the-sai",{kind:"lesson"}],
 ["chọn trường tiểu học","article:chon-tieu-hoc-theo-nhu-cau",{kind:"article"}],
 ["giảm nguy cơ té ngã","article:phong-te-nga-tuoi-60-74",{stage:"older"}],
 ["an uong khi di lam","article:an-uong-khi-di-lam",{kind:"article"}],
 ["nghi huu va suc khoe tinh than","article:nghi-huu-va-ket-noi",{kind:"article"}]
 ];
 const misses=intent.filter(([q,id,filters])=>!run(q,filters).slice(0,3).some(x=>x.key===id)).map(([q,id])=>({q,id}));
 console.log("UX02_INTENT_TOP3",JSON.stringify({total:intent.length,passed:intent.length-misses.length,misses}));assert(misses.length<=1);
 assert.equal(run("zzzxxyyqqq").length,0);
});
