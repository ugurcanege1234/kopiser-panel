export default function HeadlineBanner() {
  return (
    <div
      className="flex items-center gap-4 rounded-xl mb-6"
      style={{
        background: "linear-gradient(135deg, #15293F 0%, #1F3A5F 100%)",
        padding: "18px 24px",
        boxShadow:
          "0 4px 12px rgba(15,23,42,0.08), 0 12px 32px rgba(15,23,42,0.10)",
      }}
    >
      <div
        className="flex items-center justify-center rounded-full flex-shrink-0"
        style={{
          width: 48,
          height: 48,
          backgroundColor: "rgba(255,255,255,0.15)",
          fontSize: 24,
        }}
      >
        ⚡
      </div>
      <div>
        <div
          style={{ fontWeight: 700, color: "#fff", marginBottom: 4, fontSize: 14 }}
        >
          Bugünün tek kritik mesajı
        </div>
        <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 12 }}>
          3 müşterinin kirası bu hafta bitiyor (KONİMAT, Demet Kırtasiye,
          Özgüneş) · Dünden 5 yeni lead geldi (2 yüksek skor) · Reklam ROAS
          3.8 ile hedefin üstünde
        </div>
      </div>
    </div>
  );
}
