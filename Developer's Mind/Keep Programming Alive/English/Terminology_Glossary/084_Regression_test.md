# Glossary: regressions, REST and runtimes

## Regression test

### Precise meaning
A test retaining a demonstrated bug's reproduction so that future edits detect its return. A regression test should fail on the defective version and pass on the corrected one.

### Reference experiment
~~~text
def strip_spaces(text): return text.strip()
assert strip_spaces(' Ada ')=='Ada'
~~~

### Investigate the boundary
Reproduce a bug involving leading/trailing spaces. First write a failing assertion for the old behavior, then fix code and verify both ordinary and edge cases.

### Independent check
For Regression test, document the expected outcome before running the sample. Change one important assumption and decide whether the failure belongs to the caller, the implementation or the environment.

## REST

### Precise meaning
Architectural constraints for distributed systems, including client/server separation, stateless interactions, cacheability and a uniform interface. JSON over HTTP does not automatically make an API RESTful.

### Reference experiment
~~~text
GET /tasks/5 HTTP/1.1
Host: example.test

# 200 with representation, or 404 if unavailable
~~~

### Investigate the boundary
Design GET/POST/PATCH routes for tasks and distinguish HTTP method semantics. Identify a retry-safe read and a write requiring idempotency considerations.

## Runtime

### Actual meaning
The phase and environment where compiled or interpreted code actually executes, including libraries and operating-system behavior. Compile-time correctness does not guarantee compatible runtime versions.

### Concrete starting point
~~~text
import sys
assert sys.version_info.major == 3
print(sys.platform)
~~~

### Apply the rule
Compare an installed Python interpreter with a project-specific virtual environment. Identify an import error caused by missing runtime dependency.

### Diagnose a counterexample
For Runtime, write down the expected outcome, deliberately break an assumption from this specific example, and determine what must be checked at the boundary before this behavior could be reused safely.

## Schema

### Actual meaning
A specification of allowed fields, types and constraints. Parsing JSON only guarantees syntax; a schema can require nonempty names, reject unknown keys or specify migration compatibility.

### Concrete starting point
~~~text
def check(row):
    if set(row) != {'name','age'}: raise ValueError('keys')
    if type(row['age']) is not int or row['age']<0: raise ValueError('age')
    return row
assert check({'name':'Ada','age':3})['age']==3
~~~

### Apply the rule
Test extra keys, missing keys, boolean age and negative age. Explain why this is stronger than accepting any dict.

## Serialization

### Actual meaning
Turning in-memory values into a transferable or storable representation. Deserialization reverses that transformation, but not all object types round-trip without information loss.

### Concrete starting point
~~~text
import json
source={'items':[1,2], 'enabled':True}
encoded=json.dumps(source,ensure_ascii=False)
assert json.loads(encoded)==source
~~~

### Apply the rule
Round-trip Unicode text, tuple and date-like data; record where JSON changes the original Python representation.

### Diagnose a counterexample
For Serialization, write down the expected outcome, deliberately break an assumption from this specific example, and determine what must be checked at the boundary before this behavior could be reused safely.
