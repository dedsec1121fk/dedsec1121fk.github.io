# Δίκτυο Termux: ξεχώρισε DNS, TCP, TLS και HTTP

## Γιατί συμβαίνει
Ένα HTTPS αίτημα περνά από διακριτά στάδια: DNS, σύνδεση TCP, πιστοποιητικό TLS και HTTP. Το «δεν συνδέεται» δεν αποτελεί μία διάγνωση. Αποτυχία DNS, κλειστή θύρα, ληγμένο πιστοποιητικό και HTTP 404 χρειάζονται διαφορετική λύση. Android Private DNS, VPN και captive portals μπορούν να επηρεάσουν τη σύνδεση.

## Ελεγχόμενες εντολές διάγνωσης

~~~sh
python -c 'import socket; print(socket.getaddrinfo("example.com", 443)[:1])'
curl -I --max-time 8 https://example.com/
date -u
# Linux tools, if installed:
# getent ahosts example.com
# curl -v --max-time 8 https://example.com/ 2>&1
~~~

## Ασφαλής πορεία διόρθωσης
Βρες πρώτα σε ποιο στάδιο αποτυγχάνει. Αν είναι ασφαλές, σύγκρινε τον ίδιο host σε δεύτερο δίκτυο. Χρησιμοποίησε τις κανονικές Android/DNS ρυθμίσεις αντί να σβήνεις αρχεία συστήματος. Σε TLS έλεγξε ημερομηνία, certificate chain και πιθανό proxy. Μην αφήνεις curl -k ως μόνιμη λύση. Το HTTP 404/403 σημαίνει ότι έφτασε απάντηση server· έλεγξε URL/permissions.

## Πρακτικό εργαστήριο
Ξεκίνα τοπικό Python HTTP server και ζήτησε υπαρκτή και ανύπαρκτη διαδρομή. Σύγκρινε status codes. Σταμάτησε τον server και παρατήρησε connection refused. Ξεχωριστά δοκίμασε ανύπαρκτο domain και κατέγραψε γιατί η αποτυχία προηγείται του TCP.
