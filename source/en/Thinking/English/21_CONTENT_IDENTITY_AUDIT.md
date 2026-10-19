# Distinguish true duplicate knowledge from shared examples

Two files can contain identical code without being duplicate lessons. For example, SQL dialects may intentionally teach the same basic greeting query under different tools.

## Three different duplicate checks
- **Record identity:** two records with the same unique ID. This is usually a data error.
- **Body identity:** canonicalize whitespace and Unicode, then compare the full body. Investigate identical bodies before deleting them.
- **Semantic identity:** compare learning goals, platform, prerequisites, expected behavior and warnings. This requires reading context; matching headings alone is not enough.

## Safer display rule
If twelve files are named `00_reference_sample.txt`, keep their original source paths and identifiers. Show a clear visible label such as `MySQL SQL — reference sample` or `Apache Spark SQL — reference sample` so a beginner knows which dialect will open. Do not rewrite the underlying examples just to make the titles different.

## Change log and rollback
For any approved removal, preserve a mapping from old ID to the surviving record, compare cross-language coverage, update search indexes, and check deep links. Back up before removing large groups. Do not automatically delete records solely because their text hashes match.

## Verification
Search for the original generic title. Results should remain discoverable and distinguishable. Open different dialects and confirm the original examples and source contexts remain intact.
