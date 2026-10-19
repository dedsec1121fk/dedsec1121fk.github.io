# Glossary: parameters, parsers and path traversal

## Parameter

### Precise meaning
A name in the function definition; an argument is the actual call-site value. Positional and keyword-only parameters form separate compatibility contracts.

### Reference experiment
~~~text
def power(base, *, exponent=2): return base**exponent
assert power(3)==9
assert power(3,exponent=3)==27
~~~

### Investigate the boundary
Attempt power(3,3) and inspect the TypeError. Add validation on exponent and test that negative values follow a documented policy.

### Independent check
For Parameter, document the expected outcome before running the sample. Change one important assumption and decide whether the failure belongs to the caller, the implementation or the environment.

## Parser

### Precise meaning
Software translating serialized text or tokens into structured values according to a grammar. Successful parsing does not establish business validation.

### Reference experiment
~~~text
import csv,io
r=list(csv.DictReader(io.StringIO('name,score\n"Ada, Jr",4\n')))
assert r[0]['name']=='Ada, Jr'
~~~

### Investigate the boundary
Compare this with split(',') and diagnose why quoted commas break the naive implementation. Validate numeric scores afterward.

### Independent check
For Parser, document the expected outcome before running the sample. Change one important assumption and decide whether the failure belongs to the caller, the implementation or the environment.

## Path traversal

### Precise meaning
An untrusted path escapes its intended directory using ../, absolute paths or symbolic links. A string-prefix check can be fooled by sibling names.

### Reference experiment
~~~text
from pathlib import Path
root=Path('/tmp/workspace').resolve()
target=(root/'../outside.txt').resolve()
assert root not in target.parents
~~~

### Investigate the boundary
Create a disposable directory and an escaping symlink, then identify the time-of-check/time-of-use gap between resolve and open.

### Independent check
For Path traversal, document the expected outcome before running the sample. Change one important assumption and decide whether the failure belongs to the caller, the implementation or the environment.

## Polymorphism

### Precise meaning
A shared interface supports values with different implementations. Substitutability matters: a subtype should preserve the behavior expected by callers, not merely have the same method name.

### Reference experiment
~~~text
def area(shape): return shape.area()
class Square:
    def area(self): return 9
assert area(Square())==9
~~~

### Investigate the boundary
Implement Circle with a radius and compare with Square under the same area API. Test a broken shape that returns a string instead of a number.

### Independent check
For Polymorphism, document the expected outcome before running the sample. Change one important assumption and decide whether the failure belongs to the caller, the implementation or the environment.

## Process

### Precise meaning
An OS-managed execution instance with its own address space and resources. Separate processes communicate by IPC, files or sockets, unlike threads within one address space.

### Reference experiment
~~~text
import os
pid=os.getpid()
assert isinstance(pid,int) and pid>0
~~~

### Investigate the boundary
Launch a harmless child using subprocess.run with an argument list, capture its exit code and distinguish process exit from a shell command.

### Independent check
For Process, document the expected outcome before running the sample. Change one important assumption and decide whether the failure belongs to the caller, the implementation or the environment.
