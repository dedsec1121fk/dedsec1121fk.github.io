#!/usr/bin/env python3
"""Offline acceptance checks for a built main/Test/backup website.

Checks static crawler metadata, URL origins, local assets, internal links and
sitemap coverage without sending network requests or executing the website.
"""
import argparse
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit,unquote
import json
import xml.etree.ElementTree as ET

class HeadLinks(HTMLParser):
 def __init__(self):
  super().__init__(convert_charrefs=True)
  self.in_head=True;self.metas=[];self.links=[];self.local_refs=[]
 def handle_starttag(self,tag,attrs):
  attr=dict(attrs)
  if tag=='meta' and self.in_head:self.metas.append(attr)
  if tag=='link' and self.in_head:self.links.append(attr)
  if tag in ('a','script','link','img','source','iframe'):
   for field in ('href','src'):
    if attr.get(field):self.local_refs.append(attr[field])
 def handle_endtag(self,tag):
  if tag=='head':self.in_head=False
 def find_meta(self,field,value):
  return [x.get('content','') for x in self.metas if x.get(field,'').lower()==value]
 def canonical(self):
  return [x.get('href','') for x in self.links if x.get('rel','').lower()=='canonical']

def audit(out):
 manifest=json.loads((out/'deployment-manifest.json').read_text('utf8'))
 base=manifest['base_url'];parsed_base=urlsplit(base)
 errors=[];html_pages=list(out.rglob('*.html'))
 for page in html_pages:
  rel=page.relative_to(out).as_posix()
  p=HeadLinks()
  p.feed(page.read_text('utf8'))
  for label,found in [('canonical',p.canonical()),('og:title',p.find_meta('property','og:title')),('og:description',p.find_meta('property','og:description')),('og:url',p.find_meta('property','og:url')),('og:image',p.find_meta('property','og:image')),('twitter:image',p.find_meta('name','twitter:image')),('description',p.find_meta('name','description'))]:
   if len(found)!=1 or not found[0]:errors.append((rel,label,'missing or duplicate'))
  for field in ('og:url','og:image','twitter:image'):
   for value in p.find_meta('property' if field.startswith('og:') else 'name',field):
    if not value.startswith(base):errors.append((rel,field,'wrong deployment origin '+value))
  for uri in p.local_refs:
   parts=urlsplit(uri)
   if parts.scheme or parts.netloc or uri.startswith(('#','data:','mailto:','tel:','javascript:')):continue
   if not parts.path:continue
   local=(out/unquote(parts.path).lstrip('/')) if parts.path.startswith('/') else page.parent/unquote(parts.path)
   if not local.exists():errors.append((rel,'broken link',uri))
  if len(errors)>300:break
 # Ensure any URL Google or crawlers see in sitemap resolves in the build.
 sitemap=ET.parse(out/'sitemap.xml').getroot()
 ns='{http://www.sitemaps.org/schemas/sitemap/0.9}'
 listed=[x.text for x in sitemap.iter(ns+'loc')]
 for uri in listed:
  if not uri.startswith(base):errors.append(('sitemap','foreign URL',uri));continue
  path=unquote(uri[len(base):])
  target=out/path
  if path.endswith('/') or not path:target=target/'index.html'
  if not target.is_file():errors.append(('sitemap','missing target',path))
 for name in ('robots.txt','llms.txt','llms-full.txt'):
  source=(out/name).read_text('utf8')
  if base not in source:errors.append((name,'missing base',base))
 if manifest['profile']=='test':
  if 'Disallow: /' not in (out/'robots.txt').read_text('utf8'):errors.append(('robots.txt','staging indexing','should disallow'))
 else:
  if 'Allow: /' not in (out/'robots.txt').read_text('utf8'):errors.append(('robots.txt','public indexing','not allowed'))
 for lang in ('en','el'):
  number=manifest['preview_pages_by_language'][lang]
  present=list((out/'learn'/lang).glob('*.html'))
  if len(present)!=number:errors.append(('learn/'+lang,'preview count',str(len(present))))
 if errors:
  print('PORTABILITY_AUDIT_FAIL',json.dumps(errors[:30],ensure_ascii=False,indent=2))
  raise SystemExit(1)
 print('PORTABILITY_AUDIT_PASS:',json.dumps({'profile':manifest['profile'],'html_pages':len(html_pages),'sitemap_entries':len(listed),'preview_pages_by_language':manifest['preview_pages_by_language'],'relative_links':'all resolved','static_social_cards':'all present'},ensure_ascii=False))
if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('--output',default='.site-publish');args=parser.parse_args()
 audit(Path(args.output))
