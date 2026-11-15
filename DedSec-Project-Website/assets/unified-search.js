
(function(){
 'use strict';
 const endpoint='https://dedsec-forum.dedsec-project.workers.dev';
 const allowed={
  source:['all','site','forum'],kind:['all','page','lesson','code','forum'],
  locale:['current','all','en','el'],days:['0','7','30','365'],
  sort:['relevance','newest','oldest'],field:['all','title']
 };
 const params={
  source:'sf_source',kind:'sf_type',locale:'sf_lang',subject:'sf_site',
  group:'sf_group',category:'sf_cat',section:'sf_section',
  days:'sf_days',sort:'sf_sort',field:'sf_field',author:'sf_author'
 };
 const defaults={source:'all',kind:'all',locale:'current',subject:'all',group:'all',
  category:'all',section:'all',days:'0',sort:'relevance',field:'all',author:''};
 const urlState=new URLSearchParams(location.search);
 const state=Object.fromEntries(Object.entries(params).map(([k,v])=>[k,urlState.get(v)??defaults[k]]));
 for(const key of Object.keys(allowed))if(!allowed[key].includes(state[key]))state[key]=defaults[key];
 for(const key of ['subject','group','category','section'])
  if(!/^(all|[a-z][a-z0-9-]{1,49})$/.test(state[key]))state[key]='all';
 state.author=state.author.slice(0,32);
 const groupLabels={
  community:['Community & News','Κοινότητα & Ειδήσεις'],
  programming:['Programming & Software','Προγραμματισμός & Λογισμικό'],
  systems:['Systems & Devices','Συστήματα & Συσκευές'],
  security:['Security & Privacy','Ασφάλεια & Ιδιωτικότητα'],
  infrastructure:['Networks & Infrastructure','Δίκτυα & Υποδομές'],
  projects:['Projects & Creativity','Έργα & Δημιουργικότητα'],
  learning:['Learning & Careers','Εκπαίδευση & Καριέρα'],
  help:['Help & Feedback','Υποστήριξη & Σχόλια']
 };
 const T={
 en:{filters:'Search filters',source:'Source',type:'Content type',locale:'Language (website)',subject:'Website subject',
  group:'Forum group',category:'Forum category',section:'Forum subforum',
  days:'Forum date',sort:'Forum sort',field:'Search in Forum',author:'Forum author',
  all:'Everything',website:'Website',forum:'Forum discussions',page:'Web pages',lesson:'Guides & lessons',
  code:'Code & scripts',current:'Selected language',both:'English & Greek',
  allSubjects:'All website subjects',allGroups:'All Forum groups',allCategories:'All Forum categories',
  allSections:'All subforums',anyDate:'Any date',week:'Past 7 days',month:'Past 30 days',year:'Past year',
  relevance:'Most relevant',newest:'Newest first',oldest:'Oldest first',everywhere:'Titles & messages',
  title:'Titles only',authorHint:'Optional username',results:'Forum discussion results',loading:'Searching the Forum…',
  none:'No matching Forum discussions.',offline:'Forum search is temporarily unavailable.',
  more:'More Forum results',of:'of',found:'discussions',siteDisabled:'Only Forum results selected.',
  searchHere:'Search website pages and Forum discussions together.',
  note:'Date, author and sorting filters apply only to Forum discussions. Website lessons remain ranked by relevance.'},
 gr:{filters:'Φίλτρα αναζήτησης',source:'Πηγή',type:'Τύπος περιεχομένου',locale:'Γλώσσα (ιστοσελίδα)',subject:'Θέμα ιστοσελίδας',
  group:'Ομάδα φόρουμ',category:'Κατηγορία φόρουμ',section:'Υποενότητα φόρουμ',
  days:'Ημερομηνία φόρουμ',sort:'Ταξινόμηση φόρουμ',field:'Αναζήτηση σε φόρουμ',author:'Συντάκτης φόρουμ',
  all:'Όλες οι πηγές',website:'Ιστοσελίδα',forum:'Συζητήσεις φόρουμ',page:'Ιστοσελίδες',lesson:'Οδηγοί & μαθήματα',
  code:'Κώδικας & scripts',current:'Επιλεγμένη γλώσσα',both:'Ελληνικά & Αγγλικά',
  allSubjects:'Όλα τα θέματα ιστοσελίδας',allGroups:'Όλες οι ομάδες φόρουμ',allCategories:'Όλες οι κατηγορίες φόρουμ',
  allSections:'Όλες οι υποενότητες',anyDate:'Οποιαδήποτε ημερομηνία',week:'Τελευταίες 7 ημέρες',
  month:'Τελευταίες 30 ημέρες',year:'Τελευταίο έτος',relevance:'Σχετικότερα',
  newest:'Νεότερα πρώτα',oldest:'Παλαιότερα πρώτα',everywhere:'Τίτλοι & μηνύματα',
  title:'Μόνο τίτλοι',authorHint:'Προαιρετικό όνομα χρήστη',results:'Αποτελέσματα συζητήσεων φόρουμ',
  loading:'Αναζήτηση στο φόρουμ…',none:'Δεν βρέθηκαν συζητήσεις φόρουμ.',
  offline:'Η αναζήτηση φόρουμ δεν είναι προσωρινά διαθέσιμη.',
  more:'Περισσότερα αποτελέσματα φόρουμ',of:'από',found:'συζητήσεις',
  siteDisabled:'Επιλέχθηκαν μόνο αποτελέσματα φόρουμ.',
  searchHere:'Αναζήτησε ταυτόχρονα στην ιστοσελίδα και στις συζητήσεις φόρουμ.',
  note:'Τα φίλτρα ημερομηνίας, συντάκτη και ταξινόμησης ισχύουν μόνο για το φόρουμ. Τα μαθήματα παραμένουν ταξινομημένα κατά συνάφεια.'}
 };
 let locale='en',siteCats=[],forumCats=[],forumGroups=[],forumSections=[],metaLoaded=false,requestSerial=0,activeAbort=null;
 let currentSearch='',results=[],page=1,pages=1,total=0,displayQuery='',displayKey='',loading=false,error=false;
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const tr=k=>T[locale][k]||k;
 const option=(value,label,selected)=>'<option value="'+esc(value)+'"'+(selected?' selected':'')+'>'+esc(label)+'</option>';
 const origin=endpoint+'/api/forum/';
 const fetchPublic=async(path,signal)=>{
  const response=await fetch(origin+path,{method:'GET',mode:'cors',credentials:'omit',headers:{Accept:'application/json'},signal});
  if(!response.ok)throw Error('forum_search_unavailable');
  return response.json();
 };
 const label=(s)=>s?.['title_'+(locale==='gr'?'el':'en')]||s?.title_en||'';
 function addSelect(host,key,values){
  const wrapper=document.createElement('label');
  wrapper.setAttribute('data-for','unified-'+key);
  wrapper.innerHTML='<span></span><select id="unified-'+key+'" data-filter="'+key+'"></select>';
  host.appendChild(wrapper);
  updateOptions(key,values);
 }
 function updateOptions(key,values){
  const select=document.getElementById('unified-'+key);if(!select)return;
  select.innerHTML=values.map(([val,text])=>option(val,text,state[key]===val)).join('');
  if(values.some(item=>item[0]===state[key]))select.value=state[key];
  else {
   const waiting=(key==='subject'&&!siteCats.length)||
     (['group','category','section'].includes(key)&&!forumCats.length);
   if(waiting&&state[key]!==defaults[key]){
    select.insertAdjacentHTML('beforeend',option(state[key],state[key],true));
    select.value=state[key];
   }else{
    state[key]=values[0]?.[0]||defaults[key];
    select.value=state[key];
   }
  }
 }
 function showHide(){
  const forum=state.source!=='site'&&(state.kind==='all'||state.kind==='forum');
  for(const key of ['group','category','section','days','sort','field','author']){
   const node=document.querySelector('[data-for="unified-'+key+'"]');
   if(node)node.hidden=!forum;
  }
  const site=state.source!=='forum'&&state.kind!=='forum';
  for(const key of ['subject','locale']){
   const node=document.querySelector('[data-for="unified-'+key+'"]');
   if(node)node.hidden=!site;
  }
  const activeCount=Object.keys(defaults).filter(k=>state[k]!==defaults[k]).length;
  const badge=document.getElementById('unified-filter-count');
  if(badge)badge.textContent=activeCount?' ('+activeCount+')':'';
 }
 function relabel(lang){
  locale=lang==='gr'?'gr':'en';
  const summary=document.getElementById('unified-filter-title');if(summary)summary.textContent=tr('filters');
  const labels={
   source:'source',kind:'type',locale:'locale',subject:'subject',group:'group',
   category:'category',section:'section',days:'days',sort:'sort',field:'field',author:'author'
  };
  for(const key in labels){
   const wrap=document.querySelector('[data-for="unified-'+key+'"]');
   if(wrap)wrap.querySelector('span').textContent=tr(labels[key]);
  }
  const authorInput=document.getElementById('unified-author');if(authorInput)authorInput.placeholder=tr('authorHint');
  const note=document.getElementById('unified-filter-note');if(note)note.textContent=tr('note');
  updateOptions('source',[['all',tr('all')],['site',tr('website')],['forum',tr('forum')]]);
  updateOptions('kind',[['all',tr('all')],['page',tr('page')],['lesson',tr('lesson')],['code',tr('code')],['forum',tr('forum')]]);
  updateOptions('locale',[['current',tr('current')],['all',tr('both')],['en','English'],['el','Ελληνικά']]);
  updateOptions('subject',[['all',tr('allSubjects')],...siteCats.map(c=>[c[0],locale==='gr'?c[2]:c[1]])]);
  updateOptions('group',[['all',tr('allGroups')],...forumGroups.map(g=>[g,groupLabels[g]?.[locale==='gr'?1:0]||g])]);
  updateOptions('category',[['all',tr('allCategories')],...forumCats.filter(c=>state.group==='all'||c.group_slug===state.group).map(c=>[c.slug,label(c)])]);
  updateOptions('section',[['all',tr('allSections')],...forumSections.map(s=>[s.slug,label(s)])]);
  updateOptions('days',[['0',tr('anyDate')],['7',tr('week')],['30',tr('month')],['365',tr('year')]]);
  updateOptions('sort',[['relevance',tr('relevance')],['newest',tr('newest')],['oldest',tr('oldest')]]);
  updateOptions('field',[['all',tr('everywhere')],['title',tr('title')]]);
  showHide();
 }
 async function loadMetadata(){
  if(metaLoaded)return;
  metaLoaded=true;
  try{
   const data=await fetchPublic('categories');
   forumCats=data.categories||[];
   forumGroups=[...new Set(forumCats.map(c=>c.group_slug||'community'))];
   if(state.category!=='all')await loadSections();
   relabel(locale);
  }catch{metaLoaded=false;}
 }
 async function loadSections(){
  forumSections=[];
  if(state.category==='all')return;
  try{
   const data=await fetchPublic('sections?category='+encodeURIComponent(state.category));
   forumSections=data.sections||[];
  }catch{forumSections=[];}
 }
 function persist(){
  const u=new URL(location.href);
  for(const [key,param] of Object.entries(params)){
   if(state[key]===defaults[key])u.searchParams.delete(param);
   else u.searchParams.set(param,state[key]);
  }
  u.hash='library';
  u.searchParams.set('search','1');
  history.replaceState(null,'',u.pathname+u.search+u.hash);
 }
 function filterChanged(){
  requestSerial++;if(activeAbort){activeAbort.abort();activeAbort=null;}
  page=1;results=[];displayKey='';
  persist();showHide();
  window.dispatchEvent(new CustomEvent('dedsec:search-filters-changed'));
 }
 function configure(categories){
  siteCats=Array.isArray(categories)?categories:[];
  relabel(locale);
 }
 function init(){
  const form=document.getElementById('top-search');
  if(!form||document.getElementById('unified-search-filters'))return;
  const details=document.createElement('details');
  details.id='unified-search-filters';
  details.innerHTML='<summary id="unified-filter-summary"><span id="unified-filter-title"></span><span id="unified-filter-count"></span></summary><div id="unified-filter-grid" class="unified-filter-grid"></div><p id="unified-filter-note"></p>';
  form.append(details);
  const grid=details.querySelector('.unified-filter-grid');
  for(const key of ['source','kind','locale','subject','group','category','section','days','sort','field']){
   addSelect(grid,key,[[state[key],state[key]]]);
  }
  const authorWrap=document.createElement('label');authorWrap.setAttribute('data-for','unified-author');
  authorWrap.innerHTML='<span></span><input id="unified-author" data-filter="author" maxlength="32" autocomplete="off">';
  grid.append(authorWrap);
  authorWrap.querySelector('input').value=state.author;
  details.addEventListener('change',async e=>{
   const key=e.target?.dataset?.filter;if(!key||!(key in state))return;
   state[key]=String(e.target.value||defaults[key]);
   if(key==='source'&&state.source==='forum'&&!['all','forum'].includes(state.kind))state.kind='all';
   if(key==='source'&&state.source==='site'&&state.kind==='forum')state.kind='all';
   if(key==='kind'&&state.kind==='forum'&&state.source==='site')state.source='all';
   if(key==='kind'&&['page','lesson','code'].includes(state.kind)&&state.source==='forum')state.source='all';
   if(key==='group'){state.category='all';state.section='all';forumSections=[];}
   if(key==='category'){state.section='all';await loadSections();}
   relabel(locale);filterChanged();
  });
  relabel('en');
  loadMetadata();
 }
 function siteLanguage(chosen){return state.locale==='current'?(chosen==='gr'?'el':'en'):state.locale;}
 function siteCategory(current){return state.subject!=='all'?state.subject:current;}
 function showWebsite(){return state.source!=='forum'&&state.kind!=='forum';}
 function showForum(){return state.source!=='site'&&(state.kind==='all'||state.kind==='forum');}
 function filterSite(list){
  if(!showWebsite())return [];
  const kind=state.kind;
  return list.filter(d=>{
   const type=d.kind==='page'?'page':String(d.p||'').endsWith('.md')?'lesson':'code';
   return kind==='all'||kind===type;
  });
 }
 function placeholder(query){
  if(!showForum()||!query.trim())return '';
  return '<section id="unified-forum-results" class="unified-forum-results" aria-live="polite">'+
   '<h2>'+esc(tr('results'))+'</h2><p>'+esc(tr('loading'))+'</p></section>';
 }
 function keyFor(query){return JSON.stringify([query,state.group,state.category,state.section,state.days,state.sort,state.field,state.author]);}
 function card(item){
  const url=endpoint+'/forum/topic/'+encodeURIComponent(item.id);
  const category=locale==='gr'?item.category_el:item.category_en;
  const section=locale==='gr'?item.section_el:item.section_en;
  const when=String(item.updated_at||'').slice(0,10);
  return '<a class="unified-topic-result" href="'+esc(url)+'"><strong>'+esc(item.title)+'</strong>'+
   '<span class="unified-topic-meta">'+esc(category)+' / '+esc(section)+' · '+esc(item.author)+' · '+esc(when)+' · '+Number(item.replies||0)+' '+esc(locale==='gr'?'απαντήσεις':'replies')+'</span>'+
   (item.excerpt?'<p>'+esc(item.excerpt)+'</p>':'')+'</a>';
 }
 function display(){
  const node=document.getElementById('unified-forum-results');if(!node)return;
  if(error){node.innerHTML='<h2>'+esc(tr('results'))+'</h2><p role="status">'+esc(tr('offline'))+'</p>';return;}
  node.innerHTML='<h2>'+esc(tr('results'))+' · '+Number(total)+'</h2>'+
   (results.length?'<div class="unified-topic-list">'+results.map(card).join('')+'</div>':
    '<p>'+esc(loading?tr('loading'):tr('none'))+'</p>')+
   (page<pages?'<button type="button" id="unified-forum-more">'+esc(tr('more'))+'</button>':'');
  node.querySelector('#unified-forum-more')?.addEventListener('click',()=>runSearch(currentSearch,page+1,true));
 }
 async function runSearch(query,nextPage=1,append=false){
  const node=document.getElementById('unified-forum-results');if(!node)return;
  if(activeAbort){activeAbort.abort();activeAbort=null;}
  const controller=new AbortController();activeAbort=controller;
  const serial=++requestSerial,key=keyFor(query);
  loading=true;error=false;
  if(!append){results=[];page=1;total=0;display();}
  const qs=new URLSearchParams({q:query.slice(0,100),page:String(nextPage),sort:state.sort,field:state.field});
  if(state.group!=='all')qs.set('group',state.group);
  if(state.category!=='all')qs.set('category',state.category);
  if(state.section!=='all')qs.set('section',state.section);
  if(state.days!=='0')qs.set('days',state.days);
  if(state.author)qs.set('author',state.author);
  try{
   const data=await fetchPublic('search?'+qs,controller.signal);
   if(serial!==requestSerial||!document.getElementById('unified-forum-results'))return;
   results=append?results.concat(data.results||[]):data.results||[];
   total=data.total||0;pages=data.pages||1;page=nextPage;
   displayQuery=query;displayKey=key;loading=false;error=false;display();
  }catch(e){
   if(controller.signal.aborted||serial!==requestSerial)return;
   loading=false;error=true;display();
  }
 }
 function mount(lang,query){
  relabel(lang);currentSearch=query;
  if(!showForum()||query.trim().length<2){if(activeAbort)activeAbort.abort();return;}
  if(displayKey===keyFor(query)&&displayQuery===query){display();return;}
  runSearch(query,1);
 }
 init();
 window.DedSecUnifiedSearch=Object.freeze({configure,siteLanguage,siteCategory,showWebsite,showForum,filterSite,placeholder,mount});
})();
