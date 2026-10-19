# elixir — consolidated language guide

## Elixir

### Mental model
Elixir runs on Erlang's BEAM and favors immutable values, pattern matching and concurrent processes.

### Minimal source sample
```text
nums = [1, 2, 3]
Enum.map(nums, fn n -> n * 2 end)
```

### Experiment to carry out
Compare Enum.map's returned list with Stream.map's lazy behavior. Verify that nums itself remains unchanged.

### A specific failure to distinguish
Concurrent messages are asynchronous; deterministic assertions need receive patterns and bounded timeouts.

To evaluate the exercise, record the initial input, predicted behavior and actual observation in a compatible Elixir environment. Add a second run changing only one variable or argument; this makes the comparison attributable to a concrete cause. If the required runtime is not installed, treat the example as unexecuted source analysis and never label an imagined output as a passing test.

## Elixir — Expanded practice workbook

### Parse without conflating failure with zero
Create a disposable `parse_scores.exs` with a function that retains a clear success or error tag:

~~~elixir
defmodule Score do
  def parse(text) do
    case Integer.parse(text) do
      {n, ""} -> {:ok, n}
      _ -> {:error, :invalid_integer}
    end
  end
end
IO.inspect(Score.parse("12"))
IO.inspect(Score.parse("bad"))
IO.inspect(Score.parse("12x"))
~~~

Expected results are `{:ok, 12}` and two `{:error, :invalid_integer}` tuples. `Integer.parse("12x")` can parse a numeric prefix, but because the remaining text is not empty, our wrapper deliberately rejects it. That is a policy decision: parsing a prefix and validating a whole field are different operations. Run with `elixir parse_scores.exs` and record OTP/Elixir versions; execution has not been verified here.

### Pattern matching as control flow
The case expression matches tuples by their shape and values. Change the success clause to accept any remainder and explain how that affects `"12x"`. Try `"0"`, `"-3"` and the empty string to distinguish valid zero from malformed text. Do not use a generic rescue that converts arbitrary exceptions into zero.

### Count structured values
Evaluate `Enum.frequencies(["ada", "lin", "ada"])` and compare the resulting map with `%{"ada" => 2, "lin" => 1}`. A map is compared by associations, not by printed key order. Introduce a mixed-case spelling and decide whether explicit normalization is appropriate for your input contract.

### Independent exercise
Write ExUnit tests for all parsing cases, including a non-String input. Specify whether the function raises for invalid types or returns an error tuple, and make the behavior consistent. Explain how immutable maps and pattern matching differ from mutating a shared counter inside a loop. Documentation: https://hexdocs.pm/elixir/

## Elixir — Practical runnable code lab

### How to run the samples

These independent samples use the appropriate language toolchain. Representative command: `elixir {file}`. Replace placeholders with the actual filename, keep test data isolated, and do not interpret this as automatic installation.


## Elixir — Technical notes and common pitfalls

### Core knowledge

1. Immutable data and pattern matching are central to the language style.
2. Lightweight processes exchange messages and are not OS threads.
3. Supervision organizes restart strategies; errors must not be hidden under endless retries.
