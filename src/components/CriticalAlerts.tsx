"use client";

import { mockAlerts } from "@/lib/data";

const alertStyles = {
  critical: {
    bg: "#FEF2F2",
    border: "#EF4444",
  },
  warning: {
    bg: "#FFFBEB",
    border: "#F59E0B",
  },
  info: {
    bg: "#EFF6FF",
    border: "#3B82F6",
  },
};

export default function CriticalAlerts() {
  const criticalCount = mockAlerts.filter((a) => a.type === "critical").length;

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
          <span>⚠️</span> Kritik Uyarılar
        </div>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            padding: "2px 8px",
            borderRadius: 10,
            backgroundColor: "#FEE2E2",
            color: "#EF4444",
            textTransform: "uppercase",
          }}
        >
          {criticalCount} acil
        </span>
      </div>

      {mockAlerts.map((alert) => {
        const s = alertStyles[alert.type];
        return (
          <div
            key={alert.id}
            className="flex gap-3 rounded-lg mb-2"
            style={{
              padding: "12px",
              backgroundColor: s.bg,
              borderLeft: `3px solid ${s.border}`,
            }}
          >
            <div
              className="flex items-center justify-center rounded-full flex-shrink-0"
              style={{
                width: 24,
                height: 24,
                backgroundColor: "rgba(255,255,255,0.6)",
                fontSize: 14,
              }}
            >
              {alert.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#1A1F2E",
                  marginBottom: 2,
                }}
              >
                {alert.title}
              </div>
              <div
                style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.4 }}
              >
                {alert.body}
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#1F3A5F",
                  cursor: "pointer",
                  textTransform: "uppercase",
                  letterSpacing: 0.3,
                }}
              >
                {alert.action}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
