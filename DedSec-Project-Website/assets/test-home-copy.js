/* Test home wording: keep the English and Greek copy in one place. */
(function(){
 'use strict';
 const copy={
  en:{
   subtitle:'DedSec Project is a free cybersecurity and automation toolkit for Android via Termux and supported Linux desktops, with one consistent cross-platform workflow.',
   reflection:'Epictetus distinguished what depends on us—our judgments and choices—from what does not. DedSec Project brings that idea to digital life: understand the code, review permissions, and choose consciously what you run and share. Knowledge turns blind trust into informed decisions.'
  },
  el:{
   subtitle:'Το DedSec Project είναι μια δωρεάν συλλογή εργαλείων κυβερνοασφάλειας και αυτοματισμού για Android μέσω Termux και υποστηριζόμενα Linux desktops, με ενιαίο τρόπο χρήσης σε όλες τις πλατφόρμες.',
   reflection:'Ο Επίκτητος ξεχώριζε όσα εξαρτώνται από εμάς —την κρίση και τις επιλογές μας— από όσα δεν εξαρτώνται. Το DedSec Project μεταφέρει αυτή την ιδέα στην ψηφιακή ζωή: κατανοούμε τον κώδικα, ελέγχουμε τα δικαιώματα και επιλέγουμε συνειδητά τι εκτελούμε και τι μοιραζόμαστε. Η γνώση μετατρέπει την τυφλή εμπιστοσύνη σε ενημερωμένη επιλογή.'
  }
 };
 let busy=false;
 function apply(){
  if(busy)return;
  const home=document.querySelector('.desktop-home .home-intro');
  if(!home)return;
  busy=true;
  try{
   const language=document.documentElement.lang==='el'?'el':'en',text=copy[language];
   const subtitle=home.querySelector('.home-subtitle');
   if(subtitle&&subtitle.textContent!==text.subtitle)subtitle.textContent=text.subtitle;
   home.querySelectorAll('.home-about-summary:not(.start-reflection)').forEach(node=>node.remove());
   document.querySelectorAll('.launcher-start .start-reflection').forEach(node=>node.remove());
   const trust=home.querySelector('.home-trust');
   if(trust){
    let reflection=home.querySelector('.start-reflection');
    if(!reflection){reflection=document.createElement('p');reflection.className='start-reflection home-about-summary';trust.insertAdjacentElement('afterend',reflection);}
    if(reflection.textContent!==text.reflection)reflection.textContent=text.reflection;
    home.querySelectorAll('.aristotle-explanation').forEach(node=>node.remove());
   }
  }finally{busy=false;}
 }
 let pending=false;
 const schedule=()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;apply();});};
 new MutationObserver(schedule).observe(document.getElementById('app')||document.body,{childList:true,subtree:true});
 schedule();
})();