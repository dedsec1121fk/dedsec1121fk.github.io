data { int<lower=0> N; }
parameters { real mu; }
model { mu ~ normal(0, 1); }
