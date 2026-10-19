# A resolved fetch promise is not always an HTTP success

## Model transport and application failures separately
`fetch()` rejects for certain network or abort failures, but a 404 or 500 HTTP response usually fulfills the promise with `ok === false`. Always check status before assuming valid application data. A timeout should abort the request and its resources; adding a timer without an AbortController can leave unwanted work running.

~~~javascript
async function getJSON(url, ms = 3000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const response = await fetch(url, {signal: controller.signal});
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}
~~~

## Classify a failure correctly
A JSON parse error means the response bytes were not accepted as JSON; it is different from an HTTP 503. Aborts, offline status and DNS failures may present different exceptions across browsers. Do not catch every exception and return an empty object, because that turns a temporary outage into misleading “no results.” Handle a cancellation initiated by the user differently from a retryable server error.

## Create a local deterministic server fixture
Provide `/ok` returning JSON, `/missing` returning 404 and `/slow` delaying beyond the timeout in a test server you control. Record three outcomes: object result, explicit HTTP error, and aborted fetch. Compare what the browser Network panel shows with the application's error message. Never use a public service as a repeated delay test without permission.

## Retry boundaries
GET requests are commonly repeatable, but requests with side effects need idempotency and deduplication by the server before automatic retries. Use bounded retry counts and backoff; an unlimited retry loop can amplify an outage. Add telemetry only if it avoids exposing URL query secrets or user-provided private data.
## Cancellation ownership and response-body completion

A fetch promise can resolve after response headers arrive while the body is still streaming. If a timeout is cleared immediately after fetch resolves, a later body read can remain unbounded. Keep the cancellation owner alive until the required body operation finishes. Also distinguish a rejected transport promise from an HTTP error response: a 404 is still an HTTP response that needs an explicit status decision.

Cancellation should propagate from the feature that owns the request. Replacing a search query should cancel the obsolete request, but an old rejection must not erase the newer result. The local fixture demonstrates ownership state without contacting a server.

```javascript
let current = 0;
function begin() { const version = ++current; return value => version === current ? value : null; }
const oldResult = begin();
const newResult = begin();
if (oldResult("old") !== null || newResult("new") !== "new") throw Error("stale result accepted");
const controller = new AbortController();
controller.abort();
if (!controller.signal.aborted) throw Error("cancellation not observable");
console.log("stale response ignored");
```

For the real client, test cancellation during headers and during body consumption separately. Bound decoded response size as well as elapsed time. A timeout does not undo a server-side write; retrying a cancelled write requires the same idempotency analysis as any uncertain response.

[Technical reference](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
