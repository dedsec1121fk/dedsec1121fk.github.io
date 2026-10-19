# wren — consolidated language guide

## Wren

### Working model
Wren is a small class-based scripting language embedded in host programs. A host application normally supplies modules and the way source is executed.

### Focused source example
```text
class Counter {
  construct new(n) { _n = n }
  value { _n }
}
System.print(Counter.new(4).value)
```

Construct counters with distinct initial values and compare the returned values; distinguish getter syntax from a method call.

### Evidence to collect
Record the exact Wren compiler or runtime version, required dependencies, and output from harmless test data. Predict an observation before checking it, and keep both the initial and revised source to show which change caused the result. Do not claim that a displayed fragment was executed if the platform is unavailable.

### Failure mode worth investigating
Many Wren runtimes are embeddings rather than complete standalone packages; verify what the host actually exposes.

## Wren: applied exercises

### Create a counter with a small invariant
Wren is a class-based, dynamically typed scripting language. Create a disposable script:

~~~wren
class Counter {
  construct new() { _count = 0 }
  increment() { _count = _count + 1 }
  value { _count }
}
var c = Counter.new()
c.increment()
c.increment()
System.print(c.value)
~~~

Expected output is `2`. The leading underscore marks an instance field in Wren syntax, and `value` is a getter. A constructed object starts with zero and changes only when `increment` executes. Run with the interpreter for the intended Wren version and record the actual output; no such runtime was executed in this review.

### Test instance isolation
Construct two counters, increment only the first and inspect both values. Predict first value 1 and second value 0. This checks whether each constructed object has its own instance field; it does not test concurrent access or persistence. Explain what would change if the program instead stored a shared counter elsewhere.

### Deliberate runtime failure
In a separate scratch copy, attempt to invoke a method that `Counter` does not define and record the actual runtime error. Wren does not type-check every message send ahead of execution as a static C# compiler would. A missing method is different from valid method execution with a wrong arithmetic result. Restore the original program for subsequent tests.

### Independent exercise
Add `add(n)` that rejects negative inputs using an explicit error policy. Test zero, positive and negative values and repeated calls. Extend the class with `reset()` and specify whether reset is allowed after publication of a score. Record both the invariant and the exact interpreter version rather than importing Python or Lua assumptions. Reference: https://wren.io/

## Wren — Focused mastery pathway

### Scope
Wren is a small embedded scripting language, not a Python package or a JavaScript runtime. A class controls its own internal quantity and rejects invalid operations. This example only manipulates in-memory data and does not require filesystem access.

### Code (stock.wren)
~~~wren
class Stock {
  construct new(quantity) {
    _quantity = quantity
  }

  quantity { return _quantity }

  sell(amount) {
    if (amount <= 0 || amount > _quantity) {
      Fiber.abort("invalid sale")
    }
    _quantity = _quantity - amount
  }
}

var stock = Stock.new(5)
stock.sell(2)
System.print(stock.quantity)
~~~
Expected normal output: 3. The underscore-prefixed field belongs to the instance; quantity is a getter exposed to callers. The constructor sets the initial state, and sell changes it only after validating the requested amount. For production use, also validate the **constructor** argument: the minimal example permits invalid starting quantity by design so you can test and repair that gap.

### Practice and failure paths
1. Run sell(0) in a separate execution: it should abort with invalid sale rather than silently mutate the stock.
2. Run sell(9) on a fresh Stock.new(5). Check that the operation fails before subtraction.
3. Change the constructor to reject negative quantities; test both a negative initial state and zero.
4. Wrap a deliberately failing operation in an appropriate Fiber.try scenario and compare handled errors with normal main-fiber termination.
5. Decide whether amount should be constrained to whole numbers; Wren numeric values can be non-integer, so greater-than checks alone do not enforce inventory units.

### Verification
Record Wren runtime version, launcher, stdout and error message for independent test runs. Wren does not use general try/catch syntax; its documented error handling is fiber-based. Reference: https://wren.io/error-handling.html
