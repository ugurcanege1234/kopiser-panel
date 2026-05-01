"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Campaign = {
  id: string; created_at?: string; name: string; platform: string; status: string;
  budget_daily: number | null; spend_total: number | null; leads_count: number | null;
  impressions?: number; reach?: number; clicks?: number;
  cpl: number | null; roas: number | null; start_date?: string | null; end_date?: string | null;
  notes?: string | null; source?: "meta" | "manual";
};

const PLATFORMS = ["Meta", "Google", "TikTok", "Diğer"];
const STATUSES = ["Aktif", "Duraklatıldı", "Tamamlandı", "Taslak"];

const statusStyle: Record<string, { bg: string; color: string }> = {
  Aktif: { bg: "#D1FAE5", color: "#059669" },
  Duraklatıldı: { bg: "#FEF3C7", color: "#D97706" },
  Tamamlandı: { bg: "#DBEAFE", color: "#1D4ED8" },
  Taslak: { bg: "#F1F5F9", color: "#64748B" },
};

const emptyForm = { name: "", platform: "Meta", status: "Taslak", budget_daily: "", spend_total: "", leads_count: "", cpl: "", roas: "", start_date: "", end_date: "", notes: "" };

export default function Reklam() {
  const [metaCampaigns, setMetaCampaigns] = useState<Campaign[]>([]);
  const [manualCampaigns, setManualCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [metaError, setMetaError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"meta" | "manual">("meta");

  const fetchMeta = async () => {
    try {
      const res = await fetch("/api/meta/campaigns");
      const json = await res.json();
      if (json.error) { setMetaError(json.error); return; }
      setMetaCampaigns(json.campaigns.map((c: Campaign) => ({ ...c, source: "meta" as const })));
    } catch {
      setMetaError("Meta API'ye ulaşılamadı");
    }
  };

  const fetchManual = async () => {
    const { data } = await supabase.from("campaigns").select("*").order("created_at", { ascending: false });
    setManualCampaigns((data || []).map((c: Campaign) => ({ ...c, source: "manual" as const })));
  };

  useEffect(() => {
    Promise.all([fetchMeta(), fetchManual()]).then(() => setLoading(false));
  }, []);

  const handleSubmit = async () => {
    setSaving(true);
    const payload = {
      name: form.name, platform: form.platform, status: form.status,
      budget_daily: form.budget_daily ? Number(form.budget_daily) : null,
      spend_total: form.spend_total ? Number(form.spend_total) : null,
      leads_count: form.leads_count ? Number(form.leads_count) : null,
      cpl: form.cpl ? Number(form.cpl) : null,
      roas: form.roas ? Number(form.roas) : null,
      start_date: form.start_date || null, end_date: form.end_date || null, notes: form.notes,
    };
    if (editId) await supabase.from("campaigns").update(payload).eq("id", editId);
    else await supabase.from("campaigns").insert([payload]);
    setSaving(false); setShowForm(false); setEditId(null); setForm(emptyForm); fetchManual();
  };

  const handleEdit = (c: Campaign) => {
    setForm({
      name: c.name, platform: c.platform, status: c.status,
      budget_daily: c.budget_daily?.toString() || "", spend_total: c.spend_total?.toString() || "",
      leads_count: c.leads_count?.toString() || "", cpl: c.cpl?.toString() || "",
      roas: c.roas?.toString() || "", start_date: c.start_date || "", end_date: c.end_date || "", notes: c.notes || "",
    });
    setEditId(c.id); setShowForm(true); setActiveTab("manual");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Silinsin mi?")) return;
    await supabase.from("campaigns").delete().eq("id", id); fetchManual();
  };

  const allActive = [...metaCampaigns, ...manualCampaigns].filter(c => c.status === "Aktif");
  const totalSpend = allActive.reduce((s, c) => s + (c.spend_total || 0), 0);
  const totalLeads = allActive.reduce((s, c) => s + (c.leads_count || 0), 0);
  const metaSpend = metaCampaigns.reduce((s, c) => s + (c.spend_total || 0), 0);
  const metaLeads = metaCampaigns.reduce((s, c) => s + (c.leads_count || 0), 0);

  const displayCampaigns = activeTab === "meta" ? metaCampaigns : manualCampaigns;

  return (
    <div style={{ padding: "24px 32px 40px" }}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="flex items-center gap-2" style={{ fontSize: 22, fontWeight: 700, color: "#1A1F2E" }}>🎯 Reklam Yönetimi</h1>
          <p style={{ color: "#6B7280", fontSize: 13, marginTop: 4 }}>
            {allActive.length} aktif kampanya · Meta API canlı veri
          </p>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); setActiveTab("manual"); }}
          style={{ padding: "9px 18px", borderRadius: 8, backgroundColor: "#1F3A5F", color: "#fff", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
          + Manuel Kampanya
        </button>
      </div>

      {/* KPI */}
      <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        {[
          { label: "Meta Harcama (90g)", value: `${metaSpend.toLocaleString("tr-TR", { maximumFractionDigits: 0 })} TL`, color: "#C8102E" },
          { label: "Meta Lead (90g)", value: metaLeads.toString(), color: "#10B981" },
          { label: "Meta Kampanya", value: metaCampaigns.length.toString(), color: "#1F3A5F" },
          { label: "Ort. CPL", value: metaLeads > 0 ? `${Math.round(metaSpend / metaLeads)} TL` : "—", color: "#F59E0B" },
        ].map(kpi => (
          <div key={kpi.label} className="rounded-xl relative overflow-hidden"
            style={{ backgroundColor: "#fff", border: "1px solid #E5EAF0", padding: "18px 20px", boxShadow: "0 1px 2px rgba(15,23,42,0.04)" }}>
            <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", backgroundColor: kpi.color }} />
            <div style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>{kpi.label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#1A1F2E" }}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Tab */}
      <div className="flex gap-3 mb-5">
        {([["meta", "📡 Meta Ads (Canlı)"], ["manual", "📋 Manuel Kampanyalar"]] as const).map(([tab, label]) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ padding: "7px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
              border: activeTab === tab ? "none" : "1px solid #E5EAF0",
              backgroundColor: activeTab === tab ? "#1F3A5F" : "#fff",
              color: activeTab === tab ? "#fff" : "#6B7280" }}>
            {label}
          </button>
        ))}
      </div>

      {/* Meta hata */}
      {activeTab === "meta" && metaError && (
        <div style={{ padding: "12px 16px", backgroundColor: "#FEF3C7", border: "1px solid #FDE68A", borderRadius: 8, color: "#92400E", fontSize: 12, marginBottom: 16 }}>
          ⚠️ Meta bağlantısı yenileniyor... Lütfen bekleyin.
        </div>
      )}

      {/* Tablo */}
      <div className="rounded-xl overflow-hidden" style={{ backgroundColor: "#fff", border: "1px solid #E5EAF0", boxShadow: "0 1px 2px rgba(15,23,42,0.04)" }}>
        {loading ? <div style={{ padding: 60, textAlign: "center", color: "#6B7280" }}>Yükleniyor...</div> : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#F7F9FC", borderBottom: "1px solid #E5EAF0" }}>
                {activeTab === "meta"
                  ? ["Kampanya", "Durum", "Günlük Bütçe", "Harcama (90g)", "Gösterim", "Tıklama", "Lead", "CPL"].map(h => (
                      <th key={h} style={{ padding: "10px 14px", fontSize: 11, fontWeight: 700, color: "#6B7280", textAlign: "left", textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                    ))
                  : ["Kampanya", "Platform", "Durum", "Günlük Bütçe", "Toplam Harcama", "Lead", "CPL", "ROAS", "İşlemler"].map(h => (
                      <th key={h} style={{ padding: "10px 14px", fontSize: 11, fontWeight: 700, color: "#6B7280", textAlign: "left", textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                    ))
                }
              </tr>
            </thead>
            <tbody>
              {displayCampaigns.length === 0 ? (
                <tr><td colSpan={9} style={{ padding: 40, textAlign: "center", color: "#6B7280", fontSize: 13 }}>
                  {activeTab === "meta" ? "Meta kampanya verisi yok" : "Manuel kampanya eklenmemiş"}
                </td></tr>
              ) : displayCampaigns.map((c, i) => {
                const st = statusStyle[c.status] || { bg: "#F1F5F9", color: "#64748B" };
                return (
                  <tr key={c.id} style={{ borderBottom: i < displayCampaigns.length - 1 ? "1px solid #F1F5F9" : "none" }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = "#FAFBFC")}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = "transparent")}>
                    <td style={{ padding: "12px 14px", fontWeight: 600, fontSize: 13, color: "#1A1F2E", maxWidth: 260 }}>
                      <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</div>
                    </td>
                    {activeTab === "meta" ? <>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 700, backgroundColor: st.bg, color: st.color }}>{c.status}</span>
                      </td>
                      <td style={{ padding: "12px 14px", fontSize: 13, color: "#1A1F2E" }}>{c.budget_daily ? `${c.budget_daily} TL/gün` : "—"}</td>
                      <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 600, color: "#1A1F2E" }}>{c.spend_total ? `${Number(c.spend_total).toLocaleString("tr-TR")} TL` : "—"}</td>
                      <td style={{ padding: "12px 14px", fontSize: 13, color: "#6B7280" }}>{c.impressions?.toLocaleString("tr-TR") ?? "—"}</td>
                      <td style={{ padding: "12px 14px", fontSize: 13, color: "#6B7280" }}>{c.clicks?.toLocaleString("tr-TR") ?? "—"}</td>
                      <td style={{ padding: "12px 14px", fontSize: 14, fontWeight: 700, color: "#1F3A5F" }}>{c.leads_count ?? "—"}</td>
                      <td style={{ padding: "12px 14px", fontSize: 13, color: "#1A1F2E" }}>{c.cpl ? `${c.cpl} TL` : "—"}</td>
                    </> : <>
                      <td style={{ padding: "12px 14px", fontSize: 12, color: "#6B7280" }}>{c.platform}</td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 700, backgroundColor: st.bg, color: st.color }}>{c.status}</span>
                      </td>
                      <td style={{ padding: "12px 14px", fontSize: 13, color: "#1A1F2E" }}>{c.budget_daily ? `${c.budget_daily} TL` : "—"}</td>
                      <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 600, color: "#1A1F2E" }}>{c.spend_total ? `${Number(c.spend_total).toLocaleString("tr-TR")} TL` : "—"}</td>
                      <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 700, color: "#1F3A5F" }}>{c.leads_count ?? "—"}</td>
                      <td style={{ padding: "12px 14px", fontSize: 13, color: "#1A1F2E" }}>{c.cpl ? `${c.cpl} TL` : "—"}</td>
                      <td style={{ padding: "12px 14px", fontSize: 14, fontWeight: 800, color: (c.roas || 0) >= 3 ? "#10B981" : "#F59E0B" }}>{c.roas ? `${c.roas}x` : "—"}</td>
                      <td style={{ padding: "12px 14px" }}>
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(c)} style={{ padding: "4px 10px", fontSize: 11, fontWeight: 600, border: "1px solid #E5EAF0", borderRadius: 6, cursor: "pointer", backgroundColor: "#fff", color: "#1F3A5F" }}>Düzenle</button>
                          <button onClick={() => handleDelete(c.id)} style={{ padding: "4px 10px", fontSize: 11, fontWeight: 600, border: "1px solid #FEE2E2", borderRadius: 6, cursor: "pointer", backgroundColor: "#FEF2F2", color: "#EF4444" }}>Sil</button>
                        </div>
                      </td>
                    </>}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Manuel Kampanya Modal */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
          onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div className="rounded-2xl overflow-y-auto" style={{ backgroundColor: "#fff", width: "100%", maxWidth: 560, maxHeight: "90vh", padding: "28px 32px" }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1A1F2E", marginBottom: 20 }}>{editId ? "Kampanya Düzenle" : "Yeni Kampanya"}</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 6 }}>Kampanya Adı</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #E5EAF0", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
              </div>
              <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
                {([["Platform", "platform", PLATFORMS], ["Durum", "status", STATUSES]] as const).map(([label, key, opts]) => (
                  <div key={key}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 6 }}>{label}</label>
                    <select value={form[key as keyof typeof form]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #E5EAF0", fontSize: 13, outline: "none", backgroundColor: "#fff" }}>
                      {(opts as readonly string[]).map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                {[["Günlük Bütçe (TL)", "budget_daily"], ["Toplam Harcama (TL)", "spend_total"], ["Lead Sayısı", "leads_count"], ["CPL (TL)", "cpl"], ["ROAS", "roas"]].map(([label, key]) => (
                  <div key={key}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 6 }}>{label}</label>
                    <input type="number" value={form[key as keyof typeof form]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #E5EAF0", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                  </div>
                ))}
              </div>
              <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
                {[["Başlangıç", "start_date"], ["Bitiş", "end_date"]].map(([label, key]) => (
                  <div key={key}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 6 }}>{label}</label>
                    <input type="date" value={form[key as keyof typeof form]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #E5EAF0", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                  </div>
                ))}
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 6 }}>Not</label>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #E5EAF0", fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
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
