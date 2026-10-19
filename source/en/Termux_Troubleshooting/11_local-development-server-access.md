# Local web server: bind addresses, ports and Android browser access

## Cause and symptoms
A service listening on 127.0.0.1 is generally reachable only from the same device's loopback interface. A browser on another device cannot reach it through the phone's LAN IP unless the server binds appropriately and the network permits traffic. The browser URL must use the server's actual port and protocol; HTTPS is not automatically enabled by an HTTP development server.

## Reproduction and diagnostic commands
Use a disposable test environment and confirm paths before modifying files.
~~~sh
mkdir -p "$HOME/www-lab"
printf 'hello from Termux\n' > "$HOME/www-lab/index.html"
python -m http.server 8765 --bind 127.0.0.1 --directory "$HOME/www-lab"
# In another Termux session:
# curl -i http://127.0.0.1:8765/index.html
# Stop the demo server with Ctrl+C when finished.
~~~

## Evidence-based repair
Verify the process is running and the listener address using ss -ltn where available. Compare 127.0.0.1, localhost and your network address; IPv6 ::1 can differ. For access from another device, prefer authenticated, encrypted publishing tools and expose only intended test content. Never bind an unauthenticated development console to 0.0.0.0 on an untrusted network.

## Hands-on lab
Request an existing and missing page from the same phone, record 200 and 404, then stop the server and observe connection refused. Compare this with an incorrect HTTPS scheme on the plain HTTP test port.
