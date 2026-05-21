CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  role user_role DEFAULT 'user',
  is_banned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ DEFAULT NULL
)