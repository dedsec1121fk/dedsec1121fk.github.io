# Borrowing prevents some lifetime errors, not invalid business data

## Parse without panicking on user input
Use a function returning `Result` rather than calling `unwrap()` on an unknown string. The caller must decide whether a parse failure is recoverable. Accepting `i32` or `u32` changes the admissible set of numbers; choose the type according to the domain, not just to silence compiler diagnostics.

~~~rust
fn parse_port(input: &str) -> Result<u16, String> {
    let value: u16 = input.parse().map_err(|_| "not a valid port".to_owned())?;
    if value == 0 { return Err("port zero not allowed here".to_owned()); }
    Ok(value)
}
fn main() {
    assert_eq!(parse_port("8080"), Ok(8080));
    assert!(parse_port("70000").is_err());
    assert!(parse_port("0").is_err());
}
~~~

## Trace the ownership model
The function borrows `&str` and returns a new owned String only on error. It does not need to clone the input to parse its digits. The returned `u16` is a small copyable value; there is no dangling reference to the original string. If this API returned `&str` referencing a temporary local String, the borrow checker would reject the lifetime mismatch.

## Separate compiler rules from runtime behavior
Rust prevents classes of memory misuse with types and lifetimes, but does not make every parser semantically correct. A high-value test checks valid boundaries, overflow, leading/trailing whitespace policies and application-specific constraints. Record whether `cargo test` actually ran on the selected toolchain.

## Exercise
Change the domain to include port zero and update the tests before code. Explain why the compiler accepts the original function yet the business requirement changes. Investigate what happens for `" 8080 "` and document whether trimming is a desired feature or an unexpected input acceptance.
## Byte offsets versus UTF-8 character boundaries

A Rust string is valid UTF-8, but indexing its bytes is not the same as selecting a character. A range may be numerically inside the byte length while ending in the middle of a multibyte character. Use get for a fallible string slice, or iterate chars when the contract is Unicode scalar values. A displayed grapheme can still contain several scalar values.

When a binary format specifies byte offsets, retain bytes until the relevant region has been validated and decoded. Do not reinterpret a character count as a byte count. The example separates valid UTF-8 decoding from valid string slicing; these are two different checks.

```rust
fn main() {
    let text = "γa";
    assert_eq!(text.len(), 3);
    assert!(text.get(0..1).is_none());
    assert_eq!(text.get(0..2), Some("γ"));
    assert!(std::str::from_utf8(&[0xce]).is_err());
    assert_eq!(text.chars().count(), 2);
}
```

Compile and run with the installed Rust toolchain before using the fixture as runtime evidence. Add combining marks and an empty range. Replacing invalid input lossily can be suitable for a viewer, but should not silently change an identifier that is later used for authorization or equality.

[Technical reference](https://doc.rust-lang.org/std/primitive.str.html#method.get)
