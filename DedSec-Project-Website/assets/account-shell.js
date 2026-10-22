/* Shared account surface. Parent pages never receive notes, credentials or tokens. */
(function(){'use strict';
 const config=window.DEDSEC_ACCOUNT_SHELL||{},liveConfig=window.DEDSEC_ACCOUNT_CONFIG;
 const gr=()=>document.documentElement.lang==='el',tr=(en,el)=>gr()?el:en;
 if(liveConfig?.embedded){
  const parentOrigin=liveConfig.parentOrigin,bridge=liveConfig.bridge;
  const notify=()=>{if(window.parent!==window)window.parent.postMessage({type:'dedsec-account-state',bridge,signedIn:Boolean(window.DedSecAccountLive?.signedIn)},parentOrigin);};
  document.documentElement.classList.add('account-embedded');
  window.addEventListener('dedsec:account-state',()=>{notify();quickActions();});
  function quickActions(){if(!window.DedSecAccountLive?.signedIn||document.getElementById('account-quick-actions'))return;
   const bar=document.createElement('div');bar.id='account-quick-actions';bar.className='account-toolbar';
   for(const [id,en,el] of [['account-new-file','New TXT','Νέο TXT'],['account-open-files','Load TXT','Άνοιγμα TXT'],['account-new-folder','New folder','Νέος φάκελος'],['account-open-folder','Load folder','Άνοιγμα φακέλου']]){const original=document.getElementById(id);if(!original||original.hidden)continue;const button=document.createElement('button');button.type='button';button.textContent=tr(en,el);button.addEventListener('click',()=>original.click());bar.append(button);}
   document.getElementById('account-profile').prepend(bar);
   const float=document.createElement('button');float.type='button';float.textContent=tr('Float TXT window','Αιωρούμενο παράθυρο TXT');float.addEventListener('click',()=>window.parent.postMessage({type:'dedsec-account-float',bridge},parentOrigin));bar.append(float);
  }
  window.addEventListener('message',e=>{if(e.origin!==parentOrigin||e.source!==window.parent||e.data?.bridge!==bridge)return;if(e.data.type==='dedsec-account-check')notify();if(e.data.type==='dedsec-account-theme'&&['dark','light'].includes(e.data.theme)){const light=e.data.theme==='light';document.documentElement.dataset.theme=e.data.theme;for(const name of ['theme-light','light-theme'])document.body.classList.toggle(name,light);for(const name of ['theme-dark','dark-theme'])document.body.classList.toggle(name,!light);}});
  document.addEventListener('DOMContentLoaded',()=>{quickActions();notify();});return;
 }
 if(window.parent!==window)return;
 // One visible, localized navigation system on root and imported pages.
 function labelNavigation(){
  const greek=gr();
  for(const [selector,en,el] of [['#nav-search,#merged-search','Search','Αναζήτηση'],['#nav-home,#merged-home','Account','Λογαριασμός'],['#nav-theme-switcher,#merged-theme','Theme','Θέμα']]){
   const control=document.querySelector(selector);if(!control)continue;
   if(en==='Search')control.style.setProperty('border','1px solid currentColor','important');
   let caption=control.querySelector('.ds-nav-caption');
   if(!caption){caption=document.createElement('span');caption.className='ds-nav-caption';control.append(caption);}
   const text=greek?el:en;if(caption.textContent!==text)caption.textContent=text;
  }
  const language=document.querySelector('#nav-lang-switcher,#merged-lang');
  if(language){
   let label=language.querySelector('.ds-language-label')||language.querySelector('span');
   if(!label){label=document.createElement('span');language.replaceChildren(label);}
   label.classList.add('ds-nav-caption','ds-language-label');
   const text=greek?'English':'Ελληνικά';if(label.textContent!==text)label.textContent=text;
   label.style.setProperty('font-size','11px','important');label.style.setProperty('letter-spacing','0','important');
   if(!language.querySelector('.ds-language-globe')){
    const globe=document.createElementNS('http://www.w3.org/2000/svg','svg');
    globe.setAttribute('class','ds-nav-glyph ds-language-globe');globe.setAttribute('viewBox','0 0 24 24');globe.setAttribute('aria-hidden','true');
    globe.setAttribute('fill','none');globe.setAttribute('stroke','currentColor');globe.setAttribute('stroke-width','1.8');
    globe.innerHTML='<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18M5 6.5h14M5 17.5h14"/>';
    language.prepend(globe);
   }
  }
 }
 labelNavigation();
 const navigation=document.querySelector('#topbar,.merged-topbar');
 if(navigation)new MutationObserver(labelNavigation).observe(navigation,{childList:true,subtree:true});
 new MutationObserver(labelNavigation).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
 // Load behavior from the shared shell, never from generated profile configuration.
 const script=document.currentScript;
 if(!document.getElementById('dedsec-account-float-script')){
  const enhancement=document.createElement('script');enhancement.id='dedsec-account-float-script';
  enhancement.src=new URL('test-account-float.js',script.src).href;document.head.append(enhancement);
 }
 const home=new URL('../index.html',script.src),portal=new URL(config.portal||'https://dedsec-test-accounts.dedsec-project.workers.dev');
 let dialog,frame,floatButton,opener,mode='modal',signedIn=false;
 const bridge=[...crypto.getRandomValues(new Uint8Array(16))].map(x=>x.toString(16).padStart(2,'0')).join('');
 function currentTheme(){return document.body.matches('.theme-light,.light-theme')?'light':document.body.matches('.theme-dark,.dark-theme')?'dark':document.documentElement.dataset.theme==='light'?'light':'dark';}
 function minimize(){if(!dialog?.open)return;dialog.close();floatButton.hidden=false;opener?.setAttribute('aria-expanded','false');floatButton.focus({preventScroll:true});}
 function close(){if(!dialog?.open)return;dialog.close();if(signedIn)floatButton.hidden=false;opener?.setAttribute('aria-expanded','false');opener?.focus({preventScroll:true});}
 function show(floating=false){create();syncLanguage();if(dialog.open)dialog.close();mode=floating?'floating':'modal';dialog.classList.toggle('is-floating',floating);if(floating)dialog.show();else dialog.showModal();floatButton.hidden=true;frame.contentWindow?.postMessage({type:'dedsec-account-theme',bridge,theme:currentTheme()},portal.origin);opener?.setAttribute('aria-expanded','true');}
 function create(){if(dialog)return;
  dialog=document.createElement('dialog');dialog.id='dedsec-account-window';dialog.className='account-window';dialog.setAttribute('aria-label',tr('Your account and TXT notes','Λογαριασμός και σημειώσεις TXT'));
  const bar=document.createElement('div');bar.className='account-window-bar';
  const title=document.createElement('strong');title.textContent=tr('Account','Λογαριασμός');
  const toggle=document.createElement('button');toggle.type='button';toggle.textContent='−';toggle.setAttribute('aria-label',tr('Minimize account','Ελαχιστοποίηση λογαριασμού'));toggle.title=toggle.getAttribute('aria-label');toggle.addEventListener('click',minimize);
  const hide=document.createElement('button');hide.type='button';hide.textContent=tr('Close','Κλείσιμο');hide.addEventListener('click',close);bar.append(title,toggle,hide);
  frame=document.createElement('iframe');frame.title=tr('Secure account','Ασφαλής λογαριασμός');frame.referrerPolicy='no-referrer';
  const url=new URL(gr()?'/dedsec/el/Pages/account.html':'/dedsec/Pages/account.html',portal);url.search=new URLSearchParams({embed:'1',site:config.profile||'test',parent:location.origin,bridge,theme:currentTheme()});frame.src=url.href;
  const fallback=document.createElement('a');fallback.className='account-window-fallback';fallback.textContent=tr('If your browser blocks embedded sign-in, open the secure portal','Αν ο browser εμποδίζει την ενσωματωμένη σύνδεση, άνοιξε την ασφαλή πύλη');const standalone=new URL(url);for(const key of ['embed','parent','bridge'])standalone.searchParams.delete(key);fallback.href=standalone.href;fallback.target='_blank';fallback.rel='noopener noreferrer';
  dialog.append(bar,frame,fallback);document.body.append(dialog);dialog.addEventListener('cancel',e=>{e.preventDefault();close();});dialog.addEventListener('click',e=>{if(e.target===dialog)close();});
  floatButton=document.createElement('button');floatButton.type='button';floatButton.id='dedsec-txt-window-toggle';floatButton.className='txt-window-toggle';floatButton.textContent='↗';floatButton.setAttribute('aria-label',tr('Restore account window','Επαναφορά παραθύρου λογαριασμού'));floatButton.title=floatButton.getAttribute('aria-label');floatButton.hidden=true;floatButton.addEventListener('click',()=>show(true));document.body.append(floatButton);
 }
 function syncLanguage(){if(!frame)return;const wanted=gr()?'/dedsec/el/Pages/account.html':'/dedsec/Pages/account.html';const current=new URL(frame.src);if(current.pathname===wanted)return;current.pathname=wanted;frame.src=current.href;const standalone=new URL(current);for(const key of ['embed','parent','bridge'])standalone.searchParams.delete(key);dialog.querySelector('.account-window-fallback').href=standalone.href;dialog.setAttribute('aria-label',tr('Your account and TXT notes','Λογαριασμός και σημειώσεις TXT'));dialog.querySelector('.account-window-bar strong').textContent=tr('Account','Λογαριασμός');}
 document.addEventListener('click',e=>{const control=e.target.closest('[data-account-toggle],#nav-home,#merged-home');if(!control)return;e.preventDefault();opener=control;show();});
 document.addEventListener('keydown',e=>{if(e.key===' '&&e.target.matches('[data-account-toggle],#nav-home,#merged-home')){e.preventDefault();e.target.click();}});
 window.addEventListener('message',e=>{if(e.origin!==portal.origin||e.source!==frame?.contentWindow||e.data?.bridge!==bridge)return;if(e.data.type==='dedsec-account-state'){signedIn=e.data.signedIn===true;if(!signedIn)floatButton.hidden=true;else if(!dialog.open)floatButton.hidden=false;}if(e.data.type==='dedsec-account-float')show(true);if(e.data.type==='dedsec-account-deleted'){signedIn=false;floatButton.hidden=true;setTimeout(()=>location.assign(home.href),3500);}});
})();

