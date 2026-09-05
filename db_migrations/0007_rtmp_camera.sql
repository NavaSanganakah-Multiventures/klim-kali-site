-- Migration: RTMP camera input details for AWS MediaLive pipeline.
-- Stores which MediaLive input the camera pushes to, plus the camera-side RTMP URLs.

ALTER TABLE live_stream_config ADD COLUMN medialive_input_id TEXT NOT NULL DEFAULT '';
ALTER TABLE live_stream_config ADD COLUMN camera_rtmp_url TEXT NOT NULL DEFAULT '';
ALTER TABLE live_stream_config ADD COLUMN camera_rtmp_backup_url TEXT NOT NULL DEFAULT '';
