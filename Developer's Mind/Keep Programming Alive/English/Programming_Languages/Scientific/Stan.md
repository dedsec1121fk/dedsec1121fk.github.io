# stan — consolidated language guide

## Stan

### How the language behaves
Stan expresses probability models with distributions and typed data, while inference is performed by external sampling or optimization algorithms.

### Source fragment to analyze
```text
parameters { real mu; }
model { mu ~ normal(0, 1); }
```

### Deliberate exercise
Supply observed data only after specifying its dimensions. Compare prior and posterior intuition rather than treating every sample as an independent measurement.

### Check a failure condition
A model that compiles may still show divergent transitions or weak identifiability; examine sampler diagnostics and effective sample size.

Record input, expected output and observed output with the actual Stan implementation and version. If no compatible runtime exists on your current platform, label the fragment unexecuted and reason from its semantics rather than claiming a successful run. Run a second isolated experiment that changes only the mechanism under investigation; preserve the exact diagnostic while removing private data.

### Extend the investigation
Create an alternative input and describe what would cause a different result: parsing, type rules, runtime constraints or an external dependency. Explain which assumption you would verify first when moving the same sample to another machine.

## Stan: applied exercises

### Specify data, parameters and probability
Stan describes a statistical model; it is not a general-purpose scripting language for printing three arithmetic results. Save the following model in `mean.stan`:

~~~stan
data {
  int<lower=1> N;
  array[N] real y;
}
parameters {
  real mu;
}
model {
  mu ~ normal(0, 5);
  y ~ normal(mu, 1);
}
generated quantities {
  real y_rep = normal_rng(mu, 1);
}
~~~

For a local example supply `N = 3` and `y = [1.0, 1.2, 0.8]` through the data interface of CmdStan or a compatible host. `mu` has a prior and the observed values have a likelihood; `y_rep` represents a generated draw. It is **not** a fixed answer equal to the sample average, and no posterior values are asserted here.

### Differentiate compilation and sampling
First compile/parse the model with the installed toolchain. Only then run sampling with an explicitly recorded random seed, warm-up and sample count. A successful model compilation says nothing by itself about chain convergence, effective sample size or quality of inference. Report diagnostics such as `R-hat` and divergences where the interface provides them.

### Fail at the data boundary
Pass `N=3` with only two observed values, then separately pass `N=0`. The first violates the required array length; the second violates `int<lower=1>`. These errors are not evidence that the normal distribution is wrong. Capture which stage rejects each fixture.

### Independent task
Change the observation scale from fixed 1 to a positive estimated parameter, add a defensible prior, and explain what becomes harder to identify with only three measurements. Compare posterior predictive draws across recorded seeds without claiming reproducibility of every random sample. Reference: https://mc-stan.org/docs/
