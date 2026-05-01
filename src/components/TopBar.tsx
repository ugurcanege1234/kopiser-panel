"use client";

export default function TopBar() {
  const now = new Date();
  const dateStr = now.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  });
  const weekNum = Math.ceil(
    (Math.floor(
      (now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 86400000
    ) +
      1) /
      7
  );

  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "#1A1F2E",
            marginBottom: 4,
          }}
        >
          Günaydın Uğurcan 👋
        </h1>
        <div style={{ fontSize: 13, color: "#6B7280" }}>
          {dateStr} · Hafta {weekNum} / 52
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          className="flex items-center justify-center rounded-lg border transition-colors"
          style={{
            width: 38,
            height: 38,
            backgroundColor: "#fff",
            borderColor: "#E5EAF0",
            fontSize: 16,
            cursor: "pointer",
          }}
          title="Bildirimler"
        >
          🔔
        </button>
        <button
          className="flex items-center justify-center rounded-lg border transition-colors"
          style={{
            width: 38,
            height: 38,
            backgroundColor: "#fff",
            borderColor: "#E5EAF0",
            fontSize: 16,
            cursor: "pointer",
          }}
          title="Ara"
        >
          🔍
        </button>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-semibold transition-colors"
          style={{
            backgroundColor: "#1F3A5F",
            fontSize: 13,
            border: "none",
            cursor: "pointer",
          }}
        >
          🤖 AI&apos;ya Komut Ver
        </button>
      </div>
    </div>
  );
}
