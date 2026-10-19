# Διόρθωση συμβάντων UI, SQL queries και διαδρομών shell

## JavaScript: χαμένος χειριστής συμβάντος

### Λανθασμένο παράδειγμα — ΜΗ ΧΡΗΣΙΜΟΠΟΙΕΙΤΑΙ

```text
container.innerHTML = `<button id="save">Save</button>`;
// old save button listener was attached before innerHTML changed
```

### Διορθωμένο παράδειγμα

```text
container.innerHTML = `<button id="save">Save</button>`;
container.querySelector("#save").addEventListener("click", save);
```

### Αιτία σφάλματος και εξήγηση διόρθωσης

Η αντικατάσταση HTML αφαιρεί listeners από παλιούς κόμβους.

### Πραγματική αιτία
Event listener συνδέεται σε συγκεκριμένο DOM node. Η αντικατάσταση parent μέσω innerHTML φτιάχνει νέα nodes που μοιάζουν ίδια αλλά δεν έχουν παλιούς listeners.

### Επαναλήψιμο regression πείραμα
Πρόσθεσε listener σε button προσωρινής σελίδας, άλλαξε parent markup και έλεγξε click. Διόρθωσε με delegation σε stable ancestor ή reattach μετά το render.

## SQL: μη ασφαλής σύνθεση ερωτήματος

### Λανθασμένο παράδειγμα — ΜΗ ΧΡΗΣΙΜΟΠΟΙΕΙΤΑΙ

```text
query = "SELECT * FROM users WHERE name = '" + user + "'"
```

### Διορθωμένο παράδειγμα

```text
cursor.execute("SELECT * FROM users WHERE name = ?", (user,))
```

### Αιτία σφάλματος και εξήγηση διόρθωσης

Οι δεσμευμένες παράμετροι εμποδίζουν την ερμηνεία δεδομένων ως εντολών SQL.

### Εκτελέσιμη άσκηση SQLite
Η SQL που συντίθεται από μη έμπιστο κείμενο μπορεί να αλλάξει νόημα. Οι δεσμευμένες παράμετροι κρατούν τις τιμές χωριστά από τη σύνταξη SQL. Η βάση βρίσκεται στη μνήμη ώστε η άσκηση να μην αγγίζει πραγματικά δεδομένα.

~~~python
import sqlite3
db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE people (name TEXT PRIMARY KEY)")
db.executemany("INSERT INTO people VALUES (?)", [("Ada",), ("Grace",)])
def find(name):
    return db.execute("SELECT name FROM people WHERE name = ?", (name,)).fetchall()
assert find("Ada") == [("Ada",)]
assert find("Ada'") == []
assert db.execute("SELECT COUNT(*) FROM people").fetchone() == (2,)
db.close()
~~~

Αποθήκευσε ως `query_lab.py` και τρέξε `python3 query_lab.py`. Το εισαγωγικό της δεύτερης αναζήτησης πρέπει να αντιμετωπίζεται ως δεδομένο και όχι ως σύνταξη. Το κόμμα στο `(name,)` φτιάχνει tuple ενός στοιχείου. Η SQLite χρησιμοποιεί `?` placeholders· άλλοι οδηγοί διαφέρουν. Δεν μπορείς να δεσμεύσεις ονόματα πινάκων ή κατεύθυνση ταξινόμησης: χρησιμοποίησε ρητή allowlist.

## Bash: διαδρομή χωρίς εισαγωγικά

### Λανθασμένο παράδειγμα — ΜΗ ΧΡΗΣΙΜΟΠΟΙΕΙΤΑΙ

```text
cd $PROJECT_ROOT
```

### Διορθωμένο παράδειγμα

```text
cd -- "$PROJECT_ROOT"
```

### Αιτία σφάλματος και εξήγηση διόρθωσης

Τα εισαγωγικά προστατεύουν διαδρομές με κενά ή ειδικούς χαρακτήρες.

### Αναπαραγώγιμο τεστ διαδρομών Bash
Χωρίς εισαγωγικά, η επέκταση μεταβλητής μπορεί να προκαλέσει διαχωρισμό λέξεων και ανάπτυξη wildcard. Ένας φάκελος με κενά μετατρέπεται σε πολλά ορίσματα. Τα εισαγωγικά κρατούν ένα όρισμα και το `--` σταματά την ερμηνεία options όπου υποστηρίζεται.

~~~bash
#!/usr/bin/env bash
set -euo pipefail
tmp=$(mktemp -d)
PROJECT_ROOT="$tmp/project alpha"
mkdir -- "$PROJECT_ROOT"
trap 'rmdir -- "$PROJECT_ROOT"; rmdir -- "$tmp"' EXIT
set -- $PROJECT_ROOT
[[ $# -gt 1 ]]  # Η λανθασμένη επέκταση χωρίζει τις λέξεις.
set -- "$PROJECT_ROOT"
[[ $# -eq 1 ]]  # Σωστά: ένα όρισμα.
cd -- "$PROJECT_ROOT"
[[ $PWD == "$PROJECT_ROOT" ]]
printf 'Quoted path works: %s\n' "$PWD"
~~~

Εκτέλεσε `bash path_lab.sh`. Μόνο η επίδειξη των ορισμάτων είναι σκόπιμα χωρίς εισαγωγικά· οι εντολές αρχείων είναι σωστά προστατευμένες. Για προώθηση όλων των ορισμάτων χρησιμοποίησε `"$@"`, όχι `"$*"`. Τα εισαγωγικά δεν επικυρώνουν από μόνα τους μια διαδρομή ούτε κάνουν ασφαλείς τις καταστροφικές εντολές.
