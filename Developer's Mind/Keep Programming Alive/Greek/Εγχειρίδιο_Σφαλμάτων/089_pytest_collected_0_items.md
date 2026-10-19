# Pytest: ανακάλυψη tests, fixtures και συγκρούσεις θυρών

## pytest collected 0 items

### Ερμηνεία και διαφορική διάγνωση
Το pytest μπορεί να μη βρίσκει τεστ λόγω ονομάτων αρχείων ή συναρτήσεων, ρυθμίσεων testpaths ή λάθος working directory. Το σφάλμα κατά το collection διαφέρει από ένα πραγματικά κενό suite. Μη θεωρείς επιτυχία CI ένα run που δεν εκτέλεσε κανένα test.

### Αναπαραγωγή / έλεγχος χωρίς απώλεια δεδομένων
~~~python
# Save as test_arithmetic.py; requires pytest.
def add(a, b):
    return a + b

def test_add_integers():
    assert add(2, 3) == 5

def test_add_negative():
    assert add(-2, 2) == 0
~~~

### Ερμηνεία αποτελεσμάτων και διόρθωση
Τρέξε python3 -m pytest --collect-only -q από τη ρίζα. Έλεγξε pyproject.toml, pytest.ini ή setup.cfg για python_files, python_functions και testpaths. Βεβαιώσου ότι εμφανίζονται τα αναμενόμενα node IDs. Συνήθως exit code 5 σημαίνει μηδέν tests· άλλο μη μηδενικό αποτέλεσμα μπορεί να σημαίνει αποτυχία import ή collection.

### Πρακτικό εργαστήριο
Μετονόμασε το αρχείο σε arithmetic_checks.py και έλεγξε ότι το αυτόματο discovery δεν το βρίσκει. Εκτέλεσε pytest --collect-only -q με ρητή διαδρομή και εξήγησε τη διαφορά. Πρόσθεσε CI έλεγχο ότι συλλέχθηκε συγκεκριμένο κρίσιμο test.

## pytest fixture not found

### Ερμηνεία και διαφορική διάγνωση
Το pytest αντιμετωπίζει τις παραμέτρους μιας test function ως αιτήματα fixtures. Ένα typo, ένα conftest.py εκτός ορατής διαδρομής, ένα plugin που λείπει ή ασύμβατα scopes μπορούν να προκαλέσουν αποτυχία. Μια απλή μεταβλητή με ίδιο όνομα δεν είναι αυτόματα fixture.

### Αναπαραγωγή / έλεγχος χωρίς απώλεια δεδομένων
~~~python
# Save as test_catalog.py; requires pytest.
import pytest

@pytest.fixture
def catalog():
    return {"books": ["Algorithms", "Networks"]}

def test_catalog_has_books(catalog):
    assert "Algorithms" in catalog["books"]
    assert len(catalog["books"]) == 2
~~~

### Ερμηνεία αποτελεσμάτων και διόρθωση
Διάβασε το ακριβές όνομα του fixture και δες τα διαθέσιμα με python3 -m pytest --fixtures -q. Εξέτασε τη θέση του conftest.py σε σχέση με το test: fixtures από άλλο παράλληλο υποδέντρο δεν είναι αυτόματα ορατά. Τα plugin fixtures εξαρτώνται από τον ενεργό interpreter. Προτίμησε σαφή setup/teardown και περιορισμένο scope.

### Πρακτικό εργαστήριο
Μετονόμασε τη fixture function catalog σε catalogue χωρίς αλλαγή της test παραμέτρου και δες τη διάγνωση. Επανέφερε το όνομα και μετέφερε το fixture σε conftest.py, ώστε να το χρησιμοποιούν δύο tests του ίδιου καταλόγου.

## address already in use

### Ερμηνεία και διαφορική διάγνωση
Το EADDRINUSE σημαίνει συνήθως ότι ο συνδυασμός τοπικής διεύθυνσης και θύρας έχει δεσμευθεί. Μπορεί να τρέχει δεύτερη εφαρμογή ή server σε όλα τα interfaces, ή να υπάρχει διαφορά IPv4/IPv6. Σε ορισμένες συνθήκες επηρεάζουν και sockets που έκλεισαν πρόσφατα. Δεν είναι ασφαλές να σκοτώνεις αυθαίρετα όποια διεργασία βλέπεις στη θύρα.

### Αναπαραγωγή / έλεγχος χωρίς απώλεια δεδομένων
~~~python
import errno
import socket
first = socket.socket()
second = socket.socket()
try:
    first.bind(("127.0.0.1", 0))  # OS chooses a free port.
    port = first.getsockname()[1]
    try:
        second.bind(("127.0.0.1", port))
    except OSError as exc:
        assert exc.errno == errno.EADDRINUSE
    else:
        raise AssertionError("duplicate bind accepted")
finally:
    first.close()
    second.close()
~~~

### Ερμηνεία αποτελεσμάτων και διόρθωση
Επιθεώρησε listeners με ss -ltnp σε Linux/Termux όπου υποστηρίζεται ή με lsof -iTCP -sTCP:LISTEN. Επιβεβαίωσε ποια διεργασία κατέχει τη θύρα πριν τη σταματήσεις. Έλεγξε 127.0.0.1 έναντι 0.0.0.0, port mappings containers και IPv6. Το SO_REUSEADDR δεν επιτρέπει γενικά δύο ενεργούς servers στην ίδια θύρα.

### Πρακτικό εργαστήριο
Επανέλαβε το παράδειγμα καταγράφοντας την τυχαία θύρα και το errno. Έπειτα ξεκίνα έναν τοπικό test server, δοκίμασε δεύτερο στην ίδια θύρα, σταμάτα μόνο τον γνωστό πρώτο server και έλεγξε τη νέα σύνδεση.
