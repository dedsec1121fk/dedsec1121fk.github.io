#!/usr/bin/env python3
"""Audit built website metadata, sitemap, LLM content, resources and JS syntax.

Network services and real-device behavior are not certified by this offline gate.
"""
import argparse,json,re,subprocess,tempfile,hashlib
from pathlib import Path
from urllib.parse import urlsplit,unquote,parse_qs
import xml.etree.ElementTree as ET
from collections import Counter
from test_portable_site import audit as portable_audit,HeadLinks
from knowledge_catalogue import effective_rows,ROOT
from build_site_search import rows as site_rows
from startup_manifest import manifest as expected_startup_manifest

def audit(out):
 portable_audit(out)
 manifest=json.loads((out/'deployment-manifest.json').read_text());base=manifest['base_url'];issues=[]
 ns='{http://www.sitemaps.org/schemas/sitemap/0.9}'
 urls=[e.text for e in ET.parse(out/'sitemap.xml').getroot().iter(ns+'loc')]
 if len(urls)!=len(set(urls)):issues.append('Duplicate sitemap URL')
 expected={base+f'learn/{r["l"]}/{r["id"]}.html' for r in effective_rows()}
 if not expected<=set(urls):issues.append('Sitemap omits effective lesson URLs')
 canonical=set();scripts=set();inline=set();css_refs=0;pages=0;versioned_resources=0
 for path in out.rglob('*.html'):
  pages+=1;rel=path.relative_to(out).as_posix();raw=path.read_text('utf8');p=HeadLinks();p.feed(raw)
  if not re.search(r'<title>\s*[^<]+</title>',raw,re.I):issues.append('Missing title: '+rel)
  if len(re.findall(r'<script\b[^>]*src=["\'][^"\']*assets/boot\.js(?:\?[^"\']*)?["\']',raw))!=1:issues.append('Missing/duplicate readiness loader: '+rel)
  canon=p.canonical()[0] if p.canonical() else '';canonical.add(canon)
  if not any('icon' in a.get('rel','').split() for a in p.links):issues.append('Missing favicon: '+rel)
  for uri in p.local_refs:
   parts=urlsplit(uri)
   if parts.scheme or parts.netloc or not parts.path.endswith(('.js','.css')):continue
   target=out/unquote(parts.path).lstrip('/') if parts.path.startswith('/') else path.parent/unquote(parts.path)
   if target.is_file():
    versioned_resources+=1
    if parse_qs(parts.query).get('v')!=[hashlib.sha256(target.read_bytes()).hexdigest()[:12]]:issues.append('Stale module fingerprint: '+rel+' '+uri)
  if not canon.startswith(base):issues.append('Foreign canonical: '+rel)
  for alt in (a for a in p.links if a.get('rel')=='alternate' and a.get('hreflang')):
   uri=alt.get('href','');parts=urlsplit(uri)
   if not uri.startswith(base):issues.append('Foreign alternate: '+rel);continue
   local=out/unquote(parts.path[len(urlsplit(base).path):])
   if local.is_dir():local=local/'index.html'
   if not local.is_file():issues.append('Missing alternate: '+rel)
  robots=p.find_meta('name','robots')
  if manifest['profile']=='test' and (len(robots)!=1 or 'noindex' not in robots[0]):issues.append('Staging HTML not noindex: '+rel)
  for attrs in re.findall(r'<script\b([^>]*)>([\s\S]*?)</script>',raw,re.I):
   if 'src=' not in attrs[0] and attrs[1].strip() and not re.search(r'type=["\']application/(?:ld\+)?json',attrs[0],re.I):inline.add(attrs[1])
 for path in out.rglob('*.css'):
  for ref in re.findall(r'url\(\s*["\']?([^\s)"\']+)',path.read_text('utf8',errors='replace')):
   parts=urlsplit(ref)
   if parts.scheme or parts.netloc or not parts.path:continue
   target=out/unquote(parts.path).lstrip('/') if parts.path.startswith('/') else path.parent/unquote(parts.path)
   css_refs+=1
   if not target.is_file():issues.append('Missing CSS resource: '+str(path.relative_to(out))+' '+ref)
 # Validate executable website-owned JS and unique inline scripts, including TikDev.
 owned=[out/'assets',out/'data',out/'dedsec/Assets'];scripts.add(out/'offline-worker.js')
 for folder in owned:
  scripts.update(p for p in folder.glob('*.js') if p.is_file())
 for path in scripts:
  run=subprocess.run(['node','--check',str(path)],capture_output=True,text=True,timeout=15)
  if run.returncode:issues.append('JS syntax: '+str(path.relative_to(out))+' '+run.stderr[-250:])
 with tempfile.TemporaryDirectory() as folder:
  fixture=Path(folder)/'inline.js'
  for source in inline:
   fixture.write_text(source);run=subprocess.run(['node','--check',str(fixture)],capture_output=True,text=True,timeout=15)
   if run.returncode:issues.append('Inline JS syntax: '+run.stderr[-250:])
 # Only basic DedSec pages and their dependencies belong in the startup cache.
 preload=json.loads((out/'startup-manifest.json').read_text())
 if preload!=expected_startup_manifest(out):issues.append('Stale or incomplete startup cache manifest')
 # The full LLM file must contain every page and lesson once, with local source URLs.
 full=(out/'llms-full.txt').read_text('utf8');sources=re.findall(r'^Source-URL: (https?://\S+)',full,re.M)
 if len(sources)!=len(effective_rows())+len(site_rows()):issues.append('LLM full content coverage differs')
 for row in effective_rows():
  uri=base+f'learn/{row["l"]}/{row["id"]}.html'
  if sources.count(uri)!=1:issues.append('LLM missing or duplicate lesson: '+row['id'])
 for uri in sources:
  if not uri.startswith(base):issues.append('LLM source uses foreign origin');continue
  local=out/unquote(urlsplit(uri).path[len(urlsplit(base).path):])
  if local.is_dir():local=local/'index.html'
  if not local.is_file():issues.append('Missing LLM target: '+uri)
 # Prose references in the full text must resolve independently of the original
 # Markdown directory. Code examples keep their literal sample links unchanged.
 prose=re.sub(r'(?ms)^ {0,3}(`{3,}|~{3,})[^\n]*\n.*?^ {0,3}\1[^\n]*(?:\n|$)','',full)
 prose=re.sub(r'`+[^`\n]*`+','',prose)
 for uri in re.findall(r'\]\(([^\n)]+)\)',prose):
  parts=urlsplit(uri)
  if not parts.scheme and not parts.netloc:issues.append('Relative llms-full prose link: '+uri);continue
  if uri.startswith(base):
   target=out/unquote(parts.path[len(urlsplit(base).path):]);target=target/'index.html' if target.is_dir() else target
   if not target.is_file():issues.append('Broken llms-full prose link: '+uri)
 for uri in re.findall(r'\]\((https?://[^\s)]+)\)',(out/'llms.txt').read_text()):
  if uri.startswith(base):
   target=out/unquote(urlsplit(uri).path[len(urlsplit(base).path):]);target=target/'index.html' if target.is_dir() else target
   if not target.is_file():issues.append('Broken llms.txt link: '+uri)
 if manifest['profile']=='test' and (out/'CNAME').exists():issues.append('Test must not claim production CNAME')
 if manifest['profile']!='test' and (out/'CNAME').read_text().strip()!=urlsplit(base).hostname:issues.append('Wrong public CNAME')
 for uri in canonical:
  if uri not in urls and not urlsplit(uri).path.endswith('404.html'):issues.append('Canonical omitted from sitemap: '+uri)
 for file in ('LICENSE',):
  if not (ROOT/file).is_file():issues.append('Missing required license: '+file)
 result={'profile':manifest['profile'],'base_url':base,'html_pages':pages,'sitemap_urls':len(urls),'unique_canonical_urls':len(canonical),'llm_full_records':len(sources),'css_resource_references':css_refs,'fingerprinted_resource_references':versioned_resources,'startup_resources':len(preload['resources']),'startup_bytes':preload['bytes'],'javascript_files_checked':len(scripts),'unique_inline_scripts_checked':len(inline),'issues':issues,'limits':['External website/API availability is not an offline guarantee.','Static checks do not certify every technical claim or all hardware/toolchains.','Test is noindex staging; production and backup repositories are not modified.']}
 return result
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--output',required=True);p.add_argument('--report');a=p.parse_args();result=audit(Path(a.output));print('PUBLICATION_AUDIT:',json.dumps(result,ensure_ascii=False))
 if a.report:
  file=Path(a.report);file.parent.mkdir(parents=True,exist_ok=True);file.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
 raise SystemExit(bool(result['issues']))
