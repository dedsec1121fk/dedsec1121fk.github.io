"""Regression checks for depth changes and relocated deployment assets."""
import tempfile,unittest
from pathlib import Path
from build_portable_site import relocate_imported_css,llm_markdown
class PublicationContracts(unittest.TestCase):
 def test_aliased_css_import_is_rebased_to_the_public_root(self):
  with tempfile.TemporaryDirectory() as folder:
   root=Path(folder);(root/'assets').mkdir();(root/'assets/galaxy.css').write_text('body{}')
   text='@import url("../../assets/galaxy.css");'
   self.assertEqual(relocate_imported_css(text,'Assets/merged-retro.css',root),'@import url("../assets/galaxy.css");')
 def test_remote_and_data_css_urls_are_not_rebased(self):
  text='a{background:url("https://example.invalid/a.png")}b{background:url(data:image/png;base64,xx)}'
  self.assertEqual(relocate_imported_css(text,'Assets/style.css',Path('/tmp')),text)
 def test_llm_references_are_absolute_and_keep_code_literal(self):
  row={'id':'guide-en','p':'Topics/a.md'};base='https://example.test/Test/'
  body='[Next](b.md) and `[sample](missing.md)`\n\n```md\n[example](missing.md)\n```\n'
  got=llm_markdown(body,'en',row,{'Topics/b.md':'next-en'},base)
  self.assertIn('[Next](https://example.test/Test/learn/en/next-en.html)',got)
  self.assertIn('`[sample](missing.md)`',got);self.assertIn('```md\n[example](missing.md)\n```',got)
 def test_llm_keeps_external_links_and_resolves_fragments(self):
  got=llm_markdown('[Section](#details) [Docs](https://example.org/docs)','el',{'id':'guide-el','p':'a.md'},{},'https://example.test/')
  self.assertEqual(got,'[Section](https://example.test/learn/el/guide-el.html#details) [Docs](https://example.org/docs)')
if __name__=='__main__':unittest.main()
