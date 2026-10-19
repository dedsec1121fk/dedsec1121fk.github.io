# scala — consolidated language guide

## Scala

**Typical use:** Functional programming.

**Suggested file extension:** `.scala`.

**How to run / environment:** Run with an installed Scala 3 toolchain.

### Starter example

```
@main def hello(): Unit =
  def greet(name: String) = s"Hello, $name!"
  println(greet("Ada"))
```

### How to read it

Expression-oriented style works alongside JVM libraries.

### Common pitfall

Expression-oriented style works alongside JVM libraries.

## Scala — Expanded practice workbook

### Keep invalid text different from the number zero
Create a Scala 3 source file with a small total parser:

~~~scala
def parse(raw: String): Option[Int] =
  raw.toIntOption

@main def scoreDemo(): Unit =
  assert(parse("12") == Some(12))
  assert(parse("0") == Some(0))
  assert(parse("bad") == None)
  val values = List("3", "bad", "5")
  println(values.flatMap(parse).sum)
~~~

On a compatible Scala 3 launcher, the predicted printed sum is `8`. The `Option` result tells the caller whether parsing succeeded. `flatMap(parse)` removes `None` values, which is convenient for an exploratory sum but could incorrectly suppress invalid production data. Record Scala version and launcher arguments because Scala 2 and Scala 3 entry-point syntax differ.

### Preserve errors when dropping is unacceptable
Implement a stricter parser returning `Either[String,Int]`. Use `Right` for a valid integer and `Left` containing the rejected input for malformed text. Define what happens when a whole collection includes one error. Compare collecting every error with stopping at the first failure. Do not silently convert `"bad"` into zero.

### Look at immutable collections
Run `val original = List(1,2,3)` and `val updated = original.map(_ * 2)`. Verify `original` still contains the original values. In contrast to a mutable buffer, `List.map` creates a transformed collection without updating the existing list. Explain how this reduces accidental shared-state changes but does not prevent all concurrency bugs.

### Independent exercise
Support whitespace around numeric strings using an explicit `trim`, then test `" 12 "`, the empty string, a negative number and values exceeding `Int` range. Add deterministic assertions; distinguish parser validity from a domain rule banning negatives. Documentation: https://docs.scala-lang.org/scala3/

## Scala — Practical runnable code lab

### How to run the samples

These independent samples use the appropriate language toolchain. Representative command: `scala {file}`. Replace placeholders with the actual filename, keep test data isolated, and do not interpret this as automatic installation.


## Scala — Technical notes and common pitfalls

### Core knowledge

1. The language supports object-oriented and functional abstractions.
2. Immutable collections can simplify concurrency and reasoning.
3. An effectful Future must be awaited or composed; launching it does not imply successful completion.
