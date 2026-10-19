# python — συγκεντρωτικός οδηγός

## Python

**Συνήθης χρήση:** Γλώσσες γενικής χρήσης.

**Προτεινόμενη επέκταση αρχείου:** `.py`.

**Εκτέλεση / περιβάλλον:** python hello.py.

### Αρχικό παράδειγμα

```python
def greet(name):
    return f"Hello, {name}!"

for person in ["Ada", "Grace"]:
    print(greet(person))
```

### Πώς διαβάζεται

Η εσοχή ορίζει τα μπλοκ· οι συναρτήσεις επιστρέφουν τιμές.

### Συνηθισμένο λάθος

Η εσοχή ορίζει τα μπλοκ· οι συναρτήσεις επιστρέφουν τιμές. Έλεγξε την έκδοση διερμηνευτή/μεταγλωττιστή και μην εκλαμβάνεις το δείγμα ως έτοιμη εφαρμογή παραγωγής.

### Από αρχικό script σε πρόγραμμα με tests
Η Python είναι πιο εύχρηστη όταν διαχωρίζεις λογική από I/O. Ένα μικρό report μετρά κατηγορίες:
```python
from collections import Counter
def count_events(lines):
    return Counter(line.strip() for line in lines if line.strip())
assert count_events(["open\n","save\n","open\n"])=={"open":2,"save":1}
```
Έπειτα διάβασε γραμμές με `Path(file).read_text(encoding="utf-8").splitlines()` και χειρίσου `FileNotFoundError` στο CLI. Για dependencies χρησιμοποίησε `python -m venv .venv` όπου υποστηρίζεται. Στο Termux μην αντιγράφεις άκριτα Debian οδηγίες για `python3-venv`.

**Εμβάθυνση:** iterators έναντι lists, mutability, context managers, exceptions, type hints που δεν επιβάλλονται από μόνα τους, tests. **Άσκηση:** διάβασε 10.000 γραμμές CSV, μέτρησε events, απόρριψε malformed rows με αριθμό γραμμής και πρόσθεσε τρία `unittest`. Πηγές: https://docs.python.org/3/tutorial/ και https://docs.python.org/3/library/unittest.html.

### Ουσιαστική άσκηση Python: parser με ελέγχους

Η Python διευκολύνει μικρές συναρτήσεις, exceptions και unit tests. Φτιάξε αναγνώστη αριθμητικών ID χωρίς εξωτερικά πακέτα:

~~~python
def parse_ids(text):
    result = []
    for line_number, raw in enumerate(text.splitlines(), 1):
        value = raw.strip()
        if not value or value.startswith("#"):
            continue
        try:
            number = int(value)
        except ValueError as exc:
            raise ValueError(f"line {line_number}: not an integer") from exc
        if number < 0:
            raise ValueError(f"line {line_number}: negative identifier")
        result.append(number)
    return result

assert parse_ids("4\n#note\n 7 ") == [4, 7]
~~~

Προέβλεψε συμπεριφορά για κενό κείμενο, σχόλια, κενά, -1, μη αριθμό και διπλά ID. Αποφάσισε αν επιτρέπονται διπλοεγγραφές *πριν* αλλάξεις το πρόγραμμα. Η εξαίρεση δείχνει τον τύπο σφάλματος, ενώ το frame του δικού σου κώδικα δείχνει ποια παραδοχή απέτυχε.

Έπειτα άλλαξε την υλοποίηση ώστε να επιστρέφει generator και εξήγησε γιατί χρησιμοποιεί λιγότερη μνήμη σε μεγάλα streams, αλλά μπορεί να καθυστερεί τις εξαιρέσεις έως την επανάληψη. Έλεγξε ίδια έξοδο με tests· χωρίς μέτρηση δεν αποδεικνύεται κέρδος ταχύτητας.

Για project χρησιμοποίησε python -m venv .venv όπου υποστηρίζεται και έλεγξε python -m pip --version πριν εγκαταστήσεις dependencies. Σε Termux οι διαθέσιμες εκδόσεις/wheels μπορεί να διαφέρουν από desktop.

**Κριτήριο:** έξι ελεγμένες είσοδοι και σαφής εξήγηση της chained ValueError. Πηγές: https://docs.python.org/3/tutorial/errors.html και https://docs.python.org/3/library/venv.html.

## Python — Αναλυτικός οδηγός εξάσκησης

### Πρόβλημα και σύμβαση δεδομένων
Ένα κόμμα μέσα σε εισαγωγικά ανήκει στην τιμή του πεδίου. Το str.split(",") καταστρέφει τη δομή. Ο csv.DictReader διαβάζει σωστά τη μορφή, ενώ οι δικοί μας κανόνες ελέγχουν αυστηρά τις δύο στήλες και την κατάσταση κάθε εγγραφής.

### Εκτέλεση
Αποθήκευσε ως parser.py και τρέξε python parser.py χωρίς επιπλέον πακέτα. Αναμενόμενη έξοδος: parser OK. Το όνομα Ada, Jr παραμένει ένα πεδίο.

~~~python
import csv
from io import StringIO
def summarize(text):
    reader = csv.DictReader(StringIO(text))
    if reader.fieldnames != ["name", "status"]:
        raise ValueError("wrong header")
    counts = {"ok": 0, "fail": 0}
    for record, row in enumerate(reader, 2):
        if None in row:
            raise ValueError(f"extra value at record {record}")
        name = (row["name"] or "").strip()
        status = (row["status"] or "").strip().lower()
        if not name or status not in counts:
            raise ValueError(f"invalid record {record}")
        counts[status] += 1
    return counts
assert summarize('name,status\n"Ada, Jr",ok\nGrace,FAIL\n') == {"ok": 1, "fail": 1}
for broken in ("name,status\n,ok\n", "name,status\nA,other\n", "name,status\nA,ok,extra\n"):
    try:
        summarize(broken)
    except ValueError:
        continue
    raise AssertionError("bad record accepted")
print("parser OK")
~~~

### Έλεγχοι ορίων
Ο αριθμός record στον βρόχο αφορά λογικές εγγραφές και όχι απαραίτητα φυσικές γραμμές. Για τη φυσική γραμμή δες reader.line_num. Πρόσθεσε δοκιμές με άδειο αρχείο, ελλιπή κατάσταση, επαναλαμβανόμενα ονόματα, ελληνικούς χαρακτήρες και αλλαγή γραμμής μέσα σε πεδίο εισαγωγικών. Αποφάσισε αν οι επαναλήψεις επιτρέπονται.

### Προχωρημένη άσκηση
Πέρασε ανοιχτό file handle αντί ολόκληρου κειμένου. Άνοιξε αρχείο με encoding="utf-8", newline="" και χρησιμοποίησε argparse. Χειρίσου το FileNotFoundError μόνο στο CLI, ώστε ο parser να παραμένει ελέγξιμος. Δοκίμασε 100.000 γραμμές χωρίς να δημιουργείς δεύτερη λίστα δεδομένων.

### Διάγνωση
Αν υπάρχει δικό σου csv.py, μπορεί να σκιάζει την standard library. Σε UnicodeDecodeError βρες την πραγματική κωδικοποίηση, μη διαγράφεις bytes αυθαίρετα. Για κακοσχηματισμένα εισαγωγικά διερεύνησε τη ρύθμιση reader.strict=True.
Επιτυχία: μετρήσεις 1/1 και απόρριψη τριών λανθασμένων εγγραφών. https://docs.python.org/3/library/csv.html

## Python — Παραδείγματα πραγματικού κώδικα

### Εκτέλεση των παραδειγμάτων

Τα παραδείγματα είναι μικρά και αυτοτελή. Χρησιμοποίησε τη σχετική εγκατεστημένη γλώσσα. Ενδεικτικά: `python3 {file}`. Μη συγχέεις τα ονόματα αρχείων με αυτόματη εγκατάσταση. Δούλεψε σε δοκιμαστικό φάκελο.


## Python — Διαδρομή ουσιαστικής εξάσκησης

### Τι θα κατασκευάσεις
Θα φτιάξεις έναν μικρό εισαγωγέα λογιστικών εγγραφών. Διαβάζει CSV από ροή κειμένου που του δίνεται ως παράμετρος, ελέγχει κάθε εγγραφή, αθροίζει χρηματικά ποσά χωρίς σφάλματα κινητής υποδιαστολής και αντικαθιστά την παλιά αναφορά JSON μόνο όταν ολοκληρωθούν όλοι οι έλεγχοι. Η επικεφαλίδα είναι id,amount,note. Το κόμμα και η αλλαγή γραμμής μέσα σε πεδίο με εισαγωγικά είναι νόμιμα· τα διπλά αναγνωριστικά και τα ποσά με τρία δεκαδικά ψηφία απορρίπτονται.

### Εκτέλεση
Αποθήκευσε ως csv_lab.py και εκτέλεσε python3 csv_lab.py ή py -3 csv_lab.py στα Windows. Το πρόγραμμα χρησιμοποιεί μόνο την τυπική βιβλιοθήκη, δεν επικοινωνεί με δίκτυο και γράφει μόνο σε προσωρινό κατάλογο. Η ένδειξη PASS εμφανίζεται αν ολοκληρωθούν οι έλεγχοι. Μην χρησιμοποιήσεις την επιλογή -O: παραλείπει τις εντολές assert.

~~~python
import csv
import io
import json
import os
import re
import tempfile
from decimal import Decimal
from pathlib import Path

IDENT = re.compile(r"[\w-]{1,24}\Z", re.UNICODE)
MONEY = re.compile(r"(?:0|[1-9][0-9]{0,5})\.[0-9]{2}\Z")

def summarize(stream):
    reader = csv.reader(stream, strict=True)
    if next(reader, None) != ["id", "amount", "note"]:
        raise ValueError("header must be id,amount,note")
    seen, total = set(), Decimal("0.00")
    for fields in reader:
        if len(fields) != 3:
            raise ValueError(f"row ending on line {reader.line_num}: expected 3 columns")
        ident, raw, note = fields
        if not IDENT.fullmatch(ident) or ident.strip() != ident:
            raise ValueError(f"line {reader.line_num}: invalid id")
        if ident in seen:
            raise ValueError(f"line {reader.line_num}: duplicate id")
        if not MONEY.fullmatch(raw):
            raise ValueError(f"line {reader.line_num}: amount needs exact cents")
        if len(note) > 80 or "\x00" in note:
            raise ValueError(f"line {reader.line_num}: invalid note")
        seen.add(ident)
        total += Decimal(raw)
    if not seen:
        raise ValueError("empty import")
    return {"rows": len(seen), "total": str(total)}

def publish(stream, target):
    summary = summarize(stream)  # No output is opened before validation succeeds.
    target, temporary = Path(target), None
    try:
        with tempfile.NamedTemporaryFile("w", encoding="utf-8", newline="\n",
                dir=target.parent, prefix=".csv-lab-", delete=False) as out:
            temporary = Path(out.name)
            json.dump(summary, out, ensure_ascii=False, sort_keys=True)
            out.write("\n")
            out.flush()
            os.fsync(out.fileno())
        os.replace(temporary, target)  # Same-directory atomic replacement.
    finally:
        if temporary is not None:
            temporary.unlink(missing_ok=True)
    return summary

def test():
    good = 'id,amount,note\nΔοκιμή-1,12.50,"quoted, comma"\nB2,0.01,"two\nlines"\n'
    with tempfile.TemporaryDirectory() as directory:
        target = Path(directory) / "report.json"
        assert publish(io.StringIO(good), target) == {"rows": 2, "total": "12.51"}
        previous = target.read_bytes()
        bad = [
            'id,amount,note\nA1,1.00,ok\nA1,2.00,duplicate\n',
            'id,amount,note\nA1,1.001,not cents\n',
            'id,amount,note\nA1,1.00,"unclosed\n',
            'id,amount,note\nA1,1.00\n',
            'id,amount,note\n',
            'id,amount,note\nA1,1000000.00,too large\n',
        ]
        for sample in bad:
            try:
                publish(io.StringIO(sample), target)
                raise AssertionError("invalid import was accepted")
            except (ValueError, csv.Error):
                assert target.read_bytes() == previous, "report was overwritten"
        assert json.loads(previous) == {"rows": 2, "total": "12.51"}
    print("PASS: quoted/multiline CSV, exact cents, six rejections, atomic report")

if __name__ == "__main__":
    test()
~~~

### Εξήγηση των κρίσιμων σημείων
Η csv.reader με strict=True καταλαβαίνει τα εισαγωγικά και μετρά φυσικές γραμμές. Αν χώριζες το αρχείο μόνος σου στα κόμματα ή στις αλλαγές γραμμής, θα κατέστρεφες τη δοκιμή με την πολυγραμμική σημείωση. Η Decimal υπολογίζει ακριβή δεκαδικά ποσά, ενώ η κανονική έκφραση απαιτεί ακριβώς δύο ψηφία για τα λεπτά αντί να στρογγυλοποιεί κρυφά. Το σύνολο seen κρατά μόνο τα αναγνωριστικά, όχι όλες τις εγγραφές. Η μνήμη όμως εξακολουθεί να αυξάνεται με τα διαφορετικά IDs· για τεράστιες εισαγωγές χρειάζεται έλεγχος μοναδικότητας σε βάση δεδομένων.

Η publish επικυρώνει πρώτα ολόκληρη την είσοδο. Έπειτα δημιουργεί προσωρινό αρχείο δίπλα στον προορισμό και καλεί os.replace. Έτσι, μια λανθασμένη εγγραφή δεν αντικαθιστά την προηγούμενη αναφορά. Η ατομική αντικατάσταση δεν εγγυάται από μόνη της αντοχή σε διακοπή ρεύματος σε κάθε σύστημα αρχείων. Αν λείπει ο κατάλογος προορισμού ή δεν υπάρχουν δικαιώματα εγγραφής, πρέπει να εμφανιστεί το πραγματικό σφάλμα του λειτουργικού.

### Στοχευμένες δοκιμές
1. Άλλαξε τη σειρά της επικεφαλίδας σε amount,id,note. Εξήγησε γιατί απορρίπτεται πριν διαβαστεί εγγραφή.
2. Επανάλαβε το αναγνωριστικό Δοκιμή-1 και δοκίμασε ποσό 1.001. Σύγκρινε τα bytes της παλιάς αναφοράς πριν και μετά.
3. Βάλε αλλαγή γραμμής μέσα σε σημείωση με εισαγωγικά. Σύγκρινε την reader.line_num με το πλήθος των λογικών εγγραφών.
4. Παρήγαγε 100.000 τεχνητές εγγραφές και μέτρησε τη μνήμη. Εξήγησε γιατί μεγαλώνει το σύνολο αναγνωριστικών.
5. Δοκίμασε ανύπαρκτο κατάλογο εξόδου και κατάλογο χωρίς άδεια εγγραφής. Ξεχώρισε τα σφάλματα εισόδου από τα σφάλματα του δίσκου.

### Επόμενο εργαστήριο
Χώρισε τις συναρτήσεις summarize και publish σε ξεχωριστό άρθρωμα και πρόσθεσε argparse για τις διαδρομές αρχείων. Έλεγξε κενό CSV, BOM UTF-8, διπλό ID, ανολοκλήρωτα εισαγωγικά, ποσό 999999.99 και ποσό πάνω από το όριο. Αποφάσισε αν θα υποστηρίζεις BOM πριν αλλάξεις τον κώδικα. Παράδωσε πραγματικά αποτελέσματα δοκιμών και εξήγησε πότε απαιτείται συναλλαγή βάσης δεδομένων αντί για os.replace.

## Python — Τεχνικά σημεία και συχνές παγίδες

### Τεχνική γνώση

1. Η εσοχή ορίζει μπλοκ· η μεταβολή κοινής συλλογής μπορεί να επηρεάσει άλλες συναρτήσεις.
2. Οι εξαιρέσεις δίνουν traceback· χρησιμοποίησε context manager για κλείσιμο πόρων.
3. Οι generators παράγουν τιμές σταδιακά· οι async συναρτήσεις δεν επιταχύνουν αυτόματα βαρείς υπολογισμούς.

## Visual Basic .NET

### Βασική ιδέα
Η VB.NET είναι γλώσσα .NET με ξεχωριστή σύνταξη modules, classes και event handling.

### Μικρό εκπαιδευτικό απόσπασμα
```text
Module Program
  Sub Main()
    Console.WriteLine(2 + 3)
  End Sub
End Module
```

### Άσκηση βασισμένη στη συγκεκριμένη συμπεριφορά
Παρακολούθησε το entry point και σύγκρινε Option Strict On με implicit μετατροπές.

### Διάγνωση και όρια
Η VB.NET δεν είναι VBA ή VBScript· ξεχώρισε .NET assemblies από Office macros.

Κάνε την άσκηση με πραγματικά δοκιμαστικά δεδομένα και με έκδοση Visual_Basic_NET που ταιριάζει στον κώδικα. Σημείωσε μία αρχική πρόβλεψη και την πραγματική έξοδο. Για περίπλοκο ή μη διαθέσιμο runtime, παρουσίασε τη στατική ανάλυση ως τέτοια, όχι ως επιτυχημένη εκτέλεση. Δοκίμασε ξεχωριστά την κανονική περίπτωση και μία οριακή τιμή, χωρίς πραγματικά προσωπικά ή παραγωγικά δεδομένα.

## Visual_Basic_NET — Διαδρομή ουσιαστικής εξάσκησης

### Εξειδικευμένες ασκήσεις με τεκμήρια
Ενεργοποίησε Option Strict On σε VB.NET console project και κάνε parsing bounded integer μέσω Integer.TryParse.

Χρησιμοποίησε Select Case με status enum, κάλυψε Unknown και σύγκρινε nullable με default integers χωρίς implicit casts.

Δημιούργησε read-only CSV report με Using blocks. Δοκίμασε missing file, encoding και κενά records, καταγράφοντας .NET target.

## Κοινές αρχές εξάσκησης

Διάβασε το συγκεκριμένο δείγμα της γλώσσας και μελέτησε τον τρόπο εκτέλεσης πριν από την άσκηση. Πρόβλεψε έξοδο, τροποποίησε ένα χαρακτηριστικό, δοκίμασε εσφαλμένη είσοδο, κράτησε την πραγματική έξοδο και σημείωσε έκδοση μεταγλωττιστή ή περιβάλλοντος. Τα ειδικά θέματα κάθε γλώσσας βρίσκονται στα δικά της αρχεία· η κοινή μέθοδος διατηρείται εδώ μία φορά.

### Έξι σημεία ελέγχου

1. Έκδοση και διαθέσιμα εργαλεία.
2. Ελάχιστο αρχείο που γίνεται δεκτό.
3. Αναμενόμενο αποτέλεσμα πριν την εκτέλεση.
4. Πραγματικό αποτέλεσμα ή σαφές «δεν δοκιμάστηκε».
5. Ένα ασφαλές ακραίο σενάριο.
6. Εξήγηση του λόγου που δούλεψε ή απέτυχε.

## <Όνομα γλώσσας>

### Σκοπός
Πού χρησιμοποιείται συνήθως η γλώσσα.

### Εργαλεία
Μεταγλωττιστής/διερμηνευτής και έκδοση που πρέπει να ελεγχθεί.

### Βασική σύνταξη
Απλό επαληθευμένο πρόγραμμα με έκδοση και έξοδο.

### Λυμένο μάθημα
Εξήγησε είσοδο, μεταβλητές, συνθήκες, επανάληψη και έξοδο όπου υπάρχουν.

### Άσκηση και διορθωμένη λύση
Άσκηση για δοκιμή και ελεγμένη απάντηση.

### Συνήθη λάθη και συμβατότητα
Έκδοση, τύποι δεδομένων και περιορισμοί πλατφόρμας.

### Πηγές
Επίσημη τεκμηρίωση και ημερομηνία επανελέγχου.
## Όρια υποδιεργασιών: ορίσματα, κατάσταση εξόδου και προθεσμίες

Η λίστα ορισμάτων διατηρεί το όριο εκτελέσιμου και κάθε τιμής. Ένα όρισμα με κενά παραμένει μία τιμή και δεν γίνεται δεύτερη εντολή. Η ερμηνεία κελύφους είναι ξεχωριστή δυνατότητα που χρειάζεται μόνο όταν απαιτείται η γραμματική του. Μη φτιάχνεις συμβολοσειρά κελύφους από όνομα αρχείου χρήστη ή μήνυμα.

Μια υποδιεργασία έχει τουλάχιστον τρία αποτελέσματα: επιτυχή έξοδο, μη μηδενική έξοδο και υπέρβαση χρόνου. Η επιτυχής εκκίνηση δεν αποδεικνύει επιτυχία εργασίας. Σε υπηρεσία περιόρισε την έξοδο, επειδή το capture_output κρατά τα πάντα στη μνήμη. Το δείγμα χρησιμοποιεί τον ίδιο διερμηνευτή Python και περνά ένα δύσχρηστο όνομα ως αδρανή δεδομένα.

```python
import subprocess, sys
name = "report; this is data.txt"
run = subprocess.run([sys.executable, "-c", "import sys; print(sys.argv[1])", name],
                     text=True, capture_output=True, timeout=2, check=True)
assert run.stdout.strip() == name
failed = subprocess.run([sys.executable, "-c", "raise SystemExit(7)"], timeout=2)
assert failed.returncode == 7
print("argument and exit boundaries verified")
```

Πρόσθεσε παιδί που κοιμάται πέρα από την προθεσμία και έλεγξε TimeoutExpired. Αν δημιουργεί απογόνους, όρισε ακύρωση όλης της ομάδας διεργασιών· το σταμάτημα ενός γονέα δεν εγγυάται καθαρισμό δέντρου. Μην καταγράφεις πλήρη ορίσματα όταν περιέχουν διαπιστευτήρια.

[Τεχνική αναφορά](https://docs.python.org/3/library/subprocess.html)
