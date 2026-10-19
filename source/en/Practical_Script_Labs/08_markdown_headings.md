# Markdown heading extractor: avoid code fences and duplicate anchors

## The missing source is now included
The accompanying 08_markdown_headings.py implements an intentionally limited ATX-heading scanner. It recognizes heading levels one through six with up to three leading spaces, ignores headings inside matching backtick or tilde fences, removes optional trailing hash decorations and generates unique anchors for repeated headings. Greek Unicode letters remain valid anchor characters. This is a teaching subset, not a complete CommonMark or GitHub-slug implementation.

## Run and understand
Execute python 08_markdown_headings.py. The fixture contains two Intro headings, a fenced line that starts with a hash but is not a heading, Ελληνικά and an escaped hash. The expected anchors are intro, ελληνικά and intro-1. It also checks an indented code line and optional closing hash decoration.

## A small reference implementation
~~~python
import re
def simple_headings(text):
    result = []
    inside = False
    for line in text.splitlines():
        if line.startswith("~~~"):
            inside = not inside
            continue
        if not inside:
            match = re.match(r"^#{1,6}\s+(.+)$", line)
            if match:
                result.append(match.group(1))
    return result
~~~

The simplified fragment demonstrates fence state. The actual source adds indentation, both fence glyphs, Unicode slugs, line numbers and collision handling. Do not use the simplified fragment as a full Markdown parser.

## Extend and challenge
Add a four-backtick fence containing a triple-backtick line, compare GitHub-style anchors for headings containing punctuation, and decide how to handle Setext headings, inline Markdown links and HTML. Make a test for each feature you add. Input headings alone are insufficient to reproduce the full CommonMark specification. Source: 08_markdown_headings.py. Reference: https://spec.commonmark.org/
