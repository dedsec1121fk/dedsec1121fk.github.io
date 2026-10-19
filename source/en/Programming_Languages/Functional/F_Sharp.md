# f_sharp — consolidated language guide

## F#

### Mental model
F# is an ML-family language on .NET with type inference, immutable values and strong support for discriminated unions.

### Minimal source sample
```text
let squares = [1; 2; 3] |> List.map (fun x -> x * x)
printfn "%A" squares
```

### Experiment to carry out
Trace the pipe operator and compare list with array operations before using a collection in a pipeline.

### A specific failure to distinguish
The type checker infers concrete collection types; do not assume a C# List<T> is the same as an F# list.

To evaluate the exercise, record the initial input, predicted behavior and actual observation in a compatible F_Sharp environment. Add a second run changing only one variable or argument; this makes the comparison attributable to a concrete cause. If the required runtime is not installed, treat the example as unexecuted source analysis and never label an imagined output as a passing test.

## F_Sharp — Expanded practice workbook

### Run a script with explicit outcomes
F# runs on .NET but has its own expression-oriented syntax and algebraic data types. Save `parse.fsx`:

~~~fsharp
let parseScore (text: string) =
    match System.Int32.TryParse(text) with
    | true, score -> Some score
    | false, _ -> None

assert (parseScore "12" = Some 12)
assert (parseScore "bad" = None)
assert (parseScore "0" = Some 0)
printfn "%A" (parseScore "-3")
~~~

Using a suitable .NET SDK, run `dotnet fsi parse.fsx`. The predicted output is `Some -3`. The `Some` and `None` cases are distinct from legitimate zero; consumers must pattern-match or otherwise handle the absent value. Record .NET SDK and F# compiler versions before comparing results with another machine.

### Separate type checking from business validation
The parser accepts `-3` as an integer. If a score must be nonnegative, that is a separate rule. Write a function returning `Result<int,string>` (or equivalent inferred type) with `Ok` for valid values and `Error` for malformed or negative input. Explain how the error description travels to the caller without raising a generic exception.

### A controlled type mistake
Temporarily change the success result to `Some "twelve"` while keeping the failure result `None`, and compare inferred types with the integer-returning original. The compiler may infer an option of strings; the later equality assertion against `Some 12` then exposes the contract mismatch. Capture the actual diagnostic instead of guessing at the message wording.

### Independent extension
Process a list `["3"; "bad"; "0"; "-1"]`. Use `List.map` and then explicitly choose whether invalid entries are rejected, grouped as errors or dropped. Compare `List.choose` with `List.map`: dropping `None` loses positional information. Add an empty list and very large numeric text. Reference: https://learn.microsoft.com/dotnet/fsharp/

## F_Sharp — Practical runnable code lab

### How to run the samples

These independent samples use the appropriate language toolchain. Representative command: `dotnet fsi {file}`. Replace placeholders with the actual filename, keep test data isolated, and do not interpret this as automatic installation.
