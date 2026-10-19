# Managed code and metadata

## Concept

Many .NET assemblies expose types, members and Common Intermediate Language rather than direct CPU instructions. Native AOT is different, so identify the artifact first.

## Without AI: practice

Compile a small C# class and compare source with metadata in a compatible offline viewer. Separate signatures from actual observed method calls.

## Verify it

State why a method signature does not guarantee a method runs under your test input.

## With AI (optional)

Ask AI to label metadata facts versus CIL interpretation versus untested claims.

## Practical lab: metadata, CIL and observed execution

A managed assembly may contain type names, method signatures, references, resources and Common Intermediate Language. Their presence establishes structure, not that a specific method actually ran.

Create this C# program under the .NET SDK:

~~~csharp
using System;
class Program {
    static int Classify(int x) => x < 0 ? -1 : x == 0 ? 0 : 1;
    static void Main() => Console.WriteLine(Classify(0));
}
~~~

Build in Debug and Release, recording runtime output (expected 0). With a compatible IL viewer, locate Classify and inspect its branch instructions. On machines with IL Disassembler installed, ildasm can inspect assembly metadata; availability varies by SDK and operating system. Run variants with inputs -1, 0 and 8: expected outputs are -1, 0 and 1. Log which outcomes were *observed* and which were inferred from the IL listing.

A method definition is not a call; virtual dispatch, exceptions and JIT or ahead-of-time optimization can alter how code reaches the CPU. NativeAOT is not necessarily inspectable as ordinary CIL. Debug symbols improve labels but do not prove behavior.

Produce a four-column ledger: signature, IL evidence, test input and recorded result. Reference: https://learn.microsoft.com/en-us/dotnet/standard/assembly/view-contents.
