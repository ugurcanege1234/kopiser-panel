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
      content: `Write a short English image generation prompt for this content: "${title}"
Context: Turkish office copier/printer rental company, professional B2B, Izmir & Istanbul.
Platform: ${platform}
Style: photorealistic, professional office setting, modern multifunction printer, clean corporate lighting, no text in image.
Output: Just the prompt (1-2 sentences), nothing else.`
    }],
  });
  return (res.content[0] as { text: string }).text.trim();
}

export async function POST(req: NextRequest) {
  const geminiKey = process.env.GEMINI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!geminiKey) return NextResponse.json({ error: "GEMINI_API_KEY tanımlı değil" }, { status: 500 });
  if (!anthropicKey) return NextResponse.json({ error: "ANTHROPIC_API_KEY tanımlı değil" }, { status: 500 });

  const body = await req.json().catch(() => ({}));
  const { id, title, platform } = body;
  if (!id || !title) return NextResponse.json({ error: "id ve title gerekli" }, { status: 400 });

  const anthropic = new Anthropic({ apiKey: anthropicKey });

  // 1. Claude ile image prompt üret
  const imagePrompt = await generateImagePrompt(anthropic, title, platform || "Blog");

  // 2. Gemini ile görsel üret
  const geminiRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${geminiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: imagePrompt }] }],
        generationConfig: { responseModalities: ["IMAGE"] },
      }),
    }
  );

  if (!geminiRes.ok) {
    const errText = await geminiRes.text();
    return NextResponse.json({ error: `Gemini API hatası: ${errText.slice(0, 200)}` }, { status: 500 });
  }

  const geminiData = await geminiRes.json();
  const part = geminiData.candidates?.[0]?.content?.parts?.find(
    (p: { inlineData?: { data: string } }) => p.inlineData
  );

  if (!part?.inlineData?.data) {
    return NextResponse.json({ error: "Gemini görsel döndürmedi" }, { status: 500 });
  }

  // 3. Supabase Storage'a yükle
  const buffer = Buffer.from(part.inlineData.data, "base64");
  const filename = `img-${id}-${Date.now()}.png`;

  const { error: uploadError } = await supabase.storage
    .from("blog-images")
    .upload(filename, buffer, { contentType: "image/png", upsert: true });

  if (uploadError) {
    return NextResponse.json({ error: `Upload hatası: ${uploadError.message}` }, { status: 500 });
  }

  const { data: urlData } = supabase.storage.from("blog-images").getPublicUrl(filename);
  const imageUrl = urlData.publicUrl;

  // 4. content_items tablosunu güncelle
  const { error: updateError } = await supabase
    .from("content_items")
    .update({ image_url: imageUrl })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: `Güncelleme hatası: ${updateError.message}` }, { status: 500 });
  }

  return NextResponse.json({ ok: true, imageUrl, imagePrompt });
}
