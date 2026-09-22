export const CATEGORY_COLORS = {
  "📋 Pribadi":  "#f59e0b",
  "💼 Kerja":    "#3b82f6",
  "🎯 Goal":     "#10b981",
  "🛒 Belanja":  "#ec4899",
  "📚 Tugas":    "#a78bfa",   // Untuk import dari LMS
};

export const CATEGORIES = Object.keys(CATEGORY_COLORS);
export const FILTERS = ["Semua", "Belum", "Mendesak", "Hari Ini", "Selesai"];

export const LEVEL_THRESHOLDS = [
  { level: 1, title: "Pemula",      icon: "🌱", min: 0 },
  { level: 2, title: "Pejuang",     icon: "⚔️",  min: 100 },
  { level: 3, title: "Petualang",   icon: "🗺️",  min: 250 },
  { level: 4, title: "Veteran",     icon: "🛡️",  min: 500 },
  { level: 5, title: "Master",      icon: "🔥",  min: 900 },
  { level: 6, title: "Legenda",     icon: "👑",  min: 1500 },
];

export const XP_REWARDS = {
  complete_normal:  20,
  complete_urgent:  50,
  complete_overdue: 10,
  streak_bonus:     15,
  add_task:          5,
};

export function getLevelInfo(xp) {
  let current = LEVEL_THRESHOLDS[0];
  let next = LEVEL_THRESHOLDS[1];
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i].min) {
      current = LEVEL_THRESHOLDS[i];
      next = LEVEL_THRESHOLDS[i + 1] || null;
      break;
    }
  }
  const progress = next
    ? ((xp - current.min) / (next.min - current.min)) * 100
    : 100;
  return { current, next, progress };
}

/** Sisa waktu dalam menit */
export function getMinutesLeft(deadline) {
  if (!deadline) return null;
  return Math.floor((new Date(deadline) - new Date()) / 60000);
}

export function getDeadlineStatus(deadline, done) {
  if (!deadline || done) return null;
  const mins = getMinutesLeft(deadline);
  if (mins < 0) return "overdue";
  if (mins <= 60) return "urgent";
  if (mins <= 60 * 48) return "soon";
  return "ok";
}

export function formatDeadlineLabel(deadline) {
  if (!deadline) return null;
  const mins = getMinutesLeft(deadline);
  if (mins === null) return null;
  const dl = new Date(deadline);
  if (mins < 0) {
    const abs = Math.abs(mins);
    if (abs < 60) return `Terlambat ${abs} mnt`;
    if (abs < 1440) return `Terlambat ${Math.floor(abs / 60)} jam`;
    return `Terlambat ${Math.floor(abs / 1440)} hari`;
  }
  if (mins < 60) return `${mins} menit lagi`;
  if (mins < 1440) return `${Math.floor(mins / 60)} jam lagi`;
  if (mins < 2880) return `Besok ${dl.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`;
  return (
    dl.toLocaleDateString("id-ID", { day: "numeric", month: "short" }) +
    " " +
    dl.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
  );
}

export function formatDeadlineFull(deadline) {
  if (!deadline) return null;
  const dl = new Date(deadline);
  return (
    dl.toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) +
    " " +
    dl.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
  );
}

export function getNearDeadlineTasks(tasks) {
  return tasks.filter((t) => {
    if (t.done) return false;
    const s = getDeadlineStatus(t.deadline, t.done);
    return s === "overdue" || s === "urgent" || s === "soon";
  });
}

/** Apakah task deadline-nya hari ini */
export function isToday(deadline) {
  if (!deadline) return false;
  const dl = new Date(deadline);
  const now = new Date();
  return (
    dl.getFullYear() === now.getFullYear() &&
    dl.getMonth() === now.getMonth() &&
    dl.getDate() === now.getDate()
  );
}

/** Build Google Calendar link untuk satu task */
export function buildGoogleCalendarUrl(task) {
  const title = encodeURIComponent(task.text);
  const details = encodeURIComponent(`Kategori: ${task.category}\nDibuat via Plan Saya`);
  let dates = "";
  if (task.deadline) {
    const end = new Date(task.deadline);
    const start = new Date(); // Start event from now
    
    // If deadline is in the past, fallback to a 1 hour event from now
    if (end < start) {
      end.setTime(start.getTime() + 60 * 60 * 1000);
    }
    
    const fmt = (d) =>
      d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    dates = `${fmt(start)}/${fmt(end)}`;
  } else {
    // Semua hari ini tanpa waktu spesifik
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    dates = `${today}/${today}`;
  }
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&sf=true&output=xml`;
}