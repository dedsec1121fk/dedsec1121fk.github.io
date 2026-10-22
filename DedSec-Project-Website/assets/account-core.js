/* Pure TXT workspace operations; no credentials, network, execution or HTML. */
(function(root){'use strict';
 const LIMITS=Object.freeze({accounts:300,dailyActive:444,totalBytes:400000000,userBytes:900000,maxFiles:200,maxFolders:50,maxDepth:8});
 const encoder=new TextEncoder(),bytes=s=>encoder.encode(String(s)).length;
 class WorkspaceError extends Error{constructor(code){super(code);this.code=code;}}
 function fail(code){throw new WorkspaceError(code);}
 function path(value){
  const p=String(value).normalize('NFC');
  if(!p||p.startsWith('/')||p.endsWith('/')||/[\\\x00-\x1f\x7f]/.test(p))fail('invalidName');
  const parts=p.split('/');if(parts.length>LIMITS.maxDepth)fail('depth');
  if(parts.some(x=>!x||x==='.'||x==='..'||x.trim()!==x||bytes(x)>160||/[<>:"|?*]/.test(x)||/[. ]$/.test(x)||/^(?:CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(?:\.|$)/i.test(x)))fail('invalidName');
  return p;
 }
 function usage(entries){return entries.reduce((n,e)=>n+bytes(e.path)+(e.kind==='file'?bytes(e.content):0),0);}
 function validate(entries){
  if(!Array.isArray(entries))fail('invalidName');
  let files=0,folders=0;const names=new Set(),map=new Map();
  for(const e of entries){if(!e||typeof e.path!=='string')fail('invalidName');path(e.path);if(e.path!==e.path.normalize('NFC'))fail('invalidName');if(!['file','folder'].includes(e.kind)||typeof e.pinned!=='boolean')fail('invalidName');
   const key=e.path.toLowerCase();if(names.has(key))fail('duplicate');names.add(key);map.set(e.path,e);
   if(e.kind==='file'){files++;if(!/\.txt$/i.test(e.path)||typeof e.content!=='string'||/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(e.content))fail('textOnly');}else{folders++;if(e.content!==undefined)fail('textOnly');}
  }
  for(const e of entries){const parent=e.path.split('/').slice(0,-1).join('/');if(parent&&map.get(parent)?.kind!=='folder')fail('missingFolder');}
  if(files>LIMITS.maxFiles||folders>LIMITS.maxFolders)fail('entryLimit');if(usage(entries)>LIMITS.userBytes)fail('quota');return entries;
 }
 function create(){return [];}
 function add(entries,name,kind='file',content=''){
  const p=path(name);const entry=kind==='file'?{path:p,kind,pinned:false,content:String(content)}:{path:p,kind,pinned:false};return validate([...entries,entry]);
 }
 function save(entries,name,content){if(!entries.some(e=>e.path===name&&e.kind==='file'))fail('missingFile');return validate(entries.map(e=>e.path===name?{...e,content:String(content)}:{...e}));}
 function remove(entries,name){return entries.filter(e=>e.path!==name&&!e.path.startsWith(name+'/'));}
 function pin(entries,name){if(!entries.some(e=>e.path===name))fail('missingFile');return entries.map(e=>e.path===name?{...e,pinned:!e.pinned}:{...e});}
 function rename(entries,oldName,newName){const target=path(newName);if(!entries.some(e=>e.path===oldName))fail('missingFile');if(target.startsWith(oldName+'/'))fail('invalidName');return validate(entries.map(e=>({...e,path:e.path===oldName?target:e.path.startsWith(oldName+'/')?target+e.path.slice(oldName.length):e.path})));}
 function importTexts(entries,items){
  let next=entries.map(e=>({...e}));
  for(const item of items){const p=path(item.path);if(!/\.txt$/i.test(p))fail('textOnly');const parts=p.split('/');for(let i=1;i<parts.length;i++){const folder=parts.slice(0,i).join('/');if(!next.some(e=>e.path===folder))next.push({path:folder,kind:'folder',pinned:false});}next.push({path:p,kind:'file',pinned:false,content:String(item.content)});}
  return validate(next);
 }
 // Merge into a fresh cloud snapshot. Identical files deduplicate; conflicts
 // retain both copies with safe, deterministic names, including descendants.
 function merge(cloud,local){
  validate(cloud);validate(local);const next=structuredClone(cloud),mapped=new Map();let renamed=0;
  for(const item of [...local].sort((a,b)=>a.path.split('/').length-b.path.split('/').length||a.path.localeCompare(b.path))){
   const parts=item.path.split('/'),name=parts.pop(),parent=parts.join('/'),prefix=parent?(mapped.get(parent)||parent)+'/':'';
   let target=prefix+name,existing=next.find(e=>e.path.toLowerCase()===target.toLowerCase());
   if(existing&&existing.kind===item.kind&&(item.kind==='folder'||existing.content===item.content)){existing.pinned=existing.pinned||item.pinned;mapped.set(item.path,existing.path);continue;}
   if(existing){const ext=item.kind==='file'?name.slice(-4):'',stem=ext?name.slice(0,-4):name;let short=stem;while(bytes(short)>130)short=[...short].slice(0,-1).join('');let n=1;do{target=prefix+short+' (local '+n+++')'+ext;}while(next.some(e=>e.path.toLowerCase()===target.toLowerCase()));renamed++;}
   mapped.set(item.path,target);next.push({...item,path:target});
  }
  return {entries:validate(next),renamed};
 }
 function select(entries,paths){const chosen=new Set(paths);return entries.filter(e=>chosen.has(e.path)||[...chosen].some(p=>e.path.startsWith(p+'/')));}
 const crcTable=Uint32Array.from({length:256},(_,i)=>{let c=i;for(let b=0;b<8;b++)c=c&1?0xedb88320^(c>>>1):c>>>1;return c>>>0;});
 function crc32(data){let crc=0xffffffff;for(const byte of data)crc=crcTable[(crc^byte)&255]^(crc>>>8);return (crc^0xffffffff)>>>0;}
 function zip(entries){
  validate(entries);const local=[],central=[];let offset=0,centralSize=0;
  function header(length){const a=new Uint8Array(length);return [a,new DataView(a.buffer)];}
  for(const e of entries){const name=encoder.encode(e.path+(e.kind==='folder'?'/':'')),data=e.kind==='file'?encoder.encode(e.content):new Uint8Array(0),crc=crc32(data);
   const [h,v]=header(30);v.setUint32(0,0x04034b50,true);v.setUint16(4,20,true);v.setUint16(6,0x0800,true);v.setUint16(12,33,true);v.setUint32(14,crc,true);v.setUint32(18,data.length,true);v.setUint32(22,data.length,true);v.setUint16(26,name.length,true);
   local.push(h,name,data);const [c,w]=header(46);w.setUint32(0,0x02014b50,true);w.setUint16(4,20,true);w.setUint16(6,20,true);w.setUint16(8,0x0800,true);w.setUint16(14,33,true);w.setUint32(16,crc,true);w.setUint32(20,data.length,true);w.setUint32(24,data.length,true);w.setUint16(28,name.length,true);w.setUint32(38,e.kind==='folder'?0x10:0,true);w.setUint32(42,offset,true);central.push(c,name);centralSize+=c.length+name.length;offset+=h.length+name.length+data.length;
  }
  const [end,v]=header(22);v.setUint32(0,0x06054b50,true);v.setUint16(8,entries.length,true);v.setUint16(10,entries.length,true);v.setUint32(12,centralSize,true);v.setUint32(16,offset,true);
  const parts=[...local,...central,end],result=new Uint8Array(parts.reduce((n,a)=>n+a.length,0));let i=0;for(const part of parts){result.set(part,i);i+=part.length;}return result;
 }
 function exportSelection(entries,paths){const selected=select(entries,paths);if(!selected.length)fail('selection');if(selected.length===1&&selected[0].kind==='file')return {name:selected[0].path.split('/').pop(),type:'text/plain;charset=utf-8',data:encoder.encode(selected[0].content)};
  // Include ancestor folders so nested selections remain a valid virtual tree.
  const wanted=new Set(selected.map(e=>e.path));for(const e of selected){const parts=e.path.split('/');for(let i=1;i<parts.length;i++)wanted.add(parts.slice(0,i).join('/'));}
  return {name:'DedSec-notes.zip',type:'application/zip',data:zip(entries.filter(e=>wanted.has(e.path)))};
 }
 const api={LIMITS,WorkspaceError,bytes,path,usage,validate,create,add,save,remove,pin,rename,importTexts,merge,select,zip,exportSelection};
 if(typeof module!=='undefined')module.exports=api;root.DedSecAccountCore=api;
})(typeof window!=='undefined'?window:globalThis);
