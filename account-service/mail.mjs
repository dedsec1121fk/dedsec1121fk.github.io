const DEFAULT_ORIGIN='https://dedsec-accounts.dedsec-project.workers.dev';

export function mailConfig(env){
 const provider=env.MAIL_PROVIDER||'resend';
 const apiKey=env.MAIL_API_KEY||env['DedSec-Project-Email'];
 if(!['brevo','resend'].includes(provider)||!apiKey||!env.MAIL_FROM)return null;
 const match=/^(?:([^<>\r\n]+) <)?([^\s<>@]+@[^\s<>@]+\.[^\s<>@]+)>?$/.exec(env.MAIL_FROM);
 if(!match)return null;
 let origin;try{const u=new URL(env.ACCOUNT_PUBLIC_ORIGIN||DEFAULT_ORIGIN);if(u.protocol!=='https:'||u.username||u.password||u.pathname!=='/'||u.search||u.hash)return null;origin=u.origin;}catch{return null;}
 return {provider,origin,sender:{email:match[2],name:(match[1]||'DedSec Project').trim()}};
}

export async function deliverVerification(env,email,token,profile='test',language='en'){
 const config=mailConfig(env);if(!config)throw new Error('email_not_configured');
 if(!/^[a-f0-9]{64}$/.test(token))throw new Error('invalid_verification_token');
 const link=config.origin+'/verify?token='+encodeURIComponent(token)+'&site='+(['test','main','backup'].includes(profile)?profile:'test')+'&lang='+(language==='el'?'el':'en');
 const subject='DedSec Project — Email verification / Επιβεβαίωση email';
 const text=`Confirm your DedSec Project email within one hour / Επιβεβαίωσε το email σου στο DedSec Project μέσα σε μία ώρα:\n${link}\n\nIf you did not request this, ignore this message / Αν δεν το ζήτησες, αγνόησε το μήνυμα.`;
 if(config.provider==='brevo')return fetch('https://api.brevo.com/v3/smtp/email',{
  method:'POST',headers:{'api-key':(env.MAIL_API_KEY||env['DedSec-Project-Email']),'Content-Type':'application/json'},
  body:JSON.stringify({sender:config.sender,to:[{email}],replyTo:config.sender,subject,textContent:text,htmlContent:'<p>'+text.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('\n','<br>')+'</p>'})
 });
 return fetch('https://api.resend.com/emails',{
  method:'POST',headers:{Authorization:'Bearer '+(env.MAIL_API_KEY||env['DedSec-Project-Email']),'Content-Type':'application/json'},
  body:JSON.stringify({from:env.MAIL_FROM,to:[email],subject,text})
 });
}

export async function deliverSecurityCode(env,email,code){
 const cfg=mailConfig(env);if(!cfg)throw Error('email_not_configured');
 if(!/^[0-9]{6}$/.test(code))throw Error('invalid_code');
 const subject='DedSec Project — Security code / Κωδικός ασφαλείας';
 const text='Your one-time DedSec Project sign-in/security code is '+code+'. It expires in 5 minutes.\nΟ κωδικός ασφαλείας DedSec Project είναι '+code+'. Λήγει σε 5 λεπτά.\nIf you did not request it, ignore this email.';
 if(cfg.provider==='brevo')return fetch('https://api.brevo.com/v3/smtp/email',{method:'POST',headers:{'api-key':env.MAIL_API_KEY||env['DedSec-Project-Email'],'Content-Type':'application/json'},body:JSON.stringify({sender:cfg.sender,to:[{email}],replyTo:cfg.sender,subject,textContent:text})});
 return fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+(env.MAIL_API_KEY||env['DedSec-Project-Email']),'Content-Type':'application/json'},body:JSON.stringify({from:env.MAIL_FROM,to:[email],subject,text})});
}

export async function deliverEmailChange(env,to,token,step,profile='test'){
 const c=mailConfig(env);if(!c)throw Error('email_not_configured');
 if(!/^[a-f0-9]{64}$/.test(token)||!['old','new'].includes(step))throw Error('invalid_email_change');
 const link=c.origin+'/change-email?stage='+step+'&token='+token+'&site='+(['test','main','backup'].includes(profile)?profile:'test');
 const old=step==='old';
 const subject=old?'DedSec Project — Authorize email change / Επιβεβαίωση αλλαγής email':'DedSec Project — Verify new email / Επιβεβαίωση νέου email';
 const message=old?'Confirm you authorized changing your DedSec Project email. / Επιβεβαίωσε ότι ζήτησες αλλαγή email.':'Verify that you own the new email address. / Επιβεβαίωσε ότι σου ανήκει το νέο email.';
 const text=message+'\n'+link+'\nThis link expires in one hour. If you did not request it, ignore this message. / Ο σύνδεσμος λήγει σε μία ώρα. Αν δεν το ζήτησες, αγνόησε το μήνυμα.';
 if(c.provider==='brevo')return fetch('https://api.brevo.com/v3/smtp/email',{method:'POST',headers:{'api-key':env.MAIL_API_KEY||env['DedSec-Project-Email'],'Content-Type':'application/json'},body:JSON.stringify({sender:c.sender,to:[{email:to}],replyTo:c.sender,subject,textContent:text})});
 return fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+(env.MAIL_API_KEY||env['DedSec-Project-Email']),'Content-Type':'application/json'},body:JSON.stringify({from:env.MAIL_FROM,to:[to],subject,text})});
}


// Send only after the database deletion has committed. Never include credentials or notes.
export async function deliverAccountDeleted(env,email){
 const c=mailConfig(env);if(!c)throw Error('email_not_configured');
 const subject='DedSec Project — Account deleted / Διαγραφή λογαριασμού';
 const text='Your DedSec Project account and private cloud notes have been deleted. This action cannot be undone. Local exports or copies in other browsers are not removed. If you did not request this, contact contact@ded-sec.space.\n\nΟ λογαριασμός σου στο DedSec Project και οι ιδιωτικές σημειώσεις cloud διαγράφηκαν οριστικά. Τα τοπικά αντίγραφα και οι εξαγωγές δεν διαγράφονται. Αν δεν το ζήτησες, επικοινώνησε με contact@ded-sec.space.';
 const brevo=c.provider==='brevo';
 return fetch(brevo?'https://api.brevo.com/v3/smtp/email':'https://api.resend.com/emails',{method:'POST',signal:AbortSignal.timeout(10000),headers:{'Content-Type':'application/json',...(brevo?{'api-key':env.MAIL_API_KEY||env['DedSec-Project-Email']}:{Authorization:'Bearer '+(env.MAIL_API_KEY||env['DedSec-Project-Email'])})},body:JSON.stringify(brevo?{sender:c.sender,to:[{email}],replyTo:c.sender,subject,textContent:text}:{from:env.MAIL_FROM,to:[email],subject,text})});
}
