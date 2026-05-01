import TopBar from "@/components/TopBar";
import HeadlineBanner from "@/components/HeadlineBanner";
import TaskList from "@/components/TaskList";
import MorningReport from "@/components/MorningReport";
import CriticalAlerts from "@/components/CriticalAlerts";
import KpiBand from "@/components/KpiBand";
import ContentQueuePreview from "@/components/ContentQueuePreview";

export default function Dashboard() {
  return (
    <div style={{ padding: "24px 32px 40px" }}>
      <TopBar />
      <HeadlineBanner />

      {/* 3 kolonlu grid */}
      <div
        className="grid gap-5 mb-6"
        style={{ gridTemplateColumns: "1fr 1.4fr 1fr" }}
      >
        <TaskList />
        <MorningReport />
        <CriticalAlerts />
      </div>

      {/* KPI Band */}
      <KpiBand />

      {/* İçerik Kuyruğu */}
      <ContentQueuePreview />
    </div>
  );
}
