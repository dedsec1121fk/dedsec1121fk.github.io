# Handling API rate limits and cached fallbacks

## What is happening
An HTTP 403 response may mean a denied permission or an exhausted rate limit. Read the response headers before deciding when a retry is appropriate.

## Practical investigation
Use exponential backoff only for transient failures, bounded by a maximum number of attempts. Do not retry invalid credentials or malformed queries indefinitely.

## Common traps
A dated static JSON snapshot is useful offline. Label it as cached; do not claim it is a live result or silently substitute unrelated search results.

## Adaptable demonstration
```text
curl -I https://api.github.com/rate_limit
```

## Build a decision table rather than retrying every 403
Use synthetic responses: 200 with valid data, 200 with invalid JSON, 401, 403 with a rate-limit indication, 429 with Retry-After, and 503. Parsing failures need a schema/data error. Invalid authentication needs corrected credentials. A temporary limit needs a bounded delay; a permission denial needs a policy decision. A single status value does not explain all of these.

Record the next permitted attempt as a time or bounded delay and cap the total retry budget. Honor applicable Retry-After/reset guidance rather than adding jitter to an already specified wait arbitrarily. Inject a clock in tests so waiting does not slow the suite. Never log authorization headers.

Cache the query, source and generation time alongside results. If a refresh fails, the UI should identify the older snapshot and preserve the original query context. Test an empty valid result separately from an unavailable result. They should not both become a card claiming that nothing exists.
