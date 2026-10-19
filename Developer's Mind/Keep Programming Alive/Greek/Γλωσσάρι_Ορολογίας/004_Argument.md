# Γλωσσάρι: ορίσματα, πίνακες και συντακτικά δέντρα

## Argument

### Πώς συμπεριφέρεται η έννοια
Πραγματική τιμή σε function call, διαφορετική από parameter name στο definition. Positional/keyword arguments επηρεάζουν τη μελλοντική συμβατότητα API.

### Μικρό παράδειγμα
~~~text
def join(left,right): return left+'-'+right
assert join('a','b')=='a-b'
assert join(right='b',left='a')=='a-b'
~~~

### Πρακτική διερεύνηση
Άλλαξε τη σειρά positional arguments και δες αποτέλεσμα· πρόσθεσε keyword-only separator.

### Δοκιμή ορίου
Για Όρισμα, δοκίμασε δεύτερη είσοδο που αλλάζει το αποτέλεσμα. Σημείωσε αναμενόμενη συμπεριφορά πριν το run και εξήγησε τον κανόνα που παραβιάζεται.

## Array

### Πώς συμπεριφέρεται η έννοια
Indexed συλλογή με layout, indexing και element types ανά γλώσσα. Fixed-size C array και dynamic Python list δεν είναι ταυτόσημα.

### Μικρό παράδειγμα
~~~text
items=[8,13,21]
assert items[0]==8
assert items[-1]==21
~~~

### Πρακτική διερεύνηση
Σύγκρινε memory/mutation σε integer array και heterogeneous list· δοκίμασε out-of-range index.

### Δοκιμή ορίου
Για Πίνακας, δοκίμασε δεύτερη είσοδο που αλλάζει το αποτέλεσμα. Σημείωσε αναμενόμενη συμπεριφορά πριν το run και εξήγησε τον κανόνα που παραβιάζεται.

## AST

### Πώς συμπεριφέρεται η έννοια
Δέντρο που αναπαριστά δομή parsed κώδικα αντί για whitespace/comments. Εργαλεία διατρέχουν AST για analysis, transformations και diagnostics.

### Μικρό παράδειγμα
~~~text
import ast
node=ast.parse('x=2+3')
assert isinstance(node.body[0], ast.Assign)
assert isinstance(node.body[0].value, ast.BinOp)
~~~

### Πρακτική διερεύνηση
Σύγκρινε AST dumps των x=2+3 και x = 2 + 3· γιατί το formatting δεν αλλάζει το δέντρο;

### Δοκιμή ορίου
Για Αφηρημένο συντακτικό δέντρο, δοκίμασε δεύτερη είσοδο που αλλάζει το αποτέλεσμα. Σημείωσε αναμενόμενη συμπεριφορά πριν το run και εξήγησε τον κανόνα που παραβιάζεται.

## Asynchronous

### Πώς συμπεριφέρεται η έννοια
Control flow όπου λειτουργία αναστέλλεται περιμένοντας IO και άλλες tasks προχωρούν. Async syntax δεν επιταχύνει αυτόματα CPU-heavy work ούτε εγγυάται parallel threads.

### Μικρό παράδειγμα
~~~text
import asyncio
async def task():
    await asyncio.sleep(0)
    return 7
assert asyncio.run(task())==7
~~~

### Πρακτική διερεύνηση
Τρέξε δύο sleep tasks concurrently και σύγκρινε χρόνο με sequential waits χωρίς εξωτερικές υπηρεσίες.

### Δοκιμή ορίου
Για Ασύγχρονη εκτέλεση, δοκίμασε δεύτερη είσοδο που αλλάζει το αποτέλεσμα. Σημείωσε αναμενόμενη συμπεριφορά πριν το run και εξήγησε τον κανόνα που παραβιάζεται.

## Atomicity

### Πώς συμπεριφέρεται η έννοια
Ομάδα ενεργειών που ολοκληρώνεται ή ακυρώνεται στο συγκεκριμένο boundary. SQLite transactions υποστηρίζουν atomic commit/rollback· δύο Python assignments δεν είναι αυτόματα atomic σε διαφορετικές υπηρεσίες.

### Μικρό παράδειγμα
~~~text
BEGIN;
INSERT INTO tasks(title) VALUES ('draft');
ROLLBACK;
-- No inserted row should remain.
~~~

### Πρακτική διερεύνηση
Αναπαρήγαγε failed transaction σε προσωρινή βάση και έλεγξε ότι όλες οι writes ακυρώθηκαν.

### Δοκιμή ορίου
Για Ατομικότητα, δοκίμασε δεύτερη είσοδο που αλλάζει το αποτέλεσμα. Σημείωσε αναμενόμενη συμπεριφορά πριν το run και εξήγησε τον κανόνα που παραβιάζεται.
