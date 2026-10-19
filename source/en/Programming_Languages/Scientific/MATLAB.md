# MATLAB: solve a system and distinguish matrix from element-wise operations

## A numerical question with a known answer
For A=[3 1;1 2] and b=[9;8], solve Ax=b. The equations are 3x+y=9 and x+2y=8, giving x=2 and y=3. MATLAB stores b as a column vector; `[9 8]` instead creates a row and does not describe the same multiplication shape.

~~~matlab
A = [3 1; 1 2];
b = [9; 8];
x = A\b;
residual = norm(A*x - b, inf);
assert(norm(x - [2; 3], inf) < 1e-12);
assert(residual < 1e-12);
C = [1 2; 3 4];
assert(isequal(C*C, [7 10; 15 22]));
assert(isequal(C.*C, [1 4; 9 16]));
~~~

## Read the dimensions before changing an operator
Matrix multiplication combines rows with columns; element-wise multiplication pairs matching entries, subject to the implementation's array-expansion rules. Here both operands have the same 2-by-2 shape, so the different values come from the operation, not an incompatible size. Compare the first output entry: 1*1+2*3=7 versus 1*1=1.

## Residual is evidence with a limit
A small residual means the computed answer nearly satisfies the supplied equations. It does not alone guarantee a small forward error when the matrix is ill-conditioned. Inspect conditioning and input uncertainty before reporting many trustworthy decimal places. Avoid computing inv(A)*b merely as a habit; the backslash operator expresses the solve directly.

## Boundary investigation
Replace A with a singular matrix such as [1 2;2 4] and choose an inconsistent b. Observe warnings and results in the actual environment rather than treating every returned vector as a valid unique solution. Then set b=[3;6] and explain why infinitely many exact solutions are possible. These tests separate software behavior from the mathematical question.

## Runtime and portability
Run the script in MATLAB with its version recorded. Much of this small example is also recognizable in GNU Octave, but toolboxes, language details and numerical implementations are not universally interchangeable. No graphics or proprietary toolbox is needed for the stated operations. An absent runtime means the lab is mathematically inspectable, not runtime-verified.

References: [mldivide](https://www.mathworks.com/help/matlab/ref/double.mldivide.html), [array and matrix operations](https://www.mathworks.com/help/matlab/matlab_prog/array-vs-matrix-operations.html).
