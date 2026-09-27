#!/usr/bin/env python3
"""Prepare an exact, directly publishable mirror repository tree.

Unlike the older helper, this script builds the same files that will be pushed.
The output therefore already contains repository-aware URLs and can work with
GitHub Pages whether the repository uses Actions deployment or branch serving.
"""
from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
from pathlib import Path

TARGETS = {
    "dedsec1121fk/dedsec1121fk.github.io": {"cname": "ded-sec.space"},
    "sal-scar/ded-sec": {"cname": "ded-sec.online"},
    "dedsec1121fk/test": {"cname": None},
    "DedSec-Project-Official/Test": {"cname": None},
}


def copy_tooling(source: Path, output: Path) -> None:
    """Restore build tooling and the Pages workflow after producing the site."""
    scripts_source = source / "scripts"
    scripts_output = output / "scripts"
    if scripts_source.exists():
        if scripts_output.exists():
            shutil.rmtree(scripts_output)
        shutil.copytree(scripts_source, scripts_output, ignore=shutil.ignore_patterns("__pycache__", "*.pyc"))

    source_workflows = source / ".github" / "workflows"
    output_workflows = output / ".github" / "workflows"
    output_workflows.mkdir(parents=True, exist_ok=True)
    for name in ("static.yml", "DEPLOYMENT.md"):
        candidate = source_workflows / name
        if candidate.exists():
            shutil.copy2(candidate, output_workflows / name)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--repository", required=True)
    parser.add_argument("--source", default=".")
    parser.add_argument("--output", required=True)
    args = parser.parse_args()

    if args.repository not in TARGETS:
        raise SystemExit(f"Unsupported mirror: {args.repository}")

    source = Path(args.source).resolve()
    output = Path(args.output).resolve()
    builder = source / "scripts" / "build_for_repository.py"
    validator = source / "scripts" / "validate_site.py"
    if not builder.exists() or not validator.exists():
        raise SystemExit("Required repository build scripts are missing.")

    if output.exists():
        shutil.rmtree(output)

    subprocess.run(
        [sys.executable, str(builder), "--repository", args.repository, "--source", str(source), "--output", str(output)],
        check=True,
    )
    subprocess.run(
        [sys.executable, str(validator), "--root", str(output), "--repository", args.repository],
        check=True,
    )

    copy_tooling(source, output)


    (output / "Other Files").mkdir(parents=True, exist_ok=True)
    (output / "Other Files" / "mirror-origin.json").write_text(
        json.dumps(
            {
                "source": "dedsec1121fk/dedsec1121fk.github.io",
                "target": args.repository,
                "prepared_as_deployable_site": True,
            },
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
