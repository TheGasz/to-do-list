import { useState, useEffect } from "react";
import { getNearDeadlineTasks, formatDeadlineLabel, formatDeadlineFull, getDeadlineStatus, CATEGORY_COLORS } from "../utils/deadlineUtils";

export default function DeadlineAlert({ tasks }) {
  const [visible, setVisible] = useState(false);
  const urgent = getNearDeadlineTasks(tasks);

  useEffect(() => {
    if (urgent.length > 0 && !sessionStorage.getItem("dl_alert")) {
      setVisible(true);
      sessionStorage.setItem("dl_alert", "1");
    }
  }, []);

  if (!visible || urgent.length === 0) return null;

  return (
    <div style={styles.overlay} onClick={() => setVisible(false)}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.icon}>🔔</div>
        <h2 style={styles.title}>Ada Deadline Mepet!</h2>
        <p style={styles.sub}>{urgent.length} tugas butuh perhatianmu sekarang:</p>
        <div style={styles.list}>
          {urgent.map((t) => {
            const status = getDeadlineStatus(t.deadline, t.done);
            const label = formatDeadlineLabel(t.deadline);
            const full = formatDeadlineFull(t.deadline);
            const colors = {
              overdue: { bg: "#ef444418", color: "#ef4444", border: "rgba(239,68,68,0.2)" },
              urgent:  { bg: "#f9731618", color: "#f97316", border: "rgba(249,115,22,0.2)" },
              soon:    { bg: "#facc1518", color: "#facc15", border: "rgba(250,204,21,0.2)"  },
            };
            const c = colors[status] || colors.soon;
            return (
              <div key={t.id} style={{ ...styles.item, background: c.bg, border: `1px solid ${c.border}` }}>
                <span style={{ ...styles.dot, background: CATEGORY_COLORS[t.category] || "#a78bfa" }} />
                <div style={styles.itemContent}>
                  <div>
                    <div style={styles.itemText}>{t.text}</div>
                    <div style={styles.itemFull}>{full}</div>
                  </div>
                  <span style={{ ...styles.timeBadge, color: c.color, background: c.bg }}>
                    ⏰ {label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        <button style={styles.btn} onClick={() => setVisible(false)}>
          Siap, Saya Kerjakan! 💪
        </button>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
    backdropFilter: "blur(6px)", display: "flex", alignItems: "center",
    justifyContent: "center", zIndex: 1000, padding: 16,
  },
  modal: {
    background: "#1a1a2e", border: "1.5px solid rgba(239,68,68,0.25)",
    borderRadius: 24, padding: "32px 28px", maxWidth: 440, width: "100%",
    boxShadow: "0 0 60px rgba(239,68,68,0.12)",
  },
  icon: { fontSize: 42, textAlign: "center", marginBottom: 10 },
  title: { color: "#fff", fontSize: 22, fontWeight: 800, textAlign: "center", margin: "0 0 6px" },
  sub: { color: "rgba(255,255,255,0.45)", fontSize: 14, textAlign: "center", marginBottom: 18 },
  list: { display: "flex", flexDirection: "column", gap: 8, marginBottom: 22 },
  item: { display: "flex", alignItems: "flex-start", gap: 10, borderRadius: 14, padding: "10px 14px" },
  dot: { width: 10, height: 10, borderRadius: "50%", flexShrink: 0, marginTop: 4 },
  itemContent: { flex: 1, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" },
  itemText: { color: "rgba(255,255,255,0.85)", fontSize: 14, fontWeight: 500 },
  itemFull: { color: "rgba(255,255,255,0.3)", fontSize: 11, marginTop: 2 },
  timeBadge: { fontSize: 11, padding: "3px 10px", borderRadius: 100, fontWeight: 700, whiteSpace: "nowrap" },
  btn: {
    width: "100%", padding: 13, borderRadius: 14, border: "none",
    background: "linear-gradient(135deg, #ef4444, #f97316)",
    color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
  },
};