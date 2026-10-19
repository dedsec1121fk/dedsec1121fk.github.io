#!/usr/bin/env python3
"""Regression tests for Markdown fence recognition: prose is not a fence."""
import unittest
from audit_knowledge_depth import inspect_fences


class FenceTests(unittest.TestCase):
    def test_literal_tildes_in_explanation(self):
        self.assertEqual(inspect_fences("The literal ~~~ is an example token, not an opening fence."), (False, True))

    def test_valid_both_fence_styles(self):
        source = "~~~python\nprint(1)\n~~~\n\n```text\nhello\n```"
        self.assertEqual(inspect_fences(source), (True, True))

    def test_unclosed_fence(self):
        self.assertEqual(inspect_fences("Some text\n~~~python\nprint(1)"), (True, False))

    def test_short_close_not_valid(self):
        self.assertEqual(inspect_fences("~~~~python\nhello\n~~~"), (True, False))

    def test_inline_backticks_are_not_fences(self):
        self.assertEqual(inspect_fences("Use ```markdown``` as an inline example."), (False, True))

    def test_fence_closes_only_on_its_own_line(self):
        self.assertEqual(inspect_fences("~~~text\nexample\n~~~ trailing prose"), (True, False))


if __name__ == "__main__":
    unittest.main()
