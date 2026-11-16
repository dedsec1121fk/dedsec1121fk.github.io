
const SITE='https://ded-sec.space/';
const COOKIE='__Host-dedsec_forum';
const HEADERS={
 'X-Content-Type-Options':'nosniff',
 'Referrer-Policy':'strict-origin-when-cross-origin',
 'X-Robots-Tag':'noindex, nofollow',
 'Permissions-Policy':'camera=(), microphone=(), geolocation=()',
 'Cache-Control':'no-store'
};
const encoder=new TextEncoder();
const now=()=>Date.now();
const iso=()=>new Date().toISOString();
const id=()=>Array.from(crypto.getRandomValues(new Uint8Array(12))).map(x=>x.toString(16).padStart(2,'0')).join('');
const token=()=>Array.from(crypto.getRandomValues(new Uint8Array(32))).map(x=>x.toString(16).padStart(2,'0')).join('');
const asHex=b=>Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,'0')).join('');
const fromHex=x=>new Uint8Array(x.match(/../g).map(h=>parseInt(h,16)));
const hexHash=async x=>asHex(await crypto.subtle.digest('SHA-256',encoder.encode(x)));
const json=(data,status=200,extra={})=>new Response(JSON.stringify(data),{
 status,headers:{...HEADERS,'Content-Type':'application/json; charset=utf-8',...extra}
});
class Problem extends Error{
 constructor(message,status=400){super(message);this.status=status;}
}
function fail(code,status=400){throw new Problem(code,status);}
function checked(value,min,max,code){
 if(typeof value!=='string')fail(code);
 const s=value.trim().replace(/\r\n?/g,'\n');
 if(s.length<min||s.length>max||/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(s))fail(code);
 return s;
}
function validSlug(v){return typeof v==='string'&&/^[a-z][a-z0-9-]{1,49}$/.test(v);}
function validId(v){return typeof v==='string'&&/^[a-f0-9]{24}$/.test(v);}
function pageNumber(x){const n=Number(x||1);return Number.isSafeInteger(n)&&n>=1&&n<=200?n:1;}
async function readJson(req){
 if(!req.headers.get('Content-Type')?.startsWith('application/json'))fail('json_required',415);
 if(Number(req.headers.get('Content-Length')||0)>22000)fail('payload_too_large',413);
 const raw=await req.text();if(raw.length>22000)fail('payload_too_large',413);
 try{const value=JSON.parse(raw);if(!value||typeof value!=='object'||Array.isArray(value))fail('invalid_request');return value;}
 catch(e){if(e instanceof Problem)throw e;fail('invalid_json');}
}
function checkOrigin(req){
 const requested=new URL(req.url),origin=req.headers.get('Origin');
 if(origin!==requested.origin)fail('origin_denied',403);
 if(req.headers.get('Sec-Fetch-Site')==='cross-site')fail('origin_denied',403);
}
const rows=(env,text,...args)=>env.DB.prepare(text).bind(...args).all().then(r=>r.results||[]);
const one=(env,text,...args)=>env.DB.prepare(text).bind(...args).first();
const run=(env,text,...args)=>env.DB.prepare(text).bind(...args).run();
async function rate(env,kind,key,limit,periodSeconds){
 if(!env.RATE_SECRET)fail('forum_configuration_required',503);
 const digest=await hexHash(env.RATE_SECRET+'|'+kind+'|'+key);
 const exp=Math.floor(now()/1000)+periodSeconds;
 const result=await one(env,`INSERT INTO forum_rates(key,hits,expires_at) VALUES(?,1,?)
  ON CONFLICT(key) DO UPDATE SET
  hits=CASE WHEN forum_rates.expires_at<=? THEN 1 ELSE forum_rates.hits+1 END,
  expires_at=CASE WHEN forum_rates.expires_at<=? THEN excluded.expires_at ELSE forum_rates.expires_at END
  RETURNING hits`,digest,exp,Math.floor(now()/1000),Math.floor(now()/1000));
 if(result.hits>limit)fail('rate_limited',429);
}
function cookieHeader(value,maxAge){
 return COOKIE+'='+value+'; Path=/; Max-Age='+maxAge+'; Secure; HttpOnly; SameSite=Lax';
}
async function member(req,env,write=false){
 const raw=req.headers.get('Cookie')?.split(';').map(x=>x.trim()).find(x=>x.startsWith(COOKIE+'='))?.slice(COOKIE.length+1);
 if(!raw||!/^[a-f0-9]{64}$/.test(raw))fail('sign_in_required',401);
 const hash=await hexHash(raw);
 const s=await one(env,`SELECT m.id,m.handle,m.disabled,ss.csrf,ss.expires_at
  FROM forum_sessions ss JOIN forum_members m ON m.id=ss.user_id
  WHERE ss.token_hash=? AND ss.expires_at>?`,hash,Math.floor(now()/1000));
 if(!s||s.disabled)fail('sign_in_required',401);
 if(write&&req.headers.get('X-CSRF-Token')!==s.csrf)fail('csrf_denied',403);
 return s;
}
async function passwordHash(password,salt){
 const raw=encoder.encode(password);
 const key=await crypto.subtle.importKey('raw',raw,'PBKDF2',false,['deriveBits']);
 return asHex(await crypto.subtle.deriveBits({name:'PBKDF2',salt:fromHex(salt),iterations:120000,hash:'SHA-256'},key,256));
}
function safeEqual(a,b){
 if(typeof a!=='string'||typeof b!=='string')return false;
 let diff=a.length^b.length;for(let i=0;i<Math.max(a.length,b.length);i++)diff|=(a.charCodeAt(i)||0)^(b.charCodeAt(i)||0);
 return diff===0;
}
function sessionBody(s){return {signedIn:true,registered:true,handle:s.handle,userId:s.id,csrf:s.csrf};}
async function openSession(env,user){
 const raw=token(),csrf=token().slice(0,48),expiration=Math.floor(now()/1000)+604800;
 await run(env,'INSERT INTO forum_sessions(token_hash,user_id,csrf,expires_at) VALUES(?,?,?,?)',await hexHash(raw),user.id,csrf,expiration);
 return {value:raw,csrf};
}
async function authentication(req,env,path){
 if(path==='me'&&req.method==='GET'){
  try{const s=await member(req,env);return json(sessionBody(s));}
  catch(e){if(e.message==='sign_in_required')return json({signedIn:false,registered:false});throw e;}
 }
 if(req.method!=='POST'&&req.method!=='DELETE')fail('method_not_allowed',405);
 checkOrigin(req);
 const ip=req.headers.get('CF-Connecting-IP')||'unknown';
 if(path==='register'&&req.method==='POST'){
  const b=await readJson(req);
  const handle=checked(b.handle,3,24,'invalid_handle');
  if(!/^[\p{L}\p{N}_-]+$/u.test(handle))fail('invalid_handle');
  const password=checked(b.password,12,128,'invalid_password');
  await rate(env,'register',ip,4,86400);
  const salt=id()+id();
  const user={id:id()+id(),handle};
  const digest=await passwordHash(password,salt);
  try{await run(env,`INSERT INTO forum_members(id,handle,handle_normalized,salt,password_hash,created_at)
   VALUES(?,?,?,?,?,?)`,user.id,handle,handle.toLocaleLowerCase(),salt,digest,iso());}
  catch(e){if(String(e).includes('UNIQUE'))fail('handle_taken',409);throw e;}
  const s=await openSession(env,user);
  return json({signedIn:true,registered:true,handle,userId:user.id,csrf:s.csrf},201,{'Set-Cookie':cookieHeader(s.value,604800)});
 }
 if(path==='login'&&req.method==='POST'){
  const b=await readJson(req),handle=checked(b.handle,3,24,'invalid_handle');
  if(typeof b.password!=='string'||b.password.length>128)fail('invalid_credentials',401);
  await rate(env,'login-ip',ip,18,900);
  await rate(env,'login-user',handle.toLocaleLowerCase(),8,900);
  const user=await one(env,'SELECT * FROM forum_members WHERE handle_normalized=?',handle.toLocaleLowerCase());
  const salt=user?.salt||'00'.repeat(24),hash=await passwordHash(b.password,salt);
  if(!user||user.disabled||!safeEqual(hash,user.password_hash))fail('invalid_credentials',401);
  const s=await openSession(env,user);
  return json({signedIn:true,registered:true,handle:user.handle,userId:user.id,csrf:s.csrf},200,{'Set-Cookie':cookieHeader(s.value,604800)});
 }
 const s=await member(req,env,true);
 if(path==='logout'&&req.method==='POST'){
  const raw=req.headers.get('Cookie')?.split(';').map(x=>x.trim()).find(x=>x.startsWith(COOKIE+'='))?.slice(COOKIE.length+1);
  if(raw)await run(env,'DELETE FROM forum_sessions WHERE token_hash=?',await hexHash(raw));
  return json({signedIn:false},200,{'Set-Cookie':cookieHeader('',0)});
 }
 if(path==='account'&&req.method==='DELETE'){
  const b=await readJson(req);
  if(typeof b.password!=='string')fail('invalid_password');
  const stored=await one(env,'SELECT salt,password_hash FROM forum_members WHERE id=?',s.id);
  const hash=await passwordHash(b.password,stored.salt);
  if(!safeEqual(hash,stored.password_hash))fail('invalid_credentials',401);
  await run(env,'DELETE FROM forum_members WHERE id=?',s.id);
  return json({deleted:true},200,{'Set-Cookie':cookieHeader('',0)});
 }
 if(path==='profile'&&req.method==='POST'){
  const b=await readJson(req),handle=checked(b.handle,3,24,'invalid_handle');
  if(!/^[\p{L}\p{N}_-]+$/u.test(handle))fail('invalid_handle');
  await rate(env,'profile',s.id,3,86400);
  try{await run(env,'UPDATE forum_members SET handle=?,handle_normalized=? WHERE id=?',handle,handle.toLocaleLowerCase(),s.id);}
  catch(e){if(String(e).includes('UNIQUE'))fail('handle_taken',409);throw e;}
  return json({handle});
 }
 fail('not_found',404);
}
const tagStopWords=new Set('the and with from this that into have your them does what would there where when then while about using use how why who for are was were can you our out all will but not got get been has had just here does need help some more only same other into much very upon post tags topic topics new first good best this αυτά αυτό αυτη αυτος αυτον στους στις στα των την τον τούτο και για με από προς είναι ειναι ένα ενα μία μια στο στη στον σας μας τους των που πως για την του τα θα να σε οι τις τον των στο από όσα πως εχω εχει έχουν έχω έχει γιατί τι δεν ναι πιο ώστε όταν'.split(/\s+/));
function normalTag(token){
 return String(token).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase().replace(/[^\p{L}\p{N}-]+/gu,'').replace(/^-+|-+$/g,'');
}
function makeTags(title,body,section){
 const score=new Map();
 function append(text,weight,limit){
  const clean=String(text).replace(/https?:\/\/\S+/g,' ');
  const tokens=clean.match(/[\p{L}\p{N}][\p{L}\p{N}_-]*/gu)||[];
  for(const raw of tokens.slice(0,limit)){
   const t=normalTag(raw);
   if(t.length<3||t.length>32||/^\d+$/.test(t)||tagStopWords.has(t))continue;
   score.set(t,(score.get(t)||0)+weight);
  }
 }
 append(title,8,30);
 append(section.slug.replaceAll('-',' '),5,15);
 append(section.title_en,3,18);
 append(section.title_el,3,18);
 append(body,1,120);
 return [...score.entries()].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).slice(0,10).map(x=>x[0]);
}
const categoryCounts=`SELECT c.slug,c.title_en,c.title_el,c.description_en,c.description_el,coalesce(gm.group_slug,'community') AS group_slug,
 (SELECT count(*) FROM forum_sections s WHERE s.category_slug=c.slug) AS sections,
 (SELECT count(*) FROM forum_topics t JOIN forum_sections s ON t.section_slug=s.slug WHERE s.category_slug=c.slug) AS topics,
 (SELECT count(*) FROM forum_posts p JOIN forum_topics t ON p.topic_id=t.id JOIN forum_sections s ON t.section_slug=s.slug WHERE s.category_slug=c.slug) AS posts
 FROM forum_categories c LEFT JOIN forum_category_group_map gm ON gm.category_slug=c.slug
 LEFT JOIN forum_category_groups grp ON grp.slug=gm.group_slug
 ORDER BY coalesce(grp.sort_order,99),c.sort_order,c.slug`;
const sectionCounts=`SELECT s.slug,s.category_slug,s.title_en,s.title_el,s.description_en,s.description_el,
 (SELECT count(*) FROM forum_topics t WHERE t.section_slug=s.slug) AS topics,
 (SELECT count(*) FROM forum_posts p JOIN forum_topics t ON p.topic_id=t.id WHERE t.section_slug=s.slug) AS posts,
 (SELECT max(t.updated_at) FROM forum_topics t WHERE t.section_slug=s.slug) AS last_post_at
 FROM forum_sections s`;
async function forum(req,env,part){
 const url=new URL(req.url),method=req.method,q=url.searchParams;
 if(method==='GET'){
  if(part==='categories')return json({categories:await rows(env,categoryCounts)});
  if(part==='sections'){
   const slug=q.get('category');if(!validSlug(slug))fail('invalid_category');
   const cat=await one(env,'SELECT * FROM forum_categories WHERE slug=?',slug);
   if(!cat)fail('category_not_found',404);
   return json({category:cat,sections:await rows(env,sectionCounts+' WHERE s.category_slug=? ORDER BY s.sort_order',slug)});
  }

  if(part==='search'){
   const query=(q.get('q')||'').trim().slice(0,100);
   const category=q.get('category')||'',section=q.get('section')||'',group=q.get('group')||'';
   const author=(q.get('author')||'').trim().slice(0,32);
   const sort=['relevance','newest','oldest'].includes(q.get('sort'))?q.get('sort'):'relevance';
   const field=q.get('field')==='title'?'title':'all';
   const days=[7,30,365].includes(Number(q.get('days')))?Number(q.get('days')):0;
   if(category&&!validSlug(category))fail('invalid_category');
   if(section&&!validSlug(section))fail('invalid_section');
   if(group&&!validSlug(group))fail('invalid_group');
   if(query.length<2)return json({results:[],total:0,page:1,pages:1});
   const page=pageNumber(q.get('page')),words=query.split(/\s+/).filter(Boolean).slice(0,6);
   const where=[],args=[];
   for(const word of words){
    where.push(field==='title'?'instr(lower(t.title),lower(?))>0':
      '(instr(lower(t.title),lower(?))>0 OR EXISTS(SELECT 1 FROM forum_posts p WHERE p.topic_id=t.id AND p.deleted=0 AND instr(lower(p.body),lower(?))>0) OR EXISTS(SELECT 1 FROM forum_topic_tags tt WHERE tt.topic_id=t.id AND instr(tt.tag,?)>0))');
    args.push(word);
    if(field!=='title'){args.push(word);args.push(normalTag(word));}
   }
   if(category){where.push('s.category_slug=?');args.push(category);}
   if(section){where.push('s.slug=?');args.push(section);}
   if(group){where.push('gm.group_slug=?');args.push(group);}
   if(author){where.push("instr(lower(coalesce(m.handle,'')),lower(?))>0");args.push(author);}
   if(days){where.push('t.updated_at>=?');args.push(new Date(now()-days*86400000).toISOString());}
   const from=` FROM forum_topics t JOIN forum_sections s ON s.slug=t.section_slug
    JOIN forum_categories c ON c.slug=s.category_slug
    LEFT JOIN forum_category_group_map gm ON gm.category_slug=c.slug
    LEFT JOIN forum_members m ON m.id=t.author_id`;
   const conditions=' WHERE '+where.join(' AND ');
   const total=(await one(env,'SELECT count(*) AS n'+from+conditions,...args)).n;
   const order=sort==='oldest'?'t.created_at ASC,t.id ASC':
     sort==='newest'?'t.updated_at DESC,t.id DESC':
     'CASE WHEN instr(lower(t.title),lower(?))>0 THEN 0 ELSE 1 END,t.updated_at DESC,t.id DESC';
   const extra=sort==='relevance'?[query]:[];
   const results=await rows(env,`SELECT t.id,t.title,t.section_slug,s.category_slug,
    c.title_en AS category_en,c.title_el AS category_el,
    s.title_en AS section_en,s.title_el AS section_el,
    coalesce(m.handle,'Deleted member') AS author,t.created_at,t.updated_at,
    (SELECT count(*)-1 FROM forum_posts p WHERE p.topic_id=t.id) AS replies,
    (SELECT substr(p.body,1,180) FROM forum_posts p WHERE p.topic_id=t.id AND p.deleted=0 ORDER BY p.created_at,p.id LIMIT 1) AS excerpt,
    (SELECT group_concat(tt.tag,'|') FROM forum_topic_tags tt WHERE tt.topic_id=t.id) AS tags
    `+from+conditions+' ORDER BY '+order+' LIMIT 30 OFFSET ?',...args,...extra,(page-1)*30);
   return json({results,total,page,pages:Math.max(1,Math.ceil(total/30))});
  }
  if(part==='feed'){
   const view=q.get('view')||'latest';
   if(!['latest','trending','unanswered','featured','mine'].includes(view))fail('invalid_view');
   const page=pageNumber(q.get('page')),args=[],filters=[];
   if(view==='mine'){
    const user=await member(req,env);
    filters.push('t.author_id=?');args.push(user.id);
   }
   if(view==='featured')filters.push('t.pinned=1');
   if(view==='unanswered')filters.push('(SELECT count(*) FROM forum_posts p WHERE p.topic_id=t.id AND p.deleted=0)<=1');
   const recent=new Date(now()-30*86400000).toISOString();
   if(view==='trending'){
    filters.push('(SELECT count(*) FROM forum_posts p WHERE p.topic_id=t.id AND p.deleted=0)>1');
    filters.push('EXISTS(SELECT 1 FROM forum_posts p WHERE p.topic_id=t.id AND p.created_at>=? AND p.deleted=0)');
    args.push(recent);
   }
   const base=' FROM forum_topics t JOIN forum_sections s ON s.slug=t.section_slug JOIN forum_categories c ON c.slug=s.category_slug LEFT JOIN forum_members m ON m.id=t.author_id';
   const where=filters.length?' WHERE '+filters.join(' AND '):'';
   const total=(await one(env,'SELECT count(*) AS n'+base+where,...args))?.n||0;
   const order=view==='trending'
    ?'(SELECT count(*) FROM forum_posts p WHERE p.topic_id=t.id AND p.deleted=0 AND p.created_at>=?) DESC,t.updated_at DESC,t.id DESC'
    :view==='unanswered'?'t.created_at DESC,t.id DESC'
    :'t.updated_at DESC,t.id DESC';
   const extra=view==='trending'?[recent]:[];
   const topics=await rows(env,`SELECT t.id,t.title,t.section_slug,t.created_at,t.updated_at,t.pinned,t.locked,
     s.category_slug,c.title_en AS category_en,c.title_el AS category_el,
     s.title_en AS section_en,s.title_el AS section_el,
     coalesce(m.handle,'Deleted member') AS author,
     (SELECT max(p.created_at) FROM forum_posts p WHERE p.topic_id=t.id AND p.deleted=0) AS last_post_at,
     (SELECT max(0,count(*)-1) FROM forum_posts p WHERE p.topic_id=t.id AND p.deleted=0) AS replies,
     (SELECT group_concat(tt.tag,'|') FROM forum_topic_tags tt WHERE tt.topic_id=t.id) AS tags
     `+base+where+' ORDER BY '+order+' LIMIT 12 OFFSET ?',...args,...extra,(page-1)*12);
   return json({view,topics,total,page,pages:Math.max(1,Math.ceil(total/12))});
  }
  if(part==='topics'){
   const slug=q.get('section');if(!validSlug(slug))fail('invalid_section');
   const section=await one(env,`SELECT s.*,c.title_en AS category_en,c.title_el AS category_el
    FROM forum_sections s JOIN forum_categories c ON c.slug=s.category_slug WHERE s.slug=?`,slug);
   if(!section)fail('section_not_found',404);
   const page=pageNumber(q.get('page')),query=(q.get('q')||'').trim().slice(0,80);
   const where=query?' WHERE t.section_slug=? AND (instr(lower(t.title),lower(?))>0 OR EXISTS(SELECT 1 FROM forum_posts p WHERE p.topic_id=t.id AND instr(lower(p.body),lower(?))>0))':' WHERE t.section_slug=?';
   const args=query?[slug,query,query]:[slug];
   const total=(await one(env,'SELECT count(*) n FROM forum_topics t'+where,...args)).n;
   const topics=await rows(env,`SELECT t.id,t.title,t.section_slug,t.created_at,t.updated_at,t.pinned,t.locked,
    coalesce(m.handle,'Deleted member') AS author,
    (SELECT max(p.created_at) FROM forum_posts p WHERE p.topic_id=t.id) AS last_post_at,
    (SELECT count(*)-1 FROM forum_posts p WHERE p.topic_id=t.id) AS replies,
    (SELECT group_concat(tt.tag,'|') FROM forum_topic_tags tt WHERE tt.topic_id=t.id) AS tags
    FROM forum_topics t LEFT JOIN forum_members m ON m.id=t.author_id`+where+
    ' ORDER BY t.pinned DESC,t.updated_at DESC,t.id DESC LIMIT 20 OFFSET ?',...args,(page-1)*20);
   return json({section,topics,page,pages:Math.max(1,Math.ceil(total/20)),total});
  }
  if(part==='topic'){
   const topicId=q.get('id');if(!validId(topicId))fail('invalid_topic');
   const topic=await one(env,`SELECT t.id,t.section_slug,t.title,t.created_at,t.updated_at,t.locked,t.pinned,
    s.category_slug,s.title_en AS section_en,s.title_el AS section_el,
    c.title_en AS category_en,c.title_el AS category_el
    FROM forum_topics t JOIN forum_sections s ON s.slug=t.section_slug
    JOIN forum_categories c ON c.slug=s.category_slug WHERE t.id=?`,topicId);
   if(!topic)fail('topic_not_found',404);
   const page=pageNumber(q.get('page'));
   const total=(await one(env,'SELECT count(*) n FROM forum_posts WHERE topic_id=?',topicId)).n;
   const posts=await rows(env,`SELECT p.id,p.body,p.created_at,p.edited_at,p.deleted,
     p.author_id,coalesce(m.handle,'Deleted member') AS author
     FROM forum_posts p LEFT JOIN forum_members m ON m.id=p.author_id
     WHERE p.topic_id=? ORDER BY p.created_at,p.id LIMIT 20 OFFSET ?`,topicId,(page-1)*20);
   const tags=(await rows(env,'SELECT tag FROM forum_topic_tags WHERE topic_id=? ORDER BY tag',topicId)).map(x=>x.tag);
   return json({topic:{...topic,tags},posts,page,pages:Math.max(1,Math.ceil(total/20)),total});
  }
  if(part==='me')return authentication(req,env,'me');
  fail('not_found',404);
 }
 if(!['POST','DELETE'].includes(method))fail('method_not_allowed',405);
 checkOrigin(req);
 if(['register','login','logout','profile','account'].includes(part))return authentication(req,env,part);
 const s=await member(req,env,true),b=await readJson(req);
 if(part==='new-topic'&&method==='POST'){
  await rate(env,'member-topic',s.id,7,3600);
  await rate(env,'member-fast',s.id,3,60);
  const section=checked(b.section,2,50,'invalid_section');
  const exists=await one(env,'SELECT slug,title_en,title_el FROM forum_sections WHERE slug=?',section);
  if(!exists)fail('invalid_section');
  const title=checked(b.title,6,150,'invalid_title'),message=checked(b.body,10,10000,'invalid_body');
  if((message.match(/https?:\/\/|www\./gi)||[]).length>3)fail('too_many_links',422);
  const recent=await rows(env,'SELECT title FROM forum_topics WHERE author_id=? AND section_slug=? AND created_at>=? LIMIT 50',
   s.id,section,new Date(now()-24*86400000).toISOString());
  if(recent.some(x=>x.title.normalize('NFKC').toLocaleLowerCase()===title.normalize('NFKC').toLocaleLowerCase()))
   fail('duplicate_topic',409);
  const topicId=id(),postId=id(),created=iso(),tags=makeTags(title,message,exists);
  await env.DB.batch([
   env.DB.prepare('INSERT INTO forum_topics(id,section_slug,author_id,title,created_at,updated_at) VALUES(?,?,?,?,?,?)').bind(topicId,section,s.id,title,created,created),
   env.DB.prepare('INSERT INTO forum_posts(id,topic_id,author_id,body,created_at) VALUES(?,?,?,?,?)').bind(postId,topicId,s.id,message,created),
   ...tags.map(tag=>env.DB.prepare('INSERT INTO forum_topic_tags(topic_id,tag) VALUES(?,?)').bind(topicId,tag))
  ]);
  return json({id:topicId,postId,tags},201);
 }
 if(part==='reply'&&method==='POST'){
  await rate(env,'member-reply',s.id,30,3600);
  await rate(env,'member-fast',s.id,3,60);
  if(!validId(b.topicId))fail('invalid_topic');
  const topic=await one(env,'SELECT id,locked FROM forum_topics WHERE id=?',b.topicId);
  if(!topic)fail('topic_not_found',404);
  if(topic.locked)fail('topic_locked',403);
  const message=checked(b.body,2,10000,'invalid_body'),postId=id(),created=iso();
  if((message.match(/https?:\/\/|www\./gi)||[]).length>3)fail('too_many_links',422);
  await env.DB.batch([
   env.DB.prepare('INSERT INTO forum_posts(id,topic_id,author_id,body,created_at) VALUES(?,?,?,?,?)').bind(postId,b.topicId,s.id,message,created),
   env.DB.prepare('UPDATE forum_topics SET updated_at=? WHERE id=?').bind(created,b.topicId)
  ]);
  return json({id:postId},201);
 }
 if(part==='report'&&method==='POST'){
  if(!validId(b.postId))fail('invalid_post');
  const reason=checked(b.reason,8,500,'invalid_reason');
  await rate(env,'report',s.id,8,86400);
  const post=await one(env,'SELECT id FROM forum_posts WHERE id=? AND deleted=0',b.postId);
  if(!post)fail('post_not_found',404);
  await run(env,'INSERT OR IGNORE INTO forum_reports(post_id,reporter_id,reason,created_at) VALUES(?,?,?,?)',b.postId,s.id,reason,iso());
  return json({reported:true});
 }
 if(part==='post'&&method==='DELETE'){
  if(!validId(b.postId))fail('invalid_post');
  const post=await one(env,'SELECT id,topic_id,author_id FROM forum_posts WHERE id=?',b.postId);
  if(!post)fail('post_not_found',404);
  if(post.author_id!==s.id)fail('forbidden',403);
  const first=await one(env,'SELECT id FROM forum_posts WHERE topic_id=? ORDER BY created_at,id LIMIT 1',post.topic_id);
  if(first?.id===post.id){await run(env,'DELETE FROM forum_topics WHERE id=?',post.topic_id);return json({deleted:true,topicDeleted:true});}
  await run(env,"UPDATE forum_posts SET body='[deleted]',deleted=1,edited_at=? WHERE id=?",iso(),post.id);
  return json({deleted:true});
 }
 fail('not_found',404);
}
function htmlHeaders(){
 return {...HEADERS,'Content-Type':'text/html; charset=utf-8',
  'Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; frame-src https://dedsec-accounts.dedsec-project.workers.dev; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'",
  'Cache-Control':'no-cache'};
}
function allowedAsset(path){
 return path==='/forum-app.html'||path==='/favicon.ico'||
   /^\/(?:assets|dedsec)\/[a-zA-Z0-9._~!$&'()+,;=:@%\/-]+$/.test(path)&&!path.includes('..');
}
async function proxy(req,path,isForum=false){
 const target=new URL(isForum?'forum.html':path.replace(/^\//,''),SITE);
 const response=await fetch(target.href,{redirect:'follow'});
 if(!response.ok)return json({error:'frontend_unavailable'},503);
 if(!isForum){
  const headers={...HEADERS,'Content-Type':response.headers.get('Content-Type')||'application/octet-stream','Cache-Control':'public, max-age=300'};
  return new Response(response.body,{status:response.status,headers});
 }
 let content=await response.text();
 content=content.replace(/<script\s+src=["']assets\/boot\.js(?:\?[^"']*)?["']><\/script>/i,'').replace('<head>',`<head><base href="/"><script>window.DEDSEC_FORUM_LIVE=true;window.DEDSEC_FORUM_SEARCH_SITE='https://ded-sec.space/';</script>`);
 const h=htmlHeaders();
 h['Content-Security-Policy']=h['Content-Security-Policy'].replace("script-src 'self'","script-src 'self' 'unsafe-inline'");
 return new Response(content,{headers:h});
}
export default{
 async fetch(req,env){
  try{
   const u=new URL(req.url),path=u.pathname;
   if(path==='/health')return json({ok:Boolean(env.DB&&env.RATE_SECRET),service:'dedsec-test-forum'});
   if(!env.DB||!env.RATE_SECRET)return json({error:'forum_configuration_required'},503);
   if(path.startsWith('/api/forum/')){
    const response=await forum(req,env,path.slice('/api/forum/'.length));
    if(req.method==='GET'&&['/api/forum/categories','/api/forum/sections','/api/forum/search'].includes(path)){
     const headers=new Headers(response.headers);
     headers.set('Access-Control-Allow-Origin','https://ded-sec.space');
     headers.set('Vary','Origin');
     return new Response(response.body,{status:response.status,headers});
    }
    return response;
   }
   if(req.method!=='GET'&&req.method!=='HEAD')fail('method_not_allowed',405);
   if(path==='/')return Response.redirect(u.origin+'/forum',302);
   if(path==='/index.html')return Response.redirect(SITE+'index.html'+u.hash,302);
   if(path==='/forum.html')return Response.redirect(u.origin+'/forum'+u.search,302);
   if(path==='/forum'||/^\/forum\/(?:category|section|topic)\/[a-z0-9-]+\/?$/.test(path))return await proxy(req,path,true);
   if(allowedAsset(path))return await proxy(req,path);
   return json({error:'not_found'},404);
  }catch(e){
   if(e instanceof Problem)return json({error:e.message},e.status);
   console.error('test_forum_internal_error',String(e));
   return json({error:'service_unavailable'},503);
  }
 }
};
