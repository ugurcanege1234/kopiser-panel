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

function ContentDetailModal({
  item,
  onClose,
  onDelete,
  onUpdate,
  onGenerateImage,
  generatingImage,
  imageError,
}: {
  item: ContentItem;
  onClose: () => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: Partial<ContentItem>) => void;
  onGenerateImage: (item: ContentItem) => void;
  generatingImage: boolean;
  imageError: string | null;
}) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(item.content_text || "");
  const [editStatus, setEditStatus] = useState(item.status);
  const [saving, setSaving] = useState(false);
  const st = statusStyle[item.status] || { bg: "#F1F5F9", color: "#64748B" };

  const handleSave = async () => {
    setSaving(true);
    await onUpdate(item.id, { content_text: editText, status: editStatus });
    setSaving(false);
    setEditing(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(item.content_text || "");
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="rounded-2xl overflow-hidden flex"
        style={{ backgroundColor: "#fff", width: "100%", maxWidth: 860, maxHeight: "90vh", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>

        {/* Sol: Görsel */}
        <div style={{ width: 340, flexShrink: 0, backgroundColor: "#F7F9FC", display: "flex", flexDirection: "column" }}>
          {item.image_url ? (
            <img src={item.image_url} alt={item.title}
              style={{ width: "100%", height: 280, objectFit: "cover" }} />
          ) : (
            <div className="flex flex-col items-center justify-center" style={{ height: 280, gap: 12 }}>
              <div style={{ fontSize: 40 }}>🖼️</div>
              <p style={{ fontSize: 12, color: "#9CA3AF", textAlign: "center", padding: "0 20px" }}>
                Bu içerik için henüz görsel yok
              </p>
              <button
                onClick={() => onGenerateImage(item)}
                disabled={generatingImage}
                style={{ padding: "8px 20px", borderRadius: 8, backgroundColor: "#7C3AED", color: "#fff", border: "none", cursor: generatingImage ? "wait" : "pointer", fontSize: 12, fontWeight: 600, opacity: generatingImage ? 0.6 : 1 }}>
                {generatingImage ? "⏳ Üretiliyor..." : "🎨 Higgsfield ile Görsel Üret"}
              </button>
            </div>
          )}
          {item.image_url && (
            <div style={{ padding: "12px 16px", borderTop: "1px solid #E5EAF0" }}>
              <button
                onClick={() => onGenerateImage(item)}
                disabled={generatingImage}
                style={{ width: "100%", padding: "7px", borderRadius: 8, backgroundColor: "#7C3AED", color: "#fff", border: "none", cursor: generatingImage ? "wait" : "pointer", fontSize: 12, fontWeight: 600, opacity: generatingImage ? 0.6 : 1 }}>
                {generatingImage ? "⏳ Yenileniyor..." : "🎨 Higgsfield ile Yenile"}
              </button>
            </div>
          )}
          {imageError && (
            <div style={{ margin: "8px 12px", padding: "8px 12px", backgroundColor: "#FEF2F2", borderRadius: 6, fontSize: 11, color: "#DC2626", lineHeight: 1.4 }}>
              ⚠️ {imageError}
            </div>
          )}
          {/* Meta bilgiler */}
          <div style={{ padding: "16px", flex: 1 }}>
            <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 700 }}>Detaylar</div>
            <div style={{ fontSize: 12, color: "#6B7280", lineHeight: 2 }}>
              <div><strong style={{ color: "#1A1F2E" }}>Platform:</strong> {platformEmoji[item.platform]} {item.platform}</div>
              <div><strong style={{ color: "#1A1F2E" }}>Tarih:</strong> {item.scheduled_at ? new Date(item.scheduled_at).toLocaleDateString("tr-TR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }) : "—"}</div>
              <div><strong style={{ color: "#1A1F2E" }}>Atanan:</strong> {item.assigned_to || "—"}</div>
              {item.notes && <div style={{ marginTop: 8, padding: "8px 10px", backgroundColor: "#F7F9FC", borderRadius: 6, fontSize: 11, lineHeight: 1.5 }}>{item.notes}</div>}
            </div>
          </div>
        </div>

        {/* Sağ: İçerik */}
        <div className="flex flex-col" style={{ flex: 1, overflow: "hidden" }}>
          {/* Header */}
          <div className="flex justify-between items-start" style={{ padding: "20px 24px 16px", borderBottom: "1px solid #E5EAF0" }}>
            <div style={{ flex: 1, marginRight: 16 }}>
              <div className="flex items-center gap-2 mb-1">
                <span style={{ fontSize: 11, fontWeight: 700, color: "#C8102E", textTransform: "uppercase", letterSpacing: 0.5 }}>
                  {platformEmoji[item.platform]} {item.platform}
                </span>
                {editing ? (
                  <select value={editStatus} onChange={e => setEditStatus(e.target.value)}
                    style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 10, border: "1px solid #E5EAF0", outline: "none", backgroundColor: "#fff" }}>
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                ) : (
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 10, backgroundColor: st.bg, color: st.color }}>
                    {item.status}
                  </span>
                )}
              </div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1A1F2E", lineHeight: 1.3 }}>{item.title}</h2>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#9CA3AF", lineHeight: 1, flexShrink: 0 }}>×</button>
          </div>

          {/* İçerik metni */}
          <div style={{ flex: 1, overflow: "auto", padding: "16px 24px" }}>
            {editing ? (
              <textarea value={editText} onChange={e => setEditText(e.target.value)}
                style={{ width: "100%", height: "100%", minHeight: 300, padding: "12px", borderRadius: 8, border: "1px solid #E5EAF0", fontSize: 13, lineHeight: 1.7, outline: "none", resize: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
            ) : (
              <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                {item.content_text || <span style={{ color: "#9CA3AF" }}>İçerik yok</span>}
              </div>
            )}
          </div>

          {/* Footer butonlar */}
          <div className="flex justify-between items-center" style={{ padding: "14px 24px", borderTop: "1px solid #E5EAF0", backgroundColor: "#FAFBFC" }}>
            <div className="flex gap-2">
              {!editing && (
                <button onClick={handleCopy}
                  style={{ padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "1px solid #E5EAF0", backgroundColor: "#fff", cursor: "pointer", color: "#6B7280" }}>
                  📋 Kopyala
                </button>
              )}
              {editing ? (
                <>
                  <button onClick={() => setEditing(false)}
                    style={{ padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "1px solid #E5EAF0", backgroundColor: "#fff", cursor: "pointer", color: "#6B7280" }}>
                    İptal
                  </button>
                  <button onClick={handleSave} disabled={saving}
                    style={{ padding: "7px 16px", borderRadius: 8, fontSize: 12, fontWeight: 700, backgroundColor: "#1F3A5F", color: "#fff", border: "none", cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
                    {saving ? "Kaydediliyor..." : "Kaydet"}
                  </button>
                </>
              ) : (
                <button onClick={() => setEditing(true)}
                  style={{ padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "1px solid #E5EAF0", backgroundColor: "#fff", cursor: "pointer", color: "#1F3A5F" }}>
                  ✏️ Düzenle
                </button>
              )}
            </div>
            <button onClick={() => { if (confirm("Silinsin mi?")) { onDelete(item.id); onClose(); } }}
              style={{ padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "1px solid #FEE2E2", backgroundColor: "#FEF2F2", cursor: "pointer", color: "#EF4444" }}>
              Sil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Icerik() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState("Hepsi");
  const [generatingBlog, setGeneratingBlog] = useState(false);
  const [blogResult, setBlogResult] = useState<string | null>(null);
  const [generatingImageId, setGeneratingImageId] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);

  const fetchItems = async () => {
    const { data } = await supabase.from("content_items").select("*").order("scheduled_at", { ascending: true });
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const handleSubmit = async () => {
    setSaving(true);
    const payload = { ...form, scheduled_at: form.scheduled_at || null };
    await supabase.from("content_items").insert([payload]);
    setSaving(false); setShowForm(false); setForm(emptyForm); fetchItems();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("content_items").delete().eq("id", id);
    fetchItems();
  };

  const handleUpdate = async (id: string, data: Partial<ContentItem>) => {
    await supabase.from("content_items").update(data).eq("id", id);
    fetchItems();
    if (selectedItem?.id === id) setSelectedItem(prev => prev ? { ...prev, ...data } : null);
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
        setBlogResult(`✓ ${succeeded}/${json.results.length} içerik oluşturuldu`);
        fetchItems();
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
    setImageError(null);
    try {
      const res = await window.fetch("/api/blog/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, title: item.title, platform: item.platform }),
      });
      const data = await res.json();
      if (data.ok) {
        fetchItems();
        if (selectedItem?.id === item.id) setSelectedItem(prev => prev ? { ...prev, image_url: data.imageUrl } : null);
      } else {
        setImageError(data.error || "Bilinmeyen hata");
      }
    } catch (err) {
      setImageError(String(err));
    }
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
            {generatingBlog ? "⏳ Üretiliyor..." : "🤖 AI İçerik Üret"}
          </button>
          <button onClick={() => { setShowForm(true); setForm(emptyForm); }}
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
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
          {filtered.map(item => {
            const st = statusStyle[item.status] || { bg: "#F1F5F9", color: "#64748B" };
            return (
              <div key={item.id}
                onClick={() => setSelectedItem(item)}
                className="rounded-xl flex flex-col cursor-pointer"
                style={{ backgroundColor: "#fff", border: "1px solid #E5EAF0", overflow: "hidden",
                  boxShadow: "0 1px 2px rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.06)", transition: "box-shadow 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 4px 20px rgba(15,23,42,0.12)")}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 1px 2px rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.06)")}>
                {/* Görsel */}
                {item.image_url ? (
                  <div style={{ width: "100%", height: 150, overflow: "hidden", backgroundColor: "#F7F9FC" }}>
                    <img src={item.image_url} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ) : (
                  <div className="flex items-center justify-center" style={{ height: 80, backgroundColor: "#F7F9FC" }}>
                    <span style={{ fontSize: 28, opacity: 0.4 }}>{platformEmoji[item.platform] || "🌐"}</span>
                  </div>
                )}
                {/* İçerik */}
                <div style={{ padding: "14px 16px", flex: 1 }}>
                  <div className="flex justify-between items-center mb-2">
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#C8102E", textTransform: "uppercase", letterSpacing: 0.5 }}>
                      {platformEmoji[item.platform]} {item.platform}
                    </span>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 10, backgroundColor: st.bg, color: st.color }}>
                      {item.status}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1A1F2E", lineHeight: 1.3, marginBottom: 6 }}>
                    {item.title}
                  </div>
                  {item.content_text && (
                    <div style={{ fontSize: 11, color: "#9CA3AF", lineHeight: 1.4 }}>
                      {item.content_text.slice(0, 65)}{item.content_text.length > 65 ? "..." : ""}
                    </div>
                  )}
                </div>
                {/* Alt: tarih + hızlı butonlar */}
                <div className="flex justify-between items-center"
                  style={{ padding: "8px 12px 10px", borderTop: "1px solid #F1F5F9" }}
                  onClick={e => e.stopPropagation()}>
                  <span style={{ fontSize: 11, color: "#9CA3AF" }}>
                    {item.scheduled_at ? new Date(item.scheduled_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short" }) : "Tarih yok"}
                  </span>
                  <div className="flex gap-1">
                    {item.status !== "Yayında" && (
                      <button
                        onClick={() => handleUpdate(item.id, { status: "Yayında" })}
                        title="Yayınlandı olarak işaretle"
                        style={{ padding: "4px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600, border: "1px solid #BBF7D0", backgroundColor: "#ECFDF5", color: "#059669", cursor: "pointer" }}>
                        ✓ Yayınlandı
                      </button>
                    )}
                    {item.status === "Yayında" && (
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#059669" }}>✓ Yayında</span>
                    )}
                    <button
                      onClick={() => { if (confirm("Silinsin mi?")) handleDelete(item.id); }}
                      title="Sil"
                      style={{ padding: "4px 7px", borderRadius: 6, fontSize: 13, border: "1px solid #FEE2E2", backgroundColor: "#FEF2F2", color: "#EF4444", cursor: "pointer" }}>
                      🗑️
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

      {/* Detail Modal */}
      {selectedItem && (
        <ContentDetailModal
          item={selectedItem}
          onClose={() => { setSelectedItem(null); setImageError(null); }}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
          onGenerateImage={handleGenerateImage}
          generatingImage={generatingImageId === selectedItem.id}
          imageError={generatingImageId === selectedItem.id ? null : imageError}
        />
      )}

      {/* Yeni İçerik Modal */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
          onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div className="rounded-2xl overflow-y-auto" style={{ backgroundColor: "#fff", width: "100%", maxWidth: 520, maxHeight: "90vh", padding: "28px 32px" }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1A1F2E", marginBottom: 20 }}>Yeni İçerik Ekle</h2>
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
                {saving ? "Kaydediliyor..." : "Ekle"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
