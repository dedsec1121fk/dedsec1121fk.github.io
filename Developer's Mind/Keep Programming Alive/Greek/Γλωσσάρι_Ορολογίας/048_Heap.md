# Γλωσσάρι: heaps, HTTP και idempotence

## Heap

### Σημασία και περιορισμοί
Το heap σημαίνει δύο διαφορετικά πράγματα: δυναμική μνήμη allocation ή δομή priority queue. Ένα binary min-heap διατηρεί μερική διάταξη για γρήγορη πρόσβαση στο ελάχιστο· δεν είναι πλήρως ταξινομημένη λίστα.

### Πρακτικό παράδειγμα
~~~python
import heapq
items = [9, 2, 5, 1]
heapq.heapify(items)
assert heapq.heappop(items) == 1
assert heapq.heappop(items) == 2
~~~

### Άσκηση και παγίδα
Εμφάνισε την εσωτερική λίστα μετά το heapify και εξήγησε γιατί δεν είναι απαραίτητα sorted. Ξεχώρισε τα O(log n) push/pop από το memory allocation heap του process.

**Επιπλέον πηγή:** https://docs.python.org/3/library/heapq.html

## HTTP

### Σημασία και περιορισμοί
HTTP ορίζει ανταλλαγή methods, URLs, headers, status codes και ενδεχομένως bodies ανάμεσα σε client και server. Το πρωτόκολλο είναι stateless· οι εφαρμογές χρησιμοποιούν cookies, tokens και sessions. Το status 200 δεν αποδεικνύει έγκυρο JSON schema.

### Πρακτικό παράδειγμα
~~~http
GET /status HTTP/1.1
Host: example.test
Accept: application/json

HTTP/1.1 200 OK
Content-Type: application/json

{"ok":true}
~~~

### Άσκηση και παγίδα
Σχεδίασε αποκρίσεις 200, 404, 429 και 503. Ξεχώρισε πότε δικαιολογείται retry, τι κάνει το Retry-After και γιατί η CORS είναι browser policy, όχι authentication.

**Επιπλέον πηγή:** https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview

## Idempotence

### Σημασία και περιορισμοί
Μια πράξη είναι idempotent όταν η επανάληψη έχει το ίδιο προβλεπόμενο effect με μία εφαρμογή. Η ανάθεση flag=true είναι idempotent, ενώ counter++ συνήθως όχι. Στο HTTP αναφέρεται στα επιδιωκόμενα server effects, όχι σε ίδια response bytes.

### Πρακτικό παράδειγμα
~~~python
state = {'enabled': False, 'counter': 0}
def enable(): state['enabled'] = True
def increment(): state['counter'] += 1
enable(); enable(); assert state['enabled'] is True
increment(); increment(); assert state['counter'] == 2
~~~

### Άσκηση και παγίδα
Σχεδίασε δοκιμαστικό endpoint με idempotency key για write. Προσομοίωσε ίδιο request μετά από timeout και απέτρεψε δεύτερη εγγραφή, χωρίς πραγματικές πληρωμές.

**Επιπλέον πηγή:** https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Idempotent

## Immutable

### Σημασία και περιορισμοί
Immutable τιμή δεν τροποποιείται in-place μέσω του interface της. Python tuples είναι immutable containers αλλά μπορεί να περιέχουν mutable αντικείμενα· η αμεταβλητότητα δεν μεταφέρεται αυτόματα σε όλα τα nested στοιχεία.

### Πρακτικό παράδειγμα
~~~python
items = ([1,2],)
items[0].append(3)
assert items == ([1,2,3],)
# items[0] = [4]  # TypeError: tuple assignment is forbidden
~~~

### Άσκηση και παγίδα
Σύγκρινε frozen dataclass με απλό, και μετά δοκίμασε frozen πεδίο που κρατά list. Εξήγησε πότε χρειάζεται πραγματικά deep immutability σε caches ή μεταξύ threads.

**Επιπλέον πηγή:** https://docs.python.org/3/library/stdtypes.html#tuples

## Index

### Σημασία και περιορισμοί
Index μπορεί να είναι θέση σε ordered collection ή ειδική δομή για γρηγορότερα database lookups. Στην Python οι θέσεις αρχίζουν από μηδέν και τα αρνητικά indexes μετρούν από το τέλος. Στην DB ο index αποθηκεύει κλειδιά αναζήτησης.

### Πρακτικό παράδειγμα
~~~python
words = ['first', 'second', 'third']
assert words[0] == 'first'
assert words[-1] == 'third'
assert words[1:3] == ['second', 'third']
~~~

### Άσκηση και παγίδα
Δοκίμασε words[3] και δες IndexError. Έπειτα δημιούργησε SQLite index και σύγκρινε EXPLAIN QUERY PLAN· σε μικρό πίνακα ο optimizer ίσως δεν τον επιλέξει.

**Επιπλέον πηγή:** https://docs.python.org/3/library/stdtypes.html#common-sequence-operations
