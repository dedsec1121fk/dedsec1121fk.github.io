# Validate values for their meaning and encode for their destination

## Two different questions
Input validation asks whether a value belongs to the application's permitted domain; output encoding protects the interpreter in which it will be displayed. A product quantity may be restricted to a finite integer within a range, while a free-form user label is allowed to contain punctuation. Escaping input globally is not a substitute for encoding output for HTML, URLs or JavaScript contexts.

~~~javascript
function acceptQuantity(value) {
  if (!Number.isInteger(value) || value < 0 || value > 9999)
    throw new RangeError('quantity out of range');
  return value;
}
const label = '<img src=x onerror=alert(1)>';
const target = document.createElement('span');
target.textContent = label; // visible text, not parsed markup
~~~

## Understand where errors arise
`textContent` is appropriate for plain text; `innerHTML` interprets markup and can be dangerous with untrusted strings. URL handling needs schemes and destinations validated independently from HTML escaping. JSON parsing ensures syntax but not business constraints: a parsed object can still be missing required keys or contain the wrong type.

## Local demonstration
Create a tiny page with the code above, insert the target span into an owned DOM fixture and verify the literal angle brackets appear as text. Then test `acceptQuantity(0)`, `acceptQuantity(-1)`, and `acceptQuantity('4')`; only the nonnegative integer should pass. In production, define an actual schema and avoid relying on JavaScript implicit numeric coercion.

## Boundary statement
This exercise illustrates safe output handling, not a complete XSS prevention program. Real systems need an appropriate renderer, trusted dependencies, CSP where suitable, link validation and defense-in-depth around all HTML-producing paths.
