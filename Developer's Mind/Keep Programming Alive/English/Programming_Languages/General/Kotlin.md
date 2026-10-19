# kotlin — consolidated language guide

## Kotlin

**Typical use:** General-purpose programming.

**Suggested file extension:** `.kt`.

**How to run / environment:** kotlinc Main.kt -include-runtime -d app.jar && java -jar app.jar.

### Starter example

```
fun greet(name: String) = "Hello, $name!"
fun main() { println(greet("Ada")) }
```

### How to read it

Functions can have expression bodies; nullable types are explicit.

### Common pitfall

Functions can have expression bodies; nullable types are explicit. 

### Model Android states explicitly
Kotlin's null-safety helps express absence, but calls into Java or Android framework may expose platform types requiring checks. Prefer immutable `val` for stable state, data classes for records, sealed types for UI loading/success/error.
```kotlin
sealed interface ResultState {
  data object Loading : ResultState
  data class Ready(val count: Int) : ResultState
  data class Failed(val message: String) : ResultState
}
fun label(state: ResultState): String = when (state) {
  ResultState.Loading -> "Loading"
  is ResultState.Ready -> "${state.count} results"
  is ResultState.Failed -> state.message
}
```
An Android Activity may be recreated; do not rely on fields alone for durable data. Separate UI state, repository storage and network data. Avoid blocking the main thread: use coroutines with a lifecycle-aware scope, cancel work appropriately, and handle errors.

**Exercise:** implement a search screen with three states, preserve query across rotation, and test a simulated network failure. Reference: https://kotlinlang.org/docs/home.html.

## Kotlin — Expanded practice workbook

### Do not confuse nullable with validated
Kotlin can express that a value might be missing, but a non-null String can still contain invalid text. Use toIntOrNull and a domain-specific range check; do not use !! to force a non-null value from untrusted input.

### Run on the JVM
Save as Main.kt. With the Kotlin CLI and compatible Java installed, run kotlinc Main.kt -include-runtime -d demo.jar && java -jar demo.jar. Expected Kotlin parser OK. This is JVM Kotlin, not an Android app build.

~~~kotlin
fun parsePort(raw: String?): Int? {
    val number = raw?.trim()?.toIntOrNull() ?: return null
    return if (number in 1..65535) number else null
}
fun main() {
    check(parsePort(" 443 ") == 443)
    check(parsePort(null) == null)
    check(parsePort("abc") == null)
    check(parsePort("70000") == null)
    println("Kotlin parser OK")
}
~~~

### Trace the types
The safe-call chain returns null when raw is null or text conversion fails. The Elvis operator returns null from parsePort rather than throwing. The final if expression applies 1..65535. The inferred local number is Int, because the nullable path has already returned.

### Practice
Test "+3", "-1", "", Unicode digits, trailing whitespace and an integer too large for Int. Decide whether null should mean missing input and failed conversion alike; if callers need precise diagnostics, replace Int? with a sealed result hierarchy that distinguishes Missing, InvalidText, OutOfRange and Valid.

### Platform debugging
kotlinc requires a compatible JDK on the build machine. On Android, Gradle/Android toolchains differ from this CLI exercise. Compare Kotlin/JDK versions before attributing a build issue to null safety. Do not suppress compiler warnings just to silence unsafe casts.
Success: no NumberFormatException, four assertions pass. https://kotlinlang.org/docs/null-safety.html

## Kotlin — Practical runnable code lab

### How to run the samples

These independent samples use the appropriate language toolchain. Representative command: `kotlinc {file} -include-runtime -d demo.jar && java -jar demo.jar`. Replace placeholders with the actual filename, keep test data isolated, and do not interpret this as automatic installation.


## Kotlin — Focused mastery pathway

### Contract
Model ledger entries as immutable data classes and parsing as a sealed result. Accept identifiers A01 through Z99, a nonblank category and a nonnegative monetary string with exactly two fractional digits. Convert decimal amounts to integer cents without floating-point rounding. Duplicate transaction IDs must stop aggregation; overflow must be rejected, never wrapped or silently truncated.

### Executable JVM lab
Save as LedgerLab.kt. Run kotlinc LedgerLab.kt -include-runtime -d ledger.jar followed by java -jar ledger.jar (JDK and Kotlin compiler required). The file has no network or filesystem writes.

~~~kotlin
import java.math.BigDecimal

data class Entry(val id: String, val category: String, val cents: Long)
sealed interface Result {
    data class Accepted(val entry: Entry) : Result
    data class Rejected(val reason: String) : Result
}

fun parse(id: String, category: String, amount: String): Result {
    if (!id.matches(Regex("[A-Z][0-9]{2}"))) return Result.Rejected("id")
    if (category.isBlank()) return Result.Rejected("category")
    if (!amount.matches(Regex("[0-9]+\\.[0-9]{2}"))) return Result.Rejected("format")
    val cents = try {
        BigDecimal(amount).movePointRight(2).longValueExact()
    } catch (_: ArithmeticException) { return Result.Rejected("overflow") }
    return Result.Accepted(Entry(id, category, cents))
}

fun totals(input: List<Entry>): Map<String, Long> {
    require(input.map { it.id }.distinct().size == input.size) { "duplicate transaction" }
    return input.groupBy { it.category }
        .mapValues { (_, entries) -> entries.fold(0L) { sum, entry -> Math.addExact(sum, entry.cents) } }
}

fun main() {
    check(parse("A01", "food", "12.50") == Result.Accepted(Entry("A01", "food", 1250)))
    check(parse("A02", "food", "12.5") is Result.Rejected)
    check(parse("A03", "food", "99999999999999999999.00") is Result.Rejected)
    val a = (parse("A01", "food", "12.50") as Result.Accepted).entry
    val b = (parse("A04", "food", "0.10") as Result.Accepted).entry
    check(totals(listOf(a, b))["food"] == 1260L)
    check(totals(emptyList()).isEmpty())
    check(runCatching { totals(listOf(a, a)) }.isFailure)
    println("PASS: currency parsing, overflow and unique transaction IDs")
}
~~~

### Why this design works
A data class supplies value equality that the assertions use. Sealed Accepted and Rejected cases let callers handle parse failure without null assertions. BigDecimal preserves base-ten input exactly; longValueExact rejects results that cannot fit Long. Math.addExact similarly guards the sum. These are separate failure boundaries: a valid individual amount can still overflow when added to a huge running total.

### Bounded practice and failure diagnosis
1. Try 0.00, 00.01, -1.00, 1e3, NaN, 1.005 and an empty category. Write down whether format checks or arithmetic checks reject each case.
2. Create two categories and verify separate totals. Then add two entries with the same ID in *different* categories: the uniqueness rule applies to the entire ledger, not per category.
3. Exercise Math.addExact using synthetic large Entry values to demonstrate sum overflow. Do not substitute Double; discuss the different rounding contract.
4. Replace the sealed result with nullable output only as an experiment: list information lost at the rejection boundary, then revert.

**Completion evidence:** console PASS, outputs of at least five rejected inputs, a duplicate-ID test, and a written distinction between input validation, exact conversion and aggregation. For file storage later, write to a temporary file and rename atomically where supported; do not claim coroutine cancellation provides transactional durability.

## Kotlin — Technical notes and common pitfalls

### Core knowledge

1. Nullability is tracked by the type system, but platform types from Java need care.
2. Data classes provide value-oriented generated members for properties in the primary constructor.
3. Coroutines suspend cooperatively; choose the correct dispatcher for blocking work.
