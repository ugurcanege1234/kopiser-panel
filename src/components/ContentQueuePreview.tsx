"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const platformEmoji: Record<string, string> = {
  Blog: "📝",
  Instagram: "📷",
  Facebook: "👍",
  TikTok: "🎵",
};

const statusStyles: Record<string, { label: string; bg: string; color: string }> = {
  "Yayına Hazır": { label: "Hazır", bg: "#D1FAE5", color: "#10B981" },
  "Taslak": { label: "Taslak", bg: "#F1F5F9", color: "#94A3B8" },
  "Yayında": { label: "Yayında", bg: "#DBEAFE", color: "#1D4ED8" },
};

type ContentItem = {
  id: string;
  title: string;
  platform: string;
  status: string;
  scheduled_at: string | null;
};

export default function ContentQueuePreview() {
  const router = useRouter();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("content_items")
      .select("id, title, platform, status, scheduled_at")
      .order("scheduled_at", { ascending: true })
      .limit(8)
      .then(({ data }) => {
        setItems(data || []);
        setLoading(false);
      });
  }, []);

  const formatDate = (iso: string | null) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="rounded-xl"
      style={{ backgroundColor: "#fff", border: "1px solid #E5EAF0", padding: "18px 20px", boxShadow: "0 1px 2px rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.06)" }}>
      <div className="flex justify-between items-center mb-4 pb-3" style={{ borderBottom: "1px solid #E5EAF0" }}>
        <div className="flex items-center gap-2" style={{ fontSize: 14, fontWeight: 700, color: "#1A1F2E" }}>
          <span>📅</span> İçerik Kuyruğu
          {!loading && <span style={{ fontSize: 12, fontWeight: 400, color: "#6B7280" }}>({items.length} içerik)</span>}
        </div>
        <button onClick={() => router.push("/icerik")}
          style={{ fontSize: 12, color: "#1F3A5F", cursor: "pointer", background: "none", border: "none", fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 2 }}>
          Tümünü Gör →
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "24px 0", color: "#6B7280", fontSize: 13 }}>Yükleniyor...</div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: "center", padding: "24px 0", color: "#6B7280", fontSize: 13 }}>
          Henüz içerik yok —{" "}
          <button onClick={() => router.push("/icerik")} style={{ color: "#1F3A5F", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>
            İçerik oluştur
          </button>
        </div>
      ) : (
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
          {items.slice(0, 8).map((item) => {
            const s = statusStyles[item.status] || { label: item.status, bg: "#F1F5F9", color: "#94A3B8" };
            const emoji = platformEmoji[item.platform] || "📄";
            return (
              <div key={item.id}
                className="rounded-lg flex flex-col justify-between cursor-pointer"
                onClick={() => router.push("/icerik")}
                style={{ backgroundColor: "#F7F9FC", border: "1px solid #E5EAF0", padding: "12px", minHeight: 110 }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "#EEF2F7")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "#F7F9FC")}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#C8102E", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
                    {emoji} {item.platform}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#1A1F2E", lineHeight: 1.3, marginBottom: 8 }}>
                    {item.title.length > 60 ? item.title.slice(0, 57) + "…" : item.title}
                  </div>
                </div>
                <div className="flex justify-between items-center" style={{ fontSize: 11, color: "#6B7280" }}>
                  <span>{formatDate(item.scheduled_at)}</span>
                  <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 8, backgroundColor: s.bg, color: s.color, textTransform: "uppercase" }}>
                    {s.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
