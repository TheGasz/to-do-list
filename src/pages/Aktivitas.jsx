import { useMemo } from "react";
import { getDeadlineStatus, CATEGORY_COLORS, formatDeadlineFull, formatDeadlineLabel } from "../utils/deadlineUtils";

// ─── Helpers ───────────────────────────────────────────────────────────────
function getLevelInfo(xp) {
  const LEVELS = [
    { level: 1, title: "Pemula",    icon: "🌱", min: 0 },
    { level: 2, title: "Pejuang",   icon: "⚔️",  min: 100 },
    { level: 3, title: "Petualang", icon: "🗺️",  min: 250 },
    { level: 4, title: "Veteran",   icon: "🛡️",  min: 500 },
    { level: 5, title: "Master",    icon: "🔥",  min: 900 },
    { level: 6, title: "Legenda",   icon: "👑",  min: 1500 },
  ];
  let cur = LEVELS[0], nxt = LEVELS[1];
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].min) { cur = LEVELS[i]; nxt = LEVELS[i + 1] || null; break; }
  }
  const pct = nxt ? ((xp - cur.min) / (nxt.min - cur.min)) * 100 : 100;
  return { cur, nxt, pct };
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function MetricCard({ emoji, value, label, color, sub }) {
  return (
    <div style={{ ...styles.metricCard, borderColor: color + "30" }}>
      <div style={{ ...styles.metricEmoji, background: color + "15" }}>{emoji}</div>
      <div style={{ ...styles.metricValue, color }}>{value}</div>
      <div style={styles.metricLabel}>{label}</div>
      {sub && <div style={styles.metricSub}>{sub}</div>}
    </div>
  );
}

function CompletedTaskRow({ task }) {
  const catColor = CATEGORY_COLORS[task.category] || "#a78bfa";
  const dl = task.deadline ? formatDeadlineFull(task.deadline) : null;
  
  const getLmsLink = (source) => {
    switch (source) {
      case "elok": return "https://elok.ugm.ac.id/my/";
      case "teams": return "https://teams.microsoft.com/";
      case "gcr": return "https://classroom.google.com/";
      default: return null;
    }
  };
  const lmsLink = getLmsLink(task.source);

  return (
    <div style={styles.doneRow}>
      <span style={styles.doneCheck}>✓</span>
      <div style={styles.doneContent}>
        <span style={styles.doneText}>{task.text}</span>
        <div style={styles.doneMeta}>
          <span style={{ ...styles.doneCat, color: catColor, background: catColor + "15" }}>
            {task.category}
          </span>
          {dl && <span style={styles.doneDate}>{dl}</span>}
          
          {lmsLink && (
            <a 
              href={lmsLink} 
              target="_blank" 
              rel="noopener noreferrer" 
              style={styles.doneLmsBtn}
              title="Buka di LMS"
            >
              🔗 Buka di {task.source === "elok" ? "Elok" : task.source === "teams" ? "Teams" : "GCR"}
            </a>
          )}
        </div>
      </div>
      <span style={styles.doneXp}>+XP</span>
    </div>
  );
}

function PendingTaskRow({ task }) {
  const catColor = CATEGORY_COLORS[task.category] || "#a78bfa";
  const status = getDeadlineStatus(task.deadline, false);
  const dlLabel = formatDeadlineLabel(task.deadline);
  const statusStyle = {
    overdue: { color: "#ef4444", bg: "rgba(239,68,68,0.1)", icon: "🚨" },
    urgent:  { color: "#f97316", bg: "rgba(249,115,22,0.1)", icon: "⚡" },
    soon:    { color: "#facc15", bg: "rgba(250,204,21,0.1)", icon: "⏳" },
    ok:      { color: "#10b981", bg: "rgba(16,185,129,0.1)", icon: "📅" },
  };
  const ss = status ? statusStyle[status] : null;

  return (
    <div style={styles.pendingRow}>
      <div style={{ ...styles.pendingDot, background: catColor }} />
      <div style={styles.doneContent}>
        <span style={styles.pendingText}>{task.text}</span>
        <div style={styles.doneMeta}>
          <span style={{ ...styles.doneCat, color: catColor, background: catColor + "15" }}>
            {task.category}
          </span>
          {ss && dlLabel && (
            <span style={{ fontSize: 11, color: ss.color, fontWeight: 600 }}>
              {ss.icon} {dlLabel}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main ───────────────────────────────────────────────────────────────────
export default function Aktivitas({ tasks, stats }) {
  const { cur, nxt, pct } = getLevelInfo(stats.xp);

  const doneTasks = useMemo(() =>
    tasks.filter((t) => t.done).sort((a, b) => {
      return new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0);
    }), [tasks]);

  const pendingTasks = useMemo(() =>
    tasks.filter((t) => !t.done).sort((a, b) => {
      const sa = getDeadlineStatus(a.deadline, false);
      const sb = getDeadlineStatus(b.deadline, false);
      const order = { overdue: 0, urgent: 1, soon: 2, ok: 3, null: 4 };
      return (order[sa] ?? 4) - (order[sb] ?? 4);
    }), [tasks]);

  const lmsTasks = tasks.filter((t) => t.source && t.source !== "manual");
  const completionRate = tasks.length ? Math.round((doneTasks.length / tasks.length) * 100) : 0;

  // Category data for ring chart (visual bars)
  const catData = Object.entries(CATEGORY_COLORS).map(([cat, color]) => {
    const total = tasks.filter((t) => t.category === cat).length;
    const done  = tasks.filter((t) => t.category === cat && t.done).length;
    return { cat, color, total, done, pct: total ? Math.round((done / total) * 100) : 0 };
  }).filter((d) => d.total > 0);

  return (
    <div style={styles.wrap}>
      {/* ── Page title ── */}
      <div style={styles.topBar}>
        <div>
          <h1 style={styles.pageTitle}>📊 Aktivitas</h1>
          <p style={styles.pageSub}>Dashboard produktivitas kamu secara keseluruhan</p>
        </div>
        <div style={styles.completionBadge}>
          <span style={styles.completionNum}>{completionRate}%</span>
          <span style={styles.completionLabel}>completion rate</span>
        </div>
      </div>

      {/* ── Level & XP banner ── */}
      <div style={styles.levelBanner}>
        <div style={styles.levelLeft}>
          <div style={styles.levelIconWrap}>{cur.icon}</div>
          <div>
            <div style={styles.levelTitle}>{cur.title}</div>
            <div style={styles.levelMeta}>Level {cur.level} · {stats.xp} XP</div>
          </div>
        </div>
        <div style={styles.levelRight}>
          {nxt && (
            <div style={styles.nextLevelHint}>
              → {nxt.icon} {nxt.title} butuh <strong style={{ color: "#a78bfa" }}>{nxt.min - stats.xp} XP</strong> lagi
            </div>
          )}
          <div style={styles.xpBarBg}>
            <div style={{ ...styles.xpBarFill, width: `${Math.min(pct, 100)}%` }}>
              <div style={styles.xpShimmer} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Metric cards ── */}
      <div style={styles.metricsGrid}>
        <MetricCard emoji="🔥" value={stats.streak}          label="Hari Streak"    color="#f97316" sub="hari berturut-turut" />
        <MetricCard emoji="✅" value={doneTasks.length}       label="Selesai"        color="#10b981" sub={`dari ${tasks.length} total`} />
        <MetricCard emoji="⏳" value={pendingTasks.length}    label="Pending"        color="#facc15" sub="belum dikerjakan" />
        <MetricCard emoji="📚" value={lmsTasks.length}        label="Dari LMS"       color="#a78bfa" sub="tugas platform" />
        <MetricCard emoji="⭐" value={stats.xp}               label="Total XP"       color="#60a5fa" sub={`level ${cur.level}`} />
        <MetricCard emoji="📝" value={stats.totalAdded || 0}  label="Pernah Dibuat"  color="#ec4899" sub="tugas sepanjang masa" />
      </div>

      <div style={styles.twoCol}>
        {/* ── LEFT: Category breakdown ── */}
        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <span style={styles.panelTitle}>🏷️ Per Kategori</span>
          </div>
          {catData.length === 0 ? (
            <div style={styles.emptySmall}>Belum ada data kategori</div>
          ) : (
            <div style={styles.catList}>
              {catData.map(({ cat, color, total, done, pct }) => (
                <div key={cat} style={styles.catRow}>
                  <div style={styles.catLeft}>
                    <div style={{ ...styles.catDot, background: color }} />
                    <span style={styles.catName}>{cat}</span>
                  </div>
                  <div style={styles.catRight}>
                    <div style={styles.catBarWrap}>
                      <div style={styles.catBarBg}>
                        <div style={{
                          ...styles.catBarFill,
                          width: `${pct}%`,
                          background: `linear-gradient(90deg, ${color}80, ${color})`,
                        }} />
                      </div>
                    </div>
                    <span style={{ ...styles.catStat, color }}>{done}/{total}</span>
                    <span style={styles.catPct}>{pct}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Urgent tasks mini list */}
          {pendingTasks.filter((t) => {
            const s = getDeadlineStatus(t.deadline, false);
            return s === "overdue" || s === "urgent";
          }).length > 0 && (
            <>
              <div style={{ ...styles.panelHeader, marginTop: 20 }}>
                <span style={styles.panelTitle}>🚨 Perlu Perhatian</span>
              </div>
              <div style={styles.urgentList}>
                {pendingTasks
                  .filter((t) => {
                    const s = getDeadlineStatus(t.deadline, false);
                    return s === "overdue" || s === "urgent";
                  })
                  .slice(0, 5)
                  .map((t) => <PendingTaskRow key={t.id} task={t} />)}
              </div>
            </>
          )}
        </div>

        {/* ── RIGHT: Completed tasks ── */}
        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <span style={styles.panelTitle}>✅ Tugas Selesai</span>
            <span style={styles.panelCount}>{doneTasks.length}</span>
          </div>
          {doneTasks.length === 0 ? (
            <div style={styles.emptyDone}>
              <span style={{ fontSize: 40, display: "block", marginBottom: 10 }}>🏆</span>
              <p style={styles.emptyDoneText}>
                Selesaikan tugasmu pertama<br />dan lihat riwayatnya di sini!
              </p>
            </div>
          ) : (
            <div style={styles.doneList}>
              {doneTasks.map((t) => <CompletedTaskRow key={t.id} task={t} />)}
            </div>
          )}
        </div>
      </div>

      {/* ── Pending tasks full list ── */}
      {pendingTasks.length > 0 && (
        <div style={{ ...styles.panel, margin: "0 36px 36px" }}>
          <div style={styles.panelHeader}>
            <span style={styles.panelTitle}>⏳ Semua Tugas Pending</span>
            <span style={styles.panelCount}>{pendingTasks.length}</span>
          </div>
          <div style={styles.pendingGrid}>
            {pendingTasks.map((t) => <PendingTaskRow key={t.id} task={t} />)}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const styles = {
  wrap: { overflowY: "auto", height: "100%", paddingBottom: 40 },

  topBar: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "32px 36px 20px",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },
  pageTitle: { fontSize: 26, fontWeight: 800, color: "#fff", margin: "0 0 4px" },
  pageSub: { color: "rgba(255,255,255,0.3)", fontSize: 13, margin: 0 },
  completionBadge: {
    display: "flex", flexDirection: "column", alignItems: "center",
    background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.2)",
    borderRadius: 18, padding: "12px 20px",
  },
  completionNum: { fontSize: 32, fontWeight: 800, color: "#a78bfa", lineHeight: 1 },
  completionLabel: { color: "rgba(255,255,255,0.3)", fontSize: 11, marginTop: 3, textTransform: "uppercase", letterSpacing: "0.5px" },

  // Level banner
  levelBanner: {
    display: "flex", alignItems: "center", gap: 20,
    margin: "20px 36px",
    background: "linear-gradient(135deg, rgba(124,58,237,0.12), rgba(96,165,250,0.08))",
    border: "1px solid rgba(167,139,250,0.2)",
    borderRadius: 20, padding: "18px 22px",
  },
  levelLeft: { display: "flex", alignItems: "center", gap: 14, flexShrink: 0 },
  levelIconWrap: {
    width: 52, height: 52, borderRadius: 16,
    background: "rgba(167,139,250,0.15)",
    border: "1.5px solid rgba(167,139,250,0.3)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 26,
  },
  levelTitle: { fontSize: 18, fontWeight: 800, color: "#c4b5fd" },
  levelMeta: { color: "rgba(255,255,255,0.35)", fontSize: 13, marginTop: 2 },
  levelRight: { flex: 1 },
  nextLevelHint: { color: "rgba(255,255,255,0.4)", fontSize: 12, marginBottom: 8 },
  xpBarBg: { background: "rgba(255,255,255,0.06)", borderRadius: 100, height: 8, overflow: "hidden" },
  xpBarFill: {
    height: "100%", borderRadius: 100,
    background: "linear-gradient(90deg, #7c3aed, #a78bfa, #60a5fa)",
    transition: "width 0.8s ease", position: "relative", overflow: "hidden",
  },
  xpShimmer: {
    position: "absolute", inset: 0,
    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
    animation: "shimmer 2.5s ease-in-out infinite",
  },

  // Metrics
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(6, 1fr)",
    gap: 12, margin: "0 36px 24px",
  },
  metricCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid", borderRadius: 18,
    padding: "16px 12px", textAlign: "center",
  },
  metricEmoji: {
    width: 40, height: 40, borderRadius: 12,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 20, margin: "0 auto 10px",
  },
  metricValue: { fontSize: 26, fontWeight: 800, lineHeight: 1 },
  metricLabel: { color: "rgba(255,255,255,0.45)", fontSize: 11, marginTop: 5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" },
  metricSub: { color: "rgba(255,255,255,0.2)", fontSize: 10, marginTop: 3 },

  // Two column
  twoCol: {
    display: "grid", gridTemplateColumns: "1fr 1fr",
    gap: 16, margin: "0 36px 20px",
  },
  panel: {
    background: "rgba(255,255,255,0.025)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 20, padding: "20px",
  },
  panelHeader: {
    display: "flex", justifyContent: "space-between",
    alignItems: "center", marginBottom: 16,
  },
  panelTitle: { color: "rgba(255,255,255,0.7)", fontWeight: 700, fontSize: 13 },
  panelCount: {
    background: "rgba(167,139,250,0.15)",
    color: "#c4b5fd", fontSize: 11, fontWeight: 700,
    padding: "2px 8px", borderRadius: 100,
  },

  // Category list
  catList: { display: "flex", flexDirection: "column", gap: 10 },
  catRow: {
    display: "flex", alignItems: "center",
    gap: 10,
  },
  catLeft: { display: "flex", alignItems: "center", gap: 8, width: 110, flexShrink: 0 },
  catDot: { width: 10, height: 10, borderRadius: "50%", flexShrink: 0 },
  catName: { color: "rgba(255,255,255,0.5)", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  catRight: { flex: 1, display: "flex", alignItems: "center", gap: 8 },
  catBarWrap: { flex: 1 },
  catBarBg: { height: 6, borderRadius: 100, background: "rgba(255,255,255,0.06)", overflow: "hidden" },
  catBarFill: { height: "100%", borderRadius: 100, transition: "width 0.6s ease" },
  catStat: { fontSize: 12, fontWeight: 700, minWidth: 30, textAlign: "right" },
  catPct: { fontSize: 11, color: "rgba(255,255,255,0.25)", minWidth: 32, textAlign: "right" },

  // Urgent
  urgentList: { display: "flex", flexDirection: "column", gap: 6 },

  // Done list
  doneList: {
    display: "flex", flexDirection: "column", gap: 0,
    maxHeight: 380, overflowY: "auto",
  },
  doneRow: {
    display: "flex", alignItems: "flex-start", gap: 10,
    padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)",
  },
  doneCheck: {
    width: 20, height: 20, borderRadius: 6,
    background: "rgba(16,185,129,0.15)", color: "#10b981",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 11, flexShrink: 0, fontWeight: 700,
  },
  doneContent: { flex: 1, minWidth: 0 },
  doneText: {
    color: "rgba(255,255,255,0.45)", fontSize: 13,
    textDecoration: "line-through", display: "block",
    marginBottom: 4, lineHeight: 1.4,
  },
  doneMeta: { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" },
  doneCat: { fontSize: 10, padding: "2px 7px", borderRadius: 100, fontWeight: 500 },
  doneDate: { color: "rgba(255,255,255,0.15)", fontSize: 10 },
  doneXp: {
    fontSize: 11, color: "#a78bfa", fontWeight: 700,
    background: "rgba(167,139,250,0.1)", padding: "2px 6px",
    borderRadius: 6, flexShrink: 0,
  },
  doneLmsBtn: {
    fontSize: 10, color: "#93c5fd", textDecoration: "none",
    background: "rgba(147, 197, 253, 0.1)", padding: "2px 6px",
    borderRadius: 6, fontWeight: 600, display: "flex", alignItems: "center", gap: 3,
    border: "1px solid rgba(147, 197, 253, 0.2)",
    cursor: "pointer", transition: "all 0.2s"
  },
  emptyDone: { textAlign: "center", padding: "30px 0" },
  emptyDoneText: { color: "rgba(255,255,255,0.2)", fontSize: 13, margin: 0, lineHeight: 1.7 },
  emptySmall: { color: "rgba(255,255,255,0.2)", fontSize: 13, textAlign: "center", padding: "20px 0" },

  // Pending
  pendingGrid: {
    display: "grid", gridTemplateColumns: "1fr 1fr",
    gap: 0,
  },
  pendingRow: {
    display: "flex", alignItems: "flex-start", gap: 8,
    padding: "9px 0", borderBottom: "1px solid rgba(255,255,255,0.04)",
  },
  pendingDot: { width: 8, height: 8, borderRadius: "50%", flexShrink: 0, marginTop: 5 },
  pendingText: { color: "rgba(255,255,255,0.65)", fontSize: 13, display: "block", marginBottom: 4, lineHeight: 1.4 },
};
