-- This Test service has no accounts yet. Refuse any populated database:
-- rebuilding a parent table with live children requires a separate migration.
-- Run as one atomic batch while account registration is paused.
CREATE TABLE account_age_migration_guard (empty_accounts INTEGER CHECK(empty_accounts=0));
INSERT INTO account_age_migration_guard SELECT count(*) FROM account_users;
CREATE TABLE account_users_adult (
 id TEXT PRIMARY KEY,
 auth_subject TEXT NOT NULL UNIQUE,
 email TEXT NOT NULL UNIQUE CHECK(email=lower(trim(email)) AND length(email)<=254),
 given_name TEXT NOT NULL CHECK(length(given_name) BETWEEN 1 AND 80),
 family_name TEXT NOT NULL CHECK(length(family_name) BETWEEN 1 AND 80),
 age_at_registration INTEGER NOT NULL CHECK(age_at_registration BETWEEN 18 AND 130),
 email_verified_at TEXT,
 created_at TEXT NOT NULL,
 date_of_birth TEXT NOT NULL CHECK(length(date_of_birth)=10 AND date_of_birth GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]' AND date(date_of_birth,'+0 days') IS NOT NULL AND date(date_of_birth,'+0 days')=date_of_birth)
);
DROP TABLE account_users;
ALTER TABLE account_users_adult RENAME TO account_users;
CREATE TRIGGER account_registration_cap BEFORE INSERT ON account_users
WHEN (SELECT count(*) FROM account_users)>=(SELECT max_accounts FROM account_limits WHERE singleton=1)
BEGIN SELECT RAISE(ABORT,'account_capacity'); END;
CREATE TRIGGER account_birth_required BEFORE INSERT ON account_users
WHEN NEW.date_of_birth IS NULL
BEGIN SELECT RAISE(ABORT,'date_of_birth_required'); END;
DROP TABLE account_age_migration_guard;
INSERT INTO account_schema_migrations(version) VALUES(4);
