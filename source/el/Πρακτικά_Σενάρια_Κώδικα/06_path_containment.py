from pathlib import Path
from tempfile import TemporaryDirectory

def allowed(root: Path, candidate: Path) -> bool:
    base = root.resolve()
    path = candidate.resolve()
    return path == base or base in path.parents

if __name__ == '__main__':
    with TemporaryDirectory() as d:
        base = Path(d)
        assert allowed(base, base / 'safe.txt')
        assert not allowed(base, base / '../outside.txt')
    print('path traversal blocked')
