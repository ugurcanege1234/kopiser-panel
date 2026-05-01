import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

export const maxDuration = 60;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function buildPexelsQuery(anthropic: Anthropic, title: string): Promise<string> {
  const res = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 30,
    messages: [{
      role: "user",
      content: `Convert this Turkish blog title to 2-3 English keywords for a stock photo search.
Title: "${title}"
Context: office printer/copier rental company.
Output: just the keywords, nothing else. Example: "office printer business"`
    }],
  });
  return (res.content[0] as { text: string }).text.trim();
}

export async function POST(req: NextRequest) {
  const pexelsKey = process.env.PEXELS_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!pexelsKey) return NextResponse.json({ error: "PEXELS_API_KEY tanımlı değil — pexels.com/api adresinden ücretsiz alın, Netlify env vars'a ekleyin" }, { status: 500 });
  if (!anthropicKey) return NextResponse.json({ error: "ANTHROPIC_API_KEY tanımlı değil" }, { status: 500 });

  const body = await req.json().catch(() => ({}));
  const { id, title, platform } = body;
  if (!id || !title) return NextResponse.json({ error: "id ve title gerekli" }, { status: 400 });

  const anthropic = new Anthropic({ apiKey: anthropicKey });

  // 1. Claude ile Pexels arama terimi üret
  let searchQuery: string;
  try {
    searchQuery = await buildPexelsQuery(anthropic, title);
  } catch {
    searchQuery = platform === "Blog" ? "office printer business" : "multifunction printer office";
  }

  // 2. Pexels'ten fotoğraf çek
  const pexelsRes = await fetch(
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchQuery)}&per_page=5&orientation=landscape`,
    { headers: { Authorization: pexelsKey } }
  );

  if (!pexelsRes.ok) {
    const txt = await pexelsRes.text();
    return NextResponse.json({ error: `Pexels API hatası (${pexelsRes.status}): ${txt.slice(0, 200)}`, searchQuery }, { status: 500 });
  }

  const pexelsData: { photos?: { src: { large2x: string; large: string } }[] } = await pexelsRes.json();
  const photos = pexelsData.photos || [];

  if (photos.length === 0) {
    // Fallback: genel ofis yazıcı araması
    const fallbackRes = await fetch(
      `https://api.pexels.com/v1/search?query=office+printer&per_page=1&orientation=landscape`,
      { headers: { Authorization: pexelsKey } }
    );
    const fallbackData: { photos?: { src: { large2x: string; large: string } }[] } = await fallbackRes.json();
    if (!fallbackData.photos?.[0]) {
      return NextResponse.json({ error: "Pexels fotoğraf bulunamadı", searchQuery }, { status: 500 });
    }
    photos.push(fallbackData.photos[0]);
  }

  // Rastgele bir fotoğraf seç (ilk 5 içinden)
  const randomIndex = Math.floor(Math.random() * Math.min(photos.length, 5));
  const photo = photos[randomIndex] || photos[0];
  const imageUrl = photo.src.large2x || photo.src.large;

  // 3. content_items güncelle
  const { error: updateError } = await supabase
    .from("content_items")
    .update({ image_url: imageUrl })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: `DB güncelleme hatası: ${updateError.message}` }, { status: 500 });
  }

  return NextResponse.json({ ok: true, imageUrl, searchQuery });
}
