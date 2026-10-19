# Επεξεργασία παρτίδων — το chunking δεν είναι rate limiting

## Python 3 reference source
~~~python
def chunks(values, size):
    if size <= 0: raise ValueError('size')
    for start in range(0, len(values), size):
        yield values[start:start+size]
assert list(chunks(list(range(5)),2)) == [[0,1],[2,3],[4]]
~~~

## Σαφής διάκριση
Ο Python generator χωρίζει μία ήδη υπάρχουσα λίστα σε τμήματα μήκους έως size. **Δεν** καθυστερεί δικτυακά requests, δεν επιβάλλει όριο requests/second και δεν διαχειρίζεται retries ή πολλούς workers. Το chunking ορίζει μέγεθος παρτίδας· το rate limiting καθορίζει πόσα γεγονότα επιτρέπονται ανά χρονικό διάστημα.

## Συμπεριφορά κώδικα
Η chunks(values, size) επιστρέφει διαδοχικά slices και απορρίπτει size<=0 με ValueError. Για πέντε στοιχεία και size=2 δίνει [[0,1],[2,3],[4]]. Η παραγωγή batches γίνεται lazily, αλλά το list(range(5)) έχει ήδη αποθηκευθεί και κάθε slice δημιουργεί αντίγραφο έως size αναφορών.

## Ελεγχόμενες αποτυχίες
1. Με κενή είσοδο δεν παράγονται παρτίδες, αλλά το size πρέπει πάντα να είναι θετικό.
2. Με size=1 κάθε yield έχει ένα στοιχείο· με size μεγαλύτερο του μήκους υπάρχει μία παρτίδα.
3. Με μηδενικό ή αρνητικό size περίμενε ValueError αντί για ατέρμονα βρόχο.
4. Κάνε τον consumer να αποτύχει στη δεύτερη παρτίδα. Περιέγραψε τι παραδόθηκε και πώς θα γίνει ανάκαμψη.
5. Για τεράστια είσοδο πέρασε σε streaming iterator που συγκεντρώνει έως size τιμές χωρίς ολική φόρτωση μνήμης.

## Πραγματικός περιορισμός ρυθμού
Σε API με μέγιστο R requests/χρονικό παράθυρο απαιτείται monotonic-clock budget ή token bucket, αντιμετώπιση Retry-After και περιορισμένος παραλληλισμός. Ένα sleep ανά batch δεν αρκεί σε πολλούς workers. Εξασφάλισε idempotency πριν από retries και κράτα log ανά batch.

## 15 rate limited batch — έλεγχος ορίων

Ο περιορισμός ρυθμού διαφέρει από τον περιορισμό παραλληλίας. Το semaphore περιορίζει τα ταυτόχρονα αιτήματα, ενώ το rate budget τα αιτήματα ανά χρονικό παράθυρο. Μια υπηρεσία μπορεί να απαιτεί και τα δύο.

Στο HTTP 429 έλεγξε το `Retry-After`, όρισε μέγιστες επαναλήψεις και πρόσθεσε τυχαιότητα καθυστέρησης ώστε πολλοί clients να μη στέλνουν μαζί. Μην επαναλαμβάνεις απεριόριστα άκυρα credentials.

<!-- [curated-algorithm-detail:15_rate_limited_batch.md] -->
