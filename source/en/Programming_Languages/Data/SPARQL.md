# sparql — consolidated language guide

## SPARQL

RDF stores subject–predicate–object triples. SPARQL matches graph patterns; a missing triple is not automatically a false statement. Use a local SPARQL 1.1 editor or triple store with a disposable dataset.

### Reproducible two-file example

Save and import `friends.ttl`:

~~~turtle
@prefix ex: <https://example.org/> .
ex:ada ex:knows ex:grace, ex:lin .
ex:grace ex:knows ex:lin .
ex:lin ex:knows ex:ada .
~~~

Execute `friends.rq` against the same dataset:

~~~sparql
PREFIX ex: <https://example.org/>
SELECT ?person (COUNT(?friend) AS ?connections)
WHERE {
  ?person ex:knows ?friend .
  FILTER(?person != ?friend)
}
GROUP BY ?person
ORDER BY DESC(?connections) ?person
~~~

Expected rows are Ada=2, Grace=1 and Lin=1. The `GROUP BY` defines which values are counted together. The secondary `ORDER BY` expression makes ties deterministic.

### Boundary cases

Duplicate Ada→Lin in Turtle: RDF graph set semantics means the count stays 2. Add Lin→Lin: the `FILTER` excludes it. Remove `GROUP BY` while selecting `?person` to observe a query validation error.

**Exercise:** add `HAVING (COUNT(?friend) >= 2)`; then use `OPTIONAL` for labels and explain unbound variables.

**Troubleshooting:** for zero rows, start with `SELECT * WHERE { ?s ?p ?o } LIMIT 5`. Check the selected graph and prefix IRIs before rewriting the query. Never update a public endpoint without permission.

Reference: https://www.w3.org/TR/sparql11-query/

## SPARQL: applied exercises

### Make the data explicit
The starter asks for up to five subjects matching any triple. That depends entirely on the graph supplied by the RDF store; an empty graph returns no bindings. Avoid interpreting the query as a database-independent demo. In an isolated local RDF dataset save this `people.ttl`:

~~~turtle
@prefix ex: <https://example.org/people/> .
ex:ada ex:age 21 .
ex:ben ex:age 17 .
ex:cy ex:age 21 .
~~~

Then run the following query with a SPARQL 1.1 engine, loading `people.ttl` as its default graph:

~~~sparql
PREFIX ex: <https://example.org/people/>
SELECT ?person WHERE {
  ?person ex:age ?age .
  FILTER (?age >= 18)
}
ORDER BY ?person
~~~

The expected bindings, in this order, are `ex:ada` and `ex:cy`; implementations may display full IRIs instead of prefixed names. This is a predicted fixture outcome, not a recorded engine run.

### Understand graph matching
The triple pattern binds `?person` and `?age`. `FILTER` accepts only numeric ages meeting the threshold. A resource lacking `ex:age` does not match the mandatory pattern; it is not treated as age zero. Add `ex:dan ex:label "Dan".` without age and confirm it is absent. Use an `OPTIONAL` block only when you intentionally want a row even without an age, and decide how to handle an unbound variable.

### Find a real failure
Deliberately remove the `PREFIX ex:` declaration and capture the parser's message about an undeclared prefix. This tests **query syntax**, unlike changing the threshold to 30, which should be a valid query returning an empty result set. Distinguish parsing failure from a successful query with no matches.

### Extension and evidence
Insert a second `ex:age` value for a person and explain why a SELECT result can repeat that person unless `DISTINCT` is specified. Add `SELECT DISTINCT` and compare cardinality. Avoid sending synthetic personal names to a public endpoint; the local fixture is sufficient. Record graph loading method, SPARQL engine version and exact output for each mutation. Standard: https://www.w3.org/TR/sparql11-query/
