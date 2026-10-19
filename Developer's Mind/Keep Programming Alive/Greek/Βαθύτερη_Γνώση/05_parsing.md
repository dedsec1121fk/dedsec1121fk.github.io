# Ανάλυση CSV — σύνταξη, έλεγχος τιμών και όριο εισόδου

## Σενάριο και κριτήρια επιτυχίας
Ένας τοπικός εισαγωγέας δέχεται CSV με ακριβώς τρεις στήλες: key, label και count. Ο κωδικός αρχίζει με κεφαλαίο λατινικό γράμμα και συνεχίζει με ψηφία, η ετικέτα δεν μπορεί να είναι κενή και το πλήθος είναι μη αρνητικός ακέραιος χωρίς άχρηστα αρχικά μηδενικά. Κόμμα μέσα σε εισαγωγικά δεν δημιουργεί νέα στήλη. Διπλοί κωδικοί και λανθασμένος αριθμός στηλών απορρίπτονται πριν αποθηκευτεί αποτέλεσμα.

## Εκτελέσιμο εργαστήριο — ενσωματωμένη βιβλιοθήκη Python 3
Αποθήκευσε τον κώδικα ως `05_parsing.py` και εκτέλεσέ τον με Python 3. Χρησιμοποιεί μόνο τεχνητά δεδομένα και εμφανίζει PASS αν περάσουν οι έλεγχοι. Ο κώδικας είναι ίδιος και στις δύο γλωσσικές εκδόσεις.

~~~python
import csv, io, re
def import_records(text, limit=2048):
    if len(text.encode("utf-8")) > limit:
        raise ValueError("input too large")
    reader = csv.reader(io.StringIO(text, newline=""), strict=True)
    if next(reader, None) != ["key", "label", "count"]:
        raise ValueError("invalid header")
    output, seen = [], set()
    for row in reader:
        if len(row) != 3 or not re.fullmatch(r"[A-Z][0-9]+", row[0]):
            raise ValueError("invalid row")
        if row[0] in seen or not row[1].strip():
            raise ValueError("duplicate key or blank label")
        if not re.fullmatch(r"(?:0|[1-9][0-9]*)", row[2]):
            raise ValueError("invalid count")
        seen.add(row[0])
        output.append((row[0], row[1], int(row[2])))
    return output
assert import_records('key,label,count\nA1,"red, blue",2\n') == [("A1", "red, blue", 2)]
assert import_records("key,label,count\n") == []
for bad in ('wrong,label,count\n','key,label,count\nA1,x,-1\n',
            'key,label,count\nA1,x,1\nA1,y,2\n',
            'key,label,count\nA1,x\n'):
    try: import_records(bad)
    except ValueError: pass
    else: raise AssertionError("accepted malformed CSV")
print("PASS parsing")
~~~

## Τεχνική εξήγηση
Η csv.reader αναγνωρίζει εισαγωγικά και πεδία που περιέχουν αλλαγές γραμμής, σε αντίθεση με τη χειροκίνητη split(','). Ξεχώρισε το συντακτικό λάθος από τον επιχειρησιακό κανόνα, όπως η μοναδικότητα. Το μέγεθος μετριέται σε byte UTF-8 πριν την ανάλυση για να μην καταναλώνεται απεριόριστη μνήμη. Σωστή ανάλυση CSV δεν σημαίνει ότι το περιεχόμενο είναι ασφαλές για HTML, SQL ή εντολές κελύφους.

## Περιορισμένες ασκήσεις
Πρόσθεσε ετικέτα με αλλαγή γραμμής μέσα σε εισαγωγικά και έλεγξε ότι παραμένει μία λογική εγγραφή. Δοκίμασε ελληνικά γράμματα, διπλό κωδικό, κενή ετικέτα, αρνητικό αριθμό, αρχικά μηδενικά, τέσσερις στήλες και κείμενο μεγαλύτερο από 2048 byte. Για κάθε αποτυχία σημείωσε τον κανόνα που ενεργοποιήθηκε. Πρόσθεσε μέγιστο πλήθος εγγραφών για μικρές αλλά πολυάριθμες γραμμές.

## Διάγνωση και τεκμήρια επιτυχίας
Αν ένα πεδίο σπάει απροσδόκητα, έλεγξε πρώτα τα εισαγωγικά και ότι ανοίγεις αρχείο με newline='' στην Python. Αν το CSV είναι σωστό αλλά απορρίπτεται, αναζήτησε το σφάλμα στους κανόνες δεδομένων. Το μηδενικό πλήθος επιτρέπεται.
