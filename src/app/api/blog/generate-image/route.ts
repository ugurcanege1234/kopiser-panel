import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

export const maxDuration = 60;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function generateImagePrompt(anthropic: Anthropic, title: string, platform: string): Promise<string> {
  const res = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 150,
    messages: [{
      role: "user",
      content: `Write a short English image generation prompt for: "${title}"
Context: Turkish office copier/printer rental company, B2B professional.
Platform: ${platform}
Style: photorealistic, modern multifunction printer in a clean bright office, professional lighting, no text or logos in image.
Output: Just the prompt (1-2 sentences max), nothing else.`
    }],
  });
  return (res.content[0] as { text: string }).text.trim();
}

export async function POST(req: NextRequest) {
  const geminiKey = process.env.GEMINI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!geminiKey) return NextResponse.json({ error: "GEMINI_API_KEY Netlify'da tanımlı değil — Site Settings → Environment Variables'a ekleyin" }, { status: 500 });
  if (!anthropicKey) return NextResponse.json({ error: "ANTHROPIC_API_KEY tanımlı değil" }, { status: 500 });

  const body = await req.json().catch(() => ({}));
  const { id, title, platform } = body;
  if (!id || !title) return NextResponse.json({ error: "id ve title gerekli" }, { status: 400 });

  const anthropic = new Anthropic({ apiKey: anthropicKey });

  // 1. Claude ile görsel prompt üret
  const imagePrompt = await generateImagePrompt(anthropic, title, platform || "Blog");

  // 2. Gemini 2.0 Flash ile görsel üret
  const geminiRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${geminiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: imagePrompt }] }],
        generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
      }),
    }
  );

  const rawText = await geminiRes.text();

  if (!geminiRes.ok) {
    return NextResponse.json({
      error: `Gemini API hatası (${geminiRes.status}): ${rawText.slice(0, 300)}`,
      imagePrompt,
    }, { status: 500 });
  }

  let geminiData: { candidates?: { content?: { parts?: { inlineData?: { data: string; mimeType: string } }[] } }[] };
  try {
    geminiData = JSON.parse(rawText);
  } catch {
    return NextResponse.json({ error: `Gemini yanıtı parse edilemedi: ${rawText.slice(0, 200)}` }, { status: 500 });
  }

  const parts = geminiData.candidates?.[0]?.content?.parts || [];
  const imagePart = parts.find(p => p.inlineData?.data);

  if (!imagePart?.inlineData?.data) {
    return NextResponse.json({
      error: "Gemini görsel içermeyen yanıt döndürdü",
      imagePrompt,
      candidates: geminiData.candidates?.length || 0,
    }, { status: 500 });
  }

  // 3. Supabase Storage'a yükle
  const buffer = Buffer.from(imagePart.inlineData.data, "base64");
  const mimeType = imagePart.inlineData.mimeType || "image/png";
  const ext = mimeType.includes("jpeg") ? "jpg" : "png";
  const filename = `img-${id}-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("blog-images")
    .upload(filename, buffer, { contentType: mimeType, upsert: true });

  if (uploadError) {
    return NextResponse.json({ error: `Storage upload hatası: ${uploadError.message}` }, { status: 500 });
  }

  const { data: urlData } = supabase.storage.from("blog-images").getPublicUrl(filename);
  const imageUrl = urlData.publicUrl;

  // 4. content_items güncelle
  const { error: updateError } = await supabase
    .from("content_items")
    .update({ image_url: imageUrl })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: `DB güncelleme hatası: ${updateError.message}` }, { status: 500 });
  }

  return NextResponse.json({ ok: true, imageUrl, imagePrompt });
}
