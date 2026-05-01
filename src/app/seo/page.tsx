"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type SeoKeyword = {
  id: string; created_at: string; keyword: string; position: number | null;
  previous_position: number | null; target_position: number | null;
  site: string; notes: string | null; checked_at: string;
};

const SITES = ["kopiser.com.tr", "izmirfotokopi.net"];

const emptyForm = { keyword: "", position: "", previous_position: "", target_position: "3", site: "kopiser.com.tr", notes: "" };

const positionDelta = (current: number | null, prev: number | null) => {
  if (!current || !prev) return null;
  const diff = prev - current;
  if (diff > 0) return { label: `▲${diff}`, color: "#10B981", bg: "#D1FAE5" };
  if (diff < 0) return { label: `▼${Math.abs(diff)}`, color: "#EF4444", bg: "#FEE2E2" };
  return { label: "→", color: "#6B7280", bg: "#F1F5F9" };
};

const positionColor = (pos: number | null, target: number | null) => {
  if (!pos) return "#6B7280";
  if (target && pos <= target) return "#10B981";
  if (pos <= 5) return "#1D4ED8";
  if (pos <= 10) return "#F59E0B";
  return "#EF4444";
};

export default function Seo() {
  const [keywords, setKeywords] = useState<SeoKeyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [filterSite, setFilterSite] = useState("Hepsi");
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  const fetchData = async () => {
    const { data } = await supabase.from("seo_keywords").select("*").order("position", { ascending: true });
    setKeywords(data || []); setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch("/api/gsc/sync", { method: "POST" });
      const json = await res.json();
      if (json.ok) {
        const total = json.results.reduce((s: number, r: { updated: number }) => s + r.updated, 0);
        setSyncResult(`✓ ${total} kelime Google'da kontrol edildi ve güncellendi`);
        fetchData();
      } else {
        setSyncResult(`Hata: ${json.error}`);
      }
    } catch (err) {
      setSyncResult(`Hata: ${String(err)}`);
    }
    setSyncing(false);
  };

  const handleSubmit = async () => {
    setSaving(true);
    const payload = {
      keyword: form.keyword, site: form.site, notes: form.notes,
      position: form.position ? Number(form.position) : null,
      previous_position: form.previous_position ? Number(form.previous_position) : null,
      target_position: form.target_position ? Number(form.target_position) : 3,
      checked_at: new Date().toISOString(),
    };
    if (editId) await supabase.from("seo_keywords").update(payload).eq("id", editId);
    else await supabase.from("seo_keywords").insert([payload]);
    setSaving(false); setShowForm(false); setEditId(null); setForm(emptyForm); fetchData();
  };

  const handleEdit = (k: SeoKeyword) => {
    setForm({
      keyword: k.keyword, position: k.position?.toString() || "",
      previous_position: k.previous_position?.toString() || "",
      target_position: k.target_position?.toString() || "3",
      site: k.site, notes: k.notes || "",
    });
    setEditId(k.id); setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Silinsin mi?")) return;
    await supabase.from("seo_keywords").delete().eq("id", id); fetchData();
  };

  const filtered = filterSite === "Hepsi" ? keywords : keywords.filter(k => k.site === filterSite);
  const top10 = keywords.filter(k => k.position && k.position <= 10).length;
  const onTarget = keywords.filter(k => k.position && k.target_position && k.position <= k.target_position).length;

  return (
    <div style={{ padding: "24px 32px 40px" }}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="flex items-center gap-2" style={{ fontSize: 22, fontWeight: 700, color: "#1A1F2E" }}>📈 SEO & Web</h1>
          <p style={{ color: "#6B7280", fontSize: 13, marginTop: 4 }}>{keywords.length} anahtar kelime · {top10} tanesi ilk 10'da</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleSync} disabled={syncing}
            style={{ padding: "9px 18px", borderRadius: 8, backgroundColor: "#10B981", color: "#fff", border: "none", cursor: syncing ? "wait" : "pointer", fontSize: 13, fontWeight: 600, opacity: syncing ? 0.7 : 1 }}>
            {syncing ? "⏳ Sıralar kontrol ediliyor..." : "🔄 Google Sıraları Güncelle"}
          </button>
          <button onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}
            style={{ padding: "9px 18px", borderRadius: 8, backgroundColor: "#1F3A5F", color: "#fff", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
            + Kelime Ekle
          </button>
        </div>
      </div>

      {syncResult && (
        <div style={{ padding: "10px 16px", marginBottom: 16,
          backgroundColor: syncResult.startsWith("✓") ? "#D1FAE5" : "#FEE2E2",
          border: `1px solid ${syncResult.startsWith("✓") ? "#6EE7B7" : "#FCA5A5"}`,
          borderRadius: 8, color: syncResult.startsWith("✓") ? "#059669" : "#DC2626", fontSize: 13 }}>
          {syncResult}
        </div>
      )}

      {/* KPI */}
      <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        {[
          { label: "Takip Edilen Kelime", value: keywords.length.toString(), color: "#1F3A5F" },
          { label: "İlk 10'da", value: top10.toString(), color: "#10B981" },
          { label: "Hedefe Ulaşan", value: onTarget.toString(), color: "#3B82F6" },
        ].map(kpi => (
          <div key={kpi.label} className="rounded-xl relative overflow-hidden"
            style={{ backgroundColor: "#fff", border: "1px solid #E5EAF0", padding: "18px 20px", boxShadow: "0 1px 2px rgba(15,23,42,0.04)" }}>
            <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", backgroundColor: kpi.color }} />
            <div style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>{kpi.label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#1A1F2E" }}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Site filtresi */}
      <div className="flex gap-3 mb-5">
        {["Hepsi", ...SITES].map(s => (
          <button key={s} onClick={() => setFilterSite(s)}
            style={{ padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer",
              border: filterSite === s ? "none" : "1px solid #E5EAF0",
              backgroundColor: filterSite === s ? "#1F3A5F" : "#fff",
              color: filterSite === s ? "#fff" : "#6B7280" }}>
            {s}
          </button>
        ))}
      </div>

      {/* Tablo */}
      <div className="rounded-xl overflow-hidden" style={{ backgroundColor: "#fff", border: "1px solid #E5EAF0", boxShadow: "0 1px 2px rgba(15,23,42,0.04)" }}>
        {loading ? <div style={{ padding: 60, textAlign: "center", color: "#6B7280" }}>Yükleniyor...</div> : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#F7F9FC", borderBottom: "1px solid #E5EAF0" }}>
                {["Anahtar Kelime", "Site", "Mevcut", "Önceki", "Değişim", "Hedef", "Durum", "İşlemler"].map(h => (
                  <th key={h} style={{ padding: "10px 14px", fontSize: 11, fontWeight: 700, color: "#6B7280", textAlign: "left", textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((k, i) => {
                const delta = positionDelta(k.position, k.previous_position);
                const pColor = positionColor(k.position, k.target_position);
                const onGoal = k.position && k.target_position && k.position <= k.target_position;
                return (
                  <tr key={k.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid #F1F5F9" : "none" }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = "#FAFBFC")}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = "transparent")}>
                    <td style={{ padding: "12px 14px", fontWeight: 600, fontSize: 13, color: "#1A1F2E" }}>{k.keyword}</td>
                    <td style={{ padding: "12px 14px", fontSize: 12, color: "#6B7280" }}>{k.site}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{ fontSize: 18, fontWeight: 800, color: pColor }}>{k.position ?? "—"}</span>
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 13, color: "#6B7280" }}>{k.previous_position ?? "—"}</td>
                    <td style={{ padding: "12px 14px" }}>
                      {delta ? <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 10, backgroundColor: delta.bg, color: delta.color }}>{delta.label}</span> : "—"}
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 13, color: "#6B7280" }}>{k.target_position ?? "—"}. sıra</td>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 10,
                        backgroundColor: onGoal ? "#D1FAE5" : "#FEF3C7", color: onGoal ? "#059669" : "#D97706" }}>
                        {onGoal ? "✓ Hedefte" : "Hedef altı"}
                      </span>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(k)} style={{ padding: "4px 10px", fontSize: 11, fontWeight: 600, border: "1px solid #E5EAF0", borderRadius: 6, cursor: "pointer", backgroundColor: "#fff", color: "#1F3A5F" }}>Düzenle</button>
                        <button onClick={() => handleDelete(k.id)} style={{ padding: "4px 10px", fontSize: 11, fontWeight: 600, border: "1px solid #FEE2E2", borderRadius: 6, cursor: "pointer", backgroundColor: "#FEF2F2", color: "#EF4444" }}>Sil</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
          onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div className="rounded-2xl" style={{ backgroundColor: "#fff", width: "100%", maxWidth: 480, padding: "28px 32px" }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1A1F2E", marginBottom: 20 }}>{editId ? "Kelime Düzenle" : "Yeni Anahtar Kelime"}</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 6 }}>Anahtar Kelime</label>
                <input value={form.keyword} onChange={e => setForm({ ...form, keyword: e.target.value })}
                  placeholder="fotokopi makinesi kiralama izmir"
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #E5EAF0", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 6 }}>Site</label>
                <select value={form.site} onChange={e => setForm({ ...form, site: e.target.value })}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #E5EAF0", fontSize: 13, outline: "none", backgroundColor: "#fff" }}>
                  {SITES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                {[["Mevcut Sıra", "position"], ["Önceki Sıra", "previous_position"], ["Hedef Sıra", "target_position"]].map(([label, key]) => (
                  <div key={key}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 6 }}>{label}</label>
                    <input type="number" min={1} max={100} value={form[key as keyof typeof form]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #E5EAF0", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                  </div>
                ))}
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 6 }}>Not</label>
                <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #E5EAF0", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowForm(false)}
                style={{ padding: "9px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, border: "1px solid #E5EAF0", backgroundColor: "#fff", cursor: "pointer", color: "#6B7280" }}>İptal</button>
              <button onClick={handleSubmit} disabled={saving}
                style={{ padding: "9px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, backgroundColor: "#1F3A5F", color: "#fff", border: "none", cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
                {saving ? "Kaydediliyor..." : editId ? "Güncelle" : "Ekle"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
