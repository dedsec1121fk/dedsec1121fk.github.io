# Γλωσσάρι: συναλλαγές, συμπερασμό τύπων και unit tests

## Transaction

### Πραγματική σημασία
Ομάδα database αλλαγών που γίνονται commit ή rollback μαζί. Atomicity δεν λύνει κάθε race· isolation και concurrent writers εξακολουθούν να έχουν σημασία.

### Συγκεκριμένη αφετηρία
~~~text
BEGIN;
INSERT INTO tasks(title) VALUES ('first');
-- perform other work
ROLLBACK;
~~~

### Εφαρμογή του κανόνα
Σε προσωρινή SQLite έλεγξε ότι insert σε rolled-back transaction δεν διατηρείται, σε αντίθεση με committed.

### Αντιπαράδειγμα
Για Συναλλαγή, γράψε πρώτα αναμενόμενο αποτέλεσμα, άλλαξε σκόπιμα μία υπόθεση του παραδείγματος και όρισε τι πρέπει να ελέγχει το boundary πριν το επαναχρησιμοποιήσεις.

## Type inference

### Πραγματική σημασία
Ο compiler συνάγει τύπο από τα συμφραζόμενα χωρίς explicit annotation. Σε statically typed γλώσσα εξακολουθεί να υπάρχει type checking, όχι implicit any.

### Συγκεκριμένη αφετηρία
~~~text
const scores: number[] = [2,4];
const doubled = scores.map(n => n*2);
// n inferred number
~~~

### Εφαρμογή του κανόνα
Άλλαξε array σε string[], δοκίμασε numeric multiplication και διάβασε TypeScript diagnostic. Σύγκρινε inference με λάθος annotation.

### Αντιπαράδειγμα
Για Συναγωγή τύπων, γράψε πρώτα αναμενόμενο αποτέλεσμα, άλλαξε σκόπιμα μία υπόθεση του παραδείγματος και όρισε τι πρέπει να ελέγχει το boundary πριν το επαναχρησιμοποιήσεις.

## Unit test

### Πραγματική σημασία
Μικρός επαναλήψιμος έλεγχος συγκεκριμένης συμπεριφοράς με ελεγχόμενη είσοδο. Διαφέρει από integration test με πραγματική βάση, browser ή network service.

### Συγκεκριμένη αφετηρία
~~~text
def clamp(x, lo, hi): return min(max(x,lo),hi)
assert clamp(5,0,10)==5
assert clamp(-1,0,10)==0
~~~

### Εφαρμογή του κανόνα
Πρόσθεσε boundary checks 0 και 10 και αποφάσισε αν lo>hi πρέπει να κάνει raise.

### Αντιπαράδειγμα
Για Δοκιμή μονάδας, γράψε πρώτα αναμενόμενο αποτέλεσμα, άλλαξε σκόπιμα μία υπόθεση του παραδείγματος και όρισε τι πρέπει να ελέγχει το boundary πριν το επαναχρησιμοποιήσεις.

## WebSocket

### Πραγματική σημασία
Protocol μόνιμης bidirectional επικοινωνίας, συχνά μετά από HTTP Upgrade handshake. Σε αντίθεση με single HTTP requests απαιτεί connection lifecycle και reconnect policy.

### Συγκεκριμένη αφετηρία
~~~text
const ws = new WebSocket('wss://example.test/echo');
ws.addEventListener('message', e => console.log(e.data));
// Requires an authorized matching server.
~~~

### Εφαρμογή του κανόνα
Φτιάξε τοπικό test server και έλεγξε open/message/close states. Εξήγησε γιατί reconnect δεν πρέπει να επαναλαμβάνει τυφλά side effects.

### Αντιπαράδειγμα
Για WebSocket, γράψε πρώτα αναμενόμενο αποτέλεσμα, άλλαξε σκόπιμα μία υπόθεση του παραδείγματος και όρισε τι πρέπει να ελέγχει το boundary πριν το επαναχρησιμοποιήσεις.

## Yield

### Πραγματική σημασία
Έκφραση που αναστέλλει generator, παράγει τιμή και διατηρεί execution state. Διαφέρει από return που ολοκληρώνει την κλήση.

### Συγκεκριμένη αφετηρία
~~~text
def counter():
    yield 1
    yield 2
assert list(counter())==[1,2]
~~~

### Εφαρμογή του κανόνα
Κάλεσε next επανειλημμένα και δες StopIteration μετά την τελευταία τιμή. Σύγκρινε generator με eager return [1,2].

### Αντιπαράδειγμα
Για Παραγωγή τιμής, γράψε πρώτα αναμενόμενο αποτέλεσμα, άλλαξε σκόπιμα μία υπόθεση του παραδείγματος και όρισε τι πρέπει να ελέγχει το boundary πριν το επαναχρησιμοποιήσεις.
