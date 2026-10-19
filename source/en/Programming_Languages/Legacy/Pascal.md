# pascal — consolidated language guide

## Pascal

### Mental model
Pascal uses declared types and structured procedure syntax; dialect features vary between Free Pascal, Delphi and older compilers.

### Minimal source sample
```text
program Add;
var n: integer;
begin
  n := 2 + 3;
  writeln(n);
end.
```

### Experiment to carry out
Trace the assignment operator := and distinguish variable declarations from the executable begin/end block.

### A specific failure to distinguish
String encoding, units and available libraries differ by dialect; compile using the dialect selected by the real project.

To evaluate the exercise, record the initial input, predicted behavior and actual observation in a compatible Pascal environment. Add a second run changing only one variable or argument; this makes the comparison attributable to a concrete cause. If the required runtime is not installed, treat the example as unexecuted source analysis and never label an imagined output as a passing test.

## Pascal — Expanded practice workbook

### Inspect the smallest source
~~~text
program Hello;
begin
  WriteLn('Hello, Ada!');
end.
~~~

**Run or compilation context:** fpc hello.pas && ./hello.. Treat this as a baseline: save a copy, confirm the toolchain version and note whether the example merely evaluates a value, prints text, or creates external effects. Production accounts, datasets and hardware must not be used for first attempts.

### Work through the actual mechanism
Read bounded integer input using Val with an error-position code, then implement a typed record array and a function returning the maximum safely.

### Diagnose the sharp edge
A program's array index bounds and default numeric types depend on compiler dialect. Enable range checking for the test build.

## Pascal — Focused mastery pathway

### Target toolchain
Use Free Pascal in objfpc mode; do not assume this program behaves identically under Turbo Pascal or Delphi. Model an inventory with fixed-capacity typed records, then reject malformed numerical input *before* it changes state.

### Minimal executable program
Save as ledger.pas and compile with a Free Pascal compiler.
~~~pascal
program Ledger;
{$mode objfpc}
{$R+}
type
  TItem = record
    Name: string;
    Qty: Integer;
  end;
var
  Items: array[1..2] of TItem;
  Parsed, Code: Integer;
begin
  Items[1].Name := 'bolt';
  Val('7', Parsed, Code);
  if Code <> 0 then Halt(1);
  Items[1].Qty := Parsed;
  Items[2].Name := 'nut';
  Items[2].Qty := 2;
  WriteLn(Items[1].Qty + Items[2].Qty);
end.
~~~
The expected output is 9. Val writes a nonzero error position into Code for invalid characters. Quantity is stored only after parsing succeeds. The array has **two** valid indices, 1 and 2. {$R+} enables runtime range checks in Free Pascal; a deliberate read of Items[3] in a scratch copy should raise a range-check error instead of silently corrupting memory.

### Practice and counterexamples
1. Replace '7' with '7x': check Code and ensure the program rejects the input.
2. Introduce Qty < 0 as an invalid business state and reject it independently of Val.
3. Add a third row: update the declared array bounds *before* writing index 3.
4. Replace the fixed array with a dynamic array and document allocation and resizing behavior. Measure whether lookup by name remains linear.

### Evidence and portability
Record the Free Pascal version, compiler flags, source, output for valid and invalid input and observed range-check diagnostic. Bounds checking and integer-overflow checking are different features; do not infer one from the other. Reference: https://www.freepascal.org/docs-html/current/prog/progsu65.html
