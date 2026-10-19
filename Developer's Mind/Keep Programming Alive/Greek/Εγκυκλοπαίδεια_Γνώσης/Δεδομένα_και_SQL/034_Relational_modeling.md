# Μοντελοποίηση δεδομένων: σχέσεις και εξέλιξη JSON

## Σχεσιακή μοντελοποίηση

### Μηχανισμός και όρια
Relational model αποθηκεύει facts σε tables με keys. Normalization μεταφέρει επαναλαμβανόμενες πληροφορίες σε ξεχωριστούς πίνακες, μειώνοντας update anomalies. Denormalization γίνεται μετά από μέτρηση.

### Παράδειγμα υλοποίησης
~~~sql
PRAGMA foreign_keys=ON;
CREATE TABLE authors(id INTEGER PRIMARY KEY,name TEXT UNIQUE NOT NULL);
CREATE TABLE books(id INTEGER PRIMARY KEY,author_id INTEGER REFERENCES authors(id));
~~~

### Αναπαραγωγή και έλεγχος
Πρόσθεσε δύο books σε έναν author, άλλαξε όνομα μία φορά και έλεγξε τις σχέσεις. Δοκίμασε child με ανύπαρκτο author.

### Απαραίτητα τεκμήρια
Για Relational modeling, κατέγραψε ποια είσοδος αλλάζει το αποτέλεσμα, ποια πράξη ευθύνεται και ένα test που θα αποκάλυπτε λάθος. Μέτρησε μνήμη ή χρόνο όταν επηρεάζουν τον ισχυρισμό και μην θεωρείς ένα demo απόδειξη για όλες τις εισόδους.

## JSON και εξέλιξη μορφής

### Μηχανισμός και όρια
Αλλαγή JSON API δεν είναι απλώς νέο field: clients μπορεί να απορρίπτουν unknown keys, να αντιμετωπίζουν αλλιώς missing keys και να απαιτούν ακριβείς τύπους. Additive changes δεν είναι πάντα backward-compatible.

### Παράδειγμα υλοποίησης
~~~python
import json
old=json.loads('{"id":1}')
new=json.loads('{"id":1,"status":"ready"}')
assert old['id']==new['id']
~~~

### Αναπαραγωγή και έλεγχος
Γράψε strict και permissive consumers για τα δύο payloads. Όρισε migration policy για removed field, null vs absent και version negotiation.

### Απαραίτητα τεκμήρια
Για JSON and schema evolution, κατέγραψε ποια είσοδος αλλάζει το αποτέλεσμα, ποια πράξη ευθύνεται και ένα test που θα αποκάλυπτε λάθος. Μέτρησε μνήμη ή χρόνο όταν επηρεάζουν τον ισχυρισμό και μην θεωρείς ένα demo απόδειξη για όλες τις εισόδους.
