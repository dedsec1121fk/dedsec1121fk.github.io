# Συμβολοσειρές και Unicode

Στο DedSec υπάρχουν ελληνικά ονόματα αρχείων και έγγραφα UTF-8. Η κωδικοποίηση πρέπει να δηλώνεται ρητά· ένα byte δεν ισούται πάντα με έναν χαρακτήρα. Χρησιμοποίησε pathlib και encoding="utf-8".

## Λυμένο παράδειγμα

```text
from pathlib import Path
p = Path("greek_demo.txt")
p.write_text("Καλημέρα", encoding="utf-8")
print(p.read_text(encoding="utf-8"))
```

## Άσκηση

Εξήγησε γιατί τα Unicode ονόματα είναι σημαντικά για τους ελληνικούς φακέλους.

## Λύση / υπόδειξη

Η UTF-8 διατηρεί τους ελληνικούς χαρακτήρες στα υποστηριζόμενα συστήματα.

## Το Unicode έχει διαφορετικούς ορισμούς μήκους
Το `len("é")` είναι 1 για ενιαίο code point, ενώ το `len("e\u0301")` είναι 2, παρότι φαίνονται ίδια. Το UTF-8 αποθηκεύει μεταβλητό αριθμό bytes. Ξεχώρισε πλήθος bytes, code points και ορατών grapheme clusters.
```python
import unicodedata
a="é"; b="e\u0301"
assert a!=b
assert unicodedata.normalize("NFC",a)==unicodedata.normalize("NFC",b)
assert len(a.encode("utf-8"))==2
```
Κάνε normalization για αναζήτηση όπου το απαιτεί το προϊόν, όχι για σιωπηρή μετονομασία αρχείων. Στα ελληνικά έλεγξε τις μορφές `ς` και `σ`.

**Άσκηση:** φτιάξε ευρετήριο ελληνικών/αγγλικών τίτλων με και χωρίς τόνους και μέτρησε λανθασμένα matches.

## Εργαστήριο Unicode: ίδια εμφάνιση, διαφορετικά bytes

~~~python
import unicodedata
a, b = "é", "e\u0301"
assert a != b
assert unicodedata.normalize("NFC", a) == unicodedata.normalize("NFC", b)
assert a.encode("utf-8") != b.encode("utf-8")
~~~

Οι δύο συμβολοσειρές ενδέχεται να φαίνονται ίδιες, αλλά τα code points και τα UTF-8 bytes τους διαφέρουν. Το `len(text)` δεν μετρά απαραίτητα τους ορατούς χαρακτήρες. Δοκίμασε `b"\xff".decode("utf-8")` και παρατήρησε `UnicodeDecodeError`. Η σιωπηλή αγνόηση ή αντικατάσταση bytes μπορεί να καταστρέψει πληροφορία. Ως ανεξάρτητη άσκηση δημιούργησε δύο οπτικά ίδια ονόματα αρχείων με διαφορετική Unicode σύνθεση (αν το filesystem το επιτρέπει) και σχεδίασε ρητό κανόνα NFC για ελληνική και πολυγλωσσική αναζήτηση. Πηγή: https://docs.python.org/3/library/unicodedata.html
