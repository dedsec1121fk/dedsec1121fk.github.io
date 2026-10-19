# Γλωσσάρι: injection, interfaces και interpreters

## Injection

### Σημασία και περιορισμοί
Injection υπάρχει όταν μη έμπιστα δεδομένα ερμηνεύονται ως εντολές ή σύνταξη αντί να παραμένουν data. SQL concatenation, shell execution και HTML interpolation έχουν διαφορετικά trust boundaries. Το escaping ενός context δεν προστατεύει άλλο.

### Πρακτικό παράδειγμα
~~~python
import sqlite3
c = sqlite3.connect(':memory:')
c.execute('CREATE TABLE users(name TEXT)')
c.execute('INSERT INTO users VALUES (?)', ('Ada',))
assert c.execute('SELECT * FROM users WHERE name=?', ("' OR 1=1 --",)).fetchall() == []
c.close()
~~~

### Άσκηση και παγίδα
Σύγκρινε bound SQL parameters με string concatenation μόνο σε προσωρινή τοπική DB. Εξήγησε γιατί τα SQL identifiers χρειάζονται allowlist και τα subprocess args arrays με shell=False.

**Επιπλέον πηγή:** https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html

## Interface

### Σημασία και περιορισμοί
Interface περιγράφει πράξεις που μπορεί να καλέσει κάποιος χωρίς να γνωρίζει implementation. Το σωστό contract περιέχει εισόδους, αποτελέσματα, errors και side effects. Δύο implementations με ίδια ονόματα μεθόδων δεν είναι απαραίτητα συμβατές.

### Πρακτικό παράδειγμα
~~~python
from typing import Protocol
class Store(Protocol):
    def get(self, key: str) -> str | None: ...
class MemoryStore:
    def __init__(self): self.data = {'x':'ok'}
    def get(self, key): return self.data.get(key)
assert MemoryStore().get('x') == 'ok'
~~~

### Άσκηση και παγίδα
Φτιάξε δεύτερο Store που διαβάζει προσωρινό αρχείο και έλεγξε ίδια συμπεριφορά για missing keys. Τα Protocol annotations δεν προσφέρουν πλήρη runtime validation.

**Επιπλέον πηγή:** https://docs.python.org/3/library/typing.html#typing.Protocol

## Interpreter

### Σημασία και περιορισμοί
Interpreter εκτελεί πρόγραμμα ή ενδιάμεση αναπαράσταση, συχνά αξιολογώντας εντολές κατά την εκτέλεση. Η CPython πρώτα μετατρέπει source σε bytecode· το 'interpreted' δεν σημαίνει ότι δεν υπάρχει compile phase.

### Πρακτικό παράδειγμα
~~~python
import dis
def add(a, b): return a + b
assert add(2,3) == 5
dis.dis(add)  # shows bytecode for the current interpreter
~~~

### Άσκηση και παγίδα
Σύγκρινε `python -m py_compile example.py` με εκτέλεση script. Syntax compile μπορεί να περάσει ενώ runtime branch έχει division by zero. Το bytecode/dis output διαφέρει ανά Python version.

**Επιπλέον πηγή:** https://docs.python.org/3/library/dis.html

## Invariant

### Έννοια και όρια
Ιδιότητα που διατηρείται μετά από κάθε επιτρεπτή πράξη. Αν μία χρέωση επιτρέπεται μόνο με επαρκές υπόλοιπο, το balance >= 0 παραμένει αληθές. Δεν αρκεί ένας αρχικός έλεγχος.

### Πρακτικό δείγμα
~~~text
def debit(balance, amount):
    if not 0 <= amount <= balance: raise ValueError('bad debit')
    return balance-amount
assert debit(10,3)==7
~~~

### Οδηγούμενη διερεύνηση
Δοκίμασε χρέωση 0, 10 και 11 από υπόλοιπο 10. Απόδειξε ότι κάθε έγκυρη πράξη διατηρεί μη αρνητικό αποτέλεσμα και ότι η άκυρη απορρίπτεται.

### Πρακτική απόδειξη του invariant
Στα prefix sums πριν την επανάληψη i το total είναι το άθροισμα των προηγούμενων τιμών. Αρχικά μηδέν, διατηρείται με πρόσθεση και στον τερματισμό έχουμε συμπεριλάβει όλες τις τιμές.

~~~python
def prefix(items):
    total, result = 0, []
    for i, value in enumerate(items):
        assert total == sum(items[:i])
        total += value
        result.append(total)
    return result
assert prefix([2,-1,4]) == [2,1,5]
assert prefix([]) == []
~~~

Βάλε το assert μετά την ενημέρωση και παρατήρησε το σφάλμα. Τα Python assertions μπορεί να απενεργοποιηθούν σε optimized execution· δεν υποκαθιστούν validation.
