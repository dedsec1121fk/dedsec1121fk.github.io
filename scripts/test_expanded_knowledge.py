#!/usr/bin/env python3
"""Source-controlled regression tests for the curated 2026 bilingual expansion.

Checks referential consistency, hashes and content structure. Does not assert
that every niche compiler or physical platform has been exercised.
"""
from pathlib import Path
from collections import defaultdict
import hashlib
import json
import re
import unittest

ROOT=Path(__file__).resolve().parents[1]
ARCH=ROOT/"Developer's Mind"/"Keep Programming Alive"
META=ROOT/'Documentation'/'EXPANDED_KNOWLEDGE_INVENTORY.json'
DATA=ROOT/'DedSec-Project-Website'/'data'

class ExpandedKnowledgeTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.info=json.loads(META.read_text(encoding='utf8'))
        cls.rows={}
        for lang in ('en','el'):
            raw=(DATA/(lang+'.js')).read_text(encoding='utf8')
            cls.rows[lang]=json.loads(raw[raw.index('=')+1:].strip().rstrip(';'))

    def test_expansion_has_equal_english_greek_topic_coverage(self):
        self.assertEqual(self.info['added_topic_pairs'],35)
        self.assertEqual(len(self.info['files']),70)
        pairs=defaultdict(set)
        for file in self.info['files']:
            pairs[(file['id'].replace('expanded-en-','expanded-').replace('expanded-el-','expanded-'))].add(file['locale'])
        self.assertEqual(len(pairs),35)
        self.assertTrue(all(locales=={'en','el'} for locales in pairs.values()))

    def test_index_and_archive_bodies_are_identical(self):
        by_locale={lang:{row['p']:row for row in records} for lang,records in self.rows.items()}
        for item in self.info['files']:
            with self.subTest(path=item['path'],locale=item['locale']):
                language='English' if item['locale']=='en' else 'Greek'
                path=ARCH/language/item['path']
                body=path.read_text(encoding='utf8')
                self.assertEqual(hashlib.sha256(body.encode()).hexdigest(),item['sha256'])
                self.assertEqual(by_locale[item['locale']][item['path']]['b'],body.strip())
                self.assertGreaterEqual(len(body.strip()),1500)

    def test_no_template_padding_or_unbalanced_blocks(self):
        problem=re.compile(r'(?im)(?:Source cue for|Validation for [^\n]+\.md|investigation [1-9]|Αφετηρία για|Επαλήθευση για [^\n]+\.md|διερεύνηση [1-9])')
        for item in self.info['files']:
            path=ARCH/('English' if item['locale']=='en' else 'Greek')/item['path']
            body=path.read_text(encoding='utf8')
            with self.subTest(path=item['path']):
                self.assertIsNone(problem.search(body))
                self.assertFalse(re.search(r'(?m)^## [^\n]+\n[ \t]*\n(?=## |\Z)',body))
                self.assertEqual(body.count('~~~')%2,0)

    def test_topics_are_not_exactly_repeated(self):
        for locale in ('en','el'):
            bodies=[(item['path'],(ARCH/('English' if locale=='en' else 'Greek')/item['path']).read_text())
                   for item in self.info['files'] if item['locale']==locale]
            hashes=[hashlib.sha256(' '.join(body.casefold().split()).encode()).hexdigest() for _,body in bodies]
            self.assertEqual(len(hashes),len(set(hashes)))

if __name__=='__main__':
    unittest.main()
