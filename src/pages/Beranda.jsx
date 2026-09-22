import StatsBar from "../components/StatsBar";
import TaskList from "../components/TaskList";
import { getNearDeadlineTasks, getDeadlineStatus, isToday } from "../utils/deadlineUtils";
import { useState } from "react";

// Filter khusus Beranda — tanpa "Selesai" (lihat di Aktivitas)
const BERANDA_FILTERS = [
  { id: "Belum",    icon: "⏳", label: "Semua" },
  { id: "Mendesak", icon: "🚨", label: "Mendesak" },
  { id: "Hari Ini", icon: "📅", label: "Hari Ini" },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 6)  return { emoji: "🌙", text: "Kerja lembur?", sub: "Jaga kesehatanmu ya!" };
  if (h < 11) return { emoji: "☀️", text: "Selamat Pagi!", sub: "Mulai hari dengan semangat!" };
  if (h < 15) return { emoji: "🌤️", text: "Selamat Siang!", sub: "Tetap fokus dan produktif!" };
  if (h < 18) return { emoji: "🌅", text: "Selamat Sore!", sub: "Hampir selesai, terus semangat!" };
  return { emoji: "🌙", text: "Selamat Malam!", sub: "Review hari ini, siapkan besok!" };
}

function getTodayLabel() {
  return new Date().toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

export default function Beranda({ tasks, stats, onToggle, onDelete, onEdit }) {
  const [filter, setFilter] = useState("Belum");
  const greeting = getGreeting();
  const doneCount = tasks.filter((t) => t.done).length;
  const totalUndone = tasks.filter((t) => !t.done).length;
  const progress = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0;
  const urgentCount = getNearDeadlineTasks(tasks).length;

  // Hanya tampilkan task yang belum selesai di Beranda
  const visibleTasks = tasks.filter((t) => !t.done);

  return (
    <div style={styles.wrap}>
      {/* Top header */}
      <div style={styles.topBar}>
        <div>
          <h1 style={styles.pageTitle}>
            {greeting.emoji} {greeting.text}
          </h1>
          <p style={styles.dateStr}>{getTodayLabel()}</p>
        </div>
        <div style={styles.headerRight}>
          {urgentCount > 0 && (
            <div style={styles.urgentBadge}>
              🚨 {urgentCount} mendesak
            </div>
          )}
          <div style={styles.taskCountChip}>
            {totalUndone} rencana
          </div>
        </div>
      </div>

      {/* Gamification */}
      <div style={styles.section}>
        <StatsBar stats={stats} />
      </div>

      {/* Progress overview */}
      <div style={styles.progressCard}>
        <div style={styles.progressTop}>
          <div style={styles.progressLeft}>
            <span style={styles.progressBig}>{doneCount}</span>
            <span style={styles.progressOf}> / {tasks.length}</span>
            <span style={styles.progressLabel}> tugas selesai</span>
          </div>
          <div style={styles.progressRight}>
            {totalUndone > 0 && (
              <span style={styles.pendingChip}>{totalUndone} pending</span>
            )}
            <span style={styles.progressPct}>{progress}%</span>
          </div>
        </div>
        <div style={styles.progressBg}>
          <div style={{ ...styles.progressBar, width: `${progress}%` }}>
            <div style={styles.shimmer} />
          </div>
        </div>
        {/* Category breakdown */}
        <div style={styles.catBreakdown}>
          {["💼 Kerja", "🎯 Goal", "📋 Pribadi", "🛒 Belanja", "📚 Tugas"].map((cat) => {
            const total = tasks.filter((t) => t.category === cat).length;
            if (total === 0) return null;
            const done = tasks.filter((t) => t.category === cat && t.done).length;
            return (
              <div key={cat} style={styles.catChip}>
                <span style={styles.catChipIcon}>{cat.split(" ")[0]}</span>
                <span style={styles.catChipText}>{done}/{total}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter Tabs + Task List */}
      <div style={styles.listSection}>
        {/* Compact filter tabs */}
        <div style={styles.filterRow}>
          <div style={styles.filterTabs}>
            {BERANDA_FILTERS.map((f) => (
              <button
                key={f.id}
                style={{
                  ...styles.filterTab,
                  background: filter === f.id ? "rgba(167,139,250,0.15)" : "transparent",
                  color: filter === f.id ? "#c4b5fd" : "rgba(255,255,255,0.3)",
                  fontWeight: filter === f.id ? 700 : 400,
                }}
                onClick={() => setFilter(f.id)}
              >
                <span>{f.icon}</span> {f.label}
              </button>
            ))}
          </div>
          {totalUndone > 0 && (
            <span style={styles.pendingInfo}>{totalUndone} tugas pending</span>
          )}
        </div>
        <TaskList
          tasks={visibleTasks}
          filter={filter}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    display: "flex",
    flexDirection: "column",
    gap: 0,
    height: "100%",
    overflowY: "auto",
    paddingBottom: 40,
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "32px 36px 24px",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 800,
    color: "#fff",
    margin: "0 0 4px",
    letterSpacing: "-0.5px",
  },
  dateStr: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 13,
    margin: 0,
    textTransform: "capitalize",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexShrink: 0,
    marginTop: 4,
  },
  urgentBadge: {
    background: "rgba(239,68,68,0.12)",
    border: "1px solid rgba(239,68,68,0.3)",
    color: "#f87171",
    fontSize: 12,
    fontWeight: 700,
    padding: "5px 12px",
    borderRadius: 100,
  },
  taskCountChip: {
    background: "rgba(167,139,250,0.12)",
    border: "1px solid rgba(167,139,250,0.2)",
    color: "#c4b5fd",
    fontSize: 12,
    fontWeight: 600,
    padding: "5px 12px",
    borderRadius: 100,
  },
  section: {
    padding: "20px 36px 0",
  },
  progressCard: {
    margin: "20px 36px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 20,
    padding: "20px 22px",
  },
  progressTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  progressLeft: { display: "flex", alignItems: "baseline", gap: 2 },
  progressBig: { fontSize: 36, fontWeight: 800, color: "#fff" },
  progressOf: { fontSize: 18, color: "rgba(255,255,255,0.3)" },
  progressLabel: { fontSize: 14, color: "rgba(255,255,255,0.3)", marginLeft: 4 },
  progressRight: { display: "flex", alignItems: "center", gap: 10 },
  pendingChip: {
    background: "rgba(251,191,36,0.1)",
    border: "1px solid rgba(251,191,36,0.2)",
    color: "#fbbf24",
    fontSize: 11,
    fontWeight: 600,
    padding: "3px 10px",
    borderRadius: 100,
  },
  progressPct: { fontSize: 28, fontWeight: 800, color: "#a78bfa" },
  progressBg: {
    background: "rgba(255,255,255,0.05)",
    borderRadius: 100,
    height: 8,
    overflow: "hidden",
    marginBottom: 16,
  },
  progressBar: {
    height: "100%",
    borderRadius: 100,
    background: "linear-gradient(90deg, #7c3aed, #a78bfa, #60a5fa)",
    transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
    position: "relative",
    overflow: "hidden",
  },
  shimmer: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
    animation: "shimmer 2.5s ease-in-out infinite",
  },
  catBreakdown: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  catChip: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 100,
    padding: "4px 10px",
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
  },
  catChipIcon: { fontSize: 14 },
  catChipText: { fontWeight: 600 },
  listSection: {
    padding: "0 36px",
  },
  filterRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: "1px solid rgba(255,255,255,0.05)",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    padding: "4px 0",
    marginBottom: 10,
  },
  filterTabs: { display: "flex", gap: 2 },
  filterTab: {
    display: "flex", alignItems: "center", gap: 5,
    padding: "8px 12px", borderRadius: 10,
    border: "none", cursor: "pointer",
    fontFamily: "inherit", fontSize: 12,
    transition: "all 0.2s", whiteSpace: "nowrap",
  },
  pendingInfo: {
    color: "rgba(255,255,255,0.2)",
    fontSize: 11,
    paddingRight: 4,
  },
};
