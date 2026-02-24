-- Over6 Database Schema
-- Vercel Postgres (Neon-backed)

CREATE TABLE IF NOT EXISTS debates (
  id TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  effective_question TEXT,
  socrates_meta JSONB,
  philosophers JSONB NOT NULL,
  messages JSONB NOT NULL,
  sixth JSONB,
  report JSONB,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Index for community board (public debates, newest first)
CREATE INDEX IF NOT EXISTS idx_debates_public ON debates (is_public, created_at DESC)
  WHERE is_public = TRUE;
