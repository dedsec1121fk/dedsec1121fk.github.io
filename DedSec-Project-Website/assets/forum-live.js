(function(){
 'use strict';
 const root=document.getElementById('forum-inline');if(!root||!window.DEDSEC_FORUM_LIVE)return;
 const siteSearch=new URL(window.DEDSEC_FORUM_SEARCH_SITE||'https://ded-sec.space/');
 const dict={
 en:{home:'Forum categories',forum:'Forum',subforums:'Subforums',topics:'Topics',recent:'Recent topics',
  topic:'Topic',replies:'Replies',posts:'Posts',last:'Latest activity',none:'No topics yet. Start the first discussion!',
  back:'Back',newTopic:'New topic',send:'Publish',answer:'Reply',quote:'Quote',report:'Report',delete:'Delete',
  signin:'Log in',signup:'Create forum account',signout:'Log out',profile:'Edit username',
  tags:'Automatic tags',generatedTags:'Search tags are generated automatically when you publish.',
  loginTitle:'Log in to the forum',registerTitle:'Register for the forum',
  separate:'Forum accounts are separate from the main DedSec Project accounts.',
  handle:'Username',password:'Password (minimum 12 characters)',already:'Have an account? Log in',
  noAccount:'New member? Create an account',accountNeeded:'Register or log in to write.',
  changed:'Username updated.',signedOut:'You have signed out.',registered:'Forum account created.',
  ready:'You can now write in the forum.',invalid:'Please check the fields and try again.',
  topicTitle:'Topic title',message:'Your message',choose:'Choose a subforum',publish:'Publish topic',
  cancel:'Cancel',close:'Close',category:'Category',section:'Subforum',search:'Search topics',
  searchHint:'Search topic titles and messages',searchButton:'Search',clear:'Clear search',
  page:'Page',previous:'Previous',next:'Next',members:'Members',loading:'Loading discussions…',
  reportReason:'Please enter a reason for this report (at least 8 characters).',
  reported:'Report submitted.',deleteConfirm:'Delete this post? If it starts the topic, the whole topic will be deleted.',
  quoteLabel:'Quote',emptyBody:'Write a message before publishing.',error:'Unable to load the forum.',
  saved:'Your message was published.',about:'Read freely. Registered forum members can create topics and reply.',
  changeName:'New username',editAccount:'Forum account',accountDelete:'Delete forum account',
  deleteAccountConfirm:'Enter your password to permanently delete this forum account.',
  deleted:'Your forum account was deleted.',topicLocked:'This discussion is locked.',
  guest:'Guest',mine:'You',forumMember:'Forum member',
  noSection:'This subforum does not exist.',noCategory:'This category does not exist.',
  reportedAction:'Report this post',selectCategory:'Explore subforums',noPosts:'No posts here.'},
 el:{home:'Κατηγορίες φόρουμ',forum:'Φόρουμ',subforums:'Υποενότητες',topics:'Θέματα',recent:'Πρόσφατα θέματα',
  topic:'Θέμα',replies:'Απαντήσεις',posts:'Δημοσιεύσεις',last:'Τελευταία δραστηριότητα',none:'Δεν υπάρχουν ακόμη θέματα. Ξεκίνα την πρώτη συζήτηση!',
  back:'Πίσω',newTopic:'Νέο θέμα',send:'Δημοσίευση',answer:'Απάντηση',quote:'Παράθεση',report:'Αναφορά',delete:'Διαγραφή',
  signin:'Σύνδεση',signup:'Εγγραφή στο φόρουμ',signout:'Αποσύνδεση',profile:'Αλλαγή ονόματος',
  tags:'Αυτόματες ετικέτες',generatedTags:'Οι ετικέτες αναζήτησης προστίθενται αυτόματα κατά τη δημοσίευση.',
  loginTitle:'Σύνδεση στο φόρουμ',registerTitle:'Εγγραφή στο φόρουμ',
  separate:'Οι λογαριασμοί του φόρουμ είναι ξεχωριστοί από τους λογαριασμούς DedSec Project.',
  handle:'Όνομα χρήστη',password:'Κωδικός (τουλάχιστον 12 χαρακτήρες)',already:'Έχεις λογαριασμό; Σύνδεση',
  noAccount:'Νέο μέλος; Κάνε εγγραφή',accountNeeded:'Κάνε εγγραφή ή σύνδεση για να γράψεις.',
  changed:'Το όνομα χρήστη ενημερώθηκε.',signedOut:'Αποσυνδέθηκες.',registered:'Ο λογαριασμός φόρουμ δημιουργήθηκε.',
  ready:'Τώρα μπορείς να γράφεις στο φόρουμ.',invalid:'Έλεγξε τα πεδία και δοκίμασε ξανά.',
  topicTitle:'Τίτλος θέματος',message:'Το μήνυμά σου',choose:'Επίλεξε υποενότητα',publish:'Δημοσίευση θέματος',
  cancel:'Ακύρωση',close:'Κλείσιμο',category:'Κατηγορία',section:'Υποενότητα',search:'Αναζήτηση θεμάτων',
  searchHint:'Αναζήτηση τίτλων και μηνυμάτων',searchButton:'Αναζήτηση',clear:'Καθαρισμός',
  page:'Σελίδα',previous:'Προηγούμενη',next:'Επόμενη',members:'Μέλη',loading:'Φόρτωση συζητήσεων…',
  reportReason:'Γράψε λόγο αναφοράς (τουλάχιστον 8 χαρακτήρες).',
  reported:'Η αναφορά υποβλήθηκε.',deleteConfirm:'Να διαγραφεί η δημοσίευση; Αν είναι η πρώτη, διαγράφεται ολόκληρο το θέμα.',
  quoteLabel:'Παράθεση',emptyBody:'Γράψε ένα μήνυμα πριν τη δημοσίευση.',error:'Αδυναμία φόρτωσης του φόρουμ.',
  saved:'Το μήνυμά σου δημοσιεύτηκε.',about:'Όλοι μπορούν να διαβάσουν. Τα εγγεγραμμένα μέλη του φόρουμ μπορούν να γράφουν θέματα και απαντήσεις.',
  changeName:'Νέο όνομα χρήστη',editAccount:'Λογαριασμός φόρουμ',accountDelete:'Διαγραφή λογαριασμού',
  deleteAccountConfirm:'Πληκτρολόγησε τον κωδικό σου για οριστική διαγραφή αυτού του λογαριασμού φόρουμ.',
  deleted:'Ο λογαριασμός φόρουμ διαγράφηκε.',topicLocked:'Αυτή η συζήτηση είναι κλειδωμένη.',
  guest:'Επισκέπτης',mine:'Εσύ',forumMember:'Μέλος φόρουμ',
  noSection:'Η υποενότητα δεν υπάρχει.',noCategory:'Η κατηγορία δεν υπάρχει.',
  reportedAction:'Αναφορά δημοσίευσης',selectCategory:'Περιήγηση υποενοτήτων',noPosts:'Δεν υπάρχουν δημοσιεύσεις.'}
 };
 let lang=document.documentElement.lang==='el'?'el':'en';
 let T=dict[lang];
 let auth={signedIn:false},categories=[],current={type:'home'},selected=null;
 let routeSequence=0,flash='',modal=null;
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const title=x=>x?.['title_'+lang]||x?.title_en||'';
 const description=x=>x?.['description_'+lang]||x?.description_en||'';
 const count=x=>Math.max(0,Number(x)||0);
 const age=x=>{if(!x)return '—';const date=new Date(x);return Number.isNaN(date.getTime())?'—':new Intl.DateTimeFormat(lang==='el'?'el-GR':'en-US',{dateStyle:'medium',timeStyle:'short'}).format(date);};
 const href={
  home:()=>'/forum',
  category:slug=>'/forum/category/'+encodeURIComponent(slug),
  section:slug=>'/forum/section/'+encodeURIComponent(slug),
  topic:id=>'/forum/topic/'+encodeURIComponent(id)
 };
 const api=async(path,method='GET',data)=>{
  const options={method,credentials:'same-origin',headers:{'Accept':'application/json'},cache:'no-store'};
  if(data!==undefined){
   options.headers['Content-Type']='application/json';
   if(auth?.csrf)options.headers['X-CSRF-Token']=auth.csrf;
   options.body=JSON.stringify(data);
  }else if(method!=='GET'&&auth?.csrf)options.headers['X-CSRF-Token']=auth.csrf;
  let response=await fetch('/api/forum/'+path,options),body;
  try{body=await response.json();}catch{throw Error('invalid_server_response');}
  if(!response.ok)throw Error(body.error||'service_unavailable');
  return body;
 };
 const notify=(message)=>{flash=message;const target=root.querySelector('#forum-flash');if(target){target.textContent=message;target.hidden=!message;}};
 async function me(){
  try{auth=await api('me');}catch{auth={signedIn:false};}
 }
 function sectionHeader(label,small=''){
  return '<div class="section-head"><span>'+esc(label)+'</span>'+(small?'<small>'+esc(small)+'</small>':'')+'</div>';
 }
 function categoryRow(cat){
  return '<a class="forum-category-row" href="'+href.category(cat.slug)+'" data-route>'+
   '<span><strong class="forum-row-title">'+esc(title(cat))+'</strong><span class="forum-row-subtitle">'+esc(description(cat))+'</span></span>'+
   '<span class="forum-row-stats"><strong>'+count(cat.topics)+'</strong>'+esc(T.topics)+'</span>'+
   '<span class="forum-row-last">'+count(cat.sections)+' '+esc(T.subforums)+'</span></a>';
 }

 const groups=[
  ['community','Community & News','Κοινότητα & Ειδήσεις'],
  ['programming','Programming & Software','Προγραμματισμός & Λογισμικό'],
  ['systems','Systems & Devices','Συστήματα & Συσκευές'],
  ['security','Security & Privacy','Ασφάλεια & Ιδιωτικότητα'],
  ['infrastructure','Networks & Infrastructure','Δίκτυα & Υποδομές'],
  ['projects','Projects & Creativity','Έργα & Δημιουργικότητα'],
  ['learning','Learning & Careers','Εκπαίδευση & Καριέρα'],
  ['help','Help & Feedback','Υποστήριξη & Σχόλια']
 ];
 const expandedGroups=new Set(['community','programming']);
 function groupedCategories(items){
  const buckets=new Map();
  for(const c of items){
   const key=c.group_slug||'community';
   if(!buckets.has(key))buckets.set(key,[]);
   buckets.get(key).push(c);
  }
  return groups.filter(g=>buckets.has(g[0])).map(g=>{
   const groupCats=buckets.get(g[0])||[];
   return '<details class="forum-category-group" data-forum-group="'+esc(g[0])+'"'+(expandedGroups.has(g[0])?' open':'')+'>'+
    '<summary><strong>'+esc(lang==='el'?g[2]:g[1])+'</strong><span>'+groupCats.length+' '+esc(lang==='el'?'κατηγορίες':'categories')+'</span></summary>'+
    '<div class="forum-category-list">'+groupCats.map(categoryRow).join('')+'</div></details>';
  }).join('');
 }
 function sectionRow(s){
  return '<a class="forum-category-row" href="'+href.section(s.slug)+'" data-route>'+
   '<span><strong class="forum-row-title">'+esc(title(s))+'</strong><span class="forum-row-subtitle">'+esc(description(s))+'</span></span>'+
   '<span class="forum-row-stats"><strong>'+count(s.topics)+'</strong>'+esc(T.topics)+'</span>'+
   '<span class="forum-row-last">'+(s.last_post_at?esc(age(s.last_post_at)):count(s.posts)+' '+esc(T.posts))+'</span></a>';
 }
 function topicTags(value,category){
  const tags=Array.isArray(value)?value:String(value||'').split('|').filter(Boolean);
  if(!tags.length)return '';
  return '<div class="forum-auto-tags" aria-label="'+esc(T.tags)+'">'+tags.map(tag=>{
   const target=new URL(siteSearch);
   target.searchParams.set('search','1');
   target.searchParams.set('sf_source','forum');
   target.searchParams.set('q',tag);
   if(category)target.searchParams.set('sf_cat',category);
   target.hash='library';
   return '<a class="forum-tag" href="'+esc(target.href)+'">'+esc(tag)+'</a>';
  }).join('')+'</div>';
 }
 function createTopicButton(){
  return auth.signedIn?'<div class="forum-toolbar"><button type="button" data-action="new-topic">'+esc(T.newTopic)+'</button></div>':'';
 }
 function topicRow(t){
  return '<a class="forum-thread-row" href="'+href.topic(t.id)+'" data-route>'+
   '<span><strong class="forum-row-title">'+(t.pinned?'★ ':'')+esc(t.title)+(t.locked?' · 🔒':'')+'</strong>'+
   '<span class="forum-row-subtitle">'+esc(t.author)+' · '+esc(age(t.created_at))+'</span>'+topicTags(t.tags)+'</span>'+
   '<span class="forum-row-stats"><strong>'+count(t.replies)+'</strong>'+esc(T.replies)+'</span>'+
   '<span class="forum-row-last">'+esc(age(t.last_post_at||t.updated_at))+'</span></a>';
 }
 function bread(items){
  return '<nav class="forum-breadcrumbs" aria-label="Forum"><a href="/forum" data-route>'+esc(T.home)+'</a>'+items.map(x=>' / <a href="'+x.url+'" data-route>'+esc(x.label)+'</a>').join('')+'</nav>';
 }
 function pager(page,pages){
  if(pages<2)return '';
  return '<div class="forum-pager">'+
   '<button data-action="page" data-page="'+(page-1)+'" '+(page<=1?'disabled':'')+'>'+esc(T.previous)+'</button>'+
   '<span>'+esc(T.page)+' '+page+' / '+pages+'</span>'+
   '<button data-action="page" data-page="'+(page+1)+'" '+(page>=pages?'disabled':'')+'>'+esc(T.next)+'</button></div>';
 }
 function wrapper(html){
  const session=auth?.signedIn?
    '<span>'+esc(auth.handle)+'</span><button data-action="profile">'+esc(T.profile)+'</button><button data-action="logout">'+esc(T.signout)+'</button>':
    '<span>'+esc(T.guest)+'</span><button data-action="login">'+esc(T.signin)+'</button><button data-action="register">'+esc(T.signup)+'</button>';
  root.innerHTML='<div class="forum-page">'+
   '<div class="forum-topline"><div id="forum-auth">'+session+'</div></div>'+
   '<div id="forum-flash" role="status" '+(!flash?'hidden':'')+'>'+esc(flash)+'</div>'+
   '<p class="forum-account-note">'+esc(T.separate)+'</p>'+html+
   '<div class="forum-footer">'+esc(T.about)+'</div></div>'+
   '<dialog id="forum-live-dialog" aria-label="'+esc(T.forum)+'"></dialog>';
  if(modal)renderModal();
 }
 function routeInfo(){
  const p=location.pathname.replace(/\/$/,'');
  const m=p.match(/^\/forum\/(category|section|topic)\/([a-z0-9-]+)$/);
  return m?{type:m[1],slug:m[2]}:{type:'home',slug:''};
 }
 async function render(){
  const sequence=++routeSequence;current=routeInfo();
  const search=new URLSearchParams(location.search),page=Math.max(1,Math.min(200,Number(search.get('page'))||1));
  try{
   if(current.type==='home'){
    const data=await api('categories');if(sequence!==routeSequence)return;
    categories=data.categories;
    wrapper(bread([])+createTopicButton()+sectionHeader(T.home, String(categories.length))+
     '<div class="forum-category-groups">'+groupedCategories(categories)+'</div>');
    document.title=T.home+' | DedSec Project';
   }else if(current.type==='category'){
    const data=await api('sections?category='+encodeURIComponent(current.slug));if(sequence!==routeSequence)return;
    selected={category:data.category,sections:data.sections};
    wrapper(bread([{label:title(data.category),url:href.category(current.slug)}])+
     '<div class="forum-route-header"><h2>'+esc(title(data.category))+'</h2><p>'+esc(description(data.category))+'</p></div>'+
     createTopicButton()+sectionHeader(T.subforums,String(data.sections.length))+
     '<div class="forum-category-list">'+data.sections.map(sectionRow).join('')+'</div>');
    document.title=title(data.category)+' | DedSec Forum';
   }else if(current.type==='section'){
    const data=await api('topics?'+new URLSearchParams({section:current.slug,page:String(page)}));if(sequence!==routeSequence)return;
    selected={section:data.section,topics:data.topics};
    const crumb=[{label:lang==='el'?data.section.category_el:data.section.category_en,url:href.category(data.section.category_slug)},
     {label:title(data.section),url:href.section(current.slug)}];
    wrapper(bread(crumb)+'<div class="forum-route-header"><h2>'+esc(title(data.section))+'</h2><p>'+esc(description(data.section))+'</p></div>'+
     createTopicButton()+
     sectionHeader(T.topics,String(data.total))+
     '<div class="forum-thread-list">'+(data.topics.length?data.topics.map(topicRow).join(''):'<div class="forum-empty">'+esc(T.none)+'</div>')+'</div>'+
     pager(data.page,data.pages));
    document.title=title(data.section)+' | DedSec Forum';
   }else if(current.type==='topic'){
    const data=await api('topic?'+new URLSearchParams({id:current.slug,page:String(page)}));if(sequence!==routeSequence)return;
    selected={topic:data.topic,posts:data.posts,total:data.total};
    const crumb=[{label:lang==='el'?data.topic.category_el:data.topic.category_en,url:href.category(data.topic.category_slug)},
     {label:lang==='el'?data.topic.section_el:data.topic.section_en,url:href.section(data.topic.section_slug)}];
    const posts=data.posts.map((p,i)=>'<article class="forum-post" id="post-'+esc(p.id)+'">'+
     '<aside class="forum-author"><div class="avatar" aria-hidden="true">'+esc((p.author||'?').slice(0,1).toUpperCase())+'</div>'+
     '<div><strong>'+esc(p.author)+'</strong><small>'+esc(T.forumMember)+'</small></div></aside>'+
     '<div class="forum-post-content"><header class="post-header"><span>#'+((data.page-1)*20+i+1)+'</span><time>'+esc(age(p.created_at))+'</time></header>'+
     '<div class="post-body">'+esc(p.body)+'</div>'+
     '<div class="post-actions"><button data-action="quote" data-id="'+esc(p.id)+'" '+(data.topic.locked?'disabled':'')+'>'+esc(T.quote)+'</button>'+
     (p.deleted?'':'<button data-action="report" data-id="'+esc(p.id)+'">'+esc(T.report)+'</button>')+
     (auth.signedIn&&p.author_id===auth.userId?'<button data-action="delete" data-id="'+esc(p.id)+'">'+esc(T.delete)+'</button>':'')+
     '</div></div></article>').join('');
    wrapper(bread(crumb)+'<div class="thread-header"><h2>'+esc(data.topic.title)+'</h2>'+
     '<div class="thread-meta">'+esc(age(data.topic.created_at))+' · '+esc(String(data.total))+' '+esc(T.posts)+'</div>'+topicTags(data.topic.tags,data.topic.category_slug)+
     '<div class="thread-actions"><button data-action="reply" '+(data.topic.locked?'disabled':'')+'>'+esc(data.topic.locked?T.topicLocked:T.answer)+'</button></div></div>'+
     '<div class="forum-post-list">'+(posts||'<div class="forum-empty">'+esc(T.noPosts)+'</div>')+'</div>'+
     pager(data.page,data.pages));
    document.title=data.topic.title+' | DedSec Forum';
   }
  }catch(e){
   if(sequence!==routeSequence)return;
   wrapper(bread([])+'<div class="forum-empty">'+esc(e.message==='category_not_found'?T.noCategory:e.message==='section_not_found'?T.noSection:T.error+' ('+e.message+')')+'</div>');
  }
 }
 function go(url){
  if(url===location.pathname+location.search)return;
  history.pushState(null,'',url);
  flash='';modal=null;
  render();window.scrollTo({top:0,behavior:'auto'});
 }
 async function modalForm(type,quote=''){
  if((type==='reply'||type==='new-topic')&&!auth.signedIn){notify(T.accountNeeded);modal={type:'login'};renderModal();return;}
  modal={type,quote,sections:current.type==='category'?selected.sections:[],categorySlug:current.type==='home'?(categories[0]?.slug||''):current.type==='category'?selected.category.slug:''};
  renderModal();
  if(type==='new-topic'&&current.type==='home')await reloadSections();
 }
 async function reloadSections(){
  const currentModal=modal,slug=currentModal?.categorySlug;
  if(!slug||currentModal.type!=='new-topic')return;
  try{
   const data=await api('sections?category='+encodeURIComponent(slug));
   if(modal!==currentModal||modal.categorySlug!==slug)return;
   modal.sections=data.sections||[];
   const select=root.querySelector('#forum-new-section');
   if(select)select.innerHTML=modal.sections.map(s=>'<option value="'+esc(s.slug)+'">'+esc(title(s))+'</option>').join('');
  }catch(e){notify(T.error+' '+e.message);}
 }
 function renderModal(){
  const dialog=root.querySelector('#forum-live-dialog');if(!dialog||!modal)return;
  const type=modal.type;
  let title='',form='';
  if(type==='login'||type==='register'){
   title=type==='login'?T.loginTitle:T.registerTitle;
   form='<label>'+esc(T.handle)+'<input name="handle" type="text" autocomplete="username" minlength="3" maxlength="24" required></label>'+
    '<label>'+esc(T.password)+'<input name="password" type="password" autocomplete="'+(type==='register'?'new-password':'current-password')+'" minlength="'+(type==='register'?12:1)+'" maxlength="128" required></label>'+
    '<p>'+esc(T.separate)+'</p>';
  }else if(type==='new-topic'){
   title=T.newTopic;
   const catChoice=current.type==='home'?'<label>'+esc(T.category)+'<select name="category" id="forum-new-category" required>'+categories.map(c=>'<option value="'+esc(c.slug)+'"'+(c.slug===modal.categorySlug?' selected':'')+'>'+esc(title(c))+'</option>').join('')+'</select></label>':'';
   const secChoice=current.type==='section'?'':'<label>'+esc(T.choose)+'<select name="section" id="forum-new-section" required>'+modal.sections.map(x=>'<option value="'+esc(x.slug)+'">'+esc(title(x))+'</option>').join('')+'</select></label>';
   form=catChoice+secChoice+
    '<label>'+esc(T.topicTitle)+'<input name="title" minlength="6" maxlength="150" required></label>'+
    '<label>'+esc(T.message)+'<textarea name="body" minlength="10" maxlength="10000" rows="8" required></textarea></label>'+
    '<p>'+esc(T.generatedTags)+'</p>';
  }else if(type==='reply'){
   title=T.answer;
   form='<label>'+esc(T.message)+'<textarea name="body" minlength="2" maxlength="10000" rows="8" required>'+esc(modal.quote)+'</textarea></label>';
  }else if(type==='profile'){
   title=T.editAccount;
   form='<label>'+esc(T.changeName)+'<input name="handle" value="'+esc(auth.handle)+'" minlength="3" maxlength="24" required></label>';
  }else if(type==='delete-account'){
   title=T.accountDelete;
   form='<p>'+esc(T.deleteAccountConfirm)+'</p><label>'+esc(T.password)+'<input name="password" type="password" required></label>';
  }else return;
  dialog.innerHTML='<div class="dialog-title"><h2>'+esc(title)+'</h2><button type="button" data-action="close" aria-label="'+esc(T.close)+'">×</button></div>'+
   '<form id="forum-live-form" data-form="'+type+'"><div class="forum-form-fields">'+form+'</div>'+
   '<div class="dialog-footer"><button type="button" data-action="close">'+esc(T.cancel)+'</button>'+
   '<button type="submit" class="forum-primary">'+esc(type==='login'?T.signin:type==='register'?T.signup:type==='new-topic'?T.publish:type==='reply'?T.answer:T.send)+'</button></div></form>'+
   (type==='login'?'<button type="button" data-action="register">'+esc(T.noAccount)+'</button>':type==='register'?'<button type="button" data-action="login">'+esc(T.already)+'</button>':'');
  if(!dialog.open)dialog.showModal();
  dialog.querySelector('input,textarea')?.focus();
 }
 async function submitForm(form){
  const type=form.dataset.form,b=new FormData(form),button=form.querySelector('[type=submit]');
  button.disabled=true;
  try{
   if(type==='register'||type==='login'){
    const data=await api(type,'POST',{handle:b.get('handle'),password:b.get('password')});
    auth=data;await me();modal=null;root.querySelector('dialog')?.close();
    notify(type==='register'?T.registered:T.ready);await render();
   }else if(type==='new-topic'){
    const section=current.type==='section'?current.slug:b.get('section');
    const data=await api('new-topic','POST',{section,title:b.get('title'),body:b.get('body')});
    modal=null;root.querySelector('dialog')?.close();go(href.topic(data.id));
   }else if(type==='reply'){
    await api('reply','POST',{topicId:current.slug,body:b.get('body')});
    modal=null;root.querySelector('dialog')?.close();
    const fresh=await api('topic?id='+encodeURIComponent(current.slug));
    const lastPage=Math.max(1,Math.ceil(fresh.total/20));
    const next=href.topic(current.slug)+(lastPage>1?'?page='+lastPage:'');
    go(next);notify(T.saved);
   }else if(type==='profile'){
    const data=await api('profile','POST',{handle:b.get('handle')});
    auth.handle=data.handle;modal=null;root.querySelector('dialog')?.close();await render();notify(T.changed);
   }else if(type==='delete-account'){
    await api('account','DELETE',{password:b.get('password')});
    auth={signedIn:false};modal=null;root.querySelector('dialog')?.close();await render();notify(T.deleted);
   }
  }catch(e){notify(T.error+' '+e.message);}finally{button.disabled=false;}
 }
 root.addEventListener('click',async e=>{
  const el=e.target.closest('a,button');if(!el)return;
  if(el.matches('a[data-route]')){e.preventDefault();go(el.getAttribute('href'));return;}
  if(!el.dataset.action)return;
  const action=el.dataset.action;
  if(action==='page'){
   const url=new URL(location.href);url.searchParams.set('page',el.dataset.page);go(url.pathname+url.search);return;
  }
  if(['login','register','profile','new-topic','reply','delete-account'].includes(action)){await modalForm(action);return;}
  if(action==='close'){modal=null;root.querySelector('dialog')?.close();return;}
  if(action==='logout'){
   try{await api('logout','POST',{});auth={signedIn:false};await render();notify(T.signedOut);}catch(e){notify(e.message);}return;
  }
  if(action==='quote'){
   const post=selected?.posts?.find(x=>x.id===el.dataset.id);
   if(post)modalForm('reply','> '+post.author+':\n> '+post.body.replaceAll('\n','\n> ')+'\n\n');
   return;
  }
  if(action==='report'){
   if(!auth.signedIn){notify(T.accountNeeded);modalForm('login');return;}
   const reason=prompt(T.reportReason);
   if(reason===null)return;
   try{await api('report','POST',{postId:el.dataset.id,reason});notify(T.reported);}catch(e){notify(e.message);}return;
  }
  if(action==='delete'){
   if(!confirm(T.deleteConfirm))return;
   try{const result=await api('post','DELETE',{postId:el.dataset.id});
    if(result.topicDeleted)go(href.section(selected.topic.section_slug));else await render();
   }catch(e){notify(e.message);}return;
  }
 });
 root.addEventListener('change',async e=>{
  if(e.target.id==='forum-new-category'&&modal?.type==='new-topic'){
   modal.categorySlug=e.target.value;
   await reloadSections();
  }
 });
 root.addEventListener('submit',async e=>{
  if(e.target.id==='forum-live-form'){e.preventDefault();await submitForm(e.target);}
 });
 root.addEventListener('toggle',e=>{
  const g=e.target.closest?.('.forum-category-group');
  if(!g||!g.dataset.forumGroup)return;
  if(g.open)expandedGroups.add(g.dataset.forumGroup);else expandedGroups.delete(g.dataset.forumGroup);
 },true);
 window.addEventListener('popstate',()=>{modal=null;render();});
 window.DedSecForumUI=Object.freeze({
  setPreferences(nextLang){
   lang=nextLang==='gr'?'el':'en';T=dict[lang];modal=null;render();
  },
  openAccount(){
   if(auth.signedIn)modalForm('profile');
   else modalForm('login');
  }
 });
 me().then(render);
})();
