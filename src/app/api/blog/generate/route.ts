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

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "ANTHROPIC_API_KEY tanımlı değil" }, { status: 500 });

  const body = await req.json().catch(() => ({}));
  const siteFilter: string | null = body.site || null;
  const customTopic: string | null = body.topic || null;

  const anthropic = new Anthropic({ apiKey });
  const today = new Date();
  const dayIndex = today.getDate() % TOPICS.length;

  const sitesToProcess = siteFilter ? SITES.filter(s => s.site === siteFilter) : SITES;
  const results = [];

  for (let i = 0; i < sitesToProcess.length; i++) {
    const site = sitesToProcess[i];
    const topic = customTopic || TOPICS[(dayIndex + i) % TOPICS.length];
    const todayStr = today.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });

    try {
      const response = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1200,
        messages: [{
          role: "user",
          content: `Sen Kopiser şirketinin SEO blog yazarısın. Kopiser, İzmir ve İstanbul merkezli, 2010'dan bu yana hizmet veren bir fotokopi makinesi kiralama ve teknik servis şirketidir.

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
- İletişim için "bize ulaşın" tarzı CTA ile bitir
- Emoji veya markdown işaretleri kullanma

Yanıtı şu formatta ver:
BAŞLIK: [başlık buraya]
İÇERİK:
[içerik buraya]`,
        }],
      });

      const text = (response.content[0] as { text: string }).text;
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
        notes: `Site: ${site.site} | AI tarafından oluşturuldu`,
        assigned_to: "AI",
      }]);

      results.push({ site: site.site, success: !error, title, error: error?.message });
    } catch (err) {
      results.push({ site: site.site, success: false, error: String(err) });
    }
  }

  return NextResponse.json({ ok: true, results });
}
