/* Explicit opt-in private browser notes. Never stores credentials or tokens. */
(function(){'use strict';
 let connection;
 function db(){return connection||(connection=new Promise((resolve,reject)=>{const r=indexedDB.open('dedsec-private-txt-v1',1);r.onupgradeneeded=()=>r.result.createObjectStore('workspaces');r.onsuccess=()=>{r.result.onversionchange=()=>{r.result.close();connection=null;};resolve(r.result);};r.onerror=()=>{connection=null;reject(r.error);};r.onblocked=()=>{connection=null;reject(Error('local_unavailable'));};}));}
 async function key(identity,profile){const raw=new TextEncoder().encode(profile+'\n'+identity);return [...new Uint8Array(await crypto.subtle.digest('SHA-256',raw))].map(x=>x.toString(16).padStart(2,'0')).join('');}
 async function read(owner){const d=await db();return new Promise((resolve,reject)=>{const tx=d.transaction('workspaces','readonly'),r=tx.objectStore('workspaces').get(owner);r.onsuccess=()=>resolve(r.result||null);r.onerror=()=>reject(r.error);});}
 async function write(owner,expected,entries,mode){window.DedSecAccountCore.validate(entries);const d=await db();return new Promise((resolve,reject)=>{const tx=d.transaction('workspaces','readwrite'),store=tx.objectStore('workspaces'),r=store.get(owner);let result,conflict=false;r.onsuccess=()=>{if((r.result?.revision||0)!==expected){conflict=true;tx.abort();return;}result={revision:expected+1,mode,entries:structuredClone(entries)};store.put(result,owner);};tx.oncomplete=()=>resolve(result);tx.onabort=()=>{const e=Error(conflict?'local_conflict':'local_unavailable');e.code=e.message;reject(e);};tx.onerror=()=>{};});}
 async function remove(owner){const d=await db();return new Promise((resolve,reject)=>{const tx=d.transaction('workspaces','readwrite');tx.objectStore('workspaces').delete(owner);tx.oncomplete=()=>resolve();tx.onabort=()=>reject(tx.error);});}
 window.DedSecAccountLocal={key,read,write,remove};
})();
