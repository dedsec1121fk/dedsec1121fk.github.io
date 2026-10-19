#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from xml.etree import ElementTree as ET
from urllib.parse import unquote, urlsplit

from bs4 import BeautifulSoup

CONFIGS = {
    "dedsec1121fk/dedsec1121fk.github.io": {"base": "/", "host": "ded-sec.space", "cname": "ded-sec.space", "indexable": True, "sitemap": True, "llms": True},
    "sal-scar/ded-sec": {"base": "/", "host": "ded-sec.online", "cname": "ded-sec.online", "indexable": True, "sitemap": False, "llms": False},
    "dedsec1121fk/test": {"base": "/test/", "host": "dedsec1121fk.github.io", "cname": None, "indexable": False, "sitemap": False, "llms": False},
    "DedSec-Project-Official/Test": {"base": "/Test/", "host": "dedsec-project-official.github.io", "cname": None, "indexable": False, "sitemap": False, "llms": False},
}


def args():
    p = argparse.ArgumentParser()
    p.add_argument("--root", default="_site")
    p.add_argument("--repository", required=True)
    return p.parse_args()


def resolve_local(root: Path, page: Path, value: str, base: str) -> Path | None:
    if not value or value.startswith(("#", "mailto:", "tel:", "javascript:", "data:", "//")):
        return None
    parsed = urlsplit(value)
    if parsed.scheme in {"http", "https"}:
        return None
    path = unquote(parsed.path)
    if not path:
        return None
    if path.startswith(base):
        rel = path[len(base):]
        target = root / rel
    elif path.startswith("/"):
        target = root / path.lstrip("/")
    else:
        target = (page.parent / path).resolve()
    if path.endswith("/"):
        target = target / "index.html"
    return target


def main() -> int:
    a = args()
    if a.repository not in CONFIGS:
        print("Unsupported repository", file=sys.stderr)
        return 2
    config = CONFIGS[a.repository]
    root = Path(a.root).resolve()
    issues = []
    refs = 0
    htmls = list(root.rglob("*.html"))

    for page in htmls:
        rel = page.relative_to(root).as_posix()
        soup = BeautifulSoup(page.read_text(encoding="utf-8", errors="replace"), "html.parser")
        for condition, name in [
            (not soup.title or not soup.title.get_text(strip=True), "missing title"),
            (not soup.html or not soup.html.get("lang"), "missing lang"),
            (not soup.find("meta", attrs={"name": "viewport"}), "missing viewport"),
            (not soup.find("meta", attrs={"name": "description"}), "missing description"),
            (not soup.find("meta", attrs={"name": "robots"}), "missing robots"),
            (not soup.find("link", rel="canonical"), "missing canonical"),
            (not soup.find("nav", class_="main-nav"), "missing main nav"),
            (not soup.find("footer", class_="main-footer"), "missing main footer"),
        ]:
            if condition:
                issues.append((rel, name))
        ids = [tag.get("id") for tag in soup.find_all(attrs={"id": True})]
        if len(ids) != len(set(ids)):
            issues.append((rel, "duplicate id"))
        for img in soup.find_all("img"):
            if img.get("alt") is None:
                issues.append((rel, f"image missing alt: {img.get('src')}"))
        for button in soup.find_all("button"):
            if not button.get("type"):
                issues.append((rel, "button missing type"))
        for anchor in soup.find_all("a", target="_blank"):
            rels = set(anchor.get("rel") or [])
            if not {"noopener", "noreferrer"}.issubset(rels):
                issues.append((rel, f"unsafe target blank: {anchor.get('href')}"))

        for tag_name, attr in {"a": "href", "link": "href", "script": "src", "img": "src", "source": "src", "iframe": "src", "video": "poster", "form": "action"}.items():
            for tag in soup.find_all(tag_name):
                value = tag.get(attr)
                if not value:
                    continue
                refs += 1
                parsed_value = urlsplit(value)
                if (
                    parsed_value.scheme not in {"http", "https"}
                    and not value.startswith(("#", "mailto:", "tel:", "javascript:", "data:", "blob:", "//"))
                    and parsed_value.path
                    and not parsed_value.path.startswith(config["base"])
                ):
                    issues.append((rel, f"local reference is not deployment-prefixed: {value}"))
                target = resolve_local(root, page, value, config["base"])
                if target is not None and not target.exists():
                    issues.append((rel, f"broken local reference {value}"))

        canonical = soup.find("link", rel="canonical")
        if canonical:
            host = urlsplit(canonical.get("href", "")).netloc
            if host != config["host"]:
                issues.append((rel, f"wrong canonical host {host}"))
        if canonical:
            canonical_url = canonical.get("href", "")
            for key, attrs in (
                ("og:url", {"property": "og:url"}),
                ("twitter:url", {"name": "twitter:url"}),
            ):
                meta = soup.find("meta", attrs=attrs)
                if meta and meta.get("content") != canonical_url:
                    issues.append((rel, f"{key} differs from canonical {canonical_url}"))
        robots = soup.find("meta", attrs={"name": "robots"})
        if robots:
            value = robots.get("content", "").lower()
            # A custom 404 page must stay out of search indexes on every deployment.
            if rel == "404.html":
                if "noindex" not in value:
                    issues.append((rel, "404 page must contain noindex"))
            elif config["indexable"] and "noindex" in value:
                issues.append((rel, "indexable deployment contains noindex"))
            elif not config["indexable"] and "noindex" not in value:
                issues.append((rel, "test deployment is indexable"))

    cname = root / "CNAME"
    if config["cname"]:
        if not cname.exists() or cname.read_text(encoding="utf-8").strip() != config["cname"]:
            issues.append(("CNAME", "wrong or missing CNAME"))
    elif cname.exists():
        issues.append(("CNAME", "deployment must not contain CNAME"))
    sitemap = root / "sitemap.xml"
    if config.get("sitemap") and not sitemap.exists():
        issues.append(("sitemap.xml", "missing sitemap"))
    if config.get("sitemap") and sitemap.exists():
        try:
            xml = ET.parse(sitemap)
            ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9",
                  "x": "http://www.w3.org/1999/xhtml"}
            entries = xml.findall("s:url", ns)
            urls = [entry.findtext("s:loc", namespaces=ns) for entry in entries]
            indexed = {p for p in htmls if p.name != "404.html" and "unused-template" not in p.name}
            expected = set()
            for p in indexed:
                doc = BeautifulSoup(p.read_text(encoding="utf-8", errors="replace"), "html.parser")
                tag = doc.find("link", rel="canonical")
                if tag:
                    expected.add(tag.get("href", ""))
            if len(urls) != len(set(urls)) or set(urls) != expected:
                issues.append(("sitemap.xml", f"canonical sitemap mismatch: expected {len(expected)}, got {len(urls)}"))
            for entry in entries:
                loc = entry.findtext("s:loc", namespaces=ns)
                links = {alt.get("hreflang"): alt.get("href") for alt in entry.findall("x:link", ns)}
                if set(links) != {"en", "el", "x-default"} or any(v not in expected for v in links.values()):
                    issues.append(("sitemap.xml", f"missing/invalid language alternate for {loc}"))
        except ET.ParseError as exc:
            issues.append(("sitemap.xml", f"invalid XML: {exc}"))
    if not config.get("sitemap") and sitemap.exists():
        issues.append(("sitemap.xml", "deployment must not contain sitemap"))
    llms_files = [root / "llms.txt", root / "llms-full.txt"]
    if config.get("llms") and any(not p.exists() for p in llms_files):
        issues.append(("llms", "main deployment is missing llms files"))
    if not config.get("llms") and any(p.exists() for p in llms_files):
        issues.append(("llms", "backup/test deployment must not contain llms files"))

    for p in root.rglob("*.json"):
        try:
            json.loads(p.read_text(encoding="utf-8"))
        except Exception as exc:
            issues.append((p.relative_to(root).as_posix(), f"invalid JSON: {exc}"))

    print(f"Validated {len(htmls)} HTML pages and {refs} references for {a.repository}.")
    if issues:
        for item in issues[:200]:
            print("ERROR:", *item)
        print(f"Total issues: {len(issues)}", file=sys.stderr)
        return 1
    print("Validation passed with zero issues.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
