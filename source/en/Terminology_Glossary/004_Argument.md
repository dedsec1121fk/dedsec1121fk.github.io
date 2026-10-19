# Glossary: arguments, arrays and syntax trees

## Argument

### How this concept behaves
Concrete value supplied at a function call, distinct from a parameter name in the function definition. Positional and keyword arguments can affect how an API evolves.

### Work through a small example
~~~text
def join(left,right): return left+'-'+right
assert join('a','b')=='a-b'
assert join(right='b',left='a')=='a-b'
~~~

### Investigate the behavior
Exchange positional argument order and observe the result; then add a keyword-only optional separator.

### Explain a boundary case
For Argument, test a second input that changes the outcome and record the expected behavior before execution. Explain which requirement fails and why the baseline example does not cover it.

## Array

### How this concept behaves
Indexed collection whose layout, indexing rules and element types depend on language. A fixed-size C array and a dynamic Python list are not interchangeable concepts.

### Work through a small example
~~~text
items=[8,13,21]
assert items[0]==8
assert items[-1]==21
~~~

### Investigate the behavior
Compute memory and mutation implications of an integer array versus a heterogeneous list; test an out-of-range index.

### Explain a boundary case
For Array, test a second input that changes the outcome and record the expected behavior before execution. Explain which requirement fails and why the baseline example does not cover it.

## AST

### How this concept behaves
A tree representing parsed program structure rather than source whitespace or comments. Tools traverse AST nodes to analyze expressions, transform code or build diagnostics.

### Work through a small example
~~~text
import ast
node=ast.parse('x=2+3')
assert isinstance(node.body[0], ast.Assign)
assert isinstance(node.body[0].value, ast.BinOp)
~~~

### Investigate the behavior
Compare AST dumps of x=2+3 with x = 2 + 3 and explain why formatting does not change the essential tree.

### Explain a boundary case
For Abstract syntax tree, test a second input that changes the outcome and record the expected behavior before execution. Explain which requirement fails and why the baseline example does not cover it.

## Asynchronous

### How this concept behaves
Control flow where an operation can suspend while awaiting IO and other tasks may advance. Async syntax alone does not speed up CPU-heavy calculations or guarantee parallel threads.

### Work through a small example
~~~text
import asyncio
async def task():
    await asyncio.sleep(0)
    return 7
assert asyncio.run(task())==7
~~~

### Investigate the behavior
Run two asynchronous sleep tasks concurrently and compare elapsed time with sequential waits; avoid real external services.

### Explain a boundary case
For Asynchronous, test a second input that changes the outcome and record the expected behavior before execution. Explain which requirement fails and why the baseline example does not cover it.

## Atomicity

### How this concept behaves
A group of actions appears all-or-nothing at a specified boundary. SQLite transactions offer atomic commit/rollback; a pair of Python assignments is not automatically atomic across services.

### Work through a small example
~~~text
BEGIN;
INSERT INTO tasks(title) VALUES ('draft');
ROLLBACK;
-- No inserted row should remain.
~~~

### Investigate the behavior
Reproduce a failed transaction in a disposable database, then verify both its successful and rejected writes are handled consistently.

### Explain a boundary case
For Atomicity, test a second input that changes the outcome and record the expected behavior before execution. Explain which requirement fails and why the baseline example does not cover it.
