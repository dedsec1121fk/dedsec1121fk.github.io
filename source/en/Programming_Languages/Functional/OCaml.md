# ocaml — consolidated language guide

## OCaml

### How the language behaves
OCaml combines algebraic data types and pattern matching with modules, and supports both functional and imperative programming.

### Source fragment to analyze
```text
let rec length = function
  | [] -> 0
  | _ :: xs -> 1 + length xs;;
```

### Deliberate exercise
Trace the recursion over an empty and a three-element list, and read the compiler warning when a new match is incomplete.

### Check a failure condition
An exception or missing match case is not fixed by unsafe wildcard swallowing; enumerate intended constructors.

Record input, expected output and observed output with the actual OCaml implementation and version. If no compatible runtime exists on your current platform, label the fragment unexecuted and reason from its semantics rather than claiming a successful run. Run a second isolated experiment that changes only the mechanism under investigation; preserve the exact diagnostic while removing private data.

## OCaml — Expanded practice workbook

### Make the zero-denominator contract explicit
OCaml integers are not unbounded and integer division must not silently fail on zero. Create `safe_div.ml`:

~~~ocaml
let safe_div a b =
  if b = 0 then None else Some (a / b)

let () =
  assert (safe_div 9 2 = Some 4);
  assert (safe_div 9 0 = None);
  assert (safe_div (-7) 2 = Some (-3));
  print_endline "checks passed"
~~~

Run using `ocaml safe_div.ml` or compile with an installed OCaml compiler. In OCaml, integer division truncates toward zero, hence `-7 / 2` produces `-3`. Compare this with mathematical floor division; a language-independent phrase like "round down" would be incorrect here. Do not treat `None` as the number zero.

### Trace pattern matching
Write a formatter: `let show = function None -> "invalid" | Some n -> string_of_int n`. This pattern covers both constructors. Deliberately omit the `None` arm and inspect the compiler's non-exhaustive-match warning. A warning is not guaranteed to be a hard compilation failure unless warning settings request it. Explain what input could then trigger `Match_failure`.

### Side effects versus values
The `let () =` block performs assertions and printing; `safe_div` itself only computes an option value. Distinguish this from an exception-raising divider: callers can inspect the optional result without catching an exception. Make the function accept a pair and apply it to multiple fixtures, preserving each input so failures can be explained.

### Further investigation
Check `max_int` and `min_int` and explain why fixed-width `int` cannot be assumed to represent arbitrary mathematical integers. Add negative divisors, numerator zero and an empty list of requests. Document whether each behavior was tested in interpreter or inferred from code; do not invent runtime evidence. Reference: https://ocaml.org/docs
