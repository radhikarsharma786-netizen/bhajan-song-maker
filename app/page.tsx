"use client";
import { useState } from "react";

export default function Home() {
  const [lyrics, setLyrics] = useState("Jai Mahalaxmi Maa, kripa karo");
  const [style, setStyle] = useState("Hindi bhajan, female voice, slow");
  const [status, setStatus] = useState("");
  const [audio, setAudio] = useState("");
  const [loading, setLoading] = useState(false);

  async function makeSong() {
    setLoading(true);
    setStatus("Gaana ban raha hai... 1-2 minute ruko...");
    setAudio("");
    try {
      const res = await fetch("/api/generate-song", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lyrics, style }),
      });
      const data = await res.json();
      if (data.audio_url) {
        setAudio(data.audio_url);
        setStatus("Ho gaya! Neeche Play dabao.");
      } else {
        setStatus(data.error || "Kuch galat hua. Dobara try karo.");
      }
    } catch {
      setStatus("Server se baat nahi hui. Dobara try karo.");
    }
    setLoading(false);
  }

  return (
    <main style={{ maxWidth: 640, margin: "30px auto", padding: 20, fontFamily: "sans-serif", textAlign: "center" }}>
      <h1>🙏 Bhajan Song Maker</h1>
      <p>Lyrics likho, style chuno, gaana banao.</p>
      <textarea value={lyrics} onChange={(e) => setLyrics(e.target.value)} rows={4} style={{ width: "100%", padding: 12, fontSize: 16, borderRadius: 10 }} />
      <br /><br />
      <select value={style} onChange={(e) => setStyle(e.target.value)} style={{ width: "100%", padding: 12, fontSize: 16, borderRadius: 10 }}>
        <option>Hindi bhajan, female voice, slow</option>
        <option>Hindi bhajan, female voice, fast</option>
        <option>Aarti, female voice, fast</option>
        <option>Shiv bhajan, male voice, slow</option>
        <option>Krishna bhajan, female voice, slow</option>
        <option>Hanuman bhajan, male voice, powerful</option>
      </select>
      <br /><br />
      <button onClick={makeSong} disabled={loading} style={{ padding: "14px 30px", fontSize: 18, background: "#ff6b00", color: "white", border: "none", borderRadius: 10, cursor: "pointer" }}>
        {loading ? "Ban raha hai..." : "🎵 Generate Song"}
      </button>
      <p>{status}</p>
      {audio && <audio controls src={audio} style={{ width: "100%" }} />}
    </main>
  );
}