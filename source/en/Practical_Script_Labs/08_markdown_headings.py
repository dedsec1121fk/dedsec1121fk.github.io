"""Index a documented subset of ATX headings, excluding fenced blocks."""
import re
import unicodedata

FENCE = re.compile(r'^ {0,3}(`{3,}|~{3,})(.*)$')
HEADING = re.compile(r'^ {0,3}(#{1,6})(?:[ \t]+|$)(.*)$')


def slug(text: str) -> str:
    text = unicodedata.normalize('NFKC', text).casefold()
    return re.sub(r'-+', '-', ''.join(ch if ch.isalnum() else '-' for ch in text)).strip('-') or 'section'


def headings(markdown: str):
    result, counts = [], {}
    fence_char, fence_width = None, 0
    for lineno, line in enumerate(markdown.splitlines(), 1):
        match = FENCE.match(line)
        if fence_char:
            if match and match.group(1)[0] == fence_char and len(match.group(1)) >= fence_width and not match.group(2).strip():
                fence_char, fence_width = None, 0
            continue
        if match:
            fence_char, fence_width = match.group(1)[0], len(match.group(1))
            continue
        found = HEADING.match(line)
        if not found:
            continue
        title = re.sub(r'[ \t]+#+[ \t]*$', '', found.group(2)).strip()
        base = slug(title)
        suffix = counts.get(base, 0)
        counts[base] = suffix + 1
        anchor = base if suffix == 0 else f'{base}-{suffix}'
        result.append({'line': lineno, 'level': len(found.group(1)),
                       'title': title, 'anchor': anchor})
    return result


if __name__ == '__main__':
    sample = '# Intro\n~~~python\n# not a heading\n~~~\n## Ελληνικά\n# Intro\n\\# escaped\n'
    rows = headings(sample)
    assert [(x['title'], x['anchor']) for x in rows] == [
        ('Intro', 'intro'), ('Ελληνικά', 'ελληνικά'), ('Intro', 'intro-1')]
    assert headings('    # code block\n') == []
    assert headings('### Hello ###\n')[0]['anchor'] == 'hello'
    print('Markdown heading index checks passed')
