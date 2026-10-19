# Πελάτης HTTP — επιτρεπόμενες διαδρομές και έλεγχος αποκρίσεων

## Σενάριο και κριτήρια επιτυχίας
Ένας δοκιμαστικός αναγνώστης API επιτρέπεται να ζητά μόνο GET /api/items. Δεν δέχεται αυθαίρετους εξωτερικούς διακομιστές, παραμέτρους URL, ανακατευθύνσεις ή υπερβολικά μεγάλα σώματα απάντησης. Η σωστή απόκριση έχει κατάσταση 200, τύπο application/json και αντικείμενο JSON με έναν πίνακα items που περιέχει έως τέσσερις σύντομες συμβολοσειρές. Η συνάρτηση μεταφοράς δίνεται ως παράμετρος, επομένως δεν χρειάζεται σύνδεση δικτύου.

## Εκτελέσιμο εργαστήριο — ενσωματωμένη βιβλιοθήκη Python 3
Αποθήκευσε τον κώδικα ως `08_http.py` και εκτέλεσέ τον με Python 3. Χρησιμοποιεί μόνο τεχνητά δεδομένα και εμφανίζει PASS αν περάσουν οι έλεγχοι. Ο κώδικας είναι ίδιος και στις δύο γλωσσικές εκδόσεις.

~~~python
import json
from urllib.parse import urlsplit
def read_page(path, transport):
    p = urlsplit(path)
    if (p.scheme or p.netloc or p.fragment or p.query or
            p.path != "/api/items"):
        raise ValueError("only /api/items is permitted")
    status, media, body = transport(path)
    if status != 200:
        raise RuntimeError("unexpected status")
    if media.split(";")[0].strip().lower() != "application/json":
        raise ValueError("unexpected content type")
    if not isinstance(body, bytes) or len(body) > 256:
        raise ValueError("payload too large or not bytes")
    obj = json.loads(body.decode("utf-8"))
    if not isinstance(obj, dict) or set(obj) != {"items"}:
        raise ValueError("invalid schema")
    if not isinstance(obj["items"], list) or len(obj["items"]) > 4:
        raise ValueError("too many items")
    if not all(type(v) is str and len(v) <= 32 for v in obj["items"]):
        raise ValueError("invalid item")
    return obj["items"]
fetch = lambda _: (200, "application/json; charset=utf-8", b'{"items":["a","b"]}')
assert read_page("/api/items", fetch) == ["a", "b"]
for bad in ("https://bad.site/api/items", "//bad.site/api/items",
            "/api/items?token=secret", "/api/items/../items"):
    try: read_page(bad, fetch)
    except ValueError: pass
    else: raise AssertionError("unsafe path accepted")
print("PASS HTTP response contract")
~~~

## Τεχνική εξήγηση
Η ανάλυση URL από μόνη της δεν παρέχει εξουσιοδότηση. Εδώ επιτρέπουμε μία ακριβή διαδρομή αφού επιβεβαιώσουμε ότι λείπουν σχήμα, εξωτερικός διακομιστής, τμήμα και ερώτημα. Έλεγξε κατάσταση, τύπο περιεχομένου και μήκος πριν από την αποκωδικοποίηση και έπειτα επικύρωσε τα δεδομένα JSON. Σε πραγματική δικτυακή σύνδεση το όριο byte πρέπει να εφαρμόζεται κατά τη λήψη, όχι αφού κατέβει ανεξέλεγκτα όλο το σώμα. Όρια χρόνου και πολιτική ανακατευθύνσεων ελέγχονται στον μηχανισμό μεταφοράς.

## Περιορισμένες ασκήσεις
Δώσε τεχνητά απάντηση 404, text/html, κομμένο JSON, πέντε στοιχεία, αριθμό αντί κειμένου και σώμα πάνω από 256 byte. Σημείωσε το σφάλμα της κάθε περίπτωσης. Αν προσθέσεις σελιδοποίηση, περιόρισε τις σελίδες και απόρριψε επαναλαμβανόμενους δείκτες. Κάνε επανάληψη μόνο σε ασφαλή GET και τεκμηριωμένα παροδικά σφάλματα· μην επαναλαμβάνεις απρόσεκτα POST που μεταβάλλει δεδομένα.

## Διάγνωση και τεκμήρια επιτυχίας
Αν η διαδρομή οδηγεί σε άγνωστο διακομιστή, απόρριψέ την πριν κληθεί η μεταφορά. Ξεχώρισε άκυρο JSON από JSON με λάθος δομή. Για δοκιμές ανακατεύθυνσης χρησιμοποίησε μόνο δικό σου τοπικό διακομιστή, αφού ορισμένοι πελάτες ακολουθούν αυτόματα νέα URL.
