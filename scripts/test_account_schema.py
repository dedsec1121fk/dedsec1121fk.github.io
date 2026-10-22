import sqlite3,unittest
from pathlib import Path
SCHEMA=Path(__file__).resolve().parents[1]/'account-service/migrations/0001_account_template.sql'
class AccountSchema(unittest.TestCase):
 def setUp(self):
  self.db=sqlite3.connect(':memory:');[self.db.executescript(p.read_text()) for p in sorted(SCHEMA.parent.glob('*.sql'))]
 def tearDown(self):self.db.close()
 def user(self,n):self.db.execute('INSERT INTO account_users(id,auth_subject,email,given_name,family_name,age_at_registration,email_verified_at,created_at,date_of_birth) VALUES(?,?,?,?,?,?,?,?,?)',(str(n),'auth-'+str(n),f'u{n}@example.test','First','Last',25,None,'2026-10-21T00:00:00Z','2001-01-01'))
 def test_capacity_and_activity(self):
  for i in range(300):self.user(i)
  with self.assertRaises(sqlite3.IntegrityError):self.user(300)
  self.assertEqual(self.db.execute('SELECT count(*) FROM account_users').fetchone()[0],300)
  for i in range(300):self.db.execute('INSERT INTO account_daily_activity VALUES(?,?)',('2026-10-21',str(i)))
  self.db.execute("INSERT OR IGNORE INTO account_daily_activity VALUES('2026-10-21','0')")
  self.assertEqual(self.db.execute('SELECT count(*) FROM account_daily_activity').fetchone()[0],300)
 def test_birth_and_legacy_migration(self):
  legacy=sqlite3.connect(':memory:')
  for path in sorted(SCHEMA.parent.glob('*.sql'))[:2]:legacy.executescript(path.read_text())
  legacy.execute("INSERT INTO account_users VALUES('old','local:old','old@example.test','Old','User',25,NULL,'2026-01-01')")
  legacy.executescript((SCHEMA.parent/'0003_account_capacity_and_birth.sql').read_text())
  self.assertEqual(legacy.execute("SELECT date_of_birth FROM account_users WHERE id='old'").fetchone(),(None,))
  self.assertEqual(legacy.execute('SELECT max_accounts,max_daily_active FROM account_limits').fetchone(),(300,444))
  self.assertEqual(legacy.execute('SELECT count(*) FROM account_schema_migrations').fetchone()[0],3)
  legacy.close()
  self.user(1)
  with self.assertRaises(sqlite3.IntegrityError):self.db.execute("UPDATE account_users SET date_of_birth='2001-02-29'")
  with self.assertRaises(sqlite3.IntegrityError):self.db.execute("INSERT INTO account_users(id,auth_subject,email,given_name,family_name,age_at_registration,created_at) VALUES('missing','missing','missing@example.test','A','B',25,'2026-01-01')")
 def test_utf8_quota_updates_deletes(self):
  self.user(1);path='Ελληνικά.txt';body='αβγ';self.db.execute('INSERT INTO account_notes(user_id,path,kind,content) VALUES(?,?,?,?)',('1',path,'file',body))
  with self.assertRaises(sqlite3.IntegrityError):self.db.execute('INSERT INTO account_notes(user_id,path,kind,content) VALUES(?,?,?,?)',('1','big.txt','file','x'*900001))
  expected=len((path+body).encode());self.assertEqual(self.db.execute('SELECT used_bytes FROM account_notes_usage').fetchone()[0],expected)
  with self.assertRaises(sqlite3.IntegrityError):self.db.execute('UPDATE account_notes SET content=?',('x'*900001,))
  self.assertEqual(self.db.execute('SELECT content FROM account_notes').fetchone()[0],body)
  self.db.execute('UPDATE account_notes SET content=?',('edited',));self.assertEqual(self.db.execute('SELECT used_bytes FROM account_notes_usage').fetchone()[0],len((path+'edited').encode()))
  self.db.execute("DELETE FROM account_users WHERE id='1'");self.assertEqual(self.db.execute('SELECT used_bytes FROM account_notes_usage').fetchone()[0],0)
 def test_global_quota_and_owner(self):
  self.user(1);self.user(2);self.db.execute("INSERT INTO account_notes(user_id,path,kind,content) VALUES('1','a.txt','file','hello')")
  with self.assertRaises(sqlite3.IntegrityError):self.db.execute("UPDATE account_notes SET user_id='2'")
  self.db.execute('UPDATE account_notes_usage SET used_bytes=399999999')
  with self.assertRaises(sqlite3.IntegrityError):self.db.execute("INSERT INTO account_notes(user_id,path,kind,content) VALUES('2','b.txt','file','x')")
 def test_referral_constraints(self):
  self.user(1);self.user(2)
  with self.assertRaises(sqlite3.IntegrityError):self.db.execute("INSERT INTO account_referrals VALUES('1','1','pending','now',NULL)")
  with self.assertRaises(sqlite3.IntegrityError):self.db.execute("INSERT INTO account_referrals VALUES('2','1','qualified','now',NULL)")
  self.db.execute("INSERT INTO account_referrals VALUES('2','1','pending','now',NULL)")
  with self.assertRaises(sqlite3.IntegrityError):self.db.execute("INSERT INTO account_referrals VALUES('2','1','pending','now',NULL)")
if __name__=='__main__':unittest.main()
