import { useState } from "react";

const LMS_TABS = [
  { id: "gcr",   label: "Google Classroom", icon: "🎓", color: "#4285f4", hint: "Google Classroom" },
  { id: "teams", label: "MS Teams",         icon: "🟦", color: "#6264a7", hint: "Microsoft Teams" },
  { id: "elok",  label: "Elok (Moodle)",    icon: "📖", color: "#f98012", hint: "Elok / Moodle" },
];

/**
 * Stub placeholder untuk koneksi API real LMS.
 * Untuk koneksi sungguhan, isi fungsi-fungsi ini dengan API call setelah dapat OAuth credentials.
 * 
 * GCR: https://developers.google.com/classroom/reference/rest
 * Teams: https://learn.microsoft.com/en-us/graph/api/resources/educationassignment
 * Moodle/Elok: https://docs.moodle.org/dev/Web_service_API_functions#mod_assign_get_assignments
 */
async function fetchFromLMS(source) {
  // TODO: Implementasi OAuth + API call sesuai platform
  throw new Error(`API ${source} belum terhubung. Silakan input manual.`);
}

export default function LMSImport({ onImport, onClose }) {
  const [activeTab, setActiveTab] = useState("gcr");
  const [rows, setRows] = useState([{ text: "", deadline: "" }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const tab = LMS_TABS.find((t) => t.id === activeTab);

  const addRow = () => setRows((prev) => [...prev, { text: "", deadline: "" }]);
  const removeRow = (i) => setRows((prev) => prev.filter((_, idx) => idx !== i));
  const updateRow = (i, field, val) =>
    setRows((prev) => prev.map((r, idx) => idx === i ? { ...r, [field]: val } : r));

  // Min datetime = sekarang
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const minDatetime = now.toISOString().slice(0, 16);

  const handleAutoFetch = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchFromLMS(activeTab);
      // data diharapkan berupa array { text, deadline }
      setRows(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = () => {
    const valid = rows.filter((r) => r.text.trim());
    if (valid.length === 0) {
      setError("Minimal satu tugas harus diisi.");
      return;
    }
    const count = onImport(valid.map((r) => ({ ...r, source: activeTab })));
    setSuccess(`✅ ${count} tugas berhasil diimport!`);
    setRows([{ text: "", deadline: "" }]);
    setTimeout(() => { setSuccess(""); onClose(); }, 1800);
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>📥 Import dari LMS</h2>
            <p style={styles.sub}>Tambah tugas dari platform pembelajaran kamu</p>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        {/* LMS Tabs */}
        <div style={styles.tabs}>
          {LMS_TABS.map((t) => (
            <button
              key={t.id}
              style={{
                ...styles.tabBtn,
                borderColor: activeTab === t.id ? t.color : "transparent",
                background: activeTab === t.id ? t.color + "18" : "transparent",
                color: activeTab === t.id ? t.color : "rgba(255,255,255,0.35)",
              }}
              onClick={() => { setActiveTab(t.id); setError(""); setSuccess(""); }}
            >
              <span>{t.icon}</span>
              <span style={{ fontSize: 12 }}>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Auto-fetch info */}
        <div style={styles.infoBox}>
          <div style={styles.infoRow}>
            <span style={styles.infoIcon}>ℹ️</span>
            <span style={styles.infoText}>
              Koneksi otomatis ke <strong style={{ color: tab.color }}>{tab.hint}</strong> memerlukan pengaturan OAuth.
              Untuk sekarang, isi tugas secara manual di bawah.
            </span>
          </div>
          <button
            style={{ ...styles.autoBtn, borderColor: tab.color, color: tab.color, opacity: 0.5 }}
            onClick={handleAutoFetch}
            disabled
            title="Fitur ini akan aktif setelah OAuth dikonfigurasi"
          >
            {loading ? "⏳ Menghubungkan..." : `🔗 Hubungkan ${tab.hint}`}
          </button>
        </div>

        {/* Manual input rows */}
        <div style={styles.rowsWrap}>
          <div style={styles.rowsHeader}>
            <span style={styles.rowsTitle}>Input Manual Tugas</span>
            <button style={styles.addRowBtn} onClick={addRow}>+ Tambah Baris</button>
          </div>

          {rows.map((row, i) => (
            <div key={i} style={styles.inputRow}>
              <div style={styles.rowNum}>{i + 1}</div>
              <input
                style={styles.textInput}
                placeholder={`Nama tugas dari ${tab.hint}...`}
                value={row.text}
                onChange={(e) => updateRow(i, "text", e.target.value)}
              />
              <input
                type="datetime-local"
                style={styles.dateInput}
                value={row.deadline}
                min={minDatetime}
                onChange={(e) => updateRow(i, "deadline", e.target.value)}
              />
              {rows.length > 1 && (
                <button style={styles.removeRow} onClick={() => removeRow(i)}>×</button>
              )}
            </div>
          ))}
        </div>

        {/* Messages */}
        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.successMsg}>{success}</div>}

        {/* Actions */}
        <div style={styles.actions}>
          <button style={styles.cancelBtn} onClick={onClose}>Batal</button>
          <button
            style={{ ...styles.importBtn, background: `linear-gradient(135deg, ${tab.color}, ${tab.color}99)` }}
            onClick={handleImport}
          >
            📥 Import {rows.filter((r) => r.text.trim()).length} Tugas
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,0.8)",
    backdropFilter: "blur(8px)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 1100, padding: 16,
  },
  modal: {
    background: "linear-gradient(135deg, #1a1a2e, #16213e)",
    border: "1.5px solid rgba(255,255,255,0.1)",
    borderRadius: 24, padding: "28px",
    maxWidth: 520, width: "100%",
    boxShadow: "0 40px 100px rgba(0,0,0,0.6)",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
    marginBottom: 20,
  },
  title: { color: "#fff", fontSize: 20, fontWeight: 800, margin: "0 0 4px" },
  sub: { color: "rgba(255,255,255,0.35)", fontSize: 13, margin: 0 },
  closeBtn: {
    background: "transparent", border: "none",
    color: "rgba(255,255,255,0.35)", fontSize: 24,
    cursor: "pointer", lineHeight: 1, padding: 0,
    transition: "color 0.2s",
  },
  tabs: { display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" },
  tabBtn: {
    display: "flex", alignItems: "center", gap: 6,
    padding: "8px 14px", borderRadius: 12,
    border: "1.5px solid", cursor: "pointer",
    fontFamily: "inherit", fontWeight: 600,
    transition: "all 0.2s",
  },
  infoBox: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 14, padding: "12px 14px",
    marginBottom: 16, display: "flex",
    flexDirection: "column", gap: 10,
  },
  infoRow: { display: "flex", gap: 8, alignItems: "flex-start" },
  infoIcon: { fontSize: 14, flexShrink: 0, marginTop: 1 },
  infoText: { color: "rgba(255,255,255,0.4)", fontSize: 12, lineHeight: 1.5 },
  autoBtn: {
    background: "transparent",
    border: "1px solid",
    borderRadius: 10, padding: "7px 14px",
    fontSize: 12, fontWeight: 600,
    cursor: "not-allowed", fontFamily: "inherit",
    transition: "all 0.2s",
    alignSelf: "flex-start",
  },
  rowsWrap: { marginBottom: 16 },
  rowsHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    marginBottom: 10,
  },
  rowsTitle: { color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 600 },
  addRowBtn: {
    background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.3)",
    color: "#c4b5fd", borderRadius: 8, padding: "5px 12px",
    fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 600,
  },
  inputRow: {
    display: "flex", gap: 8, alignItems: "center",
    marginBottom: 8,
  },
  rowNum: {
    color: "rgba(255,255,255,0.25)", fontSize: 12,
    width: 18, flexShrink: 0, textAlign: "center",
  },
  textInput: {
    flex: 1.5,
    background: "rgba(255,255,255,0.06)",
    border: "1.5px solid rgba(255,255,255,0.09)",
    borderRadius: 10, color: "#fff", fontSize: 13,
    padding: "9px 12px", outline: "none", fontFamily: "inherit",
    minWidth: 0,
  },
  dateInput: {
    flex: 1,
    background: "rgba(255,255,255,0.06)",
    border: "1.5px solid rgba(255,255,255,0.09)",
    borderRadius: 10, color: "rgba(255,255,255,0.65)", fontSize: 12,
    padding: "9px 10px", outline: "none", fontFamily: "inherit",
    colorScheme: "dark", minWidth: 0,
  },
  removeRow: {
    background: "transparent", border: "none",
    color: "rgba(239,68,68,0.5)", fontSize: 18,
    cursor: "pointer", flexShrink: 0, padding: "0 4px",
    transition: "color 0.2s",
  },
  error: {
    background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
    borderRadius: 10, padding: "10px 14px",
    color: "#f87171", fontSize: 13, marginBottom: 14,
  },
  successMsg: {
    background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)",
    borderRadius: 10, padding: "10px 14px",
    color: "#34d399", fontSize: 13, marginBottom: 14, fontWeight: 600,
  },
  actions: { display: "flex", gap: 10 },
  cancelBtn: {
    flex: 1, padding: "12px", borderRadius: 12,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "rgba(255,255,255,0.5)", fontSize: 14,
    cursor: "pointer", fontFamily: "inherit",
  },
  importBtn: {
    flex: 2, padding: "12px", borderRadius: 12,
    border: "none", color: "#fff", fontSize: 14,
    fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
  },
};
