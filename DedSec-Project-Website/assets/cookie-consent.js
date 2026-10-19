/* DedSec Test: keep the explicit cookie-consent decision and functional theme/language
   preferences between visits. No saved lessons, bookmarks, or tracking cookies. */
(function(){"use strict";
if(window.DedSecCookies)return;
var KEY="dedsec:cookie-choice",OLD_SESSION="dedsec:consent-this-tab",MEMORY=null,dialog=null,lastFocus=null;
function choice(){
 try{var stored=localStorage.getItem(KEY);if(stored==="accept"||stored==="decline")return stored;}catch(e){}
 return MEMORY;
}
function english(){return document.documentElement.lang!=="el"&&document.documentElement.lang!=="gr";}
function say(en,el){return english()?en:el;}
function migrateAndClean(){
 try{
  var current=localStorage.getItem(KEY);
  var previous=sessionStorage.getItem(OLD_SESSION);
  if(current!=="accept"&&current!=="decline"&&(previous==="accept"||previous==="decline")){
   localStorage.setItem(KEY,previous);MEMORY=previous;
  }
  sessionStorage.removeItem(OLD_SESSION);
 }catch(e){}
 try{localStorage.removeItem("dedsec:bookmarks");}catch(e){}
}
function allow(){return choice()==="accept";}
function enhance(root){
 (root||document).querySelectorAll("img[data-optional-src]").forEach(function(img){
  if(allow()){img.hidden=false;if(!img.getAttribute("src"))img.src=img.getAttribute("data-optional-src");}
  else {img.removeAttribute("src");img.hidden=true;}
 });
}
var source=document.currentScript&&document.currentScript.src;
function privacyUrl(){
 return source?new URL("../dedsec/"+(english()?"":"el/")+"Pages/privacy-policy.html",source).href:"../Pages/privacy-policy.html";
}
function refresh(){
 var btn=document.getElementById("dedsec-cookie-manage");
 if(btn){
  btn.setAttribute("aria-label",say("Cookie preferences","Ρυθμίσεις cookies"));
  btn.title=btn.getAttribute("aria-label");
  var label=btn.querySelector(".app-label");if(label)label.textContent=say("Cookie Preferences","Ρυθμίσεις cookies");
 }
 if(!dialog)return;
 var title=dialog.querySelector("#dedsec-cookie-title"),paragraph=dialog.querySelector("#dedsec-cookie-text"),status=dialog.querySelector("#dedsec-cookie-state");
 title.textContent=say("Your cookie choice","Επιλογές cookies");
 paragraph.textContent=say(
  "This preview remembers your theme, language and cookie-consent choice between visits. It does not save lessons, bookmarks or reading history. Verified GitHub star/fork counts are shown as a snapshot; accepting lets them refresh from GitHub. Reading and searching work either way.",
  "Η δοκιμαστική ιστοσελίδα θυμάται το θέμα, τη γλώσσα και την επιλογή cookies ανάμεσα στις επισκέψεις. Δεν αποθηκεύει μαθήματα, σελιδοδείκτες ή ιστορικό ανάγνωσης. Οι αριθμοί GitHub εμφανίζονται ως αποθηκευμένο στιγμιότυπο· με αποδοχή μπορούν να ενημερωθούν από το GitHub. Η βιβλιοθήκη λειτουργεί και με απόρριψη."
 );
 status.textContent=choice()==="accept"?say("Current choice: optional GitHub statistics enabled","Τρέχουσα επιλογή: στατιστικά GitHub ενεργά"):
 choice()==="decline"?say("Current choice: optional requests disabled","Τρέχουσα επιλογή: προαιρετικά αιτήματα ανενεργά"):
 say("Choose below — both choices keep the library available","Επίλεξε παρακάτω — η βιβλιοθήκη είναι διαθέσιμη και με τις δύο επιλογές");
 var privacy=dialog.querySelector("#dedsec-cookie-privacy");privacy.href=privacyUrl();privacy.textContent=say("Read privacy policy","Διάβασε την Πολιτική Απορρήτου");
 dialog.querySelector('[data-dedsec-cookie="accept"]').innerHTML='<i class="fas fa-check-circle" aria-hidden="true"></i><span>'+say("Accept optional","Αποδοχή προαιρετικών")+'</span>';
 dialog.querySelector('[data-dedsec-cookie="decline"]').innerHTML='<i class="fas fa-times-circle" aria-hidden="true"></i><span>'+say("Decline optional","Απόρριψη προαιρετικών")+'</span>';
}
function close(){
 if(!dialog)return;
 dialog.hidden=true;dialog.setAttribute("aria-hidden","true");
 if(lastFocus&&lastFocus.isConnected&&lastFocus.focus)lastFocus.focus({preventScroll:true});
}
function open(){
 if(!dialog)return;
 lastFocus=document.activeElement;refresh();
 dialog.hidden=false;dialog.setAttribute("aria-hidden","false");
 dialog.querySelector('[data-dedsec-cookie="decline"]').focus({preventScroll:true});
}
function decide(value){
 if(value!=="accept"&&value!=="decline")return;
 MEMORY=value;
 try{localStorage.setItem(KEY,value);}catch(e){}
 enhance();refresh();close();
 document.dispatchEvent(new CustomEvent("dedsec:cookiechoice",{detail:{optional:allow()}}));
}
function create(){
 if(document.getElementById("dedsec-cookie-overlay"))return;
 migrateAndClean();
 dialog=document.createElement("div");
 dialog.id="dedsec-cookie-overlay";dialog.hidden=true;dialog.setAttribute("aria-hidden","true");
 dialog.innerHTML='<div class="dedsec-cookie-panel" role="dialog" aria-modal="true" aria-labelledby="dedsec-cookie-title" aria-describedby="dedsec-cookie-text"><div class="dedsec-cookie-hero"><span aria-hidden="true">✦</span><h2 id="dedsec-cookie-title"></h2></div><p id="dedsec-cookie-text"></p><a id="dedsec-cookie-privacy" href="#"></a><p id="dedsec-cookie-state" aria-live="polite"></p><div class="dedsec-cookie-actions"><button type="button" data-dedsec-cookie="decline"></button><button type="button" data-dedsec-cookie="accept"></button></div></div>';
 document.body.appendChild(dialog);
 document.addEventListener("click",function(e){
  if(e.target.closest("#dedsec-cookie-manage"))open();
 });
 dialog.querySelectorAll("[data-dedsec-cookie]").forEach(function(btn){btn.addEventListener("click",function(){decide(btn.getAttribute("data-dedsec-cookie"));});});
 dialog.addEventListener("keydown",function(e){
  if(e.key==="Escape"&&choice()){e.preventDefault();close();return;}
  if(e.key!=="Tab")return;
  var focusables=dialog.querySelectorAll('a[href],button:not([disabled])'),first=focusables[0],last=focusables[focusables.length-1];
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
  if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
 });
 refresh();enhance();
 if(!choice())open();
}
window.DedSecCookies={allowOptional:allow,enhance:enhance,refresh:refresh,open:open,choice:choice};
migrateAndClean();
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",create,{once:true});else create();
})();