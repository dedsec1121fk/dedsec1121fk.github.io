"""Authored review examples; only allowlisted local toy programs are executed."""
import hashlib,json,subprocess,sys,tempfile,unittest,shutil
from pathlib import Path
from knowledge_catalogue import ROOT,effective_rows
class DetailReviewTests(unittest.TestCase):
 def test_paired_sources_and_examples(self):
  manifest=json.loads((ROOT/'Documentation/DETAIL_REVIEW_INVENTORY.json').read_text())
  self.assertEqual(manifest['topic_pairs'],24);self.assertEqual(len(manifest['records']),48)
  rows={r['id']:r for r in effective_rows()}
  by_id={e['id']:e for e in manifest['records']}
  for e in manifest['records']:
   body=(ROOT/e['source']).read_text('utf8')
   self.assertEqual(hashlib.sha256(body.encode()).hexdigest(),e['sha256']);self.assertEqual(body.strip(),rows[e['id']]['b'].strip())
   self.assertIn(e['code'],body);self.assertGreater(e['added_characters'],900)
  for e in manifest['records']:
   if e['locale']=='en':
    other=e['id'].replace('expanded-en-','expanded-el-').replace('rev-en-','rev-el-')
    # Numeric canonical IDs differ; source pairing is checked by the depth auditor.
    if other in by_id:self.assertEqual(e['code'],by_id[other]['code'])
 def test_safe_local_programs(self):
  manifest=json.loads((ROOT/'Documentation/DETAIL_REVIEW_INVENTORY.json').read_text());ran=0
  with tempfile.TemporaryDirectory() as folder:
   for e in manifest['records']:
    if e['locale']!='en' or not e['run']:continue
    kind=e['run'];code=e['code']
    if kind=='python':command=[sys.executable,'-I','-c',code]
    elif kind=='javascript':command=['node','--input-type=module','-e',code]
    elif kind=='bash':command=['bash','--noprofile','--norc','-c',code]
    elif kind in ('c','cpp'):
     source=Path(folder)/('fixture.'+('c' if kind=='c' else 'cpp'));source.write_text(code)
     executable=Path(folder)/'fixture'
     compiler=(shutil.which('gcc') or shutil.which('clang')) if kind=='c' else (shutil.which('g++') or shutil.which('clang++'))
     self.assertIsNotNone(compiler,'A C/C++ compiler is required for the executable fixtures')
     compile_run=subprocess.run([compiler,'-std=c11' if kind=='c' else '-std=c++17','-Wall','-Wextra','-Werror',str(source),'-o',str(executable)],capture_output=True,text=True,timeout=15)
     self.assertEqual(compile_run.returncode,0,e['id']+' '+compile_run.stderr);command=[str(executable)]
    else:raise AssertionError(kind)
    run=subprocess.run(command,cwd=folder,capture_output=True,text=True,timeout=8)
    self.assertEqual(run.returncode,0,e['id']+' '+run.stderr);ran+=1
  self.assertEqual(ran,22)
if __name__=='__main__':unittest.main()
