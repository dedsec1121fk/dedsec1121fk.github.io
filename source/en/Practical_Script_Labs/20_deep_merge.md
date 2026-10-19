# Deep dictionary merge — policy, copies and conflicting types

## Define the merge contract before writing code
A configuration override should replace explicitly specified values while preserving unrelated defaults. In the existing merge function, dictionary-versus-dictionary values are merged recursively; lists, scalar values and None are replaced as whole values rather than concatenated or ignored. It first makes a deep copy, so callers may mutate the result without changing the original nested configuration. Top-level non-dictionary arguments raise TypeError.

**Working source:** 20_deep_merge.py. Execute python3 20_deep_merge.py to inspect the original example, then save the following independent test as test_merge.py in the same folder. This deliberately exercises nested copies, list replacement, type conflict and invalid top-level input.

## Executable independent tests
~~~python
from runpy import run_path
merge = run_path("20_deep_merge.py")["merge"]
defaults = {"ui": {"lang": "en", "theme": "dark"}, "tabs": ["a"]}
result = merge(defaults, {
    "ui": {"lang": "el"}, "tabs": ["b"], "new": None
})
assert result == {
    "ui": {"lang": "el", "theme": "dark"},
    "tabs": ["b"], "new": None
}
result["ui"]["theme"] = "light"
assert defaults["ui"]["theme"] == "dark"
assert merge({"a": {"b": 1}}, {"a": 5})["a"] == 5
try:
    merge([], {})
except TypeError:
    pass
else:
    raise AssertionError("non-dictionary source accepted")
print("PASS merge: isolation, replacement, recursion, type guard")
~~~

## Why accidental mutation is a real bug
A shallow copy such as dict(defaults) copies only the outer mapping: defaults['ui'] and the new result's nested ui object can still point to the same dictionary. Updating a nested theme in the result would unexpectedly modify the reusable defaults. copy.deepcopy recursively allocates separate mutable containers. The function also copies override values so a caller modifying the returned list does not mutate the input override list. This is useful in a GUI where the user can change settings without affecting an uncommitted default profile.

## Understand the conflict policy
The example replaces tabs ['a'] with ['b']; it does not join both lists. A dictionary value may be replaced with an integer, and an explicit None remains a value rather than meaning 'delete'. These choices are application policy rather than a universal definition of deep merge. Before deploying, decide how unknown keys, secret-bearing values and schema migrations will be validated. Blindly merging a user-supplied configuration does not make it safe.

## Fault-oriented exercises
1. Replace the deepcopy calls with shallow copies in a throwaway copy and show an assertion that now fails.
2. Create a nested dict/list structure, change a list inside the result and verify both original inputs remain unchanged.
3. Decide whether conflicting types should be rejected rather than replaced. Implement one strict policy and test it explicitly.
4. Investigate self-referential dictionaries and excessive nesting. The current recursion does not impose a depth bound; write a plan to detect cycles or cap nesting rather than claiming unrestricted input safety.

**Completion:** PASS, unchanged inputs, a documented list/None policy, and one reproduced aliasing bug.
