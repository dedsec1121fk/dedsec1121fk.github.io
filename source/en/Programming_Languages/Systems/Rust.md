# rust — consolidated language guide

## Rust

**Typical use:** Systems and low-level programming.

**Suggested file extension:** `.rs`.

**How to run / environment:** rustc main.rs && ./main.

### Starter example

```
fn greet(name: &str) -> String { format!("Hello, {}!", name) }
fn main() { println!("{}", greet("Ada")); }
```

### How to read it

Ownership and borrowing prevent many lifetime errors.

### Common pitfall

Ownership and borrowing prevent many lifetime errors. 

### Borrowing makes lifetimes visible
Rust ownership prevents many use-after-free errors at compile time: a value has one owner, `&T` allows shared immutable borrowing, while `&mut T` permits exclusive mutation for a compatible lifetime.
```rust
fn total(values: &[i32]) -> i32 {
    values.iter().sum()
}
fn main() {
    let values = vec![10, 20, 30];
    assert_eq!(total(&values), 60);
    println!("{}", values.len()); // borrow did not consume ownership
}
```
Error recovery commonly uses `Result<T,E>` and the `?` operator; `Option<T>` models absence without null references. `unwrap()` is appropriate in small tests after proven assumptions, but often not at untrusted input boundaries. Cargo manages builds/tests with `cargo check`, `cargo test`, and `cargo clippy` when installed.

**Exercise:** implement a `parse_positive(&str)->Result<u32,String>`, verify 0, negatives, junk and valid values. Explain the difference between moving `String` and borrowing `&str`. Reference: https://doc.rust-lang.org/book/.

### Borrowing, Results and boundary tests

Rust's ownership rules are not just syntax: they decide which code may mutate data and when references remain valid. Work with this parser:

~~~rust
fn nonempty_name(input: &str) -> Result<&str, &'static str> {
    let name = input.trim();
    if name.is_empty() { return Err("empty name"); }
    Ok(name)
}
fn main() {
    assert_eq!(nonempty_name(" Ada ").unwrap(), "Ada");
    assert!(nonempty_name("   ").is_err());
}
~~~

The result borrows a slice from the input rather than allocating a new String. Why cannot a function safely return &str that points into a locally created temporary String? The temporary is destroyed when the function returns. Ask the compiler to reject such a function and explain the lifetime error instead of trying to suppress it.

Extend the code with an owned String result for callers that need data after discarding the original input. Compare allocation and API contract. Use match to handle Ok and Err without a panic. Test empty, whitespace-only, Unicode name and ordinary name.

When facing a compile error, identify whether it concerns type mismatch, move, borrowing or lifetime, then reduce the example until the compiler's rule becomes obvious. Never use unsafe just to hide a borrowing problem.

**Evidence:** both tests pass, and you can explain why a borrowed slice is valid only while the original input lives. Reference: https://doc.rust-lang.org/stable/book/ch09-00-error-handling.html.

## Rust — Expanded practice workbook

### Objective
A parser for an unsigned 16-bit positive number should return Result, not panic. References borrow data; String owns its buffer. Error conversion with map_err demonstrates why the question-mark operator needs a compatible enclosing return type.

### Run
Save as main.rs. Run rustc --test main.rs -o tests && ./tests followed by rustc main.rs -o app && ./app. Expect passing tests and Ok(42).

~~~rust
fn parse_limit(text: &str) -> Result<u16, String> {
    let number: u16 = text.trim().parse()
        .map_err(|_| "not a u16".to_string())?;
    if number == 0 { return Err("must be positive".to_string()); }
    Ok(number)
}
fn main() { println!("{:?}", parse_limit(" 42 ")); }
#[cfg(test)]
mod tests {
    use super::parse_limit;
    #[test]
    fn boundaries() {
        assert_eq!(parse_limit("42").unwrap(), 42);
        for bad in ["0", "-1", "65536", "word"] {
            assert!(parse_limit(bad).is_err());
        }
    }
}
~~~

### Trace the semantics
trim creates a &str slice borrowed from the input. The parse rejects negative numbers and overflows for u16. The explicit zero check is a domain rule, not a type rule. Returning a reference to a String allocated inside the function is invalid because that owner is destroyed on return; write such an experiment and read the compiler error.

### Extend
Pass &input from an owned String and then use input again to prove borrowing did not move ownership. Refactor the function to return a structured error enum, then handle it with match rather than unwrap at the user-input boundary. Add cases for whitespace, 65535, 65536 and an empty string.

### Debugging
E0382 commonly indicates use after move; E0502 often indicates conflicting borrows. rustc --version helps confirm toolchain, while cargo test is appropriate for a Cargo project. Do not reach for unsafe to silence a borrow-checker error.
Success: tests pass, no panic on malformed text and a clear explanation of borrowing. https://doc.rust-lang.org/book/

## Rust — Practical runnable code lab

### How to run the samples

These independent samples use the appropriate language toolchain. Representative command: `rustc {file} -o demo && ./demo`. Replace placeholders with the actual filename, keep test data isolated, and do not interpret this as automatic installation.


## Rust — Technical notes and common pitfalls

### Core knowledge

1. Ownership and borrowing constrain aliases and lifetimes to prevent many memory-safety errors.
2. Result represents recoverable failure; Option represents a missing value.
3. Unsafe blocks allow operations requiring manual justification, not a waiver of all invariants.
