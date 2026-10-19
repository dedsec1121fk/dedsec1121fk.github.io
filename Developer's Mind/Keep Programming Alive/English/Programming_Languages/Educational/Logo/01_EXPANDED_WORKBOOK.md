# Logo — turtle geometry with a measurable invariant

## Try a square in a compatible Logo turtle interpreter

~~~logo
CS
REPEAT 4 [FD 50 RT 90]
~~~

Trace the turtle's heading: 0°, 90°, 180°, 270°, back to 0°. Four identical 50-unit steps along these headings should return it to the starting location. The image alone is insufficient evidence: record the final position and direction using the commands supported by your particular dialect. CS usually clears and resets the drawing, but confirm dialect behavior.

## Controlled failure

Change RT 90 to RT 80. Four turns now total 320°, not 360°, so the heading invariant fails. Restore 90° and change the second side length to 40. Explain why a correct total rotation cannot guarantee a closed square if lengths differ.

## Independent project and checks

Create a SQUARE procedure accepting a side parameter, then draw sides 20 and 80 from a fresh starting state. Include an invalid parameter and observe whether the interpreter rejects it or uses surprising coercion. Document interpreter name, version, commands for position inspection, and observed results; this illustrative program has not been executed in Logo during this audit.

## Why a regular polygon closes
For n equal sides, the exterior angle is 360/n degrees, so a triangle uses 120° while a hexagon uses 60°. Run REPEAT 3 [FD 50 RT 120] and REPEAT 6 [FD 50 RT 60] as separate experiments with a reset between them. Compare the polygon after changing only the repeat count: even though each step is valid, the turtle's final direction will differ when total rotation is not 360°. Turn pen up, move to a new origin, turn pen down and repeat; moving with the pen raised should not draw a stray connecting edge.
