"use client";

import { mockTasks } from "@/lib/data";

const priorityLabels = {
  critical: { label: "KRİTİK", bg: "#FEE2E2", color: "#EF4444" },
  planned: { label: "PLANLI", bg: "#DBEAFE", color: "#3B82F6" },
  optional: { label: "KEŞKE YAPSA", bg: "#F1F5F9", color: "#94A3B8" },
};

export default function TaskList() {
  const byPriority = {
    critical: mockTasks.filter((t) => t.priority === "critical"),
    planned: mockTasks.filter((t) => t.priority === "planned"),
    optional: mockTasks.filter((t) => t.priority === "optional"),
  };

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
      {/* Header */}
      <div
        className="flex justify-between items-center mb-3 pb-3"
        style={{ borderBottom: "1px solid #E5EAF0" }}
      >
        <div
          className="flex items-center gap-2"
          style={{ fontSize: 14, fontWeight: 700, color: "#1A1F2E" }}
        >
          <span>✅</span> Bugün Yapılacaklar
        </div>
        <span
          style={{ fontSize: 12, color: "#6B7280", cursor: "pointer" }}
        >
          Hepsi →
        </span>
      </div>

      {(Object.keys(byPriority) as Array<keyof typeof byPriority>).map(
        (priority) => {
          const group = byPriority[priority];
          if (!group.length) return null;
          const p = priorityLabels[priority];
          return (
            <div key={priority}>
              <div className="mb-2 mt-3">
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 10,
                    backgroundColor: p.bg,
                    color: p.color,
                    textTransform: "uppercase",
                    letterSpacing: 0.3,
                  }}
                >
                  {p.label}
                </span>
              </div>
              {group.map((task) => (
                <div
                  key={task.id}
                  className="flex gap-3 rounded-lg mb-1 cursor-pointer transition-colors"
                  style={{ padding: "10px" }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.backgroundColor =
                      "#F7F9FC")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.backgroundColor =
                      "transparent")
                  }
                >
                  <div
                    className="flex-shrink-0 mt-0.5 rounded"
                    style={{
                      width: 16,
                      height: 16,
                      border: "2px solid #E5EAF0",
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#1A1F2E",
                        marginBottom: 2,
                      }}
                    >
                      {task.title}
                    </div>
                    <div style={{ fontSize: 11, color: "#6B7280" }}>
                      {task.meta}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        }
      )}
    </div>
  );
}
