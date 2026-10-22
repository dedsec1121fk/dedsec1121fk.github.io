/* Shared theme & language controls for imported DedSec articles (no second navigation bar). */
(function(){"use strict";
var thisScript=document.currentScript;
var sharedAssets=thisScript?new URL(new URL(thisScript.src).pathname.includes("/dedsec/Assets/")?"../../assets/":"../assets/",thisScript.src):null;
if(thisScript&&!window.DedSecCookies){
 var cookieScript=document.createElement("script");
 cookieScript.src=new URL("cookie-consent.js",sharedAssets).href;
 cookieScript.async=true;document.head.appendChild(cookieScript);
}
var root=document.documentElement;
function prefGet(key,fallback){try{var value=localStorage.getItem("dedsec:"+key);return value===null?fallback:JSON.parse(value);}catch(e){return fallback;}}
function prefSave(key,value){try{localStorage.setItem("dedsec:"+key,JSON.stringify(value));}catch(e){}}
var mode=prefGet("theme","dark")==="light"?"light":"dark";
var lang=document.documentElement.lang==="el"?"gr":"en";
function applyNavContrast(){
 var ink=mode==="light"?"#111":"#fff";
 document.querySelectorAll(".merged-topbar .merged-actions > a,.merged-topbar .merged-actions > button").forEach(function(control){
  control.style.setProperty("color",ink,"important");
  control.style.setProperty("-webkit-text-fill-color",ink,"important");
  control.querySelectorAll("span,i").forEach(function(inner){
   inner.style.setProperty("color",ink,"important");
   inner.style.setProperty("-webkit-text-fill-color",ink,"important");
  });
 });
}
function updateTheme(){
 document.body.classList.remove("merged-light","merged-dark","light-theme","dark-theme");
 document.body.classList.add(mode==="light"?"merged-light":"merged-dark",mode==="light"?"light-theme":"dark-theme");
 var b=document.getElementById("merged-theme");if(b){b.innerHTML=mode==="light"?"<svg class=\"ds-nav-glyph\" viewBox=\"0 0 24 24\" aria-hidden=\"true\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.5\" stroke-linecap=\"round\"><circle cx=\"12\" cy=\"12\" r=\"4.1\"/><path d=\"M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4m0-14.2-1.4 1.4M6.3 17.7l-1.4 1.4\"/></svg>":"<svg class=\"ds-nav-glyph\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M20.7 16.1A8.9 8.9 0 0 1 7.9 3.3a9.2 9.2 0 1 0 12.8 12.8Z\"/></svg>";b.setAttribute("aria-label",mode==="light"?"Switch to dark galaxy":"Switch to lavender galaxy");}
 var logo=document.querySelector(".merged-brand img");
 if(logo){var source=logo.getAttribute("src")||"",next=source.replace(/(?:Black|White)(?:%20| )Purple(?:%20| )Butterfly(?:%20| )Logo\.jpeg/i,(mode==="light"?"White":"Black")+"%20Purple%20Butterfly%20Logo.jpeg");if(next!==source)logo.setAttribute("src",next);}
 var l=document.getElementById("merged-lang");if(l)l.textContent=lang==="gr"?"English":"Ελληνικά";
 var search=document.getElementById("merged-search");if(search){search.setAttribute("aria-label",lang==="gr"?"Αναζήτηση στην ιστοσελίδα":"Search the website");search.title=search.getAttribute("aria-label");}
 var homeLink=document.getElementById("merged-home");if(homeLink){homeLink.setAttribute("aria-label",lang==="gr"?"Λογαριασμός":"Account");homeLink.title=homeLink.getAttribute("aria-label");}
 applyNavContrast();
 if(window.DedSecCookies)window.DedSecCookies.refresh();
 root.style.colorScheme=mode==="light"?"light":"dark";document.querySelectorAll(".merged-footer [data-en][data-gr]").forEach(function(x){x.textContent=x.getAttribute(lang==="gr"?"data-gr":"data-en");});
 decorateArticleLinks();
}
function hrefLanguage(){
 var path=location.pathname;var marker="/dedsec/",p=path.indexOf(marker);if(p<0)return null;
 var start=path.slice(0,p+marker.length),rest=path.slice(p+marker.length);
 if(rest.startsWith("el/"))return start+rest.slice(3);
 return start+"el/"+rest;
}
/* Imported guide titles/subtitles follow the same final punctuation as
   root knowledge headings without touching commands, list items or links. */
function finishPageSentence(value){
 var v=String(value||"").replace(/\s+/g," ").trim();
 return v&&!/[.!?…。！？]$/.test(v)?v+".":v;
}
function finalizeVisiblePageIntro(){
 var selectors=".page-header > h1,.guide-hero > h1,.hero > h1,.merged-generated-intro > h1,.page-header > p,.guide-hero > p,.hero > p,.merged-generated-subtitle";
 document.querySelectorAll(selectors).forEach(function(node){
  if(node.children.length)return;
  node.textContent=finishPageSentence(node.textContent);
 });
}
function completeHeadings(){
 var main=document.querySelector("main")||document.querySelector(".page-content")||document.querySelector(".main-content");
 if(!main)return;
 var heading=document.querySelector("main h1, .page-header h1, .guide-hero h1, .hero h1");
 var desc=document.querySelector('meta[name="description"]');
 var summary=desc?(desc.getAttribute("content")||"").trim():"";
 if(!heading){
  var holder=document.createElement("header");holder.className="merged-generated-intro";
  heading=document.createElement("h1");
  heading.textContent=(document.title||"DedSec Project").replace(/\s*[|—-]\s*DedSec Project.*$/i,"").trim()||"DedSec Project";
  holder.appendChild(heading);main.insertBefore(holder,main.firstChild);
 }
 var group=heading.closest(".page-header,.guide-hero,.hero,.merged-generated-intro")||heading.parentElement;
 if(summary&&group&&!group.querySelector("p,.subtitle,.hero-subtitle,.page-subtitle")){
  var subtitle=document.createElement("p");subtitle.className="merged-generated-subtitle";
  subtitle.textContent=summary;heading.insertAdjacentElement("afterend",subtitle);
 }
}

/* Page-wide presentation applied once per imported HTML document.
   Decorates only actual hyperlinks, without changing their destinations. */
function decorateArticleLinks(){
 document.querySelectorAll(".page-content a[href],.main-content a[href],.merged-footer a[href]").forEach(function(a){
  if(a.matches(".merged-brand,.merged-search,.merged-home"))return;
  if(!a.textContent.trim()&&!a.querySelector("img"))return;
  a.classList.add("dedsec-text-link");
  a.classList.toggle("dedsec-append-arrow",!/[→➜➔➡]\s*$/.test(a.textContent.trim())&&!a.querySelector(".fa-arrow-right,.fa-chevron-right,.fa-arrow-circle-right"));
  var ink=mode==="light"?"#111":"#fff";
  a.style.setProperty("color",ink,"important");
  a.style.setProperty("-webkit-text-fill-color",ink,"important");
  a.style.setProperty("text-decoration-color",ink,"important");
  a.style.setProperty("transition","none","important");
  a.style.setProperty("animation","none","important");
  a.querySelectorAll("span,strong,em,i,h3,h4,.feature-cta").forEach(function(node){
   node.style.setProperty("color",ink,"important");
   node.style.setProperty("-webkit-text-fill-color",ink,"important");
  });
 });
}
/* Clearly labeled groups are easier to scan than unrelated boxes.
   Use native Font Awesome glyphs already bundled for full offline support. */
function categorizeArticleHeadings(){
 var content=document.querySelector(".page-content")||document.querySelector(".main-content");
 if(!content)return;
 content.querySelectorAll("h2").forEach(function(h){
  if(h.classList.contains("merged-topic-heading")||h.closest(".merged-topbar,.merged-footer"))return;
  var word=(h.textContent||"").toLocaleLowerCase(),glyph="fa-book-open";
  if(/install|setup|termux|εγκατάστ|εγκαταστ|ρύθμιση|αρχικ/.test(word))glyph="fa-download";
  else if(/error|fix|assist|troubl|λύση|σφάλ|βοήθ|αντιμετ/.test(word))glyph="fa-tools";
  else if(/linux|ubuntu|kali|mint/.test(word))glyph="fa-laptop";
  else if(/privacy|legal|disclaim|ασφάλ|νομικ|απορρήτ/.test(word))glyph="fa-shield-alt";
  else if(/faq|question|ερωτήσ|ερωτησ/.test(word))glyph="fa-question-circle";
  else if(/sponsor|donat|χορηγ|δωρε/.test(word))glyph="fa-heart";
  else if(/download|release|λήψη|κατέβασε/.test(word))glyph="fa-arrow-down";
  else if(/contact|credits|επικοιν|συντελεστ/.test(word))glyph="fa-envelope";
  else if(/tools|εργαλεί|εργαλει/.test(word))glyph="fa-wrench";
  else if(/requirement|προϋπόθ|απαιτ/.test(word))glyph="fa-check-square";
  h.classList.add("merged-topic-heading");
  var icon=document.createElement("i");icon.className="fas "+glyph+" merged-topic-icon";
  icon.setAttribute("aria-hidden","true");h.insertBefore(icon,h.firstChild);
 });
}


/* The original site JavaScript was intentionally not imported because it
   duplicates navigation; restore only its accessible accordion behavior. */
/* Restore removed legacy copyToClipboard() and the copy-only assistance UI.
   New Clipboard API first; textarea/execCommand fallback for older Android. */
function fallbackCopy(text){
 var el=document.createElement("textarea"),previous=document.activeElement;
 el.value=text;el.readOnly=true;
 el.style.cssText="position:fixed;left:-9999px;top:0;opacity:0;width:1px;height:1px";
 document.body.appendChild(el);el.focus({preventScroll:true});el.select();
 if(el.setSelectionRange)el.setSelectionRange(0,el.value.length);
 var ok=false;try{ok=!!document.execCommand("copy");}catch(e){}
 el.remove();
 try{if(previous&&previous.focus)previous.focus({preventScroll:true});}catch(e){}
 return ok;
}
function updateCopyLabel(button,successful){
 if(!button)return;
 var original=button.dataset.originalCopyLabel||button.textContent.trim()||"Copy";
 button.dataset.originalCopyLabel=original;
 var serial=String((Number(button.dataset.copySerial)||0)+1);
 button.dataset.copySerial=serial;
 button.textContent=successful?(lang==="gr"?"Αντιγράφηκε ✓":"Copied ✓"):(lang==="gr"?"Η αντιγραφή απέτυχε":"Copy failed");
 button.setAttribute("aria-label",button.textContent);
 setTimeout(function(){
  if(button.isConnected&&button.dataset.copySerial===serial){
   button.textContent=original;button.setAttribute("aria-label",original);
  }
 },2000);
}
function copyGuideText(button,text){
 text=String(text||"").replace(/\r\n?/g,"\n");
 if(!text.trim()){updateCopyLabel(button,false);return Promise.resolve(false);}
 // Clipboard API is reliable on the HTTPS live site, with a fallback for
 // permission-denied Android/browser contexts.
 if(window.isSecureContext&&navigator.clipboard&&typeof navigator.clipboard.writeText==="function"){
  try{
   return navigator.clipboard.writeText(text).then(function(){updateCopyLabel(button,true);return true;},function(){
    var fallback=fallbackCopy(text);updateCopyLabel(button,fallback);return fallback;
   });
  }catch(e){}
 }
 var ok=fallbackCopy(text);updateCopyLabel(button,ok);return Promise.resolve(ok);
}
// Legacy onclick attributes in English and Greek installation guides.
window.copyToClipboard=function(button,id){
 var node=document.getElementById(id);
 return copyGuideText(button,node?node.textContent:"");
};
/* Legacy CSS is large and loads in several layers. Lock transparent
   article surfaces inline with !important, so late old rules cannot repaint
   random cards in long Greek or English assistance articles. */
function keepArticleSurfacesTransparent(){
 var selector=".page-content :is(.modal-disclaimer,.feature-card,.content-section,.note,.platform-install-card,.code-container,.copy-btn,.faq-card,.faq-item,.guide-card,.tool-card,.btn,.button,.assistance-guide-section,.assistance-code,.platform-install-body,.info-card,.academy-card,.tool-item,.category,.category-header,.tool-header,.tool-description,.tools-list)";
 document.querySelectorAll(selector).forEach(function(node){
  node.style.setProperty("background","transparent","important");
  node.style.setProperty("background-color","transparent","important");
  node.style.setProperty("background-image","none","important");
  var shell=node.matches(".content-section,.feature-card,.note,.tip,.warning,.platform-install-card,.tool-item,.category,.faq-card,.code-container,.assistance-guide-section,details,.guide-card");
  node.style.setProperty("border",shell?"1px solid var(--glow-line)":"0","important");
  node.style.setProperty("box-shadow",shell?"0 0 9px var(--glow-halo)":"none","important");
  node.style.setProperty("border-radius","0","important");
  node.style.setProperty("transition","none","important");
  node.style.setProperty("animation","none","important");
  if(node.matches("a.btn,a.button")){
   var ink=mode==="light"?"#111":"#fff";
   node.style.setProperty("color",ink,"important");
   node.style.setProperty("-webkit-text-fill-color",ink,"important");
  }
 });
}
function initCopyButtons(){
 // Prevent late-loaded legacy assistance styles from repainting individual
 // copy controls. Inline important styles make the borderless contract stable.
 document.querySelectorAll(".page-content button.copy-btn,.page-content button.assistance-code-copy").forEach(function(button){
  button.style.setProperty("background","transparent","important");
  button.style.setProperty("background-image","none","important");
  button.style.setProperty("border","0","important");
  button.style.setProperty("box-shadow","none","important");
  button.style.setProperty("border-radius","0","important");
  button.style.setProperty("pointer-events","auto","important");
  button.style.setProperty("transition","none","important");
  button.style.setProperty("animation","none","important");
 });
 document.addEventListener("click",function(e){
  var button=e.target.closest("button.copy-btn,button.assistance-code-copy,button.assistance-report-btn");
  if(!button||!button.closest(".page-content")||button.hasAttribute("onclick"))return;
  e.preventDefault();
  var text="";
  if(button.classList.contains("assistance-report-btn")){
   var scope=button.closest(".assistance-guide-section,.content-section")||document;
   var heading=document.querySelector(".page-content h1");
   var paragraphs=[...scope.querySelectorAll("p")].map(function(p){return p.textContent.trim();}).filter(Boolean).slice(0,4);
   var commands=[...document.querySelectorAll(".assistance-code pre code,.code-container pre code")].slice(0,3).map(function(c){return c.textContent.trim();});
   text=[heading?heading.textContent.trim():document.title,paragraphs.join("\n"),"Relevant commands:",commands.join("\n\n")].join("\n\n").trim();
  }else{
   var parent=button.closest(".code-container,.assistance-code,.code-example")||button.parentElement;
   var code=parent&&parent.querySelector("pre code,pre,code");
   if(code)text=code.textContent;
  }
  copyGuideText(button,text);
 });
}


/* Founder story: preserve every word but reduce 27 nested disclosures into
   seven clear parent sections. Child topics become accessible subheadings. */
function combineFoundersSubsections(){
 if(!/\/about-founder\.html$/i.test(location.pathname))return;
 document.querySelectorAll("details.founder-section-disclosure").forEach(function(outer){
  if(outer.parentElement.closest("details.founder-section-disclosure"))return;
  outer.querySelectorAll("details").forEach(function(nested){
   var summary=nested.querySelector(":scope > summary");if(!summary)return;
   var section=document.createElement("section");section.className="founder-related-subsection";
   var heading=document.createElement("div");heading.className="founder-subtopic-heading";
   heading.setAttribute("role","heading");heading.setAttribute("aria-level","3");
   while(summary.firstChild)heading.appendChild(summary.firstChild);
   section.appendChild(heading);
   while(nested.firstChild){if(nested.firstChild===summary){nested.removeChild(summary);continue;}section.appendChild(nested.firstChild);}
   nested.replaceWith(section);
  });
 });
}
function initArticleAccordions(){
 document.querySelectorAll(".category-header,.tool-header").forEach(function(header,index){
  var isCategory=header.classList.contains("category-header");
  var wrapper=header.closest(isCategory?".category":".tool-item");
  if(!wrapper||header.dataset.mergedToggle==="1")return;
  header.dataset.mergedToggle="1";
  header.setAttribute("role","button");
  header.setAttribute("tabindex","0");
  var body=wrapper.querySelector(isCategory?".tools-list":".tool-description");
  if(!header.id)header.id="dedsec-fold-"+index;
  if(body){if(!body.id)body.id=header.id+"-content";header.setAttribute("aria-controls",body.id);}
  header.setAttribute("aria-expanded",wrapper.classList.contains("active")?"true":"false");
  function toggle(e){
   if(e&&e.target.closest("a[href],button,summary"))return;
   var open=wrapper.classList.toggle("active");
   header.setAttribute("aria-expanded",open?"true":"false");
  }
  header.addEventListener("click",toggle);
  header.addEventListener("keydown",function(e){
   if(e.key==="Enter"||e.key===" "){e.preventDefault();toggle(e);}
  });
 });
}

function ready(){
 /* Last stylesheet is shared by every imported Greek/English HTML page. */
 if(thisScript&&!document.getElementById("dedsec-refinement-style")){
  var style=document.createElement("link");style.id="dedsec-refinement-style";
  style.rel="stylesheet";style.href=new URL("refinement.css",sharedAssets).href;
  document.head.appendChild(style);
 }

 /* Imported source pages contain either EN or EL prose; route to the saved
    language counterpart instead of merely relabeling English content. */
 var saved=new URLSearchParams(location.search).get("contentlang")||prefGet("language",null);
 if((saved==="en"||saved==="gr")&&saved!==lang){
  var languageHref=hrefLanguage();
  if(languageHref&&languageHref!==location.pathname){
   location.replace(languageHref+location.search+location.hash);
   return;
  }
 }
 updateTheme();
 completeHeadings();
 finalizeVisiblePageIntro();
 combineFoundersSubsections();
 initArticleAccordions();
 initCopyButtons();
 keepArticleSurfacesTransparent();
 decorateArticleLinks();
 // Some imported pages perform final button/hero styling at the end of load.
 function finalizeVisualSkin(){keepArticleSurfacesTransparent();decorateArticleLinks();}
 if(document.readyState==="complete")finalizeVisualSkin();
 else window.addEventListener("load",finalizeVisualSkin,{once:true});
 var bt=document.getElementById("merged-theme"),bl=document.getElementById("merged-lang");
 var actions=document.querySelector(".merged-actions"),home=document.querySelector(".merged-brand");
 if(actions&&home&&!document.getElementById("merged-home")){
  var homeLink=document.createElement("a");homeLink.id="merged-home";homeLink.className="merged-home";
  homeLink.href="#account";homeLink.dataset.accountToggle="";homeLink.setAttribute("role","button");homeLink.setAttribute("aria-label",lang==="gr"?"Λογαριασμός":"Account");homeLink.title=homeLink.getAttribute("aria-label");
  homeLink.innerHTML="<svg class=\"ds-nav-glyph\" viewBox=\"0 0 24 24\" aria-hidden=\"true\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 22v-3a8 8 0 0 1 16 0v3M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0\"/></svg>";actions.appendChild(homeLink);
 }
 // Keep the Home button last even if the importer or a historical page
 // already contributed one. Do not let a preceding control hide it.
 var navHome=document.getElementById("merged-home");
 if(navHome&&actions&&actions.lastElementChild!==navHome)actions.appendChild(navHome);
 if(actions&&home&&!document.getElementById("merged-search")){
  var link=document.createElement("a");link.id="merged-search";link.className="merged-search";link.href=home.href.split("#")[0]+"?search=1#library";
  link.innerHTML="<svg class=\"ds-nav-glyph\" viewBox=\"0 0 24 24\" aria-hidden=\"true\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.7\" stroke-linecap=\"round\"><circle cx=\"10.4\" cy=\"10.4\" r=\"6.4\"/><path d=\"m15.3 15.3 6 6\"/></svg>";link.setAttribute("aria-label",lang==="gr"?"Αναζήτηση στην ιστοσελίδα":"Search the website");
  link.title=link.getAttribute("aria-label");actions.insertBefore(link,actions.firstChild);
 }
 var existingSearch=document.getElementById("merged-search");
 if(existingSearch&&home)existingSearch.href=home.href.split("#")[0].split("?")[0]+"?search=1#library";
 applyNavContrast();
 if(bt)bt.addEventListener("click",function(){mode=mode==="dark"?"light":"dark";prefSave("theme",mode);updateTheme();});
 if(bl)bl.addEventListener("click",function(){lang=lang==="gr"?"en":"gr";prefSave("language",lang);var u=hrefLanguage();if(u)location.href=u;else updateTheme();});
 document.querySelectorAll(".merged-footer [data-en][data-gr]").forEach(function(x){x.textContent=x.getAttribute(lang==="gr"?"data-gr":"data-en");});

 // Seven-tap Easter egg is reversible without browser modal dialogs.
 var brand=document.querySelector(".merged-brand"),tap=0,lastTap=0,broken=false;
 if(brand)brand.addEventListener("click",function(e){
   var now=Date.now();if(now-lastTap>1800)tap=0;lastTap=now;tap++;
   if(tap>=7){e.preventDefault();tap=0;if(broken)return;broken=true;
     document.body.classList.add("merged-broken");
     var overlay=document.createElement("div");overlay.className="merged-collapse";overlay.id="merged-collapse";overlay.setAttribute("role","dialog");overlay.setAttribute("aria-modal","true");
     overlay.innerHTML='<div class="merged-collapse-crack" aria-hidden="true"></div><button class="merged-restore" type="button">'+(lang==="gr"?"Επαναφορά σελίδας":"Restore page")+'</button>';
     document.body.appendChild(overlay);
     overlay.querySelector("button").addEventListener("click",function(){document.body.classList.remove("merged-broken");overlay.remove();broken=false;});
     overlay.querySelector("button").focus();
   }
 });
 document.addEventListener("keydown",function(e){if(e.key==="Escape"){var o=document.getElementById("merged-collapse");if(o)o.querySelector("button").click();}});

}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",ready);else ready();
})();
