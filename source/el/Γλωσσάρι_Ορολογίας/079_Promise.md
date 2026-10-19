# Γλωσσάρι: promises, πρωτόκολλα και race conditions

## Promise

### Ακριβής σημασία
JavaScript τιμή που εκφράζει pending, fulfilled ή rejected computation. Το αποτέλεσμα μπορεί να έρθει αργότερα και τα errors περνούν από rejection handlers.

### Πείραμα αναφοράς
~~~text
async function answer(){ return 42; }
answer().then(x => console.assert(x===42)).catch(console.error);
~~~

### Διερεύνηση ορίου
Άλλαξε answer() ώστε να κάνει throw και σύγκρινε catch με try/await. Εξήγησε γιατί sync try χωρίς await δεν πιάνει async rejection.

### Ανεξάρτητος έλεγχος
Για Υπόσχεση ασύγχρονου αποτελέσματος, γράψε την αναμενόμενη έξοδο πριν από εκτέλεση. Άλλαξε μία σημαντική παραδοχή και βρες αν το πρόβλημα ανήκει σε caller, implementation ή περιβάλλον.

## Protocol

### Ακριβής σημασία
Σύμβαση για format μηνυμάτων, σειρά ανταλλαγής, errors και ρόλους επικοινωνίας. HTTP είναι protocol, ενώ JSON μόνο data representation.

### Πείραμα αναφοράς
~~~text
GET /status HTTP/1.1
Host: example.test

# Expected success might be HTTP/1.1 200 OK
~~~

### Διερεύνηση ορίου
Όρισε request/response states για read-only status API. Δοκίμασε άγνωστο route και λάθος method· ποιο layer αποφασίζει 404/405;

### Ανεξάρτητος έλεγχος
Για Πρωτόκολλο, γράψε την αναμενόμενη έξοδο πριν από εκτέλεση. Άλλαξε μία σημαντική παραδοχή και βρες αν το πρόβλημα ανήκει σε caller, implementation ή περιβάλλον.

## Race condition

### Ακριβής σημασία
Συμπεριφορά που αλλάζει ανάλογα με τη σειρά interleaving ανεξάρτητων πράξεων. Race condition μπορεί να είναι λογικό και χωρίς data race στη μνήμη.

### Πείραμα αναφοράς
~~~text
balance=10
# Two workers both read 10, calculate 3 and 4 debit independently.
# Last write wins: incorrect final balance instead of 3.
~~~

### Διερεύνηση ορίου
Μοντελοποίησε δύο debits σε timeline, εντόπισε read-modify-write race και διόρθωσε με transaction ή κατάλληλο synchronization.

### Ανεξάρτητος έλεγχος
Για Συνθήκη ανταγωνισμού, γράψε την αναμενόμενη έξοδο πριν από εκτέλεση. Άλλαξε μία σημαντική παραδοχή και βρες αν το πρόβλημα ανήκει σε caller, implementation ή περιβάλλον.

## Recursion

### Ακριβής σημασία
Function που καλεί τον εαυτό της σε μικρότερο πρόβλημα. Χρειάζεται base case και μέτρο που μειώνεται, αλλιώς το stack μεγαλώνει ανεξέλεγκτα.

### Πείραμα αναφοράς
~~~text
def factorial(n):
    if n < 0: raise ValueError()
    if n == 0: return 1
    return n*factorial(n-1)
assert factorial(4)==24
~~~

### Διερεύνηση ορίου
Παρακολούθησε frames factorial(3), μαζί με returns. Σύγκρινε iterative υλοποίηση για μεγάλα n και έλεγξε αρνητικά.

### Ανεξάρτητος έλεγχος
Για Αναδρομή, γράψε την αναμενόμενη έξοδο πριν από εκτέλεση. Άλλαξε μία σημαντική παραδοχή και βρες αν το πρόβλημα ανήκει σε caller, implementation ή περιβάλλον.

## Refactoring

### Ακριβής σημασία
Αλλαγή εσωτερικής δομής με διατήρηση εξωτερικής συμπεριφοράς βάσει συμβολαίου. Τα tests είναι τεκμήρια· απλό rename δεν αποδεικνύει ισοδυναμία.

### Πείραμα αναφοράς
~~~text
def total(items):
    return sum(items)
assert total([2,3])==5
~~~

### Διερεύνηση ορίου
Κάνε extract μεγάλο conditional σε νέα function και τρέξε θετικές, κενές και άκυρες εισόδους πριν/μετά. Σύγκρινε αποτελέσματα/exceptions.

### Ανεξάρτητος έλεγχος
Για Αναδόμηση κώδικα, γράψε την αναμενόμενη έξοδο πριν από εκτέλεση. Άλλαξε μία σημαντική παραδοχή και βρες αν το πρόβλημα ανήκει σε caller, implementation ή περιβάλλον.
