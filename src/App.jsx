import React, { useState, useEffect, useRef, useMemo, useContext } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { ToastContext } from './context/ToastContext';
import Timer from './Components/Timer';
import MusicPlayer from './Components/MusicPlayer';
import StudyGoals from './Components/StudyGoals';
import NotesSection from './Components/NotesSection';
import Auth from './Components/Auth';
import Header from './Components/Header';
import Layout from './Components/Layout';
import { Music, Timer as TimerIcon } from 'lucide-react';
import { motion } from "framer-motion";
import { Brain, Chatbot } from './agent';
import Widget from './Components/Widget';
import Dashboard from './pages/Dashboard';
import TimelinePage from './pages/TimelinePage';
import CourseVaultPage from './pages/CourseVaultPage';
import AIPage from './pages/AIPage';
import PlaceholderPage from './pages/PlaceholderPage';
import FlashcardsPage from './pages/FlashcardsPage';
import ProgressPage from './pages/ProgressPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';


export default function App() {
  const { info: toastInfo } = useContext(ToastContext);

  // =============================
  // 🔐 AUTH STATE
  // =============================
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
      try {
        const u = localStorage.getItem("user");
        setUser(u ? JSON.parse(u) : null);
      } catch {
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    try {
      const u = localStorage.getItem("user");
      setUser(u ? JSON.parse(u) : null);
    } catch {
      setUser(null);
    }
  }, [isAuthenticated]);

  // =============================
  // GLOBAL APP STATE
  // =============================
  const [goals, setGoals] = useState([]);
  const [courses, setCourses] = useState([]);
  const [activeTab, setActiveTab] = useState('goals');
  const [activeCourseId, setActiveCourseId] = useState(null);

  const [focusTime, setFocusTime] = useState(25 * 60);
  const [isFocusRunning, setIsFocusRunning] = useState(false);
  const [timerHasStarted, setTimerHasStarted] = useState(false);

  const [isTimerWidgetOpen, setIsTimerWidgetOpen] = useState(false);
  const [isMusicWidgetOpen, setIsMusicWidgetOpen] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  // =============================
  // DASHBOARD CARD → WIDGET BRIDGE
  // =============================
  useEffect(() => {
    const openTimer = () => setIsTimerWidgetOpen(true);
    const openMusic = () => setIsMusicWidgetOpen(true);
    const openChat = () => setShowAI(true);

    window.addEventListener('open-timer-widget', openTimer);
    window.addEventListener('open-music-widget', openMusic);
    window.addEventListener('open-ai-chat', openChat);

    return () => {
      window.removeEventListener('open-timer-widget', openTimer);
      window.removeEventListener('open-music-widget', openMusic);
      window.removeEventListener('open-ai-chat', openChat);
    };
  }, []);

  // =============================
  // AI DISPATCHER (Brain executes these)
  // =============================
  const handleAiAction = async (action) => {
    if (!action) return;

    switch (action.type) {
      case 'SET_TIMER':
        setFocusTime(action.minutes * 60);
        setIsFocusRunning(true);
        break;

      case 'PAUSE_TIMER':
      case 'STOP_TIMER':
        setIsFocusRunning(false);
        break;

      case 'NAVIGATE':
        if (action.view === 'goals') navigate('/timeline');
        if (action.view === 'notes') navigate('/course-vault');
        if (action.view === 'course' && action.courseId) {
          setActiveCourseId(action.courseId);
          navigate('/course-vault');
        }
        break;

      case 'ADD_GOAL':
        const newGoal = {
          id: Date.now(),
          title: action.title,
          completed: false,
          plan: action.plan || []
        };
        setGoals(prev => [...prev, newGoal]);
        break;

      default:
        break;
    }
  };

  // =============================
  // CENTRALIZED BRAIN (control + chat)
  // =============================
  const getAppStateRef = useRef(() => ({}));
  const dispatchRef = useRef(() => { });
  getAppStateRef.current = () => ({
    activeTab: location.pathname === '/timeline' ? 'goals' : location.pathname === '/course-vault' ? 'notes' : null,
    currentPath: location.pathname,
    activeCourseId,
    focusTime,
    isFocusRunning,
    goals,
    courses,
    availableWidgets: (() => {
      try {
        const u = localStorage.getItem("user");
        if (u) {
          const parsed = JSON.parse(u);
          if (parsed.dashboardLayout && Array.isArray(parsed.dashboardLayout) && parsed.dashboardLayout.length > 0) {
            return parsed.dashboardLayout.map(w => w.id);
          }
        }
      } catch (e) { }
      return ['timeline', 'vault', 'timer', 'music', 'ai'];
    })(),
  });
  dispatchRef.current = handleAiAction;

  const brain = useMemo(
    () => new Brain(
      () => getAppStateRef.current?.(),
      (action) => dispatchRef.current?.(action)
    ),
    []
  );

  // =============================
  // UNIFIED AI PANEL STATE
  // =============================
  const [showAI, setShowAI] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const handleSessionComplete = async (durationMinutes) => {
    const token = localStorage.getItem("token");
    const apiBase = import.meta.env.DEV ? "http://localhost:5000" : (import.meta.env.VITE_API_URL || "");
    if (!token || !apiBase || !durationMinutes) return;
    try {
      await fetch(`${apiBase}/api/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ type: "focus", durationMinutes: Math.round(durationMinutes) }),
      });
    } catch (_) { }
  };



  // =============================
  // 🔐 AUTH GATE
  // =============================
  if (!isAuthenticated) {
    return <Auth setIsAuthenticated={setIsAuthenticated} />;
  }

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toastInfo("Logged out.");
    setIsAuthenticated(false);
  };

  // =============================
  // MAIN UI (Header + Routes)
  // =============================
  return (
    <motion.div
      className="dashboard-container"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <Layout user={user} onLogout={handleLogout}>
        <div className="page-container">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/timeline" element={<TimelinePage goals={goals} setGoals={setGoals} />} />
            <Route path="/course-vault" element={<CourseVaultPage courses={courses} setCourses={setCourses} activeCourseId={activeCourseId} setActiveCourseId={setActiveCourseId} />} />
            <Route path="/ai" element={<AIPage />} />
            <Route path="/flashcards" element={<FlashcardsPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/study-groups" element={<PlaceholderPage title="Study Groups" />} />
            <Route path="/resources" element={<PlaceholderPage title="Resources" />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </div>
      </Layout>

      {/* Unified AI Assistant */}
      <Chatbot brain={brain} isOpen={showAI} onToggle={setShowAI} />

      {/* WIDGET TOGGLES (Bottom Left) */}
      <div style={widgetToggleGroupStyle}>
        <button onClick={() => setIsTimerWidgetOpen(!isTimerWidgetOpen)} style={widgetToggleBtnStyle(isTimerWidgetOpen)}>
          <TimerIcon size={20} /> Timer
        </button>
        <button onClick={() => setIsMusicWidgetOpen(!isMusicWidgetOpen)} style={widgetToggleBtnStyle(isMusicWidgetOpen)}>
          <Music size={20} /> Music
        </button>
      </div>

      {isTimerWidgetOpen && (
        <Widget
          title="Focus Timer"
          onClose={() => {
            setIsTimerWidgetOpen(false);
            setTimerHasStarted(false);
            setIsFocusRunning(false);
          }}
          defaultPosition={{ x: 30, y: window.innerHeight - 450 }}
          minWidth={200}
          minHeight={200}
          baseWidth={360}
          baseHeight={420}
          lockAspectRatio={false}
          strictHeadless={isFocusRunning || timerHasStarted}
        >
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Timer
              focusTime={focusTime}
              setFocusTime={setFocusTime}
              isRunning={isFocusRunning}
              setIsRunning={setIsFocusRunning}
              onSessionComplete={handleSessionComplete}
              onTimerStart={() => setTimerHasStarted(true)}
            />
          </div>
        </Widget>
      )}

      {isMusicWidgetOpen && (
        <Widget
          title="Focus Music"
          onClose={() => setIsMusicWidgetOpen(false)}
          defaultPosition={{ x: 80, y: window.innerHeight - 480 }}
          minWidth={280}
          minHeight={450}
          baseWidth={450}
          baseHeight={570}
          lockAspectRatio={false}
          strictHeadless={isMusicPlaying}
          onBack={() => setIsMusicPlaying(false)}
        >
          <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
            <MusicPlayer setIsPlaying={setIsMusicPlaying} />
          </div>
        </Widget>
      )}
    </motion.div>
  );

}

// =============================
// STYLES
// =============================

const leftColumn = {
  display: 'flex',
  flexDirection: 'column',
  gap: '28px',
  width: '380px'
};

const rightColumn = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
  overflow: 'hidden'
};

const tabSwitcher = {
  display: 'flex',
  background: 'var(--bg-secondary)',
  borderRadius: 'var(--radius-lg)',
  padding: '6px',
  border: '1px solid var(--glass)',
  boxShadow: '0 8px 30px rgba(0,0,0,0.25)'
};

const activeTabStyle = {
  flex: 1,
  border: 'none',
  background: 'var(--btn-primary-bg)',
  color: 'var(--btn-primary-text)',
  padding: '12px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  fontWeight: '600',
  borderRadius: 'var(--radius-md)',
  boxShadow: 'var(--glow-soft)'
};

const tabStyle = {
  ...activeTabStyle,
  background: 'transparent',
  boxShadow: 'none',
  color: 'var(--text-secondary)'
};


const widgetToggleGroupStyle = {
  position: 'fixed',
  bottom: '32px',
  left: '32px',
  display: 'flex',
  gap: '12px',
  zIndex: 4900
};

const widgetToggleBtnStyle = (isActive) => ({
  background: isActive ? 'var(--btn-primary-bg)' : 'var(--bg-secondary)',
  border: isActive ? 'none' : '1px solid var(--glass)',
  borderRadius: '24px',
  padding: '10px 16px',
  color: isActive ? 'var(--btn-primary-text)' : 'var(--text-primary)',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  cursor: 'pointer',
  fontWeight: '600',
  boxShadow: isActive ? '0 8px 20px rgba(124,58,237,0.4)' : '0 4px 12px rgba(0,0,0,0.2)',
  transition: 'all 0.2s',
});
