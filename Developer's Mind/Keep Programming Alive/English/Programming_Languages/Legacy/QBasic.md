# qbasic — consolidated language guide

## QBasic

### Working model
QBasic is a historical BASIC dialect with explicit line-oriented input/output conventions and simple procedures; it is distinct from modern VB.NET.

### Focused source example
```text
LET total = 0
FOR i = 1 TO 4
  total = total + i
NEXT i
PRINT total
```

Trace the accumulator for i=1,2,3,4 and check the printed sum of 10; then vary the upper bound by one.

### Evidence to collect
Record the exact QBasic compiler or runtime version, required dependencies, and output from harmless test data. Predict an observation before checking it, and keep both the initial and revised source to show which change caused the result. Do not claim that a displayed fragment was executed if the platform is unavailable.

### Failure mode worth investigating
Old QBasic programs may use DOS-era screen, keyboard and file assumptions not available in modern shells.

## QBasic: applied exercises

### A deliberately small console program
QBasic is a historical BASIC dialect and should be run in a compatible interpreter or emulator, not interpreted as modern Visual Basic .NET. Try this in a scratch program:

~~~qbasic
CLS
FOR I = 1 TO 3
    PRINT I * I
NEXT I
END
~~~

The three expected squares are 1, 4, 9. `FOR ... NEXT` advances the loop variable within an inclusive boundary. Change `TO 3` to `TO 0` and predict how often the body runs with the default positive step; verify in the chosen BASIC implementation and record its version.

### Make the step observable
Introduce `STEP 2` and compare the sequence against the original. Explain why the final included value depends on the start, stop and step sign. Also test a descending loop with an explicit negative step rather than merely reversing the endpoints and expecting the same behavior.

### Guard against conversion and range problems
Read a value with `INPUT` in a disposable interactive version. Test nonnumeric input according to the interpreter's prompt behavior; do not invent universal error messages across different BASIC variants. Compare an ordinary integer variable with a long integer variable where supported. Large powers or squares may exceed representation range even though the loop logic is correct.

### Independent assignment
Implement a multiplication table for 1 through 5 using nested `FOR` loops, and count its printed rows. Add a check that the sum of 1 through N matches `N*(N+1)/2` for small positive N. Trace the first and last iteration of each loop. Avoid copying QBasic-specific screen or file operations into modern runtimes unchanged. Reference: https://qb64.com/wiki/

## QBasic — Focused mastery pathway

### Runtime assumption
Target Microsoft QBasic / QuickBASIC-style syntax, not Visual Basic .NET. Write a tiny stock counter that classifies input quantities; keep it in memory so no disk file can be accidentally overwritten. Numeric INPUT has its own re-entry behavior on a mismatched type, while domain validation still belongs in the program.

### Example (stock.bas)
~~~basic
CLS
DIM Qty AS INTEGER
INPUT "Quantity to inspect"; Qty
SELECT CASE Qty
    CASE IS < 0
        PRINT "REJECT: negative quantity"
    CASE 0
        PRINT "EMPTY"
    CASE 1 TO 5
        PRINT "LOW STOCK"
    CASE ELSE
        PRINT "STOCKED"
END SELECT
~~~
Enter 3: LOW STOCK. Enter 0: EMPTY. Enter -2: REJECT. Enter 9: STOCKED. SELECT CASE is exclusive: the first matching branch executes. CASE IS < 0 and CASE 1 TO 5 are distinct syntactic forms. This example *classifies* a value; it does not change an inventory ledger or prove correct storage.

### Deliberate failure labs
1. Remove CASE ELSE and enter 9: nothing is printed. Decide whether silent fallthrough violates the UI contract.
2. Change CASE 1 TO 5 to CASE 5 TO 1. The reversed interval cannot match ordinary values.
3. Enter letters at the numeric INPUT prompt and observe the interpreter requesting a valid numeric entry; record the actual dialect behavior rather than guessing.
4. To support arbitrary text safely, use LINE INPUT into a string and write explicit lexical validation before converting it. VAL alone is not enough to detect junk suffixes.
5. Add a three-choice menu with SELECT CASE, write down all branches and test an unsupported option.

### Completion standard
Save the .BAS file, interpreter/version, transcript of four inputs and a screenshot of one invalid case. Re-check syntax if porting to QB64 or other BASIC dialects. Reference: https://qbasic.net/en/qb-manual/Statement/SELECT%20CASE.htm
