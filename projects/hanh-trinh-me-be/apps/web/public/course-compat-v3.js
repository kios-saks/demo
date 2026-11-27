/* Combined DEV compatibility reader: no network requests, no storage or corpus in JS. */
(function(){
"use strict";
const root=document.querySelector('[data-course-compat-v3="1"]');if(!root)return;
const all=s=>Array.from(root.querySelectorAll(s)),one=s=>root.querySelector(s);
let age=root.dataset.courseAge||"all",pillar="all";
const hashMap=JSON.parse(root.dataset.courseHashes||"{}");
const normalize=s=>String(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/đ/g,"d");
function lessons(){
 const category=one("[data-learning-category]").value,q=normalize(one("[data-course-search]").value.trim());
 let count=0;all("[data-learning-lesson]").forEach(el=>{const text=[el.querySelector("h3")?.textContent,el.querySelector("h3+p")?.textContent,el.querySelector("[data-lesson-knowledge]")?.textContent].join(" ");el.hidden=!(age==="all"||age===el.dataset.lessonAge)||!(category==="all"||category===el.dataset.lessonCategory)||!normalize(text).includes(q);if(!el.hidden)count++;});
 all("[data-learning-age],[data-course-lesson-all]").forEach(b=>b.setAttribute("aria-pressed",String((b.dataset.learningAge||"all")===age)));
 one("[data-learning-count]").textContent=count+"/"+all("[data-learning-lesson]").length+" bài học";one("[data-course-lessons-empty]").hidden=count!==0;
}
function topics(value){
 pillar=value;let n=0;all("[data-course-ref],[data-life-article]").forEach(el=>{el.hidden=pillar!=="all"&&el.dataset.coursePillar!==pillar;if(el.hasAttribute("data-course-ref")&&!el.hidden)n++;});
 all("[data-life-pillar]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.lifePillar===pillar)));
 const selected=all("[data-life-pillar]").find(b=>b.dataset.lifePillar===pillar);one("[data-course-pillar-title]").textContent=selected?.querySelector("strong")?.textContent||"Tất cả nội dung";one("[data-course-empty]").hidden=n!==0;
}
function restore(){
 const hash=location.hash.slice(1),stage=Object.prototype.hasOwnProperty.call(hashMap,hash)?hashMap[hash]:null;
 if(!stage)return;
 if(stage!==root.dataset.courseStage){const u=new URL(location.href);u.searchParams.set("stage",stage);location.replace(u.pathname+u.search+u.hash);return;}
 topics("all");const el=document.getElementById(hash);if(!el)return;
 if(el.hasAttribute("data-learning-lesson")){age=el.dataset.lessonAge;one("[data-learning-category]").value="all";one("[data-course-search]").value="";lessons();}
 el.hidden=false;const details=el.querySelector("details");if(details)details.open=true;requestAnimationFrame(()=>el.scrollIntoView({block:"start"}));
}
root.addEventListener("click",event=>{const b=event.target.closest("button");if(!b)return;if(b.hasAttribute("data-learning-age")||b.hasAttribute("data-course-lesson-all")){age=b.dataset.learningAge||"all";lessons();}else if(b.hasAttribute("data-life-pillar")||b.hasAttribute("data-course-all-pillars"))topics(b.dataset.lifePillar||"all");});
one("[data-learning-category]").addEventListener("change",lessons);one("[data-course-search]").addEventListener("input",lessons);
window.addEventListener("hashchange",restore);window.addEventListener("popstate",restore);window.addEventListener("pageshow",()=>{lessons();restore();});
lessons();topics("all");root.dataset.courseReady="1";restore();
})();
