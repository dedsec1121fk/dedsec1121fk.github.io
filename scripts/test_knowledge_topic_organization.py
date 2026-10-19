"""Regression tests: editorial consolidation must not mix unrelated subjects."""
from pathlib import Path
import json
import re
import unittest

ROOT=Path(__file__).resolve().parents[1]
DATA=ROOT/'DedSec-Project-Website'/'data'
ARCH=ROOT/"Developer's Mind"/'Keep Programming Alive'

class TopicOrganizationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.rows={}
        for loc in ('en','el'):
            raw=(DATA/(loc+'.js')).read_text(encoding='utf8')
            entries=json.loads(raw.split('=',1)[1].strip().rstrip(';'))
            cls.rows[loc]={r['p']:r for r in entries}

    def test_clojure_guide_does_not_embed_other_languages(self):
        for loc,prefix in (('en','Programming_Languages/Functional'),('el','Γλώσσες_Προγραμματισμού/Συναρτησιακός προγραμματισμός')):
            body=self.rows[loc][prefix+'/Clojure.md']['b']
            heads=re.findall(r'(?m)^## ([^\n]+)',body)
            self.assertTrue(heads)
            self.assertTrue(all(head.lower().startswith('clojure') for head in heads), heads)
            for name in ('Erlang','Factor','Gleam','PureScript','ReasonML'):
                p=prefix+'/'+name+'/'+('01_EXPANDED_WORKBOOK.md' if loc=='en' else '01_ΟΔΗΓΟΣ_ΑΣΚΗΣΕΩΝ.md')
                self.assertIn(name,self.rows[loc][p]['b'])

    def test_unicode_page_covers_unicode_not_git_or_supply_chain(self):
        for loc,p in (('en','Advanced_Engineering_Labs/07_Unicode_and_Localization.md'),('el','Προχωρημένα_Εργαστήρια_Μηχανικής/07_Unicode_and_Localization.md')):
            heads=re.findall(r'(?m)^## ([^\n]+)',self.rows[loc][p]['b'])
            self.assertTrue(heads)
            self.assertFalse(any(re.search('Git history|Ιστορικό Git|Dependencies|Εξαρτήσεις|Log analysis|Καταγραφές συμβάντων',h,re.I) for h in heads),heads)

    def test_dedicated_concurrency_and_threat_guides_are_bilingual(self):
        for loc,prefix in (('en','Knowledge_Encyclopedia'),('el','Εγκυκλοπαίδεια_Γνώσης')):
            systems='Systems' if loc=='en' else 'Συστήματα'
            security='Security' if loc=='en' else 'Ασφάλεια'
            for p in (prefix+'/'+systems+'/040_Processes_and_threads.md',prefix+'/'+security+'/047_Threat_modeling.md'):
                self.assertIn(p,self.rows[loc]);self.assertGreaterEqual(len(self.rows[loc][p]['b']),1500)

    def test_manifest_redirects_do_not_point_to_removed_topics(self):
        m=json.loads((ROOT/'Documentation/OFFLINE_CURATION_MANIFEST.json').read_text('utf8'))
        for loc in ('en','el'):
            for old,new in m['redirects'][loc].items():
                self.assertIn(new,self.rows[loc],(loc,old,new))
                if '/Functional/' in old or '/Συναρτησιακός προγραμματισμός/' in old:
                    for language in ('Erlang','Factor','Gleam','PureScript','ReasonML'):
                        if '/'+language+'/' in old:self.assertIn('/'+language+'/',new)

    def test_network_errors_do_not_include_go_or_jvm_faults(self):
        for loc,folder in (('en','Error_Encyclopedia'),('el','Εγχειρίδιο_Σφαλμάτων')):
            network=self.rows[loc][folder+'/092_connection_refused.md']['b']
            self.assertNotIn('ClassNotFoundException',network)
            self.assertNotIn('concurrent map writes',network)
            self.assertIn('HTTP 404',network)
            self.assertIn(folder+'/052_Go_Runtime_Errors.md',self.rows[loc])
            self.assertIn(folder+'/055_JVM_Class_Loading.md',self.rows[loc])

    def test_beginner_projects_have_distinct_practical_exercises(self):
        for loc,path in (('en','Learning_Projects/collection/01_LESSON.md'),('el','Εκπαιδευτικά_Έργα/collection/01_ΜΑΘΗΜΑ.md')):
            body=self.rows[loc][path]['b']
            self.assertIn('SHA-256',body)
            self.assertIn('ZIP',body)
            self.assertGreaterEqual(len(body),4500)

if __name__=='__main__':unittest.main()
