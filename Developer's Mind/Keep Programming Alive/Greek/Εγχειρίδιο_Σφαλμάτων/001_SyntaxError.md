# Python: διάγνωση σύνταξης, εσοχών και tabs

## SyntaxError

### Τι συμβαίνει και πότε
Το SyntaxError σημαίνει ότι η Python δεν μπόρεσε να αναλύσει τη σύνταξη. Η γραμμή που επισημαίνεται είναι το σημείο αποτυχίας και όχι υποχρεωτικά η αρχή του λάθους. Ανοιχτές παρενθέσεις, ξεχασμένες άνω-κάτω τελείες και άκυρες εκφράσεις μπορεί να μεταφέρουν τη διάγνωση στην επόμενη γραμμή. Διαφέρει από NameError ή TypeError: εκεί ο κώδικας έχει ήδη αναλυθεί.

### Αυτοτελές εκτελέσιμο παράδειγμα
Αποθήκευσε το παράδειγμα ως 001_SyntaxError.py και εκτέλεσε `python3 001_SyntaxError.py`. Ο έλεγχος καλύπτει τη λανθασμένη είσοδο και τη διορθωμένη περίπτωση.

~~~python
bad = "total = (10 +\n 20\nprint(total)"
try:
    compile(bad, "<lesson>", "exec")
except SyntaxError as exc:
    print(type(exc).__name__, exc.lineno)
    assert exc.lineno is not None
else:
    raise AssertionError("invalid source parsed")
good = "total = (10 + 20)\nprint(total)"
exec(compile(good, "<lesson>", "exec"))  # 30
~~~

### Διαγνωστική διαδικασία και ασφαλής διόρθωση
Χρησιμοποίησε python3 -m py_compile file.py για έλεγχο σύνταξης χωρίς εκτέλεση του προγράμματος. Έλεγξε και την προηγούμενη γραμμή για ανοικτούς οριοθέτες. Σε παραγόμενο κώδικα χρησιμοποίησε repr(source) για κρυφά νέα-γραμμή. Το λανθασμένο δείγμα βρίσκεται μέσα σε συμβολοσειρά, ώστε το υπόλοιπο τεστ να εκτελείται.

### Πρακτικό εργαστήριο / έλεγχος ορίων
Άλλαξε το λανθασμένο δείγμα ώστε να λείπει η άνω-κάτω τελεία μετά από if. Κατέγραψε exc.msg, exc.lineno και exc.offset και διόρθωσέ το. Το regression test πρέπει να ελέγχει ότι γίνεται compile, όχι απλώς ότι υπάρχει ένα σύμβολο ':'.

## IndentationError

### Τι συμβαίνει και πότε
Οι εσοχές αποτελούν σύνταξη της Python. Η απρόσμενη εσοχή δημιουργεί μπλοκ σε μη επιτρεπτό σημείο, ενώ το expected an indented block σημαίνει ότι μια εντολή, όπως if ή for, δεν έχει σώμα. Η σωστή λύση προκύπτει από τη λογική δομή και όχι από μηχανική προσθήκη τεσσάρων κενών παντού.

### Αυτοτελές εκτελέσιμο παράδειγμα
Αποθήκευσε το παράδειγμα ως 002_IndentationError.py και εκτέλεσε `python3 002_IndentationError.py`. Ο έλεγχος καλύπτει τη λανθασμένη είσοδο και τη διορθωμένη περίπτωση.

~~~python
broken = "def total(values):\nreturn sum(values)"
try:
    compile(broken, "<indent-case>", "exec")
except IndentationError as exc:
    print(type(exc).__name__, exc.lineno)
else:
    raise AssertionError("bad indentation accepted")
def total(values):
    if not values:
        return 0
    return sum(values)
assert total([2, 3]) == 5
assert total([]) == 0
~~~

### Διαγνωστική διαδικασία και ασφαλής διόρθωση
Ενεργοποίησε την εμφάνιση κενών στο editor και εξέτασε ολόκληρο το if/else, try/except ή def. Μια οπτικά ευθυγραμμισμένη γραμμή μπορεί να περιέχει tab. Το python3 -m tabnanny path/to/package εντοπίζει αμφίσημες εσοχές. Μην αντικαθιστάς μαζικά whitespace χωρίς να δεις το diff.

### Πρακτικό εργαστήριο / έλεγχος ορίων
Πρόσθεσε else που επιστρέφει -1 για λίστα μόνο αρνητικών αριθμών. Βγάλε σκόπιμα την εσοχή από το σώμα, κατέγραψε το σφάλμα compile και έλεγξε και τις τρεις περιπτώσεις. Εξήγησε γιατί το pass είναι συντακτικά έγκυρο αλλά δεν υλοποιεί τη λειτουργία.

## TabError

### Τι το προκαλεί
Δύο γραμμές μπορεί να φαίνονται ευθυγραμμισμένες αλλά να χρησιμοποιούν διαφορετικούς χαρακτήρες. Η Python ερμηνεύει τα tabs σε θέσεις στηλοθετών και η ανάμειξη μπορεί να κάνει την εσοχή αμφίσημη. Το TabError είναι ειδική μορφή IndentationError.

### Ελεγχόμενη αναπαραγωγή
Το παρακάτω δημιουργεί broken.py με πραγματικό tab στη δεύτερη γραμμή της συνάρτησης:

~~~sh
printf 'def greet():\n\tprint("hello")\n    print("again")\ngreet()\n' > broken.py
python -m py_compile broken.py
~~~

Αναμένεται TabError: inconsistent use of tabs and spaces in indentation. Με sed -n 'l' broken.py μπορείς να δεις το tab ως \t· εναλλακτικά εκτύπωσε repr(open("broken.py").read()) στην Python.

### Διορθωμένο παράδειγμα
~~~python
def greet():
    print("hello")
    print("again")

greet()
~~~

Τρέξε python -m py_compile fixed.py και python fixed.py. Θα εμφανιστούν δύο γραμμές. Μετέτρεψε την εσοχή στο προβληματικό block σε συνεπή κενά και έλεγξε το diff. Η μαζική αντικατάσταση χωρίς έλεγχο μπορεί να αλλάξει την εμφώλευση.

### Εργαστήριο
Βάλε tab πριν από μία εμφωλευμένη εντολή και κενά πριν από την επόμενη. Δες το αρχείο με πλάτος tab 4 και 8 στον editor. Πρόσθεσε python -m tabnanny στους ελέγχους πριν από commit και ρύθμισε τον editor να εισάγει κενά. Μην αφαιρείς tabs από string literals: εκεί αποτελούν δεδομένα, όχι εσοχή.
