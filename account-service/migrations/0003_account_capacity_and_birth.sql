-- Preserve existing profiles and notes. Apply once after 0002.
DROP TRIGGER account_registration_cap;
DROP TRIGGER account_daily_cap;
DROP TRIGGER notes_insert_quota;
DROP TRIGGER notes_update_quota;
CREATE TABLE account_limits_next (
 singleton INTEGER PRIMARY KEY CHECK(singleton=1),
 max_accounts INTEGER NOT NULL CHECK(max_accounts=300),
 max_daily_active INTEGER NOT NULL CHECK(max_daily_active=444),
 max_notes_bytes INTEGER NOT NULL CHECK(max_notes_bytes=400000000),
 max_user_bytes INTEGER NOT NULL CHECK(max_user_bytes=900000)
);
INSERT INTO account_limits_next SELECT singleton,300,max_daily_active,max_notes_bytes,max_user_bytes FROM account_limits;
DROP TABLE account_limits;
ALTER TABLE account_limits_next RENAME TO account_limits;
CREATE TRIGGER account_registration_cap BEFORE INSERT ON account_users
WHEN (SELECT count(*) FROM account_users)>=(SELECT max_accounts FROM account_limits WHERE singleton=1)
BEGIN SELECT RAISE(ABORT,'account_capacity'); END;
CREATE TRIGGER account_daily_cap BEFORE INSERT ON account_daily_activity
WHEN NOT EXISTS(SELECT 1 FROM account_daily_activity WHERE day=NEW.day AND user_id=NEW.user_id)
 AND (SELECT count(*) FROM account_daily_activity WHERE day=NEW.day)>=(SELECT max_daily_active FROM account_limits WHERE singleton=1)
BEGIN SELECT RAISE(ABORT,'daily_capacity'); END;
CREATE TRIGGER notes_insert_quota BEFORE INSERT ON account_notes
WHEN (SELECT used_bytes FROM account_notes_usage WHERE singleton=1)+(length(CAST(NEW.path AS BLOB))+length(CAST(NEW.content AS BLOB)))>(SELECT max_notes_bytes FROM account_limits WHERE singleton=1)
 OR COALESCE((SELECT sum(byte_count) FROM account_notes WHERE user_id=NEW.user_id),0)+(length(CAST(NEW.path AS BLOB))+length(CAST(NEW.content AS BLOB)))>(SELECT max_user_bytes FROM account_limits WHERE singleton=1)
BEGIN SELECT RAISE(ABORT,'notes_quota'); END;
CREATE TRIGGER notes_update_quota BEFORE UPDATE ON account_notes
WHEN (SELECT used_bytes FROM account_notes_usage WHERE singleton=1)-OLD.byte_count+(length(CAST(NEW.path AS BLOB))+length(CAST(NEW.content AS BLOB)))>(SELECT max_notes_bytes FROM account_limits WHERE singleton=1)
 OR COALESCE((SELECT sum(byte_count) FROM account_notes WHERE user_id=OLD.user_id),0)-OLD.byte_count+(length(CAST(NEW.path AS BLOB))+length(CAST(NEW.content AS BLOB)))>(SELECT max_user_bytes FROM account_limits WHERE singleton=1)
BEGIN SELECT RAISE(ABORT,'notes_quota'); END;
ALTER TABLE account_users ADD COLUMN date_of_birth TEXT CHECK(date_of_birth IS NULL OR (length(date_of_birth)=10 AND date_of_birth GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]' AND date(date_of_birth,'+0 days') IS NOT NULL AND date(date_of_birth,'+0 days')=date_of_birth));
-- Legacy rows keep NULL: never invent someone's birthday from a stated age.
CREATE TRIGGER account_birth_required BEFORE INSERT ON account_users
WHEN NEW.date_of_birth IS NULL
BEGIN SELECT RAISE(ABORT,'date_of_birth_required'); END;
CREATE TABLE account_schema_migrations (version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
INSERT INTO account_schema_migrations(version) VALUES(1),(2),(3);
