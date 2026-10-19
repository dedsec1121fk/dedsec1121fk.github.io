#!/usr/bin/env python3
"""Build one DedSec source tree for GitHub Pages or Cloudflare Pages.

Selects the correct URLs from GITHUB_REPOSITORY / SITE_TARGET. Social metadata,
SEO files and article previews must be static because crawlers do not execute
client-side JS. This never edits source content or accesses any network.
"""
from __future__ import annotations
import argparse
import html
import hashlib
import json
import os
from pathlib import Path
import posixpath
import re
import shutil
import sys
import xml.etree.ElementTree as ET
from knowledge_catalogue import effective_rows
from build_site_search import rows as website_search_rows, generate as website_search_generate
from functools import lru_cache
from startup_manifest import write as write_startup_manifest

@lru_cache(maxsize=1)
def article_locales():
 return {row["id"]:row["l"] for row in effective_rows()}
from urllib.parse import quote, urlsplit, unquote, parse_qsl, urlencode, urljoin

BASE = Path(__file__).resolve().parents[1]
SOURCE = BASE / 'DedSec-Project-Website'
PROFILES = {
 'main': ('dedsec1121fk/dedsec1121fk.github.io','https://ded-sec.space/'),
 'test': ('dedsec1121fk/Test','https://dedsec1121fk.github.io/Test/'),
 'backup': ('sal-scar/ded-sec','https://ded-sec.online/'),
}
# Old metadata in ZIP used to point to production /Test/ instead of the real
# project-pages host. Always discard it and create static per-deployment cards.
OLD_CARD = re.compile(r'<!-- DEDSEC_TEST_SOCIAL_START -->[\s\S]*?<!-- DEDSEC_TEST_SOCIAL_END -->',re.I)
HEAD = re.compile(r'</head\s*>',re.I)
TITLE = re.compile(r'<title\b[^>]*>(.*?)</title\s*>',re.I|re.S)
META = re.compile(r'<meta\b[^>]*>',re.I|re.S)
LINK = re.compile(r'<link\b[^>]*>',re.I|re.S)
ATTR = re.compile(r'([\w:-]+)\s*=\s*(?:"([^"]*)"|\'([^\']*)\'|([^\s>]+))',re.S)
MD_INDEX = re.compile(r'window\.ARCHIVE_(EN|EL)\s*=\s*(\[.*\])\s*;\s*$',re.S)

def attr(tag):
 return {m.group(1).lower():html.unescape(next((v for v in m.groups()[1:] if v is not None),'')) for m in ATTR.finditer(tag)}
def esc(s):return html.escape(str(s),quote=True)
def title_text(s):return re.sub(r'\s+',' ',html.unescape(re.sub(r'<[^>]+>',' ',s))).strip()
def url_for(base,path=''):
 return base + quote(path,safe='/')
def rel_url(current,target):
 return posixpath.relpath(target,posixpath.dirname(current) or '.')
def index_rows(l):
 raw=(SOURCE/'data'/f'{l}.js').read_text('utf8')
 m=MD_INDEX.search(raw)
 if not m:raise RuntimeError('Invalid '+l+' lesson index')
 return json.loads(m.group(2))
def excerpt(body,limit=220):
 clean=re.sub(r'(?ms)^\s*(?:```|~~~)[^\n]*\n.*?^\s*(?:```|~~~)\s*$',' ',body)
 clean=re.sub(r'\[[^\]]+\]\(([^)]+)\)',' ',clean)
 clean=re.sub(r'[#*|>`\[\]\\]',' ',clean)
 clean=re.sub(r'\s+',' ',clean).strip()
 if len(clean)>limit:
  clean=clean[:limit].rsplit(' ',1)[0].rstrip('.,;:')+'…'
 return clean or 'Bilingual programming and troubleshooting knowledge from DedSec Project.'

def metadata(raw,output_rel,canonical_rel,base,profile,descriptive=None,image_path='Assets/Images/og/og-dark.jpg',lang_hint=None):
 if not HEAD.search(raw):raise ValueError('No head terminator: '+output_rel)
 raw=OLD_CARD.sub('',raw)
 match=TITLE.search(raw)
 tt=title_text(match.group(1)) if match else ''
 if descriptive is not None:tt=descriptive[0]
 if not tt:tt='DedSec Project'
 lang=lang_hint or (re.search(r'<html\b[^>]*\blang\s*=\s*[\'"]?(\w+)',raw,re.I).group(1) if re.search(r'<html\b[^>]*\blang\s*=\s*[\'"]?(\w+)',raw,re.I) else 'en')
 locale='el' if lang.lower().startswith(('el','gr')) else 'en'
 desc=descriptive[1] if descriptive else ''
 if not desc:
  for mt in META.finditer(raw):
   props=attr(mt.group(0))
   if props.get('name','').lower()=='description':desc=title_text(props.get('content',''));break
 if not desc:desc=('Μάθε περισσότερα για το DedSec Project: ' if locale=='el' else 'Explore DedSec Project guides, learning and tools: ')+tt
 desc=desc.strip()[:320]
 def discard_meta(m):
  fields=attr(m.group(0));name=fields.get('name','').lower();prop=fields.get('property','').lower()
  if prop.startswith('og:') or name.startswith('twitter:') or name in ('robots','description'):
   return ''
  return m.group(0)
 def discard_link(m):
  return '' if attr(m.group(0)).get('rel','').lower() in ('canonical','alternate') else m.group(0)
 raw=META.sub(discard_meta,raw)
 raw=LINK.sub(discard_link,raw)
 full=url_for(base,canonical_rel)
 image=url_for(base,image_path)
 alt=tt+' — DedSec Project preview'
 robots='noindex,follow' if profile=='test' or output_rel.startswith('dedsec/') else 'index,follow,max-image-preview:large'
 names=[
  ('name','description',desc),('name','robots',robots),
  ('property','og:type','article' if output_rel.startswith('learn/') else 'website'),
  ('property','og:site_name','DedSec Project'),('property','og:title',tt),('property','og:description',desc),
  ('property','og:url',full),('property','og:locale','el_GR' if locale=='el' else 'en_US'),
  ('property','og:locale:alternate','en_US' if locale=='el' else 'el_GR'),
  ('property','og:image',image),('property','og:image:secure_url',image),
  ('property','og:image:type','image/jpeg'),('property','og:image:width','1200'),('property','og:image:height','630'),
  ('property','og:image:alt',alt),
  ('name','twitter:card','summary_large_image'),('name','twitter:title',tt),('name','twitter:description',desc),
  ('name','twitter:image',image),('name','twitter:image:alt',alt)
 ]
 canonical_id=' id="canonicalUrl"' if output_rel=='TikDev.html' else ''
 block=['<!-- DEDSEC_SOCIAL_STATIC_START -->',f'<link{canonical_id} rel="canonical" href="{esc(full)}">']
 if not any('icon' in attr(link.group(0)).get('rel','').split() for link in LINK.finditer(raw)):
  block.append('<link rel="icon" type="image/png" href="'+esc(rel_url(output_rel,'Favicons/favicon-48.png'))+'">')
 for kind,key,val in names:block.append(f'<meta {kind}="{key}" content="{esc(val)}">')
 block.append('<!-- DEDSEC_SOCIAL_STATIC_END -->')
 return HEAD.sub(lambda m:'\n'+'\n'.join(block)+'\n'+m.group(0),raw,count=1)

def localize_html(raw,output_rel,base,profile):
 # Keep explicit Main Website/Backup Website links that point to the domain root.
 # Deep links to public documents should remain inside this deployment.
 path_pat=re.compile(r'((?:href|src)\s*=\s*["\'])(https://(?:ded-sec\.space|ded-sec\.online)/(?:Pages|Assistance|el/Pages|el/Assistance|Assets|Favicons|el/Assistance|el/Pages)/[^"\']+)(["\'])',re.I)
 def rewrite(m):
  parts=urlsplit(html.unescape(m.group(2)))
  target=unquote(parts.path.lstrip('/'))
  suffix=('?'+parts.query if parts.query else '')+('#'+parts.fragment if parts.fragment else '')
  return m.group(1)+esc(rel_url(output_rel,target)+suffix)+m.group(3)
 raw=path_pat.sub(rewrite,raw)
 # Static JSON-LD structured URLs need canonical absolute links too.
 raw=re.sub(r'https://ded-sec\.space/(Pages|Assistance|el/Pages|el/Assistance)/',lambda m:base+m.group(1)+'/',raw)
 raw=re.sub(r'https://ded-sec\.online/(Pages|Assistance|el/Pages|el/Assistance)/',lambda m:base+m.group(1)+'/',raw)
 if output_rel=='TikDev.html':
  tikdev=re.compile(r'const DEPLOYMENT\s*=\s*Object\.freeze\(\{[\s\S]*?\}\);')
  replacement=('const DEPLOYMENT = Object.freeze({\n'
               '      repository: '+json.dumps(PROFILES[profile][0])+',\n'
               '      siteUrl: '+json.dumps(url_for(base,'TikDev.html'))+',\n'
               '      customDomain: '+json.dumps(urlsplit(base).hostname if profile!='test' else '')+'\n'
               '    });')
  raw,found=tikdev.subn(lambda m:replacement,raw,count=1)
  if found!=1:raise ValueError('Missing TikDev dynamic deployment profile')
 raw=raw.replace('data-deployment="test"','data-deployment="'+profile+'"')
 raw=raw.replace('data-repository="dedsec1121fk/Test"','data-repository="'+PROFILES[profile][0]+'"')
 return raw

def relocate_imported_links(raw,output_rel,out):
    """Fix ../ navigation after copying /dedsec/Pages to /Pages.

    Resolve links at their original source depth, then compute a relative URL
    from the new file. Only rewrite targets that actually exist in this build.
    """
    original='dedsec/'+output_rel
    attribute=re.compile(r'((?:href|src)\s*=\s*["\'])([^"\']+)(["\'])',re.I)
    def relink(m):
        value=html.unescape(m.group(2))
        part=urlsplit(value)
        if part.scheme or part.netloc or value.startswith(('#','//')):return m.group(0)
        path=unquote(part.path)
        if not path or path.startswith('/'):return m.group(0)
        dest=posixpath.normpath(posixpath.join(posixpath.dirname(original),path))
        if dest.startswith('../'):return m.group(0)
        # Both /dedsec/... and the public root alias exist, except for the
        # integrated homepage where only /index.html is canonical.
        public=dest[7:] if dest.startswith('dedsec/') else dest
        if public and (out/public).exists():dest=public
        if not (out/dest).exists():return m.group(0)
        suffix=('?'+part.query if part.query else '')+('#'+part.fragment if part.fragment else '')
        return m.group(1)+esc(rel_url(output_rel,dest)+suffix)+m.group(3)
    return attribute.sub(relink,raw)

def resolve_article_links(rendered,language,row,index_by_path):
    """Keep links inside archived code/knowledge usable in HTML previews."""
    archive_root=BASE/"Developer's Mind"/"Keep Programming Alive"/("English" if language=="en" else "Greek")
    origin=row["p"]
    link_tag=re.compile(r'(<a\b[^>]*?\bhref=")([^"]+)(")',re.I)
    def update(m):
        ref=html.unescape(m.group(2))
        parsed=urlsplit(ref)
        if ref.startswith('#read:'):
            ident=unquote(ref[6:])
            if not re.fullmatch(r'[a-z0-9-]{2,90}',ident,re.I):return m.group(1)+'../../index.html#library'+m.group(3)
            dest_lang=article_locales().get(ident,'en')
            return m.group(1)+'../'+dest_lang+'/'+quote(ident,safe='')+'.html'+m.group(3)
        if parsed.scheme or parsed.netloc or ref.startswith(("#","/")):return m.group(0)
        target=posixpath.normpath(posixpath.join(posixpath.dirname(origin),unquote(parsed.path)))
        if target.startswith(("../","/")) or target in ("","."):return m.group(0)
        if target in index_by_path:
            path=index_by_path[target]+".html"
        elif (archive_root/target).is_file():
            path="../../source/"+language+"/"+quote(target,safe="/")
        else:
            # A previous consolidation may have folded the referenced guide
            # into a different lesson. Link back to searchable library.
            path="../../index.html#library"
        return m.group(1)+esc(path)+m.group(3)
    return link_tag.sub(update,rendered)

def llm_markdown(body,language,row,index_by_path,base):
    """Make prose links usable from llms-full.txt; preserve fenced/inline code."""
    article=base+f'learn/{language}/{row["id"]}.html'
    def rewrite(match):
        ref=match.group(2);parts=urlsplit(ref)
        if parts.scheme or parts.netloc:return match.group(0)
        anchor=resolve_article_links('<a href="'+esc(ref)+'">',language,row,index_by_path)
        resolved=html.unescape(re.search(r'href="([^"]*)"',anchor)[1])
        uri=urljoin(article,resolved) if not resolved.startswith('/') else url_for(base,resolved.lstrip('/'))
        return match.group(1)+uri+match.group(3)
    result=[];fence=None
    for line in body.splitlines(keepends=True):
        marker=re.match(r'^ {0,3}(`{3,}|~{3,})',line)
        if marker:
            run=marker[1]
            if fence is None:fence=(run[0],len(run))
            elif run[0]==fence[0] and len(run)>=fence[1]:fence=None
            result.append(line);continue
        if fence is not None:result.append(line);continue
        spans=re.split(r'(`+.*?`+)',line)
        result.append(''.join(part if i%2 else re.sub(r'(\]\()([^\n)]+)(\))',rewrite,part) for i,part in enumerate(spans)))
    return ''.join(result)

def relocate_imported_css(raw,output_rel,out):
 original='dedsec/'+output_rel
 def replace(match):
  value=match.group(2);parts=urlsplit(value)
  if parts.scheme or parts.netloc or not parts.path or parts.path.startswith('/'):return match.group(0)
  dest=posixpath.normpath(posixpath.join(posixpath.dirname(original),unquote(parts.path)))
  public=dest[7:] if dest.startswith('dedsec/') else dest
  if (out/public).is_file():dest=public
  if not (out/dest).is_file():return match.group(0)
  suffix=('?'+parts.query if parts.query else '')+('#'+parts.fragment if parts.fragment else '')
  return match.group(1)+rel_url(output_rel,dest)+suffix+match.group(3)
 return re.sub(r'(url\(["\']?)([^\s)"\']+)(["\']?\))',replace,raw)

def create_article(out,base,language,row,index_by_path):
 rid=row['id']
 if not re.fullmatch(r'[a-z0-9-]{2,90}',rid,re.I):raise ValueError('Unsafe lesson id '+repr(rid))
 file_rel=f'learn/{language}/{rid}.html'
 title=title_text(row['t'])+' — DedSec Project'
 body=row['b'];desc=excerpt(body,190)
 first=re.match(r'^# ([^\n]+)\n+',body)
 if first and title_text(first[1]).casefold()==title_text(row['t']).casefold():body=body[first.end():]
 if not row['p'].endswith('.md'):
  ext=Path(row['p']).suffix.lstrip('.') or 'text'
  body='## '+('Αναφορά πηγαίου κώδικα' if language=='el' else 'Source reference')+'\n\n~~~'+ext+'\n'+body+'\n~~~\n'
 try:
  import mistune
  renderer=mistune.create_markdown(escape=True,plugins=['table','strikethrough'])
  content=renderer(body)
  content=resolve_article_links(content,language,row,index_by_path)
 except ImportError:
  content='<pre>'+esc(body)+'</pre>'
 original='../../index.html#read:'+quote(rid,safe='')
 other_text='Πίσω' if language=='el' else 'Back'
 raw=f'''<!doctype html><html lang="{language}"><head><meta charset="utf-8"><script src="../../assets/boot.js"></script><meta name="viewport" content="width=device-width,initial-scale=1"><title>{esc(title)}</title>
 <script>(function(){{var t;try{{t=JSON.parse(localStorage.getItem('dedsec:theme'));}}catch(e){{}}document.documentElement.dataset.theme=t==='light'?'light':'dark';}})();</script>
 <style>:root{{color-scheme:dark;--paper:#090615;--ink:#fff;--link:#e4caff;--code:#171029;--line:#8064af}}:root[data-theme=light]{{color-scheme:light;--paper:#fefbff;--ink:#111;--link:#4b246b;--code:#f0e8fa;--line:#705285}}html{{background:var(--paper);color:var(--ink);font:16px/1.65 Tahoma,"MS Sans Serif",sans-serif}}body{{max-width:860px;margin:0 auto;padding:1.2rem}}a{{color:var(--link)}}button{{font:inherit;color:var(--ink);background:transparent;border:1px solid var(--line);padding:.5rem .75rem;cursor:pointer}}header{{display:flex;gap:1rem;justify-content:space-between;flex-wrap:wrap;padding:1rem 0;border-bottom:1px solid #44345c}}main{{padding-bottom:3rem}}h1,h2,h3{{line-height:1.28}}h1{{font-size:2rem}}h2{{margin-top:2rem}}pre{{white-space:pre;overflow:auto;padding:1rem;background:var(--code);border:1px solid var(--line)}}code{{overflow-wrap:anywhere}}blockquote{{border-left:3px solid #8f73c0;padding-left:1rem}}table{{display:block;overflow-x:auto}}img{{max-width:100%}}.back{{padding:.5rem .75rem;border:1px solid #8064af}}</style><link rel="stylesheet" href="../../assets/page-controls.css"></head><body>
 <header><strong>DedSec Project</strong><button id="article-theme" type="button" aria-label="{'Εναλλαγή φωτεινού ή σκοτεινού θέματος' if language=='el' else 'Switch light or dark theme'}">☾ / ☀</button></header>
 <main><h1>{esc(title)}</h1><p>{esc(desc)}</p><section>{content}</section></main>
 <footer>© 2024–2026 DedSec Project · <a href="../../index.html">{"Αρχική" if language=="el" else "Home"}</a> · <a href="https://github.com/dedsec1121fk/dedsec1121fk.github.io" target="_blank" rel="noopener noreferrer">{"Αποθετήριο Ιστοσελίδας" if language=="el" else "Website Repository"}</a></footer><script>document.getElementById('article-theme').addEventListener('click',function(){{var t=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=t;try{{localStorage.setItem('dedsec:theme',JSON.stringify(t));}}catch(e){{}}}});</script><script src="../../assets/page-controls.js"></script></body></html>'''
 raw=metadata(raw,file_rel,file_rel,base,'test' if '/Test/' in base else 'main',(title,desc),lang_hint=language)
 dst=out/file_rel;dst.parent.mkdir(parents=True,exist_ok=True);dst.write_text(raw,'utf8')
 return file_rel

def sitemap_xml(base,paths,alternates):
 ns='http://www.sitemaps.org/schemas/sitemap/0.9';xhtml='http://www.w3.org/1999/xhtml'
 ET.register_namespace('',ns);ET.register_namespace('xhtml',xhtml)
 root=ET.Element('{'+ns+'}urlset')
 for path in sorted(paths):
  loc=url_for(base,path)
  entry=ET.SubElement(root,'{'+ns+'}url')
  ET.SubElement(entry,'{'+ns+'}loc').text=loc
  alts=alternates.get(path)
  if alts:
   for lang,target in alts.items():ET.SubElement(entry,'{'+xhtml+'}link',{'rel':'alternate','hreflang':lang,'href':url_for(base,target)})
 return ET.tostring(root,encoding='utf-8',xml_declaration=True)

def build(target,out,base_override=None):
 repo,base=PROFILES[target]
 if base_override:
  base=base_override.strip().rstrip('/')+'/'
  if not re.fullmatch(r'https://[^/#?]+(?:/[A-Za-z0-9._~-]+)*/',base):raise ValueError('SITE_URL must be an HTTPS origin plus optional path')
 if out.resolve()==SOURCE.resolve() or out.resolve()==BASE.resolve():raise ValueError('Unsafe output path')
 if out.exists():shutil.rmtree(out)
 shutil.copytree(SOURCE,out)
 (out/"data/site-search.js").write_text(website_search_generate(),"utf8")
 # Put the imported official DedSec pages/assets at the exact established root
 # URLs too; preserve the integrated UI's own /dedsec/... references.
 imp=out/'dedsec'
 for child in list(imp.iterdir()):
  dst=out/child.name
  if child.name in ('index.html','404.html'):continue
  if dst.exists():
   if child.is_dir():shutil.copytree(child,dst,dirs_exist_ok=True)
   continue
  if child.is_dir():shutil.copytree(child,dst)
  else:shutil.copy2(child,dst)
 if (imp/'404.html').exists():shutil.copy2(imp/'404.html',out/'404.html')
 # CSS copied from /dedsec/Assets to /Assets changes depth too.
 for copied_css in out.rglob('*.css'):
  rel=copied_css.relative_to(out).as_posix()
  if not rel.startswith('dedsec/') and (SOURCE/'dedsec'/rel).is_file():
   copied_css.write_text(relocate_imported_css(copied_css.read_text('utf8'),rel,out),'utf8')
 pagefiles=list(out.rglob('*.html'))
 # Learn in English/Greek gets a human-readable pre-rendered public URL,
 # unlike #read:foo, which social bots would only treat as the homepage.
 all_lessons=effective_rows()
 lessons={lang:[row for row in all_lessons if row['l']==lang] for lang in ('en','el')}
 indexes={lang:{row['p']:row['id'] for row in rows} for lang,rows in lessons.items()}
 archive=BASE/"Developer's Mind"/"Keep Programming Alive"
 for lang,folder in (('en','English'),('el','Greek')):
  shutil.copytree(archive/folder,out/'source'/lang)
 # Persist auxiliary catalogue sources too, so relative reference links work offline.
 for lang in ('en','el'):
  for row in lessons[lang]:
   path=out/'source'/lang/row['p']
   path.parent.mkdir(parents=True,exist_ok=True)
   if not path.exists():path.write_text(row['b']+'\n',encoding='utf8')
 articles=[]
 for lang in ('en','el'):
  for row in lessons[lang]:articles.append(create_article(out,base,lang,row,indexes[lang]))
 
 static_count=0
 indexed=[];alt_map={}
 for path in pagefiles:
  rel=path.relative_to(out).as_posix()
  if rel.startswith('dedsec/'):
   canonical=rel[7:]
   if canonical=='index.html':canonical=''
   if canonical=='el/index.html':canonical='el/'
  else:
   canonical='' if rel=='index.html' else 'el/' if rel=='el/index.html' else rel
  raw=path.read_text('utf8')
  raw=localize_html(raw,rel,base,target)
  if rel!='index.html' and not rel.startswith(('dedsec/','learn/')) and rel!='TikDev.html':
   raw=relocate_imported_links(raw,rel,out)
  raw=metadata(raw,rel,canonical,base,target)
  path.write_text(raw,'utf8')
  static_count+=1
  # Avoid duplicate copies and robots-blocked 404 paths in public sitemap.
  if not rel.startswith('dedsec/') and '/404' not in rel and rel!='404.html' and rel!='el/index.html':indexed.append(canonical)
 indexed.append('')
 indexed+=articles
 indexed=sorted(set(indexed))
 # Translate stable public pages using physical directory equivalence only.
 actual=set(indexed)
 for name in sorted(actual):
  if name.startswith(('Pages/','Assistance/')) and 'el/'+name in actual:
   pair={'en':name,'el':'el/'+name,'x-default':name}
   alt_map[name]=pair;alt_map['el/'+name]=pair
 if 'el/index.html' in [p.relative_to(out).as_posix() for p in pagefiles]:
  alt_map['']={'en':'','el':'el/','x-default':''}
 indexed=[x for x in indexed if x!='el/index.html']
 if 'el/index.html' in [p.relative_to(out).as_posix() for p in pagefiles]:indexed.append('el/')
 (out/'sitemap.xml').write_bytes(sitemap_xml(base,indexed,alt_map))
 (out/'robots.txt').write_text(
  ('# Private staging / no search indexing\nUser-agent: *\nDisallow: /\n' if target=='test' else '# DedSec Project public website\nUser-agent: *\nAllow: /\n')+
  '\nSitemap: '+url_for(base,'sitemap.xml')+'\n','utf8')
 nav=[('Home / Αρχική',''),('Installation / Εγκατάσταση','Pages/guide-for-installation.html'),('Tools / Εργαλεία','Pages/learn-about-the-tools.html'),('Assistance / Βοήθεια','Pages/assistance.html'),('FAQ / Συχνές ερωτήσεις','Pages/faq.html'),('TikDev','TikDev.html')]
 intro='''# DedSec Project — official bilingual website and learning library\n\n> DedSec Project provides a free Android/Termux and Linux toolkit, documentation, programming lessons, troubleshooting, and defensive security education. Public toolkit: https://github.com/dedsec1121fk/DedSec. Ethical and authorized use only.\n\n'''
 links='\n'.join('- ['+t+']('+url_for(base,p)+')' for t,p in nav)
 choices=[]
 for lang in ('en','el'):
  for row in lessons[lang][:28]:choices.append('- ['+title_text(row['t'])+']('+url_for(base,f'learn/{lang}/{row["id"]}.html')+')')
 (out/'llms.txt').write_text(intro+'## Official pages\n'+links+'\n\n## Selected practical guides (English and Greek)\n'+'\n'.join(choices)+'\n\n## Full index\n- [Full website and lesson content]('+url_for(base,'llms-full.txt')+')\n- [XML sitemap]('+url_for(base,'sitemap.xml')+')\n\n## Notes\nInstructional articles are maintained in paired English/Greek source files. Verify version-specific commands, APIs and permissions against current documentation; avoid implying that all platform-specific examples were executed.\n','utf8')
 fulltext=[intro,'## Website pages / Σελίδες ιστοσελίδας\n']
 for page in website_search_rows():
  public=page['url'][7:] if page['url'].startswith('dedsec/') else page['url']
  fulltext.extend(['\n### '+title_text(page['t'])+' ['+page['l']+']\n','Source-URL: '+url_for(base,public.split('#')[0])+('#'+public.split('#',1)[1] if '#' in public else '')+'\n',page['b']+'\n'])
 for lang in ('en','el'):
  fulltext.append('\n## '+('English lessons' if lang=='en' else 'Ελληνικά μαθήματα')+'\n')
  for row in lessons[lang]:
   fulltext.extend(['\n### '+title_text(row['t'])+'\n','Source-URL: '+url_for(base,f'learn/{lang}/{row["id"]}.html')+'\n',(llm_markdown(row['b'],lang,row,indexes[lang],base) if row['p'].endswith('.md') else row['b'])+'\n'])
 (out/'llms-full.txt').write_text('\n'.join(fulltext),'utf8')
 if target in ('main','backup'):
  (out/'CNAME').write_text(urlsplit(base).hostname+'\n','utf8')
 else:
  (out/'CNAME').unlink(missing_ok=True)
 # Version local JS/CSS URLs so an existing browser cannot combine old modules
 # with new consumers immediately after publication. Paths remain offline-safe.
 digest_cache={}
 for document in list(out.rglob('*.html')):
  raw=document.read_text('utf8')
  def version_resource(match):
   value=html.unescape(match.group(2));parts=urlsplit(value)
   if parts.scheme or parts.netloc or not parts.path.endswith(('.js','.css')):return match.group(0)
   target=out/unquote(parts.path).lstrip('/') if parts.path.startswith('/') else document.parent/unquote(parts.path)
   if not target.is_file():return match.group(0)
   target=target.resolve()
   if target not in digest_cache:digest_cache[target]=hashlib.sha256(target.read_bytes()).hexdigest()[:12]
   query=[(key,value) for key,value in parse_qsl(parts.query,keep_blank_values=True) if key!='v']
   query.append(('v',digest_cache[target]))
   result=parts.path+'?'+urlencode(query)+('#'+parts.fragment if parts.fragment else '')
   return match.group(1)+esc(result)+match.group(3)
  raw=re.sub(r'((?:src|href)=["\'])([^"\']+)(["\'])',version_resource,raw)
  document.write_text(raw,'utf8')
 (out/'.nojekyll').touch()
 manifest={'profile':target,'repository':repo,'base_url':base,'html_static_count':static_count,'preview_pages_by_language':{k:len(v) for k,v in lessons.items()},'sitemap_urls':len(indexed),'sitemap_location':url_for(base,'sitemap.xml'),'robots_policy':'noindex' if target=='test' else 'index'}
 (out/'deployment-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n','utf8')
 write_startup_manifest(out)
 print(json.dumps(manifest,ensure_ascii=False))
 return manifest

def main():
 parser=argparse.ArgumentParser()
 parser.add_argument('--target',choices=['auto',*PROFILES],default=os.getenv('SITE_TARGET','auto'))
 parser.add_argument('--output',default='.site-publish')
 parser.add_argument('--site-url',default=os.getenv('SITE_URL'))
 args=parser.parse_args()
 target=args.target
 if target=='auto':
  cur=os.getenv('GITHUB_REPOSITORY','').casefold()
  found=[t for t,(repo,url) in PROFILES.items() if repo.casefold()==cur]
  if not found:parser.error('Set SITE_TARGET=main|test|backup or use one of the three verified GitHub repositories')
  target=found[0]
 build(target,Path(args.output).resolve(),args.site_url)
if __name__=='__main__':main()
