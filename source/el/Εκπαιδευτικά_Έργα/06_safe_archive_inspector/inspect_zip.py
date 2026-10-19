#!/usr/bin/env python3
"""Read-only ZIP metadata and suspicious-path audit; never extracts."""
import argparse,zipfile
from pathlib import PurePosixPath,Path

def unsafe(name):
    path=PurePosixPath(name)
    return path.is_absolute() or ".." in path.parts or chr(92) in name or name.startswith("/")

def audit(zip_path):
    suspicious=[]
    with zipfile.ZipFile(zip_path) as arc:
        for entry in arc.infolist():
            if unsafe(entry.filename):suspicious.append(entry.filename)
        print('Files:',len(arc.infolist()))
        print('Total uncompressed bytes:',sum(x.file_size for x in arc.infolist()))
    for name in suspicious:print('Suspicious name:',name)
    return len(suspicious)
if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('zip',type=Path);args=p.parse_args()
    raise SystemExit(1 if audit(args.zip) else 0)
