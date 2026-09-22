import { useState, useEffect } from "react";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

const NAV_ITEMS = [
  {
    id: "beranda",
    label: "Beranda",
    shortLabel: "Beranda",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#c4b5fd" : "rgba(255,255,255,0.45)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9,22 9,12 15,12 15,22"/>
      </svg>
    ),
  },
  {
    id: "tambah",
    label: "Tambah Tugas",
    shortLabel: "Tambah",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#c4b5fd" : "rgba(255,255,255,0.45)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="16"/>
        <line x1="8" y1="12" x2="16" y2="12"/>
      </svg>
    ),
  },
  {
    id: "aktivitas",
    label: "Aktivitas",
    shortLabel: "Aktivitas",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#c4b5fd" : "rgba(255,255,255,0.45)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
  },
  {
    id: "lms",
    label: "LMS",
    shortLabel: "LMS",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#c4b5fd" : "rgba(255,255,255,0.45)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
      </svg>
    ),
  },
];

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
}

export default function Sidebar({ activePage, onNavigate }) {
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!auth) return;
    return auth.onAuthStateChanged((u) => setUser(u));
  }, []);

  // ─── Mobile Bottom Navigation Bar ──────────────────────────────────────────
  if (isMobile) {
    return (
      <nav style={mobileStyles.bottomNav}>
        {NAV_ITEMS.map((item) => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              style={{
                ...mobileStyles.navBtn,
                ...(isActive ? mobileStyles.navBtnActive : {}),
              }}
              onClick={() => onNavigate(item.id)}
              title={item.label}
            >
              {item.icon(isActive)}
              <span style={{
                fontSize: 10, fontWeight: 600, marginTop: 2,
                color: isActive ? "#c4b5fd" : "rgba(255,255,255,0.4)",
                transition: "color 0.2s",
              }}>
                {item.shortLabel}
              </span>
              {isActive && <div style={mobileStyles.activeDot} />}
            </button>
          );
        })}
      </nav>
    );
  }

  // ─── Desktop Sidebar ────────────────────────────────────────────────────────
  return (
    <aside style={{ ...styles.sidebar, width: collapsed ? 64 : 220 }}>
      {/* Logo */}
      <div style={styles.logoWrap}>
        <div style={styles.logoIcon}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11l3 3L22 4"/>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
          </svg>
        </div>
        {!collapsed && (
          <div style={styles.logoText}>
            <div style={styles.logoTitle}>Plan Saya</div>
            <div style={styles.logoSub}>Produktivitas</div>
          </div>
        )}
      </div>

      <div style={styles.divider} />

      {/* Nav items */}
      <nav style={styles.nav}>
        {NAV_ITEMS.map((item) => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              style={{
                ...styles.navBtn,
                background: isActive ? "rgba(167,139,250,0.15)" : "transparent",
                borderLeft: isActive ? "3px solid #a78bfa" : "3px solid transparent",
                color: isActive ? "#c4b5fd" : "rgba(255,255,255,0.4)",
                justifyContent: collapsed ? "center" : "flex-start",
              }}
              onClick={() => onNavigate(item.id)}
              title={item.label}
            >
              {item.icon(isActive)}
              {!collapsed && <span style={styles.navLabel}>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* User Profile */}
      {user && (
        <div style={{ ...styles.userProfile, justifyContent: collapsed ? "center" : "flex-start" }}>
          <img
            src={user.photoURL}
            alt="Profile"
            style={styles.userAvatar}
            onClick={collapsed ? () => signOut(auth) : undefined}
            title={collapsed ? "Logout" : undefined}
          />
          {!collapsed && (
            <div style={styles.userInfo}>
              <div style={styles.userName}>{user.displayName}</div>
              <button style={styles.logoutBtn} onClick={() => signOut(auth)}>Logout</button>
            </div>
          )}
        </div>
      )}

      {/* Bottom: collapse toggle */}
      <div style={styles.bottomWrap}>
        <div style={styles.divider} />
        <button
          style={{ ...styles.collapseBtn, justifyContent: collapsed ? "center" : "flex-start" }}
          onClick={() => setCollapsed((v) => !v)}
          title={collapsed ? "Perluas sidebar" : "Ciutkan sidebar"}
        >
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="rgba(255,255,255,0.3)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ transition: "transform 0.3s", transform: collapsed ? "rotate(180deg)" : "rotate(0deg)" }}
          >
            <polyline points="15,18 9,12 15,6"/>
          </svg>
          {!collapsed && <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginLeft: 8 }}>Ciutkan</span>}
        </button>
      </div>
    </aside>
  );
}

// ─── Desktop Styles ──────────────────────────────────────────────────────────
const styles = {
  sidebar: {
    height: "100vh",
    background: "rgba(12,10,30,0.97)",
    backdropFilter: "blur(20px)",
    borderRight: "1px solid rgba(255,255,255,0.06)",
    display: "flex", flexDirection: "column",
    flexShrink: 0, position: "sticky", top: 0,
    overflow: "hidden",
    transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)",
    zIndex: 50,
  },
  logoWrap: { display: "flex", alignItems: "center", gap: 10, padding: "20px 16px 16px", overflow: "hidden" },
  logoIcon: {
    width: 36, height: 36, borderRadius: 10,
    background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0, boxShadow: "0 4px 12px rgba(124,58,237,0.4)",
  },
  logoText: { overflow: "hidden" },
  logoTitle: { color: "#fff", fontWeight: 800, fontSize: 15, whiteSpace: "nowrap" },
  logoSub: { color: "rgba(255,255,255,0.3)", fontSize: 10, whiteSpace: "nowrap", textTransform: "uppercase", letterSpacing: "1px" },
  divider: { height: "1px", background: "rgba(255,255,255,0.05)", margin: "4px 0" },
  nav: { flex: 1, display: "flex", flexDirection: "column", gap: 2, padding: "8px" },
  navBtn: {
    display: "flex", alignItems: "center", gap: 10,
    width: "100%", padding: "10px 12px", borderRadius: 10,
    border: "none", cursor: "pointer",
    fontFamily: "'Outfit', sans-serif", fontWeight: 500, fontSize: 14,
    transition: "all 0.2s", whiteSpace: "nowrap", overflow: "hidden",
  },
  navLabel: { overflow: "hidden", textOverflow: "ellipsis" },
  userProfile: {
    display: "flex", alignItems: "center", gap: 10,
    padding: "12px 14px",
    borderTop: "1px solid rgba(255,255,255,0.05)",
  },
  userAvatar: { width: 32, height: 32, borderRadius: "50%", border: "2px solid #a78bfa", flexShrink: 0, cursor: "pointer" },
  userInfo: { display: "flex", flexDirection: "column", overflow: "hidden" },
  userName: { color: "#fff", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  logoutBtn: { background: "none", border: "none", color: "rgba(255,255,255,0.35)", fontSize: 11, cursor: "pointer", padding: 0, textAlign: "left", marginTop: 2 },
  bottomWrap: { padding: "0 8px 12px" },
  collapseBtn: {
    display: "flex", alignItems: "center", width: "100%",
    padding: "8px 12px", background: "transparent", border: "none",
    cursor: "pointer", fontFamily: "'Outfit', sans-serif",
    color: "rgba(255,255,255,0.25)", borderRadius: 8,
    transition: "all 0.2s", marginTop: 8,
  },
};

// ─── Mobile Styles ───────────────────────────────────────────────────────────
const mobileStyles = {
  bottomNav: {
    position: "fixed", bottom: 0, left: 0, right: 0,
    height: 68,
    background: "rgba(8,6,24,0.98)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    borderTop: "1px solid rgba(255,255,255,0.08)",
    display: "flex", alignItems: "center", justifyContent: "space-around",
    zIndex: 1000,
    paddingBottom: "env(safe-area-inset-bottom, 0px)",
  },
  navBtn: {
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    gap: 3, flex: 1, height: "100%",
    background: "transparent", border: "none", cursor: "pointer",
    fontFamily: "'Outfit', sans-serif",
    transition: "all 0.2s", position: "relative",
    padding: "8px 4px",
  },
  navBtnActive: {
    background: "rgba(167,139,250,0.07)",
  },
  activeDot: {
    position: "absolute", bottom: 6, width: 4, height: 4,
    borderRadius: "50%", background: "#a78bfa",
  },
};
