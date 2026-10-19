# Κωδικοποιήσεις, Unicode και αλλοιωμένο κείμενο

## Τι συμβαίνει
Το UTF-8 κωδικοποιεί Unicode με μεταβλητά bytes. Αλλοιωμένοι ελληνικοί χαρακτήρες συνήθως σημαίνουν ότι τα bytes αποκωδικοποιήθηκαν λάθος.

## Πρακτικός έλεγχος
Διάβαζε και γράφε κείμενο με ρητή κωδικοποίηση, ξεχώρισε αντικατάσταση χαρακτήρων από normalization και κράτα τα αρχικά bytes.

## Συνήθεις παγίδες
Για JSON στα Ελληνικά, εμφάνισε Unicode χωρίς περιττά ASCII escapes αλλά διατήρησε έγκυρη JSON σύνταξη.

## Μικρό παράδειγμα για προσαρμογή
```text
python -c 'print("Ελληνικά".encode("utf-8"))'
```

## Διατήρησε bytes όταν δοκιμάζεις normalization
~~~python
import unicodedata
text = 'Ελληνικά'
encoded = text.encode('utf-8')
assert encoded.decode('utf-8') == text
assert len(encoded) > len(text)
a = '\u03ac'
b = '\u03b1\u0301'
assert a != b
assert unicodedata.normalize('NFC', a) == unicodedata.normalize('NFC', b)
~~~
Οι δύο συμβολοσειρές δείχνουν το ίδιο τονισμένο γράμμα με διαφορετική ακολουθία code points. Το normalization δεν είναι decoding και δεν ανακατασκευάζει bytes που αντικαταστάθηκαν από replacement character. Το `errors='ignore'` μπορεί να κρύβει απώλεια πετώντας άκυρα bytes και δεν αποτελεί γενική επισκευή εγγράφου.

Διατήρησε το αρχικό αρχείο, δες μικρό byte sample και δοκίμασε ρητό candidate encoding σε αντίγραφο. Σωστό round trip βοηθά αλλά δεν εντοπίζει πάντα μοναδικά το προβλεπόμενο encoding. Σε JSON, escaped και literal Unicode μπορούν να αναπαριστούν ίδια string value. Το ensure_ascii=False βελτιώνει αναγνωσιμότητα χωρίς να καταργεί την απαίτηση έγκυρου UTF-8 output.
