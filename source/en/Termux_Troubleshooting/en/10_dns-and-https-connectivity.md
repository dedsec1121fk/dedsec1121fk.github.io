# Termux network faults: separate name resolution, TCP, TLS and HTTP

## What causes the failure
A URL request passes through several independent stages: DNS resolution, TCP connection, TLS certificate verification and HTTP exchange. “Unable to connect” is not one diagnosis. A DNS failure must be handled differently from a refused local port, certificate expiration or an HTTP 404 response. Android private DNS, VPN and Wi-Fi captive portals may affect these stages.

## Controlled diagnostic commands
Commands are diagnostics or labeled examples. Verify paths and preserve data before making changes.
~~~sh
python -c 'import socket; print(socket.getaddrinfo("example.com", 443)[:1])'
curl -I --max-time 8 https://example.com/
date -u
# Linux tools, if installed:
# getent ahosts example.com
# curl -v --max-time 8 https://example.com/ 2>&1
~~~

## Repair in evidence-based order
Check the first failing stage and compare the same host on another authorized network if safe. Use the configured network or DNS settings rather than deleting system files. For TLS verify device date/time, the certificate chain and whether an interception proxy is expected. Do not use curl -k as a permanent workaround, and do not disable certificate verification in code. An HTTP 404 or 403 proves an HTTP response arrived; fix the URL or permissions accordingly.

## Hands-on exercise
Create a local Python HTTP server, request an existing and missing path, and compare status codes. Stop the server and repeat to observe connection refusal. Separately test an intentionally nonexistent domain and record why it fails before TCP.
