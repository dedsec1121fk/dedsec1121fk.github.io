# Recipe: CLI contract with typed and required options

## Intended use and acceptance criteria
A small notes tool accepts `--category` with exactly two valid values and `--limit` from 1 through 100. By parsing a supplied argument list, the same logic can be tested without consuming the host process's own command-line options. Missing required options, unsupported categories and out-of-range limits must produce argparse's normal exit code 2.

## Complete runnable example
Save this as `03_CLI.py` and execute with Python 3. The fixture is disposable and has no network dependency.

~~~python
import argparse
def positive(text):
    value = int(text)
    if not 1 <= value <= 100:
        raise argparse.ArgumentTypeError("limit must be 1..100")
    return value
def parser():
    p = argparse.ArgumentParser(prog="notes")
    p.add_argument("--limit", type=positive, default=10)
    p.add_argument("--category", choices=("code", "ideas"), required=True)
    return p
def selection(argv):
    args = parser().parse_args(argv)
    return {"limit": args.limit, "category": args.category}
assert selection(["--category", "code"]) == {"limit":10,"category":"code"}
assert selection(["--category", "ideas","--limit","100"])["limit"] == 100
for bad in (["--category","nope"],["--category","code","--limit","0"],
            ["--limit","5"],["--category","code","--limit","101"]):
    try: selection(bad)
    except SystemExit as exc:
        assert exc.code == 2
    else: raise AssertionError("bad CLI accepted")
print("PASS bounded CLI parsing")
~~~

## Guarantees and limitations
Define the parser in a function and separate argument validation from the action that reads files or queries a database. `choices` guards the category value and an argument type function imposes the numeric bound. In this deliberately bounded interface, invalid input raises SystemExit instead of returning silent defaults. A complete application can convert such errors into a UI message but must not replace invalid limits with arbitrary numbers.

## Adaptation lab
Add `--format` with choices json and text, then test both defaults and wrong values. Run python -m compileall over the fixture and compare programmatic parse_args tests with actual terminal invocation. Add a value with Greek Unicode text only if your stated category contract permits it; do not silently widen fixed choices.

## Troubleshooting and release check
If running inside Termux, check Python interpreter version and how the invoking shell quotes spaces. Always pass command arguments as a vector to subprocess, not a shell-built string. If a script exits 2, use the usage message to identify a user-input problem rather than treating it as a server outage.
