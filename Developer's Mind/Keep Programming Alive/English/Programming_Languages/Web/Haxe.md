# haxe — consolidated language guide

## Haxe

### What Haxe actually promises

Haxe is a statically typed language with type inference and multiple compilation targets, including JavaScript. It can reuse source-level logic across targets, but target-specific APIs, integer representation and available libraries still matter. Compile once per target; do not assume a binary from one target runs on another.

This example introduces an algebraic data type rather than treating every failure as an empty string. Save as Main.hx:

~~~haxe
enum Status {
  Ready;
  Failed(reason:String);
}

class Main {
  static function label(status:Status):String {
    return switch (status) {
      case Ready: "ready";
      case Failed(reason): "failed: " + reason;
    };
  }

  static function main() {
    trace(label(Ready));
    trace(label(Failed("offline")));
  }
}
~~~

Run haxe --main Main --interp, or haxe --main Main --js main.js then node main.js. Record haxe --version and, for JavaScript, node --version. The two trace values should be ready and failed: offline, usually with file/line prefixes.

### Why the enum matters

Status is either Ready or Failed carrying a reason. The switch returns a String in both branches; the compiler checks the constructor names and branch types. Add a third constructor Pending; now revisit every switch expression to handle it. A missing case is a compile-time exhaustiveness problem, not a reason to invent a default that hides new states. A typo such as Fialed is likewise a compiler error, not a runtime status.

The sample uses only cross-target core features. A filesystem call, browser DOM operation or thread API may require a different target and different dependencies. Keep platform boundaries explicit and verify the same behavior on each chosen runtime.

### Failure investigation and progression

If Haxe cannot find Main, check that the file is Main.hx in the working directory and that class Main exists. If JavaScript is generated but node is unavailable, only compilation was tested. If the enum cannot be resolved after moving it into another file, inspect Haxe module/type names and imports rather than copying JavaScript import syntax.

Exercise 1: add Pending and make label exhaustive. Exercise 2: write isFailure : Status -> Bool and check Ready, Pending and Failed. Exercise 3: compile to two installed targets and compare the values, generated artifacts and diagnostics. Supply the exact source, compiler version, commands, expected values and observed results. The outcomes above are static predictions; this text does not claim a local Haxe execution.

## Haxe: applied exercises

### The problem

A network configuration field must accept only ASCII decimal digits representing ports 1 through 65535. Std.parseInt alone is not a strict validator: permissive numeric-prefix parsing can turn malformed text into a plausible integer. Check the complete input before conversion. Work only with synthetic strings; no sockets are opened.

Save Main.hx in a disposable directory:

~~~haxe
class Main {
  static function parsePort(raw:String):Null<Int> {
    if (raw.length == 0 || raw.length > 5) return null;
    var digits = ~/^[0-9]+$/;
    if (!digits.match(raw) || digits.matched(0).length != raw.length) return null;
    var port = Std.parseInt(raw);
    if (port == null || port < 1 || port > 65535) return null;
    return port;
  }

  static function main() {
    trace(parsePort("8080"));
    trace(parsePort("0"));
    trace(parsePort("12abc"));
    trace(parsePort("00080"));
    trace(parsePort("65536"));
  }
}
~~~

Run haxe --main Main --interp; optionally compile with haxe --main Main --js main.js and run node main.js. Expected values: 8080, null, null, 80, null. Trace may add filename/line prefixes.

### Why both checks are necessary

The regex accepts ASCII digits, and matched(0).length checks that the match consumes the entire input: some regex engines let $ match just before a final newline. The five-character limit also bounds conversion work; leading zeros are accepted only while the input remains at most five characters. It rejects whitespace, signs and mixed alphanumeric input. The range check rejects zero and values above 65535. Empty input also fails the expression. The return type Null<Int> requires callers to handle rejection instead of confusing it with a valid port.

The check is bounded to ordinary inputs. Inputs longer than five characters are rejected before conversion, avoiding oversized numeric parsing. This deliberately rejects six-character leading-zero strings even if their numeric value would be in range; document that policy for callers.

### Negative tests, diagnosis and mastery

- Test "", " 80 ", "-1", "12abc", "65536", "00080", "000080" and "80\\n" independently; explain each result.
- Remove the matched-length check deliberately and probe a final newline; show why a $ anchor alone may not mean full-string validation on every regex engine. Restore the check.
- If a Haxe compiler error points to the regex literal, verify ~/.../ syntax and that the file is Main.hx.
- If JavaScript compilation succeeds but node fails to launch, distinguish a missing runtime from an invalid program.
- Improve the function to return an enum distinguishing BadFormat and OutOfRange. Explain the existing five-character length policy and test a long numeric string.

Complete the exercise with compiler version, exact commands, before/after inputs, expected and observed results, one deliberate failure and a portability note. The expected values are reasoned, not locally executed Haxe results.

## Haxe — Focused mastery pathway

### Goal and prerequisites

Haxe type-checks source and can generate code for several targets; it does not make every target's standard libraries or numeric behavior identical. Use a disposable directory with a Haxe compiler. The first run needs no third-party library. A JavaScript comparison additionally needs Node.js. Record the actual versions from haxe --version and node --version.

Save this as Main.hx (capital M matters on case-sensitive filesystems):

~~~haxe
class Main {
  static function average(values:Array<Int>):Null<Float> {
    if (values.length == 0) return null;
    var total = 0;
    for (value in values) total += value;
    return total / values.length;
  }

  static function main() {
    trace(average([2, 4, 6]));
    trace(average([]));
    trace(average([-2, 2]));
    trace(average([1, 2]));
  }
}
~~~

Run haxe --main Main --interp. For a second target, run haxe --main Main --js main.js followed by node main.js. Haxe trace normally prefixes the value with a source filename and line number; compare the values rather than assuming identical console formatting.

### Reason through the result

The four values, in order, should be 4, null, 0 and 1.5. An empty array has no arithmetic mean, so Null<Float> represents absence rather than pretending its average is zero. The for loop visits every element; for n values time is O(n), with O(1) extra storage. On a very large array the Int accumulator can overflow before division; this small exercise is not a general-purpose numerically stable statistics library.

Haxe infers the loop variable as Int because values has type Array<Int>. Replacing [1, 2] with ["1", "2"] should fail type checking: strings are not integers. That failure is deliberately different from the valid empty input, which returns null.

### Diagnostics and boundaries

- If Type not found : Main appears, verify that Main.hx is in the current working directory and that the class and filename match.
- If the JS build succeeds but node is missing, the compiler succeeded and the host runtime is unavailable; do not report an execution result.
- If outputs differ between targets, record compiler version, target, input, generated artifact and actual values. Investigate numeric representation before blaming syntax.
- Test [7] (7), [] (null), [-2, 2] (0) and [1, 2] (1.5). Also test large integers and explain why a fixed-width Int sum is a risk.

### Progression and evidence

First predict each trace and explain the empty-array contract. Next replace the nullable result with an explicit enum such as NoData | Mean(value:Float), then handle both cases without unchecked casts. Finally compare the interpreter and JavaScript output, documenting any genuine difference and the target-specific reason. Submit source, commands, versions, expected values, observed values and one compiler diagnostic. These are reasoned expected outcomes, not a claim that Haxe was executed in this archive's authoring environment.
