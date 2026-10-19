/* Complete, versioned same-origin website cache. No external requests or telemetry. */
'use strict';
const scope=new URL(self.registration.scope),prefix='dedsec-site-'+scope.pathname+'-',pointer=prefix+'pointer';
let current=null,work=null;
const key=u=>{const x=new URL(u,scope);if(x.origin!==scope.origin||!x.pathname.startsWith(scope.pathname))throw Error('Outside site scope');x.search='';x.hash='';if(x.pathname.endsWith('/'))x.pathname+='index.html';return x.href;};
async function active(){const p=await caches.open(pointer),r=await p.match(new URL('__version__',scope));return current=r?await r.text():null;}
self.addEventListener('install',e=>e.waitUntil(self.skipWaiting()));
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
async function warm(m,send){
 if(!/^[a-z0-9-]{8,80}$/i.test(m.version)||!Array.isArray(m.resources)||!m.resources.length)throw Error('Invalid cache manifest');
 const previousVersion=await active(),name=prefix+m.version,cache=await caches.open(name),stamp=new URL('__complete__',scope);
 const keys=await cache.keys(),present=new Set(keys.map(r=>r.url));
 if(await cache.match(stamp)&&m.resources.every(r=>present.has(key(r.url)))){const p=await caches.open(pointer);await p.put(new URL('__version__',scope),new Response(m.version));current=m.version;send({done:true,ratio:1,version:m.version,previousVersion});return;}
 const oldCache=previousVersion&&previousVersion!==m.version?await caches.open(prefix+previousVersion):null,oldManifest=oldCache&&await oldCache.match(new URL('startup-manifest.json',scope)),oldRows=oldManifest?new Map((await oldManifest.json()).resources.map(r=>[r.url,r.sha256])):new Map();
 let position=0,bytes=0,count=0;const total=m.resources.reduce((n,r)=>n+r.bytes,0);
 async function runner(){while(position<m.resources.length){const item=m.resources[position++],url=key(item.url);let response=await cache.match(url);if(!response&&oldCache&&oldRows.get(item.url)===item.sha256){response=await oldCache.match(url);if(response)await cache.put(url,response.clone());}
  if(!response){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),120000);try{
   const requestURL=/\.(?:js|css)$/.test(url)?url+'?v='+item.sha256.slice(0,12):url;
   for(let attempt=0;attempt<2;attempt++){
    response=await fetch(requestURL,{cache:attempt?'reload':'default',signal:controller.signal});if(!response.ok&&!(response.status===404&&url.endsWith('/404.html')))throw Error('HTTP '+response.status+' '+item.url);
    const data=await response.arrayBuffer(),hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',data))].map(n=>n.toString(16).padStart(2,'0')).join('');
    if(hash!==item.sha256){if(!attempt)continue;throw Error('Changed during download: '+item.url);}
    const headers=new Headers(response.headers);headers.delete('content-encoding');headers.delete('content-length');await cache.put(url,new Response(data,{status:response.status,statusText:response.statusText,headers}));break;
   }
  }finally{clearTimeout(timer);}}
  bytes+=item.bytes;count++;send({ratio:total?bytes/total:count/m.resources.length,bytes,total,count,files:m.resources.length});
 }}
 await Promise.all(Array.from({length:6},runner));await cache.put(new URL('startup-manifest.json',scope),new Response(JSON.stringify(m),{headers:{'Content-Type':'application/json'}}));await cache.put(stamp,new Response('complete'));const p=await caches.open(pointer);await p.put(new URL('__version__',scope),new Response(m.version));current=m.version;
 for(const name of await caches.keys())if(name.startsWith(prefix)&&name!==pointer&&name!==prefix+m.version)await caches.delete(name);
 send({done:true,ratio:1,version:m.version,previousVersion});
}
self.addEventListener('message',e=>{if(e.data?.type!=='WARM_SITE'||!e.ports[0])return;const port=e.ports[0];const send=x=>port.postMessage(x);e.waitUntil((async()=>{try{if(work)await work;work=warm(e.data.manifest,send);await work;}catch(error){send({error:String(error.message||error)});}finally{work=null;}})());});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const url=new URL(e.request.url);if(url.origin!==scope.origin||!url.pathname.startsWith(scope.pathname)||url.pathname.endsWith('/offline-worker.js'))return;
 if(url.pathname.endsWith('/startup-manifest.json')){e.respondWith(fetch(e.request).catch(async error=>{const v=await active(),cache=v&&await caches.open(prefix+v),saved=cache&&await cache.match(key(url));if(saved)return saved;throw error;}));return;}
 e.respondWith((async()=>{const version=await active();if(version){const c=await caches.open(prefix+version),r=await c.match(key(url));if(r)return r;}return fetch(e.request);})());
});
