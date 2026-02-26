import React, { useState, useEffect, useRef, useMemo, useContext } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { ToastContext } from './context/ToastContext';
import { ThemeContext } from './context/ThemeContext';
import Timer from './Components/Timer';
import MusicPlayer from './Components/MusicPlayer';
import StudyGoals from './Components/StudyGoals';
import NotesSection from './Components/NotesSection';
import Auth from './Components/Auth';
import Header from './Components/Header';
import Sidebar from './Components/Sidebar';
import { Bot, Send, X, Music, Timer as TimerIcon } from 'lucide-react';
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
import GroupDashboard from './features/study-groups/pages/GroupDashboard';


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
  // CONTROL CHAT STATE (Study Buddy – commands)
  // =============================
  const [showChat, setShowChat] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { role: 'model', text: "I'm Study Buddy. I can control your timer, navigate tabs, and manage your goals." }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatting, setIsChatting] = useState(false);
  const chatEndRef = useRef(null);

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

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput("");
    setIsChatting(true);

    try {
      const reply = await brain.think(userMsg);
      setChatHistory(prev => [...prev, { role: 'model', text: reply }]);
    } catch (e) {
      console.error("AI Error", e);
      setChatHistory(prev => [...prev, { role: 'model', text: "I couldn't process that. Please try again." }]);
    }

    setIsChatting(false);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

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
  // MAIN UI (Header + Sidebar + Routes)
  // =============================
  const { theme } = useContext(ThemeContext);
  
  return (
    <motion.div
      className={`dashboard-container ${theme === 'dark' ? 'dark' : 'light'}`}
      style={{
        ...appLayout,
        display: 'flex',
        flexDirection: 'column',
      }}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <Header onLogout={handleLogout} user={user} />
      
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar />
        <main style={{ ...mainContentStyle, marginLeft: 'clamp(0px, 100vw - 1200px, 288px)', width: '100%', overflow: 'auto' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/timeline" element={<TimelinePage goals={goals} setGoals={setGoals} />} />
          <Route path="/course-vault" element={<CourseVaultPage courses={courses} setCourses={setCourses} activeCourseId={activeCourseId} setActiveCourseId={setActiveCourseId} />} />
          <Route path="/ai" element={<AIPage />} />
          <Route path="/flashcards" element={<FlashcardsPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/study-groups" element={<GroupDashboard />} />
          <Route path="/resources" element={<PlaceholderPage title="Resources" />} />
          <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
        </main>
      </div>

      {/* Chatbot: general student queries (Q&A only) */}
      <Chatbot brain={brain} placeholder="Ask a study question..." />

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
          baseHeight={360}
          lockAspectRatio={true}
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
          baseHeight={520}
          lockAspectRatio={true}
          strictHeadless={isMusicPlaying}
          onBack={() => setIsMusicPlaying(false)}
        >
          <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
            <MusicPlayer setIsPlaying={setIsMusicPlaying} />
          </div>
        </Widget>
      )}

      {/* Control: Study Buddy – commands (timer, navigate, goals) */}
      <button onClick={() => setShowChat(!showChat)} style={fabStyle}>
        {showChat ? <X size={24} /> : <Bot size={28} />}
      </button>

      {/* FLOATING CONTROL PANEL */}
      {showChat && (
        <motion.div
          style={chatOverlayStyle}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div style={buddyHeader}>
            Study Buddy AI
            <X size={18} style={{ cursor: 'pointer' }} onClick={() => setShowChat(false)} />
          </div>
          <div style={chatArea}>
            {chatHistory.map((m, i) => (
              <div key={i} style={m.role === 'user' ? userMsgStyle : buddyMsgStyle}>
                {m.text}
              </div>
            ))}
            {isChatting && <div>Thinking...</div>}
            <div ref={chatEndRef} />
          </div>
          <div style={inputArea}>
            <input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
              placeholder="Command me..."
              style={chatInputStyle}
            />
            <button onClick={handleSendMessage} style={sendBtn}>
              <Send size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );

}

// =============================
// STYLES
// =============================

const mainContentStyle = {
  flex: 1,
  overflowY: 'auto',
  padding: '24px 36px 48px',
};

const appLayout = {
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  background: `
    radial-gradient(circle at 20% 20%, var(--accent-tertiary)15, transparent 40%),
    radial-gradient(circle at 80% 80%, var(--accent-secondary)15, transparent 40%),
    var(--bg-primary)
  `,
  color: 'var(--text-primary)',
  position: 'relative',
};

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
  border: '1px solid rgba(255,255,255,0.06)',
  boxShadow: '0 8px 30px rgba(0,0,0,0.25)'
};

const activeTabStyle = {
  flex: 1,
  border: 'none',
  background: 'var(--button-gradient)',
  color: '#fff',
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

const fabStyle = {
  position: 'fixed',
  bottom: '32px',
  right: '32px',
  width: '64px',
  height: '64px',
  borderRadius: '50%',
  background: 'var(--button-gradient)',
  border: 'none',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  boxShadow: '0 10px 30px rgba(124,58,237,0.5)',
  zIndex: 5000,
  transition: 'all 0.25s ease'
};

const chatOverlayStyle = {
  position: 'absolute',
  bottom: '110px',
  right: '32px',
  width: '380px',
  maxWidth: 'calc(100vw - 48px)',
  height: '420px',
  maxHeight: '60vh',
  background: 'var(--bg-secondary, rgba(28,28,36,0.98))',
  borderRadius: 'var(--radius-lg, 16px)',
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  zIndex: 4999
};

const buddyHeader = {
  padding: '12px 16px',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontWeight: '600',
  color: 'var(--text-primary)'
};

const chatArea = {
  flex: 1,
  overflowY: 'auto',
  padding: '12px',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px'
};

const userMsgStyle = {
  alignSelf: 'flex-end',
  background: 'rgba(124,58,237,0.25)',
  border: '1px solid rgba(124,58,237,0.35)',
  padding: '10px 12px',
  borderRadius: '12px',
  maxWidth: '85%'
};

const buddyMsgStyle = {
  alignSelf: 'flex-start',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
  padding: '10px 12px',
  borderRadius: '12px',
  maxWidth: '85%'
};

const inputArea = {
  padding: '12px',
  borderTop: '1px solid rgba(255,255,255,0.06)',
  display: 'flex',
  gap: '8px'
};

const chatInputStyle = {
  flex: 1,
  background: 'rgba(0,0,0,0.25)',
  border: '1px solid rgba(255,255,255,0.12)',
  color: 'var(--text-primary)',
  borderRadius: 'var(--radius-md, 8px)',
  padding: '10px 12px',
  outline: 'none',
  fontSize: '14px'
};

const sendBtn = {
  background: 'var(--button-gradient)',
  border: 'none',
  borderRadius: 'var(--radius-md, 8px)',
  padding: '10px 14px',
  color: 'white',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
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
  background: isActive ? 'var(--button-gradient)' : 'var(--bg-secondary)',
  border: isActive ? 'none' : '1px solid rgba(255,255,255,0.1)',
  borderRadius: '24px',
  padding: '10px 16px',
  color: isActive ? 'white' : 'var(--text-primary)',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  cursor: 'pointer',
  fontWeight: '600',
  boxShadow: isActive ? '0 8px 20px rgba(124,58,237,0.4)' : '0 4px 12px rgba(0,0,0,0.2)',
  transition: 'all 0.2s',
});
