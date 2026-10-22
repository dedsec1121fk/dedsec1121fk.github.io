/* Measured startup gate: critical local resources, basic DedSec pages, fonts and
 * first paint. Percentages describe weighted startup work, never network bytes. */
(function(){'use strict';
const script=document.currentScript,assets=new URL('.',script.src),root=document.documentElement;
let mode='dark',locale=/^(el|gr)/i.test(root.lang)?'el':'en';try{mode=JSON.parse(localStorage.getItem('dedsec:theme'))==='light'?'light':'dark';if(JSON.parse(localStorage.getItem('dedsec:language'))==='gr')locale='el';}catch(e){}
const requestedLanguage=new URLSearchParams(location.search).get('contentlang');if(requestedLanguage==='en')locale='en';if(requestedLanguage==='gr')locale='el';
// A successful visit suppresses repeated full-screen gates within this tab and
// website scope. Never store private data, and never remember a failed load.
const bootKey='dedsec:boot-ready:'+new URL('../',assets).href+':'+(new URL(script.src).searchParams.get('v')||'source');
let foreground=true;try{foreground=sessionStorage.getItem(bootKey)!=='ready';}catch(e){}
if(root.dataset.accountEmbedded==='true'){foreground=false;const frameTheme=new URLSearchParams(location.search).get('theme');if(['dark','light'].includes(frameTheme)){mode=frameTheme;try{localStorage.setItem('dedsec:theme',JSON.stringify(mode));}catch(e){}}}
root.dataset.theme=mode;if(foreground)root.classList.add('site-loading');
const labels=locale==='el'?{loading:'Φόρτωση DedSec Project',failed:'Η φόρτωση δεν ολοκληρώθηκε.',retry:'Επανάληψη',continue:'Συνέχεια στη σελίδα',help:'Οδηγός εγκατάστασης'}:{loading:'Loading DedSec Project',failed:'Loading could not finish.',retry:'Retry',continue:'Continue to page',help:'Installation guide'};
const wallpaper=new URL('starfield-'+mode+'.svg',assets).href,logo=new URL('../dedsec/Assets/Images/Logos/'+(mode==='dark'?'Black':'White')+'%20Purple%20Butterfly%20Logo.jpeg',assets).href;
const style=document.createElement('style');style.textContent=`#site-loader{display:none}html.site-loading body>:not(#site-loader){visibility:hidden!important;opacity:0!important;pointer-events:none!important}html.site-loading #site-loader{display:flex!important;visibility:visible!important}#site-loader{position:fixed;inset:0;z-index:2147483000;align-items:center;justify-content:center;flex-direction:column;gap:24px;background-color:${mode==='dark'?'#05030d':'#f0e7ff'};background-image:linear-gradient(${mode==='dark'?'#05030d88,#13051e99':'#efe6ff77,#d8c5ed77'}),url("${wallpaper}");background-size:cover,890px 650px;color:${mode==='dark'?'#fff':'#17101e'};font:16px Tahoma,Arial,sans-serif;text-align:center;padding:24px;box-sizing:border-box}#site-loader img{width:clamp(110px,22vw,170px);height:clamp(110px,22vw,170px);object-fit:contain;display:block}#site-loader .startup-meter{width:min(320px,80vw);height:12px;border:1px solid currentColor;overflow:hidden;background:${mode==='dark'?'#160d27':'#e0cdec'}}#site-loader .startup-fill{height:100%;width:100%;background:linear-gradient(90deg,#e85e91,#bd69f1,#6e75ed,#36cddd,#81da83,#ffd570);transform:scaleX(0);transform-origin:left;transition:transform .12s linear}#site-loader .startup-number{display:none!important}#site-loader .startup-status{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}#site-loader[data-startup-error] .startup-status{position:static;width:auto;height:auto;margin:0;overflow:visible;clip-path:none;white-space:normal}#site-loader .startup-actions{display:flex;gap:12px;flex-wrap:wrap;justify-content:center}#site-loader button,#site-loader a{font:inherit;color:inherit;background:transparent;border:1px solid currentColor;padding:.5rem .7rem;cursor:pointer;text-decoration:none}#site-loader [hidden]{display:none!important}@media(prefers-reduced-motion:reduce){#site-loader .startup-fill{transition:none}}`;
document.head.append(style);
const state={presentation:foreground?'foreground':'background',status:'loading',value:0,resources:0,search:0,cache:{ratio:0,status:'pending'},errors:[]};window.__DEDSEC_BOOT__=state;
let domReady=false,done=false,finishing=false,failed=false,rendered=-1,watchdog;
const published=/[?&]v=[a-f0-9]{12}(?:&|$)/.test(script.src);
function activity(){clearTimeout(watchdog);watchdog=setTimeout(()=>failure("No loading progress for 120 seconds"),120000);}
function overlay(){return document.getElementById('site-loader');}
function draw(value){state.value=Math.max(state.value,Math.min(100,Math.round(value)));const box=overlay();if(!box||rendered===state.value)return;rendered=state.value;box.querySelector('[role=progressbar]').setAttribute('aria-valuenow',String(state.value));box.querySelector('.startup-fill').style.transform='scaleX('+(state.value/100)+')';box.querySelector('.startup-number').textContent=state.value+'%';}
function install(){if(!foreground&&!failed)return;if(!document.body)return;document.body.classList.add('theme-'+mode);document.body.setAttribute('aria-busy','true');if(overlay())return;const box=document.createElement('div');box.id='site-loader';box.tabIndex=-1;box.setAttribute('role','status');box.setAttribute('aria-label',labels.loading);const image=document.createElement('img');image.src=logo;image.alt='DedSec Project';image.width=170;image.height=170;const meter=document.createElement('div');meter.className='startup-meter';meter.setAttribute('role','progressbar');meter.setAttribute('aria-label',labels.loading);meter.setAttribute('aria-valuemin','0');meter.setAttribute('aria-valuemax','100');meter.innerHTML='<div class="startup-fill"></div>';const number=document.createElement('p');number.className='startup-number';number.setAttribute('aria-hidden','true');const status=document.createElement('p');status.className='startup-status';status.textContent=failed?labels.failed:labels.loading;const actions=document.createElement('div');actions.className='startup-actions';actions.hidden=!failed;const retry=document.createElement('button');retry.type='button';retry.textContent=labels.retry;retry.onclick=()=>location.reload();const proceed=document.createElement('button');proceed.type='button';proceed.textContent=labels.continue;proceed.onclick=()=>dismiss('degraded');const help=document.createElement('a');help.textContent=labels.help;help.href=new URL('../dedsec/'+(locale==='el'?'el/':'')+'Pages/guide-for-installation.html',assets).href;actions.append(retry,proceed,help);box.append(image,meter,number,status,actions);document.body.prepend(box);draw(state.value);}
function resources(){const nodes=[...document.querySelectorAll('link[rel=stylesheet],script[src]')].filter(n=>{try{return !n.async&&[location.origin,assets.origin].includes(new URL(n.href||n.src).origin);}catch(e){return false;}});const loaded=nodes.filter(n=>n.dataset.bootLoaded==='1'||(n.tagName==='LINK'&&n.sheet)).length;state.resources=nodes.length?loaded/nodes.length:1;draw(document.readyState==='loading'?Math.min(30,4+loaded*2):4+state.resources*20+state.search*10+state.cache.ratio*55);}
function dismiss(status){if(done)return;done=true;state.status=status;if(status==='ready'){try{sessionStorage.setItem(bootKey,'ready');}catch(e){}}root.classList.remove('site-loading');document.body?.removeAttribute('aria-busy');overlay()?.remove();clearTimeout(watchdog);bodyObserver.disconnect();window.dispatchEvent(new Event('dedsec:visible'));}
function failure(reason){if(done||failed)return;failed=true;foreground=true;root.classList.add('site-loading');state.status='failed';state.errors.push(reason);install();const box=overlay();if(box){box.dataset.startupError=reason;box.querySelector('.startup-status').textContent=labels.failed;box.querySelector('.startup-actions').hidden=false;}}
let warming;
async function warmSite(){
 if(warming)return warming;
 warming=(async()=>{
  if(assets.origin!==location.origin){state.cache={ratio:1,status:'account-portal'};return;}
  if(!published){state.cache={ratio:1,status:'source'};return;}
  if(!('serviceWorker' in navigator)||!window.isSecureContext)throw Error('Basic-page caching requires HTTPS or localhost');
  const response=await fetch(new URL('../startup-manifest.json',assets),{cache:'no-store'});if(!response.ok)throw Error('Missing startup manifest');const manifest=await response.json();
  state.cache={ratio:0,status:'downloading',files:manifest.resources.length,total:manifest.bytes};activity();
  const scope=new URL('../',assets).pathname,existing=await navigator.serviceWorker.getRegistration(scope);let registration;try{registration=await navigator.serviceWorker.register(new URL('../offline-worker.js',assets),{scope,updateViaCache:'none'});}catch(error){if(!existing?.active)throw error;registration=existing;}
  await navigator.serviceWorker.ready;
  const worker=registration.active||registration.waiting;if(!worker)throw Error('Website cache worker unavailable');
  const result=await new Promise((resolve,reject)=>{const channel=new MessageChannel();channel.port1.onmessage=event=>{const update=event.data;activity();if(update.error){channel.port1.close();reject(Error(update.error));return;}state.cache={...state.cache,...update,status:update.done?'complete':'downloading'};if(update.count&&overlay()&&(!state.cache.labelAt||Date.now()-state.cache.labelAt>250)){state.cache.labelAt=Date.now();overlay().querySelector('.startup-status').textContent=(locale==='el'?'Προετοιμασία ιστοσελίδας: ':'Preparing website: ')+update.count+' / '+update.files+(locale==='el'?' αρχεία':' files');}resources();if(update.done){channel.port1.close();resolve(update);}};worker.postMessage({type:'WARM_SITE',manifest},[channel.port2]);});
  if(result.previousVersion&&result.previousVersion!==manifest.version&&navigator.serviceWorker.controller){
   const key='dedsec:loaded-cache-version';let reload=true;try{reload=sessionStorage.getItem(key)!==manifest.version;sessionStorage.setItem(key,manifest.version);}catch(e){}
   if(reload){location.reload();await new Promise(()=>{});}
  }
 })();return warming;
}
async function finish(){if(done||finishing||!domReady)return;if(document.getElementById('app')&&!window.__dedsecUIReady)return;resources();if(state.errors.length){failure('critical resource');return;}if(state.resources<1)return;finishing=true;
 try{
  await warmSite();if(done||failed)return;draw(92);
  // Decode every local image on the open page, both galaxies, and active fonts.
  const images=[...document.images].filter(i=>i.getAttribute('src')&&[location.origin,assets.origin].includes(new URL(i.src).origin));
  for(const i of images)i.loading='eager';
  for(const name of ['starfield-dark.svg','starfield-light.svg']){const i=new Image();i.src=new URL(name,assets).href;images.push(i);}
  await Promise.all(images.map(i=>i.decode?i.decode():new Promise((resolve,reject)=>{if(i.complete){i.naturalWidth?resolve():reject(Error('Image unavailable'));return;}i.onload=resolve;i.onerror=reject;})));
  await document.fonts?.ready;draw(97);
  requestAnimationFrame(()=>requestAnimationFrame(()=>{if(failed||done)return;resources();if(state.resources<1){finishing=false;return;}draw(100);requestAnimationFrame(()=>dismiss('ready'));}));
 }catch(error){failure(String(error.message||error));}
}

window.DedSecBoot={progress(ratio){state.search=Math.max(state.search,Math.min(1,ratio));resources();},ready:finish};
const bodyObserver=new MutationObserver(()=>{install();if(document.body)bodyObserver.disconnect();});bodyObserver.observe(root,{childList:true,subtree:true});install();draw(4);
document.addEventListener('load',e=>{if(e.target.matches?.('script[src],link[rel=stylesheet]')){e.target.dataset.bootLoaded='1';resources();finish();}},true);
document.addEventListener('error',e=>{if(e.target.matches?.('script[src],link[rel=stylesheet]')){try{if([location.origin,assets.origin].includes(new URL(e.target.src||e.target.href).origin)){state.errors.push('resource '+(e.target.src||e.target.href));failure('critical resource');}}catch(ignore){}}},true);
document.addEventListener('DOMContentLoaded',()=>{domReady=true;document.querySelectorAll('script[src]').forEach(n=>n.dataset.bootLoaded='1');resources();finish();});
window.addEventListener('dedsec:ready',finish);
document.addEventListener('focusin',e=>{const box=overlay();if(!done&&box&&!box.contains(e.target))box.focus({preventScroll:true});});
activity();
})();
