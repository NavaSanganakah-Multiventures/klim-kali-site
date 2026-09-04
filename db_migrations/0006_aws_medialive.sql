-- Migration: AWS MediaLive settings for live pipeline
-- Camera RTMP-pushes to MediaLive. MediaLive re-encodes audio (48 kHz AAC-LC CBR)
-- to fix the 0.5x slow-audio problem, then pushes RTMP to YouTube.
-- The admin panel starts/stops the MediaLive channel.

ALTER TABLE live_stream_config ADD COLUMN use_medialive INTEGER NOT NULL DEFAULT 0;
ALTER TABLE live_stream_config ADD COLUMN aws_region TEXT NOT NULL DEFAULT '';
ALTER TABLE live_stream_config ADD COLUMN aws_access_key_id TEXT NOT NULL DEFAULT '';
ALTER TABLE live_stream_config ADD COLUMN aws_secret_access_key TEXT NOT NULL DEFAULT '';
ALTER TABLE live_stream_config ADD COLUMN medialive_channel_id TEXT NOT NULL DEFAULT '';
