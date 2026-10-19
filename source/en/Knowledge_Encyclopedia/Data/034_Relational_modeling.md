# Data modeling: relational and JSON schema evolution

## Relational modeling

### Mechanism and scope
A relational model stores facts in tables linked by keys. Normalizing repeated entity details into separate tables reduces update anomalies, while denormalization can be a deliberate measured performance choice.

### Implementation example
~~~sql
PRAGMA foreign_keys=ON;
CREATE TABLE authors(id INTEGER PRIMARY KEY,name TEXT UNIQUE NOT NULL);
CREATE TABLE books(id INTEGER PRIMARY KEY,author_id INTEGER REFERENCES authors(id));
~~~

### Reproduce and investigate
Insert two books for one author, update the author's name once and verify both relationships. Attempt a child row referencing a missing author.

### Evidence to record
For Relational modeling, document the exact input that changes this outcome, the operation responsible for the change, and one falsifying test. Measure memory or timing only where it changes the claim, and do not treat a successful demonstration as a proof for every input.

## JSON and schema evolution

### Mechanism and scope
Changing a JSON API requires more than adding a field: clients may reject unknown keys, interpret absent keys differently and assume exact numeric types. Additive changes are often safer but not always compatible.

### Implementation example
~~~python
import json
old=json.loads('{"id":1}')
new=json.loads('{"id":1,"status":"ready"}')
assert old['id']==new['id']
~~~

### Reproduce and investigate
Write strict and permissive consumers and test both payloads. Define a migration policy for a removed field, null versus absent, and version negotiation.

### Evidence to record
For JSON and schema evolution, document the exact input that changes this outcome, the operation responsible for the change, and one falsifying test. Measure memory or timing only where it changes the claim, and do not treat a successful demonstration as a proof for every input.
