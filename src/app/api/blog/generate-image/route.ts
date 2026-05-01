import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { GoogleAuth } from "google-auth-library";

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

async function getVertexAccessToken(): Promise<string> {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  if (!privateKey || !clientEmail) throw new Error("GOOGLE_PRIVATE_KEY veya GOOGLE_CLIENT_EMAIL tanımlı değil");

  const auth = new GoogleAuth({
    credentials: { client_email: clientEmail, private_key: privateKey },
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });
  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();
  if (!tokenResponse.token) throw new Error("Access token alınamadı");
  return tokenResponse.token;
}

export async function POST(req: NextRequest) {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) return NextResponse.json({ error: "ANTHROPIC_API_KEY tanımlı değil" }, { status: 500 });

  const body = await req.json().catch(() => ({}));
  const { id, title, platform } = body;
  if (!id || !title) return NextResponse.json({ error: "id ve title gerekli" }, { status: 400 });

  const anthropic = new Anthropic({ apiKey: anthropicKey });

  // 1. Claude ile görsel prompt üret
  const imagePrompt = await generateImagePrompt(anthropic, title, platform || "Blog");

  // 2. Vertex AI Imagen 3 ile görsel üret
  let accessToken: string;
  try {
    accessToken = await getVertexAccessToken();
  } catch (e) {
    return NextResponse.json({ error: `Auth hatası: ${String(e)}`, imagePrompt }, { status: 500 });
  }

  const projectId = "neural-reactor-477619-e6";
  const vertexRes = await fetch(
    `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/imagen-3.0-generate-001:predict`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        instances: [{ prompt: imagePrompt }],
        parameters: { sampleCount: 1, aspectRatio: "16:9" },
      }),
    }
  );

  const rawText = await vertexRes.text();

  if (!vertexRes.ok) {
    return NextResponse.json({
      error: `Imagen API hatası (${vertexRes.status}): ${rawText.slice(0, 300)}`,
      imagePrompt,
    }, { status: 500 });
  }

  let imagenData: { predictions?: { bytesBase64Encoded?: string; mimeType?: string }[] };
  try {
    imagenData = JSON.parse(rawText);
  } catch {
    return NextResponse.json({ error: `API yanıtı parse edilemedi: ${rawText.slice(0, 200)}` }, { status: 500 });
  }

  const prediction = imagenData.predictions?.[0];

  if (!prediction?.bytesBase64Encoded) {
    return NextResponse.json({
      error: "Imagen görsel döndürmedi",
      imagePrompt,
      raw: rawText.slice(0, 300),
    }, { status: 500 });
  }

  // 3. Supabase Storage'a yükle
  const buffer = Buffer.from(prediction.bytesBase64Encoded, "base64");
  const mimeType = prediction.mimeType || "image/png";
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
