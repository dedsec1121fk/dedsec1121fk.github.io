#!/usr/bin/env python3
"""Text-only SQLite notes. Usage: python notes.py add "a note"""
import argparse,sqlite3
from pathlib import Path

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--db',type=Path,default=Path('notes.sqlite3'))
    sub=parser.add_subparsers(dest='action',required=True)
    add=sub.add_parser('add');add.add_argument('text')
    sub.add_parser('list')
    args=parser.parse_args()
    with sqlite3.connect(args.db) as con:
        con.execute('CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY, text TEXT NOT NULL)')
        if args.action=='add':
            con.execute('INSERT INTO notes(text) VALUES (?)',(args.text,))
        for id,text in con.execute('SELECT id,text FROM notes ORDER BY id'):
            print(f'{id}: {text}')
if __name__=='__main__':main()
