-- Credential and session data is private D1 data, never publication content.
CREATE TABLE account_credentials (
 user_id TEXT PRIMARY KEY REFERENCES account_users(id) ON DELETE CASCADE,
 client_salt TEXT NOT NULL,
 password_salt TEXT NOT NULL,
 password_hash TEXT NOT NULL,
 recovery_hash TEXT NOT NULL,
 referral_code TEXT NOT NULL UNIQUE,
 identity_hash TEXT NOT NULL UNIQUE,
 terms_version TEXT NOT NULL,
 terms_accepted_at TEXT NOT NULL
);
CREATE TABLE account_sessions (
 token_hash TEXT PRIMARY KEY,
 user_id TEXT NOT NULL REFERENCES account_users(id) ON DELETE CASCADE,
 csrf TEXT NOT NULL,
 expires_at INTEGER NOT NULL
);
CREATE INDEX account_sessions_user ON account_sessions(user_id);
CREATE INDEX account_sessions_expiry ON account_sessions(expires_at);
CREATE TABLE account_workspaces (
 user_id TEXT PRIMARY KEY REFERENCES account_users(id) ON DELETE CASCADE,
 revision INTEGER NOT NULL DEFAULT 0,
 write_token TEXT NOT NULL DEFAULT ''
);
CREATE TABLE account_signup_networks (
 user_id TEXT PRIMARY KEY REFERENCES account_users(id) ON DELETE CASCADE,
 network_hash TEXT NOT NULL,
 expires_at INTEGER NOT NULL
);
CREATE INDEX account_signup_network_expiry ON account_signup_networks(expires_at);
CREATE TABLE account_rate_limits (
 key TEXT PRIMARY KEY,
 hits INTEGER NOT NULL,
 expires_at INTEGER NOT NULL
);
CREATE INDEX account_rate_expiry ON account_rate_limits(expires_at);
CREATE TABLE account_email_tokens (
 token_hash TEXT PRIMARY KEY,
 user_id TEXT NOT NULL REFERENCES account_users(id) ON DELETE CASCADE,
 expires_at INTEGER NOT NULL
);
CREATE INDEX account_email_tokens_user ON account_email_tokens(user_id);
CREATE INDEX account_email_tokens_expiry ON account_email_tokens(expires_at);
