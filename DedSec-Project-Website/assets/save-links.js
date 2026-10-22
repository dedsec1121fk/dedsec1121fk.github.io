/* Fetch only on the archive page. Remote Markdown is parsed as data, never HTML. */
(function(root){
 'use strict';
 const source='https://raw.githubusercontent.com/dedsec1121fk/Save-DedSec-Project/main/README.md';
 function parse(markdown){
  const text=markdown.split('<a id="greek-readme"')[0];
  function block(name){const match=text.match(new RegExp('<!-- '+name+'_START -->([\\s\\S]*?)<!-- '+name+'_END -->'));if(!match)throw Error('Missing archive section');return match[1];}
  const ia=[...block('PERMANENT_ARCHIVE_LINKS').matchAll(/- \*\*([^*]+):\*\* (https:\/\/archive\.org\/details\/[^\s]+)/g)].map(m=>[m[1],m[2]]);
  const swh=[];
  block('SOFTWARE_HERITAGE_LINKS').split('\n').forEach(line=>{
   const target=line.match(/^- \*\*([^*]+)\*\*/);if(!target)return;
   for(const m of line.matchAll(/\[([^\]]+)\]\((https:\/\/archive\.softwareheritage\.org\/[^\s)]+)\)/g))swh.push([target[1].replace(/:$/,'')+' — '+m[1],m[2]]);
  });
  if(ia.length<14||swh.length<26||ia.length>100||swh.length>200)throw Error('Incomplete archive inventory');
  const seen=new Set();for(const [label,url] of [...ia,...swh]){
   const u=new URL(url);if(!label||u.protocol!=='https:'||u.username||u.password||!['archive.org','archive.softwareheritage.org'].includes(u.hostname)||seen.has(url))throw Error('Invalid archive link');seen.add(url);
  }
  return [ia,swh];
 }
 const translations={'DedSec main':'Κύριο DedSec','DedSec backup':'Εφεδρικό DedSec','Websites':'Ιστοσελίδες','Website mirror':'Εφεδρική ιστοσελίδα','GitHub profile':'Προφίλ GitHub','APK dependencies':'Εξαρτήσεις APK'};
 function label(text,gr){if(!gr)return text;return text.replace(/^[^—]+?(?= — |$)/,x=>translations[x.trim().replace(/:$/,'')]||x).replace(/Software Heritage archive/g,'Αρχείο Software Heritage').replace(/latest snapshot/g,'Τελευταίο στιγμιότυπο').replace(/\borigin\b/gi,'προέλευση').replace(/\bsnapshot\b/gi,'στιγμιότυπο');}
 if(typeof module!=='undefined')module.exports={parse,label};
 if(!root.document)return;
 const status=document.getElementById('save-links-status'),host=document.getElementById('save-archive-links');if(!status||!host)return;
 const gr=document.documentElement.lang==='el';
 status.textContent=gr?'Έλεγχος για νεότερα links…':'Checking for newer links…';
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),8000);
 fetch(source,{signal:controller.signal,cache:'no-store',credentials:'omit',referrerPolicy:'no-referrer'})
 .then(response=>{if(!response.ok)throw Error('Archive source unavailable');return response.text();})
 .then(text=>{
  const groups=parse(text),lists=host.querySelectorAll('ul');
  groups.forEach((items,i)=>{const fragment=document.createDocumentFragment();items.forEach(([name,url])=>{
   const li=document.createElement('li'),a=document.createElement('a');a.href=url;a.textContent=label(name,gr);a.target='_blank';a.rel='noopener noreferrer';li.append(a);fragment.append(li);
  });lists[i].replaceChildren(fragment);});
  status.textContent=(gr?'Τα links ελέγχθηκαν από την τρέχουσα πηγή: ':'Links checked against the current source: ')+new Date().toLocaleString(gr?'el-GR':'en-GB')+'.';
 }).catch(()=>{status.textContent=gr?'Εμφανίζονται τα αποθηκευμένα links της 20ής Οκτωβρίου 2026. Η ζωντανή ενημέρωση δεν ήταν διαθέσιμη.':'Showing bundled links from 20 October 2026. Live updates were unavailable.';}).finally(()=>clearTimeout(timer));
})(typeof window!=='undefined'?window:globalThis);
