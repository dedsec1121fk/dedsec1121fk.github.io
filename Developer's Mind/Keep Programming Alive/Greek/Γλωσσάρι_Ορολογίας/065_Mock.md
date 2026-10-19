# Γλωσσάρι: mocks, modules και namespaces

## Mock

### Έννοια και όρια
Ελεγχόμενο test replacement για πραγματική εξάρτηση. Προσομοιώνει timeout και ελέγχει κλήσεις, αλλά δεν αποδεικνύει ότι πραγματικός server ακολουθεί το ίδιο protocol.

### Πρακτικό δείγμα
~~~text
from unittest.mock import Mock
send=Mock(return_value={'ok':True})
assert send('hi')['ok']
send.assert_called_once_with('hi')
~~~

### Οδηγούμενη διερεύνηση
Βάλε TimeoutError στο side_effect, έλεγξε τον caller και μετά κάνε integration test σε εξουσιοδοτημένο sandbox.

### Κριτήριο κατανόησης
Στην έννοια Υποκατάστατο δοκιμής, άλλαξε μία είσοδο του παραδείγματος και εξήγησε αν η συμπεριφορά συνεχίζει να συμφωνεί με τον ορισμό. Κατέγραψε αποτέλεσμα και ξεχώρισε σφάλμα κώδικα από λανθασμένη υπόθεση.

## Module

### Έννοια και όρια
Ονομασμένη μονάδα με reusable definitions. Στην Python το import εκτελεί top-level statements, άρα το module organization δεν αποκλείει side effects.

### Πρακτικό δείγμα
~~~text
from math import isfinite
assert isfinite(2.5)
assert not isfinite(float('nan'))
~~~

### Οδηγούμενη διερεύνηση
Μετέφερε parser σε parser.py και CLI σε cli.py. Χρησιμοποίησε main guard για να μην τρέχει ενέργεια κατά το import.

### Κριτήριο κατανόησης
Στην έννοια Μονάδα κώδικα, άλλαξε μία είσοδο του παραδείγματος και εξήγησε αν η συμπεριφορά συνεχίζει να συμφωνεί με τον ορισμό. Κατέγραψε αποτέλεσμα και ξεχώρισε σφάλμα κώδικα από λανθασμένη υπόθεση.

## Namespace

### Έννοια και όρια
Αντιστοίχιση identifiers σε objects μέσα σε scope/module. Qualified access αποτρέπει name collisions, αλλά namespace δεν προσφέρει authorization ή απομόνωση μνήμης.

### Πρακτικό δείγμα
~~~text
import math
import statistics
assert math.sqrt(9)==statistics.mean([3,3])
~~~

### Οδηγούμενη διερεύνηση
Δημιούργησε local binding sqrt και σύγκρινε πρόσβαση μέσω math.sqrt. Εντόπισε σε ποιο definition επιλύεται κάθε expression.

### Κριτήριο κατανόησης
Στην έννοια Χώρος ονομάτων, άλλαξε μία είσοδο του παραδείγματος και εξήγησε αν η συμπεριφορά συνεχίζει να συμφωνεί με τον ορισμό. Κατέγραψε αποτέλεσμα και ξεχώρισε σφάλμα κώδικα από λανθασμένη υπόθεση.

## Null

### Ακριβής σημασία
Ρητή απουσία, διαφορετική από 0, false και κενό string. Python None, JSON null και JavaScript null/undefined δεν έχουν απόλυτα ίδιες συμβάσεις.

### Πείραμα αναφοράς
~~~text
import json
assert json.loads('null') is None
assert json.loads('0') == 0
assert json.loads('""') == ''
~~~

### Διερεύνηση ορίου
Ξεχώρισε missing nickname, nickname=None και nickname=''. Δοκίμασε αν truthiness check τα συγχωνεύει.

### Ανεξάρτητος έλεγχος
Για Απουσία τιμής, γράψε την αναμενόμενη έξοδο πριν από εκτέλεση. Άλλαξε μία σημαντική παραδοχή και βρες αν το πρόβλημα ανήκει σε caller, implementation ή περιβάλλον.

## Object

### Ακριβής σημασία
Τιμή runtime με identity, properties και πιθανώς methods. Διαφορετικά instances μπορούν να διατηρούν ανεξάρτητο state ακόμα κι αν ανήκουν στην ίδια class.

### Πείραμα αναφοράς
~~~text
class Counter:
    def __init__(self): self.value=0
    def inc(self): self.value+=1
a,b=Counter(),Counter(); a.inc()
assert (a.value,b.value)==(1,0)
~~~

### Διερεύνηση ορίου
Πρόσθεσε mutable class-level list, παρατήρησε κοινό state και μετέφερέ το στο __init__.

### Ανεξάρτητος έλεγχος
Για Αντικείμενο, γράψε την αναμενόμενη έξοδο πριν από εκτέλεση. Άλλαξε μία σημαντική παραδοχή και βρες αν το πρόβλημα ανήκει σε caller, implementation ή περιβάλλον.
