# JavaScript promises and race conditions

## What is happening
A promise resolves later; code after calling an async function may run before its result is available. Track loading, success, cancellation and failure as explicit states.

## Practical investigation
Use AbortController to cancel obsolete network requests when a user changes a search query. Include a request identifier so an old response cannot overwrite newer results.

## Common traps
Always handle rejection and restore the UI in finally. A network timeout and a JSON parsing error need different troubleshooting messages.

## Adaptable demonstration
```text
node --check app.js
```

## Prove that the latest request owns the result
~~~javascript
let current = 0;
let displayed = null;
function begin() { return ++current; }
function finish(id, value) {
  if (id === current) displayed = value;
}
const old = begin();
const latest = begin();
finish(latest, 'new result');
finish(old, 'stale result');
if (displayed !== 'new result') throw new Error('stale overwrite');
~~~
This deterministic fixture reverses completion order without networking or timers. Cancellation can save work, but the request ID also protects against a response already queued when cancellation occurs. In real code, guard loading/error updates as well as the final data assignment: an obsolete finally block must not hide the spinner of a newer request.

An async function returns a promise even if it returns an ordinary value. A caller that forgets await may accidentally render the promise object. Separate a parse rejection from an HTTP response with an error status; fetch does not reject solely because HTTP is 404. Keep that distinction in the user-visible state machine.
