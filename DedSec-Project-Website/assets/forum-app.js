
(function(){'use strict';
 const opts=new URLSearchParams(location.search),inline=window.DEDSEC_FORUM_INLINE===true;
 let lang=inline?(document.documentElement.lang==='el'?'el':'en'):(opts.get('lang')==='gr'?'el':'en');
 let gr=lang==='el';
 const preview=inline||opts.get('preview')==='1';
 if(!inline){
  document.documentElement.lang=lang;
  document.documentElement.dataset.theme=opts.get('theme')==='light'?'light':'dark';
  document.body.classList.add(opts.get('theme')==='light'?'theme-light':'theme-dark');
  if(window.parent!==window)document.body.classList.add('forum-embedded');
 }
 const translations={en:{all:'All discussions',allCats:'All categories',newTopic:'+ New topic',search:'Search discussions',loading:'Loading discussions…',categories:'Forum categories',recent:'Recent discussions',topics:'topics',posts:'posts',replies:'replies',noThreads:'No discussions yet. Be the first to start one.',noPosts:'No posts on this page.',guest:'Browsing as guest',member:'Signed in as',signIn:'Sign in to post',verify:'Verify your email to post',changeName:'Edit username',reply:'Reply',quote:'Quote',report:'Report',remove:'Delete',locked:'Locked',back:'Back to discussions',topic:'Create a new topic',message:'Reply to this topic',cat:'Category',title:'Title',body:'Message',publish:'Publish',close:'Close',page:'Page',previous:'Previous',next:'Next',status:'Forum unavailable. Check that the Test Worker and D1 migration are deployed.',plain:'Plain text only. Be respectful.',share:'Copy topic link',linkCopied:'Topic link copied.',invalid:'Please check the required fields.',reported:'Report submitted for review.',confirmDelete:'Delete this post? This cannot be undone.',badHandle:'Choose a username of 3–24 letters, numbers, _ or -.',handleChanged:'Username updated.',alertLogin:'Open your DedSec account to sign in.',errorPrefix:'Error: '},el:{all:'Όλες οι συζητήσεις',allCats:'Όλες οι κατηγορίες',newTopic:'+ Νέο θέμα',search:'Αναζήτηση συζητήσεων',loading:'Φόρτωση συζητήσεων…',categories:'Κατηγορίες φόρουμ',recent:'Πρόσφατες συζητήσεις',topics:'θέματα',posts:'δημοσιεύσεις',replies:'απαντήσεις',noThreads:'Δεν υπάρχουν ακόμη συζητήσεις. Ξεκίνησε την πρώτη.',noPosts:'Δεν υπάρχουν δημοσιεύσεις σε αυτή τη σελίδα.',guest:'Περιήγηση ως επισκέπτης',member:'Συνδεδεμένος ως',signIn:'Σύνδεση για δημοσίευση',verify:'Επιβεβαίωσε το email για δημοσίευση',changeName:'Αλλαγή ονόματος',reply:'Απάντηση',quote:'Παράθεση',report:'Αναφορά',remove:'Διαγραφή',locked:'Κλειδωμένο',back:'Πίσω στις συζητήσεις',topic:'Νέο θέμα',message:'Απάντηση στο θέμα',cat:'Κατηγορία',title:'Τίτλος',body:'Μήνυμα',publish:'Δημοσίευση',close:'Κλείσιμο',page:'Σελίδα',previous:'Προηγούμενη',next:'Επόμενη',status:'Το φόρουμ δεν είναι διαθέσιμο. Έλεγξε το Test Worker και τη μετεγκατάσταση D1.',plain:'Μόνο απλό κείμενο. Με σεβασμό.',share:'Αντιγραφή συνδέσμου',linkCopied:'Ο σύνδεσμος αντιγράφηκε.',invalid:'Έλεγξε τα απαιτούμενα πεδία.',reported:'Η αναφορά καταχωρήθηκε.',confirmDelete:'Να διαγραφεί αυτή η δημοσίευση; Δεν αναιρείται.',badHandle:'Όνομα 3–24 γράμματα, αριθμοί, _ ή -.',handleChanged:'Το όνομα ενημερώθηκε.',alertLogin:'Άνοιξε τον λογαριασμό DedSec για σύνδεση.',errorPrefix:'Σφάλμα: '}};let labels=translations[lang];
 const el=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const state={categories:[],auth:{signedIn:false},category:'',query:'',thread:/^[a-f0-9]{24}$/.test(opts.get('thread')||'')?opts.get('thread'):null,page:1,postPage:1,detail:null,compose:'thread'};
 const api=async(path,method='GET',data)=>{
  const result=await fetch('/api/forum/'+path,{method,headers:{'X-DedSec-Embedded':'1',...(data?{'Content-Type':'application/json','X-CSRF-Token':state.auth.csrf||''}:{})},credentials:'include',body:data?JSON.stringify(data):undefined,cache:'no-store'});
  let content;try{content=await result.json();}catch{throw Error('forum_not_configured');}
  if(!result.ok)throw Error(content.error||'service_unavailable');return content;
 };
 const parentSend=(type,extra={})=>{if(window.parent!==window)window.parent.postMessage({type,...extra},'https://dedsec1121fk.github.io');};
 const relativeTime=d=>{if(!d)return '—';try{return new Intl.DateTimeFormat(lang,{dateStyle:'medium',timeStyle:'short'}).format(new Date(d));}catch{return '—';}};
 function announce(message){const a=el('forum-alert');a.textContent=message;a.hidden=!message;}
 function tipError(e){const common={sign_in_required:labels.signIn,email_not_verified:labels.verify,forum_not_configured:labels.status,forum_frontend_unavailable:labels.status,thread_locked:labels.locked,handle_taken:gr?'Το όνομα χρησιμοποιείται.':'Username is already taken.',rate_limited:gr?'Πολλές ενέργειες. Δοκίμασε αργότερα.':'Too many requests. Try again later.',csrf_denied:gr?'Η σύνδεση έληξε. Κάνε ανανέωση.':'Session expired. Refresh the account.',thread_not_found:gr?'Το θέμα δεν βρέθηκε.':'Topic not found.'};announce(common[e.message]||labels.errorPrefix+e.message);}
 function height(){requestAnimationFrame(()=>parentSend('dedsec-forum-height',{height:document.documentElement.scrollHeight}));}
 function route(){const url=new URL(location.href);if(state.thread)url.searchParams.set('thread',state.thread);else url.searchParams.delete('thread');history.replaceState(null,'',url);parentSend('dedsec-forum-route',{threadId:state.thread});}
 function categoryLabel(c){return c['title_'+lang]||c.title_en||'';}
 function categoryOptions(){el('forum-category').innerHTML='<option value="">'+labels.allCats+'</option>'+state.categories.map(c=>'<option value="'+esc(c.slug)+'">'+esc(categoryLabel(c))+'</option>').join('');el('forum-new-category').innerHTML=state.categories.map(c=>'<option value="'+esc(c.slug)+'">'+esc(categoryLabel(c))+'</option>').join('');el('forum-category').value=state.category;}
 function authRender(){let html;if(!state.auth.signedIn)html='<span>'+labels.guest+'</span><button class="secondary" id="forum-login">'+labels.signIn+'</button>';else if(!state.auth.verified)html='<span>'+labels.verify+'</span><button class="secondary" id="forum-login">'+labels.signIn+'</button>';else html='<span>'+labels.member+' <strong>'+esc(state.auth.handle)+'</strong></span><button class="secondary" id="forum-username">'+labels.changeName+'</button>';el('forum-auth').innerHTML=html;}
 function initLabels(){el('forum-all').textContent=labels.all;el('forum-new').textContent=labels.newTopic;el('forum-submit').textContent=labels.publish;el('forum-form-hint').textContent=labels.plain;el('forum-body-label').textContent=labels.body;el('forum-cancel').setAttribute('aria-label',labels.close);el('forum-title').placeholder=gr?'Τι θέλεις να συζητήσουμε;':'What would you like to discuss?';el('forum-body').placeholder=gr?'Γράψε το μήνυμά σου…':'Write your message…';document.querySelector('.forum-footer span:last-child').textContent=gr?'Με σεβασμό · Χωρίς προσωπικά δεδομένα · Υπεύθυνη συζήτηση ασφάλειας':'Be respectful · No private data · Responsible security discussion';}
 async function authRefresh(){try{state.auth=await api('me');}catch{state.auth={signedIn:false};}authRender();}
 function pager(pages,page,kind){if(pages<=1)return '';return '<div class="forum-pager"><button type="button" data-page="'+(page-1)+'" data-kind="'+kind+'" '+(page===1?'disabled':'')+'>'+labels.previous+'</button><span>'+labels.page+' '+page+' / '+pages+'</span><button type="button" data-page="'+(page+1)+'" data-kind="'+kind+'" '+(page===pages?'disabled':'')+'>'+labels.next+'</button></div>';}
 function categoryRows(){return '<div class="section-head">'+labels.categories+'</div><div class="forum-category-list">'+state.categories.map(c=>'<a href="#category-'+esc(c.slug)+'" data-cat="'+esc(c.slug)+'" class="forum-category-row"><span><span class="forum-row-title">▣ '+esc(categoryLabel(c))+'</span><span class="forum-row-subtitle">'+esc(c['description_'+lang]||c.description_en)+'</span></span><span class="forum-row-stats"><strong>'+(c.threads==null?'—':Number(c.threads))+'</strong>'+labels.topics+'</span><span class="forum-row-last">'+(c.posts==null?'—':Number(c.posts))+' '+labels.posts+'</span></a>').join('')+'</div>';}
 async function showList(){el('forum-content').innerHTML='<p class="forum-loading">'+labels.loading+'</p>';height();
  try{
   const params=new URLSearchParams({page:String(state.page)});if(state.category)params.set('category',state.category);if(state.query)params.set('q',state.query);
   const result=await api('threads?'+params.toString());
   let html=!state.category&&!state.query?categoryRows():'';
   html+='<div class="section-head">'+labels.recent+'<small>'+result.total+' '+labels.topics+'</small></div><div class="forum-thread-list">';
   html+=result.threads.length?result.threads.map(t=>'<a class="forum-thread-row" href="?site=test&thread='+esc(t.id)+'" data-thread="'+esc(t.id)+'"><div><span class="forum-row-title">'+esc(t.title)+'</span><span class="forum-row-subtitle"><span class="forum-tag">'+esc(t['category_'+lang]||t.category_en)+'</span>'+esc(t.author)+(t.locked?' · '+labels.locked:'')+'</span></div><span class="forum-row-stats"><strong>'+Math.max(0,Number(t.replies))+'</strong>'+labels.replies+'</span><span class="forum-row-last">'+relativeTime(t.last_post_at||t.created_at)+'</span></a>').join(''):'<div class="forum-empty">'+labels.noThreads+'</div>';
   el('forum-content').innerHTML=html+'</div>'+pager(result.pages,result.page,'thread');el('forum-crumb').textContent='/ '+labels.recent;
  }catch(e){el('forum-content').innerHTML='<div class="forum-empty">'+labels.status+'</div>';tipError(e);}height();
 }
 async function showThread(){el('forum-content').innerHTML='<p class="forum-loading">'+labels.loading+'</p>';height();
  try{
   const result=await api('thread?'+new URLSearchParams({id:state.thread,page:String(state.postPage)}));state.detail=result;
   const t=result.thread;let html='<button type="button" class="secondary" id="forum-back">← '+labels.back+'</button><div class="thread-header"><span class="forum-tag">'+esc(t['category_'+lang]||t.category_en)+'</span><h2>'+esc(t.title)+'</h2><div class="thread-meta">'+relativeTime(t.created_at)+' · '+result.total+' '+labels.posts+'</div><div class="thread-actions"><button type="button" id="forum-share" class="secondary">'+labels.share+'</button><button type="button" id="forum-reply" class="primary" '+(t.locked?'disabled':'')+'>'+((t.locked?labels.locked:labels.reply))+'</button></div></div><div class="forum-post-list">';
   html+=result.posts.length?result.posts.map((p,i)=>'<article class="forum-post" id="post-'+esc(p.id)+'"><div class="forum-author"><div class="avatar" aria-hidden="true">'+esc((p.author||'?').slice(0,1).toUpperCase())+'</div><div><strong>'+esc(p.author)+'</strong><small>'+((result.page-1)*20+i+1===1?'Topic author':'Member')+'</small></div></div><div class="forum-post-content"><header class="post-header"><span>#'+((result.page-1)*20+i+1)+'</span><time>'+relativeTime(p.created_at)+'</time></header><div class="post-body">'+esc(p.body)+'</div><div class="post-actions">'+(p.deleted?'':'<button type="button" data-quote="'+esc(p.id)+'" '+(t.locked?'disabled':'')+'>'+labels.quote+'</button><button type="button" data-report="'+esc(p.id)+'">'+labels.report+'</button>')+(state.auth.signedIn&&state.auth.verified&&p.author_id===state.auth.storageId?'<button type="button" data-delete="'+esc(p.id)+'">'+labels.remove+'</button>':'')+'</div></div></article>').join(''):'<div class="forum-empty">'+labels.noPosts+'</div>';
   el('forum-content').innerHTML=html+'</div>'+pager(result.pages,result.page,'post');el('forum-crumb').textContent='/ '+t.title;
  }catch(e){state.thread=null;route();tipError(e);return showList();}height();
 }
 async function refresh(){announce('');if(state.thread)await showThread();else await showList();}
 function needAccount(){if(state.auth.signedIn&&!state.auth.verified){announce(labels.verify);return false;}if(!state.auth.signedIn){announce(labels.alertLogin);parentSend('dedsec-forum-login');return false;}return true;}
 function openCompose(mode,quote){if(!needAccount())return;if(mode==='reply'&&state.detail?.thread.locked)return;
  state.compose=mode;const isThread=mode==='thread';el('forum-title-fields').hidden=!isThread;el('forum-title').required=isThread;el('forum-new-category').required=isThread;el('forum-body').minLength=isThread?10:2;el('forum-form-title').textContent=isThread?labels.topic:labels.message;
  el('forum-title-fields').querySelectorAll('label')[0].textContent=labels.cat;el('forum-title-fields').querySelectorAll('label')[1].textContent=labels.title;
  el('forum-form').reset();el('forum-new-category').value=state.category||state.categories[0]?.slug||'';if(quote)el('forum-body').value=quote;
  el('forum-dialog').showModal();setTimeout(()=>el(isThread?'forum-title':'forum-body').focus(),10);
 }
 async function submit(ev){ev.preventDefault();const send=el('forum-submit');send.disabled=true;
  try{
   const message=el('forum-body').value.trim(),data=state.compose==='thread'?{category:el('forum-new-category').value,title:el('forum-title').value.trim(),body:message}:{threadId:state.thread,body:message};
   const result=await api(state.compose==='thread'?'threads':'posts','POST',data);el('forum-dialog').close();
   if(state.compose==='thread'){state.thread=result.id;state.postPage=1;state.category='';route();}else{state.postPage=Math.max(1,Math.ceil((state.detail?.total+1)/20));}
   await refresh();
  }catch(e){tipError(e);el('forum-dialog').close();}finally{send.disabled=false;}
 }
 document.addEventListener('click',async ev=>{
  const t=ev.target.closest('a,button');if(!t)return;
  if(t.dataset.cat){ev.preventDefault();state.category=t.dataset.cat;state.page=1;el('forum-category').value=state.category;if(preview)showPreview();else await showList();return;}
  if(t.dataset.thread){ev.preventDefault();state.thread=t.dataset.thread;state.postPage=1;route();await showThread();return;}
  if(t.dataset.page){const n=Number(t.dataset.page);if(!Number.isInteger(n)||n<1)return;if(t.dataset.kind==='post'){state.postPage=n;await showThread();}else{state.page=n;await showList();}return;}
  if(t.id==='forum-new')openCompose('thread');
  if(t.id==='forum-reply')openCompose('reply');
  if(t.id==='forum-back'||t.id==='forum-all'){state.thread=null;state.category='';state.query='';state.page=1;el('forum-category').value='';route();if(preview)showPreview();else await showList();}
  if(t.id==='forum-login')parentSend('dedsec-forum-login');
  if(t.id==='forum-username'){
   const name=prompt(labels.badHandle,state.auth.handle);if(name===null)return;
   try{const result=await api('profile','POST',{handle:name});state.auth.handle=result.handle;authRender();announce(labels.handleChanged);}catch(e){tipError(e);}return;
  }
  if(t.id==='forum-share'){
   const link='https://dedsec1121fk.github.io/Test/DedSec-Project-Website/forum.html?thread='+state.thread;
   try{await navigator.clipboard.writeText(link);announce(labels.linkCopied);}catch{announce(link);}return;
  }
  if(t.dataset.quote){const p=state.detail?.posts.find(p=>p.id===t.dataset.quote);if(p)openCompose('reply','> '+p.author+':\n> '+p.body.replaceAll('\n','\n> ')+'\n\n');return;}
  if(t.dataset.report){if(!needAccount())return;const reason=prompt(gr?'Για ποιο λόγο γίνεται αναφορά;':'Why are you reporting this post?');if(!reason)return;try{await api('reports','POST',{postId:t.dataset.report,reason});announce(labels.reported);}catch(e){tipError(e);}return;}
  if(t.dataset.delete){if(!needAccount()||!confirm(labels.confirmDelete))return;try{const result=await api('posts','DELETE',{postId:t.dataset.delete});if(result.threadDeleted){state.thread=null;route();}await refresh();}catch(e){tipError(e);}return;}
  if(t.id==='forum-cancel')el('forum-dialog').close();
 });
 el('forum-category').addEventListener('change',()=>{state.category=el('forum-category').value;state.page=1;if(preview)showPreview();else showList();});

 el('forum-form').addEventListener('submit',submit);
 window.addEventListener('message',e=>{if(e.origin==='https://dedsec1121fk.github.io'&&e.source===window.parent&&e.data?.type==='dedsec-forum-refresh')authRefresh().then(refresh);});
 
 const previewCategories=[
  ['announcements','Announcements','Ανακοινώσεις','Updates from the DedSec Project community','Ενημερώσεις της κοινότητας DedSec Project'],
  ['general','General discussion','Γενική συζήτηση','Introductions, discussions and community questions','Γνωριμία, συζητήσεις και ερωτήσεις της κοινότητας'],
  ['support','Help & troubleshooting','Βοήθεια & προβλήματα','Help with installation and common errors','Βοήθεια για εγκατάσταση και επίλυση σφαλμάτων'],
  ['programming','Programming & development','Προγραμματισμός','Python, web, Termux, Linux and development','Python, web, Termux, Linux και ανάπτυξη'],
  ['cybersecurity','Cybersecurity','Κυβερνοασφάλεια','Defensive security, learning and responsible labs','Αμυντική ασφάλεια, εκπαίδευση και υπεύθυνα εργαστήρια'],
  ['ideas','Suggestions & feedback','Ιδέες & προτάσεις','Feature suggestions and feedback','Προτάσεις λειτουργιών και σχόλια']
 ].map(([slug,title_en,title_el,description_en,description_el])=>({
   slug,title_en,title_el,description_en,description_el,threads:null,posts:null
 }));
 function showPreview(){
   const choice=state.categories.find(c=>c.slug===state.category);
   const heading=gr?'Προεπισκόπηση του Forum':'Forum preview';
   const note=gr
    ?'Οι κατηγορίες εμφανίζονται, αλλά το ξεχωριστό Test Cloudflare Worker και η βάση D1 δεν έχουν ενεργοποιηθεί. Δεν είναι ακόμη δυνατή η ανάγνωση πραγματικών θεμάτων ή η δημοσίευση.'
    :'Categories are visible, but the separate Test Cloudflare Worker and D1 database are not enabled. Live threads and posting are not available yet.';
   const empty=gr?'Δεν υπάρχουν διαθέσιμες ζωντανές συζητήσεις στην προεπισκόπηση.':'Live discussions cannot be loaded in preview mode.';
   el('forum-content').innerHTML='<div class="forum-preview-banner" role="status"><strong>'+heading+'</strong><p>'+note+'</p></div>'+
     categoryRows()+'<div class="section-head">'+(choice?esc(categoryLabel(choice)):labels.recent)+'</div>'+
     '<div class="forum-empty">'+empty+'</div>';
   el('forum-crumb').textContent='/ '+labels.categories;
   height();
 }
 if(inline)window.DedSecForumUI=Object.freeze({
  setPreferences(nextLanguage){
   lang=nextLanguage==='gr'?'el':'en';
   gr=lang==='el';
   labels=translations[lang];
   initLabels();
   if(preview){
    el('forum-auth').textContent=gr?'Προεπισκόπηση · μόνο ανάγνωση':'Preview · read only';
    el('forum-new').title=labels.status;
    categoryOptions();
    showPreview();
   }
  }
 });
 async function start(){parentSend('dedsec-forum-ready');initLabels();if(preview){state.categories=previewCategories;categoryOptions();el('forum-auth').textContent=gr?'Προεπισκόπηση · μόνο ανάγνωση':'Preview · read only';el('forum-new').disabled=true;el('forum-new').title=labels.status;showPreview();return;}try{const r=await api('categories');state.categories=r.categories;categoryOptions();await authRefresh();await refresh();}catch(e){el('forum-content').innerHTML='<div class="forum-empty">'+labels.status+'</div>';tipError(e);}height();}
 if(window.ResizeObserver)new ResizeObserver(height).observe(el('forum-content'));
 start();
})();
