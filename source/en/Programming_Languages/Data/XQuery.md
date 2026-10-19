# xquery — consolidated language guide

## XQuery

### Working model
XQuery queries XML nodes using path expressions and sequence semantics, with namespace rules that differ from ordinary JSON traversal.

### Focused source example
```text
for $n in (2, 3, 5) return $n * $n
```

Compare sequence order and result count, then query a local XML document with and without a namespace prefix.

### Evidence to collect
Record the exact XQuery compiler or runtime version, required dependencies, and output from harmless test data. Predict an observation before checking it, and keep both the initial and revised source to show which change caused the result. Do not claim that a displayed fragment was executed if the platform is unavailable.

### Failure mode worth investigating
An XML element in a default namespace will not necessarily match an unqualified name; declare namespaces explicitly.

## XQuery: applied exercises

### Establish a baseline
The nearby `00_starter.xq` contains `for $n in (1, 2, 3) return $n * $n`. Use an XQuery 3.1 processor such as BaseX or a compatible Saxon edition and examine the output **as a sequence**: the numeric values should be 1, 4 and 9. Serialization may separate items by whitespace or line breaks. Do not treat a different serializer layout as an incorrect calculation; first compare the items.

### Filter before you transform
Create a separate `odd-squares.xq` file:

~~~xquery
for $n in 1 to 7
where $n mod 2 = 1
return $n * $n
~~~

Predict `(1, 9, 25, 49)` before running it. Explain the order: the range binds individual integers to `$n`; the `where` removes the even bindings; `return` constructs one value per surviving binding. A `let` clause instead binds an expression result and has different cardinality implications. Check the installed processor's command line rather than assuming every implementation uses identical flags.

### Failure at a conversion boundary
Test `xs:integer("12")` and `xs:integer("twelve")` separately. The first conversion should succeed; the second must be handled as a cast/dynamic error, not silently turned into zero. Preserve the actual error QName and processor version. When querying XML documents, missing elements may produce the **empty sequence** rather than an exception; distinguish that from malformed input and a failed cast.

### An XML-backed extension
Use a local XML fixture with two `<item price="..."/>` elements and bind nodes with `doc("fixture.xml")/items/item`. Convert the `@price` attribute explicitly before numerical comparisons. Add an item without the attribute and specify whether to skip it or report validation failure. Do not rely on implicit casting across processor editions.

### Completion evidence
Submit the original output, odd-only result, one deliberate cast failure, and an XML missing-attribute case. Describe sequence order and cardinality: `()` is not the same thing as the number zero or an empty string. Reference: https://www.w3.org/TR/xquery-31/
