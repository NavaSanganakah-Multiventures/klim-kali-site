"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Loader2, Power, Radio, Save, Youtube } from "lucide-react";

const inputCls =
  "w-full px-3 py-2 rounded-lg border border-orange-200 bg-orange-50/40 text-orange-950 placeholder:text-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-orange-950 mb-1">{label}</label>
      {hint && <p className="text-xs text-orange-400 mb-1">{hint}</p>}
      {children}
    </div>
  );
}

export default function AdminLivePage() {
  const [form, setForm] = useState({
    youtube_channel_id: "",
    youtube_stream_key: "",
    oauth_client_id: "",
    oauth_client_secret: "",
    oauth_refresh_token: "",
    use_medialive: false,
    aws_region: "",
    aws_access_key_id: "",
    aws_secret_access_key: "",
    medialive_channel_id: "",
  });
  const [isLive, setIsLive] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/live");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Load failed");
      setForm({
        youtube_channel_id: data.youtube_channel_id || "",
        youtube_stream_key: data.youtube_stream_key || "",
        oauth_client_id: data.oauth_client_id || "",
        oauth_client_secret: data.oauth_client_secret || "",
        oauth_refresh_token: data.oauth_refresh_token || "",
        use_medialive: !!data.use_medialive,
        aws_region: data.aws_region || "",
        aws_access_key_id: data.aws_access_key_id || "",
        aws_secret_access_key: data.aws_secret_access_key || "",
        medialive_channel_id: data.medialive_channel_id || "",
      });
      setIsConfigured(!!data.isConfigured);
      setIsLive(!!data.is_live);
    } catch (e: any) {
      setError(e.message || "Load failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    setBusy(true);
    setMessage("");
    setError("");
    try {
      const res = await fetch("/api/admin/live", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setMessage("Settings save ho gaye ✅");
      await load();
    } catch (e: any) {
      setError(e.message || "Save failed");
    } finally {
      setBusy(false);
    }
  };

  const toggle = async () => {
    setBusy(true);
    setMessage("");
    setError("");
    try {
      const url = isLive ? "/api/admin/live/end" : "/api/admin/live/start";
      const res = await fetch(url, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Toggle failed");
      if (data.warning) {
        setMessage("Local state update ho gaya, lekin YouTube se warning: " + data.warning);
      } else {
        setMessage(isLive ? "Live band ho gaya ⚫" : "Live shuru ho gaya 🔴");
      }
      await load();
    } catch (e: any) {
      setError(e.message || "Toggle failed");
    } finally {
      setBusy(false);
    }
  };

  const set = (key: string) => (e: any) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const [mlState, setMlState] = useState("");
  const [mlBusy, setMlBusy] = useState(false);

  const checkMedialive = async () => {
    setMlBusy(true);
    setMlState("");
    try {
      const res = await fetch("/api/admin/live/medialive-state");
      const data = await res.json();
      if (data.error) {
        setMlState("Error: " + data.error);
      } else if (!data.configured) {
        setMlState("MediaLive configure nahi hai");
      } else {
        setMlState("Channel state: " + data.state);
      }
    } catch (e: any) {
      setMlState("Error: " + (e.message || "check failed"));
    } finally {
      setMlBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 text-orange-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Youtube className="w-8 h-8 text-red-600" />
        <div>
          <h1 className="text-2xl font-bold text-orange-950">Live Darshan Control</h1>
          <p className="text-sm text-orange-600">YouTube live broadcast ko yahan se start/end karo</p>
        </div>
      </div>

      {error && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>}
      {message && <div className="mb-4 p-3 rounded-lg bg-green-50 text-green-700 text-sm">{message}</div>}

      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-orange-600" />
              <span className="font-semibold text-orange-950">Live Status</span>
            </div>
            <p className="text-sm text-orange-600 mt-1">
              {isLive ? "अभी live chal raha hai" : "अभी live band hai"}
            </p>
          </div>
          <button
            onClick={toggle}
            disabled={busy || (!isConfigured && !isLive)}
            className={
              "inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-white transition " +
              (isLive
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700 disabled:opacity-40")
            }
          >
            {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Power className="w-5 h-5" />}
            {isLive ? "Live End Karo" : "Live Start Karo"}
          </button>
        </div>
        {!isConfigured && (
          <p className="mt-4 text-xs text-orange-500 bg-orange-50 p-3 rounded-lg">
            ⚠️ Pehle neeche YouTube settings (Channel ID + Stream Key + OAuth) save karo, tab Start button chalega.
          </p>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="font-semibold text-orange-950 mb-1">YouTube Settings</h2>
        <p className="text-sm text-orange-600 mb-4">Ye ek baar set karna hota hai. Jahan &quot;••&quot; dikhe wahan secret set hai — naya value type karo to update, ya khaali karke Save karo to remove.</p>

        <div className="space-y-4">
          <Field label="YouTube Channel ID" hint="channel ka ID (youtube.com/channel/... wala)">
            <input className={inputCls} value={form.youtube_channel_id} onChange={set("youtube_channel_id")} placeholder="UCxxxxxxxxxxxxxxxxxxxx" />
          </Field>
          <Field label="Stream Key (jo camera me dala hai)" hint="YouTube Studio → Go Live → Stream key">
            <input type="password" className={inputCls} value={form.youtube_stream_key} onChange={set("youtube_stream_key")} placeholder="xxxx-xxxx-xxxx-xxxx" />
          </Field>
          <Field label="OAuth Client ID">
            <input className={inputCls} value={form.oauth_client_id} onChange={set("oauth_client_id")} placeholder="Google Cloud se client id" />
          </Field>
          <Field label="OAuth Client Secret">
            <input type="password" className={inputCls} value={form.oauth_client_secret} onChange={set("oauth_client_secret")} placeholder="Google Cloud se client secret" />
          </Field>
          <Field label="OAuth Refresh Token">
            <input type="password" className={inputCls} value={form.oauth_refresh_token} onChange={set("oauth_refresh_token")} placeholder="OAuth Playground se refresh token" />
          </Field>
        </div>

        <button
          onClick={save}
          disabled={busy}
          className="mt-6 inline-flex items-center gap-2 bg-orange-600 text-white px-6 py-2.5 rounded-full font-medium hover:bg-orange-700 transition disabled:opacity-40"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Settings
        </button>
      </div>

      <div className="mt-6 bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-semibold text-orange-950">AWS MediaLive Settings</h2>
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.use_medialive}
              onChange={(e) => setForm((f) => ({ ...f, use_medialive: e.target.checked }))}
              className="w-4 h-4 accent-orange-600"
            />
            <span className="text-sm font-medium text-orange-900">MediaLive use karein (audio fix)</span>
          </label>
        </div>
        <p className="text-sm text-orange-600 mb-4">
          Camera → MediaLive → YouTube. MediaLive audio ko 48 kHz AAC-LC CBR me re-encode karke 0.5x slow-audio problem fix karta hai.
        </p>

        <div className="space-y-4">
          <Field label="AWS Region" hint="MediaLive channel wala region, jaise us-east-1">
            <input className={inputCls} value={form.aws_region} onChange={set("aws_region")} placeholder="us-east-1" />
          </Field>
          <Field label="AWS Access Key ID" hint="IAM user ka access key (sirf MediaLive permissions)">
            <input className={inputCls} value={form.aws_access_key_id} onChange={set("aws_access_key_id")} placeholder="AKIA..." />
          </Field>
          <Field label="AWS Secret Access Key" hint="Secret hai — naya value type karo to update">
            <input type="password" className={inputCls} value={form.aws_secret_access_key} onChange={set("aws_secret_access_key")} placeholder="Set / update secret" />
          </Field>
          <Field label="MediaLive Channel ID" hint="AWS MediaLive console me channel ka ID">
            <input className={inputCls} value={form.medialive_channel_id} onChange={set("medialive_channel_id")} placeholder="1234567" />
          </Field>
        </div>

        <div className="mt-4 flex items-center justify-between bg-orange-50 rounded-lg p-3">
          <div className="text-sm text-orange-800">
            {mlState || "MediaLive status check karne ke liye Test dabao"}
          </div>
          <button
            onClick={checkMedialive}
            disabled={mlBusy}
            className="inline-flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-orange-700 transition disabled:opacity-40"
          >
            {mlBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Radio className="w-4 h-4" />}
            Test
          </button>
        </div>

        <p className="mt-4 text-xs text-orange-500 bg-orange-50 p-3 rounded-lg">
          ⚠️ Jab MediaLive ON ho, camera me YouTube ka stream key nahi, balki MediaLive ka RTMP URL (Destination A) daalo. YouTube stream key MediaLive ke RTMP output group me jati hai.
        </p>
      </div>

      <details className="mt-6 bg-white rounded-2xl shadow-sm p-6">
        <summary className="cursor-pointer font-semibold text-orange-950">
          OAuth setup kaise karein (pehli baar, step-by-step)
        </summary>
        <ol className="mt-4 space-y-2 text-sm text-orange-800 list-decimal list-inside">
          <li>Google Cloud Console → project banao → YouTube Data API v3 enable karo.</li>
          <li>OAuth consent screen (External) banao aur apna YouTube channel account test user me add karo.</li>
          <li>Credentials → Create OAuth Client ID (Web application) → Client ID + Client Secret copy karo.</li>
          <li>Google OAuth Playground (developers.google.com/oauthplayground) kholo, scope: https://www.googleapis.com/auth/youtube select karo.</li>
          <li>Authorize karo (apne channel account se), phir Exchange authorization code for tokens dabao → Refresh token copy karo.</li>
          <li>Yahan Channel ID + Stream Key + Client ID + Client Secret + Refresh Token paste karke Save karo.</li>
        </ol>
      </details>
    </div>
  );
}
