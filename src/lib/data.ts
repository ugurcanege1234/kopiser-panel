export const mockTasks = [
  {
    id: 1,
    title: "KONİMAT garantisi 12 gün gecikmiş",
    meta: "A müşteri · 900K kopya/ay · acil iletişim",
    priority: "critical" as const,
  },
  {
    id: 2,
    title: "Konak inşaat firması — yüksek skor lead",
    meta: "Sabah 09:30 ara · Form notu: 'ay içinde başlamak istiyoruz'",
    priority: "critical" as const,
  },
  {
    id: 3,
    title: "Murat Batur'a aylık özet maili gönder",
    meta: "A müşteri · son temas 47 gün önce",
    priority: "planned" as const,
  },
  {
    id: 4,
    title: "3 Instagram postunu onayla (Kyocera serisi)",
    meta: "İçerik Fabrikası taslakta bekliyor",
    priority: "planned" as const,
  },
  {
    id: 5,
    title: "Meta reklam haftalık optimizasyon",
    meta: "2 yaratı yorulmuş, değişim öneriliyor",
    priority: "planned" as const,
  },
  {
    id: 6,
    title: "Hukuk segmenti araştırması başlat",
    meta: "Yeni sektör fırsatı · büyüme planında işaretli",
    priority: "optional" as const,
  },
];

export const mockMorningReport = {
  date: "1 Mayıs 2026",
  traffic: {
    total: 142,
    totalDelta: "+12%",
    kopiser: 94,
    kopiserDelta: "+8%",
    izmir: 48,
    izmirDelta: "+22%",
  },
  leads: {
    total: 5,
    totalDelta: "+2",
    highScore: 2,
    meta: 3,
    organic: 1,
    instagram: 1,
  },
  ads: {
    spend: "3.847 TL",
    cpl: "350 TL",
    ctr: "1.82%",
    ctrDelta: "+0.3",
  },
  instagram: {
    newFollowers: 18,
    followerDelta: "+6",
    bestPostEngagement: 187,
    storyViews: 340,
  },
};

export const mockAlerts = [
  {
    id: 1,
    type: "critical" as const,
    icon: "🔴",
    title: "KONİMAT garantisi gecikmiş",
    body: "A sınıfı müşteri · 900K kopya/ay · son çekim 78 gün önce, 12 gün geciktik. İlişki riski.",
    action: "Hemen Ara →",
  },
  {
    id: 2,
    type: "critical" as const,
    icon: "⏰",
    title: "3 müşteri kira bitişi (7 gün içinde)",
    body: "KONİMAT (1 May), Demet Kırtasiye (3 May), Özgüneş Kırtasiye (5 May). Yenileme görüşmesi planla.",
    action: "Yenileme Akışı →",
  },
  {
    id: 3,
    type: "warning" as const,
    icon: "💸",
    title: "Reklam bütçesi yarın bitiyor",
    body: "Kampanya 1 (İzmir Kurumsal) günlük bütçe yarın 18:30'da tükenecek. Yenileme veya pause kararı ver.",
    action: "Bütçeye Git →",
  },
  {
    id: 4,
    type: "info" as const,
    icon: "📈",
    title: "SEO momentum: Sıralama çıktı",
    body: '"a3 renkli kiralama izmir" 6 → 4. sıraya çıktı. Bu hafta o kelimeye 1 ek blog ile ilk 3\'e girebiliriz.',
    action: "İçerik Plana Ekle →",
  },
  {
    id: 5,
    type: "info" as const,
    icon: "💡",
    title: "Upsell fırsatı tespit edildi",
    body: "Dubu Butik son 3 ay sözleşme sınırını %35 aştı. Ek makine veya daha büyük model teklifi zamanı.",
    action: "Teklif Hazırla →",
  },
];

export const mockKpis = [
  {
    id: "k1",
    label: "Bu Ay Yeni Müşteri",
    value: "14",
    sub: "önceki ay 8 idi · hedef 15",
    delta: "+6",
    deltaType: "up" as const,
    color: "#C8102E",
  },
  {
    id: "k2",
    label: "Aylık Reklam ROAS",
    value: "3.8x",
    sub: "hedef 3.0 · ölçek zamanı",
    delta: "+0.6",
    deltaType: "up" as const,
    color: "#10B981",
  },
  {
    id: "k3",
    label: "Organik Trafik (Ay)",
    value: "2.847",
    sub: "önceki ay 2.061 · trend güçlü",
    delta: "+38%",
    deltaType: "up" as const,
    color: "#3B82F6",
  },
  {
    id: "k4",
    label: "Pipeline (Aktif Lead)",
    value: "42",
    sub: "tahmini dönüşüm: 7 müşteri",
    delta: "+9",
    deltaType: "up" as const,
    color: "#F59E0B",
  },
];

export const mockContentQueue = [
  {
    id: 1,
    platform: "📷 Instagram",
    title: "Konica Minolta C258 ekonomik kullanım",
    time: "Bugün 14:00",
    status: "ready" as const,
  },
  {
    id: 2,
    platform: "🎵 TikTok",
    title: "Kyocera vs Konica: Farkı bilen alır",
    time: "Yarın 10:00",
    status: "pending" as const,
  },
  {
    id: 3,
    platform: "📝 Blog",
    title: "A3 renkli fotokopi kiralamanın 7 avantajı",
    time: "3 Mayıs",
    status: "draft" as const,
  },
  {
    id: 4,
    platform: "📷 Instagram",
    title: "Teknik servis 24 saat içinde — garanti",
    time: "4 Mayıs 12:00",
    status: "ready" as const,
  },
];
