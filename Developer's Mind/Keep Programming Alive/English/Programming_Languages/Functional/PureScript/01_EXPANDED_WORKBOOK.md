# PureScript — separate pure arithmetic from console effects

## Read two different type signatures

~~~purescript
module Main where
import Prelude
import Effect (Effect)
import Effect.Console (logShow)

double :: Int -> Int
double n = n * 2

main :: Effect Unit
main = logShow (double 21)
~~~

The double function is pure: given 21 it returns 42 without printing. main explicitly wraps console output in Effect. Build this example inside a compatible PureScript/Spago project, following that project's source layout and installed versions.

## Force a type mismatch

Try putting logShow directly inside double while keeping the declared type Int -> Int. The type checker must reject the attempted effect as a numeric return value. Describe why changing the type annotation without changing the design is not a repair.

## A testable extension

Implement a pure mapping function over an array of integers. Check empty arrays, zero and negatives without depending on the console. Put only final I/O in Effect. Record compiler diagnostics and actual output from your runtime; none are claimed from the current audit.

## Predict a refactoring without running effects
Replace main's expression with a pure local binding: result = double 21, then logShow result. The output should stay equivalent because double has no observable effects. In contrast, moving console logging into a helper changes the helper's return type to Effect Unit or requires effect sequencing. Test a second pure function that returns Nothing on invalid input using Maybe instead of exceptions. Document why Maybe and Effect express different information: absence of a value is not the same thing as reading or printing external state. Use a test runner to establish actual behavior instead of comparing only source annotations.

## PureScript

**Typical use:** Functional programming.

**Suggested file extension:** `.purs`.

**How to run / environment:** Compile in a PureScript project (spago).

### Starter example

```
module Main where
import Prelude
import Effect (Effect)
import Effect.Console (log)
main :: Effect Unit
main = log "Hello, Ada!"
```

### How to read it

Effect types make side effects explicit.

### Common pitfall

Effect types make side effects explicit.
