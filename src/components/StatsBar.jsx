import { getLevelInfo } from "../utils/deadlineUtils";

export default function StatsBar({ stats }) {
  const { current, next, progress } = getLevelInfo(stats.xp);
  const pct = Math.min(Math.round(progress), 100);

  return (
    <div style={styles.wrap}>
      {/* Level badge */}
      <div style={styles.levelBadge}>
        <div style={styles.levelIconWrap}>
          <span style={styles.levelIcon}>{current.icon}</span>
        </div>
        <div>
          <div style={styles.levelTitle}>{current.title}</div>
          <div style={styles.levelSub}>Level {current.level}</div>
        </div>
      </div>

      {/* XP bar */}
      <div style={styles.xpSection}>
        <div style={styles.xpRow}>
          <span style={styles.xpLabel}>⭐ {stats.xp} XP</span>
          {next && (
            <span style={styles.xpNext}>
              → {next.icon} {next.title} ({next.min} XP)
            </span>
          )}
        </div>
        <div style={styles.xpBarBg}>
          <div style={{ ...styles.xpBar, width: `${pct}%` }} />
        </div>
        {!next && (
          <div style={styles.maxLevel}>👑 Level Maksimal!</div>
        )}
      </div>

      {/* Stats badges */}
      <div style={styles.badges}>
        <div style={styles.statBadge}>
          <span style={styles.statEmoji}>🔥</span>
          <span style={styles.statNum}>{stats.streak}</span>
          <span style={styles.statLabel}>Streak</span>
        </div>
        <div style={styles.statBadge}>
          <span style={styles.statEmoji}>✅</span>
          <span style={styles.statNum}>{stats.totalCompleted}</span>
          <span style={styles.statLabel}>Selesai</span>
        </div>
        <div style={styles.statBadge}>
          <span style={styles.statEmoji}>📝</span>
          <span style={styles.statNum}>{stats.totalAdded || 0}</span>
          <span style={styles.statLabel}>Dibuat</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    margin: "0 0 0px",
    background: "linear-gradient(135deg, rgba(167,139,250,0.12), rgba(96,165,250,0.12))",
    border: "1px solid rgba(167,139,250,0.25)",
    borderRadius: 20,
    padding: "16px 18px",
    display: "flex",
    alignItems: "center",
    gap: 14,
    flexWrap: "wrap",
    position: "relative",
    overflow: "hidden",
  },
  levelBadge: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexShrink: 0,
  },
  levelIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    background: "rgba(167,139,250,0.15)",
    border: "1.5px solid rgba(167,139,250,0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  levelIcon: { fontSize: 22 },
  levelTitle: {
    color: "#c4b5fd",
    fontWeight: 700,
    fontSize: 14,
    lineHeight: 1.2,
  },
  levelSub: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 11,
  },
  xpSection: {
    flex: 1,
    minWidth: 120,
  },
  xpRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  xpLabel: {
    color: "#fff",
    fontSize: 13,
    fontWeight: 700,
  },
  xpNext: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 11,
  },
  xpBarBg: {
    background: "rgba(255,255,255,0.08)",
    borderRadius: 100,
    height: 7,
    overflow: "hidden",
  },
  xpBar: {
    height: "100%",
    borderRadius: 100,
    background: "linear-gradient(90deg, #a78bfa, #60a5fa, #34d399)",
    transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
    boxShadow: "0 0 8px rgba(167,139,250,0.5)",
  },
  maxLevel: {
    color: "#fbbf24",
    fontSize: 11,
    marginTop: 4,
    textAlign: "right",
    fontWeight: 600,
  },
  badges: {
    display: "flex",
    gap: 6,
    flexShrink: 0,
  },
  statBadge: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 14,
    padding: "8px 12px",
    gap: 1,
    minWidth: 52,
  },
  statEmoji: { fontSize: 14 },
  statNum: {
    color: "#fff",
    fontWeight: 800,
    fontSize: 16,
    lineHeight: 1.1,
  },
  statLabel: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
};