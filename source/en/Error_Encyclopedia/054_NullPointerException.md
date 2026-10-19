# NullPointerException — locate the boundary, not just the crash

## What the failure actually means
In Java, a NullPointerException is thrown when code uses a null reference in an operation requiring an object. A typical example is calling a string method on Map.get(key) when the key is absent: Map.get returns null in that case, and some maps may also store actual null values. A long stack trace identifies where the dereference happened but not necessarily where the missing value originated.

## Controlled solution
Build an API boundary that distinguishes a programming error (null map or key) from an expected but absent configuration entry. Objects.requireNonNull gives a clear diagnostic for forbidden null arguments. The helper checks that a key exists and holds nonblank text before calling strip. It intentionally reports a user-facing IllegalArgumentException for missing configuration rather than accidentally generating an NPE at the string method.

## Source example
Save this as NullSafetyLab.java.

~~~java
import java.util.Map;
import java.util.Objects;
public class NullSafetyLab {
    static String label(Map<String, String> config, String key) {
        Objects.requireNonNull(config, "config map is required");
        Objects.requireNonNull(key, "lookup key is required");
        String value = config.get(key);
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("missing or blank setting: " + key);
        }
        return value.strip();
    }
    public static void main(String[] args) {
        if (!"ready".equals(label(Map.of("mode", " ready "), "mode"))) throw new AssertionError();
        try {
            label(Map.of(), "mode");
            throw new AssertionError("missing key accepted");
        } catch (IllegalArgumentException expected) {
            if (!expected.getMessage().contains("mode")) throw new AssertionError();
        }
        try {
            label(null, "mode");
            throw new AssertionError("null map accepted");
        } catch (NullPointerException expected) {
            if (!"config map is required".equals(expected.getMessage())) throw new AssertionError();
        }
        System.out.println("PASS: explicit API contract and missing-key diagnosis");
    }
}
~~~

## Why this design works
The test intentionally exercises both branches using local immutable fixtures. It checks the normal value, a missing key and a null map. The caller catches the documented exceptions and confirms their messages instead of swallowing every RuntimeException. Do not replace all null checks with Optional indiscriminately; decide where null is allowed, where absence is a normal result, and where it is a contract violation.

## Reproduce the diagnosis safely
Compile and run on Java 11+ (the code uses isBlank and strip): javac NullSafetyLab.java && java NullSafetyLab. Expected output begins PASS. Run java -version and javac -version if compilation or execution fails, because SDK and runtime versions may differ.

## Practice and expected evidence
Remove the value check experimentally and predict the precise expression that triggers the NPE when Map.get returns null. Restore it, then test a blank string and a null key. Compare explicit checks with Objects.requireNonNull and record which exception class each is intended to represent. Never log secret configuration values while diagnosing a missing setting.

**Authoritative reference:** https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Objects.html
