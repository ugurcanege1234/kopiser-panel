"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type ContentItem = {
  id: string;
  created_at: string;
  title: string;
  platform: string;
  status: string;
  scheduled_at: string | null;
  content_text: string | null;
  notes: string | null;
  assigned_to: string | null;
  image_url: string | null;
};

const PLATFORMS = ["Instagram", "TikTok", "Blog", "Facebook", "LinkedIn", "Diğer"];
const STATUSES = ["Taslak", "Onay Bekliyor", "Yayına Hazır", "Yayında", "İptal"];

const platformEmoji: Record<string, string> = {
  Instagram: "📷", TikTok: "🎵", Blog: "📝", Facebook: "👥", LinkedIn: "💼", Diğer: "🌐",
};

const statusStyle: Record<string, { bg: string; color: string }> = {
  Taslak: { bg: "#F1F5F9", color: "#64748B" },
  "Onay Bekliyor": { bg: "#FEF3C7", color: "#D97706" },
  "Yayına Hazır": { bg: "#D1FAE5", color: "#059669" },
  Yayında: { bg: "#DBEAFE", color: "#1D4ED8" },
  İptal: { bg: "#FEE2E2", color: "#DC2626" },
};

const emptyForm = { title: "", platform: "Instagram", status: "Taslak", scheduled_at: "", content_text: "", notes: "" };

export default function Icerik() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState("Hepsi");
  const [generatingBlog, setGeneratingBlog] = useState(false);
  const [blogResult, setBlogResult] = useState<string | null>(null);
  const [generatingImageId, setGeneratingImageId] = useState<string | null>(null);

  const fetch = async () => {
    const { data } = await supabase.from("content_items").select("*").order("scheduled_at", { ascending: true });
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const handleSubmit = async () => {
    setSaving(true);
    const payload = { ...form, scheduled_at: form.scheduled_at || null };
    if (editId) await supabase.from("content_items").update(payload).eq("id", editId);
    else await supabase.from("content_items").insert([payload]);
    setSaving(false); setShowForm(false); setEditId(null); setForm(emptyForm); fetch();
  };

  const handleEdit = (item: ContentItem) => {
    setForm({
      title: item.title, platform: item.platform, status: item.status,
      scheduled_at: item.scheduled_at ? item.scheduled_at.slice(0, 16) : "",
      content_text: item.content_text || "", notes: item.notes || "",
    });
    setEditId(item.id); setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Silinsin mi?")) return;
    await supabase.from("content_items").delete().eq("id", id); fetch();
  };

  const handleGenerateBlog = async () => {
    setGeneratingBlog(true);
    setBlogResult(null);
    try {
      const res = await window.fetch("/api/blog/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const text = await res.text();
      let json: { ok?: boolean; results?: { success: boolean }[]; error?: string };
      try { json = JSON.parse(text); } catch { json = { error: `Sunucu yanıtı: ${text.slice(0, 200)}` }; }
      if (json.ok && json.results) {
        const succeeded = json.results.filter(r => r.success).length;
        setBlogResult(`✓ ${succeeded}/${json.results.length} blog yazısı oluşturuldu ve takvime eklendi`);
        fetch();
      } else {
        setBlogResult(`Hata: ${json.error || `HTTP ${res.status}`}`);
      }
    } catch (err) {
      setBlogResult(`Hata: ${String(err)}`);
    }
    setGeneratingBlog(false);
  };

  const handleGenerateImage = async (item: ContentItem) => {
    setGeneratingImageId(item.id);
    try {
      const res = await window.fetch("/api/blog/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, title: item.title, platform: item.platform }),
      });
      const data = await res.json();
      if (data.ok) fetch();
    } catch { /* sessizce geç */ }
    setGeneratingImageId(null);
  };

  const filtered = filterStatus === "Hepsi" ? items : items.filter(i => i.status === filterStatus);

  return (
    <div style={{ padding: "24px 32px 40px" }}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="flex items-center gap-2" style={{ fontSize: 22, fontWeight: 700, color: "#1A1F2E" }}>
            📅 İçerik Takvimi
          </h1>
          <p style={{ color: "#6B7280", fontSize: 13, marginTop: 4 }}>
            {items.length} içerik · {items.filter(i => i.status === "Yayına Hazır").length} yayına hazır
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleGenerateBlog} disabled={generatingBlog}
            style={{ padding: "9px 18px", borderRadius: 8, backgroundColor: "#10B981", color: "#fff", border: "none", cursor: generatingBlog ? "wait" : "pointer", fontSize: 13, fontWeight: 600, opacity: generatingBlog ? 0.7 : 1 }}>
            {generatingBlog ? "⏳ Üretiliyor..." : "🤖 AI İçerik Üret (Blog + Sosyal)"}
          </button>
          <button onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}
            style={{ padding: "9px 18px", borderRadius: 8, backgroundColor: "#1F3A5F", color: "#fff", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
            + Yeni İçerik
          </button>
        </div>
      </div>

      {blogResult && (
        <div style={{ padding: "10px 16px", backgroundColor: blogResult.startsWith("✓") ? "#D1FAE5" : "#FEE2E2",
          border: `1px solid ${blogResult.startsWith("✓") ? "#6EE7B7" : "#FCA5A5"}`,
          borderRadius: 8, color: blogResult.startsWith("✓") ? "#059669" : "#DC2626", fontSize: 13, marginBottom: 16 }}>
          {blogResult}
        </div>
      )}

      {/* Filtre */}
      <div className="flex gap-3 mb-5 flex-wrap">
        {["Hepsi", ...STATUSES].map(s => {
          const count = s === "Hepsi" ? items.length : items.filter(i => i.status === s).length;
          const isActive = filterStatus === s;
          return (
            <button key={s} onClick={() => setFilterStatus(s)}
              style={{ padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer",
                border: isActive ? "none" : "1px solid #E5EAF0", backgroundColor: isActive ? "#1F3A5F" : "#fff", color: isActive ? "#fff" : "#6B7280" }}>
              {s} ({count})
            </button>
          );
        })}
      </div>

      {/* Kartlar */}
      {loading ? (
        <p style={{ color: "#6B7280" }}>Yükleniyor...</p>
      ) : (
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
          {filtered.map(item => {
            const st = statusStyle[item.status] || { bg: "#F1F5F9", color: "#64748B" };
            return (
              <div key={item.id} className="rounded-xl flex flex-col justify-between"
                style={{ backgroundColor: "#fff", border: "1px solid #E5EAF0", overflow: "hidden",
                  boxShadow: "0 1px 2px rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.06)", minHeight: 160 }}>
                {item.image_url && (
                  <div style={{ width: "100%", height: 160, overflow: "hidden", backgroundColor: "#F7F9FC" }}>
                    <img src={item.image_url} alt={item.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                )}
                <div style={{ padding: "16px 18px", flex: 1 }}>
                  <div className="flex justify-between items-start mb-2">
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#C8102E", textTransform: "uppercase", letterSpacing: 0.5 }}>
                      {platformEmoji[item.platform]} {item.platform}
                    </span>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 10, backgroundColor: st.bg, color: st.color }}>
                      {item.status}
                    </span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#1A1F2E", marginBottom: 8, lineHeight: 1.3 }}>
                    {item.title}
                  </div>
                  {item.content_text && (
                    <div style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.4, marginBottom: 8 }}>
                      {item.content_text.slice(0, 80)}{item.content_text.length > 80 ? "..." : ""}
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-center mt-3 pt-3" style={{ borderTop: "1px solid #F1F5F9", padding: "0 18px 16px" }}>
                  <span style={{ fontSize: 11, color: "#6B7280" }}>
                    {item.scheduled_at ? new Date(item.scheduled_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "Tarih yok"}
                  </span>
                  <div className="flex gap-2">
                    {!item.image_url && (
                      <button
                        onClick={() => handleGenerateImage(item)}
                        disabled={generatingImageId === item.id}
                        title="Gemini ile görsel üret"
                        style={{ padding: "3px 10px", fontSize: 11, fontWeight: 600, border: "none", borderRadius: 6, cursor: generatingImageId === item.id ? "wait" : "pointer", backgroundColor: "#7C3AED", color: "#fff", opacity: generatingImageId === item.id ? 0.6 : 1 }}>
                        {generatingImageId === item.id ? "⏳" : "🎨"}
                      </button>
                    )}
                    <button onClick={() => handleEdit(item)}
                      style={{ padding: "3px 10px", fontSize: 11, fontWeight: 600, border: "1px solid #E5EAF0", borderRadius: 6, cursor: "pointer", backgroundColor: "#fff", color: "#1F3A5F" }}>
                      Düzenle
                    </button>
                    <button onClick={() => handleDelete(item.id)}
                      style={{ padding: "3px 10px", fontSize: 11, fontWeight: 600, border: "1px solid #FEE2E2", borderRadius: 6, cursor: "pointer", backgroundColor: "#FEF2F2", color: "#EF4444" }}>
                      Sil
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ gridColumn: "1 / -1", padding: 60, textAlign: "center", color: "#6B7280" }}>İçerik bulunamadı</div>
          )}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
          onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div className="rounded-2xl overflow-y-auto" style={{ backgroundColor: "#fff", width: "100%", maxWidth: 520, maxHeight: "90vh", padding: "28px 32px" }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1A1F2E", marginBottom: 20 }}>
              {editId ? "İçerik Düzenle" : "Yeni İçerik Ekle"}
            </h2>
            <div className="flex flex-col gap-4">
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 6 }}>Başlık</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #E5EAF0", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
              </div>
              <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 6 }}>Platform</label>
                  <select value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #E5EAF0", fontSize: 13, outline: "none", backgroundColor: "#fff" }}>
                    {PLATFORMS.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 6 }}>Durum</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #E5EAF0", fontSize: 13, outline: "none", backgroundColor: "#fff" }}>
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 6 }}>Yayın Tarihi/Saati</label>
                <input type="datetime-local" value={form.scheduled_at} onChange={e => setForm({ ...form, scheduled_at: e.target.value })}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #E5EAF0", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 6 }}>İçerik Metni</label>
                <textarea value={form.content_text} onChange={e => setForm({ ...form, content_text: e.target.value })} rows={4}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #E5EAF0", fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 6 }}>Not</label>
                <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #E5EAF0", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowForm(false)}
                style={{ padding: "9px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, border: "1px solid #E5EAF0", backgroundColor: "#fff", cursor: "pointer", color: "#6B7280" }}>
                İptal
              </button>
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
