# Σφάλματα και εξαιρέσεις

Διαχειρίσου μόνο σφάλματα που μπορείς να αντιμετωπίσεις. Κράτησε κατατοπιστικά μηνύματα και απόφυγε γενικό except που αποκρύπτει προβλήματα. Χρησιμοποίησε finally ή context managers.

## Λυμένο παράδειγμα

```text
text = "123"
try:
    value = int(text)
except ValueError:
    print("not a number")
else:
    print(value * 2)
```

## Άσκηση

Δοκίμασε text="abc" και εξήγησε τον νέο κλάδο.

## Λύση / υπόδειξη

Ο κλάδος ValueError αναφέρει μη έγκυρο αριθμό.

## Οι εξαιρέσεις είναι μέρος του συμβολαίου
Πιάσε exception μόνο εκεί όπου μπορείς να αποφασίσεις σωστά. Αν λείπει προαιρετικό αρχείο, μπορεί να υπάρχει default· αν αλλοιώθηκε υποχρεωτικό config, χρειάζεται καθαρό σφάλμα. Μην κρύβεις γενικά exceptions.
```python
from pathlib import Path
def load_name(path):
    try: text=Path(path).read_text(encoding="utf-8")
    except FileNotFoundError: return "anonymous"
    if not text.strip(): raise ValueError("empty name file")
    return text.strip()
```
`FileNotFoundError`, `PermissionError` και `UnicodeDecodeError` έχουν διαφορετικές αιτίες. Το `raise ... from exc` διατηρεί τη βασική αιτία όταν μεταφράζεις σφάλμα. Το `finally` χρησιμεύει για cleanup, όχι για απόκρυψη.

**Άσκηση:** έλεγξε αρχείο που λείπει, κενό, μη έγκυρο UTF-8, έλλειψη δικαιωμάτων όπου είναι εφικτό και έγκυρο αρχείο.

## Διαχώρισε parsing και κανόνες εφαρμογής

~~~python
def parse_score(text):
    try:
        value = int(text)
    except ValueError as exc:
        raise ValueError("not an integer") from exc
    if value < 0:
        raise ValueError("negative score")
    return value

assert parse_score("0") == 0
assert parse_score("12") == 12
~~~

Δοκίμασε χωριστά `"bad"` και `"-2"`. Και τα δύο προκαλούν `ValueError`, αλλά η μία αστοχία έρχεται από τη μετατροπή και η άλλη από κανόνα αποδεκτών τιμών. Διατήρησε την αρχική αιτία όταν αλλάζεις το μήνυμα εξαίρεσης. Η επιστροφή μηδενός μέσα σε `except Exception` κρύβει χαλασμένα δεδομένα ως νόμιμο σκορ. Επέκτεινε την άσκηση σε ανάγνωση αρχείου: χειρίσου `FileNotFoundError` στο σωστό σημείο, χρησιμοποίησε context manager και πρόσθεσε `unittest.assertRaisesRegex` για κάθε απόρριψη. Πηγή: https://docs.python.org/3/tutorial/errors.html
