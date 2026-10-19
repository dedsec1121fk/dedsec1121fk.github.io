import unicodedata
left = '\u00e9'.encode().decode('unicode_escape')  # demonstration string (see simpler right below)
composed = 'é'
decomposed = 'e\u0301'
assert unicodedata.normalize('NFC', composed) == unicodedata.normalize('NFC', decomposed)
