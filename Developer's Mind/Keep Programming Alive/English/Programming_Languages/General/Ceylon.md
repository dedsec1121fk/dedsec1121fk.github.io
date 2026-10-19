# ceylon — consolidated language guide

## Ceylon

### Working model
Ceylon explored a statically typed modular language for JVM and JavaScript targets. The ecosystem is historical and tooling may be archived.

### Focused source example
```text
shared void run() {
    print("Hello, Ceylon!");
}
```

Distinguish nullable and non-nullable values in its type system; reproduce a basic program only in a compatible archived toolchain.

### Evidence to collect
Record the exact Ceylon compiler or runtime version, required dependencies, and output from harmless test data. Predict an observation before checking it, and keep both the initial and revised source to show which change caused the result. Do not claim that a displayed fragment was executed if the platform is unavailable.

### Failure mode worth investigating
Avoid depending on abandoned package infrastructure for new projects; record version and archived sources.

## Ceylon: applied exercises

Ceylon uses a typed syntax where the declaration shared void run() marks a program entry point. The project is discontinued, so do not assume a modern package manager installs a working compiler. Use an authorized, isolated historical toolchain if you want to execute these examples; otherwise treat them as source-reading labs.

### Exercise 1: trace a sequence

~~~ceylon
shared void run() {
    value names = ["Ada", "Grace", "Linus"];
    print(names.size);
}
~~~

Predict the output 3 from the size of a three-element sequence. The program does not change the sequence, and the element order has no effect on its size. Reduce the list to one element, then an empty sequence, and distinguish a zero-sized collection from a missing optional value. The word value infers the declared variable's type; it does not mean the variable is dynamically typed.

### Exercise 2: the distinction between optional and definite

Consider a String? name supplied from a nullable source. The correct operation before using it as a String is an existence/type refinement (for example, an if (exists name) condition in Ceylon). Contrast this with assigning an absent value straight to a non-optional String. State exactly what the type checker should reject rather than pretending the error occurs at runtime.

### Exercise 3: make a meaningful comparison

Compare a sequence of names with a Set of names. Duplicates have different consequences for size and membership, so the acceptance criterion is not merely 'both can be iterated'. Discuss when preserving duplicates and order is required. Identify the source version and type aliases actually provided by the chosen historical Ceylon distribution before writing runnable tests.

### Completion checklist

Supply predicted outputs for a 3-element sequence, singleton and empty sequence; explain why type inference is still static typing; state which null-related operation is rejected; and record the exact compiler version or label each claim unexecuted. Do not claim modern JVM compatibility without verifying the runtime required by that Ceylon release.

## Ceylon — Focused mastery pathway

### Stage 1: understand the execution model
Read a minimal Ceylon hello module and identify module descriptor, package name and source directory. Explain how declarations, imports and package visibility differ from Java without assuming Maven layout.

### Stage 2: prove the rule with controlled cases
Create a nullable String value and narrow it using an explicit existence test. Trace the resulting type in both branches and distinguish a union type from a runtime cast. Compile using an available historical Ceylon toolchain.

### Stage 3: build a small, reviewable project
Model an immutable list transformation and a function with explicitly documented input constraints. Record compiler version and module dependencies; Ceylon is discontinued, so do not pretend that a recent JDK automatically supports its tooling.
