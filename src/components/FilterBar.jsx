import { FILTERS } from "../utils/deadlineUtils";

const FILTER_ICONS = {
  "Semua":    "📋",
  "Belum":    "⏳",
  "Mendesak": "🚨",
  "Hari Ini": "📅",
  "Selesai":  "✅",
};

export default function FilterBar({ filter, onFilter, doneCount, onClearDone }) {
  return (
    <div style={styles.wrap}>
      <div style={styles.filters}>
        {FILTERS.map((f) => (
          <button
            key={f}
            style={{
              ...styles.btn,
              color: filter === f ? "#c4b5fd" : "rgba(255,255,255,0.3)",
              fontWeight: filter === f ? 700 : 400,
              background: filter === f ? "rgba(167,139,250,0.12)" : "transparent",
              borderRadius: 10,
            }}
            onClick={() => onFilter(f)}
          >
            <span style={{ fontSize: 12 }}>{FILTER_ICONS[f]}</span>
            {f}
          </button>
        ))}
      </div>
      {doneCount > 0 && (
        <button style={styles.clearBtn} onClick={onClearDone}>
          🗑 Hapus ({doneCount})
        </button>
      )}
    </div>
  );
}

const styles = {
  wrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderTop: "1px solid rgba(255,255,255,0.05)",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    padding: "4px 0",
    marginBottom: 10,
    overflowX: "auto",
  },
  filters: { display: "flex", gap: 2 },
  btn: {
    padding: "8px 10px",
    border: "none",
    fontSize: 12,
    cursor: "pointer",
    transition: "all 0.2s",
    fontFamily: "inherit",
    display: "flex",
    alignItems: "center",
    gap: 4,
    whiteSpace: "nowrap",
  },
  clearBtn: {
    background: "transparent",
    border: "1px solid rgba(239,68,68,0.25)",
    borderRadius: 8,
    color: "rgba(239,68,68,0.6)",
    fontSize: 11,
    padding: "5px 10px",
    cursor: "pointer",
    fontFamily: "inherit",
    whiteSpace: "nowrap",
    flexShrink: 0,
    marginLeft: 8,
    transition: "all 0.2s",
  },
};