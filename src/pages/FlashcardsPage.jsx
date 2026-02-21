import React, { useState, useEffect } from "react";
import { Layers, Loader, ChevronRight, ChevronLeft, RotateCcw, Sparkles, FileText } from "lucide-react";
import { getAllCourses } from "../utils/studyVaultDb";

const API_BASE = import.meta.env.VITE_API_URL || "";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** Manual fallback when API is unavailable. */
function manualFlashcards(courseName, moduleTitle, topics = []) {
  const list = Array.isArray(topics) && topics.length > 0 ? topics : ["Key concept 1", "Key concept 2", "Key concept 3"];
  return list.slice(0, 8).map((t) => ({
    front: `What is ${t}?`,
    back: `${t} is an important topic in ${moduleTitle || "this module"} (${courseName || "course"}). Review your notes.`,
  }));
}

export default function FlashcardsPage() {
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedModuleIndex, setSelectedModuleIndex] = useState("");
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [useAI, setUseAI] = useState(true);
  const [error, setError] = useState(null);

  const selectedCourse = courses.find((c) => String(c.id) === String(selectedCourseId));
  const modules = selectedCourse?.modules || [];
  const selectedModule = selectedModuleIndex !== "" && modules[Number(selectedModuleIndex)] ? modules[Number(selectedModuleIndex)] : null;

  useEffect(() => {
    let cancelled = false;
    getAllCourses()
      .then((list) => {
        if (!cancelled) setCourses(list || []);
      })
      .catch(() => {
        if (!cancelled) setCourses([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingCourses(false);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    setSelectedModuleIndex("");
    setCards([]);
    setCurrentIndex(0);
    setFlipped(false);
  }, [selectedCourseId]);

  useEffect(() => {
    setCards([]);
    setCurrentIndex(0);
    setFlipped(false);
  }, [selectedModuleIndex]);

  const handleGenerate = async () => {
    if (!selectedCourse || !selectedModule) return;
    setGenerating(true);
    setError(null);
    const courseName = selectedCourse.name;
    const moduleTitle = selectedModule.title;
    const topics = selectedModule.topics || [];

    if (useAI && API_BASE) {
      try {
        const res = await fetch(`${API_BASE}/api/ai/flashcards`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...getAuthHeaders() },
          body: JSON.stringify({ courseName, moduleTitle, topics }),
        });
        const data = await res.json();
        if (res.ok && Array.isArray(data.cards) && data.cards.length > 0) {
          setCards(data.cards);
          return;
        }
      } catch (e) {
        setError("AI unavailable, using manual cards.");
      }
    }

    setCards(manualFlashcards(courseName, moduleTitle, topics));
  };

  const resetDeck = () => {
    setCurrentIndex(0);
    setFlipped(false);
  };

  if (loadingCourses) {
    return (
      <div style={pageStyle}>
        <h1 style={titleStyle}>Flashcards</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--text-secondary)" }}>
          <Loader style={{ animation: "spin 1s linear infinite" }} size={20} />
          Loading courses…
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <h1 style={titleStyle}>
        <Layers size={28} style={{ marginRight: 8, verticalAlign: "middle" }} />
        Flashcards
      </h1>
      <p style={subStyle}>Pick a course and module, then generate with AI or manually.</p>

      <div style={cardStyle}>
        <div style={rowStyle}>
          <label style={labelStyle}>Course</label>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            style={selectStyle}
          >
            <option value="">Select course…</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div style={rowStyle}>
          <label style={labelStyle}>Module</label>
          <select
            value={selectedModuleIndex}
            onChange={(e) => setSelectedModuleIndex(e.target.value)}
            style={selectStyle}
            disabled={!selectedCourse}
          >
            <option value="">Select module…</option>
            {modules.map((m, i) => (
              <option key={i} value={i}>{m.title}</option>
            ))}
          </select>
        </div>
        <div style={{ ...rowStyle, flexWrap: "wrap", gap: 12 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <input
              type="radio"
              checked={useAI}
              onChange={() => setUseAI(true)}
            />
            <Sparkles size={16} /> AI generate
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <input
              type="radio"
              checked={!useAI}
              onChange={() => setUseAI(false)}
            />
            <FileText size={16} /> Manual (no API)
          </label>
        </div>
        {error && <p style={{ color: "var(--accent-secondary)", fontSize: "0.9rem", margin: "8px 0 0" }}>{error}</p>}
        <button
          onClick={handleGenerate}
          disabled={!selectedModule || generating}
          style={{ ...btnPrimary, marginTop: 16 }}
        >
          {generating ? <><Loader style={{ animation: "spin 1s linear infinite" }} size={18} /> Generating…</> : "Generate deck"}
        </button>
      </div>

      {cards.length > 0 && (
        <div style={deckWrap}>
          <div style={deckHeader}>
            <button
              onClick={() => { setCurrentIndex((i) => Math.max(0, i - 1)); setFlipped(false); }}
              disabled={currentIndex === 0}
              style={navBtn}
            >
              <ChevronLeft size={20} />
            </button>
            <span style={{ fontWeight: 600 }}>{currentIndex + 1} / {cards.length}</span>
            <button
              onClick={() => { setCurrentIndex((i) => Math.min(cards.length - 1, i + 1)); setFlipped(false); }}
              disabled={currentIndex === cards.length - 1}
              style={navBtn}
            >
              <ChevronRight size={20} />
            </button>
            <button onClick={resetDeck} style={navBtn} title="Reset">
              <RotateCcw size={18} />
            </button>
          </div>
          <div style={{ perspective: "1000px", width: "100%", maxWidth: 420, margin: "0 auto" }}>
            <div
              onClick={() => setFlipped((f) => !f)}
              style={{
                ...flashcardStyle,
                transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
              }}
            >
              <div style={flashcardFace}>
                {cards[currentIndex]?.front}
              </div>
              <div style={{ ...flashcardFace, ...flashcardBack }}>
                {cards[currentIndex]?.back}
              </div>
            </div>
          </div>
          <p style={{ fontSize: "0.85rem", opacity: 0.7, marginTop: 8 }}>Click card to flip</p>
        </div>
      )}

      {courses.length === 0 && !loadingCourses && (
        <p style={{ color: "var(--text-secondary)", marginTop: 24 }}>
          No courses yet. Add courses in Course Vault first, then come back here.
        </p>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const pageStyle = { padding: "32px", maxWidth: "720px", margin: "0 auto" };
const titleStyle = { fontSize: "28px", fontWeight: 700, marginBottom: 8 };
const subStyle = { color: "var(--text-secondary)", marginBottom: 24 };
const cardStyle = {
  background: "var(--bg-secondary)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "var(--radius-lg)",
  padding: 24,
  marginBottom: 32,
};
const rowStyle = { marginBottom: 16 };
const labelStyle = { display: "block", marginBottom: 6, fontSize: "0.9rem", fontWeight: 500 };
const selectStyle = {
  width: "100%",
  padding: 12,
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(0,0,0,0.2)",
  color: "var(--text-primary)",
  fontSize: "1rem",
};
const btnPrimary = {
  background: "var(--button-gradient)",
  border: "none",
  borderRadius: 12,
  padding: "12px 20px",
  color: "#fff",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  fontWeight: 600,
};
const deckWrap = { marginTop: 24, textAlign: "center" };
const deckHeader = { display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 20 };
const navBtn = {
  background: "var(--bg-secondary)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 10,
  padding: 10,
  color: "var(--text-primary)",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
const flashcardStyle = {
  position: "relative",
  width: "100%",
  maxWidth: 420,
  minHeight: 200,
  margin: "0 auto",
  cursor: "pointer",
  transition: "transform 0.5s ease",
  transformStyle: "preserve-3d",
};
const flashcardFace = {
  backfaceVisibility: "hidden",
  WebkitBackfaceVisibility: "hidden",
  background: "var(--bg-secondary)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 16,
  padding: 28,
  minHeight: 180,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "1.15rem",
  lineHeight: 1.5,
  textAlign: "center",
};
const flashcardBack = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  transform: "rotateY(180deg)",
  background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(236,72,153,0.1))",
};
