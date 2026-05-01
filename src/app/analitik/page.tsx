"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

export default function Analitik() {
  const [leadsBySource, setLeadsBySource] = useState<{ name: string; value: number }[]>([]);
  const [leadsByStatus, setLeadsByStatus] = useState<{ name: string; value: number }[]>([]);
  const [campaignData, setCampaignData] = useState<{ name: string; spend: number; leads: number; roas: number }[]>([]);
  const [totalLeads, setTotalLeads] = useState(0);
  const [avgScore, setAvgScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      const [{ data: leads }, { data: campaigns }] = await Promise.all([
        supabase.from("leads").select("source,status,score"),
        supabase.from("campaigns").select("name,spend_total,leads_count,roas"),
      ]);

      if (leads) {
        setTotalLeads(leads.length);
        setAvgScore(Math.round(leads.reduce((s, l) => s + (l.score || 0), 0) / (leads.length || 1)));

        const srcMap: Record<string, number> = {};
        leads.forEach(l => { srcMap[l.source || "Diğer"] = (srcMap[l.source || "Diğer"] || 0) + 1; });
        setLeadsBySource(Object.entries(srcMap).map(([name, value]) => ({ name, value })));

        const stMap: Record<string, number> = {};
        leads.forEach(l => { stMap[l.status || "Yeni"] = (stMap[l.status || "Yeni"] || 0) + 1; });
        setLeadsByStatus(Object.entries(stMap).map(([name, value]) => ({ name, value })));
      }

      if (campaigns) {
        setCampaignData(campaigns.map(c => ({
          name: c.name.length > 20 ? c.name.slice(0, 20) + "..." : c.name,
          spend: Number(c.spend_total) || 0,
          leads: c.leads_count || 0,
          roas: Number(c.roas) || 0,
        })));
      }

      setLoading(false);
    };
    fetchAll();
  }, []);

  const PIE_COLORS = ["#1F3A5F", "#C8102E", "#10B981", "#3B82F6", "#F59E0B", "#8B5CF6"];

  const weeklyTraffic = [
    { gun: "Pzt", kopiser: 82, izmir: 38 },
    { gun: "Sal", kopiser: 94, izmir: 48 },
    { gun: "Çar", kopiser: 78, izmir: 42 },
    { gun: "Per", kopiser: 110, izmir: 55 },
    { gun: "Cum", kopiser: 125, izmir: 60 },
    { gun: "Cmt", kopiser: 65, izmir: 30 },
    { gun: "Paz", kopiser: 45, izmir: 22 },
  ];

  if (loading) return <div style={{ padding: "60px 32px", color: "#6B7280" }}>Yükleniyor...</div>;

  return (
    <div style={{ padding: "24px 32px 40px" }}>
      <div className="mb-6">
        <h1 className="flex items-center gap-2" style={{ fontSize: 22, fontWeight: 700, color: "#1A1F2E" }}>📊 Analitik & Rapor</h1>
        <p style={{ color: "#6B7280", fontSize: 13, marginTop: 4 }}>Gerçek zamanlı Supabase verisi · Web trafiği örnek gösterim</p>
      </div>

      {/* KPI */}
      <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        {[
          { label: "Toplam Lead", value: totalLeads.toString(), color: "#C8102E", sub: "Supabase'den canlı" },
          { label: "Ort. Lead Skoru", value: avgScore.toString(), color: "#10B981", sub: "0-100 arası" },
          { label: "Aktif Kampanya", value: campaignData.length.toString(), color: "#3B82F6", sub: "Meta + Google" },
          { label: "Organik Trafik (hafta)", value: weeklyTraffic.reduce((s, d) => s + d.kopiser + d.izmir, 0).toString(), color: "#F59E0B", sub: "2 site toplam" },
        ].map(kpi => (
          <div key={kpi.label} className="rounded-xl relative overflow-hidden"
            style={{ backgroundColor: "#fff", border: "1px solid #E5EAF0", padding: "18px 20px", boxShadow: "0 1px 2px rgba(15,23,42,0.04)" }}>
            <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", backgroundColor: kpi.color }} />
            <div style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>{kpi.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#1A1F2E" }}>{kpi.value}</div>
            <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 4 }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Grafikler - üst satır */}
      <div className="grid gap-5 mb-5" style={{ gridTemplateColumns: "1.6fr 1fr" }}>
        {/* Web Trafiği */}
        <div className="rounded-xl" style={{ backgroundColor: "#fff", border: "1px solid #E5EAF0", padding: "20px 24px", boxShadow: "0 1px 2px rgba(15,23,42,0.04)" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#1A1F2E", marginBottom: 4 }}>Web Trafiği (Bu Hafta)</div>
          <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 16 }}>kopiser.com.tr vs izmirfotokopi.net</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyTraffic} barSize={14} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="gun" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E5EAF0", fontSize: 12 }} />
              <Bar dataKey="kopiser" name="kopiser.com.tr" fill="#1F3A5F" radius={[4, 4, 0, 0]} />
              <Bar dataKey="izmir" name="izmirfotokopi.net" fill="#C8102E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Lead Kaynağı Dağılımı */}
        <div className="rounded-xl" style={{ backgroundColor: "#fff", border: "1px solid #E5EAF0", padding: "20px 24px", boxShadow: "0 1px 2px rgba(15,23,42,0.04)" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#1A1F2E", marginBottom: 4 }}>Lead Kaynağı Dağılımı</div>
          <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 8 }}>Supabase gerçek veri</div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={leadsBySource} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {leadsBySource.map((_, idx) => <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E5EAF0", fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2">
            {leadsBySource.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-1">
                <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                <span style={{ fontSize: 11, color: "#6B7280" }}>{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grafikler - alt satır */}
      <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 1fr" }}>
        {/* Kampanya Performansı */}
        <div className="rounded-xl" style={{ backgroundColor: "#fff", border: "1px solid #E5EAF0", padding: "20px 24px", boxShadow: "0 1px 2px rgba(15,23,42,0.04)" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#1A1F2E", marginBottom: 4 }}>Kampanya Lead Sayısı</div>
          <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 16 }}>Kampanya bazında lead dağılımı</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={campaignData} layout="vertical" barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} width={120} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E5EAF0", fontSize: 12 }} />
              <Bar dataKey="leads" name="Lead" fill="#1F3A5F" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Lead Durum Dağılımı */}
        <div className="rounded-xl" style={{ backgroundColor: "#fff", border: "1px solid #E5EAF0", padding: "20px 24px", boxShadow: "0 1px 2px rgba(15,23,42,0.04)" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#1A1F2E", marginBottom: 4 }}>Lead Durum Dağılımı</div>
          <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 16 }}>Pipeline görünümü</div>
          <div className="flex flex-col gap-3">
            {leadsByStatus.map((item, idx) => (
              <div key={item.name}>
                <div className="flex justify-between mb-1">
                  <span style={{ fontSize: 12, color: "#1A1F2E", fontWeight: 600 }}>{item.name}</span>
                  <span style={{ fontSize: 12, color: "#6B7280" }}>{item.value}</span>
                </div>
                <div style={{ height: 8, backgroundColor: "#F1F5F9", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(item.value / totalLeads) * 100}%`, backgroundColor: PIE_COLORS[idx % PIE_COLORS.length], borderRadius: 4, transition: "width 0.5s" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
