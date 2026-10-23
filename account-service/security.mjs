/* Server-side email 2FA and WebAuthn passkeys for the private Test account Worker.
   Do not trust client claims about email verification, challenges, user presence or origin. */
import {random,digest,mac,equal,verifier,unhex} from './crypto.mjs';
import {deliverSecurityCode} from './mail.mjs';

const SECOND=300, CHALLENGE=180;
const origin='https://dedsec-accounts.dedsec-project.workers.dev';
const rpId=new URL(origin).hostname;
const enc=new TextEncoder();

export async function ensureAuthTables(env){
 for(const stmt of [
  'CREATE TABLE IF NOT EXISTS account_2fa(user_id TEXT PRIMARY KEY REFERENCES account_users(id) ON DELETE CASCADE, enabled INTEGER NOT NULL DEFAULT 0)',
  'CREATE TABLE IF NOT EXISTS account_2fa_codes(token_hash TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES account_users(id) ON DELETE CASCADE,code_hash TEXT NOT NULL,purpose TEXT NOT NULL,expires_at INTEGER NOT NULL,attempts INTEGER NOT NULL DEFAULT 0)',
  'CREATE TABLE IF NOT EXISTS account_passkeys(credential_id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES account_users(id) ON DELETE CASCADE,public_jwk TEXT NOT NULL,algorithm INTEGER NOT NULL,counter INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL)',
  'CREATE INDEX IF NOT EXISTS account_passkeys_user ON account_passkeys(user_id)',
  'CREATE TABLE IF NOT EXISTS account_passkey_challenges(token_hash TEXT PRIMARY KEY,user_id TEXT REFERENCES account_users(id) ON DELETE CASCADE,purpose TEXT NOT NULL,expires_at INTEGER NOT NULL)'
 ])await env.DB.prepare(stmt).run();
}
const now=()=>Math.floor(Date.now()/1000);
const one=async(env,q,...args)=>env.DB.prepare(q).bind(...args).first();
const run=async(env,q,...args)=>env.DB.prepare(q).bind(...args).run();
const e64=b=>{const u=b instanceof Uint8Array?b:new Uint8Array(b);let result='';for(let i=0;i<u.length;i++)result+=String.fromCharCode(u[i]);return btoa(result).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');};
const d64=s=>{if(typeof s!=='string'||! /^[A-Za-z0-9_-]{10,16000}$/.test(s))throw Error('invalid_passkey');const normalized=s.replace(/-/g,'+').replace(/_/g,'/');return Uint8Array.from(atob(normalized+'='.repeat((4-normalized.length%4)%4)),c=>c.charCodeAt(0));};
const u32=b=>new DataView(b.buffer,b.byteOffset,b.byteLength).getUint32(0,false);
function cborr(bytes){
 let off=0;
 function read(n){if(n<0||off+n>bytes.length)throw Error('invalid_passkey');const v=bytes.slice(off,off+n);off+=n;return v;}
 function item(depth=0){if(depth>12)throw Error('invalid_passkey');const first=read(1)[0],major=first>>5,a=first&31;
 let n=a;if(a===24)n=read(1)[0];else if(a===25){const v=read(2);n=(v[0]<<8)|v[1];}else if(a===26)n=u32(read(4));else if(a>=27)throw Error('invalid_passkey');
 if(n>16384)throw Error('invalid_passkey');
 if(major===0)return n;if(major===1)return -1-n;if(major===2)return read(n);
 if(major===3)return new TextDecoder('utf-8',{fatal:true}).decode(read(n));
 if(major===4)return Array.from({length:n},()=>item(depth+1));
 if(major===5){const map=new Map();for(let k=0;k<n;k++){const key=item(depth+1);if(map.has(key))throw Error('invalid_passkey');map.set(key,item(depth+1));}return map;}
 throw Error('invalid_passkey');
 }
 const value=item();return {value,offset:off};
}
function client(json,type,challenge){
 const o=JSON.parse(new TextDecoder().decode(d64(json)));
 if(o.type!==type||o.challenge!==challenge||o.origin!==origin||o.crossOrigin===true)throw Error('invalid_passkey');
 return d64(json);
}
async function authData(bytes,needAttestation=false){
 if(bytes.length<37)throw Error('invalid_passkey');
 const expected=new Uint8Array(await crypto.subtle.digest('SHA-256',enc.encode(rpId)));
 if(!expected.every((v,i)=>bytes[i]===v))throw Error('invalid_passkey');
 const flags=bytes[32],counter=u32(bytes.slice(33,37));
 if((flags&5)!==5)throw Error('passkey_user_verification_required');
 if(needAttestation&&(flags&64)===0)throw Error('invalid_passkey');
 return {flags,counter};
}
function keyJwk(cose){
 if(!(cose instanceof Map))throw Error('invalid_passkey');
 const alg=cose.get(3);
 if(alg===-7&&cose.get(1)===2&&cose.get(-1)===1&&cose.get(-2)?.length===32&&cose.get(-3)?.length===32)return {alg,jwk:{kty:'EC',crv:'P-256',x:e64(cose.get(-2)),y:e64(cose.get(-3)),ext:true}};
 if(alg===-257&&cose.get(1)===3&&cose.get(-1)?.length>=256&&cose.get(-2)?.length>=3)return {alg,jwk:{kty:'RSA',n:e64(cose.get(-1)),e:e64(cose.get(-2)),ext:true}};
 throw Error('passkey_algorithm_not_supported');
}
function derToRaw(der){
 const b=new Uint8Array(der);let i=0;if(b[i++]!==0x30)throw Error('invalid_passkey');
 let len=b[i++];if(len===0x81)len=b[i++];else if(len===0x82)len=(b[i++]<<8)|b[i++];
 if(i+len!==b.length)throw Error('invalid_passkey');
 const out=new Uint8Array(64);
 for(let part=0;part<2;part++){if(b[i++]!==2)throw Error('invalid_passkey');const n=b[i++];if(n<1||n>33||i+n>b.length)throw Error('invalid_passkey');let v=b.slice(i,i+n);i+=n;if(v.length===33&&v[0]===0)v=v.slice(1);if(v.length>32)throw Error('invalid_passkey');out.set(v,part*32+32-v.length);}
 return out;
}
async function verifySignature(jwk,alg,authBytes,clientBytes,sig){
 const hash=new Uint8Array(await crypto.subtle.digest('SHA-256',clientBytes)),data=new Uint8Array(authBytes.length+hash.length);
 data.set(authBytes);data.set(hash,authBytes.length);
 const imp=alg===-7?{name:'ECDSA',namedCurve:'P-256'}:{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'};
 const pk=await crypto.subtle.importKey('jwk',jwk,imp,false,['verify']);
 return crypto.subtle.verify(alg===-7?{name:'ECDSA',hash:'SHA-256'}:imp,pk,alg===-7?derToRaw(sig):sig,data);
}
function code(){const a=new Uint32Array(1);crypto.getRandomValues(a);return String(a[0]%1000000).padStart(6,'0');}
async function issueEmail(env,user,purpose,language){
 if(!user.email_verified_at)throw Error('email_not_verified');
 const token=random(32),otp=code(),tokenHash=await digest(token),codeHash=await mac(env.HMAC_SECRET,'2fa:'+purpose+':'+token+':'+otp);
 await env.DB.prepare('DELETE FROM account_2fa_codes WHERE user_id=? AND purpose=?').bind(user.id,purpose).run();
 await env.DB.prepare('INSERT INTO account_2fa_codes VALUES(?,?,?,?,?,0)').bind(tokenHash,user.id,codeHash,purpose,now()+SECOND).run();
 try{const response=await deliverSecurityCode(env,user.email,otp,language);if(!response.ok)throw Error('email_unavailable');}catch(e){await env.DB.prepare('DELETE FROM account_2fa_codes WHERE token_hash=?').bind(tokenHash).run();throw Error('email_unavailable');}
 return {token,expiresIn:SECOND};
}
async function consumeCode(env,purpose,token,otp){
 if(typeof token!=='string'||!/^[0-9a-f]{64}$/.test(token)||typeof otp!=='string'||!/^[0-9]{6}$/.test(otp))throw Error('invalid_2fa_code');
 const t=await one(env,'SELECT * FROM account_2fa_codes WHERE token_hash=? AND purpose=?',await digest(token),purpose);
 if(!t||t.expires_at<=now()||t.attempts>=5)throw Error('invalid_2fa_code');
 await run(env,'UPDATE account_2fa_codes SET attempts=attempts+1 WHERE token_hash=?',t.token_hash);
 if(!equal(await mac(env.HMAC_SECRET,'2fa:'+purpose+':'+token+':'+otp),t.code_hash))throw Error('invalid_2fa_code');
 await run(env,'DELETE FROM account_2fa_codes WHERE token_hash=?',t.token_hash);
 return t.user_id;
}
async function newPasskeyChallenge(env,userId,purpose){
 const token=random(32);await run(env,'DELETE FROM account_passkey_challenges WHERE user_id=? AND purpose=?',userId,purpose);
 await run(env,'INSERT INTO account_passkey_challenges VALUES(?,?,?,?)',await digest(token),userId,purpose,now()+CHALLENGE);
 return token;
}
async function takeChallenge(env,token,purpose,userId){
 if(typeof token!=='string'||!/^[0-9a-f]{64}$/.test(token))throw Error('invalid_passkey');
 const hash=await digest(token),entry=await one(env,'SELECT * FROM account_passkey_challenges WHERE token_hash=? AND purpose=?',hash,purpose);
 if(!entry||entry.expires_at<=now()||(userId!==undefined&&entry.user_id!==userId))throw Error('invalid_passkey');
 await run(env,'DELETE FROM account_passkey_challenges WHERE token_hash=?',hash);
 return entry;
}
export async function needsEmail2fa(env,userId){await ensureAuthTables(env);return Boolean((await one(env,'SELECT enabled FROM account_2fa WHERE user_id=?',userId))?.enabled);}
export async function startLogin2fa(env,userId,language){await ensureAuthTables(env);const user=await one(env,'SELECT id,email,email_verified_at FROM account_users WHERE id=?',userId);return {secondFactor:'email',...(await issueEmail(env,user,'login',language))};}
export async function securityPublic(req,env,path,ctx){
 if(!['2fa/finish','passkey/auth/start','passkey/auth/finish'].includes(path))return null;
 await ensureAuthTables(env);await ctx.rate(env,'auth-security:'+req.headers.get('CF-Connecting-IP'),12,600);
 const b=await ctx.body(req,32000);
 if(path==='2fa/finish'){
  const id=await consumeCode(env,'login',b.token,b.code);
  const token=await ctx.newSession(env,id);
  return ctx.json({signedIn:true},200,{'Set-Cookie':ctx.cookie(token,604800,ctx.embedded(req))});
 }
 if(path==='passkey/auth/start'){
  const email=ctx.email(b.email);
  const user=await one(env,'SELECT id FROM account_users WHERE email=?',email);
  const challenge=random(32);
  if(user)await run(env,'INSERT INTO account_passkey_challenges VALUES(?,?,?,?)',await digest(challenge),user.id,'auth',now()+CHALLENGE);
  const list=user?(await env.DB.prepare('SELECT credential_id FROM account_passkeys WHERE user_id=? LIMIT 12').bind(user.id).all()).results:[];
  return ctx.json({challenge,rpId,allowCredentials:list.map(x=>({id:x.credential_id,type:'public-key'})),userVerification:'required'});
 }
 const entry=await takeChallenge(env,b.challenge,'auth');
 const credential=await one(env,'SELECT * FROM account_passkeys WHERE credential_id=? AND user_id=?',b.id,entry.user_id);
 if(!credential)throw Error('invalid_passkey');
 const clientBytes=client(b.clientDataJSON,'webauthn.get',e64(unhex(b.challenge)));
 const bytes=d64(b.authenticatorData),{counter}=await authData(bytes);
 if(!await verifySignature(JSON.parse(credential.public_jwk),credential.algorithm,bytes,clientBytes,d64(b.signature)))throw Error('invalid_passkey');
 if(credential.counter>0&&counter>0&&counter<=credential.counter)throw Error('invalid_passkey');
 await run(env,'UPDATE account_passkeys SET counter=? WHERE credential_id=?',Math.max(credential.counter,counter),b.id);
 const token=await ctx.newSession(env,credential.user_id);
 return ctx.json({signedIn:true},200,{'Set-Cookie':ctx.cookie(token,604800,ctx.embedded(req))});
}
export async function securityUser(req,env,path,s,ctx){
 if(!path.startsWith('2fa/')&&!path.startsWith('passkey/'))return null;
 await ensureAuthTables(env);await ctx.rate(env,'security-user:'+s.id,30,900);
 if(path==='2fa/status'&&req.method==='GET'){
  return ctx.json({enabled:await needsEmail2fa(env,s.id),verified:Boolean(s.email_verified_at),
  passkeys:(await env.DB.prepare('SELECT credential_id,created_at FROM account_passkeys WHERE user_id=? ORDER BY created_at').bind(s.id).all()).results.map(x=>({id:x.credential_id.slice(0,12)+'…',createdAt:x.created_at,credentialId:x.credential_id}))});
 }
 const b=await ctx.body(req,32000);
 if(path==='2fa/setup'&&req.method==='POST'){
  if(await needsEmail2fa(env,s.id))throw Error('two_factor_already_enabled');
  if(!await ctx.confirmPassword(env,s,b.prehash))throw Error('invalid_credentials');
  return ctx.json(await issueEmail(env,s,'setup',b.language));
 }
 if(path==='2fa/setup/confirm'&&req.method==='POST'){
  const id=await consumeCode(env,'setup',b.token,b.code);if(id!==s.id)throw Error('invalid_2fa_code');
  await run(env,'INSERT INTO account_2fa VALUES(?,1) ON CONFLICT(user_id) DO UPDATE SET enabled=1',s.id);
  return ctx.json({enabled:true});
 }
 if(path==='2fa/disable'&&req.method==='POST'){
  if(!await ctx.confirmPassword(env,s,b.prehash))throw Error('invalid_credentials');
  return ctx.json({pendingDisable:true,...(await issueEmail(env,s,'disable',b.language))});
 }
 if(path==='2fa/disable/confirm'&&req.method==='POST'){
  const id=await consumeCode(env,'disable',b.token,b.code);if(id!==s.id)throw Error('invalid_2fa_code');
  await run(env,'UPDATE account_2fa SET enabled=0 WHERE user_id=?',s.id);
  return ctx.json({enabled:false});
 }
 if(path==='passkey/register/start'&&req.method==='POST'){
  if(!s.email_verified_at)throw Error('email_not_verified');
  if(!await ctx.confirmPassword(env,s,b.prehash))throw Error('invalid_credentials');
  const challenge=await newPasskeyChallenge(env,s.id,'register');
  const existing=(await env.DB.prepare('SELECT credential_id FROM account_passkeys WHERE user_id=?').bind(s.id).all()).results;
  return ctx.json({challenge,rp:{id:rpId,name:'DedSec Project Test'},user:{id:e64(unhex(s.id)),name:s.email,displayName:s.given_name+' '+s.family_name},pubKeyCredParams:[{type:'public-key',alg:-7},{type:'public-key',alg:-257}],authenticatorSelection:{userVerification:'required',residentKey:'preferred'},timeout:60000,attestation:'none',excludeCredentials:existing.map(x=>({type:'public-key',id:x.credential_id}))});
 }
 if(path==='passkey/register/finish'&&req.method==='POST'){
  await takeChallenge(env,b.challenge,'register',s.id);
  client(b.clientDataJSON,'webauthn.create',e64(unhex(b.challenge)));
  const decoded=cborr(d64(b.attestationObject)).value;
  if(!(decoded instanceof Map)||decoded.get('fmt')!=='none')throw Error('invalid_passkey');
  const bytes=decoded.get('authData');
  if(!(bytes instanceof Uint8Array)||bytes.length<56)throw Error('invalid_passkey');
  await authData(bytes,true);
  const length=(bytes[53]<<8)|bytes[54],start=55;if(length<16||length>1024||start+length>=bytes.length)throw Error('invalid_passkey');
  const id=e64(bytes.slice(start,start+length));
  if(id!==b.id)throw Error('invalid_passkey');
  const parsed=cborr(bytes.slice(start+length)),{alg,jwk}=keyJwk(parsed.value);
  const key=await crypto.subtle.importKey('jwk',jwk,alg===-7?{name:'ECDSA',namedCurve:'P-256'}:{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['verify']);
  if(!key)throw Error('invalid_passkey');
  const n=(await one(env,'SELECT count(*) AS n FROM account_passkeys WHERE user_id=?',s.id)).n;
  if(n>=5)throw Error('passkey_limit');
  await run(env,'INSERT INTO account_passkeys VALUES(?,?,?,?,?,?)',id,s.id,JSON.stringify(jwk),alg,u32(bytes.slice(33,37)),new Date().toISOString());
  return ctx.json({registered:true});
 }
 if(path==='passkey/remove'&&req.method==='POST'){
  if(!await ctx.confirmPassword(env,s,b.prehash))throw Error('invalid_credentials');
  const r=await run(env,'DELETE FROM account_passkeys WHERE user_id=? AND credential_id=?',s.id,b.id);
  return ctx.json({removed:Boolean(r.meta?.changes)});
 }
 return null;
}
