"""Regression checks for the audit gaps found in the full catalogue review."""
import unittest
from audit_complete_catalogue import repeated_prose, audit
from knowledge_catalogue import effective_rows

class CompleteCatalogueTests(unittest.TestCase):
    def test_repetition_inside_a_single_lesson_is_detected(self):
        text = 'A directory entry and the bytes of its file have different permission checks. ' * 3
        row = {'id':'test', 'l':'en', 'p':'one.md', 'b':text+'\n\n'+text}
        self.assertEqual(len(repeated_prose([row])), 1)

    def test_code_does_not_count_as_repeated_explanatory_prose(self):
        code = 'print("a very long example code statement")\n' * 10
        body = '~~~python\n'+code+'~~~\n\n```python\n'+code+'```'
        self.assertEqual(repeated_prose([{'id':'a','l':'en','p':'a.md','b':body}]), [])

    def test_hacking_termux_methods_and_deep_dives_are_included(self):
        rows = effective_rows()
        self.assertEqual(len(rows), 1776)
        for prefix in ('hgp-', 'termux-', 'method-', 'deep-dive-'):
            self.assertTrue(any(r['id'].startswith(prefix) for r in rows), prefix)
        self.assertEqual(audit(rows)['issues'], [])

    def test_dead_internal_reference_is_rejected(self):
        row = {'id':'one','l':'en','t':'Example','p':'a.md','b':'[Missing](#read:not-present)'}
        self.assertTrue(any('Missing internal lesson' in issue for issue in audit([row])['issues']))

if __name__ == '__main__':
    unittest.main()
