#!/usr/bin/env python3
"""Local flashcards from term/definition TSV. No networking."""
import argparse,csv,random
from pathlib import Path

def main():
    ap=argparse.ArgumentParser();ap.add_argument('file',type=Path);ap.add_argument('--seed',type=int,default=1)
    args=ap.parse_args()
    with args.file.open(encoding='utf-8',newline='') as f:
        cards=[row for row in csv.reader(f,delimiter='\t') if len(row)>=2]
    random.Random(args.seed).shuffle(cards)
    for term,definition,*_ in cards:
        print('Term:',term)
        try: input('Press Enter for answer... ')
        except EOFError: print();break
        print('Answer:',definition,'\n')
if __name__=='__main__':main()
