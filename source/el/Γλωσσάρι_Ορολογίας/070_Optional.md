# Γλωσσάρι: προαιρετικοί τύποι, overflow και packages

## Optional

### Ακριβής σημασία
API που διακρίνει παρουσία από απουσία. Rust Option<T>, TypeScript optional fields και Python T|None εκφράζουν παρόμοια έννοια με διαφορετικό runtime.

### Πείραμα αναφοράς
~~~text
def first(items: list[int]) -> int | None:
    return items[0] if items else None
assert first([]) is None
assert first([0])==0
~~~

### Διερεύνηση ορίου
Αντικατάστησε None με tagged found/missing result και σύγκρινε caller όταν το έγκυρο αποτέλεσμα είναι 0.

### Ανεξάρτητος έλεγχος
Για Προαιρετική τιμή, γράψε την αναμενόμενη έξοδο πριν από εκτέλεση. Άλλαξε μία σημαντική παραδοχή και βρες αν το πρόβλημα ανήκει σε caller, implementation ή περιβάλλον.

### Το μηδέν είναι τιμή, όχι missing argument
Δήλωσε την απουσία ρητά. Το truthiness συγχωνεύει μηδέν με None και μπορεί να αλλάξει τη σημασία των δεδομένων.

~~~python
def remaining(capacity, limit=None):
    if capacity < 0 or (limit is not None and limit < 0):
        raise ValueError("negative")
    return capacity if limit is None else min(capacity, limit)
assert remaining(7) == 7
assert remaining(7, 0) == 0
assert remaining(7, 3) == 3
~~~

Αντικατάστησε τον έλεγχο None με falsy-value check για να αναπαράγεις bug στο μηδενικό όριο. Tagged Result είναι καλύτερο όταν missing, invalid και present διαφέρουν. Optional annotations δεν επικυρώνουν εξωτερικό JSON.

## Overflow

### Ακριβής σημασία
Αποτέλεσμα εκτός εύρους αριθμητικού τύπου. Μια γλώσσα μπορεί να κάνει trap, wrap ή reject. Οι Python integers διαφέρουν από unsigned 8-bit registers.

### Πείραμα αναφοράς
~~~text
def add_u8(a,b):
    if not (0<=a<=255 and 0<=b<=255): raise ValueError()
    if a > 255-b: raise OverflowError()
    return a+b
assert add_u8(255,0)==255
~~~

### Διερεύνηση ορίου
Δοκίμασε add_u8(250,6) και σύγκρινε error με wrapping counter. Εξήγησε τον κίνδυνο overflow σε χρηματικά ποσά.

### Ανεξάρτητος έλεγχος
Για Υπερχείλιση, γράψε την αναμενόμενη έξοδο πριν από εκτέλεση. Άλλαξε μία σημαντική παραδοχή και βρες αν το πρόβλημα ανήκει σε caller, implementation ή περιβάλλον.

### Έλεγξε το fixed-width όριο πριν από serialization
Οι Python integers είναι arbitrary precision αλλά ένα binary unsigned byte φτάνει έως 255. Ο έλεγχος πρέπει να ακολουθεί τον τύπο προορισμού.

~~~python
def add_u8(a, b):
    if any(type(v) is not int or not 0 <= v <= 255 for v in (a,b)):
        raise ValueError("unsigned byte expected")
    if a > 255-b:
        raise OverflowError("byte overflow")
    return a+b
assert add_u8(200, 55) == 255
try:
    add_u8(200, 56)
except OverflowError: pass
else: raise AssertionError("invalid result accepted")
~~~

Σύγκρινε απόρριψη με modulo-256 wrapping. Το wrapping μπορεί να επιτρέπεται σε protocol αλλά είναι επικίνδυνο για μεγέθη και οικονομικά δεδομένα. Το C signed overflow είναι undefined behavior.

## Package manager

### Ακριβής σημασία
Resolver και installer dependencies. Η εμπιστοσύνη αφορά registries, lockfiles, version constraints, hooks εγκατάστασης και platform compatibility.

### Πείραμα αναφοράς
~~~text
python -m pip --version
python -m pip list --format=columns
~~~

### Διερεύνηση ορίου
Σε προσωρινό virtual environment εγκατάστησε έμπιστο pinned package, δες resolved version και σύγκρινε με unpinned requirement.

### Ανεξάρτητος έλεγχος
Για Διαχειριστής πακέτων, γράψε την αναμενόμενη έξοδο πριν από εκτέλεση. Άλλαξε μία σημαντική παραδοχή και βρες αν το πρόβλημα ανήκει σε caller, implementation ή περιβάλλον.
