# PostgreSQL deadlock detected: σταθερή σειρά locks και ασφαλή retries

## Ακριβής διάγνωση
Το PostgreSQL deadlock με SQLSTATE 40P01 εμφανίζεται όταν τα transactions σχηματίζουν κύκλο αναμονής. Η βάση ανιχνεύει τον κύκλο και ακυρώνει ένα transaction. Η αύξηση timeout δεν διορθώνει τη σειρά κλειδωμάτων. Η απλή αναμονή για lock χωρίς κύκλο είναι διαφορετική περίπτωση.

## Πείραμα σε αναλώσιμα δεδομένα
Εκτέλεσε μόνο σε προσωρινή τοπική βάση ή σε μη παραγωγικό περιβάλλον για το οποίο έχεις άδεια.
~~~sql
-- Shared lab table in an isolated database; two sessions are required:
CREATE TABLE deadlock_lab_balances (id INTEGER PRIMARY KEY, amount INTEGER);
INSERT INTO deadlock_lab_balances VALUES (1, 100), (2, 100);
-- Connection A: BEGIN; UPDATE deadlock_lab_balances SET amount=amount+1 WHERE id=1;
-- Connection B: BEGIN; UPDATE deadlock_lab_balances SET amount=amount+1 WHERE id=2;
-- A then updates id=2; B then updates id=1 (deadlock cycle).
-- Prefer both transactions updating ids in ascending order.\n-- Drop the lab table after both sessions finish: DROP TABLE deadlock_lab_balances;
~~~

## Διαδικασία επίλυσης
Συγκέντρωσε server logs και traces των transactions χωρίς ευαίσθητες παραμέτρους. Κράτα τις συναλλαγές μικρές, πάρε locks με κοινή σειρά και μη καλείς εξωτερικές υπηρεσίες ενώ κρατάς locks. Σε deadlock το transaction ακυρώνεται: επανάλαβε ολόκληρη τη συναλλαγή με όριο retries μόνο αν η ενέργεια είναι ασφαλής ή idempotent. Απαιτείται rollback πριν από νέα προσπάθεια.

## Εργαστήριο / δοκιμή ορίων
Χρησιμοποίησε δύο PostgreSQL sessions με κοινό δοκιμαστικό πίνακα (τα TEMP tables δεν μοιράζονται μεταξύ sessions) και αναπαράγαγε αντίθετη σειρά row locks. Έπειτα ευθυγράμμισε τη σειρά ανά id. Σύγκρινε deadlock με lock timeout και κατέγραψε τα διαφορετικά SQLSTATE.
