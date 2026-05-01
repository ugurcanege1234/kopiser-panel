import { mockKpis } from "@/lib/data";

export default function KpiBand() {
  return (
    <div
      className="grid gap-4 mb-6"
      style={{ gridTemplateColumns: "repeat(4, 1fr)" }}
    >
      {mockKpis.map((kpi) => (
        <div
          key={kpi.id}
          className="rounded-xl relative overflow-hidden"
          style={{
            backgroundColor: "#fff",
            border: "1px solid #E5EAF0",
            padding: "18px 20px",
            boxShadow:
              "0 1px 2px rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.06)",
          }}
        >
          {/* Color bar */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 4,
              height: "100%",
              backgroundColor: kpi.color,
            }}
          />
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#6B7280",
              textTransform: "uppercase",
              letterSpacing: 0.5,
              marginBottom: 6,
            }}
          >
            {kpi.label}
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: "#1A1F2E",
              lineHeight: 1.1,
              letterSpacing: -0.5,
            }}
          >
            {kpi.value}
          </div>
          <div
            className="flex items-center gap-2 mt-2"
            style={{ fontSize: 12, color: "#6B7280" }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: "1px 6px",
                borderRadius: 8,
                backgroundColor: "#D1FAE5",
                color: "#10B981",
              }}
            >
              {kpi.delta}
            </span>
            {kpi.sub}
          </div>
        </div>
      ))}
    </div>
  );
}
