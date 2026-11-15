
(function(){
 'use strict';
 const host=document.getElementById('forum-inline');
 if(!host)return;
 const isLive=window.DEDSEC_FORUM_LIVE===true;
 const testForumOrigin='https://dedsec-forum.dedsec-project.workers.dev';
 if(!isLive&&location.origin==='https://ded-sec.space'&&
    new URLSearchParams(location.search).get('preview')!=='1'){
  location.replace(testForumOrigin+'/forum');
  return;
 }
 const config=window.DEDSEC_ACCOUNT_SHELL||{};
 const portal=new URL(config.portal||'https://dedsec-accounts.dedsec-project.workers.dev');
 const notice=document.getElementById('forum-embed-notice');
 const searchLink=document.getElementById('nav-search');
 if(searchLink)searchLink.href='https://ded-sec.space/index.html?search=1#library';
 const readPref=(key,fallback)=>{
  try{const v=JSON.parse(localStorage.getItem('dedsec:'+key));return v||fallback;}
  catch{return fallback;}
 };
 const savePref=(key,value)=>{
  try{localStorage.setItem('dedsec:'+key,JSON.stringify(value));}catch{}
 };
 let language=readPref('language','en')==='gr'?'gr':'en';
 let theme=readPref('theme','dark')==='light'?'light':'dark';
 let liveFrame=null,liveReady=false;
 const moon='<svg class="ds-nav-glyph" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20.7 16.1A8.9 8.9 0 0 1 7.9 3.3a9.2 9.2 0 1 0 12.8 12.8Z"/></svg>';
 const sun='<svg class="ds-nav-glyph" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="4.1"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4m0-14.2-1.4 1.4M6.3 17.7l-1.4 1.4"/></svg>';
 const remoteUrl=()=>{
  const link=new URL('/forum',portal),current=new URLSearchParams(location.search);
  link.search=new URLSearchParams({
   site:'test',embed:'1',lang:language,theme,
   thread:/^[a-f0-9]{24}$/.test(current.get('thread')||'')?current.get('thread'):''
  });
  return link.href;
 };
 function renderPreferences(){
  document.documentElement.lang=language==='gr'?'el':'en';
  document.body.classList.toggle('theme-light',theme==='light');
  document.body.classList.toggle('theme-dark',theme!=='light');
  document.querySelectorAll('[data-en][data-gr]').forEach(n=>{
   n.textContent=n.getAttribute(language==='gr'?'data-gr':'data-en');
  });
  const logo=document.querySelector('#brand img');
  if(logo)logo.src='dedsec/Assets/Images/Logos/'+(theme==='light'?'White':'Black')+'%20Purple%20Butterfly%20Logo.jpeg';
  const themeButton=document.getElementById('nav-theme-switcher');
  const icon=themeButton?.querySelector('.nav-theme-label');
  if(icon)icon.innerHTML=theme==='light'?sun:moon;
  if(themeButton)themeButton.setAttribute('aria-label',language==='gr'?'Αλλαγή θέματος':'Change theme');
  const languageButton=document.getElementById('nav-lang-switcher');
  if(languageButton)languageButton.setAttribute('aria-label',language==='gr'?'Change language to English':'Αλλαγή γλώσσας σε Ελληνικά');
  const search=document.getElementById('nav-search');
  if(search){search.title=language==='gr'?'Αναζήτηση στην ιστοσελίδα':'Search the website';search.setAttribute('aria-label',search.title);}
  const home=document.getElementById('nav-home');
  if(home){home.title=language==='gr'?'Λογαριασμός':'Account';home.setAttribute('aria-label',home.title);}
  if(window.DedSecForumUI?.setPreferences)window.DedSecForumUI.setPreferences(language,theme);
 }
 renderPreferences();
 document.getElementById('nav-theme-switcher')?.addEventListener('click',()=>{
  theme=theme==='dark'?'light':'dark';savePref('theme',theme);
  renderPreferences();
  if(liveFrame&&liveReady){liveReady=false;liveFrame.hidden=true;host.hidden=false;liveFrame.src=remoteUrl();}
 });
 document.getElementById('nav-lang-switcher')?.addEventListener('click',()=>{
  language=language==='gr'?'en':'gr';savePref('language',language);
  renderPreferences();
  if(liveFrame&&liveReady){liveReady=false;liveFrame.hidden=true;host.hidden=false;liveFrame.src=remoteUrl();}
 });
 async function loadLocalPreview(){
  try{
   const url=new URL('forum-app.html',location.href);
   const response=await fetch(url,{credentials:'same-origin',cache:'no-store'});
   if(!response.ok)throw Error('forum_markup_unavailable');
   const template=new DOMParser().parseFromString(await response.text(),'text/html');
   const page=template.querySelector('.forum-page');
   const dialog=template.getElementById('forum-dialog');
   if(!page||!dialog||!page.querySelector('#forum-content'))throw Error('invalid_forum_markup');
   host.replaceChildren(document.importNode(page,true),document.importNode(dialog,true));
   window.DEDSEC_FORUM_INLINE=true;
   const script=document.createElement('script');
   script.src=new URL('assets/forum-app.js',location.href).href;
   script.onerror=()=>{host.replaceChildren();if(notice)notice.hidden=false;console.error('DedSec Test Forum script unavailable');};
   document.body.append(script);
  }catch(err){
   host.replaceChildren();
   if(notice)notice.hidden=false;
   console.error('DedSec Test Forum local preview failed:',err);
  }
 }
 window.addEventListener('message',event=>{
  if(!liveFrame||event.source!==liveFrame.contentWindow||
     event.origin!==portal.origin||!event.data||typeof event.data!=='object')return;
  if(event.data.type==='dedsec-forum-ready'){
   liveReady=true;
   host.hidden=true;
   liveFrame.hidden=false;
   if(notice)notice.hidden=true;
  }else if(event.data.type==='dedsec-forum-login'){
   document.getElementById('nav-home')?.click();
  }else if(event.data.type==='dedsec-forum-height'&&Number.isFinite(event.data.height)){
   liveFrame.style.height=Math.max(620,Math.min(15000,event.data.height+24))+'px';
  }else if(event.data.type==='dedsec-forum-route'){
   const id=event.data.threadId,url=new URL(location.href);
   if(id&&/^[a-f0-9]{24}$/.test(id))url.searchParams.set('thread',id);
   else url.searchParams.delete('thread');
   history.replaceState(null,'',url);
  }
 });
 window.addEventListener('dedsec:account-state',()=>{
  if(liveReady)liveFrame?.contentWindow?.postMessage({type:'dedsec-forum-refresh'},portal.origin);
 });
 function connectTestBackend(){
  if(config.profile!=='test'||config.forumReady!==true||
     portal.origin==='https://dedsec-accounts.dedsec-project.workers.dev')return;
  const frame=document.createElement('iframe');
  frame.id='dedsec-forum-live-frame';frame.hidden=true;
  frame.title=language==='gr'?'Ζωντανό φόρουμ DedSec':'Live DedSec community forum';
  frame.referrerPolicy='no-referrer';
  frame.loading='eager';
  host.after(frame);
  liveFrame=frame;frame.src=remoteUrl();
  window.setTimeout(()=>{if(!liveReady&&liveFrame===frame){frame.remove();liveFrame=null;}},9000);
 }
 if(isLive){
  document.getElementById('nav-home')?.addEventListener('click',event=>{
   event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();
   window.DedSecForumUI?.openAccount?.();
  },true);
  const script=document.createElement('script');
  script.src=new URL('assets/forum-live.js',document.baseURI).href;
  script.onerror=()=>{
   if(notice)notice.hidden=false;
   console.error('DedSec Test Forum client unavailable');
  };
  document.body.append(script);
 }else{
  loadLocalPreview();
  connectTestBackend();
 }
})();
