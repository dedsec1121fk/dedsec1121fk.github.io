# Glossary: injection, interfaces and interpreters

## Injection

### Meaning and constraints
Injection occurs when untrusted data is interpreted as commands or executable syntax instead of remaining data. SQL string concatenation, shell execution and unsafe HTML construction cross different trust boundaries; escaping for one context does not protect another.

### A concrete use
~~~python
import sqlite3
c = sqlite3.connect(':memory:')
c.execute('CREATE TABLE users(name TEXT)')
c.execute('INSERT INTO users VALUES (?)', ('Ada',))
assert c.execute('SELECT * FROM users WHERE name=?', ("' OR 1=1 --",)).fetchall() == []
c.close()
~~~

### Challenge and misconception
Compare parameterized SQL with a string concatenation example *only in a disposable local database*. Explain why identifiers still require an allowlist and why subprocess arguments should be passed as arrays with shell=False.

**Further reading:** https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html

## Interface

### Meaning and constraints
An interface describes the operations available to a caller without requiring them to know the implementation. A useful contract specifies accepted inputs, return values, errors and side effects. Two implementations that share method names are not necessarily behaviorally substitutable.

### A concrete use
~~~python
from typing import Protocol
class Store(Protocol):
    def get(self, key: str) -> str | None: ...
class MemoryStore:
    def __init__(self): self.data = {'x':'ok'}
    def get(self, key): return self.data.get(key)
assert MemoryStore().get('x') == 'ok'
~~~

### Challenge and misconception
Build a second Store that reads from a scratch file and ensure both use the same missing-key behavior. Note that Protocol checks by static type tools do not perform full runtime schema validation.

**Further reading:** https://docs.python.org/3/library/typing.html#typing.Protocol

## Interpreter

### Meaning and constraints
An interpreter executes a language's program or intermediate representation, often evaluating statements as it runs. CPython compiles Python source to bytecode before its virtual machine executes it; therefore 'interpreted' does not mean source always runs without compilation.

### A concrete use
~~~python
import dis
def add(a, b): return a + b
assert add(2,3) == 5
dis.dis(add)  # shows bytecode for the current interpreter
~~~

### Challenge and misconception
Compare `python -m py_compile example.py` with running the script. Observe that syntax compilation can succeed even when a runtime branch contains a division by zero. Don't treat disassembly as portable across Python versions.

**Further reading:** https://docs.python.org/3/library/dis.html

## Invariant

### Definition and boundaries
A property preserved after each allowed operation. If a debit is permitted only when the balance can cover it, balance >= 0 remains true. An invariant is stronger than a check performed only once.

### Working miniature
~~~text
def debit(balance, amount):
    if not 0 <= amount <= balance: raise ValueError('bad debit')
    return balance-amount
assert debit(10,3)==7
~~~

### Guided investigation
Try 0, 10 and 11 as withdrawals from 10. Prove every valid operation preserves a nonnegative result, and make sure the invalid call raises.

### Demonstrate the invariant, not just a passing output
In prefix sums the claim before iteration i is that total equals the sum of elements before i. Initialization uses zero; the next addition preserves that claim; termination proves all elements were included.

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

Move the assertion after the update and observe the first failing case. Remember that Python assertions can be disabled in optimized execution and cannot replace input validation.
