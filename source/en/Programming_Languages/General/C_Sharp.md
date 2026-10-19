# c_sharp — consolidated language guide

## C#

**Typical use:** General-purpose programming.

**Suggested file extension:** `.cs`.

**How to run / environment:** Create a dotnet console project and replace Program.cs.

### Starter example

```
string Greet(string name) => $"Hello, {name}!";
Console.WriteLine(Greet("Ada"));
```

### How to read it

Top-level statements simplify modern console programs.

### Common pitfall

Top-level statements simplify modern console programs.

## C_Sharp — Expanded practice workbook

### Use a self-contained console experiment
Create a fresh `dotnet new console` project and replace `Program.cs` with this small dataset rather than assuming an external database or a UI framework:

~~~csharp
using System;
using System.Linq;
var people = new[] {
    new { Name = "Ada", Points = 5 },
    new { Name = "Lin", Points = 2 },
    new { Name = "Ava", Points = 5 }
};
var winners = people.Where(p => p.Points >= 5)
                    .OrderBy(p => p.Name)
                    .Select(p => p.Name);
Console.WriteLine(string.Join(",", winners));
~~~

The expected line is `Ada,Ava`. `Where` filters and `Select` projects; `OrderBy` makes the result deterministic for this finite fixture. `IEnumerable` LINQ queries are often deferred: do not assume a query has already copied source values simply because it was defined. Record SDK version and output; this example was not executed against a .NET toolchain here.

### Prove when evaluation happens
Define the query, modify a separate mutable collection, and enumerate the query twice. Document whether the observable results change. Then materialize with `ToArray()` before the modification and compare. The distinction is between a query definition and a snapshot, not between 'fast LINQ' and 'slow loops'.

### Examine nullable input
Add a string input field of type `string?`. Use `int.TryParse` with an explicit success branch rather than forcing `int.Parse` or using the null-forgiving `!` operator without evidence. Test `"12"`, `"bad"`, `null` and empty text. Explain why a parsing failure must not masquerade as the legitimate score zero.

### Independent task
Group people by Points using `GroupBy` and output names within each group in sorted order. Test equal scores, an empty input and unexpected whitespace in a name. Compare exact sequence order, not only item count; never rely on unspecified upstream database order. Use `dotnet test` when a test project exists, or console assertions in an isolated scratch project. References: https://learn.microsoft.com/dotnet/csharp/ and https://learn.microsoft.com/dotnet/csharp/linq/

## C_Sharp — Practical runnable code lab

### How to run the samples

These independent samples use the appropriate language toolchain. Representative command: `dotnet run`. Replace placeholders with the actual filename, keep test data isolated, and do not interpret this as automatic installation.


## C_Sharp — Focused mastery pathway

### Stage 1: understand the execution model
Create a console project with nullable reference types enabled. Parse a CLI port using int.TryParse and check 1..65535. Distinguish an invalid string from a valid zero that fails domain validation.

### Stage 2: prove the rule with controlled cases
Build a record for configuration and a discriminated-style result for success versus error. Write tests covering empty input, null, 65535, 65536 and leading whitespace. Investigate why a nullability annotation alone does not validate JSON.

### Stage 3: build a small, reviewable project
Use async Task to read a local file and compare awaiting it with blocking Task.Result. Add cancellation using CancellationToken and verify the canceled operation exits without modifying target data. Pin the .NET SDK target for repeatability.

## C Sharp — Technical notes and common pitfalls

### Core knowledge

1. Nullable reference-type annotations help static analysis but require project configuration.
2. async/await expresses asynchronous workflows; Task does not imply a new dedicated thread.
3. using and await using can deterministically dispose resources.
