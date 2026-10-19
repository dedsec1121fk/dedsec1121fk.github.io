# coffeescript — consolidated language guide

## CoffeeScript

### Working model
CoffeeScript uses indentation and shorter function syntax but compiles into JavaScript, so debugging requires attention to both source and output.

### Focused source example
```text
double = (n) -> n * 2
console.log double 7
```

Compile a function and inspect its JavaScript output. Test whether losing indentation changes the intended function body.

### Evidence to collect
Record the exact CoffeeScript compiler or runtime version, required dependencies, and output from harmless test data. Predict an observation before checking it, and keep both the initial and revised source to show which change caused the result. Do not claim that a displayed fragment was executed if the platform is unavailable.

### Failure mode worth investigating
Do not confuse CoffeeScript source maps with application correctness; trace failing values after compilation.

## CoffeeScript: applied exercises

### Predict values before compilation
CoffeeScript compiles to JavaScript; the generated JavaScript is part of what you should inspect. Create a disposable `squares.coffee`:

~~~coffeescript
values = [1, 2, 3]
squares = (n * n for n in values)
console.log squares.join ","
~~~

The expected output is `1,4,9`. Run with a compatible CoffeeScript compiler or compile to a JavaScript file and run using the installed Node.js version. Inspect the generated loop and confirm that compilation succeeded *before* you compare runtime output. The comprehension is a transformation over input values, not a command that executes another shell process.

### Understand the JavaScript boundary
Change the collection to `[]` and predict an empty joined string. Add `null` and record what the generated JavaScript actually does for the multiplication, rather than assuming that CoffeeScript enforces a strict numeric type at runtime. Choose an explicit validation policy if untrusted external data is involved; silent JavaScript coercion is rarely a safe substitute.

### Read the compiler output
Compile once with the tool's ordinary output mode and once with its bare-output option if supported, noting changes in module wrapping. Trace which generated variables correspond to `values`, `squares` and the loop temporary. The exact formatting differs by compiler version and must not be treated as stable source code for hand editing.

### Independent task
Write a second program counting normalized nonblank strings, using comprehensions only when they improve clarity. Test `["Ada", " ada ", "", "Lin"]` and explicitly decide whether case folding and whitespace removal are in scope. Compare the output to hand-written JavaScript tests and include a deliberately malformed input fixture. Reference: https://coffeescript.org/
