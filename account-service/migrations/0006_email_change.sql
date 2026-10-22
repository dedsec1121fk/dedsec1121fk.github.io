-- Additive schema for two-stage email changes on Test D1 only.
CREATE TABLE IF NOT EXISTS account_email_changes (
 user_id TEXT PRIMARY KEY REFERENCES account_users(id) ON DELETE CASCADE,
 pending_email TEXT NOT NULL,
 old_hash TEXT NOT NULL UNIQUE,
 new_hash TEXT UNIQUE,
 stage TEXT NOT NULL CHECK(stage IN ('old','new')),
 expires_at INTEGER NOT NULL,
 created_at TEXT NOT NULL
);
INSERT OR IGNORE INTO account_schema_migrations(version) VALUES(6);
