# Glossary: promises, protocols and race conditions

## Promise

### Precise meaning
A JavaScript value representing a pending, fulfilled or rejected asynchronous computation. A Promise can resolve later, and errors travel through rejection handlers.

### Reference experiment
~~~text
async function answer(){ return 42; }
answer().then(x => console.assert(x===42)).catch(console.error);
~~~

### Investigate the boundary
Change answer() to throw Error and compare catch with try/await. Explain why synchronous try without await cannot catch later rejections.

### Independent check
For Promise, document the expected outcome before running the sample. Change one important assumption and decide whether the failure belongs to the caller, the implementation or the environment.

## Protocol

### Precise meaning
An agreement specifying message format, sequencing, error responses and roles between communicating components. HTTP is a protocol; JSON alone is just one representation.

### Reference experiment
~~~text
GET /status HTTP/1.1
Host: example.test

# Expected success might be HTTP/1.1 200 OK
~~~

### Investigate the boundary
Define request and response states for a tiny read-only status API. Test an unknown route and invalid method; explain which layer decides 404 versus 405.

### Independent check
For Protocol, document the expected outcome before running the sample. Change one important assumption and decide whether the failure belongs to the caller, the implementation or the environment.

## Race condition

### Precise meaning
Behavior that changes when independent operations interleave in different orders. A race condition may be logical even without unsynchronized memory access.

### Reference experiment
~~~text
balance=10
# Two workers both read 10, calculate 3 and 4 debit independently.
# Last write wins: incorrect final balance instead of 3.
~~~

### Investigate the boundary
Model two concurrent debits as a timeline, identify the read-modify-write race and fix it with a transaction or suitable synchronization.

### Independent check
For Race condition, document the expected outcome before running the sample. Change one important assumption and decide whether the failure belongs to the caller, the implementation or the environment.

## Recursion

### Precise meaning
A function calling itself on a smaller subproblem. Correct recursion needs a base case and a measure that moves toward it; otherwise stack depth can grow without bound.

### Reference experiment
~~~text
def factorial(n):
    if n < 0: raise ValueError()
    if n == 0: return 1
    return n*factorial(n-1)
assert factorial(4)==24
~~~

### Investigate the boundary
Trace the call frames for factorial(3), including return order. Compare with an iterative version for large n and test invalid negatives.

### Independent check
For Recursion, document the expected outcome before running the sample. Change one important assumption and decide whether the failure belongs to the caller, the implementation or the environment.

## Refactoring

### Precise meaning
Change to internal structure while preserving externally observable behavior under a defined contract. Tests and behavior checks provide evidence; renaming alone is not sufficient validation.

### Reference experiment
~~~text
def total(items):
    return sum(items)
assert total([2,3])==5
~~~

### Investigate the boundary
Extract a long conditional into a named function and run identical positive, empty and invalid inputs before/after. Compare outputs and exceptions.

### Independent check
For Refactoring, document the expected outcome before running the sample. Change one important assumption and decide whether the failure belongs to the caller, the implementation or the environment.
