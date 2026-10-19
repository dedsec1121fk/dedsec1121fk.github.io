#!/usr/bin/env python3
"""Offline near-duplicate check for substantial educational prose.

Uses standard-library four-word shingles after removing fenced code. It detects
highly similar explanations despite differences in heading or formatting; this
is a review trigger, not a semantic-fact-checking substitute.
"""
from pathlib import Path
from collections import defaultdict
import re, json, sys
from knowledge_catalogue import effective_rows

ROOT=Path(__file__).resolve().parents[1]/"Developer's Mind"/'Keep Programming Alive'

def shingles(raw):
    raw=re.sub(r'(?ms)^\s*(?:~~~|```)[^\n]*\n.*?^\s*(?:~~~|```)\s*$',' ',raw)
    raw=re.sub(r'(?m)^\s*(?:#+|\*+|\d+[.)])\s*',' ',raw)
    words=re.findall(r'[\w\-]+',raw.casefold())
    return set(tuple(words[i:i+4]) for i in range(max(0,len(words)-3)))

def audit(limit=0.72):
    duplicates=[];sizes={};checked={}
    records=effective_rows()
    for language,locale in (('English','en'),('Greek','el')):
        files=[r for r in records if r['l']==locale and r['p'].endswith('.md')]
        terms=[shingles(row['b']) for row in files]
        inverted=defaultdict(list)
        for i,ngrams in enumerate(terms):
            for token in ngrams:inverted[token].append(i)
        candidates=defaultdict(int)
        for participants in inverted.values():
            if len(participants)>30:continue  # generic phrases do not establish near duplication
            for x in range(len(participants)):
                for y in range(x+1,len(participants)):
                    candidates[(participants[x],participants[y])]+=1
        hits=[]
        for (i,j),count in candidates.items():
            if count<18:continue
            union=len(terms[i])+len(terms[j])-count
            if union>0 and count/union >=limit:
                hits.append({'a':files[i]['p'],
                             'b':files[j]['p'],
                             'similarity':round(count/union,3)})
        sizes[language]=len(files)
        checked[language]=len(candidates)
        duplicates.extend([dict(language=language,**pair) for pair in sorted(hits,key=lambda v:-v['similarity'])])
    return {'threshold':limit,'documents':sizes,'candidates_checked':checked,'near_duplicate_pairs':duplicates}

if __name__=='__main__':
    result=audit()
    print('NEAR_DUPLICATE_AUDIT:',json.dumps(result,ensure_ascii=False))
    sys.exit(1 if result['near_duplicate_pairs'] else 0)
