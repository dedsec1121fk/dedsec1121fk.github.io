import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('/tmp/dedsec-browser/node_modules/playwright-core');
const binary=[process.env.CHROME_PATH,'/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium','/usr/bin/chromium-browser'].filter(Boolean).find(existsSync);
assert(binary,'Chromium is required');
const browser=await chromium.launch({executablePath:binary,headless:true,args:['--no-sandbox','--disable-gpu']});
const tid='a'.repeat(24),pid='b'.repeat(24),date='2026-11-16T10:00:00.000Z';
const categories=[
 {slug:'announcements',group_slug:'community',title_en:'Announcements',title_el:'Ανακοινώσεις',description_en:'News',description_el:'Νέα',sections:1,topics:0,posts:0},
 {slug:'development',group_slug:'programming',title_en:'Programming',title_el:'Προγραμματισμός',description_en:'Programming',description_el:'Προγραμματισμός',sections:1,topics:0,posts:0}
];
const sections={
 announcements:[{slug:'news',category_slug:'announcements',title_en:'News',title_el:'Νέα',description_en:'News',description_el:'Νέα',topics:0,posts:0}],
 development:[{slug:'python',category_slug:'development',title_en:'Python',title_el:'Python',description_en:'Python',description_el:'Python',topics:0,posts:0}]
};
for(const width of [390,1280]){
 const context=await browser.newContext({viewport:{width,height:850}});
 let logged=false,topic=null;const errors=[];
 await context.addInitScript(()=>{window.DEDSEC_FORUM_LIVE=true;});
 await context.route('**/assets/boot.js*',route=>route.fulfill({status:200,contentType:'application/javascript',body:''}));
 await context.route('**/api/forum/**',async route=>{
  const req=route.request(),url=new URL(req.url()),path=url.pathname.split('/api/forum/')[1];
  const category=categories.find(c=>c.slug===url.searchParams.get('category'));
  const section=sections.development[0];let data={},status=200;
  if(path==='me')data=logged?{signedIn:true,handle:'MockMember',userId:'member1',csrf:'csrfmock'}:{signedIn:false};
  else if(path==='categories')data={categories};
  else if(path==='sections')data={category,sections:sections[category?.slug]||[]};
  else if(path==='login'){
   assert.equal(req.postDataJSON().handle,'MockMember');
   logged=true;data={signedIn:true,handle:'MockMember',userId:'member1',csrf:'csrfmock'};
  }else if(path==='new-topic'){
   assert.equal(req.headers()['x-csrf-token'],'csrfmock');
   topic=req.postDataJSON();assert.equal(topic.section,'python');
   data={id:tid,postId:pid,tags:['python','generator']};status=201;
  }else if(path==='topics')data={
   section:{...section,category_en:'Programming',category_el:'Προγραμματισμός'},
   topics:topic?[{id:tid,title:topic.title,section_slug:'python',created_at:date,updated_at:date,author:'MockMember',replies:0,tags:'python|generator'}]:[],
   total:topic?1:0,page:1,pages:1
  };
  else if(path==='topic')data={
   topic:{id:tid,title:topic?.title||'Mock topic',section_slug:'python',category_slug:'development',category_en:'Programming',category_el:'Προγραμματισμός',section_en:'Python',section_el:'Python',created_at:date,updated_at:date,tags:['python','generator'],locked:0},
   posts:[{id:pid,author:'MockMember',author_id:'member1',created_at:date,body:topic?.body||'Mock body',deleted:0}],total:1,page:1,pages:1
  };
  else {status=404;data={error:'not_found'};}
  await route.fulfill({status,contentType:'application/json',body:JSON.stringify(data)});
 });
 const page=await context.newPage();page.on('pageerror',e=>errors.push(String(e)));
 await page.goto('http://127.0.0.1:8765/DedSec-Project-Website/forum.html',{waitUntil:'domcontentloaded'});
 await page.locator('#forum-auth [data-action=login]').waitFor({timeout:15000});
 assert.equal(await page.locator('[data-action=new-topic]').count(),0);
 await page.locator('#forum-auth [data-action=login]').click();
 await page.locator('#forum-live-dialog input[name=handle]').fill('MockMember');
 await page.locator('#forum-live-dialog input[name=password]').fill('verylongmockpassword');
 await page.locator('#forum-live-form button[type=submit]').click();
 await page.locator('#forum-auth [data-action=logout]').waitFor({timeout:10000});
 await page.locator('[data-action=new-topic]').first().click();
 await page.locator('#forum-new-category').selectOption('development');
 await page.locator('#forum-new-section option[value=python]').waitFor({timeout:8000});
 await page.locator('#forum-new-section').selectOption('python');
 await page.locator('#forum-live-dialog input[name=title]').fill('Python generators and iterators');
 await page.locator('#forum-live-dialog textarea[name=body]').fill('How can I yield values from a Python generator?');
 await page.locator('#forum-live-form button[type=submit]').click();
 await page.waitForURL('**/forum/topic/'+tid,{timeout:10000});
 assert.equal(await page.locator('.thread-header a.forum-tag').count(),2);
 await page.locator('.forum-breadcrumbs a[href="/forum/section/python"]').click();
 await page.locator('a.forum-thread-row').waitFor({timeout:10000});
 assert.equal(await page.locator('a.forum-thread-row a').count(),0);
 assert.equal(await page.locator('a.forum-thread-row span.forum-tag').count(),2);
 await page.locator('a.forum-thread-row').click();
 await page.waitForURL('**/forum/topic/'+tid,{timeout:10000});
 assert(topic);
 assert.equal(errors.length,0,errors.join('; '));
 await context.close();
}
await browser.close();
console.log('FORUM_E2E_MOCK_OK: sign-in, new topic, automatic tags and topic navigation, mobile and desktop');
