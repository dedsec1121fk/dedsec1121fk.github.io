import tempfile,unittest
from pathlib import Path
from startup_manifest import manifest,write
class StartupManifestTests(unittest.TestCase):
 def test_basic_dependencies_hashed_without_knowledge_or_crawlers(self):
  with tempfile.TemporaryDirectory() as tmp:
   root=Path(tmp)
   for folder in ('learn/en','data','raw','assets','dedsec/Pages'):(root/folder).mkdir(parents=True)
   files={'index.html':'<script src="assets/ui.js"></script><script type="application/json" data-knowledge-src="data/en.js"></script><link href="assets/base.css" rel="stylesheet"><a href="learn/en/a.html">Lesson</a>', 'assets/ui.js':'let a=1;', 'assets/base.css':'@import "more.css"; body {background:url(stars.svg)}','assets/more.css':'body{}','assets/stars.svg':'<svg/>','data/en.js':'knowledge','learn/en/a.html':'lesson','raw/source.md':'source','llms-full.txt':'all content','sitemap.xml':'index','dedsec/Pages/faq.html':'<main>FAQ</main>'}
   for name,text in files.items():(root/name).write_text(text)
   result=write(root);self.assertEqual({r['url'] for r in result['resources']},{'index.html','assets/ui.js','assets/base.css','assets/more.css','assets/stars.svg','dedsec/Pages/faq.html'});self.assertEqual(result,manifest(root));self.assertEqual(len(result['version']),24)
 def test_only_basic_edits_change_startup_version(self):
  with tempfile.TemporaryDirectory() as tmp:
   root=Path(tmp);p=root/'index.html';p.write_text('before');old=manifest(root);(root/'lesson.md').write_text('new knowledge');self.assertEqual(old,manifest(root));p.write_text('after');self.assertNotEqual(old['version'],manifest(root)['version'])
