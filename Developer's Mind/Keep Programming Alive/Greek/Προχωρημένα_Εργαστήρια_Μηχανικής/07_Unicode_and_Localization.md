# Unicode, κωδικοποιήσεις και πολυγλωσσική αναζήτηση

## Unicode, κωδικοποιήσεις και πολυγλωσσική αναζήτηση

Το UTF-8 κωδικοποιεί χαρακτήρες Unicode σε bytes. Ένας ορατός χαρακτήρας ενδέχεται να αποτελείται από πολλαπλά σημεία κώδικα. Η `len()` δεν μετρά απαραίτητα τα ορατά γραφήματα. Η κανονικοποίηση NFC/NFD βοηθά στη σύγκριση, ενώ η `casefold` αντιμετωπίζει ορισμένες διαφορές πεζών/κεφαλαίων καλύτερα από την `lower`.

### Παράδειγμα
```python
import unicodedata as u
def fold(value):
    normalized = u.normalize('NFD', value.casefold())
    return ''.join(c for c in normalized if u.category(c) != 'Mn')
assert fold('Αθήνα') == fold('Αθηνα')
```

### Ασκήσεις
1. Σύγκρινε όμοια οπτικά κείμενα με διαφορετική κανονικοποίηση.
2. Διατήρησε τα ελληνικά ονόματα σε ZIP.
3. Πρόσθεσε εφεδρική μετάφραση για άγνωστο κλειδί.
4. Παρουσίασε αρχικό μήνυμα σφάλματος χωρίς αλλοίωση.

## Unicode και κωδικοποίηση κειμένου

### Το πρόβλημα και η ουσία
Δύο strings μπορεί να φαίνονται ίδια αλλά να έχουν άλλα codepoints. Ένας τονισμένος χαρακτήρας μπορεί να είναι precomposed ή base + combining mark. Η NFC προσφέρει κοινή αναπαράσταση σύγκρισης αλλά δεν λύνει κάθε περίπτωση οπτικά όμοιου κειμένου.

### Παράδειγμα
~~~python
import unicodedata
left = 'é'
right = 'e\u0301'
assert left != right
assert unicodedata.normalize('NFC', left) == unicodedata.normalize('NFC', right)
assert len(left.encode('utf-8')) != len(right.encode('utf-8'))
~~~

### Ανεξάρτητος έλεγχος
Δοκίμασε ελληνικά με τόνο και τελικό σίγμα με casefold. Μέτρησε codepoints και bytes χωριστά. Μην κάνεις normalize binary αρχεία· αποφάσισε NFC/NFKC, casefold ή accent-sensitive search διατηρώντας display text.

**Επίσημη τεκμηρίωση:** https://docs.python.org/3/library/unicodedata.html
