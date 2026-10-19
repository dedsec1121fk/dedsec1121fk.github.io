import json,re,unittest
from build_site_search import rows,generate,OUT,PageText,SITE
class SiteSearchTests(unittest.TestCase):
 def test_every_canonical_content_page_has_a_record(self):
  records=rows();actual={r['p'] for r in records};expected={p.relative_to(SITE).as_posix() for p in (SITE/'dedsec').rglob('*.html') if p.name not in ('index.html','404.html')}
  self.assertTrue(expected<=actual)
  self.assertEqual(len({r['id'] for r in records}),len(records))
  self.assertEqual(sum(r['l']=='en' for r in records),sum(r['l']=='el' for r in records))
  self.assertTrue(all(r['kind']=='page' and r['b'].strip() for r in records))
 def test_navigation_script_and_footer_are_not_content(self):
  p=PageText('el');p.feed('<main><h1 data-en="Guide" data-gr="Οδηγός">Guide</h1><p>Visible body</p><script>PRIVATE_CODE</script></main><footer>REPEATED_FOOTER</footer><nav>NAVIGATION</nav>')
  title,body=p.result();self.assertEqual(title,'Οδηγός');self.assertIn('Visible body',body)
  for text in ['PRIVATE_CODE','REPEATED_FOOTER','NAVIGATION']:self.assertNotIn(text,body)
 def test_paragraphs_and_inline_boundaries_are_preserved(self):
  p=PageText('en');p.feed('<main><h1>Guide</h1><p>Before <strong>DNS</strong>. Next sentence.</p><p>Another paragraph.</p></main>')
  title,body=p.result();self.assertIn('Before DNS. Next sentence.\n\nAnother paragraph.',body)
 def test_generated_index_is_current(self):self.assertEqual(OUT.read_text('utf8'),generate())
if __name__=='__main__':unittest.main()
