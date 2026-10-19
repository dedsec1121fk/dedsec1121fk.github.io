# hack — consolidated language guide

## Hack

### What is different from PHP
Hack is a typed language in the HHVM ecosystem. A file starting with `<?hh` is not a PHP CLI program; executing it with `php` does not validate Hack semantics. The type checker can reject incompatible parameter types, while business constraints such as positivity still require explicit validation.

### Small executable lab for a configured HHVM project
Save as `lesson.hack`. The `<<__EntryPoint>>` attribute marks the entry function. Check your installed HHVM release and project configuration before choosing a launch command.

~~~hack
<?hh
function double_positive(int $n): int {
  if ($n < 0) {
    throw new \InvalidArgumentException('negative');
  }
  return $n * 2;
}
<<__EntryPoint>>
function main(): void {
  echo double_positive(4), "\n";
  try {
    double_positive(-1);
  } catch (\InvalidArgumentException $_) {
    echo "rejected\n";
  }
}
~~~

**Expected output, not executed here:** `8` followed by `rejected`. The `int` type alone does not guarantee non-negative values; the explicit check establishes that contract.

### Diagnosis
- **PHP parse error:** the wrong runtime is being used. Confirm that HHVM executes the Hack file.
- **Type error for a string:** an arbitrary string cannot satisfy an `int` argument. Parse and validate at the input boundary instead of hiding the mismatch with a cast.
- **Unhandled InvalidArgumentException:** decide whether callers should catch, translate or propagate the error. Avoid broad catches that conceal unrelated failures.
- **Entry point or project failure:** check `.hhconfig`, installed HHVM version and launch command. Available tooling varies by release.
- **Dependency failure:** Hack/HHVM is not automatically compatible with every current PHP package.

### Mastery pathway
1. With actual Hack tooling, record HHVM and type-checker versions, run the example and save both output lines.
2. Change the first call to `double_positive("4")`, predict the type error, then restore the integer.
3. Add tests for zero, one and a negative number. Explain why positivity is a runtime contract rather than a property of `int`.
4. Compare exceptions with an explicit result representation for a caller-facing API, and justify how the caller recovers.

**Verification:** static review only in this environment; HHVM is not installed. Do not report runtime success without executing the code. **Reference:** https://docs.hhvm.com/hack/

## Hack — Expanded practice workbook

### Read the baseline source
~~~text
<?hh
<<__EntryPoint>>
function main(): void {
  echo "Hello, Ada!\n";
}
~~~

**Relevant environment:** Run with HHVM in a configured Hack project.. Verify that the matching compiler, host or simulator is available before treating output as authoritative. For scripts that can interact with personal files or systems, use a scratch workspace and read-only fixtures by default.

### Detailed working objective
Use Hack's typed collections and a shape for validated JSON-like input, then compare nullable types and runtime enforcement in HHVM.

### The failure that must be understood
Hack syntax and HHVM runtime are not interchangeable with PHP 8; check typed mode and installed HHVM support.
