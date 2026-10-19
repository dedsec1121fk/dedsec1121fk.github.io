# java — consolidated language guide

## Java

**Typical use:** General-purpose programming.

**Suggested file extension:** `.java`.

**How to run / environment:** javac Main.java && java Main.

### Starter example

```
public class Main {
  static String greet(String name) { return "Hello, " + name + "!"; }
  public static void main(String[] args) { System.out.println(greet("Ada")); }
}
```

### How to read it

The class filename should match the public class.

### Common pitfall

The class filename should match the public class.

## Java — Expanded practice workbook

### Problem
A CLI reads text, but a port number must be an integer in 1..65535. Parsing and validating are two different actions. Keep the original NumberFormatException as the cause instead of silently returning a default that could hide bad input.

### Execute
Save the public class as Main.java and run javac Main.java && java Main using a JDK. Expected output: validated. The filename must match the public class exactly, including case.

~~~java
public class Main {
  static int port(String raw) {
    if (raw == null) throw new IllegalArgumentException("missing port");
    final int number;
    try {
      number = Integer.parseInt(raw.trim());
    } catch (NumberFormatException ex) {
      throw new IllegalArgumentException("not a number", ex);
    }
    if (number < 1 || number > 65535) throw new IllegalArgumentException("bad range");
    return number;
  }
  static void rejects(String value) {
    try {
      port(value);
    } catch (IllegalArgumentException expected) {
      return;
    }
    throw new AssertionError("accepted invalid port");
  }
  public static void main(String[] args) {
    if (port(" 8080 ") != 8080) throw new AssertionError();
    rejects("0"); rejects("65536"); rejects("abc");
    System.out.println("validated");
  }
}
~~~

### Reason about the exception boundary
Integer.parseInt can throw NumberFormatException, a subtype of IllegalArgumentException. The try block is deliberately limited to parsing so it does not catch our own range checks. Examine the cause chain for "abc" and compare with failure for "65536". A Java assert statement is normally disabled unless -ea is supplied; AssertionError in this demonstration cannot silently turn off.

### Extend and test
Add cases for null, whitespace-only, "-1", "65535", extremely large integers and leading +. Decide whether leading + is valid for your CLI: Java's parser accepts it. Move tests to JUnit only after the no-dependency tests are understood.

### Troubleshooting
Run java -version and javac -version to compare toolchain versions. UnsupportedClassVersionError indicates the runtime is older than the compiled bytecode. Cannot find symbol may point to an unavailable name or import. Inspect the first useful frame in your own source.
Success: one accepted port and three rejected inputs. https://docs.oracle.com/en/java/javase/

## Java — Practical runnable code lab

### How to run the samples

These independent samples use the appropriate language toolchain. Representative command: `javac Main.java && java Main`. Replace placeholders with the actual filename, keep test data isolated, and do not interpret this as automatic installation.


## Java — Focused mastery pathway

### Goal and design choices
Build an inventory core where each SKU exists once, quantities never become negative and rejected operations leave state unchanged. A `Map<String,Integer>` gives average constant-time lookup, but duplicate keys overwrite entries unless explicitly checked. The exercise deliberately separates domain logic from storage and console input.

### Runnable core (Java 17+)
Save as `InventoryLab.java`. Compile with `javac --release 17 InventoryLab.java` and run `java InventoryLab`.

~~~java
import java.util.HashMap;
import java.util.Map;

public class InventoryLab {
    private final Map<String, Integer> stock = new HashMap<>();

    void add(String sku, int quantity) {
        if (sku == null || !sku.matches("[A-Z0-9-]{2,20}"))
            throw new IllegalArgumentException("invalid SKU");
        if (quantity < 0) throw new IllegalArgumentException("negative quantity");
        if (stock.containsKey(sku)) throw new IllegalStateException("duplicate SKU");
        stock.put(sku, quantity);
    }

    void sell(String sku, int amount) {
        if (amount <= 0) throw new IllegalArgumentException("invalid sale");
        Integer available = stock.get(sku);
        if (available == null) throw new IllegalArgumentException("unknown SKU");
        if (amount > available) throw new IllegalStateException("insufficient stock");
        stock.put(sku, available - amount);
    }

    public static void main(String[] args) {
        InventoryLab lab = new InventoryLab();
        lab.add("SKU-01", 5);
        lab.sell("SKU-01", 2);
        if (lab.stock.get("SKU-01") != 3) throw new AssertionError();
        try {
            lab.sell("SKU-01", 99);
            throw new AssertionError("should reject sale");
        } catch (IllegalStateException expected) {
            if (lab.stock.get("SKU-01") != 3) throw new AssertionError("mutation");
        }
        System.out.println("PASS");
    }
}
~~~

### Fault investigation
Attempt duplicate add, empty SKU, negative quantity, unknown SKU and sale of zero. For each, assert the precise exception type and unchanged map contents. Then evaluate `Integer.MAX_VALUE` addition: blindly summing quantities can overflow. Design `restock` with `Math.addExact` and transactional ordering so an arithmetic failure cannot partially update stock.

### Persistence stage
Implement a `Store` interface with `load` and `save`, plus a UTF-8 CSV implementation using `Files.newBufferedReader`. Do not parse quoted CSV by `split(",")`; either use a documented library or define and enforce a deliberately restricted CSV subset. Save to a temporary file and move it after validation. Define how to recover from interrupted writes.

### Mastery evidence
Write tests for fresh startup, duplicate keys, invalid input, reopen/reload, a truncated file and zero stock. Capture Java version, compilation output, test transcript and one intentional failure. Repeat from a clean directory. Explain why single-threaded map correctness does not imply safe concurrent updates.

## Java — Technical notes and common pitfalls

### Core knowledge

1. Checked exceptions must be declared or handled according to language rules.
2. try-with-resources closes resources implementing AutoCloseable.
3. Generics use type erasure for most parameterized runtime types; do not assume Python-style dynamic typing.
