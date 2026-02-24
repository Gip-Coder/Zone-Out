import { useState, useContext, useEffect, useRef } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { ToastContext } from "../context/ToastContext";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { auth, googleProvider } from "../services/firebaseDb";
import { api } from "../services/apiClient";

export default function Auth({ setIsAuthenticated }) {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { success: toastSuccess, error: toastError } = useContext(ToastContext);
  const canvasRef = useRef(null);

  const [mode, setMode] = useState("login"); // "login" | "register"
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [loading, setLoading] = useState(false);

  // Use relative path in production, and localhost in dev
  const API_BASE = import.meta.env.DEV ? "http://localhost:5000" : (import.meta.env.VITE_API_URL || "");
  const API_URL = `${API_BASE}/api/auth`;

  // Detect screen resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ================= PARTICLES =================
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    let particles = [];
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2,
        dx: (Math.random() - 0.5) * 0.4,
        dy: (Math.random() - 0.5) * 0.4,
      });
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      particles.forEach((p) => {
        p.x += p.dx;
        p.y += p.dy;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      requestAnimationFrame(animate);
    }

    animate();

    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  // ================= LOGIN / REGISTER =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
    const body = mode === "login"
      ? { email: form.email, password: form.password }
      : { name: form.name, email: form.email, password: form.password };

    if (mode === "register" && !form.name?.trim()) {
      toastError("Name is required");
      setLoading(false);
      return;
    }

    try {
      const data = await api.post(endpoint, body);
      setLoading(false);
      if (data.token) {
        localStorage.setItem("token", data.token);
        if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
        if (mode === "login") toastSuccess("Welcome back!");
        else toastSuccess("Account created successfully.");
        setIsAuthenticated(true);
      }
    } catch (error) {
      setLoading(false);
      toastError(error.message || "Something went wrong");
    }
  };

  const handleGoogleLogin = async () => {
    if (!auth) {
      toastError("Firebase Auth is not configured in .env");
      return;
    }
    setLoading(true);
    try {
      const result = await auth.signInWithPopup(googleProvider);
      const idToken = await result.user.getIdToken();

      const data = await api.post("/auth/google", { idToken });
      setLoading(false);

      if (data.token) {
        localStorage.setItem("token", data.token);
        if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
        toastSuccess("Google Sign-In successful!");
        setIsAuthenticated(true);
      }
    } catch (error) {
      setLoading(false);
      console.error(error);
      toastError(error.message || "Google Sign-In failed");
    }
  };

  return (
    <div style={{ ...styles.wrapper, flexDirection: isMobile ? "column" : "row" }}>
      <div style={styles.gradient}></div>
      <canvas ref={canvasRef} style={styles.canvas}></canvas>

      {!isMobile && (
        <>
          <motion.div animate={{ y: [0, -30, 0] }} transition={{ duration: 6, repeat: Infinity }} style={styles.orb1} />
          <motion.div animate={{ y: [0, 20, 0] }} transition={{ duration: 8, repeat: Infinity }} style={styles.orb2} />
        </>
      )}

      <button onClick={toggleTheme} style={styles.themeToggle}>
        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div style={{ ...styles.content, flexDirection: isMobile ? "column" : "row", gap: isMobile ? "30px" : "60px" }}>

        {/* BRAND */}
        <motion.div
          initial={{ opacity: 0, x: isMobile ? 0 : -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          style={{ ...styles.left, textAlign: isMobile ? "center" : "left" }}
        >
          <img src="/logo.svg" alt="ZoneOut Logo" style={styles.logo} />
          <h1 style={styles.title}>ZoneOut</h1>
          <p style={styles.subtitle}>AI-powered productivity for deep focus.</p>
        </motion.div>

        {/* FORM */}
        <motion.div
          initial={{ opacity: 0, x: isMobile ? 0 : 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          style={{ ...styles.right, width: isMobile ? "100%" : "420px" }}
        >
          <motion.div whileHover={!isMobile ? { scale: 1.02 } : {}} style={{ ...styles.card, padding: isMobile ? "28px" : "42px" }}>
            <h2 style={{ marginBottom: "20px", textAlign: "center" }}>
              {mode === "login" ? "Sign in" : "Create account"}
            </h2>

            <form onSubmit={handleSubmit} style={styles.form}>
              {mode === "register" && (
                <input
                  type="text"
                  placeholder="Name"
                  value={form.name}
                  style={styles.input}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              )}
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                style={styles.input}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <input
                type="password"
                placeholder="Password"
                value={form.password}
                style={styles.input}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={!isMobile && !loading ? { scale: 1.04 } : {}}
                whileTap={{ scale: 0.97 }}
                style={{ ...styles.button, opacity: loading ? 0.8 : 1 }}
              >
                {loading ? "..." : mode === "login" ? "Sign in" : "Register"}
              </motion.button>

              <div style={styles.divider}>
                <span style={styles.line}></span>
                <span style={styles.orText}>or</span>
                <span style={styles.line}></span>
              </div>

              <motion.button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                whileHover={!isMobile && !loading ? { scale: 1.04 } : {}}
                whileTap={{ scale: 0.97 }}
                style={{ ...styles.googleBtn, opacity: loading ? 0.8 : 1 }}
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" style={{ width: '20px', height: '20px' }} />
                {mode === "login" ? "Sign in" : "Register"} with Google
              </motion.button>
            </form>
            <p style={styles.toggle}>
              {mode === "login" ? (
                <>
                  New user?{" "}
                  <button type="button" style={styles.toggleBtn} onClick={() => setMode("register")}>
                    Create account
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button type="button" style={styles.toggleBtn} onClick={() => setMode("login")}>
                    Sign in
                  </button>
                </>
              )}
            </p>
          </motion.div>
        </motion.div>

      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    position: "relative",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px 20px",
    background: "var(--bg-primary)",
    overflowX: "hidden"
  },

  gradient: {
    position: "absolute",
    width: "200%",
    height: "200%",
    background:
      "radial-gradient(circle at 25% 25%, var(--accent-primary), transparent 60%), radial-gradient(circle at 75% 75%, var(--accent-secondary), transparent 60%)",
    animation: "gradientShift 28s ease-in-out infinite",
    opacity: 0.25,
    zIndex: 0
  },

  canvas: {
    position: "absolute",
    width: "100%",
    height: "100%",
    zIndex: 1,
    opacity: 0.3
  },

  orb1: {
    position: "absolute",
    width: "250px",
    height: "250px",
    background: "var(--accent-primary)",
    filter: "blur(120px)",
    top: "15%",
    left: "15%",
    opacity: 0.4,
    zIndex: 0
  },

  orb2: {
    position: "absolute",
    width: "220px",
    height: "220px",
    background: "var(--accent-secondary)",
    filter: "blur(120px)",
    bottom: "20%",
    right: "20%",
    opacity: 0.4,
    zIndex: 0
  },

  content: {
    display: "flex",
    width: "100%",
    maxWidth: "1100px",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2
  },

  left: {
    maxWidth: "420px"
  },

  logo: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    padding: "10px",
    background: "var(--bg-secondary)",
    boxShadow: "0 0 30px var(--accent-primary)",
    marginBottom: "20px"
  },

  title: {
    fontSize: "2.5rem",
    fontWeight: "700",
    marginBottom: "12px"
  },

  subtitle: {
    color: "var(--text-secondary)",
    fontSize: "0.95rem",
    lineHeight: "1.6"
  },

  right: {},

  card: {
    borderRadius: "20px",
    background: "var(--bg-secondary)",
    border: "1px solid rgba(255,255,255,0.08)",
    backdropFilter: "blur(12px)",
    boxShadow: "0 20px 50px rgba(0,0,0,0.4)"
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px"
  },

  input: {
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "transparent",
    color: "var(--text-primary)",
    fontSize: "0.95rem"
  },

  button: {
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    background: "var(--button-gradient)",
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 10px 30px rgba(124,58,237,0.35)"
  },

  themeToggle: {
    position: "absolute",
    top: "20px",
    right: "20px",
    background: "var(--bg-secondary)",
    border: "1px solid rgba(255,255,255,0.08)",
    padding: "10px",
    borderRadius: "50%",
    cursor: "pointer",
    zIndex: 3
  },

  googleBtn: {
    padding: "12px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "transparent",
    color: "var(--text-primary)",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px"
  },

  divider: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    margin: "10px 0"
  },

  line: {
    flex: 1,
    height: "1px",
    background: "rgba(255,255,255,0.1)"
  },

  orText: {
    color: "var(--text-secondary)",
    fontSize: "0.85rem"
  },

  toggle: {
    textAlign: "center",
    marginTop: "16px",
    fontSize: "14px",
    color: "var(--text-secondary)"
  },

  toggleBtn: {
    background: "none",
    border: "none",
    color: "var(--accent-primary, #a78bfa)",
    cursor: "pointer",
    fontWeight: "600",
    padding: 0,
    textDecoration: "underline"
  }
};