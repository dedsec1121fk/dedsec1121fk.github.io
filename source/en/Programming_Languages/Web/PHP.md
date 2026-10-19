# php — consolidated language guide

## PHP

### What PHP actually runs
PHP runs in a CLI process or behind a web server. CLI success does not verify HTTP response headers or request parsing. Record the SAPI and runtime version before comparing results.

### Lab: missing, malformed and HTML-sensitive input
Save as `safe-label.php`. Run `php -l safe-label.php && php safe-label.php` with PHP 8+.

~~~php
<?php
declare(strict_types=1);
function safe_label(array $query): string {
    if (!array_key_exists('label', $query)) return '(missing)';
    if (!is_string($query['label'])) return '(invalid)';
    return htmlspecialchars(trim($query['label']), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}
$tests = [
    [['label' => ' Ada & Co '], 'Ada &amp; Co'],
    [[], '(missing)'],
    [['label' => ['unexpected']], '(invalid)'],
    [['label' => '<script>'], '&lt;script&gt;'],
];
foreach ($tests as [$input, $expected]) {
    if (safe_label($input) !== $expected) throw new RuntimeException('failed');
}
echo count($tests), " checks passed\n";
~~~

Expected output: `4 checks passed`. An absent key is not the same as a key containing an array. HTML escaping must occur at the HTML output boundary; it does not make an SQL query safe. Use parameter binding for SQL and JSON encoding for JSON.

### Diagnostic branches
- **Undefined array key:** check existence first. `array_key_exists` distinguishes missing from present `null`; `??` deliberately combines them.
- **TypeError:** query parameters can be arrays, for example `?label[]=x`. Validate the value before string operations.
- **Headers already sent:** find output or BOM before `header()` and `setcookie()`; do not silence the warning.
- **Works in CLI, fails on the web:** compare PHP versions, extensions, ini configuration, routing, permissions and server logs. `php --ini` describes CLI configuration, not necessarily the web SAPI.
- **Unexpected characters:** verify UTF-8 at the HTTP and HTML boundaries.

### Mastery checks
1. Predict all four fixture results, then run and record PHP version and actual output.
2. Add `['label' => ' "quoted" ']`; expect `&quot;quoted&quot;`. Explain `ENT_QUOTES`.
3. In a disposable local web server, call `safe_label($_GET)` and test missing input and `?label[]=x`.
4. Deliberately remove the type guard, capture the failure, restore it and explain the root cause.

**Reference:** https://www.php.net/manual/en/function.htmlspecialchars.php

## PHP — Expanded practice workbook

### Why currency needs a contract
Binary floating-point calculations can produce surprising fractional rounding. Store quantities and prices in the smallest practical integer units when they fit the domain, and validate every decoded JSON record rather than trusting array shapes.

### Execute
Save as total.php and run php total.php using a supported PHP version with JSON_THROW_ON_ERROR. The expected output is 375 cents. No web server or database is needed.

~~~php
<?php
declare(strict_types=1);
function totalCents(array $rows): int {
    $total = 0;
    foreach ($rows as $row) {
        if (!is_array($row) ||
            !isset($row["qty"], $row["unit_cents"]) ||
            !is_int($row["qty"]) || !is_int($row["unit_cents"])) {
            throw new InvalidArgumentException("invalid row");
        }
        $qty = $row["qty"];
        $price = $row["unit_cents"];
        if ($qty < 0 || $price < 0 ||
            ($qty > 0 && $price > intdiv(PHP_INT_MAX - $total, $qty))) {
            throw new InvalidArgumentException("invalid amount or overflow");
        }
        $total += $qty * $price;
    }
    return $total;
}
$rows = json_decode('[{"qty":2,"unit_cents":150},{"qty":1,"unit_cents":75}]',
                    true, 512, JSON_THROW_ON_ERROR);
if (totalCents($rows) !== 375) throw new RuntimeException("bad total");
echo "375 cents\n";
~~~

### Explain each safeguard
json_decode with associative=true returns PHP arrays. The type checks reject strings such as "2" even when they look numeric. Negative quantities and prices are rejected. Before multiplying, the intdiv check makes sure the next line item cannot overflow PHP_INT_MAX. It assumes the running total remains nonnegative, which earlier checks guarantee.

### Challenge
Try a decimal quantity, absent price, negative value, empty array, invalid JSON, and a deliberately huge product. Decide whether zero quantities are valid. Write a separate formatting function for display; do not mix presentation strings with numeric storage.

### Debugging and security
Run php -v and php -l total.php. An undefined array key means input validation is incomplete. Avoid interpolating external values into SQL or HTML: bound database parameters and HTML escaping solve different trust-boundary problems.
Success: 375 cents and rejected malformed rows. https://www.php.net/manual/en/function.json-decode.php

## PHP — Practical runnable code lab

### Run the two existing fixtures

In this PHP directory, run `php -v`, `php -l Practical_Code/01_safe_output.php`, `php Practical_Code/01_safe_output.php` and `php Practical_Code/02_arrays.php`. The first fixture prints the HTML-escaped name `Ada &lt;script&gt;`. The second filters `[3, 7, 9]` and prints a JSON list with values 7 and 9. These examples require the PHP CLI but no web server or network.

### Experiment: output encoding

The first fixture calls `htmlspecialchars($name, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8')`. Replace its synthetic name with `Ada & Bob` and predict the encoded ampersand. Try an empty string and a quote. This function is appropriate for HTML text output, not for SQL queries, JavaScript source, CSS or arbitrary URLs. Validate input separately, and encode once at the destination boundary. If encoded entities appear literally in a browser, check for double encoding and an incorrect response content type.

### Experiment: array keys and JSON shape

`array_filter` preserves original keys. Filtering `[3, 7, 9]` for values at least 7 leaves keys 1 and 2. `array_values` reindexes the result, so `json_encode` produces a JSON array instead of a keyed object. Remove `array_values` temporarily and compare. Test thresholds 3, 7 and 10, recording the empty case as well.

### Reproducible check

Save this as `check.php` and run `php -l check.php && php check.php`:

```php
<?php
declare(strict_types=1);
$encoded = htmlspecialchars('Ada & Bob', ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
$numbers = array_values(array_filter([3, 7, 9], fn(int $n): bool => $n >= 7));
if ($encoded !== 'Ada &amp; Bob' || $numbers !== [7, 9]) exit(1);
echo "OK\n";
```

A nonzero exit status indicates failure. If PHP cannot open a file, inspect `pwd` and the path. If JSON has unexpected object keys, inspect `array_keys` before encoding.

### Evidence

Record the PHP version, exact commands and output for normal and boundary cases. Explain why escaping HTML and reindexing a filtered list address different concerns. Restore the original fixtures after the experiment.

## PHP — Focused mastery pathway

### Build a server-side validator

Create `form.php` in a disposable directory. Use synthetic names only. HTML form constraints improve usability but can be bypassed, so validate the POST field again in PHP 8.0+.

```php
<?php
declare(strict_types=1);
function validateName(mixed $value): array {
    if (!is_string($value)) return [null, 'Name must be text'];
    $name = trim($value);
    if (!preg_match('/\A[\p{L} ]{1,40}\z/u', $name)) {
        return [null, 'Use 1-40 letters or spaces'];
    }
    return [$name, null];
}
function htmlText(string $s): string {
    return htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}
$post = ($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST';
[$name, $error] = $post ? validateName($_POST['name'] ?? null) : [null, null];
?>
<form method="post">
  <label for="name">Display name</label>
  <input id="name" name="name" required maxlength="40" aria-describedby="hint">
  <p id="hint">Letters and spaces only.</p>
  <button type="submit">Check</button>
</form>
<?php if ($error !== null): ?>
  <p role="alert"><?= htmlText($error) ?></p>
<?php elseif ($post): ?>
  <p><?= htmlText('Hello, ' . $name) ?></p>
<?php endif; ?>
```

The regex accepts Unicode letters and ordinary spaces, but excludes hyphens, apostrophes and combining marks. This is a deliberately narrow **exercise policy**, not a universal rule for people's names.

### Run and investigate

Check syntax with `php -l form.php`. Run `php -S 127.0.0.1:8000` from the same directory, then submit `Ada`, `Μαρία`, an empty value and markup-like text. The built-in server is for local development only. The browser may block blank submission, but PHP must reject a direct blank POST. Submit `name[]=x` to verify that an array does not trigger a type error. Distinguish an HTTP 404 (wrong working directory), a missing field (mismatched `name`), invalid input, and missing output encoding.

### Boundaries and next steps

Test 40 and 41 letters. Record HTTP status and response text without storing personal data. A state-changing form needs CSRF defenses and secure session handling; this exercise only prints a greeting. A JSON API should return a controlled 4xx status and explicit JSON response type.

### Mastery evidence

Record PHP version, syntax-check result, normal/invalid/boundary inputs, and which tests actually ran in a browser versus CLI. Explain why input validation and HTML output encoding protect different trust boundaries.

## PHP — Technical notes and common pitfalls

### Validate without implicit coercion

PHP may convert numeric-looking strings during comparisons and arithmetic. Define a rule at the request boundary instead of relying on conversion. This example accepts decimal **strings** from 0 to 120, rejects leading zeroes, whitespace, signs, arrays and out-of-range values, and returns `null` on failure:

```php
<?php
declare(strict_types=1);
function parseAge(mixed $value): ?int {
    if (!is_string($value) ||
        !preg_match('/\A(?:0|[1-9][0-9]{0,2})\z/', $value)) return null;
    $age = (int) $value;
    return $age <= 120 ? $age : null;
}
foreach (['0', '120', '121', '01', '-1'] as $input) {
    echo $input . ' => ' . var_export(parseAge($input), true) . "\n";
}
```

The first two values pass; the other three yield `NULL`. The range is an exercise policy, not a universal age definition. A submitted `age[]` field can arrive as an array, which the type check rejects.

### Ordered maps and JSON

PHP arrays are ordered maps and may have integer or string keys. `array_filter` preserves keys, so a filtered numeric array may encode as a JSON object. Apply `array_values` when a JSON list is required. Diagnose unexpected output with `array_keys`. Use `json_decode($text, true, 512, JSON_THROW_ON_ERROR)` to raise `JsonException` on malformed JSON and handle it without treating invalid data as valid.

### Passwords and operational diagnostics

Store password verifiers using `password_hash($password, PASSWORD_DEFAULT)` and check candidates with `password_verify`. Salted hashes vary across runs; do not compare newly generated hashes, log secrets or substitute plain SHA-256 for password hashing. Use `password_needs_rehash` for policy migration. `php -l file.php` checks syntax, `php -v` identifies the CLI version, and `php -m` lists extensions. The web server can use a different configuration. Keep `display_errors` off on public servers and remove temporary `phpinfo()` pages.

### Verification

Check `parseAge('0') === 0`, `parseAge('121') === null` and `parseAge('01') === null`. Verify a synthetic password with correct and incorrect candidates; feed malformed JSON and catch `JsonException`. Record actual runtime output and explain why validation, HTML encoding, parameterized SQL and password hashing address separate trust boundaries.
