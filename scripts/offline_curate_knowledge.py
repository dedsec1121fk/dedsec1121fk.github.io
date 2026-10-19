#!/usr/bin/env python3
"""Editorial consolidation of an uploaded, bilingual *offline* knowledge archive.

Preserve original subject matter and executable examples by merging compact entries
into readable, topical lessons. Never synthesize fake experiments or boilerplate.
Builds consistent website data and offline Markdown; writes a mapping of every old
record to its retained target. Running this tool twice is prohibited on a curated
archive (safe check using manifest).
"""
from __future__ import annotations
from pathlib import Path
from collections import Counter, defaultdict
import hashlib
import json
import posixpath
import re
import shutil

ROOT=Path(__file__).resolve().parents[1]
DATA=ROOT/'DedSec-Project-Website'/'data'
ARCHIVE=ROOT/"Developer's Mind"/'Keep Programming Alive'
DOCS=ROOT/'Documentation'
MARK=DOCS/'OFFLINE_CURATION_MANIFEST.json'
GROUPS={
 'Γλώσσες_Προγραμματισμού':'Programming_Languages',
 'Γλωσσάρι_Ορολογίας':'Terminology_Glossary',
 'Εγχειρίδιο_Σφαλμάτων':'Error_Encyclopedia',
 'Εγκυκλοπαίδεια_Γνώσης':'Knowledge_Encyclopedia',
 'Πρακτικά_Σενάρια_Κώδικα':'Practical_Script_Labs',
 'Αλγόριθμοι_Ασκήσεις':'Algorithms_Practice',
 'Θεμέλια':'Foundations',
 'Βαθύτερη_Γνώση':'Deep_Knowledge',
 'Μηχανική_Ασφάλειας':'Security_Engineering',
 'Προχωρημένα_Εργαστήρια_Μηχανικής':'Advanced_Engineering_Labs',
 'Αποσφαλμάτωση_και_Διορθωμένα_Παραδείγματα':'Debugging_and_Fixed_Examples',
 'Εκπαιδευτικά_Έργα':'Learning_Projects',
 'Έτοιμα_Παραδείγματα':'Ready_to_Copy_Recipes',
 'Διαδρομές_Εκμάθησης':'Learning_Paths',
}
SPECIAL_DOCS={
 '00_index':'index','00_ευρετηριο':'index',
 'common_practice_standard':'practice','κοινες_αρχες_ασκησεων':'practice',
 'lesson_template':'template','προτυπο_μαθηματος':'template'
}
EXT_RE=re.compile(r'window\.ARCHIVE_LESSON_EXTENSIONS=\(window\.ARCHIVE_LESSON_EXTENSIONS\|\|\[\]\)\.concat\((\[.*\])\);\s*$',re.S)
PADDING=re.compile(r'(?im)(?:Source cue for|Validation for [^\n]*\.md|investigation [1-9]|Αφετηρία για|Επαλήθευση για [^\n]*\.md|διερεύνηση [1-9])')
EMPTIES=re.compile(r'(?m)^## [^\n]+\n[ \t]*\n(?=## |\Z)')

def load(lang):
    raw=(DATA/(lang+'.js')).read_text('utf8');v='EN' if lang=='en' else 'EL'
    m=re.fullmatch(r'\s*window\.ARCHIVE_'+v+r'\s*=\s*(\[.*\])\s*;\s*',raw,re.S)
    if not m:raise ValueError('Invalid '+lang+' archive')
    return json.loads(m.group(1))

def key(row):
    p=Path(row['p']);parts=p.parts
    g=GROUPS.get(parts[0],parts[0]);stem=p.stem;ext=p.suffix.lower()
    if g=='Programming_Languages':
        if len(parts)>=4:
            prefix=re.match(r'^\d\d',stem)
            sub=prefix.group() if prefix else stem.lower()
            return f'lang|{parts[-2].lower()}|{sub}{ext}'
        if len(parts)==3:return f'lang|{stem.lower()}|overview{ext}'
        if len(parts)==2:return f'programming|{SPECIAL_DOCS.get(stem.lower(),stem.lower())}{ext}'
    if g=='Learning_Projects':
        m=re.match(r'^\d\d',stem)
        return 'project|'+parts[1].lower()+'|'+(m.group() if m else stem.lower())+ext
    if g=='Reverse Engineering':return 'reverse|'+stem.lower()+ext
    m=re.match(r'^\d+',stem)
    if m:return f'{g}|{m.group()}{ext}'
    return f'{g}|{stem.lower()}{ext}'

def group_key(row):
    p=Path(row['p']);parts=p.parts
    cat=GROUPS.get(parts[0],parts[0])
    if cat=='Programming_Languages':
        if len(parts)>=4: return cat+'|'+parts[-2].lower()
        if len(parts)==3: return cat+'|'+p.stem.lower()
        return cat+'|INDEX'
    if cat=='Learning_Projects':return cat+'|'+parts[1].lower()
    if cat=='Reverse Engineering':return cat+'|reverse'
    return cat

def load_overlays():
    files={};registry={}
    for path in sorted(DATA.glob('lesson-expansions-*.js')):
        if path.name=='lesson-expansions-termux-curated.js':continue
        text=path.read_text('utf8');match=EXT_RE.search(text)
        if not match:raise ValueError('Malformed extension '+str(path))
        rows=json.loads(match.group(1));files[path]=(text[:match.start()],rows)
        for r in rows:
            k=r['l'],r['p']
            if k in registry:raise ValueError('Duplicate extension '+repr(k))
            registry[k]=r
    return files,registry

def clean(body):
    body=body.strip()
    # Remove full synthetic investigation triplets only; do not delete substantive paragraphs.
    pattern=re.compile(r'\n+## [^\n]+ — (?:investigation|διερεύνηση) [1-9]\d*\n[^\n]*\n\n\*\*(?:Source cue for|Αφετηρία για)[^\n]*\n\n\*\*(?:Validation for|Επαλήθευση για)[^\n]*')
    body=pattern.sub('',body)
    body=EMPTIES.sub('',body)
    return body.strip()

def normalized(s):return ' '.join(s.casefold().split())

def unique_paras(body,seen):
    result=[]
    for paragraph in re.split(r'\n\s*\n',body):
        part=normalized(paragraph)
        # Only long prose paragraphs are eligible for cross-document deduplication;
        # snippets, diagrams, examples and source references must survive intact.
        if len(part)>140 and not paragraph.lstrip().startswith(('~~~','```','|')):
            digest=hashlib.sha256(part.encode()).digest()
            if digest in seen:continue
            seen.add(digest)
        result.append(paragraph)
    return '\n\n'.join(result).strip()

def make_section(source,lang,seen):
    row,body=source
    body=clean(body)
    # remove first header when it repeats the table of contents heading
    lines=body.splitlines()
    if lines and lines[0].startswith('# '):body='\n'.join(lines[1:]).strip()
    body=unique_paras(body,seen)
    # source sections become subsections; preserve fenced code exactly.
    body=re.sub(r'(?m)^(#{2,5})\s+',lambda m:'#'+m.group(1)+' ',body)
    return '## '+row['t'].strip()+'\n\n'+body if body else ''

def write():
    if MARK.exists():
        raise RuntimeError('Already curated: offline curation refuses to run twice')
    indexes={l:load(l) for l in ('en','el')}
    overlays,patches=load_overlays()
    catalog={l:{} for l in indexes}
    effective={}
    for l,rows in indexes.items():
        for r in rows:
            ident=key(r)
            if ident in catalog[l]:raise ValueError('Topic key collision '+l+':'+ident)
            catalog[l][ident]=r
            p=patches.get((l,r['p']))
            effective[(l,ident)]=clean(p['append'] if p and p.get('mode')=='replace' else r['b']+'\n\n'+p['append'] if p else r['b'])
    all_ids=set(catalog['en'])
    if all_ids!=set(catalog['el']):
        diff=sorted(all_ids.symmetric_difference(set(catalog['el'])))
        raise ValueError('Unpaired canonical topic keys: '+repr(diff[:20]))

    grouped=defaultdict(list)
    for ident in sorted(all_ids):
        grouped[group_key(catalog['en'][ident])].append(ident)
    # Check groups derived by topic are identical in both locales.
    for ident in all_ids:
        if group_key(catalog['en'][ident])!=group_key(catalog['el'][ident]):
            raise ValueError('Topic group mismatch '+ident)

    # Retain all non-Markdown source files untouched and separately findable.
    retained={i for i in all_ids if not catalog['en'][i]['p'].endswith('.md')}
    bundle_groups=[]
    # Language guides are consolidated by individual language, preventing
    # hundreds of near-identical one-paragraph 'mastery' articles.
    for grp,keys in sorted(grouped.items()):
        md=[i for i in keys if catalog['en'][i]['p'].endswith('.md')]
        if not md:continue
        if grp.startswith('Programming_Languages|') and grp!='Programming_Languages|INDEX':
            # Preserve full, independently reviewed individual workbooks; other
            # pages are assembled as one language guide.
            protected=[i for i in md if any(x in catalog['en'][i]['p'] for x in ('01_EXPANDED_WORKBOOK.md',)) and
                       any(x in catalog['en'][i]['p'] for x in ('/Logo/','/Scratch_textual_pseudocode/','/Brainfuck/','/Erlang/','/Factor/','/Gleam/','/PureScript/','/ReasonML/','/GameMaker_Language/','/Objective_C/','/Visual_Basic_NET/'))]
            md=[i for i in md if i not in protected]
            retained.update(protected)
            if md:bundle_groups.append(md)
        else:
            # Keep substantive, already distinctive complete guides separate.
            # Group smaller entries into topical reference chapters by sequence.
            good=[];short=[]
            for i in md:
                en=effective['en',i];el=effective['el',i]
                valid=lambda s:len(s)>=1700 and not PADDING.search(s) and not EMPTIES.search(s)
                if valid(en) and valid(el):good.append(i)
                else:short.append(i)
            retained.update(good)
            if short:
                chunks=[];pending=[]
                for i in short:
                    pending.append(i)
                    if len(pending)>=5 or (len(pending)>=3 and min(sum(len(effective[l,x]) for x in pending) for l in ('en','el'))>3000):
                        chunks.append(pending);pending=[]
                if pending:
                    if chunks:chunks[-1].extend(pending)
                    else:chunks=[pending]
                bundle_groups.extend(chunks)

    # Select a deterministic original identifier and path for each bundle,
    # avoiding any new ID collisions or need for a migration UI.
    redirects={'en':{},'el':{}}
    bundles=[]
    for keys in bundle_groups:
        if not keys:continue
        # Order local headings in their source-file order rather than English/Greek alphabet.
        if keys[0].startswith('lang|'):
            keys.sort(key=lambda i:(0 if '|overview.md' in i else 1,i))
        else:keys.sort()
        target=keys[0]
        bundles.append((target,keys))
        retained.add(target)
        for l in ('en','el'):
            for i in keys:redirects[l][catalog[l][i]['p']]=catalog[l][target]['p']

    # Merge only distinct existing teaching content; avoid repetitive templates.
    merged={}
    for target,keys in bundles:
        for l in ('en','el'):
            seen=set();chunks=[]
            for i in keys:
                section=make_section((catalog[l][i],effective[l,i]),l,seen)
                if section:chunks.append(section)
            selected=catalog[l][target]
            if target.startswith('lang|'):
                language=target.split('|')[1]
                label=(language+' — consolidated language guide') if l=='en' else (language+' — συγκεντρωτικός οδηγός')
            else:
                names=[catalog[l][i]['t'] for i in keys[:3]]
                joiner=', ' if l=='en' else ', '
                label=('Topics: ' if l=='en' else 'Θέματα: ')+joiner.join(names)
            title='# '+label
            body=title+'\n\n'+'\n\n'.join(chunks)
            merged[l,target]=(label,body)

    # If a small language consists of one original short note, merge with
    # another in the same broad programming category rather than pad it.
    deficient=[]
    for target,keys in bundles:
        if any(len(merged[l,target][1])<1500 for l in ('en','el')):
            deficient.append(target)
    if deficient:
        # Keep rare-language coverage as dedicated *grouped* reference chapters
        # and move their original anchor under a sibling with enough content.
        grpmap=defaultdict(list)
        for target in deficient:
            path=catalog['en'][target]['p'];bucket=Path(path).parts[1] if path.startswith('Programming_Languages/') else path.split('/')[0]
            grpmap[bucket].append(target)
        for bucket,targets in grpmap.items():
            # every program doc in the same family should be in one of these bundles
            family=[i for i in retained if catalog['en'][i]['p'].split('/')[0]=='Programming_Languages' and Path(catalog['en'][i]['p']).parts[1]==bucket]
            for key_to_absorb in targets:
                candidates=[i for i in family if i!=key_to_absorb and (('en',i) in merged)]
                if not candidates:continue
                destination=max(candidates,key=lambda i:len(merged['en',i][1]))
                for l in ('en','el'):
                    label,body=merged[l,destination]
                    merged[l,destination]=(label,body+'\n\n'+merged[l,key_to_absorb][1].replace('# ','## ',1))
                    old=catalog[l][key_to_absorb]['p'];new=catalog[l][destination]['p']
                    for p,to in list(redirects[l].items()):
                        if to==old:redirects[l][p]=new
                    redirects[l][old]=new
                merged.pop(('en',key_to_absorb),None);merged.pop(('el',key_to_absorb),None)
                retained.discard(key_to_absorb)

    # Last resort: merge remaining short bundle with the closest retained topic
    # in the same category; no fabricated text is ever added.
    for target,keys in bundles:
        if ('en',target) not in merged:continue
        if all(len(merged[l,target][1])>=1500 for l in ('en','el')):continue
        grp=group_key(catalog['en'][target]);family=[i for i in retained if i!=target and group_key(catalog['en'][i])==grp and ('en',i) in merged]
        if not family:
            family=[i for i in retained if i!=target and catalog['en'][i]['p'].split('/')[0]==catalog['en'][target]['p'].split('/')[0] and ('en',i) in merged]
        if family:
            dest=max(family,key=lambda i:len(merged['en',i][1]))
            for l in ('en','el'):
                label,body=merged[l,dest]
                merged[l,dest]=(label,body+'\n\n'+merged[l,target][1].replace('# ','## ',1))
                src=catalog[l][target]['p'];dst=catalog[l][dest]['p']
                for p,to in list(redirects[l].items()):
                    if to==src:redirects[l][p]=dst
                redirects[l][src]=dst
            merged.pop(('en',target),None);merged.pop(('el',target),None)
            retained.discard(target)

    # Existing indexed lessons are the source of truth for the archive. Remove
    # unindexed generated leftovers only if they are strict clones of indexed
    # content; leave supplemental Termux and maintenance documents intact.
    remaining_md={l:{catalog[l][i]['p'] for i in retained if catalog[l][i]['p'].endswith('.md')} for l in ('en','el')}
    before_counts={l:len(indexes[l]) for l in indexes}
    for l in ('en','el'):
        out=[]
        for row in indexes[l]:
            i=key(row)
            if i not in retained:continue
            row=dict(row)
            if (l,i) in merged:
                row['t'],row['b']=merged[l,i]
            elif row['p'].endswith('.md'):
                row['b']=effective[l,i]
            out.append(row)
        indexes[l]=out

    # Rewrite local links in retained documents to the new retained target.
    # Does not touch web URLs, badges, or code fences.
    def rewrite_links(content,lang,origin):
        lookup=redirects[lang]
        def fix(m):
            full=m.group(1);target=m.group(2)
            if target.startswith(('http:','https:','mailto:','#','data:')):return m.group(0)
            clean_target=target.split('#',1)[0]
            if not clean_target:return m.group(0)
            clean_target=clean_target.replace('%20',' ')
            absolute=posixpath.normpath(posixpath.join(posixpath.dirname(origin),clean_target))
            if absolute not in lookup:return m.group(0)
            resolved=lookup[absolute]
            new=posixpath.relpath(resolved,posixpath.dirname(origin) or '.')
            suffix='#'+target.split('#',1)[1] if '#' in target else ''
            return ']('+new.replace(' ','%20')+suffix+')'
        return re.sub(r'\]\(([^\s\)]+)\)',lambda m:fix((lambda r:r)(m)) if False else m.group(0),content)
    # Replace links using original link target capture, preserving labels.
    def fixbody(body,lang,origin):
        lookup=redirects[lang];lines=body.splitlines();in_code=False;out=[]
        for line in lines:
            stripped=line.lstrip()
            if stripped.startswith(('~~~','```')):in_code=not in_code
            if not in_code:
                def rep(m):
                    target=m.group(2)
                    if target.startswith(('http:','https:','mailto:','#','data:')):return m.group(0)
                    src=target.split('#')[0].replace('%20',' ')
                    absolute=posixpath.normpath(posixpath.join(posixpath.dirname(origin),src))
                    if absolute not in lookup:return m.group(0)
                    link=posixpath.relpath(lookup[absolute],posixpath.dirname(origin) or '.')
                    frag=('#'+target.split('#',1)[1]) if '#' in target else ''
                    return '['+m.group(1)+']('+link.replace(' ','%20')+frag+')'
                line=re.sub(r'\[([^\]]+)\]\(([^\s\)]+)\)',rep,line)
            out.append(line)
        return '\n'.join(out)
    for lang,rows in indexes.items():
        for row in rows:
            if row['p'].endswith('.md'):
                row['b']=fixbody(row['b'],lang,row['p'])

    # The overlays now carry old paths and are replaced by canonical, merged
    # index bodies; empty the obsolete patch arrays but keep script imports
    # valid for offline browser use, retaining Termux's independent catalogue.
    for path,(prefix,_) in overlays.items():
        path.write_text(prefix+'window.ARCHIVE_LESSON_EXTENSIONS=(window.ARCHIVE_LESSON_EXTENSIONS||[]).concat([]);\n',encoding='utf8')

    for l,var in [('en','ARCHIVE_EN'),('el','ARCHIVE_EL')]:
        (DATA/(l+'.js')).write_text('window.'+var+'='+json.dumps(indexes[l],ensure_ascii=False,separators=(',',':'))+';\n','utf8')

    # Erase removed indexed markdown, keeping code scripts; rewrite every
    # retained body to its accurate matching English / Greek Markdown path.
    for l,folder in [('en','English'),('el','Greek')]:
        for original in catalog[l].values():
            if original['p'].endswith('.md') and original['p'] not in remaining_md[l]:
                target=ARCHIVE/folder/original['p']
                if target.is_file():target.unlink()
        for row in indexes[l]:
            if not row['p'].endswith('.md'):continue
            target=ARCHIVE/folder/row['p'];target.parent.mkdir(parents=True,exist_ok=True)
            target.write_text(row['b'].strip()+'\n','utf8')

    # Validate no large verbatim repeated paragraphs, without erasing code.
    # Cross-document repetitions among independent retained guides get fixed
    # by moving only exact repeated prose into the richest target.
    for l,folder in [('en','English'),('el','Greek')]:
        owners={}
        for row in sorted(indexes[l],key=lambda r:-len(r['b'])):
            if not row['p'].endswith('.md'):continue
            parts=[];changed=False
            for par in re.split(r'\n\s*\n',row['b']):
                n=normalized(par)
                if len(n)>=140 and not par.lstrip().startswith(('~~~','```')):
                    if n in owners and owners[n]!=row['p']:
                        changed=True;continue
                    owners[n]=row['p']
                parts.append(par)
            if changed:
                row['b']='\n\n'.join(parts).strip()
                (ARCHIVE/folder/row['p']).write_text(row['b']+'\n','utf8')

    # No claimed execution evidence is invented. Manifest maps all originals
    # to the corresponding destination, so removed content is auditable.
    manifest={
        'original_records_per_language':before_counts,
        'retained_records_per_language':{l:len(indexes[l]) for l in indexes},
        'retained_markdown_per_language':{l:sum(r['p'].endswith('.md') for r in rows) for l,rows in indexes.items()},
        'merge_targets':len(merged)//2,
        'removed_index_entries':{l:before_counts[l]-len(indexes[l]) for l in indexes},
        'redirects':redirects,
        'rules':['Only exact topic-paired English/Greek records were merged','No replacement paragraphs were generated to satisfy length thresholds','Source code and reference fixtures are preserved in their original paths','Original course texts were consolidated by topic into existing article IDs','Tests are static unless explicitly executed and documented'],
    }
    MARK.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n','utf8')
    print('OFFLINE_CURATION:',json.dumps({k:v for k,v in manifest.items() if k!='redirects'},ensure_ascii=False))

if __name__=='__main__':write()
