# Γλωσσάρι: JSON, lazy evaluation και linters

## JSON

### Έννοια και όρια
Πρότυπο κείμενο για objects, arrays, strings, numbers, booleans και null. Δεν είναι JavaScript object literal: comments και trailing commas δεν επιτρέπονται. Ο parser ελέγχει grammar, όχι application schema.

### Πρακτικό δείγμα
~~~text
import json
d=json.loads('{"active":true,"count":3}')
assert d['active'] is True
assert type(d['count']) is int
~~~

### Οδηγούμενη διερεύνηση
Δοκίμασε duplicate keys, top-level list και άγνωστο πεδίο. Πρόσθεσε schema validation για ακριβή keys· η json.loads εξ ορισμού κρατά το τελευταίο duplicate.

## Lazy evaluation

### Έννοια και όρια
Υπολογισμός που αναβάλλεται μέχρι να χρειαστεί αποτέλεσμα. Python generators δίνουν τιμές σταδιακά ενώ Haskell εφαρμόζει non-strict evaluation γενικότερα. Αλλάζει ο χρόνος σφαλμάτων και side effects.

### Πρακτικό δείγμα
~~~text
def numbers():
    yield 2
    yield 4
it=numbers()
assert next(it)==2
assert list(it)==[4]
~~~

### Οδηγούμενη διερεύνηση
Βάλε print πριν το πρώτο yield. Επιβεβαίωσε ότι δεν εκτελείται κατά τη δημιουργία του generator και ότι ο iterator εξαντλείται.

### Κριτήριο κατανόησης
Στην έννοια Οκνηρή αξιολόγηση, άλλαξε μία είσοδο του παραδείγματος και εξήγησε αν η συμπεριφορά συνεχίζει να συμφωνεί με τον ορισμό. Κατέγραψε αποτέλεσμα και ξεχώρισε σφάλμα κώδικα από λανθασμένη υπόθεση.

## Linter

### Έννοια και όρια
Εργαλείο ελέγχου κώδικα με στατικούς κανόνες. Μπορεί να βρει unused imports ή ύποπτα constructs χωρίς εκτέλεση· δεν αντικαθιστά tests συμπεριφοράς ή type checking.

### Πρακτικό δείγμα
~~~text
def ratio(total, used):
    if total <= 0: raise ValueError('invalid total')
    return used/total
assert ratio(4,2)==0.5
~~~

### Οδηγούμενη διερεύνηση
Πρόσθεσε unused variable σε scratch file, τρέξε linter και αφαίρεσέ τη χωρίς αλλαγή validation. Σύγκρινε warning με αποτυχημένο unit test.

### Κριτήριο κατανόησης
Στην έννοια Στατικός αναλυτής, άλλαξε μία είσοδο του παραδείγματος και εξήγησε αν η συμπεριφορά συνεχίζει να συμφωνεί με τον ορισμό. Κατέγραψε αποτέλεσμα και ξεχώρισε σφάλμα κώδικα από λανθασμένη υπόθεση.

## List

### Έννοια και όρια
Διατεταγμένη συλλογή με θέσεις στοιχείων. Η Python list είναι mutable dynamic array με γρήγορο indexing· η εισαγωγή στην αρχή μπορεί να μετακινήσει όλα τα επόμενα. Άλλες γλώσσες έχουν linked lists.

### Πρακτικό δείγμα
~~~text
names=['Ada','Grace']; names.append('Lin')
assert names[-1]=='Lin'
assert names[1:]==['Grace','Lin']
~~~

### Οδηγούμενη διερεύνηση
Σύγκρινε append με insert(0,item) σε μεγαλύτερη λίστα. Κάνε shallow copy nested list, άλλαξε inner list και παρατήρησε shared references.

### Κριτήριο κατανόησης
Στην έννοια Λίστα, άλλαξε μία είσοδο του παραδείγματος και εξήγησε αν η συμπεριφορά συνεχίζει να συμφωνεί με τον ορισμό. Κατέγραψε αποτέλεσμα και ξεχώρισε σφάλμα κώδικα από λανθασμένη υπόθεση.

## Lock

### Έννοια και όρια
Μηχανισμός συγχρονισμού που προστατεύει critical section από concurrent mutation. Προστατεύει πράξεις που αποκτούν το lock με συνέπεια· δεν προστατεύει αυτόματα εξωτερικό state ούτε αντικαθιστά transaction.

### Πρακτικό δείγμα
~~~text
from threading import Lock
lock=Lock(); count=[0]
with lock: count[0]+=1
assert count==[1]
~~~

### Οδηγούμενη διερεύνηση
Τρέξε concurrent increments με κοινό lock. Έπειτα δείξε πώς δύο threads που αποκτούν A/B με αντίθετη σειρά μπορούν να κάνουν deadlock.

### Κριτήριο κατανόησης
Στην έννοια Κλείδωμα, άλλαξε μία είσοδο του παραδείγματος και εξήγησε αν η συμπεριφορά συνεχίζει να συμφωνεί με τον ορισμό. Κατέγραψε αποτέλεσμα και ξεχώρισε σφάλμα κώδικα από λανθασμένη υπόθεση.

### Τέσσερα threads και ένα προστατευμένο section
Ένα lock προστατεύει read-modify-write ανάμεσα σε συνεργαζόμενα threads. Εγγυάται αποκλεισμό, όχι σταθερή σειρά εκτέλεσης.

~~~python
from threading import Thread, Lock
mutex, counter = Lock(), [0]
def run():
    for _ in range(1000):
        with mutex:
            counter[0] += 1
jobs = [Thread(target=run) for _ in range(4)]
for t in jobs: t.start()
for t in jobs: t.join()
assert counter[0] == 4000
~~~

Πρόσθεσε μετρητή workers μέσα στο section· το μέγιστο πρέπει να είναι ένα. Το κανονικό Lock δεν είναι reentrant: διπλή απόκτηση από ίδιο thread μπορεί να κάνει deadlock. Μην το κρατάς σε αργά network calls.
