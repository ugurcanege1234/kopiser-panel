import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const maxDuration = 60;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const SERPER_KEY = process.env.SERPER_API_KEY;

// Sektör için yüksek hacimli anahtar kelimeler
// Hacim tahmini: Yüksek (Y) >1000/ay, Orta (O) 100-1000/ay, Düşük (D) <100/ay
const SECTOR_KEYWORDS: { keyword: string; site: string; volume: string; target: number }[] = [
  // kopiser.com.tr — genel + istanbul
  { keyword: "fotokopi makinesi kiralama", site: "kopiser.com.tr", volume: "Yüksek", target: 3 },
  { keyword: "fotokopi makinesi kiralama izmir", site: "kopiser.com.tr", volume: "Yüksek", target: 3 },
  { keyword: "fotokopi makinesi kiralama istanbul", site: "kopiser.com.tr", volume: "Yüksek", target: 5 },
  { keyword: "a3 renkli fotokopi kiralama", site: "kopiser.com.tr", volume: "Orta", target: 3 },
  { keyword: "renkli fotokopi makinesi kiralama", site: "kopiser.com.tr", volume: "Orta", target: 3 },
  { keyword: "çok fonksiyonlu yazıcı kiralama", site: "kopiser.com.tr", volume: "Orta", target: 5 },
  { keyword: "fotokopi teknik servisi izmir", site: "kopiser.com.tr", volume: "Orta", target: 3 },
  { keyword: "fotokopi teknik servisi istanbul", site: "kopiser.com.tr", volume: "Orta", target: 5 },
  { keyword: "konica minolta kiralama", site: "kopiser.com.tr", volume: "Orta", target: 5 },
  { keyword: "kyocera fotokopi kiralama", site: "kopiser.com.tr", volume: "Orta", target: 5 },
  { keyword: "xerox fotokopi kiralama", site: "kopiser.com.tr", volume: "Orta", target: 5 },
  { keyword: "ofis fotokopi kiralama", site: "kopiser.com.tr", volume: "Orta", target: 5 },
  { keyword: "kurumsal fotokopi kiralama", site: "kopiser.com.tr", volume: "Düşük", target: 3 },
  { keyword: "aylık fotokopi kiralama", site: "kopiser.com.tr", volume: "Düşük", target: 3 },
  { keyword: "fotokopi makinesi bakım servisi", site: "kopiser.com.tr", volume: "Orta", target: 5 },
  { keyword: "fotokopi makinesi servisi izmir", site: "kopiser.com.tr", volume: "Orta", target: 3 },
  { keyword: "lexmark servis izmir", site: "kopiser.com.tr", volume: "Düşük", target: 3 },
  { keyword: "fotokopi makinesi fiyatları", site: "kopiser.com.tr", volume: "Yüksek", target: 10 },
  { keyword: "yazıcı kiralama izmir", site: "kopiser.com.tr", volume: "Orta", target: 3 },

  // izmirfotokopi.net — lokasyon odaklı
  { keyword: "izmir fotokopi", site: "izmirfotokopi.net", volume: "Yüksek", target: 1 },
  { keyword: "fotokopi makinesi kiralama izmir", site: "izmirfotokopi.net", volume: "Yüksek", target: 1 },
  { keyword: "izmir fotokopi kiralama", site: "izmirfotokopi.net", volume: "Yüksek", target: 1 },
  { keyword: "a3 renkli fotokopi kiralama izmir", site: "izmirfotokopi.net", volume: "Orta", target: 1 },
  { keyword: "izmir fotokopi servisi", site: "izmirfotokopi.net", volume: "Orta", target: 3 },
  { keyword: "izmirde fotokopi kiralama", site: "izmirfotokopi.net", volume: "Orta", target: 1 },
  { keyword: "konica minolta kiralama izmir", site: "izmirfotokopi.net", volume: "Düşük", target: 3 },
  { keyword: "kyocera servis izmir", site: "izmirfotokopi.net", volume: "Düşük", target: 3 },
];

async function checkRanking(keyword: string, domain: string): Promise<number | null> {
  if (!SERPER_KEY) return null;
  try {
    const res = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: { "X-API-KEY": SERPER_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ q: keyword, gl: "tr", hl: "tr", num: 30 }),
    });
    const data = await res.json();
    const organic: { link: string }[] = data.organic || [];
    for (let i = 0; i < organic.length; i++) {
      if (organic[i].link?.includes(domain)) return i + 1;
    }
    return null;
  } catch { return null; }
}

export async function POST() {
  if (!SERPER_KEY) return NextResponse.json({ error: "SERPER_API_KEY tanımlı değil" }, { status: 500 });

  let added = 0;
  let skipped = 0;
  const results = [];

  for (const kw of SECTOR_KEYWORDS) {
    // Zaten var mı kontrol et
    const { data: existing } = await supabase
      .from("seo_keywords")
      .select("id")
      .eq("keyword", kw.keyword)
      .eq("site", kw.site)
      .single();

    if (existing) { skipped++; continue; }

    // Sırayı kontrol et
    const position = await checkRanking(kw.keyword, kw.site);

    const { error } = await supabase.from("seo_keywords").insert([{
      keyword: kw.keyword,
      site: kw.site,
      position,
      previous_position: null,
      target_position: kw.target,
      checked_at: new Date().toISOString(),
      notes: `Hacim: ${kw.volume} | Otomatik eklendi`,
    }]);

    if (!error) {
      added++;
      results.push({ keyword: kw.keyword, site: kw.site, position });
    }
  }

  return NextResponse.json({ ok: true, added, skipped, total: SECTOR_KEYWORDS.length, results });
}
