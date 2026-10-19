# Async ακύρωση, ασφαλείς διαδρομές και υποδιεργασίες

## Ασύγχρονο I/O και ακύρωση

**Κατηγορία:** Συστήματα

### Βασική γνώση

Το ασύγχρονο I/O αποφεύγει αναμονές για εξωτερικές εργασίες, αλλά δεν επιταχύνει αυτόματα βαρείς υπολογισμούς. Σχεδίασε timeouts, ακύρωση και αποδέσμευση πόρων.

### Πρακτική εφαρμογή

Σχεδίασε ασύγχρονο timeout με καθαρισμό πόρων στο finally.

### Πώς λειτουργεί πραγματικά το σύστημα
Async I/O επιτρέπει εναλλαγή tasks όταν περιμένουν operations. Η async def επιστρέφει coroutine που πρέπει να γίνει await ή scheduling. Cancellation αποτελεί μέρος lifecycle: cleanup στο finally και όχι κρυφό swallowing του CancelledError.

### Ελεγχόμενο εκτελέσιμο πείραμα
```python
import asyncio
async def worker():
    try: await asyncio.sleep(10)
    finally: print('cleanup')
async def main():
    task=asyncio.create_task(worker())
    await asyncio.sleep(0)
    task.cancel()
    try: await task
    except asyncio.CancelledError: pass
asyncio.run(main())
```

### Ανάλυση σφάλματος και επέκταση
Κατέγραψε δημιουργία, suspension, cancellation και cleanup. Σύγκρινε Task.cancel με εγκατάλειψη coroutine και έλεγξε ότι πόρος κλείνει σε finally.

**Πηγή:** https://docs.python.org/3/library/asyncio-task.html

## Διαδρομές αρχείων και συμβολικοί σύνδεσμοι

**Κατηγορία:** Συστήματα

### Βασική γνώση

Η κανονικοποίηση, οι σχετικές διαδρομές και οι συμβολικοί σύνδεσμοι επηρεάζουν την ασφάλεια. Σε αποσυμπίεση και μεταφόρτωση απόρριψε διαδρομές έξω από τον επιτρεπτό φάκελο· απλό string-prefix δεν αρκεί.

### Πρακτική εφαρμογή

Έλεγξε αν η τελική διαδρομή παραμένει μέσα σε προσωρινό φάκελο.

### Πώς λειτουργεί πραγματικά το σύστημα
Path είναι όνομα που επιλύει filesystem, όχι μόνιμη ταυτότητα αντικειμένου. Symlinks, relative paths και mount points μπορούν να αλλάξουν τον προορισμό. Το Path.resolve βοηθά τον προέλεγχο αλλά όχι TOCTOU race όταν άλλος process αλλάζει το δέντρο.

### Ελεγχόμενο εκτελέσιμο πείραμα
```python
from pathlib import Path
from tempfile import TemporaryDirectory
with TemporaryDirectory() as p:
    root=Path(p).resolve()
    (root/'ok.txt').write_text('ok')
    assert (root/'ok.txt').resolve().is_relative_to(root)
```

### Ανάλυση σφάλματος και επέκταση
Σύγκρινε inside file με sibling root-extra για να δεις γιατί startswith δεν είναι ασφαλές. Σε hostile filesystem χρειάζονται directory-relative και no-follow opens με έλεγχο descriptor.

**Πηγή:** https://docs.python.org/3/library/pathlib.html

## Ασφάλεια εξωτερικών εντολών

**Κατηγορία:** Συστήματα

### Βασική γνώση

Πέρασε πίνακα παραμέτρων σε subprocess χωρίς εκτέλεση shell για μη έμπιστα δεδομένα. Όρισε timeout, φάκελο εργασίας και έλεγξε τον κωδικό επιστροφής.

### Πρακτική εφαρμογή

Εκτέλεσε ασφαλή εντολή ελέγχου έκδοσης με λίστα παραμέτρων αντί για σύνθεση κειμένου.

### Πώς λειτουργεί πραγματικά το σύστημα
Τα subprocess arguments είναι δεδομένα όταν δίνονται ως array με shell=False· συνένωση user strings σε shell command αλλάζει parsing και μπορεί να εκτελέσει operators. Όρισε timeout, έλεγξε exit codes και περιόρισε output από μη έμπιστα προγράμματα.

### Ελεγχόμενο εκτελέσιμο πείραμα
```python
import subprocess,sys
text='hello; echo unexpected'
p=subprocess.run([sys.executable,'-c','import sys; print(sys.argv[1])',text],capture_output=True,text=True,check=True,timeout=3)
assert p.stdout.strip()==text
```

### Ανάλυση σφάλματος και επέκταση
Δοκίμασε child με exit 7 για CalledProcessError και άλλο που υπερβαίνει timeout. Ξεχώρισε FileNotFoundError από nonzero exit και όρισε πολιτική allowed executables.

**Πηγή:** https://docs.python.org/3/library/subprocess.html
