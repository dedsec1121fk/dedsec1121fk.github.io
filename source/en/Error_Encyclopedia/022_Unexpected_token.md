# JavaScript Unexpected token — distinguish syntax, JSON and an HTML error page

## Meaning and root cause
An Unexpected token error is a parser failure, but you must identify which parser rejected the input. A JavaScript syntax error in a source module is not the same as a JSON.parse failure on a server response. JSON has a stricter grammar than JavaScript: it cannot contain trailing commas, comments or unquoted object keys. A server returning HTML on a 404 path may begin with '<' and yield a confusing JSON parsing error.

## Corrective approach
The parsePayload function checks a JSON Content-Type before attempting JSON.parse, then wraps only the parse failure with a meaningful error and cause. It demonstrates valid JSON, a trailing comma, HTML with a mismatched MIME type and malformed JSON. It does not require access to an actual server.

## Executable example
Save as unexpected_lab.cjs.

~~~javascript
function parsePayload(body, contentType) {
  if (!/^application\/json(?:\s*;|\s*$)/i.test(contentType || ''))
    throw new TypeError('expected JSON content type');
  try { return JSON.parse(body); }
  catch (cause) { throw new SyntaxError('invalid response JSON', {cause}); }
}
const ok = parsePayload('{"ready":true}', 'application/json; charset=utf-8');
if (ok.ready !== true) throw Error('wrong parsed value');
for (const [body, mime, expected] of [
  ['{"ready":true,}', 'application/json', SyntaxError],
  ['<html>oops</html>', 'text/html', TypeError],
  ['not json', 'application/json', SyntaxError],
]) {
  try { parsePayload(body, mime); throw Error('malformed response accepted'); }
  catch (error) { if (!(error instanceof expected)) throw error; }
}
console.log('PASS: valid JSON, trailing comma, wrong MIME, malformed JSON');
~~~

## Why this is different
The MIME check is a simplified application/json contract for this exercise; production APIs may also accept media types ending in +json after explicitly agreeing to support them. A valid MIME value does not guarantee a valid payload, and a successful parse does not guarantee an expected business schema. Check response.ok and status before reading the body, then validate its shape.

## Exact validation
Save as unexpected_lab.cjs and run node unexpected_lab.cjs. A Node 18+ runtime supports Error options with cause. The output should be PASS. For source-code syntax errors, run node --check example.js on a disposable file to distinguish static syntax checks from runtime JSON.parse.

## Guided experiments
Temporarily change the valid fixture to an unquoted key, comment or trailing comma and capture which parser rejects it. Emulate an HTML error response from your own mock instead of accessing public websites. Do not use eval to parse JSON and do not suppress parse errors with catch that returns an empty but misleading object.

**Reference:** https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse
