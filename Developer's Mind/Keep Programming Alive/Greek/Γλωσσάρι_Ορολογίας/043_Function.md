# Γλωσσάρι: συναρτήσεις, garbage collection και generics

## Function

### Σημασία και περιορισμοί
Function είναι επαναχρησιμοποιήσιμος υπολογισμός με παραμέτρους και αποτέλεσμα. Το συμβόλαιο περιγράφει types, άκυρες εισόδους, side effects και εγγυήσεις. Η ύπαρξη συνάρτησης δεν σημαίνει purity: μπορεί να αλλάζει files ή state.

### Πρακτικό παράδειγμα
~~~python
def area(width: float, height: float) -> float:
    if width < 0 or height < 0: raise ValueError('negative dimension')
    return width * height
assert area(3, 4) == 12
assert area(0, 5) == 0
~~~

### Άσκηση και παγίδα
Πρόσθεσε tests με αρνητικές διαστάσεις και μη αριθμητική είσοδο. Αποφάσισε αν float annotations αρκούν σε εξωτερικό API: από μόνες τους δεν κάνουν runtime validation.

**Επιπλέον πηγή:** https://docs.python.org/3/tutorial/controlflow.html#defining-functions

## Garbage collection

### Σημασία και περιορισμοί
Garbage collection ελευθερώνει μνήμη αντικειμένων που δεν είναι πλέον προσβάσιμα σύμφωνα με runtime rules. Η CPython κυρίως χρησιμοποιεί reference counting μαζί με cyclic collector, ενώ άλλα runtimes έχουν tracing GC. Το GC δεν εγγυάται άμεσο κλείσιμο files ή locks.

### Πρακτικό παράδειγμα
~~~python
from contextlib import closing
from io import StringIO
with closing(StringIO('test')) as stream:
    assert stream.read() == 'test'
assert stream.closed
~~~

### Άσκηση και παγίδα
Εξήγησε γιατί context managers είναι καλύτερα για file handles. Σχεδίασε κύκλο δύο αντικειμένων και σημείωσε ότι ο χρόνος GC δεν είναι portable συμβόλαιο.

**Επιπλέον πηγή:** https://docs.python.org/3/library/gc.html

## Generic type

### Σημασία και περιορισμοί
Generic type παραμετροποιείται με άλλο τύπο ώστε μία δομή να διατηρεί τις ιδιότητες διαφορετικών δεδομένων. Στην Python το `list[int]` καθοδηγεί static tooling αλλά δεν απορρίπτει λάθος στοιχεία αυτόματα στο runtime.

### Πρακτικό παράδειγμα
~~~python
from typing import TypeVar
T = TypeVar('T')
def first(items: list[T]) -> T | None:
    return items[0] if items else None
assert first([3,4]) == 3
assert first([]) is None
~~~

### Άσκηση και παγίδα
Ζήτησε από type checker να συμπεράνει τύπο εξόδου για list[str] και list[int]. Σύγκρινε static checking με runtime validator για άγνωστα JSON elements.

**Επιπλέον πηγή:** https://docs.python.org/3/library/typing.html

## Git

### Σημασία και περιορισμοί
Το Git είναι κατανεμημένο version control: ένα τοπικό clone έχει ιστορικό, branches και metadata ανεξάρτητα από server. Το `fetch` ενημερώνει remote refs, το `merge`/`rebase` συνδυάζει αλλαγές και το `push` δημοσιεύει commits.

### Πρακτικό παράδειγμα
~~~sh
git status --short --branch
git log --oneline -5
git remote -v
git fetch origin
~~~

### Άσκηση και παγίδα
Σε δοκιμαστικό clone σύγκρινε `git status` πριν/μετά `fetch`. Επιβεβαίωσε ότι μόνο το fetch δεν αλλάζει τα tracked working files. Μην κάνεις force-push ή reset σε production.

**Επιπλέον πηγή:** https://git-scm.com/book/en/v2/Getting-Started-What-is-Git%3F

## Hash function

### Σημασία και περιορισμοί
Μια hash function μετατρέπει bytes σε σταθερού μεγέθους digest. Το cryptographic SHA-256 σχεδιάστηκε ώστε συγκρούσεις να είναι εξαιρετικά δύσκολες, αλλά το digest αποδεικνύει ταύτιση μόνο ως προς έμπιστη αναφορά. Τα dictionary hashes εξυπηρετούν άλλους στόχους.

### Πρακτικό παράδειγμα
~~~python
import hashlib
h = lambda b: hashlib.sha256(b).hexdigest()
assert h(b'abc') == 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
assert h(b'abc') != h(b'abd')
~~~

### Άσκηση και παγίδα
Υπολόγισε hash αρχείου πριν και μετά από αλλαγή ενός byte. Εξήγησε γιατί hash από την ίδια compromised ιστοσελίδα με κακόβουλο binary δεν αποδεικνύει γνησιότητα.

**Επιπλέον πηγή:** https://docs.python.org/3/library/hashlib.html
