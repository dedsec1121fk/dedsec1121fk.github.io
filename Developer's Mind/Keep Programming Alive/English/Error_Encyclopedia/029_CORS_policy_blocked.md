# CORS policy blocked — browser origin boundaries

## Interpret the browser message
CORS is enforced by browsers on cross-origin requests. A response may succeed on the network yet be unavailable to page JavaScript because it lacks an appropriate Access-Control-Allow-Origin header. A preflight OPTIONS request may also fail before the intended method is sent.

## A controlled local example
Imagine a page at https://app.example.test attempting to fetch https://api.example.test/data. The API controls the response headers, not the calling JavaScript. For a non-credentialed allowlist policy, the API could return:

~~~http
HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://app.example.test
Vary: Origin
Content-Type: application/json

{"ok":true}
~~~

## Do not 'fix' the browser by removing security
Setting fetch mode: "no-cors" usually yields an opaque response the page cannot inspect; it does not grant permission to read the response body. When cookies or other credentialed requests are used, wildcard Access-Control-Allow-Origin cannot be combined with credential support. Carefully configure explicit allowed origins and appropriate Access-Control-Allow-Credentials only where needed.

## Lab
Use browser Network/Console panels to inspect the request Origin, preflight OPTIONS, response headers, status and redirects. Compare GET without custom headers versus POST with Content-Type: application/json, which generally triggers preflight. Test an unauthorized origin; it must not gain readable access. Requests from curl are not subject to browser CORS enforcement and therefore cannot prove that a browser page is allowed.

Reference: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS

## Identify the browser-side security boundary
CORS is a browser enforcement policy for cross-origin reads, not a network firewall and not a way to protect an API from non-browser clients. Inspect the actual `Origin`, request method and response `Access-Control-Allow-Origin`. A preflight `OPTIONS` may be required when a request uses non-safelisted headers or methods. Test a simple GET and a request with a custom header. Never set `Access-Control-Allow-Origin: *` together with credentialed browser requests; the browser rejects that combination. Fix the trusted server policy, not the browser's security settings.
