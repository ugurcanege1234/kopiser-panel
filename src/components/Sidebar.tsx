"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", icon: "🏠", label: "Ana Pano", badge: null },
  { href: "/lead-havuzu", icon: "📞", label: "Lead Havuzu", badge: 5 },
  { href: "/icerik", icon: "📅", label: "İçerik Takvimi", badge: 12 },
  { href: "/reklam", icon: "🎯", label: "Reklam Yönetimi", badge: null },
  { href: "/seo", icon: "📈", label: "SEO & Web", badge: null },
  { href: "/analitik", icon: "📊", label: "Analitik & Rapor", badge: null },
  { href: "/hedef-hesaplar", icon: "🏢", label: "Hedef Hesaplar", badge: null },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="flex flex-col h-screen sticky top-0 overflow-y-auto"
      style={{ width: 240, backgroundColor: "#15293F", color: "#fff" }}
    >
      {/* Logo */}
      <div
        className="px-6 py-5"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>
          KOPI<span style={{ color: "#C8102E" }}>SER</span>
        </div>
        <div
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.5)",
            marginTop: 4,
            fontWeight: 500,
            letterSpacing: 0.5,
            textTransform: "uppercase",
          }}
        >
          Komuta Merkezi
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3">
        <div
          className="px-6 py-2 mb-1"
          style={{
            fontSize: 10,
            color: "rgba(255,255,255,0.4)",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          Ana Sayfalar
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-6 py-2.5 transition-all"
              style={{
                color: isActive ? "#fff" : "rgba(255,255,255,0.75)",
                backgroundColor: isActive
                  ? "rgba(200,16,46,0.12)"
                  : "transparent",
                borderLeft: isActive
                  ? "3px solid #C8102E"
                  : "3px solid transparent",
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                textDecoration: "none",
              }}
            >
              <span style={{ fontSize: 15, width: 20, textAlign: "center" }}>
                {item.icon}
              </span>
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span
                  style={{
                    backgroundColor: "#C8102E",
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "2px 7px",
                    borderRadius: 10,
                  }}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        <div
          className="px-6 py-2 mt-4 mb-1"
          style={{
            fontSize: 10,
            color: "rgba(255,255,255,0.4)",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          Hızlı Erişim
        </div>
        {[
          { icon: "🤖", label: "AI Komut Ver" },
          { icon: "⚙️", label: "Ayarlar" },
        ].map((item) => (
          <button
            key={item.label}
            className="flex items-center gap-3 px-6 py-2.5 w-full text-left transition-all"
            style={{
              color: "rgba(255,255,255,0.75)",
              fontSize: 13,
              background: "none",
              border: "none",
              borderLeft: "3px solid transparent",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor =
                "rgba(255,255,255,0.05)";
              (e.currentTarget as HTMLElement).style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor =
                "transparent";
              (e.currentTarget as HTMLElement).style.color =
                "rgba(255,255,255,0.75)";
            }}
          >
            <span style={{ fontSize: 15, width: 20, textAlign: "center" }}>
              {item.icon}
            </span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* User */}
      <div
        className="px-4 py-4"
        style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div
          className="flex items-center gap-3 p-2 rounded-lg"
          style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
        >
          <div
            className="flex items-center justify-center rounded-full text-white font-bold"
            style={{
              width: 32,
              height: 32,
              background: "linear-gradient(135deg, #C8102E, #FF4757)",
              fontSize: 13,
              flexShrink: 0,
            }}
          >
            U
          </div>
          <div>
            <div style={{ color: "#fff", fontWeight: 600, fontSize: 13 }}>
              Uğurcan
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
              Yönetici
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
