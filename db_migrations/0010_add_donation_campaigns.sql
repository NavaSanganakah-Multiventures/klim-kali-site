-- Migration: Add donation campaigns

CREATE TABLE IF NOT EXISTS donation_campaigns (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  target_amount REAL NOT NULL,
  raised_amount REAL NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_donation_campaigns_active ON donation_campaigns(is_active);

ALTER TABLE donations ADD COLUMN campaign_id TEXT;

CREATE INDEX IF NOT EXISTS idx_donations_campaign_id ON donations(campaign_id);
