# Glossary: mocks, modules and namespaces

## Mock

### Definition and boundaries
A controlled test replacement for a real dependency. It can simulate a timeout and verify calls but cannot establish that a real server follows the same request/response protocol.

### Working miniature
~~~text
from unittest.mock import Mock
send=Mock(return_value={'ok':True})
assert send('hi')['ok']
send.assert_called_once_with('hi')
~~~

### Guided investigation
Configure TimeoutError using side_effect, assert the caller handles it, then run an integration test against an authorized sandbox.

### Check your understanding
For Mock, change one input in the example and explain whether the observed behavior still satisfies the stated definition. Record the exact output and distinguish a program error from a mistaken assumption.

## Module

### Definition and boundaries
Named unit that groups reusable definitions. Python runs a module's top-level statements on import, so module organization alone cannot ensure code has no side effects.

### Working miniature
~~~text
from math import isfinite
assert isfinite(2.5)
assert not isfinite(float('nan'))
~~~

### Guided investigation
Move a parser to parser.py and a command-line entry point to cli.py. Use if __name__ == '__main__' to prevent unexpected execution at import.

### Check your understanding
For Module, change one input in the example and explain whether the observed behavior still satisfies the stated definition. Record the exact output and distinguish a program error from a mistaken assumption.

## Namespace

### Definition and boundaries
Mapping from identifiers to objects in a scope or module. Qualifying an imported function avoids name collisions, but a namespace does not enforce authorization or memory isolation.

### Working miniature
~~~text
import math
import statistics
assert math.sqrt(9)==statistics.mean([3,3])
~~~

### Guided investigation
Create a local sqrt binding and compare access through math.sqrt. Trace which definition each expression resolves to.

### Check your understanding
For Namespace, change one input in the example and explain whether the observed behavior still satisfies the stated definition. Record the exact output and distinguish a program error from a mistaken assumption.

## Null

### Precise meaning
Explicit absence marker different from 0, false and empty text. Python None, JSON null and JavaScript null/undefined do not share identical rules.

### Reference experiment
~~~text
import json
assert json.loads('null') is None
assert json.loads('0') == 0
assert json.loads('""') == ''
~~~

### Investigate the boundary
Represent absent nickname, nickname=None and nickname='' separately. Test whether a truthiness check accidentally merges them.

### Independent check
For Null, document the expected outcome before running the sample. Change one important assumption and decide whether the failure belongs to the caller, the implementation or the environment.

## Object

### Precise meaning
A runtime value with identity, properties and possibly methods. Separate instances can hold independent state even if constructed by the same class.

### Reference experiment
~~~text
class Counter:
    def __init__(self): self.value=0
    def inc(self): self.value+=1
a,b=Counter(),Counter(); a.inc()
assert (a.value,b.value)==(1,0)
~~~

### Investigate the boundary
Add a mutable class-level list and observe unintended sharing; move it into __init__ to repair the ownership boundary.

### Independent check
For Object, document the expected outcome before running the sample. Change one important assumption and decide whether the failure belongs to the caller, the implementation or the environment.
