import { useState, useEffect } from "react";
import api from "../../utils/api";

// Shows a banner when the Render backend is cold-starting (free tier sleeps after 15 min)
export default function WakeupBanner() {
  const [waking, setWaking] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let timer;
    const ping = async () => {
      try {
        await api.get("/health", { timeout: 5000 });
        setWaking(false);
      } catch {
        setWaking(true);
        setAttempt(a => a + 1);
        timer = setTimeout(ping, 4000);
      }
    };
    ping();
    return () => clearTimeout(timer);
  }, []);

  if (!waking) return null;

  return (
    <div style={{
      position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
      background: "var(--bg-2)", border: "1px solid var(--border-strong)",
      borderRadius: 12, padding: "12px 20px", zIndex: 9999,
      display: "flex", alignItems: "center", gap: 12,
      boxShadow: "var(--shadow-lg)", maxWidth: "90vw",
    }}>
      <div className="spinner spinner-sm"></div>
      <div>
        <div style={{fontSize: 13, fontWeight: 600}}>Server is waking up…</div>
        <div style={{fontSize: 12, color: "var(--text-muted)"}}>
          Free tier sleeps after inactivity. Ready in ~20s (attempt {attempt})
        </div>
      </div>
    </div>
  );
}
