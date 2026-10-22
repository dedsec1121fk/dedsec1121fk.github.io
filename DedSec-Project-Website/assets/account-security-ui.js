/* Test account security controls. WebAuthn uses browser/platform authentication;
   no fingerprint or face image is sent to DedSec Project. */
(function(){
 'use strict';
 const gr=()=>document.documentElement.lang==='el',tr=(en,el)=>gr()?el:en;
 const $=id=>document.getElementById(id),api=()=>window.DedSecAccountSecurityAPI;
 const bytes=s=>{const z=s.replace(/-/g,'+').replace(/_/g,'/');return Uint8Array.from(atob(z+'='.repeat((4-z.length%4)%4)),c=>c.charCodeAt(0));};
 const base64=b=>{let s='';for(const v of new Uint8Array(b))s+=String.fromCharCode(v);return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');};
 const hex=s=>Uint8Array.from(s.match(/.{2}/g),a=>parseInt(a,16));
 function report(err){api()?.showError?.(err);if(err?.name==='NotAllowedError')api()?.message(tr('Device authentication was cancelled or blocked. Try opening the secure account page directly.','Η ταυτοποίηση στη συσκευή ακυρώθηκε ή μπλοκαρίστηκε. Άνοιξε την ασφαλή σελίδα λογαριασμού απευθείας.'),true);}
 function makeButton(parent,name,fn){const b=document.createElement('button');b.type='button';b.textContent=name;b.addEventListener('click',async()=>{b.disabled=true;try{await fn();}catch(e){report(e);}finally{b.disabled=false;}});parent.append(b);return b;}
 function text(parent,message){const p=document.createElement('p');p.textContent=message;parent.append(p);return p;}
 async function ask(title,prompt,kind='password'){
  return new Promise(resolve=>{
   const dialog=document.createElement('dialog');dialog.className='account-security-dialog';
   const form=document.createElement('form');const heading=document.createElement('h2');heading.textContent=title;
   const label=document.createElement('label');label.textContent=prompt;const input=document.createElement('input');
   input.type=kind==='code'?'text':'password';input.required=true;input.autocomplete=kind==='code'?'one-time-code':'current-password';
   if(kind==='code'){input.inputMode='numeric';input.pattern='[0-9]{6}';input.maxLength=6;input.minLength=6;}else{input.minLength=12;input.maxLength=128;}
   label.append(input);form.append(heading,label);
   const actions=document.createElement('div');actions.className='account-toolbar';
   const confirm=document.createElement('button');confirm.type='submit';confirm.textContent=tr('Continue','Συνέχεια');
   const cancel=document.createElement('button');cancel.type='button';cancel.textContent=tr('Cancel','Ακύρωση');
   cancel.addEventListener('click',()=>dialog.close());actions.append(confirm,cancel);form.append(actions);
   let output=null;form.addEventListener('submit',event=>{event.preventDefault();if(!form.reportValidity())return;output=input.value;input.value='';dialog.close();});
   dialog.addEventListener('close',()=>{dialog.remove();resolve(output);},{once:true});
   dialog.append(form);document.body.append(dialog);dialog.showModal();input.focus();
  });
 }
 async function passwordProof(){
  const user=api()?.getUser();if(!user)return null;
  const password=await ask(tr('Confirm your password','Επιβεβαίωση κωδικού'),tr('Your current account password','Ο τρέχων κωδικός του λογαριασμού'));
  if(password===null)return null;
  return api().prehash(user.email,password);
 }
 async function oneTime(purpose,reply){
  for(let attempts=0;attempts<5;attempts++){
   const code=await ask(tr('Email security code','Κωδικός ασφαλείας email'),tr('Enter the 6-digit code from your email (valid for 5 minutes)','Βάλε τον εξαψήφιο κωδικό από το email (ισχύει 5 λεπτά)'),'code');
   if(code===null)return false;
   try{await api().request(purpose,'POST',{token:reply.token,code});return true;}
   catch(e){report(e);if(attempts===4)return false;}
  }
  return false;
 }
 async function completeLogin(reply){
  if(!reply?.token)return;
  const confirmed=await oneTime('2fa/finish',reply);
  if(confirmed){await api().load();api().message(tr('Signed in with email two-factor authentication.','Συνδέθηκες με έλεγχο δύο παραγόντων μέσω email.'));}
 }
 window.DedSecAccountSecurity={completeLogin};
 async function enable2fa(){
  const prehash=await passwordProof();if(!prehash)return;
  const challenge=await api().request('2fa/setup','POST',{prehash});
  const ok=await oneTime('2fa/setup/confirm',challenge);
  if(ok){api().message(tr('Email two-factor authentication is enabled.','Η επαλήθευση δύο παραγόντων μέσω email ενεργοποιήθηκε.'));await update();}
 }
 async function disable2fa(){
  const prehash=await passwordProof();if(!prehash)return;
  const challenge=await api().request('2fa/disable','POST',{prehash});
  const ok=await oneTime('2fa/disable/confirm',challenge);
  if(ok){api().message(tr('Email two-factor authentication is disabled.','Η επαλήθευση δύο παραγόντων μέσω email απενεργοποιήθηκε.'));await update();}
 }
 function available(){
  return Boolean(window.PublicKeyCredential&&navigator.credentials?.create&&navigator.credentials?.get&&window.isSecureContext);
 }
 async function registerPasskey(){
  if(!available())throw Error('passkey_unavailable');
  const prehash=await passwordProof();if(!prehash)return;
  const options=await api().request('passkey/register/start','POST',{prehash});
  const publicKey={...options,challenge:hex(options.challenge),user:{...options.user,id:bytes(options.user.id)},excludeCredentials:options.excludeCredentials.map(x=>({...x,id:bytes(x.id)}))};
  delete publicKey.userVerification;
  const credential=await navigator.credentials.create({publicKey});
  if(!credential)throw Error('passkey_cancelled');
  await api().request('passkey/register/finish','POST',{challenge:options.challenge,id:base64(credential.rawId),clientDataJSON:base64(credential.response.clientDataJSON),attestationObject:base64(credential.response.attestationObject)});
  api().message(tr('Your device passkey was registered.','Το passkey της συσκευής σου προστέθηκε.'));await update();
 }
 async function loginPasskey(){
  if(!available())throw Error('passkey_unavailable');
  const email=$('account-login-panel')?.querySelector('input[name=email]')?.value?.trim();
  if(!email){api()?.message(tr('Enter your email first.','Συμπλήρωσε πρώτα το email σου.'),true);return;}
  const opts=await api().request('passkey/auth/start','POST',{email});
  const publicKey={challenge:hex(opts.challenge),rpId:opts.rpId,userVerification:'required',timeout:60000,allowCredentials:opts.allowCredentials.map(x=>({...x,id:bytes(x.id)}))};
  const credential=await navigator.credentials.get({publicKey});
  if(!credential)throw Error('passkey_cancelled');
  await api().request('passkey/auth/finish','POST',{challenge:opts.challenge,id:base64(credential.rawId),clientDataJSON:base64(credential.response.clientDataJSON),authenticatorData:base64(credential.response.authenticatorData),signature:base64(credential.response.signature)});
  await api().load();api().message(tr('Signed in securely using your device.','Συνδέθηκες με ασφάλεια μέσω της συσκευής σου.'));
 }
 async function update(){
  if(!api()?.getSignedIn()||!$('account-security-panel'))return;
  const status=await api().request('2fa/status');const panel=$('account-security-panel');
  const children=panel.querySelector('#account-security-actions');
  children.replaceChildren();
  text(children,status.enabled?tr('Email 2FA is ON. A six-digit code is required after your password.','Το email 2FA είναι ενεργό. Απαιτείται εξαψήφιος κωδικός μετά τον κωδικό πρόσβασης.'):tr('Email 2FA is OFF. Enable it to require a code for each password sign-in.','Το email 2FA είναι ανενεργό. Ενεργοποίησέ το για κωδικό σε κάθε σύνδεση με password.'));
  makeButton(children,status.enabled?tr('Disable email 2FA','Απενεργοποίηση email 2FA'):tr('Enable email 2FA','Ενεργοποίηση email 2FA'),status.enabled?disable2fa:enable2fa);
  text(children,tr('Passkeys use your device fingerprint, face unlock or screen PIN. No biometric data is stored here.','Τα passkeys χρησιμοποιούν δακτυλικό αποτύπωμα, αναγνώριση προσώπου ή PIN οθόνης. Δεν αποθηκεύουμε βιομετρικά δεδομένα.'));
  if(available())makeButton(children,tr('Add a device passkey','Προσθήκη passkey συσκευής'),registerPasskey);
  else text(children,tr('This browser does not support passkeys here. Open the secure account portal directly.','Αυτός ο browser δεν υποστηρίζει εδώ passkeys. Άνοιξε απευθείας την ασφαλή πύλη.'));
  for(const key of status.passkeys||[]){
   const row=document.createElement('div');row.className='account-toolbar';text(row,tr('Passkey created ','Passkey δημιουργήθηκε ')+key.createdAt.slice(0,10));
   makeButton(row,tr('Remove','Αφαίρεση'),async()=>{const prehash=await passwordProof();if(!prehash)return;await api().request('passkey/remove','POST',{prehash,id:key.credentialId});await update();});children.append(row);
  }
  const emailTitle=document.createElement('h3');emailTitle.textContent=tr('Change account email','Αλλαγή email λογαριασμού');children.append(emailTitle);
  text(children,tr('First you must approve the change through your current verified email. Then you must verify the new address. Your other sessions will be signed out.','Πρώτα εγκρίνεις την αλλαγή από το τωρινό επιβεβαιωμένο email. Μετά επιβεβαιώνεις τη νέα διεύθυνση. Οι υπόλοιπες συνεδρίες θα αποσυνδεθούν.'));
  const emailForm=document.createElement('form');emailForm.id='account-change-email-form';
  const emailLabel=document.createElement('label');emailLabel.textContent=tr('New email address','Νέα διεύθυνση email');
  const emailInput=document.createElement('input');emailInput.type='email';emailInput.disabled=!status.verified;emailInput.name='new-email';emailInput.required=true;emailInput.maxLength=254;emailInput.autocomplete='email';emailLabel.append(emailInput);
  const emailSend=document.createElement('button');emailSend.type='submit';emailSend.textContent=tr('Request secure email change','Αίτημα ασφαλούς αλλαγής email');emailSend.disabled=!status.verified;
  emailForm.append(emailLabel,emailSend);
  emailForm.addEventListener('submit',async event=>{
   event.preventDefault();if(!status.verified||!emailForm.reportValidity())return;
   emailSend.disabled=true;
   try{
    const prehash=await passwordProof();if(!prehash)return;
    await api().request('email/change/request','POST',{newEmail:emailInput.value.trim(),prehash,site:window.DEDSEC_ACCOUNT_CONFIG?.profile||'test'});
    emailForm.reset();api().message(tr('A confirmation link was sent to your current email. Approve it, then check your new email for the second link.','Στάλθηκε σύνδεσμος στο τωρινό email. Επιβεβαίωσέ τον και μετά έλεγξε το νέο email για δεύτερο σύνδεσμο.'));
   }catch(error){report(error);}finally{emailSend.disabled=!status.verified;}
  });
  children.append(emailForm);
  const deleteButton=$('account-delete-account');
  if(deleteButton){const danger=panel.querySelector('#account-security-danger');if(deleteButton.parentElement!==danger)danger.append(deleteButton);deleteButton.hidden=false;}
 }
 function initialize(){
  const profile=$('account-profile');
  if(!profile||$('account-security-panel'))return;
  const section=document.createElement('details');section.className='account-panel';section.id='account-security-panel';
  const summary=document.createElement('summary');summary.textContent=tr('Security, 2FA, passkeys and account deletion','Ασφάλεια, 2FA, passkeys και διαγραφή λογαριασμού');
  const actions=document.createElement('div');actions.id='account-security-actions';
  const danger=document.createElement('div');danger.id='account-security-danger';
  text(danger,tr('Deleting your account is permanent. Export your TXT notes first. Your password is required.','Η διαγραφή λογαριασμού είναι οριστική. Εξήγαγε πρώτα τα TXT σου. Απαιτείται κωδικός πρόσβασης.'));
  section.append(summary,actions,danger);profile.insertBefore(section,profile.children[1]||null);
  section.addEventListener('toggle',()=>{if(section.open)update().catch(report);});
  const login=$('account-login-panel');
  if(login&&!$('account-passkey-login')){
   const b=document.createElement('button');b.id='account-passkey-login';b.type='button';
   b.textContent=tr('Sign in with fingerprint / face / passkey','Σύνδεση με αποτύπωμα / πρόσωπο / passkey');
   b.disabled=!available();b.addEventListener('click',()=>loginPasskey().catch(report));login.append(b);
  }
  window.addEventListener('dedsec:account-state',()=>{if(section.open)update().catch(report);});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialize);else initialize();
})();

