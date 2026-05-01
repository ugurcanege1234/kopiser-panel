import { NextResponse } from "next/server";

const TOKEN = process.env.META_ACCESS_TOKEN;
const AD_ACCOUNT = process.env.META_AD_ACCOUNT_ID || "act_326261440";
const BASE = "https://graph.facebook.com/v21.0";

export async function GET() {
  if (!TOKEN) return NextResponse.json({ error: "META_ACCESS_TOKEN not set" }, { status: 500 });

  const [campaignsRes, insightsRes] = await Promise.all([
    fetch(`${BASE}/${AD_ACCOUNT}/campaigns?fields=name,status,daily_budget,lifetime_budget,objective&limit=50&access_token=${TOKEN}`),
    fetch(`${BASE}/${AD_ACCOUNT}/insights?fields=campaign_name,campaign_id,spend,impressions,reach,clicks,actions&date_preset=last_90d&level=campaign&access_token=${TOKEN}`),
  ]);

  const [campaignsData, insightsData] = await Promise.all([
    campaignsRes.json(),
    insightsRes.json(),
  ]);

  if (campaignsData.error) return NextResponse.json({ error: campaignsData.error.message }, { status: 400 });

  const insightsMap: Record<string, {
    spend: number; impressions: number; reach: number; clicks: number; leads: number;
  }> = {};

  for (const row of insightsData.data || []) {
    const leads = (row.actions || []).find(
      (a: { action_type: string; value: string }) =>
        a.action_type === "onsite_conversion.total_messaging_connection" ||
        a.action_type === "lead"
    );
    insightsMap[row.campaign_id] = {
      spend: parseFloat(row.spend || "0"),
      impressions: parseInt(row.impressions || "0"),
      reach: parseInt(row.reach || "0"),
      clicks: parseInt(row.clicks || "0"),
      leads: leads ? parseInt(leads.value) : 0,
    };
  }

  const campaigns = (campaignsData.data || []).map((c: {
    id: string; name: string; status: string;
    daily_budget?: string; lifetime_budget?: string; objective: string;
  }) => {
    const ins = insightsMap[c.id] || { spend: 0, impressions: 0, reach: 0, clicks: 0, leads: 0 };
    const cpl = ins.leads > 0 ? Math.round(ins.spend / ins.leads) : null;
    return {
      id: c.id,
      name: c.name,
      platform: "Meta",
      status: c.status === "ACTIVE" ? "Aktif" : c.status === "PAUSED" ? "Duraklatıldı" : "Tamamlandı",
      budget_daily: c.daily_budget ? Math.round(parseInt(c.daily_budget) / 100) : null,
      spend_total: ins.spend,
      leads_count: ins.leads,
      impressions: ins.impressions,
      reach: ins.reach,
      clicks: ins.clicks,
      cpl,
      roas: null,
      objective: c.objective,
    };
  });

  return NextResponse.json({ campaigns });
}
