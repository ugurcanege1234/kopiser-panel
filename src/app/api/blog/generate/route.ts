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

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "ANTHROPIC_API_KEY tanımlı değil" }, { status: 500 });

  const body = await req.json().catch(() => ({}));
  const siteFilter: string | null = body.site || null;
  const customTopic: string | null = body.topic || null;
  const platformFilter: string | null = body.platform || null; // "all" | "blog" | "social"
  const mode = platformFilter || "all";

  const anthropic = new Anthropic({ apiKey });
  const today = new Date();
  const dayIndex = today.getDate() % TOPICS.length;

  // Zayıf/düşen kelimeleri çek
  const { data: weakKeywords } = await supabase
    .from("seo_keywords")
    .select("keyword, site, position")
    .gt("position", 10)
    .order("position", { ascending: true })
    .limit(20);

  // Sırasız kelimeler de dahil et
  const { data: nullKeywords } = await supabase
    .from("seo_keywords")
    .select("keyword, site, position")
    .is("position", null)
    .limit(10);

  const allWeakKeywords = [...(weakKeywords || []), ...(nullKeywords || [])];

  const results = [];

  // BLOG içerikleri (her iki site için)
  if (mode === "all" || mode === "blog") {
    const sitesToProcess = siteFilter ? SITES.filter(s => s.site === siteFilter) : SITES;

    for (let i = 0; i < sitesToProcess.length; i++) {
      const site = sitesToProcess[i];
      const siteWeakKw = allWeakKeywords.find(k => k.site === site.site);
      const topic = customTopic || (siteWeakKw
        ? `"${siteWeakKw.keyword}" için kapsamlı rehber`
        : TOPICS[(dayIndex + i) % TOPICS.length]);
      const todayStr = today.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });

      try {
        const prompt = `Sen Kopiser şirketinin SEO blog yazarısın. Kopiser, İzmir ve İstanbul merkezli, 2010'dan bu yana hizmet veren bir fotokopi makinesi kiralama ve teknik servis şirketidir.

Site: ${site.site}
Site odağı: ${site.focus}
Hedef anahtar kelimeler: ${site.keywords.join(", ")}

Bugün için (${todayStr}) şu konuda bir blog yazısı yaz: "${topic}"

Kurallar:
- Dil: Türkçe
- Uzunluk: 450-600 kelime
- Yapı: Başlık + Giriş + 3-4 alt başlık + Sonuç
- Kopiser'i doğal şekilde 2-3 kez bahset
- Hedef anahtar kelimeleri doğal şekilde yerleştir
- "Bize ulaşın" tarzı CTA ile bitir
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
          notes: `Site: ${site.site} | ${siteWeakKw ? `SEO hedef: "${siteWeakKw.keyword}"` : "Genel konu"} | AI`,
          assigned_to: "AI",
        }]);

        results.push({ type: "blog", site: site.site, success: !error, title });
      } catch (err) {
        results.push({ type: "blog", site: site.site, success: false, error: String(err) });
      }
    }
  }

  // SOSYAL MEDYA içerikleri
  if (mode === "all" || mode === "social") {
    // Genel konuyu belirle (zayıf kelime veya günlük konu)
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
