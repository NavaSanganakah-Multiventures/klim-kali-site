# Kleem Kali Site (klim-kali-site)

Next.js (App Router) site deployed on Cloudflare Workers via OpenNext.
Uses D1 (database), R2 (storage) and Email bindings.

## Live Darshan architecture

Camera -> AWS Elemental MediaLive -> YouTube Live -> website embed on /live-darshan

Why MediaLive?
The camera audio had a 0.5x slow/stuttering problem (sample-rate mismatch).
MediaLive re-encodes audio to 48 kHz AAC-LC CBR and video to H.264 CBR at a
fixed frame rate, which fixes the sync problem before the stream reaches YouTube.

## Where is what

- app/live-darshan/page.tsx — public live viewer (YouTube iframe embed)
- app/admin/live/page.tsx — admin control panel (YouTube + AWS MediaLive + camera RTMP settings, start/end, status)
- app/api/admin/live/route.ts — get/save live config (secrets masked)
- app/api/admin/live/start/route.ts — start live (starts MediaLive then YouTube broadcast)
- app/api/admin/live/end/route.ts — end live (stops MediaLive and YouTube broadcast)
- app/api/admin/live/medialive-state/route.ts — check MediaLive channel state
- app/api/admin/live/medialive-inputs/route.ts — list RTMP push inputs + camera RTMP URLs
- app/api/live/status/route.ts — public live status
- lib/youtube.ts — YouTube Data API helpers (OAuth, broadcast start/end)
- lib/medialive.ts — lightweight AWS MediaLive client (SigV4 signed fetch, Web Crypto)
- db_migrations/0005_live_stream.sql — live_stream_config table (YouTube fields)
- db_migrations/0006_aws_medialive.sql — AWS MediaLive columns
- db_migrations/0007_rtmp_camera.sql — RTMP camera input columns
- docs/live-stream-setup.md — full setup guide (AWS, Google Cloud, camera)

## One-time setup

Full step-by-step guide: docs/live-stream-setup.md

Quick summary:
1. AWS: IAM user (AWSElementalMediaLiveFullAccess) + access key/secret.
2. AWS MediaLive: RTMP (push) input -> copy Destination A URL for the camera.
3. AWS MediaLive: channel -> attach input, audio AAC-LC 48 kHz CBR, video H.264 CBR 30 fps, RTMP output to YouTube stream URL + key.
4. Google Cloud: enable YouTube Data API v3, create OAuth consent screen + OAuth client, get refresh token via OAuth Playground.
5. YouTube Studio: channel ID + stream key.
6. Admin panel -> Live Darshan: fill YouTube, AWS MediaLive and Camera/RTMP fields. Enable "MediaLive use karein" and Save.

## Daily usage

- Camera pushes RTMP to MediaLive Destination A.
- Admin clicks Live Start Karo: starts MediaLive channel, then starts YouTube broadcast.
- Admin clicks Live End Karo: stops MediaLive channel and ends YouTube broadcast.
- Public viewers watch on /live-darshan (YouTube embed).

## Local development

bun install
bun run dev
