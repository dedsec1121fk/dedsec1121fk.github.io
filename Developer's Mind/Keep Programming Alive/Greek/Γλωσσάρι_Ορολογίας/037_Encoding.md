# Γλωσσάρι: encoding, εξαιρέσεις και εκφράσεις

## Encoding

### Σημασία και περιορισμοί
Encoding είναι ο κανόνας μετατροπής χαρακτήρων σε bytes και αντίστροφα. Το UTF-8 χρησιμοποιεί μεταβλητό πλήθος bytes ανά code point. Με λάθος decoding εμφανίζεται error ή αλλοιωμένο κείμενο· byte offset και character index δεν ταυτίζονται.

### Πρακτικό παράδειγμα
~~~python
text = 'Γεια'
data = text.encode('utf-8')
assert data.decode('utf-8') == text
assert len(data) > len(text)
~~~

### Άσκηση και παγίδα
Γράψε bytes σε προσωρινό binary αρχείο, διάβασέ τα ως UTF-8 και μετά δοκίμασε το άκυρο byte `b'\xff'` με UnicodeDecodeError. Μην κρύβεις απώλεια δεδομένων με errors='ignore'.

**Επιπλέον πηγή:** https://docs.python.org/3/howto/unicode.html

## Exception

### Σημασία και περιορισμοί
Exception αναφέρει μη κανονική κατάσταση και μεταφέρει τον έλεγχο σε handler. Ένα συγκεκριμένο catch στο κατάλληλο boundary χειρίζεται αναμενόμενη αποτυχία χωρίς να κρύβει άλλα bugs. Γενικό catch που επιστρέφει success είναι επικίνδυνο.

### Πρακτικό παράδειγμα
~~~python
def port(text):
    try: number = int(text)
    except ValueError as exc: raise ValueError('port must be decimal') from exc
    if not 1 <= number <= 65535: raise ValueError('port out of range')
    return number
assert port('443') == 443
~~~

### Άσκηση και παγίδα
Δοκίμασε 'abc', '0' και '65536' χωριστά. Σχεδίασε σε ποιο layer γίνεται raise και πού catch, χρησιμοποιώντας `raise ... from ...` για να διατηρηθεί η αρχική αιτία.

**Επιπλέον πηγή:** https://docs.python.org/3/tutorial/errors.html

## Expression

### Σημασία και περιορισμοί
Expression είναι στοιχείο του κώδικα που αξιολογείται σε τιμή· statement είναι εντολή της γραμματικής. Operators, precedence και side effects αλλάζουν το αποτέλεσμα. Οι παρενθέσεις βοηθούν στην πρόθεση ακόμη κι αν οι κανόνες precedence αρκούν.

### Πρακτικό παράδειγμα
~~~python
a, b, c = 2, 3, 4
assert a + b * c == 14
assert (a + b) * c == 20
square = lambda n: n * n
assert square(a + 1) == 9
~~~

### Άσκηση και παγίδα
Σχεδίασε syntax trees των `2+3*4` και `(2+3)*4`. Ξεχώρισε `n = 5` (ανάθεση) από `n == 5` (σύγκριση) στην Python και πρόβλεψε την έξοδο πριν εκτελέσεις.

**Επιπλέον πηγή:** https://docs.python.org/3/reference/expressions.html

## File descriptor

### Σημασία και περιορισμοί
Σε POSIX συστήματα το file descriptor είναι ακέραιος handle για ανοικτό file, pipe ή socket. Συνήθως stdin=0, stdout=1, stderr=2. Το descriptor δείχνει ανοικτό resource, όχι απευθείας filename.

### Πρακτικό παράδειγμα
~~~python
import os
read_fd, write_fd = os.pipe()
try:
    os.write(write_fd, b'ok')
    assert os.read(read_fd, 2) == b'ok'
finally:
    os.close(read_fd); os.close(write_fd)
~~~

### Άσκηση και παγίδα
Εξήγησε γιατί και τα δύο ends του pipe πρέπει να κλείνουν σε επιτυχία και αποτυχία. Ερεύνησε descriptor leaks. Τα POSIX APIs δεν είναι ίδια σε κάθε Windows setup.

**Επιπλέον πηγή:** https://docs.python.org/3/library/os.html#file-descriptor-operations

## Finite state machine

### Σημασία και περιορισμοί
Finite-state machine μοντελοποιεί ένα σύστημα με πεπερασμένες καταστάσεις και επιτρεπόμενες μεταβάσεις. Αντί για ανεξάρτητα booleans is_loading/is_done/is_error που μπορεί να αντιφάσκουν, ένα enum επιβάλλει αμοιβαία αποκλειόμενες καταστάσεις.

### Πρακτικό παράδειγμα
~~~python
from enum import Enum
class Status(Enum): IDLE=1; LOADING=2; DONE=3
allowed = {Status.IDLE:{Status.LOADING}, Status.LOADING:{Status.DONE}, Status.DONE:set()}
assert Status.DONE in allowed[Status.LOADING]
~~~

### Άσκηση και παγίδα
Σχεδίασε μετάβαση DONE→LOADING μόνο αν το σύστημα επιτρέπει πραγματικά retry. Δοκίμασε άκυρο άλμα IDLE→DONE και περιέγραψε σε ποιο layer απορρίπτεται.

**Επιπλέον πηγή:** https://en.wikipedia.org/wiki/Finite-state_machine
