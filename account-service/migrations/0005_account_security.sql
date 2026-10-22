-- Optional Test security features; existing accounts and notes remain intact.
CREATE TABLE IF NOT EXISTS account_2fa (
 user_id TEXT PRIMARY KEY REFERENCES account_users(id) ON DELETE CASCADE,
 enabled INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS account_2fa_codes (
 token_hash TEXT PRIMARY KEY,
 user_id TEXT NOT NULL REFERENCES account_users(id) ON DELETE CASCADE,
 code_hash TEXT NOT NULL,
 purpose TEXT NOT NULL,
 expires_at INTEGER NOT NULL,
 attempts INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS account_passkeys (
 credential_id TEXT PRIMARY KEY,
 user_id TEXT NOT NULL REFERENCES account_users(id) ON DELETE CASCADE,
 public_jwk TEXT NOT NULL,
 algorithm INTEGER NOT NULL,
 counter INTEGER NOT NULL DEFAULT 0,
 created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS account_passkeys_user ON account_passkeys(user_id);
CREATE TABLE IF NOT EXISTS account_passkey_challenges (
 token_hash TEXT PRIMARY KEY,
 user_id TEXT REFERENCES account_users(id) ON DELETE CASCADE,
 purpose TEXT NOT NULL,
 expires_at INTEGER NOT NULL
);
INSERT OR IGNORE INTO account_schema_migrations(version) VALUES(5);
