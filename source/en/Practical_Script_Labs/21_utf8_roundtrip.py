from io import BytesIO, TextIOWrapper

def roundtrip(text: str) -> str:
    raw = BytesIO()
    writer = TextIOWrapper(raw, encoding='utf-8',write_through=True)
    writer.write(text)
    raw.seek(0)
    result = raw.read().decode('utf-8')
    writer.detach()
    return result

if __name__ == '__main__':
    assert roundtrip('Καλημέρα, κόσμε!') == 'Καλημέρα, κόσμε!'
    print(roundtrip('Python και Ελληνικά'))
