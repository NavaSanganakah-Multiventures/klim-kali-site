-- Migration 0003: Add daily darshan images table
CREATE TABLE IF NOT EXISTS daily_darshan (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  image_key TEXT NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_daily_darshan_date ON daily_darshan(date);
CREATE INDEX IF NOT EXISTS idx_daily_darshan_created_at ON daily_darshan(created_at);
