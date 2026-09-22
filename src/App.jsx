import { useState, useEffect } from "react";
import { useTasks } from "./hooks/useTasks";
import Sidebar from "./components/Sidebar";
import DeadlineAlert from "./components/DeadlineAlert";
import XpPopup from "./components/Xppopup";
import Confetti from "./components/Confetti";
import LoginScreen from "./components/LoginScreen";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

// Pages
import Beranda from "./pages/Beranda";
import TambahTugas from "./pages/TambahTugas";
import Aktivitas from "./pages/Aktivitas";
import LMSPage from "./pages/LMSPage";

export default function App() {
  const {
    tasks, stats,
    addTask, editTask, toggleTask, deleteTask,
    clearCompleted, importTasks,
    xpPopup, confetti,
  } = useTasks();

  const [activePage, setActivePage] = useState("beranda");
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    // If firebase is not configured, this might error, but we try-catch it in firebase.js
    if (!auth) {
      setLoadingAuth(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  if (loadingAuth) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#080618", flexDirection: "column", gap: 16 }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid rgba(167,139,250,0.2)", borderTop: "3px solid #a78bfa", animation: "spin 0.8s linear infinite" }} />
        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, fontFamily: "'Outfit', sans-serif" }}>Memuat...</div>
        <style>{"@keyframes spin { to { transform: rotate(360deg); } }"}</style>
      </div>
    );
  }

  // If no user and auth is initialized, show login
  if (!user && auth) {
    return <LoginScreen />;
  }

  const renderPage = () => {
    switch (activePage) {
      case "beranda":
        return (
          <Beranda
            tasks={tasks}
            stats={stats}
            onToggle={toggleTask}
            onDelete={deleteTask}
            onEdit={editTask}
          />
        );
      case "tambah":
        return (
          <TambahTugas
            onAdd={addTask}
            onNavigate={setActivePage}
          />
        );
      case "aktivitas":
        return (
          <Aktivitas
            tasks={tasks}
            stats={stats}
          />
        );
      case "lms":
        return (
          <LMSPage
            tasks={tasks}
            onImport={importTasks}
            onToggle={toggleTask}
            onDelete={deleteTask}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />

      {/* Global animated background */}
      <div style={styles.bgOrbs} aria-hidden="true">
        <div style={{ ...styles.orb, ...styles.orb1 }} />
        <div style={{ ...styles.orb, ...styles.orb2 }} />
        <div style={{ ...styles.orb, ...styles.orb3 }} />
      </div>

      {/* Overlays */}
      <DeadlineAlert tasks={tasks} />
      <XpPopup popup={xpPopup} />
      <Confetti active={confetti} />

      {/* Main shell */}
      <div style={styles.shell} className="app-shell">
        <div style={styles.sidebar} className="app-sidebar">
          <Sidebar activePage={activePage} onNavigate={setActivePage} />
        </div>

        {/* Main content area */}
        <main style={styles.main} className="app-main">
          {renderPage()}
        </main>
      </div>
    </>
  );
}

const styles = {
  bgOrbs: {
    position: "fixed", inset: 0,
    pointerEvents: "none", zIndex: 0, overflow: "hidden",
  },
  orb: {
    position: "absolute", borderRadius: "50%",
    filter: "blur(100px)",
    animation: "orbPulse 10s ease-in-out infinite",
  },
  orb1: {
    width: 500, height: 500,
    top: "-150px", left: "-150px",
    background: "rgba(124,58,237,0.18)",
    animationDelay: "0s",
  },
  orb2: {
    width: 400, height: 400,
    bottom: "-100px", right: "-100px",
    background: "rgba(59,130,246,0.15)",
    animationDelay: "-4s",
  },
  orb3: {
    width: 300, height: 300,
    top: "50%", left: "50%",
    background: "rgba(16,185,129,0.1)",
    animationDelay: "-8s",
  },
  shell: {
    display: "flex",
    minHeight: "100vh",
    position: "relative",
    zIndex: 1,
    fontFamily: "'Outfit', sans-serif",
  },
  sidebar: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    position: "sticky",
    top: 0,
  },
  appHeader: {
    padding: "20px 30px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
    background: "rgba(255, 255, 255, 0.02)",
  },
  userProfile: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: 20,
    borderTop: "1px solid rgba(255, 255, 255, 0.05)",
    marginTop: "auto"
  },
  userAvatar: {
    width: 36, height: 36, borderRadius: "50%",
    border: "2px solid #a78bfa"
  },
  userInfo: { display: "flex", flexDirection: "column" },
  userName: { color: "#fff", fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 120 },
  logoutBtn: { 
    background: "none", border: "none", color: "rgba(255, 255, 255, 0.4)", 
    fontSize: 11, cursor: "pointer", padding: 0, textAlign: "left", marginTop: 2 
  },
  main: {
    flex: 1,
    minWidth: 0,
    overflowY: "auto",
    height: "100vh",
    background: "rgba(10,8,28,0.6)",
    backdropFilter: "blur(4px)",
  },
};

// Global keyframes + styles
if (typeof document !== "undefined" && !document.getElementById("app-keyframes")) {
  const s = document.createElement("style");
  s.id = "app-keyframes";
  s.textContent = `
    @keyframes orbPulse {
      0%, 100% { transform: scale(1) translate(0, 0); opacity: 0.5; }
      50% { transform: scale(1.2) translate(30px, -30px); opacity: 0.9; }
    }
    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(200%); }
    }
    @keyframes shake {
      0%,100% { transform: translateX(0); }
      20%      { transform: translateX(-6px); }
      40%      { transform: translateX(6px); }
      60%      { transform: translateX(-4px); }
      80%      { transform: translateX(4px); }
    }
    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to   { transform: translateY(0); opacity: 1; }
    }
    html, body, #root {
      height: 100%;
      margin: 0;
      padding: 0;
      background: #080618;
    }
    .task-item:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    }
    ::-webkit-scrollbar { width: 4px; height: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(167,139,250,0.25); border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(167,139,250,0.45); }
    input::placeholder { color: rgba(255,255,255,0.22); }
    input[type="datetime-local"]::-webkit-calendar-picker-indicator {
      filter: invert(0.5); cursor: pointer;
    }
    * { box-sizing: border-box; }

    /* Mobile responsive */
    @media (max-width: 767px) {
      .app-shell {
        flex-direction: column !important;
      }
      .app-main {
        padding-bottom: 80px !important;
        height: 100dvh !important;
      }
      .app-sidebar {
        display: none !important;
      }
    }
  `;
  document.head.appendChild(s);
}