# Δυαδικά offsets και endianness: εξαγωγή πεδίων με δοκιμές

## Μοντέλο και όρια συμπερασμάτων
Οι δυαδικές μορφές είναι ακολουθίες bytes. Κάθε πεδίο χρειάζεται offset, πλάτος, κωδικοποίηση και επιτρεπτό εύρος. Το endianness ορίζει τη σειρά bytes σε ακέραιους πολλών bytes. Αν ένας parser δουλεύει μόνο για μία τιμή, εξέτασε signedness, μήκος και διαφορά απόλυτων/σχετικών offsets.

## Αυτοτελές δοκιμαστικό δείγμα
~~~python
import struct
# Owned toy format: 4-byte magic, unsigned 16-bit little-endian count.
payload = b"DEMO" + struct.pack("<H", 513) + b"OK"
assert payload.hex() == "44454d4f01024f4b"
magic = payload[:4]
count = struct.unpack_from("<H", payload, 4)[0]
assert magic == b"DEMO" and count == 513
assert int.from_bytes(payload[4:6], "big") == 258
try:
    struct.unpack_from("<I", payload, 6)
except struct.error:
    pass
else:
    raise AssertionError("out-of-range field accepted")
~~~

## Βήματα έρευνας και ελέγχου
Κατάγραψε πίνακα offsets πριν γράψεις parser: 0–3 magic, 4–5 count, 6–7 payload. Έλεγξε ελάχιστο μήκος πριν από unpack και απόρριψε υπερβολικά counts αντί να δεσμεύεις ανεξέλεγκτη μνήμη. Κράτα και bytes και αποκωδικοποιημένες τιμές. Δήλωσε ρητά <, > ή ! στο struct για να αποφύγεις εξαρτήσεις από native alignment.

## Πρακτικό εργαστήριο
Πρόσθεσε UTF-8 string με prefix μήκους και απόρριψε τιμές μεγαλύτερες από τα διαθέσιμα bytes. Δοκίμασε counts 0, 255 και 65535 και σύγκρινε little-/big-endian decoding στο ίδιο fixture.

## Απόδειξε το πλάτος και το endianness
~~~python
import struct
record = struct.pack("<BH", 2, 513)
assert record.hex() == "020102"
assert struct.unpack("<BH", record) == (2, 513)
~~~
Το πρώτο byte μπορεί να δηλώνει έκδοση, ενώ τα επόμενα δύο σχηματίζουν έναν 16-bit αριθμό σε little-endian. Διάβασε τα ίδια bytes ως big-endian και εξήγησε γιατί προκύπτει διαφορετική τιμή. Κόψε το τελευταίο byte και απαίτησε ρητή αποτυχία τύπου `struct.error`, όχι σιωπηλό μηδέν. Αν ο αριθμός δηλώνει μήκος payload, σύγκρινέ τον με τα bytes που πραγματικά απομένουν **πριν** κάνεις allocation ή slicing.
## Δοκιμές διπλής μετατροπής αποκαλύπτουν λάθος σειρά bytes

Αριθμός με λάθος σειρά bytes μπορεί να φαίνεται εύλογος, ειδικά με πολλά μηδενικά. Διάλεξε ασύμμετρα δείγματα με διαφορετικά bytes. Έλεγξε τη δηλωμένη σειρά μορφής και μετατροπή κωδικοποίησης/αποκωδικοποίησης.

Η επιτυχής διπλή μετατροπή αποδεικνύει συμφωνία των δικών σου εργαλείων, όχι συμφωνία με πραγματική μορφή. Κράτησε ανεξάρτητο δείγμα γνωστής απάντησης από προδιαγραφή ή τεκμηριωμένο αρχείο. Κατάγραψε θέση, πλάτος, πρόσημο και σειρά μαζί.

```python
raw=bytes.fromhex("01 02 03 04")
little=int.from_bytes(raw,"little")
big=int.from_bytes(raw,"big")
assert little == 0x04030201 and big == 0x01020304
assert little.to_bytes(4,"little") == raw
assert big.to_bytes(4,"big") == raw
assert little != big
print(hex(little),hex(big))
```

Δοκίμασε όρια προσημασμένων τιμών και πεδία που υπερβαίνουν buffer. Μην εξάγεις σειρά ολόκληρου αρχείου από μία αναγνωρίσιμη τιμή· εμφωλευμένες δομές μπορεί να έχουν δικούς τους κανόνες. Κράτησε την ερμηνεία ως υπόθεση ώσπου να επιβεβαιωθεί ανεξάρτητα.

[Τεχνική αναφορά](https://docs.python.org/3/library/stdtypes.html#int.from_bytes)
