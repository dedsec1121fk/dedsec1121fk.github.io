# Browser security boundaries — origins, DOM text and authorization

## A static website's trust boundaries
A link or API URL is not safe just because its string begins with the expected hostname. The browser's same-origin policy compares scheme, host and port, not prefix text. The URL https://docs.example.test.evil/ is a different host, and https://docs.example.test@evil.example/ uses docs.example.test as username with evil.example as the actual host. Parse URLs before comparing origins. Even correct same-origin checks do not replace server-side authorization or input validation.

## Executable Node 18+ URL fixture
Save as origin_lab.cjs and run node origin_lab.cjs. It exercises the standard URL parser without starting a browser, making any request or executing page scripts.

~~~javascript
const assert = require('node:assert/strict');
const base = 'https://docs.example.test/';
function sameOrigin(input) {
  let url;
  try { url = new URL(input, base); }
  catch { return false; }
  return url.protocol === 'https:' &&
    url.origin === new URL(base).origin &&
    !url.username && !url.password;
}
assert(sameOrigin('/guide'));
assert(sameOrigin('https://docs.example.test/article'));
assert(!sameOrigin('https://docs.example.test.evil/'));
assert(!sameOrigin('http://docs.example.test/'));
assert(!sameOrigin('javascript:alert(1)'));
assert(!sameOrigin('https://docs.example.test@evil.example/'));
console.log('PASS: parsed origins and deceptive URLs');
~~~

## DOM and network distinctions
Use textContent for untrusted plain text; assigning it to innerHTML can turn data into HTML with active elements and event handlers. If rich HTML is unavoidable, use a vetted sanitizer and appropriate Content Security Policy; CSP helps defense-in-depth but does not eliminate the need for safe DOM construction. CORS is a browser mechanism controlling whether one origin can read specified cross-origin responses. It is not authentication, authorization, a CSRF defense, or a guarantee that a non-browser caller cannot issue the request. Cookies require appropriate SameSite, Secure and HttpOnly settings depending on the application's threat model.

## Bounded verification
1. Test an exact same-origin path, a different subdomain, a scheme downgrade and a deceptive @ URL. State each resulting parsed origin.
2. Build two elements in a disposable local HTML fixture: one inserts a sample string using textContent, the other innerHTML. Do not put attacker-controlled content on a live page; explain the difference.
3. Change the allowed base port and see why origin equality changes even with the same hostname.
4. Sketch a server route requiring user authorization. Show why setting Access-Control-Allow-Origin would not be sufficient to protect sensitive data.

**Evidence:** Node PASS, six URL cases, an explanation of XSS sink selection and a distinction between CORS and authorization. A real browser regression check is still separate.
