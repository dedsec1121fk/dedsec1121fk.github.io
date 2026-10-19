from zipfile import ZipFile
from io import BytesIO
from pathlib import PurePosixPath

def inspect_archive(data: bytes):
    with ZipFile(BytesIO(data)) as archive:
        output = []
        for entry in archive.infolist():
            name = PurePosixPath(entry.filename)
            safe = not name.is_absolute() and '..' not in name.parts
            output.append((entry.filename, safe, entry.file_size))
        return output

if __name__ == '__main__':
    stream = BytesIO()
    with ZipFile(stream,'w') as z:
        z.writestr('notes.txt','hello')
        z.writestr('../outside.txt','bad')
    rows = inspect_archive(stream.getvalue())
    assert rows[0][1] is True and rows[1][1] is False
    print(rows)
