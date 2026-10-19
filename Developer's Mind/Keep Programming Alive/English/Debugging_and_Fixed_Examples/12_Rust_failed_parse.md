# Debugging casebook — Rust, PHP, TypeScript and Python

## Rust: failed parse

### Broken example — DO NOT USE

```text
let age: i32 = text.parse().unwrap();
```

### Fixed example

```text
let age: i32 = match text.parse() {
    Ok(n) => n,
    Err(_) => { eprintln!("invalid number"); return; }
};
```

### Why it fails and the repair works

Avoid panicking when user input is invalid; this is a fragment inside main().

### Parsing is validation, not an assertion
Calling `unwrap()` on a user-supplied string panics when parsing fails. Return a `Result` instead, and separate syntax errors from domain constraints. Parsing as `u8` also rejects negative values and values greater than 255 before the business rule runs.

~~~rust
fn parse_age(text: &str) -> Result<u8, String> {
    let n: u8 = text.trim().parse()
        .map_err(|_| "expected an unsigned integer".to_string())?;
    if n > 120 { return Err("age outside accepted range".into()); }
    Ok(n)
}
fn main() {
    assert_eq!(parse_age("23"), Ok(23));
    assert!(parse_age("abc").is_err());
    assert!(parse_age("-1").is_err());
    assert!(parse_age("121").is_err());
    println!("PASS");
}
~~~

Save as `age.rs` and run `rustc age.rs -o age && ./age` on a system with Rust installed. The assertions cover ordinary input, nonnumeric text, negative input and an out-of-range but syntactically valid number. If Rust is not installed on your machine, record the execution check as pending rather than claiming it passed.

**Integration:** callers should match on `Ok(age)` and `Err(message)` to choose a user-facing response. Do not use `unwrap_or(0)` unless zero is a genuinely valid fallback; it can conceal bad input.

## PHP: HTML output

### Broken example — DO NOT USE

```text
echo $_GET["name"];
```

### Fixed example

```text
echo htmlspecialchars($_GET["name"] ?? "", ENT_QUOTES, "UTF-8");
```

### Why it fails and the repair works

Escape untrusted text before adding it to HTML.

### Context-aware output encoding (PHP 8)
A browser parses HTML markup rather than displaying it as literal text. Echoing untrusted strings directly can turn user data into elements or attributes. Escape at the output boundary for the **specific** context in which data is inserted.

~~~php
<?php
function escapeHtml(string $value): string {
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}
$sample = '<strong>& "hello"</strong>';
$expected = '&lt;strong&gt;&amp; &quot;hello&quot;&lt;/strong&gt;';
if (escapeHtml($sample) !== $expected) {
    throw new RuntimeException('escaping regression');
}
echo escapeHtml($sample), PHP_EOL;
~~~

Run `php html_lab.php`. The assertion checks angle brackets, an ampersand and double quotes. In a web handler, first verify `is_string($_GET['name'] ?? '')` because query parameters can arrive as arrays; then apply `escapeHtml` when rendering HTML text or a quoted HTML attribute. `ENT_QUOTES` covers both quote styles; `ENT_SUBSTITUTE` handles invalid byte sequences. UTF-8 must also match the response's declared charset.

**Important limit:** HTML escaping is not a universal sanitizer. JavaScript string literals, URLs, CSS and SQL require their own context-specific handling. Prefer DOM `textContent` for client-side text and parameter binding for SQL.

## TypeScript: any bypass

### Broken example — DO NOT USE

```text
function double(x: any) { return x * 2; }
```

### Fixed example

```text
function double(x: number): number { return x * 2; }
```

### Why it fails and the repair works

Keep meaningful annotations so the compiler can catch errors.

## Python: path traversal

### Broken example — DO NOT USE

```text
target = base / user_input
target.write_text("data")
```

### Fixed example

```text
target = (base / user_input).resolve()
if not target.is_relative_to(base.resolve()):
    raise ValueError("outside permitted folder")
target.write_text("data", encoding="utf-8")
```

### Why it fails and the repair works

Validate that user-derived paths remain inside an approved workspace (Python 3.9+).
