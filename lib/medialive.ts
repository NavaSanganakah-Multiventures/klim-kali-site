// lib/medialive.ts
// Lightweight AWS MediaLive client for Cloudflare Workers edge runtime.
// Uses AWS Signature Version 4 over fetch + Web Crypto. No heavy AWS SDK.

export type MedialiveConfig = {
  use_medialive: number;
  aws_region: string;
  aws_access_key_id: string;
  aws_secret_access_key: string;
  medialive_channel_id: string;
};

const enc = new TextEncoder();
const NL = String.fromCharCode(10);

async function sha256Hex(data: string | Uint8Array): Promise<string> {
  const buf = typeof data === "string" ? enc.encode(data) : data;
  const digest = await (globalThis as any).crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmac(key: ArrayBuffer | Uint8Array, data: string): Promise<ArrayBuffer> {
  const k = await (globalThis as any).crypto.subtle.importKey(
    "raw",
    key,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return (globalThis as any).crypto.subtle.sign("HMAC", k, enc.encode(data));
}

export async function signAwsRequest(
  cfg: Pick<MedialiveConfig, "aws_region" | "aws_access_key_id" | "aws_secret_access_key">,
  method: string,
  path: string,
  body?: string,
): Promise<Record<string, string>> {
  const region = cfg.aws_region || "us-east-1";
  const service = "medialive";
  const host = "medialive." + region + ".amazonaws.com";
  const now = new Date();
  const amzDate = now
    .toISOString()
    .slice(0, 19)
    .replace(/-/g, "")
    .replace(/:/g, "")
    .replace(/T/g, "");
  const dateStamp = amzDate.slice(0, 8);

  const payloadHash = await sha256Hex(body || "");
  const canonicalHeaders = "host:" + host + NL + "x-amz-date:" + amzDate + NL;
  const signedHeaders = "host;x-amz-date";
  const canonicalRequest = [
    method,
    path,
    "",
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join(NL);
  const scope = dateStamp + "/" + region + "/" + service + "/aws4_request";
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    scope,
    await sha256Hex(canonicalRequest),
  ].join(NL);

  const kDate = await hmac(enc.encode("AWS4" + cfg.aws_secret_access_key), dateStamp);
  const kRegion = await hmac(kDate, region);
  const kService = await hmac(kRegion, service);
  const kSigning = await hmac(kService, "aws4_request");
  const sig = Array.from(new Uint8Array(await hmac(kSigning, stringToSign)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return {
    Authorization:
      "AWS4-HMAC-SHA256 Credential=" +
      cfg.aws_access_key_id +
      "/" +
      scope +
      ", SignedHeaders=" +
      signedHeaders +
      ", Signature=" +
      sig,
    "X-Amz-Date": amzDate,
  };
}

async function medialiveRequest(
  cfg: MedialiveConfig,
  method: string,
  path: string,
  body?: string,
): Promise<{ status: number; data: any }> {
  const region = cfg.aws_region || "us-east-1";
  const host = "medialive." + region + ".amazonaws.com";
  const headers = await signAwsRequest(cfg, method, path, body || "");
  if (body) headers["Content-Type"] = "application/json";

  const res = await fetch("https://" + host + path, {
    method,
    headers,
    body: body || undefined,
  });

  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  return { status: res.status, data };
}

export function isMedialiveConfigured(cfg: Partial<MedialiveConfig> | null): boolean {
  return !!(
    cfg &&
    cfg.aws_region &&
    cfg.aws_access_key_id &&
    cfg.aws_secret_access_key &&
    cfg.medialive_channel_id
  );
}

export async function startMedialiveChannel(cfg: MedialiveConfig): Promise<void> {
  const path = "/control/channels/" + encodeURIComponent(cfg.medialive_channel_id) + "/start";
  const r = await medialiveRequest(cfg, "POST", path);
  if (r.status < 200 || r.status >= 300) {
    throw new Error(
      "MediaLive start failed (" + r.status + "): " + JSON.stringify(r.data)
    );
  }
}

export async function stopMedialiveChannel(cfg: MedialiveConfig): Promise<void> {
  const path = "/control/channels/" + encodeURIComponent(cfg.medialive_channel_id) + "/stop";
  const r = await medialiveRequest(cfg, "POST", path);
  if (r.status < 200 || r.status >= 300) {
    throw new Error(
      "MediaLive stop failed (" + r.status + "): " + JSON.stringify(r.data)
    );
  }
}

export async function describeMedialiveChannel(cfg: MedialiveConfig): Promise<any> {
  const path = "/control/channels/" + encodeURIComponent(cfg.medialive_channel_id);
  const r = await medialiveRequest(cfg, "GET", path);
  if (r.status < 200 || r.status >= 300) {
    throw new Error(
      "MediaLive describe failed (" + r.status + "): " + JSON.stringify(r.data)
    );
  }
  return r.data;
}
