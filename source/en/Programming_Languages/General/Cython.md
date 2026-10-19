# cython — consolidated language guide

## Cython

Cython compiles Python-like source into a Python extension. Profile before optimizing: compilation alone does not guarantee faster code. A C compiler, Cython and setuptools are required.

### Build a small extension

Save fastmath.pyx:

~~~cython
# cython: boundscheck=True, wraparound=False
cpdef long sum_squares(long[:] values):
    cdef Py_ssize_t i
    cdef long total = 0
    for i in range(values.shape[0]):
        total += values[i] * values[i]
    return total
~~~

Save setup.py:

~~~python
from setuptools import setup
from Cython.Build import cythonize
setup(ext_modules=cythonize("fastmath.pyx", language_level=3))
~~~

Run in a temporary development folder:

~~~sh
python setup.py build_ext --inplace
python -c "from array import array; from fastmath import sum_squares; assert sum_squares(array('l',[2,3,5])) == 38"
~~~

This exact extension compiled and passed its assertion in a local test.

### Why it works

cpdef is Python-callable; long[:] accepts a compatible buffer such as array('l'), not an ordinary list. C long has a finite range, unlike Python integers. Very large values can overflow.

### Exercises and failures

Test an empty array: the result should be zero. Pass a list and examine the conversion error. Benchmark against pure Python only after checking equal results, including buffer creation cost.

Reference: https://cython.readthedocs.io/en/latest/src/userguide/memoryviews.html

## Cython: applied exercises

### Build the actual starter
The accompanying `00_starter.pyx` defines `def square(int x): return x * x`. Copy it into a new scratch directory as `cy_lab.pyx`; a leading numeric filename is an awkward Python import name, so do not try to import `00_starter` directly. With Python, a C compiler and Cython installed, compile this scratch module:

~~~sh
cythonize -i cy_lab.pyx
python -c "import cy_lab; assert cy_lab.square(-3) == 9; assert cy_lab.square(0) == 0; print(cy_lab.square(12))"
~~~

The expected printed result is `144`. This command is a **test instruction, not a claimed execution**: record the actual interpreter, compiler, Cython version and output. Never compile or install unfamiliar modules from an untrusted directory.

### Discover the type boundary
In `def square(int x)`, a Python caller enters a C-typed parameter. Test `12`, `-3`, `0`, `3.5` and a large integer independently; note which conversions succeed and which raise an error. Small-integer arithmetic is not evidence that overflow is safe. A C `int` has a limited platform-specific range, and integer overflow can invalidate a result; do not use this demonstration for financial values or unbounded inputs.

### Compare against a Python control
Write `def py_square(x): return x*x` in a different `.py` file. Verify `py_square(46341) == 2147488281` and compare the compiled function only with inputs known to be safe for its C type. A surprising large-value result is a **boundary finding**, not proof that Cython is universally faster or less accurate. Change the typed parameter or implementation deliberately, recompile, and repeat the same fixture.

### Failure analysis and completion
If compilation fails, separate a missing `cythonize` package from a missing system C compiler and from Cython syntax errors. Capture the first full diagnostic and the exact reproduction command; do not guess. As an independent exercise, add a second function computing the sum of squares of a short list without silently accepting non-integral values. Test empty input, zero, negative numbers and invalid objects; state whether failures arise at the Python-to-C boundary or in the function body. Reference: https://cython.readthedocs.io/

## Cython — Focused mastery pathway

### Stage 1: understand the execution model
Write a .pyx function that sums a memoryview of doubles, with a typed loop index and accumulator. Compile it with a minimal setup or pyproject build configuration, then compare against sum() in Python.

### Stage 2: prove the rule with controlled cases
Verify input type and memoryview contiguity assumptions. Measure speed on multiple array sizes and avoid timing initial compilation or import. Explain why typed loops can help but Python-object operations inside the loop can dominate cost.

### Stage 3: build a small, reviewable project
Deliberately access past the final element only in a safe, bounds-checking build and capture the diagnostic. Document why disabling boundscheck for speed requires established invariants; do not advertise unsafe optimization as a default.

### Cython typed-memoryview reproducibility lab
~~~cython
# fastsum.pyx
def total(int[:] values):
    cdef Py_ssize_t i
    cdef long accumulator = 0
    for i in range(values.shape[0]):
        accumulator += values[i]
    return accumulator
~~~
Construct a Python array.array('i', [1, -2, 5]) and verify that total returns four. Compare against Python sum() with exactly the same input; run multiple timed iterations after warming both implementations. A Python list does not satisfy a typed memoryview buffer contract. Also record Python, Cython and C-compiler versions. Check an empty array and describe accumulator overflow for values exceeding the platform C long range; performance does not excuse incorrect totals.
