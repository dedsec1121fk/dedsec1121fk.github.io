#!/usr/bin/env python3
"""Offline Markdown cross-reference checker for an extracted DedSec knowledge ZIP."""
from pathlib import Path
from urllib.parse import unquote
import re
import sys
ROOT=Path(__file__).resolve().parents[1]
BASE=ROOT/"Developer's Mind"/"Keep Programming Alive"
pattern=re.compile(r'\[([^\]\n]{1,180})\]\(([^)\s]{1,320})\)')

def audit():
    broken=[];total=0
    for path in BASE.rglob('*.md'):
        fenced=False
        for lineno,line in enumerate(path.read_text(encoding='utf-8').splitlines(),1):
            if line.lstrip().startswith(('~~~','```')):
                fenced=not fenced;continue
            if fenced or '](' not in line:continue
            for _,raw in pattern.findall(line):
                if raw.startswith(('http:','https:','mailto:','#','data:')):continue
                target=path.parent/unquote(raw.split('#',1)[0])
                if target.exists():total+=1
                else:broken.append(f'{path.relative_to(ROOT)}:{lineno} -> {raw}')
    return total,broken
if __name__=='__main__':
    total,broken=audit()
    print(f'LOCAL_LINK_AUDIT: {total} valid references, {len(broken)} broken references')
    for item in broken[:30]:print('BROKEN',item)
    sys.exit(1 if broken else 0)
