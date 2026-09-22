import { useState } from "react";
import { CATEGORIES, CATEGORY_COLORS } from "../utils/deadlineUtils";

const PRIORITY_OPTIONS = [
  { value: "low",    label: "Rendah",  icon: "🟢", color: "#10b981" },
  { value: "normal", label: "Normal",  icon: "🟡", color: "#facc15" },
  { value: "high",   label: "Tinggi",  icon: "🔴", color: "#ef4444" },
];

export default function TaskInput({ onAdd }) {
  const [text, setText] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState("normal");
  const [showPriority, setShowPriority] = useState(false);
  const [shake, setShake] = useState(false);

  const handleAdd = () => {
    if (!text.trim()) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    const success = onAdd(text, category, deadline, "manual", priority);
    if (success) {
      setText("");
      setDeadline("");
      setPriority("normal");
    }
  };

  // Min datetime = sekarang
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const minDatetime = now.toISOString().slice(0, 16);

  const activePriority = PRIORITY_OPTIONS.find((p) => p.value === priority);

  return (
    <div style={styles.wrap}>
      {/* Category selector */}
      <div style={styles.catRow}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            style={{
              ...styles.catBtn,
              borderColor: category === cat ? CATEGORY_COLORS[cat] : "rgba(255,255,255,0.08)",
              background: category === cat ? CATEGORY_COLORS[cat] + "20" : "transparent",
              color: category === cat ? CATEGORY_COLORS[cat] : "rgba(255,255,255,0.35)",
              transform: category === cat ? "scale(1.03)" : "scale(1)",
            }}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Text input */}
      <div style={{ position: "relative", marginBottom: 8 }}>
        <input
          style={{
            ...styles.input,
            animation: shake ? "shake 0.4s ease" : "none",
            borderColor: shake ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.1)",
          }}
          placeholder="Apa yang mau kamu rencanakan? ✨"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
      </div>

      {/* Deadline + Priority + Add */}
      <div style={styles.row}>
        {/* Deadline */}
        <div style={styles.deadlineWrap}>
          <span style={styles.deadlineLabel}>⏰</span>
          <input
            type="datetime-local"
            style={styles.dateInput}
            value={deadline}
            min={minDatetime}
            onChange={(e) => setDeadline(e.target.value)}
            title="Pilih deadline"
          />
        </div>

        {/* Priority */}
        <div style={{ position: "relative" }}>
          <button
            style={{
              ...styles.priorityBtn,
              background: activePriority.color + "18",
              borderColor: activePriority.color + "40",
              color: activePriority.color,
            }}
            onClick={() => setShowPriority((v) => !v)}
            title="Prioritas"
          >
            {activePriority.icon}
          </button>
          {showPriority && (
            <div style={styles.priorityDropdown}>
              {PRIORITY_OPTIONS.map((p) => (
                <button
                  key={p.value}
                  style={{
                    ...styles.priorityOption,
                    background: priority === p.value ? p.color + "20" : "transparent",
                    color: priority === p.value ? p.color : "rgba(255,255,255,0.6)",
                  }}
                  onClick={() => { setPriority(p.value); setShowPriority(false); }}
                >
                  {p.icon} {p.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Add button */}
        <button style={styles.addBtn} onClick={handleAdd}>
          + Tambah
        </button>
      </div>
    </div>
  );
}

// Inject shake keyframe
if (typeof document !== "undefined" && !document.getElementById("shake-keyframe")) {
  const s = document.createElement("style");
  s.id = "shake-keyframe";
  s.textContent = `
    @keyframes shake {
      0%,100% { transform: translateX(0); }
      20%      { transform: translateX(-6px); }
      40%      { transform: translateX(6px); }
      60%      { transform: translateX(-4px); }
      80%      { transform: translateX(4px); }
    }
  `;
  document.head.appendChild(s);
}

const styles = {
  wrap: { padding: "0 28px 20px" },
  catRow: { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 },
  catBtn: {
    padding: "5px 12px", borderRadius: 100, border: "1.5px solid",
    fontSize: 12, cursor: "pointer", transition: "all 0.2s", fontFamily: "inherit",
    fontWeight: 500,
  },
  input: {
    width: "100%",
    background: "rgba(255,255,255,0.06)",
    border: "1.5px solid",
    borderRadius: 14, color: "#fff", fontSize: 15,
    padding: "12px 16px", outline: "none", fontFamily: "inherit",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  },
  row: { display: "flex", gap: 8, alignItems: "center" },
  deadlineWrap: {
    flex: 1,
    background: "rgba(255,255,255,0.05)",
    border: "1.5px solid rgba(255,255,255,0.08)",
    borderRadius: 12, padding: "8px 12px",
    display: "flex", alignItems: "center", gap: 6,
    minWidth: 0,
  },
  deadlineLabel: { color: "rgba(255,255,255,0.3)", fontSize: 13, flexShrink: 0 },
  dateInput: {
    flex: 1, background: "transparent", border: "none",
    color: "rgba(255,255,255,0.65)", fontSize: 12, outline: "none",
    fontFamily: "inherit", colorScheme: "dark", cursor: "pointer",
    minWidth: 0,
  },
  priorityBtn: {
    width: 40, height: 40, borderRadius: 10,
    border: "1.5px solid",
    background: "transparent",
    fontSize: 16, cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "all 0.2s", flexShrink: 0,
  },
  priorityDropdown: {
    position: "absolute", bottom: "calc(100% + 6px)", right: 0,
    background: "#1a1a2e",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 12, padding: "6px",
    zIndex: 100,
    minWidth: 130,
    boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
  },
  priorityOption: {
    width: "100%", textAlign: "left",
    background: "transparent", border: "none",
    padding: "7px 12px", borderRadius: 8,
    fontSize: 13, cursor: "pointer",
    fontFamily: "inherit", fontWeight: 500,
    transition: "all 0.15s", display: "flex", gap: 6, alignItems: "center",
  },
  addBtn: {
    background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
    border: "none", borderRadius: 12, color: "#fff",
    fontSize: 14, fontWeight: 700, padding: "0 20px",
    height: 40, cursor: "pointer", fontFamily: "inherit",
    whiteSpace: "nowrap", flexShrink: 0,
    boxShadow: "0 4px 16px rgba(124,58,237,0.3)",
    transition: "all 0.2s",
  },
};