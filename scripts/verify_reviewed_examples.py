#!/usr/bin/env python3
"""Execute only the reviewed self-contained examples in disposable directories.

This is deliberately an allowlist, not an executor for arbitrary security-guide
commands. It requires Python and Bash; compiler/platform labs remain explicit.
"""
import json
from pathlib import Path
import re
import subprocess
import sys
from tempfile import TemporaryDirectory
from knowledge_catalogue import ROOT, read_catalogue

def run(args, cwd):
    result = subprocess.run(args, cwd=cwd, capture_output=True, text=True, timeout=15)
    if result.returncode:
        raise AssertionError((args[0], result.returncode, result.stderr[:1000]))
    return result.stdout

def main():
    checked = []
    selected = ('ops-23-linux-disk-inodes-mounts', 'ops-24-linux-dns-and-tls',
                'language-5-transaction-migration', 'reverse-20-binary-header-validation')
    with TemporaryDirectory(prefix='dedsec-reviewed-') as temp:
        work = Path(temp)
        for locale in ('en','el'):
            rows = read_catalogue(locale + '.js')
            rows += [r for r in read_catalogue('deep-dive.js') if r['l']==locale and any(r['id'].startswith('deep-dive-'+topic+'-') for topic in ('python-tracebacks','python-asyncio','testing-fixtures','data-encoding'))]
            for row in rows:
                if not row['id'].startswith('deep-dive-') and not any(row['id'].endswith(suffix) for suffix in selected):
                    continue
                for number, code in enumerate(re.findall(r'(?ms)^~~~python\n(.*?)^~~~\s*$', row['b'])):
                    file = work / 'example.py'
                    file.write_text(code, encoding='utf8')
                    run([sys.executable, str(file)], work)
                    checked.append(row['id'] + ':' + str(number))
            shell = next(r for r in rows if r['id'].endswith('language-5-paths-and-safe-shell'))
            code = re.search(r'(?ms)^~~~bash\n(.*?)^~~~\s*$', shell['b'])[1]
            file = work / 'inventory.sh'
            file.write_text(code, encoding='utf8')
            fixture = work / '-directory with spaces'
            fixture.mkdir(exist_ok=True)
            for name in ('two words.txt', 'star*.txt', 'new\nline.txt'):
                (fixture / name).write_text('fixture', encoding='utf8')
            output = run(['bash', str(file), fixture.name], work)
            assert len(output.splitlines()) == 3, output
            assert 'star\\*.txt' in output and "new\\nline" in output, output
            checked.append(shell['id'])
        labs = []
        for folder in ('English','Greek'):
            paths = sorted((ROOT/"Developer's Mind"/'Keep Programming Alive'/folder/('Practical_Script_Labs' if folder=='English' else 'Πρακτικά_Σενάρια_Κώδικα')).glob('*.py'))
            assert len(paths) == 24
            for path in paths:
                run([sys.executable, str(path)], work)
                labs.append(folder + '/' + path.name)
    print('REVIEWED_EXAMPLES_PASS:', json.dumps({'reviewed_snippets':len(checked), 'practical_scripts':len(labs),
          'platform':'local Python/Bash on Linux', 'unexecuted':'Windows, Android hardware, MATLAB, NASM and other unlisted toolchains'}, ensure_ascii=False))

if __name__ == '__main__':
    main()
