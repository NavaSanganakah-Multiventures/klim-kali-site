import { getCloudflareContext } from "@opennextjs/cloudflare";

export type LiveConfig = {
  youtube_channel_id: string;
  youtube_stream_key: string;
  oauth_client_id: string;
  oauth_client_secret: string;
  oauth_refresh_token: string;
  oauth_access_token: string;
  oauth_token_expiry: number;
  current_broadcast_id: string;
  is_live: number;
};

const YT_API = "https://www.googleapis.com/youtube/v3";
const OAUTH_TOKEN_URL = "https://oauth2.googleapis.com/token";

export function isLiveConfigured(config: Partial<LiveConfig> | null): boolean {
  return !!(
    config &&
    config.youtube_channel_id &&
    config.youtube_stream_key &&
    config.oauth_client_id &&
    config.oauth_client_secret &&
    config.oauth_refresh_token
  );
}

export async function getLiveConfig(db?: any): Promise<LiveConfig | null> {
  let d1 = db;
  if (!d1) {
    try {
      d1 = getCloudflareContext().env.DB;
    } catch (e) {
      d1 = null;
    }
  }
  if (!d1) return null;
  const row = await d1.prepare("SELECT * FROM live_stream_config WHERE id = 1").first();
  return (row as LiveConfig) || null;
}

async function fetchAccessToken(config: LiveConfig, db: any): Promise<string> {
  const now = Date.now();
  if (config.oauth_access_token && config.oauth_token_expiry > now + 60 * 1000) {
    return config.oauth_access_token;
  }

  const res = await fetch(OAUTH_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: config.oauth_client_id,
      client_secret: config.oauth_client_secret,
      refresh_token: config.oauth_refresh_token,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error("OAuth token refresh failed (" + res.status + "): " + text);
  }

  const data: any = await res.json();
  const accessToken = data.access_token as string;
  const expiresIn = Number(data.expires_in || 3600);

  await db
    .prepare(
      "UPDATE live_stream_config SET oauth_access_token = ?, oauth_token_expiry = ? WHERE id = 1"
    )
    .bind(accessToken, now + expiresIn * 1000)
    .run();

  return accessToken;
}

async function resolveStreamId(accessToken: string, streamKey: string): Promise<string | null> {
  const res = await fetch(YT_API + "/liveStreams?part=id,snippet,cdn&mine=true", {
    headers: { Authorization: "Bearer " + accessToken },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error("YouTube liveStreams.list failed (" + res.status + "): " + text);
  }

  const data: any = await res.json();
  const items: any[] = data.items || [];
  for (const s of items) {
    if (s.cdn && s.cdn.ingestionInfo && s.cdn.ingestionInfo.streamName === streamKey) {
      return s.id as string;
    }
  }
  return null;
}

async function findLiveBroadcastId(accessToken: string): Promise<string | null> {
  const res = await fetch(
    YT_API + "/liveBroadcasts?part=id,status&broadcastStatus=live&broadcastType=all",
    { headers: { Authorization: "Bearer " + accessToken } }
  );
  if (!res.ok) return null;
  const data: any = await res.json();
  return data.items && data.items[0] ? (data.items[0].id as string) : null;
}

export async function startLive(
  config: LiveConfig,
  db: any
): Promise<{ broadcastId: string }> {
  const accessToken = await fetchAccessToken(config, db);

  const streamId = await resolveStreamId(accessToken, config.youtube_stream_key);
  if (!streamId) {
    throw new Error("YouTube stream nahi mila. Admin settings me stream key check karo.");
  }

  const insertBody = {
    snippet: {
      title: "काली माता मंदिर - लाइव दर्शन",
      description: "काली माता मंदिर से लाइव दर्शन",
      scheduledStartTime: new Date().toISOString(),
    },
    status: {
      privacyStatus: "public",
      lifeCycleStatus: "ready",
    },
    contentDetails: {
      boundStreamId: streamId,
    },
  };

  const insertRes = await fetch(YT_API + "/liveBroadcasts?part=snippet,status,contentDetails", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + accessToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(insertBody),
  });

  if (!insertRes.ok) {
    const text = await insertRes.text();
    throw new Error("YouTube liveBroadcasts.insert failed (" + insertRes.status + "): " + text);
  }

  const broadcast: any = await insertRes.json();

  const transitionRes = await fetch(
    YT_API + "/liveBroadcasts/transition?part=status&id=" + broadcast.id + "&broadcastStatus=live",
    { method: "POST", headers: { Authorization: "Bearer " + accessToken } }
  );

  if (!transitionRes.ok) {
    const text = await transitionRes.text();
    throw new Error("YouTube transition to live failed (" + transitionRes.status + "): " + text);
  }

  await db
    .prepare(
      "UPDATE live_stream_config SET current_broadcast_id = ?, is_live = 1, updated_at = datetime('now') WHERE id = 1"
    )
    .bind(broadcast.id)
    .run();

  return { broadcastId: broadcast.id };
}

export async function endLive(config: LiveConfig, db: any): Promise<{ warning?: string }> {
  let warning: string | undefined;

  try {
    const accessToken = await fetchAccessToken(config, db);
    // Prefer the broadcast that is actually live right now (handles cases where
    // the stored id was already ended externally and a new one was started).
    const liveBroadcastId = await findLiveBroadcastId(accessToken);
    const broadcastId = liveBroadcastId || config.current_broadcast_id;

    if (broadcastId) {
      const res = await fetch(
        YT_API + "/liveBroadcasts/transition?part=status&id=" + broadcastId + "&broadcastStatus=complete",
        { method: "POST", headers: { Authorization: "Bearer " + accessToken } }
      );
      if (!res.ok) {
        const text = await res.text();
        warning = "YouTube end failed (" + res.status + "): " + text;
      }
    }
  } catch (e: any) {
    warning = (e && e.message) ? e.message : String(e);
  }

  await db
    .prepare(
      "UPDATE live_stream_config SET is_live = 0, current_broadcast_id = '', updated_at = datetime('now') WHERE id = 1"
    )
    .run();

  return { warning };
}
