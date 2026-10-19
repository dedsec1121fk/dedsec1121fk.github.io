# Thread — κοινή κατάσταση και έλεγχος συγχρονισμού

## Έννοια
Τα threads της ίδιας διεργασίας συνήθως μοιράζονται μνήμη και πόρους. Ο scheduler μπορεί να εναλλάσσει βήματα ανάγνωσης/εγγραφής, οπότε η σωστή έξοδος μιας δοκιμής δεν αποδεικνύει απουσία race. Ένα OS thread, Python thread και asyncio task έχουν διαφορετική συμπεριφορά. Ο πραγματικός CPU παραλληλισμός εξαρτάται επίσης από Python έκδοση/build και έργο.

## Εκτελέσιμο παράδειγμα Python
~~~python
import threading

counter = 0
guard = threading.Lock()

def add_one():
    global counter
    for _ in range(1000):
        with guard:
            counter += 1

workers = [threading.Thread(target=add_one) for _ in range(2)]
for worker in workers:
    worker.start()
for worker in workers:
    worker.join()
assert counter == 2000
~~~
Η τελική assertion ελέγχεται αφού ολοκληρωθούν **και τα δύο threads**. Το Lock προστατεύει το read-modify-write. Χωρίς join ο κύριος κώδικας μπορεί να διαβάσει ενδιάμεση κατάσταση. Χωρίς lock ο σχεδιασμός μπορεί να έχει race, ακόμη κι αν μια δοκιμή συμπτωματικά δείξει 2000.

## Ασκήσεις αποτυχίας
1. Μετέφερε το assert πριν τα join και εξήγησε γιατί μπορεί να παρατηρηθεί ημιτελές αποτέλεσμα.
2. Χώρισε την ενημέρωση σε ανάγνωση, ελεγχόμενη καθυστέρηση και εγγραφή, σε δοκιμαστικό περιβάλλον, για να δεις interleaving.
3. Σύγκρινε ένα μεγάλο Lock με queue-based ανταλλαγή μηνυμάτων και μέτρησε contention.
4. Δοκίμασε termination όταν worker περιμένει σε I/O. Χρειάζεται σαφής πολιτική shutdown.
5. Περιέγραψε γιατί ο GIL, όπου υπάρχει, δεν προστατεύει ατομικά όλες τις εφαρμοστικές πράξεις. Μη θεωρείς ίδιες όλες τις Python υλοποιήσεις.

## Τεκμήρια
Κατάγραψε έκδοση/build Python, OS, inputs, επαναλήψεις assertions και trace. Ξεχώρισε πραγματικά παρατηρημένα races από θεωρητικά πιθανά.
