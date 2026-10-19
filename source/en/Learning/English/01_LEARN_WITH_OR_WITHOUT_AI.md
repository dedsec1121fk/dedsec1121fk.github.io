# Learning is the ability to solve again

Knowing how to locate a solution is real problem-solving. It is not identical to remembering a language's syntax or independently proving every algorithm correct. Use AI, documentation, and experiments without confusing the roles.

A good cycle:
1. Explain the problem in your own words.
2. Predict a result before running anything.
3. Try a small version.
4. Read errors instead of replacing the whole script.
5. Ask an assistant for *why*, alternatives, and failure cases.
6. Change the example yourself and predict the new result.
7. Rebuild without relying on the exact previous answer.

**Example:** a Python list unexpectedly keeps values between calls. Investigate mutable default arguments, reproduce with two calls, replace the default with None and allocate the list inside. Then explain *why* the function object preserved state.

**Understanding test:** can you adapt the fix to another function? Can you describe when it would not be needed?

AI is a useful collaborator, but generated code still needs review, tests, licensing checks, and an owner who understands its effect.
