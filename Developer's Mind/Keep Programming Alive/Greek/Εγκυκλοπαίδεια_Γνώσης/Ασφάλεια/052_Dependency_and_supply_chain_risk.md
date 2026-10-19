# Εφοδιαστική αλυσίδα λογισμικού: εξαρτήσεις, ακεραιότητα, review και CI

## Κίνδυνοι εξαρτήσεων και εφοδιαστικής αλυσίδας

### Αρχή σχεδιασμού
Dependencies μπορούν να εισάγουν vulnerable versions, install scripts ή compromised artifacts. Χρειάζεται έλεγχος pinned versions, provenance, licenses και transitive dependencies.

### Πρακτική περίπτωση
~~~sh
python -m pip list --format=freeze
python -m pip check
# Read-only inventory, not an instruction to upgrade everything.
~~~

### Ανεξάρτητη άσκηση
Σε disposable project σύγκρινε pinned με unconstrained dependency· εξέτασε lockfile/transitive tree πριν αλλαγές.

### Τεκμήρια για review
Για Dependency and supply chain risk, αναγνώρισε αποτυχία πέρα από το happy path και πρότεινε συγκεκριμένο test. Κατάγραψε πρώτα expected result και έλεγξε το boundary σε ασφαλές δοκιμαστικό περιβάλλον.

## Αντίγραφα, επαναφορά και ακεραιότητα

### Αρχή σχεδιασμού
Backup είναι χρήσιμο όταν έχει δοκιμαστεί restore. Αντίγραφα κοντά στο αρχικό μοιράζονται failure modes, ενώ checksum εντοπίζει αλλοίωση μόνο σε σχέση με trusted digest.

### Πρακτική περίπτωση
~~~python
import hashlib
payload=b'backup sample'
digest=hashlib.sha256(payload).hexdigest()
assert hashlib.sha256(payload).hexdigest()==digest
~~~

### Ανεξάρτητη άσκηση
Φτιάξε disposable backup, άλλαξε source, κάνε restore αλλού και επιβεβαίωσε περιεχόμενα. Όρισε RPO/RTO αντί να βασίζεσαι σε ZIP.

### Τεκμήρια για review
Για Backup recovery and integrity, αναγνώρισε αποτυχία πέρα από το happy path και πρότεινε συγκεκριμένο test. Κατάγραψε πρώτα expected result και έλεγξε το boundary σε ασφαλές δοκιμαστικό περιβάλλον.

## Ιστορικό Git και κλάδοι

### Αρχή σχεδιασμού
Git commit είναι snapshot με parent history. Branches είναι movable ονόματα commits· shallow clone έχει μόνο μέρος του ιστορικού και ZIP δεν είναι repository.

### Πρακτική περίπτωση
~~~sh
git status --short --branch
git log --oneline -5
git remote -v
~~~

### Ανεξάρτητη άσκηση
Σε test repository κάνε δύο commits/branch, δες refs και κάνε switch χωρίς history rewrite. Ανάκτησε detached commit μέσω branch.

### Τεκμήρια για review
Για Git history and branches, αναγνώρισε αποτυχία πέρα από το happy path και πρότεινε συγκεκριμένο test. Κατάγραψε πρώτα expected result και έλεγξε το boundary σε ασφαλές δοκιμαστικό περιβάλλον.

## Λίστα ελέγχου κώδικα

### Αρχή σχεδιασμού
Code review ελέγχει intent, correctness, security, maintenance και tests. Μεγάλο diff δεν σημαίνει πρόοδο· χρειάζεται κατανόηση αλλαγής συμπεριφοράς και rollback impact.

### Πρακτική περίπτωση
~~~text
Review a parser change:
- Is input schema explicit?
- Does a failing row mutate stored data?
- Is there a regression test?
- Does the error disclose a secret?
~~~

### Ανεξάρτητη άσκηση
Σύγκρινε parser που απορρίπτει malformed input με έκδοση που μετατρέπει τα πάντα σε string. Γράψε δύο συγκεκριμένα review comments.

### Τεκμήρια για review
Για Code review checklist, αναγνώρισε αποτυχία πέρα από το happy path και πρότεινε συγκεκριμένο test. Κατάγραψε πρώτα expected result και έλεγξε το boundary σε ασφαλές δοκιμαστικό περιβάλλον.

## Συνεχής ενσωμάτωση

### Αρχή σχεδιασμού
CI αυτοματοποιεί checks σε αλλαγές, σε διαφορετικά OS και versions. Πράσινο workflow δεν σημαίνει έτοιμο release όταν δεν έγιναν collect tests ή δεν εξετάστηκαν artifacts.

### Πρακτική περίπτωση
~~~sh
python -m unittest discover -v
python -m compileall -q .
~~~

### Ανεξάρτητη άσκηση
Γράψε local test που αποτυγχάνει πριν από fix και περνά μετά. Τι πρέπει να αναφέρει CI όταν δεν βρέθηκαν tests;

### Τεκμήρια για review
Για Continuous integration, αναγνώρισε αποτυχία πέρα από το happy path και πρότεινε συγκεκριμένο test. Κατάγραψε πρώτα expected result και έλεγξε το boundary σε ασφαλές δοκιμαστικό περιβάλλον.

## Εξαρτήσεις, επαναλήψιμα builds και προέλευση κώδικα

Κίνδυνοι αλυσίδας εφοδιασμού λογισμικού είναι κακόβουλα πακέτα, ονόματα που μοιάζουν με γνωστά, αλλαγές εκδόσεων και scripts εγκατάστασης. Κατάγραψε άμεσες εξαρτήσεις, εκδόσεις και άδειες. Χρησιμοποίησε κλειδωμένες εκδόσεις ή hashes όπου είναι δυνατό και έλεγξε ειδοποιήσεις ασφάλειας πριν από αναβάθμιση.

### Παράδειγμα
```python
import hashlib
payload = b'example'
digest = hashlib.sha256(payload).hexdigest()
assert len(digest) == 64
```
Το hash αποδεικνύει ταυτότητα bytes, όχι ποιος τα παρήγαγε χωρίς έμπιστη υπογραφή ή ανεξάρτητα επαληθευμένο hash. Ένα Git commit hash δεν είναι από μόνο του πιστοποιητικό ασφάλειας.

### Ασκήσεις
1. Δημιούργησε λίστα εξαρτήσεων με έκδοση και άδεια.
2. Αναπαρήγαγε περιβάλλον με lockfile.
3. Σύγκρινε SHA-256 δύο αρχείων.
4. Προετοίμασε επαναφορά ασφαλούς έκδοσης.
