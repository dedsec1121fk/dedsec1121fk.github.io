# Problem solving: reproduce before rewriting

Use a failure card:
- One-line symptom.
- Environment and exact action.
- Expected versus observed.
- First failing boundary.
- Smallest useful intervention.
- Regression check.
- What remains unknown.

**Worked example:** a button is visible but does not respond. First verify whether a click event fires. Then whether the handler runs, whether its state changes, and whether the rendered element updates. CSS may hide an overlay that intercepts taps; rewriting the entire page is premature.

**Search case:** if Greek letters disappear in an offline index, inspect encoding from source Markdown to JSON to HTML. Test Unicode and normalization, not just ASCII.

**Recovery case:** if a release broke a page, preserve a known-good copy, compare changed files, revert only the failing slice, and retry in a local environment. Never replace a working repository with an unverified redesign.

Prefer a diff that someone can understand over a large rewrite justified only by a vague promise of quality.
