import assert from "node:assert/strict";
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||"playwright");
const origin="https://hanh-trinh-me-be-web-jn5v.onrender.com";

const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844}});
const page=await context.newPage(),errors=[],forbidden=[];
page.on("pageerror",e=>errors.push(e.message));
page.on("request",r=>{if(r.url().includes(".supabase.co")||r.url().includes("/api/family/"))forbidden.push(r.url());});
const q=s=>page.locator(s);
const choose=id=>q('[data-demo-persona="'+id+'"]').click();
const latest=()=>q("[data-demo-traces] [data-demo-status]").first();
async function status(n){assert.equal(await latest().getAttribute("data-demo-status"),String(n));}
try{
 // Never POST to a real signup endpoint in live QA; GET verifies the disabled proxy.
 assert.equal((await context.request.get(origin+"/api/family/auth/session",{timeout:90000})).status(),404);
 const home=await page.goto(origin+"/",{timeout:90000});
 assert.equal(home?.status(),200);
 await page.locator('a[href="/gia-dinh-demo"]').first().waitFor({state:"attached"});
 const demo=await page.goto(origin+"/gia-dinh-demo",{timeout:90000});
 assert.equal(demo?.status(),200);
 assert(/noindex/.test(await page.locator('meta[name="robots"]').getAttribute("content")||""),"missing noindex");
 console.log("PASS live demo route and disabled real auth proxy");
 await q('[data-demo-ready="true"]').waitFor();
 assert.equal(await q("[data-demo-actor]").textContent(),"Mẹ An");
 assert.equal(await q("[data-demo-role]").textContent(),"Chủ gia đình");
 for(const width of [390,768,1024,1440]){
  await page.setViewportSize({width,height:900});
  const m=await page.evaluate(()=>({w:document.documentElement.scrollWidth,v:innerWidth}));
  assert(m.w<=m.v+1,"demo overflow "+width+" "+JSON.stringify(m));
 }
 await q("[data-demo-stage]").selectOption("nhu-nhi");await status(200);
 await q('[data-demo-task="read"]').check();await status(200);
 await q('[data-demo-save="ngu-an-toan-cho-tre-so-sinh"]').click();await status(200);
 await q("[data-demo-probe-revision]").click();await status(409);
 await choose("demo-dad");
 assert.equal(await q("[data-demo-stage]").inputValue(),"nhu-nhi");
 assert(await q('[data-demo-task="read"]').isChecked());
 assert.equal(await q('[data-demo-save="ngu-an-toan-cho-tre-so-sinh"]').getAttribute("aria-pressed"),"true");
 await page.reload();await q('[data-demo-ready="true"]').waitFor();assert.equal(await q("[data-demo-actor]").textContent(),"Bố Minh");assert(await q('[data-demo-task="read"]').isChecked());
 await choose("demo-grandma");assert(await q("[data-demo-stage]").isDisabled());assert(await q('[data-demo-task="read"]').isDisabled());
 await q("[data-demo-probe-write]").click();await status(404);
 await choose("demo-other");assert.equal(await q("[data-demo-family-title]").textContent(),"Gia đình đối chứng");
 await q("[data-demo-probe-tenant]").click();await status(404);
 await choose("demo-guest");assert(await q("[data-demo-onboard]").isDisabled());await q("[data-demo-consent]").check();await q("[data-demo-onboard]").click();await status(200);assert(await q("[data-demo-empty]").isVisible());
 await choose("demo-mom");await q("[data-demo-invite-target]").selectOption("demo-guest");await q("[data-demo-invite]").click();await status(200);const token=await q("[data-demo-invite-token]").textContent();
 await choose("demo-guest");await q('[data-demo-accept="'+token+'"]').click();await status(200);assert.equal(await q("[data-demo-role]").textContent(),"Thành viên");
 await choose("demo-mom");await q('[data-demo-revoke="demo-guest"]').click();await status(200);
 await choose("demo-guest");assert(await q("[data-demo-empty]").isVisible());await q("[data-demo-create]").click();await status(200);assert.equal(await q("[data-demo-role]").textContent(),"Chủ gia đình");
 await q("[data-demo-logout]").click();await status(200);assert.equal(await q("[data-demo-actor]").textContent(),"Chưa chọn nhân vật");
 const separate=await browser.newContext();const fresh=await separate.newPage();await fresh.goto(origin+"/gia-dinh-demo");await fresh.locator('[data-demo-ready="true"]').waitFor();assert.equal(await fresh.locator("[data-demo-actor]").textContent(),"Mẹ An");assert.equal(await fresh.locator("[data-demo-stage]").inputValue(),"so-sinh");await separate.close();
 await q("[data-demo-reset]").click();assert.equal(await q("[data-demo-stage]").inputValue(),"so-sinh");assert.deepEqual(errors,[]);assert.deepEqual(forbidden,[]);
 console.log("LIVE_FAMILY_DEMO_BROWSER_PASS: 5 personas, consent, create, invite, revoke, shared checklist/saved/stage, stale revision, tenant isolation, reload, separate browser, reset, 4 widths, no real API");
}finally{await browser.close();}
