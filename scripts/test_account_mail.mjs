import assert from 'node:assert/strict';
import {mailConfig,deliverAccountDeleted,deliverVerification,deliverSecurityCode,deliverEmailChange} from '../account-service/mail.mjs';
const env={MAIL_PROVIDER:'brevo',MAIL_API_KEY:'fixture-only',MAIL_FROM:'DedSec Project <contact@ded-sec.space>',ACCOUNT_PUBLIC_ORIGIN:'https://accounts.example.test'};
const token='ab'.repeat(32),original=globalThis.fetch;
try{
 assert.equal(mailConfig({}),null);
 for(const origin of ['http://example.test','https://user:pass@example.test','https://example.test/path','https://example.test/?x=1','not-a-url'])assert.equal(mailConfig({...env,ACCOUNT_PUBLIC_ORIGIN:origin}),null);
 assert.equal(mailConfig({...env,MAIL_PROVIDER:'unknown'}),null);
 assert.equal(mailConfig({...env,MAIL_FROM:'Contact\r\nBcc: victim@example.test'}),null);
 let sent=null;
 globalThis.fetch=async(url,options)=>{sent={url,...options,body:JSON.parse(options.body)};return Response.json({messageId:'fixture'},{status:201});};
 assert.equal((await deliverVerification(env,'recipient@example.test',token)).status,201);
 assert.equal(sent.url,'https://api.brevo.com/v3/smtp/email');
 assert.equal(sent.headers['api-key'],'fixture-only');assert.equal(sent.headers.Authorization,undefined);
 const renamed={...env,MAIL_API_KEY:undefined,'DedSec-Project-Email':'named-test-secret'};
 assert(mailConfig(renamed));assert.equal((await deliverVerification(renamed,'recipient@example.test',token)).status,201);
 assert.equal(sent.headers['api-key'],'named-test-secret');
 await deliverVerification(env,'recipient@example.test',token);
 assert.deepEqual(sent.body.sender,{name:'DedSec Project',email:'contact@ded-sec.space'});
 assert.deepEqual(sent.body.replyTo,sent.body.sender);assert.deepEqual(sent.body.to,[{email:'recipient@example.test'}]);
 assert(sent.body.textContent.includes('https://accounts.example.test/verify?token='+token));
 assert(!JSON.stringify(sent.body).includes('gmail.com'));assert(!JSON.stringify(sent.body).includes('DedSec Test'));
 assert(sent.body.htmlContent.includes(token));
 await deliverEmailChange(env,'recipient@example.test',token,'old');assert(sent.body.textContent.includes('/change-email?stage=old&token='+token));
 await deliverEmailChange(env,'recipient@example.test',token,'new');assert(sent.body.textContent.includes('/change-email?stage=new&token='+token));
 await deliverVerification(env,'recipient@example.test',token,'main','el');
 const mainVerification=new URL(sent.body.textContent.match(/https:\/\/\S+/)[0]);assert.equal(mainVerification.searchParams.get('site'),'main');assert.equal(mainVerification.searchParams.get('lang'),'el');
 for(const step of ['old','new']){await deliverEmailChange(env,'recipient@example.test',token,step,'main');const link=new URL(sent.body.textContent.match(/https:\/\/\S+/)[0]);assert.equal(link.searchParams.get('site'),'main');assert.equal(link.searchParams.get('stage'),step);}
 await deliverSecurityCode(env,'recipient@example.test','123456');assert(sent.body.textContent.includes('123456'));assert(!sent.body.textContent.includes('/verify?token='));
 await deliverAccountDeleted(env,'recipient@example.test');assert(sent.body.subject.includes('Account deleted'));assert(!sent.body.textContent.includes(token));assert(sent.body.textContent.includes('διαγράφηκαν'));
 const legacy={MAIL_API_KEY:'legacy-fixture',MAIL_FROM:'Test <test@example.test>'};
 await deliverVerification(legacy,'recipient@example.test',token);assert.equal(sent.url,'https://api.resend.com/emails');assert.equal(sent.headers.Authorization,'Bearer legacy-fixture');
 globalThis.fetch=async()=>{throw new Error('network failure')};await assert.rejects(deliverVerification(env,'recipient@example.test',token),/network failure/);
 await assert.rejects(deliverVerification(env,'recipient@example.test','bad'),/invalid_verification_token/);
 console.log('ACCOUNT_MAIL_PASS: Brevo and legacy authentication, private sender/reply-to, configurable origin, invalid configuration and network failure. No email sent.');
}finally{globalThis.fetch=original;}

