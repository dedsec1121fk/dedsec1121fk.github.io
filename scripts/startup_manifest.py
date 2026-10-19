"""Hash basic DedSec pages and their local presentation dependencies for startup."""
from pathlib import Path
from html.parser import HTMLParser
import hashlib,json,re
from urllib.parse import quote,unquote,urlsplit
NAME='startup-manifest.json'
BASIC_PAGES=('guide-for-installation','learn-about-the-tools','assistance','faq','privacy-policy','contact-credits','about-founder')
class Links(HTMLParser):
 def __init__(self):super().__init__();self.urls=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  for key in ('src','href'):
   if a.get(key):self.urls.append(a[key])
def manifest(root):
 root=Path(root).resolve();selected=set();pending=['index.html','assets/starfield-dark.svg','assets/starfield-light.svg']
 pending += [f'dedsec/{lang}Pages/{name}.html' for lang in ('','el/') for name in BASIC_PAGES]
 pending += ['dedsec/Assets/Images/Logos/'+color+' Purple Butterfly Logo.jpeg' for color in ('Black','White')]
 def local(value,parent):
  parts=urlsplit(value)
  if parts.scheme or parts.netloc or not parts.path:return None
  path=(root/unquote(parts.path).lstrip('/') if parts.path.startswith('/') else parent/unquote(parts.path)).resolve()
  if not path.is_relative_to(root) or not path.is_file():return None
  rel=path.relative_to(root).as_posix()
  if rel.startswith(('data/','learn/','raw/')) or rel in (NAME,'CNAME') or any(s.startswith('.') for s in path.relative_to(root).parts):return None
  return rel
 while pending:
  rel=pending.pop();p=root/rel
  if rel in selected or not p.is_file():continue
  selected.add(rel)
  if p.suffix.lower()=='.html':
   parser=Links();parser.feed(p.read_text());urls=parser.urls
   # Follow presentation dependencies only; unrelated page links stay on demand.
   urls=[u for u in urls if urlsplit(u).path.lower().endswith(('.js','.css','.svg','.png','.jpg','.jpeg','.ico','.webp','.woff','.woff2','.ttf'))]
  elif p.suffix.lower()=='.css':
   urls=[m[1] or m[2] for m in re.findall(r'url\(\s*(["\']?)(.*?)\1\s*\)|@import\s+["\']([^"\']+)["\']',p.read_text())]
  else:urls=[]
  for url in urls:
   target=local(url,p.parent)
   if target:pending.append(target)
 resources=[]
 for rel in sorted(selected):
  data=(root/rel).read_bytes();resources.append({'url':quote(rel,safe='/'),'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()})
 version=hashlib.sha256(json.dumps(resources,sort_keys=True,separators=(',',':')).encode()).hexdigest()[:24]
 return {'version':version,'bytes':sum(r['bytes'] for r in resources),'resources':resources}
def write(root):
 result=manifest(root);(Path(root)/NAME).write_text(json.dumps(result,separators=(',',':'))+'\n');return result
