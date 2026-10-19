# Σφάλματα πινάκων βάσης και parsing στη shell

## relation does not exist

### Ακριβής διάγνωση
Το PostgreSQL error 42P01 σημαίνει ότι το όνομα relation δεν εντοπίστηκε. Ο πίνακας ίσως βρίσκεται σε άλλη βάση ή schema, δεν έχει δημιουργηθεί από migration, ή απαιτεί quoted identifier με κεφαλαία. Τα unquoted ονόματα μετατρέπονται σε lowercase στην PostgreSQL, κάτι που συχνά ξαφνιάζει σε εισαγόμενα schemas.

### Πείραμα σε αναλώσιμα δεδομένα
Εκτέλεσε μόνο σε προσωρινή τοπική βάση ή σε μη παραγωγικό περιβάλλον για το οποίο έχεις άδεια.
~~~sql
-- Execute on an isolated PostgreSQL database, not production.
SELECT current_database(), current_schema();
SHOW search_path;
SELECT to_regclass('public.orders');
SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_name ILIKE 'orders';
-- Compare public.orders with explicitly quoted "Orders".
~~~

### Διαδικασία επίλυσης
Πρώτα επιβεβαίωσε την πραγματική connection string και βάση. Δες current_schema() και search_path και χρησιμοποίησε schema_name.table_name. Έλεγξε migrations και ownership πριν δημιουργήσεις νέο πίνακα. Για δυναμικά identifiers χρειάζεται ασφαλές quoting ονομάτων και όχι placeholders τιμών.

### Εργαστήριο / δοκιμή ορίων
Δημιούργησε πίνακα σε αποκλειστικό δοκιμαστικό schema. Δείξε ότι το unqualified query αποτυγχάνει όταν το search_path δεν περιέχει το schema, ενώ το qualified πετυχαίνει. Σύγκρινε orders και "Orders". Καθάρισε μόνο το προσωρινό schema.

## permission denied for relation

### Ακριβής διάγνωση
Το PostgreSQL error 42501 δηλώνει ανεπαρκή δικαιώματα του ενεργού ρόλου. Το δικαίωμα σύνδεσης στη βάση δεν συνεπάγεται SELECT σε πίνακα ή USAGE σε schema. Οι sequences για INSERT και οι κανόνες row-level security είναι διαφορετικές περιπτώσεις. Μην αλλάξεις την εφαρμογή σε superuser μόνο για να κρύψεις το σφάλμα.

### Πείραμα σε αναλώσιμα δεδομένα
Εκτέλεσε μόνο σε προσωρινή τοπική βάση ή σε μη παραγωγικό περιβάλλον για το οποίο έχεις άδεια.
~~~sql
-- Run read-only role checks as an authorized operator:
SELECT current_user, session_user, current_database();
SELECT has_schema_privilege(current_user, 'public', 'USAGE');
SELECT has_table_privilege(current_user, 'public.orders', 'SELECT');
-- Inspect granted privileges through information_schema
-- or psql \dp for the specific relation.
~~~

### Διαδικασία επίλυσης
Κατέγραψε την απαιτούμενη πράξη (SELECT, INSERT, UPDATE ή DELETE) και τον πραγματικό database role. Έλεγξε schema USAGE, table grants και δικαιώματα sequences. Εξουσιοδοτημένος διαχειριστής πρέπει να δίνει μόνο τα αναγκαία δικαιώματα· απέφυγε GRANT ALL TO PUBLIC. Σε row-level security ξεχώρισε έλλειψη privilege από ερώτημα που επιστρέφει μηδέν ορατές γραμμές.

### Εργαστήριο / δοκιμή ορίων
Σε αναλώσιμη βάση PostgreSQL δημιούργησε test role μόνο ανάγνωσης, δώσε schema USAGE και SELECT σε έναν πίνακα και έλεγξε ότι SELECT πετυχαίνει αλλά INSERT αποτυγχάνει. Κατέγραψε grant/revoke για καθαρισμό και επαλήθευσε ότι άλλοι πίνακες παραμένουν απροσπέλαστοι.

## unexpected EOF while looking for matching

**Γλώσσα / περιβάλλον:** Bash

### Τι σημαίνει
Δεν έχει κλείσει εισαγωγικό ή οριοθέτης μπλοκ.

### Πώς διορθώνεται
Έλεγξε εισαγωγικά και οριοθέτες here-doc πριν το σημείο σφάλματος.
