# Γλωσσάρι: data races, deadlocks και debugging

## Data race

### Τι σημαίνει στην πράξη
Data race υπάρχει όταν διαφορετικές εκτελέσεις προσπελαύνουν κοινή μεταβλητή χωρίς σωστό συγχρονισμό και τουλάχιστον μία γράφει. Σε ορισμένες γλώσσες οδηγεί σε undefined behavior, ενώ και στην Python οι multi-step updates δεν εγγυώνται atomicity.

### Συγκεκριμένο παράδειγμα
~~~python
from threading import Lock
value = 0
lock = Lock()
def safe_increment():
    global value
    with lock: value += 1
~~~

### Άσκηση και συχνή παγίδα
Τρέξε πολλές ασφαλείς αυξήσεις στον ίδιο counter και επιβεβαίωσε το σύνολο. Εξήγησε γιατί ένα `sleep` δεν παρέχει συγχρονισμό. Σύγκρινε shared mutex state με ανταλλαγή immutable messages.

**Αναφορά:** https://docs.python.org/3/library/threading.html#lock-objects

## Deadlock

### Τι σημαίνει στην πράξη
Deadlock υπάρχει όταν tasks περιμένουν πόρους σε κύκλο και καμία δεν μπορεί να συνεχίσει. Δύο threads με αντίστροφη σειρά locks είναι κλασικό παράδειγμα. Ένα αργό task δεν αποδεικνύει deadlock· χρειάζεται wait-for cycle.

### Συγκεκριμένο παράδειγμα
~~~python
from threading import Lock
first, second = Lock(), Lock()
def do_work():
    with first:
        with second:
            return 'ok'
assert do_work() == 'ok'
~~~

### Άσκηση και συχνή παγίδα
Κατέγραψε ενιαία σειρά απόκτησης locks για όλες τις διαδρομές. Σχεδίασε το επικίνδυνο αντίστροφο lock order χωρίς να εκτελέσεις πρόγραμμα που κολλά επ' αόριστον. Μελέτησε timeouts και graceful failure.

**Αναφορά:** https://docs.python.org/3/library/threading.html#lock-objects

## Debugging

### Τι σημαίνει στην πράξη
Το debugging εντοπίζει ποιος μηχανισμός προκαλεί απόκλιση από τις προδιαγραφές. Δεν είναι τυχαίες αλλαγές μέχρι να χαθεί το σύμπτωμα. Ένα minimal reproducer, η σύγκριση expected/actual και το regression test δίνουν ελέγξιμη εξήγηση.

### Συγκεκριμένο παράδειγμα
~~~python
def average(values):
    if not values: return None
    return sum(values) / len(values)
assert average([]) is None
assert average([2, 4]) == 3
~~~

### Άσκηση και συχνή παγίδα
Δημιούργησε ελαττωματική έκδοση που διαιρεί με μηδέν σε κενή λίστα. Δήλωσε το invariant και πρόσθεσε regression test πριν από τη διόρθωση. Σε UI bug κράτησε και βήματα αναπαραγωγής/browser version.

**Αναφορά:** https://docs.python.org/3/library/pdb.html

## Dependency

### Τι σημαίνει στην πράξη
Dependency είναι στοιχείο απαραίτητο για build, runtime ή tests. Άμεσες εξαρτήσεις δηλώνονται ρητά, ενώ transitive έρχονται μέσω άλλων. Version ranges, lockfiles και platform compatibility επηρεάζουν την αναπαραγωγιμότητα.

### Συγκεκριμένο παράδειγμα
~~~sh
python -m pip --version
python -m pip list --format=freeze
# inspect the local environment; these commands install nothing
~~~

### Άσκηση και συχνή παγίδα
Σύγκρινε pinned με unpinned requirements σε προσωρινό virtual environment. Κράτησε ξεχωριστά τις άμεσες εξαρτήσεις από το πλήρες resolved graph. Μην εγκαθιστάς package μόνο επειδή το όνομα μοιάζει με error· έλεγξε publisher.

**Αναφορά:** https://packaging.python.org/en/latest/discussions/install-requires-vs-requirements/
