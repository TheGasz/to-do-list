import { useState } from "react";
import {
  CATEGORY_COLORS, getDeadlineStatus, formatDeadlineLabel, formatDeadlineFull, buildGoogleCalendarUrl,
} from "../utils/deadlineUtils";

const BADGE = {
  overdue: { bg: "rgba(239,68,68,0.15)",  border: "rgba(239,68,68,0.3)",  color: "#ef4444", icon: "🚨" },
  urgent:  { bg: "rgba(249,115,22,0.15)", border: "rgba(249,115,22,0.3)", color: "#f97316", icon: "⚡" },
  soon:    { bg: "rgba(250,204,21,0.12)", border: "rgba(250,204,21,0.25)",color: "#facc15", icon: "⏳" },
  ok:      { bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.25)",color: "#10b981", icon: "✅" },
};

// Badge konfigurasi untuk tiap platform LMS
const LMS_BADGE = {
  elok:  { icon: "📖", label: "From Elok",       color: "#f98012", bg: "rgba(249,128,18,0.12)",  border: "rgba(249,128,18,0.3)" },
  teams: { icon: "🟦", label: "From Teams",       color: "#6264a7", bg: "rgba(98,100,167,0.12)",  border: "rgba(98,100,167,0.3)" },
  gcr:   { icon: "🎓", label: "From Classroom",   color: "#4285f4", bg: "rgba(66,133,244,0.12)",  border: "rgba(66,133,244,0.3)" },
  lms:   { icon: "📚", label: "From LMS",         color: "#a78bfa", bg: "rgba(167,139,250,0.12)", border: "rgba(167,139,250,0.3)" },
};

export default function TaskItem({ task, onToggle, onDelete, onEdit }) {
  const [hoverDel, setHoverDel] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const [showActions, setShowActions] = useState(false);

  const status = getDeadlineStatus(task.deadline, task.done);
  const catColor = CATEGORY_COLORS[task.category] || "#a78bfa";
  const badge = status ? BADGE[status] : null;
  const dlLabel = formatDeadlineLabel(task.deadline);
  const dlFull = formatDeadlineFull(task.deadline);
  const calUrl = buildGoogleCalendarUrl(task);

  // LMS source badge
  const lmsBadge = task.source && task.source !== "manual" ? LMS_BADGE[task.source] || LMS_BADGE.lms : null;

  const handleEditSave = () => {
    if (editText.trim() && editText.trim() !== task.text) {
      onEdit(task.id, { text: editText.trim() });
    }
    setEditing(false);
  };

  const handleEditKey = (e) => {
    if (e.key === "Enter") handleEditSave();
    if (e.key === "Escape") { setEditText(task.text); setEditing(false); }
  };

  return (
    <div
      className="task-item"
      style={{
        ...styles.item,
        background: task.done
          ? "rgba(167,139,250,0.04)"
          : status === "overdue" ? "rgba(239,68,68,0.05)"
          : status === "urgent"  ? "rgba(249,115,22,0.05)"
          : "rgba(255,255,255,0.04)",
        border: `1.5px solid ${
          status === "overdue" ? "rgba(239,68,68,0.3)"
          : status === "urgent"  ? "rgba(249,115,22,0.3)"
          : task.done ? "rgba(167,139,250,0.12)"
          : "rgba(255,255,255,0.07)"
        }`,
        opacity: task.done ? 0.55 : 1,
      }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Left accent bar */}
      <div
        style={{
          ...styles.accentBar,
          background: lmsBadge ? lmsBadge.color : (task.done ? "rgba(167,139,250,0.3)" : catColor),
          opacity: task.done ? 0.4 : 0.7,
        }}
      />

      {/* Checkbox */}
      <div
        style={{
          ...styles.checkbox,
          borderColor: task.done ? catColor : "rgba(255,255,255,0.2)",
          background: task.done ? catColor + "33" : "transparent",
          boxShadow: task.done ? `0 0 8px ${catColor}40` : "none",
        }}
        onClick={() => onToggle(task.id)}
        title={task.done ? "Tandai belum" : "Tandai selesai"}
      >
        {task.done && <span style={{ color: catColor, fontSize: 12 }}>✓</span>}
      </div>

      {/* Content */}
      <div style={styles.content}>
        {editing ? (
          <input
            autoFocus
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleEditSave}
            onKeyDown={handleEditKey}
            style={styles.editInput}
          />
        ) : (
          <span
            style={{
              ...styles.text,
              color: task.done ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.88)",
              textDecoration: task.done ? "line-through" : "none",
            }}
            onDoubleClick={() => !task.done && setEditing(true)}
            title="Double-click untuk edit"
          >
            {task.text}
          </span>
        )}

        {/* Meta row */}
        <div style={styles.meta}>
          {/* LMS source badge — tampil paling depan kalau ada */}
          {lmsBadge && (
            <span style={{
              ...styles.lmsSourceBadge,
              color: lmsBadge.color,
              background: lmsBadge.bg,
              border: `1px solid ${lmsBadge.border}`,
            }}>
              {lmsBadge.icon} {lmsBadge.label}
            </span>
          )}

          <span style={{ ...styles.catTag, background: catColor + "18", color: catColor, border: `1px solid ${catColor}30` }}>
            {task.category}
          </span>

          {dlLabel && badge && (
            <span
              style={{ ...styles.badge, background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}
              title={dlFull}
            >
              {badge.icon} {dlLabel}
            </span>
          )}
          {dlLabel && !badge && task.deadline && (
            <span style={{ ...styles.badge, background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.3)" }} title={dlFull}>
              📅 {dlLabel}
            </span>
          )}
        </div>
      </div>

      {/* Action buttons — visible on hover */}
      <div style={{ ...styles.actions, opacity: showActions || editing ? 1 : 0 }}>
        <a
          href={calUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={styles.actionBtn}
          title="Tambah ke Google Calendar"
          onClick={(e) => e.stopPropagation()}
        >
          📅
        </a>

        {!task.done && (
          <button
            style={styles.actionBtn}
            onClick={() => { setEditing(true); setEditText(task.text); }}
            title="Edit tugas"
          >
            ✏️
          </button>
        )}

        <button
          style={{
            ...styles.actionBtn,
            color: hoverDel ? "#f87171" : "rgba(255,255,255,0.25)",
            fontSize: 16,
          }}
          onMouseEnter={() => setHoverDel(true)}
          onMouseLeave={() => setHoverDel(false)}
          onClick={() => onDelete(task.id)}
          title="Hapus tugas"
        >
          ×
        </button>
      </div>
    </div>
  );
}

const styles = {
  item: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    borderRadius: 14,
    padding: "11px 12px 11px 0",
    transition: "all 0.25s ease",
    position: "relative",
    overflow: "hidden",
  },
  accentBar: {
    width: 4,
    alignSelf: "stretch",
    borderRadius: "0 4px 4px 0",
    flexShrink: 0,
    transition: "all 0.3s",
  },
  checkbox: {
    width: 22, height: 22,
    borderRadius: 8, border: "2px solid",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", flexShrink: 0, transition: "all 0.25s",
  },
  content: { flex: 1, minWidth: 0 },
  text: {
    fontSize: 14, display: "block", marginBottom: 5,
    transition: "all 0.3s", lineHeight: 1.4, cursor: "default",
  },
  meta: { display: "flex", gap: 5, flexWrap: "wrap", alignItems: "center" },
  lmsSourceBadge: {
    fontSize: 11, fontWeight: 700,
    padding: "2px 9px", borderRadius: 100,
    whiteSpace: "nowrap",
  },
  catTag: {
    fontSize: 11, padding: "2px 8px",
    borderRadius: 100, whiteSpace: "nowrap", fontWeight: 500,
  },
  badge: {
    fontSize: 11, padding: "2px 8px",
    borderRadius: 100, fontWeight: 600,
    whiteSpace: "nowrap", cursor: "default",
  },
  actions: {
    display: "flex", alignItems: "center",
    gap: 2, flexShrink: 0, transition: "opacity 0.2s",
  },
  actionBtn: {
    background: "transparent", border: "none",
    fontSize: 14, cursor: "pointer",
    padding: "4px 6px", borderRadius: 8,
    transition: "all 0.2s", lineHeight: 1,
    textDecoration: "none", display: "flex",
    alignItems: "center", color: "rgba(255,255,255,0.4)",
  },
  editInput: {
    width: "100%",
    background: "rgba(255,255,255,0.08)",
    border: "1.5px solid rgba(167,139,250,0.4)",
    borderRadius: 8, color: "#fff", fontSize: 14,
    padding: "4px 10px", outline: "none",
    fontFamily: "inherit", marginBottom: 5, boxSizing: "border-box",
  },
};