import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

export const maxDuration = 60;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const SITES = [
  {
    site: "kopiser.com.tr",
    focus: "İzmir ve İstanbul'da fotokopi makinesi kiralama, A3 renkli çok fonksiyonlu yazıcı kiralama ve teknik servis hizmetleri",
    keywords: ["fotokopi makinesi kiralama", "A3 renkli fotokopi kiralama", "fotokopi teknik servisi İzmir", "çok fonksiyonlu yazıcı kiralama"],
  },
  {
    site: "izmirfotokopi.net",
    focus: "İzmir'de fotokopi makinesi kiralama ve teknik servis — lokasyon odaklı SEO içeriği",
    keywords: ["fotokopi makinesi kiralama İzmir", "izmir fotokopi", "izmir fotokopi teknik servis", "izmir ofis yazıcı kiralama"],
  },
];

const TOPICS = [
  "Fotokopi makinesi kiralamanın satın almaya göre 5 avantajı",
  "Ofisiniz için doğru fotokopi makinesi nasıl seçilir?",
  "A3 renkli fotokopi makinesi kiralama: Kimler için uygundur?",
  "Fotokopi makinesi teknik bakımı: Sık sorulan sorular",
  "Konica Minolta vs Kyocera: Hangi marka ofisler için daha uygun?",
  "Ofis verimliliğini artırmanın yolları: Doğru yazıcı seçimi",
  "Fotokopi kiralama sözleşmesinde dikkat edilmesi gerekenler",
  "Xerox ve Kyocera fotokopi makinelerinde en yaygın arızalar ve çözümleri",
  "Kurumsal fotokopi kiralama: Kamu kurumları için avantajlar",
  "Aylık sabit ücretli fotokopi kiralama modelinin faydaları",
];

// Kullanıcıların Google'da aradığı arıza konuları — yüksek arama niyeti
const ERROR_TOPICS = [
  "Kyocera fotokopi E7 hatası nedir ve nasıl çözülür?",
  "Kyocera fotokopi C serisi hata kodları (C0100–C7810) anlamları ve çözümleri",
  "Kyocera 'Lütfen Servisi Arayınız' hatası: Nedenleri ve çözüm yolları",
  "Kyocera A1 hata kodu: Atık toner tankı sorunu nasıl giderilir?",
  "Fotokopi makinesi kağıt sıkışması sorunu: Nedenler ve kalıcı çözümler",
  "Ricoh SC551 hata kodu: Fuser ünite arızası belirtileri ve çözümü",
  "Konica Minolta fotokopi makinesi hata kodları rehberi",
  "Fotokopi makinesi siyah çizgi ve nokta sorunu: Drum mu, toner mı?",
  "Fotokopi toner bitmeden 'toner low' uyarısı veriyor: Çözüm yolları",
  "Xerox fotokopi arıza kodları: En sık görülen hatalar ve çözümleri",
  "Fotokopi makinesi açılmıyor: Güç sorununun olası nedenleri",
  "Sabitleme ünitesi (fuser) arızası belirtileri ve ne zaman değiştirilmeli?",
  "Fotokopi makinesi baskı kalitesi düştü: Soluk, bulanık çıktı sorunları",
  "Kyocera ECOSYS serisi kağıt sıkışması: Adım adım çözüm rehberi",
  "Fotokopi makinesi bakım ihmalinin uzun vadeli maliyeti",
];

async function fetchTrendingErrorTopics(): Promise<string[]> {
  const serperKey = process.env.SERPER_API_KEY;
  if (!serperKey) return [];
  try {
    const queries = ["fotokopi makinesi arıza çözümü", "kyocera xerox konica fotokopi hata"];
    const results: string[] = [];
    for (const q of queries) {
      const res = await fetch("https://google.serper.dev/search", {
        method: "POST",
        headers: { "X-API-KEY": serperKey, "Content-Type": "application/json" },
        body: JSON.stringify({ q, gl: "tr", hl: "tr", num: 5 }),
      });
      if (!res.ok) continue;
      const data = await res.json();
      // peopleAlsoAsk soruları varsa al
      if (data.peopleAlsoAsk) {
        for (const item of data.peopleAlsoAsk.slice(0, 3)) {
          if (item.question) results.push(item.question);
        }
      }
      // relatedSearches varsa al
      if (data.relatedSearches) {
        for (const item of data.relatedSearches.slice(0, 2)) {
          if (item.query) results.push(item.query + " — çözüm rehberi");
        }
      }
    }
    return results;
  } catch {
    return [];
  }
}

const SOCIAL_PLATFORMS = [
  {
    platform: "Instagram",
    prompt: (topic: string) => `Kopiser (@kopiser.buro) için Instagram gönderisi yaz.
Konu: "${topic}"
Şirket: İzmir & İstanbul merkezli fotokopi makinesi kiralama ve teknik servis, 2010'dan beri hizmet veriyor.
Kurallar:
- Dil: Türkçe
- 150-200 kelime
- Samimi, profesyonel ve ilgi çekici ton
- 8-10 alakalı hashtag ekle (#fotokopi #fotokopikiralama #izmir vb.)
- CTA: "Detaylar için DM atın veya 0850... arayın" tarzı
- Emoji kullanabilirsin
Format: Sadece gönderi metnini yaz, başka açıklama ekleme.`,
  },
  {
    platform: "Facebook",
    prompt: (topic: string) => `Kopiser'in Facebook sayfası için gönderi yaz.
Konu: "${topic}"
Şirket: İzmir & İstanbul merkezli fotokopi makinesi kiralama ve teknik servis, 2010'dan beri hizmet veriyor.
Kurallar:
- Dil: Türkçe
- 200-300 kelime
- Bilgilendirici ve güven verici ton
- Kurumsal müşterilere (ofis, firma, kamu) hitap et
- CTA: web sitesi veya iletişim yönlendirmesi
- 3-5 hashtag
Format: Sadece gönderi metnini yaz.`,
  },
  {
    platform: "TikTok",
    prompt: (topic: string) => `Kopiser için TikTok video senaryosu yaz.
Konu: "${topic}"
Şirket: İzmir & İstanbul merkezli fotokopi makinesi kiralama ve teknik servis.
Kurallar:
- Dil: Türkçe
- 30-45 saniyelik video senaryosu
- Hızlı, enerjik ve ilgi çekici başlangıç (ilk 3 saniye çok önemli)
- Hook + bilgi + CTA yapısı
- Konuşma dili, samimi
- Sahne açıklamaları köşeli parantez içinde: [Kameraya bak], [Ürünü göster] vb.
Format: Sadece senaryoyu yaz.`,
  },
];

async function generateContent(anthropic: Anthropic, systemPrompt: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 800,
    messages: [{ role: "user", content: systemPrompt }],
  });
  return (response.content[0] as { text: string }).text.trim();
}

async function generateImagePrompt(anthropic: Anthropic, topic: string, platform: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 200,
    messages: [{
      role: "user",
      content: `Write a short English image generation prompt for: "${topic}"
Context: Turkish office copier/printer rental company, professional B2B.
Platform: ${platform}
Requirements:
- Professional office setting
- Modern multifunction printer/copier machine
- Clean, corporate aesthetic
- Good lighting, photorealistic
- No text in image
- Max 2 sentences
Output: Just the prompt, nothing else.`
    }],
  });
  return (response.content[0] as { text: string }).text.trim();
}

async function generateGeminiImage(imagePrompt: string): Promise<string | null> {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) return null;
  try {
    const res = await fetch(
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
    if (!res.ok) return null;
    const data = await res.json();
    const part = data.candidates?.[0]?.content?.parts?.find((p: { inlineData?: { data: string } }) => p.inlineData);
    if (!part?.inlineData?.data) return null;
    return part.inlineData.data; // base64 PNG
  } catch {
    return null;
  }
}

async function uploadImageToSupabase(base64: string, filename: string): Promise<string | null> {
  try {
    const buffer = Buffer.from(base64, "base64");
    const { error } = await supabase.storage
      .from("blog-images")
      .upload(filename, buffer, { contentType: "image/png", upsert: true });
    if (error) return null;
    const { data } = supabase.storage.from("blog-images").getPublicUrl(filename);
    return data.publicUrl;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "ANTHROPIC_API_KEY tanımlı değil" }, { status: 500 });

  const body = await req.json().catch(() => ({}));
  const siteFilter: string | null = body.site || null;
  const customTopic: string | null = body.topic || null;
  const platformFilter: string | null = body.platform || null;
  const mode = platformFilter || "all";

  const anthropic = new Anthropic({ apiKey });
  const today = new Date();
  const dayIndex = today.getDate();

  // Serper'dan trending arıza sorularını çek (arka planda, hata olursa boş döner)
  const trendingErrors = await fetchTrendingErrorTopics();
  const allErrorTopics = [...trendingErrors, ...ERROR_TOPICS];

  const { data: weakKeywords } = await supabase
    .from("seo_keywords")
    .select("keyword, site, position")
    .gt("position", 10)
    .order("position", { ascending: true })
    .limit(20);

  const { data: nullKeywords } = await supabase
    .from("seo_keywords")
    .select("keyword, site, position")
    .is("position", null)
    .limit(10);

  const allWeakKeywords = [...(weakKeywords || []), ...(nullKeywords || [])];
  const results = [];

  // BLOG içerikleri
  if (mode === "all" || mode === "blog") {
    const sitesToProcess = siteFilter ? SITES.filter(s => s.site === siteFilter) : SITES;

    for (let i = 0; i < sitesToProcess.length; i++) {
      const site = sitesToProcess[i];
      const siteWeakKw = allWeakKeywords.find(k => k.site === site.site);

      // Gün çift → arıza konusu, tek → genel konu (her gün farklı içerik)
      const useErrorTopic = (dayIndex + i) % 2 === 0;
      const defaultTopic = useErrorTopic
        ? allErrorTopics[(dayIndex + i) % allErrorTopics.length]
        : TOPICS[(dayIndex + i) % TOPICS.length];

      const topic = customTopic || (siteWeakKw
        ? `"${siteWeakKw.keyword}" için kapsamlı rehber`
        : defaultTopic);
      const todayStr = today.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });

      try {
        const prompt = `Sen Kopiser şirketinin SEO blog yazarısın. Kopiser, İzmir ve İstanbul merkezli, 2010'dan bu yana hizmet veren bir fotokopi makinesi kiralama ve teknik servis şirketidir.

Site: ${site.site}
Site odağı: ${site.focus}
Hedef anahtar kelimeler: ${site.keywords.join(", ")}

Bugün için (${todayStr}) şu konuda bir blog yazısı yaz: "${topic}"

${useErrorTopic && !siteWeakKw ? `Bu bir arıza/teknik sorun konusudur. Özel kurallar:
- Okuyucu sorunu yaşıyor, çözüm arıyor — önce sorunu anlamasına yardım et
- Kullanıcının kendin yapabileceği basit kontrolleri anlat
- Ardından profesyonel teknik servis gerektiren durumları belirt
- Kopiser'in bakım dahil kiralama modelini doğal biçimde öner: "Bu tür arızalar kiralama modelinde bakım kapsamında karşılanır"
- CTA: "Arıza tekrar ediyorsa bakım dahil kiralama modeli çözüm olabilir — Kopiser ile iletişime geçin"
` : ""}Genel kurallar:
- Dil: Türkçe
- Uzunluk: 500-650 kelime
- Yapı: Başlık + Giriş + 3-4 alt başlık + Sonuç
- Kopiser'i doğal şekilde 2-3 kez bahset
- Hedef anahtar kelimeleri doğal şekilde yerleştir
- Emoji veya markdown kullanma

BAŞLIK: [başlık]
İÇERİK:
[içerik]`;

        const text = await generateContent(anthropic, prompt);
        const titleMatch = text.match(/BAŞLIK:\s*(.+)/);
        const contentMatch = text.match(/İÇERİK:\s*([\s\S]+)/);
        const title = titleMatch ? titleMatch[1].trim() : topic;
        const content = contentMatch ? contentMatch[1].trim() : text;

        const scheduledAt = new Date(today);
        scheduledAt.setHours(10 + i * 2, 0, 0, 0);

        const { error } = await supabase.from("content_items").insert([{
          title,
          platform: "Blog",
          status: "Yayına Hazır",
          scheduled_at: scheduledAt.toISOString(),
          content_text: content,
          notes: `Site: ${site.site} | ${siteWeakKw ? `SEO hedef: "${siteWeakKw.keyword}"` : useErrorTopic ? "Arıza/teknik konu" : "Genel konu"} | AI`,
          assigned_to: "AI",
          image_url: null,
        }]);

        results.push({ type: "blog", site: site.site, success: !error, title });
      } catch (err) {
        results.push({ type: "blog", site: site.site, success: false, error: String(err) });
      }
    }
  }

  // SOSYAL MEDYA içerikleri
  if (mode === "all" || mode === "social") {
    const generalWeakKw = allWeakKeywords[dayIndex % Math.max(allWeakKeywords.length, 1)];
    const socialTopic = customTopic || (generalWeakKw
      ? `${generalWeakKw.keyword} — fotokopi kiralama avantajları`
      : TOPICS[(dayIndex + 2) % TOPICS.length]);

    for (let i = 0; i < SOCIAL_PLATFORMS.length; i++) {
      const sp = SOCIAL_PLATFORMS[i];
      try {
        const content = await generateContent(anthropic, sp.prompt(socialTopic));
        const scheduledAt = new Date(today);
        scheduledAt.setHours(14 + i, 0, 0, 0);

        const { error } = await supabase.from("content_items").insert([{
          title: `${sp.platform}: ${socialTopic.slice(0, 60)}`,
          platform: sp.platform,
          status: "Yayına Hazır",
          scheduled_at: scheduledAt.toISOString(),
          content_text: content,
          notes: `AI tarafından oluşturuldu | Konu: ${socialTopic.slice(0, 80)}`,
          assigned_to: "AI",
          image_url: null,
        }]);

        results.push({ type: "social", platform: sp.platform, success: !error });
      } catch (err) {
        results.push({ type: "social", platform: sp.platform, success: false, error: String(err) });
      }
    }
  }

  const succeeded = results.filter(r => r.success).length;
  return NextResponse.json({ ok: true, results, summary: `${succeeded}/${results.length} içerik oluşturuldu` });
}
