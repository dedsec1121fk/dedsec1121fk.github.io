#!/usr/bin/env python3
"""Protect 11 substantial, original bilingual programming workbooks after curation.

These tests verify persisted offline website data and matching Markdown files,
not empty legacy enhancement arrays. No runtime execution is claimed.
"""
from pathlib import Path
import json
import re
import unittest

ROOT=Path(__file__).resolve().parents[1]
DATA=ROOT/'DedSec-Project-Website'/'data'
ARCH=ROOT/"Developer's Mind"/'Keep Programming Alive'
LANGUAGES=(
 'Logo','Scratch_textual_pseudocode','Brainfuck','Erlang',
 'Factor','Gleam','PureScript','ReasonML',
 'GameMaker_Language','Objective_C','Visual_Basic_NET')
GENERIC=(
 '## A syntax anchor you can actually inspect',
 '## Build the language-specific lab',
 '## Three challenges','## Αφετηρία σύνταξης',
 '## Εξειδικευμένη άσκηση','## Τρεις ασκήσεις με κριτήρια')

class ReviewedWorkbooksTest(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.rows={}
  for lang,var in [('en','EN'),('el','EL')]:
   raw=(DATA/(lang+'.js')).read_text(encoding='utf8')
   match=re.fullmatch(r'window\.ARCHIVE_'+var+r'=(\[.*\]);\s*',raw,re.S)
   if not match:raise AssertionError('Invalid '+lang+' catalogue')
   cls.rows[lang]=json.loads(match.group(1))

 def test_bilingual_workbooks_have_individualized_substantial_labs(self):
  bodies=[]
  for language in LANGUAGES:
   for lang in ('en','el'):
    ending='01_EXPANDED_WORKBOOK.md' if lang=='en' else '01_ΟΔΗΓΟΣ_ΑΣΚΗΣΕΩΝ.md'
    matches=[r for r in self.rows[lang] if '/'+language+'/' in r['p'] and r['p'].endswith(ending)]
    with self.subTest(language=language,locale=lang):
     self.assertEqual(len(matches),1)
     if not matches:continue
     row=matches[0];body=row['b']
     self.assertGreaterEqual(len(body.strip()),1500)
     self.assertTrue(body.lstrip().startswith('# '))
     self.assertFalse(any(phrase in body for phrase in GENERIC))
     self.assertTrue('~~~' in body or '```' in body or language=='Scratch_textual_pseudocode')
     self.assertGreaterEqual(body.count('## '),3)
     archived=ARCH/('English' if lang=='en' else 'Greek')/row['p']
     self.assertEqual(archived.read_text(encoding='utf-8').strip(),body.strip())
     bodies.append(' '.join(body.casefold().split()))
  self.assertEqual(len(bodies),22)
  self.assertEqual(len(bodies),len(set(bodies)))
if __name__=='__main__':unittest.main()
