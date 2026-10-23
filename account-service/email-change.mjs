/* Account email change: two distinct, short-lived proofs of mailbox ownership.
 * Existing passwords, notes and referrals remain; sessions are revoked at completion.
 * GET never consumes a token: email scanners cannot approve an email change.
 */
import {random,digest,mac,equal,verifier} from './crypto.mjs';
import {deliverEmailChange} from './mail.mjs';
import {ensureAuthTables} from './security.mjs';
const now=()=>Math.floor(Date.now()/1000);
const sql=(env,stmt,...params)=>env.DB.prepare(stmt).bind(...params);
const one=(env,stmt,...params)=>sql(env,stmt,...params).first();
const run=(env,stmt,...params)=>sql(env,stmt,...params).run();
const validToken=token=>typeof token==='string'&&/^[a-f0-9]{64}$/.test(token);
function normalized(value){
 if(typeof value!=='string')throw Error('invalid_email');
 const result=value.trim().toLowerCase();
 if(result.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result)||/[\x00-\x20\x7f]/.test(result))throw Error('invalid_email');
 return result;
}
function identity(email){
 let [local,domain]=email.split('@');
 if(['gmail.com','googlemail.com'].includes(domain)){local=local.split('+')[0].replaceAll('.','');domain='gmail.com';}
 return local+'@'+domain;
}
export async function ensureEmailChange(env){
 await run(env,'CREATE TABLE IF NOT EXISTS account_email_changes (user_id TEXT PRIMARY KEY REFERENCES account_users(id) ON DELETE CASCADE,pending_email TEXT NOT NULL,old_hash TEXT NOT NULL UNIQUE,new_hash TEXT UNIQUE,stage TEXT NOT NULL CHECK(stage IN (\'old\',\'new\')),expires_at INTEGER NOT NULL,created_at TEXT NOT NULL)');
}
export async function requestEmailChange(env,s,b,helpers){
 await ensureEmailChange(env);
 if(!s.email_verified_at)throw Error('email_not_verified');
 const next=normalized(b.newEmail);
 if(next===s.email)throw Error('invalid_email');
 if(!validToken(b.prehash))throw Error('invalid_credentials');
 const credential=await one(env,'SELECT password_salt,password_hash FROM account_credentials WHERE user_id=?',s.id);
 if(!credential||!equal(await verifier(b.prehash,credential.password_salt,env.PASSWORD_PEPPER),credential.password_hash))throw Error('invalid_credentials');
 const identityHash=await mac(env.HMAC_SECRET,'identity:'+identity(next));
 if(await one(env,'SELECT user_id FROM account_credentials WHERE identity_hash=? AND user_id<>?',identityHash,s.id))throw Error('email_unavailable_for_change');
 if(await one(env,'SELECT id FROM account_users WHERE email=? AND id<>?',next,s.id))throw Error('email_unavailable_for_change');
 await helpers.rate(env,'email-change-user:'+s.id,3,3600);
 await helpers.mailQuota(env);
 const token=random(32),hash=await digest(token),expires=now()+3600;
 await run(env,"INSERT INTO account_email_changes(user_id,pending_email,old_hash,new_hash,stage,expires_at,created_at) VALUES(?,?,?,NULL,'old',?,?) ON CONFLICT(user_id) DO UPDATE SET pending_email=excluded.pending_email,old_hash=excluded.old_hash,new_hash=NULL,stage='old',expires_at=excluded.expires_at,created_at=excluded.created_at",s.id,next,hash,expires,new Date().toISOString());
 try{const result=await deliverEmailChange(env,s.email,token,'old',b.site,b.language);if(!result.ok)throw Error('email_unavailable');}
 catch(e){await run(env,"DELETE FROM account_email_changes WHERE user_id=? AND old_hash=? AND stage='old'",s.id,hash);throw Error('email_unavailable');}
 return {sent:true,stage:'old'};
}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function renderPage(message,stage,token,status=200,profile='test',language='en'){
 const sites={test:'https://dedsec1121fk.github.io/Test/',main:'https://ded-sec.space/',backup:'https://ded-sec.online/'},home=Object.hasOwn(sites,profile)?sites[profile]:sites.test,title='DedSec Project — Change email';
 const action=stage&&token?'<form method="POST" action="/change-email?site='+encodeURIComponent(profile)+'&amp;lang='+(language==='el'?'el':'en')+'"><input type="hidden" name="token" value="'+esc(token)+'"><input type="hidden" name="stage" value="'+esc(stage)+'"><button type="submit">Confirm email change / Επιβεβαίωση αλλαγής</button></form>':'';
 const html='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="referrer" content="no-referrer"><title>'+title+'</title><style>body{min-height:90vh;display:grid;place-items:center;background:#130a22;color:white;font:16px Tahoma,sans-serif;padding:18px;box-sizing:border-box}main{max-width:540px;text-align:center}p{line-height:1.6}button,a{display:inline-block;margin:16px;padding:14px;background:#b9a0ef;border:1px solid white;color:#180d25;font:inherit;cursor:pointer;text-decoration:none}</style></head><body><main><h1>'+title+'</h1><p>'+esc(message)+'</p>'+action+'<a href="'+home+'">DedSec Project</a></main></body></html>';
 return new Response(html,{status,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex,nofollow','Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'"}});
}
export async function emailChangeLink(req,env,helpers){
 await ensureEmailChange(env);
 const url=new URL(req.url),profile=['test','main','backup'].includes(url.searchParams.get('site'))?url.searchParams.get('site'):'test';
 const language=url.searchParams.get('lang')==='el'?'el':'en';
 const page=(message,stage,token,status=200)=>renderPage(message,stage,token,status,profile,language);
 let token,stage;
 if(req.method==='GET'){token=url.searchParams.get('token');stage=url.searchParams.get('stage');}
 else if(req.method==='POST'){
  const origin=req.headers.get('Origin');
  if(origin&&origin!==url.origin)return page('Request rejected. / Το αίτημα απορρίφθηκε.',null,null,403);
  if(!req.headers.get('Content-Type')?.startsWith('application/x-www-form-urlencoded'))return page('Invalid request / Μη έγκυρο αίτημα',null,null,415);
  const params=new URLSearchParams(await req.text());token=params.get('token');stage=params.get('stage');
 }else return page('Method not allowed',null,null,405);
 if(!validToken(token)||!['old','new'].includes(stage))return page('Invalid or expired link / Μη έγκυρος ή ληγμένος σύνδεσμος.',null,null,400);
 const hash=await digest(token);
 const field=stage==='old'?'old_hash':'new_hash';
 const record=await one(env,'SELECT c.*,u.email AS current_email FROM account_email_changes c JOIN account_users u ON u.id=c.user_id WHERE c.'+field+'=? AND c.stage=? AND c.expires_at>?',hash,stage,now());
 if(!record)return page('This link is invalid, expired or already used. / Ο σύνδεσμος είναι άκυρος, ληγμένος ή έχει ήδη χρησιμοποιηθεί.',null,null,400);
 if(req.method==='GET')return page(stage==='old'?'Confirm that you authorized changing the email on your DedSec Project account. / Επιβεβαίωσε ότι ζήτησες αλλαγή email στον λογαριασμό σου.':'Confirm the new email address. This will end current sessions and require signing in again. / Επιβεβαίωσε το νέο email. Θα γίνει αποσύνδεση από τις τρέχουσες συνεδρίες.',stage,token);
 if(stage==='old'){
  await helpers.mailQuota(env);
  const nextToken=random(32),nextHash=await digest(nextToken);
  try{const response=await deliverEmailChange(env,record.pending_email,nextToken,'new',profile,language);if(!response.ok)throw Error('email_unavailable');}
  catch{return page('Could not send to the new address. Please try again later. / Η αποστολή στο νέο email απέτυχε. Δοκίμασε αργότερα.',null,null,503);}
  const changed=await run(env,"UPDATE account_email_changes SET stage='new',new_hash=?,old_hash=?,expires_at=? WHERE user_id=? AND old_hash=? AND stage='old'",nextHash,await digest(random(32)),now()+3600,record.user_id,hash);
  if(!changed.meta?.changes)return page('Link already used / Ο σύνδεσμος χρησιμοποιήθηκε.',null,null,409);
  return page('The old address is confirmed. A new verification link was sent to your new email address. / Το παλιό email επιβεβαιώθηκε. Έστειλα νέο σύνδεσμο στο καινούριο email.',null,null);
 }
 await ensureAuthTables(env);
 const identityHash=await mac(env.HMAC_SECRET,'identity:'+identity(record.pending_email));
 if(await one(env,'SELECT user_id FROM account_credentials WHERE identity_hash=? AND user_id<>?',identityHash,record.user_id))return page('Email address unavailable / Η διεύθυνση email δεν είναι διαθέσιμη.',null,null,409);
 try{
  await env.DB.batch([
   sql(env,'UPDATE account_users SET email=?,email_verified_at=? WHERE id=?',record.pending_email,new Date().toISOString(),record.user_id),
   sql(env,'UPDATE account_credentials SET identity_hash=? WHERE user_id=?',identityHash,record.user_id),
   sql(env,'DELETE FROM account_sessions WHERE user_id=?',record.user_id),
   sql(env,'DELETE FROM account_email_tokens WHERE user_id=?',record.user_id),
   sql(env,'DELETE FROM account_2fa_codes WHERE user_id=?',record.user_id),
   sql(env,'DELETE FROM account_email_changes WHERE user_id=? AND new_hash=?',record.user_id,hash)
  ]);
 }catch{return page('Email address unavailable or update failed / Η αλλαγή email απέτυχε.',null,null,409);}
 return page('Your new email is verified and your account email has been updated. Sign in again with the new address. / Το νέο email επιβεβαιώθηκε και ενημερώθηκε στον λογαριασμό. Συνδέσου ξανά με τη νέα διεύθυνση.',null,null);
}

