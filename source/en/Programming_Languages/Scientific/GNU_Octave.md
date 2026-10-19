# gnu_octave — consolidated language guide

## GNU Octave

### How the language behaves
GNU Octave is used for numerical computing with matrices and vectorized operations, broadly similar to MATLAB syntax.

### Source fragment to analyze
```text
x = [1 2 3];
y = x .^ 2;
disp(y)
```

### Deliberate exercise
Explain element-wise exponentiation and compare it with matrix multiplication or a matrix power where dimensions matter.

### Check a failure condition
Missing dots in element-wise operators can turn a vector calculation into a matrix operation or dimension error.

Record input, expected output and observed output with the actual GNU_Octave implementation and version. If no compatible runtime exists on your current platform, label the fragment unexecuted and reason from its semantics rather than claiming a successful run. Run a second isolated experiment that changes only the mechanism under investigation; preserve the exact diagnostic while removing private data.

## GNU_Octave — Expanded practice workbook

### Inspect the smallest source
~~~text
name = 'Ada';
disp(['Hello, ', name, '!']);
~~~

**Run or compilation context:** octave --quiet hello.m.. Treat this as a baseline: save a copy, confirm the toolchain version and note whether the example merely evaluates a value, prints text, or creates external effects. Production accounts, datasets and hardware must not be used for first attempts.

### Work through the actual mechanism
Solve a 2x2 linear system using A\b rather than inv(A)*b, then check norm(A*x-b) for residual error. Experiment with a nearly singular matrix.

### Diagnose the sharp edge
Matrix division and element-wise ./ are not equivalent. Check conditioning and numerical tolerance before comparing floating results.
