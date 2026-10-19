# Glossary: encoding, exceptions and expressions

## Encoding

### Meaning and constraints
An encoding maps characters to bytes and back. UTF-8 represents the same Unicode text with a variable number of bytes per code point. Decoding arbitrary bytes with the wrong encoding fails or corrupts text; a byte offset is not the same as a character index.

### A concrete use
~~~python
text = 'Γεια'
data = text.encode('utf-8')
assert data.decode('utf-8') == text
assert len(data) > len(text)
~~~

### Challenge and misconception
Write the bytes to a scratch binary file and test decode with utf-8. Introduce invalid UTF-8 byte `b'\xff'` and catch UnicodeDecodeError. Do not use errors='ignore' to hide data loss.

**Further reading:** https://docs.python.org/3/howto/unicode.html

## Exception

### Meaning and constraints
An exception reports an abnormal condition and transfers control to a matching handler. Catching a specific error close to the boundary lets expected failures be handled while unexpected programming defects remain visible. Catching every exception and returning success conceals faults.

### A concrete use
~~~python
def port(text):
    try: number = int(text)
    except ValueError as exc: raise ValueError('port must be decimal') from exc
    if not 1 <= number <= 65535: raise ValueError('port out of range')
    return number
assert port('443') == 443
~~~

### Challenge and misconception
Test 'abc', '0' and '65536' separately. Trace where exceptions are raised versus caught and preserve original cause using `raise ... from ...` when translating an error between layers.

**Further reading:** https://docs.python.org/3/tutorial/errors.html

## Expression

### Meaning and constraints
An expression evaluates to a value; a statement performs an action in the language grammar. Operators, precedence and side effects affect the value produced. Parentheses clarify intent even when precedence rules would produce the same result.

### A concrete use
~~~python
a, b, c = 2, 3, 4
assert a + b * c == 14
assert (a + b) * c == 20
square = lambda n: n * n
assert square(a + 1) == 9
~~~

### Challenge and misconception
Write the syntax tree for `2+3*4` and `(2+3)*4`. Distinguish `n = 5` (assignment statement) from `n == 5` (comparison expression) in Python, then predict the result before running.

**Further reading:** https://docs.python.org/3/reference/expressions.html

## File descriptor

### Meaning and constraints
On POSIX-like systems a file descriptor is a small integer handle that a process uses for an open file, pipe or socket. Standard input, output and error commonly occupy descriptors 0, 1 and 2. A descriptor refers to an open resource, not directly to a filename.

### A concrete use
~~~python
import os
read_fd, write_fd = os.pipe()
try:
    os.write(write_fd, b'ok')
    assert os.read(read_fd, 2) == b'ok'
finally:
    os.close(read_fd); os.close(write_fd)
~~~

### Challenge and misconception
Explain why both pipe ends must be closed on failure and success. Investigate what happens if a long-lived process leaks descriptors. POSIX descriptor APIs may differ on Windows; this example requires os.pipe support.

**Further reading:** https://docs.python.org/3/library/os.html#file-descriptor-operations

## Finite state machine

### Meaning and constraints
A finite-state machine models a system using a limited set of states and explicitly permitted transitions. Rather than scattering booleans such as is_loading/is_done/is_error that can contradict one another, an enum makes mutually exclusive states representable.

### A concrete use
~~~python
from enum import Enum
class Status(Enum): IDLE=1; LOADING=2; DONE=3
allowed = {Status.IDLE:{Status.LOADING}, Status.LOADING:{Status.DONE}, Status.DONE:set()}
assert Status.DONE in allowed[Status.LOADING]
~~~

### Challenge and misconception
Design a retry transition DONE→LOADING only if your product genuinely permits it. Test an invalid direct IDLE→DONE jump and explain which code layer must reject it.

**Further reading:** https://en.wikipedia.org/wiki/Finite-state_machine
