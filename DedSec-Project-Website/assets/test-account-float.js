/* Test-only enhancement for the minimized account control.
   The secure iframe never exposes note contents to the parent page. */
(function(){
 'use strict';
 const t=(en,el)=>document.documentElement.lang==='el'?el:en;
 let dismissed=false,wrap=null,restore=null,dismiss=null,drag=null,suppressClick=false;
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const sync=()=>{if(!wrap||!restore)return;wrap.hidden=dismissed||restore.hidden;};
 function bound(){
  if(!wrap||wrap.hidden||!wrap.style.left)return;
  const rect=wrap.getBoundingClientRect();
  wrap.style.left=clamp(rect.left,0,Math.max(0,innerWidth-rect.width))+'px';
  wrap.style.top=clamp(rect.top,0,Math.max(0,innerHeight-rect.height))+'px';
 }

 function resizeSetup(){
  const dialog=document.getElementById('dedsec-account-window');
  if(!dialog||dialog.querySelector('.account-resize-handle'))return;
  const handle=document.createElement('button');handle.type='button';handle.className='account-resize-handle';
  handle.setAttribute('aria-label',t('Drag to resize floating window','Σύρε για αλλαγή μεγέθους παραθύρου'));
  handle.title=handle.getAttribute('aria-label');dialog.append(handle);
  let active=null;
  handle.addEventListener('pointerdown',e=>{
   if(!e.isPrimary||e.button!==0||!dialog.classList.contains('is-floating'))return;
   e.preventDefault();const box=dialog.getBoundingClientRect();
   active={id:e.pointerId,x:e.clientX,y:e.clientY,width:box.width,height:box.height,left:box.left,top:box.top};
   dialog.style.setProperty('inset','auto','important');
   for(const [key,value] of [['left',box.left+'px'],['top',box.top+'px'],['right','auto'],['bottom','auto']])dialog.style.setProperty(key,value,'important');
   handle.setPointerCapture(e.pointerId);
  });
  handle.addEventListener('pointermove',e=>{
   if(!active||e.pointerId!==active.id)return;
   const maxWidth=Math.max(100,innerWidth-active.left-12),maxHeight=Math.max(120,innerHeight-active.top-12);
   const w=clamp(active.width+e.clientX-active.x,Math.min(200,maxWidth),maxWidth);
   const h=clamp(active.height+e.clientY-active.y,Math.min(180,maxHeight),maxHeight);
   dialog.style.setProperty('width',w+'px','important');dialog.style.setProperty('height',h+'px','important');
  });
  for(const ev of ['pointerup','pointercancel'])handle.addEventListener(ev,e=>{if(active?.id!==e.pointerId)return;active=null;if(handle.hasPointerCapture(e.pointerId))handle.releasePointerCapture(e.pointerId);});
  new MutationObserver(()=>{
   if(!dialog.classList.contains('is-floating')){
    for(const key of ['width','height','left','top','right','bottom','inset'])dialog.style.removeProperty(key);
   }
  }).observe(dialog,{attributes:true,attributeFilter:['class']});
 }
 function upgrade(){
  const b=document.getElementById('dedsec-txt-window-toggle');
  if(!b||b.dataset.floatEnhanced)return;
  b.dataset.floatEnhanced='true';
  restore=b;
  wrap=document.createElement('div');wrap.id='dedsec-txt-float-controls';wrap.hidden=true;
  b.parentNode.insertBefore(wrap,b);wrap.append(b);
  dismiss=document.createElement('button');dismiss.id='dedsec-txt-float-dismiss';dismiss.type='button';dismiss.textContent='×';
  dismiss.setAttribute('aria-label',t('Hide floating icon','Απόκρυψη αιωρούμενου εικονιδίου'));
  dismiss.title=dismiss.getAttribute('aria-label');
  dismiss.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();dismissed=true;wrap.hidden=true;b.hidden=true;});
  wrap.append(dismiss);
  b.setAttribute('aria-label',t('Restore or move floating account','Επαναφορά ή μετακίνηση του αιωρούμενου λογαριασμού'));
  new MutationObserver(sync).observe(b,{attributes:true,attributeFilter:['hidden']});
  b.addEventListener('pointerdown',event=>{
   if(!event.isPrimary||event.button!==0)return;
   const rect=wrap.getBoundingClientRect();
   drag={id:event.pointerId,x:event.clientX,y:event.clientY,left:rect.left,top:rect.top,started:performance.now(),kind:event.pointerType,moved:false};
   b.setPointerCapture(event.pointerId);
  });
  b.addEventListener('pointermove',event=>{
   if(!drag||event.pointerId!==drag.id)return;
   const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
   if(!drag.moved&&(Math.hypot(dx,dy)<6||(drag.kind==='touch'&&performance.now()-drag.started<200)))return;
   drag.moved=true;
   wrap.style.right='auto';wrap.style.bottom='auto';
   wrap.style.left=clamp(drag.left+dx,0,Math.max(0,innerWidth-wrap.offsetWidth))+'px';
   wrap.style.top=clamp(drag.top+dy,0,Math.max(0,innerHeight-wrap.offsetHeight))+'px';
  });
  const finish=event=>{
   if(!drag||event.pointerId!==drag.id)return;
   const moved=drag.moved;drag=null;
   if(b.hasPointerCapture(event.pointerId))b.releasePointerCapture(event.pointerId);
   if(moved){suppressClick=true;setTimeout(()=>{suppressClick=false;},350);}
  };
  b.addEventListener('pointerup',finish);b.addEventListener('pointercancel',finish);
  b.addEventListener('click',event=>{if(!suppressClick)return;suppressClick=false;event.preventDefault();event.stopImmediatePropagation();},true);
  sync();
 }
 document.addEventListener('click',event=>{
  if(event.target.closest('[data-account-toggle],#nav-home,#merged-home')){dismissed=false;sync();}
 },true);
 window.addEventListener('resize',bound);
 new MutationObserver(()=>{upgrade();resizeSetup();}).observe(document.body,{childList:true,subtree:true});
 upgrade();resizeSetup();
})();