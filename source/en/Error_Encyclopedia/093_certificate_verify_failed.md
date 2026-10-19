# TLS certificate verify failed: distinguish clock, chain and interception

## Recognize the actual failure
A certificate verification failure can mean the system clock is wrong, the trust store is stale, the server omitted an intermediate certificate, or a proxy is intercepting HTTPS. It is not safe to infer that disabling validation makes the connection trustworthy.

## Inspect safely before changing anything
~~~sh
date -u
python -c "import ssl; print(ssl.get_default_verify_paths())"
# Verify hostname and issuer using a trusted browser.
~~~

## Repair the cause rather than suppressing the warning
Check device date/time, current trust-store updates and the expected hostname/certificate issuer. In controlled environments inspect proxy configuration. Do not set PYTHONHTTPSVERIFY=0, curl -k, or git config http.sslVerify false for routine use: these disable protections against man-in-the-middle attacks.

**Reference:** https://docs.python.org/3/library/ssl.html

## Diagnose trust without disabling verification
A TLS verifier checks the certificate chain and the requested hostname against trusted certificate authorities. A wrong device clock, missing or obsolete CA bundle, intercepted traffic, a corporate proxy, or a server configuration mistake can produce similar errors. Start with:
~~~sh
date -u
python -c "import ssl; print(ssl.get_default_verify_paths())"
~~~
The first check isolates an obviously incorrect clock; the second reports the Python OpenSSL trust lookup, which is not necessarily the same source of trust as a browser on the same device.

## Keep the secure property
Do not use `verify=False`, `curl -k` or global environment overrides as a repair. Inspect the URL's hostname, system trust updates and verified organizational proxy configuration. In a controlled test, compare the same endpoint through a browser and Python and note which CA store each uses; differences suggest a client configuration issue rather than proof that the server is safe. If the certificate is wrong or untrusted, stop instead of bypassing verification.
