# dart — consolidated language guide

## Dart

### Operational idea
Dart supports sound null safety and asynchronous programming, powering Flutter as well as command-line applications.

### Source or deliberately marked concept
```text
void main() {
  final xs = [1, 2, 3];
  print(xs.reduce((a,b) => a + b));
}
```

### Apply it to one controlled task
Compute the sum and compare reduce with fold for an empty list, then handle a nullable value before use.

### Check the important boundary
Flutter widgets depend on a Flutter runtime; Dart CLI availability alone does not provide a rendering engine.

Work with disposable data in a genuine implementation of Dart where available. Record the actual tool version and compare your prediction with observed output. If a compatible runtime is missing, clearly mark this as static analysis instead of claiming it passed execution. Split the normal case from at least one boundary value, and avoid using sensitive or production datasets merely to follow a tutorial.

## Dart — Expanded practice workbook

### Model parsing explicitly
Dart's null-safe `int.tryParse` returns `int?`, not a magic zero when input is invalid. Put the following in a scratch `bin/parse_scores.dart` or standalone Dart file:

~~~dart
void main() {
  final raw = <String>['12', 'bad', '0', '-3'];
  final values = raw.map(int.tryParse).toList();
  assert(values[0] == 12);
  assert(values[1] == null);
  assert(values[2] == 0);
  assert(values[3] == -3);
  print(values);
}
~~~

Expected list values: `12, null, 0, -3`. Use `dart run` in a suitable package or `dart run file.dart` as supported by your SDK. Enable assertions when verifying: production configurations may disable `assert`. No Dart binary was available for an execution claim here.

### Understand the static constraint
A `List<int?>` cannot be treated as a `List<int>` without proving that no nullable elements remain. Filter with a predicate and explicitly map or promote each surviving value. The `!` operator asserts non-null at runtime; it is not validation. If you apply `!` to the invalid `"bad"` entry, that path can throw.

### Choose a failure policy
Compare two APIs: one returns a nullable result, the other throws `FormatException` using `int.parse`. Test `""`, `" 12 "` and `"12x"`; establish whether whitespace is trimmed at the application boundary. Record the actual result, not a guess. Separate malformed input from valid negative values when a domain forbids negatives: both must be handled, but for different reasons.

### Independent exercise
Write `sumValidScores(Iterable<String>)` that ignores invalid entries **only if that is your documented policy**, and a strict variant that rejects the first invalid token with its input index. Test empty input, zero, duplicates and a very large integer. Explain platform differences between native Dart integers and web compilation, especially values beyond JavaScript's exact integer range. References: https://api.dart.dev/dart-core/int/tryParse.html and https://dart.dev/null-safety

## Dart — Practical runnable code lab

### How to run the samples

These independent samples use the appropriate language toolchain. Representative command: `dart run {file}`. Replace placeholders with the actual filename, keep test data isolated, and do not interpret this as automatic installation.


## Dart — Focused mastery pathway

### Stage 1: understand the execution model
Write a pure function parsing a nonnegative integer with int.tryParse, returning null or a tagged result. Test null input, whitespace, very large numbers and strings with decimal separators.

### Stage 2: prove the rule with controlled cases
Use Future.delayed to simulate two search requests completing out of order. Add monotonically increasing request identifiers so only the newest response is displayed. Explain why a debounce alone cannot prevent stale results.

### Stage 3: build a small, reviewable project
Model Loading, Success and Failure as a sealed state hierarchy in supported Dart versions, then test every display branch. Compare a plain Dart CLI with Flutter UI: Flutter widgets cannot be tested merely by dart run.

## Dart — Technical notes and common pitfalls

### Core knowledge

1. Null safety represents optional values in the static type system.
2. Future and Stream model asynchronous results and sequences.
3. Flutter is an optional UI framework; basic Dart code is not synonymous with Flutter widgets.
