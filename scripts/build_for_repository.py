#!/usr/bin/env python3
"""Build the DedSec website for one of its three supported GitHub repositories."""
from __future__ import annotations

import argparse
import json
import os
import posixpath
import shutil
import sys
from datetime import date
from pathlib import Path
from urllib.parse import quote, unquote, urlsplit
from xml.sax.saxutils import escape

from bs4 import BeautifulSoup

CONFIGS = {
    "dedsec1121fk/dedsec1121fk.github.io": {
        "mode": "main",
        "site_url": "https://ded-sec.space",
        "base_path": "/",
        "cname": "ded-sec.space",
        "indexable": True,
        "sitemap": True,
        "llms": True,
    },
    "sal-scar/ded-sec": {
        "mode": "backup",
        "site_url": "https://ded-sec.online",
        "base_path": "/",
        "cname": "ded-sec.online",
        "indexable": True,
        "sitemap": False,
        "llms": False,
    },
    "dedsec1121fk/test": {
        "mode": "test",
        "site_url": "https://dedsec1121fk.github.io/test",
        "base_path": "/test/",
        "cname": None,
        "indexable": False,
        "sitemap": False,
        "llms": False,
    },
    "DedSec-Project-Official/Test": {
        "mode": "test",
        "site_url": "https://dedsec-project-official.github.io/Test",
        "base_path": "/Test/",
        "cname": None,
        "indexable": False,
        "sitemap": False,
        "llms": False,
    },
}

TEXT_SUFFIXES = {
    ".html", ".css", ".js", ".json", ".webmanifest", ".xml", ".txt", ".md",
    ".py", ".sh", ".yml", ".yaml",
}
IGNORE_NAMES = {".git", "_site", "__pycache__", "scripts"}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--repository", default=os.getenv("GITHUB_REPOSITORY", "dedsec1121fk/test"))
    parser.add_argument("--source", default=".")
    parser.add_argument("--output", default="_site")
    return parser.parse_args()


def ignore_copy(directory: str, names: list[str]) -> set[str]:
    ignored = {name for name in names if name in IGNORE_NAMES or name.endswith(".pyc")}
    if Path(directory).name == ".github":
        ignored.update(names)
    return ignored


def page_path(relative: Path) -> str:
    value = relative.as_posix()
    if value == "index.html":
        return "/"
    if value.endswith("/index.html"):
        return "/" + value[:-10]
    return "/" + value


def page_url(site_url: str, relative: Path) -> str:
    return site_url.rstrip("/") + page_path(relative)


def counterpart(relative: Path, root: Path) -> Path | None:
    parts = relative.parts
    candidate: Path | None = None
    if relative.as_posix() == "index.html":
        candidate = Path("el/index.html")
    elif parts and parts[0] == "el":
        tail = list(parts[1:])
        candidate = Path(*tail)
    elif parts and parts[0] in {"Pages", "Assistance"}:
        candidate = Path("el", *parts)
    if candidate and (root / candidate).exists():
        return candidate
    return None


def english_version(relative: Path, root: Path) -> Path:
    if relative.as_posix() == "el/index.html":
        return Path("index.html")
    parts = relative.parts
    if parts and parts[0] == "el":
        tail = list(parts[1:])
        candidate = Path(*tail)
        if (root / candidate).exists():
            return candidate
    return relative


def set_meta(soup: BeautifulSoup, *, name: str | None = None, prop: str | None = None, content: str) -> None:
    attrs = {"name": name} if name else {"property": prop}
    tag = soup.head.find("meta", attrs=attrs)
    if tag is None:
        tag = soup.new_tag("meta")
        if name:
            tag["name"] = name
        else:
            tag["property"] = prop
        soup.head.append(tag)
    tag["content"] = content


def rewrite_json_urls(value, site_url: str):
    if isinstance(value, dict):
        return {k: rewrite_json_urls(v, site_url) for k, v in value.items()}
    if isinstance(value, list):
        return [rewrite_json_urls(v, site_url) for v in value]
    if isinstance(value, str):
        for origin in ("https://ded-sec.space", "https://ded-sec.online", "https://dedsec1121fk.github.io/test", "https://dedsec-project-official.github.io/Test"):
            if value == origin or value.startswith(origin + "/"):
                suffix = value[len(origin):]
                if origin.endswith("/test") and suffix.startswith("/test/"):
                    suffix = suffix[5:]
                return site_url.rstrip("/") + suffix
    return value


KNOWN_SITE_HOSTS = {
    "ded-sec.space", "www.ded-sec.space",
    "ded-sec.online", "www.ded-sec.online",
    "dedsec1121fk.github.io",
    "dedsec-project-official.github.io",
}


def normalize_local_path(root: Path, page_relative: Path, raw_path: str) -> tuple[str, Path] | None:
    """Resolve a site-local reference to a repository-relative path and file.

    The returned path always names a real file. Directory links are normalized to
    their explicit index.html file so GitHub Pages does not depend on redirect or
    trailing-slash behavior.
    """
    decoded = unquote(raw_path or "")
    if decoded.startswith("/test/"):
        decoded = decoded[5:]
    elif decoded == "/test":
        decoded = "/"
    elif decoded.startswith("/Test/"):
        decoded = decoded[5:]
    elif decoded == "/Test":
        decoded = "/"

    if decoded.startswith("/"):
        relative_value = decoded.lstrip("/")
    else:
        base = page_relative.parent.as_posix()
        relative_value = posixpath.normpath(posixpath.join(base, decoded))

    if relative_value in {"", "."}:
        relative_value = "index.html"
    relative_value = relative_value.lstrip("/")
    if relative_value.startswith("../") or relative_value == "..":
        return None

    target = root / Path(relative_value)
    if target.is_dir():
        target = target / "index.html"
        relative_value = posixpath.join(relative_value.rstrip("/"), "index.html")
    elif not target.exists() and (root / Path(relative_value) / "index.html").exists():
        target = root / Path(relative_value) / "index.html"
        relative_value = posixpath.join(relative_value.rstrip("/"), "index.html")

    if not target.exists() or not target.is_file():
        return None
    return relative_value, target


def deployment_path(config: dict, relative_value: str) -> str:
    base = config["base_path"]
    if not base.endswith("/"):
        base += "/"
    return base + quote(relative_value.lstrip("/"), safe="/._-~")


def rewrite_local_reference(value: str, *, root: Path, page_relative: Path, config: dict) -> str | None:
    """Return a deployment-safe URL for a local reference, or None if external."""
    if not value or value.startswith(("#", "mailto:", "tel:", "javascript:", "data:", "blob:", "//")):
        return None
    parsed = urlsplit(value)
    raw_path = parsed.path

    if parsed.scheme in {"http", "https"}:
        if parsed.netloc.lower() not in KNOWN_SITE_HOSTS:
            return None
        if parsed.netloc.lower() == "dedsec1121fk.github.io" and raw_path.startswith("/test/"):
            raw_path = raw_path[5:]
    elif parsed.scheme:
        return None

    resolved = normalize_local_path(root, page_relative, raw_path)
    if resolved is None:
        return None
    relative_value, _ = resolved
    result = deployment_path(config, relative_value)
    if parsed.query:
        result += "?" + parsed.query
    if parsed.fragment:
        result += "#" + parsed.fragment
    return result


def local_target_exists(root: Path, path: str) -> bool:
    resolved = normalize_local_path(root, Path("index.html"), path)
    return resolved is not None


def rewrite_html(path: Path, root: Path, config: dict, repository: str) -> None:
    relative = path.relative_to(root)
    soup = BeautifulSoup(path.read_text(encoding="utf-8", errors="replace"), "html.parser")
    if soup.html:
        soup.html["data-deployment"] = config["mode"]
        soup.html["data-repository"] = repository

    current_url = page_url(config["site_url"], relative)
    # Error pages must never be indexed, even on an otherwise indexable deployment.
    # Keeping this exception in the repository builder prevents the main-site build
    # from overwriting 404.html's source-level noindex directive.
    if relative.as_posix() == "404.html":
        robots = "noindex,follow"
    else:
        robots = "index,follow,max-image-preview:large" if config["indexable"] else "noindex,nofollow,noarchive"
    set_meta(soup, name="robots", content=robots)
    set_meta(soup, prop="og:url", content=current_url)
    set_meta(soup, name="twitter:url", content=current_url)
    image_url = config["site_url"].rstrip("/") + "/Assets/Images/og/og-dark.jpg"
    set_meta(soup, prop="og:image", content=image_url)
    set_meta(soup, name="twitter:image", content=image_url)

    for link in list(soup.head.find_all("link", rel=lambda r: r and "canonical" in r)):
        link.decompose()
    canonical = soup.new_tag("link", rel="canonical", href=current_url)
    soup.head.append(canonical)

    for link in list(soup.head.find_all("link", rel=lambda r: r and "alternate" in r and link_has_hreflang(r))):
        link.decompose()
    other = counterpart(relative, root)
    greek = relative.parts and relative.parts[0] == "el"
    en_path = english_version(relative, root)
    en_url = page_url(config["site_url"], en_path)
    el_url = page_url(config["site_url"], other if not greek and other else relative)
    if greek:
        el_url = current_url
        if other:
            en_url = page_url(config["site_url"], other)
    for lang, url in (("en", en_url), ("el", el_url), ("x-default", en_url)):
        tag = soup.new_tag("link", rel="alternate", hreflang=lang, href=url)
        soup.head.append(tag)

    # Rewrite every local URL to an explicit deployment-aware path. This makes
    # links deterministic on the main domain, backup domain, and /test/ project
    # site, including when a directory URL is opened without a trailing slash.
    attrs = {"a": "href", "link": "href", "script": "src", "img": "src", "source": "src", "iframe": "src", "form": "action", "video": "poster"}
    for tag_name, attr in attrs.items():
        for tag in soup.find_all(tag_name):
            value = tag.get(attr)
            if not value:
                continue
            if tag_name == "link":
                rel_values = {str(item).lower() for item in (tag.get("rel") or [])}
                if "canonical" in rel_values or ("alternate" in rel_values and tag.get("hreflang")):
                    continue
            label = tag.get_text(" ", strip=True).lower() if tag_name == "a" else ""
            if "main website" in label or "κύρια ιστοσελίδα" in label:
                tag[attr] = "https://ded-sec.space/el/" if "κύρια" in label else "https://ded-sec.space"
                continue
            if "backup website" in label or "εφεδρική ιστοσελίδα" in label:
                tag[attr] = "https://ded-sec.online"
                continue
            rewritten = rewrite_local_reference(str(value), root=root, page_relative=relative, config=config)
            if rewritten is not None:
                tag[attr] = rewritten

    for tag in soup.find_all(srcset=True):
        items = []
        for item in str(tag.get("srcset", "")).split(","):
            bits = item.strip().split()
            if not bits:
                continue
            rewritten = rewrite_local_reference(bits[0], root=root, page_relative=relative, config=config)
            bits[0] = rewritten or bits[0]
            items.append(" ".join(bits))
        tag["srcset"] = ", ".join(items)

    for script in soup.head.find_all("script", attrs={"type": "application/ld+json"}):
        try:
            data = json.loads(script.string or script.get_text())
            script.string = json.dumps(rewrite_json_urls(data, config["site_url"]), ensure_ascii=False, indent=2)
        except Exception:
            pass

    for a in soup.find_all("a", target="_blank"):
        rels = set(a.get("rel") or [])
        rels.update({"noopener", "noreferrer"})
        a["rel"] = sorted(rels)
    for button in soup.find_all("button"):
        if not button.get("type"):
            button["type"] = "button"

    path.write_text(str(soup), encoding="utf-8")


def link_has_hreflang(rel_value) -> bool:
    # BeautifulSoup rel callback receives only the rel value; actual hreflang check is done by caller after find.
    return True


def generate_sitemap(root: Path, config: dict) -> None:
    if not config.get("sitemap", False):
        return
    urls = []
    for p in sorted(root.rglob("*.html")):
        rel = p.relative_to(root)
        if p.name == "404.html" or "unused-template" in p.name:
            continue
        url = page_url(config["site_url"], rel)
        other = counterpart(rel, root)
        greek = rel.parts and rel.parts[0] == "el"
        en_rel = english_version(rel, root)
        en_url = page_url(config["site_url"], en_rel)
        el_url = page_url(config["site_url"], other if not greek and other else rel)
        if greek:
            el_url = url
            if other:
                en_url = page_url(config["site_url"], other)
        alternate = ""
        if other:
            alternate = (
                f'\n    <xhtml:link rel="alternate" hreflang="en" href="{escape(en_url)}"/>'
                f'\n    <xhtml:link rel="alternate" hreflang="el" href="{escape(el_url)}"/>'
                f'\n    <xhtml:link rel="alternate" hreflang="x-default" href="{escape(en_url)}"/>'
            )
        urls.append(
            "  <url>\n"
            f"    <loc>{escape(url)}</loc>\n"
            f"    <lastmod>{date.today().isoformat()}</lastmod>\n"
            "    <changefreq>weekly</changefreq>\n"
            f"    <priority>{'1.0' if rel.as_posix() == 'index.html' else '0.7'}</priority>"
            f"{alternate}\n"
            "  </url>"
        )
    xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' + "\n".join(urls) + "\n</urlset>\n"
    (root / "sitemap.xml").write_text(xml, encoding="utf-8")



def _search_text(soup: BeautifulSoup, language: str) -> str:
    """Return a compact, deduplicated keyword bag for the static site search index."""
    scope = soup.find("main") or soup.body or soup
    selector = "h1,h2,h3,h4,p,li,summary,.feature-title,.tool-title,.category-header,.assistance-card-title,.assistance-card-desc"
    chunks: list[str] = []
    for element in scope.select(selector):
        preferred = element.get("data-gr") if language == "gr" else element.get("data-en")
        value = (preferred or element.get_text(" ", strip=True) or "").strip()
        if value:
            chunks.append(value)

    # Keep the index compact: unique words preserve topic coverage without storing full pages.
    words: list[str] = []
    seen: set[str] = set()
    for chunk in chunks:
        for word in chunk.split():
            cleaned = word.strip(".,:;!?()[]{}<>\\/|\"'`~@#$%^&*_+=—–-")
            key = cleaned.casefold()
            if len(cleaned) < 2 or not key or key in seen:
                continue
            seen.add(key)
            words.append(cleaned)
            if len(words) >= 80:
                return " ".join(words)
    return " ".join(words)


def _search_page_fields(path: Path, language: str) -> dict[str, str]:
    soup = BeautifulSoup(path.read_text(encoding="utf-8", errors="replace"), "html.parser")
    h1 = soup.select_one("main h1, h1")
    title_attr = "data-gr" if language == "gr" else "data-en"
    title = ""
    if h1 is not None:
        title = (h1.get(title_attr) or h1.get_text(" ", strip=True) or "").strip()
    if not title and soup.title:
        title = soup.title.get_text(" ", strip=True)
    meta_tag = soup.find("meta", attrs={"name": "description"})
    meta = (meta_tag.get("content") if meta_tag else "") or ""
    return {
        "title": title.strip(),
        "meta": meta.strip(),
        "keywords": _search_text(soup, language),
    }


def generate_search_index(root: Path) -> None:
    """Build one lightweight JSON index so browsers never need to crawl HTML pages at search time."""
    items: list[dict[str, object]] = []
    excluded_names = {"404.html", "unused-template.html"}

    for path in sorted(root.rglob("*.html")):
        relative = path.relative_to(root)
        rel = relative.as_posix()
        parts = relative.parts

        # Greek pages are paired with the canonical English page below instead of duplicated.
        if parts and parts[0] == "el":
            continue
        if path.name in excluded_names:
            continue
        if not (
            rel == "index.html"
            or rel.startswith("Pages/")
            or rel.startswith("Assistance/")
        ):
            continue

        english = _search_page_fields(path, "en")
        if not english["title"]:
            continue

        greek_path = counterpart(relative, root)
        if greek_path is not None and greek_path != relative:
            greek = _search_page_fields(root / greek_path, "gr")
            url_gr = greek_path.as_posix()
        else:
            greek = _search_page_fields(path, "gr")
            url_gr = rel

        items.append({
            "title_en": english["title"],
            "title_gr": greek["title"] or english["title"],
            "meta_en": english["meta"],
            "meta_gr": greek["meta"] or english["meta"],
            "keywords_en": english["keywords"],
            "keywords_gr": greek["keywords"] or english["keywords"],
            "url_en": rel,
            "url_gr": url_gr,
            "isPageResult": True,
        })

    assets = root / "Assets"
    assets.mkdir(parents=True, exist_ok=True)
    payload = {
        "version": 1,
        "generated_on": date.today().isoformat(),
        "items": items,
    }
    (assets / "search-index.json").write_text(
        json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + "\n",
        encoding="utf-8",
    )

def main() -> int:
    args = parse_args()
    repository = args.repository.strip()
    if repository not in CONFIGS:
        print(f"Unsupported repository: {repository}", file=sys.stderr)
        print("Supported: " + ", ".join(CONFIGS), file=sys.stderr)
        return 2
    config = CONFIGS[repository]
    source = Path(args.source).resolve()
    output = Path(args.output).resolve()
    if output.exists():
        shutil.rmtree(output)
    shutil.copytree(source, output, ignore=ignore_copy)

    # The source package is test-friendly. Normalize its known base marker for the selected target.
    for p in output.rglob("*"):
        if p.is_file() and p.suffix.lower() in TEXT_SUFFIXES:
            text = p.read_text(encoding="utf-8", errors="replace")
            text = text.replace("/test/", config["base_path"])
            text = text.replace("/Test/", config["base_path"])
            if p.suffix.lower() != ".html":
                # Non-HTML indexes and manifests should describe the active deployment.
                text = text.replace("https://dedsec1121fk.github.io/test", config["site_url"])
                text = text.replace("https://dedsec-project-official.github.io/Test", config["site_url"])
            p.write_text(text, encoding="utf-8")

    for p in sorted(output.rglob("*.html")):
        rewrite_html(p, output, config, repository)

    generate_search_index(output)

    for stale in list(output.glob("sitemap*")) + list(output.glob("llms*.txt")) + [output / "CNAME"]:
        if stale.exists():
            stale.unlink()
    if config["cname"]:
        (output / "CNAME").write_text(config["cname"] + "\n", encoding="utf-8")
    if config.get("llms", False):
        for name in ("llms.txt", "llms-full.txt"):
            source_llms = source / name
            if source_llms.exists():
                shutil.copy2(source_llms, output / name)

    robots_lines = [
        "User-agent: *",
        "Allow: /" if config["indexable"] else "Disallow: /",
    ]
    if config.get("sitemap", False):
        robots_lines += ["", f"Sitemap: {config['site_url'].rstrip('/')}/sitemap.xml"]
    (output / "robots.txt").write_text("\n".join(robots_lines) + "\n", encoding="utf-8")
    generate_sitemap(output, config)
    info = {"repository": repository, **config, "built_on": date.today().isoformat()}
    (output / "Other Files").mkdir(parents=True, exist_ok=True)
    (output / "Other Files" / "deployment-info.json").write_text(json.dumps(info, indent=2) + "\n", encoding="utf-8")
    (output / ".nojekyll").write_text("", encoding="utf-8")
    print(json.dumps(info, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
