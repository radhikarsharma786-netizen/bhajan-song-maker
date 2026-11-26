import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { lyrics, style } = await req.json();
    const cleanLyrics = String(lyrics || "").trim();
    const cleanStyle = String(style || "Hindi bhajan, female voice, slow").trim();
    if (!cleanLyrics) return NextResponse.json({ error: "Pehle lyrics likho." }, { status: 400 });
    const apiKey = process.env.MUREKA_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "MUREKA_API_KEY nahi mili." }, { status: 500 });

    // Mureka ko [Verse] ke saath lyrics chahiye, warna Invalid Request aata hai
    const finalLyrics = cleanLyrics.startsWith("[") ? cleanLyrics : "[Verse]\n" + cleanLyrics;

    const gen = await fetch("https://api.mureka.ai/v1/song/generate", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ lyrics: finalLyrics, prompt: cleanStyle, model: "auto" }),
    });
    const genData = await gen.json();
    // Official jawab me id upar hota hai: { id, status } - data.id nahi
    const taskId = genData?.id || genData?.data?.id || genData?.data?.task_id;
    if (!taskId) return NextResponse.json({ error: "Mureka ne mana kiya. " + JSON.stringify(genData).slice(0, 300) }, { status: 500 });

    for (let i = 0; i < 24; i++) {
      await new Promise((r) => setTimeout(r, 5000));
      const q = await fetch(`https://api.mureka.ai/v1/song/query/${taskId}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      const qData = await q.json();
      const song = qData?.data?.[0] || qData?.data;
      const audio = song?.audio_url || song?.audioUrl || song?.url;
      if (audio) return NextResponse.json({ audio_url: audio });
      if (song?.status === "failed" || qData?.data?.status === "failed") return NextResponse.json({ error: "Gaana banane me fail hua. Lyrics badal ke try karo." }, { status: 500 });
    }
    return NextResponse.json({ error: "Time lag raha hai. Dobara try karo." }, { status: 500 });
  } catch (e: any) {
    return NextResponse.json({ error: "Kuch galat hua: " + e.message }, { status: 500 });
  }
}
