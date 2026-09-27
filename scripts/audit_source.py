#!/usr/bin/env python3
import json,sys
from pathlib import Path
from bs4 import BeautifulSoup
ROOT=Path(__file__).resolve().parents[1]
issues=[]
for rel in ('Pages/about-founder.html','el/Pages/about-founder.html'):
 s=BeautifulSoup((ROOT/rel).read_text(encoding='utf-8'),'html.parser');sec=s.find(id='keep-android-open');vision=s.find(id='project-vision')
 if not sec or not vision or not sec.find('a',href='https://keepandroidopen.org'):issues.append(rel+' missing compact Founder/Vision integration')
# Main-deployment SEO and Assistance checks.
import re
for page in ROOT.rglob('*.html'):
 s=BeautifulSoup(page.read_text(encoding='utf-8',errors='replace'),'html.parser')
 rel=str(page.relative_to(ROOT))
 raw=page.read_text(encoding='utf-8',errors='replace')
 if 'https://dedsec-project-official.github.io' in raw:
  issues.append(rel+' contains stale deployment URL')
 d=s.find('meta',attrs={'name':'description'})
 desc=(d.get('content','').strip() if d else '')
 if not 90<=len(desc)<=165:
  issues.append(rel+f' meta description length={len(desc)}')
 og=s.find('meta',attrs={'property':'og:description'})
 tw=s.find('meta',attrs={'name':'twitter:description'})
 if og and og.get('content','').strip()!=desc:issues.append(rel+' Open Graph description mismatch')
 if tw and tw.get('content','').strip()!=desc:issues.append(rel+' Twitter description mismatch')
 for link in s.find_all('link',href=True):
  if 'fonts.googleapis.com' in link.get('href','') or 'fonts.gstatic.com' in link.get('href',''):
   issues.append(rel+' still loads unused Google fonts')
 if rel in ('Pages/assistance.html','el/Pages/assistance.html') and s.find(id='assistance-guide-search'):
  issues.append(rel+' contains duplicate Assistance guide search')
 if rel.startswith('Assistance/') or rel.startswith('el/Assistance/'):
  if not any('assistance.css' in x.get('href','') for x in s.find_all('link',href=True)):
   issues.append(rel+' missing Assistance stylesheet')
  if not any('assistance.js' in x.get('src','') for x in s.find_all('script',src=True)):
   issues.append(rel+' missing Assistance script')


# Permanent navigation/design invariants.
vision_files=[x for x in ROOT.rglob('*.html') if x.name.lower()=='our-vision.html']
for x in vision_files:
 issues.append(str(x.relative_to(ROOT))+' standalone Our Vision page must not exist')
for x in list(ROOT.rglob('*.html'))+list(ROOT.glob('*.xml'))+list(ROOT.glob('*.txt')):
 raw=x.read_text(encoding='utf-8',errors='replace')
 if 'our-vision.html' in raw.lower():
  issues.append(str(x.relative_to(ROOT))+' references removed Our Vision route')
style=(ROOT/'style.css').read_text(encoding='utf-8',errors='replace')
if 'ABSOLUTE BORDER-ONLY LOCK (2026-08-07i.1)' not in style:
 issues.append('style.css missing global border-only surface lock')
not_found=BeautifulSoup((ROOT/'404.html').read_text(encoding='utf-8',errors='replace'),'html.parser')
robots=not_found.find('meta',attrs={'name':'robots'})
if not robots or 'noindex' not in robots.get('content','').lower():
 issues.append('404.html must be noindex')
if 'not-found-page' not in (not_found.body.get('class',[]) if not_found.body else []):
 issues.append('404.html missing responsive not-found-page design class')

if issues:
 print('\n'.join('ERROR: '+x for x in issues));sys.exit(1)
print('Source audit passed.')


# Sponsor-route canonicalization invariants.
for _removed in ('Pages/sponsors.html','el/Pages/sponsors.html'):
    if (ROOT/_removed).exists():
        raise SystemExit(f'Removed sponsor page still exists: {_removed}')
for _rel in ('Pages/learn-about-the-tools.html','el/Pages/learn-about-the-tools.html'):
    _raw=(ROOT/_rel).read_text(encoding='utf-8',errors='replace')
    for _required in ('$25', 'sponsor-ebooks', 'ebook-data-analytics', 'ebook-faith', 'ebook-termux', 'ebook-website', 'ebook-ai-prompts'):
        if _required not in _raw:
            raise SystemExit(f'{_rel} missing embedded $25 sponsor-library marker: {_required}')



# Content CTA centering invariant added 2026-08-07n.
CENTERING_MARKER = 'GLOBAL CONTENT CTA CENTERING LOCK 20260807n'
for _rel in ('style.css','Assets/sales-optimization.css','Assets/assistance.css'):
    _css=(ROOT/_rel).read_text(encoding='utf-8',errors='ignore')
    if CENTERING_MARKER not in _css:
        raise SystemExit(f'{_rel} missing global content CTA centering lock')


# CTA physical-centering + punctuation invariants added 2026-08-07o.
PHYSICAL_CENTER_MARKER = 'ABSOLUTE CONTENT CTA PHYSICAL CENTERING 20260807o'
for _rel in ('style.css','Assets/sales-optimization.css','Assets/assistance.css'):
    _css=(ROOT/_rel).read_text(encoding='utf-8',errors='ignore')
    if PHYSICAL_CENTER_MARKER not in _css:
        raise SystemExit(f'{_rel} missing physical CTA centering lock')

# Uppercase heading/category labels must not end in a period.
for _html in ROOT.rglob('*.html'):
    _s=BeautifulSoup(_html.read_text(encoding='utf-8',errors='replace'),'html.parser')
    for _lab in _s.select('.sales-section-label:not(.sales-sentence-label), .home-product-tag'):
        _t=' '.join(_lab.get_text(' ',strip=True).split())
        _letters=''.join(ch for ch in _t if ch.isalpha())
        if _letters and _letters.upper()==_letters and _t.endswith('.'):
            raise SystemExit(f'{_html.relative_to(ROOT)} uppercase heading label ends with a period: {_t}')


# Greek translation consistency invariants added 2026-09-25.
_home_en=BeautifulSoup((ROOT/'index.html').read_text(encoding='utf-8',errors='replace'),'html.parser')
_home_gr=BeautifulSoup((ROOT/'el/index.html').read_text(encoding='utf-8',errors='replace'),'html.parser')
_en_intro=_home_en.select_one('.home-decision-section .sales-section-intro')
_gr_intro=_home_gr.select_one('.home-decision-section .sales-section-intro')
if not _en_intro or not _gr_intro or _gr_intro.get('data-en') != _en_intro.get('data-en') or _gr_intro.get('data-gr') != _en_intro.get('data-gr'):
    raise SystemExit('Greek homepage decision intro is out of sync with the English source')
for _rel in ('el/index.html','el/Pages/learn-about-the-tools.html'):
    _raw=(ROOT/_rel).read_text(encoding='utf-8',errors='replace')
    for _bad in ('Χρησιμοποίησε την πληρωμένη διαδρομή', ':χρονολόγιο', 'Μετά το αρχική ρύθμιση', 'να κάνει δημοσιεύσει', 'το καταγεγραμμένα evidence'):
        if _bad in _raw:
            raise SystemExit(f'{_rel} contains stale/broken Greek translation: {_bad}')
