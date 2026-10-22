-- Data model only. No real users or credentials are seeded.
-- Every write must eventually be authorized by the server, never by client IDs.
PRAGMA foreign_keys=ON;
CREATE TABLE account_limits (
 singleton INTEGER PRIMARY KEY CHECK(singleton=1),
 max_accounts INTEGER NOT NULL CHECK(max_accounts=444),
 max_daily_active INTEGER NOT NULL CHECK(max_daily_active=444),
 max_notes_bytes INTEGER NOT NULL CHECK(max_notes_bytes=400000000),
 max_user_bytes INTEGER NOT NULL CHECK(max_user_bytes=900000)
);
INSERT INTO account_limits VALUES(1,444,444,400000000,900000);
CREATE TABLE account_users (
 id TEXT PRIMARY KEY,
 auth_subject TEXT NOT NULL UNIQUE,
 email TEXT NOT NULL UNIQUE CHECK(email=lower(trim(email)) AND length(email)<=254),
 given_name TEXT NOT NULL CHECK(length(given_name) BETWEEN 1 AND 80),
 family_name TEXT NOT NULL CHECK(length(family_name) BETWEEN 1 AND 80),
 age_at_registration INTEGER NOT NULL CHECK(age_at_registration BETWEEN 1 AND 120),
 email_verified_at TEXT,
 created_at TEXT NOT NULL
);
CREATE TRIGGER account_registration_cap BEFORE INSERT ON account_users
WHEN (SELECT count(*) FROM account_users)>=(SELECT max_accounts FROM account_limits WHERE singleton=1)
BEGIN SELECT RAISE(ABORT,'account_capacity'); END;
CREATE TABLE account_daily_activity (
 day TEXT NOT NULL CHECK(day GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
 user_id TEXT NOT NULL REFERENCES account_users(id) ON DELETE CASCADE,
 PRIMARY KEY(day,user_id)
);
CREATE TRIGGER account_daily_cap BEFORE INSERT ON account_daily_activity
WHEN NOT EXISTS(SELECT 1 FROM account_daily_activity WHERE day=NEW.day AND user_id=NEW.user_id)
 AND (SELECT count(*) FROM account_daily_activity WHERE day=NEW.day)>=(SELECT max_daily_active FROM account_limits WHERE singleton=1)
BEGIN SELECT RAISE(ABORT,'daily_capacity'); END;
CREATE TABLE account_notes_usage (
 singleton INTEGER PRIMARY KEY CHECK(singleton=1),
 used_bytes INTEGER NOT NULL DEFAULT 0 CHECK(used_bytes BETWEEN 0 AND 400000000)
);
INSERT INTO account_notes_usage VALUES(1,0);
CREATE TABLE account_notes (
 user_id TEXT NOT NULL REFERENCES account_users(id) ON DELETE CASCADE,
 path TEXT NOT NULL CHECK(length(path)>0 AND substr(path,1,1)<>'/' AND instr(path,char(0))=0 AND instr(path,char(92))=0),
 kind TEXT NOT NULL CHECK(kind IN ('file','folder')),
 content TEXT NOT NULL DEFAULT '' CHECK(instr(content,char(0))=0),
 pinned INTEGER NOT NULL DEFAULT 0 CHECK(pinned IN (0,1)),
 byte_count INTEGER GENERATED ALWAYS AS (length(CAST(path AS BLOB))+length(CAST(content AS BLOB))) STORED,
 PRIMARY KEY(user_id,path),
 CHECK(kind<>'folder' OR content=''),
 CHECK(kind<>'file' OR lower(substr(path,-4))='.txt')
);
CREATE TRIGGER notes_entry_cap BEFORE INSERT ON account_notes
WHEN (SELECT count(*) FROM account_notes WHERE user_id=NEW.user_id AND kind=NEW.kind)>=CASE NEW.kind WHEN 'file' THEN 200 ELSE 50 END
BEGIN SELECT RAISE(ABORT,'entry_limit'); END;
CREATE TRIGGER notes_insert_quota BEFORE INSERT ON account_notes
WHEN (SELECT used_bytes FROM account_notes_usage WHERE singleton=1)+(length(CAST(NEW.path AS BLOB))+length(CAST(NEW.content AS BLOB)))>(SELECT max_notes_bytes FROM account_limits WHERE singleton=1)
 OR COALESCE((SELECT sum(byte_count) FROM account_notes WHERE user_id=NEW.user_id),0)+(length(CAST(NEW.path AS BLOB))+length(CAST(NEW.content AS BLOB)))>(SELECT max_user_bytes FROM account_limits WHERE singleton=1)
BEGIN SELECT RAISE(ABORT,'notes_quota'); END;
CREATE TRIGGER notes_owner_immutable BEFORE UPDATE OF user_id ON account_notes
WHEN OLD.user_id<>NEW.user_id BEGIN SELECT RAISE(ABORT,'owner_immutable'); END;
CREATE TRIGGER notes_update_quota BEFORE UPDATE ON account_notes
WHEN (SELECT used_bytes FROM account_notes_usage WHERE singleton=1)-OLD.byte_count+(length(CAST(NEW.path AS BLOB))+length(CAST(NEW.content AS BLOB)))>(SELECT max_notes_bytes FROM account_limits WHERE singleton=1)
 OR COALESCE((SELECT sum(byte_count) FROM account_notes WHERE user_id=OLD.user_id),0)-OLD.byte_count+(length(CAST(NEW.path AS BLOB))+length(CAST(NEW.content AS BLOB)))>(SELECT max_user_bytes FROM account_limits WHERE singleton=1)
BEGIN SELECT RAISE(ABORT,'notes_quota'); END;
CREATE TRIGGER notes_after_insert AFTER INSERT ON account_notes BEGIN UPDATE account_notes_usage SET used_bytes=used_bytes+(length(CAST(NEW.path AS BLOB))+length(CAST(NEW.content AS BLOB))) WHERE singleton=1; END;
CREATE TRIGGER notes_after_update AFTER UPDATE ON account_notes BEGIN UPDATE account_notes_usage SET used_bytes=used_bytes-OLD.byte_count+(length(CAST(NEW.path AS BLOB))+length(CAST(NEW.content AS BLOB))) WHERE singleton=1; END;
CREATE TRIGGER notes_after_delete AFTER DELETE ON account_notes BEGIN UPDATE account_notes_usage SET used_bytes=used_bytes-OLD.byte_count WHERE singleton=1; END;
CREATE TABLE account_referrals (
 invitee_id TEXT PRIMARY KEY REFERENCES account_users(id) ON DELETE CASCADE,
 inviter_id TEXT NOT NULL REFERENCES account_users(id) ON DELETE CASCADE,
 state TEXT NOT NULL DEFAULT 'pending' CHECK(state IN ('pending','qualified','rejected')),
 created_at TEXT NOT NULL,
 qualified_at TEXT,
 CHECK(invitee_id<>inviter_id),
 CHECK(state<>'qualified' OR qualified_at IS NOT NULL)
);
CREATE INDEX account_referral_inviter ON account_referrals(inviter_id,state);
-- This is an optional, short-lived abuse signal, NOT proof of a unique person.
-- Future server code HMACs IPs with a separate secret; raw IPs are not stored.
CREATE TABLE account_abuse_signals (
 user_id TEXT NOT NULL REFERENCES account_users(id) ON DELETE CASCADE,
 day TEXT NOT NULL,
 ip_hmac TEXT NOT NULL CHECK(length(ip_hmac)=64),
 expires_at TEXT NOT NULL,
 PRIMARY KEY(user_id,day,ip_hmac)
);
