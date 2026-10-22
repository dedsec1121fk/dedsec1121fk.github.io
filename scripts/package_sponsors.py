#!/usr/bin/env python3
"""Encrypt an owner-supplied manifest for the Worker. Never print the key.
Requires cryptography, installed separately for owner-controlled packaging.
"""
import argparse,ast,base64,hashlib,json,os,re
from pathlib import Path

def main():
 from cryptography.hazmat.primitives.ciphers.aead import AESGCM
 parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--manifest',type=Path,required=True);parser.add_argument('--source-dir',type=Path,required=True);parser.add_argument('--key-file',type=Path,required=True);parser.add_argument('--output',type=Path,required=True);parser.add_argument('--release',required=True);args=parser.parse_args()
 repo=Path(__file__).resolve().parents[1]
 for private in [args.source_dir,args.key_file,args.manifest]:
  if private.resolve().is_relative_to(repo):parser.error('Plaintext sources, manifest and key must be outside this repository')
 if os.name!='nt' and args.key_file.stat().st_mode&0o077:parser.error('Key file must be private (chmod 600)')
 key=bytes.fromhex(args.key_file.read_text().strip())
 if len(key)!=32:parser.error('Expected a 32-byte hexadecimal AES key')
 records=json.loads(args.manifest.read_text('utf8'));scripts=[];ids=set();names=set()
 for item in records:
  required={'id','filename','source','language','description'}
  if not required<=item.keys():parser.error('Manifest entry is missing required metadata')
  if not re.fullmatch('[a-z0-9][a-z0-9-]{0,79}',item['id']):parser.error('Invalid script ID')
  if item['id'] in ids or item['filename'] in names:parser.error('Duplicate script ID or download filename')
  ids.add(item['id']);names.add(item['filename'])
  if item['language'] not in ['en','el'] or not item['filename'].endswith(' (English).py' if item['language']=='en' else ' (Ελληνικά).py'):parser.error('Use explicit language labels')
  source=(args.source_dir/item['source']).resolve()
  if not source.is_relative_to(args.source_dir.resolve()) or not source.is_file():parser.error('Invalid source path')
  if any(c in item['filename'] for c in '/\\\x00\r\n'):parser.error('Invalid download filename')
  raw=source.read_bytes();ast.parse(raw.decode('utf8'));sha=hashlib.sha256(raw).hexdigest();iv=os.urandom(12);aad=(item['id']+'\n'+item['filename']+'\n'+sha).encode('utf8');cipher=AESGCM(key).encrypt(iv,raw,aad)
  assert AESGCM(key).decrypt(iv,cipher,aad)==raw
  scripts.append({k:item[k] for k in ['id','filename','language','description']}|dict(version=args.release,sha256=sha,iv=iv.hex(),ciphertext=base64.b64encode(cipher).decode('ascii')))
 output={'version':1,'release':args.release,'scripts':scripts};args.output.write_text('/* AES-256-GCM ciphertext only. */\nexport default '+json.dumps(output,ensure_ascii=False,indent=2)+';\n','utf8');print(f'Encrypted and round-trip verified {len(scripts)} scripts. Deploy the matching key as SPONSOR_KEY; never commit it.')
if __name__=='__main__':main()
