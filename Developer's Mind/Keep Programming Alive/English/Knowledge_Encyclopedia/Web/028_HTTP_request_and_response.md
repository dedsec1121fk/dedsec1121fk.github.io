# Web platform fundamentals: protocols, accessibility and async state

## HTTP request and response

### Practical explanation
An HTTP request has a method, target and headers, while a response carries a status and headers followed by a body when appropriate. Successful TCP transport does not imply HTTP 2xx.

### Worked illustration
~~~http
GET /health HTTP/1.1
Host: example.test
Accept: application/json

HTTP/1.1 200 OK
Content-Type: application/json

{"ok":true}
~~~

### Realistic exercise
Compare status 200, 404 and 503. Describe whether each should be retried and how the client checks Content-Type before attempting JSON parsing.

### Review the actual contract
Describe how a caller can distinguish valid behavior for HTTP request and response from a silent failure. Check both a normal input and a boundary input, recording the source version and observed result.

## REST and resource modeling

### Practical explanation
A resource-oriented API uses stable identifiers and HTTP method semantics. GET should be safe, PUT is idempotent by definition when properly implemented, while repeated POST can create duplicate resources.

### Worked illustration
~~~http
GET /tasks/5 HTTP/1.1
Host: example.test

PUT /tasks/5 HTTP/1.1
Host: example.test
Content-Type: application/json

{"title":"Ready"}
~~~

### Realistic exercise
Design a 404 response for missing task 5 and test repeated identical PUTs. Explain how URI identifies a resource independent of its representation.

### Review the actual contract
Describe how a caller can distinguish valid behavior for REST and resource modeling from a silent failure. Check both a normal input and a boundary input, recording the source version and observed result.

## Caching and freshness

### Problem and mental model
Freshness and storage lifetime are different. Cache-Control: max-age=60 permits a cached representation to be reused while fresh; once stale, an If-None-Match request can ask whether the ETag changed. An HTTP 304 reuses the existing body under cache rules; a changed representation returns a fresh 200.

### Reproducible illustration
~~~http
HTTP/1.1 200 OK
Cache-Control: public, max-age=60
ETag: "guide-v1"

GET /guide HTTP/1.1
If-None-Match: "guide-v1"
~~~

### Independent validation
Draw a timeline: at t=0 the 200 is cached; at t=30 it can be reused without revalidation; at t=61 a conditional request checks the origin. Test both a 304 and updated 200. Never publicly cache private account responses; compare private, no-store, and Vary.

**Authoritative documentation:** https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching

## HTML accessibility

### Practical explanation
Accessible HTML communicates roles and labels through semantics: a button is interactive, a heading structures content and a label names a form control. Visual appearance alone is insufficient.

### Worked illustration
~~~html
<label for="search">Search lessons</label>
<input id="search" type="search">
<button type="button">Open results</button>
~~~

### Realistic exercise
Navigate only with a keyboard, verify focus order and run a screen-reader check. Replace button with div and explain what keyboard behavior is lost.

### Review the actual contract
Describe how a caller can distinguish valid behavior for HTML accessibility from a silent failure. Check both a normal input and a boundary input, recording the source version and observed result.

## JavaScript events and asynchronous state

### Practical explanation
Event handlers can initiate asynchronous work whose results arrive out of order. Assign an increasing request ID to prevent an old response from overwriting a newer search result.

### Worked illustration
~~~javascript
let latest=0;
async function search(term,fetchRows){
  const ticket=++latest;
  const rows=await fetchRows(term);
  return ticket===latest?rows:null;
}
~~~

### Realistic exercise
Create two controlled Promises, resolve the newer request first and prove the older result is ignored. Distinguish debounce from stale-result cancellation.

### Review the actual contract
Describe how a caller can distinguish valid behavior for JavaScript events and asynchronous state from a silent failure. Check both a normal input and a boundary input, recording the source version and observed result.
