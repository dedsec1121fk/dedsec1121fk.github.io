# Διάγνωση λογισμικού: stack traces, καταγραφές και έλεγχοι

## Ιχνηλάτηση κλήσεων

### Πρακτική εξήγηση
Το stack trace δείχνει call frames κατά την αποτυχία. Ξεκίνα από το exception και βρες το πιο σχετικό frame του δικού σου κώδικα, ξεχωρίζοντας αιτία από propagation.

### Παράδειγμα
~~~python
def read_score(data): return int(data['score'])
def handle(data): return read_score(data)
try: handle({'score':'oops'})
except ValueError as exc: assert 'invalid' in str(exc)
~~~

### Πραγματική άσκηση
Κατέγραψε traceback με δοκιμαστική είσοδο. Σύγκρινε με broad except που κρύβει την αιτία και δείξε σωστό exception chaining.

### Έλεγχος συμβολαίου
Για Stack traces εξήγησε πώς ο caller ξεχωρίζει έγκυρο αποτέλεσμα από silent failure. Δοκίμασε normal και boundary input και σημείωσε έκδοση και αποτέλεσμα.

## Καταγραφή και παρατηρησιμότητα

### Πρακτική εξήγηση
Logs καταγράφουν events, metrics συνοψίζουν αριθμητικά signals και traces συνδέουν operations μεταξύ components. Μαζί βοηθούν στη διάγνωση αλλά έχουν διαφορετικό ρόλο και απαιτούν privacy controls.

### Παράδειγμα
~~~python
import logging
logging.basicConfig(level=logging.INFO)
logging.info('batch completed count=%d',3)
~~~

### Πραγματική άσκηση
Πρόσθεσε correlation ID και timing metric για συνθετικό batch. Μην αποθηκεύεις tokens και πραγματικά προσωπικά δεδομένα στα logs.

### Έλεγχος συμβολαίου
Για Logging and observability εξήγησε πώς ο caller ξεχωρίζει έγκυρο αποτέλεσμα από silent failure. Δοκίμασε normal και boundary input και σημείωσε έκδοση και αποτέλεσμα.

## Μονάδες, ενσωμάτωση και πλήρεις δοκιμές

### Πρακτική εξήγηση
Unit test απομονώνει function, integration ελέγχει boundaries όπως database και end-to-end ελέγχει ολόκληρη user flow. Βρίσκουν διαφορετικά bugs και έχουν διαφορετικό κόστος.

### Παράδειγμα
~~~python
def normalize(text):return text.strip().casefold()
assert normalize(' Ada ')=='ada'
~~~

### Πραγματική άσκηση
Μετέτρεψε assertion σε unittest. Πρόσθεσε SQLite integration test σε προσωρινή βάση χωρίς να το ονομάζεις unit test.

### Έλεγχος συμβολαίου
Για Unit integration and end to end tests εξήγησε πώς ο caller ξεχωρίζει έγκυρο αποτέλεσμα από silent failure. Δοκίμασε normal και boundary input και σημείωσε έκδοση και αποτέλεσμα.

## Προστασία από παλινδρομήσεις

### Πρακτική εξήγηση
Regression test κρατά την ελάχιστη περίπτωση παλιού διορθωμένου defect. Αν δεν ελέγξεις ότι αποτύγχανε πριν τη διόρθωση, ίσως δεν προστατεύει από το ίδιο bug.

### Παράδειγμα
~~~python
def safe_ratio(a,b):
    if b==0:raise ZeroDivisionError('denominator')
    return a/b
assert safe_ratio(4,2)==2
~~~

### Πραγματική άσκηση
Γράψε test που απαιτεί exception για zero denominator και σύγκρινε με παλιά έκδοση που επέστρεφε παραπλανητικό default.

### Έλεγχος συμβολαίου
Για Regression protection εξήγησε πώς ο caller ξεχωρίζει έγκυρο αποτέλεσμα από silent failure. Δοκίμασε normal και boundary input και σημείωσε έκδοση και αποτέλεσμα.

## Ανάλυση επιδόσεων

### Πρακτική εξήγηση
Profiling εντοπίζει CPU time, allocations ή IO waits. Η βελτιστοποίηση της πιο περίπλοκης οπτικά function ίσως δεν αλλάξει πραγματικό latency.

### Παράδειγμα
~~~python
import cProfile
cProfile.run('sum(i*i for i in range(10000))')
~~~

### Πραγματική άσκηση
Κάνε profile nested-loop duplicate finder και set-based εκδοχής. Κάνε πολλαπλές δοκιμές, ξεχωρίζοντας startup από steady state.

### Έλεγχος συμβολαίου
Για Performance profiling εξήγησε πώς ο caller ξεχωρίζει έγκυρο αποτέλεσμα από silent failure. Δοκίμασε normal και boundary input και σημείωσε έκδοση και αποτέλεσμα.

## Έλεγχοι μονάδας, ολοκλήρωσης, παλινδρόμησης και ιδιοτήτων

Η δοκιμή μονάδας ελέγχει μικρή σύμβαση, η δοκιμή ολοκλήρωσης συνεργασία υποσυστημάτων και η τελική δοκιμή την πραγματική διαδρομή χρήστη. Οι έλεγχοι παλινδρόμησης αποτρέπουν την επανεμφάνιση παλιών σφαλμάτων. Οι δοκιμές ιδιοτήτων παράγουν δεδομένα, αλλά χρειάζονται επίσης συγκεκριμένες ακραίες περιπτώσεις.

### Παράδειγμα
```python
def reverse_twice(items):
    return list(reversed(list(reversed(items))))
for items in [[], [1], [1, 2], ['α', 'β']]:
    assert reverse_twice(items) == items
```
Μη γράφεις δοκιμές που απλώς διαπιστώνουν ότι «βρέθηκε αποτέλεσμα», ούτε να αντιγράφεις την υλοποίηση για την αναμενόμενη τιμή. Έλεγξε οριακές τιμές, σφάλματα και αποκατάσταση. Χρησιμοποίησε προσωρινό HOME για δοκιμές που γράφουν αρχεία.

### Ασκήσεις
1. Γράψε πρώτα αποτυχημένο test και μετά διόρθωσε το σφάλμα.
2. Δοκίμασε κενό αρχείο, λάθος UTF-8 και άρνηση δικαιωμάτων.
3. Εξήγησε γιατί ο έλεγχος σύνταξης δεν αποδεικνύει καλή λειτουργία παιχνιδιού.

## Καταγραφές συμβάντων, μετρικές και διαγνωστικά

Οι καταγραφές αποτυπώνουν συμβάντα, οι μετρικές συνοψίζουν μετρήσεις και τα ίχνη ακολουθούν μια εργασία σε διαφορετικά μέρη συστήματος. Χρησιμοποίησε ονόματα συμβάντων, ώρα με ζώνη, επίπεδο σοβαρότητας και αναγνωριστικά συσχέτισης. Μια αποτυχία πρέπει να εξηγεί *τι*, *πού* και *ποια επόμενη ενέργεια*, χωρίς μυστικά.

### Παράδειγμα
```python
import json
from datetime import datetime, timezone
record = {'event': 'backup.finished',
          'time': datetime.now(timezone.utc).isoformat(),
          'files': 12}
assert json.loads(json.dumps(record))['files'] == 12
```

### Ασκήσεις
1. Σχεδίασε logs εγκατάστασης ευανάγνωστα σε κινητό.
2. Κατάγραψε αποτυχία ενημέρωσης χωρίς μυστικές μεταβλητές.
3. Πρόσθεσε αναγνωριστικό συσχέτισης σε πολλά στάδια.
4. Ανίχνευσε ελλείπουσες εξαρτήσεις χωρίς αυτόματη εγκατάσταση.

## Αναπαραγωγή σφάλματος

### Πρακτική εξήγηση
Αναπαραγώγιμο bug report περιλαμβάνει περιβάλλον, είσοδο, βήματα, αναμενόμενη και πραγματική συμπεριφορά. Αφαίρεσε άσχετο setup μέχρι να μείνει το μικρότερο αποτυχημένο παράδειγμα.

### Παράδειγμα
~~~python
def broken(items=[]):
    items.append(1)
    return len(items)
assert broken()==1
assert broken()==2
~~~

### Πραγματική άσκηση
Άλλαξε default σε None με νέα list ανά κλήση. Γράψε regression assertion που αποτυγχάνει στην παλιά έκδοση και περνά στη διορθωμένη.

### Έλεγχος συμβολαίου
Για Reproducing a bug εξήγησε πώς ο caller ξεχωρίζει έγκυρο αποτέλεσμα από silent failure. Δοκίμασε normal και boundary input και σημείωσε έκδοση και αποτέλεσμα.
