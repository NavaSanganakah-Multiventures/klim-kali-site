# Live Stream Setup Guide

Is guide me poora setup cover hai: AWS MediaLive (RTMP input + channel), Google Cloud OAuth (YouTube Data API), YouTube Studio, aur camera encoder settings.

## Architecture

Camera (RTMP push) -> AWS Elemental MediaLive (re-encode audio/video) -> YouTube Live RTMP -> website embed (/live-darshan)

MediaLive audio ko 48 kHz AAC-LC CBR me re-encode karta hai, jisse camera ka 0.5x slow audio problem fix ho jata hai.

## 1. AWS IAM user (credentials)

1. AWS Console -> IAM -> Users -> Create user.
2. Username: klim-kali-medialive (koi bhi naam chalega).
3. Permissions -> Attach policies directly -> search "AWSElementalMediaLiveFullAccess" -> select karo.
4. User create karo, phir Security credentials -> Create access key.
5. Access Key ID aur Secret Access Key copy karke rakho (secret sirf ek baar dikhta hai).

Note: Least privilege ke liye sirf MediaLive permissions chahiye, lekin shuru karne ke liye AWSElementalMediaLiveFullAccess sabse simple hai.

## 2. AWS MediaLive region

Admin panel me region wahi daalo jahan MediaLive resources banaye hain. Common: ap-south-1 (Mumbai) ya us-east-1 (Virginia).

Important: MediaLive har region me available nahi hai. Agar channel create nahi ho raha to region check karo.

## 3. AWS MediaLive RTMP input

1. AWS MediaLive console -> Inputs -> Create input.
2. Input type: RTMP (push).
3. Name: klim-kali-camera (koi bhi naam).
4. Create dabao.
5. Input details me 2 destinations milenge:
   - Destination A: rtmp://IP:PORT/live/... (camera me ye URL dalna hai)
   - Destination B: backup URL
6. Input ID copy karo (admin panel me ye chahiye).

## 4. AWS MediaLive channel

1. MediaLive console -> Channels -> Create channel.
2. Input: upar wala RTMP push input attach karo.
3. Audio encoding (Audio 1):
   - Codec: AAC
   - Profile: LC-AAC
   - Sample rate: 48000 Hz
   - Coding mode: 2.0 (stereo)
   - Bitrate control mode: CBR
   - Bitrate: 128000 bps
4. Video encoding (Video 1):
   - Codec: H.264
   - Bitrate control mode: CBR
   - Frame rate: SPECIFY, 30/1
   - GOP size: 60 (2 seconds)
   - B-frames: 0
5. Output group: RTMP
   - Destination URL: rtmp://a.rtmp.youtube.com/live2
   - Stream key: YouTube Studio se stream key
6. Channel create karo. Channel ID copy karo (admin panel me ye chahiye).

## 5. YouTube Studio

1. YouTube Studio -> Create -> Go live.
2. Stream key banao (ya existing use karo). Stream key copy karo.
3. Stream URL: rtmp://a.rtmp.youtube.com/live2 (backup: rtmp://b.rtmp.youtube.com/live2).
4. Channel ID: youtube.com/channel/... se copy karo.

## 6. Google Cloud OAuth (YouTube Data API)

Site ko YouTube broadcast start/end karne ke liye OAuth token chahiye.

1. Google Cloud Console -> project banao (ya existing use karo).
2. APIs & Services -> Library -> YouTube Data API v3 -> Enable.
3. APIs & Services -> OAuth consent screen:
   - User type: External
   - App name + support email bharo
   - Scopes: https://www.googleapis.com/auth/youtube aur https://www.googleapis.com/auth/youtube.force-ssl
   - Test users: apna YouTube channel ka Google account add karo (kyunki app "Testing" mode me hai)
4. APIs & Services -> Credentials -> Create credentials -> OAuth client ID:
   - Application type: Web application
   - Name: klim-kali-site
   - Authorized redirect URIs: https://developers.google.com/oauthplayground
5. Client ID aur Client Secret copy karo.
6. Google OAuth Playground kholo:
   - URL: https://developers.google.com/oauthplayground
   - Settings (gear) -> Use your own OAuth credentials -> Client ID + Secret paste karo.
   - Step 1: Scope select karo: YouTube Data API v3 -> https://www.googleapis.com/auth/youtube aur https://www.googleapis.com/auth/youtube.force-ssl
   - Authorize APIs dabao -> apne channel account se login karo.
   - Step 2: Exchange authorization code for tokens -> Refresh token copy karo.
7. Refresh token ko admin panel me save karo.

Note: OAuth refresh token tab tak valid rehta hai jab tak app "Testing" mode me hai. Google testing mode ke refresh tokens kuch dinon me expire ho sakte hain. Production ke liye app ko "In production" publish karna padta hai.

## 7. Admin panel fields

- YouTube Channel ID -> youtube_channel_id
- Stream Key -> youtube_stream_key
- OAuth Client ID -> oauth_client_id
- OAuth Client Secret -> oauth_client_secret
- OAuth Refresh Token -> oauth_refresh_token
- Use MediaLive (checkbox) -> use_medialive
- AWS Region -> aws_region
- AWS Access Key ID -> aws_access_key_id
- AWS Secret Access Key -> aws_secret_access_key
- MediaLive Channel ID -> medialive_channel_id
- MediaLive Input ID -> medialive_input_id
- Camera RTMP URL (Destination A) -> camera_rtmp_url
- Camera RTMP Backup URL (Destination B) -> camera_rtmp_backup_url

## 8. Camera encoder settings

Camera (ya OBS) me ye settings rakho:

- Protocol: RTMP push
- Video codec: H.264
- Video bitrate: CBR
- Frame rate: 30 fps
- GOP: 60 (2 seconds)
- B-frames: 0
- Audio codec: AAC
- Audio profile: LC-AAC
- Audio sample rate: 48 kHz (48000 Hz)
- Audio bitrate: CBR, 128 kbps
- Audio channels: stereo (2.0)

## 9. Daily operation

1. Camera RTMP push -> MediaLive Destination A URL.
2. Admin panel -> Live Darshan -> Live Start Karo (MediaLive channel start + YouTube broadcast live).
3. Live End Karo se MediaLive channel + YouTube broadcast dono band.

## Troubleshooting

- "MediaLive start failed": AWS credentials ya channel ID galat hain, ya channel region match nahi karta.
- "YouTube stream nahi mila": stream key galat hai ya YouTube channel me stream key nahi hai.
- "OAuth token refresh failed": refresh token expire ho gaya, OAuth Playground se naya refresh token banao.
- Audio slow/0.5x: camera audio sample rate 48 kHz nahi hai. MediaLive use karo ya camera encoder me 48 kHz set karo.
