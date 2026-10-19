from hashlib import sha256
from pathlib import Path
from tempfile import TemporaryDirectory

def manifest(root: Path):
    output = {}
    for path in sorted(root.rglob('*')):
        if path.is_file() and not path.is_symlink():
            output[path.relative_to(root).as_posix()] = sha256(path.read_bytes()).hexdigest()
    return output

if __name__ == '__main__':
    with TemporaryDirectory() as d:
        base = Path(d)
        (base/'test.txt').write_text('example', encoding='utf-8')
        report = manifest(base)
        assert list(report) == ['test.txt']
        print(report)
