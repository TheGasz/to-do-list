export default function XpPopup({ popup }) {
  if (!popup) return null;
  return (
    <div style={styles.wrap} key={popup.label + Date.now()}>
      <span style={styles.text}>{popup.label}</span>
    </div>
  );
}

const styles = {
  wrap: {
    position: "fixed",
    bottom: 48,
    left: "50%",
    transform: "translateX(-50%)",
    background: "linear-gradient(135deg, #7c3aed, #a78bfa, #60a5fa)",
    color: "#fff",
    fontWeight: 800,
    fontSize: 20,
    padding: "14px 32px",
    borderRadius: 100,
    boxShadow: "0 8px 40px rgba(124,58,237,0.5), 0 0 0 4px rgba(167,139,250,0.15)",
    animation: "xpFloatUp 2.5s cubic-bezier(0.22,0.61,0.36,1) forwards",
    zIndex: 1200,
    whiteSpace: "nowrap",
    pointerEvents: "none",
    letterSpacing: "0.5px",
  },
  text: { display: "block" },
};

// Inject keyframes once
if (typeof document !== "undefined" && !document.getElementById("xp-keyframes")) {
  const style = document.createElement("style");
  style.id = "xp-keyframes";
  style.textContent = `
    @keyframes xpFloatUp {
      0%   { opacity: 0; transform: translateX(-50%) translateY(30px) scale(0.7); }
      15%  { opacity: 1; transform: translateX(-50%) translateY(-6px) scale(1.12); }
      30%  { transform: translateX(-50%) translateY(0px) scale(1); }
      70%  { opacity: 1; transform: translateX(-50%) translateY(-14px) scale(1); }
      100% { opacity: 0; transform: translateX(-50%) translateY(-50px) scale(0.85); }
    }
  `;
  document.head.appendChild(style);
}