# Brainfuck — trace memory cells to produce one ASCII byte

## Walk through the program, instruction by instruction

~~~brainfuck
++++++++[>++++++++<-]>+.
~~~

Assuming zero-initialized byte cells and an 8-bit ASCII output policy, the first cell starts at 8. Eight loop iterations each add 8 to the next cell and subtract 1 from the first. At loop exit the cells contain 0 and 64; the final >+. increments the second cell to 65 and writes A. The bracket tests the current cell, so the pointer must return to cell zero before ].

## Break the invariant deliberately

Remove < from the loop. The closing bracket then tests a different cell, making the termination argument invalid. Return it, then replace the last + with -: the final byte should be 63, ASCII question mark. Keep a trace of pointer index and both cell values before and after each iteration.

## Work out runtime differences

Test on a chosen interpreter. Determine whether cells wrap modulo 256, whether tape expansion is allowed, and how output bytes are rendered. Include 0, 1, 4 and 8 as trace checkpoints. Label all expected outputs until independently observed; no Brainfuck interpreter run is claimed here.

## Use a loop invariant to prove termination
At the beginning of iteration k (counting from zero), the first cell is 8-k and the second is 8k. The body preserves their sum in a weighted sense: decreasing cell zero by one contributes eight increments to cell one. Once k reaches 8, the controlling cell is zero and the loop stops. If your interpreter uses wrapping bytes and you accidentally decrement an already-zero controlling cell, it may wrap to 255 and run unexpectedly many iterations. Check final pointer position separately: a correct output byte does not guarantee the tape pointer is back at the origin.
