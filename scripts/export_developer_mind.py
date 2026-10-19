#!/usr/bin/env python3
"""Rehydrate the provided Developer Mind language archive from its existing
DedSec knowledge indexes. No internet, generated filler, or duplicates.
The indexes are sourced from the uploaded Developer-Mind-Project ZIP.
"""
from __future__ import annotations
from pathlib import Path, PurePosixPath
import hashlib
import json
import re

BASE=Path(__file__).resolve().parents[1]
ROOT=BASE/"Developer's Mind"/"Keep Programming Alive"
DATA=BASE/"DedSec-Project-Website"/"data"
SAFE_OWNER=re.compile(r"dedsec1121fk",re.I)
SENSITIVE_NAME=re.compile(r"\bLoukas\s+Floros\b",re.I)
PRIVATE_MAIL=re.compile(r"(?i)\b[\w.+-]+@(?:gmail|yahoo|outlook|hotmail)\.com\b")
PHONE=re.compile(r"\+30[\s.-]?6(?:[\s.-]?\d){9}")
langs=[("English","en","ARCHIVE_EN"),("Greek","el","ARCHIVE_EL")]
# Overlay patches extend the same stable source record; they are not new lessons.
EXTENSION_FILES = sorted(
    path for path in DATA.glob("lesson-expansions-*.js")
    if path.name != "lesson-expansions-termux-curated.js"
)
# Curated Termux lessons are an ARCHIVE_TERMUX IIFE, not regular overlays.
extensions = {}
for file in EXTENSION_FILES:
    raw = file.read_text(encoding="utf-8")
    parsed = re.search(
        r"window\.ARCHIVE_LESSON_EXTENSIONS=\(window\.ARCHIVE_LESSON_EXTENSIONS\|\|\[\]\)\.concat\((\[.*\])\);\s*$",
        raw, re.S,
    )
    if not parsed:
        raise SystemExit("Malformed lesson expansion: " + str(file))
    for item in json.loads(parsed.group(1)):
        key = (item["l"], item["p"])
        extra = item["append"].strip()
        if key in extensions or len(extra) < 450:
            raise SystemExit("Duplicate or content-free lesson expansion: " + str(key))
        mode = item.get("mode", "append")
        if mode not in ("append", "replace"):
            raise SystemExit("Unsupported lesson expansion mode: " + str(key))
        extensions[key] = (extra, mode == "replace")
matched_extensions = set()
count={}
for folder,lang,global_name in langs:
    source=(DATA/(lang+".js")).read_text(encoding="utf-8")
    match=re.fullmatch(r"\s*window\."+global_name+r"\s*=\s*(\[.*\])\s*;\s*",source,re.S)
    if not match:
        raise SystemExit("Malformed indexed archive: "+lang)
    rows=json.loads(match.group(1))
    done=set(); bodies=set(); produced=0
    for record in rows:
        path=PurePosixPath(str(record.get("p","")))
        if not path.parts or path.is_absolute() or ".." in path.parts:
            raise SystemExit("Unsafe archive path: "+str(path))
        # The indexed corpus also preserves original .py, .sh, .txt, .js,
        # SQL, and many other plain-text source exercises. Export them intact.
        rel=path.as_posix().casefold()
        body=str(record.get("b","")).replace("\r\n","\n").strip()
        key = (lang, path.as_posix())
        if key in extensions:
            extra, replace = extensions[key]
            if replace:
                body = extra
            elif extra not in body:
                body += "\n\n" + extra
            matched_extensions.add(key)
        if not body or rel in done:
            if rel in done: raise SystemExit("Duplicate source path: "+rel)
            continue
        body=SAFE_OWNER.sub("ANONYMOUS_MAINTAINER",body)
        body=SENSITIVE_NAME.sub("ANONYMOUS_MAINTAINER",body)
        body=PRIVATE_MAIL.sub("[redacted-email]",body)
        body=PHONE.sub("[redacted-phone]",body)
        digest=hashlib.sha256(" ".join(body.casefold().split()).encode()).hexdigest()
        if digest in bodies:
            print("SKIP_DUPLICATE_BODY:",lang,path.as_posix())
            continue
        done.add(rel);bodies.add(digest)
        dst=ROOT/folder/path.as_posix()
        dst.parent.mkdir(parents=True,exist_ok=True)
        content=body+"\n"
        if not dst.exists() or dst.read_text(encoding="utf-8")!=content:
            dst.write_text(content,encoding="utf-8")
        produced+=1
    count[folder]=produced
    manifest=BASE/"Documentation"/"OFFLINE_CURATION_MANIFEST.json"
    if manifest.is_file():
        expected=json.loads(manifest.read_text(encoding="utf-8"))["retained_records_per_language"][lang]
        if produced!=expected:
            raise SystemExit("Curated archive export count mismatch: "+str((lang,produced,expected)))
    elif produced<1100:
        raise SystemExit("Unexpected incomplete lessons: "+str(count))

if set(extensions) != matched_extensions:
    raise SystemExit("Extensions reference nonexistent source paths: " + repr(sorted(set(extensions) - matched_extensions)))

manifest={
    "source":"Curated bilingual offline archive supplied by the user; consolidated topic-paired website indexes",
    "source_rule":"Canonical website bodies and retained source files; no synthetic padding.",
    "privacy":"Owner handles, personal names, personal mail and phone strings redacted.",
    "files_imported":count,
    "limit":"Only indexed, textual source files are re-exported; pre-existing supplemental files and binaries are left unchanged.",
    "expanded_existing_lessons":len(matched_extensions),
}
manifest_path=BASE/"Developer's Mind"/"IMPORT_MANIFEST.json"
manifest_path.write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print("DEV_MIND_EXPORT_PASS:",sum(count.values()),"original bilingual lessons:",count)
