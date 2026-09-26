import { useState, useEffect } from "react";
import { useGoogleLogin } from '@react-oauth/google';
import { formatDeadlineFull, getDeadlineStatus, CATEGORY_COLORS } from "../utils/deadlineUtils";
import { fetchAndParseElokICS } from "../utils/icsUtils";

const LMS_PLATFORMS = [
  {
    id: "elok",
    label: "Elok",
    fullName: "Elok (Moodle)",
    icon: "📖",
    color: "#f98012",
    badge: "From Elok",
    description: "Platform e-learning berbasis Moodle",
  },
  {
    id: "teams",
    label: "MS Teams",
    fullName: "Microsoft Teams",
    icon: "🟦",
    color: "#6264a7",
    badge: "From Teams",
    description: "Microsoft Teams for Education",
  },
  {
    id: "gcr",
    label: "Google Classroom",
    fullName: "Google Classroom",
    icon: "🎓",
    color: "#4285f4",
    badge: "From Classroom",
    description: "Google Classroom (GCR)",
  },
];

const LMS_SOURCE_CONFIG = {
  elok:  { color: "#f98012", badge: "📖 From Elok",       bg: "rgba(249,128,18,0.12)",  border: "rgba(249,128,18,0.3)" },
  teams: { color: "#6264a7", badge: "🟦 From Teams",      bg: "rgba(98,100,167,0.12)",  border: "rgba(98,100,167,0.3)" },
  gcr:   { color: "#4285f4", badge: "🎓 From Classroom",  bg: "rgba(66,133,244,0.12)", border: "rgba(66,133,244,0.3)" },
  lms:   { color: "#a78bfa", badge: "📚 From LMS",        bg: "rgba(167,139,250,0.12)", border: "rgba(167,139,250,0.3)" },
};

function LMSTaskCard({ task, onToggle, onDelete }) {
  const config = LMS_SOURCE_CONFIG[task.source] || LMS_SOURCE_CONFIG.lms;
  const catColor = CATEGORY_COLORS[task.category] || "#a78bfa";
  const status = getDeadlineStatus(task.deadline, task.done);

  const statusColors = {
    overdue: { color: "#ef4444", label: "🚨 Terlambat" },
    urgent:  { color: "#f97316", label: "⚡ Mendesak" },
    soon:    { color: "#facc15", label: "⏳ Segera" },
    ok:      { color: "#10b981", label: "✅ On Track" },
  };
  const sc = status ? statusColors[status] : null;

  return (
    <div style={{
      ...styles.lmsTaskCard,
      borderLeft: `4px solid ${config.color}`,
      opacity: task.done ? 0.5 : 1,
    }}>
      <div style={styles.lmsTaskTop}>
        {/* Source badge - prominent */}
        <span style={{
          ...styles.sourceBadge,
          color: config.color,
          background: config.bg,
          border: `1px solid ${config.border}`,
        }}>
          {config.badge}
        </span>
        {sc && (
          <span style={{ ...styles.statusBadge, color: sc.color }}>{sc.label}</span>
        )}
      </div>
      <div style={styles.lmsTaskMain}>
        <div
          style={{
            ...styles.lmsCheckbox,
            borderColor: task.done ? catColor : "rgba(255,255,255,0.2)",
            background: task.done ? catColor + "33" : "transparent",
          }}
          onClick={() => onToggle(task.id)}
        >
          {task.done && <span style={{ color: catColor, fontSize: 12 }}>✓</span>}
        </div>
        <div style={styles.lmsTaskContent}>
          <div style={{
            ...styles.lmsTaskText,
            textDecoration: task.done ? "line-through" : "none",
            color: task.done ? "rgba(255,255,255,0.3)" : "#fff",
          }}>
            {task.text}
          </div>
          {task.deadline && (
            <div style={styles.lmsDeadline}>
              ⏰ {formatDeadlineFull(task.deadline)}
            </div>
          )}
        </div>
        <button style={styles.lmsDelBtn} onClick={() => onDelete(task.id)}>×</button>
      </div>
    </div>
  );
}

export default function LMSPage({ tasks, onImport, onToggle, onDelete }) {
  const [activePlatform, setActivePlatform] = useState("elok");
  const [rows, setRows] = useState([{ text: "", deadline: "" }]);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  
  const [elokUrl, setElokUrl] = useState(localStorage.getItem("elok_ics_url") || "");
  const [isSyncing, setIsSyncing] = useState(false);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsSyncing(true);
      setError("");
      setSuccess("");
      try {
        const timeMin = new Date().toISOString();
        const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&maxResults=30&singleEvents=true&orderBy=startTime`, {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        });
        const data = await res.json();
        
        if (!data.items || data.items.length === 0) {
          setSuccess("✅ Sync berhasil. Tapi tidak ada event/tugas di Google Calendar kamu.");
          return;
        }

        const existingTasks = tasks.filter(t => t.source === "gcr");
        let addedCount = 0;
        const tasksToImport = [];

        for (const event of data.items) {
          if (!event.summary || (!event.start.dateTime && !event.start.date)) continue;
          
          const text = event.summary.trim();
          // Filter duplicates
          const isDuplicate = existingTasks.some(ext => ext.text.toLowerCase() === text.toLowerCase());
          
          if (!isDuplicate) {
            let deadline = event.start.dateTime || `${event.start.date}T23:59:00`;
            deadline = deadline.slice(0, 16); // format to local datetime string for input
            
            tasksToImport.push({
              text,
              deadline,
              source: 'gcr',
              category: '📚 Tugas',
            });
            addedCount++;
          }
        }

        if (tasksToImport.length > 0) {
          onImport(tasksToImport);
          setSuccess(`✅ ${addedCount} tugas baru berhasil di-sync dari Google Calendar!`);
        } else {
          setSuccess(`✅ Sync berhasil. Tidak ada tugas baru.`);
        }
      } catch (err) {
        setError("Gagal mengambil data dari Google Calendar.");
        console.error(err);
      } finally {
        setIsSyncing(false);
      }
    },
    onError: (error) => setError(`Login Gagal: ${error.error_description || "Unknown Error"}`),
    scope: 'https://www.googleapis.com/auth/calendar.readonly'
  });

  const platform = LMS_PLATFORMS.find((p) => p.id === activePlatform);
  const lmsTasks = tasks.filter((t) => t.source && t.source !== "manual");
  const platformTasks = tasks.filter((t) => t.source === activePlatform);

  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const minDatetime = now.toISOString().slice(0, 16);

  const addRow = () => setRows((prev) => [...prev, { text: "", deadline: "" }]);
  const removeRow = (i) => setRows((prev) => prev.filter((_, idx) => idx !== i));
  const updateRow = (i, field, val) =>
    setRows((prev) => prev.map((r, idx) => idx === i ? { ...r, [field]: val } : r));

  const handleImport = () => {
    const valid = rows.filter((r) => r.text.trim());
    if (valid.length === 0) { setError("Isi minimal satu nama tugas."); return; }
    const count = onImport(valid.map((r) => ({ ...r, source: activePlatform })));
    setSuccess(`✅ ${count} tugas dari ${platform.fullName} berhasil ditambahkan!`);
    setRows([{ text: "", deadline: "" }]);
    setError("");
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleSyncElok = async () => {
    if (!elokUrl) {
      setError("Masukkan URL Kalender Elok terlebih dahulu.");
      return;
    }
    
    // Save URL for future use
    localStorage.setItem("elok_ics_url", elokUrl);
    setIsSyncing(true);
    setError("");
    setSuccess("");

    try {
      const parsedTasks = await fetchAndParseElokICS(elokUrl);
      if (parsedTasks.length === 0) {
        setSuccess("✅ Sync berhasil. Tapi tidak ada tugas dengan deadline aktif saat ini.");
        setIsSyncing(false);
        return;
      }

      // Deduplication: Cek apakah task dengan nama yang mirip sudah ada
      const existingElokTasks = tasks.filter(t => t.source === "elok");
      let addedCount = 0;
      const tasksToImport = [];

      for (const t of parsedTasks) {
        // Cek duplikasi berdasar nama
        const isDuplicate = existingElokTasks.some(
          ext => ext.text.toLowerCase() === t.text.toLowerCase()
        );
        
        if (!isDuplicate) {
          tasksToImport.push(t);
          addedCount++;
        }
      }

      if (tasksToImport.length > 0) {
        onImport(tasksToImport);
        setSuccess(`✅ ${addedCount} tugas baru berhasil di-sync dari Elok! (${parsedTasks.length - addedCount} dilewati karena duplikat).`);
      } else {
        setSuccess(`✅ Sync berhasil. Tidak ada tugas baru (semua ${parsedTasks.length} tugas sudah ada).`);
      }

    } catch (err) {
      setError(err.message || "Gagal sinkronisasi dengan Elok.");
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSuccess(""), 5000);
    }
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <h1 style={styles.title}>📚 LMS</h1>
        <p style={styles.sub}>Tambah dan kelola tugas dari platform pembelajaran</p>
      </div>

      {/* Platform tabs */}
      <div style={styles.platformTabs}>
        {LMS_PLATFORMS.map((p) => {
          const count = tasks.filter((t) => t.source === p.id).length;
          return (
            <button
              key={p.id}
              style={{
                ...styles.platformTab,
                borderColor: activePlatform === p.id ? p.color : "rgba(255,255,255,0.07)",
                background: activePlatform === p.id ? p.color + "15" : "rgba(255,255,255,0.02)",
              }}
              onClick={() => { setActivePlatform(p.id); setError(""); setSuccess(""); }}
            >
              <span style={styles.platformIcon}>{p.icon}</span>
              <div style={styles.platformInfo}>
                <div style={{ ...styles.platformLabel, color: activePlatform === p.id ? p.color : "rgba(255,255,255,0.6)" }}>
                  {p.label}
                </div>
                <div style={styles.platformCount}>{count} tugas</div>
              </div>
            </button>
          );
        })}
      </div>

      <div style={styles.twoCol}>
        {/* Left: Input form */}
        <div style={styles.formCol}>
          <div style={styles.formCard}>
            <div style={styles.formHeader}>
              <span style={{ fontSize: 20 }}>{platform.icon}</span>
              <div>
                <div style={{ ...styles.formTitle, color: platform.color }}>{platform.fullName}</div>
                <div style={styles.formSub}>{platform.description}</div>
              </div>
            </div>

            {activePlatform === "elok" ? (
              // FORM AUTO SYNC ELOK
              <>
                <div style={styles.apiNotice}>
                  <span>🔗</span>
                  <span><strong>Auto-Sync:</strong> Paste URL Kalender (iCal/ICS) dari halaman kalender Elok untuk menarik semua tugas secara otomatis.</span>
                </div>
                
                <div style={styles.rowsList}>
                  <div style={styles.inputRow}>
                    <input
                      style={{ ...styles.textInput, padding: "12px", fontSize: 12, opacity: isSyncing ? 0.6 : 1 }}
                      placeholder="https://elok.ugm.ac.id/calendar/export_execute.php?..."
                      value={elokUrl}
                      onChange={(e) => setElokUrl(e.target.value)}
                      disabled={isSyncing}
                    />
                  </div>
                </div>

                {error && <div style={styles.errorMsg}>{error}</div>}
                {success && <div style={styles.successMsg}>{success}</div>}

                <button
                  style={{ 
                    ...styles.importBtn, 
                    background: `linear-gradient(135deg, ${platform.color}, ${platform.color}cc)`,
                    opacity: (isSyncing || !elokUrl) ? 0.6 : 1,
                    cursor: (isSyncing || !elokUrl) ? "not-allowed" : "pointer",
                  }}
                  onClick={handleSyncElok}
                  disabled={isSyncing || !elokUrl}
                >
                  {isSyncing ? "🔄 Membaca Kalender Elok..." : "🔄 Sinkronisasi Sekarang"}
                </button>
              </>
            ) : activePlatform === "gcr" ? (
              // FORM GOOGLE CALENDAR
              <>
                <div style={styles.apiNotice}>
                  <span>🗓️</span>
                  <span><strong>Google Calendar:</strong> Sinkronisasi otomatis tugas-tugas dari kalendermu. Pastikan kamu memberi izin akses kalender saat popup Google muncul.</span>
                </div>

                {error && <div style={styles.errorMsg}>{error}</div>}
                {success && <div style={styles.successMsg}>{success}</div>}

                <button
                  style={{ 
                    ...styles.importBtn, 
                    background: `linear-gradient(135deg, ${platform.color}, ${platform.color}cc)`,
                    opacity: isSyncing ? 0.6 : 1,
                    cursor: isSyncing ? "not-allowed" : "pointer",
                    marginBottom: 16
                  }}
                  onClick={() => googleLogin()}
                  disabled={isSyncing}
                >
                  {isSyncing ? "🔄 Membaca Google Calendar..." : "🔗 Sync dengan Google Calendar"}
                </button>

                <div style={styles.rowsHeader}>
                  <span style={styles.rowsLabel}>Atau Input Manual</span>
                  <button style={styles.addRowBtn} onClick={addRow}>+ Baris</button>
                </div>

                <div style={styles.rowsList}>
                  {rows.map((row, i) => (
                    <div key={i} style={styles.inputRow}>
                      <div style={{ ...styles.rowNum, borderColor: platform.color + "40", color: platform.color }}>
                        {i + 1}
                      </div>
                      <input
                        style={styles.textInput}
                        placeholder={`Tugas dari ${platform.label}...`}
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
                        <button style={styles.removeRowBtn} onClick={() => removeRow(i)}>×</button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  style={{ ...styles.importBtn, background: `linear-gradient(135deg, ${platform.color}, ${platform.color}cc)` }}
                  onClick={handleImport}
                >
                  📥 Tambah {rows.filter((r) => r.text.trim()).length || ""} Tugas Manual
                </button>
              </>
            ) : (
              // FORM MANUAL UNTUK TEAMS
              <>
                <div style={styles.apiNotice}>
                  <span>🔗</span>
                  <span>Koneksi API otomatis untuk {platform.label} sedang dalam pengembangan. Gunakan input manual.</span>
                </div>

                <div style={styles.rowsHeader}>
                  <span style={styles.rowsLabel}>Input Tugas Manual</span>
                  <button style={styles.addRowBtn} onClick={addRow}>+ Baris</button>
                </div>

                <div style={styles.rowsList}>
                  {rows.map((row, i) => (
                    <div key={i} style={styles.inputRow}>
                      <div style={{ ...styles.rowNum, borderColor: platform.color + "40", color: platform.color }}>
                        {i + 1}
                      </div>
                      <input
                        style={styles.textInput}
                        placeholder={`Tugas dari ${platform.label}...`}
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
                        <button style={styles.removeRowBtn} onClick={() => removeRow(i)}>×</button>
                      )}
                    </div>
                  ))}
                </div>

                {error && <div style={styles.errorMsg}>{error}</div>}
                {success && <div style={styles.successMsg}>{success}</div>}

                <button
                  style={{ ...styles.importBtn, background: `linear-gradient(135deg, ${platform.color}, ${platform.color}cc)` }}
                  onClick={handleImport}
                >
                  📥 Tambah {rows.filter((r) => r.text.trim()).length || ""} Tugas dari {platform.label}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right: Existing LMS tasks for this platform */}
        <div style={styles.listCol}>
          <div style={styles.listHeader}>
            <div style={styles.listTitle}>
              {platform.icon} Tugas {platform.label}
              <span style={{ ...styles.listCount, background: platform.color + "20", color: platform.color }}>
                {platformTasks.length}
              </span>
            </div>
            {lmsTasks.length > platformTasks.length && (
              <span style={styles.allLmsCount}>Total semua LMS: {lmsTasks.length}</span>
            )}
          </div>

          {platformTasks.length === 0 ? (
            <div style={styles.emptyList}>
              <span style={{ fontSize: 36, display: "block", marginBottom: 10 }}>
                {platform.icon}
              </span>
              <p style={styles.emptyText}>
                Belum ada tugas dari {platform.label}.<br />
                Tambahkan di form sebelah kiri.
              </p>
            </div>
          ) : (
            <div style={styles.taskList}>
              {platformTasks.map((task) => (
                <LMSTaskCard
                  key={task.id}
                  task={task}
                  onToggle={onToggle}
                  onDelete={onDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrap: { padding: "32px 36px", overflowY: "auto", height: "100%" },
  header: { marginBottom: 24 },
  title: { fontSize: 26, fontWeight: 800, color: "#fff", margin: "0 0 6px" },
  sub: { color: "rgba(255,255,255,0.35)", fontSize: 14, margin: 0 },
  platformTabs: { display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" },
  platformTab: {
    display: "flex", alignItems: "center", gap: 10,
    padding: "12px 18px", borderRadius: 14,
    border: "1.5px solid", cursor: "pointer",
    fontFamily: "inherit", transition: "all 0.2s",
    flex: "1 1 auto",
  },
  platformIcon: { fontSize: 22, flexShrink: 0 },
  platformInfo: { textAlign: "left" },
  platformLabel: { fontSize: 13, fontWeight: 700 },
  platformCount: { color: "rgba(255,255,255,0.25)", fontSize: 11, marginTop: 1 },
  twoCol: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20,
    alignItems: "start",
  },
  formCol: {},
  formCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 20,
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  formHeader: { display: "flex", gap: 12, alignItems: "center" },
  formTitle: { fontSize: 14, fontWeight: 700 },
  formSub: { color: "rgba(255,255,255,0.3)", fontSize: 12, marginTop: 2 },
  apiNotice: {
    display: "flex", gap: 8, alignItems: "flex-start",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 10, padding: "10px 12px",
    color: "rgba(255,255,255,0.3)", fontSize: 12, lineHeight: 1.5,
  },
  rowsHeader: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  rowsLabel: { color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 600 },
  addRowBtn: {
    background: "rgba(167,139,250,0.12)",
    border: "1px solid rgba(167,139,250,0.25)",
    color: "#c4b5fd", borderRadius: 8,
    padding: "4px 10px", fontSize: 12,
    cursor: "pointer", fontFamily: "inherit", fontWeight: 600,
  },
  rowsList: { display: "flex", flexDirection: "column", gap: 8 },
  inputRow: { display: "flex", gap: 8, alignItems: "center" },
  rowNum: {
    width: 24, height: 24, borderRadius: 6,
    border: "1.5px solid",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 11, fontWeight: 700, flexShrink: 0,
  },
  textInput: {
    flex: 1.5, background: "rgba(255,255,255,0.05)",
    border: "1.5px solid rgba(255,255,255,0.08)",
    borderRadius: 10, color: "#fff", fontSize: 13,
    padding: "8px 12px", outline: "none",
    fontFamily: "inherit", minWidth: 0,
  },
  dateInput: {
    flex: 1, background: "rgba(255,255,255,0.05)",
    border: "1.5px solid rgba(255,255,255,0.08)",
    borderRadius: 10, color: "rgba(255,255,255,0.6)",
    fontSize: 11, padding: "8px 10px",
    outline: "none", fontFamily: "inherit",
    colorScheme: "dark", minWidth: 0,
  },
  removeRowBtn: {
    background: "transparent", border: "none",
    color: "rgba(239,68,68,0.5)", fontSize: 18,
    cursor: "pointer", flexShrink: 0,
  },
  errorMsg: {
    background: "rgba(239,68,68,0.08)",
    border: "1px solid rgba(239,68,68,0.2)",
    borderRadius: 10, padding: "10px 14px",
    color: "#f87171", fontSize: 13,
  },
  successMsg: {
    background: "rgba(16,185,129,0.08)",
    border: "1px solid rgba(16,185,129,0.2)",
    borderRadius: 10, padding: "10px 14px",
    color: "#34d399", fontSize: 13, fontWeight: 600,
  },
  importBtn: {
    width: "100%", padding: "12px", borderRadius: 12,
    border: "none", color: "#fff", fontSize: 13,
    fontWeight: 700, cursor: "pointer",
    fontFamily: "inherit",
  },
  listCol: {},
  listHeader: {
    display: "flex", justifyContent: "space-between",
    alignItems: "center", marginBottom: 12,
  },
  listTitle: {
    color: "#fff", fontWeight: 700, fontSize: 14,
    display: "flex", alignItems: "center", gap: 8,
  },
  listCount: {
    fontSize: 11, fontWeight: 700,
    padding: "2px 8px", borderRadius: 100,
  },
  allLmsCount: { color: "rgba(255,255,255,0.25)", fontSize: 11 },
  taskList: { display: "flex", flexDirection: "column", gap: 8 },
  emptyList: {
    textAlign: "center", padding: "40px 20px",
    background: "rgba(255,255,255,0.02)",
    border: "1px dashed rgba(255,255,255,0.06)",
    borderRadius: 16,
  },
  emptyText: { color: "rgba(255,255,255,0.2)", fontSize: 13, margin: 0, lineHeight: 1.6 },
  // Task card
  lmsTaskCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 14, padding: "12px 14px",
    transition: "all 0.2s",
  },
  lmsTaskTop: { display: "flex", gap: 6, marginBottom: 8, alignItems: "center", flexWrap: "wrap" },
  sourceBadge: {
    fontSize: 11, fontWeight: 700,
    padding: "3px 10px", borderRadius: 100,
  },
  statusBadge: { fontSize: 11, fontWeight: 600 },
  lmsTaskMain: { display: "flex", alignItems: "flex-start", gap: 10 },
  lmsCheckbox: {
    width: 20, height: 20, borderRadius: 6,
    border: "2px solid", display: "flex",
    alignItems: "center", justifyContent: "center",
    cursor: "pointer", flexShrink: 0,
    marginTop: 1, transition: "all 0.25s",
  },
  lmsTaskContent: { flex: 1, minWidth: 0 },
  lmsTaskText: { fontSize: 13, fontWeight: 500, lineHeight: 1.4, marginBottom: 4, transition: "all 0.3s" },
  lmsDeadline: { color: "rgba(255,255,255,0.3)", fontSize: 11 },
  lmsDelBtn: {
    background: "transparent", border: "none",
    color: "rgba(255,255,255,0.15)", fontSize: 16,
    cursor: "pointer", flexShrink: 0,
    transition: "color 0.2s",
    lineHeight: 1, padding: "2px",
  },
};
