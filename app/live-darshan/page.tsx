import { getCloudflareContext } from "@opennextjs/cloudflare";
import { Navbar } from "@/components/Navbar";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function LiveDarshanPage() {
  let isLive = false;
  let channelId = "";

  try {
    const db = getCloudflareContext().env.DB;
    const row = await db
      .prepare("SELECT youtube_channel_id, is_live FROM live_stream_config WHERE id = 1")
      .first();
    isLive = row && row.is_live ? true : false;
    channelId = (row && row.youtube_channel_id) || "";
  } catch (e) {
    // table not migrated yet or DB unavailable -> show offline state
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-orange-50 pt-28 pb-16">
        <div className="max-w-5xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-orange-900 text-center">लाइव दर्शन</h1>
          <p className="text-center text-orange-700 mt-2">काली माता मंदिर से सीधा प्रसारण</p>

          {isLive && channelId ? (
            <div className="mt-8">
              <div className="rounded-2xl overflow-hidden shadow-xl aspect-video bg-black">
                <iframe
                  className="w-full h-full"
                  src={"https://www.youtube.com/embed/live_stream?channel=" + channelId + "&autoplay=1&mute=1"}
                  title="काली माता मंदिर लाइव दर्शन"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="mt-4 flex items-center justify-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
                </span>
                <span className="text-red-700 font-semibold">अभी लाइव चल रहा है</span>
              </div>
            </div>
          ) : (
            <div className="mt-12 text-center bg-white rounded-2xl shadow-sm p-12 max-w-lg mx-auto">
              <div className="w-16 h-16 mx-auto rounded-full bg-orange-100 flex items-center justify-center text-3xl">
                🛕
              </div>
              <h2 className="mt-4 text-2xl font-semibold text-orange-900">लाइव दर्शन अभी उपलब्ध नहीं है</h2>
              <p className="mt-2 text-orange-700">अगले प्रसारण के लिए कृपया बाद में देखें।</p>
              <Link
                href="/"
                className="mt-6 inline-block bg-orange-600 text-white px-6 py-2.5 rounded-full font-medium hover:bg-orange-700 transition"
              >
                मुख्य पृष्ठ पर वापस जाएँ
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
