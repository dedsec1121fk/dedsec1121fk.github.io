# Gleam — a typed result for TCP port validation

## Return Ok or Error explicitly

~~~gleam
import gleam/int

pub fn port(text: String) -> Result(Int, String) {
  case int.parse(text) {
    Ok(number) if number >= 1 && number <= 65535 -> Ok(number)
    Ok(_) -> Error("port out of range")
    Error(_) -> Error("not an integer")
  }
}
~~~

For "8080" predict Ok(8080), for "abc" an invalid-integer result and for "70000" a range rejection. The Result type makes success and failure visible to a caller. Verify that the guard syntax compiles with the version of Gleam you are using; preserve errors without stringifying arbitrary values.

## Test the difference between parser and policy

Try "0", "-1", an empty string and the upper bound 65535. Parsing a negative number may succeed while domain validation must reject it. Write a caller that pattern-matches both Ok(value) and Error(reason).

## Cross-target check

Run the project via its actual Gleam toolchain and record gleam --version and the Erlang or JavaScript target. Compare expected and observed results without assuming both targets behave identically. This example has not been compiled in this audit.

## Refuse to collapse error variants
A caller that converts every Error(_) into Ok(0) destroys the distinction between invalid text and the valid lower endpoint. Instead format separate user-facing messages while preserving the original Result for programmatic use. Compile a set of table-driven assertions when you have Gleam tooling: text "1" maps to Ok(1), "65535" to Ok(65535), "65536" to an out-of-range Error, and "12x" to a parse Error. If integration reads JSON, verify that the incoming field is a String before passing it to port; static type annotations cannot validate raw untrusted JSON without runtime decoding.

## Gleam

### Operational idea
Gleam is a statically typed functional language targeting Erlang and JavaScript, with pattern matching and explicit results.

### Source or deliberately marked concept
```text
pub fn double(n: Int) -> Int {
  n * 2
}
```

### Apply it to one controlled task
Define a function that returns a Result for invalid inputs and make the caller handle both Ok and Error.

### Check the important boundary
A target's foreign-function interface is not automatically portable across Erlang and JavaScript builds.

Work with disposable data in a genuine implementation of Gleam where available. Record the actual tool version and compare your prediction with observed output. If a compatible runtime is missing, clearly mark this as static analysis instead of claiming it passed execution. Split the normal case from at least one boundary value, and avoid using sensitive or production datasets merely to follow a tutorial.
