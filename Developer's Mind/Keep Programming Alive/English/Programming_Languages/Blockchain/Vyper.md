# vyper — consolidated language guide

## Vyper

**Typical use:** Smart contract languages.

**Suggested file extension:** `.vy`.

**How to run / environment:** Compile using compatible vyper toolchain.

### Starter example

```
# pragma version ^0.4.0
message: public(String[64])
@deploy
def __init__():
    self.message = "Hello, Ada!"
```

### How to read it

This version-specific syntax requires checking the compiler release.

### Common pitfall

This version-specific syntax requires checking the compiler release.

## Vyper — Expanded practice workbook

### Start with actual syntax
The archive's starter gives a minimal valid entry point for Vyper. Read its operators, declarations and output mechanism; then verify it with the correct interpreter rather than treating another language's syntax as interchangeable.

~~~text
# pragma version ^0.4.0
message: public(String[64])
@deploy
def __init__():
    self.message = "Hello, Ada!"
~~~

**Run context:** Compile using compatible vyper toolchain.. Before editing, check the exact compiler or interpreter version and save its output. Keep this exercise in a scratch directory, not inside a production project.

### Guided laboratory
Compile a 0.4-style @deploy constructor, add a public counter and compare its getter with an authorized state mutation. Write a local test that rejects unauthorized callers.

### Boundary-case investigation
Do not paste Vyper 0.4 decorators into a 0.3 compiler; inspect version pragma and do not copy Solidity modifiers or unbounded loops.

### Extended assignment
Starting from the exact sample, implement the guided lab in a separate file, then attempt one change involving ordering, shape, type, scope or environment as appropriate to Vyper. Explain your invariant and compare expected versus actual output in a small table. Preserve a minimal reproducer for any unexpected behavior; only then expand the example.

## Vyper — Focused mastery pathway

### Independent advanced exercise
Using a fixed Vyper 0.4 compiler, compile an @deploy constructor and inspect the ABI. Implement a public owner getter and protected counter mutation. Test accepted and rejected callers and unchanged state after reverts. Compare the result to a conceptual Solidity version, carefully noting unsupported modifiers and language-specific restrictions.
