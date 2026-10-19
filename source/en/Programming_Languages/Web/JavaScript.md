# javascript — consolidated language guide

## JavaScript

**Typical use:** Web and typed web languages.

**Suggested file extension:** `.js`.

**How to run / environment:** node hello.js (or a browser console).

### Starter example

```
function greet(name) {
  return `Hello, ${name}!`;
}
for (const name of ["Ada", "Grace"]) console.log(greet(name));
```

### How to read it

const/let declare bindings; template strings insert values.

### Common pitfall

const/let declare bindings; template strings insert values. 

### Understand runtime boundaries and the event loop
JavaScript runs in browser and server runtimes, but available APIs differ: `document` is a browser object, while filesystem access usually comes from a server runtime. Promises settle asynchronously; `await` waits within its async function without freezing the entire event loop.
```javascript
function parseScore(text) {
  const n = Number(text);
  if (!Number.isInteger(n) || n < 0 || n > 100) throw Error("invalid score");
  return n;
}
console.assert(parseScore("42") === 42);
```
DOM text belongs in `textContent` unless trusted markup is explicitly required. Never inject untrusted text with `innerHTML`. `fetch` resolves even on HTTP 404/500; inspect `response.ok`, apply a timeout through `AbortController`, and validate parsed JSON before use. Beware `Number("") === 0`, implicit coercion and mutations shared through object references.

**Exercise:** write a local search input with a debounce timer, Escape to clear, and accessible result status; test 0 results, Unicode text and keyboard-only navigation. Official docs: https://developer.mozilla.org/en-US/docs/Web/JavaScript.

### Event-loop lab: understand what executes first

JavaScript does not execute promises synchronously as if they were normal values. Try this program in browser DevTools or a compatible JavaScript runtime:

~~~javascript
const output = [];
output.push('A');
setTimeout(() => output.push('D'), 0);
Promise.resolve().then(() => output.push('C'));
output.push('B');
setTimeout(() => console.log(output.join(',')), 20);
~~~

Predict A,B,C,D before running it. A and B are synchronous; the promise callback enters the microtask queue; the timer callback is a later task. Exact timer latency is not guaranteed, and a paused or throttled page may delay callbacks.

Then simulate an application race with two mock requests resolved in reverse order. Give each request an incrementing ID and apply a result only if its ID equals the latest request ID. This prevents an older slow search result from replacing a newer one.

When editing the DOM, prefer textContent for untrusted text. innerHTML parses markup and requires careful trust boundaries. Add a button with addEventListener instead of mixing inline handlers with generated HTML. Test keyboard accessibility and focus, not only touchscreen clicks.

**Deliverable:** the predicted output sequence, a stale-response regression test and a short explanation of why microtasks differ from timer tasks. Reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop.

## JavaScript — Expanded practice workbook

### Recognize the race
An older, slower network response may arrive after the user has entered a newer query. Debouncing input limits calls but does not enforce their order. Give each request a ticket and publish only the latest completion.

### Reproduce it without networking
Save as search.js and run node search.js. A controlled Promise makes the earlier search finish last. Expected result: latest: Beta. Predict which request is stale before running.

~~~javascript
function createSearch() {
  let newest = 0;
  return async (term, request) => {
    const ticket = ++newest;
    const rows = await request(term);
    if (ticket !== newest) return null;
    if (!Array.isArray(rows) || !rows.every(x => typeof x === "string"))
      throw TypeError("titles must be strings");
    return rows.filter(x => x.toLowerCase().includes(term.toLowerCase()));
  };
}
async function test() {
  const search = createSearch();
  let release;
  const old = search("a", () => new Promise(resolve => { release = resolve; }));
  const current = await search("be", () => Promise.resolve(["Beta", "Alpha"]));
  release(["Alpha"]);
  if (current.join(",") !== "Beta" || await old !== null) throw Error("stale data");
  console.log("latest: Beta");
}
test().catch(e => { console.error(e); process.exitCode = 1; });
~~~

### Understand the event loop
The async function returns a Promise immediately. After await, execution resumes in a microtask once its Promise resolves. Ticket comparison is about logical freshness, not wall-clock timing. Write two more tests: rapid three-request sequences and a request rejected before the newer one resolves.

### Integrate with the UI
Connect an input event listener and an aria-live status to show result counts. Use textContent for user-controlled strings; innerHTML would interpret markup. Real fetch calls should check response.ok for HTTP 404/500 and can use AbortController, but cancellation is not a substitute for the ticket check. Handle network errors only if that ticket remains current.

### Troubleshooting
document undefined means browser APIs were used in Node. If results flash and revert, log each ticket at start and completion. A rejected promise without a catch can escape a test; when integrating, catch it at the UI boundary.
Success: stale result is ignored even though it finishes last. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise

## JavaScript — Practical runnable code lab

### How to run the samples

These independent samples use the appropriate language toolchain. Representative command: `node {file}`. Replace placeholders with the actual filename, keep test data isolated, and do not interpret this as automatic installation.


## JavaScript — Focused mastery pathway

### Goal and contract
Build a paginated API reader without making network requests. Inject the transport function so tests control HTTP responses and JSON payloads. Accept only relative /api/items paths with short alphanumeric cursor tokens. Each item must have a unique ID and a string label. Reject malformed schema, HTTP failure, cycles and excessive page counts rather than returning a misleading partial result.

### Runnable exercise
Save as pages_lab.js and run node pages_lab.js with Node 18 or later. The fake transport simulates two pages and six failure paths. No browser, server or package installation is required.

~~~javascript
"use strict";
const assert = require("node:assert/strict");
const permitted = /^\/api\/items(?:\?cursor=[A-Za-z0-9_-]{1,20})?$/;

async function collect(fetchPage, start = "/api/items", maxPages = 4) {
  if (!Number.isInteger(maxPages) || maxPages < 1 || maxPages > 10)
    throw new RangeError("invalid page budget");
  const visited = new Set(), ids = new Set(), items = [];
  let next = start;
  while (next !== null) {
    if (typeof next !== "string" || !permitted.test(next))
      throw new Error("untrusted next URL");
    if (visited.has(next)) throw new Error("pagination cycle");
    if (visited.size >= maxPages) throw new Error("page budget exceeded");
    visited.add(next);
    const response = await fetchPage(next);
    if (!response || response.ok !== true || typeof response.json !== "function")
      throw new Error("HTTP failure: " + (response?.status ?? "no response"));
    const payload = await response.json();
    if (!payload || !Array.isArray(payload.items) ||
        !(payload.next === null || typeof payload.next === "string"))
      throw new Error("invalid response schema");
    for (const item of payload.items) {
      if (!item || typeof item.id !== "string" || !/^[A-Z][0-9]{1,3}$/.test(item.id) ||
          typeof item.label !== "string" || item.label.length > 80)
        throw new Error("invalid item");
      if (ids.has(item.id)) throw new Error("duplicate item id");
      ids.add(item.id);
      items.push({id: item.id, label: item.label});
    }
    next = payload.next;
  }
  return items; // No partial result escapes if a later page fails.
}

async function test() {
  const pages = {
    "/api/items": {items: [{id: "A1", label: "<b>untrusted label</b>"}],
                   next: "/api/items?cursor=two"},
    "/api/items?cursor=two": {items: [{id: "B2", label: "second"}], next: null}
  };
  const fake = async url => ({ok: true, status: 200, json: async () => pages[url]});
  assert.deepEqual((await collect(fake)).map(x => x.id), ["A1", "B2"]);
  await assert.rejects(collect(fake, "/api/items", 1), /page budget/);
  await assert.rejects(collect(async () => ({ok: false, status: 503}), "/api/items"), /503/);
  await assert.rejects(collect(async () => ({ok: true, json: async () =>
    ({items: [], next: "/api/items"})})), /pagination cycle/);
  await assert.rejects(collect(async () => ({ok: true, json: async () =>
    ({items: [], next: "https://invalid.example/"})})), /untrusted next URL/);
  await assert.rejects(collect(async () => ({ok: true, json: async () =>
    ({items: [{id: "A1", label: "x"}, {id: "A1", label: "y"}], next: null})})),
    /duplicate item id/);
  await assert.rejects(collect(async () => ({ok: true, json: async () =>
    ({items: [{id: "A1", label: 42}], next: null})})), /invalid item/);
  console.log("PASS: two pages, six failures, no network");
}
test().catch(error => {console.error(error); process.exitCode = 1;});
~~~

### Trace the trust boundary
A server response is still untrusted input: it can contain incorrect types, duplicate IDs or an unsafe next-page URL. The narrow allowlist is checked before invoking the transport, so an absolute URL cannot redirect this collector to a different host. visited catches repeated paths; maxPages also bounds an endless series of distinct cursors. The function rejects the whole collection when a later page fails, but cannot undo side effects performed by a real transport.

The first label deliberately contains HTML-looking text. In a browser, use element.textContent = item.label, not innerHTML, to display untrusted labels. These Node assertions do not prove DOM safety; that needs a browser test. This allowlist is intentionally narrower than a general URL parser and rejects fragments, alternate routes and URL-encoded cursor syntax.

### Diagnose concrete failures
1. Set maxPages to 1 and explain why a valid first page is insufficient.
2. Point the second page back to /api/items and identify the iteration that detects the cycle.
3. Return status 503, then return items: null. Distinguish HTTP failure from schema failure.
4. Duplicate an ID across two different pages. Verify the entire Promise rejects.
5. Set next to an absolute URL or a protocol-relative URL and count transport calls; neither address should be fetched.

### Follow-up lab and evidence
Implement cancellation with AbortController and a per-request timeout using a real fetch adapter. Test against a local mock HTTP server and close it after each test. Then render an accessible results list with textContent, keyboard focus and an error status region; inspect it on desktop and mobile. Record Node version, rejection messages and browser observations separately. Do not infer browser behavior from these Node assertions.

## JavaScript — Technical notes and common pitfalls

### Core knowledge

1. let and const are block-scoped, while var has function scope; const does not freeze an object.
2. Promise callbacks execute through the event loop; handle rejection and stale asynchronous results.
3. Prefer textContent for untrusted text, not assigning unchecked HTML to innerHTML.
