# Unhandled Promise rejection — an async failure needs an owner

## Reproduce safely
A Promise rejection propagates until a rejection handler is attached. In browsers and Node the diagnostic and termination policy can differ with version; never depend on a global unhandled-rejection event as the ordinary recovery mechanism.

~~~javascript
async function parseRemote(load) {
  const response = await load();
  if (!response.ok) throw new Error("HTTP " + response.status);
  const payload = await response.json();
  if (!Array.isArray(payload)) throw new TypeError("expected array");
  return payload;
}
async function main() {
  try {
    return await parseRemote(async () => ({
      ok: false, status: 503, json: async () => []
    }));
  } catch (error) {
    console.assert(error.message === "HTTP 503");
    return [];
  }
}
main().then(rows => console.assert(rows.length === 0))
      .catch(error => { console.error(error); });
~~~

## Where to handle the failure
An async function returns a Promise, so surrounding its invocation with synchronous try/catch *without awaiting* will not catch a later rejection. Await inside try/catch or return a chain with .catch. Keep the error boundary near the UI, CLI, or job runner that can decide whether to retry or report failure.

## Challenge
Test a malformed JSON shape separately from a 503 response and a network-rejected load function. Ensure each leads to an expected message. Do not automatically retry a failed operation that may have already produced a non-idempotent side effect.

Reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises

## Handle failure where the Promise is owned
~~~js
async function load() { throw new Error("offline"); }
async function main() {
  try { await load(); }
  catch (error) { console.assert(error.message === "offline"); }
}
main();
~~~
A rejection can originate in an async function or a `Promise.reject`; a synchronous outer `try/catch` does not catch a failure from a Promise you neither await nor return. For concurrent tasks, `Promise.all` fails fast on a rejection while `Promise.allSettled` collects all outcomes. Choose deliberately and display a user-safe failure state, without turning every error into a silent `.catch(() => {})`.
