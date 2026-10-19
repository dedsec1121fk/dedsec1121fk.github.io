#!/usr/bin/env python3
"""Offline audit of bilingual lesson depth, overlay parity and website wiring.

Run: python scripts/audit_knowledge_depth.py
Use --strict to fail while shallow lessons or substantial repeated paragraphs remain.
No GitHub Actions or network calls are required.
"""
from __future__ import annotations
from collections import Counter, defaultdict
from audit_termux_sync import audit_termux_sync
from offline_curate_knowledge import key as topic_key
from pathlib import Path
import argparse
import hashlib
import json
import re
import sys

BASE = Path(__file__).resolve().parents[1]
DATA = BASE / "DedSec-Project-Website" / "data"
ARCHIVE = BASE / "Developer's Mind" / "Keep Programming Alive"
SITE = BASE / "DedSec-Project-Website" / "index.html"
LOCALES = {"en": ("ARCHIVE_EN", "English"), "el": ("ARCHIVE_EL", "Greek")}
EXT_RE = re.compile(
    r"window\.ARCHIVE_LESSON_EXTENSIONS=\(window\.ARCHIVE_LESSON_EXTENSIONS\|\|\[\]\)\.concat\((\[.*\])\);\s*$",
    re.S,
)
THRESHOLD = 1500
# Mark generic catalogue scaffolds for editorial repair; never "fix" these by
# padding the same text into every page.
GENERIC_SCAFFOLD_PATTERNS = (
    re.compile(r"(?m)^## (?:A syntax anchor you can actually inspect|Build the language-specific lab|Three challenges)\s*$"),
    re.compile(r"(?m)^## (?:Αφετηρία σύνταξης|Εξειδικευμένη άσκηση|Τρεις ασκήσεις με κριτήρια)\s*$"),
)
def inspect_fences(body: str) -> tuple[bool, bool]:
    """Return (has_fence, all_closed) based on Markdown fence *lines*.

    Literal tildes in prose and inline code are not fence delimiters.
    """
    opening = None
    found = False
    for line in body.splitlines():
        match = re.match(r"^ {0,3}(`{3,}|~{3,})(.*)$", line)
        if not match:
            continue
        fence, rest = match.groups()
        if opening is None:
            if fence[0] == "`" and "`" in rest:
                continue
            opening = (fence[0], len(fence))
            found = True
        elif fence[0] == opening[0] and len(fence) >= opening[1] and not rest.strip():
            opening = None
    return found, opening is None


def read_index(code: str, variable: str) -> list[dict]:
    raw = (DATA / (code + ".js")).read_text(encoding="utf-8")
    match = re.fullmatch(r"\s*window\." + variable + r"\s*=\s*(\[.*\])\s*;\s*", raw, re.S)
    if not match:
        raise ValueError("Unparseable index: " + code)
    return json.loads(match.group(1))

def normalize(s: str) -> str:
    return " ".join(s.casefold().split())

def audit() -> tuple[dict, list[str]]:
    errors = []
    report = {"threshold_characters": THRESHOLD, "locales": {}, "overlay_files": 0,
              "overlays": 0, "unpaired_ids": [], "repeated_paragraphs": [],
              "template_padding": {}, "empty_sections": {}}
    html = SITE.read_text(encoding="utf-8")
    apply_tag = 'src="data/apply-lesson-expansions.js"'
    apply_pos = html.find(apply_tag)
    if apply_pos < 0:
        errors.append("Missing apply-lesson-expansions.js in website")
    extensions = {}
    for path in sorted(DATA.glob("lesson-expansions-*.js")):
        if path.name == "lesson-expansions-termux-curated.js":
            continue  # Dedicated Termux catalogue is validated independently.
        report["overlay_files"] += 1
        tag = 'src="data/' + path.name + '"'
        pos = html.find(tag)
        if pos < 0 or (apply_pos >= 0 and pos > apply_pos):
            errors.append("Overlay missing or loaded after apply: " + path.name)
        match = EXT_RE.search(path.read_text(encoding="utf-8"))
        if not match:
            errors.append("Malformed overlay JSON: " + path.name)
            continue
        for patch in json.loads(match.group(1)):
            key = (patch.get("l"), patch.get("p"))
            if key in extensions:
                errors.append("Duplicate overlay key: " + repr(key))
            extensions[key] = patch
            if patch.get("mode") not in (None, "append", "replace"):
                errors.append("Unexpected patch mode: " + repr(key))
            if len(patch.get("append", "").strip()) < 450:
                errors.append("Overlay shorter than application minimum: " + repr(key))
    report["overlays"] = len(extensions)
    termux_report, termux_errors = audit_termux_sync(DATA, html)
    report["termux_catalogue_sync"] = termux_report
    errors.extend(termux_errors)
    records = {}
    paragraphs = defaultdict(list)
    for code, (variable, folder) in LOCALES.items():
        rows = read_index(code, variable)
        records[code] = rows
        seen = set()
        shallow = []
        patched = 0
        untested = []
        template_padding = []
        generic_scaffolds = []
        empty_sections = []
        markdown = 0
        for row in rows:
            path = row.get("p", "")
            if path in seen:
                errors.append("Duplicate index path: " + code + "/" + path)
            seen.add(path)
            key = (code, path)
            body = row.get("b", "").strip()
            if key in extensions:
                patch = extensions[key]
                addition = patch["append"].strip()
                body = addition if patch.get("mode") == "replace" else body + "\n\n" + addition
                patched += 1
                if path.endswith(".md"):
                    exported = ARCHIVE / folder / path
                    if not exported.exists():
                        errors.append("Missing exported Markdown: " + str(exported))
                    elif exported.read_text(encoding="utf-8").strip() != body:
                        errors.append("Overlay/Markdown mismatch: " + code + "/" + path)
            if not path.endswith(".md"):
                continue
            markdown += 1
            if len(body) < THRESHOLD:
                shallow.append({"path": path, "characters": len(body)})
            exported = ARCHIVE / folder / path
            if not exported.exists():
                errors.append("Missing archive Markdown: " + code + "/" + path)
            elif exported.read_text(encoding="utf-8").strip() != body:
                errors.append("Archive/index effective-body mismatch: " + code + "/" + path)
            if re.search(r"(?im)(?:Source cue for|Validation for .*\.md|investigation [1-9]|Αφετηρία για|Επαλήθευση για .*\.md|διερεύνηση [1-9])", body):
                template_padding.append(path)
            if any(pattern.search(body) for pattern in GENERIC_SCAFFOLD_PATTERNS):
                generic_scaffolds.append(path)
            if re.search(r"(?m)^## [^\n]+\n[ \t]*\n(?=## |\Z)", body):
                empty_sections.append(path)
            has_fence, is_balanced = inspect_fences(body)
            if not is_balanced:
                errors.append("Unclosed fenced code block: " + code + "/" + path)
            if not has_fence:
                untested.append(path)
            for part in re.split(r"\n\s*\n", body):
                plain = normalize(part)
                if len(plain) < 140 or plain.startswith(("~~~", chr(96) * 3)):
                    continue
                digest = hashlib.sha256(plain.encode()).hexdigest()
                paragraphs[(code, digest)].append(path)
        report["locales"][code] = {
            "records": len(rows), "markdown": markdown, "patched": patched,
            "under_threshold": len(shallow), "without_code_fences": len(untested),
            "template_padding": len(template_padding), "template_examples": template_padding[:25],
            "generic_scaffolds": len(generic_scaffolds),
            "generic_scaffold_examples": generic_scaffolds[:40],
            "empty_sections": len(empty_sections), "empty_section_examples": empty_sections[:25],
            "shortest": sorted(shallow, key=lambda r: r["characters"])[:25],
        }
    for key in extensions:
        code, path = key
        if code not in records or not any(row.get("p") == path for row in records[code]):
            errors.append("Overlay points to missing index record: " + repr(key))
    if len(records["en"]) != len(records["el"]):
        errors.append("English/Greek index record counts differ")
    # English and Greek originally used independent numeric insertion orders.
    # Pair the curated archive by stable topic/path identity instead of IDs.
    en_topics = {topic_key(row) for row in records["en"]}
    el_topics = {topic_key(row) for row in records["el"]}
    report["unpaired_ids"] = sorted(en_topics ^ el_topics)
    if report["unpaired_ids"]:
        errors.append("Unpaired English/Greek topic paths")
    repeats = []
    for (code, digest), paths in paragraphs.items():
        unique = sorted(set(paths))
        if len(unique) > 1:
            repeats.append({"locale": code, "count": len(unique), "paths": unique[:8]})
    report["repeated_paragraphs"] = sorted(repeats, key=lambda x: -x["count"])[:30]
    report["repeated_paragraph_groups"] = len(repeats)
    return report, errors

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--strict", action="store_true")
    args = parser.parse_args()
    try:
        report, errors = audit()
    except (ValueError, OSError, json.JSONDecodeError) as exc:
        print("AUDIT_FAILED:", exc, file=sys.stderr)
        sys.exit(2)
    report["structural_errors"] = errors
    print(json.dumps(report, ensure_ascii=False, indent=2))
    if errors:
        sys.exit(2)
    if args.strict and (report["repeated_paragraph_groups"] or
                        any(x["under_threshold"] or x["template_padding"] or
                            x["generic_scaffolds"] or x["empty_sections"]
                            for x in report["locales"].values())):
        sys.exit(1)
