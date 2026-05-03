"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function KpiBand() {
  const [d, setD] = useState({ thisMonth: 0, active: 0, content: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      const [a, b, c, e] = await Promise.all([
        supabase.from("leads").select("*", { count: "exact", head: true }).gte("created_at", monthStart),
        supabase.from("leads").select("*", { count: "exact", head: true }).not("status", "in", '("Kazanıldı","Kaybedildi")'),
        supabase.from("content_items").select("*", { count: "exact", head: true }).gte("created_at", monthStart),
        supabase.from("leads").select("*", { count: "exact", head: true }),
      ]);
      setD({ thisMonth: a.count || 0, active: b.count || 0, content: c.count || 0, total: e.count || 0 });
      setLoading(false);
    }
    load();
  }, []);

  const kpis = [
    { label: "Bu Ay Yeni Lead", value: loading ? "…" : String(d.thisMonth), sub: `${d.total} toplam lead`, delta: "Canlı", color: "#C8102E" },
    { label: "Aktif Pipeline", value: loading ? "…" : String(d.active), sub: "görüşme + demo + teklif", delta: "Takipte", color: "#10B981" },
    { label: "Bu Ay İçerik", value: loading ? "…" : String(d.content), sub: "blog + sosyal medya", delta: "AI", color: "#3B82F6" },
    { label: "Toplam Lead", value: loading ? "…" : String(d.total), sub: "tüm zamanlar", delta: "DB", color: "#F59E0B" },
  ];

  return (
    <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
      {kpis.map((kpi) => (
        <div key={kpi.label} className="rounded-xl relative overflow-hidden"
          style={{ backgroundColor: "#fff", border: "1px solid #E5EAF0", padding: "18px 20px", boxShadow: "0 1px 2px rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.06)" }}>
          <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", backgroundColor: kpi.color }} />
          <div style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>{kpi.label}</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#1A1F2E", lineHeight: 1.1, letterSpacing: -0.5 }}>{kpi.value}</div>
          <div className="flex items-center gap-2 mt-2" style={{ fontSize: 12, color: "#6B7280" }}>
            <span style={{ fontSize: 11, fontWeight: 700, padding: "1px 6px", borderRadius: 8, backgroundColor: "#D1FAE5", color: "#10B981" }}>{kpi.delta}</span>
            {kpi.sub}
          </div>
        </div>
      ))}
    </div>
  );
}
