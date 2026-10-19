# Network diagnostics: connection refused, HTTP 404 and HTTP 403

## connection refused

### Meaning and differential diagnosis
ECONNREFUSED normally means an address was reached but the connection was actively rejected, often because no process listens on the target port. It differs from a timeout (no timely response), name-resolution failure (host cannot be resolved) and HTTP 403/404 (a server responded at the application layer).

### Reproduction / nondestructive inspection
~~~python
import socket
listener = socket.socket()
listener.bind(("127.0.0.1", 0))
port = listener.getsockname()[1]
listener.listen(1)
with socket.create_connection(("127.0.0.1", port), timeout=1):
    pass  # Success: listener exists.
listener.close()
# Connecting now normally raises ConnectionRefusedError.
try:
    with socket.create_connection(("127.0.0.1", port), timeout=1):
        pass
except ConnectionRefusedError:
    print("connection refused as expected")
~~~

### Interpret evidence and fix the cause
Check the exact host, port and protocol. If using localhost, verify IPv4 versus IPv6 resolution; a process bound to 127.0.0.1 need not listen on ::1 or on a LAN address. Test locally on the server before checking firewall and network routes. Use ss -ltn for listener state. An HTTP URL in a browser requires an HTTP server, not just any open TCP socket.

### Practical lab
Compare three fixtures: local port with a live listener, local port after closing it, and an intentionally invalid host name. Record which layer produces the failure and why retrying an unchanged refused port rarely helps.

## HTTP 404

### Meaning and differential diagnosis
HTTP 404 means an HTTP server or intermediary did respond but could not (or chose not to) expose a representation for the target resource. It is distinct from DNS failure, refused TCP connection and TLS verification errors. A 404 on a static site can be caused by filename case, bad relative URLs, a missing build artifact or an incorrect publishing root.

### Reproduction / nondestructive inspection
~~~sh
# From a directory of harmless sample files:
mkdir -p /tmp/dedsec-404-lab
printf 'ok\n' > /tmp/dedsec-404-lab/index.html
# Terminal A:
# python3 -m http.server 8765 --bind 127.0.0.1 --directory /tmp/dedsec-404-lab
# Terminal B:
# curl -i http://127.0.0.1:8765/index.html   # 200
# curl -i http://127.0.0.1:8765/missing.txt  # 404
~~~

### Interpret evidence and fix the cause
Capture requested URL, method, response status and headers without leaking cookies or credentials. For GitHub Pages, check path case and the deployed branch/folder; for Cloudflare Pages, inspect generated output and rewrite rules. Check that relative paths work from nested pages, not only from /. Do not blindly redirect every missing page to the homepage: this can create misleading soft 404s.

### Practical lab
Move index.html into a nested subdirectory, request both paths, and explain the results. Write a link checker that walks local HTML href values, resolves relative paths and distinguishes anchors, remote URLs and missing local targets.

## HTTP 403

### Meaning and differential diagnosis
HTTP 403 indicates that a server understood the request but refuses to authorize it. A valid login does not necessarily grant access to a particular path, organization resource or object. Some services use 404 instead to avoid disclosing object existence. A 403 may originate from an application policy, reverse proxy, CDN or WAF.

### Reproduction / nondestructive inspection
~~~sh
# Inspect response metadata for a resource you are allowed to test:
curl -i --max-time 5 https://example.com/
# For a LOCAL application in development:
# curl -i http://127.0.0.1:8000/admin
# Review status and server logs; do not paste bearer tokens.
~~~

### Interpret evidence and fix the cause
Compare a permitted account and a deliberately unauthorized test account, using synthetic fixtures. Inspect server-side authorization for the exact resource and HTTP method; check middleware order, allowlists, cookies, CSRF requirements and file/server permissions separately. A temporary chmod 777 or disabling the WAF is not a safe diagnosis. Distinguish 401 (authentication required) from 403 (access refused).

### Practical lab
Create a local route that returns 200 to a test role and 403 to a guest, then assert both HTTP statuses and response bodies without connecting to real protected systems. Test direct object access so an unauthorized user cannot bypass the UI check.
