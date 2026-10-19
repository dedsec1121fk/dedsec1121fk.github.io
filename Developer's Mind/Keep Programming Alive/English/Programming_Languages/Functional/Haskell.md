# haskell — consolidated language guide

## Haskell

### Operational idea
Haskell is a lazy functional language with strong static types and explicit modeling of effects.

### Source or deliberately marked concept
```text
sumSquares xs = sum (map (^2) xs)
```

### Apply it to one controlled task
Test the function with empty and three-element lists, then discuss how laziness affects memory in long traversals.

### Check the important boundary
Purity does not eliminate nontermination or space leaks; reason about evaluation and strictness.

Work with disposable data in a genuine implementation of Haskell where available. Record the actual tool version and compare your prediction with observed output. If a compatible runtime is missing, clearly mark this as static analysis instead of claiming it passed execution. Split the normal case from at least one boundary value, and avoid using sensitive or production datasets merely to follow a tutorial.

## Haskell — Expanded practice workbook

### Build a typed function
Write `Main.hs` with an explicit type signature. Division by zero should be represented as part of the returned value rather than allowed to emerge as a runtime accident:

~~~haskell
safeDiv :: Int -> Int -> Maybe Int
safeDiv _ 0 = Nothing
safeDiv a b = Just (a `div` b)

main :: IO ()
main = do
  print (safeDiv 12 3)
  print (safeDiv 12 0)
  print (safeDiv (-7) 2)
~~~

With a suitable GHC installation run `runghc Main.hs`. The predicted values are `Just 4`, `Nothing`, and `Just (-4)` because Haskell's integral `div` rounds toward negative infinity. Compare `quot`, which truncates toward zero. The distinction matters for negative quantities and is a different question from zero handling.

### Understand pattern coverage
The first equation catches all denominators equal to zero; the second handles other integers. Reverse the equations and explain why an unguarded catch-all clause can make a later check unreachable. Change the function to accept `Integer` values and investigate why that removes the fixed-width range issue without changing the `Maybe` error contract.

### A deliberate partial-function trap
Evaluate `head []` only in a disposable interpreter and capture the exception. Then design `safeHead :: [a] -> Maybe a` with the cases `[]` and `x:_`. Use the fixtures `[]`, `[9]` and `[9,4]`. Explain why the compiler accepting a partial function does not guarantee its behavior for every input.

### Exercise with multiple failure modes
Return `Either String Int` from a revised divider so a zero denominator has an explanatory `Left` and a valid quotient has `Right`. Try positive, negative and boundary inputs; record GHC version and whether all expressions were run. Do not use a generic catch-all exception to replace explicit data modelling. References: https://www.haskell.org/documentation/ and https://downloads.haskell.org/ghc/latest/docs/libraries/

## Haskell — Practical runnable code lab

### How to run the samples

These independent samples use the appropriate language toolchain. Representative command: `runghc {file}`. Replace placeholders with the actual filename, keep test data isolated, and do not interpret this as automatic installation.


## Haskell — Technical notes and common pitfalls

### Core knowledge

1. Purity separates calculations from effectful IO actions.
2. Laziness can postpone work and change space usage unexpectedly.
3. Algebraic data types and pattern matching help encode complete cases.
