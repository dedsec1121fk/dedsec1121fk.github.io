# Decision making: spend the scarce resource last

A budget is a design input, not a footnote. It might be build minutes, disk size, limited network access, battery, or the attention of the reader.

Before a costly pipeline:
1. Inventory changed files.
2. Run syntax checks and cheap targeted tests.
3. Validate links, encoding, and documentation locally.
4. Batch related edits into a deliberate commit.
5. Run expensive integration only when the cheaper evidence has passed.
6. Record consumption and reserve margin for correction.

**Example:** a documentation archive does not need a paid cloud build merely to publish Markdown. Running multiple Android emulators to verify an unchanged README is wasteful.

**Trade-off:** saving resources must not become a pretext to claim unperformed tests. Explicitly state “static check only” when that is the evidence.

**Priority test:** value of change × confidence / cost, with privacy and correctness as non-negotiable gates. The formula is a discussion aid, not fake precision.
