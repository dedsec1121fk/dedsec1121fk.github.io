# Debugging — reproduce and fix an inclusive-range error

## Scenario and acceptance criteria
A viewer exposes human-friendly line numbers starting at 1. Requesting lines 2 through 3 must return both entries and must not include line 1. Python slicing starts at index zero and excludes the end index; confusing the two conventions leads to an off-by-one defect that often hides until a user requests the first or last line.

## Executable lab — Python 3 standard library
Save the example as `11_debugging.py` and run it with Python 3. It uses synthetic data only and prints PASS when the assertions succeed. The same code appears in both translations.

~~~python
def line_range(lines, start, end):
    if not isinstance(start, int) or not isinstance(end, int):
        raise TypeError("line numbers must be integers")
    if not 1 <= start <= end <= len(lines):
        raise ValueError("line range outside document")
    # External users count from one; Python slices from zero.
    return lines[start-1:end]
source = ["first", "second", "third"]
assert line_range(source, 1, 1) == ["first"]
assert line_range(source, 2, 3) == ["second", "third"]
assert line_range(source, 1, 3) == source
for begin, finish in ((0, 2), (2, 4), (3, 2)):
    try: line_range(source, begin, finish)
    except ValueError: pass
    else: raise AssertionError("invalid interval accepted")
print("PASS off-by-one regression")
~~~

## Technical explanation
Start by recording the exact input, expected output, actual output and runtime. A minimal fixture with three lines is more diagnostic than a large production document. Define the invariant `1 <= start <= end <= len(lines)` and convert to `[start-1:end]`. Then add regression tests for first line, final line, whole range and invalid intervals. Debug prints that reveal document contents should be removed or scrubbed before releasing a fix.

## Bounded practice
Temporarily change the slice to `[start:end]` and observe which assertions fail. Try an empty document, a one-line document and negative indexes. Record an original failing request before editing the implementation, then run the same fixture after the fix. Add a similar test for byte offsets versus character positions in UTF-8 text.

## Diagnostics and completion evidence
If an error is not reproducible, capture Python version, exact input and whether the program uses one-based external numbering. Do not mask the bug by catching every Exception and returning an empty list. Keep the regression test after fixing the cause, so the same mistake is detected in future changes.
