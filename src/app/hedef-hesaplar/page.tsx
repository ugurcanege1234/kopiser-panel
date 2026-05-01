"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";

type TargetAccount = {
  id: string; created_at: string; company_name: string; sector: string | null;
  city: string | null; contact_name: string | null; phone: string | null;
  email: string | null; employee_count: string | null; status: string;
  priority: string; notes: string | null; source: string | null;
};

const STATUSES = ["Hedeflendi", "İletişim Kuruldu", "Toplantı", "Teklif", "Kazanıldı", "Kaybedildi"];
const PRIORITIES = ["Yüksek", "Orta", "Düşük"];
const SECTORS = ["Sanayi", "Eğitim", "Kamu", "Sağlık", "Hukuk", "Lojistik", "Perakende", "İnşaat", "Finans", "Turizm", "Diğer"];

const statusStyle: Record<string, { bg: string; color: string }> = {
  Hedeflendi: { bg: "#F1F5F9", color: "#64748B" },
  "İletişim Kuruldu": { bg: "#DBEAFE", color: "#1D4ED8" },
  Toplantı: { bg: "#EDE9FE", color: "#7C3AED" },
  Teklif: { bg: "#FEF3C7", color: "#D97706" },
  Kazanıldı: { bg: "#D1FAE5", color: "#059669" },
  Kaybedildi: { bg: "#FEE2E2", color: "#DC2626" },
};

const priorityStyle: Record<string, { color: string }> = {
  Yüksek: { color: "#EF4444" },
  Orta: { color: "#F59E0B" },
  Düşük: { color: "#10B981" },
};

const emptyForm = {
  company_name: "", sector: "Sanayi", city: "İzmir", contact_name: "", phone: "",
  email: "", employee_count: "", status: "Hedeflendi", priority: "Orta", notes: "",
};

export default function HedefHesaplar() {
  const [accounts, setAccounts] = useState<TargetAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState("Hepsi");
  const [filterPriority, setFilterPriority] = useState("Hepsi");
  const [search, setSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    const { data } = await supabase.from("target_accounts").select("*").order("created_at", { ascending: false });
    setAccounts(data || []); setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async () => {
    setSaving(true);
    if (editId) await supabase.from("target_accounts").update(form).eq("id", editId);
    else await supabase.from("target_accounts").insert([form]);
    setSaving(false); setShowForm(false); setEditId(null); setForm(emptyForm); fetchData();
  };

  const handleEdit = (a: TargetAccount) => {
    setForm({
      company_name: a.company_name, sector: a.sector || "Sanayi", city: a.city || "İzmir",
      contact_name: a.contact_name || "", phone: a.phone || "", email: a.email || "",
      employee_count: a.employee_count || "", status: a.status, priority: a.priority, notes: a.notes || "",
    });
    setEditId(a.id); setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Silinsin mi?")) return;
    await supabase.from("target_accounts").delete().eq("id", id); fetchData();
  };

  // CSV/Excel basit import (CSV varsayımı)
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split("\n").filter(Boolean);
      const rows = lines.slice(1).map(line => {
        const cols = line.split(",").map(c => c.trim().replace(/^"|"$/g, ""));
        return {
          company_name: cols[0] || "Bilinmiyor",
          sector: cols[1] || "Diğer",
          city: cols[2] || "İzmir",
          contact_name: cols[3] || "",
          phone: cols[4] || "",
          email: cols[5] || "",
          employee_count: cols[6] || "",
          status: "Hedeflendi" as const,
          priority: "Orta" as const,
          notes: cols[7] || "",
          source: "Excel Import",
        };
      }).filter(r => r.company_name && r.company_name !== "Bilinmiyor");

      if (rows.length > 0) {
        await supabase.from("target_accounts").insert(rows);
        alert(`${rows.length} firma içe aktarıldı!`);
        fetchData();
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const filtered = accounts.filter(a => {
    const matchStatus = filterStatus === "Hepsi" || a.status === filterStatus;
    const matchPriority = filterPriority === "Hepsi" || a.priority === filterPriority;
    const matchSearch = !search || a.company_name.toLowerCase().includes(search.toLowerCase()) ||
      (a.sector || "").toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchPriority && matchSearch;
  });

  const statusCounts = STATUSES.reduce((acc, s) => { acc[s] = accounts.filter(a => a.status === s).length; return acc; }, {} as Record<string, number>);

  return (
    <div style={{ padding: "24px 32px 40px" }}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="flex items-center gap-2" style={{ fontSize: 22, fontWeight: 700, color: "#1A1F2E" }}>🏢 Hedef Hesaplar</h1>
          <p style={{ color: "#6B7280", fontSize: 13, marginTop: 4 }}>B2B Outbound Pipeline · {accounts.length} firma · {accounts.filter(a => a.priority === "Yüksek").length} yüksek öncelik</p>
        </div>
        <div className="flex gap-3">
          <input ref={fileInputRef} type="file" accept=".csv" onChange={handleImport} style={{ display: "none" }} />
          <button onClick={() => fileInputRef.current?.click()}
            style={{ padding: "9px 16px", borderRadius: 8, backgroundColor: "#fff", color: "#1F3A5F", border: "1px solid #1F3A5F", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
            📥 CSV İmport
          </button>
          <button onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}
            style={{ padding: "9px 18px", borderRadius: 8, backgroundColor: "#1F3A5F", color: "#fff", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
            + Firma Ekle
          </button>
        </div>
      </div>

      {/* CSV format hint */}
      <div className="mb-4 px-4 py-3 rounded-lg" style={{ backgroundColor: "#EFF6FF", border: "1px solid #DBEAFE", fontSize: 12, color: "#1D4ED8" }}>
        💡 CSV formatı: <code style={{ backgroundColor: "#DBEAFE", padding: "1px 6px", borderRadius: 4 }}>Firma Adı, Sektör, Şehir, Kişi, Telefon, Email, Çalışan Sayısı, Not</code>
      </div>

      {/* Filtreler */}
      <div className="flex gap-3 mb-4 flex-wrap">
        {["Hepsi", ...STATUSES].map(s => {
          const count = s === "Hepsi" ? accounts.length : statusCounts[s] || 0;
          const isActive = filterStatus === s;
          return (
            <button key={s} onClick={() => setFilterStatus(s)}
              style={{ padding: "6px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: "pointer",
                border: isActive ? "none" : "1px solid #E5EAF0", backgroundColor: isActive ? "#1F3A5F" : "#fff", color: isActive ? "#fff" : "#6B7280" }}>
              {s} ({count})
            </button>
          );
        })}
      </div>

      <div className="flex gap-3 mb-4">
        {["Hepsi", ...PRIORITIES].map(p => {
          const isActive = filterPriority === p;
          return (
            <button key={p} onClick={() => setFilterPriority(p)}
              style={{ padding: "5px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: "pointer",
                border: isActive ? "none" : "1px solid #E5EAF0",
                backgroundColor: isActive ? (p === "Yüksek" ? "#EF4444" : p === "Orta" ? "#F59E0B" : p === "Düşük" ? "#10B981" : "#1F3A5F") : "#fff",
                color: isActive ? "#fff" : "#6B7280" }}>
              {p}
            </button>
          );
        })}
        <input type="text" placeholder="Firma veya sektör ara..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ padding: "6px 14px", borderRadius: 20, border: "1px solid #E5EAF0", fontSize: 12, outline: "none", marginLeft: "auto", minWidth: 200 }} />
      </div>

      {/* Tablo */}
      <div className="rounded-xl overflow-hidden" style={{ backgroundColor: "#fff", border: "1px solid #E5EAF0", boxShadow: "0 1px 2px rgba(15,23,42,0.04)" }}>
        {loading ? <div style={{ padding: 60, textAlign: "center", color: "#6B7280" }}>Yükleniyor...</div> : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#F7F9FC", borderBottom: "1px solid #E5EAF0" }}>
                {["Öncelik", "Firma", "Sektör", "Şehir", "Kişi / Telefon", "Durum", "İşlemler"].map(h => (
                  <th key={h} style={{ padding: "10px 14px", fontSize: 11, fontWeight: 700, color: "#6B7280", textAlign: "left", textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, i) => {
                const st = statusStyle[a.status] || { bg: "#F1F5F9", color: "#64748B" };
                const pr = priorityStyle[a.priority] || { color: "#6B7280" };
                return (
                  <tr key={a.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid #F1F5F9" : "none" }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = "#FAFBFC")}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = "transparent")}>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: pr.color }}>
                        {a.priority === "Yüksek" ? "▲" : a.priority === "Orta" ? "●" : "▼"} {a.priority}
                      </span>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: "#1A1F2E" }}>{a.company_name}</div>
                      {a.employee_count && <div style={{ fontSize: 11, color: "#94A3B8" }}>{a.employee_count} çalışan</div>}
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 12, color: "#6B7280" }}>{a.sector || "—"}</td>
                    <td style={{ padding: "12px 14px", fontSize: 12, color: "#6B7280" }}>{a.city || "—"}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ fontSize: 13, color: "#1A1F2E" }}>{a.contact_name || "—"}</div>
                      <div style={{ fontSize: 12, color: "#6B7280" }}>{a.phone || ""}</div>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{ padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 700, backgroundColor: st.bg, color: st.color }}>{a.status}</span>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(a)} style={{ padding: "4px 10px", fontSize: 11, fontWeight: 600, border: "1px solid #E5EAF0", borderRadius: 6, cursor: "pointer", backgroundColor: "#fff", color: "#1F3A5F" }}>Düzenle</button>
                        <button onClick={() => handleDelete(a.id)} style={{ padding: "4px 10px", fontSize: 11, fontWeight: 600, border: "1px solid #FEE2E2", borderRadius: 6, cursor: "pointer", backgroundColor: "#FEF2F2", color: "#EF4444" }}>Sil</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ padding: 60, textAlign: "center", color: "#6B7280" }}>Firma bulunamadı</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
          onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div className="rounded-2xl overflow-y-auto" style={{ backgroundColor: "#fff", width: "100%", maxWidth: 580, maxHeight: "90vh", padding: "28px 32px" }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1A1F2E", marginBottom: 20 }}>{editId ? "Firma Düzenle" : "Yeni Hedef Firma"}</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 6 }}>Firma Adı *</label>
                <input value={form.company_name} onChange={e => setForm({ ...form, company_name: e.target.value })}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #E5EAF0", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
              </div>
              <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 6 }}>Sektör</label>
                  <select value={form.sector} onChange={e => setForm({ ...form, sector: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #E5EAF0", fontSize: 13, outline: "none", backgroundColor: "#fff" }}>
                    {SECTORS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 6 }}>Şehir</label>
                  <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #E5EAF0", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 6 }}>Çalışan Sayısı</label>
                  <input value={form.employee_count} onChange={e => setForm({ ...form, employee_count: e.target.value })} placeholder="100+"
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #E5EAF0", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                </div>
              </div>
              <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
                {[["İletişim Kişisi", "contact_name"], ["Telefon", "phone"], ["E-posta", "email"]].map(([label, key]) => (
                  <div key={key}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 6 }}>{label}</label>
                    <input value={form[key as keyof typeof form]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #E5EAF0", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                  </div>
                ))}
              </div>
              <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 6 }}>Durum</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #E5EAF0", fontSize: 13, outline: "none", backgroundColor: "#fff" }}>
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 6 }}>Öncelik</label>
                  <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #E5EAF0", fontSize: 13, outline: "none", backgroundColor: "#fff" }}>
                    {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 6 }}>Notlar</label>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3}
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
