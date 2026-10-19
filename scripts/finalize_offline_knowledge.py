#!/usr/bin/env python3
"""Finalize an already curated, bilingual offline Test archive, without network access.

Clean legacy auto-generated sentences, normalize destination links in the retained
catalogue and enforce source/website parity. Idempotent; does not change IDs.
"""
from __future__ import annotations
from collections import defaultdict
from pathlib import Path
import hashlib
import json
import posixpath
import re

ROOT=Path(__file__).resolve().parents[1]
DATA=ROOT/'DedSec-Project-Website'/'data'
ARCH=ROOT/"Developer's Mind"/'Keep Programming Alive'
MANIFEST=ROOT/'Documentation'/'OFFLINE_CURATION_MANIFEST.json'
BAD_LINE=re.compile(r'(?m)^\s*\*\*(?:Source cue for|Validation for|Αφετηρία για|Επαλήθευση για)[^\n]*\n?')
BAD_HEADING=re.compile(r'(?m)^## [^\n]+ — (?:investigation|διερεύνηση) [1-9]\d*\s*\n')
EMPTY_HEADING=re.compile(r'(?m)^## [^\n]+\n[ \t]*\n(?=## |\Z)')

def read(locale):
    v='EN' if locale=='en' else 'EL'
    s=(DATA/(locale+'.js')).read_text('utf8')
    m=re.fullmatch(r'window\.ARCHIVE_'+v+r'=(\[.*\]);\s*',s,re.S)
    if not m:raise ValueError('Missing archive '+locale)
    return json.loads(m.group(1))

def norm(s):return ' '.join(s.casefold().split())

def clean(body):
    body=BAD_LINE.sub('',body)
    body=BAD_HEADING.sub('',body)
    for _ in range(5):
        prev=body;body=EMPTY_HEADING.sub('',body)
        if body==prev:break
    return re.sub(r'\n{4,}','\n\n\n',body).strip()

def main():
    if not MANIFEST.exists():raise RuntimeError('No curation manifest: refuse editing unknown source')
    manifest=json.loads(MANIFEST.read_text('utf8'))
    datasets={l:read(l) for l in ('en','el')}
    stats={'legacy_filler_removed':0,'repeat_paragraphs_removed':0,'rewritten_links':0,'index_references_repaired':0,'archive_files_synced':0}
    for locale,rows in datasets.items():
        # Every source retains meaningful original material; remove the
        # repetitive generator annotations, not an author's explanation.
        for row in rows:
            if not row['p'].endswith('.md'):continue
            before=row['b'];row['b']=clean(row['b'])
            stats['legacy_filler_removed']+=len(BAD_LINE.findall(before))

        # Section links in the language index were formerly path-shaped code
        # spans, not actual Markdown links: update or drop obsolete targets.
        redirects=manifest['redirects'][locale]
        links={r['p'] for r in rows}
        for row in rows:
            if not row['p'].endswith('.md'):continue
            body=row['b']
            def replace_inline(m):
                # Preserve the context's label; replace only the link target.
                target=m.group(1)
                if target not in redirects or target in links:return m.group(0)
                replacement=redirects[target]
                if replacement not in links:return m.group(0)
                stats['index_references_repaired']+=1
                return '`'+replacement+'`'
            body=re.sub(r'`([^`\n]+\.md)`',replace_inline,body)
            row['b']=body

        # Deduplicate explanatory prose across retained documents. Never
        # deduplicate fenced source listings or paragraphs with very little
        # information, such as license language and references.
        seen={};sorted_rows=sorted([r for r in rows if r['p'].endswith('.md')],key=lambda x:-len(x['b']))
        for row in sorted_rows:
            parts=re.split(r'\n\s*\n',row['b'])
            keep=[]
            for part in parts:
                content=norm(part)
                ineligible=(len(content)<140 or part.lstrip().startswith(('~~~','```','|'))
                            or '~~~' in part or '```' in part)
                digest=hashlib.sha256(content.encode()).hexdigest()
                if not ineligible and digest in seen and seen[digest]!=row['p']:
                    stats['repeat_paragraphs_removed']+=1
                    continue
                keep.append(part)
                if not ineligible:seen.setdefault(digest,row['p'])
            row['b']=clean('\n\n'.join(keep))

        # Repair exact links from any retained page to a removed indexed page.
        def repaired(body,path):
            in_code=False;out=[]
            for line in body.splitlines():
                before=line
                if not in_code:
                    def sub(m):
                        target=m.group(2)
                        if target.startswith(('http:','https:','mailto:','#','data:')):return m.group(0)
                        fragment=target.split('#',1)
                        ref=posixpath.normpath(posixpath.join(posixpath.dirname(path),fragment[0].replace('%20',' ')))
                        if ref not in redirects or ref in links:return m.group(0)
                        dst=redirects[ref]
                        if dst not in links:return m.group(0)
                        stats['rewritten_links']+=1
                        rel=posixpath.relpath(dst,posixpath.dirname(path) or '.').replace(' ','%20')
                        return '['+m.group(1)+']('+rel+('#'+fragment[1] if len(fragment)>1 else '')+')'
                    line=re.sub(r'\[([^\]]+)\]\(([^\s\)]+)\)',sub,line)
                if before.lstrip().startswith(('~~~','```')):in_code=not in_code
                out.append(line)
            return '\n'.join(out)
        for row in rows:
            if row['p'].endswith('.md'):
                row['b']=repaired(row['b'],row['p'])

        v='EN' if locale=='en' else 'EL'
        (DATA/(locale+'.js')).write_text('window.ARCHIVE_'+v+'='+json.dumps(rows,ensure_ascii=False,separators=(',',':'))+';\n','utf8')
        folder='English' if locale=='en' else 'Greek'
        for row in rows:
            if row['p'].endswith('.md'):
                p=ARCH/folder/row['p'];p.parent.mkdir(parents=True,exist_ok=True)
                p.write_text(row['b'].strip()+'\n','utf8')
                stats['archive_files_synced']+=1
    print('OFFLINE_FINALIZED:',json.dumps(stats,ensure_ascii=False))
if __name__=='__main__':main()
