import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import worker,{cleanup,registrationAge,SITES} from '../account-service/worker.mjs';
import {LIMITS,dayKey} from '../account-service/limits.mjs';
import {hex,digest,mac} from '../account-service/crypto.mjs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),core=require('../DedSec-Project-Website/assets/account-core.js');assert.deepEqual(LIMITS,core.LIMITS);
assert.equal(registrationAge('2000-02-29',new Date('2026-02-28T12:00:00Z')),25);assert.equal(registrationAge('2000-02-29',new Date('2026-03-01T12:00:00Z')),26);for(const value of ['2025-02-29','2000-02-30','2026-13-01','9999-01-01','','2001-1-01',null])assert.throws(()=>registrationAge(value));
const birthdayNow=new Date('2026-10-21T12:00:00Z');
assert.equal(registrationAge('2008-10-21',birthdayNow),18);
assert.throws(()=>registrationAge('2008-10-22',birthdayNow));
assert.equal(registrationAge('1896-10-21',birthdayNow),130);
assert.equal(registrationAge('1895-10-22',birthdayNow),130);
assert.throws(()=>registrationAge('1895-10-21',birthdayNow));
assert.equal(registrationAge('2008-10-22',new Date('2026-10-21T21:00:00Z')),18);
const db=new DatabaseSync(':memory:');db.exec(readFileSync(new URL('../account-service/migrations/0001_account_template.sql',import.meta.url),'utf8'));db.exec(readFileSync(new URL('../account-service/migrations/0002_private_accounts.sql',import.meta.url),'utf8'));
db.exec(readFileSync(new URL('../account-service/migrations/0003_account_capacity_and_birth.sql',import.meta.url),'utf8'));
db.exec(readFileSync(new URL('../account-service/migrations/0004_adult_registration.sql',import.meta.url),'utf8'));
class Statement{constructor(text,args=[]){this.text=text;this.args=args;}bind(...args){return new Statement(this.text,args);}async first(){return db.prepare(this.text).get(...this.args)||null;}async all(){return {results:db.prepare(this.text).all(...this.args),meta:{changes:0}};}async run(){const r=db.prepare(this.text).run(...this.args);return {success:true,meta:{changes:Number(r.changes)}};}}
const env={SERVICE_MODE:'active',DB:{prepare:t=>new Statement(t),async batch(stmts){db.exec('BEGIN');try{const r=[];for(const s of stmts)r.push(await s.run());db.exec('COMMIT');return r;}catch(e){db.exec('ROLLBACK');throw e;}}},HMAC_SECRET:'12'.repeat(32),PASSWORD_PEPPER:'34'.repeat(32),SPONSOR_KEY:'56'.repeat(32),TURNSTILE_SITE:'unit-test-site',TURNSTILE_SECRET:'unit-test-secret'};
let captchaSuccess=true;const originalFetch=globalThis.fetch;globalThis.fetch=async(url,init)=>{assert.equal(url,'https://challenges.cloudflare.com/turnstile/v0/siteverify');return Response.json({success:captchaSuccess,hostname:'account.example.test',action:init.body.get('response')});};
const base='https://account.example.test/api/account/';let ipSerial=1;
async function api(path,{method='GET',payload,cookie,csrf,origin='https://account.example.test',ip='192.0.2.1'}={}){return worker.fetch(new Request(base+path,{method,headers:{Origin:origin,'CF-Connecting-IP':ip,...(payload!==undefined?{'Content-Type':'application/json'}:{}),...(cookie?{Cookie:cookie}:{}),...(csrf?{'X-CSRF-Token':csrf}:{})},...(payload!==undefined?{body:JSON.stringify(payload)}:{})}),env);}
const read=async r=>{const data=await r.json();return {status:r.status,data,cookie:r.headers.get('Set-Cookie')?.split(';')[0]};};
async function register(email,extra={}){const ip='192.0.2.'+(ipSerial++),challenge=await read(await api('challenge',{method:'POST',payload:{email},ip}));assert.equal(challenge.status,200);const key=await crypto.subtle.importKey('raw',new TextEncoder().encode('test passphrase with many characters'),'PBKDF2',false,['deriveBits']);const salt=Uint8Array.from(challenge.data.salt.match(/../g),x=>parseInt(x,16));const prehash=hex(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt,iterations:600000},key,256));const data={email,emailRepeat:email,prehash,givenName:'Test',familyName:'Fixture',dateOfBirth:'2001-01-01',turnstile:'register',acceptTerms:true,termsVersion:'2026-10-21-v3',...extra};const result=await read(await api('register',{method:'POST',payload:data,ip}));return {...result,prehash,email,ip};}
const disconnected=await worker.fetch(new Request(base+'status'),{});assert.equal((await disconnected.json()).connected,false);
assert.equal((await api('me')).status,401);assert.equal((await api('sponsor/face-detector-en')).status,401);
captchaSuccess=false;assert.equal((await register('captcha@example.test')).status,403);captchaSuccess=true;
const a=await register('alpha@example.test');assert.equal(a.status,201);assert(a.cookie.includes('__Host-dedsec_session='));assert(a.data.recoveryCode.length===64);
const meA=await read(await api('me',{cookie:a.cookie,ip:a.ip}));assert.equal(meA.status,200);assert.equal(meA.data.counts.registered,1);assert.equal(meA.data.counts.active,1);assert.deepEqual(meA.data.entries,[]);assert.equal(meA.data.rewards.unlocked,false);assert.equal(meA.data.mailReady,false);
assert.equal((await api('verify/request',{method:'POST',cookie:a.cookie,csrf:meA.data.csrf,payload:{},ip:a.ip})).status,503);
assert.equal((await api('notes',{method:'PUT',cookie:a.cookie,csrf:meA.data.csrf,payload:{revision:0,entries:[]},origin:'https://evil.example',ip:a.ip})).status,403);
assert.equal((await api('notes',{method:'PUT',cookie:a.cookie,payload:{revision:0,entries:[]},ip:a.ip})).status,403);
const entries=[{path:'Ελληνικά',kind:'folder',pinned:true},{path:'Ελληνικά/note.txt',kind:'file',pinned:true,content:'Private Ελληνικά\n<script>never execute</script>'}];
let save=await read(await api('notes',{method:'PUT',cookie:a.cookie,csrf:meA.data.csrf,payload:{revision:0,entries,user_id:'not-the-owner'},ip:a.ip}));assert.equal(save.status,200);assert.equal(save.data.revision,1);assert.equal(save.data.usedBytes,core.usage(entries));
const b=await register('beta@example.test',{referralCode:meA.data.rewards.code});assert.equal(b.status,201);const meB=await read(await api('me',{cookie:b.cookie,ip:b.ip}));assert.deepEqual(meB.data.entries,[]);assert.notEqual(meA.data.rewards.code,meB.data.rewards.code);
// Verification is account-bound, single-use and sent only on an explicit request.
const captchaFetch=globalThis.fetch;let mailPayload=null;env.MAIL_API_KEY='local-mail-fixture';env.MAIL_FROM='Test <test@example.test>';
globalThis.fetch=async(url,init)=>{if(url==='https://api.resend.com/emails'){mailPayload=JSON.parse(init.body);return Response.json({id:'local-email-fixture'});}return captchaFetch(url,init);};
assert.equal((await api('verify/request',{method:'POST',cookie:a.cookie,csrf:meA.data.csrf,payload:{},ip:a.ip})).status,200);assert.deepEqual(mailPayload.to,[a.email]);const verificationToken=mailPayload.text.match(/\/verify\?token=([a-f0-9]{64})/)[1];assert(!JSON.stringify(db.prepare('SELECT * FROM account_email_tokens').all()).includes(verificationToken));
assert.equal((await api('verify/confirm',{method:'POST',cookie:b.cookie,csrf:meB.data.csrf,payload:{token:verificationToken},ip:b.ip})).status,400);
assert.equal((await api('verify/confirm',{method:'POST',cookie:a.cookie,csrf:meA.data.csrf,payload:{token:verificationToken},ip:a.ip})).status,200);
assert.equal((await api('verify/confirm',{method:'POST',cookie:a.cookie,csrf:meA.data.csrf,payload:{token:verificationToken},ip:a.ip})).status,400);// Brevo delivery uses its own authentication; failures invalidate outstanding tokens.
env.MAIL_PROVIDER='brevo';env.MAIL_FROM='DedSec Project <contact@ded-sec.space>';env.ACCOUNT_PUBLIC_ORIGIN='https://account.example.test';
let brevoFails=false;
globalThis.fetch=async(url,init)=>{if(url==='https://api.brevo.com/v3/smtp/email'){assert.equal(init.headers['api-key'],'local-mail-fixture');mailPayload=JSON.parse(init.body);return Response.json(brevoFails?{message:'fixture failure'}:{messageId:'fixture'},{status:brevoFails?500:201});}return captchaFetch(url,init);};
assert.equal((await api('verify/request',{method:'POST',cookie:b.cookie,csrf:meB.data.csrf,payload:{},ip:b.ip})).status,200);assert.deepEqual(mailPayload.to,[{email:b.email}]);assert.equal(mailPayload.sender.email,'contact@ded-sec.space');assert(mailPayload.textContent.includes('https://account.example.test/verify?token='));
const bTokenId=db.prepare('SELECT id FROM account_users WHERE email=?').get(b.email).id;
brevoFails=true;assert.equal((await api('verify/request',{method:'POST',cookie:b.cookie,csrf:meB.data.csrf,payload:{},ip:b.ip})).status,503);assert.equal(db.prepare('SELECT count(*) AS n FROM account_email_tokens WHERE user_id=?').get(bTokenId).n,0);
delete env.MAIL_PROVIDER;delete env.ACCOUNT_PUBLIC_ORIGIN;delete env.MAIL_API_KEY;delete env.MAIL_FROM;globalThis.fetch=captchaFetch;
const storedA=await read(await api('me',{cookie:a.cookie,ip:a.ip}));assert.deepEqual(storedA.data.entries,entries);
assert.equal((await api('notes',{method:'PUT',cookie:a.cookie,csrf:meA.data.csrf,payload:{revision:0,entries:[]},ip:a.ip})).status,409);assert.deepEqual((await read(await api('me',{cookie:a.cookie,ip:a.ip}))).data.entries,entries);
assert.equal((await api('notes',{method:'PUT',cookie:a.cookie,csrf:meA.data.csrf,payload:{revision:1,entries:[{path:'large.txt',kind:'file',pinned:false,content:'x'.repeat(900001)}]},ip:a.ip})).status,400);
assert.equal((await api('notes',{method:'PUT',cookie:a.cookie,csrf:meA.data.csrf,payload:{revision:1,entries:[{path:'../escape.txt',kind:'file',pinned:false,content:'x'}]},ip:a.ip})).status,400);
assert.equal((await api('sponsor/face-detector-en',{cookie:a.cookie,ip:a.ip})).status,403);
let login=await read(await api('login',{method:'POST',payload:{email:a.email,prehash:a.prehash,turnstile:'login'},ip:'192.0.2.100'}));assert.equal(login.status,200);assert(login.cookie!==a.cookie);
assert.equal((await api('login',{method:'POST',payload:{email:a.email,prehash:'00'.repeat(32),turnstile:'login'},ip:'192.0.2.100'})).status,401);
const badRecovery=await api('recover',{method:'POST',payload:{email:a.email,prehash:a.prehash,recoveryCode:'bad',turnstile:'recover'},ip:'192.0.2.100'});assert.equal(badRecovery.status,401);
const recovery=await read(await api('recover',{method:'POST',payload:{email:a.email,prehash:a.prehash,recoveryCode:a.data.recoveryCode,turnstile:'recover'},ip:'192.0.2.101'}));assert.equal(recovery.status,200);assert(recovery.data.recoveryCode!==a.data.recoveryCode);assert.equal((await api('me',{cookie:a.cookie,ip:a.ip})).status,401);a.cookie=recovery.cookie;
const now=Date.now(),old=new Date(now-172800000).toISOString();const aid=db.prepare('SELECT id FROM account_users WHERE email=?').get(a.email).id;db.prepare('UPDATE account_users SET email_verified_at=? WHERE id=?').run(old,aid);
for(const user of [b,await register('gamma@example.test',{referralCode:meA.data.rewards.code}),await register('delta@example.test',{referralCode:meA.data.rewards.code})]){assert.equal(user.status,201);const id=db.prepare('SELECT id FROM account_users WHERE email=?').get(user.email).id;db.prepare('UPDATE account_users SET email_verified_at=?,created_at=? WHERE id=?').run(old,old,id);db.prepare('UPDATE account_referrals SET created_at=? WHERE invitee_id=?').run(old,id);db.prepare('INSERT OR IGNORE INTO account_daily_activity VALUES(?,?)').run(dayKey(new Date(now-86400000)),id);}
const eligible=await read(await api('me',{cookie:a.cookie,ip:a.ip}));assert.equal(eligible.data.rewards.qualified,3);assert.equal(eligible.data.rewards.unlocked,true);assert.equal(eligible.data.rewards.unlockedCount,1);assert.equal(eligible.data.rewards.scripts[0].unlocked,true);assert.equal(eligible.data.rewards.scripts[1].unlocked,false);assert.equal(eligible.data.rewards.scripts[1].requiredReferrals,6);assert.equal((await api('sponsor/face-detector-el',{cookie:a.cookie,ip:a.ip})).status,403);
// Stored account state contains no original password, prehash, recovery code or raw IP.
assert.equal(meA.data.user.dateOfBirth,'2001-01-01');assert.equal(meA.data.user.ageAtRegistration,registrationAge('2001-01-01'));assert(!JSON.stringify((await read(await api('status'))).data).includes('2001-01-01'));
const allCredentials=JSON.stringify(db.prepare('SELECT * FROM account_credentials').all());assert(!allCredentials.includes(a.prehash));assert(!allCredentials.includes(a.data.recoveryCode));assert(!JSON.stringify(db.prepare('SELECT * FROM account_signup_networks').all()).includes('192.0.2.'));
const bid=db.prepare('SELECT id FROM account_users WHERE email=?').get(b.email).id;db.prepare('UPDATE account_signup_networks SET network_hash=(SELECT network_hash FROM account_signup_networks WHERE user_id=?) WHERE user_id=?').run(aid,bid);db.prepare("UPDATE account_referrals SET state='pending',qualified_at=NULL WHERE invitee_id=?").run(bid);const shared=await read(await api('me',{cookie:a.cookie,ip:a.ip}));assert.equal(shared.data.rewards.qualified,2);assert.equal(shared.data.rewards.unlocked,false);
 for(let i=0;i<4;i++){const user=await register('referral-'+i+'@example.test',{referralCode:meA.data.rewards.code});assert.equal(user.status,201);const id=db.prepare('SELECT id FROM account_users WHERE email=?').get(user.email).id;db.prepare('UPDATE account_users SET email_verified_at=?,created_at=? WHERE id=?').run(old,old,id);db.prepare('UPDATE account_referrals SET created_at=? WHERE invitee_id=?').run(old,id);db.prepare('INSERT OR IGNORE INTO account_daily_activity VALUES(?,?)').run(dayKey(new Date(now-86400000)),id);}
 const six=await read(await api('rewards',{cookie:a.cookie,ip:a.ip}));assert.equal(six.data.qualified,6);assert.equal(six.data.unlockedCount,2);assert.equal(six.data.scripts[0].unlocked,true);assert.equal(six.data.scripts[1].unlocked,true);assert.equal(six.data.scripts[2].unlocked,false);assert.equal(six.data.scripts[2].requiredReferrals,9);
// Alias identities cannot fill multiple account places.
assert.equal((await register('some.person@gmail.com')).status,201);assert.equal((await register('someperson+alias@googlemail.com')).status,409);
const current=await read(await api('me',{cookie:a.cookie,ip:a.ip}));assert.equal((await api('logout',{method:'POST',cookie:a.cookie,csrf:current.data.csrf,payload:{},ip:a.ip})).status,200);assert.equal((await api('me',{cookie:a.cookie,ip:a.ip})).status,401);
const bNow=await read(await api('me',{cookie:b.cookie,ip:b.ip}));assert.equal((await api('me',{method:'DELETE',cookie:b.cookie,csrf:bNow.data.csrf,payload:{prehash:b.prehash},ip:b.ip})).status,200);assert.equal(db.prepare('SELECT count(*) AS n FROM account_users WHERE id=?').get(bid).n,0);assert.equal((await api('me',{cookie:b.cookie,ip:b.ip})).status,401);
for(let i=0;i<31;i++){const r=await api('challenge',{method:'POST',payload:{email:'lookup@example.test'},ip:'203.0.113.200'});if(i===30)assert.equal(r.status,429);}
await cleanup(env);assert.equal(dayKey(new Date('2026-10-20T20:59:59Z')),'2026-10-20');assert.equal(dayKey(new Date('2026-10-20T21:00:00Z')),'2026-10-21');assert.equal(dayKey(new Date('2026-12-20T22:00:00Z')),'2026-12-21');
assert.equal((await register('no-birth@example.test',{dateOfBirth:undefined})).data.error,'invalid_date_of_birth');assert.equal((await register('bad-birth@example.test',{dateOfBirth:'2001-02-29'})).data.error,'invalid_date_of_birth');assert.equal((await register('age-mismatch@example.test',{age:2})).data.error,'age_mismatch');
const todayParts=Object.fromEntries(new Intl.DateTimeFormat('en',{timeZone:'Europe/Athens',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()).map(p=>[p.type,p.value]));
const oldBirth=(Number(todayParts.year)-130)+'-01-01';
const oldest=await register('oldest@example.test',{dateOfBirth:oldBirth,age:130});assert.equal(oldest.status,201);assert.equal(db.prepare('SELECT age_at_registration FROM account_users WHERE email=?').get('oldest@example.test').age_at_registration,130);
const youngBirth=(Number(todayParts.year)-17)+'-01-01';assert.equal((await register('too-young@example.test',{dateOfBirth:youngBirth,age:17})).data.error,'invalid_date_of_birth');
const usersBefore=db.prepare('SELECT count(*) AS n FROM account_users').get().n;db.exec('BEGIN');assert.throws(()=>db.exec(readFileSync(new URL('../account-service/migrations/0004_adult_registration.sql',import.meta.url),'utf8')));db.exec('ROLLBACK');assert.equal(db.prepare('SELECT count(*) AS n FROM account_users').get().n,usersBefore);

// Password changes revoke prior sessions and rotate recovery without changing notes.
const changer=await register('password-change@example.test');const changerMe=await read(await api('me',{cookie:changer.cookie,ip:changer.ip}));
assert.equal((await api('password',{method:'POST',cookie:changer.cookie,csrf:changerMe.data.csrf,payload:{currentPrehash:changer.prehash,newPrehash:'77'.repeat(32)},ip:changer.ip})).status,403);
db.prepare('UPDATE account_users SET email_verified_at=? WHERE email=?').run(new Date().toISOString(),changer.email);
assert.equal((await api('password',{method:'POST',cookie:changer.cookie,csrf:changerMe.data.csrf,payload:{currentPrehash:'00'.repeat(32),newPrehash:'77'.repeat(32)},ip:changer.ip})).status,401);
const changedPassword=await read(await api('password',{method:'POST',cookie:changer.cookie,csrf:changerMe.data.csrf,payload:{currentPrehash:changer.prehash,newPrehash:'77'.repeat(32)},ip:changer.ip}));assert.equal(changedPassword.status,200);assert.match(changedPassword.data.recoveryCode,/^[a-f0-9]{64}$/);assert.notEqual(changedPassword.data.recoveryCode,changer.data.recoveryCode);assert.equal((await api('me',{cookie:changer.cookie,ip:changer.ip})).status,401);assert.equal((await api('me',{cookie:changedPassword.cookie,ip:changer.ip})).status,200);
const embeddedLogin=await worker.fetch(new Request(base+'login',{method:'POST',headers:{Origin:'https://account.example.test','Content-Type':'application/json','X-DedSec-Embedded':'1','CF-Connecting-IP':'192.0.2.250'},body:JSON.stringify({email:changer.email,prehash:'77'.repeat(32),turnstile:'login'})}),env);assert.equal(embeddedLogin.status,200);const partitioned=embeddedLogin.headers.get('Set-Cookie');assert(partitioned.includes('__Host-dedsec_embed=')&&partitioned.includes('SameSite=None')&&partitioned.includes('Partitioned')&&partitioned.includes('HttpOnly'));
const embeddedMe=await worker.fetch(new Request(base+'me',{headers:{Origin:'https://account.example.test','X-DedSec-Embedded':'1',Cookie:partitioned.split(';')[0]}}),env);assert.equal(embeddedMe.status,200);

// Email links confirm without an existing login cookie and show a redirect screen.
const verifiedAccount=await register('email-link@example.test');
const linkToken='ab'.repeat(32);
db.prepare('INSERT INTO account_email_tokens VALUES(?,?,?)').run(await digest(linkToken),db.prepare('SELECT id FROM account_users WHERE email=?').get(verifiedAccount.email).id,Math.floor(Date.now()/1000)+3600);
const linkResult=await worker.fetch(new Request('https://account.example.test/verify?token='+linkToken),env);
assert.equal(linkResult.status,200);
const linkHtml=await linkResult.text();
assert(linkHtml.includes('verified DedSec Project user')&&linkHtml.includes('http-equiv="refresh"'));
assert(db.prepare('SELECT email_verified_at FROM account_users WHERE email=?').get(verifiedAccount.email).email_verified_at);
assert.equal((await worker.fetch(new Request('https://account.example.test/verify?token='+linkToken),env)).status,400);

// Email 2FA: password alone MUST NOT create an authenticated session.
const securityAccount=await register('email-two-factor@example.test');
db.prepare('UPDATE account_users SET email_verified_at=? WHERE email=?').run(new Date().toISOString(),securityAccount.email);
env.MAIL_PROVIDER='brevo';env.MAIL_FROM='DedSec Project <contact@ded-sec.space>';env['DedSec-Project-Email']='fixture-only';
let lastSecurityCode='';
globalThis.fetch=async(url,init)=>{
 if(url==='https://challenges.cloudflare.com/turnstile/v0/siteverify')return Response.json({success:true,hostname:'account.example.test',action:init.body.get('response')});
 if(url==='https://api.brevo.com/v3/smtp/email'){
  assert.equal(init.headers['api-key'],'fixture-only');
  const data=JSON.parse(init.body);
  lastSecurityCode=/code is ([0-9]{6})/.exec(data.textContent)?.[1]||'';
  return Response.json({messageId:'fixture'},{status:201});
 }
 throw Error('unexpected external fetch '+url);
};
const securityMe=await read(await api('me',{cookie:securityAccount.cookie,ip:securityAccount.ip}));
const securityPost=(p,payload)=>api(p,{method:'POST',cookie:securityAccount.cookie,csrf:securityMe.data.csrf,payload,ip:securityAccount.ip});
const enroll=await read(await securityPost('2fa/setup',{prehash:securityAccount.prehash}));
assert.equal(enroll.status,200);assert.match(lastSecurityCode,/^[0-9]{6}$/);
const enabled=await read(await securityPost('2fa/setup/confirm',{token:enroll.data.token,code:lastSecurityCode}));
assert.equal(enabled.data.enabled,true);
const login2fa=await read(await api('login',{method:'POST',payload:{email:securityAccount.email,prehash:securityAccount.prehash,turnstile:'login'},ip:'192.0.2.245'}));
assert.equal(login2fa.status,200);assert.equal(login2fa.data.secondFactor,'email');assert.equal(login2fa.cookie,undefined);
assert.equal((await api('2fa/finish',{method:'POST',payload:{token:login2fa.data.token,code:'999999'},ip:'192.0.2.246'})).status,400);
const authenticated=await read(await api('2fa/finish',{method:'POST',payload:{token:login2fa.data.token,code:lastSecurityCode},ip:'192.0.2.246'}));
assert.equal(authenticated.status,200);assert(authenticated.cookie);
assert.equal((await api('me',{cookie:authenticated.cookie,ip:'192.0.2.246'})).status,200);
delete env['DedSec-Project-Email'];delete env.MAIL_PROVIDER;delete env.MAIL_FROM;
globalThis.fetch=async(url,init)=>{assert.equal(url,'https://challenges.cloudflare.com/turnstile/v0/siteverify');return Response.json({success:true,hostname:'account.example.test',action:init.body.get('response')});};

// Two-step email change: no link scanner GET may approve either address.
const changedEmailUser=await register('old-email-change@example.test');
db.prepare('UPDATE account_users SET email_verified_at=? WHERE email=?').run(new Date().toISOString(),changedEmailUser.email);
env.MAIL_PROVIDER='brevo';env.MAIL_FROM='DedSec Project <contact@ded-sec.space>';env['DedSec-Project-Email']='fixture-only';env.ACCOUNT_PUBLIC_ORIGIN='https://account.example.test';
let changeMail=null;
globalThis.fetch=async(url,init)=>{
 if(url==='https://challenges.cloudflare.com/turnstile/v0/siteverify')return Response.json({success:true,hostname:'account.example.test',action:init.body.get('response')});
 if(url==='https://api.brevo.com/v3/smtp/email'){changeMail=JSON.parse(init.body);return Response.json({messageId:'email-change-fixture'},{status:201});}
 throw Error('Unexpected request '+url);
};
const oldMe=await read(await api('me',{cookie:changedEmailUser.cookie,ip:changedEmailUser.ip}));
const nextEmail='new-email-change@example.test';
const changeRequest=await read(await api('email/change/request',{method:'POST',cookie:changedEmailUser.cookie,csrf:oldMe.data.csrf,payload:{newEmail:nextEmail,prehash:changedEmailUser.prehash},ip:changedEmailUser.ip}));
assert.equal(changeRequest.status,200);assert.equal(changeMail.to[0].email,changedEmailUser.email);
const oldCode=changeMail.textContent.match(/change-email\?stage=old&token=([a-f0-9]{64})/)[1];
const changeLink=(stage,token)=>'https://account.example.test/change-email?stage='+stage+'&token='+token;
const submitChange=async(stage,token)=>worker.fetch(new Request('https://account.example.test/change-email',{method:'POST',headers:{Origin:'https://account.example.test','Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({stage,token})}),env);
assert.equal((await worker.fetch(new Request(changeLink('old',oldCode)),env)).status,200);
assert.equal(db.prepare('SELECT stage FROM account_email_changes WHERE user_id=(SELECT id FROM account_users WHERE email=?)').get(changedEmailUser.email).stage,'old');
assert.equal((await submitChange('old',oldCode)).status,200);
assert.equal(changeMail.to[0].email,nextEmail);
const newCode=changeMail.textContent.match(/change-email\?stage=new&token=([a-f0-9]{64})/)[1];
assert.equal((await worker.fetch(new Request(changeLink('new',newCode)),env)).status,200);
assert.equal(db.prepare('SELECT email FROM account_users WHERE id=(SELECT user_id FROM account_credentials WHERE identity_hash=?)').get(await mac(env.HMAC_SECRET,'identity:'+changedEmailUser.email)).email,changedEmailUser.email);
assert.equal((await submitChange('new',newCode)).status,200);
assert(db.prepare('SELECT email_verified_at FROM account_users WHERE email=?').get(nextEmail).email_verified_at);
assert.equal((await api('me',{cookie:changedEmailUser.cookie,ip:changedEmailUser.ip})).status,401);
assert.equal((await submitChange('new',newCode)).status,400);
delete env['DedSec-Project-Email'];delete env.MAIL_PROVIDER;delete env.MAIL_FROM;delete env.ACCOUNT_PUBLIC_ORIGIN;
globalThis.fetch=async(url,init)=>{assert.equal(url,'https://challenges.cloudflare.com/turnstile/v0/siteverify');return Response.json({success:true,hostname:'account.example.test',action:init.body.get('response')});};

// Cloudflare Pages canonicalizes .html to the same extensionless path.
for(const language of ['', 'el/']){
 const target='https://ded-sec.space/dedsec/'+language+'Pages/account.html';let calls=0;
 globalThis.fetch=async(url,init)=>{assert.equal(init.redirect,'manual');calls++;if(calls===1){assert.equal(url,target);return new Response(null,{status:308,headers:{Location:new URL(target).pathname.replace(/\.html$/,'')}});}assert.equal(url,target.replace(/\.html$/,''));return new Response(readFileSync(new URL('../DedSec-Project-Website/dedsec/'+language+'Pages/account.html',import.meta.url),'utf8'));};
 const portal=await worker.fetch(new Request('https://account.example.test/dedsec/'+language+'Pages/account.html?site=main'),env);assert.equal(portal.status,200);assert.equal(calls,2);assert((await portal.text()).includes('DEDSEC_ACCOUNT_CONFIG'));
}
for(const location of ['https://evil.example/account','/dedsec/Pages/privacy-policy','/dedsec/Pages/account?token=bad','/dedsec/Pages/account#bad']){
 let calls=0;globalThis.fetch=async()=>{calls++;return new Response(null,{status:301,headers:{Location:location}});};
 const result=await worker.fetch(new Request('https://account.example.test/dedsec/Pages/account.html?site=main'),env);assert.equal(result.status,503);assert.equal(calls,1);
}

// The live portal must replace fingerprinted config URLs and resolve assets on Test.
globalThis.fetch=async (url,init)=>{assert.equal(init.redirect,'manual');assert.equal(url,'https://dedsec1121fk.github.io/Test/dedsec/Pages/account.html');return new Response(readFileSync(new URL('../DedSec-Project-Website/dedsec/Pages/account.html',import.meta.url),'utf8').replace('account-config.js','account-config.js?v=abcdef123456'));};
const portal=await worker.fetch(new Request('https://account.example.test/dedsec/Pages/account.html'),env);assert.equal(portal.status,200);const html=await portal.text();assert(html.includes('<base href="https://dedsec1121fk.github.io/Test/dedsec/Pages/account.html">'));assert(html.includes('"apiBase":"https://account.example.test/api/account"'));assert(!html.includes('account-config.js'));assert(portal.headers.get('Content-Security-Policy').includes("frame-ancestors 'none'"));
// Every deployment profile uses its own published HTML and exact embedding origin.
for(const [profile,site] of Object.entries(SITES)){
 globalThis.fetch=async (url,init)=>{assert.equal(url,site+'dedsec/Pages/account.html');assert.equal(init.redirect,'manual');return new Response(readFileSync(new URL('../DedSec-Project-Website/dedsec/Pages/account.html',import.meta.url),'utf8'));};
 const parent=new URL(site).origin;const url='https://account.example.test/dedsec/Pages/account.html?'+new URLSearchParams({site:profile,embed:'1',parent,bridge:'ab'.repeat(16)});const result=await worker.fetch(new Request(url),env);assert.equal(result.status,200);assert(result.headers.get('Content-Security-Policy').includes('frame-ancestors '+parent+';'));assert(result.headers.get('Content-Security-Policy').includes("script-src 'self' 'nonce-")&&result.headers.get('Content-Security-Policy').includes('base-uri '+parent+';'));assert(result.headers.get('Content-Security-Policy').includes('font-src '+parent+' data:'));const html=await result.text();assert(html.includes('data-account-embedded="true"'));assert(html.includes('"embedded":true'));
 const rejected=await worker.fetch(new Request(url.replace(encodeURIComponent(parent),encodeURIComponent('https://evil.example'))),env);assert.equal(rejected.status,403);
}

globalThis.fetch=async()=>new Response(null,{status:302,headers:{Location:'https://example.test/untrusted'}});const redirectedPortal=await worker.fetch(new Request('https://account.example.test/dedsec/Pages/account.html'),env);assert.equal(redirectedPortal.status,503);assert.equal((await redirectedPortal.json()).error,'portal_not_published');
// Deletion must commit before notification, and remain successful on provider failure.
for(const accepted of [true,false]){
 globalThis.fetch=async()=>Response.json({success:true,hostname:'account.example.test',action:'register'});
 const removed=await register('deletion-mail-'+accepted+'@example.test');assert.equal(removed.status,201);
 const state=await read(await api('me',{cookie:removed.cookie,ip:removed.ip}));let sends=0;
 env.MAIL_PROVIDER='brevo';env.MAIL_API_KEY='fixture-only';env.MAIL_FROM='DedSec Project <contact@ded-sec.space>';
 globalThis.fetch=async(url,options)=>{assert.equal(url,'https://api.brevo.com/v3/smtp/email');assert.equal(db.prepare('SELECT count(*) AS n FROM account_users WHERE email=?').get(removed.email).n,0);const message=JSON.parse(options.body);assert.equal(message.to[0].email,removed.email);assert(!JSON.stringify(message).includes(removed.prehash));sends++;return new Response(null,{status:accepted?201:503});};
 const result=await read(await api('me',{method:'DELETE',cookie:removed.cookie,csrf:state.data.csrf,payload:{prehash:removed.prehash},ip:removed.ip}));assert.equal(result.status,200);assert.equal(result.data.deleted,true);assert.equal(result.data.notificationSent,accepted);assert.equal(sends,1);assert.equal((await api('me',{cookie:removed.cookie,ip:removed.ip})).status,401);
}
globalThis.fetch=originalFetch;db.close();console.log('ACCOUNT_SERVICE_PASS: real SQLite transactions; registration/login/recovery; cookie, CSRF and origin boundaries; private notes, quota/conflict rollback; referrals, aliases, shared-network rejection; logout/deletion; rate limits and Athens day boundaries. Turnstile mocked only in this local test.');




