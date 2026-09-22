import { useState } from "react";
import { CATEGORIES, CATEGORY_COLORS, buildGoogleCalendarUrl } from "../utils/deadlineUtils";

const PRIORITY_OPTIONS = [
  { value: "low",    label: "Rendah",  icon: "🟢", color: "#10b981" },
  { value: "normal", label: "Normal",  icon: "🟡", color: "#facc15" },
  { value: "high",   label: "Tinggi",  icon: "🔴", color: "#ef4444" },
];

export default function TambahTugas({ onAdd, onNavigate }) {
  const [text, setText] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState("normal");
  const [note, setNote] = useState("");
  const [added, setAdded] = useState(false);
  const [shake, setShake] = useState(false);
  const [addToCalendar, setAddToCalendar] = useState(true);

  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const minDatetime = now.toISOString().slice(0, 16);

  const handleAdd = () => {
    if (!text.trim()) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    const success = onAdd(text, category, deadline, "manual", priority, addToCalendar);
    if (success) {
      // Buka Google Calendar jika checkbox aktif dan ada deadline
      if (addToCalendar) {
        const tempTask = { text: text.trim(), deadline, category, priority };
        const calUrl = buildGoogleCalendarUrl(tempTask);
        window.open(calUrl, "_blank", "noopener,noreferrer");
      }
      setAdded(true);
      setText("");
      setDeadline("");
      setNote("");
      setPriority("normal");
      setTimeout(() => setAdded(false), 2500);
    }
  };

  const activePriority = PRIORITY_OPTIONS.find((p) => p.value === priority);

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <h1 style={styles.title}>➕ Tambah Tugas</h1>
        <p style={styles.sub}>Buat rencana baru dan tetap terorganisir</p>
      </div>

      <div style={styles.formCard}>
        {/* Task name */}
        <div style={styles.field}>
          <label style={styles.label}>📌 Nama Tugas</label>
          <input
            autoFocus
            style={{
              ...styles.input,
              animation: shake ? "shake 0.4s ease" : "none",
              borderColor: shake ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.1)",
            }}
            placeholder="Apa yang mau kamu kerjakan?"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
        </div>

        {/* Category */}
        <div style={styles.field}>
          <label style={styles.label}>🏷️ Kategori</label>
          <div style={styles.catGrid}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                style={{
                  ...styles.catBtn,
                  borderColor: category === cat ? CATEGORY_COLORS[cat] : "rgba(255,255,255,0.08)",
                  background: category === cat ? CATEGORY_COLORS[cat] + "20" : "rgba(255,255,255,0.03)",
                  color: category === cat ? CATEGORY_COLORS[cat] : "rgba(255,255,255,0.4)",
                  transform: category === cat ? "scale(1.03)" : "scale(1)",
                }}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Priority */}
        <div style={styles.field}>
          <label style={styles.label}>⚡ Prioritas</label>
          <div style={styles.priorityRow}>
            {PRIORITY_OPTIONS.map((p) => (
              <button
                key={p.value}
                style={{
                  ...styles.priorityBtn,
                  borderColor: priority === p.value ? p.color : "rgba(255,255,255,0.08)",
                  background: priority === p.value ? p.color + "18" : "rgba(255,255,255,0.03)",
                  color: priority === p.value ? p.color : "rgba(255,255,255,0.4)",
                }}
                onClick={() => setPriority(p.value)}
              >
                {p.icon} {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Deadline */}
        <div style={styles.field}>
          <label style={styles.label}>⏰ Deadline (opsional)</label>
          <div style={styles.deadlineWrap}>
            <input
              type="datetime-local"
              style={styles.dateInput}
              value={deadline}
              min={minDatetime}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
        </div>

        {/* Google Calendar toggle */}
        <div style={styles.gcalToggle}>
          <label style={styles.gcalLabel}>
            <input
              type="checkbox"
              checked={addToCalendar}
              onChange={(e) => setAddToCalendar(e.target.checked)}
              style={styles.gcalCheckbox}
            />
            <span style={styles.gcalText}>
              📅 Tambah ke Google Calendar setelah simpan
            </span>
          </label>
        </div>

        {/* Submit */}
        <button
          style={{
            ...styles.submitBtn,
            background: added
              ? "linear-gradient(135deg, #10b981, #34d399)"
              : "linear-gradient(135deg, #7c3aed, #a78bfa)",
          }}
          onClick={handleAdd}
        >
          {added ? "✅ Berhasil Ditambahkan!" : "➕ Tambah Tugas"}
        </button>

        {added && (
          <button
            style={styles.goToListBtn}
            onClick={() => onNavigate("beranda")}
          >
            Lihat di Beranda →
          </button>
        )}
      </div>

      {/* Tips */}
      <div style={styles.tipsCard}>
        <div style={styles.tipsTitle}>💡 Tips Produktivitas</div>
        <ul style={styles.tipsList}>
          <li>Gunakan prioritas <strong style={{ color: "#ef4444" }}>Tinggi</strong> untuk tugas yang paling penting hari ini</li>
          <li>Set deadline untuk mendapatkan notifikasi pengingat</li>
          <li>Selesaikan tugas urgent untuk bonus <strong style={{ color: "#a78bfa" }}>+50 XP</strong></li>
          <li>Pertahankan streak harian untuk bonus tambahan 🔥</li>
        </ul>
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    padding: "24px 20px",
    maxWidth: 680,
    overflowY: "auto",
    height: "100%",
    boxSizing: "border-box",
    width: "100%",
  },
  header: { marginBottom: 28 },
  title: { fontSize: 26, fontWeight: 800, color: "#fff", margin: "0 0 6px" },
  sub: { color: "rgba(255,255,255,0.35)", fontSize: 14, margin: 0 },
  formCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 22,
    padding: "24px",
    marginBottom: 20,
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  field: { display: "flex", flexDirection: "column", gap: 10 },
  label: { color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 600 },
  input: {
    width: "100%",
    background: "rgba(255,255,255,0.05)",
    border: "1.5px solid",
    borderRadius: 14,
    color: "#fff",
    fontSize: 16,
    padding: "14px 18px",
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  },
  catGrid: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  catBtn: {
    padding: "8px 16px",
    borderRadius: 12,
    border: "1.5px solid",
    fontSize: 13,
    cursor: "pointer",
    transition: "all 0.2s",
    fontFamily: "inherit",
    fontWeight: 500,
  },
  priorityRow: { display: "flex", gap: 10 },
  priorityBtn: {
    flex: 1,
    padding: "10px",
    borderRadius: 12,
    border: "1.5px solid",
    fontSize: 13,
    cursor: "pointer",
    transition: "all 0.2s",
    fontFamily: "inherit",
    fontWeight: 600,
  },
  deadlineWrap: {
    background: "rgba(255,255,255,0.05)",
    border: "1.5px solid rgba(255,255,255,0.1)",
    borderRadius: 14,
    padding: "14px 18px",
  },
  dateInput: {
    width: "100%",
    background: "transparent",
    border: "none",
    color: "rgba(255,255,255,0.7)",
    fontSize: 15,
    outline: "none",
    fontFamily: "inherit",
    colorScheme: "dark",
  },
  submitBtn: {
    width: "100%",
    padding: "15px",
    borderRadius: 14,
    border: "none",
    color: "#fff",
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.3s",
    boxShadow: "0 6px 24px rgba(124,58,237,0.3)",
    letterSpacing: "0.3px",
  },
  goToListBtn: {
    width: "100%",
    padding: "12px",
    borderRadius: 12,
    background: "rgba(167,139,250,0.1)",
    border: "1px solid rgba(167,139,250,0.25)",
    color: "#c4b5fd",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.2s",
    marginTop: -8,
  },
  tipsCard: {
    background: "rgba(167,139,250,0.06)",
    border: "1px solid rgba(167,139,250,0.15)",
    borderRadius: 18,
    padding: "18px 20px",
  },
  tipsTitle: { color: "#c4b5fd", fontWeight: 700, fontSize: 14, marginBottom: 10 },
  tipsList: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 13,
    paddingLeft: 18,
    display: "flex",
    flexDirection: "column",
    gap: 7,
    lineHeight: 1.5,
  },
  gcalToggle: {
    display: "flex",
    alignItems: "center",
    padding: "12px 16px",
    background: "rgba(66,133,244,0.08)",
    border: "1px solid rgba(66,133,244,0.2)",
    borderRadius: 12,
    marginTop: -8,
  },
  gcalLabel: {
    display: "flex", alignItems: "center", gap: 10,
    cursor: "pointer", width: "100%",
  },
  gcalCheckbox: {
    width: 16, height: 16, cursor: "pointer", accentColor: "#4285f4",
  },
  gcalText: {
    color: "rgba(255,255,255,0.65)", fontSize: 13, fontWeight: 500,
  },
};
