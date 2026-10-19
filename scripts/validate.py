#!/usr/bin/env python3
"""Fast structural and content audit of the staged DedSec website. stdlib only."""
from pathlib import Path
from urllib.parse import quote
import json
import re
from offline_curate_knowledge import key as topic_key

REPO_ROOT = Path(__file__).resolve().parents[1]
ROOT = REPO_ROOT / "DedSec-Project-Website"
NEEDED = [
    "index.html", "assets/ui.css", "assets/ui.js",
    "data/en.js", "data/el.js", "data/hacking-complete-1.js", "data/hacking-complete-2.js", "data/methods.js", "data/hacking-guide.js", "data/termux-troubleshooting.js", "data/deep-dive.js", "data/algorithm-addenda.js", "assets/refinement.css", "TikDev.html",
    "assets/cookie-consent.js",
    "dedsec/Assets/merged-retro.css", "dedsec/Assets/merged-retro.js",
    "dedsec/Assets/Images/Logos/White Purple Butterfly Logo.jpeg",
    "dedsec/Assets/Images/Logos/Black Purple Butterfly Logo.jpeg",
    "assets/starfield-dark.svg", "assets/starfield-light.svg",
    "dedsec/Pages/learn-about-the-tools.html",
    "dedsec/el/Pages/learn-about-the-tools.html",
    "dedsec/Pages/guide-for-installation.html",
    "dedsec/el/Pages/guide-for-installation.html",
    "Documentation/English/00_START_HERE.md",
    "Documentation/Greek/00_ΞΕΚΙΝΑ_ΕΔΩ.md",
]
# The Developer's Mind import is curated from original indexed ZIP content,
# and lives outside the public website folder.
mind=REPO_ROOT/"Developer's Mind"/"Keep Programming Alive"
manifest=json.loads((REPO_ROOT/"Documentation"/"OFFLINE_CURATION_MANIFEST.json").read_text(encoding="utf-8"))
if not all((mind/folder).is_dir() and sum(1 for p in (mind/folder).rglob("*.md")) >= manifest["retained_markdown_per_language"][lang]
           for lang,folder in (("en","English"),("el","Greek"))):
    raise SystemExit("Curated offline Markdown archive incomplete")
errors = []
for relative in NEEDED:
    source = (REPO_ROOT / relative) if relative.startswith("Documentation/") else (ROOT / relative)
    if not source.is_file():
        errors.append("Missing: " + relative)
for p in ROOT.rglob("*"):
    if p.is_file() and any(part.lower() == "cname" or part.lower().startswith(("sitemap", "llms")) for part in p.relative_to(ROOT).parts):
        errors.append("Forbidden deployment artifact: " + str(p))
html = (ROOT / "index.html").read_text(encoding="utf-8")
ui = (ROOT / "assets/ui.js").read_text(encoding="utf-8")
css = (ROOT / "assets/ui.css").read_text(encoding="utf-8")
if not all(s in html for s in ('id="nav-theme-switcher"', 'id="nav-lang-switcher"', 'id="site-footer"', 'id="brand"')):
    errors.append("Missing main navigation/footer elements")
galaxy = (ROOT / "assets/galaxy.css").read_text(encoding="utf-8")
import_css = (ROOT / "dedsec/Assets/merged-retro.css").read_text(encoding="utf-8")
if 'href="assets/galaxy.css"' not in html or '@import url("../../assets/galaxy.css")' not in import_css:
    errors.append("Root and imported pages must share one galaxy theme")
if not all(x in galaxy for x in ('html body.theme-dark', 'html body.theme-light', 'html body.merged-dark', 'html body.merged-light', 'background-attachment:fixed')):
    errors.append("One or more light/dark galaxy combinations missing")
if "repeat(3,minmax(0,1fr))!important" not in css or "(orientation:portrait)" not in css or "(orientation:landscape)" not in css:
    errors.append("Portrait mobile must use three columns; landscape must use six")
if "burger" in html.lower() or "taskbar" in html.lower() or 'class="toplinks"' in html:
    errors.append("Forbidden second navigation bar")
if not all(s in css for s in ("repeat(6,minmax(0,1fr))", "repeat(3,minmax(0,1fr))", "position:fixed", "body.theme-dark", "body.theme-light")):
    errors.append("Galaxy/responsive theme rules missing")
apps_match = re.search(r"var APPS=(\[.*?\]);\s*var CATS=", ui, flags=re.S)
if not apps_match:
    errors.append("Could not parse launcher registry")
else:
    apps = json.loads(apps_match.group(1))
    destinations = [a[3] for a in apps]
    if len(destinations) != len(set(destinations)):
        errors.append("Duplicate desktop launcher destinations")
    if len(destinations) != 22 or "#saved" in destinations:
        errors.append("Home must show 22 launchers and no Saved Lessons shortcut")
    if not all(len(a) == 5 and a[0].strip() and a[1].strip() for a in apps):
        errors.append("Missing bilingual launcher fields")
    if not any(a[3] == "https://github.com/sponsors/dedsec1121fk" for a in apps):
        errors.append("Missing Sponsor Us target")
    expected = ["dedsec/Pages/guide-for-installation.html", "dedsec/Pages/learn-about-the-tools.html", "dedsec/Pages/assistance.html", "dedsec/Pages/faq.html", "dedsec/Pages/privacy-policy.html", "dedsec/Pages/contact-credits.html", "dedsec/Pages/about-founder.html", "https://github.com/sponsors/dedsec1121fk"]
    if destinations[:8] != expected:
        errors.append("DedSec launchers must follow the original menu top-to-bottom, then Sponsor Us")
    if destinations[8] != "#category:fund" or destinations[-1] != "#category:advanced":
        errors.append("Learning shortcuts must progress from Foundations to Advanced Engineering")
    if not all(a[3] != "dedsec/Pages/learn-about-the-tools.html" or a[1].startswith("Μάθε") for a in apps):
        errors.append("DedSec Greek launcher label missing")
    for a in apps:
        if a[4] == "dedsec" and a[3].startswith("dedsec/"):
            if not (ROOT / a[3]).is_file() or not (ROOT / a[3].replace("dedsec/", "dedsec/el/", 1)).is_file():
                errors.append("Missing bilingual DedSec launcher target: " + a[3])
# Original bilingual security lab chapters must be indexed, offline and unique.
if "window.ARCHIVE_HACKING" not in ui:
    errors.append("Bilingual Hacking Guide not included in the offline search")
# Shared modules must execute before the app; a valid standalone module is not
# sufficient when its script is absent or placed after the consumer.
reader_scripts=('assets/knowledge-renderer.js','data/site-search.js','assets/knowledge-search.js','assets/page-controls.js','assets/ui.js')
positions=[]
for asset in reader_scripts:
    tag=('<script type="application/json" data-knowledge-src="'+asset+'"></script>' if asset.startswith('data/') else '<script defer src="'+asset+'"></script>')
    if html.count(tag)!=1 or not (ROOT/asset).is_file():
        errors.append('Missing, duplicated or non-deferred reader module: '+asset)
    positions.append(html.find(tag))
if positions!=sorted(positions):
    errors.append('Reader module execution order is invalid')
for page in ROOT.rglob('*.html'):
    source=page.read_text(encoding='utf8')
    if len(re.findall(r'<script\b[^>]*src=["\'][^"\']*assets/boot\.js["\']',source))!=1:
        errors.append('Missing/duplicate startup bootstrap: '+str(page.relative_to(ROOT)))
hacking_js = (ROOT / "data/hacking-guide.js").read_text(encoding="utf-8")
prefix_hacking = "window.ARCHIVE_HACKING="
if not hacking_js.startswith("/*"):
    errors.append("Unexpected Hacking Guide encoding")
match_hacking = re.search(r"window\.ARCHIVE_HACKING=(\[.*\]);", hacking_js, re.S)
if not match_hacking:
    errors.append("Hacking Guide index cannot be parsed")
else:
    new_rows = json.loads(match_hacking.group(1))
    if len(new_rows) != 24 or set(row["l"] for row in new_rows) != {"en", "el"}:
        errors.append("Hacking Guide is not complete and bilingual")
    guide_ids = set()
    for row in new_rows:
        if row["id"] in guide_ids:
            errors.append("Hacking Guide duplicate lesson ID: " + row["id"])
        guide_ids.add(row["id"])
        if "Hacking Guide" not in row["t"] or not row["b"].strip():
            errors.append("Incomplete security lesson: " + row["id"])
# New material must enrich canonical records and preserve their identifiers.
def load_js_rows(path,variable):
    text=(ROOT/path).read_text(encoding="utf-8")
    if variable=="ARCHIVE_HACKING_COMPLETE":
        begin=text.index(".concat([")+len(".concat(")
        end=text.rfind("]")+1
    else:
        begin=text.index("window."+variable+"=")+len("window."+variable+"=")
        end=text.rfind("]")+1
    return json.loads(text[begin:end])

try:
    english=load_js_rows("data/en.js","ARCHIVE_EN")
    greek=load_js_rows("data/el.js","ARCHIVE_EL")
    whole=load_js_rows("data/hacking-complete-1.js","ARCHIVE_HACKING_COMPLETE")+load_js_rows("data/hacking-complete-2.js","ARCHIVE_HACKING_COMPLETE")
    combined=english+greek+whole
    seen_ids=set()
    for row in combined:
        if row["id"] in seen_ids:
            errors.append("Duplicate knowledge ID: "+row["id"])
        seen_ids.add(row["id"])
    if len(whole)!=280 or sum(x["l"]=="en" for x in whole)!=140 or sum(x["l"]=="el" for x in whole)!=140:
        errors.append("Complete Hacking Guide must include all 140 chapters in each language")
    normalized_bodies=set()
    for row in whole:
        body=" ".join(row["b"].split()).casefold()
        if len(body)<2500:
            errors.append("Hacking Guide chapter is short or truncated: "+row["id"])
        if body in normalized_bodies:
            errors.append("Duplicate detailed Hacking Guide chapter: "+row["id"])
        normalized_bodies.add(body)
        if row.get("source")!="dedsec1121fk/Hacking-Guide-Project":
            errors.append("Hacking Guide provenance is absent: "+row["id"])
    if len(english)!=manifest["retained_records_per_language"]["en"] or len(greek)!=manifest["retained_records_per_language"]["el"]:
        errors.append("Offline lesson counts differ from audited curation manifest")
    if {topic_key(r) for r in english}!={topic_key(r) for r in greek}:
        errors.append("English and Greek retained topics do not correspond")
    # Exact titles are unique per language; stable identifiers never change.
    for locale,rows in (("en",english),("el",greek)):
        display_titles=[row["t"].strip().casefold() for row in rows]
        if len(display_titles)!=len(set(display_titles)):
            errors.append("Repeated display title in "+locale+" language database")
    rev={0,2,3,4,5,6,7,9,12,13,14,15,18}
    foundations={179,180,181,182,183,184,185,186,187,189,191,195}
    languages={"Python.md","JavaScript.md","TypeScript.md","C.md","C_Plus_Plus.md",
               "Rust.md","Bash.md","SQL_SQLite.md","Kotlin.md"}
    # The canonical Markdown includes its base index record plus any source-keyed
    # bilingual extension. Verify that exact merged content, never just a snippet.
    extension_map={}
    extension_modes={}
    for extension_file in sorted((ROOT/"data").glob("lesson-expansions-*.js")):
        if extension_file.name == "lesson-expansions-termux-curated.js":
            continue  # ARCHIVE_TERMUX IIFE has a separate format and audit.
        raw=extension_file.read_text(encoding="utf-8")
        if ".concat(" not in raw or not raw.rstrip().endswith(");"):
            errors.append("Invalid lesson expansion JSON: "+extension_file.name)
            continue
        items=json.loads(raw.split(".concat(",1)[1].rsplit(");",1)[0])
        for item in items:
            key=(item["l"],item["p"])
            if key in extension_map:
                errors.append("Repeated knowledge extension: "+str(key))
            extension_map[key]=item["append"].strip()
            extension_modes[key]=item.get("mode","append")
    if extension_map:
        errors.append("Legacy overlays must be consolidated into canonical offline index bodies")
    source_root=REPO_ROOT/"Developer's Mind"/"Keep Programming Alive"
    synced=0
    for row in english+greek:
        mid=re.fullmatch(r"rev-(?:en|el)-(\d+)",row["id"])
        reg=re.fullmatch(r"(en|el)-(\d+)",row["id"])
        is_reverse=bool(mid and int(mid.group(1)) in rev)
        is_foundation=bool(reg and
            (int(reg.group(2)) if reg.group(1)=="en" else int(reg.group(2))-888) in foundations)
        is_language=(row["g"] in {"Programming_Languages","Γλώσσες_Προγραμματισμού"} and
                     Path(row["p"]).name in languages and row["p"].endswith(".md"))
        if not (is_reverse or is_foundation or is_language):
            continue
        source=source_root/("English" if row["l"]=="en" else "Greek")/row["p"]
        key=(row["l"],row["p"])
        extension=extension_map.get(key)
        body=row["b"].strip()
        if extension and extension_modes.get(key)=="replace":
            expected=extension
        elif extension and extension not in body:
            expected=body+chr(10)+chr(10)+extension
        else:
            expected=body
        if not source.is_file() or source.read_text(encoding="utf-8").strip()!=expected.strip():
            errors.append("Original Markdown source not synced with expanded database: "+row["id"])
        synced+=1
    if synced < 25:
        errors.append("Too few retained Reverse Engineering/foundations/language sources verified")
    termux_rows=load_js_rows("data/termux-troubleshooting.js","ARCHIVE_TERMUX")
    curated_raw=(ROOT/"data"/"lesson-expansions-termux-curated.js").read_text(encoding="utf-8")
    curated_match=re.search(r"const patches=(\[.*?\]);\s*const records=window\.ARCHIVE_TERMUX\|\|\[\];",curated_raw,re.S)
    if not curated_match:
        errors.append("Unparseable curated Termux sync registry")
        curated_by_key={}
    else:
        curated_by_key={(entry["l"],entry["p"]):entry["append"].strip()
                        for entry in json.loads(curated_match.group(1))}
    termux_ids={f"termux-{n}-{l}" for n in ("01","02","03","06","08","09","10","14") for l in ("en","el")}
    for row in termux_rows:
        if row["id"] not in termux_ids:continue
        source=source_root/("English" if row["l"]=="en" else "Greek")/"Termux_Troubleshooting"/Path(row["p"]).name
        expected=curated_by_key.get((row["l"],row["p"]),row["b"]).strip()
        if not source.is_file() or source.read_text(encoding="utf-8").strip()!=expected:
            errors.append("Termux source Markdown not synced: "+row["id"])
    for locale,rows in (("en",english),("el",greek)):
        for record in rows:
            if record.get("l")!=locale or not record.get("b","").strip():
                errors.append("Invalid lesson locale/content: "+record.get("id","?"))
    for key in ["rev-en-3","rev-el-3","rev-en-5","rev-el-5","rev-en-18","rev-el-18"]:
        match=next((r for r in combined if r["id"]==key),None)
        if not match or len(match["b"])<1300:
            errors.append("Reverse Engineering practical chapter not expanded: "+key)
    if 'window.ARCHIVE_HACKING_COMPLETE||[]' not in ui:
        errors.append("Complete Hacking Guide is not included in offline search")
    if not all(x in html for x in ('src="data/hacking-complete-1.js"','src="data/hacking-complete-2.js"')):
        errors.append("Complete Hacking Guide data imports missing from offline HTML")
except (ValueError,KeyError,TypeError) as exc:
    errors.append("Knowledge data audit error: "+str(exc))

# New content and TikDev must remain self-contained, bilingual where authored,
# and must not duplicate the removed launcher search page.
termux_raw=(ROOT/"data/termux-troubleshooting.js").read_text(encoding="utf-8")
termux_match=re.search(r"window\.ARCHIVE_TERMUX=(\[.*\]);",termux_raw,re.S)
if not termux_match:
    errors.append("Bilingual Termux diagnostic archive missing")
else:
    termux_rows=json.loads(termux_match.group(1))
    if len(termux_rows)<32 or sum(x.get("l")=="en" for x in termux_rows)!=sum(x.get("l")=="el" for x in termux_rows):
        errors.append("Termux diagnostics not complete or bilingual")
    if len(set(x["id"] for x in termux_rows))!=len(termux_rows):
        errors.append("Duplicate Termux diagnostics identifiers")
if '#search' in [x[3] for x in apps] or '"#search"' in ui:
    errors.append("Removed duplicate knowledge-search app/page was reintroduced")
if 'TikDev.html' not in ui or '#category:termux' not in ui:
    errors.append("TikDev and Termux must be in Learning launcher group")
tik=(ROOT/"TikDev.html").read_text(encoding="utf-8")
for token in ('id="dedsec-nav"','id="dedsec-refresh"','id="musicStations"','id="customMusicUrl"','gap:18','nextPromotionAt: 18'):
    if token not in tik:
        errors.append("TikDev integration feature missing: "+token)
if tik.count('<button id="dedsec-theme"')!=1 or tik.count('<button id="dedsec-lang"')!=1 or '<label id="dedsec-auto-label"' in tik:
    errors.append("TikDev must have only the shared DedSec theme/language controls, not its own auto-refresh control")
if 'id="themeButton" hidden' not in tik or '<header class="tikdev-toolbar" id="appHeader">' not in tik:
    errors.append("TikDev legacy theme control must remain hidden beneath the shared DedSec navigation")
if "window.ARCHIVE_DEEP_DIVE" not in ui:
    errors.append("New bilingual knowledge bundle not indexed")
deep_source=(ROOT/"data/deep-dive.js").read_text(encoding="utf-8")
try:
    deep_entries=json.loads(deep_source.split("window.ARCHIVE_DEEP_DIVE=",1)[1].rsplit(";",1)[0])
    if len(deep_entries)!=36 or set(x.get("l") for x in deep_entries)!={"en","el"}:
        errors.append("Expected 18 bilingual deep-dive topics (36 entries)")
    if len({x.get("id") for x in deep_entries})!=len(deep_entries):
        errors.append("Duplicate deep-dive lesson identifiers")
except (ValueError,IndexError,KeyError):
    errors.append("Bilingual deep-dive lesson JSON invalid")
algorithm=(ROOT/"data/algorithm-addenda.js").read_text(encoding="utf-8")
if '__DEDSEC_ALGORITHM_ENRICHMENT__' not in algorithm or 'integrated:true' not in algorithm:
    errors.append("Compiled algorithm addenda status marker missing")
for locale, filename in (("en","data/en.js"),("el","data/el.js")):
    dataset=json.loads((ROOT/filename).read_text(encoding="utf8").split("=",1)[1].strip().rstrip(";"))
    compiled=sum(record["b"].count("[curated-algorithm-detail:") for record in dataset if record["p"].endswith(".md"))
    if compiled != 15:
        errors.append("Algorithm addenda not preserved in canonical " + locale + " archive: " + str(compiled))
if 'data/algorithm-addenda.js' not in html:
    errors.append("Detailed original algorithms not loaded by the Test homepage")
if (ROOT/"dedsec/CHANGELOG-2026-10-09.txt").exists():
    errors.append("Obsolete changelog still inside public website")
if not (REPO_ROOT/".github/workflows/tikdev-weekly.yml").exists() or not (ROOT/"data/tikdev-weekly.json").exists():
    errors.append("Weekly TikDev cache workflow is missing")
cookie_js=(ROOT/"assets/cookie-consent.js").read_text(encoding="utf-8")
if 'id="boot-screen"' in html or 'class="theme-dark booting"' in html:
    errors.append("Startup splash screen must not be reintroduced")
if 'dedsec:cookie-choice' not in cookie_js or 'if(!choice())open();' not in cookie_js:
    errors.append("Cookie consent must initialize without waiting for a loading screen")
if "assets/refinement.css" not in html or "dedsec-refinement-style" not in (ROOT / "dedsec/Assets/merged-retro.js").read_text(encoding="utf-8"):
    errors.append("Shared final polish CSS missing from root or imported pages")
if "dedsec/el/" not in ui:
    errors.append("Greek DedSec routing missing")
ids = set()
for lang, path in (("en", "data/en.js"), ("el", "data/el.js")):
    raw = (ROOT / path).read_text(encoding="utf-8")
    prefix = "window.ARCHIVE_" + lang.upper() + "="
    if not raw.startswith(prefix):
        errors.append("Broken index prefix: " + path)
        continue
    rows = json.loads(raw[len(prefix):].strip().rstrip(";"))
    if len(rows) != manifest["retained_records_per_language"][lang]:
        errors.append("Index does not match offline curation inventory: " + path)
    for row in rows:
        if row["id"] in ids:
            errors.append("Duplicate lesson ID: " + row["id"])
        ids.add(row["id"])
        if row["l"] != lang:
            errors.append("Wrong language in index: " + row["id"])
imported = list((ROOT / "dedsec").rglob("*.html"))
if len(imported) < 179:
    errors.append("DedSec import is incomplete (" + str(len(imported)) + " HTML pages)")
for p in imported:
    content = p.read_text(encoding="utf-8", errors="replace")
    relative = p.relative_to(ROOT)
    for marker in ('class="merged-topbar"', "Assets/merged-retro.css", "Assets/merged-retro.js", 'class="merged-footer"', "noindex,nofollow"):
        if marker not in content:
            errors.append("Missing " + marker + " in " + str(relative))
    if content.count('class="merged-footer"') != 1:
        errors.append("Duplicate or missing site footer: " + str(relative))
# Link previews must be in static HTML, not injected by client-side JavaScript.
social_image = "https://ded-sec.space/Test/DedSec-Project-Website/dedsec/Assets/Images/og/og-dark.jpg"
if not (ROOT / "dedsec/Assets/Images/og/og-dark.jpg").is_file():
    errors.append("Bundled social card JPEG missing")
for page in [ROOT / "index.html", *imported, ROOT / "TikDev.html"]:
    markup = page.read_text(encoding="utf-8", errors="replace")
    rel = page.relative_to(ROOT).as_posix()
    expected_url = ("https://ded-sec.space/Test/DedSec-Project-Website/" if rel == "index.html"
                    else "https://ded-sec.space/Test/DedSec-Project-Website/" + quote(rel, safe="/"))
    required = (
        "DEDSEC_TEST_SOCIAL_START", "DEDSEC_TEST_SOCIAL_END",
        'property="og:title"', 'property="og:description"',
        'property="og:image"', 'property="og:url"',
        'name="twitter:card"', 'name="twitter:image"',
        'name="twitter:title"', 'name="twitter:description"'
    )
    if any(value not in markup for value in required):
        errors.append("Incomplete static link-sharing preview: " + rel)
    if markup.count("DEDSEC_TEST_SOCIAL_START") != 1:
        errors.append("Social preview duplicated or missing: " + rel)
    if f'property="og:url" content="{expected_url}"' not in markup:
        errors.append("Social preview points away from Test: " + rel)
    if f'property="og:image" content="{social_image}"' not in markup:
        errors.append("Shared social preview image does not point to Test: " + rel)
    if not any("description" in tag.lower() and "name=" in tag.lower() for tag in re.findall(r"<meta[^>]*>", markup, flags=re.I)):
        errors.append("Missing static page description: " + rel)
if ":not(#dedsec-theme-specificity)" not in import_css:
    errors.append("Legacy premium ID-specificity background overrides not repaired")

if html.count('class="ds-nav-glyph"') != 3 or 'nav-theme-switcher' not in html:
    errors.append("Three matching static Search/Moon/Home SVGs missing from homepage")
if 'class=\\"ds-nav-glyph\\"' not in ui or 'theme==="light"?' not in ui:
    errors.append("Root JavaScript must update the unified inline Sun/Moon SVGs")
if 'assets/clean-skin.css' not in html or 'assets/clean-skin.css' not in import_css:
    errors.append("Final minimal skin must load for root and ALL imported pages")
if 'decorateRootLinks' not in ui:
    errors.append("Launcher must mark its text-only links consistently")
retro_js = (ROOT / "dedsec/Assets/merged-retro.js").read_text(encoding="utf-8")
if 'decorateArticleLinks' not in retro_js or 'categorizeArticleHeadings' not in retro_js:
    errors.append("Imported pages lack their hyperlink and category enhancers")
if 'var(--space-ink)' not in import_css or 'var(--space-surface)' not in import_css:
    errors.append("Imported pages do not use canonical galaxy theme tokens")
if "word-break:normal!important" not in css or "overflow-wrap:anywhere!important" not in css:
    errors.append("Full bilingual desktop titles must wrap")
if "Object.assign(APP_ICONS," not in ui:
    errors.append("Custom DedSec pixel icons absent")
if 'var about=gr?' not in ui or 'home-about-summary' not in ui:
    errors.append("The 180-character bilingual about text must appear beneath trust row")
if not all(x in css for x in ('.home-about-summary', 'width:80%!important', 'max-width:544px!important')):
    errors.append("Trust row must be 20% smaller and introduction text styled")
if "launcherLabel" not in ui or 'id="collapseOverlay"' not in html:
    errors.append("Missing launcher labels or root Easter egg")
if "#collapseOverlay[hidden]" not in css or "body.broken #app.is-home .app-icon-btn" not in css:
    errors.append("The broken effect must visibly fragment launcher icons while remaining restorable")
if "body.merged-broken" not in import_css or ".merged-collapse::before" not in import_css:
    errors.append("Imported page Easter egg must visibly damage its layout")
if ".brand img{flex:0 0 auto!important;width:51px" not in css or ".nav-actions{display:flex!important;flex:0 0 auto!important;gap:11px" not in css:
    errors.append("Header brand and navbar spacing contract not found")
if 'src="assets/cookie-consent.js"' not in html:
    errors.append("Launcher must load the shared cookie controller before UI scripts")
cookie_js=(ROOT / "assets/cookie-consent.js").read_text(encoding="utf-8")
import_js=(ROOT / "dedsec/Assets/merged-retro.js").read_text(encoding="utf-8")
if not all(x in cookie_js for x in ('data-dedsec-cookie="accept"', 'data-dedsec-cookie="decline"', 'dedsec:cookie-choice', 'localStorage.setItem(KEY,value)', 'dedsec-cookie-manage', 'aria-modal', 'migrateAndClean', 'data-optional-src')):
    errors.append("Cookie controller: bilingual controls and persistent explicit consent are required")
if 'btn.querySelector(".app-label")' not in cookie_js:
    errors.append("Cookie label localization must not delete the pixel SVG icon")
if 'sessionStorage.setItem(KEY,value)' in cookie_js:
    errors.append("Cookie consent must persist between browser visits, not only a session")
if 'removeItem("dedsec:theme")' in cookie_js or 'removeItem("dedsec:language")' in cookie_js:
    errors.append("Consent controller must not erase functional theme/language preferences")
if ('id="dedsec-cookie-manage"' not in ui
        or 'class="launcher-group launcher-settings"' not in ui
        or '<div class="app-grid">'+'' not in ui
        or "var organized=groups.map" not in ui
        or "APPS.slice(g.from,g.to).map(launcher).join" not in ui):
    errors.append("Cookie settings tile must appear in its own final group, after the 22 launchers")
if 'class="app-icon-btn cookie-app-icon-btn"' not in ui or '.app-grid > #dedsec-cookie-manage' not in css:
    errors.append("Last Cookie Preferences button needs the same illustrated grid-tile design")
if "#dedsec-cookie-manage{position:static!important" not in galaxy:
    errors.append("Cookie settings must not float over reading pages")
if not all(value in import_js for value in ('new URL("cookie-consent.js",sharedAssets)', 'var sharedAssets=', '"../../assets/"', '"../assets/"')):
    errors.append("Imported pages must load shared consent controller")
if not all(x in ui for x in ('data-github-count="stars"', 'data-github-count="forks"', 'GitHub snapshot', '914</strong>', '380</strong>', 'https://api.github.com/repos/dedsec1121fk/DedSec', 'window.DedSecCookies.allowOptional()', 'function sectionIntro(', 'var categoryIntro=')):
    errors.append("Offline GitHub stat fallback, consent-gated live refresh or archive subtitles missing")
if 'data-optional-src="https://img.shields.io' in ui:
    errors.append("GitHub stats must not rely on optional badge images to render counts")
if 'SIMPLE_GLYPHS=' not in ui or 'cookie-pixel-icon' not in ui:
    errors.append("Cookie Preferences must be an illustrated Home tile, not a plain pill")
if '.cookie-app-icon-btn' not in css or '.trust-stat-number' not in css:
    errors.append("Cookie tile or GitHub stat styling is missing")
if 'fa-check-circle' not in cookie_js or 'fa-times-circle' not in cookie_js:
    errors.append("Consent buttons must have their own accept/decline icons")
if 'gap:10px!important' not in css or 'gap:10px!important' not in import_css:
    errors.append("Both navbars must have explicit room between the four actions")
if 'color:var(--space-link)!important' not in css or 'color:var(--space-link)!important' not in import_css:
    errors.append("Navbar action colors must follow the shared theme palette")
if not all(x in ui for x in ('function prefGet(', 'function prefSave(', 'prefSave("theme",theme)', 'prefSave("language",language)')):
    errors.append("Root theme and language preferences must persist between visits")
if not all(x in import_js for x in ('function prefGet(', 'function prefSave(', 'prefSave("theme",mode)', 'prefSave("language",lang)', 'location.replace(languageHref')):
    errors.append("Imported guides must remember themes and route to preferred language")
if any(x in ui for x in ('bookmarks', 'data-bookmark', 'Saved Lessons', 'localPut(', 'localGet(')):
    errors.append("Saved Lessons and bookmark code must remain removed")
if any(x in import_js for x in ('localStorage.removeItem("dedsec:theme")', 'localStorage.removeItem("dedsec:language")')):
    errors.append("Imported pages must not clear user preferences")
if "function completeHeadings()" not in import_js or "merged-generated-subtitle" not in import_js:
    errors.append("Imported pages missing title/subtitle fallback")
if not all(x in import_css for x in ('.note,.tip,.warning', 'background:transparent!important', '.merged-home) i', 'inline-size:41px')):
    errors.append("Guide surfaces and equal-size Home button rules missing")
for svg_name in ('starfield-dark.svg','starfield-light.svg'):
    art=(ROOT / 'assets' / svg_name).read_text(encoding='utf-8')
    if 'id="glow"' not in art or 'id="galaxy-core"' not in art or 'planetA' not in art:
        errors.append("Glowing stars, galaxies or varied planets missing in " + svg_name)
if not (REPO_ROOT / "scripts/audit_knowledge.py").exists():
    errors.append("Per-document and per-line archive auditor missing")
if not all(k in galaxy for k in ('--space-ink:#fff', '--space-ink:#111', '--space-dim:rgba(0,0,0,.64)')):
    errors.append("Theme background contrast and dark overlay must match the Win95 palette")
if 'APP_ICONS[key]' not in ui or 'class="pixel-glyph"' not in ui or 'assets/refinement.css' not in html:
    errors.append("Colorful theme-adapted pixel icons are missing")
if "var(--space-stars)" not in galaxy or "background-attachment:fixed!important" not in galaxy:
    errors.append("Shared SVG star background must avoid fixed-scroll mobile repaints")
for svg_name in ("starfield-dark.svg", "starfield-light.svg"):
    art=(ROOT / "assets" / svg_name).read_text(encoding="utf-8")
    if "<svg" not in art or art.count("<circle") < 800 or "radialGradient" not in art or "butterfly" in art.lower() or "alien" in art.lower():
        errors.append("Dense detailed galaxy invalid or obsolete character decorations found: " + svg_name)

if 'id="nav-search"' not in html or 'id="nav-home"' not in html or 'href="#library"' not in html or "selectedLogo=" not in ui:
    errors.append("Missing root search and theme-responsive logo")
import_js = (ROOT / "dedsec/Assets/merged-retro.js").read_text(encoding="utf-8")
if "merged-search" not in import_js or "merged-home" not in import_js or "Black" not in import_js or "White" not in import_js:
    errors.append("Imported pages missing search or responsive butterfly")
methods = json.loads((ROOT / "data/methods.js").read_text(encoding="utf-8").split("=",1)[1].strip().rstrip(";"))
if len(methods) != 30 or sum(x.get("l")=="en" for x in methods)!=15 or sum(x.get("l")=="el" for x in methods)!=15:
    errors.append("Logic and methods EN/EL counts mismatch")
if len(set(x["id"] for x in methods))!=len(methods) or len(set(re.sub(r"\s+", " ", x["b"]).strip().casefold() for x in methods))!=len(methods):
    errors.append("Duplicate reasoning IDs or body text")
if any("Choose a real technical problem" in x["b"] or "Επίλεξε ένα αληθινό τεχνικό πρόβλημα" in x["b"] for x in methods):
    errors.append("Repeated generic exercise template remained")
# Windows 95 high-contrast layout, duplicated title disambiguation and decorative scene.
if not all(key in galaxy for key in ('"MS Sans Serif"', '--space-ink:#fff', '--space-ink:#111', '--space-dim:rgba(0,0,0,.64)', 'border-radius:0!important')):
    errors.append("Win95 font, pointy corners, high contrast or deeper dark overlay missing")
if not all(key in css for key in ('#app .lesson .lesson-content', 'text-align:center!important', 'desktop-home .app-grid .app-icon-btn .app-icon')):
    errors.append("Knowledge center alignment and quieter icon styling missing")
if "function bodyWithoutRepeatedTitle(d)" not in ui or "markdown(bodyWithoutRepeatedTitle(d),d)" not in ui:
    errors.append("Knowledge pages must hide duplicate first markdown heading without deleting source content")
if not all(key in ui for key in ('function displayTitle(d)', 'var titleRepetitions={}', 'docs.forEach(function(d)', 'function icon(key)', 'var SIMPLE_GLYPHS=')):
    errors.append("Duplicate-generic-title disambiguation or simplified launcher icons missing")
if "function applyNavContrast()" not in import_js or 'style.setProperty("color",ink,"important")' not in import_js:
    errors.append("Imported navbar contrast must be applied to action controls and their nested glyphs")
if not all(key in import_css for key in ('#merged-lang:not(#dedsec-theme-specificity)', 'var(--space-ink)!important')):
    errors.append("Imported navbar colors or ID-specificity fix missing")
for theme in ("dark", "light"):
    svg=(ROOT / "assets" / ("starfield-"+theme+".svg")).read_text(encoding="utf-8")
    if svg.count('id="planet') < 5 or svg.count('id="galaxy-') < 2 or 'butterfly' in svg.casefold():
        errors.append("Galaxy should contain many kinds of planets and galaxies, without butterflies: "+theme)
for slug in ('method-contrast-en','method-contrast-el','method-content-en','method-content-el'):
    if not any(row["id"] == slug for row in methods):
        errors.append("Expanded distinct bilingual methods missing: "+slug)
for guide in (REPO_ROOT / "Documentation").rglob("*.md"):
    text = guide.read_text(encoding="utf-8")
    for obsolete in ("four-column mobile", "4 columns", "τέσσερα εικονίδια ανά σειρά", "four on mobile", "τέσσερις στο κινητό"):
        if obsolete in text:
            errors.append("Obsolete mobile layout in guide: " + str(guide))
# This refinement batch is selective: existing 2,376 lessons remain intact.
# Assert 31 distinct enhanced reference entries in each language, and preserve parity.
reference_titles = {
 "Algorithm","Abstraction","API","Argument","Array","AST","Asynchronous","Atomicity",
 "Backtracking","Big O","Binary search","Bit","Boolean","Branch","Buffer","Byte",
 "Cache","Callback","Cancellation","CI","CLI",
}
error_titles = {
 "SyntaxError","IndentationError","NameError","TypeError","ValueError",
 "KeyError","IndexError","ModuleNotFoundError","FileNotFoundError","PermissionError",
}
for locale, filename, glossary_group, error_group in (
    ("en","data/en.js","Terminology_Glossary","Error_Encyclopedia"),
    ("el","data/el.js","Γλωσσάρι_Ορολογίας","Εγχειρίδιο_Σφαλμάτων"),
):
    dataset=json.loads((ROOT/filename).read_text(encoding="utf-8").split("=",1)[1].strip().rstrip(";"))
    for topic, group in [(name,glossary_group) for name in reference_titles] + [(name,error_group) for name in error_titles]:
        docs=[item["b"] for item in dataset if item["g"]==group and item["p"].endswith(".md")]
        # Original topic headings are kept inside grouped practical reference chapters.
        if not any(re.search(r"(?mi)^##\s+"+re.escape(topic)+r"\s*$",doc) for doc in docs):
            # A substantial pre-existing guide may use a longer descriptive title.
            if not any(topic.casefold() in doc.casefold() and len(doc)>=1500 for doc in docs):
                errors.append("Missing curated bilingual reference: "+locale+" "+topic)
for name in ("starfield-dark.svg","starfield-light.svg"):
    asset=(ROOT/"assets"/name).read_text(encoding="utf-8")
    if 'id="dedsec-extra-galaxies"' not in asset or asset.count("<circle")<1850 or "butterfly" in asset.casefold():
        errors.append("New star clusters or varied galaxy details missing: "+name)
if not all(part in galaxy for part in ('--space-dim:rgba(0,0,0,.72)', '--space-dim:rgba(255,255,255,.095)', 'outline:2px dotted var(--space-ink)')):
    errors.append("Darker matte galaxy, white theme, or keyboard focus contrast missing")
if not all(part in css for part in ('#topbar .nav-actions', 'border:0!important', 'border-radius:0!important')):
    errors.append("Final root borderless Win95 skin missing")
if not all(part in import_css for part in ('.page-content :is(', 'border:0!important', ':not(#dedsec-theme-specificity)')):
    errors.append("Final imported page frame removal missing")

# Prevent undocumented hand-edits: code/layout/content commits must update both
# bilingual maintenance chapters, not just the website implementation.
import subprocess
try:
    changed = subprocess.check_output(
        ["git", "-c", "core.quotepath=false", "show", "--pretty=format:", "--name-only", "HEAD"],
        cwd=REPO_ROOT, text=True, stderr=subprocess.DEVNULL
    ).splitlines()
    source = [p for p in changed if
              (p.startswith("DedSec-Project-Website/") and p.endswith((".html",".css",".js",".svg",".py"))) or
              (p.startswith("scripts/") and p.endswith((".py",".mjs"))) or
              p.startswith(".github/workflows/")]
    if source and not (any(p.startswith("Documentation/English/") for p in changed)
                       and any(p.startswith("Documentation/Greek/") for p in changed)):
        errors.append("Every functional change must update both Documentation/English and Documentation/Greek in the same commit")
except (OSError, subprocess.CalledProcessError):
    pass  # Source ZIPs contain no git metadata; the Actions checkout enforces this.

if errors:
    for error in errors[:80]:
        print("ERROR:", error)
    raise SystemExit("Validation failed (" + str(len(errors)) + " issues)")
print("DedSec integration verified:", len(imported), "imported HTML pages,", len(ids), "bilingual lesson IDs")
