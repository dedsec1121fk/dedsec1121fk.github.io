#!/usr/bin/env python3
"""Read-only checksums for a user-selected folder."""
import argparse,hashlib
from pathlib import Path

def file_hash(path):
    h=hashlib.sha256()
    with path.open('rb') as handle:
        for chunk in iter(lambda:handle.read(65536),b''):h.update(chunk)
    return h.hexdigest()

def main():
    p=argparse.ArgumentParser();p.add_argument('folder',type=Path);a=p.parse_args()
    if not a.folder.is_dir():p.error('folder not found')
    for entry in sorted(a.folder.rglob('*')):
        if entry.is_file() and not entry.is_symlink():
            print(f'{file_hash(entry)}  {entry.relative_to(a.folder)}')
if __name__=='__main__':main()
