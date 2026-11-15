import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import worker from '../forum-worker/worker.mjs';
const db=new DatabaseSync(':memory:');
db.exec(readFileSync(new URL('../forum-worker/schema.sql',import.meta.url),'utf8'));
db.exec(readFileSync(new URL('../forum-worker/migrations/0002_expand_community.sql',import.meta.url),'utf8'));
db.exec(readFileSync(new URL('../forum-worker/migrations/0003_topic_tags.sql',import.meta.url),'utf8'));
class Statement {
 constructor(sql,args=[]){this.sql=sql;this.args=args;}
 bind(...args){return new Statement(this.sql,args);}
 async first(){return db.prepare(this.sql).get(...this.args)||null;}
 async all(){return {results:db.prepare(this.sql).all(...this.args)};}
 async run(){return {meta:db.prepare(this.sql).run(...this.args)};}
}
const env={
 DB:{prepare:sql=>new Statement(sql),async batch(batch){
  db.exec('BEGIN');
  try{for(const statement of batch)await statement.run();db.exec('COMMIT');}
  catch(error){db.exec('ROLLBACK');throw error;}
 }},
 RATE_SECRET:'testing-only-secret-not-for-production-123456789'
};
const ORIGIN='https://forum.example.test',prefix=ORIGIN+'/api/forum/';
async function request(path,{method='GET',body,cookie,csrf,origin=ORIGIN}={}){
 const headers={'Accept':'application/json'};
 if(method!=='GET')headers.Origin=origin;
 if(body!==undefined)headers['Content-Type']='application/json';
 if(cookie)headers.Cookie=cookie;
 if(csrf)headers['X-CSRF-Token']=csrf;
 const r=await worker.fetch(new Request(prefix+path,{method,headers,body:body!==undefined?JSON.stringify(body):undefined}),env);
 return {status:r.status,data:await r.json(),cookie:r.headers.get('Set-Cookie')?.split(';')[0],
  cors:r.headers.get('Access-Control-Allow-Origin')};
}
const categories=await request('categories');
assert.equal(categories.status,200);
assert.equal(categories.data.categories.length,52);
assert.equal(new Set(categories.data.categories.map(x=>x.group_slug)).size,8);
assert.equal(categories.cors,'https://ded-sec.space');
assert.equal(db.prepare('SELECT count(*) n FROM forum_sections').get().n,208);
assert.equal(db.prepare('SELECT count(*) n FROM forum_category_group_map').get().n,52);
const listing=await request('sections?category=development');
assert.equal(listing.status,200);
assert.equal(listing.data.category.slug,'development');
assert.equal(listing.data.sections.length,4);
assert(listing.data.sections.some(x=>x.slug==='python'));
assert.equal((await request('sections?category=does-not-exist')).status,404);
const section=await request('topics?section=python');
assert.equal(section.status,200);
assert.equal(section.data.total,0);
assert.equal((await request('topics?section=does-not-exist')).status,404);
assert.equal((await request('new-topic',{method:'POST',body:{section:'python',title:'Unauthorized topic',body:'This should not be written.'}})).status,401);
assert.equal((await request('register',{method:'POST',origin:'https://attacker.invalid',body:{handle:'Attacker',password:'correct horse battery staple'}})).status,403);
const registered=await request('register',{method:'POST',body:{handle:'Alice_123',password:'correct horse battery staple'}});
assert.equal(registered.status,201,JSON.stringify(registered.data));
assert(registered.cookie?.startsWith('__Host-dedsec_forum='));
assert(registered.data.csrf?.length>15);
const {cookie, data:{csrf}}=registered;
assert.equal((await request('me',{cookie})).data.signedIn,true);
const noCsrf=await request('new-topic',{method:'POST',cookie,body:{section:'python',title:'Blocked no CSRF',body:'Must not be written on the forum.'}});
assert.equal(noCsrf.status,403);
const created=await request('new-topic',{method:'POST',cookie,csrf,body:{section:'python',title:'What is a Python generator?',body:'Can anyone explain generators with a small example?'}});
assert.equal(created.status,201,JSON.stringify(created.data));
assert.match(created.data.id,/^[a-f0-9]{24}$/);
assert(Array.isArray(created.data.tags));
assert(created.data.tags.includes('python'));
assert(created.data.tags.includes('generator'));
assert.equal(db.prepare('SELECT count(*) AS n FROM forum_topic_tags WHERE topic_id=?').get(created.data.id).n,created.data.tags.length);
assert.equal((await request('search?q=python&section=python')).data.total,1);

const topics=await request('topics?section=python');
assert.equal(topics.status,200);
assert.equal(topics.data.total,1);
assert.equal(topics.data.topics[0].id,created.data.id);
assert(topics.data.topics[0].tags.includes('python'));
const allSearch=await request('search?q=generator');
assert.equal(allSearch.status,200);
assert.equal(allSearch.cors,'https://ded-sec.space');
assert.equal(allSearch.data.total,1);
assert.equal(allSearch.data.results[0].id,created.data.id);
assert.equal(allSearch.data.results[0].category_en,'Programming & projects');
assert.equal((await request('search?q=generator&category=development')).data.total,1);
assert.equal((await request('search?q=generator&group=programming')).data.total,1);
assert.equal((await request('search?q=generator&section=python')).data.total,1);
assert.equal((await request('search?q=generator&category=announcements')).data.total,0);
assert.equal((await request('search?q=generator&field=title')).data.total,1);
assert.equal((await request('search?q=python&field=all')).data.total,1);
assert.equal((await request('search?q=python&field=title')).data.total,1);
assert.equal((await request('search?q=generator&author=alice')).data.total,1);
assert.equal((await request('search?q=generator&days=7')).data.total,1);
assert.equal((await request('search?q=generator&sort=oldest')).data.total,1);
assert.equal((await request('search?q=not-present')).data.total,0);
assert.equal((await request('search?q=generator&category=%27%3B')).status,400);
assert.equal((await request('search?q=generator&sort=invalid')).status,200);
assert.equal((await request('search?q=a')).data.total,0);
const searched=await request('topics?section=python&q=generator');
assert.equal(searched.data.total,1);
const viewed=await request('topic?id='+created.data.id);
assert.equal(viewed.status,200);
assert.equal(viewed.data.posts.length,1);
assert.equal(viewed.data.posts[0].author,'Alice_123');
assert(viewed.data.topic.tags.includes('generator'));
const createdReply=await request('reply',{method:'POST',cookie,csrf,body:{topicId:created.data.id,body:'A generator yields one value at a time.'}});
assert.equal(createdReply.status,201,JSON.stringify(createdReply.data));
const afterReply=await request('topic?id='+created.data.id);
assert.equal(afterReply.data.posts.length,2);
assert.equal(afterReply.data.posts[1].body,'A generator yields one value at a time.');
assert.equal((await request('report',{method:'POST',cookie,csrf,body:{postId:createdReply.data.id,reason:'Review for moderation'}})).status,200);
assert.equal((await request('post',{method:'DELETE',cookie,csrf,body:{postId:createdReply.data.id}})).status,200);
const afterDelete=await request('topic?id='+created.data.id);
assert.equal(afterDelete.data.posts[1].deleted,1);
assert.equal(afterDelete.data.posts[1].body,'[deleted]');
const loginWrong=await request('login',{method:'POST',body:{handle:'Alice_123',password:'wrong-password'}});
assert.equal(loginWrong.status,401);
const logged=await request('login',{method:'POST',body:{handle:'alice_123',password:'correct horse battery staple'}});
assert.equal(logged.status,200,JSON.stringify(logged.data));
const logout=await request('logout',{method:'POST',cookie:logged.cookie,csrf:logged.data.csrf,body:{}});
assert.equal(logout.status,200);
assert.equal((await request('me',{cookie:logged.cookie})).data.signedIn,false);
const snapshot=await request('categories');
assert.equal(snapshot.data.categories.find(x=>x.slug==='development').topics,1);
assert.equal(snapshot.data.categories.find(x=>x.slug==='development').posts,2);
assert.equal((await request('health',{method:'GET'})).status,404);
console.log('STANDALONE_TEST_FORUM_OK: 52 categories, 208 subforums, forum search filters, CORS, registration, CSRF, topics, reply, reports, deletion, login and logout');
