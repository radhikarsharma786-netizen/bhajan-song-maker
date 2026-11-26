import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { lyrics, style } = await req.json();
    const apiKey = process.env.MUREKA_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "MUREKA_API_KEY nahi mili. .env.local me dalo." }, { status: 500 });

    const gen = await fetch("https://api.mureka.ai/v1/song/generate", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ lyrics, prompt: style, model: "mureka-v7" }),
    });
    const genData = await gen.json();
    const taskId = genData?.data?.id || genData?.id;
    if (!taskId) return NextResponse.json({ error: "Mureka ne mana kiya. Key check karo. " + JSON.stringify(genData).slice(0, 200) }, { status: 500 });

    for (let i = 0; i < 18; i++) {
      await new Promise((r) => setTimeout(r, 5000));
      const q = await fetch(`https://api.mureka.ai/v1/song/query/${taskId}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      const qData = await q.json();
      const song = qData?.data?.[0] || qData?.data;
      const audio = song?.audio_url || song?.audioUrl || song?.url;
      if (audio) return NextResponse.json({ audio_url: audio });
      if (qData?.data?.status === "failed") return NextResponse.json({ error: "Gaana banane me fail hua. Lyrics badal ke try karo." }, { status: 500 });
    }
    return NextResponse.json({ error: "Time lag raha hai. Dobara try karo." }, { status: 500 });
  } catch (e: any) {
    return NextResponse.json({ error: "Kuch galat hua: " + e.message }, { status: 500 });
  }
}
