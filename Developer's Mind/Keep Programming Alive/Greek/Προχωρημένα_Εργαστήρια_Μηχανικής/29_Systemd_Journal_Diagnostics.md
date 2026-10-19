# Η κατάσταση active δεν εγγυάται ότι μια υπηρεσία εξυπηρετεί σωστά

## Ανακατασκεύασε το χρονολόγιο
Σε κανονική εγκατάσταση Linux με systemd, το `systemctl status` δείχνει κατάσταση και πρόσφατα μηνύματα. Το `journalctl -u` μπορεί να δώσει τη σειρά αποτυχίας με timestamps. Εξέτασε πρώτα το unit και τον δηλωμένο working directory. Μία υπηρεσία που φαίνεται `active (running)` μπορεί να μην μπορεί να ανταποκριθεί σε κανένα αίτημα.

~~~sh
systemctl status example.service --no-pager
systemctl cat example.service
journalctl -u example.service -n 80 --no-pager
systemctl show example.service -p User -p WorkingDirectory -p ExecStart
~~~

## Τέσσερις πιθανές αιτίες
Το ExecStart μπορεί να δείχνει λάθος binary, ο service user να μην έχει δικαίωμα αρχείων, οι environment variables να λείπουν ή το πρόγραμμα να κρασάρει μετά την εκκίνηση. Κατάγραψε το πρώτο σχετικό μήνυμα και τον πραγματικό χρήστη της διεργασίας. Εντολή που λειτουργεί στο προσωπικό shell μπορεί να βασίζεται σε alias ή PATH που η υπηρεσία δεν διαθέτει. Μη δίνεις root δικαιώματα χωρίς ανάγκη.

## Ασφαλές εκπαιδευτικό fixture
Δημιούργησε προσωρινό user service που εκτυπώνει τον working directory και τερματίζει σκόπιμα με μη μηδενικό status. Παρατήρησε το αποτέλεσμα μέσω journal και διόρθωσε μόνο τη σχετική διαδρομή. Στο Termux proot μην υποθέτεις ότι τρέχει systemd ως PID 1· σε τέτοιο περιβάλλον ισχύει διαφορετικός τρόπος διαχείρισης διεργασιών.

## Κριτήριο επίλυσης
Κράτησε unit path, state, service user, πρώτη ώρα σφάλματος, log χωρίς ευαίσθητα στοιχεία και μία πραγματικά επιτυχημένη λειτουργία εφαρμογής. Restart επιτρέπεται μόνο όταν έχει εγκριθεί, επειδή μπορεί να διακόψει ενεργούς χρήστες.
## Κατάλογος εργασίας και περιβάλλον διαφορετικά από διαδραστικό κέλυφος

Μια υπηρεσία που δουλεύει σε τερματικό μπορεί να αποτύχει στον διαχειριστή υπηρεσιών λόγω άλλου χρήστη, καταλόγου, PATH ή περιβάλλοντος. Τα αρχεία εκκίνησης κελύφους δεν είναι καθολική διεπαφή ρυθμίσεων υπηρεσίας. Χρησιμοποίησε ρητά εκτελέσιμα και τεκμηριωμένες εισόδους αντί διαδραστικής συνεδρίας διαχειριστή.

Στη σύγκριση εμφάνισε επιλεγμένα μη μυστικά στοιχεία. Πλήρης εκτύπωση περιβάλλοντος μπορεί να εκθέσει tokens. Το δείγμα απομονώνει παιδί με ελεγχόμενο περιβάλλον και κατάλογο, δείχνοντας γιατί σχετικό όνομα ή κληρονομημένη τιμή αλλάζει συμπεριφορά.

```python
import os, subprocess, sys, tempfile
with tempfile.TemporaryDirectory() as folder:
    result=subprocess.run([sys.executable,"-c",
        "import os; print(os.getcwd()); print(os.environ.get('APP_MODE'))"],
        cwd=folder,env={"APP_MODE":"fixture"},text=True,capture_output=True,
        timeout=2,check=True)
    lines=result.stdout.splitlines()
    assert lines == [folder,"fixture"]
print("service inputs explicit")
```

Πρόκειται για υποδιεργασία και όχι ισχυρισμό ύπαρξης systemd σε Android. Σε πραγματική μονάδα εξέτασε χρήστη, WorkingDirectory, ExecStart και άδειες αρχείου περιβάλλοντος. Περιόρισε καταγραφές και απόκρυψε μυστικά πριν μοιραστείς διαγνωστικά.

[Τεχνική αναφορά](https://www.freedesktop.org/software/systemd/man/latest/systemd.exec.html)
