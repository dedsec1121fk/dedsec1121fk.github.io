# Python AssertionError — έλεγχος υποθέσεων, όχι ασφάλεια εισόδου

## Ερμηνεία και αρχική αιτία
Ένα assert ελέγχει υπόθεση του προγραμματιστή κατά τον εντοπισμό λαθών. Στην Python η εκτέλεση με -O αφαιρεί τις εντολές assert και δεν αξιολογεί καν τη συνθήκη τους. Μην εφαρμόζεις εξουσιοδότηση, έλεγχο εισόδου ή περιορισμό πόρων μόνο με assert. Μία AssertionError μπορεί να δείχνει λανθασμένο αναμενόμενο αποτέλεσμα δοκιμής, εσφαλμένο κώδικα ή παράλειψη προϋπόθεσης.

## Τρόπος διόρθωσης
Δημιούργησε συνάρτηση parse_limit που δέχεται αποκλειστικά ψηφία ASCII και ακέραιο από 1 έως 100. Ο έλεγχος γίνεται με ValueError σε κάθε λειτουργία της Python. Τα assert χρησιμοποιούνται μόνο για το αποτέλεσμα των δοκιμών, όχι για να επιβάλουν περιορισμούς στην πραγματική εφαρμογή.

## Εκτελέσιμο παράδειγμα
Αποθήκευσε ως assertion_lab.py.

~~~python
def parse_limit(text):
    if not text.isascii() or not text.isdecimal():
        raise ValueError('limit must contain ASCII decimal digits')
    value = int(text)
    if not 1 <= value <= 100:
        raise ValueError('limit must be between 1 and 100')
    return value

assert parse_limit('12') == 12
for bad in ('-1', '101', '1.5', ''):
    try:
        parse_limit(bad)
    except ValueError:
        pass
    else:
        raise AssertionError('invalid limit accepted: ' + bad)
print('PASS: validation always runs; assertions are only tests')
~~~

## Γιατί έχει σημασία
Ο συνδυασμός text.isdecimal και text.isascii εμποδίζει σύμβολα δεκαδικών ψηφίων από άλλα συστήματα γραφής όταν το πρωτόκολλο ζητά ASCII. Το '0' είναι ακέραιος, αλλά εκτός του επιτρεπτού εύρους. Η χειροκίνητη AssertionError σε μία αποτυχία δοκιμής παραμένει ενεργή ακόμη και με -O και δεν αποτελεί μέρος της επαλήθευσης εισόδου.

## Επαλήθευση
Εκτέλεσε python3 assertion_lab.py και python3 -O assertion_lab.py: και στις δύο περιπτώσεις αναμένεται PASS. Έπειτα σύγκρινε ξεχωριστά python3 -c 'assert False' και python3 -O -c 'assert False; print("assert skipped")'. Η πρώτη εντολή αποτυγχάνει, η δεύτερη εκτυπώνει το μήνυμα.

## Ασκήσεις και όρια
Πρόσθεσε ως άκυρο το αραβοϊνδικό ψηφίο '٠' και εξήγησε τον ρητό περιορισμό ASCII. Σε πραγματικό AssertionError εντόπισε το αντίστοιχο πλαίσιο κλήσης και τις πραγματικές τιμές. Μη διαγράφεις μία αποτυχημένη δοκιμή μόνο για να περάσει το CI.

**Πρωτογενής πηγή:** https://docs.python.org/3/reference/simple_stmts.html#the-assert-statement
