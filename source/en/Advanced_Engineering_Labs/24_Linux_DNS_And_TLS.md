# A failed HTTPS download has multiple possible causes

## Test in layers, without bypassing certificates
Check whether the host name resolves, then whether a TCP connection can be made, then whether TLS validates the intended endpoint. An HTTP 404 or 403 means a server responded; it is not the same as a DNS failure. A proxy can change both the destination and certificate chain. Record the target host, timestamp and whether the failure affects one host or all destinations.

~~~sh
getent hosts example.org
ip route get 1.1.1.1 2>/dev/null || true
curl -I --connect-timeout 5 --max-time 12 https://example.org/
# Report proxy variable names only; use the Python check below.
~~~

## Interpret the evidence
DNS resolution with a failed route suggests connectivity or firewall issues. TCP connectivity with an unknown certificate authority points toward the trust store, a legitimate enterprise interception proxy or a misconfigured server. Clock drift can make valid certificates appear expired or not yet valid. Never use `curl -k` as a permanent fix: it suppresses the identity check that protects the connection.

## Compare controlled cases
Use a known public documentation host and your target host; if only one fails, examine destination-specific conditions before changing global DNS. Run a minimal `curl -I` rather than downloading unknown binaries. A 301 redirect is a normal HTTP outcome; follow the full chain only when you can inspect its destinations and policies.

## Verification record
Write down the resolved address, selected network interface, status or TLS diagnostic, certificate hostname and tool versions. The remediation could be a corrected URL, authorized proxy configuration, a synchronized clock or repaired CA bundle. Do not embed personal proxy credentials in a shared diagnostic report.

## Interpret exit status separately from HTTP status
With its default options, curl can finish a transfer successfully even when the server returns HTTP 404. The process exit status describes transfer/tool success; the HTTP response code describes the application response. Use `curl -I --connect-timeout 5 --max-time 12 --write-out '\nHTTP=%{http_code}\n' https://example.org/` to keep both visible. HEAD support varies; a server rejecting HEAD does not prove that GET is broken. Do not use that example to send requests to an arbitrary private target.

## Report proxy presence without printing credentials
Proxy URLs can contain passwords. Replace a complete environment dump with a name-only check:
~~~python
import os
for name in ('http_proxy', 'https_proxy', 'all_proxy', 'no_proxy',
             'HTTP_PROXY', 'HTTPS_PROXY', 'ALL_PROXY', 'NO_PROXY'):
    print(name, 'set' if os.environ.get(name) else 'unset')
~~~
This intentionally withholds proxy addresses and bypass lists. Review those values locally only if necessary. A proxy may resolve the destination itself, so local DNS success and proxy-side name resolution are not equivalent observations.

## Distinguish the failed layer
Record the first error: name lookup, connect timeout, connection refusal, TLS verification or HTTP status. A refusal can be produced by an endpoint or an intermediary; it does not identify the remote application's condition on its own. Certificate failures need the expected hostname, accurate device clock and intended trust chain. Do not disable verification to make the diagnostic look successful.

Tool reference: [curl manual](https://curl.se/docs/manpage.html).
