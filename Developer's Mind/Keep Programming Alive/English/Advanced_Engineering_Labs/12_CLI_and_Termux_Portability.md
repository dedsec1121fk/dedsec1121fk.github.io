# CLI and Termux — read-only portable file inventory

## Learning goal and acceptance contract
Build a read-only inventory for an existing folder specified by a command-line argument. The folder path may contain Greek characters or spaces. Print deterministic sorted filenames, optionally as Unicode JSON, and limit results to 1 through 20. Reject a nonexistent root and invalid limit. Work without depending on a writable current directory or network connectivity. Never grant Android storage access, update packages, or change inspected files as an undeclared side effect.

## Executable Python 3 lab
Save this as cli_lab.py and run python3 cli_lab.py. TemporaryDirectory provides synthetic files and the test checks both normal and invalid input.

~~~python
import argparse
import io
import json
from pathlib import Path
from tempfile import TemporaryDirectory

def main(argv, out):
    parser = argparse.ArgumentParser(description='Read-only file inventory')
    parser.add_argument('--root', required=True, type=Path)
    parser.add_argument('--limit', type=int, default=10)
    parser.add_argument('--json', action='store_true')
    args = parser.parse_args(argv)
    if not args.root.is_dir():
        raise ValueError('root must be an existing directory')
    if not 1 <= args.limit <= 20:
        raise ValueError('limit must be between 1 and 20')
    rows = sorted((p.name for p in args.root.iterdir() if p.is_file()))[:args.limit]
    if args.json:
        print(json.dumps({'files': rows}, ensure_ascii=False), file=out)
    else:
        for name in rows:
            print(name, file=out)
    return 0

with TemporaryDirectory(prefix='δοκιμή διάστημα ') as root:
    home = Path(root)
    (home / 'άλφα test.txt').write_text('data', encoding='utf-8')
    (home / 'b.txt').write_text('', encoding='utf-8')
    buf = io.StringIO()
    assert main(['--root', root, '--limit', '1', '--json'], buf) == 0
    assert json.loads(buf.getvalue())['files'] == ['b.txt']
    for argv in (['--root', root, '--limit', '0'],
                 ['--root', '/path/that/does/not/exist']):
        try: main(argv, io.StringIO())
        except ValueError: pass
        else: raise AssertionError('invalid input accepted')
print('PASS cli: Unicode paths, JSON, sorting, range failures')
~~~

## Design reasoning and operational limits
Parsing CLI syntax with argparse is different from validating semantic conditions. The helper main(argv, out) accepts injected output, making its JSON testable without redirecting global stdout. The sort makes output independent of filesystem enumeration order. pathlib.Path preserves Unicode filenames; a shell still needs quotes around a path containing spaces. JSON with ensure_ascii=False preserves readable Greek text. In a production wrapper, catch ValueError at the outer boundary and print a diagnostic to stderr with exit status 2. argparse itself uses SystemExit when it prints help or rejects malformed options. Do not mistake an uncaught exception in a library test for a polished user-facing CLI. The Path.is_file method can follow symlinks; decide whether an inventory should include symlink targets before deploying.

## Experiments and failure checks
1. Try an empty directory, a Greek directory name, and a path with square brackets. Capture exactly what JSON includes.
2. Test --limit 0, --limit 21, a missing root and --help. Record return status, exception and stderr separately.
3. Write a wrapper that maps invalid arguments to status 2 without announcing success, and distinguish permission-denied status from user input errors.
4. Repeat from a read-only working directory; only fixture files in a temporary directory should be created. On Termux, describe app-private paths versus optional shared storage access.

**Deliverables:** PASS output, one JSON fixture, two negative tests, Python version and evidence that no real files were modified.
