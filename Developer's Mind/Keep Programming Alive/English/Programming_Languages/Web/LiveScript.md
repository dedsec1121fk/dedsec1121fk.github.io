# livescript — consolidated language guide

## LiveScript

### Working model
LiveScript is a language that compiles to JavaScript and provides concise functional expressions. Browser and Node behavior depends on the emitted JavaScript.

### Focused source example
```text
square = (x) -> x * x
console.log square 5
```

Compile the snippet, read the generated JavaScript and test another input. Record whether the compiler preserves or transforms function declarations.

### Evidence to collect
Record the exact LiveScript compiler or runtime version, required dependencies, and output from harmless test data. Predict an observation before checking it, and keep both the initial and revised source to show which change caused the result. Do not claim that a displayed fragment was executed if the platform is unavailable.

### Failure mode worth investigating
LiveScript syntax is not executable JavaScript: run it through its compiler before pasting into the browser console.

## LiveScript: applied exercises

LiveScript is a language that compiles into JavaScript. Its function arrows, indentation and call syntax belong to LiveScript source, not to raw JavaScript. The produced JS executes under a separate host such as Node.js or a browser; keep compilation and execution errors distinct.

### Exercise 1: predict a pure function

~~~livescript
square = (n) -> n * n
console.log square 4
~~~

For a numeric 4, the expected output is 16 after compilation and execution. Change the argument to -4 and predict 16 again. Change the function to cube = (n) -> n * n * n and predict -64 for -4. Explain why the original square is a pure numeric calculation, while console.log is the side effect that makes its result visible.

### Exercise 2: test the JavaScript boundary

Ask what happens if the caller passes the string "4" instead of numeric 4. Because emitted JavaScript uses multiplication, numeric coercion may produce 16, but relying on that is dangerous for input validation. Now consider an unconvertible string such as "apple": the JavaScript multiplication result is NaN. Use an explicit type check before accepting a user-supplied quantity and document whether you want coercion at all.

### Exercise 3: separate syntax from runtime faults

An unbalanced indentation or malformed arrow is a LiveScript compilation problem. A runtime TypeError in generated JavaScript is a different stage. Design one fixture for each and note the filename/line mapping to emitted JS. A script that compiles does not prove its assumptions about actual user input. Do not claim a compiler diagnostic or source-map mapping unless you observed the installed toolchain.

### Completion proof

Record LiveScript compiler version, the generated JavaScript fragment, JS runtime version, numerical test results, and a rejected invalid input. When testing in the browser, make sure a console log is not confused with a visible DOM update. These examples are provided as source-reading exercises; execution has not been claimed.
