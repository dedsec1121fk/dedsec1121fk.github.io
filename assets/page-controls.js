/* Complete passage extraction shared by results and destination highlighting. */
(function(root){'use strict';
function normalize(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/ς/g,'σ').replace(/\s+/g,' ').trim();}
function plain(s){return String(s).replace(/<!--[\s\S]*?-->/g,'').replace(/!?(\[([^\]]+)\])\([^)]*\)/g,'$2').replace(/^\s*#{1,6}\s+/gm,'').replace(/(\*\*|__)(.*?)\1/g,'$2').replace(/`/g,'').replace(/^\s*>\s?/gm,'').replace(/\s+/g,' ').trim();}
function passages(d){const raw=String(d.b||'');if(d.kind==='page')return raw.split(/\n\s*\n/).map(x=>x.trim()).filter(x=>x&&normalize(x)!==normalize(d.t));
 if(!d.p.endsWith('.md'))return raw.split(/\n\s*\n/).filter(x=>x.trim()).map(x=>x.trim());
 const result=[];let buffer=[],fence=null;function flush(code){const text=code?buffer.join('\n').trim():plain(buffer.join(' '));if(text&&normalize(text)!==normalize(d.t))result.push(text);buffer=[];}
 for(const line of raw.split('\n')){const marker=/^ {0,3}(`{3,}|~{3,})/.exec(line);if(marker){if(!fence){flush(false);fence=marker[1];}else if(marker[1][0]===fence[0]&&marker[1].length>=fence.length){flush(true);fence=null;}else buffer.push(line);continue;}if(!fence&&!line.trim()){flush(false);continue;}buffer.push(line);}flush(!!fence);return result;}

function select(d,terms){const blocks=passages(d);let best=null;
 for(const text of blocks){const n=normalize(text);let score=0,needle='';for(const term of terms){if(n.includes(normalize(term))){score+=Math.min(term.length,40)+10;if(!needle)needle=term;}}if(score)score+=Math.min(text.length/150,3);if(!best||score>best.score)best={text,score,needle};}
 if(!best)best={text:plain(d.b||d.t),needle:'',score:0};
 // Keep whole sentences when one unusually long source block contains many.
 if(best.text.length>1600&&best.needle&&typeof Intl.Segmenter==='function'){
  const sentences=[...new Intl.Segmenter(d.l||'en',{granularity:'sentence'}).segment(best.text)].map(x=>x.segment.trim());
  const sentence=sentences.find(s=>normalize(s).includes(normalize(best.needle)));if(sentence)best.text=sentence;
 }
 // A public text excerpt is sufficient to locate the passage; never send the query.
 best.anchor=best.text.length<=2000?best.text:(best.needle||best.text.split('\n')[0]);return best;
}
root.DedSecPassages={normalize,plain,passages,select};
})(typeof window==='undefined'?globalThis:window);

/* Shared accessible lesson controls, with no telemetry or command execution. */
(function(){'use strict';
const script=document.currentScript,home=new URL('../index.html',script.src);
let lastRoute=location.href,routeStack=[],goingBack=false;
function greek(){return /^(el|gr)/i.test(document.documentElement.lang)||document.body.classList.contains('lang-gr');}
function fallback(text){const focus=document.activeElement,n=document.createElement('textarea');n.value=text;n.setAttribute('readonly','');n.style.cssText='position:fixed;top:0;left:-9999px';document.body.append(n);n.select();let ok=false;try{ok=document.execCommand('copy');}catch(e){}n.remove();if(focus&&focus.isConnected)focus.focus({preventScroll:true});return ok;}
async function copy(button,code){const text=code.textContent;let ok=false;if(text.trim()){try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(text);ok=true;}}catch(e){}if(!ok)ok=fallback(text);}
 button.textContent=greek()?(ok?'Αντιγράφηκε':'Αποτυχία αντιγραφής'):(ok?'Copied':'Copy failed');button.setAttribute('aria-live','polite');clearTimeout(button._copyTimer);button._copyTimer=setTimeout(()=>{if(button.isConnected)button.textContent=greek()?'Αντιγραφή':'Copy';},2000);
}
let focused=null,focusRoute='';
function focusSearch(){
 const query=new URLSearchParams(location.search),hashParams=new URLSearchParams(location.hash.startsWith('#find=')?location.hash.slice(1):location.hash.includes(';find=')?location.hash.split(';').slice(1).join(';'):'');
 const phrase=query.get('find')||hashParams.get('find')||'',fallbackTerm=query.get('term')||hashParams.get('term')||'';if(!phrase||phrase.length>2000)return;
 const area=document.querySelector('.lesson-content')||document.querySelector('.page-content')||document.querySelector('main');if(!area)return;
 if(focusRoute===location.href&&focused?.isConnected)return;
 area.querySelectorAll('mark.search-hit').forEach(mark=>mark.replaceWith(document.createTextNode(mark.textContent)));
 area.normalize();const nodes=[],walker=document.createTreeWalker(area,NodeFilter.SHOW_TEXT,{acceptNode(node){return node.parentElement.closest('script,style,button,.page-back-row,.search-hit-status')?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT;}});let node;
 let text='';while(node=walker.nextNode()){nodes.push({node,start:text.length});text+=node.data;}
 // Map normalized whitespace/accents back to original DOM offsets across inline tags.
 let normalized='',map=[];for(let i=0;i<text.length;i++){const value=text[i].normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/ς/g,'σ');for(const c of value){if(/\s/.test(c)){if(normalized.endsWith(' '))continue;normalized+=' ';map.push(i);}else{normalized+=c;map.push(i);}}}
 let sought=window.DedSecPassages.normalize(phrase),at=normalized.indexOf(sought);if(at<0&&fallbackTerm){sought=window.DedSecPassages.normalize(fallbackTerm);at=normalized.indexOf(sought);}if(at<0)return;
 const start=map[at],end=map[at+sought.length-1]+1,marks=[];
 for(const entry of nodes){const a=Math.max(start-entry.start,0),b=Math.min(end-entry.start,entry.node.data.length);if(b<=a)continue;const range=document.createRange();range.setStart(entry.node,a);range.setEnd(entry.node,b);const mark=document.createElement('mark');mark.className='search-hit';range.surroundContents(mark);marks.push(mark);}
 if(!marks.length)return;focused=marks[0];focusRoute=location.href;
 // Reveal native and custom FAQ/accordion containers before scrolling.
 for(let p=focused.parentElement;p&&p!==area;p=p.parentElement){if(p.tagName==='DETAILS')p.open=true;if(p.matches('.tool-description,.tools-list,.faq-answer,.accordion-content')){p.hidden=false;p.style.setProperty('display','block','important');p.style.setProperty('max-height','none','important');p.style.setProperty('height','auto','important');}if(p.matches('.tool-item,.category,.faq-item,.accordion-item')){p.classList.add('active','open','expanded');const control=p.querySelector('[aria-expanded]');if(control)control.setAttribute('aria-expanded','true');}}
 const scroll=()=>{if(!focused?.isConnected)return;const top=focused.getBoundingClientRect().top+scrollY-130;window.scrollTo({top:Math.max(0,top),behavior:'instant'});focused.tabIndex=-1;focused.focus({preventScroll:true});};
 if(document.documentElement.classList.contains('site-loading'))window.addEventListener('dedsec:visible',scroll,{once:true});else requestAnimationFrame(scroll);
}

function websiteRepository(){
 const footer=document.querySelector('footer');if(!footer)return;
 const url='https://github.com/dedsec1121fk/dedsec1121fk.github.io';
 let link=footer.querySelector('a[href="'+url+'"]');
 if(!link){link=document.createElement('a');link.href=url;link.target='_blank';link.rel='noopener noreferrer';link.className='dedsec-text-link dedsec-append-arrow';link.dataset.en='Website Repository';link.dataset.gr='Αποθετήριο Ιστοσελίδας';
  const row=footer.querySelector('.footer-buttons');if(row)row.append(link);else{footer.append(document.createTextNode(' · '),link);}
 }
 const label=greek()?'Αποθετήριο Ιστοσελίδας':'Website Repository';if(link.textContent!==label)link.textContent=label;
}
function mount(){
 websiteRepository();
 document.querySelectorAll('pre > code').forEach(code=>{const pre=code.parentElement;if(pre.dataset.copyReady||pre.querySelector('button')||pre.parentElement.matches('.code-container,.assistance-code'))return;pre.dataset.copyReady='1';const b=document.createElement('button');b.type='button';b.className='copy-btn lesson-copy';b.textContent=greek()?'Αντιγραφή':'Copy';b.setAttribute('aria-label',greek()?'Αντιγραφή κώδικα':'Copy code');b.addEventListener('click',e=>{e.stopPropagation();copy(b,code);});pre.before(b);});
 document.querySelectorAll('p code,li code,td code').forEach(code=>{
  if(code.dataset.copyReady||code.closest('pre,.code-container,.assistance-code')||! /^(?:\$ |PS> )?(?:sudo |pkg |apt(?:-get)? |python(?:3)? |pip(?:3)? |git |curl |wget |ssh |ls |cd |mkdir |chmod |find |rg |node |npm |bash |sh |systemctl |journalctl )/.test(code.textContent.trim()))return;
  code.dataset.copyReady='1';const b=document.createElement('button');b.type='button';b.className='copy-btn inline-command-copy';b.textContent=greek()?'Αντιγραφή':'Copy';b.setAttribute('aria-label',greek()?'Αντιγραφή εντολής':'Copy command');b.addEventListener('click',e=>{e.stopPropagation();copy(b,code);});code.after(b);
 });
 const locale=greek()?'el':'en';
 document.querySelectorAll('.lesson-copy,.inline-command-copy').forEach(b=>{if(b.dataset.locale!==locale){b.dataset.locale=locale;b.textContent=greek()?'Αντιγραφή':'Copy';b.setAttribute('aria-label',greek()?'Αντιγραφή κώδικα':'Copy code');}});
 document.querySelectorAll('.page-back').forEach(b=>{const label=greek()?'← Πίσω':'← Back';if(b.textContent!==label)b.textContent=label;});
 const app=document.querySelector('#app'),isMain=!!app;
 const isHome=isMain?!!app.querySelector('.desktop-home'):location.pathname===home.pathname&&!location.hash;
 const host=app||document.querySelector('.page-content')||document.querySelector('main')||document.querySelector('.container');
 if(isHome)document.querySelectorAll('.page-back-row').forEach(n=>n.remove());
 if(!isHome&&host&&!document.querySelector('.page-back-row')){const row=document.createElement('div');row.className='page-back-row';const b=document.createElement('button');b.type='button';b.className='small-btn page-back';b.textContent=greek()?'← Πίσω':'← Back';b.addEventListener('click',()=>{
  if(routeStack.length){goingBack=true;location.href=routeStack.pop();return;}
  goingBack=true;
  if(isMain&&location.hash.startsWith('#read:'))location.hash='library';else if(isMain)location.hash='home';else {let target=home.href;try{const ref=new URL(document.referrer);if(ref.origin===home.origin&&ref.pathname.startsWith(new URL('.',home).pathname)&&ref.href!==location.href)target=ref.href;}catch(e){}location.href=target;}
 });row.append(b);if(host.id==='feed'){row.classList.add('feed-back-row');document.body.append(row);}else host.prepend(row);}
}
window.DedSecPageControls={mount,focusSearch};
window.addEventListener('hashchange',()=>{if(location.href!==lastRoute){if(!goingBack){routeStack.push(lastRoute);if(routeStack.length>100)routeStack.shift();}goingBack=false;lastRoute=location.href;}mount();});
let queued=false;new MutationObserver(records=>{if(records.every(r=>r.target.parentElement?.closest('#site-loader')||r.target.id==='site-loader'))return;if(!queued){queued=true;requestAnimationFrame(()=>{queued=false;mount();});}}).observe(document.body,{childList:true,subtree:true});
document.addEventListener('dedsec:ready',()=>requestAnimationFrame(focusSearch));
window.addEventListener('dedsec:visible',focusSearch);
window.addEventListener('hashchange',()=>requestAnimationFrame(focusSearch));
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{mount();requestAnimationFrame(focusSearch);});else {mount();requestAnimationFrame(focusSearch);}
})();
