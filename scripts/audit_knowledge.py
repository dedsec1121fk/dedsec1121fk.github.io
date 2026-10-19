#!/usr/bin/env python3
"""Read and audit *every* archive record and body line without changing source files.

For duplicates, preserve distinct reference contexts and show the original paths.
Fail on true duplicate full bodies inside a locale, duplicate IDs/paths,
missing substantive lesson descriptions and unbalanced translations.
"""
from __future__ import annotations
from collections import Counter, defaultdict
from audit_termux_sync import audit_termux_sync
from offline_curate_knowledge import key as topic_key
from pathlib import Path
import hashlib, json, re, sys

REPO_ROOT = Path(__file__).resolve().parents[1]
ROOT = REPO_ROOT / "DedSec-Project-Website"
SOURCES = {"en": "data/en.js", "el": "data/el.js", "methods": "data/methods.js"}
LANG = {"en": "en", "el": "el"}
report = {"records": {}, "total_records": 0, "lines_reviewed": 0, "violations": [], "title_collisions": {}}

def norm(s: str) -> str:
    return " ".join(s.casefold().split())

def body_lines(s: str) -> list[str]:
    return s.replace("\r\n", "\n").replace("\r", "\n").splitlines()

def check_locale(code: str, rows: list[dict]):
    ids, paths = set(), set()
    groups = defaultdict(list)
    titles = defaultdict(list)
    suspicious_line_repeats = []
    checked_lines = 0
    for i, doc in enumerate(rows):
        ident, path, title, body = (doc.get(x, "") for x in ("id", "p", "t", "b"))
        origin = f"{code}[{i}] {path}"
        if not all(isinstance(x, str) and x.strip() for x in (ident, path, title, body)):
            report["violations"].append(f"Empty or invalid record field: {origin}")
            continue
        if ident in ids:
            report["violations"].append(f"Duplicate record ID: {ident}")
        ids.add(ident)
        if path in paths:
            report["violations"].append(f"Duplicate source path: {origin}")
        paths.add(path)
        if code in LANG and doc.get("l") != LANG[code]:
            report["violations"].append(f"Wrong locale at {origin}")
        lines = body_lines(body)
        checked_lines += len(lines)
        # Examine every non-blank body line and report suspicious local repetition;
        # headings/very short programming primitives can repeat legitimately.
        text = [norm(line) for line in lines if len(line.strip()) >= 65 and not line.lstrip().startswith(("import ", "from ", "#", "//", "--"))]
        duplicates = [line for line, n in Counter(text).items() if n > 1]
        if duplicates:
            suspicious_line_repeats.append({"id": ident, "path": path, "count": len(duplicates)})
        groups[norm(body)].append(path)
        titles[norm(title)].append(path)
        if path.startswith("Practical_Script_Labs/") and path.endswith(".md") and path != "Practical_Script_Labs/00_INDEX.md":
            # Consolidated labs may reference several adjacent runnable .py files.
            source_names = set(re.findall(r"[0-9]{2}_[\w]+\.py", body))
            available = all((REPO_ROOT / "Developer's Mind" / "Keep Programming Alive" / ("English" if code=="en" else "Greek") / "Practical_Script_Labs" / file).exists() for file in source_names)
            if len(body) < 1500 or (not source_names and "Working source:" not in body) or not available:
                report["violations"].append(f"Practical lab missing explanation or referenced source file: {origin}")
    full_dups = [v for v in groups.values() if len(v) > 1]
    for paths_for_same_body in full_dups:
        report["violations"].append(f"Exact duplicate body [{code}]: {paths_for_same_body}")
    # Audit exactly what the UI displays. The same generic filename can
    # legitimately appear in multiple programming languages, but the rendered
    # title must reveal its source and be unique within each language.
    rendered = defaultdict(list)
    for doc in rows:
        if not isinstance(doc.get("t"), str) or not isinstance(doc.get("p"), str):
            continue
        title = doc["t"].strip()
        if len(titles[norm(title)]) > 1:
            directories = [part.replace("_", " ") for part in doc["p"].split("/")[:-1] if part]
            context = " / ".join(directories[-2:])
            if context:
                title = context + " — " + title
        rendered[norm(title)].append(doc["p"])
    visible_dups = [same for same in rendered.values() if len(same) > 1]
    report.setdefault("rendered_title_collisions", {})[code] = len(visible_dups)
    for same in visible_dups[:12]:
        report["violations"].append(f"Duplicate user-visible knowledge title [{code}]: {same}")
    title_collisions = [v for v in titles.values() if len(v) > 1]
    report["title_collisions"][code] = len(title_collisions)
    report["records"][code] = {
        "entries": len(rows), "lines_reviewed": checked_lines,
        "unique_source_paths": len(paths), "unique_bodies": len(groups),
        "full_body_duplicate_groups": len(full_dups),
        "title_collision_groups": len(title_collisions),
        "potential_repeated_long_lines": suspicious_line_repeats[:25],
    }
    report["total_records"] += len(rows)
    report["lines_reviewed"] += checked_lines

for code, name in SOURCES.items():
    txt = (ROOT / name).read_text(encoding="utf-8")
    data = json.loads(txt[txt.index("=")+1:].strip().rstrip(";"))
    if not isinstance(data, list):
        report["violations"].append("Not a JSON record list: " + name)
        continue
    check_locale(code, data)
if report["records"].get("en", {}).get("entries") != report["records"].get("el", {}).get("entries"):
    report["violations"].append("English and Greek corpus sizes do not match")
if report["records"].get("methods", {}).get("entries") != 30:
    report["violations"].append("Bilingual reasoning corpus must contain 30 distinct entries")
# Check that targeted extensions do not create extra pages or repeated near-copy blocks.
extensions = {}
extension_modes = {}
for filename in sorted(ROOT.glob("data/lesson-expansions-*.js")):
    if filename.name == "lesson-expansions-termux-curated.js":
        continue  # Dedicated ARCHIVE_TERMUX index; validated separately below.
    raw = filename.read_text(encoding="utf-8")
    found = re.search(
        r"window\.ARCHIVE_LESSON_EXTENSIONS=\(window\.ARCHIVE_LESSON_EXTENSIONS\|\|\[\]\)\.concat\((\[.*\])\);\s*$",
        raw, re.S)
    if not found:
        report["violations"].append("Unparseable lesson extension file: " + str(filename))
        continue
    for item in json.loads(found.group(1)):
        key = (item.get("l"), item.get("p"))
        value = item.get("append", "").strip()
        if key in extensions:
            report["violations"].append("Duplicate targeted source extension: " + repr(key))
        if len(value) < 450 or value.count("## ") < 1:
            report["violations"].append("Shallow targeted lesson extension: " + repr(key))
        mode = item.get("mode", "append")
        if mode not in ("append", "replace"):
            report["violations"].append("Unknown enrichment mode: " + repr((key, mode)))
        extension_modes[key] = mode
        extensions[key] = value
for language in ("en","el"):
    basefile = ROOT / "data" / (language + ".js")
    raw = basefile.read_text(encoding="utf-8")
    rows = json.loads(re.search(r"window\.ARCHIVE_(?:EN|EL)\s*=\s*(\[.*\])\s*;\s*$", raw, re.S).group(1))
    available = {row["p"] for row in rows}
    for (loc,path),extra in extensions.items():
        if loc == language and path not in available:
            report["violations"].append("Nonexistent target; use existing lesson: " + path)
en_count = sum(loc=="en" for loc,_ in extensions)
el_count = sum(loc=="el" for loc,_ in extensions)
curated_manifest = REPO_ROOT / "Documentation" / "OFFLINE_CURATION_MANIFEST.json"
if curated_manifest.exists():
    evidence = json.loads(curated_manifest.read_text(encoding="utf-8"))
    for locale in ("en", "el"):
        expected = evidence["retained_records_per_language"][locale]
        if report["records"].get(locale, {}).get("entries") != expected:
            report["violations"].append("Curated index count disagrees with manifest: " + locale)
else:
    if en_count < 13 or el_count < 13:
        report["violations"].append("At least 13 substantive extensions are required per language")
report["expanded_existing_lessons_by_locale"] = {"en": en_count, "el": el_count}
# Reject recurring large paragraphs in locale-specific overlays, not only whole-body clones.
paragraph_sources = defaultdict(list)
for (locale, source_path), lesson in extensions.items():
    for paragraph in re.split(r"\n\s*\n", lesson):
        snippet = paragraph.strip()
        if len(snippet) > 100 and "~~~" not in snippet:
            paragraph_sources[(locale, norm(snippet))].append(source_path)
for (locale, paragraph), paths in paragraph_sources.items():
    if len(set(paths)) > 1:
        report["violations"].append("Repeated substantive paragraph in "+locale+": "+repr(paths[:8]))
normalized = [norm(v) for v in extensions.values()]
if len(set(normalized)) != len(normalized):
    report["violations"].append("Identical enrichment blocks are forbidden")
report["expanded_existing_lessons"] = {"en":en_count,"el":el_count,"added_pages":0}
termux_report, termux_errors = audit_termux_sync(ROOT / "data", (ROOT / "index.html").read_text(encoding="utf-8"))
report["termux_catalogue_sync"] = termux_report
report["violations"].extend(termux_errors)

# Source-archive coverage is a separate quality requirement from unique indexed titles.
# A glossary definition may be appropriately short; empty lesson scaffolds cannot pass.
ARCHIVE = REPO_ROOT / "Developer's Mind" / "Keep Programming Alive"
quality = {}
for locale in ("English", "Greek"):
    folder = ARCHIVE / locale
    documents = sorted(folder.rglob("*.md")) if folder.exists() else []
    empty_scaffolds = []
    for file in documents:
        body = file.read_text(encoding="utf-8")
        relative = file.relative_to(folder).as_posix()
        prose = [
            line.strip() for line in body.splitlines()
            if line.strip() and not line.lstrip().startswith(("#", "---", "~~~", "```"))
        ]
        substantive = " ".join(prose)
        is_mastery = file.name.startswith("03_") and (
            "MASTERY_PATHWAY" in file.name or "ΔΙΑΔΡΟΜΗ_ΕΞΑΣΚΗΣΗΣ" in file.name
        )
        if is_mastery and len(substantive) < 160:
            empty_scaffolds.append(relative)
    quality[locale] = {
        "markdown_files": len(documents),
        "under_500_bytes": sum(file.stat().st_size < 500 for file in documents),
        "under_1000_bytes": sum(file.stat().st_size < 1000 for file in documents),
        "empty_mastery_paths": empty_scaffolds,
        "empty_mastery_count": len(empty_scaffolds),
    }
report["archive_quality"] = quality
# Cross-check every existing enrichment record against the matching checked-in
# bilingual archive file. This does not add pages, and does not infer success
# merely from a non-empty website card.
source_discrepancies = []
for (locale, relative_path), expected in extensions.items():
    folder = "English" if locale == "en" else "Greek"
    archive_file = ARCHIVE / folder / relative_path
    if not archive_file.is_file():
        source_discrepancies.append("Missing archive file: " + folder + "/" + relative_path)
        continue
    actual = archive_file.read_text(encoding="utf-8").strip()
    if extension_modes.get((locale, relative_path)) == "replace":
        if actual != expected:
            source_discrepancies.append("Site/archive replacement mismatch: " + folder + "/" + relative_path)
    elif not actual.endswith(expected):
        source_discrepancies.append("Site/archive appended lesson mismatch: " + folder + "/" + relative_path)
report["source_consistency"] = {
    "enrichments_checked": len(extensions),
    "mismatch_count": len(source_discrepancies),
    "mismatches": source_discrepancies[:100],
}
report["remaining_short_content"] = {
    locale: q["under_1000_bytes"] for locale, q in quality.items()
}

report["completion_gate"] = {
    "status": "pending",
    "remaining_empty_mastery_scaffolds": sum(q["empty_mastery_count"] for q in quality.values()),
    "remaining_short_markdown_documents": sum(q["under_1000_bytes"] for q in quality.values()),
    "site_archive_mismatches": len(source_discrepancies),
    "note": "Never declare comprehensive completion solely from page counts or clean scaffolds. Full subject-specific editorial review, code execution and browser regression checks still require evidence.",
}
if "--require-complete" in sys.argv:
    for locale, q in quality.items():
        for source_path in q["empty_mastery_paths"]:
            report["violations"].append(f"Unfinished {locale} mastery pathway: {source_path}")
        if q["under_1000_bytes"]:
            report["violations"].append(f"{q['under_1000_bytes']} {locale} Markdown files still under 1000 bytes; review for substantive content")
    for detail in source_discrepancies:
        report["violations"].append(detail)
    # The final review ledger must cover every Markdown file at its current
    # SHA-256, so an old approval cannot silently survive later source edits.
    ledger_path = REPO_ROOT / "Documentation" / "KNOWLEDGE_FINAL_REVIEW.json"
    if not ledger_path.is_file():
        report["violations"].append("Missing independent final-review ledger: Documentation/KNOWLEDGE_FINAL_REVIEW.json")
    else:
        try:
            ledger = json.loads(ledger_path.read_text(encoding="utf-8"))
            approved = ledger.get("reviewed_markdown_sha256", {})
            for locale in ("English", "Greek"):
                for document in sorted((ARCHIVE / locale).rglob("*.md")):
                    relative = document.relative_to(REPO_ROOT).as_posix()
                    digest = hashlib.sha256(document.read_bytes()).hexdigest()
                    if approved.get(relative) != digest:
                        report["violations"].append("Missing/stale editorial review: " + relative)
            for proof in ("code_examples_executed", "browser_mobile_checked",
                          "browser_desktop_checked", "offline_mode_checked",
                          "english_greek_content_reviewed", "links_reviewed"):
                if ledger.get(proof) is not True:
                    report["violations"].append("Missing final test evidence: " + proof)
        except (ValueError, TypeError, OSError) as exc:
            report["violations"].append("Invalid final-review ledger: " + str(exc))

output = REPO_ROOT / "Documentation" / "KNOWLEDGE_AUDIT.json"
output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"Audited {report['total_records']} individual documents and {report['lines_reviewed']} source lines")
for code, info in report["records"].items():
    print(f"{code}: {info['entries']} docs, {info['unique_bodies']} unique bodies, {info['title_collision_groups']} legitimate/inspectable title collisions")
if report["violations"]:
    print("Errors:\n" + "\n".join(report["violations"]), file=sys.stderr)
    sys.exit(1)
print("KNOWLEDGE_AUDIT_PASS: zero duplicate full bodies, unique IDs and paths; per-row results saved")
