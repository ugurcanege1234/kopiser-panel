"use client";

import { useRouter } from "next/navigation";
import { mockContentQueue } from "@/lib/data";

const statusStyles = {
  ready: { label: "Yayına Hazır", bg: "#D1FAE5", color: "#10B981" },
  pending: { label: "Onay Bekliyor", bg: "#FEF3C7", color: "#F59E0B" },
  draft: { label: "Taslak", bg: "#F1F5F9", color: "#94A3B8" },
};

export default function ContentQueuePreview() {
  const router = useRouter();

  return (
    <div
      className="rounded-xl"
      style={{
        backgroundColor: "#fff",
        border: "1px solid #E5EAF0",
        padding: "18px 20px",
        boxShadow: "0 1px 2px rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.06)",
      }}
    >
      <div
        className="flex justify-between items-center mb-4 pb-3"
        style={{ borderBottom: "1px solid #E5EAF0" }}
      >
        <div className="flex items-center gap-2" style={{ fontSize: 14, fontWeight: 700, color: "#1A1F2E" }}>
          <span>📅</span> Bu Hafta İçerik Kuyruğu
        </div>
        <button
          onClick={() => router.push("/icerik")}
          style={{ fontSize: 12, color: "#1F3A5F", cursor: "pointer", background: "none", border: "none", fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 2 }}
        >
          Tam Takvim →
        </button>
      </div>

      <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        {mockContentQueue.map((item) => {
          const s = statusStyles[item.status];
          return (
            <div
              key={item.id}
              className="rounded-lg flex flex-col justify-between cursor-pointer"
              onClick={() => router.push("/icerik")}
              style={{ backgroundColor: "#F7F9FC", border: "1px solid #E5EAF0", padding: "12px", minHeight: 110 }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "#EEF2F7")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "#F7F9FC")}
            >
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#C8102E", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
                  {item.platform}
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#1A1F2E", lineHeight: 1.3, marginBottom: 8 }}>
                  {item.title}
                </div>
              </div>
              <div className="flex justify-between items-center" style={{ fontSize: 11, color: "#6B7280" }}>
                <span>{item.time}</span>
                <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 8, backgroundColor: s.bg, color: s.color, textTransform: "uppercase" }}>
                  {s.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
