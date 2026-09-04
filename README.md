# Kali Mata Mandir Site (klim-kali-site)

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
- app/admin/live/page.tsx — admin control panel (YouTube + AWS MediaLive settings, start/end, status)
- app/api/admin/live/route.ts — get/save live config (secrets masked)
- app/api/admin/live/start/route.ts — start live (starts MediaLive then YouTube broadcast)
- app/api/admin/live/end/route.ts — end live (stops MediaLive and YouTube broadcast)
- app/api/admin/live/medialive-state/route.ts — check MediaLive channel state
- app/api/live/status/route.ts — public live status
- lib/youtube.ts — YouTube Data API helpers (OAuth, broadcast start/end)
- lib/medialive.ts — lightweight AWS MediaLive client (SigV4 signed fetch, Web Crypto)
- db_migrations/0005_live_stream.sql — live_stream_config table (YouTube fields)
- db_migrations/0006_aws_medialive.sql — AWS MediaLive columns

## One-time AWS setup (manual, in AWS console)

1. MediaLive -> Inputs -> Create input -> RTMP (push). Copy Destination A URL into the camera.
2. MediaLive -> Channels -> Create channel:
   - Input: the RTMP push input
   - Audio output: AAC, LC-AAC profile, sample rate 48000, CBR 128000, coding mode 2.0
   - Video output: H.264 CBR, SPECIFY frame rate 30/1, GOP 60, B-frames 0
   - RTMP output group: YouTube stream URL + stream key
3. IAM -> create a user with only medialive:StartChannel, medialive:StopChannel, medialive:DescribeChannel. Copy access key + secret.
4. Admin panel -> Live Darshan -> AWS MediaLive Settings: fill region, access key, secret, channel ID. Enable MediaLive use karein and Save.

## Daily usage

- Camera pushes RTMP to MediaLive Destination A.
- Admin clicks Live Start Karo: starts MediaLive channel, then starts YouTube broadcast.
- Admin clicks Live End Karo: stops MediaLive channel and ends YouTube broadcast.
- Public viewers watch on /live-darshan (YouTube embed).

## Local development

bun install
bun run dev
