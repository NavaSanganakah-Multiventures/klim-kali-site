-- Migration: YouTube live stream configuration and state
-- Camera RTMP-pushes to YouTube permanently. The admin panel starts/ends the
-- public broadcast via the YouTube Data API.
CREATE TABLE IF NOT EXISTS live_stream_config (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  youtube_channel_id TEXT NOT NULL DEFAULT '',
  youtube_stream_key TEXT NOT NULL DEFAULT '',
  oauth_client_id TEXT NOT NULL DEFAULT '',
  oauth_client_secret TEXT NOT NULL DEFAULT '',
  oauth_refresh_token TEXT NOT NULL DEFAULT '',
  oauth_access_token TEXT NOT NULL DEFAULT '',
  oauth_token_expiry INTEGER NOT NULL DEFAULT 0,
  current_broadcast_id TEXT NOT NULL DEFAULT '',
  is_live INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO live_stream_config (id) VALUES (1);
