# JavaScript ReferenceError — distinguish missing names and temporal dead zones

## Two failure modes
A variable that has never been declared is not the same as a let/const binding that exists but has not been initialized. Both can throw ReferenceError, but the second is a temporal dead zone (TDZ).

~~~javascript
try {
  console.log(neverDeclared);
} catch (err) {
  console.assert(err instanceof ReferenceError);
}

function normalized(text) {
  const value = String(text).trim();
  return value.toLowerCase();
}
console.assert(normalized(" Ada ") === "ada");
~~~

## A scope trap
The following is intentionally incorrect:

~~~javascript
// console.log(status); // ReferenceError before initialization
// const status = "ready";
~~~

Move declarations before their first read, and avoid shadowing a value with another let binding in a nested block. A typeof expression on a truly undeclared identifier can return "undefined", but querying a lexical binding in its TDZ can still throw.

## Practice
Write a module that exports normalized(), import it by its exact name and attempt a misspelling to observe a different module-level error. Distinguish a missing identifier from an object with a missing property (which reads as undefined). Fix the producer or import rather than installing unrelated libraries.

Reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Cant_access_lexical_declaration_before_init

## Temporal dead zone differs from missing binding
~~~js
const count = 3;
function read() { return count; }
console.assert(read() === 3);
~~~
An undeclared identifier triggers ReferenceError; so can accessing a `let` or `const` binding before initialization in its temporal dead zone. Renaming a global can hide a scope problem temporarily. Build two deliberate failing fixtures: a typo of `count`, and a `console.log(value)` before `let value = 2`. Fix each based on scope and initialization order rather than adding every variable to globalThis.
