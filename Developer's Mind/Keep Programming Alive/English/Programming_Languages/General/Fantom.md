# fantom — consolidated language guide

## Fantom

### Working model
Fantom targets virtual-machine environments and emphasizes typed classes, modules called pods and a common standard library.

### Focused source example
```text
class Main {
  static Void main() { echo("Hello from Fantom") }
}
```

Explain which method is the entry point, then change the printed message and record the actual installed runtime version.

### Evidence to collect
Record the exact Fantom compiler or runtime version, required dependencies, and output from harmless test data. Predict an observation before checking it, and keep both the initial and revised source to show which change caused the result. Do not claim that a displayed fragment was executed if the platform is unavailable.

### Failure mode worth investigating
Do not assume a pod can load unchanged in every JVM or JavaScript host; check target compatibility and dependencies.

## Fantom: applied exercises

Fantom targets a managed runtime and can compile to different backends. Do not confuse the language's Str, Int, Void and nullable-reference notation with identically spelled types in Java or C#. To run a script, first establish a compatible Fantom installation and its exact version; the snippets below are illustrations rather than executed build reports.

### Exercise 1: reason about a class entry point

~~~fantom
class Hello {
  static Void main() {
    Str[] names := ["Ada", "Grace"]
    echo(names.size)
  }
}
~~~

The list has two elements, so predict an output of 2 when this class is launched through a compatible Fantom runtime. Change the collection to an empty list of Str and establish whether its declared type is still a string list rather than a nullable value. Explain why static Void main() is a method signature and echo() produces an observable side effect.

### Exercise 2: check the boundary between types

Create two values, one Str and one Int. Predict why direct arithmetic on a Str without conversion is not equivalent to adding two integers. Investigate Fantom's explicit conversion APIs in your installed version; do not assume an unchecked JavaScript-style coercion. For a nullable Str?, describe why a value must be handled before using a member that requires a non-null receiver.

### Exercise 3: model failures safely

A bad list index, a missing file and a type mismatch are not the same failure category. Design a tiny fixture for each without writing outside a disposable directory. For a list of size two, a request for index 2 is outside valid zero-based bounds. For a missing local file, the path and OS permissions matter. Document which failure is a compile-time type diagnostic and which requires an actual run to observe.

### Evidence

Record the Fantom version, backend, command used to invoke the class, expected output and actual output separately. If no runtime is available, leave the observed field blank. A correct explanation must mention why type checking and nullability matter, not merely repeat Hello World's output.

## Fantom — Focused mastery pathway

### Stage 1: understand the execution model
Install a compatible Fantom runtime and create a pod project with a class and main method. Distinguish the compilation of Fantom sources from executing a compiled pod.

### Stage 2: prove the rule with controlled cases
Use nullable types and a typed list of objects to model a simple inventory. Test how a missing item is represented, then replace silent null propagation with an explicit domain result.

### Stage 3: build a small, reviewable project
Explore Fantom's Java and JavaScript backends using one pure computation and note which APIs are available on each. Pin the SDK and dependencies before calling the result portable; browser and JVM capabilities differ.
