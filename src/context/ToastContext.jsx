import { createContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Info, X } from "lucide-react";

export const ToastContext = createContext();

const DEFAULT_DURATION = 4000;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info", duration = DEFAULT_DURATION) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((msg, duration) => addToast(msg, "success", duration), [addToast]);
  const error = useCallback((msg, duration) => addToast(msg, "error", duration), [addToast]);
  const info = useCallback((msg, duration) => addToast(msg, "info", duration), [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, success, error, info }}>
      {children}
      <div style={containerStyle}>
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }) {
  const isSuccess = toast.type === "success";
  const isError = toast.type === "error";
  const isInfo = toast.type === "info" || (!isSuccess && !isError);

  const iconStyle = { flexShrink: 0 };
  const Icon = isSuccess ? CheckCircle : isError ? XCircle : Info;
  const bg = isSuccess
    ? "linear-gradient(135deg, rgba(34,197,94,0.2), rgba(22,163,74,0.15))"
    : isError
      ? "linear-gradient(135deg, rgba(239,68,68,0.2), rgba(185,28,28,0.15))"
      : "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(99,102,241,0.15))";
  const borderColor = isSuccess ? "rgba(34,197,94,0.5)" : isError ? "rgba(239,68,68,0.5)" : "rgba(124,58,237,0.4)";
  const iconColor = isSuccess ? "#22c55e" : isError ? "#ef4444" : "#a78bfa";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      style={{
        ...toastStyle,
        background: bg,
        borderColor,
      }}
    >
      <Icon size={22} color={iconColor} style={iconStyle} />
      <span style={messageStyle}>{toast.message}</span>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={onDismiss}
        style={dismissStyle}
      >
        <X size={16} />
      </button>
    </motion.div>
  );
}

const containerStyle = {
  position: "fixed",
  bottom: "24px",
  right: "24px",
  zIndex: 9999,
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  maxWidth: "min(400px, calc(100vw - 48px))",
  pointerEvents: "none",
};

const toastStyle = {
  pointerEvents: "auto",
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "14px 16px",
  borderRadius: "14px",
  border: "1px solid",
  boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
  backdropFilter: "blur(12px)",
};

const messageStyle = {
  flex: 1,
  color: "var(--text-primary, #fff)",
  fontSize: "14px",
  fontWeight: "500",
};

const dismissStyle = {
  background: "none",
  border: "none",
  color: "var(--text-secondary, rgba(255,255,255,0.6))",
  cursor: "pointer",
  padding: "4px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
