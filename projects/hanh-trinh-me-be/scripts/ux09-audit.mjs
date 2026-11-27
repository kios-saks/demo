import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {resolve,join} from "node:path";
import {pathToFileURL} from "node:url";
import {createRequire} from "node:module";
import assert from "node:assert/strict";
const root=new URL("../",import.meta.url);
const read=p=>JSON.parse(readFileSync(new URL(p,root),"utf8"));
const config=read("docs/ux-redesign-v2/ux-09-budgets.json");
const refs=read("apps/web/app/hoc-cung-con/life-course-inventory.json").refs;
const origin=process.env.MEBE_UX09_ORIGIN||"https://hanh-trinh-me-be-web-jn5v.onrender.com";
const url=new URL(origin);assert(["https://hanh-trinh-me-be-web-jn5v.onrender.com","http://127.0.0.1:3001","http://localhost:3001"].includes(url.origin),"authorized DEV only");assert.equal(url.pathname,"/");
const mode=process.env.MEBE_UX09_MODE||"baseline";assert(["baseline","gate"].includes(mode));
const phase=process.env.MEBE_UX09_PHASE||"all";assert(["all","axe","lab"].includes(phase));
const output=resolve(process.env.MEBE_UX09_OUTPUT||"/tmp/mebe-ux09-evidence");mkdirSync(output,{recursive:true});
const dep=requireFrom(process.env.MEBE_UX09_DEPS||"/tmp/mebe-ux09");
function requireFrom(path){return createRequire(resolve(path,"package.json"));}
const load=async name=>import(pathToFileURL(dep.resolve(name)).href);
const {chromium}=await load("playwright");
const axePath=dep.resolve("axe-core/axe.min.js");
const stages=[...new Set(refs.filter(r=>r.kind==="legacy").map(r=>r.originalStage))];
assert.equal(stages.length,12);assert.equal(refs.length,219);
const detail=kind=>{const ref=refs.find(r=>r.kind===kind);assert(ref);return "/kien-thuc/"+kind+"/"+ref.id+"/doc";};
const routes=[
 ["home","/"],["discovery","/kham-pha"],["search","/tim-kiem"],["journey","/hanh-trinh"],["personal","/da-luu"],
 ["detail-legacy",detail("legacy")],["detail-article",detail("article")],["detail-lesson",detail("lesson")],
 ["library","/thu-vien"],["stage-"+stages[0],"/"+stages[0]],["course-compat","/hoc-cung-con"],["sources","/nguon-tham-khao"]
];
const allRoutes=[...routes,...stages.slice(1).map(s=>["stage-"+s,"/"+s])];
const summary={schema:1,mode,phase,origin:url.origin,expectedBaselineApp:config.baselineApp,gitSha:process.env.GITHUB_SHA||null,startedAt:new Date().toISOString(),field:config.field,environment:{node:process.version,platform:process.platform,runner:process.env.RUNNER_OS||null},axe:[],lab:[],errors:[],budgetViolations:[],manualPending:["Physical iOS/Android safe area","VoiceOver/NVDA or equivalent real AT","Actual browser zoom and OS private browsing","Real-user field p75","Natural cold start separate existing QA"]};
const save=()=>writeFileSync(join(output,"summary-"+phase+".json"),JSON.stringify(summary,null,2));
const log=(tag,data)=>console.log(tag,JSON.stringify(data));
const err=(context,e)=>{summary.errors.push({context,error:String(e)});log("UX09_MEASUREMENT_ERROR",{context,error:String(e)});save();};
const violation=(route,metric,value,limit)=>summary.budgetViolations.push({route,metric,value,limit});
const check=(route,metric,value,limit)=>{if(typeof value!=="number"||!Number.isFinite(value))throw Error("Missing metric "+metric);if(value>limit)violation(route,metric,value,limit);};
const utf8=s=>Buffer.byteLength(s||"","utf8");
const axeOptions={runOnly:{type:"tag",values:["wcag2a","wcag2aa","wcag21a","wcag21aa","wcag22aa"]},resultTypes:["violations","incomplete"]};
if(phase!=="lab"){
 const browser=await chromium.launch({headless:true});
 summary.environment.chromium=browser.version();
 try{
  for(const [id,path] of allRoutes)for(const viewport of [{width:320,height:844},{width:1440,height:900}]){
   const context=await browser.newContext({viewport});const page=await context.newPage(),label=id+"-"+viewport.width;
   const errors=[];page.on("pageerror",e=>errors.push(String(e)));
   try{
    const response=await page.goto(url.origin+path,{waitUntil:"load",timeout:90000});assert.equal(response.status(),200);assert.equal(new URL(response.url()).origin,url.origin);assert.match(response.headers()["x-robots-tag"]||"",/noindex/);
    await page.locator('[data-reader-shell="v2"]').waitFor({timeout:15000});assert.equal(await page.locator("main").count(),1);
    await page.addScriptTag({path:axePath});
    const result=await page.evaluate(options=>window.axe.run(document,options),axeOptions);
    const geometry=await page.evaluate(()=>{
     const visible=el=>el.getClientRects().length&&getComputedStyle(el).visibility!=="hidden";
     const main=document.querySelector("main"),controls=[...document.querySelectorAll('[data-shell-nav] a, [data-home-group], .home-v2-search button, [data-interest-save], [data-interest-clear], [data-bookmark-filter], [data-journey-topic]')].filter(visible);
     const catalog=[...document.querySelectorAll("[data-bookmark-catalog],[data-journey-catalog],[data-history-titles],[data-home-legacy]")].flatMap(el=>["data-bookmark-catalog","data-journey-catalog","data-history-titles","data-home-legacy"].map(a=>el.getAttribute(a)||"")).join("");
     const nav=document.querySelector('[data-shell-nav="mobile"]'),mobile=nav&&visible(nav);
     const images=[...document.images].filter(visible).map(i=>({src:new URL(i.currentSrc||i.src,location.origin).pathname,loading:i.loading||"default",width:i.getAttribute("width"),height:i.getAttribute("height"),naturalWidth:i.naturalWidth,naturalHeight:i.naturalHeight,ratio:i.naturalWidth&&i.naturalHeight?Math.abs((i.clientWidth/i.clientHeight)/(i.naturalWidth/i.naturalHeight)-1):null}));
     return {overflow:document.documentElement.scrollWidth-innerWidth,mainCount:document.querySelectorAll("main").length,h1Count:document.querySelectorAll("h1").length,lang:document.documentElement.lang,viewport:document.querySelector('meta[name="viewport"]')?.content,controls:controls.map(x=>({label:x.textContent?.trim()||x.getAttribute("aria-label")||x.tagName,height:x.getBoundingClientRect().height,width:x.getBoundingClientRect().width})),mobileNavHeight:mobile?nav.getBoundingClientRect().height:0,bodyPadding:parseFloat(getComputedStyle(document.body).paddingBottom)||0,catalog,images};
    });
    const html=await response.text(),catalogBytes=utf8(geometry.catalog);delete geometry.catalog;
    // Keyboard skip/focus: browser automation only, not manual or screen-reader certification.
    await page.keyboard.press("Tab");const first=await page.evaluate(()=>({href:document.activeElement?.getAttribute("href"),text:document.activeElement?.textContent?.trim()}));
    let skip=false;if(first.href==="#dev-main"){await page.keyboard.press("Enter");skip=await page.evaluate(()=>document.activeElement?.id==="dev-main");}
    const focus=await page.evaluate(()=>{const el=document.activeElement;if(!el)return null;const css=getComputedStyle(el),r=el.getBoundingClientRect(),nav=document.querySelector('[data-shell-nav="mobile"]');const n=nav?.getBoundingClientRect();return {outline:css.outlineStyle,outlineWidth:css.outlineWidth,boxShadow:css.boxShadow,visible:el.matches(":focus-visible"),fullyObscured:!!n&&n.height>0&&r.top>=n.top&&r.bottom<=n.bottom};});
    const issues=result.violations.map(v=>({id:v.id,impact:v.impact,count:v.nodes.length,nodes:v.nodes.map(n=>({target:n.target,failureSummary:n.failureSummary,impact:n.impact}))}));
    const severe=issues.filter(x=>["critical","serious"].includes(x.impact)).reduce((n,x)=>n+x.count,0);
    const small=geometry.controls.filter(x=>x.height<config.accessibility.primaryTargetPx);
    const metrics={id,path,viewport,axeVersion:result.testEngine.version,violations:issues,incomplete:result.incomplete.map(x=>({id:x.id,impact:x.impact,targets:x.nodes.map(n=>n.target)})),geometry,htmlDecodedBytes:utf8(html),inlineCatalogBytes:catalogBytes,keyboard:{first,skip,focus},pageErrors:errors};
    summary.axe.push(metrics);
    check(label,"criticalSerious",severe,0);check(label,"overflowPx",geometry.overflow,1);check(label,"primarySmallHeightCount",small.length,0);check(label,"htmlDecodedBytes",metrics.htmlDecodedBytes,config.resources.htmlDecodedBytes);check(label,"inlineCatalogBytes",catalogBytes,config.resources.inlineCatalogBytes);
    if(errors.length)violation(label,"pageErrors",errors.length,0);
    await page.screenshot({path:join(output,label+".png"),fullPage:false,timeout:30000});
    log("UX09_AXE_BASELINE",{id,viewport:viewport.width,criticalSerious:severe,issues:issues.map(x=>({id:x.id,impact:x.impact,count:x.count})),incomplete:result.incomplete.length,overflow:geometry.overflow,smallTargets:small.length,htmlBytes:metrics.htmlDecodedBytes,catalogBytes,skip,pageErrors:errors.length});
    save();
   }catch(e){err(label,e);}finally{await context.close();}
  }
  // Real synthetic slow network traversal, separate from warm lab; never alter idle/ping cadence.
  const c=await browser.newContext({viewport:{width:390,height:844}}),p=await c.newPage();
  try{
   const cdp=await c.newCDPSession(p);await cdp.send("Network.enable");await cdp.send("Network.emulateNetworkConditions",{offline:false,latency:150,downloadThroughput:200000,uploadThroughput:75000});await cdp.send("Emulation.setCPUThrottlingRate",{rate:4});
   const start=Date.now(),res=await p.goto(url.origin+"/kham-pha",{waitUntil:"domcontentloaded",timeout:90000});assert.equal(res.status(),200);await p.locator("[data-knowledge-entry]").first().waitFor({timeout:90000});const ready=Date.now()-start;summary.slowNetwork={latencyMs:150,downloadBytesPerSecond:200000,uploadBytesPerSecond:75000,cpuSlowdown:4,discoveryReadyMs:ready,network:"CDP emulation; not field or cold start"};log("UX09_SLOW_NETWORK_BASELINE",summary.slowNetwork);
  }catch(e){err("slow-network",e);}finally{await c.close();}
 }finally{await browser.close();save();}
}
if(phase!=="axe"){
 const lighthouse=(await load("lighthouse")).default;
 const {launch}=await load("chrome-launcher");
 for(const [id,path] of routes)for(const formFactor of ["mobile","desktop"]){
  const device=config.lab[formFactor],values=[];
  for(let run=1;run<=config.lab.runs;run++){
   let chrome;const label=id+"-"+formFactor+"-"+run;
   try{
    chrome=await launch({chromePath:chromium.executablePath(),chromeFlags:["--headless=new","--no-sandbox","--disable-dev-shm-usage","--no-first-run"],logLevel:"silent"});
    const result=await lighthouse(url.origin+path,{port:chrome.port,output:"json",onlyCategories:["performance","accessibility"],logLevel:"error",formFactor,screenEmulation:{mobile:formFactor==="mobile",width:device.width,height:device.height,deviceScaleFactor:device.deviceScaleFactor,disabled:false},throttlingMethod:"simulate",throttling:{rttMs:device.rttMs,throughputKbps:device.throughputKbps,cpuSlowdownMultiplier:device.cpuSlowdownMultiplier},maxWaitForLoad:45000});
    const lhr=result.lhr;if(lhr.runtimeError)throw Error(lhr.runtimeError.code);assert.equal(new URL(lhr.finalDisplayedUrl||lhr.finalUrl).origin,url.origin);
    const audit=id=>lhr.audits[id]?.numericValue;
    const resources=lhr.audits["resource-summary"]?.details?.items||[];
    const bytes=type=>resources.find(x=>x.resourceType===type)?.transferSize??0;
    const row={id,path,formFactor,run,lcpMs:audit("largest-contentful-paint"),cls:audit("cumulative-layout-shift"),tbtMs:audit("total-blocking-time"),fcpMs:audit("first-contentful-paint"),performance:lhr.categories.performance.score,accessibility:lhr.categories.accessibility.score,scriptTransferBytes:bytes("script"),styleTransferBytes:bytes("stylesheet"),imageTransferBytes:bytes("image"),documentTransferBytes:bytes("document"),lighthouseVersion:lhr.lighthouseVersion,fetchTime:lhr.fetchTime};
    for(const k of ["lcpMs","cls","tbtMs","performance","accessibility"])assert(Number.isFinite(row[k]),"missing "+k);
    values.push(row);writeFileSync(join(output,label+".lhr.json"),JSON.stringify(lhr));log("UX09_LAB_SAMPLE",row);
   }catch(e){err(label,e);}finally{if(chrome)await chrome.kill();}
  }
  if(values.length!==config.lab.runs){err(id+"-"+formFactor,Error("Incomplete samples"));continue;}
  const p75=k=>values.map(x=>x[k]).sort((a,b)=>a-b)[Math.ceil(.75*values.length)-1];
  const row={id,formFactor,samples:values,p75:Object.fromEntries(["lcpMs","cls","tbtMs","scriptTransferBytes","styleTransferBytes","imageTransferBytes"].map(k=>[k,p75(k)]))};summary.lab.push(row);
  for(const k of ["lcpMs","cls","tbtMs"])check(id+"-"+formFactor,k,row.p75[k],config.lab[k]);
  for(const k of ["scriptTransferBytes","styleTransferBytes","imageTransferBytes"])check(id+"-"+formFactor,k,row.p75[k],config.resources[k]);
  log("UX09_LAB_P75",{id,formFactor,...row.p75});save();
 }
}
summary.finishedAt=new Date().toISOString();save();
const expectedAxe=phase==="lab"?0:allRoutes.length*2,expectedLab=phase==="axe"?0:routes.length*2;
log("UX09_BASELINE_SUMMARY",{mode,phase,axeExpected:expectedAxe,axeActual:summary.axe.length,labExpected:expectedLab,labActual:summary.lab.length,violations:summary.budgetViolations.length,errors:summary.errors.length,field:"N/A"});
if(summary.errors.length||summary.axe.length!==expectedAxe||summary.lab.length!==expectedLab)process.exitCode=1;
else if(mode==="gate"&&summary.budgetViolations.length)process.exitCode=1;
else console.log(mode==="gate"?"UX09_AUTOMATED_GATE_PASS":"UX09_BASELINE_CAPTURED");
