#!/usr/bin/env python3
"""Audit every effective website record, including security and Termux catalogues.

Exact and near-duplicate detection are editorial checks, not fact certification.
Source-code listings are excluded from prose comparisons. Termux replacements
are applied before inspection so short superseded source records are not used.
"""
from collections import Counter, defaultdict
import hashlib
import json
import re
import sys
import posixpath
from urllib.parse import unquote
from knowledge_catalogue import effective_rows
from knowledge_catalogue import ROOT
from audit_knowledge_depth import inspect_fences

def prose_blocks(body):
    fence = None
    block = []
    for line in body.replace('\r\n', '\n').splitlines() + ['']:
        match = re.match(r'^ {0,3}(`{3,}|~{3,})(.*)$', line)
        if fence:
            if match and match[1][0] == fence[0] and len(match[1]) >= len(fence) and not match[2].strip():
                fence = None
            continue
        if match and not (match[1][0] == '`' and '`' in match[2]):
            if block:
                yield '\n'.join(block)
                block = []
            fence = match[1]
            continue
        if not line.strip() or line.startswith('#'):
            if block:
                yield '\n'.join(block)
                block = []
        else:
            block.append(line)

def normalized(text):
    return ' '.join(text.casefold().split())

def repeated_prose(rows, minimum=100):
    groups = defaultdict(list)
    for row in rows:
        if not row['p'].endswith('.md'):
            continue
        for number, part in enumerate(prose_blocks(row['b'])):
            text = normalized(part)
            if len(text) >= minimum and not text.startswith('|'):
                groups[(row['l'], text)].append((row['id'], number))
    return [dict(locale=k[0], text=k[1], occurrences=v) for k, v in groups.items() if len(v) > 1]

def audit(rows=None):
    rows = effective_rows() if rows is None else rows
    issues = []
    ids = Counter(row['id'] for row in rows)
    issues.extend('Duplicate ID: ' + ident for ident, count in ids.items() if count != 1)
    paths = Counter((row['l'], row['p']) for row in rows)
    issues.extend('Duplicate effective path: ' + repr(path) for path, count in paths.items() if count != 1)
    hashes = defaultdict(list)
    path_set = set(paths)
    for row in rows:
        if not all(isinstance(row.get(key), str) and row[key].strip() for key in ('id','l','t','p','b')):
            issues.append('Empty field: ' + row.get('id', '?'))
            continue
        if row['p'].endswith('.md'):
            hashes[(row['l'], hashlib.sha256(normalized(row['b']).encode()).hexdigest())].append(row['id'])
            archive = ROOT / "Developer's Mind" / 'Keep Programming Alive' / ('English' if row['l']=='en' else 'Greek')
            persisted = archive / row['p']
            if row['p'].startswith('Termux_Troubleshooting/'):
                persisted = archive / 'Termux_Troubleshooting' / row['p'].rsplit('/',1)[1]
            if persisted.is_file() and persisted.read_text(encoding='utf8').strip() != row['b'].strip():
                issues.append('Persisted source differs from reader: ' + row['id'])
            if not inspect_fences(row['b'])[1]:
                issues.append('Unclosed code fence: ' + row['id'])
            for block in prose_blocks(row['b']):
                for target in re.findall(r'\]\(([^\s)]+)\)', block):
                    if target.startswith(('http:', 'https:', 'mailto:', '#', 'data:')):
                        continue
                    dest = posixpath.normpath(posixpath.join(posixpath.dirname(row['p']), unquote(target.split('#')[0])))
                    source = ROOT / "Developer's Mind" / 'Keep Programming Alive' / ('English' if row['l']=='en' else 'Greek') / dest
                    if (row['l'], dest) not in path_set and not source.is_file():
                        issues.append('Missing relative reference: ' + row['id'] + ' -> ' + target)
        if '[external guide link omitted]' in row['b']:
            issues.append('Placeholder reference: ' + row['id'])
        for target in re.findall(r'\]\(#read:([^\s)]+)\)', row['b']):
            if target not in ids:
                issues.append('Missing internal lesson: ' + row['id'] + ' -> ' + target)
    issues.extend('Duplicate Markdown body: ' + repr(group) for group in hashes.values() if len(group) > 1)
    repeats = repeated_prose(rows)
    issues.extend('Repeated prose: ' + repr(hit['occurrences'][:5]) for hit in repeats)
    return {'effective_records': len(rows), 'locales': dict(Counter(r['l'] for r in rows)),
            'markdown_records': sum(r['p'].endswith('.md') for r in rows),
            'repeated_prose_groups': len(repeats), 'issues': issues,
            'limits': 'No automated check establishes the truth of every technical statement or full semantic uniqueness.'}

if __name__ == '__main__':
    result = audit()
    print('COMPLETE_CATALOGUE_AUDIT:', json.dumps(result, ensure_ascii=False, indent=2))
    sys.exit(bool(result['issues']))
