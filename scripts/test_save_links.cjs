const assert=require('node:assert/strict'),fs=require('node:fs');
const {parse,label}=require('../DedSec-Project-Website/assets/save-links.js');
const ia=Array.from({length:14},(_,i)=>`- **Project ${i}:** https://archive.org/details/project-${i}`).join('\n');
const swh=Array.from({length:13},(_,i)=>`- **Project ${i}** [origin](https://archive.softwareheritage.org/browse/origin/?origin_url=project${i}) [snapshot](https://archive.softwareheritage.org/swh:1:snp:${i}/)`).join('\n');
const fixture=`<!-- PERMANENT_ARCHIVE_LINKS_START -->${ia}<!-- PERMANENT_ARCHIVE_LINKS_END --><!-- SOFTWARE_HERITAGE_LINKS_START -->${swh}<!-- SOFTWARE_HERITAGE_LINKS_END -->`;
assert.deepEqual(parse(fixture).map(x=>x.length),[14,26]);
assert.throws(()=>parse(fixture.replace('project-1\n','project-0\n')));
assert.throws(()=>parse(fixture.replace(ia,'')));
assert.throws(()=>parse(fixture.replace('https://archive.org/details/project-0','https://evil.example/x')));
assert.equal(label('DedSec main',true),'Κύριο DedSec');
for(const dir of ['Pages','el/Pages']){
 const page=fs.readFileSync(`DedSec-Project-Website/dedsec/${dir}/save-dedsec-project.html`,'utf8');
 const body=page.split('id="save-archive-links"')[1].split('</footer>')[0];
 const urls=[...body.matchAll(/href="(https:\/\/(?:archive\.org|archive\.softwareheritage\.org|web\.archive\.org)[^"]*)"/g)].map(x=>x[1]);
 assert.equal(urls.length,42);assert.equal(new Set(urls).size,42);
}
console.log('SAVE_LINKS_PASS: complete, unique archive inventories, invalid refresh rejection, bilingual labels');
