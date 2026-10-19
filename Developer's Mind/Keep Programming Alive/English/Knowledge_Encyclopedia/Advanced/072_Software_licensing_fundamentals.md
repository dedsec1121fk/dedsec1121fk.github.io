# Software licensing — traceable release inventory, not a guessed permission

## Distribution problem
A source repository may contain code written by its owner, third-party dependencies, artwork, fonts and bundled binaries. Visibility of source code does not automatically grant redistribution rights, and a copyright statement is not a substitute for an explicit license grant. Before preparing an archive, maintain an inventory identifying every shipped component, version or provenance, license documentation, notices and whether distribution has been reviewed. Unknown is a blocker for review, not a synonym for MIT or public domain.

## Executable inventory completeness check
Save as license_lab.py and run python3 license_lab.py. The sample uses fabricated component records; it does not fetch third-party code or pronounce any license legally sufficient.

~~~python
def inventory(entries):
    seen, problems = set(), []
    for e in entries:
        name = e.get("name")
        if not name or name in seen:
            problems.append("missing/duplicate component")
        seen.add(name)
        if e.get("origin") == "third-party":
            if not e.get("license_id") or e["license_id"] == "UNKNOWN":
                problems.append("unknown license: " + str(name))
            if not e.get("notice"):
                problems.append("missing notice: " + str(name))
    return problems

good = [
    {"name":"main","origin":"owned"},
    {"name":"helper","origin":"third-party","license_id":"MIT","notice":"fixture notice"},
]
assert inventory(good) == []
bad = good + [{"name":"art","origin":"third-party","license_id":"UNKNOWN","notice":""}]
assert len(inventory(bad)) == 2
print("PASS: missing license and notice detected")
~~~

## What automation can realistically determine
The function checks for duplicate or missing component identifiers, and flags missing license identifiers and notices for items marked third-party. It cannot decide whether the recorded identifier matches the actual source, whether a particular commercial use is permitted, or whether source-offer, attribution, patents, trademarks or copyleft distribution obligations have been satisfied. These issues require reviewing the real terms and the exact redistributed artifacts. Keep a list of excluded build-time packages separate from included runtime files.

## Bounded audit exercises
1. Add a copied image asset with UNKNOWN license and no notice. Confirm two separate problems; do not replace UNKNOWN with a guessed license just to satisfy the script.
2. Introduce two components with the same inventory name but different versions. Explain why unique full identifiers are necessary to avoid missed obligations.
3. Compare source-only distribution with shipping a compiled bundle that includes a library. Identify how the required inventory changes.
4. Create a third-party-notices file for a *synthetic* MIT-licensed helper and verify it is included in a trial archive. The completeness checker alone does not validate the notice's legal text.

**Evidence:** PASS, inventory entries for code/assets/dependencies, open compliance questions and a documented human review step. This is operational education, not legal advice.
