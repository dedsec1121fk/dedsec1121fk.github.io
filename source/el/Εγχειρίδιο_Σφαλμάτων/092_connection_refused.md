# Διαγνωστικά δικτύου: connection refused, HTTP 404 και HTTP 403

## connection refused

### Ερμηνεία και διαφορική διάγνωση
Το ECONNREFUSED σημαίνει συνήθως ότι η σύνδεση απορρίφθηκε άμεσα, συχνά επειδή δεν ακούει υπηρεσία στην επιλεγμένη θύρα. Διαφέρει από timeout (δεν έφτασε έγκαιρη απάντηση), αποτυχία DNS (δεν βρέθηκε host) και HTTP 403/404 (απάντησε κανονικά κάποιος HTTP server).

### Αναπαραγωγή / έλεγχος χωρίς απώλεια δεδομένων
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

### Ερμηνεία αποτελεσμάτων και διόρθωση
Έλεγξε ακριβώς host, port και πρωτόκολλο. Το localhost μπορεί να λυθεί σε IPv4 ή IPv6, ενώ μια υπηρεσία στο 127.0.0.1 δεν ακούει αυτόματα στο ::1 ή σε εξωτερική IP. Δοκίμασε πρώτα από τον ίδιο τον server και μετά έλεγξε firewall/routing. Το ss -ltn δείχνει listeners. Μια ανοικτή θύρα TCP δεν αποδεικνύει ότι μιλά HTTP.

### Πρακτικό εργαστήριο
Σύγκρινε τρία σενάρια: θύρα με ενεργό listener, την ίδια θύρα μετά το κλείσιμο, και μη έγκυρο hostname. Κατέγραψε σε ποιο επίπεδο αποτυγχάνει το καθένα και γιατί η απλή επανάληψη σε κλειστή θύρα δεν λύνει το πρόβλημα.

## HTTP 404

### Ερμηνεία και διαφορική διάγνωση
Το HTTP 404 σημαίνει ότι ο HTTP server ή ενδιάμεσος απάντησε αλλά δεν βρήκε, ή δεν επέλεξε να εμφανίσει, τον πόρο. Δεν είναι σφάλμα DNS, άρνηση σύνδεσης TCP ή πιστοποιητικού TLS. Σε static site συχνές αιτίες είναι κεφαλαία/πεζά ονόματος, λάθος relative URL, αρχείο που δεν δημοσιεύτηκε ή λανθασμένη ρίζα deployment.

### Αναπαραγωγή / έλεγχος χωρίς απώλεια δεδομένων
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

### Ερμηνεία αποτελεσμάτων και διόρθωση
Κατέγραψε URL, μέθοδο, status και headers χωρίς cookies ή credentials. Σε GitHub Pages έλεγξε τα πεζά/κεφαλαία και το δημοσιευμένο branch/folder· σε Cloudflare Pages εξέτασε το build output και rewrite rules. Δοκίμασε relative links και μέσα από υποσελίδες. Μην ανακατευθύνεις κάθε άγνωστο URL στην αρχική: μπορεί να δημιουργείς soft 404.

### Πρακτικό εργαστήριο
Μετέφερε το index.html σε υποφάκελο, κάλεσε και τα δύο URLs και εξήγησε τις απαντήσεις. Γράψε link checker που διαβάζει href, επιλύει relative paths και διακρίνει anchors, εξωτερικούς συνδέσμους και ανύπαρκτα τοπικά αρχεία.

## HTTP 403

### Ερμηνεία και διαφορική διάγνωση
Το HTTP 403 σημαίνει ότι ο server κατάλαβε το αίτημα αλλά αρνείται την πρόσβαση. Η επιτυχής σύνδεση χρήστη δεν εξασφαλίζει δικαίωμα σε κάθε διαδρομή ή αντικείμενο. Ορισμένες υπηρεσίες απαντούν 404 για να μην αποκαλύψουν την ύπαρξη πόρων. Το 403 μπορεί να προέρχεται από application policy, reverse proxy, CDN ή WAF.

### Αναπαραγωγή / έλεγχος χωρίς απώλεια δεδομένων
~~~sh
# Inspect response metadata for a resource you are allowed to test:
curl -i --max-time 5 https://example.com/
# For a LOCAL application in development:
# curl -i http://127.0.0.1:8000/admin
# Review status and server logs; do not paste bearer tokens.
~~~

### Ερμηνεία αποτελεσμάτων και διόρθωση
Σύγκρινε έναν εξουσιοδοτημένο δοκιμαστικό λογαριασμό με έναν χωρίς δικαιώματα, χρησιμοποιώντας συνθετικά δεδομένα. Έλεγξε server-side κανόνες για συγκεκριμένο πόρο και μέθοδο, σειρά middleware, allowlists, cookies, CSRF και δικαιώματα αρχείων ξεχωριστά. Μην κάνεις chmod 777 ή απενεργοποίηση WAF ως γρήγορη λύση. Ξεχώρισε 401 από 403.

### Πρακτικό εργαστήριο
Φτιάξε τοπικό endpoint που επιστρέφει 200 για δοκιμαστικό επιτρεπόμενο ρόλο και 403 για guest. Έλεγξε statuses και bodies χωρίς σύνδεση σε πραγματικά προστατευμένα συστήματα. Δοκίμασε άμεση πρόσβαση στο αντικείμενο ώστε να μη παρακάμπτεται ο έλεγχος του UI.
