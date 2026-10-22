/* DedSec Project — bilingual offline-first galaxy desktop and local knowledge search. */
(function(){"use strict";
var APP_ICONS={"search":"<rect x=\"5\" y=\"6\" width=\"37\" height=\"34\" fill=\"#5b447e\"/><rect x=\"9\" y=\"10\" width=\"29\" height=\"26\" fill=\"#c6dbf3\"/><path d=\"M13 15h13v3H13zm0 6h8v3h-8z\" fill=\"#7562af\"/><circle cx=\"27\" cy=\"25\" r=\"9\" fill=\"#5a437e\"/><circle cx=\"27\" cy=\"25\" r=\"5\" fill=\"#e7fbff\"/><path d=\"m33 31 9 9-4 4-9-9\" fill=\"#e9bd74\"/>","languages":"<path d=\"M3 10h18l3 3 3-3h18v33H27l-3 3-3-3H3z\" fill=\"#604989\"/><path d=\"M7 14h13l3 3v24l-3-2H7zm21 3 3-3h10v25H30l-2 2z\" fill=\"#e9e3ff\"/><path d=\"M11 24h7v3h-3v3h3v3h-7zm23 0h7v9h-7v-3h3v-3h-3z\" fill=\"#7657b3\"/><path d=\"M26 20h4l-8 17h-4z\" fill=\"#c8a1e9\"/>","errors":"<rect x=\"7\" y=\"7\" width=\"33\" height=\"34\" fill=\"#563b79\"/><rect x=\"10\" y=\"10\" width=\"27\" height=\"28\" fill=\"#e9dcff\"/><path d=\"M23 13 37 35H9z\" fill=\"#f3c45e\"/><path d=\"M21 19h4v9h-4zM21 30h4v4h-4z\" fill=\"#654363\"/><rect x=\"11\" y=\"41\" width=\"31\" height=\"3\" fill=\"#8b70ad\"/>","reverse":"<rect x=\"10\" y=\"8\" width=\"28\" height=\"31\" fill=\"#432e75\"/><rect x=\"13\" y=\"11\" width=\"22\" height=\"25\" fill=\"#7e6cb6\"/><path d=\"M16 14h16v18H16z\" fill=\"#d3bff4\"/><rect x=\"20\" y=\"18\" width=\"8\" height=\"9\" fill=\"#504288\"/><path d=\"M6 15h5v3H6zm0 10h5v3H6zm0 10h5v3H6zm32-20h5v3h-5zm0 10h5v3h-5zm0 10h5v3h-5zm-16-12h12v3H22z\" fill=\"#eac870\"/>","security":"<path d=\"M24 3 41 10v16c0 10-7 17-17 22C14 43 7 36 7 26V10z\" fill=\"#59427f\"/><path d=\"M24 8 36 13v13c0 7-5 13-12 17-7-4-12-10-12-17V13z\" fill=\"#c5adf2\"/><path d=\"m17 25 5 5 11-13 4 4-15 17-9-9z\" fill=\"#487d79\"/>","code":"<rect x=\"3\" y=\"9\" width=\"42\" height=\"32\" fill=\"#42305f\"/><rect x=\"6\" y=\"12\" width=\"36\" height=\"26\" fill=\"#181c35\"/><path d=\"M11 18h8v3h-8zm0 6h4v3h-4zm9 0h12v3H20zm-9 6h22v3H11z\" fill=\"#a3e8cb\"/><rect x=\"9\" y=\"6\" width=\"28\" height=\"4\" fill=\"#b0a7d2\"/><rect x=\"7\" y=\"39\" width=\"37\" height=\"3\" fill=\"#9a82bd\"/>","algorithms":"<rect x=\"17\" y=\"4\" width=\"14\" height=\"10\" fill=\"#6f569d\"/><rect x=\"20\" y=\"7\" width=\"8\" height=\"4\" fill=\"#ddd0ff\"/><rect x=\"22\" y=\"14\" width=\"4\" height=\"11\" fill=\"#f1d084\"/><rect x=\"7\" y=\"25\" width=\"34\" height=\"4\" fill=\"#f1d084\"/><rect x=\"7\" y=\"25\" width=\"4\" height=\"6\" fill=\"#f1d084\"/><rect x=\"37\" y=\"25\" width=\"4\" height=\"6\" fill=\"#f1d084\"/><rect x=\"3\" y=\"31\" width=\"16\" height=\"13\" fill=\"#7a65a7\"/><rect x=\"29\" y=\"31\" width=\"16\" height=\"13\" fill=\"#5c7f96\"/><rect x=\"6\" y=\"34\" width=\"10\" height=\"7\" fill=\"#d8c5f0\"/><rect x=\"32\" y=\"34\" width=\"10\" height=\"7\" fill=\"#bfdce3\"/>","methods":"<path d=\"M24 5c-10 0-16 7-16 16 0 7 4 10 8 13v5h16v-5c5-4 8-7 8-13 0-9-6-16-16-16z\" fill=\"#7553a4\"/><path d=\"M24 10c-7 0-11 5-11 11 0 5 4 8 7 11h8c4-4 7-7 7-11 0-6-5-11-11-11z\" fill=\"#ffefb0\"/><path d=\"M20 22h8v10h-8z\" fill=\"#e7b873\"/><path d=\"M17 36h14v4H17zm2 6h10v3H19z\" fill=\"#c8a8e9\"/>","paths":"<path d=\"M8 7h28l6 7v29H8z\" fill=\"#4f3973\"/><path d=\"M11 10h23v7h5v23H11z\" fill=\"#e5d9f7\"/><path d=\"M13 32h10v-9h4v9h7v4H13z\" fill=\"#7d65bb\"/><path d=\"m27 24 8 9-8 8v-5H16v-4h11z\" fill=\"#69a49c\"/>","topics":"<path d=\"M4 12h17l5 6h18v25H4z\" fill=\"#735a99\"/><path d=\"M7 15h13l4 6h17v18H7z\" fill=\"#e5b96f\"/><path d=\"M7 22h34v4H7z\" fill=\"#ffe4a9\"/><path d=\"M12 31h23v4H12z\" fill=\"#ac7c58\"/>","fund":"<path d=\"M5 7h16l3 4 3-4h16v36H5z\" fill=\"#4a3571\"/><path d=\"M8 10h12l4 4v24H8zm20 0h12v28H24V14z\" fill=\"#e8dbf7\"/><path d=\"M12 18h9v3h-9zm0 7h9v3h-9zm16-7h9v3h-9zm0 7h9v3h-9z\" fill=\"#ae91d4\"/><rect x=\"21\" y=\"37\" width=\"6\" height=\"4\" fill=\"#8f6cab\"/>","knowledge":"<path d=\"M8 8h9v33H8z\" fill=\"#e4b46b\"/><path d=\"M17 5h9v36h-9z\" fill=\"#7c63ac\"/><path d=\"M26 10h9v31h-9z\" fill=\"#92afb9\"/><path d=\"M35 8h7v33h-7z\" fill=\"#cf8dab\"/><path d=\"M10 16h5v3h-5zm9-6h5v3h-5zm0 8h5v3h-5zm9-2h5v3h-5zm9-2h3v3h-3z\" fill=\"#fff3e4\"/><rect x=\"6\" y=\"41\" width=\"39\" height=\"4\" fill=\"#4c376c\"/>","glossary":"<path d=\"M7 5h32v39H7z\" fill=\"#54396f\"/><path d=\"M11 9h24v31H11z\" fill=\"#f2eafa\"/><path d=\"M17 34 24 14l7 20h-4l-1-5h-5l-1 5zm5-9h3l-1-5z\" fill=\"#825bb7\"/>","projects":"<path d=\"m24 4 18 10v22L24 46 6 36V14z\" fill=\"#70518c\"/><path d=\"m24 8 14 8-14 7-14-7z\" fill=\"#e9c985\"/><path d=\"m10 19 12 7v15l-12-7z\" fill=\"#c99c72\"/><path d=\"m26 26 12-7v15l-12 7z\" fill=\"#a78ed3\"/><rect x=\"22\" y=\"26\" width=\"4\" height=\"17\" fill=\"#4b3268\"/>","advanced":"<path d=\"M19 4h10v6l6 3 5-4 7 7-4 5 2 7h5v9h-6l-3 5 3 4-7 7-5-4-6 2v5H16v-6l-5-3-5 3-7-7 4-5-2-6H2v-9h6l3-5-3-5 7-7 5 3z\" transform=\"translate(2 -2) scale(.88)\" fill=\"#7253a0\"/><rect x=\"16\" y=\"16\" width=\"16\" height=\"16\" fill=\"#e6d2ff\"/><rect x=\"20\" y=\"20\" width=\"8\" height=\"8\" fill=\"#9272b8\"/>"};
Object.assign(APP_ICONS,{"tools":"<rect x=\"4\" y=\"5\" width=\"40\" height=\"33\" rx=\"3\" fill=\"#49356f\"/><rect x=\"8\" y=\"9\" width=\"32\" height=\"25\" fill=\"#b0d7f0\"/><rect x=\"13\" y=\"14\" width=\"22\" height=\"4\" fill=\"#7760af\"/><rect x=\"13\" y=\"22\" width=\"11\" height=\"4\" fill=\"#f6f4ff\"/><rect x=\"27\" y=\"22\" width=\"8\" height=\"4\" fill=\"#e4bd70\"/><rect x=\"20\" y=\"38\" width=\"8\" height=\"5\" fill=\"#ccb1ed\"/><rect x=\"14\" y=\"43\" width=\"20\" height=\"3\" fill=\"#e6d1ff\"/>","install":"<path d=\"M8 5h25l8 8v29H8z\" fill=\"#604586\"/><path d=\"M12 9h19l6 6v23H12z\" fill=\"#f8f1ff\"/><path d=\"M30 9v8h8z\" fill=\"#b59bdb\"/><path d=\"M22 16h7v13h6L25 40 14 29h7V16z\" fill=\"#6bb49d\"/><path d=\"M13 41h28v4H13z\" fill=\"#e6ba75\"/>","assistance":"<rect x=\"4\" y=\"7\" width=\"40\" height=\"34\" fill=\"#584180\"/><rect x=\"8\" y=\"11\" width=\"32\" height=\"26\" fill=\"#c7e1f1\"/><path d=\"M13 16h12v3H13zm0 6h8v3h-8z\" fill=\"#8f7bba\"/><path d=\"M32 11c-7 0-11 7-8 13L11 36l5 5 13-13c7 3 14-2 13-9l-8 5-6-6z\" fill=\"#735ca4\"/><path d=\"m12 36 4 4\" stroke=\"#fff2d7\" stroke-width=\"3\"/>","faq":"<path d=\"M6 4h36v40H6z\" fill=\"#60447e\"/><path d=\"M10 8h28v32H10z\" fill=\"#faf4e9\"/><path d=\"M16 17c0-7 4-10 10-10s10 3 10 9c0 5-3 7-8 10v3h-7v-6c5-2 8-5 8-7 0-4-7-5-7 1z\" fill=\"#9a71c9\"/><rect x=\"21\" y=\"32\" width=\"7\" height=\"5\" fill=\"#9a71c9\"/>","story":"<path d=\"M7 4h29l7 7v33H7z\" fill=\"#684d8b\"/><path d=\"M11 8h23l5 5v27H11z\" fill=\"#efe6ff\"/><circle cx=\"25\" cy=\"19\" r=\"7\" fill=\"#e5b880\"/><path d=\"M13 36v-4c0-7 5-10 12-10s12 3 12 10v4z\" fill=\"#8c6cad\"/><path d=\"M17 39h17v2H17z\" fill=\"#bc97d4\"/>","contact":"<rect x=\"4\" y=\"9\" width=\"40\" height=\"32\" rx=\"2\" fill=\"#604585\"/><rect x=\"8\" y=\"13\" width=\"32\" height=\"24\" fill=\"#f1e8ff\"/><path d=\"M8 16 24 29l16-13v7L24 35 8 23z\" fill=\"#ad80cb\"/><path d=\"M10 40h28v4H10z\" fill=\"#a889d0\"/>","privacy":"<path d=\"M24 4 42 11v14c0 12-8 19-18 23C14 44 6 37 6 25V11z\" fill=\"#523971\"/><path d=\"M24 10 36 15v11c0 8-5 13-12 17-7-4-12-9-12-17V15z\" fill=\"#b5a1e8\"/><rect x=\"17\" y=\"23\" width=\"14\" height=\"13\" rx=\"2\" fill=\"#fff5cb\"/><path d=\"M20 23v-5c0-6 8-6 8 0v5\" fill=\"none\" stroke=\"#f8f3ff\" stroke-width=\"4\"/><rect x=\"23\" y=\"28\" width=\"3\" height=\"5\" fill=\"#72528f\"/>","sponsor":"<path d=\"M24 40C10 32 5 25 6 17c1-12 13-14 18-5 6-9 17-7 18 5 1 8-4 15-18 23z\" fill=\"#d577b3\"/><path d=\"M24 33C13 26 11 21 14 17c3-5 8-4 10 1 3-5 8-6 11-1 3 4 1 9-11 16z\" fill=\"#ffe0eb\"/><path d=\"M3 36h13l8 5 8-5h13v5l-21 6-21-6z\" fill=\"#8665aa\"/>"});
APP_ICONS.home='<path d="M24 3 4 20v4h5v20h30V24h5v-4z" fill="#7854a8"/><path d="M24 10 10 23v17h28V23z" fill="#e4d5ff"/><path d="M19 26h10v14H19z" fill="#6b4b91"/><path d="M13 27h5v6h-5zm17 0h5v6h-5z" fill="#9acbe5"/>';
var APPS=[["Guide For Installation.sh","Οδηγός Εγκατάστασης.sh","install","dedsec/Pages/guide-for-installation.html","dedsec"],["Learn About The Tools.py","Μάθε για τα Εργαλεία.py","tools","dedsec/Pages/learn-about-the-tools.html","dedsec"],["Assistance and Troubleshooting.py","Βοήθεια και Αντιμετώπιση Προβλημάτων.py","assistance","dedsec/Pages/assistance.html","dedsec"],["Frequently Asked Questions.md","Συχνές Ερωτήσεις.md","faq","dedsec/Pages/faq.html","dedsec"],["Privacy Policy.txt","Πολιτική Απορρήτου.txt","privacy","dedsec/Pages/privacy-policy.html","dedsec"],["Contact and Credits.md","Επικοινωνία και Συντελεστές.md","contact","dedsec/Pages/contact-credits.html","dedsec"],["Founder's Story and Project Vision.md","Ιστορία Ιδρυτή και Όραμα του Έργου.md","story","dedsec/Pages/about-founder.html","dedsec"],["Sponsor Us.link","Γίνε Χορηγός.link","sponsor","https://github.com/sponsors/dedsec1121fk","dedsec"],["Foundations.md","Βασικές Αρχές.md","fund","#category:fund","view"],["Programming Glossary.txt","Γλωσσάρι Προγραμματισμού.txt","glossary","#category:glossary","view"],["Thinking Methods.md","Μέθοδοι Σκέψης.md","methods","#category:method","view"],["Learning Paths and Projects.sh","Διαδρομές Μάθησης και Έργα.sh","paths","#category:projects","view"],["Programming Knowledge Library.py","Βιβλιοθήκη Γνώσης Προγραμματισμού.py","languages","#library","view"],["TikDev","TikDev","tools","TikDev.html","view"],["Termux Troubleshooting.md","Οδηγός Διόρθωσης Termux.md","assistance","#category:termux","view"],["Code Examples and Laboratories.py","Παραδείγματα και Εργαστήρια Κώδικα.py","code","#category:code","view"],["Errors & Debugging.py","Σφάλματα & Αποσφαλμάτωση.py","errors","#category:errors","view"],["Algorithms and Problem Solving.py","Αλγόριθμοι και Επίλυση Προβλημάτων.py","algorithms","#category:algorithms","view"],["Knowledge Encyclopedia.md","Εγκυκλοπαίδεια Γνώσεων.md","knowledge","#category:knowledge","view"],["Hacking Guide and Security.sh","Οδηγός Hacking και Ασφάλειας.sh","security","#category:security","view"],["Reverse Engineering.py","Αντίστροφη Μηχανική.py","reverse","#category:reverse","view"],["Advanced Engineering.py","Προχωρημένη Μηχανική.py","advanced","#category:advanced","view"]];
var CATS=[["termux","Termux Troubleshooting","Αντιμετώπιση Προβλημάτων Termux",["Termux_Troubleshooting","Αντιμετώπιση_Termux"]],["fund","Fundamentals","Βασικές Αρχές",["Foundations","Θεμέλια"]],["languages","Programming Languages","Γλώσσες Προγραμματισμού",["Programming_Languages","Γλώσσες_Προγραμματισμού"]],["errors","Errors and Debugging","Σφάλματα και Αποσφαλμάτωση",["Error_Encyclopedia","Εγχειρίδιο_Σφαλμάτων","Debugging_and_Fixed_Examples","Αποσφαλμάτωση_και_Διορθωμένα_Παραδείγματα"]],["security","Security Engineering","Μηχανική Ασφάλειας",["Security_Engineering","Μηχανική_Ασφάλειας"]],["algorithms","Algorithms and Logic","Αλγόριθμοι και Λογική",["Algorithms_Practice","Αλγόριθμοι_Ασκήσεις"]],["code","Code Laboratories","Εργαστήρια Κώδικα",["Practical_Script_Labs","Πρακτικά_Σενάρια_Κώδικα","Ready_to_Copy_Recipes","Έτοιμα_Παραδείγματα"]],["reverse","Reverse Engineering","Αντίστροφη Μηχανική",["Reverse_Engineering"]],["knowledge","Knowledge Encyclopedia","Εγκυκλοπαίδεια Γνώσεων",["Knowledge_Encyclopedia","Εγκυκλοπαίδεια_Γνώσης","Deep_Knowledge","Βαθύτερη_Γνώση"]],["glossary","Programming Glossary","Γλωσσάρι Προγραμματισμού",["Terminology_Glossary","Γλωσσάρι_Ορολογίας"]],["advanced","Advanced Engineering","Προχωρημένη Μηχανική",["Advanced_Engineering_Labs","Προχωρημένα_Εργαστήρια_Μηχανικής"]],["projects","Projects and Learning Paths","Project και Διαδρομές Μάθησης",["Learning_Paths","Διαδρομές_Εκμάθησης","Learning_Projects","Εκπαιδευτικά_Έργα"]],["method","Thinking and Logic","Σκέψη και Λογική",["Method"]]];
var docs=[],byId={};
function collectKnowledge(){
var seenEntries=new Set();
 docs=[].concat(window.ARCHIVE_EN||[],window.ARCHIVE_EL||[],window.ARCHIVE_METHODS||[],window.ARCHIVE_HACKING||[],window.ARCHIVE_TERMUX||[],window.ARCHIVE_DEEP_DIVE||[],window.ARCHIVE_HACKING_COMPLETE||[]).filter(function(d){
  if(!d||!d.id)return false;
  var signature=(d.l||"")+"\n"+String(d.t||"").trim().toLowerCase()+"\n"+String(d.b||"").replace(/\s+/g," ").trim();
  if(seenEntries.has(signature))return false;seenEntries.add(signature);return true;
 });
byId={};docs.forEach(function(d){if(d&&d.id)byId[d.id]=d;});
}
var el=function(id){return document.getElementById(id);};
/* Theme and language are user-selected functional preferences; lessons are never saved. */
function prefGet(key,fallback){try{var value=localStorage.getItem("dedsec:"+key);return value===null?fallback:JSON.parse(value);}catch(e){return fallback;}}
function prefSave(key,value){try{localStorage.setItem("dedsec:"+key,JSON.stringify(value));}catch(e){}}
var requestedLanguage=new URLSearchParams(location.search).get("contentlang");
var language=(requestedLanguage==="en"||requestedLanguage==="gr"?requestedLanguage:prefGet("language","en"))==="gr"?"gr":"en";
var theme=prefGet("theme","dark")==="light"?"light":"dark";
var search=new URLSearchParams(location.search).get("q")||"",activeCat="all",filter=language,shown=36,searchOpen=new URLSearchParams(location.search).has("search"),detail=null,debounce;
var tr={en:{library:"Programming Library",search:"Search the Website",all:"All subjects",allLang:"Both languages",none:"No matching content found.",start:"Choose an application to open.",back:"Back to library",results:"lessons",more:"Load more",browse:"Browse the archive",privacy:"Reading and searching are local; optional GitHub badges load only with consent."},gr:{library:"Βιβλιοθήκη Προγραμματισμού",search:"Αναζήτηση στην Ιστοσελίδα",all:"Όλα τα θέματα",allLang:"Και οι δύο γλώσσες",none:"Δεν βρέθηκε περιεχόμενο.",start:"Επίλεξε μια εφαρμογή για να ξεκινήσεις.",back:"Πίσω στη βιβλιοθήκη",results:"μαθήματα",more:"Περισσότερα",browse:"Εξερεύνηση γνώσεων",privacy:"Η ανάγνωση είναι τοπική· τα στατιστικά GitHub φορτώνουν μόνο με αποδοχή."}};
function t(k){return tr[language][k]||k;}

function esc(v){return String(v==null?"":v).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
function norm(v){return String(v||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/ς/g,"σ").toLowerCase();}
var SIMPLE_GLYPHS={"install":"<path d=\"M24 7v25m-10-9 10 10 10-10M10 40h28\"/>","tools":"<path d=\"M11 10h26v27H11zM14 17h20M17 24h9M17 30h13\"/>","assistance":"<path d=\"M14 18a10 10 0 0 1 20 0M14 18v15h7m13-15v15h-7M20 39h8\"/>","faq":"<path d=\"M17 17a8 8 0 1 1 12 7c-4 2-5 4-5 7M24 38v1\"/>","privacy":"<path d=\"M24 6 38 11v14c0 9-6 14-14 18-8-4-14-9-14-18V11zM24 19v10M24 33v1\"/>","contact":"<path d=\"M8 13h32v23H8zM8 14l16 14 16-14\"/>","story":"<path d=\"M9 10h30v30H9zM17 10v30M22 20h11M22 27h9M22 34h7\"/>","sponsor":"<path d=\"M24 41 8 24C0 12 17 4 24 15 31 4 48 12 40 24z\"/>","fund":"<path d=\"M10 10h28v28H10zM15 17h18M15 24h16M15 31h10\"/>","glossary":"<path d=\"M10 8h28v32H10zM16 16h16M16 23h12M16 30h16\"/>","methods":"<path d=\"M9 24h10m10 0h10M24 10v28M10 12l7 7M38 12l-7 7M10 36l7-7M38 36l-7-7\"/>","paths":"<path d=\"M10 38V12h11M10 38h28V24M21 12l7 7-7 7M30 24l7-7\"/>","languages":"<path d=\"M10 13h13v23H10zM25 13h13v23H25zM18 20l-4 5 4 5M30 20l4 5-4 5\"/>","search":"<circle cx=\"21\" cy=\"21\" r=\"11\"/><path d=\"m29 29 11 11\"/>","code":"<path d=\"m16 16-8 8 8 8m16-16 8 8-8 8m-11-19-8 38\"/>","errors":"<path d=\"M24 7 43 40H5zM24 18v11M24 35v1\"/>","algorithms":"<rect x=\"8\" y=\"8\" width=\"32\" height=\"10\"/><rect x=\"8\" y=\"30\" width=\"32\" height=\"10\"/><path d=\"M24 18v12\"/>","knowledge":"<path d=\"M8 11h15l2 3 2-3h13v29H27l-3 3-3-3H8zM24 14v27\"/>","security":"<path d=\"M24 6 40 12v13c0 10-8 16-16 19C16 41 8 35 8 25V12zM17 24l5 5 9-11\"/>","reverse":"<path d=\"M13 12h22v24H13zM8 20l-4 4 4 4M40 20l4 4-4 4M19 18h10M19 24h10M19 30h7\"/>","advanced":"<path d=\"M24 4 6 26h16l-3 18 23-27H25z\"/>","cookies":"<path d=\"M30 6a7 7 0 0 0 11 8c-3 6 2 9 3 12a20 20 0 1 1-14-20z\"/><circle cx=\"17\" cy=\"17\" r=\"2.5\"/><circle cx=\"29\" cy=\"27\" r=\"2.5\"/><circle cx=\"14\" cy=\"31\" r=\"2.5\"/><circle cx=\"29\" cy=\"39\" r=\"1.5\"/>"};
function icon(key){return '<svg class="pixel-glyph" viewBox="0 0 48 48" aria-hidden="true" focusable="false" shape-rendering="crispEdges">'+(APP_ICONS[key]||APP_ICONS.knowledge||SIMPLE_GLYPHS[key]||SIMPLE_GLYPHS.knowledge)+'</svg>';}

function ckey(d){for(var i=0;i<CATS.length;i++)if(CATS[i][3].includes(d.g))return CATS[i][0];return "knowledge";}
function title(c){return c[language==="gr"?2:1];}
function syncTop(){
 el("searchInput").setAttribute("aria-label",language==="gr"?"Αναζήτηση ιστοσελίδας":"Search website");
 document.documentElement.lang=language==="gr"?"el":"en";
 document.body.classList.toggle("theme-dark",theme==="dark");document.body.classList.toggle("theme-light",theme==="light");
 var selectedLogo="dedsec/Assets/Images/Logos/"+(theme==="dark"?"Black":"White")+"%20Purple%20Butterfly%20Logo.jpeg";
 var logo=el("brand").querySelector("img");if(logo&&logo.getAttribute("src")!==selectedLogo)logo.setAttribute("src",selectedLogo);
 var bootLogo=document.querySelector(".boot-mark");if(bootLogo&&bootLogo.getAttribute("src")!==selectedLogo)bootLogo.setAttribute("src",selectedLogo);
 var searchLink=el("nav-search");if(searchLink){searchLink.setAttribute("aria-label",language==="gr"?"Αναζήτηση στην ιστοσελίδα":"Search the website");searchLink.title=searchLink.getAttribute("aria-label");}
  var homeLink=el("nav-home");if(homeLink){homeLink.setAttribute("aria-label",language==="gr"?"Λογαριασμός":"Account");homeLink.title=homeLink.getAttribute("aria-label");}
 el("nav-theme-switcher").querySelector("span").innerHTML=theme==="light"?"<svg class=\"ds-nav-glyph\" viewBox=\"0 0 24 24\" aria-hidden=\"true\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.5\" stroke-linecap=\"round\"><circle cx=\"12\" cy=\"12\" r=\"4.1\"/><path d=\"M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4m0-14.2-1.4 1.4M6.3 17.7l-1.4 1.4\"/></svg>":"<svg class=\"ds-nav-glyph\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M20.7 16.1A8.9 8.9 0 0 1 7.9 3.3a9.2 9.2 0 1 0 12.8 12.8Z\"/></svg>";
 el("nav-theme-switcher").setAttribute("aria-label",language==="gr"?(theme==="light"?"Σκοτεινός γαλαξίας":"Φωτεινός γαλαξίας"):(theme==="light"?"Switch to dark galaxy":"Switch to lavender galaxy"));
 el("nav-lang-switcher").querySelector("span").textContent=language==="gr"?"English":"Ελληνικά";
 document.querySelectorAll("[data-en][data-gr]").forEach(function(n){n.textContent=n.getAttribute(language==="gr"?"data-gr":"data-en");});
 document.querySelectorAll(".toplinks a").forEach(function(n){var tip=n.getAttribute("data-tooltip-"+language);if(tip)n.title=tip;});
 var ink=theme==="dark"?"#fff":"#111";
 document.querySelectorAll("#topbar .nav-actions > a,#topbar .nav-actions > button").forEach(function(control){
  control.style.setProperty("color",ink,"important");
  control.style.setProperty("-webkit-text-fill-color",ink,"important");
  control.querySelectorAll("span,i").forEach(function(child){
   child.style.setProperty("color",ink,"important");
   child.style.setProperty("-webkit-text-fill-color",ink,"important");
  });
 });
}
function launcherLabel(name){return String(name).replace(/\.[a-z][a-z0-9]{0,9}$/i,"");}
var githubCounts=null,githubRequest=null;
function updateGitHubStats(){
 var nodes=document.querySelectorAll("[data-github-count]");
 if(!nodes.length||!window.DedSecCookies||!window.DedSecCookies.allowOptional())return;
 function display(){
  if(!githubCounts)return;
  document.querySelectorAll("[data-github-count]").forEach(function(el){
   var name=el.getAttribute("data-github-count");
   el.textContent=githubCounts[name].toLocaleString();
   el.title="Updated from GitHub";
  });
 }
 if(githubCounts){display();return;}
 if(githubRequest)return;
 githubRequest=fetch("https://api.github.com/repos/dedsec1121fk/DedSec",{headers:{"Accept":"application/vnd.github+json"}})
 .then(function(response){if(!response.ok)throw Error("GitHub request failed");return response.json();})
 .then(function(data){
  if(typeof data.stargazers_count==="number"&&typeof data.forks_count==="number"){
   githubCounts={stars:data.stargazers_count,forks:data.forks_count};
   if(window.DedSecCookies.allowOptional())display();
  }
 }).catch(function(){/* Keep visible counts from last verified snapshot. */})
 .finally(function(){githubRequest=null;});
}
function home(){
 var gr=language==="gr";
 var cookieButton='<button id="dedsec-cookie-manage" type="button" class="app-icon-btn cookie-app-icon-btn" aria-label="'+(gr?"Ρυθμίσεις cookies":"Cookie preferences")+'"><span class="app-icon cookie-pixel-icon" aria-hidden="true">'+icon("cookies")+'</span><span class="app-label">'+(gr?"Ρυθμίσεις cookies":"Cookie preferences")+'</span></button>';
 var saveButton='<a id="save-dedsec-launcher" class="app-icon-btn" href="'+(gr?'dedsec/el/Pages/':'dedsec/Pages/')+'save-dedsec-project.html"><span class="app-icon" aria-hidden="true">'+icon("knowledge")+'</span><span class="app-label">Save DedSec Project</span></a>';
 var intro=gr?"Χρησιμοποίησε το DedSec Project από Termux σε Android ή από υποστηριζόμενα Linux desktops με ένα κοινό cross-platform workflow.":"Use the DedSec Project from Termux on Android or from supported Linux desktops with one shared cross-platform workflow.";
 var about=gr?"Το DedSec Project είναι μια δωρεάν συλλογή εργαλείων κυβερνοασφάλειας και αυτοματισμού, διαθέσιμη για Android μέσω Termux και για υποστηριζόμενα συστήματα Linux.":"DedSec Project is a free cybersecurity and automation toolkit available for Android through Termux and supported Linux systems.";
 var githubMark='<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.3c-3.3.7-4-1.4-4-1.4-.5-1.4-1.3-1.8-1.3-1.8-1.1-.8.1-.8.1-.8 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.4 4.8 18.4 5 18.4 5c.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.6c0 .3.2.7.8.6A12 12 0 0 0 12 .3Z"/></svg>';
 var proof='<div class="home-trust" aria-label="'+(gr?"Στοιχεία έργου":"Project trust indicators")+'"><div class="home-trust-card"><strong class="home-rank">#1</strong><span class="trust-caption">'+(gr?"Στα αποτελέσματα Google":"In Google Results")+'</span></div><a class="home-trust-card" href="https://github.com/dedsec1121fk/DedSec/stargazers" target="_blank" rel="noopener noreferrer"><span class="trust-github-badge"><span class="trust-badge-label">'+githubMark+'<span class="trust-caption">'+(gr?"Αστέρια":"Stars")+'</span></span><strong class="trust-stat-number" data-github-count="stars" title="GitHub snapshot — 16 October 2026">914</strong></span><span class="trust-caption">'+(gr?"Αστέρια GitHub":"GitHub Stars")+'</span></a><a class="home-trust-card" href="https://github.com/dedsec1121fk/DedSec/forks" target="_blank" rel="noopener noreferrer"><span class="trust-github-badge"><span class="trust-badge-label">'+githubMark+'<span class="trust-caption">Forks</span></span><strong class="trust-stat-number" data-github-count="forks" title="GitHub snapshot — 16 October 2026">380</strong></span><span class="trust-caption">'+(gr?"Forks GitHub":"GitHub Forks")+'</span></a></div>';

 var groups=[
  {key:"start",glyph:"install",name:gr?"Ξεκίνα εδώ με αυτή τη σειρά":"Start here in this order",desc:gr?"Εγκατάσταση → εργαλεία → βοήθεια, με αυτή τη σειρά.":"Install → explore tools → get help, in this order.",from:0,to:3},
  {key:"project",glyph:"story",name:gr?"Πληροφορίες έργου και κοινότητα":"Project and community",desc:gr?"Απαντήσεις, ασφάλεια δεδομένων, επικοινωνία, ιστορία και υποστήριξη.":"Answers, privacy, contact, project history and support.",from:3,to:8},
  {key:"learning",glyph:"languages",name:gr?"Μάθηση και προγραμματισμός":"Learning and programming",desc:gr?"Ξεκίνα από τις βασικές αρχές και προχώρησε σε πρακτική εξάσκηση.":"Build from fundamentals to practical programming.",from:8,to:16},
  {key:"engineering",glyph:"security",name:gr?"Ανάλυση και μηχανική":"Analysis and engineering",desc:gr?"Διερεύνησε σφάλματα, λογική, συστήματα και ασφάλεια.":"Explore debugging, logic, systems and security.",from:16,to:22}
 ];
 function launcher(a){var dest=a[3];if(gr&&a[4]==="dedsec"&&dest.indexOf("dedsec/")===0)dest="dedsec/el/"+dest.slice(7);return '<a class="app-icon-btn" href="'+esc(dest)+'" title="'+esc(launcherLabel(a[gr?1:0]))+'"><span class="app-icon">'+icon(a[2])+'</span><span class="app-label">'+esc(launcherLabel(a[gr?1:0]))+'</span></a>';}
 var reflection=gr?'<aside class="start-reflection"><blockquote lang="grc">«ἔστι γὰρ φύσει δοῦλος ὁ δυνάμενος ἄλλου εἶναι»</blockquote><small>Αριστοτέλης, Πολιτικά Α΄ 5, 1254b20–23. Απόδοση αποσπάσματος: «Δούλος από τη φύση είναι εκείνος που μπορεί να ανήκει σε άλλον». Ιστορική θέση του Αριστοτέλη για τη δουλεία, όχι επιδοκιμασία της ούτε ρήση για εκούσια υποταγή. <a href="https://atlas.perseus.tufts.edu/library/passage/urn:cts:greekLit:tlg0086.tlg035.perseus-grc2:1.1254b-1.1256b/" target="_blank" rel="noopener noreferrer">Αρχαίο κείμενο</a></small></aside>':'<aside class="start-reflection"><blockquote lang="grc">“ἔστι γὰρ φύσει δοῦλος ὁ δυνάμενος ἄλλου εἶναι”</blockquote><small>Aristotle, Politics I.5, 1254b20–23. Excerpt translated: “A slave by nature is someone capable of belonging to another.” A historical claim about slavery, rather than an endorsement or a quotation about willing submission. <a href="https://atlas.perseus.tufts.edu/library/passage/urn:cts:greekLit:tlg0086.tlg035.perseus-grc2:1.1254b-1.1256b/" target="_blank" rel="noopener noreferrer">Greek source</a></small></aside>';
 var organized=groups.map(function(g){return '<section class="launcher-group launcher-'+g.key+'" aria-label="'+esc(g.name)+'"><header class="launcher-group-heading"><div><h2>'+esc(finishSentence(g.name))+'</h2>'+(g.key==='start'?reflection:'')+'<p>'+esc(finishSentence(g.desc))+'</p></div></header><div class="app-grid">'+APPS.slice(g.from,g.to).map(launcher).join("")+'</div></section>';}).join("");
 return '<div class="desktop-home"><section class="home-intro" aria-labelledby="home-title"><h1 id="home-title">DedSec Project.</h1><p class="home-subtitle">'+esc(intro)+'</p>'+proof+'<p class="home-about-summary">'+esc(about)+'</p></section>'+organized+'<section class="launcher-group launcher-settings" aria-label="'+(gr?"Άλλα":"Others")+'"><header class="launcher-group-heading"><div><h2>'+(gr?"Άλλα.":"Others.")+'</h2></div></header><div class="app-grid">'+cookieButton+saveButton+'</div></section></div>';
}
/* Periods on displayed titles and preview descriptions, without doubling
   existing punctuation, altering file paths or rewriting lesson sources. */
function finishSentence(value){
 var text=String(value==null?"":value).replace(/\s+/g," ").trim();
 if(!text||/[.!?…。！？]$/.test(text))return text;
 return text.replace(/[\s,:;—–-]+$/,"")+".";
}
function shortSentence(value,max){
 var text=String(value||"").replace(/[#*\x60\r\n]/g," ").replace(/\s+/g," ").trim();
 if(!text)return "";
 var matches=[...text.matchAll(/[.!?…。！？]+(?=\s|$)/g)];
 if(matches.length){
  var fitting=matches.filter(m=>m.index+m[0].length<=max);
  var picked=fitting.length?fitting[fitting.length-1]:matches[0];
  return text.slice(0,picked.index+picked[0].length);
 }
 // No completed sentence: do not turn a fragment into a fictitious one.
 return text.length<=max?finishSentence(text):text;
}
function catOptions(){return '<option value="all">'+esc(t("all"))+'</option>'+CATS.map(function(c){return '<option value="'+c[0]+'"'+(c[0]===activeCat?' selected':'')+'>'+esc(title(c))+'</option>';}).join("");}
/* Offline search v2: deterministic weighted relevance, synonyms and typo recovery.
   Ranking uses evidence in titles/headings/body. No network, remote AI or telemetry. */
var searchEngine=null;
var knowledgePromise=null,knowledgeError=false;
var loadedKnowledge=new Map();
function ensureKnowledge(){
 if(knowledgePromise)return knowledgePromise;
 knowledgeError=false;
 knowledgePromise=(async function(){
  for(const tag of document.querySelectorAll('[data-knowledge-src]')){
   const url=tag.getAttribute('data-knowledge-src');
   if(!loadedKnowledge.has(url))loadedKnowledge.set(url,new Promise(function(resolve,reject){
    const script=document.createElement('script');script.src=url;script.onload=resolve;script.onerror=function(){script.remove();loadedKnowledge.delete(url);reject(Error('Knowledge unavailable'));};document.head.append(script);
   }));
   await loadedKnowledge.get(url);
  }
  collectKnowledge();
  searchEngine=await window.DedSecSearch.createAsync(docs.concat(window.SITE_SEARCH_INDEX||[]),function(d){return d.kind==='page'?'website':ckey(d);});
  render();window.dispatchEvent(new Event('dedsec:knowledge-ready'));
 })().catch(function(){knowledgePromise=null;knowledgeError=true;render();});
 return knowledgePromise;
}
function knowledgeNotice(){return '<section class="panel" role="status"><p>'+esc(language==='gr'?(knowledgeError?'Δεν φορτώθηκε η γνώση. Έλεγξε τη σύνδεση και προσπάθησε ξανά.':'Φόρτωση γνώσεων και αναζήτησης…'):(knowledgeError?'Knowledge could not load. Check your connection and retry.':'Loading knowledge and search…'))+'</p>'+(knowledgeError?'<button type="button" data-retry-knowledge>'+esc(language==='gr'?'Επανάληψη':'Retry')+'</button>':'')+'</section>';}

function searchMatches(){return searchEngine?searchEngine.search(search,{language:language==="gr"?"el":"en",category:activeCat}):[];}

/* Each record keeps its source identity. Reused generic titles are
   prefixed by the source directories, never by an arbitrary serial number.
   Titles are compared across the entire locale, not only within a group. */
var titleRepetitions={};
docs.forEach(function(d){
 var k=(d.l||"")+"|"+String(d.t||"").trim().toLocaleLowerCase();
 titleRepetitions[k]=(titleRepetitions[k]||0)+1;
});
function displayTitle(d){
 var name=String(d.t||"").trim(),key=(d.l||"")+"|"+name.toLocaleLowerCase();
 if((titleRepetitions[key]||0)<2)return name;
 var pieces=String(d.p||"").split("/").filter(Boolean),dirs=pieces.slice(0,-1);
 var context=dirs.slice(-2).map(function(x){return x.replace(/_/g," ");}).join(" / ");
 return context?context+" — "+name:name;
}
function card(d){
 var terms=window.DedSecSearch.evidenceTerms(search),passage=window.DedSecPassages.select(d,terms),href;
 if(d.kind==='page'){var url=new URL(d.url,location.href);url.searchParams.set('contentlang',d.l==='el'?'gr':'en');url.hash='find='+encodeURIComponent(passage.anchor)+'&term='+encodeURIComponent(passage.needle);href=url.pathname+url.search+url.hash;}else href='#read:'+encodeURIComponent(d.id)+';find='+encodeURIComponent(passage.anchor)+'&term='+encodeURIComponent(passage.needle);
 return '<a class="result-card" href="'+esc(href)+'"><strong>'+esc(finishSentence(displayTitle(d)))+'</strong><p>'+esc(passage.text)+'</p></a>';
}
function tools(){return "";}
var categoryIntro={
termux:["Fix common Termux, Android storage, network, Python and Git problems with safe verification steps.","Διόρθωσε συνηθισμένα προβλήματα Termux, αποθήκευσης Android, δικτύου, Python και Git με ασφαλείς ελέγχους."],
fund:["Start with concepts, syntax, and simple working examples.","Ξεκίνα με βασικές έννοιες, σύνταξη και απλά λειτουργικά παραδείγματα."],
languages:["Explore programming languages and their practical differences.","Γνώρισε γλώσσες προγραμματισμού και τις πρακτικές διαφορές τους."],
errors:["Investigate error messages, causes, and verified repairs.","Ερεύνησε μηνύματα σφαλμάτων, αιτίες και δοκιμασμένες διορθώσεις."],
security:["Study defensive engineering and authorized security workflows.","Μελέτησε αμυντική μηχανική και εξουσιοδοτημένες πρακτικές ασφάλειας."],
algorithms:["Understand algorithms, logic, and step-by-step problem solving.","Κατανόησε αλγορίθμους, λογική και βήματα επίλυσης προβλημάτων."],
code:["Examine code examples, scripts, and practical experiments.","Μελέτησε παραδείγματα κώδικα, scripts και πρακτικά πειράματα."],
reverse:["Understand how applications and formats work through authorized analysis.","Κατανόησε εφαρμογές και μορφές αρχείων μέσω εξουσιοδοτημένης ανάλυσης."],
knowledge:["Browse technical explanations, references, and deeper concepts.","Εξερεύνησε τεχνικές εξηγήσεις, αναφορές και σύνθετες έννοιες."],
glossary:["Find clear definitions for programming and computing terms.","Βρες κατανοητούς ορισμούς για όρους προγραμματισμού και υπολογιστών."],
advanced:["Investigate complex systems and deeper engineering challenges.","Μελέτησε σύνθετα συστήματα και προχωρημένες τεχνικές προκλήσεις."],
projects:["Follow practical learning routes and build complete projects.","Ακολούθησε διαδρομές μάθησης και δημιούργησε ολοκληρωμένα έργα."],
method:["Examine reasoning strategies, trade-offs, and decision making.","Μελέτησε στρατηγικές σκέψης, συμβιβασμούς και λήψη αποφάσεων."]
};
function sectionIntro(heading,description){
 return '<header class="archive-heading"><h1 class="page-heading">'+esc(finishSentence(heading))+'</h1><p class="page-subtitle">'+esc(finishSentence(description))+'</p></header>';
}
function listing(view){
 if(view==="library"&&!search.trim()&&!searchOpen){
  var h=titleFor("library"),subtitle=language==="gr"?"Επίλεξε θεματική ενότητα για να δεις τα διαθέσιμα μαθήματα.":"Choose a subject to browse the available lessons.";
  return '<section class="panel archive-panel" aria-label="'+esc(h)+'">'+sectionIntro(h,subtitle)+'<div class="folders-grid">'+CATS.map(function(c){return '<a class="folder-card" href="#category:'+c[0]+'"><strong>'+esc(finishSentence(title(c)))+'</strong><p class="folder-description">'+esc(finishSentence((categoryIntro[c[0]]||["Explore this topic.","Μάθε περισσότερα."])[language==="gr"?1:0]))+'</p></a>';}).join("")+'</div></section>';
 }
 var current=CATS.find(function(c){return c[0]===activeCat;});
 var heading=current?title(current):t("search");
 var intro=current?categoryIntro[current[0]]:null;
 var description=intro?intro[language==="gr"?1:0]:(language==="gr"?"Αναζήτησε σελίδες, εργαλεία, οδηγούς, μαθήματα και αναφορές σε όλη την ιστοσελίδα.":"Search all website pages, tools, guides, lessons and reference material.");
 var results=searchMatches();
 return '<section class="panel archive-panel" aria-label="'+esc(heading)+'">'+sectionIntro(heading,description)+tools()+(results.length?'<div class="result-grid">'+results.slice(0,shown).map(card).join("")+'</div>':'<div class="empty">'+esc(t("none"))+'</div>')+(results.length>shown?'<p class="load-more"><button class="small-btn" data-more="1">'+esc(t("more"))+'</button></p>':'')+'</section>';
}
function titleFor(key){return t(key);}

function markdown(md, doc){
 return window.DedSecMarkdown.render(md,function(ref){
  if(ref.indexOf("#read:")===0)return ref;
  if(ref[0]==="#")return ref;
  var path;
  try{path=decodeURIComponent(new URL(ref,"https://archive.invalid/"+doc.p).pathname.slice(1));}catch(e){return null;}
  var target=docs.find(function(row){return row.l===doc.l&&row.p===path;});
  return target?"#read:"+encodeURIComponent(target.id):"source/"+(doc.l==="el"?"el":"en")+"/"+path.split("/").map(encodeURIComponent).join("/");
 });
}
function bodyWithoutRepeatedTitle(d){
 var raw=String(d.b||"");
 var match=raw.match(/^\s*#{1,4}\s+([^\r\n]+)\r?\n?/);
 if(!match)return raw;
 function tidy(x){return String(x).replace(/\s+/g," ").trim().toLocaleLowerCase();}
 return tidy(match[1])===tidy(d.t)?raw.slice(match[0].length).replace(/^\s*\n/,""):raw;
}
function lesson(id){
 var d=byId[id];
 if(!d)return '<div class="panel empty">'+esc(t("none"))+'</div>';
 var label=language==="gr"?"Κατηγορία":"Category";
 var cat=CATS.find(function(c){return c[0]===ckey(d);});
 var group=cat?title(cat):d.g;
 return '<article class="panel lesson">'+sectionIntro(displayTitle(d),label+": "+group)+'<div class="lesson-content">'+(d.p.endsWith(".md")?markdown(bodyWithoutRepeatedTitle(d),d):"<pre><code>"+esc(d.b)+"</code></pre>")+'</div></article>';
}
function render(){syncTop();document.body.classList.toggle('search-mode',searchOpen);var hash=location.hash.slice(1),output;
 var needsKnowledge=hash.startsWith('read:')||hash.startsWith('category:')||(['library','saved'].includes(hash)&&(search.trim()||searchOpen));
 if(needsKnowledge&&!searchEngine){el('app').innerHTML=knowledgeNotice();el('app').classList.remove('is-home');if(window.DedSecPageControls)window.DedSecPageControls.mount();if(!knowledgeError)ensureKnowledge();return;}
 if(hash.indexOf("read:")===0){var id;try{id=decodeURIComponent(hash.slice(5).split(";find=")[0]);}catch(e){id="";}detail=id;output=lesson(id);}else if(hash.indexOf("category:")===0){activeCat=hash.slice(9);if(!CATS.some(function(c){return c[0]===activeCat;}))activeCat="all";detail=null;output=listing("search");}else if(hash==="library"){detail=null;output=listing("library");}else if(hash==="saved"){detail=null;output=listing("library");}else{detail=null;output=home();}
 document.body.classList.toggle("search-mode",searchOpen);
 el("app").innerHTML=output;
 if(window.DedSecPageControls){window.DedSecPageControls.mount();requestAnimationFrame(window.DedSecPageControls.focusSearch);}
 decorateRootLinks();
 if(window.DedSecCookies){window.DedSecCookies.enhance(el("app"));window.DedSecCookies.refresh();}
  updateGitHubStats();
  el("app").classList.toggle("is-home",!!el("app").querySelector(".desktop-home"));
 document.querySelectorAll("[data-nav]").forEach(function(a){a.classList.toggle("active",a.getAttribute("href")==="#"+(hash||"home"));});
}

/* Decorate text links without modifying their meaning or duplicating arrows. */
function decorateRootLinks(){
 document.querySelectorAll("#app a[href],#site-footer a[href]").forEach(function(a){
  if(a.matches(".app-icon-btn,.result-card,.folder-card,.home-trust-card"))return;
  if(!a.textContent.trim()||a.matches(".brand,.nav-action-btn"))return;
  a.classList.add("dedsec-text-link");
  a.classList.toggle("dedsec-append-arrow",!/[→➜➔➡]\s*$/.test(a.textContent.trim())&&!a.querySelector(".fa-arrow-right,.fa-chevron-right"));
 });
}
function resetSearchFocus(){var inp=el("searchInput");if(inp){inp.placeholder=language==="gr"?"Αναζήτηση σελίδων, εργαλείων, μαθημάτων...":"Search pages, tools, lessons...";inp.focus({preventScroll:true});inp.setSelectionRange(inp.value.length,inp.value.length);}}
document.addEventListener("click",function(e){var more=e.target.closest("[data-more]");if(more){shown+=36;render();return;}});
document.addEventListener("input",function(e){if(e.target.id!=="searchInput")return;search=e.target.value.slice(0,250);shown=36;clearTimeout(debounce);debounce=setTimeout(function(){var h=location.hash;if(h!=="#library")history.replaceState(null,"","#library");activeCat="all";render();resetSearchFocus();},140);});
document.addEventListener("change",function(e){if(e.target.id==="catSelect"){activeCat=e.target.value;shown=36;history.replaceState(null,"","#library");render();}});
el("nav-search").addEventListener("click",function(e){e.preventDefault();searchOpen=!searchOpen;document.body.classList.toggle("search-mode",searchOpen);if(searchOpen){setTimeout(resetSearchFocus,0);}else{el("nav-search").focus({preventScroll:true});}});
 el("nav-lang-switcher").addEventListener("click",function(){language=language==="en"?"gr":"en";filter=language;prefSave("language",language);render();});
el("nav-theme-switcher").addEventListener("click",function(){theme=theme==="dark"?"light":"dark";prefSave("theme",theme);render();});
document.addEventListener("dedsec:cookiechoice",function(){render();});
window.addEventListener("hashchange",function(){shown=36;searchOpen=false;render();window.scrollTo({top:0,behavior:"instant"});});
document.addEventListener("keydown",function(e){if(e.key==="/"&&!/INPUT|TEXTAREA/.test(document.activeElement.tagName)){e.preventDefault();searchOpen=true;document.body.classList.add("search-mode");setTimeout(resetSearchFocus,0);}else if(e.key==="Escape"&&searchOpen){searchOpen=false;document.body.classList.remove("search-mode");}});
var clicks=0,lastClick=0,broken=false;
function makeGlassBreak(){
 var overlay=el("collapseOverlay"),old=overlay.querySelector(".glass-shards");
 if(old)old.remove();
 var host=document.createElement("div");host.className="glass-shards";
 host.setAttribute("aria-hidden","true");
 var frag=document.createDocumentFragment();
 var reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
 var count=reduced?12:72,cols=9,rows=Math.ceil(count/cols);
 for(var i=0;i<count;i++){
  var shard=document.createElement("i");shard.className="glass-shard";
  var col=i%cols,row=Math.floor(i/cols),left=(col/cols*100),top=(row/rows*100);
  var rand=function(s){return ((s*17+i*31+23)%97)/97;};
  shard.style.cssText="--sx:"+left+"%;--sy:"+top+"%;--sw:"+(110/cols)+"%;--sh:"+(112/rows)+"%;"+
   "--dx:"+Math.round((rand(3)-.5)*190)+"px;--dy:"+Math.round(110+rand(7)*260)+"px;"+
   "--spin:"+Math.round((rand(11)-.5)*270)+"deg;--delay:"+(rand(15)*.45).toFixed(2)+"s;";
  frag.appendChild(shard);
 }
 host.appendChild(frag);overlay.appendChild(host);
}
function resetGlassBreak(){
 broken=false;document.body.classList.remove("broken");
 el("collapseOverlay").hidden=true;el("collapseOverlay").setAttribute("aria-hidden","true");
 var shards=el("collapseOverlay").querySelector(".glass-shards");if(shards)shards.remove();
}
el("brand").addEventListener("click",function(e){
 var now=Date.now();if(now-lastClick>1800)clicks=0;clicks++;lastClick=now;
 if(clicks>=7&&!broken){
  e.preventDefault();broken=true;clicks=0;
  document.body.classList.add("broken");
  el("collapseOverlay").hidden=false;
  el("collapseOverlay").setAttribute("aria-hidden","false");
  makeGlassBreak();el("restore").focus();
 }
});
el("restore").addEventListener("click",resetGlassBreak);
document.addEventListener("keydown",function(e){if(e.key==="Escape"&&broken)el("restore").click();});
 document.addEventListener("error",function(e){if(e.target&&e.target.matches&&e.target.matches(".trust-badge"))e.target.hidden=true;},true);
 document.addEventListener('click',function(e){if(e.target.closest('[data-retry-knowledge]')){ensureKnowledge();render();}});
 if(search&&!location.hash.startsWith('#read:')){history.replaceState(null,'','#library');searchOpen=true;el('searchInput').value=search;}
 render();window.__dedsecUIReady=true;window.dispatchEvent(new Event('dedsec:ready'));

})();
