import { mockMorningReport } from "@/lib/data";

function StatRow({
  label,
  value,
  delta,
  deltaType,
  pill,
}: {
  label: string;
  value: string | number;
  delta?: string;
  deltaType?: "up" | "down" | "flat";
  pill?: { label: string; bg: string; color: string };
}) {
  const deltaColors = {
    up: { bg: "#D1FAE5", color: "#10B981" },
    down: { bg: "#FEE2E2", color: "#EF4444" },
    flat: { bg: "#F1F5F9", color: "#94A3B8" },
  };

  return (
    <div
      className="flex justify-between items-center py-2"
      style={{ borderBottom: "1px dashed #E5EAF0", fontSize: 13 }}
    >
      <span style={{ color: "#1A1F2E" }}>{label}</span>
      <span
        className="flex items-center gap-2"
        style={{ fontWeight: 700, color: "#1A1F2E" }}
      >
        {value}
        {delta && deltaType && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              padding: "1px 6px",
              borderRadius: 8,
              backgroundColor: deltaColors[deltaType].bg,
              color: deltaColors[deltaType].color,
            }}
          >
            {delta}
          </span>
        )}
        {pill && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: 10,
              backgroundColor: pill.bg,
              color: pill.color,
              textTransform: "uppercase",
            }}
          >
            {pill.label}
          </span>
        )}
      </span>
    </div>
  );
}

function SectionTitle({ emoji, label }: { emoji: string; label: string }) {
  return (
    <div
      className="flex items-center gap-2 mb-2"
      style={{
        fontSize: 12,
        fontWeight: 700,
        color: "#6B7280",
        textTransform: "uppercase",
        letterSpacing: 0.5,
      }}
    >
      <span style={{ fontSize: 14 }}>{emoji}</span>
      {label}
    </div>
  );
}

export default function MorningReport() {
  const r = mockMorningReport;

  return (
    <div
      className="rounded-xl"
      style={{
        backgroundColor: "#fff",
        border: "1px solid #E5EAF0",
        padding: "18px 20px",
        boxShadow:
          "0 1px 2px rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.06)",
      }}
    >
      {/* Header */}
      <div
        className="flex justify-between items-center mb-3 pb-3"
        style={{ borderBottom: "1px solid #E5EAF0" }}
      >
        <div
          className="flex items-center gap-2"
          style={{ fontSize: 14, fontWeight: 700, color: "#1A1F2E" }}
        >
          <span>🌅</span> Sabah Raporu — {r.date}
        </div>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            padding: "2px 8px",
            borderRadius: 10,
            backgroundColor: "#D1FAE5",
            color: "#10B981",
            textTransform: "uppercase",
          }}
        >
          06:00 · Otomatik
        </span>
      </div>

      {/* Web Trafiği */}
      <div className="mb-4">
        <SectionTitle emoji="📊" label="Web Trafiği (Dün)" />
        <StatRow
          label="Toplam ziyaret"
          value={r.traffic.total}
          delta={r.traffic.totalDelta}
          deltaType="up"
        />
        <StatRow
          label="kopiser.com.tr"
          value={r.traffic.kopiser}
          delta={r.traffic.kopiserDelta}
          deltaType="up"
        />
        <StatRow
          label="izmirfotokopi.net"
          value={r.traffic.izmir}
          delta={r.traffic.izmirDelta}
          deltaType="up"
        />
      </div>

      {/* Leadler */}
      <div className="mb-4">
        <SectionTitle emoji="📞" label="Yeni Leadler (Dün)" />
        <StatRow
          label="Toplam lead"
          value={r.leads.total}
          delta={r.leads.totalDelta}
          deltaType="up"
        />
        <StatRow
          label="Yüksek skor (70+)"
          value={r.leads.highScore}
          pill={{ label: "ACIL", bg: "#FEE2E2", color: "#EF4444" }}
        />
        <StatRow label="Kaynak: Meta reklam" value={r.leads.meta} />
        <StatRow label="Kaynak: Organik web" value={r.leads.organic} />
        <StatRow label="Kaynak: Instagram DM" value={r.leads.instagram} />
      </div>

      {/* Meta Reklam */}
      <div className="mb-4">
        <SectionTitle emoji="🎯" label="Meta Reklam (Dün)" />
        <StatRow label="Harcama" value={r.ads.spend} />
        <StatRow
          label="CPL (lead başı maliyet)"
          value={r.ads.cpl}
          delta="hedefin altı ✓"
          deltaType="up"
        />
        <StatRow
          label="CTR"
          value={r.ads.ctr}
          delta={r.ads.ctrDelta}
          deltaType="up"
        />
      </div>

      {/* Instagram */}
      <div>
        <SectionTitle emoji="📱" label="Instagram (Dün)" />
        <StatRow
          label="Yeni takipçi"
          value={`+${r.instagram.newFollowers}`}
          delta={r.instagram.followerDelta}
          deltaType="up"
        />
        <StatRow
          label="En iyi post etkileşim"
          value={r.instagram.bestPostEngagement}
          pill={{ label: "VİRAL", bg: "#D1FAE5", color: "#10B981" }}
        />
        <StatRow
          label="Story görüntülenme"
          value={r.instagram.storyViews}
          delta="~"
          deltaType="flat"
        />
      </div>
    </div>
  );
}
