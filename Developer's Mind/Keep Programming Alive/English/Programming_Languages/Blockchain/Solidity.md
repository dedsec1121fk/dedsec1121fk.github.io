# solidity — consolidated language guide

## Solidity

Solidity compiles contracts for the Ethereum Virtual Machine. A contract call that changes state is a transaction, not an ordinary local function call. Use only a local EVM or test environment while learning; deployments and transactions can incur real fees.

### Counter contract

Save Counter.sol:

~~~solidity
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

contract Counter {
    uint256 public count;
    event Incremented(uint256 value);

    function increment() external {
        count += 1;
        emit Incremented(count);
    }
}
~~~

Compile with a compatible solc compiler or a local Solidity development tool. Deploy to a disposable local chain. The generated public getter count() initially returns 0. After two increment() transactions it returns 2, and two Incremented events are emitted.

### Why state is different

count lives in contract storage. An external transaction must be included by the chain to change it; a read-only call to count() does not mutate state. Solidity 0.8 arithmetic checks overflow by default. Emitted events are useful for indexing but are not a replacement for contract storage.

### Failure and security boundary

Anyone can call increment(): this is intentional for the exercise, not access control. If an application needs an owner-only operation, add and test authorization explicitly. Never deploy unaudited financial contracts with real funds.

### Independent exercise

Add a decrement function that rejects zero, and test the revert. Compare a successful transaction receipt with a reverted one. Record compiler version and local-chain configuration.

Reference: https://docs.soliditylang.org/

## Solidity — Expanded practice workbook

### Start with actual syntax
The archive's starter gives a minimal valid entry point for Solidity. Read its operators, declarations and output mechanism; then verify it with the correct interpreter rather than treating another language's syntax as interchangeable.

~~~text
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
contract Greeting {
    string public message = "Hello, Ada!";
}
~~~

**Run context:** Compile with solc or a local Solidity test framework.. Before editing, check the exact compiler or interpreter version and save its output. Keep this exercise in a scratch directory, not inside a production project.

### Guided laboratory
Extend the greeting contract with a counter writable only by its deployer, then test a second caller that must revert. Compare a view call with a transaction and record gas consumed.

### Boundary-case investigation
Compilation is not a security audit; sender checks, reentrancy and storage invariants must be tested on a disposable EVM without real funds.

### Extended assignment
Starting from the exact sample, implement the guided lab in a separate file, then attempt one change involving ordering, shape, type, scope or environment as appropriate to Solidity. Explain your invariant and compare expected versus actual output in a small table. Preserve a minimal reproducer for any unexpected behavior; only then expand the example.

## Solidity — Focused mastery pathway

### Independent advanced exercise
Deploy a Counter on an isolated EVM. Check that owner is the deployer. Make the owner increment; then call from a different account and assert revert and unchanged storage. Compare gas paid for a state mutation with a view operation. Add an external call only after documenting failure states and reentrancy assumptions. These tests are not a financial contract audit.

## Solidity — Technical notes and common pitfalls

### Core knowledge

1. Contract state changes cost execution resources and may be irreversible after deployment.
2. Authorization must be enforced on-chain for protected operations.
3. Consider checks-effects-interactions and reentrancy risks in external calls.
