# Search indexing, relevance and verification

## Search engines, inverted indexes and relevance ranking

A simple substring scan compares the query with every document. An *inverted index* maps each token to the documents containing it; SQLite FTS5 provides one such structure for offline use. Tokenization, casefolding, accent normalization and word boundaries affect recall and precision. Full-text ranking is useful but cannot infer the user's intent as an LLM might.

### Tiny toy inverted index
```python
from collections import defaultdict
texts = ['python syntax error', 'rust compile error']
index = defaultdict(set)
for position, text in enumerate(texts):
    for word in text.casefold().split():
        index[word].add(position)
assert index['error'] == {0, 1}
```

### Practice
1. Make phrase queries require adjacent tokens.
2. Rank title matches above body-only matches.
3. Avoid leaking private content from search preview.
4. Compare index size and scan time using 1000 documents.

## Reproducible inverted-index fixture

For three independent documents `d1="cat dog"`, `d2="dog fox"`, and `d3="cat"`, tokenization on whitespace gives postings `cat → {d1,d3}`, `dog → {d1,d2}` and `fox → {d2}`. A conjunctive query `cat AND dog` returns only `d1`; the union returns all three documents. This separates indexing semantics from relevance scoring: membership is deterministic while ranking requires an explicit rule.

Define an exact-term search before introducing case folding, stemming or fuzzy matching. A query for `CAT` is not equivalent to `cat` unless the index and query apply the same normalization pipeline. Store the original display text separately from normalized tokens so a search result can show the accurate spelling. For multilingual Greek, test both an accented and unaccented token and document whether accent folding is intentional.

For an incremental index, delete a document's old postings before inserting its revised tokens. Otherwise outdated terms remain searchable. Validate the invariant with a fixture: change `d2` from `dog fox` to `fox`; a subsequent search for `dog` must no longer include `d2`. Tests need no external network, hidden telemetry or real user content.
