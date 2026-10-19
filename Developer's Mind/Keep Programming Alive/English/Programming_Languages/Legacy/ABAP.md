# abap — consolidated language guide

## ABAP

### Working model
ABAP is used in SAP business systems and strongly depends on the data dictionary and authorization model of the installed SAP environment.

### Focused source example
```text
REPORT z_example.
DATA count TYPE i VALUE 3.
WRITE: / count.
```

In a permitted sandbox, change the integer and predict the displayed value. Inspect whether a database table access requires business authorization.

### Evidence to collect
Record the exact ABAP compiler or runtime version, required dependencies, and output from harmless test data. Predict an observation before checking it, and keep both the initial and revised source to show which change caused the result. Do not claim that a displayed fragment was executed if the platform is unavailable.

### Failure mode worth investigating
A local generic interpreter cannot replace an SAP runtime; ABAP statements and database access are contextual.

## ABAP: applied exercises

ABAP programs commonly run within an SAP application server, where repository objects, activation, authorization and data access are governed by the installation. A REPORT statement declares an executable report; it does not itself fetch records from a database. Do these exercises only in an approved training or sandbox system, not in an organization's production client.

### Exercise 1: a report without database side effects

~~~abap
REPORT zlearn.
DATA total TYPE i VALUE 2.
total = total + 3.
WRITE: / total.
~~~

Predict the list output 5. The declaration TYPE i is an integer type, VALUE 2 initializes it, and the assignment changes it. The WRITE statement displays data; it is not an UPDATE of a table. Vary the initial value to 0, then -2, and predict 3 and 1. Verify that the report name meets the object naming rules of your SAP training environment; the z prefix usually denotes a customer namespace.

### Exercise 2: distinguish display, read and update

Describe what SELECT, WRITE and UPDATE do in their respective contexts. A SELECT from a table needs permission and an appropriate test dataset. For this lab, sketch a read-only query that selects only required columns and filters with a WHERE condition; do not run any business-data modification. Explain how missing authorization, an empty result and a syntax error produce different observations.

### Exercise 3: explain the lifecycle of an object

Creating ABAP source, activating it and executing an authorized report are distinct steps. A class method is not automatically an executable report. Write a checklist to show where syntax checks, activation, transport rules and runtime authorization apply. Compare a local arithmetic report with one that depends on an SAP application table; the latter cannot be reproduced on a plain Linux shell.

### Completion evidence

Record the SAP ABAP release or environment, report output, test client, activation result and whether database objects were accessed. If you have no SAP system, the code above remains a static illustration and its expected result should not be described as measured output. Passing this exercise means you can separate the language statement REPORT from database transactions and explain why permissions matter.

## ABAP — Focused mastery pathway

### Environment
Use a permitted SAP training client that supports modern ABAP syntax. An internal table lives in program memory; it is not automatically a database table. The small report below uses synthetic integers, so no employee or customer records are accessed.

### In-memory ABAP report
~~~abap
REPORT ztraining_inttable.
DATA numbers TYPE STANDARD TABLE OF i WITH EMPTY KEY.
APPEND 7 TO numbers.
APPEND 2 TO numbers.
APPEND 5 TO numbers.
SORT numbers ASCENDING.
READ TABLE numbers INTO DATA(smallest) INDEX 1.
IF sy-subrc = 0.
  WRITE: / smallest.
ENDIF.
~~~
Expected output: 2. INDEX 1 means the first row of a STANDARD TABLE; the table is sorted before the read. A READ TABLE call sets sy-subrc, which should be checked immediately. The declared EMPTY KEY prevents a misleading implicit standard key, but indexed operations still work.

### Negative and comparison tests
1. Remove SORT and predict what INDEX 1 returns: insertion order now matters.
2. Change INDEX 1 to INDEX 99. Verify sy-subrc=4 and do not treat the previous target variable as a valid result.
3. Use a line structure containing a product ID and quantity; compare linear search on STANDARD TABLE with SORTED or HASHED TABLE key lookup.
4. Try a duplicate product ID with a unique key and document the error rather than silently overwriting a record.
5. For a genuine training database query, use bounded WHERE conditions, the minimal columns, and correct authorization; a SELECT inside a large processing loop may create unnecessary round trips.

### Pass criteria
Provide the exact ABAP language/SAP version, test-client permission, code, successful output and observed sy-subrc failure. Static examples are not evidence of an executed SAP report. Documentation: https://help.sap.com/docs/abap-cloud/abap-keyword/ABAPREAD_TABLE_WHERE.html
