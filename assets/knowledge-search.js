/* Deterministic offline search. Quoted phrases and exclusions are literal;
 * unquoted words allow prefixes, bounded typos and small bilingual synonym sets. */
(function(root){'use strict';
const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/ς/g,'σ');
const words=s=>normalize(s).match(/[\p{L}\p{N}_+#.-]+/gu)||[];
const groups=[['error','failure','σφαλμα','λαθοσ'],['permission','δικαιωμα','δικαιωματα'],['network','δικτυο'],['install','installation','εγκατασταση'],['storage','αποθηκευση'],['certificate','πιστοποιητικο'],['security','ασφαλεια'],['search','αναζητηση'],['backup','αντιγραφο'],['database','βαση'],['encryption','κρυπτογραφηση'],['debugging','αποσφαλματωση'],['concurrency','ταυτοχρονη'],['container','containers'],['venv','virtualenv'],['repository','repo','αποθετηριο']].map(g=>g.map(normalize));
function near(a,b){ // One edit or adjacent transposition, title words only.
 if(a===b)return true;if(Math.abs(a.length-b.length)>1)return false;
 if(a.length===b.length){let d=[];for(let i=0;i<a.length;i++)if(a[i]!==b[i])d.push(i);return d.length===1||(d.length===2&&d[1]===d[0]+1&&a[d[0]]===b[d[1]]&&a[d[1]]===b[d[0]]);}
 if(a.length>b.length)[a,b]=[b,a];let i=0,j=0,edits=0;while(i<a.length&&j<b.length){if(a[i]===b[j]){i++;j++;}else{edits++;j++;if(edits>1)return false;}}return true;
}
const stop=new Set('a an the how do i to in of for with is my please fix ο η το τα οι πως να σε με για και μου ειναι'.split(' ').map(normalize));
function parse(query){
 const out={groups:[[]],filters:{},errors:[]};
 const tokens=String(query||'').match(/-?"[^"]*"|\S+/g)||[];
 for(const raw of tokens.slice(0,40)){
  if(raw==='OR'||raw==='|'){if(!out.groups.at(-1).length)out.errors.push('OR');out.groups.push([]);continue;}
  const m=/^(lang|topic|type|in):(.+)$/i.exec(raw);
  if(m){out.filters[m[1].toLowerCase()]=normalize(m[2]);continue;}
  const exclude=raw[0]==='-',s=exclude?raw.slice(1):raw,phrase=s[0]==='"';
  if(phrase&&s.at(-1)!=='"')out.errors.push('quote');
  const value=normalize(phrase?s.slice(1,-1):s);if(value&&(exclude||phrase||!stop.has(value)))out.groups.at(-1).push({value,exclude,phrase});
 }
 if((String(query).match(/"/g)||[]).length%2)out.errors.push('quote');
 if(out.groups.length>1&&!out.groups.at(-1).length)out.errors.push('OR');
 const f=out.filters;
 if(f.lang&&!['en','el','all'].includes(f.lang))out.errors.push('lang');
 if(f.type&&!['code','lesson','page'].includes(f.type))out.errors.push('type');
 if(f.in&&f.in!=='title')out.errors.push('in');
 return out;
}
function indexRow(d,category){return {d,title:normalize(d.t),path:normalize(d.p+' '+d.g),body:normalize(d.b),hay:normalize(d.t+'\n'+d.p+' '+d.g+'\n'+d.b),tokens:words(d.t),cat:category(d)};}
function create(rows,category,prepared){
 const index=prepared||rows.map(d=>indexRow(d,category));
 return {search(query,options={}){
  const p=parse(query);if(p.errors.length)return [];
  const f=p.filters,locale=f.lang||options.language||'en',cat=f.topic||options.category||'all';
  return index.filter(r=>(locale==='all'||r.d.l===locale)&&(cat==='all'||r.cat===cat)&&(!f.type||f.type===(r.d.kind==='page'?'page':r.d.p.endsWith('.md')?'lesson':'code'))).map(r=>{
   const hay=f.in==='title'?r.title:r.hay;
   function match(t){if(t.exclude)return hay.includes(t.value)?-1:1;
    if(t.phrase)return hay.includes(t.value)?(r.title.includes(t.value)?100:18):0;
    if(r.title.includes(t.value))return 45;if(f.in!=='title'&&r.path.includes(t.value))return 22;
    if(f.in!=='title'&&r.body.includes(t.value))return 10;
    const aliases=groups.find(g=>g.includes(t.value))||[];
    if(aliases.some(a=>a!==t.value&&hay.includes(a)))return 5;
    if(t.value.length>=5&&r.tokens.some(w=>near(w,t.value)))return 3;return 0;
   }
   let best=-1;
   for(const group of p.groups){let score=0,ok=true;for(const t of group){const n=match(t);if(n<=0){ok=false;break;}score+=n;}if(ok)best=Math.max(best,score);}
   return {d:r.d,score:best};
  }).filter(r=>r.score>=0).sort((a,b)=>b.score-a.score||a.d.t.localeCompare(b.d.t,locale==='el'?'el':'en')).map(r=>r.d);
 }};
}
function createAsync(rows,category,progress){
 const index=[];let position=0;
 return new Promise(resolve=>{function chunk(){const start=performance.now();do{index.push(indexRow(rows[position++],category));}while(position<rows.length&&position%32!==0&&performance.now()-start<8);
 if(progress)progress(position/rows.length);
 if(position<rows.length)setTimeout(chunk,0);else resolve(create(rows,category,index));
 }if(rows.length)chunk();else resolve(create([],category));});
}
root.DedSecSearch={create,createAsync,parse,normalize,evidenceTerms(query){const values=parse(query).groups.flat().filter(t=>!t.exclude).map(t=>t.value);return [...new Set(values.concat(values.flatMap(v=>groups.find(g=>g.includes(v))||[])))];}};
})(typeof window==='undefined'?globalThis:window);
