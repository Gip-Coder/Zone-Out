import React, { useState, useEffect } from "react";
import { TrendingUp, Clock, BookOpen, Loader } from "lucide-react";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function getDaysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

export default function ProgressPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rangeDays, setRangeDays] = useState(14);

  useEffect(() => {
    const from = getDaysAgo(rangeDays);
    const to = getDaysAgo(0);
    setLoading(true);
    setError(null);
    const base = import.meta.env.DEV ? "http://localhost:5000" : (import.meta.env.VITE_API_URL || "");
    fetch(`${base}/api/progress?from=${from}&to=${to}`, { headers: getAuthHeaders() })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load progress");
        return res.json();
      })
      .then((data) => {
        setEntries(Array.isArray(data) ? data : []);
      })
      .catch((e) => {
        setError(e.message);
        setEntries([]);
      })
      .finally(() => setLoading(false));
  }, [rangeDays]);

  const focusEntries = entries.filter((e) => e.type === "focus");
  const byDate = {};
  focusEntries.forEach((e) => {
    if (!byDate[e.date]) byDate[e.date] = 0;
    byDate[e.date] += e.durationMinutes || 0;
  });
  const bySubject = {};
  focusEntries.forEach((e) => {
    const key = e.courseName || "General";
    if (!bySubject[key]) bySubject[key] = 0;
    bySubject[key] += e.durationMinutes || 0;
  });

  const dates = [];
  for (let i = rangeDays - 1; i >= 0; i--) {
    dates.push(getDaysAgo(i));
  }
  const maxMinutes = Math.max(1, ...Object.values(byDate), ...Object.values(bySubject));
  const totalFocus = focusEntries.reduce((s, e) => s + (e.durationMinutes || 0), 0);
  const subjectList = Object.entries(bySubject).sort((a, b) => b[1] - a[1]);

  return (
    <div style={pageStyle}>
      <h1 style={titleStyle}>
        <TrendingUp size={28} style={{ marginRight: 8, verticalAlign: "middle" }} />
        Progress
      </h1>
      <p style={subStyle}>Focus timer usage and subject breakdown.</p>

      <div style={rangeStyle}>
        <span>Last </span>
        <select
          value={rangeDays}
          onChange={(e) => setRangeDays(Number(e.target.value))}
          style={selectStyle}
        >
          <option value={7}>7 days</option>
          <option value={14}>14 days</option>
          <option value={30}>30 days</option>
        </select>
      </div>

      {loading && (
        <div style={centerStyle}>
          <Loader style={{ animation: "spin 1s linear infinite" }} size={32} />
          <p>Loading progress…</p>
        </div>
      )}

      {error && (
        <div style={{ ...cardStyle, borderColor: "rgba(239,68,68,0.4)" }}>
          <p style={{ margin: 0, color: "var(--text-secondary)" }}>{error}</p>
          <p style={{ margin: "8px 0 0", fontSize: "0.9rem" }}>Complete focus sessions from the Timer page to see data here.</p>
        </div>
      )}

      {!loading && !error && (
        <>
          <div style={cardStyle}>
            <div style={statRow}>
              <Clock size={24} color="var(--accent-primary)" />
              <div>
                <div style={statValue}>{totalFocus} min</div>
                <div style={statLabel}>Total focus time</div>
              </div>
            </div>
            <div style={statRow}>
              <BookOpen size={24} color="var(--accent-secondary)" />
              <div>
                <div style={statValue}>{focusEntries.length}</div>
                <div style={statLabel}>Sessions completed</div>
              </div>
            </div>
          </div>

          <div style={cardStyle}>
            <h3 style={cardTitle}>Focus time by day</h3>
            <div style={barChartStyle}>
              {dates.map((d) => {
                const mins = byDate[d] || 0;
                const pct = (mins / maxMinutes) * 100;
                return (
                  <div key={d} style={barRow}>
                    <span style={barLabel}>{d.slice(5)}</span>
                    <div style={barTrack}>
                      <div style={{ ...barFill, width: `${Math.max(2, pct)}%` }} />
                    </div>
                    <span style={barValue}>{mins}m</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={cardStyle}>
            <h3 style={cardTitle}>Focus by subject</h3>
            {subjectList.length === 0 ? (
              <p style={{ color: "var(--text-secondary)", margin: 0 }}>No subject data yet. Log focus with a course name to see breakdown.</p>
            ) : (
              <div style={barChartStyle}>
                {subjectList.map(([name, mins]) => {
                  const pct = (mins / maxMinutes) * 100;
                  return (
                    <div key={name} style={barRow}>
                      <span style={barLabel}>{name}</span>
                      <div style={barTrack}>
                        <div style={{ ...barFill, width: `${Math.max(2, pct)}%`, background: "var(--accent-secondary)" }} />
                      </div>
                      <span style={barValue}>{mins}m</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const pageStyle = { padding: "32px", maxWidth: "720px", margin: "0 auto" };
const titleStyle = { fontSize: "28px", fontWeight: 700, marginBottom: 8 };
const subStyle = { color: "var(--text-secondary)", marginBottom: 24 };
const rangeStyle = { marginBottom: 20, display: "flex", alignItems: "center", gap: 8 };
const selectStyle = {
  padding: "8px 12px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "var(--bg-secondary)",
  color: "var(--text-primary)",
};
const centerStyle = { display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: 48 };
const cardStyle = {
  background: "var(--bg-secondary)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "var(--radius-lg)",
  padding: 24,
  marginBottom: 24,
};
const statRow = { display: "flex", alignItems: "center", gap: 16, marginBottom: 16 };
const statValue = { fontSize: "1.5rem", fontWeight: 700 };
const statLabel = { fontSize: "0.9rem", color: "var(--text-secondary)" };
const cardTitle = { margin: "0 0 16px", fontSize: "1.1rem" };
const barChartStyle = { display: "flex", flexDirection: "column", gap: 10 };
const barRow = { display: "flex", alignItems: "center", gap: 12 };
const barLabel = { width: 64, fontSize: "0.85rem", color: "var(--text-secondary)" };
const barTrack = { flex: 1, height: 20, background: "rgba(255,255,255,0.06)", borderRadius: 8, overflow: "hidden" };
const barFill = { height: "100%", background: "var(--button-gradient)", borderRadius: 8, transition: "width 0.3s ease" };
const barValue = { width: 40, textAlign: "right", fontSize: "0.85rem" };
