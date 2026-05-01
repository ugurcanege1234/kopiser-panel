import { NextResponse } from "next/server";
import { google } from "googleapis";
import { createClient } from "@supabase/supabase-js";

export const maxDuration = 60;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const SITES = [
  { url: "sc-domain:kopiser.com.tr", label: "kopiser.com.tr" },
  { url: "sc-domain:izmirfotokopi.net", label: "izmirfotokopi.net" },
];

async function getAuth() {
  const b64 = process.env.GOOGLE_SERVICE_ACCOUNT_B64;
  const credentials = b64
    ? JSON.parse(Buffer.from(b64, "base64").toString("utf8"))
    : {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      };

  return new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
  });
}

export async function POST() {
  try {
    const auth = await getAuth();
    const searchconsole = google.searchconsole({ version: "v1", auth });

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 28);
    const start = startDate.toISOString().split("T")[0];
    const end = endDate.toISOString().split("T")[0];

    const results: { site: string; updated: number; error?: string }[] = [];

    for (const site of SITES) {
      try {
        const res = await searchconsole.searchanalytics.query({
          siteUrl: site.url,
          requestBody: {
            startDate: start,
            endDate: end,
            dimensions: ["query"],
            rowLimit: 50,
            dimensionFilterGroups: [],
          },
        });

        const rows = res.data.rows || [];
        let updated = 0;

        for (const row of rows) {
          const keyword = row.keys?.[0];
          const position = row.position ? Math.round(row.position) : null;
          const clicks = row.clicks || 0;
          const impressions = row.impressions || 0;

          if (!keyword) continue;

          const { data: existing } = await supabase
            .from("seo_keywords")
            .select("id, position")
            .eq("keyword", keyword)
            .eq("site", site.label)
            .single();

          if (existing) {
            await supabase.from("seo_keywords").update({
              previous_position: existing.position,
              position,
              checked_at: new Date().toISOString(),
              notes: `Tıklama: ${clicks} | Gösterim: ${impressions} | GSC otomatik güncellendi`,
            }).eq("id", existing.id);
          } else {
            await supabase.from("seo_keywords").insert([{
              keyword,
              site: site.label,
              position,
              previous_position: null,
              target_position: position && position <= 3 ? position : 3,
              checked_at: new Date().toISOString(),
              notes: `Tıklama: ${clicks} | Gösterim: ${impressions} | GSC otomatik eklendi`,
            }]);
          }
          updated++;
        }

        results.push({ site: site.label, updated });
      } catch (err) {
        results.push({ site: site.label, updated: 0, error: String(err) });
      }
    }

    return NextResponse.json({ ok: true, results });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function GET() {
  try {
    const auth = await getAuth();
    const searchconsole = google.searchconsole({ version: "v1", auth });

    const sites = await searchconsole.sites.list();
    return NextResponse.json({ sites: sites.data.siteEntry || [] });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
