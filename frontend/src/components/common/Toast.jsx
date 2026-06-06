import { useState, useEffect, createContext, useContext, useCallback } from "react";
import "./Toast.css";

const ToastContext = createContext();

let toastFn = null;

export const showToast = (message, type = "info") => {
  if (toastFn) toastFn(message, type);
};

export default function Toast() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    toastFn = (message, type) => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
    };
  }, []);

  const icons = {
    success: "✓",
    error: "✕",
    info: "ℹ",
    warning: "⚠",
  };

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span className="toast-icon">{icons[t.type]}</span>
          <span className="toast-message">{t.message}</span>
          <button onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))} className="toast-close">×</button>
        </div>
      ))}
    </div>
  );
}
