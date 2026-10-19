# Fetch failed — separate transport rejection from HTTP status and invalid JSON

## Meaning and root cause
The browser Fetch API ordinarily fulfills its Promise after receiving a 404 or 500 HTTP response. It rejects for a network-layer failure, abort, or certain browser policies including CORS restrictions. A catch handler labeled Failed to fetch for every non-200 status confuses different root causes. CORS failures cannot be repaired by turning off browser protections or by using no-cors to gain response body access.

## Corrective approach
Build a dependency-injected config reader. It calls a supplied transport rather than making real network requests, then separately checks transport rejection, HTTP status and the expected JSON schema. The test simulates a 200 success, HTTP 404, HTTP 500, a rejected request and a malformed config value.

## Executable example
Save as fetch_lab.cjs.

~~~javascript
async function getConfig(transport) {
  let response;
  try { response = await transport('/config.json'); }
  catch (cause) { throw new Error('transport rejected', {cause}); }
  if (!response || typeof response.status !== 'number')
    throw new TypeError('invalid response object');
  if (response.status < 200 || response.status >= 300)
    throw new Error('HTTP ' + response.status);
  const data = await response.json();
  if (!data || typeof data.enabled !== 'boolean')
    throw new TypeError('invalid config JSON');
  return data.enabled;
}
async function main() {
  if (await getConfig(async () => ({status: 200, json: async () => ({enabled: true})})) !== true) throw Error();
  for (const [transport, re] of [
    [async () => ({status: 404, json: async () => ({})}), /HTTP 404/],
    [async () => ({status: 500, json: async () => ({})}), /HTTP 500/],
    [async () => { throw new TypeError('Failed to fetch'); }, /transport rejected/],
    [async () => ({status: 200, json: async () => ({enabled: 'yes'})}), /invalid config/],
  ]) {
    try { await getConfig(transport); throw Error('invalid response accepted'); }
    catch (error) { if (!re.test(error.message)) throw error; }
  }
  console.log('PASS: resolved HTTP failures, rejected network and schema mismatch');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
~~~

## Why this is different
The mock uses an object with a numeric status property; in a browser production fetch, prefer response.ok and response.status, then confirm the response Content-Type and parse/validate the body. The example deliberately does not simulate a browser's CORS enforcement. An AbortError must usually be handled separately from a broken network connection, because user cancellation is not necessarily a fault.

## Exact validation
Save as fetch_lab.cjs and run node fetch_lab.cjs with Node 18+. Expected output PASS. No requests leave the machine, and this laboratory does not assume an actual local HTTP server is running.

## Guided experiments
With your own disposable local server, request a missing path and inspect the actual fulfilled Response rather than claiming fetch rejected. Inspect DevTools Network and Console for CORS, mixed-content restrictions and redirects. Do not add mode:no-cors as a 'fix': the opaque response will not reveal protected contents.

**Reference:** https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch
