# JavaScript Uncaught TypeError — validate the failing operation

## Read the message, not just its headline
TypeError is raised when a value is used in an incompatible operation: calling a nonfunction, destructuring null, or invoking an array method on a nonarray. "Uncaught" means no appropriate exception handler reached the failure.

~~~javascript
function average(values) {
  if (!Array.isArray(values)) throw new TypeError("expected array");
  if (!values.every(v => Number.isFinite(v))) throw new TypeError("non-finite number");
  if (values.length === 0) return null;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

console.assert(average([2,4]) === 3);
console.assert(average([]) === null);
try { average({length:2}); throw Error("test failed"); }
catch (e) { if (!(e instanceof TypeError)) throw e; }
~~~

## Find the real producer
Inspect the stack frame in your source. Use typeof, Array.isArray, and a schema check at API boundaries. Optional chaining is appropriate when absence is allowed but should not paper over a contract that promises an array.

## Browser investigation
Enable pause on exceptions in DevTools and capture the actual failing argument, without logging secrets. If a Promise rejected with TypeError, handle it at an asynchronous boundary, not only with a synchronous try/catch around a non-awaited function call.

**Exercise:** distinguish undefined, null and a string being passed to average; all must be rejected before reduce runs. Reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypeError

## Reproduce at the source boundary
~~~js
function upperName(user) {
  if (!user || typeof user.name !== "string")
    throw new TypeError("user.name must be a string");
  return user.name.toUpperCase();
}
console.assert(upperName({name:"Ada"}) === "ADA");
~~~
Test `null`, `{}` and `{name:42}` separately. A `try/catch` around the entire app is not a substitute for validating the shape of an external API payload at one well-defined boundary. If the error occurs in a Promise, its rejection must also be handled.
