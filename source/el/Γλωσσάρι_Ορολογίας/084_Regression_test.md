# Γλωσσάρι: regressions, REST και runtimes

## Regression test

### Ακριβής σημασία
Test που κρατά αναπαραγωγή πραγματικού bug ώστε μελλοντικές αλλαγές να το εντοπίζουν. Πρέπει να αποτυγχάνει στην προβληματική έκδοση και να περνά στη σωστή.

### Πείραμα αναφοράς
~~~text
def strip_spaces(text): return text.strip()
assert strip_spaces(' Ada ')=='Ada'
~~~

### Διερεύνηση ορίου
Αναπαράγαγε bug με αρχικά/τελικά κενά. Γράψε πρώτα failing assertion στον παλιό κώδικα και έπειτα διόρθωσέ τον.

### Ανεξάρτητος έλεγχος
Για Δοκιμή παλινδρόμησης, γράψε την αναμενόμενη έξοδο πριν από εκτέλεση. Άλλαξε μία σημαντική παραδοχή και βρες αν το πρόβλημα ανήκει σε caller, implementation ή περιβάλλον.

## REST

### Ακριβής σημασία
Αρχιτεκτονικοί περιορισμοί σε distributed systems: client/server, stateless requests, cacheability και uniform interface. JSON μέσω HTTP δεν σημαίνει αυτόματα REST.

### Πείραμα αναφοράς
~~~text
GET /tasks/5 HTTP/1.1
Host: example.test

# 200 with representation, or 404 if unavailable
~~~

### Διερεύνηση ορίου
Σχεδίασε GET/POST/PATCH routes για tasks και ξεχώρισε method semantics. Εντόπισε retry-safe read και write που θέλει idempotency.

### Ανεξάρτητος έλεγχος
Για REST, γράψε την αναμενόμενη έξοδο πριν από εκτέλεση. Άλλαξε μία σημαντική παραδοχή και βρες αν το πρόβλημα ανήκει σε caller, implementation ή περιβάλλον.

## Runtime

### Πραγματική σημασία
Η φάση και το περιβάλλον όπου τρέχει ο κώδικας, μαζί με libraries και OS. Επιτυχές compile δεν εγγυάται συμβατές runtime versions.

### Συγκεκριμένη αφετηρία
~~~text
import sys
assert sys.version_info.major == 3
print(sys.platform)
~~~

### Εφαρμογή του κανόνα
Σύγκρινε system Python με project virtual environment. Εντόπισε import error από ελλιπή runtime dependency.

### Αντιπαράδειγμα
Για Περιβάλλον εκτέλεσης, γράψε πρώτα αναμενόμενο αποτέλεσμα, άλλαξε σκόπιμα μία υπόθεση του παραδείγματος και όρισε τι πρέπει να ελέγχει το boundary πριν το επαναχρησιμοποιήσεις.

## Schema

### Πραγματική σημασία
Προδιαγραφή πεδίων, τύπων και constraints. Έγκυρο JSON δεν σημαίνει σωστό schema: μπορεί να απαιτούνται ονόματα, απόρριψη άγνωστων keys ή compatibility κανόνες.

### Συγκεκριμένη αφετηρία
~~~text
def check(row):
    if set(row) != {'name','age'}: raise ValueError('keys')
    if type(row['age']) is not int or row['age']<0: raise ValueError('age')
    return row
assert check({'name':'Ada','age':3})['age']==3
~~~

### Εφαρμογή του κανόνα
Δοκίμασε extra/missing keys, boolean age και negative age. Εξήγησε γιατί αυτό είναι ισχυρότερο από την αποδοχή οποιουδήποτε dict.

## Serialization

### Πραγματική σημασία
Μετατροπή in-memory τιμών σε μορφή αποθήκευσης/μεταφοράς. Η deserialization την αντιστρέφει, αλλά δεν κάνουν όλοι οι object types round-trip χωρίς απώλειες.

### Συγκεκριμένη αφετηρία
~~~text
import json
source={'items':[1,2], 'enabled':True}
encoded=json.dumps(source,ensure_ascii=False)
assert json.loads(encoded)==source
~~~

### Εφαρμογή του κανόνα
Κάνε round-trip Unicode text, tuple και date-like data. Σημείωσε πού το JSON αλλάζει την αρχική Python αναπαράσταση.

### Αντιπαράδειγμα
Για Σειριοποίηση, γράψε πρώτα αναμενόμενο αποτέλεσμα, άλλαξε σκόπιμα μία υπόθεση του παραδείγματος και όρισε τι πρέπει να ελέγχει το boundary πριν το επαναχρησιμοποιήσεις.
