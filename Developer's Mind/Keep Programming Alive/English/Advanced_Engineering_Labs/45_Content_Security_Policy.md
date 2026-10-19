# Content Security Policy rollout with report-only evidence

## Mechanism and contract

A Content Security Policy tells a browser which resource and execution sources a document permits. It complements correct output encoding; it cannot make unsafe HTML insertion correct. Starting with an enforcing policy copied from another site can break scripts, fonts or embedded media without revealing which dependency was actually required.

Inventory resource types first and test a report-only response header on a controlled deployment. Inspect violations, remove accidental inline execution and narrow each directive. A static host may support response headers through configuration; an HTML meta policy has limitations and is not a substitute for all header directives. The example is a response-header design for a small self-hosted site, not a command to paste into the terminal.

## Worked local example

```http
Content-Security-Policy-Report-Only: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'

# Configure a suitable reporting endpoint separately when supported.
# Move to Content-Security-Policy only after testing actual page behavior.
```

## Failure checks and limits

Test theme and language switches, lesson links, keyboard navigation and code copying under the candidate policy. Report-only does not block violations, so a clean visual page is not proof of enforcement. Reports may contain sensitive URLs; minimize collected data and retention. Do not add unsafe-inline or a wildcard merely to silence every report without understanding the source.

## Primary reference

[Official documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy)
