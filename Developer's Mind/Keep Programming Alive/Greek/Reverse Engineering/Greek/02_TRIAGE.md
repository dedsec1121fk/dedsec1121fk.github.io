# Ανάλυση άγνωστου αρχείου: ταξινόμηση χωρίς εκτέλεση

## Μοντέλο και όρια συμπερασμάτων
Το όνομα και η επέκταση αρχείου είναι ένδειξη, όχι απόδειξη μορφής. Ξεκίνα με διατήρηση δείγματος, μέγεθος, SHA-256 και περιορισμένο prefix bytes. Οι υπογραφές PNG ή ZIP δίνουν πιθανή κατηγορία αλλά δεν εγγυώνται ότι όλο το αρχείο είναι έγκυρο. Κομμένα αρχεία, πολυμορφικά containers και ενσωματωμένα δεδομένα χρειάζονται κατάλληλο parser.

## Αυτοτελές δοκιμαστικό δείγμα
Χρησιμοποίησε αποκλειστικά δικά σου ή εξουσιοδοτημένα δοκιμαστικά δεδομένα. Η ανάλυση δεν απαιτεί παράκαμψη προστασιών.
~~~python
from pathlib import Path
from tempfile import TemporaryDirectory
import hashlib
with TemporaryDirectory() as tmp:
    p = Path(tmp) / "photo.txt"  # The extension is deliberately misleading.
    p.write_bytes(b"\x89PNG\r\n\x1a\n" + b"not-a-real-png")
    raw = p.read_bytes()
    summary = {
        "size": len(raw),
        "sha256": hashlib.sha256(raw).hexdigest(),
        "prefix": raw[:16].hex(),
        "looks_like_png": raw.startswith(b"\x89PNG\r\n\x1a\n"),
    }
    assert summary["looks_like_png"]
    print(summary)
    # A real PNG parser would still reject the truncated fake file.
~~~

## Βήματα έρευνας και ελέγχου
Δούλεψε σε αντίγραφο, όχι σε άγνωστο πρωτότυπο. Σύγκρινε magic bytes με πραγματικό έλεγχο δομής και δηλωμένα μεγέθη. Μη φορτώνεις άγνωστο αρχείο ως εκτελέσιμο, module ή macro-enabled έγγραφο μόνο για αναγνώριση. Σε Linux σύγκρινε file -b sample και xxd -l 32 sample· κατέγραψε τυχόν διαφωνία εργαλείων.

## Πρακτικό εργαστήριο
Φτιάξε έγκυρο ZIP με δύο ακίνδυνα text files, μετονόμασέ το σε .jpg και σύγκρινε επέκταση, magic header και zipfile.namelist(). Έπειτα κόψε το ZIP και εξήγησε γιατί μια γνωστή αρχή bytes δεν αποδεικνύει έγκυρο archive.

## Πίνακας αποδείξεων για παραπλανητική επέκταση
Φτιάξε δικό σου `sample.zip` με ένα ακίνδυνο `hello.txt` και αντέγραψέ το με όνομα `sample.jpg`. Σύγκρινε τρία διαφορετικά στοιχεία: το όνομα ισχυρίζεται JPEG, τα πρώτα bytes θυμίζουν ZIP header, ενώ το `zipfile.is_zipfile` μπορεί να αναγνωρίσει τη δομή. Φτιάξε και μια περικομμένη έκδοση· το magic στην αρχή ίσως παραμένει, αλλά το αρχείο δεν θα είναι πλέον πλήρες. Κατέγραψε SHA-256 πριν από αλλαγές, χρησιμοποίησε μικρά δικά σου fixtures και μη θεωρείς ποτέ την επέκταση ή μια υπογραφή απόδειξη ότι ένα άγνωστο αρχείο είναι ασφαλές.
