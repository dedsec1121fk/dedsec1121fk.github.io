"""Read all shipped lesson catalogues as JSON, without evaluating JavaScript.

Termux's replacement registry is applied exactly as in the website. Mirrors in
that registry are not separate lessons. Keep IDs and source paths stable.
"""
from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'DedSec-Project-Website' / 'data'
CATALOGUES = {
    'en.js': 'ARCHIVE_EN', 'el.js': 'ARCHIVE_EL',
    'methods.js': 'ARCHIVE_METHODS', 'hacking-guide.js': 'ARCHIVE_HACKING',
    'termux-troubleshooting.js': 'ARCHIVE_TERMUX',
    'deep-dive.js': 'ARCHIVE_DEEP_DIVE',
    'hacking-complete-1.js': 'ARCHIVE_HACKING_COMPLETE',
    'hacking-complete-2.js': 'ARCHIVE_HACKING_COMPLETE',
}

def read_catalogue(name, data_dir=DATA):
    text = (data_dir / name).read_text(encoding='utf8')
    variable = CATALOGUES[name]
    match = re.search(r'window\.' + variable + r'\s*=\s*(?:\([^;]*?\)\.concat\()?\s*(\[)', text)
    if not match:
        raise ValueError('Cannot locate JSON catalogue: ' + name)
    rows, _ = json.JSONDecoder().raw_decode(text[match.start(1):])
    if not isinstance(rows, list):
        raise ValueError('Not a lesson array: ' + name)
    return rows

def write_catalogue(name, rows):
    variable = CATALOGUES[name]
    data = json.dumps(rows, ensure_ascii=False, separators=(',', ':'))
    if name.startswith('hacking-complete-'):
        expression = '(window.' + variable + '||[]).concat(' + data + ')'
    else:
        expression = data
    (DATA / name).write_text('window.' + variable + '=' + expression + ';\n', encoding='utf8')

def effective_rows(data_dir=DATA):
    rows = [dict(row) for name in CATALOGUES for row in read_catalogue(name, data_dir)]
    text = (data_dir / 'lesson-expansions-termux-curated.js').read_text(encoding='utf8')
    start = re.search(r'const patches\s*=\s*(\[)', text)
    if not start:
        raise ValueError('Missing Termux replacement registry')
    patches, _ = json.JSONDecoder().raw_decode(text[start.start(1):])
    replacements = {(r['l'], r['p']): r['append'] for r in patches}
    for row in rows:
        if row['p'].startswith('Termux_Troubleshooting/'):
            row['b'] = replacements[(row['l'], row['p'])]
    return rows
