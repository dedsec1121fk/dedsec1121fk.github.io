#!/usr/bin/env python3
"""Summarize spending from a CSV with columns category,amount."""
import argparse,csv,decimal,collections
from pathlib import Path

def report(path):
    sums=collections.defaultdict(lambda: decimal.Decimal('0'))
    with path.open('r',encoding='utf-8-sig',newline='') as f:
        reader=csv.DictReader(f)
        if not {'category','amount'}.issubset(reader.fieldnames or []):raise ValueError('expected category,amount headers')
        for line,row in enumerate(reader,2):
            cat=row['category'].strip()
            if not cat:raise ValueError(f'empty category on line {line}')
            sums[cat]+=decimal.Decimal(row['amount'])
    return sums

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('csv',type=Path);args=p.parse_args()
    for name,total in sorted(report(args.csv).items()):print(f'{name}: {total:.2f}')
