# Glossary: algorithms and abstraction

## Programming terminology

- Algorithm
- Abstraction
- API
- Argument
- Array
- AST
- Asynchronous
- Atomicity
- Backtracking
- Big O
- Binary search
- Bit
- Boolean
- Branch
- Buffer
- Byte
- Cache
- Callback
- Cancellation
- CI
- CLI
- Closure
- Commit
- Compiler
- Concurrency
- Condition
- Container
- Coroutine
- Data race
- Deadlock
- Debugging
- Dependency
- Determinism
- Dictionary
- Dynamic typing
- Encapsulation
- Encoding
- Environment variable
- Exception
- Expression
- File descriptor
- Finite state machine
- Function
- Garbage collection
- Generic type
- Git
- Hash function
- Heap
- HTTP
- Idempotence
- Immutable
- Index
- Injection
- Interface
- Interpreter
- Invariant
- JSON
- Lazy evaluation
- Linter
- List
- Lock
- Logging
- Memory leak
- Migration
- Mock
- Module
- Namespace
- Null
- Object
- Optional
- Overflow
- Package manager
- Parameter
- Parser
- Path traversal
- Pointer
- Polymorphism
- Process
- Promise
- Protocol
- Race condition
- Recursion
- Refactoring
- Regression test
- REST
- Runtime
- Sandbox
- Schema
- Serialization
- Side effect
- SQL parameterization
- Stack
- Static typing
- Stream
- String
- Thread
- Timeout
- Transaction
- Type inference
- Unit test
- UTF-8
- Validation
- Virtual environment
- WebSocket
- Yield

## Algorithm

### How this concept behaves
Finite, repeatable method mapping specified inputs to outputs. Correctness, termination and resource use are separate claims; selecting the nearest visible route does not necessarily find a globally shortest route.

### Work through a small example
~~~text
def linear_find(items,x):
    for i,v in enumerate(items):
        if v==x: return i
    return None
assert linear_find([4,7],7)==1
~~~

### Investigate the behavior
Verify empty input, duplicates and missing values. Explain why the first-match rule is part of the algorithm's contract.

## Abstraction

### How this concept behaves
Exposing essential operations while hiding implementation decisions. A file-like interface with read/write methods can be backed by memory or disk, but only if both satisfy the same contract.

### Work through a small example
~~~text
from io import StringIO
stream=StringIO('abc')
assert stream.read(2)=='ab'
assert stream.read()=='c'
~~~

### Investigate the behavior
Replace StringIO with an opened temporary text file. Identify observable behaviors that must remain unchanged and ones that may differ.

### Explain a boundary case
For Abstraction, test a second input that changes the outcome and record the expected behavior before execution. Explain which requirement fails and why the baseline example does not cover it.

## API

### How this concept behaves
A defined interface by which components request operations and receive results. It includes parameters, errors, authentication and compatibility rules, not merely the URL of a web endpoint.

### Work through a small example
~~~text
def create_task(title):
    if not isinstance(title,str) or not title.strip(): raise ValueError('title')
    return {'id':1,'title':title}
assert create_task('Read')['id']==1
~~~

### Investigate the behavior
Specify how the API responds to an empty title and duplicate request. Explain which part belongs to client validation versus server enforcement.
