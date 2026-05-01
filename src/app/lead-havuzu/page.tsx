"use client";

import { useEffect, useState } from "react";
import { supabase, type Lead, LEAD_STATUSES, LEAD_SOURCES } from "@/lib/supabase";

const statusColors: Record<string, { bg: string; color: string }> = {
  Yeni: { bg: "#DBEAFE", color: "#1D4ED8" },
  Arandı: { bg: "#FEF3C7", color: "#D97706" },
  Demo: { bg: "#EDE9FE", color: "#7C3AED" },
  "Teklif Gönderildi": { bg: "#DCFCE7", color: "#15803D" },
  Kazanıldı: { bg: "#D1FAE5", color: "#065F46" },
  Kaybedildi: { bg: "#FEE2E2", color: "#B91C1C" },
};

const scoreColor = (s: number) => {
  if (s >= 80) return "#10B981";
  if (s >= 60) return "#F59E0B";
  return "#EF4444";
};

const emptyForm = {
  company: "", contact_name: "", phone: "", email: "",
  city: "İzmir", source: "Manuel", status: "Yeni",
  score: 50, machine_type: "", notes: "",
};

const emptyQuote = {
  machine_model: "",
  monthly_rent: "",
  copy_price: "",
  copy_currency: "TL",
  min_copies: "",
  contract_months: "12",
  includes_toner: true,
  includes_service: true,
  includes_parts: true,
  includes_drum: false,
  valid_days: "15",
  extra_notes: "",
};

type QuoteData = typeof emptyQuote;
type LeadForQuote = Pick<Lead, "company" | "contact_name" | "phone" | "email" | "city" | "machine_type">;

function TeklifModal({ lead, onClose }: { lead: LeadForQuote; onClose: () => void }) {
  const [q, setQ] = useState<QuoteData>({ ...emptyQuote, machine_model: lead.machine_type || "" });
  const [preview, setPreview] = useState(false);
  const today = new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
  const quoteNo = `KOP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;

  const handlePrint = () => {
    window.print();
  };

  if (preview) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
        <div className="rounded-2xl overflow-y-auto" style={{ backgroundColor: "#fff", width: "100%", maxWidth: 680, maxHeight: "95vh", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
          {/* Yazdır toolbar */}
          <div className="flex justify-between items-center px-6 py-3 print:hidden" style={{ borderBottom: "1px solid #E5EAF0", backgroundColor: "#F7F9FC" }}>
            <button onClick={() => setPreview(false)} style={{ fontSize: 13, color: "#6B7280", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
              ← Düzenle
            </button>
            <div className="flex gap-3">
              <button onClick={handlePrint} style={{ padding: "8px 20px", borderRadius: 8, backgroundColor: "#1F3A5F", color: "#fff", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
                🖨️ Yazdır / PDF
              </button>
              <button onClick={onClose} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #E5EAF0", backgroundColor: "#fff", cursor: "pointer", fontSize: 13, color: "#6B7280" }}>
                Kapat
              </button>
            </div>
          </div>

          {/* Teklif İçeriği */}
          <div id="teklif-print" style={{ padding: "40px 48px", fontFamily: "Arial, sans-serif" }}>
            {/* Header */}
            <div className="flex justify-between items-start" style={{ marginBottom: 32 }}>
              <div>
                <div style={{ fontSize: 26, fontWeight: 800, color: "#C8102E", letterSpacing: -0.5 }}>KOPİSER</div>
                <div style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>Fotokopi Makinesi Kiralama & Teknik Servis</div>
                <div style={{ fontSize: 11, color: "#6B7280" }}>İzmir & İstanbul · 2010'dan beri</div>
                <div style={{ fontSize: 11, color: "#6B7280" }}>www.kopiser.com.tr</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#1A1F2E" }}>FİYAT TEKLİFİ</div>
                <div style={{ fontSize: 12, color: "#6B7280", marginTop: 4 }}>Teklif No: <strong>{quoteNo}</strong></div>
                <div style={{ fontSize: 12, color: "#6B7280" }}>Tarih: {today}</div>
                <div style={{ fontSize: 12, color: "#6B7280" }}>Geçerlilik: {q.valid_days} gün</div>
              </div>
            </div>

            {/* Müşteri Bilgileri */}
            <div style={{ backgroundColor: "#F7F9FC", borderRadius: 8, padding: "16px 20px", marginBottom: 24, border: "1px solid #E5EAF0" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>MÜŞTERİ BİLGİLERİ</div>
              <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "6px 24px", display: "grid" }}>
                <div style={{ fontSize: 13 }}><span style={{ color: "#6B7280" }}>Firma: </span><strong>{lead.company || "—"}</strong></div>
                <div style={{ fontSize: 13 }}><span style={{ color: "#6B7280" }}>Yetkili: </span><strong>{lead.contact_name || "—"}</strong></div>
                <div style={{ fontSize: 13 }}><span style={{ color: "#6B7280" }}>Telefon: </span><strong>{lead.phone || "—"}</strong></div>
                <div style={{ fontSize: 13 }}><span style={{ color: "#6B7280" }}>E-posta: </span><strong>{lead.email || "—"}</strong></div>
                <div style={{ fontSize: 13 }}><span style={{ color: "#6B7280" }}>Şehir: </span><strong>{lead.city || "—"}</strong></div>
              </div>
            </div>

            {/* Teklif Detayları */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 }}>TEKLİF DETAYLARI</div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ backgroundColor: "#1F3A5F", color: "#fff" }}>
                    {["Ürün/Hizmet", "Açıklama", "Birim", "Tutar"].map(h => (
                      <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 12, fontWeight: 700 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: "1px solid #E5EAF0" }}>
                    <td style={{ padding: "12px 14px", fontWeight: 600 }}>Fotokopi Makinesi Kiralama</td>
                    <td style={{ padding: "12px 14px", color: "#6B7280" }}>{q.machine_model || "—"}</td>
                    <td style={{ padding: "12px 14px", color: "#6B7280" }}>Aylık</td>
                    <td style={{ padding: "12px 14px", fontWeight: 700, color: "#1F3A5F" }}>
                      {q.monthly_rent ? `${q.monthly_rent} TL` : "—"}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #E5EAF0", backgroundColor: "#FAFBFC" }}>
                    <td style={{ padding: "12px 14px", fontWeight: 600 }}>Kopya Ücreti</td>
                    <td style={{ padding: "12px 14px", color: "#6B7280" }}>Min. {q.min_copies || "—"} kopya/ay garantili</td>
                    <td style={{ padding: "12px 14px", color: "#6B7280" }}>Kopya başı</td>
                    <td style={{ padding: "12px 14px", fontWeight: 700, color: "#1F3A5F" }}>
                      {q.copy_price ? `${q.copy_price} ${q.copy_currency}` : "—"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Dahil Hizmetler */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>FİYATA DAHİL HİZMETLER</div>
              <div className="flex flex-wrap gap-2" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {[
                  { key: "includes_service", label: "✓ Teknik Servis" },
                  { key: "includes_toner", label: "✓ Toner/Kartuş" },
                  { key: "includes_parts", label: "✓ Yedek Parça" },
                  { key: "includes_drum", label: "✓ Drum Ünitesi" },
                ].filter(item => q[item.key as keyof QuoteData]).map(item => (
                  <span key={item.key} style={{ padding: "4px 12px", borderRadius: 20, backgroundColor: "#D1FAE5", color: "#065F46", fontSize: 12, fontWeight: 600 }}>
                    {item.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Sözleşme */}
            <div style={{ backgroundColor: "#EFF6FF", borderRadius: 8, padding: "14px 20px", marginBottom: 24, border: "1px solid #BFDBFE" }}>
              <div style={{ fontSize: 13 }}>
                <strong>Sözleşme Süresi:</strong> {q.contract_months} ay
                {q.extra_notes && <> &nbsp;|&nbsp; <strong>Not:</strong> {q.extra_notes}</>}
              </div>
            </div>

            {/* Notlar */}
            <div style={{ fontSize: 11, color: "#9CA3AF", borderTop: "1px solid #E5EAF0", paddingTop: 16, lineHeight: 1.6 }}>
              Bu teklif {q.valid_days} gün geçerlidir. Fiyatlara KDV dahil değildir. Detaylı bilgi için lütfen iletişime geçiniz.
              &nbsp; | &nbsp; Kopiser — Tel: 0850 xxx xx xx &nbsp; | &nbsp; info@kopiser.com.tr
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="rounded-2xl overflow-y-auto" style={{ backgroundColor: "#fff", width: "100%", maxWidth: 580, maxHeight: "90vh", padding: "28px 32px", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
        <div className="flex justify-between items-start mb-5">
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1A1F2E", marginBottom: 4 }}>📄 Teklif Hazırla</h2>
            <p style={{ fontSize: 13, color: "#6B7280" }}>{lead.company || "Müşteri"} · {lead.contact_name}</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#9CA3AF", lineHeight: 1 }}>×</button>
        </div>

        <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 6 }}>Makine Modeli</label>
            <input value={q.machine_model} onChange={e => setQ({ ...q, machine_model: e.target.value })}
              placeholder="Örn: Konica Minolta C258, Kyocera 3553ci"
              style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #E5EAF0", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 6 }}>Aylık Kira (TL)</label>
            <input value={q.monthly_rent} onChange={e => setQ({ ...q, monthly_rent: e.target.value })}
              placeholder="Örn: 2500"
              style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #E5EAF0", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 6 }}>Sözleşme Süresi (Ay)</label>
            <select value={q.contract_months} onChange={e => setQ({ ...q, contract_months: e.target.value })}
              style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #E5EAF0", fontSize: 13, outline: "none", backgroundColor: "#fff" }}>
              {["6", "12", "24", "36"].map(m => <option key={m}>{m}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 6 }}>Kopya Ücreti</label>
            <input value={q.copy_price} onChange={e => setQ({ ...q, copy_price: e.target.value })}
              placeholder="Örn: 0.009"
              style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #E5EAF0", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 6 }}>Para Birimi</label>
            <select value={q.copy_currency} onChange={e => setQ({ ...q, copy_currency: e.target.value })}
              style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #E5EAF0", fontSize: 13, outline: "none", backgroundColor: "#fff" }}>
              <option>TL</option>
              <option>EUR</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 6 }}>Min. Kopya Garantisi/Ay</label>
            <input value={q.min_copies} onChange={e => setQ({ ...q, min_copies: e.target.value })}
              placeholder="Örn: 5000"
              style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #E5EAF0", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 6 }}>Teklif Geçerliliği (Gün)</label>
            <select value={q.valid_days} onChange={e => setQ({ ...q, valid_days: e.target.value })}
              style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #E5EAF0", fontSize: 13, outline: "none", backgroundColor: "#fff" }}>
              {["7", "10", "15", "30"].map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
        </div>

        {/* Dahil Hizmetler */}
        <div style={{ marginTop: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 10 }}>Fiyata Dahil Hizmetler</label>
          <div className="flex flex-wrap gap-3" style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {[
              { key: "includes_service", label: "Teknik Servis" },
              { key: "includes_toner", label: "Toner/Kartuş" },
              { key: "includes_parts", label: "Yedek Parça" },
              { key: "includes_drum", label: "Drum Ünitesi" },
            ].map(item => (
              <label key={item.key} className="flex items-center gap-2" style={{ cursor: "pointer", fontSize: 13, userSelect: "none" }}>
                <input type="checkbox" checked={q[item.key as keyof QuoteData] as boolean}
                  onChange={e => setQ({ ...q, [item.key]: e.target.checked })}
                  style={{ accentColor: "#1F3A5F", width: 15, height: 15 }} />
                {item.label}
              </label>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 6 }}>Ek Not (Opsiyonel)</label>
          <input value={q.extra_notes} onChange={e => setQ({ ...q, extra_notes: e.target.value })}
            placeholder="Örn: Kurulum ücretsiz, teslim 3-5 iş günü"
            style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #E5EAF0", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose}
            style={{ padding: "9px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, border: "1px solid #E5EAF0", backgroundColor: "#fff", cursor: "pointer", color: "#6B7280" }}>
            İptal
          </button>
          <button onClick={() => setPreview(true)}
            style={{ padding: "9px 24px", borderRadius: 8, fontSize: 13, fontWeight: 700, backgroundColor: "#1F3A5F", color: "#fff", border: "none", cursor: "pointer" }}>
            Teklifi Önizle →
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LeadHavuzu() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState("Hepsi");
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [teklifLead, setTeklifLead] = useState<Lead | null>(null);

  const fetchLeads = async () => {
    const { data } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
    setLeads(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchLeads(); }, []);

  const handleSubmit = async () => {
    setSaving(true);
    if (editId) {
      await supabase.from("leads").update(form).eq("id", editId);
    } else {
      await supabase.from("leads").insert([form]);
    }
    setSaving(false);
    setShowForm(false);
    setEditId(null);
    setForm(emptyForm);
    fetchLeads();
  };

  const handleEdit = (lead: Lead) => {
    setForm({
      company: lead.company || "", contact_name: lead.contact_name || "",
      phone: lead.phone || "", email: lead.email || "",
      city: lead.city || "İzmir", source: lead.source || "Manuel",
      status: lead.status || "Yeni", score: lead.score || 50,
      machine_type: lead.machine_type || "", notes: lead.notes || "",
    });
    setEditId(lead.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu lead'i silmek istediğinize emin misiniz?")) return;
    await supabase.from("leads").delete().eq("id", id);
    fetchLeads();
  };

  const filtered = leads.filter((l) => {
    const matchStatus = filterStatus === "Hepsi" || l.status === filterStatus;
    const matchSearch = !search ||
      (l.company || "").toLowerCase().includes(search.toLowerCase()) ||
      (l.contact_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (l.phone || "").includes(search);
    return matchStatus && matchSearch;
  });

  const statusCounts = LEAD_STATUSES.reduce((acc, s) => {
    acc[s] = leads.filter((l) => l.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div style={{ padding: "24px 32px 40px" }}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="flex items-center gap-2" style={{ fontSize: 22, fontWeight: 700, color: "#1A1F2E" }}>
            📞 Lead Havuzu
          </h1>
          <p style={{ color: "#6B7280", fontSize: 13, marginTop: 4 }}>
            {leads.length} lead · {leads.filter((l) => l.status === "Yeni").length} yeni
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-semibold"
          style={{ backgroundColor: "#1F3A5F", fontSize: 13, border: "none", cursor: "pointer" }}
        >
          + Yeni Lead Ekle
        </button>
      </div>

      {/* Status badges */}
      <div className="flex gap-3 mb-5 flex-wrap">
        {["Hepsi", ...LEAD_STATUSES].map((s) => {
          const count = s === "Hepsi" ? leads.length : statusCounts[s] || 0;
          const isActive = filterStatus === s;
          return (
            <button key={s} onClick={() => setFilterStatus(s)}
              style={{ padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer", border: isActive ? "none" : "1px solid #E5EAF0", backgroundColor: isActive ? "#1F3A5F" : "#fff", color: isActive ? "#fff" : "#6B7280" }}>
              {s} <span style={{ opacity: 0.7 }}>({count})</span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="mb-5">
        <input type="text" placeholder="Firma, kişi veya telefon ara..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: "100%", maxWidth: 400, padding: "9px 14px", borderRadius: 8, border: "1px solid #E5EAF0", fontSize: 13, outline: "none", backgroundColor: "#fff" }} />
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ backgroundColor: "#fff", border: "1px solid #E5EAF0", boxShadow: "0 1px 2px rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.06)" }}>
        {loading ? (
          <div className="flex items-center justify-center" style={{ padding: 60, color: "#6B7280" }}>Yükleniyor...</div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center" style={{ padding: 60, color: "#6B7280" }}>Lead bulunamadı</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#F7F9FC", borderBottom: "1px solid #E5EAF0" }}>
                {["Firma / Kişi", "Telefon", "Kaynak", "Durum", "Skor", "Tarih", "İşlemler"].map((h) => (
                  <th key={h} style={{ padding: "10px 16px", fontSize: 11, fontWeight: 700, color: "#6B7280", textAlign: "left", textTransform: "uppercase", letterSpacing: 0.5 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead, i) => {
                const st = statusColors[lead.status || "Yeni"] || { bg: "#F1F5F9", color: "#6B7280" };
                return (
                  <tr key={lead.id}
                    style={{ borderBottom: i < filtered.length - 1 ? "1px solid #F1F5F9" : "none" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "#FAFBFC")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "transparent")}
                  >
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: "#1A1F2E" }}>{lead.company || "—"}</div>
                      <div style={{ fontSize: 12, color: "#6B7280" }}>{lead.contact_name}</div>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#1A1F2E" }}>{lead.phone || "—"}</td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: "#6B7280" }}>{lead.source}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 700, backgroundColor: st.bg, color: st.color }}>
                        {lead.status}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: scoreColor(lead.score || 0) }}>{lead.score}</span>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: "#6B7280" }}>
                      {new Date(lead.created_at).toLocaleDateString("tr-TR")}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div className="flex gap-2">
                        <button onClick={() => setTeklifLead(lead)}
                          style={{ padding: "4px 10px", fontSize: 11, fontWeight: 600, border: "none", borderRadius: 6, cursor: "pointer", backgroundColor: "#1F3A5F", color: "#fff" }}>
                          Teklif
                        </button>
                        <button onClick={() => handleEdit(lead)}
                          style={{ padding: "4px 10px", fontSize: 11, fontWeight: 600, border: "1px solid #E5EAF0", borderRadius: 6, cursor: "pointer", backgroundColor: "#fff", color: "#1F3A5F" }}>
                          Düzenle
                        </button>
                        <button onClick={() => handleDelete(lead.id)}
                          style={{ padding: "4px 10px", fontSize: 11, fontWeight: 600, border: "1px solid #FEE2E2", borderRadius: 6, cursor: "pointer", backgroundColor: "#FEF2F2", color: "#EF4444" }}>
                          Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Teklif Modalı */}
      {teklifLead && <TeklifModal lead={teklifLead} onClose={() => setTeklifLead(null)} />}

      {/* Lead Form Modal */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div className="rounded-2xl overflow-y-auto"
            style={{ backgroundColor: "#fff", width: "100%", maxWidth: 560, maxHeight: "90vh", padding: "28px 32px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1A1F2E", marginBottom: 20 }}>
              {editId ? "Lead Düzenle" : "Yeni Lead Ekle"}
            </h2>

            <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
              {[
                { label: "Firma Adı", key: "company" },
                { label: "İletişim Kişisi", key: "contact_name" },
                { label: "Telefon", key: "phone" },
                { label: "E-posta", key: "email" },
                { label: "Şehir", key: "city" },
                { label: "Makine Tipi", key: "machine_type" },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 6 }}>{label}</label>
                  <input type="text" value={form[key as keyof typeof form] as string}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #E5EAF0", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                </div>
              ))}
            </div>

            <div className="grid gap-4 mt-4" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 6 }}>Kaynak</label>
                <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #E5EAF0", fontSize: 13, outline: "none", backgroundColor: "#fff" }}>
                  {LEAD_SOURCES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 6 }}>Durum</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #E5EAF0", fontSize: 13, outline: "none", backgroundColor: "#fff" }}>
                  {LEAD_STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 6 }}>
                  Skor: <strong style={{ color: scoreColor(form.score) }}>{form.score}</strong>
                </label>
                <input type="range" min={0} max={100} value={form.score}
                  onChange={(e) => setForm({ ...form, score: Number(e.target.value) })}
                  style={{ width: "100%", accentColor: "#1F3A5F" }} />
              </div>
            </div>

            <div className="mt-4">
              <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 6 }}>Notlar</label>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3}
                style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #E5EAF0", fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowForm(false)}
                style={{ padding: "9px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, border: "1px solid #E5EAF0", backgroundColor: "#fff", cursor: "pointer", color: "#6B7280" }}>
                İptal
              </button>
              <button onClick={handleSubmit} disabled={saving}
                style={{ padding: "9px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, backgroundColor: "#1F3A5F", color: "#fff", border: "none", cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
                {saving ? "Kaydediliyor..." : editId ? "Güncelle" : "Lead Ekle"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
