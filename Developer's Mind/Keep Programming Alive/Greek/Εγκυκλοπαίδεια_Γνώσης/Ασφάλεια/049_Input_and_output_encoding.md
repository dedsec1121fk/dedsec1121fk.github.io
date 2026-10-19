# Κωδικοποίηση εισόδου, αποθήκευση κωδικών και δικαιώματα

## Έλεγχος εισόδου και κωδικοποίηση εξόδου

**Κατηγορία:** Ασφάλεια

### Βασική γνώση

Έλεγξε εξωτερικά δεδομένα σύμφωνα με τους κανόνες και κωδικοποίησε κατάλληλα για τον προορισμό: HTML, attributes, JavaScript, shell ή SQL έχουν διαφορετικούς κινδύνους.

### Πρακτική εφαρμογή

Εξήγησε γιατί HTML escaping δεν προστατεύει μια εντολή shell.

### Συγκεκριμένο όριο εμπιστοσύνης
Validation και output encoding δεν είναι ίδια εργασία. Έλεγξε input με domain rules και έπειτα κάνε escaping για το destination context: HTML text/attribute, URL, JavaScript και SQL έχουν διαφορετικούς κανόνες. Αφαίρεση όλων των brackets αλλοιώνει νόμιμα δεδομένα.

### Ελεγχόμενο παράδειγμα
```python
from html import escape
value='<script>alert(1)</script>'
safe=escape(value,quote=True)
assert '&lt;script&gt;' in safe
assert '<script>' not in safe
```

### Εργαστήριο επαλήθευσης
Εμφάνισε αποτέλεσμα ως HTML text, όχι markup. Σε SQL χρησιμοποίησε bound parameters και σε DOM textContent αντί innerHTML. Εξήγησε γιατί ο προορισμός καθορίζει το encoding.

**Πηγή:** https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html

## Ασφαλής αποθήκευση κωδικών

**Κατηγορία:** Ασφάλεια

### Βασική γνώση

Οι κωδικοί πρέπει να κατακερματίζονται με σύγχρονο, αργό αλγόριθμο ειδικό για passwords και μοναδικό salt. Το απλό SHA-256 δεν είναι κατάλληλο για αποθήκευση κωδικών.

### Πρακτική εφαρμογή

Εντόπισε τι δεν πρέπει ποτέ να εμφανίζεται σε logs σχετικούς με passwords.

### Συγκεκριμένο όριο εμπιστοσύνης
Μη φυλάσσεις plaintext passwords ούτε σκέτο γρήγορο SHA-256 για passwords. Χρησιμοποίησε password-hashing scheme με τυχαίο salt και κόστος, κατά προτίμηση audited framework. Ο έλεγχος χρειάζεται constant-time σύγκριση και rate limit απόπειρων.

### Ελεγχόμενο παράδειγμα
```python
import os,hashlib,hmac
salt=os.urandom(16)
password=b'test-only-passphrase'
digest=hashlib.scrypt(password,salt=salt,n=2**14,r=8,p=1)
check=hashlib.scrypt(password,salt=salt,n=2**14,r=8,p=1)
assert hmac.compare_digest(digest,check)
```

### Εργαστήριο επαλήθευσης
Δοκίμασε δύο salts στο ίδιο password και επαλήθευσε διαφορετικό hash. Φύλαξε algorithm/salt/cost μαζί με verifier, όχι plaintext. Δες NIST για μήκος, compromised blocklists και αποφυγή αυθαίρετων composition rules.

**Πηγή:** https://pages.nist.gov/800-63-4/sp800-63b.html

## Ταυτοποίηση και εξουσιοδότηση

**Κατηγορία:** Ασφάλεια

### Βασική γνώση

Η ταυτοποίηση ελέγχει ποιος κάνει το αίτημα· η εξουσιοδότηση τι επιτρέπεται να κάνει. Κάθε ευαίσθητη ενέργεια backend πρέπει να ελέγχει δικαιώματα.

### Πρακτική εφαρμογή

Γράψε δοκιμή όπου ο ένας χρήστης δεν μπορεί να διαβάσει σημειώσεις άλλου.

### Συγκεκριμένο όριο εμπιστοσύνης
Το authentication ταυτοποιεί caller· το authorization αποφασίζει αν μπορεί να ενεργήσει σε συγκεκριμένο object. User 12 δεν αποκτά πρόσβαση στο private document του user 13 μόνο επειδή έκανε login. Έλεγξε read/update/delete/export, όχι μόνο κουμπιά UI.

### Ελεγχόμενο παράδειγμα
```python
def can_read(actor_id,document):
    return actor_id is not None and actor_id==document['owner_id']
assert can_read(12,{'owner_id':12})
assert not can_read(13,{'owner_id':12})
```

### Εργαστήριο επαλήθευσης
Φτιάξε tests owner, διαφορετικού logged-in χρήστη και anonymous. Άλλαξε resource ID με ίδιο session και βεβαιώσου ότι server-side authorization απορρίπτει το request.

**Πηγή:** https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html
