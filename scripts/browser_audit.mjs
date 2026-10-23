#!/usr/bin/env node
/* Real Chromium visual/DOM smoke test, served from the generated Test checkout.
 * An Actions artifact retains screenshots for human inspection.
 * No remote server, tracking, or external API requests are needed. */
import fs from "node:fs";
import path from "node:path";
import {createRequire} from "node:module";
const require=createRequire(import.meta.url);
const {chromium}=require("/tmp/dedsec-browser/node_modules/playwright-core");
const candidates=[
 process.env.CHROME_PATH,"/usr/bin/google-chrome","/usr/bin/google-chrome-stable",
 "/usr/bin/chromium","/usr/bin/chromium-browser",
 "/opt/google/chrome/chrome","/opt/hostedtoolcache/chromium/chrome"
].filter(Boolean);
const executable=candidates.find(p=>fs.existsSync(p));
if(!executable)throw new Error("Chromium/Chrome binary not found: "+candidates.join(", "));
const dir="browser-screenshots";fs.mkdirSync(dir,{recursive:true});
const browser=await chromium.launch({executablePath:executable,headless:true,args:["--no-sandbox","--disable-gpu"]});
const base="http://127.0.0.1:8765/DedSec-Project-Website/";
// Startup covers the small basic DedSec bundle, never the knowledge archive.
const preloadFull=JSON.parse(fs.readFileSync('.site-publish/startup-manifest.json','utf8'));
const preloadFixture=preloadFull;
checkStartupScope();
function checkStartupScope(){
 if(preloadFull.resources.some(r=>/^(data|learn|raw)\//.test(r.url)))throw Error('Knowledge content included in startup cache');
 if(preloadFull.bytes>=15*1024*1024)throw Error('Basic startup bundle unexpectedly large');
}
const createPage=browser.newPage.bind(browser);
browser.newPage=async function(options){const p=await createPage(options);await p.context().route('**/startup-manifest.json',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(preloadFixture)}));return p;};

const all=[];
const faults=[];
function check(cond,msg){if(!cond)faults.push(msg)}
function rgbaTransparent(c){return c==="transparent"||/rgba?\([^)]*,\s*0(?:\.0+)?\s*\)$/.test(c)}
// Authenticated portal UI on an isolated mock transport. No real accounts,
// provider challenges, personal notes or sponsor source bytes are used here.
for(const [locale,theme,width] of [['en','dark',320],['gr','light',390],['en','light',1280],['gr','dark',1440]]){
 const p=await browser.newPage({viewport:{width,height:844}}),gr=locale==='gr',errors=[];
 p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(({locale,theme})=>{localStorage.setItem('dedsec:language',JSON.stringify(locale));localStorage.setItem('dedsec:theme',JSON.stringify(theme));localStorage.setItem('dedsec:cookie-choice','decline');},{locale,theme});
 await p.route('**/assets/account-config.js*',route=>route.fulfill({contentType:'application/javascript',body:'window.DEDSEC_ACCOUNT_CONFIG={apiBase:location.origin+"/api/account",turnstileSite:"local-ui-fixture"};'}));
 await p.route('https://challenges.cloudflare.com/turnstile/v0/api.js*',route=>route.fulfill({contentType:'application/javascript',body:'window.turnstile={render(node,options){this.options=options;node.textContent="Local challenge fixture";options.callback("local-fixture-token");return 1;},remove(){},reset(){this.options.callback("local-fixture-token");}};'}));
 let signed=false,cloudEntries=[],cloudRevision=0,conflict=false,unlocked=false,registeredPayload=null,deleteFails=true,blockLoginSession=true,rejectLogin=true;
 const scriptBytes=Buffer.from('print("Local download fixture")\n'),{createHash}=await import('node:crypto'),sha=createHash('sha256').update(scriptBytes).digest('hex');
 const scripts=[{id:'fixture-en',filename:'Fixture (English).py',language:'en',sha256:sha,version:'v2',description:{en:'Local UI fixture',el:'Τοπικό δείγμα διεπαφής'}}];
 await p.route('**/api/account/**',async route=>{const r=route.request(),name=new URL(r.url()).pathname.split('/api/account/')[1],method=r.method();let payload;try{payload=r.postDataJSON();}catch{}
  if(payload)check(payload.language===(gr?'el':'en'),'Account form omitted current page language: '+name);
  const answer=(data,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(data)});
  if(name==='status')return answer({version:1,mode:'active',connected:true,counts:{registered:signed?1:0,active:signed?1:0}});
  if(name==='challenge')return answer({version:1,salt:'12'.repeat(16),iterations:600000,hash:'SHA-256'});
  if(name==='login'){if(rejectLogin)return answer({error:'invalid_credentials'},401);signed=!blockLoginSession;return answer({signedIn:true});}
  if(name==='register'){registeredPayload=payload;signed=true;return answer({created:true,recoveryCode:'ab'.repeat(32)},201);}
  if(name==='me'&&method==='DELETE'){
   check(r.headers()['x-csrf-token']==='fixture-csrf','Deletion omitted CSRF');
   check(/^[0-9a-f]{64}$/.test(payload.prehash)&&!JSON.stringify(payload).includes('a long local test password'),'Deletion credential contract');
   if(deleteFails)return answer({error:'invalid_credentials'},401);
   signed=false;return answer({deleted:true});
  }
  if(name==='me')return signed?answer({user:{storageId:'isolated-fixture-account-id',givenName:'Test',familyName:'Fixture',email:'ui@example.test',ageAtRegistration:25,dateOfBirth:'2001-01-01',verified:unlocked},csrf:'fixture-csrf',counts:{registered:1,active:1},revision:cloudRevision,entries:cloudEntries,mailReady:false,rewards:{qualified:unlocked?3:0,pending:0,required:3,unlocked,unlockedCount:unlocked?1:0,code:'cd'.repeat(16),release:'v2',scripts:scripts.map((script,i)=>({...script,requiredReferrals:(i+1)*3,unlocked:unlocked&&i===0}))}}):answer({error:'sign_in_required'},401);
  if(name==='notes'&&method==='PUT'){check(r.headers()['x-csrf-token']==='fixture-csrf','Portal omitted CSRF');if(conflict)return answer({error:'workspace_conflict'},409);check(payload.revision===cloudRevision,'Portal revision contract');cloudEntries=payload.entries;cloudRevision++;return answer({revision:cloudRevision});}
  if(name==='sponsor/fixture-en')return route.fulfill({status:unlocked?200:403,contentType:'text/x-python',body:unlocked?scriptBytes:Buffer.from('locked')});
  if(name==='logout'){signed=false;return answer({signedOut:true});}
  return answer({error:'not_found'},404);
 });
 const prefix=gr?'dedsec/el/Pages/':'dedsec/Pages/';await p.goto(base+prefix+'account.html?site=main&parent=https%3A%2F%2Fded-sec.space&bridge='+ 'ab'.repeat(16),{waitUntil:'networkidle'});
 check(await p.locator('[data-account-panel]').evaluateAll(xs=>xs.every(x=>x.hidden)),'Live forms must start closed');await p.locator('[data-account-tab="account-login-panel"]').click();check(await p.locator('#account-login-panel input').count()===2&&!await p.locator('#account-register-panel').isVisible(),'Live sign-in shows extra registration fields');await p.locator('[data-account-tab="account-register-panel"]').click();
 // A successful credential response without a session must give a durable,
 // actionable error, preserve the email and never navigate or silently reset.
 const portalURL=p.url(),loginForm=p.locator('#account-login-panel form');
 await p.locator('[data-account-tab="account-login-panel"]').click();
 await loginForm.locator('[name=email]').fill('ui@example.test');await loginForm.locator('[name=password]').fill('a long local test password');await loginForm.locator('[type=submit]').click();
 // Match the real embedded portal selectors, including the attribute/class
 // that used to override visible notifications with opacity:0.
 await p.evaluate(()=>{document.documentElement.dataset.accountEmbedded='true';document.documentElement.classList.add('account-embedded');});
 await p.locator('.account-auth-error').waitFor({state:'visible'});
 await p.waitForFunction(()=>{const el=document.getElementById('account-feedback'),s=getComputedStyle(el);return s.opacity==='1'&&s.visibility==='visible';});
 const errorToast=await p.locator('#account-feedback').evaluate(el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return {background:s.backgroundColor,color:s.color,top:r.top,bottom:r.bottom,view:innerHeight,parent:el.parentElement.tagName};});
 check(errorToast.background==='rgb(159, 25, 37)'&&errorToast.color==='rgb(255, 255, 255)'&&errorToast.top>=0&&errorToast.bottom<=errorToast.view&&errorToast.parent==='BODY','Embedded authentication error toast is hidden, clipped or has the wrong colors: '+JSON.stringify(errorToast));
 check(p.url()===portalURL,'Rejected credentials navigated the portal');
 rejectLogin=false;await loginForm.locator('[type=submit]').click();
 await p.locator('#account-session-notice').waitFor({state:'visible'});
 await p.evaluate(()=>{delete document.documentElement.dataset.accountEmbedded;document.documentElement.classList.remove('account-embedded');});
 check(p.url()===portalURL,'Blocked login navigated away');
 check(await loginForm.locator('[name=email]').inputValue()==='ui@example.test','Blocked login erased the email');
 check(await loginForm.locator('[name=password]').inputValue()==='','Blocked login retained the password');
 check(await p.locator('#account-session-notice a').count()===0,'Blocked-session notice retained a portal link');
 blockLoginSession=false;await loginForm.locator('[name=password]').fill('a long local test password');await loginForm.locator('[type=submit]').click();await p.locator('#account-profile').waitFor({state:'visible'});
 check(!await p.locator('#account-editor').isVisible(),'Empty editor remains visible before opening a file');
 check(p.url()===portalURL,'Successful login navigated away');
 await p.locator('#account-demo-exit').click();await p.locator('#account-auth').waitFor({state:'visible'});
 check(p.url()===portalURL,'Sign-out dropped portal session context');
 await p.locator('[data-account-tab="account-login-panel"]').click();await loginForm.locator('[name=email]').fill('ui@example.test');await loginForm.locator('[name=password]').fill('a long local test password');await loginForm.locator('[type=submit]').click();await p.locator('#account-profile').waitFor({state:'visible'});
 await p.locator('#account-demo-exit').click();await p.locator('#account-auth').waitFor({state:'visible'});
 check(p.url()===portalURL,'Repeated sign-in/out changed portal context');
 await p.locator('[data-account-tab="account-register-panel"]').click();
 const form=p.locator('#account-register-panel form');await form.locator('[name=given-name]').fill('Test');await form.locator('[name=family-name]').fill('Fixture');await form.locator('[name=email]').fill('ui@example.test');await form.locator('[name=email-repeat]').fill('ui@example.test');check(await form.locator('[name=age]').count()===0,'Age must be derived from date of birth');await form.locator('[name=date-of-birth]').fill('2001-01-01');await form.locator('[name=referral-code]').fill('CD'.repeat(16));await form.locator('[name=password]').fill('a long local test password');await form.locator('[name=password-repeat]').fill('a long local test password');await form.locator('[name=terms]').check();await form.locator('[type=submit]').click();
 await p.locator('#account-profile').waitFor({state:'visible'});
 // The embedded portal must not retain the standalone fixed-launcher spacer.
 await p.evaluate(()=>document.documentElement.dataset.accountEmbedded='true');
 const embeddedSpacing=await p.locator('.account-template').evaluate(el=>({padding:parseFloat(getComputedStyle(el).paddingBottom),body:parseFloat(getComputedStyle(document.body).paddingBottom)}));
 check(embeddedSpacing.padding<=12&&embeddedSpacing.body===0,'Embedded account retains bottom spacer: '+JSON.stringify(embeddedSpacing));
 await p.evaluate(()=>delete document.documentElement.dataset.accountEmbedded);
check(registeredPayload&&/^[0-9a-f]{64}$/.test(registeredPayload.prehash),'Registration did not derive credential');check(!JSON.stringify(registeredPayload).includes('a long local test password'),'Original password left the browser');check(await p.locator('#account-workspace-title').innerText()==='Test Fixture','Profile name spelling changed');
 check(registeredPayload.referralCode==='cd'.repeat(16),'Referral code not normalized or submitted');check(await p.locator('#account-change-password button').isDisabled(),'Unverified user can change password');check(await p.locator('#account-referral-code').inputValue()==='cd'.repeat(16),'Referral code missing');check(registeredPayload.dateOfBirth==='2001-01-01'&&!('age' in registeredPayload),'Registration must send date of birth without manual age');check(await p.locator('#account-registered-count').innerText()==='1 / 300','Live account counter');check(await p.locator('#account-recovery-notice code').innerText()==='ab'.repeat(32),'Recovery code display');
 let pendingDownload=p.waitForEvent('download');await p.locator('#account-recovery-notice button').first().click();let downloaded=await pendingDownload;check(downloaded.suggestedFilename()==='DedSec-recovery-code.txt','Recovery download name');await p.locator('#account-recovery-notice button').last().click();
 check(await p.locator('#account-rewards .account-script button').isDisabled(),'Locked rewards became downloadable');
 await p.locator('#account-fab').click();await p.locator('#account-new-file').click();await p.locator('#account-name').fill('Live note');await p.locator('#account-dialog-confirm').click();check(await p.locator('#account-editor').isVisible(),'Created note did not open the editor');await p.locator('#account-editor').fill('Private local fixture Ελληνικά');await p.locator('#account-save').click();await p.waitForFunction(()=>document.getElementById('account-sync-status').textContent.includes('private account')||document.getElementById('account-sync-status').textContent.includes('ιδιωτικό λογαριασμό'));
 check(cloudEntries.some(e=>e.content==='Private local fixture Ελληνικά'),'Private editor did not sync');
 p.on('dialog',dialog=>dialog.accept());
 await p.locator('#account-use-local').click();await p.locator('#account-use-cloud').waitFor({state:'visible'});
 await p.locator('#account-files .account-open').first().click();await p.locator('#account-editor').fill('Browser-only durable note Ελληνικά');await p.locator('#account-save').click();
 await p.waitForFunction(()=>document.getElementById('account-sync-status').textContent.includes('only in this browser')||document.getElementById('account-sync-status').textContent.includes('μόνο σε αυτόν'));
 check(!cloudEntries.some(e=>e.content==='Browser-only durable note Ελληνικά'),'Local mode uploaded a private edit');
 await p.reload({waitUntil:'networkidle'});await p.locator('#account-use-cloud').waitFor({state:'visible'});await p.locator('#account-files .account-open').first().click();
 check(await p.locator('#account-editor').inputValue()==='Browser-only durable note Ελληνικά','Browser notes did not survive reload');
 cloudEntries=cloudEntries.map(e=>e.kind==='file'?{...e,content:'Newer cloud version'}:e);cloudRevision++;
 await p.locator('#account-use-cloud').click();await p.locator('#account-use-local').waitFor({state:'visible'});
 check(cloudEntries.some(e=>e.content==='Newer cloud version')&&cloudEntries.some(e=>e.content==='Browser-only durable note Ελληνικά'),'Transfer overwrote conflicting cloud/local text');
 check(new Set(cloudEntries.map(e=>e.path.toLowerCase())).size===cloudEntries.length,'Transfer created duplicate paths');
 await p.locator('#account-files .account-open').first().click();
 // IndexedDB compare-and-swap rejects concurrent local writers and leaves
 // another owner/profile untouched. No real account or private fixture used.
 const localCAS=await p.evaluate(async()=>{const l=window.DedSecAccountLocal,a=await l.key('isolated-a@example.test','test'),b=await l.key('isolated-a@example.test','main');const note=[{path:'test.txt',kind:'file',pinned:false,content:'fixture'}];await l.write(a,0,note,'local');const results=await Promise.allSettled([l.write(a,1,note,'local'),l.write(a,1,note,'local')]);const other=await l.read(b);await l.remove(a);return {ok:results.filter(x=>x.status==='fulfilled').length,conflict:results.filter(x=>x.reason?.code==='local_conflict').length,other};});
 check(localCAS.ok===1&&localCAS.conflict===1&&localCAS.other===null,'Local revision/profile isolation failed');

 unlocked=true;await p.locator('#account-rewards > button').last().click();await p.waitForFunction(()=>document.querySelector('#account-rewards .account-script button')?.disabled===false);check(await p.locator('#account-rewards .account-script button').isEnabled(),'Refreshed rewards did not unlock');check(await p.locator('#account-rewards h3').innerText()==='Fixture (English).py','Script filename spelling changed');
 pendingDownload=p.waitForEvent('download');await p.locator('#account-rewards .account-script button').click();downloaded=await pendingDownload;check(fs.readFileSync(await downloaded.path()).equals(scriptBytes),'Verified mock sponsor download changed bytes');
 conflict=true;await p.locator('#account-editor').fill('Unsynced conflict copy');await p.locator('#account-save').click();await p.waitForFunction(()=>document.getElementById('account-feedback').textContent.includes('another tab')||document.getElementById('account-feedback').textContent.includes('άλλη καρτέλα'));check(await p.locator('#account-editor').inputValue()==='Unsynced conflict copy','Conflict discarded local notes');
 check(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Live account horizontal overflow');check(errors.length===0,'Live account JS errors '+JSON.stringify(errors));check(await p.evaluate(()=>Object.keys(localStorage).every(k=>!/^dedsec:(account|note|password)/i.test(k))),'Live account stored private data in localStorage');
 await p.screenshot({path:path.join(dir,`account-live-${locale}-${theme}-${width}.png`),fullPage:false});
 const deleteAccount=async()=>{
  await p.locator('#account-delete-account').click();
  await p.locator('dialog[open] input[type="password"]').fill('a long local test password');
  const deletionResponse=p.waitForResponse(r=>r.request().method()==='DELETE'&&new URL(r.url()).pathname.endsWith('/api/account/me'));
  await p.locator('dialog[open] button[type="submit"]').click();await deletionResponse;
 };
 await deleteAccount();
 await p.waitForFunction(()=>document.getElementById('account-feedback')?.classList.contains('account-toast-error'));
 check(await p.locator('#account-deleted-success').count()===0,'Rejected deletion showed success');
 check(await p.locator('#account-profile').isVisible(),'Rejected deletion hid private workspace');
 deleteFails=false;
 await p.route('https://dedsec1121fk.github.io/Test/',route=>route.fulfill({status:200,contentType:'text/html',body:'<h1 id="deletion-home">Home fixture</h1>'}));
 await deleteAccount();await p.locator('#account-deleted-success').waitFor();
 check((await p.locator('#account-deleted-success h1').innerText())===(gr?'Η διαγραφή λογαριασμού ολοκληρώθηκε επιτυχώς':'Account deleted successfully'),'Deletion success translation');
 check((await p.locator('#account-deleted-success a').getAttribute('href'))==='https://dedsec1121fk.github.io/Test/','Deletion fallback points to account route');
 await p.waitForURL('https://dedsec1121fk.github.io/Test/',{timeout:10000});
 check(await p.locator('#deletion-home').isVisible(),'Deletion did not return to homepage');
 await p.close();
}

if(faults.length){await browser.close();throw Error("ACCOUNT_BROWSER_FAILURES "+JSON.stringify(faults));}

/* First-visit consent: accessible immediately after the page has initialized. */
const firstVisit=await browser.newPage({viewport:{width:390,height:844}});
await firstVisit.addInitScript(()=>{
 if(!sessionStorage.getItem("cookie-first-visit-fixture")){localStorage.removeItem("dedsec:cookie-choice");sessionStorage.setItem("cookie-first-visit-fixture","1");}
 localStorage.setItem("dedsec:language",JSON.stringify("en"));
 localStorage.setItem("dedsec:theme",JSON.stringify("dark"));
});
await firstVisit.goto(base+"index.html",{waitUntil:"domcontentloaded",timeout:25000});
await firstVisit.waitForFunction(()=>window.__DEDSEC_BOOT__?.status==="ready");
await firstVisit.locator("#dedsec-cookie-overlay:not([hidden])").waitFor({timeout:8000});
check(await firstVisit.locator("#dedsec-cookie-overlay").isVisible(),"First-visit consent missing after boot");
await firstVisit.locator('[data-dedsec-cookie="decline"]').click();
await firstVisit.reload({waitUntil:'networkidle'});
check(await firstVisit.locator('#dedsec-cookie-overlay:not([hidden])').count()===0,'Saved homepage consent was asked again');
await firstVisit.close();
// Fresh direct visits to Account and subpages must never ask for consent.
for(const rel of ['dedsec/Pages/account.html','dedsec/el/Pages/account.html','dedsec/Pages/faq.html']){
 const p=await browser.newPage({viewport:{width:390,height:844}});
 await p.addInitScript(()=>localStorage.removeItem('dedsec:cookie-choice'));
 await p.goto(base+rel,{waitUntil:'networkidle'});
 await p.waitForFunction(()=>!!window.DedSecCookies);
 check(await p.locator('#dedsec-cookie-overlay,#dedsec-cookie-banner,.dedsec-cookie-settings').count()===0,'Consent UI leaked into '+rel);
 await p.close();
}
// Exercise the actual account HTML at a separate origin in an iframe, with
// empty origin storage. This catches the production duplicate-dialog bug.
for(const locale of ['en','gr']){
 const p=await browser.newPage({viewport:{width:390,height:844}});
 await p.route('http://127.0.0.1:8765/**',async route=>{if(new URL(route.request().url()).pathname.endsWith('/startup-manifest.json'))return route.fallback();const response=await route.fetch();return route.fulfill({response,headers:{...response.headers(),'access-control-allow-origin':'*'}});});
 await p.route('https://dedsec-accounts.dedsec-project.workers.dev/**',async route=>{
  const u=new URL(route.request().url());
  if(!u.pathname.endsWith('/account.html'))return route.abort();
  const rel=locale==='gr'?'dedsec/el/Pages/account.html':'dedsec/Pages/account.html';
  let html=fs.readFileSync('DedSec-Project-Website/'+rel,'utf8');
  html=html.replace('<head>','<head><base href="'+base+rel+'">');
  await route.fulfill({status:200,contentType:'text/html',body:html});
 });
 await p.addInitScript(locale=>{localStorage.removeItem('dedsec:cookie-choice');localStorage.setItem('dedsec:language',JSON.stringify(locale));},locale);
 await p.goto(base+'index.html',{waitUntil:'networkidle'});
 await p.locator('#dedsec-cookie-overlay:not([hidden])').waitFor();
 await p.locator('[data-dedsec-cookie="decline"]').click();
 await p.locator('#nav-home').click();
 const frame=p.frameLocator('#dedsec-account-window iframe');
 await frame.locator('#account-auth').waitFor();
 const child=p.frames().find(f=>f.url().startsWith('https://dedsec-accounts.dedsec-project.workers.dev/'));
 await child.waitForFunction(()=>!!window.DedSecCookies);
 check(await frame.locator('#dedsec-cookie-overlay,#dedsec-cookie-banner,.dedsec-cookie-settings').count()===0,'Separate-origin Account asked for cookies: '+locale);
 check(await p.locator('#dedsec-cookie-overlay:not([hidden])').count()===0,'Homepage consent reopened when Account was tapped');
 await p.close();
}



// Same-page account overlay, trusted frame messages and close/reopen floating TXT.
for(const [surface,locale,width] of [['source','en',320],['source','gr',390],['published','en',320],['published','gr',390]]){
 const p=await browser.newPage({viewport:{width,height:844}});p.on('pageerror',e=>console.log('OVERLAY_JS_ERROR',e.message));
 await p.addInitScript(locale=>{localStorage.setItem('dedsec:language',JSON.stringify(locale));localStorage.setItem('dedsec:theme',JSON.stringify(locale==='gr'?'light':'dark'));localStorage.setItem('dedsec:cookie-choice','decline');},locale);
 await p.route('https://dedsec-accounts.dedsec-project.workers.dev/**',route=>{
  const url=new URL(route.request().url()),parent=url.searchParams.get('parent'),bridge=url.searchParams.get('bridge');
  const html='<!doctype html><html><body><button id="fixture-create">Create account</button><button id="fixture-login">Sign in</button><button id="fixture-float">Float TXT</button><textarea id="fixture-note"></textarea><script>const parentOrigin='+JSON.stringify(parent)+',bridge='+JSON.stringify(bridge)+';document.getElementById("fixture-login").onclick=()=>window.parent.postMessage({type:"dedsec-account-state",bridge,signedIn:true},parentOrigin);document.getElementById("fixture-float").onclick=()=>window.parent.postMessage({type:"dedsec-account-float",bridge},parentOrigin);document.body.dataset.fixtureReady="true";<'+ '/script></body></html>';
  return route.fulfill({status:200,contentType:'text/html',body:html});
 });
 await p.goto((surface==='published'?'http://127.0.0.1:8765/.site-publish/':base)+'index.html',{waitUntil:'networkidle'});await p.waitForFunction(()=>window.__DEDSEC_BOOT__?.status==='ready'&&!document.getElementById('site-loader'));await p.evaluate(()=>{window.fixtureMessages=[];addEventListener('message',e=>{if(e.data?.type?.startsWith('dedsec-account-'))window.fixtureMessages.push({type:e.data.type,origin:e.origin,signedIn:e.data.signedIn,frame:e.source===document.querySelector('#dedsec-account-window iframe')?.contentWindow});});});const startingURL=p.url();
 check(await p.locator('#nav-home').getAttribute('aria-label')===(locale==='gr'?'Λογαριασμός':'Account'),'Account replaced navbar Home');
 await p.locator('#nav-theme-switcher').click();await p.locator('#nav-home').click();await p.locator('#dedsec-account-window[open]').waitFor();
 check(await p.locator('#dedsec-account-window').evaluate((el,locale)=>getComputedStyle(el).backgroundColor===(locale==='gr'?'rgb(16, 9, 30)':'rgb(243, 234, 255)'),locale),'Account overlay did not follow a changed theme');
 check(p.url()===startingURL,'Account overlay navigated the current page');
 const frame=p.frameLocator('#dedsec-account-window iframe');await frame.locator('body[data-fixture-ready="true"]').waitFor();await frame.locator('#fixture-create').waitFor();
 check(await p.locator('#dedsec-txt-window-toggle').isHidden(),'Signed-out view shows private TXT toggle');
 await frame.locator('#fixture-login').click();await frame.locator('#fixture-note').fill('Retain this private fixture in the frame');await frame.locator('#fixture-float').click();
 try{await p.waitForFunction(()=>document.querySelector('#dedsec-account-window')?.classList.contains('is-floating'),{},{timeout:10000});}catch(e){console.log('OVERLAY_DIAGNOSTIC',locale,await p.evaluate(()=>({messages:window.fixtureMessages,dialog:document.querySelector('#dedsec-account-window')?.outerHTML,theme:document.body.className})));throw e;}
 check(await p.locator('#dedsec-account-window').evaluate(el=>el.classList.contains('is-floating')&&!el.matches(':modal')),'TXT floating window blocks the page');
 const dims=await p.locator('#dedsec-account-window').evaluate(el=>{const r=el.getBoundingClientRect();return {w:r.width,h:r.height,vw:innerWidth,vh:innerHeight};});
 check(Math.abs(dims.w-dims.vw/2)<=2&&Math.abs(dims.h-dims.vh/2)<=2,'Floating window must be half the viewport: '+JSON.stringify(dims));
 const grip=p.locator('.account-resize-handle');
 await grip.waitFor();
 // Wait for two layout frames before measuring the corner after opening a dialog.
 await grip.evaluate(el=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 await grip.hover();
 const bounds=await grip.boundingBox();
 await p.mouse.move(bounds.x+bounds.width/2,bounds.y+bounds.height/2);
 await p.mouse.down();
 await p.mouse.move(bounds.x+bounds.width/2+45,bounds.y+bounds.height/2+55,{steps:5});
 await p.mouse.up();
 // Pointer/ResizeObserver layout is asynchronous in Chromium; inspect the settled geometry.
 await p.waitForFunction(({w,h})=>{
  const box=document.querySelector('#dedsec-account-window').getBoundingClientRect();
  return box.width>w+12&&box.height>h+12;
 },{w:dims.w,h:dims.h},{timeout:2000}).catch(()=>{});
 const stretched=await p.locator('#dedsec-account-window').boundingBox();
 check(stretched.width>dims.w+12&&stretched.height>dims.h+12,'Floating window corner drag did not resize: '+JSON.stringify({dims,stretched}));

 await p.getByRole('button',{name:locale==='gr'?'Ελαχιστοποίηση λογαριασμού':'Minimize account',exact:true}).click();
 check(await p.locator('#dedsec-account-window').isHidden(),'Minimize must hide the whole account window');
 const circle=await p.locator('#dedsec-txt-window-toggle').evaluate(el=>{const box=el.getBoundingClientRect();return {w:box.width,h:box.height,r:getComputedStyle(el).borderRadius};});check(circle.w===circle.h&&circle.w===56&&circle.r==='0px','Minimized account must be a compact square '+JSON.stringify(circle));
 await p.locator('#dedsec-txt-window-toggle').click();
 check(await frame.locator('#fixture-note').inputValue()==='Retain this private fixture in the frame','Closing floating TXT discarded its draft');
 check(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Account overlay horizontal overflow');
 // X hides the minimized control; reopening Account restores it without losing the draft.
 await p.getByRole('button',{name:locale==='gr'?'Ελαχιστοποίηση λογαριασμού':'Minimize account',exact:true}).click();
 await p.locator('#dedsec-txt-float-dismiss').click();
 check(await p.locator('#dedsec-txt-float-controls').isHidden(),'Dismiss did not hide minimized account');
 await p.locator('#nav-home').click();await p.locator('#dedsec-account-window[open]').waitFor();
 check(await frame.locator('#fixture-note').inputValue()==='Retain this private fixture in the frame','Reopening dismissed account discarded its draft');
 await p.screenshot({path:path.join(dir,'account-overlay-'+surface+'-'+locale+'-'+width+'.png')});
 const returned=p.waitForEvent('framenavigated',{predicate:f=>f===p.mainFrame(),timeout:10000});
 await frame.locator('body').evaluate(()=>{
  window.parent.postMessage({type:'dedsec-account-deleted',bridge},parentOrigin);
 });
 await returned;check(p.url()===startingURL,'Embedded deletion returned to wrong homepage');
 await p.close();
}

await auditStartup();
for(const [view,width,height,light,url,locale] of [
 ["home-mobile-dark",390,844,false,"index.html"],
 ["home-mobile-light",390,844,true,"index.html"],
 ["home-small-greek-dark",320,844,false,"index.html","gr"],
 ["home-small-greek-light",320,844,true,"index.html","gr"],
 ["installation-mobile-dark",390,844,false,"dedsec/Pages/guide-for-installation.html"],
 ["installation-mobile-light",390,844,true,"dedsec/Pages/guide-for-installation.html"],
 ["home-desktop-dark",1280,900,false,"index.html"],
 ["home-desktop-light",1440,900,true,"index.html"],
 ["installation-desktop-dark",1280,900,false,"dedsec/Pages/guide-for-installation.html"],
 ["installation-desktop-greek-light",1440,900,true,"dedsec/el/Pages/guide-for-installation.html","gr"],
 ["knowledge-desktop-light",1280,900,true,"index.html#category:method"],
 ["lesson-desktop-dark",1440,900,false,"index.html#read:method-contrast-en"],
 ["knowledge-mobile-dark",390,844,false,"index.html#category:method"],
 ["knowledge-mobile-light",390,844,true,"index.html#category:method"],
 ["lesson-mobile-dark",390,844,false,"index.html#read:method-contrast-en"],
 ["lesson-mobile-light",390,844,true,"index.html#read:method-contrast-en"],
 ["installation-mobile-greek-dark",390,844,false,"dedsec/el/Pages/guide-for-installation.html","gr"]
]){
 const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
 page.on("pageerror",e=>faults.push(view+" JS error: "+e.message));
 await page.addInitScript(settings=>{
  try{
   localStorage.setItem("dedsec:theme",JSON.stringify(settings.theme));
   localStorage.setItem("dedsec:language",JSON.stringify(settings.locale));
   localStorage.setItem("dedsec:cookie-choice","decline");
  }catch(e){}
 },{theme:light?"light":"dark",locale:locale||"en"});
 if(view.startsWith("installation"))await page.context().grantPermissions(["clipboard-read","clipboard-write"],{origin:base.slice(0,-1)});
 await page.goto(base+url,{waitUntil:"domcontentloaded",timeout:30000});
 if(view.startsWith("home")||view.startsWith("knowledge")||view.startsWith("lesson")){
  check(await page.locator("#boot-screen").count()===0,view+" obsolete loading screen still exists");
  check(!await page.evaluate(()=>document.body.classList.contains("booting")),view+" obsolete booting class remains");
  await page.locator(view.startsWith("home")?"#dedsec-cookie-manage":view.startsWith("knowledge")?".archive-heading .page-heading":".lesson-content").waitFor({timeout:12000});
  check(await page.locator("#topbar").isVisible(),view+" top navigation not immediately available");
 if(view==="knowledge-mobile-dark"){
  const algorithm=await page.evaluate(()=>window.__DEDSEC_ALGORITHM_ENRICHMENT__);
  check(algorithm?.en===15&&algorithm?.el===15&&algorithm.missing.length===0,
    "Existing algorithm lessons not enriched in both languages: "+JSON.stringify(algorithm));
  const termuxSync=await page.evaluate(()=>window.__DEDSEC_TERMUX_SYNC__);
  check(termuxSync?.expected>=32 &&
    termuxSync.applied===termuxSync.expected &&
    Array.isArray(termuxSync.failures) && termuxSync.failures.length===0,
    "Termux curated catalogue failed to synchronize: "+JSON.stringify(termuxSync));
  const visibleMarker=await page.evaluate(()=>document.querySelector('#app')?.textContent.includes('dedsec-algorithm-detail')||false);
  check(!visibleMarker,"Algorithm enrichment displayed an internal marker to users");
 }
  if(!view.startsWith("home")){
  const expansion=await page.evaluate(()=>window.__DEDSEC_LESSON_ENRICHMENT__);
  check(expansion?.expected===0&&expansion.applied===0&&
        expansion.missing.length===0&&expansion.duplicates.length===0&&
        await page.evaluate(()=>window.ARCHIVE_EN?.length>=300&&window.ARCHIVE_EN?.length===window.ARCHIVE_EL?.length),
    view+" curated bilingual offline lessons must load without legacy overlays: "+JSON.stringify(expansion));
  }else check(await page.evaluate(()=>!window.ARCHIVE_EN&&!window.SITE_SEARCH_INDEX),view+" eagerly downloaded knowledge on homepage");

  check(await page.evaluate(()=>["nav-search","nav-theme-switcher","nav-lang-switcher","nav-home"].every(id=>{
    const control=document.getElementById(id);
    const child=control?.querySelector("svg")||control?.querySelector(".nav-lang-label");
    return !!child&&child.getBoundingClientRect().width>0;
  })),view+" first-render navigation SVG/text missing");

 }else await page.locator("#merged-home").waitFor({timeout:10000});
 await page.waitForFunction(()=>window.__DEDSEC_BOOT__?.status==="ready",null,{timeout:12000});
 await page.waitForTimeout(100);
 check(await page.locator('footer a[href="https://github.com/dedsec1121fk/dedsec1121fk.github.io"]').count()===1,view+' website repository footer link missing/duplicated');
 const audit=await page.evaluate(()=>{
  const css=(el)=>{const s=getComputedStyle(el);return {bg:s.backgroundColor,image:s.backgroundImage,color:s.color,opacity:s.opacity,fontSize:s.fontSize,fontFamily:s.fontFamily,borderRadius:s.borderTopLeftRadius,borderWidth:s.borderTopWidth,textAlign:s.textAlign,width:el.getBoundingClientRect().width,height:el.getBoundingClientRect().height}};
  const isHome=!!document.querySelector(".home-trust"),isRoot=!!document.getElementById("nav-home");
  const nav=Array.from(document.querySelectorAll(isRoot?".topbar .nav-actions > *":".merged-topbar .merged-actions > *")).map(el=>({id:el.id,className:el.className,...css(el),iconColor:css(el.querySelector("i,span")||el).color}));
  const probes=Array.from(document.querySelectorAll(".page-header,.content-section,.note,.note-warning,.platform-install-card,.page-content")).slice(0,12).map(el=>({className:el.className,tag:el.tagName,...css(el)}));
  const cookie=document.querySelector("#dedsec-cookie-manage");
  const svg=cookie?.querySelector("svg");
  const group=document.querySelector(".home-trust");
  const desc=document.querySelector(".home-about-summary");
  const reflectionCount=document.querySelectorAll('.desktop-home .start-reflection').length;
  const extraExplanation=document.querySelectorAll('.aristotle-explanation').length;
  const heading=document.querySelector(".archive-heading .page-heading");
  const subtitle=document.querySelector(".archive-heading .page-subtitle");
  const lesson=document.querySelector(".lesson-content");
  const samples=lesson?Array.from(lesson.querySelectorAll("p,h1,h2,h3,li")).slice(0,10).map(css):[];
  const pageHeading=document.querySelector(".archive-heading .page-heading");
  const firstBodyHeading=lesson?.querySelector("h1,h2,h3");
  const redundantTitle=!!(pageHeading&&firstBodyHeading&&
   pageHeading.textContent.trim().toLowerCase()===firstBodyHeading.textContent.trim().toLowerCase());
  return {title:document.title,bodyClasses:document.body.className,viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth,nav,
   probes,cookie:{present:!!cookie,svg:!!svg,paths:svg?.querySelectorAll("path,rect,circle,line,ellipse").length||0,text:cookie?.innerText||""},
   reflectionCount,extraExplanation,trust:group?css(group):null,description:desc?{text:desc.innerText,length:desc.innerText.length,...css(desc)}:null,heading:heading?css(heading):null,subtitle:subtitle?css(subtitle):null,lessonSamples:samples,redundantTitle};
 });
 if(view.startsWith('home-')){
  check(audit.reflectionCount===1&&audit.extraExplanation===0,view+' must show one merged reflection');
 }
 const navCopy=await page.evaluate(()=>{
  const account=document.querySelector('#nav-home,#merged-home'),search=document.querySelector('#nav-search,#merged-search'),language=document.querySelector('#nav-lang-switcher,#merged-lang');
  const header=document.querySelector('#topbar,.merged-topbar');
  const rects=[account,search,language].map(el=>{const r=el.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom};});
  return {account:account?.querySelector('.ds-nav-caption')?.textContent,search:search?.querySelector('.ds-nav-caption')?.textContent,language:language?.textContent,theme:document.querySelector('#nav-theme-switcher .ds-nav-caption,#merged-theme .ds-nav-caption')?.textContent,globe:language?.querySelectorAll('.ds-language-globe').length,rects,headerBottom:header.getBoundingClientRect().bottom};
 });
 const isGreek=(locale==='gr');
 check(navCopy.account===(isGreek?'Λογαριασμός':'Account'),view+' missing visible Account label');
 check(navCopy.search===(isGreek?'Αναζήτηση':'Search'),view+' missing visible Search label');
 check(navCopy.language===(isGreek?'English':'Ελληνικά'),view+' abbreviated language label');
 check(navCopy.theme===(isGreek?'Θέμα':'Theme'),view+' theme caption missing');
 check(navCopy.globe===1,view+' globe missing or duplicated');
 if(width<=760){
  const center=await page.locator('#brand span,.merged-brand span').first().evaluate(el=>{const r=el.getBoundingClientRect();return Math.abs((r.left+r.right)/2-innerWidth/2);});
  check(center<2,view+' mobile brand title not centered: '+center);
 }
 if(view.startsWith('home-')){
  const centeredHeading=await page.locator('#home-title').evaluate(el=>{const r=el.getBoundingClientRect();return Math.abs((r.left+r.right)/2-innerWidth/2)<2&&getComputedStyle(el).textAlign==='center';});
  check(centeredHeading,view+' homepage heading not centered');
 }
 check(navCopy.rects.every(r=>r.left>=0&&r.right<=width+1&&r.bottom<=navCopy.headerBottom+1),view+' navbar clipped');
 if(view.startsWith('home-'))check(await page.locator('#dedsec-account-launcher').count()===0,view+' duplicate Account launcher');
 all.push({view,...audit});
 check(audit.bodyClasses.includes(light?"light":"dark"),view+" did not load requested theme "+audit.bodyClasses);
 check(audit.scrollWidth<=width+2,view+" horizontal overflow "+audit.scrollWidth+"/"+width);
 check(audit.nav.length===4,view+" nav count "+audit.nav.length);
 const navGeometry=await page.evaluate(()=>{
  const isRoot=!!document.getElementById("nav-home");
  const container=document.querySelector(isRoot?".topbar .nav-actions":".merged-topbar .merged-actions");
  const arr=[...container.children].map(el=>({width:el.getBoundingClientRect().width,height:el.getBoundingClientRect().height}));
  const glyphs=[...container.querySelectorAll(".ds-nav-glyph")].map(el=>({width:el.getBoundingClientRect().width,height:el.getBoundingClientRect().height}));
  return {arr,glyphs};
 });
 check(navGeometry.arr.length===4&&navGeometry.arr.every(a=>Math.abs(a.width-navGeometry.arr[0].width)<2),
  view+" navbar control sizes uneven: "+JSON.stringify(navGeometry));
 check(navGeometry.glyphs.length===4&&navGeometry.glyphs.every(g=>g.width>=22&&g.width<=26),
  view+" one of the Search/Theme/Language/Account SVGs missing or wrongly sized: "+JSON.stringify(navGeometry));

 if(view.startsWith('installation')){
  const separated=await page.locator('.code-container:has(> .copy-btn)').evaluateAll(nodes=>nodes.every(node=>{
   const button=node.querySelector(':scope > .copy-btn'),code=node.querySelector(':scope > code');
   return !code||button.getBoundingClientRect().bottom<=code.getBoundingClientRect().top+1;
  }));
  check(separated,view+' copy control overlaps command text');
 }
 const expectedInk=light?"rgb(17, 17, 17)":"rgb(255, 255, 255)";
 for(const action of audit.nav){
  check(action.color===expectedInk,view+" action "+action.id+" wrong theme text: "+action.color);
  check(action.iconColor===expectedInk,view+" action "+action.id+" wrong icon: "+action.iconColor);
  check(action.borderRadius==="0px",view+" rounded action "+action.id);
  check(action.borderWidth===(/search/.test(action.id)?"1px":"0px"),view+" navbar search frame "+action.id);
  check(action.fontFamily.includes("Tahoma")||action.fontFamily.includes("MS Sans Serif"),view+" missing retro font "+action.id);
 }
 if(view.startsWith("knowledge")||view.startsWith("lesson")){
  check(audit.heading?.textAlign==="center",view+" heading not centered");
  check(audit.subtitle?.textAlign==="center",view+" subtitle not centered");
 }
 if(view.startsWith("lesson")){
  check(audit.lessonSamples.length>0,view+" lesson body empty");
  check(!audit.redundantTitle,view+" repeated lesson title");
  for(const sample of audit.lessonSamples)check(sample.textAlign==="center",view+" lesson text uncentered");
 }
 if(view.startsWith("home")){
  check(await page.locator(".pixel-glyph").count()>=15,view+" missing colorful pixel art");
  check(audit.cookie.svg && audit.cookie.paths>=5,view+" cookie has no visible SVG");
  if(view==="home-mobile-dark"){
   const outlines=await page.locator(".launcher-group").first().evaluate(el=>({width:getComputedStyle(el).borderTopWidth,radius:getComputedStyle(el).borderTopLeftRadius}));
   check(outlines.width==="0px"&&outlines.radius==="0px",view+" outer section frame should not enclose smaller cards");
   const tile=await page.locator(".app-icon-btn").first().evaluate(el=>({border:getComputedStyle(el).borderTopWidth,radius:getComputedStyle(el).borderTopLeftRadius}));
   check(tile.border==="1px"&&tile.radius==="0px",view+" individual launcher still needs a sharp glowing border");
  }
  const trust=await page.locator('.home-trust').evaluate(frame=>({
   background:getComputedStyle(frame).backgroundColor,border:getComputedStyle(frame).borderTopWidth,rule:getComputedStyle(frame,'::after').height,
   cards:[...frame.querySelectorAll('.home-trust-card')].map(c=>({background:getComputedStyle(c).backgroundColor,border:getComputedStyle(c).borderTopWidth,box:c.getBoundingClientRect().toJSON()})),
   badges:[...frame.querySelectorAll('.trust-github-badge')].map(b=>{const r=b.getBoundingClientRect(),c=b.closest('.home-trust-card').getBoundingClientRect();return {icons:b.querySelectorAll('svg').length,inside:r.left>=c.left&&r.right<=c.right,count:b.querySelector('[data-github-count]')?.textContent,ink:getComputedStyle(b.querySelector('[data-github-count]')).color};})
  }));
  check(trust.border==='1px'&&trust.rule==='3px'&&trust.cards.length===3&&trust.cards.every(c=>c.border==='1px'),view+' trust reference frame/panels missing: '+JSON.stringify(trust));
  check(rgbaTransparent(trust.background)&&trust.cards.every(c=>rgbaTransparent(c.background)),view+' trust surfaces must reveal the galaxy');
  check(trust.badges.length===2&&trust.badges.every(b=>b.icons===1&&b.inside&&b.count&&b.ink==='rgb(48, 48, 48)'),view+' GitHub badges clipped or unreadable: '+JSON.stringify(trust));
  check(audit.description?.length>0 && audit.description.length<=700,view+" description length");
  check(audit.trust?.width<=900 && audit.trust?.width >= (width<600?Math.min(320,width*.82):600),view+" trust group must grow without overflow: "+audit.trust?.width);
 }else{
  const items=audit.probes.filter(x=>/page-header|content-section|note/.test(x.className));
  for(const item of items){
    check(rgbaTransparent(item.bg),view+" opaque "+item.className+": "+item.bg);
    check(["0px","1px"].includes(item.borderWidth),view+" unexpected non-angular content border "+item.className+": "+item.borderWidth);
  }
 }
 if(view.startsWith("knowledge")||view.startsWith("lesson")){
  check(await page.locator("#app #searchInput,#app #languageFilter").count()===0,view+" duplicated search/language controls");
 }
 if(view==="knowledge-mobile-dark"){
  check(await page.evaluate(()=>Array.isArray(window.ARCHIVE_HACKING)&&window.ARCHIVE_HACKING.length===24),"Bilingual Hacking Guide not loaded");
 }
 if(view.startsWith("installation")){
  const card=page.locator("details.platform-install-card").first();
  if(!(await card.evaluate(el=>el.open)))await card.locator("summary").click();
  const command=await page.locator("#termux_pkg_cmd").textContent();
  const button=card.locator(".copy-btn").first();
  await button.click();
  await page.waitForFunction(()=>{const element=document.querySelector("details.platform-install-card .copy-btn");return !!element&&/Copied|Αντιγράφηκε/.test(element.textContent||"");},null,{timeout:6000});
  const label=await button.textContent();
  check(/Copied|Αντιγράφηκε/.test(label||""),view+" copy click did not report success: "+label);
  try{
   const text=await page.evaluate(()=>navigator.clipboard.readText());
   check(text===command,view+" copied command differs from source");
  }catch(e){faults.push(view+" clipboard read failed: "+e.message);}
 }
 if(view.startsWith("home")){
  const title=await page.locator("#home-title").textContent();
  const headings=await page.locator(".launcher-group-heading h2").allTextContents();
  check(title.trim().endsWith(".")&&headings.every(t=>t.trim().endsWith(".")),view+" titles missing final periods");
 }
 if(view.startsWith("knowledge")){
  const title=await page.locator(".archive-heading h1").textContent();
  const subtitle=await page.locator(".archive-heading p").textContent();
  const snippet=await page.locator(".result-card").first().innerText();
  check(title.trim().endsWith(".")&&subtitle.trim().endsWith("."),view+" archive headings missing periods");
  check(snippet.trim().endsWith("."),view+" learning preview missing final period");
 }
 await page.screenshot({path:path.join(dir,view+".png"),fullPage:view.startsWith("installation")?false:true});
 await page.close();
}
// Verify that light/dark really rendered different palettes, not just two
// copies of dark mode because a preference was initialized incorrectly.
for(const prefix of ["home-mobile","installation-mobile"]){
 const dark=all.find(x=>x.view===prefix+"-dark"),light=all.find(x=>x.view===prefix+"-light");
 if(dark&&light){
  check(dark.nav[0]?.color!==light.nav[0]?.color,prefix+" theme colors are identical");
 }
}

/* A tilde-fenced lesson must display actual code in every palette and viewport. */
for(const width of [390,1280])for(const theme of ["dark","light"]){
 const reader=await browser.newPage({viewport:{width,height:844}});
 reader.on("pageerror",e=>faults.push("reader JS: "+e.message));
 await reader.addInitScript(theme=>{
  localStorage.setItem("dedsec:theme",JSON.stringify(theme));
  localStorage.setItem("dedsec:language",JSON.stringify("en"));
  localStorage.setItem("dedsec:cookie-choice","decline");
 },theme);
 await reader.goto(base+"index.html#read:expanded-en-reverse-20-binary-header-validation",{waitUntil:"domcontentloaded"});
 await reader.locator(".lesson-content pre code").first().waitFor();
 const codeText=await reader.locator(".lesson-content pre code").allTextContents();
 check(codeText.some(t=>t.includes("def parse_record")),"reader lost parser code: "+theme+" "+width);
 check(!await reader.locator(".lesson-content").evaluate(e=>[...e.querySelectorAll("p")].some(p=>/^~~~/.test(p.textContent.trim()))),"raw tilde fences visible");
 check(await reader.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),"reader horizontal overflow: "+width);
 await reader.screenshot({path:path.join(dir,"parser-"+width+"-"+theme+".png"),fullPage:false});
 await reader.close();
}
/* Generated previews include every catalogue and inherit the selected palette. */
for(const width of [390,1280])for(const theme of ["dark","light"]){
 const article=await browser.newPage({viewport:{width,height:844}});
 await article.addInitScript(theme=>localStorage.setItem("dedsec:theme",JSON.stringify(theme)),theme);
 await article.goto("http://127.0.0.1:8765/.site-publish/learn/en/hgp-en-028.html",{waitUntil:"load"});
 await article.waitForFunction(()=>window.__DEDSEC_BOOT__?.status==="ready");
 check(await article.evaluate(()=>document.documentElement.dataset.theme)===theme,"preview theme preference ignored");
 check(await article.locator("main").innerText().then(t=>t.length>300),"preview body empty");
 check(await article.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),"preview overflow: "+width);
 await article.locator("#article-theme").click();
 await article.waitForFunction(()=>window.__DEDSEC_BOOT__?.status==="ready");
 check(await article.evaluate(()=>document.documentElement.dataset.theme)!==theme,"preview toggle failed");
 await article.screenshot({path:path.join(dir,"preview-"+width+"-"+theme+".png"),fullPage:false});
 await article.close();
}

/* Every imported page is checked in the same lightweight Chromium process.
 * This catches legacy overrides on long tail guides without 179 screenshots,
 * and uses the same locally served assets as the deployed GitHub Pages build. */
const darkSVG=fs.readFileSync("DedSec-Project-Website/assets/starfield-dark.svg","utf8"),lightSVG=fs.readFileSync("DedSec-Project-Website/assets/starfield-light.svg","utf8");
check(darkSVG.includes('id="dedsec-planets-v2"')&&lightSVG.includes('id="dedsec-planets-v2"'),"Both galaxy themes require repaired planet artwork");
const importedPaths=[
 "dedsec/404.html","dedsec/index.html","dedsec/el/index.html",
 ...["dedsec/Pages","dedsec/el/Pages","dedsec/Assistance","dedsec/el/Assistance"].flatMap(dir=>
  fs.readdirSync("DedSec-Project-Website/"+dir).filter(name=>name.endsWith(".html")).map(name=>dir+"/"+name))
];
check(importedPaths.length>=179,"Incomplete page-by-page skin sweep: "+importedPaths.length);
const visited=[];
for(const sweepTheme of ["dark","light"]){
const sweepPage=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
await sweepPage.route("**/*",async route=>{
 const u=route.request().url();
 if(/^https?:\/\//i.test(u)&&!u.startsWith(base)){await route.abort();return;}
 await route.continue();
});
await sweepPage.addInitScript(theme=>{
 try{
  localStorage.setItem("dedsec:language",JSON.stringify(location.pathname.includes("/dedsec/el/")?"gr":"en"));
  localStorage.setItem("dedsec:theme",JSON.stringify(theme));
  localStorage.setItem("dedsec:cookie-choice","decline");
 }catch(e){}
},sweepTheme);
for(const relative of importedPaths){
 try{
  await sweepPage.goto(base+relative,{waitUntil:"domcontentloaded",timeout:20000});
  check(await sweepPage.evaluate(()=>["merged-search","merged-theme","merged-lang","merged-home"]
    .every(id=>!!document.getElementById(id))),relative+" shared icons absent at DOMContentLoaded");
  await sweepPage.waitForLoadState("load",{timeout:20000});
  await sweepPage.waitForFunction(()=>window.__DEDSEC_BOOT__?.status==="ready",null,{timeout:15000});
  // Nested CSS @imports may finish after DOMContentLoaded on slower jobs.
  // Wait for the actual computed design token, not an arbitrary sleep.
  await sweepPage.waitForFunction(()=>!!getComputedStyle(document.body)
   .getPropertyValue("--dedsec-refinement-ready").trim(),null,{timeout:9000});
  // Wait for late stylesheet/presentation setup. Real persistent violations
  // still fail the strict computed-style check below.
  await sweepPage.waitForFunction(()=>{
    const content=document.querySelector(".page-content")||document.querySelector(".main-content");
    if(!content)return false;
    const transparent=v=>v==="transparent"||/rgba?\([^)]*,\s*0(?:\.0+)?\s*\)$/.test(v);
    const surfaces=[...content.querySelectorAll(".modal-disclaimer,.feature-card,.content-section,.note,.platform-install-card,.code-container,.copy-btn,.faq-card,.faq-item,.guide-card,.tool-card,.btn,.button")];
    const ink=document.body.classList.contains("merged-light")?"rgb(17, 17, 17)":"rgb(255, 255, 255)";
    return surfaces.every(el=>{
      const st=getComputedStyle(el);
      return transparent(st.backgroundColor)&&st.backgroundImage==="none"&&st.borderTopLeftRadius==="0px";
    })&&[...content.querySelectorAll("a.dedsec-text-link")].every(a=>getComputedStyle(a).color===ink);
  },null,{timeout:1500}).catch(()=>{});
  const result=await sweepPage.evaluate(()=>{
   const top=document.querySelector(".merged-topbar"),footer=document.querySelector(".merged-footer");
   const content=document.querySelector(".page-content")||document.querySelector(".main-content");
   const transparent=value=>value==="transparent"||/rgba?\([^)]*,\s*0(?:\.0+)?\s*\)$/.test(value);
   const nav=[...document.querySelectorAll(".merged-topbar .merged-actions > *")];
   const blue=getComputedStyle(document.body).getPropertyValue("--action-blue").trim();
   const links=[...document.querySelectorAll(".page-content a.dedsec-text-link,.main-content a.dedsec-text-link,.merged-footer a.dedsec-text-link")];
   const surfaces=content?[...content.querySelectorAll(".modal-disclaimer,.feature-card,.content-section,.note,.platform-install-card,.code-container,.copy-btn,.faq-card,.faq-item,.guide-card,.tool-card,.btn,.button")]:[];
   const opaque=surfaces.filter(el=>{
    const st=getComputedStyle(el);
    return !transparent(st.backgroundColor)||st.backgroundImage!=="none"||st.borderTopLeftRadius!=="0px";
   }).slice(0,3).map(el=>el.tagName.toLowerCase()+"."+String(el.className).replace(/\s+/g,"."));
   const badLinks=links.filter(el=>{
    const st=getComputedStyle(el);
    return st.color!==(document.body.classList.contains("merged-light")?"rgb(17, 17, 17)":"rgb(255, 255, 255)");
   }).slice(0,3).map(el=>el.textContent.trim().slice(0,45));
   return {nav:nav.length,top:!!top,footer:!!footer,content:!!content,
    decoratedHeadings:document.querySelectorAll(".merged-topic-heading .merged-topic-icon").length,
    linkCount:links.length,opaque,badLinks,overflow:document.documentElement.scrollWidth-innerWidth,
    blue,navBorder:nav[0]?getComputedStyle(nav[0]).borderTopWidth:null};
  });
  visited.push({theme:sweepTheme,page:relative,...result});
  if(relative==="dedsec/Assistance/termux-command-cheat-sheet.html"){
   await sweepPage.context().grantPermissions(["clipboard-read","clipboard-write"],{origin:base.slice(0,-1)});
   const button=sweepPage.locator("button.assistance-code-copy").first();
   const expected=await button.locator("xpath=..").locator("pre code").textContent();
   await button.click({timeout:3500});
   const copied=await sweepPage.evaluate(()=>navigator.clipboard.readText());
   check(copied===(expected||""),relative+" assistance code copy did not match source");
  }
  if(relative.endsWith("/Pages/faq.html")||relative.endsWith("/Pages/learn-about-the-tools.html")){
   const fold=sweepPage.locator(".category-header").first();
   await fold.click({timeout:3500});
   const cat=await sweepPage.locator(".category").first().evaluate(el=>({
    open:el.classList.contains("active"),
    height:el.querySelector(".tools-list")?.getBoundingClientRect().height||0
   }));
   check(cat.open&&cat.height>10,relative+" category accordion stayed collapsed");
   const item=sweepPage.locator(".tool-header").first();
   await item.click({timeout:3500});
   const inside=await sweepPage.locator(".tool-item").first().evaluate(el=>({
    open:el.classList.contains("active"),
    height:el.querySelector(".tool-description")?.getBoundingClientRect().height||0
   }));
   check(inside.open&&inside.height>10,relative+" tool/FAQ accordion stayed collapsed");
  }
  if(relative.endsWith("/Pages/assistance.html")){
    const total=await sweepPage.locator(".assistance-flat-grid .assistance-card").count();
    check(total===80,relative+" must show all 80 guides, found "+total);
    check(await sweepPage.locator(".assistance-category-section,.assistance-filter-btn,.assistance-card-category").count()===0,
      relative+" legacy category interface still visible in DOM");
    check(await sweepPage.locator("#assistance-search,.assistance-intro,.assistance-filter-row").count()===0,
       relative+" must not have a secondary search or framed title/description");
    check(await sweepPage.locator(".assistance-heading h1,.assistance-heading p").count()===2,
       relative+" must keep only the simple Programming Library-style heading and subtitle");
    const compact=await sweepPage.locator(".assistance-flat-grid .assistance-card").first().evaluate(el=>{
       const box=el.getBoundingClientRect();
       return {height:box.height,textAlign:getComputedStyle(el).textAlign};
    });
    check(compact.height>60&&compact.height<350,relative+" excessively tall cards "+JSON.stringify(compact));
  }
  if(relative.endsWith("/Pages/guide-for-installation.html")){
   const first=sweepPage.locator("details.platform-install-card").first();
   const before=await first.evaluate(el=>el.open);
   await first.locator("summary").click({timeout:3500});
   const after=await first.evaluate(el=>el.open);
   check(before!==after,relative+" native details failed to toggle");
  }

  const websiteRepo=sweepPage.locator('footer a[href="https://github.com/dedsec1121fk/dedsec1121fk.github.io"]');
  check(await websiteRepo.count()===1,relative+' website repository footer link missing/duplicated');
  check((await websiteRepo.innerText()).includes(relative.includes('/el/')?'Αποθετήριο Ιστοσελίδας':'Website Repository'),relative+' website repository footer translation missing');
  check(await sweepPage.locator('.page-back').count()===1,relative+' missing Back');
  check(result.nav===4&&result.top&&result.footer,relative+" missing shared navbar/footer");
  if(relative==="dedsec/404.html")check(await sweepPage.locator(".not-found-actions a.dedsec-text-link").count()>=3,"404 destinations missing neutral links");
  check(result.navBorder==="1px",relative+" Search frame missing: "+result.navBorder);
  check(result.opaque.length===0,relative+" painted/framed elements: "+result.opaque.join(","));
  check(result.badLinks.length===0,relative+" text links not in theme ink: "+result.badLinks.join(","));
 }catch(e){faults.push(relative+" browser audit failed: "+e.message);}
}
await sweepPage.close();
}
fs.writeFileSync(path.join(dir,"all-pages.json"),JSON.stringify(visited,null,2));
console.log("SITE_PAGE_SWEEP: "+visited.length+"/"+importedPaths.length+
  " imported HTML visits across both themes verified for transparent, angular content, theme-color links and four-button navbar");

/* TikDev embedded-source smoke: mock GitHub for repeatability and API quota. */
const sampleRepo={id:42,name:"example",full_name:"example/example",
 description:"Safe demo repository for test",html_url:"https://github.com/example/example",
 stargazers_count:12,forks_count:2,watchers_count:12,language:"JavaScript",topics:["demo"],
 owner:{login:"example",avatar_url:""},updated_at:"2026-10-01T00:00:00Z",
 pushed_at:"2026-10-01T00:00:00Z",created_at:"2026-01-01T00:00:00Z",
 open_issues_count:0,archived:false,fork:false,private:false,default_branch:"main",
 license:{spdx_id:"MIT",name:"MIT"},size:10};
const tikPage=await browser.newPage({viewport:{width:390,height:844}});
tikPage.on("pageerror",e=>faults.push("TikDev JS error: "+e.message));
await tikPage.addInitScript(()=>{
 localStorage.setItem("dedsec:language",JSON.stringify("en"));
 localStorage.setItem("dedsec:theme",JSON.stringify("dark"));
});
await tikPage.route("https://api.github.com/**",route=>{
 const url=route.request().url();
 const data=url.includes("/search/")?{total_count:1,incomplete_results:false,items:[sampleRepo]}:
   url.includes("/starred")?[]:url.includes("/readme")?{}:sampleRepo;
 return route.fulfill({status:200,contentType:"application/json",body:JSON.stringify(data)});
});
await tikPage.goto(base+"TikDev.html",{waitUntil:"domcontentloaded",timeout:25000});
await tikPage.locator("#dedsec-nav").waitFor({timeout:10000});
await tikPage.waitForTimeout(1100);
const tikDebug=await tikPage.evaluate(()=>({
  hasFeed:!!document.getElementById("feed"),
  count:document.querySelectorAll("#feed .feed-card").length,
  text:(document.getElementById("feed")?.textContent||"").slice(0,250),
  cadence:!!window.__DEDSEC_TIKDEV_CADENCE__,
  readyState:document.readyState
}));
console.log("TIKDEV_DEBUG "+JSON.stringify(tikDebug));
check(tikDebug.count>=1,"TikDev did not render its feed: "+JSON.stringify(tikDebug));
const tikState=await tikPage.evaluate(()=>({
 gap:window.__DEDSEC_TIKDEV_CADENCE__?.gap,
 music:document.querySelectorAll("#musicStations [data-music-id]").length,
 refresh:!!document.getElementById("dedsec-refresh"),
 auto:!document.getElementById("dedsec-auto"),
 theme:document.documentElement.dataset.theme,
 border:getComputedStyle(document.querySelector("#dedsec-nav")).borderBottomWidth
}));
check(tikState.gap===18,"TikDev featured repository cadence must be 18 regular cards");
check(await tikPage.locator("#dedsec-theme,#dedsec-lang").count()===2 &&
 await tikPage.locator("#dedsec-auto").count()===0,
 "TikDev must have the shared DedSec theme/language pair without auto refresh");
check((await tikPage.locator(".intro-card h1").innerText()).includes("Discover more."),"TikDev original welcome missing");
check(tikState.music>=6&&tikState.refresh&&tikState.auto,"TikDev must have music/manual refresh, without duplicate auto-refresh");
check(tikState.border==="1px","TikDev missing DedSec pointed navigation separator");
check(await tikPage.locator("#dedsec-nav #dedsec-theme,#dedsec-nav #dedsec-lang").count()===2,
 "TikDev shared top bar lacks the only theme/language controls");
await tikPage.locator("#dedsec-theme").click();
check(await tikPage.evaluate(()=>document.documentElement.dataset.theme)==="light",
 "TikDev shared theme control did not switch the site to light");
await tikPage.locator("#dedsec-lang").click();
check(await tikPage.evaluate(()=>document.documentElement.lang)==="el",
 "TikDev shared language control did not switch to Greek");
const introGr=await tikPage.locator(".intro-card .repo-description").textContent();
check(introGr.includes("Το TikDev"),"TikDev Greek intro description was not refreshed on language switch");
check((await tikPage.locator(".intro-card h1").innerText()).includes("Ανακάλυψε περισσότερα"),"TikDev Greek welcome not translated");
const bg=await tikPage.locator(".ambient-background").evaluate(el=>getComputedStyle(el).backgroundImage);
check(bg.includes("linear-gradient")&&bg.includes("starfield-light.svg"),"TikDev light-theme galaxy dimming layer missing after toggle");
const tikLayout=await tikPage.evaluate(()=>{
 const nav=document.getElementById("dedsec-nav").getBoundingClientRect();
 const controls=document.getElementById("appHeader").getBoundingClientRect();
 const feed=document.getElementById("feed").getBoundingClientRect();
 const tabs=document.querySelector(".mode-bar").getBoundingClientRect();
 const intro=document.querySelector(".intro-card .repo-title")?.getBoundingClientRect();
 const toolbar=[...document.querySelectorAll("#appHeader .tikdev-actions .icon-button")]
   .map(b=>b.getBoundingClientRect());
 return {nav:{top:nav.top,bottom:nav.bottom},controls:{top:controls.top,bottom:controls.bottom},
  feed:{top:feed.top,bottom:feed.bottom},tabs:{top:tabs.top,bottom:tabs.bottom},
  intro:intro?{width:intro.width,height:intro.height,top:intro.top,bottom:intro.bottom}:null,
  toolbar:toolbar.map(r=>({left:r.left,right:r.right,top:r.top,bottom:r.bottom})),
  overflow:document.documentElement.scrollWidth-innerWidth};
});
check(tikLayout.toolbar.length===5,"TikDev controls were lost");
check(await tikPage.locator("#appHeader .tikdev-actions").evaluate(el=>{
 const rect=el.getBoundingClientRect(),parent=document.getElementById("appHeader").getBoundingClientRect();
 return rect.top>=parent.top-1 && rect.bottom<=parent.bottom+1 && rect.left>=parent.left-1 && rect.right<=parent.right+1;
}),"TikDev control grid itself does not fit the secondary toolbar");

check(tikLayout.toolbar.every(r=>r.top>=tikLayout.controls.top-2 &&
    r.bottom<=tikLayout.controls.bottom+2 && r.bottom>r.top+35),
 "TikDev toolbar buttons clipped outside toolbar: "+JSON.stringify(tikLayout));
check(tikLayout.toolbar.every((r,i)=>i===0||r.left>=tikLayout.toolbar[i-1].right-1),
 "TikDev mobile controls overlap: "+JSON.stringify(tikLayout));
check(Math.abs(tikLayout.nav.bottom-tikLayout.controls.top)<3 &&
      Math.abs(tikLayout.controls.bottom-tikLayout.feed.top)<3 &&
      Math.abs(tikLayout.feed.bottom-tikLayout.tabs.top)<3,
 "TikDev has gaps between nav, controls, feed and tabs: "+JSON.stringify(tikLayout));
check(tikLayout.intro?.width>80&&tikLayout.intro?.height>20,
 "TikDev welcome title must still exist and be legible when revisited: "+JSON.stringify(tikLayout));
// Introduction is allowed to scroll above the feed once a repository has appeared.
// The stronger actual-repository visibility test below protects the first screen.
check(tikLayout.overflow<=2,"TikDev horizontal overflow: "+tikLayout.overflow);
const boundsAfterSnap=await tikPage.evaluate(()=>({first:document.querySelector('#feed .intro-card')?.getBoundingClientRect().height,
feed:document.getElementById('feed').getBoundingClientRect().height}));
check(Math.abs(boundsAfterSnap.first-boundsAfterSnap.feed)<3,
 "TikDev welcome must occupy the entire viewport, not shrink into adjacent repo: "+JSON.stringify(boundsAfterSnap));
const repoVisual=await tikPage.evaluate(()=>{
 const feed=document.getElementById("feed").getBoundingClientRect();
 const card=document.querySelector('#feed .feed-card[data-kind="repo"]');
 const title=card?.querySelector(".repo-title");
 const main=card?.querySelector(".repo-main");
 const actions=card?.querySelector(".repo-actions");
 const side=card?.querySelector(".side-actions");
 const rect=title?.getBoundingClientRect();
 const mr=main?.getBoundingClientRect();
 return {exists:!!card,title:title?.textContent||"",titleY:rect?.top||-1,titleH:rect?.height||0,
  mainH:mr?.height||0,feedTop:feed.top,feedBottom:feed.bottom,actionCount:actions?.querySelectorAll("button,a").length||0,
  sideCount:side?.querySelectorAll("button,a").length||0,contentPosition:main?getComputedStyle(main).position:"missing"};
});
console.log("TIKDEV_REPO_VISIBILITY "+JSON.stringify(repoVisual));
check(repoVisual.exists&&repoVisual.title==="example"&&repoVisual.mainH>100&&
 repoVisual.actionCount>=2&&repoVisual.sideCount>=4&&["relative","absolute"].includes(repoVisual.contentPosition),
 "TikDev must render the actual ZIP-compatible repository content and actions: "+JSON.stringify(repoVisual));

const originalRail=await tikPage.evaluate(()=>{
 const card=document.querySelector('#feed .feed-card[data-kind="repo"]');
 const shell=card?.querySelector('.repo-shell');
 const rail=card?.querySelector('.side-actions');
 const buttons=card?.querySelector('.repo-actions');
 if(!shell||!rail||!buttons)return null;
 const sr=shell.getBoundingClientRect(),r=rail.getBoundingClientRect(),br=buttons.getBoundingClientRect();
 const icons=[...rail.children].map(el=>{const p=el.getBoundingClientRect();return {top:p.top,bottom:p.bottom,left:p.left,right:p.right}});
 return {shell:{left:sr.left,right:sr.right,top:sr.top,bottom:sr.bottom},
 rail:{left:r.left,right:r.right,top:r.top,bottom:r.bottom,position:getComputedStyle(rail).position,direction:getComputedStyle(rail).flexDirection},
 buttons:{left:br.left,right:br.right,bottom:br.bottom,top:br.top,position:getComputedStyle(buttons).position},
 icons};
});
console.log("TIKDEV_ORIGINAL_RAIL "+JSON.stringify(originalRail));
const snapAudit=await tikPage.evaluate(()=>{const f=document.getElementById('feed'),h=f.getBoundingClientRect().height;
return {h,snap:getComputedStyle(f).scrollSnapType,kinds:[...f.querySelectorAll('.feed-card')].slice(0,3).map(c=>({kind:c.dataset.kind,height:c.getBoundingClientRect().height}))};});
check(snapAudit.snap.startsWith('y')&&snapAudit.kinds[0]?.kind==='intro'&&snapAudit.kinds.every(c=>Math.abs(c.height-snapAudit.h)<3),
 "TikDev should show exactly one full-height card per swipe: "+JSON.stringify(snapAudit));
check(originalRail?.rail.position==="absolute"&&originalRail.rail.direction==="column" &&
 originalRail.rail.right<=originalRail.shell.right+2&&originalRail.rail.left>originalRail.shell.left+100,
 "TikDev creator/stars/forks/open actions must occupy the RIGHT rail: "+JSON.stringify(originalRail));
check(originalRail?.icons.length===4 && originalRail.icons.every((v,i,a)=>i===0||v.top>=a[i-1].bottom-3),
 "TikDev four right-hand actions must stack vertically without overlap: "+JSON.stringify(originalRail));
check(originalRail?.buttons.position==="absolute" &&
 originalRail.buttons.left>=originalRail.shell.left-1&&originalRail.buttons.right<=originalRail.shell.right+1&&
 originalRail.buttons.bottom<=originalRail.shell.bottom+2,
 "README and Save must remain in a horizontal row at the BOTTOM of the project card: "+JSON.stringify(originalRail));
// The initial TikDev viewport is the welcome slide. The first repository
// must be entirely visible AFTER Start Exploring, never simultaneously.
check(Math.abs(await tikPage.evaluate(()=>document.getElementById("feed").scrollTop))<3,
 "TikDev must open on the full welcome slide");
check(await tikPage.locator("#feed .intro-card .repo-title").isVisible(),"Welcome slide title not visible");
await tikPage.locator('.intro-card [data-action="next"]').click();
await tikPage.waitForTimeout(750);
const afterFirstSwipe=await tikPage.evaluate(()=>{
 const feed=document.getElementById("feed"),h=feed.clientHeight;
 const cards=[...feed.querySelectorAll(".feed-card")];
 const card=cards[1],shell=card?.querySelector(".repo-shell");
 const buttons=card?.querySelector(".repo-actions")?.getBoundingClientRect();
 const side=card?.querySelector(".side-actions")?.getBoundingClientRect();
 const repo=card?.getBoundingClientRect();
 const headline=card?.querySelector(".repo-title")?.getBoundingClientRect();
 const controls=[...card.querySelectorAll(".side-actions > *")].map(c=>c.getBoundingClientRect());
 return {scroll:feed.scrollTop,height:h,count:cards.length,
   cardTop:repo?.top,cardBottom:repo?.bottom,feedTop:feed.getBoundingClientRect().top,
   titleTop:headline?.top, titleBottom:headline?.bottom,
   controlsInside:controls.every(r=>r.top>=repo.top-1&&r.bottom<=repo.bottom+1),
   sideBottom:side?.bottom,sideTop:side?.top,
   buttonsBottom:buttons?.bottom,buttonsTop:buttons?.top,
   snap:getComputedStyle(feed).scrollSnapType,
   visibleRepos:cards.filter(c=>c.dataset.kind==="repo"&&(()=>{const r=c.getBoundingClientRect(),f=feed.getBoundingClientRect();return r.top>=f.top-2&&r.top<f.bottom-2})()).length};
});
console.log("TIKDEV_ONE_SCREEN "+JSON.stringify(afterFirstSwipe));
check(Math.abs(afterFirstSwipe.scroll-afterFirstSwipe.height)<5&&
 afterFirstSwipe.visibleRepos===1&&afterFirstSwipe.controlsInside&&
 afterFirstSwipe.buttonsBottom<=afterFirstSwipe.cardBottom+2&&
 afterFirstSwipe.titleTop>=afterFirstSwipe.feedTop,
 "TikDev must snap to precisely one usable repo slide: "+JSON.stringify(afterFirstSwipe));
check(await tikPage.locator('#feed [data-kind="repo"] .repo-title').isVisible(),
 "Start exploring must reveal an actual repository");

await tikPage.screenshot({path:path.join(dir,"tikdev-mobile.png")});
check(await tikPage.locator('.page-back').count()===1,'TikDev Back missing after feed updates');
await tikPage.close();

// User-facing controls and smart search: bilingual, both themes, mobile + desktop.
for(const locale of ['en','gr'])for(const light of [false,true])for(const width of [390,1280]){
 const page=await browser.newPage({viewport:{width,height:844}});
 await page.context().grantPermissions(['clipboard-read','clipboard-write']);
 await page.addInitScript(({locale,light})=>{localStorage.setItem('dedsec:language',JSON.stringify(locale));localStorage.setItem('dedsec:theme',JSON.stringify(light?'light':'dark'));localStorage.setItem('dedsec:cookie-choice','decline');},{locale,light});
 page.on('pageerror',e=>faults.push('controls '+e.message));
 await page.goto(base+'index.html',{waitUntil:'domcontentloaded'});
 await page.locator('.desktop-home').waitFor();
 check(await page.locator('.page-back').count()===0,'Home must not have Back');
 const centered=await page.evaluate(()=>[...document.querySelectorAll('.app-grid')].every(grid=>{
  const rows=new Map();for(const tile of grid.children){const r=tile.getBoundingClientRect(),key=Math.round(r.top);if(!rows.has(key))rows.set(key,[]);rows.get(key).push(r);}
  const box=grid.getBoundingClientRect();return [...rows.values()].filter(row=>row.length<3).every(row=>Math.abs((row[0].left+row.at(-1).right)/2-(box.left+box.right)/2)<3);
 }));check(centered,'Short launcher rows not centered '+width);
 const stationary=await page.evaluate(()=>{window.scrollTo(0,500);return getComputedStyle(document.body).backgroundAttachment.split(',').every(v=>v.trim()==='fixed')&&getComputedStyle(document.body,'::after').animationName==='none';});check(stationary,'Galaxy must stay fixed');
 await page.locator('#nav-search').click();
 await page.locator('#searchInput').fill('lang:en in:title "SQLite live backup"');
 await page.locator('.result-card').first().waitFor({timeout:15000});
 check(await page.locator('.result-card').count()===1,'Exact phrase search must isolate the authored backup lesson');
 await page.locator('.result-card').click();
 await page.locator('.lesson-copy').first().waitFor();
 check(await page.getByText('Share / Preview',{exact:true}).count()===0,'Share/Preview should be absent');
 const expected=await page.locator('.lesson-content pre code').first().textContent();
 await page.locator('.lesson-copy').first().click();
 check(await page.evaluate(()=>navigator.clipboard.readText())===expected,'Lesson Copy must preserve exact code');
 const geometry=await page.locator('.page-back').evaluate(b=>{const r=b.getBoundingClientRect(),h=document.getElementById('app').getBoundingClientRect();return r.left>h.left+h.width/2&&r.top<document.querySelector('.page-heading').getBoundingClientRect().top;});check(geometry,'Lesson Back must be top right');
 check(await page.locator('.lesson-copy').count()===await page.locator('.lesson-content pre code').count(),'Exactly one Copy per code fence');
 if(locale==='en'&&!light&&width===390){
  await page.evaluate(()=>{Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:()=>Promise.reject(new Error('fixture denial'))}});});
  await page.locator('.lesson-copy').first().click();
  check((await page.locator('.lesson-copy').first().innerText())==='Copied','Clipboard fallback failed');
  await page.evaluate(()=>{document.execCommand=()=>false;});
  await page.locator('.lesson-copy').first().click();
  check((await page.locator('.lesson-copy').first().innerText())==='Copy failed','Clipboard failure falsely reported success');
 }

 await page.locator('.page-back').click();
 await page.waitForTimeout(100);
 check(!page.url().includes('#read:'),'Back must leave reader');
 if(!await page.locator('#searchInput').isVisible())await page.locator('#nav-search').click();
 await page.locator('#searchInput').fill('lang:en in:title restoraton');await page.locator('.result-card').first().waitFor({timeout:15000});
 check(await page.locator('.result-card').count()>0,'Title typo recovery missing');
 await page.locator('#searchInput').fill('lang:en backup -SQLite');await page.waitForTimeout(250);
 check(await page.locator('.result-card').evaluateAll(nodes=>nodes.every(n=>!n.querySelector('strong').textContent.includes('SQLite'))),'Excluded term remained');
 check(await page.locator('#site-footer a').filter({hasText:/^Main Website$|^Κύρια Ιστοσελίδα$/}).count()===0,'Main Website footer button remains');
 await page.close();
}
for(const url of ['dedsec/Pages/faq.html','dedsec/el/Pages/faq.html','../.site-publish/dedsec/Pages/faq.html','../.site-publish/learn/el/fieldnotes-el-34.html']){
 const page=await browser.newPage({viewport:{width:390,height:844}});await page.goto(base+url,{waitUntil:'domcontentloaded'});
 await page.locator('.page-back').waitFor();check(await page.locator('.page-back').count()===1&&await page.locator('.page-home').count()===1,url+' needs one Home and one Back');
 check(await page.locator('.page-back-row').evaluate(row=>{const home=row.querySelector('.page-home'),back=row.querySelector('.page-back');return home.getBoundingClientRect().left<back.getBoundingClientRect().left&&parseFloat(getComputedStyle(back).borderTopWidth)>=1;}),url+' Home/Back order or border');
 check(await page.locator('.page-back').evaluate(b=>b.getBoundingClientRect().left>innerWidth/2),url+' Back should be on right');
 if(url.includes('/learn/'))check(await page.locator('.lesson-copy').count()===1,url+' preview Copy missing');
 await page.close();
}



async function auditStartup(){
// Wait for the final basic-page download, then reopen the basic page offline.
const cached=await browser.newPage({viewport:{width:390,height:844}});
await cached.addInitScript(()=>localStorage.setItem('dedsec:cookie-choice','decline'));
let releaseCache,cacheRequested;const cacheGate=new Promise(r=>{releaseCache=r;}),cacheRequest=new Promise(r=>{cacheRequested=r;});
await cached.context().route('**/dedsec/Pages/faq.html',async route=>{cacheRequested();await cacheGate;await route.continue();});
await cached.goto('http://127.0.0.1:8765/.site-publish/index.html',{waitUntil:'domcontentloaded'});
await cacheRequest;
check(await cached.evaluate(()=>window.__DEDSEC_BOOT__.status==='loading'&&window.__DEDSEC_BOOT__.value<100),'Loader released before its subpage cache completed');
releaseCache();await cached.waitForFunction(()=>window.__DEDSEC_BOOT__?.status==='ready',null,{timeout:20000});
check(await cached.evaluate(()=>window.__DEDSEC_BOOT__.cache.status==='complete'),'Complete website cache not reported');
await cached.context().unroute('**/startup-manifest.json');await cached.context().unroute('**/dedsec/Pages/faq.html');await cached.context().setOffline(true);
await cached.goto('http://127.0.0.1:8765/.site-publish/dedsec/Pages/faq.html',{waitUntil:'domcontentloaded'});
await cached.waitForFunction(()=>window.__DEDSEC_BOOT__?.status==='ready',null,{timeout:20000});
check(await cached.locator('main').innerText().then(t=>t.length>300),'Cached subpage did not open offline');
await cached.close();
// Homepage readiness is independent of even a stalled knowledge database.
const basic=await browser.newPage({viewport:{width:390,height:844}});
const eager=[];basic.on('request',r=>{if(/\/data\/[^/]+\.js/.test(r.url()))eager.push(r.url());});
await basic.goto(base+'index.html',{waitUntil:'domcontentloaded'});
await basic.waitForFunction(()=>window.__DEDSEC_BOOT__?.status==='ready');
check(eager.length===0,'Homepage requested knowledge/search database: '+eager.join(','));
check(await basic.locator('.home-trust').isVisible(),'Basic homepage not ready without knowledge');
await basic.close();
// Search returns complete public paragraphs, preserves query operators, and
// deep-links to a marked, visible destination even inside an accordion.
const found=await browser.newPage({viewport:{width:390,height:844}});
await found.addInitScript(()=>localStorage.setItem('dedsec:cookie-choice','decline'));
await found.goto(base+'index.html',{waitUntil:'domcontentloaded'});
await found.waitForFunction(()=>window.__DEDSEC_BOOT__?.status==='ready');
await found.locator('#nav-search').click();await found.locator('#searchInput').fill('lang:en type:page "storage permission"');
await found.waitForTimeout(250);
const first=found.locator('.result-card').first();const passage=await first.locator('p').innerText();
check(passage.length>30&&!passage.startsWith('…')&&!passage.endsWith('…'),'Search passage is cut off');
check((await first.getAttribute('href')).includes('find='),'Search destination lacks passage locator');
await first.click();await found.waitForFunction(()=>window.__DEDSEC_BOOT__?.status==='ready');
await found.locator('mark.search-hit').first().waitFor();
check(await found.locator('mark.search-hit').first().isVisible(),'Search destination passage is not highlighted and revealed');
check(await found.locator('mark.search-hit').first().evaluate(m=>getComputedStyle(m).backgroundColor==='rgb(255, 224, 102)'),'Search highlight color is missing');
const hitTop=await found.locator('mark.search-hit').first().evaluate(m=>m.getBoundingClientRect().top);
check(hitTop>=80&&hitTop<700,'Search destination did not scroll below the navbar');
await found.goto(base+'index.html',{waitUntil:'domcontentloaded'});await found.waitForFunction(()=>window.__DEDSEC_BOOT__?.status==='ready');
await found.locator('#nav-search').click();await found.locator('#searchInput').fill('lang:en type:lesson "decrease-key operation"');await found.waitForTimeout(250);
await found.locator('.result-card').first().waitFor({timeout:15000});
check(await found.locator('.result-card').count()>0,'Lesson body text search failed');
await found.locator('.result-card').first().click();await found.locator('.lesson-content mark.search-hit').first().waitFor();
check(await found.locator('.lesson-content mark.search-hit').first().isVisible(),'SPA lesson passage was not highlighted');
await found.close();

// First successful startup is remembered per tab/scope, never private profile data.
{
 const p=await browser.newPage({viewport:{width:390,height:844}});
 await p.goto(base+'index.html',{waitUntil:'networkidle'});await p.waitForFunction(()=>window.__DEDSEC_BOOT__?.status==='ready');
 let unblock;const release=new Promise(resolve=>{unblock=resolve;});
 await p.route('**/assets/refinement.css',async route=>{await release;await route.continue();});
 await p.goto(base+'dedsec/Pages/faq.html',{waitUntil:'commit'});
 await p.waitForFunction(()=>Boolean(window.__DEDSEC_BOOT__));
 check(await p.evaluate(()=>window.__DEDSEC_BOOT__.presentation==='background'&&!document.documentElement.classList.contains('site-loading')&&!document.getElementById('site-loader')),'Navigation showed another full-screen loader');
 unblock();await p.waitForFunction(()=>window.__DEDSEC_BOOT__?.status==='ready');
 await p.reload({waitUntil:'networkidle'});check(await p.evaluate(()=>!document.documentElement.classList.contains('site-loading')&&!document.getElementById('site-loader')),'Reload repeated the successful splash');
 await p.close();
}

// Slow critical resources keep the loader visible until the page can be used.
for(const locale of ['en','gr'])for(const theme of ['dark','light']){
 const p=await browser.newPage({viewport:{width:390,height:844}});
 await p.addInitScript(({locale,theme})=>{localStorage.setItem('dedsec:language',JSON.stringify(locale));localStorage.setItem('dedsec:theme',JSON.stringify(theme));localStorage.setItem('dedsec:cookie-choice','decline');},{locale,theme});
 let unblock;const release=new Promise(resolve=>{unblock=resolve;});
 await p.route('**/assets/ui.js',async route=>{await release;await route.continue();});
 await p.goto(base+'index.html',{waitUntil:'commit'});
 await p.locator('#site-loader img').waitFor();
 const before=await p.evaluate(()=>({value:window.__DEDSEC_BOOT__.value,status:window.__DEDSEC_BOOT__.status,
  logo:document.querySelector('#site-loader img').getBoundingClientRect().toJSON(),
  bar:document.querySelector('#site-loader .startup-meter').getBoundingClientRect().toJSON(),
  gradient:getComputedStyle(document.querySelector('.startup-fill')).backgroundImage,
  text:document.querySelector('#site-loader').textContent}));
 check(before.status==='loading'&&before.value<100,'Loader reports ready while critical data is blocked');
 check(Math.abs((before.logo.left+before.logo.width/2)-195)<3&&before.bar.top>=before.logo.bottom,'Loader logo/bar must be centered and vertically ordered');
 check(before.gradient.includes('gradient'),'Loader progress needs the requested color gradient');
 check(await p.locator('#site-loader .startup-number').evaluate(el=>getComputedStyle(el).display==='none'),'Loader percentage text must be hidden');
 check(await p.locator('#site-loader .startup-status').evaluate(el=>el.getBoundingClientRect().height<=1),'Loader status text must be screen-reader only');
 check(locale==='gr'?before.text.includes('Φόρτωση'):before.text.includes('Loading'),'Loader localization missing');
 // Playwright screenshots await document.fonts.ready, which can itself wait for
 // the deliberately blocked deferred script. Capture this pre-ready frame with
 // Chromium's screenshot command so the fixture does not deadlock its own gate.
 const capture=await p.context().newCDPSession(p);
 const frame=await capture.send('Page.captureScreenshot',{format:'png'});
 fs.writeFileSync(path.join(dir,'startup-'+locale+'-'+theme+'.png'),Buffer.from(frame.data,'base64'));
 await capture.detach();
 unblock();await p.waitForFunction(()=>window.__DEDSEC_BOOT__?.status==='ready',null,{timeout:15000});
 check(await p.evaluate(()=>window.__DEDSEC_BOOT__.value===100&&!document.documentElement.classList.contains('site-loading')),'Readiness must reach 100 and unlock the page');
 await p.locator('#nav-search').click();await p.locator('#searchInput').fill('lang:en type:page "ButSystem.py"');
 await p.waitForTimeout(250);
 await p.locator('.result-card').first().waitFor({timeout:15000});
 const hits=await p.locator('.result-card').evaluateAll(nodes=>nodes.map(n=>({href:n.getAttribute('href'),text:n.textContent})));
 check(hits.some(x=>x.href.includes('learn-about-the-tools')||x.href.includes('but-system')),'Full-site search misses tool-page body content');
 check(hits.every(x=>!x.href.startsWith('#read:')),'type:page incorrectly returns lesson records');
 await p.locator('#searchInput').fill('lang:en type:page "storage permission"');await p.waitForTimeout(250);
 check(await p.locator('.result-card').count()>0,'Full-site search misses installation/Assistance content');
 await p.close();
}
// A late-inserted theme stylesheet is part of readiness, even after DOM ready.
const stylePage=await browser.newPage({viewport:{width:390,height:844}});
let releaseStyle;const pendingStyle=new Promise(resolve=>{releaseStyle=resolve;});
await stylePage.route('**/assets/refinement.css',async route=>{await pendingStyle;await route.continue();});
await stylePage.goto(base+'dedsec/Pages/faq.html',{waitUntil:'domcontentloaded'});
await stylePage.waitForTimeout(2200);
check(await stylePage.evaluate(()=>window.__DEDSEC_BOOT__?.status==='loading'&&window.__DEDSEC_BOOT__.resources<1&&document.documentElement.classList.contains('site-loading')),'Loader released a page with its theme stylesheet still pending');
releaseStyle();await stylePage.waitForFunction(()=>window.__DEDSEC_BOOT__?.status==='ready',null,{timeout:15000});
await stylePage.close();
// A critical resource failure has an honest visible escape path, not a fake 100%.
const failurePage=await browser.newPage({viewport:{width:390,height:844}});
await failurePage.route('**/assets/ui.js',route=>route.abort('failed'));
await failurePage.goto(base+'index.html',{waitUntil:'domcontentloaded'});
await failurePage.waitForFunction(()=>window.__DEDSEC_BOOT__?.status==='failed');
check(await failurePage.getByRole('button',{name:'Retry',exact:true}).isVisible(),'Missing retry after load failure');
check(await failurePage.evaluate(()=>window.__DEDSEC_BOOT__.value<100),'Failed loader must not display 100%');
await failurePage.getByRole('button',{name:'Continue to page',exact:true}).click();
check(await failurePage.evaluate(()=>!document.documentElement.classList.contains('site-loading')),'Continue must release failed overlay');
await failurePage.close();
// Search entry points from imported pages open the global website search.
const entry=await browser.newPage();
await entry.goto(base+'dedsec/Pages/faq.html',{waitUntil:'domcontentloaded'});
await entry.waitForFunction(()=>window.__DEDSEC_BOOT__?.status==='ready');
await entry.locator('#merged-search').click();
await entry.waitForFunction(()=>window.__DEDSEC_BOOT__?.status==='ready');
check(await entry.locator('#searchInput').isVisible(),'Imported-page Search does not open the global search field');
await entry.close();
// Public-root aliases ship the same control script at a different directory depth.
const alias=await browser.newPage();
const badAssets=[];alias.on('response',r=>{if(r.status()>=400)badAssets.push(r.url()+' '+r.status());});
alias.on('pageerror',e=>console.log('ALIAS_JS_ERROR '+e.message));
await alias.goto('http://127.0.0.1:8765/.site-publish/Pages/faq.html',{waitUntil:'networkidle'});
console.log('ALIAS_BOOT '+JSON.stringify(await alias.evaluate(()=>({boot:window.__DEDSEC_BOOT__,cookies:!!window.DedSecCookies,scripts:[...document.scripts].map(x=>x.src)}))));
await alias.waitForFunction(()=>window.__DEDSEC_BOOT__?.status==='ready'&&!!window.DedSecCookies,null,{timeout:15000}).catch(async error=>{console.log('ALIAS_FAILURE '+JSON.stringify({badAssets,state:await alias.evaluate(()=>({boot:window.__DEDSEC_BOOT__,cookies:!!window.DedSecCookies,title:document.title}))}));throw error;});
check(badAssets.length===0,'Public-root alias consent asset escaped the deployment root');
await alias.close();
}



// Owner-requested Others, preservation inventory and public project disclosure.
for(const locale of ['en','gr']){
 const p=await browser.newPage({viewport:{width:320,height:844}});
 await p.addInitScript(l=>{localStorage.setItem('dedsec:language',JSON.stringify(l));localStorage.setItem('dedsec:cookie-choice','decline');},locale);
 await p.goto(base+'index.html',{waitUntil:'networkidle'});
 check(await p.locator('.launcher-settings h2').innerText()===(locale==='gr'?'Άλλα.':'Others.'),'Others heading translation');
 check(await p.locator('.launcher-settings .app-icon-btn').count()===2,'Only cookies and preservation launchers remain');
 if(locale==='en')check(await p.locator('a[href="dedsec/Pages/about-founder.html"] .app-label').innerText()==="Founder's story and project vision",'Sentence case preserves brands without capitalizing generic project');
 const geometry=await p.locator('.launcher-settings .app-grid').evaluate(grid=>{const items=[...grid.children].map(x=>x.getBoundingClientRect());const r=grid.getBoundingClientRect();return Math.abs((items[0].left+items[items.length-1].right)/2-(r.left+r.right)/2)<4;});
 check(geometry,'Others icon row should be centered');
 const prefix=locale==='gr'?'dedsec/el/Pages/':'dedsec/Pages/';
 await p.route('https://raw.githubusercontent.com/dedsec1121fk/Save-DedSec-Project/main/README.md',r=>r.abort());
 await p.goto(base+prefix+'save-dedsec-project.html',{waitUntil:'networkidle'});
 const links=await p.locator('#save-archive-links a').evaluateAll(xs=>xs.map(x=>x.href));
 check(links.length===42&&new Set(links).size===42,'Bundled archive inventory unique/complete');
 check((await p.locator('#save-links-status').innerText()).includes(locale==='gr'?'αποθηκευμένα':'bundled'),'Honest offline archive fallback');
 await p.goto(base+prefix+'about-founder.html',{waitUntil:'networkidle'});
 const projects=p.locator('#other-projects details');
 check(await projects.count()===1&&!await projects.evaluate(x=>x.open),'Other projects closed by default');
 check(await projects.locator('li a').count()===11,'All public GitHub projects');
 await projects.locator('summary').click();
 check(await projects.locator('li p').first().isVisible(),'Project descriptions visible on expansion');
 await p.close();
}


// Disconnected account template: no credentials sent, real UTF-8 TXT/ZIP operations.
for(const [locale,theme,width] of [['en','dark',320],['gr','light',320],['gr','dark',390],['en','light',1280]]){
 const p=await browser.newPage({viewport:{width,height:844}});const errors=[],api=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('request',r=>{if(r.url().includes('/api/account/'))api.push(r.method());});
 await p.addInitScript(({locale,theme})=>{localStorage.setItem('dedsec:language',JSON.stringify(locale));localStorage.setItem('dedsec:theme',JSON.stringify(theme));localStorage.setItem('dedsec:cookie-choice','decline');},{locale,theme});
 const prefix=locale==='gr'?'dedsec/el/Pages/':'dedsec/Pages/';
 await p.goto(base+prefix+'account.html',{waitUntil:'networkidle'});
 check(await p.locator('[data-account-panel]').evaluateAll(xs=>xs.every(x=>x.hidden)),'Account forms must start closed');
 await p.locator('[data-account-tab="account-register-panel"]').click();
 check(await p.locator('#account-terms').count()===0,'Account terms dropdown was not moved to privacy');
 const stats=await p.locator('.account-stat').evaluateAll(items=>items.map(el=>el.getBoundingClientRect().top));check(stats.length===2&&Math.abs(stats[0]-stats[1])<2,'Account counters must share one row');
 check(await p.locator('[name=age]').count()===0&&await p.locator('[name=date-of-birth]').count()===1,'Registration must derive age from date of birth');
 check(await p.locator('.account-terms-copy a').getAttribute('href')==='privacy-policy.html#account-privacy','Terms must link to privacy policy');
 const termsGeometry=await p.locator('.account-check').evaluate(label=>{const box=label.querySelector('input').getBoundingClientRect(),copy=label.querySelector('.account-terms-copy').getBoundingClientRect();return {box:box.width,height:box.height,text:copy.width,right:copy.right,viewport:innerWidth,labelHeight:label.getBoundingClientRect().height};});
 check(termsGeometry.box<=24&&termsGeometry.height<=24&&termsGeometry.text>120&&termsGeometry.right<=termsGeometry.viewport&&termsGeometry.labelHeight<200,'Terms checkbox/text geometry broken '+JSON.stringify(termsGeometry));
 check(await p.locator('#account-register-panel input').evaluateAll(xs=>xs.every(x=>x.matches(':disabled'))),'Account template must not accept personal details/passwords');
 check(await p.locator('#account-active-count').innerText()==='— / 444'&&await p.locator('#account-registered-count').innerText()==='— / 300','Disconnected counters must be unknown');
 await p.locator('[data-account-tab="account-login-panel"]').click();check(await p.locator('#account-login-panel').isVisible()&&!await p.locator('#account-register-panel').isVisible(),'Sign-in must show only its own form');
 await p.locator('#account-demo-start').click();check(await p.locator('#account-profile').isVisible(),'TXT preview did not open');
 const create=async(name,kind)=>{await p.locator('#account-fab').click();await p.locator(kind==='folder'?'#account-new-folder':'#account-new-file').click();await p.locator('#account-name').fill(name);await p.locator('#account-dialog-confirm').click();};
 await create('Σημειώσεις','folder');await p.locator('.account-open').filter({hasText:'Σημειώσεις'}).click();await create('Πρώτο','file');
 const content='Αυτή είναι μια σημείωση.\n<script>window.badNote=true</script>\nLine two.';
 await p.locator('#account-editor').fill(content);await p.locator('#account-save').click();
 check(await p.locator('#account-current-file').innerText()==='Σημειώσεις/Πρώτο.txt','TXT filename spelling changed');
 check(await p.evaluate(()=>window.badNote===undefined),'Note content executed as HTML');
 const pin=p.locator('.account-pin');await pin.click();check(await p.locator('#account-pins button').count()===1,'Existing TXT pin failed');
 await p.locator('#account-files input[type=checkbox]').check();
 let downloadPromise=p.waitForEvent('download');await p.locator('#account-export').click();let download=await downloadPromise;
 check(download.suggestedFilename()==='Πρώτο.txt','Single selection must export TXT');
 check(fs.readFileSync(await download.path(),'utf8')===content,'TXT export changed user text');
 if(locale==='en'&&width===320){const used=await p.locator('#account-usage').innerText();await p.locator('#account-editor').fill('x'.repeat(900001));await p.locator('#account-save').click();check(await p.locator('#account-usage').innerText()===used,'Failed quota save changed stored usage');check(await p.locator('#account-editor').inputValue().then(x=>x.length===900001),'Quota failure discarded edits');await p.locator('#account-editor').fill(content);await p.locator('#account-save').click();}
 await p.locator('#account-root').click();await p.locator('.account-pin').click();check(await p.locator('#account-pins button').count()===2,'Folder pin failed');
 await create('second','file');await p.locator('#account-editor').fill('Second note');await p.locator('#account-save').click();
 await p.locator('#account-file-input').setInputFiles({name:'εισαγωγή.txt',mimeType:'text/plain',buffer:Buffer.from('Imported ελληνικό κείμενο')});
 await p.locator('.account-open').filter({hasText:'εισαγωγή.txt'}).waitFor();
 downloadPromise=p.waitForEvent('download');await p.locator('#account-export-all').click();download=await downloadPromise;
 check(download.suggestedFilename().endsWith('.zip'),'Multiple files/folders must export ZIP');
 const {execFileSync}=await import('node:child_process');
 execFileSync('python3',['-c',"import zipfile,sys\nwith zipfile.ZipFile(sys.argv[1]) as z:\n assert z.testzip() is None\n assert set(z.namelist())=={'Σημειώσεις/','Σημειώσεις/Πρώτο.txt','second.txt','εισαγωγή.txt'}\n assert z.read('Σημειώσεις/Πρώτο.txt').decode('utf8')==sys.argv[2]\n assert z.read('εισαγωγή.txt').decode('utf8')=='Imported ελληνικό κείμενο'",await download.path(),content]);
 check(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Account workspace horizontal overflow '+locale+' '+width);
 await p.screenshot({path:path.join(dir,`account-${locale}-${theme}-${width}.png`),fullPage:false});
 check(await p.locator('#account-active-count').innerText()==='— / 444','Preview must not increment real counters');
 check(await p.locator('#account-profile section').last().locator('button').isDisabled(),'Missing sponsor scripts must not be downloadable');
 await p.locator('#account-demo-exit').click();await p.locator('#account-dialog-confirm').click();check(!await p.locator('#account-profile').isVisible(),'Discard preview failed');
 await p.locator('#account-demo-start').click();check(await p.locator('#account-files input').count()===0,'Discarded TXT data survived preview reset');
 check(api.length===0,'Unconfigured template made backend requests');check(errors.length===0,'Account template JS errors '+JSON.stringify(errors));
 check(await p.evaluate(()=>Object.keys(localStorage).every(k=>!/^dedsec:(account|note|password)/i.test(k))),'Account preview persisted private data');
 await p.close();
}


await browser.close();
fs.writeFileSync(path.join(dir,"audit.json"),JSON.stringify({audits:all,failures:faults},null,2));
for(const x of all){
 console.log("BROWSER_AUDIT "+JSON.stringify({
  view:x.view,bodyClasses:x.bodyClasses,nav:x.nav.map(v=>({id:v.id,color:v.color,iconColor:v.iconColor,bg:v.bg,width:v.width})),
  panels:x.probes.map(v=>({className:v.className,bg:v.bg,image:v.image})),
  cookie:x.cookie,trustWidth:x.trust?.width,description:x.description?.length,heading:x.heading,subtitle:x.subtitle,lessonSamples:x.lessonSamples?.length,scrollWidth:x.scrollWidth
 }));
}
if(faults.length){console.error("BROWSER_FAILURES "+JSON.stringify(faults));process.exitCode=1;}
else console.log("CHROMIUM_SMOKE_PASS: "+all.length+" viewports, screenshots and computed CSS attached");


