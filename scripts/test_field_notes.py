"""Validate authored bilingual field notes, including safe executable fixtures."""
import hashlib,json,re,subprocess,sys,tempfile,unittest
from pathlib import Path
from knowledge_catalogue import effective_rows,ROOT
class FieldNotesTests(unittest.TestCase):
    def test_inventory_sources_and_bilingual_code_parity(self):
        manifest=json.loads((ROOT/'Documentation/FIELD_NOTES_INVENTORY.json').read_text())
        self.assertEqual(manifest['topics'],18)
        rows={r['id']:r for r in effective_rows()}
        self.assertEqual(len(manifest['records']),36)
        for entry in manifest['records']:
            source=(ROOT/entry['path']).read_text()
            self.assertEqual(hashlib.sha256(source.encode()).hexdigest(),entry['sha256'])
            self.assertEqual(source,rows[entry['id']]['b'])
        for n in range(34,52):
            en=re.findall(r'```\w+\n(.*?)\n```',rows[f'fieldnotes-en-{n}']['b'],re.S)
            el=re.findall(r'```\w+\n(.*?)\n```',rows[f'fieldnotes-el-{n}']['b'],re.S)
            self.assertEqual(en,el,n)
    def test_isolated_python_fixtures(self):
        rows=[r for r in effective_rows() if r['id'].startswith('fieldnotes-en-')]
        count=0
        with tempfile.TemporaryDirectory() as folder:
            for row in rows:
                for code in re.findall(r'```python\n(.*?)\n```',row['b'],re.S):
                    run=subprocess.run([sys.executable,'-I','-c',code],cwd=folder,capture_output=True,text=True,timeout=10)
                    self.assertEqual(run.returncode,0,row['id']+' '+run.stderr)
                    count+=1
        self.assertEqual(count,17)
if __name__=='__main__':unittest.main()
