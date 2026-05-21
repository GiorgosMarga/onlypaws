CREATE TABLE IF NOT EXISTS profiles (
  user_id         UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  username VARCHAR(255) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  pfp_url TEXT,
  bio TEXT,
  location VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ DEFAULT NULL
)