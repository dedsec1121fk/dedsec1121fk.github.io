# Επιθεώρηση ELF και PE χωρίς εκτέλεση αγνώστων αρχείων

## Διάλεξε parser ανάλογα με το format
Σε Linux, τα `file`, `readelf -h`, `readelf -S` και `readelf -s` διαβάζουν τη δομή ELF χωρίς να εκκινούν το πρόγραμμα. Το `objdump -p` μπορεί να εμφανίσει δυναμικές εξαρτήσεις. Για Windows PE χρειάζεται κατάλληλο έμπιστο εργαλείο που αναγνωρίζει DOS/PE signatures, image headers, sections και imports. Το `readelf` δεν είναι parser για PE και δεν πρέπει να ερμηνεύονται άσχετα bytes ως ELF.

~~~sh
file ./known-good-sample
readelf -h ./known-good-sample
readelf -S ./known-good-sample
readelf -d ./known-good-sample 2>/dev/null || true
sha256sum ./known-good-sample
~~~

## Τι μας λένε τα sections
Κάθε section περιγράφεται από όνομα, τύπο, offset στο αρχείο, μέγεθος και flags. Το file offset δεν είναι ίδιο με virtual address κατά την εκτέλεση. Ένα stripped πρόγραμμα μπορεί να μη φανερώνει ονόματα συμβόλων και παρ' όλα αυτά να τρέχει. Η ύπαρξη import υποδηλώνει πιθανή εξάρτηση, όχι ότι κάποια συνάρτηση εκτελέστηκε σε κάθε σενάριο.

## Δικό σου συγκρίσιμο δείγμα
Φτιάξε μικρό πρόγραμμα C με δύο συναρτήσεις σε προσωρινό φάκελο και μεταγλώττισέ το με debug symbols. Μετά δημιούργησε δεύτερο αντίγραφο stripped. Σύγκρινε sections και symbols χωρίς να αλλάξεις τον πηγαίο κώδικα. Κατάγραψε compiler, flags και διαφορά ονομάτων. Η έκδοση toolchain μπορεί να επηρεάζει το αποτέλεσμα.

## Όρια και τεκμήρια
Μην ανεβάζεις ιδιόκτητα αρχεία ή άγνωστα ύποπτα δείγματα σε δημόσιους scanners χωρίς άδεια. Μην εκτελείς άγνωστο binary. Κράτησε SHA-256, αρχιτεκτονική CPU, format και την ακριβή εντολή για κάθε παρατήρηση. Ό,τι δεν τεκμηριώνεται από header παραμένει υπόθεση.

## File offsets, RVA και virtual addresses είναι χωριστές συντεταγμένες
Ένας disassembler μπορεί να εμφανίζει loaded virtual address, ενώ ο hex viewer file offset. Στο PE το RVA είναι σχετικό με το image base. Για αντιστοίχιση σε bytes χρειάζεται το σωστό section και έλεγχος του raw data extent· zero-filled virtual tail μπορεί να μην υπάρχει στο αρχείο. Στο ELF τα program headers περιγράφουν τον loader, ενώ τα section headers οργανώνουν πληροφορία για linking και analysis. Το όνομα section δεν εγγυάται εκτέλεση.

## Σύγκρινε δικό σου object και executable
Σε Linux με C compiler και binutils αποθήκευσε `int answer(void) { return 42; }` ως `sample.c`. Κάνε `cc -c sample.c -o sample.o` και εξέτασε `readelf -h sample.o`, `readelf -s sample.o`, `objdump -d sample.o`. Είναι relocatable object, όχι εκτελέσιμο πρόγραμμα: δεν απαιτεί main ούτε process entry point. Κατάγραψε machine architecture και symbol answer.

Πρόσθεσε main σε χωριστό προσωρινό source και κάνε linking executable. Σύγκρινε program headers και relocations χωρίς να υποθέτεις ίδιες διευθύνσεις μεταξύ builds. Το optimization μπορεί να κάνει inline ή να αφαιρεί functions. Το stripping μπορεί να αφαιρεί ονόματα χωρίς να αφαιρεί συμπεριφορά. Κράτησε compile flags μαζί με το hash για αναπαραγώγιμη σύγκριση.

Αναφορά format: [Microsoft PE specification](https://learn.microsoft.com/en-us/windows/win32/debug/pe-format).
## Εικονικές διευθύνσεις που δεν ισούνται με θέσεις αρχείου

Μια διεύθυνση disassembler μπορεί να αφορά φορτωμένο εικονικό χώρο, ενώ ο hex editor χρησιμοποιεί θέσεις αρχείου. Η μετατροπή απαιτεί αντιστοίχιση τμήματος ή segment. Η αφαίρεση βάσης εικόνας δεν είναι καθολικός τύπος θέσης αρχείου.

Μερική μνήμη, όπως δεδομένα αρχικοποιημένα με μηδέν, δεν έχει αποθηκευμένα payload bytes. Έλεγξε ότι η διεύθυνση ανήκει στο αποθηκευμένο μέρος πριν ανάγνωση. Η υποθετική αντιστοίχιση χωρίζει εικονικό από αποθηκευμένο μέγεθος και δεν είναι parser κάθε ELF ή PE.

```python
def mapped_offset(address, virtual_start, file_start, stored_size, virtual_size):
    delta=address-virtual_start
    if delta < 0 or delta >= virtual_size: return None
    if delta >= stored_size: return None
    return file_start+delta
assert mapped_offset(0x1010,0x1000,0x200,0x40,0x80) == 0x210
assert mapped_offset(0x1060,0x1000,0x200,0x40,0x80) is None
assert mapped_offset(0x0fff,0x1000,0x200,0x40,0x80) is None
print("file-backed range checked")
```

Μετά τη μετατροπή έλεγξε το πραγματικό μήκος αρχείου. Πεδία μπορεί να χρησιμοποιούν σχετικές εικονικές ή απόλυτες διευθύνσεις ή offsets· ονόμασέ τα ρητά. Relocation και τυχαιοποίηση διευθύνσεων προσθέτουν επίπεδο σε σύγκριση εκτέλεσης.

[Τεχνική αναφορά](https://refspecs.linuxfoundation.org/elf/gabi4+/ch5.pheader.html)
