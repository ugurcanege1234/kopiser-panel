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
    const includedServices = [
      { key: "includes_service", label: "Teknik Servis" },
      { key: "includes_toner", label: "Toner / Kartuş" },
      { key: "includes_parts", label: "Yedek Parça" },
      { key: "includes_drum", label: "Drum Ünitesi" },
    ].filter(item => q[item.key as keyof QuoteData]);

    return (
      <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0,0,0,0.7)" }}>
        {/* Toolbar — yazdırmada gizlenir */}
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 60, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 24px", backgroundColor: "#1A1F2E", boxShadow: "0 2px 12px rgba(0,0,0,0.3)" }} className="print:hidden">
          <button onClick={() => setPreview(false)} style={{ fontSize: 13, color: "#9CA3AF", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
            ← Düzenle
          </button>
          <div className="flex gap-3">
            <button onClick={handlePrint} style={{ padding: "8px 22px", borderRadius: 8, backgroundColor: "#C8102E", color: "#fff", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
              🖨️ PDF İndir / Yazdır
            </button>
            <button onClick={onClose} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #374151", backgroundColor: "transparent", cursor: "pointer", fontSize: 13, color: "#9CA3AF" }}>
              Kapat
            </button>
          </div>
        </div>

        {/* A4 Kağıt */}
        <div style={{ marginTop: 56, marginBottom: 16, overflowY: "auto", maxHeight: "calc(100vh - 72px)" }}>
          <div id="teklif-print" style={{
            width: "210mm",
            minHeight: "297mm",
            backgroundColor: "#fff",
            fontFamily: "'Segoe UI', Arial, sans-serif",
            color: "#1A1F2E",
            boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
            position: "relative",
            overflow: "hidden",
          }}>

            {/* Sol lacivert dekoratif çubuk */}
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 5, backgroundColor: "#1F3A5F" }} />

            <div style={{ marginLeft: 5 }}>

              {/* HEADER — beyaz arka plan, logo doğal görünür */}
              <div style={{ backgroundColor: "#fff", padding: "22px 36px 18px", borderBottom: "2px solid #1F3A5F" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  {/* Logo + Şirket */}
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/logo.png"
                      alt="Kopiser"
                      style={{ height: 52, objectFit: "contain" }}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                    <div>
                      <div style={{ fontSize: 17, fontWeight: 800, color: "#1F3A5F", letterSpacing: -0.3 }}>
                        KOPİSER BÜRO MAKİNELERİ
                      </div>
                      <div style={{ fontSize: 9.5, color: "#64748B", marginTop: 2, letterSpacing: 0.3 }}>
                        Büro Makineleri Kiralama &amp; Teknik Servis · İzmir &amp; İstanbul
                      </div>
                    </div>
                  </div>

                  {/* Teklif Kimliği */}
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 4 }}>
                      Fiyat Teklifi
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#1F3A5F", letterSpacing: -0.5, marginBottom: 6 }}>
                      {quoteNo}
                    </div>
                    <div style={{ fontSize: 9.5, color: "#64748B", lineHeight: 1.8 }}>
                      <div>Tarih: <strong style={{ color: "#1A1F2E" }}>{today}</strong></div>
                      <div>Geçerlilik: <strong style={{ color: "#1F3A5F" }}>{q.valid_days} gün</strong></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Kurumsal bilgi şeridi — lacivert arka plan */}
              <div style={{ backgroundColor: "#1F3A5F", padding: "9px 36px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                {[
                  { label: "Kuruluş", value: "2010" },
                  { label: "Aktif Müşteri", value: "250+" },
                  { label: "Hizmet Bölgesi", value: "İzmir & İstanbul" },
                  { label: "Marka Bağımsız", value: "Kyocera · Konica · Xerox" },
                  { label: "Web", value: "kopiser.com.tr" },
                ].map(item => (
                  <div key={item.label} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>{item.value}</div>
                    <div style={{ fontSize: 8, color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: 0.5, marginTop: 1 }}>{item.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ padding: "22px 36px" }}>

                {/* Müşteri + Teklif Özet yan yana */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
                  {/* Müşteri Bilgileri */}
                  <div style={{ border: "1px solid #CBD5E1", borderRadius: 6, overflow: "hidden" }}>
                    <div style={{ backgroundColor: "#F1F5F9", borderBottom: "1px solid #CBD5E1", padding: "7px 14px" }}>
                      <div style={{ fontSize: 8.5, fontWeight: 700, color: "#1F3A5F", textTransform: "uppercase", letterSpacing: 1 }}>Müşteri Bilgileri</div>
                    </div>
                    <div style={{ padding: "10px 14px", backgroundColor: "#fff" }}>
                      {[
                        { label: "Firma", value: lead.company },
                        { label: "Yetkili", value: lead.contact_name },
                        { label: "Telefon", value: lead.phone },
                        { label: "E-posta", value: lead.email },
                        { label: "Şehir", value: lead.city },
                      ].map((row, idx, arr) => (
                        <div key={row.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, padding: "4px 0", borderBottom: idx < arr.length - 1 ? "1px solid #F1F5F9" : "none" }}>
                          <span style={{ color: "#94A3B8", width: 54, flexShrink: 0 }}>{row.label}</span>
                          <strong style={{ color: "#1A1F2E", textAlign: "right", maxWidth: 160, wordBreak: "break-word" }}>{row.value || "—"}</strong>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Teklif Özet Kutusu */}
                  <div style={{ border: "1px solid #CBD5E1", borderRadius: 6, overflow: "hidden" }}>
                    <div style={{ backgroundColor: "#1F3A5F", padding: "7px 14px" }}>
                      <div style={{ fontSize: 8.5, fontWeight: 700, color: "rgba(255,255,255,0.85)", textTransform: "uppercase", letterSpacing: 1 }}>Teklif Özeti</div>
                    </div>
                    <div style={{ padding: "10px 14px", backgroundColor: "#fff" }}>
                      {[
                        { label: "Model", value: q.machine_model || "—" },
                        { label: "Aylık Kira", value: q.monthly_rent ? `${Number(q.monthly_rent).toLocaleString("tr-TR")} ₺` : "—" },
                        { label: "Kopya Ücreti", value: q.copy_price ? `${q.copy_price} ${q.copy_currency === "EUR" ? "€" : "₺"}/kopya` : "—" },
                        { label: "Min. Kopya", value: q.min_copies ? `${Number(q.min_copies).toLocaleString("tr-TR")} / ay` : "—" },
                        { label: "Süre", value: `${q.contract_months} ay` },
                      ].map((row, idx, arr) => (
                        <div key={row.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, padding: "4px 0", borderBottom: idx < arr.length - 1 ? "1px solid #F1F5F9" : "none" }}>
                          <span style={{ color: "#94A3B8", width: 70, flexShrink: 0 }}>{row.label}</span>
                          <strong style={{ color: "#1F3A5F", textAlign: "right" }}>{row.value}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Fiyat Detay Tablosu */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 8.5, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: 1, marginBottom: 7 }}>Fiyatlandırma Detayı</div>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10.5 }}>
                    <thead>
                      <tr style={{ backgroundColor: "#F1F5F9", borderBottom: "2px solid #1F3A5F" }}>
                        {["Hizmet Kalemi", "Açıklama", "Birim", "Tutar"].map(h => (
                          <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 8.5, fontWeight: 700, color: "#1F3A5F", letterSpacing: 0.5, textTransform: "uppercase" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: "1px solid #E2E8F0" }}>
                        <td style={{ padding: "10px 12px", fontWeight: 600, color: "#1A1F2E" }}>Büro Makinesi Kiralama</td>
                        <td style={{ padding: "10px 12px", color: "#64748B" }}>{q.machine_model || "—"} · Tam bakımlı teslimat</td>
                        <td style={{ padding: "10px 12px", color: "#64748B" }}>Aylık</td>
                        <td style={{ padding: "10px 12px", fontWeight: 800, color: "#1F3A5F", fontSize: 13 }}>
                          {q.monthly_rent ? `${Number(q.monthly_rent).toLocaleString("tr-TR")} ₺` : "—"}
                        </td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid #E2E8F0", backgroundColor: "#F8FAFC" }}>
                        <td style={{ padding: "10px 12px", fontWeight: 600, color: "#1A1F2E" }}>Kopya / Baskı Ücreti</td>
                        <td style={{ padding: "10px 12px", color: "#64748B" }}>Min. {q.min_copies ? Number(q.min_copies).toLocaleString("tr-TR") : "—"} kopya/ay garantili</td>
                        <td style={{ padding: "10px 12px", color: "#64748B" }}>Kopya başı</td>
                        <td style={{ padding: "10px 12px", fontWeight: 700, color: "#1F3A5F" }}>
                          {q.copy_price ? `${q.copy_price} ${q.copy_currency === "EUR" ? "€" : "₺"}` : "—"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Dahil Hizmetler */}
                {includedServices.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 8.5, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: 1, marginBottom: 7 }}>Fiyata Dahil Hizmetler</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {includedServices.map(item => (
                        <span key={item.key} style={{ padding: "4px 11px", borderRadius: 4, backgroundColor: "#EFF6FF", color: "#1E40AF", fontSize: 9.5, fontWeight: 700, border: "1px solid #BFDBFE", letterSpacing: 0.3 }}>
                          ✓ {item.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Not */}
                {q.extra_notes && (
                  <div style={{ backgroundColor: "#F8FAFC", borderRadius: 5, padding: "9px 14px", marginBottom: 16, borderLeft: "3px solid #1F3A5F" }}>
                    <span style={{ fontSize: 9.5, color: "#1A1F2E" }}><strong>Not:</strong> {q.extra_notes}</span>
                  </div>
                )}

                {/* İmza */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 18, marginTop: 28 }}>
                  {[
                    { title: "Kopiser Yetkilisi", sub: "Kopiser Büro Makineleri" },
                    { title: "Müşteri / Yetkili", sub: lead.company || "—" },
                  ].map(s => (
                    <div key={s.title}>
                      <div style={{ borderTop: "1px solid #CBD5E1", paddingTop: 36, textAlign: "center" }}>
                        <div style={{ fontSize: 8.5, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.5 }}>{s.title} · İmza &amp; Kaşe</div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#1F3A5F", marginTop: 4 }}>{s.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div style={{ borderTop: "2px solid #1F3A5F", paddingTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 8, color: "#94A3B8", lineHeight: 1.9 }}>
                    <div>Bu teklif <strong style={{ color: "#1F3A5F" }}>{q.valid_days} gün</strong> geçerlidir. Belirtilen fiyatlara KDV dahil değildir (+%20 KDV uygulanır).</div>
                    <div>Teklif onayı sözleşme imzası ile geçerlilik kazanır. Mücbir sebep halleri saklıdır.</div>
                  </div>
                  <div style={{ textAlign: "right", fontSize: 8, color: "#94A3B8", lineHeight: 1.9 }}>
                    <div><strong style={{ color: "#1F3A5F" }}>Kopiser Büro Makineleri</strong> · kopiser.com.tr</div>
                    <div>📞 0232 348 15 68 · 0507 573 32 93 · 0555 265 37 50</div>
                    <div>✉️ info@kopiser.com.tr</div>
                    <div>📍 Mansuroğlu Mh. 262 Sk. No:6/C Bayraklı, İzmir</div>
                  </div>
                </div>
              </div>
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
