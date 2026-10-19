import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';import {webcrypto,createHash} from 'node:crypto';
const stores=new Map(),handlers={},scope='https://example.test/Test/';let calls=0,offline=false;
const k=x=>typeof x==='string'?x:x.url||x.href;
const caches={async open(name){if(!stores.has(name))stores.set(name,new Map());const m=stores.get(name);return {async match(u){return m.get(k(u))?.clone();},async put(u,r){m.set(k(u),r.clone());},async keys(){return [...m.keys()].map(url=>new Request(url));}};},async keys(){return [...stores.keys()];},async delete(n){return stores.delete(n);}};
const contents=new Map([[scope+'index.html','<main>Home</main>'],[scope+'page.html','<main>Subpage</main>']]);
const context={self:{registration:{scope},clients:{claim:async()=>{}},skipWaiting:async()=>{},addEventListener:(t,f)=>handlers[t]=f},caches,URL,Response,Request,Headers,AbortController,crypto:webcrypto,setTimeout,clearTimeout,fetch:async request=>{calls++;if(offline)throw Error('offline');const body=contents.get(k(request));return new Response(body||'missing',{status:body?200:404});}};
vm.createContext(context);vm.runInContext(fs.readFileSync(new URL('../DedSec-Project-Website/offline-worker.js',import.meta.url),'utf8'),context);
const resources=[...contents].map(([url,body])=>({url:url.slice(scope.length),bytes:Buffer.byteLength(body),sha256:createHash('sha256').update(body).digest('hex')}));
async function warm(version,resourcesOverride=resources){let promise;const messages=[];handlers.message({data:{type:'WARM_SITE',manifest:{version,resources:resourcesOverride}},ports:[{postMessage:x=>messages.push(x)}],waitUntil:p=>promise=p});await promise;return messages;}
async function read(url){let response;handlers.fetch({request:new Request(url),respondWith:p=>response=p});return (await response).text();}
let messages=await warm('fixture-version-a');assert.equal(messages.at(-1).done,true);assert.equal(calls,2);offline=true;assert.equal(await read(scope+'page.html?find=Subpage'),'<main>Subpage</main>');

const saved=JSON.parse(await read(scope+'startup-manifest.json'));assert.equal(saved.version,'fixture-version-a');
offline=false;messages=await warm('fixture-version-b',[{...resources[0],sha256:'0'.repeat(64)}]);assert.ok(messages.at(-1).error.includes('Changed during download'));
assert.equal(await read(scope+'page.html'),'<main>Subpage</main>');
messages=await warm('fixture-version-c');assert.equal(messages.at(-1).done,true);
const name=[...stores.keys()].find(n=>n.endsWith('fixture-version-c'));stores.get(name).delete(scope+'page.html');const before=calls;
messages=await warm('fixture-version-c');assert.equal(messages.at(-1).done,true);assert.equal(calls,before+1);
assert.equal([...stores.keys()].filter(n=>!n.endsWith('pointer')).length,1);
console.log('PASS: complete cache, offline navigation/manifest, integrity failure and missing-file resume');
