-- Migration: Add featured-flag + manual fields to donations and create events table

ALTER TABLE donations ADD COLUMN display_on_site INTEGER NOT NULL DEFAULT 0;
ALTER TABLE donations ADD COLUMN phone TEXT;
ALTER TABLE donations ADD COLUMN payment_mode TEXT DEFAULT 'ONLINE';
ALTER TABLE donations ADD COLUMN notes TEXT;

CREATE INDEX IF NOT EXISTS idx_donations_display_on_site ON donations(display_on_site);
CREATE INDEX IF NOT EXISTS idx_donations_display_status ON donations(display_on_site, status);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_date TEXT NOT NULL,
  location TEXT,
  image_url TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_events_is_active ON events(is_active);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_active_date ON events(is_active, event_date);
