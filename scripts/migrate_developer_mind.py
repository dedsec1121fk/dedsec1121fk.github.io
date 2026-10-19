#!/usr/bin/env python3
"""Copy and verify a complete locally available Developer Mind source checkout.

Usage:
  python3 scripts/migrate_developer_mind.py /path/to/Developer-Mind-Project
  python3 scripts/migrate_developer_mind.py --verify /path/to/Developer-Mind-Project

Never clones a private repository, performs account authentication or deletes sources.
All output is under source/ inside the Test checkout. Python stdlib only.
"""
import argparse
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "source" / "developer-mind"
MANIFEST = ROOT / "source" / "developer-mind-manifest.json"
SKIP = {".git", "__pycache__", ".pytest_cache", ".DS_Store"}

def digest(path):
    h = hashlib.sha256()
    with path.open("rb") as f:
        for block in iter(lambda: f.read(1024 * 1024), b""):
            h.update(block)
    return h.hexdigest()

def inventory(directory):
    answer = {}
    for path in sorted(directory.rglob("*")):
        rel = path.relative_to(directory)
        if any(part in SKIP for part in rel.parts):
            continue
        if path.is_symlink():
            raise ValueError("Symlink requires manual review: " + str(rel))
        if path.is_file():
            answer[rel.as_posix()] = {"sha256": digest(path), "bytes": path.stat().st_size}
    return answer

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--verify", action="store_true")
    parser.add_argument("source", type=Path, help="Existing local checkout of the private repository")
    args = parser.parse_args()
    source = args.source.expanduser().resolve()
    if not source.is_dir() or not (source / "Keep Programming Alive").is_dir():
        parser.error("Not a complete Developer Mind source checkout")
    if source == ROOT or ROOT in source.parents or source in ROOT.parents:
        parser.error("Source and destination must be separate repositories")
    recorded = inventory(source)
    if not recorded:
        parser.error("Source appears empty")
    if args.verify:
        if not MANIFEST.is_file() or not TARGET.is_dir():
            parser.error("No migrated archive to verify")
        saved = json.loads(MANIFEST.read_text(encoding="utf-8"))
        copied = inventory(TARGET)
        if saved.get("files") != recorded or copied != recorded:
            raise SystemExit("Mismatch: source, manifest and archive are not identical")
        print("VERIFIED:", len(recorded), "source files match SHA-256 hashes")
        return
    if TARGET.exists() or MANIFEST.exists():
        parser.error("Archive already exists: verify it first; do not silently overwrite")
    TARGET.parent.mkdir(parents=True, exist_ok=True)
    shutil.copytree(source, TARGET, ignore=shutil.ignore_patterns(".git", "__pycache__", ".pytest_cache", ".DS_Store"))
    copied = inventory(TARGET)
    if copied != recorded:
        shutil.rmtree(TARGET)
        raise SystemExit("Copy verification failed; copied source removed, original untouched")
    sha = None
    if (source / ".git").exists():
        try:
            sha = subprocess.check_output(["git", "-C", str(source), "rev-parse", "HEAD"], text=True, timeout=8).strip()
        except Exception:
            pass
    MANIFEST.write_text(json.dumps({"origin": "Developer-Mind-Project", "source_commit": sha, "file_count": len(recorded), "files": recorded}, ensure_ascii=False, sort_keys=True, indent=2) + "\n", encoding="utf-8")
    print("COPIED AND VERIFIED:", len(recorded), "files; original source unchanged")
    print("Review for sensitive content and licenses before any public promotion.")

if __name__ == "__main__":
    main()
