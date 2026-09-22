import { useState } from "react";
import TaskItem from "./TaskItem";
import { getDeadlineStatus, isToday } from "../utils/deadlineUtils";

export default function TaskList({ tasks, filter, onToggle, onDelete, onEdit }) {
  const [search, setSearch] = useState("");

  const filtered = tasks.filter((t) => {
    if (search && !t.text.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === "Semua")    return true;
    if (filter === "Belum")    return !t.done;
    if (filter === "Selesai")  return t.done;
    if (filter === "Mendesak") {
      if (t.done) return false;
      const s = getDeadlineStatus(t.deadline, false);
      return s === "overdue" || s === "urgent";
    }
    if (filter === "Hari Ini") {
      if (t.done) return false;
      return isToday(t.deadline);
    }
    return true;
  });

  return (
    <div>
      {/* Search bar */}
      <div style={styles.searchWrap}>
        <span style={styles.searchIcon}>🔍</span>
        <input
          style={styles.searchInput}
          placeholder="Cari tugas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button style={styles.clearSearch} onClick={() => setSearch("")}>×</button>
        )}
      </div>

      {/* List */}
      <div style={styles.list}>
        {filtered.length === 0 ? (
          <div style={styles.empty}>
            <span style={{ fontSize: 42, display: "block", marginBottom: 10 }}>
              {search ? "🔍" : filter === "Selesai" ? "🏆" : filter === "Mendesak" ? "😌" : "🌙"}
            </span>
            <p style={styles.emptyText}>
              {search
                ? `Tidak ada tugas dengan kata "${search}"`
                : filter === "Selesai"  ? "Belum ada yang selesai nih"
                : filter === "Mendesak" ? "Tidak ada yang mendesak, santai!"
                : filter === "Hari Ini" ? "Tidak ada tugas deadline hari ini"
                : "Tambah rencana pertamamu! 🚀"}
            </p>
          </div>
        ) : (
          filtered.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={onToggle}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))
        )}
      </div>

      {filtered.length > 0 && (
        <div style={styles.countBar}>
          {filtered.length} tugas ditampilkan
          {search && ` · pencarian "${search}"`}
        </div>
      )}
    </div>
  );
}

const styles = {
  searchWrap: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "rgba(255,255,255,0.04)",
    border: "1.5px solid rgba(255,255,255,0.07)",
    borderRadius: 12,
    padding: "9px 14px",
    marginBottom: 10,
  },
  searchIcon: { fontSize: 13, opacity: 0.4 },
  searchInput: {
    flex: 1, background: "transparent", border: "none",
    color: "rgba(255,255,255,0.7)", fontSize: 13,
    outline: "none", fontFamily: "inherit",
  },
  clearSearch: {
    background: "transparent", border: "none",
    color: "rgba(255,255,255,0.3)", fontSize: 18,
    cursor: "pointer", lineHeight: 1, padding: 0,
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 7,
    maxHeight: 420,
    overflowY: "auto",
    paddingRight: 2,
  },
  empty: { textAlign: "center", padding: "40px 0" },
  emptyText: { color: "rgba(255,255,255,0.2)", fontSize: 14, margin: 0 },
  countBar: {
    color: "rgba(255,255,255,0.2)",
    fontSize: 11,
    textAlign: "right",
    marginTop: 8,
    paddingRight: 4,
  },
};