# apex — consolidated language guide

## Apex

### Working model
Salesforce Apex is a server-side object-oriented language with transaction governor limits and an explicit test model.

### Focused source example
```text
Integer total = 0;
for (Integer n : new List<Integer>{1,2,3}) {
    total += n;
}
System.debug(total);
```

Trace the sum, then consider how a query placed inside a loop would scale when processing hundreds of records.

### Evidence to collect
Record the exact Apex compiler or runtime version, required dependencies, and output from harmless test data. Predict an observation before checking it, and keep both the initial and revised source to show which change caused the result. Do not claim that a displayed fragment was executed if the platform is unavailable.

### Failure mode worth investigating
Governor limits are enforced within Salesforce execution contexts; Java's or C#'s runtime behavior is not equivalent.

## Apex: applied exercises

Apex runs inside Salesforce, where one request or trigger execution has limits on database operations, heap and CPU. Start with a list exercise before writing to any organization data; Console / Execute Anonymous is sufficient when you have an authorized developer sandbox.

### Exercise: sum a list, then challenge an invariant

~~~apex
List<Integer> quantities = new List<Integer>{2, 5, 3};
Integer total = 0;
for (Integer qty : quantities) {
    total += qty;
}
System.debug(total);
~~~

The expected debug value is 10. In this exercise the loop invariant is that total equals the sum of elements already visited. Predict the result for an empty list and confirm that the accumulator remains zero. Next replace the collection with {2, -5, 3}; a signed quantity is valid as an Integer, so the expected sum is zero. Whether negative stock makes business sense is a separate validation rule and should not be confused with an Apex syntax error.

### Exercise: distinguish lists from maps

Build a Map<String, Integer> from the entries ('apple', 2) and ('pear', 5). Use containsKey before reading a possibly missing item, and specify what your application should do with unknown SKUs. A missing key is not the same thing as a missing Apex variable. Compare a list's positional indexing with a map's keyed lookup, documenting where ordering matters.

### Exercise: avoid hidden governor-limit problems

Sketch a trigger receiving 200 records. Mark the difference between querying once for all relevant IDs and querying inside a loop for each record. Do not run DML against a live organization for this teaching task. Explain why doing SOQL/DML per record risks transaction limits; bulkification is an architectural constraint, not an optimization reserved for large datasets.

### Evidence to keep

Record the org/runtime version, the exact anonymous execution context, and the expected debug values. The code here is an illustrative exercise, not a claim of an executed Salesforce test. Before moving from the sandbox, check validation rules, object permissions, and how transaction rollbacks affect the result. Do not treat a successful in-memory List example as proof that a database update is authorized.

## Apex — Focused mastery pathway

### Stage 1: understand the execution model
In a Salesforce sandbox, write an Apex class that queries records using a bound variable rather than concatenating a user string into SOQL. Explain how governor limits differ from ordinary database limits.

### Stage 2: prove the rule with controlled cases
Build an Apex test method using isolated test data, asserting both an authorized and unauthorized access decision. Study with sharing and inherited sharing, and check field-level/object permissions before exposing records.

### Stage 3: build a small, reviewable project
Simulate a bulk operation over 200 records, counting SOQL queries and DML operations. Refactor queries out of loops and record test coverage and limits. Never run these experiments against live customer data.

### Apex query-budget and access-control experiment
Create a test-only trigger that processes a batch of 200 records with repeated foreign keys. Count the SOQL calls when querying inside the record loop, then redesign by collecting IDs into a Set<Id> and querying outside the loop. The number of unique foreign keys, not raw record count, should determine work. Verify both the resulting updates and governor-limit counters with Test.startTest/Test.stopTest. Add one rejected update from a principal lacking field-level authorization. Do not run production DML or use SeeAllData=true. Distinguish sharing rules from object and field permissions: without the correct checks, bulkification alone does not make the operation safe.
