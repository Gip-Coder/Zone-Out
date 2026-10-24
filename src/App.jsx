import React, { useState, useEffect, useLayoutEffect, useRef, useContext } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { ToastContext } from './context/ToastContext';
import { useProgressContext } from './context/ProgressContext';
import Timer from './components/Timer';
import MusicPlayer from './components/MusicPlayer';
import Auth from './components/Auth';
import Layout from './components/Layout';
import { Music, Timer as TimerIcon } from 'lucide-react';
import { motion } from "framer-motion";
import { Brain, Chatbot } from './agent';
import { validateAction } from './agent/actions';
import Widget from './components/Widget';
import { api } from './services/apiClient';
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const TimelinePage = React.lazy(() => import('./pages/TimelinePage'));
const CourseVaultPage = React.lazy(() => import('./pages/CourseVaultPage'));
const AIPage = React.lazy(() => import('./pages/AIPage'));
const PlaceholderPage = React.lazy(() => import('./pages/PlaceholderPage'));
const FlashcardsPage = React.lazy(() => import('./pages/FlashcardsPage'));
const ProgressPage = React.lazy(() => import('./pages/ProgressPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));
const StudyGroupsPage = React.lazy(() => import('./pages/StudyGroupsPage'));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'));

const DEFAULT_WIDGETS = ['timeline', 'vault', 'timer', 'music', 'ai'];

// Floating widgets open beside the fixed desktop sidebar (260px, see index.css)
// rather than on top of its navigation links, and below the 70px header.
const SIDEBAR_BREAKPOINT = 900;
const SIDEBAR_WIDTH = 260;
const widgetStartPosition = (height, offset = 0) => ({
  x: (window.innerWidth > SIDEBAR_BREAKPOINT ? SIDEBAR_WIDTH + 20 : 16) + offset,
  y: Math.max(80, window.innerHeight - height - 30),
});

export default function App() {
  const { info: toastInfo } = useContext(ToastContext);
  // Declared before the AI dispatcher and app-state snapshot that use them
  const navigate = useNavigate();
  const location = useLocation();
  const { pushProgressEvent, refreshProgress, resetProgress } = useProgressContext();

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
    // ProgressProvider sits above App and does not re-mount on login, so load
    // the signed-in user's progress here.
    refreshProgress?.();
  }, [isAuthenticated, refreshProgress]);

  // =============================
  // GLOBAL APP STATE
  // =============================
  const [goals, setGoals] = useState([]);
  const [courses, setCourses] = useState([]);
  const [activeCourseId, setActiveCourseId] = useState(null);

  const [focusTime, setFocusTime] = useState(25 * 60);
  const [sessionDuration, setSessionDuration] = useState(25 * 60);
  const [isFocusRunning, setIsFocusRunning] = useState(false);
  const [timerHasStarted, setTimerHasStarted] = useState(false);

  const [isTimerWidgetOpen, setIsTimerWidgetOpen] = useState(false);
  const [isMusicWidgetOpen, setIsMusicWidgetOpen] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  // Unified AI panel
  const [showAI, setShowAI] = useState(false);

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
  const handleAiAction = async (rawAction) => {
    // Model output is untrusted: ignore anything off the allowlist
    const action = validateAction(rawAction);
    if (!action) return;

    switch (action.type) {
      case 'SET_TIMER': {
        const seconds = action.minutes * 60;
        setFocusTime(seconds);
        setSessionDuration(seconds);
        // The countdown runs inside the timer widget, so it must be open
        setIsTimerWidgetOpen(true);
        setTimerHasStarted(true);
        setIsFocusRunning(true);
        break;
      }

      case 'PAUSE_TIMER':
      case 'STOP_TIMER':
        setIsFocusRunning(false);
        break;

      case 'NAVIGATE':
        if (action.view === 'dashboard') navigate('/');
        if (action.view === 'goals') navigate('/timeline');
        if (action.view === 'notes') navigate('/course-vault');
        if (action.view === 'course' && action.courseId) {
          setActiveCourseId(action.courseId);
          navigate('/course-vault');
        }
        break;

      case 'ADD_GOAL':
        try {
          const data = await api.post("/goals", {
            text: action.title,
            targetDate: action.date || "",
            plan: action.plan
          });
          if (data) setGoals(prev => [data, ...prev]);
          if (pushProgressEvent) {
            pushProgressEvent({ eventType: "goal_updated", value: { goalId: data?._id } });
          }
        } catch (e) {
          console.warn("AI Goal Creation failed:", e.message);
          toastInfo("Couldn't add that goal right now.");
        }
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
  // Refreshed after every render so the Brain always reads current state.
  useLayoutEffect(() => {
  getAppStateRef.current = () => ({
    activeTab: location.pathname === '/timeline' ? 'goals' : location.pathname === '/course-vault' ? 'notes' : null,
    currentPath: location.pathname,
    activeCourseId,
    activeCourse: courses.find(c => c.id === activeCourseId) || null,
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
      } catch {
        // Corrupt cached user — fall back to the default widget set
      }
      return DEFAULT_WIDGETS;
    })(),
  });
  dispatchRef.current = handleAiAction;
  });

  // Other AI surfaces (Course Vault's Study Buddy) forward timer actions here,
  // because the focus timer is owned by App.
  useEffect(() => {
    const onForwardedAction = (e) => dispatchRef.current?.(e.detail);
    window.addEventListener('zoneout:ai-action', onForwardedAction);
    return () => window.removeEventListener('zoneout:ai-action', onForwardedAction);
  }, []);

  // The Brain only invokes these callbacks from chat event handlers, never
  // during render, so reading the refs inside them is safe.
  // eslint-disable-next-line react-hooks/refs
  const [brain] = useState(() => new Brain(
    () => getAppStateRef.current?.(),
    (action) => dispatchRef.current?.(action)
  ));



  const handleSessionComplete = async (durationMinutes) => {
    if (!durationMinutes) return;
    // Leave the minimal running view so the widget's close control returns
    setTimerHasStarted(false);
    toastInfo("Focus session complete!");
    // pushProgressEvent handles and logs its own failures
    await pushProgressEvent({
      eventType: "focus_session_completed",
      value: { minutes: Math.round(durationMinutes) }
    });
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
    // Don't show the previous user's numbers to the next person who signs in
    resetProgress?.();
    setGoals([]);
    setIsFocusRunning(false);
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
          <React.Suspense fallback={<div style={{ padding: 32, textAlign: 'center', opacity: 0.8, color: 'var(--text-secondary)' }}>Loading Page...</div>}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/timeline" element={<TimelinePage goals={goals} setGoals={setGoals} />} />
              <Route path="/course-vault" element={<CourseVaultPage courses={courses} setCourses={setCourses} activeCourseId={activeCourseId} setActiveCourseId={setActiveCourseId} />} />
              <Route path="/ai" element={<AIPage />} />
              <Route path="/flashcards" element={<FlashcardsPage />} />
              <Route path="/progress" element={<ProgressPage />} />
              <Route path="/study-groups" element={<StudyGroupsPage />} />
              <Route path="/resources" element={<PlaceholderPage title="Resources" />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </React.Suspense>
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
          defaultPosition={widgetStartPosition(420)}
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
              sessionDuration={sessionDuration}
              setSessionDuration={setSessionDuration}
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
          defaultPosition={widgetStartPosition(570, 50)}
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
