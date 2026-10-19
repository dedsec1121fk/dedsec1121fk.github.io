#!/usr/bin/env python3
"""Audit the dedicated Termux catalogue sync, which is not an EN/EL lesson overlay.

The Termux catalogue uses its own ARCHIVE_TERMUX index. Its curated overlay
deliberately runs as an IIFE, not ARCHIVE_LESSON_EXTENSIONS.concat([...]).
Fail on lost records, duplicate targets, incomplete translations or load order.
This is a static source/DOM-wiring check; the Chromium audit tests runtime use.
"""
from __future__ import annotations

from collections import Counter
from pathlib import Path
import json
import re


def audit_termux_sync(data_dir: Path, html: str) -> tuple[dict, list[str]]:
    problems: list[str] = []
    patch_name = "lesson-expansions-termux-curated.js"
    index_name = "termux-troubleshooting.js"
    source_tag = 'src="data/' + index_name + '"'
    curated_tag = 'src="data/' + patch_name + '"'
    apply_tag = 'src="data/apply-lesson-expansions.js"'
    positions = {tag: html.find(tag) for tag in (source_tag, curated_tag, apply_tag)}
    if any(html.count(tag) != 1 for tag in positions):
        problems.append("Termux source, curated overlay and standard apply must each load once")
    if not (0 <= positions[source_tag] < positions[curated_tag] < positions[apply_tag]):
        problems.append("Incorrect Termux script loading order")
    summary = {"source_records": 0, "curated_records": 0, "locale_counts": {},
               "missing": [], "duplicate_paths": [], "min_lesson_characters": 0}
    try:
        source = (data_dir / index_name).read_text(encoding="utf-8")
        curated = (data_dir / patch_name).read_text(encoding="utf-8")
        src_match = re.fullmatch(
            r"\s*window\.ARCHIVE_TERMUX\s*=\s*(\[.*\]);\s*", source, re.S)
        patch_match = re.search(
            r"const patches=(\[.*?\]);\s*const records=window\.ARCHIVE_TERMUX\|\|\[\];",
            curated, re.S)
        if not src_match or not patch_match:
            problems.append("Termux index or IIFE patch registry is not parseable")
            return summary, problems
        source_rows = json.loads(src_match.group(1))
        patches = json.loads(patch_match.group(1))
    except (OSError, ValueError, TypeError) as exc:
        problems.append("Cannot read Termux catalogue/patch JSON: " + str(exc))
        return summary, problems
    if not isinstance(source_rows, list) or not isinstance(patches, list):
        problems.append("Termux index and patches must both be arrays")
        return summary, problems
    summary["source_records"] = len(source_rows)
    summary["curated_records"] = len(patches)
    if len(source_rows) < 32 or len(patches) < 32:
        problems.append("Termux catalogue lost one or more of its 32 reviewed records")

    def key(row: dict) -> tuple[str, str]:
        return (row.get("l"), row.get("p"))

    for label, rows in (("index", source_rows), ("curated", patches)):
        if not all(isinstance(row, dict) for row in rows):
            problems.append("Non-object Termux " + label + " entry")
            return summary, problems
        duplicates = [repr(k) for k, n in Counter(key(row) for row in rows).items() if n > 1]
        if duplicates:
            summary["duplicate_paths"].extend(label + ": " + p for p in duplicates)
            problems.append("Duplicate Termux " + label + " entries: " + ", ".join(duplicates[:6]))

    sources = {key(row): row for row in source_rows}
    enriched = {key(row): row for row in patches}
    for k in sorted(sources.keys() ^ enriched.keys(), key=repr):
        summary["missing"].append(repr(k))
    if summary["missing"]:
        problems.append("Termux catalogue/curation targets differ: " +
                        ", ".join(summary["missing"][:8]))
    counts = Counter()
    parallel = {"en": set(), "el": set()}
    lengths = []
    for item in patches:
        language, path = key(item)
        if not isinstance(language, str) or language not in parallel or not isinstance(path, str):
            problems.append("Unknown Termux locale or path")
            continue
        prefix = "Termux_Troubleshooting/" + language + "/"
        if not path.startswith(prefix) or not path.endswith(".md"):
            problems.append("Termux locale/path mismatch: " + path)
            continue
        counts[language] += 1
        parallel[language].add(path[len(prefix):])
        lesson = item.get("append")
        if not isinstance(lesson, str) or len(lesson.strip()) < 450 or not lesson.lstrip().startswith("# "):
            problems.append("Shallow or untitled Termux lesson: " + path)
        else:
            lengths.append(len(lesson.strip()))
    summary["locale_counts"] = dict(counts)
    summary["min_lesson_characters"] = min(lengths, default=0)
    if parallel["en"] != parallel["el"]:
        problems.append("Termux Greek and English lesson names are not paired")
    if counts["en"] != counts["el"] or sum(counts.values()) != len(patches):
        problems.append("Termux catalogue languages are unbalanced")
    if "window.__DEDSEC_TERMUX_SYNC__" not in curated or "matches[0].b=p.append" not in curated:
        problems.append("Termux IIFE no longer publishes sync status or replaces matched lessons")
    return summary, problems
