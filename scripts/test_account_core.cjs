const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),os=require('node:os');
const c=require('../DedSec-Project-Website/assets/account-core.js');
assert.equal(c.LIMITS.accounts,300);assert.equal(c.LIMITS.userBytes*300,270000000);assert(c.LIMITS.userBytes*300<=c.LIMITS.totalBytes);
let x=c.add(c.create(),'Σημειώσεις','folder');x=c.add(x,'Σημειώσεις/Πρώτο.txt','file','Καλημέρα\n<script>alert(1)</script>');x=c.add(x,'empty','folder');
assert.equal(c.usage(x),x.reduce((n,e)=>n+Buffer.byteLength(e.path)+Buffer.byteLength(e.content||''),0));
assert.throws(()=>c.add(x,'Σημειώσεις/ΠΡΏΤΟ.txt'),/duplicate/);
for(const p of ['../escape.txt','/absolute.txt','bad\\file.txt','a/../file.txt','a//file.txt','CON.txt','x\0.txt','bad?.txt','folder/'])assert.throws(()=>c.add(x,p));
assert.throws(()=>c.add(x,'missing/file.txt'),/missingFolder/);assert.throws(()=>c.add(x,'binary.bin'),/textOnly/);
const before=c.usage(x);assert.throws(()=>c.save(x,'Σημειώσεις/Πρώτο.txt','a'.repeat(900001)),/quota/);assert.equal(c.usage(x),before);
let boundary=c.add([],'a.txt','file','a'.repeat(900000-5));assert.equal(c.usage(boundary),900000);assert.throws(()=>c.add(boundary,'b.txt'),/quota/);
assert.throws(()=>c.save(boundary,'a.txt','é'.repeat(450000)),/quota/);
x=c.pin(x,'Σημειώσεις');assert.equal(x[0].pinned,true);x=c.rename(x,'Σημειώσεις','Notes');assert(x.some(e=>e.path==='Notes/Πρώτο.txt'));
const single=c.exportSelection(x,['Notes/Πρώτο.txt']);assert.equal(single.name,'Πρώτο.txt');assert.equal(new TextDecoder().decode(single.data),'Καλημέρα\n<script>alert(1)</script>');assert(single.type.startsWith('text/plain'));
const batch=c.exportSelection(x,['Notes','Notes/Πρώτο.txt','empty']);assert.equal(batch.type,'application/zip');
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'dedsec-txt-'));try{const file=path.join(temp,'notes.zip');fs.writeFileSync(file,batch.data);cp.execFileSync('python3',['-c',`import zipfile,sys
with zipfile.ZipFile(sys.argv[1]) as z:
 assert z.testzip() is None
 assert len(z.namelist())==len(set(z.namelist()))==3
 assert set(z.namelist())=={'Notes/','Notes/Πρώτο.txt','empty/'}
 assert z.read('Notes/Πρώτο.txt').decode('utf8')=='Καλημέρα\\n<script>alert(1)</script>'
`,file]);}finally{fs.rmSync(temp,{recursive:true});}
assert.equal(c.remove(x,'Notes').length,1);
const imported=c.importTexts([], [{path:'one/two/a.txt',content:'first'},{path:'one/two/b.txt',content:'second'}]);assert.equal(imported.length,4);assert.throws(()=>c.importTexts(imported,[{path:'one/two/a.txt',content:'replace'}]),/duplicate/);assert.equal(imported[2].content,'first');
assert.throws(()=>c.exportSelection([],[]),/selection/);
console.log('ACCOUNT_CORE_PASS: UTF-8 quotas, atomic imports, safe names, nested folders/pins, direct TXT and independently decoded ZIP exports');
// Local/cloud transfers preserve both conflicting versions and fold duplicates.
const cloud=[{path:'A',kind:'folder',pinned:false},{path:'A/n.txt',kind:'file',pinned:false,content:'cloud'}];
const local=[{path:'a',kind:'folder',pinned:true},{path:'a/n.txt',kind:'file',pinned:true,content:'local'}];
const merged=c.merge(cloud,local);assert.equal(merged.renamed,1);assert.equal(merged.entries.length,3);assert.equal(merged.entries[0].pinned,true);assert(merged.entries.some(e=>e.path==='A/n (local 1).txt'&&e.content==='local'));assert.equal(cloud[0].pinned,false);
assert.equal(c.merge(cloud,cloud).entries.length,2);
const folderCollision=c.merge([{path:'notes.txt',kind:'file',pinned:false,content:'cloud'}],[{path:'notes.txt',kind:'folder',pinned:false},{path:'notes.txt/k.txt',kind:'file',pinned:false,content:'local'}]);assert(folderCollision.entries.some(e=>e.path==='notes.txt (local 1)/k.txt'));
assert.throws(()=>c.merge([{path:'c.txt',kind:'file',pinned:false,content:'x'.repeat(500000)}],[{path:'l.txt',kind:'file',pinned:false,content:'y'.repeat(500000)}]),/quota/);
console.log('ACCOUNT_MERGE_PASS: identical files, case/folder conflicts, preserved originals and combined quotas');
