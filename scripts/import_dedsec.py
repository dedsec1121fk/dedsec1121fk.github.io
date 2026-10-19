#!/usr/bin/env python3
"""Copy the pinned, public DedSec website into the Test repository.
Never carries over CNAME, sitemap, llms, original CI, Git internals or public-site hosting metadata.
No network calls from the published static site are necessary for local guides.
"""
from pathlib import Path
from tempfile import TemporaryDirectory
import subprocess
import shutil
import re
import html as htmlmod

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "DedSec-Project-Website/dedsec"
if (TARGET / ".full-import-ready").is_file() and (TARGET / ".full-import-ready").read_text(encoding="utf-8").strip()=="GalaxyV3":
    print("DedSec content already imported for GalaxyV3")
    raise SystemExit(0)
REPO = "https://github.com/dedsec1121fk/dedsec1121fk.github.io.git"
EXCLUDED = {".git", ".github", "CNAME", "README.md", "robots.txt", "CHANGELOG-2026-10-09.txt"}
with TemporaryDirectory() as tmp:
    src = Path(tmp) / "source"
    subprocess.run(["git", "clone", "--depth", "1", "--single-branch", REPO, str(src)], check=True)
    total = 0
    for original in src.rglob("*"):
        if not original.is_file():
            continue
        rel = original.relative_to(src)
        if any(part in EXCLUDED for part in rel.parts):
            continue
        if any(part.lower().startswith(("sitemap", "llms")) for part in rel.parts):
            continue
        if original.name.startswith(".") and original.name != ".nojekyll":
            continue
        dest = TARGET / rel
        dest.parent.mkdir(parents=True, exist_ok=True)
        if original.suffix.lower() == ".html":
            s = original.read_text(encoding="utf-8", errors="replace")
            prefix = "../" * max(0, len(rel.parts) - 1)
            # All nested references resolve under /Test/dedsec/ rather than the live production site.
            s = re.sub(r'(\b(?:href|src|action)\s*=\s*["\'])/(?!/)', lambda m: m.group(1) + prefix, s, flags=re.I)
            s = re.sub(r'(\b(?:href|src)\s*=\s*["\'])https?://(?:ded-sec\.space|ded-sec\.online)/', lambda m: m.group(1) + prefix, s, flags=re.I)
            s = re.sub(r'<link\b[^>]*\brel=["\'](?:canonical|alternate)["\'][^>]*>', "", s, flags=re.I)
            s = re.sub(r'<meta\b[^>]*http-equiv=["\']Content-Security-Policy["\'][^>]*>', "", s, flags=re.I)
            s = re.sub(r'<meta\b[^>]*http-equiv=["\']X-Frame-Options["\'][^>]*>', "", s, flags=re.I)
            s = re.sub(r'<link\b[^>]*https?://cdnjs\.cloudflare\.com/ajax/libs/font-awesome[^>]*>', "", s, flags=re.I)
            s = re.sub(r'<nav\b[^>]*class=["\']main-nav["\'][\s\S]*?</nav\s*>', "", s, flags=re.I)
            s = re.sub(r'<footer\b[^>]*>[\s\S]*?</footer\s*>', "", s, flags=re.I)
            s = re.sub(r'<script\b[^>]*\bsrc=["\'][^"\']*script\.js[^"\']*["\'][^>]*>\s*</script>', "", s, flags=re.I)
            s = re.sub(r'<script\b[^>]*\bsrc=["\'][^"\']*(?:cookie-consent|assistance)\.js[^"\']*["\'][^>]*>\s*</script>', "", s, flags=re.I)
            # Remove inline tracking/promotion scripts while keeping page content and native details toggles.
            s = re.sub(r'<script\b[^>]*src=["\']https?://[^"\']*["\'][^>]*>\s*</script>', "", s, flags=re.I)
            s = re.sub(r'<meta\s+content=["\']index,follow[^>]*>', "", s, flags=re.I)
            s = s.replace('data-deployment="main"', 'data-deployment="test"').replace('data-repository="dedsec1121fk/dedsec1121fk.github.io"', 'data-repository="dedsec1121fk/Test"')
            nav = '<header class="merged-topbar"><a class="merged-brand" href="' + prefix + '../index.html"><img src="' + prefix + 'Assets/Images/Logos/Black%20Purple%20Butterfly%20Logo.jpeg" alt=""><span>DedSec Project</span></a><div class="merged-actions"><button type="button" id="merged-theme" class="merged-action" aria-label="Change theme">☀</button><button type="button" id="merged-lang" class="merged-action" aria-label="Change language">ΕΛ</button></div></header>'
            s = re.sub(r'<body([^>]*)>', lambda m: '<body' + m.group(1) + '>' + nav, s, count=1, flags=re.I)
            s = re.sub(r'</head\s*>', '<meta name="robots" content="noindex,nofollow"><link rel="stylesheet" href="' + prefix + 'Assets/vendor/fontawesome/css/all.min.css"><link rel="stylesheet" href="' + prefix + 'Assets/merged-retro.css"><script defer src="' + prefix + 'Assets/merged-retro.js"></script></head>', s, count=1, flags=re.I)
            footer = '''<footer class="merged-footer"><div class="footer-buttons"><a href="https://github.com/dedsec1121fk/DedSec" data-en="Main DedSec Project Repository" data-gr="Κύριο Repository DedSec Project">Main DedSec Project Repository</a></div><div class="footer-buttons"><a href="https://www.google.com/preferences/source?q=ded-sec.space" data-en="Set DedSec Project as Preferred Google Source" data-gr="Επιλογή DedSec Project ως προτιμώμενης πηγής Google">Set DedSec Project as Preferred Google Source</a></div><p data-en="If the main website is unavailable, use our backups." data-gr="Αν η κύρια ιστοσελίδα δεν λειτουργεί, χρησιμοποίησε τις εφεδρικές.">If the main website is unavailable, use our backups.</p><div class="footer-buttons"><a href="https://ded-sec.online" data-en="Backup Website" data-gr="Εφεδρική Ιστοσελίδα">Backup Website</a><a href="https://github.com/sal-scar/DedSec" data-en="Backup Repository" data-gr="Εφεδρικό Repository">Backup Repository</a></div><p>© 2024–2026 DedSec Project. All Rights Reserved.</p><p>Made by dedsec1121fk.</p></footer>'''
            s = re.sub(r'</body\s*>', footer + '</body>', s, count=1, flags=re.I)
            dest.write_text(s, encoding="utf-8")
        elif original.suffix.lower() == ".css":
            s = original.read_text(encoding="utf-8", errors="replace")
            prefix = "../" * max(0, len(rel.parts) - 1)
            s = re.sub(r'url\((["\']?)/(?!/)', lambda m: 'url(' + m.group(1) + prefix, s)
            dest.write_text(s, encoding="utf-8")
        else:
            shutil.copy2(original, dest)
        total += 1
(TARGET / ".full-import-ready").write_text("GalaxyV3", encoding="utf-8")
print("Imported", total, "DedSec files into", TARGET)
