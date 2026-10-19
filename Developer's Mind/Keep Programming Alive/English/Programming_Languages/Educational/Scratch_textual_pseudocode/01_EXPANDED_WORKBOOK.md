# Scratch — event handling and a bounded score

## Assemble the actual blocks

Create a variable named score for all sprites. When the green flag is clicked, set score to 0. In the clickable sprite's "when this sprite clicked" event, use "if score < 3" to change score by 1; in the else branch say "Finished" for one second. This is a block layout to construct in Scratch, not executable JavaScript or Python.

## Trace four clicks

The predicted values after successive clicks are 1, 2, 3, 3. On the fourth click the alternative branch should execute without modifying score. Display the variable monitor on the stage to inspect the state rather than using the message bubble as proof.

## Expose a concurrency problem

Add another sprite whose click handler also increases the score. When two events are close together, the score might violate an intended round boundary. Introduce a separate variable called gameOver and require both the score bound and round state to permit increases. Reset both on the green flag.

## Submit observable evidence

Capture the complete block stacks and a table of click number, expected score and observed score. Test rapid interactions, restart during play and repeated clicks after gameOver becomes true. Scratch editor execution has not been performed for this text plan; validate behavior in the actual Scratch runtime.

## Distinguish forever from event-driven work
Do not put every score update inside a forever loop that runs independently of player clicks. If the project needs a countdown timer, implement that timer separately and have the click handler read the round state. Run a green-flag reset twice without refreshing the editor, and check whether the score and timer genuinely reset. A useful observation table records the event, variables before it, variables after it and any speech output. If a sprite receives a broadcast to end the round, inspect every handler that responds to the broadcast; one sprite saying "Finished" does not guarantee all score-writing scripts have stopped.
