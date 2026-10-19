# Γλωσσάρι: determinism, dictionaries και δυναμικοί τύποι

## Determinism

### Τι σημαίνει στην πράξη
Deterministic computation παράγει το ίδιο παρατηρήσιμο αποτέλεσμα για ίδιες εισόδους και σχετικό περιβάλλον. Το random seed βοηθά με ψευδοτυχαίες σειρές, αλλά δεν ελέγχει ρολόγια, threads, filesystem order ή μεταβαλλόμενες υπηρεσίες.

### Συγκεκριμένο παράδειγμα
~~~python
import random
first = random.Random(17).sample(range(100), 5)
second = random.Random(17).sample(range(100), 5)
assert first == second
~~~

### Άσκηση και συχνή παγίδα
Αφαίρεσε το explicit seed και παρατήρησε μεταβλητότητα· ταξινόμησε συλλογή πριν συγκρίνεις έξοδο. Για tests ημερομηνιών χρησιμοποίησε injected fixed clock. Κατάγραψε ποιες εξαρτήσεις εμποδίζουν πλήρη αναπαραγωγή.

**Αναφορά:** https://docs.python.org/3/library/random.html

## Dictionary

### Τι σημαίνει στην πράξη
Dictionary ή map αντιστοιχίζει μοναδικά keys σε values για γρήγορο lookup. Στην Python τα keys πρέπει να είναι hashable και η ανάθεση σε ήδη υπάρχον key αντικαθιστά την τιμή. Η απόδοση είναι συνήθως καλή κατά μέσο όρο, όχι απόλυτη εγγύηση σε κάθε περίπτωση.

### Συγκεκριμένο παράδειγμα
~~~python
totals = {}
for name in ['Ada', 'Grace', 'Ada']:
    totals[name] = totals.get(name, 0) + 1
assert totals == {'Ada': 2, 'Grace': 1}
~~~

### Άσκηση και συχνή παγίδα
Δοκίμασε list ως dictionary key και εξήγησε το TypeError. Σύγκρινε `d.get(k)` με `d[k]` για άγνωστο key· η απουσία δεν σημαίνει πάντα νόμιμο μηδενικό αποτέλεσμα.

**Αναφορά:** https://docs.python.org/3/tutorial/datastructures.html#dictionaries

## Dynamic typing

### Τι σημαίνει στην πράξη
Σε dynamically typed γλώσσες όπως η Python, οι τιμές έχουν τύπους αλλά ένα όνομα μπορεί να δείχνει σε διαφορετικούς τύπους με τον χρόνο. Αυτό δεν σημαίνει απουσία κανόνων: λάθος operations αποτυγχάνουν στο runtime. Τα annotations βοηθούν εργαλεία χωρίς να επιβάλλονται από τον interpreter.

### Συγκεκριμένο παράδειγμα
~~~python
value = 3
value = 'three'
assert isinstance(value, str)
try:
    _ = value + 1
except TypeError: pass
else: raise AssertionError('expected a type error')
~~~

### Άσκηση και συχνή παγίδα
Φτιάξε function που δέχεται άγνωστο JSON και χρησιμοποιεί isinstance πριν από αριθμητική. Σύγκρινε runtime behavior με static warning για `value + 1`. Τα type hints δεν επικυρώνουν αυτόματα εισερχόμενα δεδομένα.

**Αναφορά:** https://docs.python.org/3/library/typing.html

## Encapsulation

### Σημασία και περιορισμοί
Το encapsulation συνδέει state με τις λειτουργίες που προστατεύουν τους κανόνες του μέσω ελεγχόμενου interface. Στην Python το αρχικό underscore είναι convention, όχι αυστηρή απαγόρευση πρόσβασης. Ο caller πρέπει να χρησιμοποιεί methods που τηρούν invariant.

### Πρακτικό παράδειγμα
~~~python
class Balance:
    def __init__(self): self._cents = 0
    def add(self, cents):
        if type(cents) is not int or cents < 0: raise ValueError('invalid amount')
        self._cents += cents
    @property
    def cents(self): return self._cents
b = Balance(); b.add(25); assert b.cents == 25
~~~

### Άσκηση και παγίδα
Δοκίμασε add(-1) και add(True). Εξήγησε γιατί η απευθείας ανάθεση στο `_cents` τεχνικά επιτρέπεται· σε πραγματικά APIs απαιτούνται και δικαιώματα χρήστη.

**Επιπλέον πηγή:** https://docs.python.org/3/tutorial/classes.html#private-variables
