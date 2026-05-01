import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const maxDuration = 60;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const SERPER_KEY = process.env.SERPER_API_KEY;

const SITE_DOMAINS: Record<string, string> = {
  "kopiser.com.tr": "kopiser.com.tr",
  "izmirfotokopi.net": "izmirfotokopi.net",
};

async function checkRanking(keyword: string, domain: string): Promise<number | null> {
  const res = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: { "X-API-KEY": SERPER_KEY!, "Content-Type": "application/json" },
    body: JSON.stringify({ q: keyword, gl: "tr", hl: "tr", num: 30 }),
  });

  if (!res.ok) return null;
  const data = await res.json();

  const organic: { link: string }[] = data.organic || [];
  for (let i = 0; i < organic.length; i++) {
    if (organic[i].link?.includes(domain)) {
      return i + 1;
    }
  }
  return null; // ilk 30'da yok
}

export async function POST() {
  if (!SERPER_KEY) return NextResponse.json({ error: "SERPER_API_KEY tanımlı değil" }, { status: 500 });

  // Tüm takip edilen kelimeleri çek (max 20, limit aşmamak için)
  const { data: keywords, error } = await supabase
    .from("seo_keywords")
    .select("id, keyword, site, position")
    .order("checked_at", { ascending: true })
    .limit(20);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!keywords?.length) return NextResponse.json({ ok: true, results: [], message: "Takip edilen kelime yok" });

  const results = [];

  for (const kw of keywords) {
    const domain = SITE_DOMAINS[kw.site] || kw.site;
    try {
      const newPosition = await checkRanking(kw.keyword, domain);

      await supabase.from("seo_keywords").update({
        previous_position: kw.position,
        position: newPosition,
        checked_at: new Date().toISOString(),
        notes: newPosition
          ? `Google TR ${newPosition}. sıra — Serper.dev otomatik`
          : `İlk 30'da bulunamadı — Serper.dev otomatik`,
      }).eq("id", kw.id);

      results.push({ keyword: kw.keyword, site: kw.site, position: newPosition, prev: kw.position });
    } catch (err) {
      results.push({ keyword: kw.keyword, site: kw.site, error: String(err) });
    }
  }

  return NextResponse.json({ ok: true, results, updated: results.length });
}

export async function GET() {
  if (!SERPER_KEY) return NextResponse.json({ error: "SERPER_API_KEY tanımlı değil" }, { status: 500 });

  // Test: tek bir kelime dene
  try {
    const pos = await checkRanking("fotokopi makinesi kiralama izmir", "kopiser.com.tr");
    return NextResponse.json({ ok: true, test_keyword: "fotokopi makinesi kiralama izmir", position: pos });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
