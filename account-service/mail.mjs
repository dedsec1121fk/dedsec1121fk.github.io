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

const languageOf=value=>value==='el'?'el':'en';
const contactPage=language=>'https://ded-sec.space/dedsec/'+(language==='el'?'el/':'')+'Pages/contact-credits.html';
function footer(language){
 return language==='el'
  ?'Αυτό είναι ένα αυτοματοποιημένο μήνυμα. Δεν μπορείς να επικοινωνήσεις μαζί μας απαντώντας σε αυτό το email. Για επικοινωνία, δες τους επίσημους τρόπους στην ιστοσελίδα μας:\n'+contactPage(language)
  :'This is an automated message. You cannot contact us by replying to this email. For contact options, please visit the official contact channels on our website:\n'+contactPage(language);
}
async function deliver(env,email,subject,message,language){
 const c=mailConfig(env);if(!c)throw Error('email_not_configured');
 const lang=languageOf(language),text=message+'\n\n'+footer(lang);
 const html='<!doctype html><html lang="'+lang+'"><body><p>'+text.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('\n','<br>')+'</p></body></html>';
 const brevo=c.provider==='brevo';
 return fetch(brevo?'https://api.brevo.com/v3/smtp/email':'https://api.resend.com/emails',{
  method:'POST',signal:AbortSignal.timeout(10000),
  headers:{'Content-Type':'application/json',...(brevo?{'api-key':env.MAIL_API_KEY||env['DedSec-Project-Email']}:{Authorization:'Bearer '+(env.MAIL_API_KEY||env['DedSec-Project-Email'])})},
  body:JSON.stringify(brevo?{sender:c.sender,to:[{email}],subject,textContent:text,htmlContent:html}:{from:env.MAIL_FROM,to:[email],subject,text,html})
 });
}
export async function deliverVerification(env,email,token,profile='test',language='en'){
 const c=mailConfig(env);if(!c)throw Error('email_not_configured');
 if(!/^[a-f0-9]{64}$/.test(token))throw Error('invalid_verification_token');
 const lang=languageOf(language),el=lang==='el';
 const link=c.origin+'/verify?token='+encodeURIComponent(token)+'&site='+(['test','main','backup'].includes(profile)?profile:'test')+'&lang='+lang;
 return deliver(env,email,'DedSec Project — '+(el?'Επιβεβαίωση email':'Email verification'),
  (el?'Επιβεβαίωσε το email σου στο DedSec Project μέσα σε μία ώρα:':'Confirm your DedSec Project email within one hour:')+'\n'+link+'\n\n'+(el?'Αν δεν το ζήτησες, αγνόησε το μήνυμα.':'If you did not request this, ignore this message.'),lang);
}
export async function deliverSecurityCode(env,email,code,language='en'){
 if(!/^[0-9]{6}$/.test(code))throw Error('invalid_code');
 const lang=languageOf(language),el=lang==='el';
 return deliver(env,email,'DedSec Project — '+(el?'Κωδικός ασφαλείας':'Security code'),
  el?'Ο κωδικός ασφαλείας DedSec Project είναι '+code+'. Λήγει σε 5 λεπτά.\nΑν δεν το ζήτησες, αγνόησε το μήνυμα.':'Your one-time DedSec Project sign-in/security code is '+code+'. It expires in 5 minutes.\nIf you did not request this, ignore this message.',lang);
}
export async function deliverEmailChange(env,to,token,step,profile='test',language='en'){
 const c=mailConfig(env);if(!c)throw Error('email_not_configured');
 if(!/^[a-f0-9]{64}$/.test(token)||!['old','new'].includes(step))throw Error('invalid_email_change');
 const lang=languageOf(language),el=lang==='el',old=step==='old';
 const link=c.origin+'/change-email?stage='+step+'&token='+token+'&site='+(['test','main','backup'].includes(profile)?profile:'test')+'&lang='+lang;
 const subject=el?(old?'Επιβεβαίωση αλλαγής email':'Επιβεβαίωση νέου email'):(old?'Authorize email change':'Verify new email');
 const message=el?(old?'Επιβεβαίωσε ότι ζήτησες αλλαγή email στον λογαριασμό σου στο DedSec Project.':'Επιβεβαίωσε ότι σου ανήκει το νέο email.'):(old?'Confirm you authorized changing your DedSec Project email.':'Verify that you own the new email address.');
 return deliver(env,to,'DedSec Project — '+subject,message+'\n'+link+'\n\n'+(el?'Ο σύνδεσμος λήγει σε μία ώρα. Αν δεν το ζήτησες, αγνόησε το μήνυμα.':'This link expires in one hour. If you did not request it, ignore this message.'),lang);
}
// Send only after the database deletion has committed. Never include credentials or notes.
export async function deliverAccountDeleted(env,email,language='en'){
 const lang=languageOf(language),el=lang==='el';
 return deliver(env,email,'DedSec Project — '+(el?'Διαγραφή λογαριασμού':'Account deleted'),
  el?'Ο λογαριασμός σου στο DedSec Project και οι ιδιωτικές σημειώσεις cloud διαγράφηκαν οριστικά. Τα τοπικά αντίγραφα και οι εξαγωγές δεν διαγράφονται. Αν δεν το ζήτησες, χρησιμοποίησε τους επίσημους τρόπους επικοινωνίας στην ιστοσελίδα μας.':'Your DedSec Project account and private cloud notes have been deleted. This action cannot be undone. Local exports or copies in other browsers are not removed. If you did not request this, use the official contact channels on our website.',lang);
}
