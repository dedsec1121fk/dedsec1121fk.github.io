# move — consolidated language guide

## Move

### Operational idea
Move is a resource-oriented smart-contract language, with resource types and explicit ownership constraints.

### Source or deliberately marked concept
```text
// Conceptual lab: transfer a resource once; verify sender no longer owns it
```

### Apply it to one controlled task
Use a local authorized test environment to model resource ownership before and after a transfer; include a rejected double-use case.

### Check the important boundary
Different Move frameworks have different standard libraries and transaction semantics; sample is conceptual, not executable.

Work with disposable data in a genuine implementation of Move where available. Record the actual tool version and compare your prediction with observed output. If a compatible runtime is missing, clearly mark this as static analysis instead of claiming it passed execution. Split the normal case from at least one boundary value, and avoid using sensitive or production datasets merely to follow a tutorial.

## Move — Expanded practice workbook

### Start with actual syntax
The archive's starter gives a minimal valid entry point for Move. Read its operators, declarations and output mechanism; then verify it with the correct interpreter rather than treating another language's syntax as interchangeable.

~~~text
module 0x1::hello {
    public fun answer(): u64 { 42 }
}
~~~

**Run context:** Build as part of a platform-specific Move package.. Before editing, check the exact compiler or interpreter version and save its output. Keep this exercise in a scratch directory, not inside a production project.

### Guided laboratory
Design a module with a value lacking copy ability and deliberately attempt a duplicate to see a compiler failure. Explain which storage abilities the resource needs on the chosen Move platform.

### Boundary-case investigation
Sui and Aptos package manifests, addresses, entry functions and object models differ: choose one local test runner and never assume cross-chain deployment works.

### Extended assignment
Starting from the exact sample, implement the guided lab in a separate file, then attempt one change involving ordering, shape, type, scope or environment as appropriate to Move. Explain your invariant and compare expected versus actual output in a small table. Preserve a minimal reproducer for any unexpected behavior; only then expand the example.

## Move — Focused mastery pathway

### Learning contract
This lab concerns Move's ability-based resource model, not a generic token tutorial. A resource without `copy` cannot be duplicated by normal Move operations; a resource without `drop` cannot be silently discarded. Platform storage semantics and entry-function rules differ across Aptos and Sui. Choose exactly one target and record the toolchain version before starting.

### Lab A: reproduce a compile-time capability failure
In a disposable Move package, define a resource `struct Ticket has key { id: u64 }` for an Aptos-style target. In a test function, create a Ticket and attempt to use it twice by value. The compiler should reject an illegal move or missing copy ability. Avoid claiming an exact diagnostic line without recording the installed compiler's output.

~~~move
module 0x42::tickets {
    struct Ticket has key { id: u64 }

    public fun id(t: &Ticket): u64 {
        t.id
    }
}
~~~

A reference `&Ticket` reads the identifier without consuming the value. Contrast this with passing a Ticket by value. Explain why adding `copy` is a change of invariants, not just a way to silence the compiler.

### Lab B: protect on-chain state
For Aptos, draft an entry function taking `&signer`, compute `signer::address_of(account)` and authorize against the expected owner before writing a `Ticket`. For Sui, separately model an object with UID and sender checked through its `TxContext`. Do not paste one platform's code into the other and call it portable.

Test: valid owner succeeds; other signer fails before storage changes; duplicate publish fails under the chosen storage invariant. Capture state before and after. Run only with test accounts on a local sandbox or testnet.

### Independent project
Build a non-transferable achievement marker with issue, inspect and revoke flows. Write an explicit state-transition table: absent → issued → revoked, and reject second issuance. Decide how revocation is represented when resources lack drop ability; document the precise platform operation rather than pretending deletion is automatic.

### Evidence and acceptance
Include package manifest, named-address configuration, toolchain version, compile-fail fixture, positive and unauthorized tests, state diffs and gas observations. A compiler-only demonstration does not establish an authorization guarantee; show transaction-level evidence. State which tests were not executed if the target environment is missing.
