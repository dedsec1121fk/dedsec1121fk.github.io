#!/usr/bin/env python3
"""Offline validated settings loaded from a local JSON file."""
import argparse,json
from pathlib import Path

def load(path):
    data=json.loads(path.read_text(encoding='utf-8'))
    if not isinstance(data,dict):raise ValueError('settings must be a JSON object')
    if data.get('language') not in ('en','gr'):raise ValueError('language must be en or gr')
    if not isinstance(data.get('autostart'),bool):raise ValueError('autostart must be boolean')
    return data

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('path',type=Path);a=p.parse_args()
    try:
        settings=load(a.path)
    except (OSError,ValueError,json.JSONDecodeError) as exc:p.error(str(exc))
    print('validated',settings)
