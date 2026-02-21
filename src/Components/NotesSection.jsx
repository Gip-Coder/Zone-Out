import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FileText, Plus, Trash2, X, UploadCloud, Loader, ChevronDown, ChevronUp, Table as TableIcon, MessageSquare, Send, ArrowLeft, Brain, Calendar, CheckSquare, Save, Youtube, Play, CheckCircle, Bot, Clock, Pause, RotateCcw } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { Brain as BrainAgent } from '../agent';

// --- CONFIGURATION ---
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.624/build/pdf.worker.min.mjs`;

// --- DATABASE UTILITIES ---
const DB_NAME = 'StudyBuddyVault';
const DB_VERSION = 3;
const STORE_COURSES = 'courses';
const STORE_GOALS = 'goals';

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_COURSES)) db.createObjectStore(STORE_COURSES, { keyPath: 'id' });
      if (!db.objectStoreNames.contains(STORE_GOALS)) db.createObjectStore(STORE_GOALS, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

function ManualFileSortModal({ files, courses, onAssign, onCancel, inputStyle, primaryBtnStyle, secondaryBtnStyle, modalOverlayStyle, modalContentStyle }) {
  const [assignments, setAssignments] = useState(() => files.map(f => ({ fileIndex: f.index, courseIndex: 0, moduleIndex: 0 })));
  const update = (fileIndex, field, value) => {
    const num = Number(value);
    setAssignments(prev => prev.map(a => {
      if (a.fileIndex !== fileIndex) return a;
      if (field === 'courseIndex') return { ...a, courseIndex: num, moduleIndex: 0 };
      return { ...a, [field]: num };
    }));
  };
  return (
    <div style={modalOverlayStyle}>
      <div style={{ ...modalContentStyle, maxWidth: 520 }}>
        <h3 style={{ marginBottom: 16 }}>Assign files to course & module</h3>
        <p style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: 16 }}>AI couldn't sort these. Pick destination for each file.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 360, overflowY: 'auto' }}>
          {files.map(f => (
            <div key={f.index} style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ flex: '1 1 140px', fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis' }} title={f.name}>{f.name}</span>
              <select value={assignments.find(a => a.fileIndex === f.index)?.courseIndex ?? 0} onChange={e => update(f.index, 'courseIndex', e.target.value)} style={{ ...inputStyle, marginBottom: 0, width: 140 }}>{courses.map((c, i) => <option key={c.id} value={i}>{c.name}</option>)}</select>
              <select value={assignments.find(a => a.fileIndex === f.index)?.moduleIndex ?? 0} onChange={e => update(f.index, 'moduleIndex', e.target.value)} style={{ ...inputStyle, marginBottom: 0, width: 160 }}>{courses[assignments.find(a => a.fileIndex === f.index)?.courseIndex ?? 0]?.modules?.map((m, i) => <option key={i} value={i}>{m.title}</option>) ?? []}</select>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={() => onAssign(assignments)} style={primaryBtnStyle}>Assign all</button>
          <button onClick={onCancel} style={secondaryBtnStyle}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

const dbAPI = {
  getAll: async (storeName) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const req = db.transaction(storeName, 'readonly').objectStore(storeName).getAll();
      req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error);
    });
  },
  save: async (storeName, val) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const req = db.transaction(storeName, 'readwrite').objectStore(storeName).put(val);
      req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error);
    });
  },
  delete: async (storeName, id) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const req = db.transaction(storeName, 'readwrite').objectStore(storeName).delete(id);
      req.onsuccess = () => resolve(); req.onerror = () => reject(req.error);
    });
  }
};

export default function App() {
  const [courses, setCourses] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loadingDB, setLoadingDB] = useState(true);

  // --- RESPONSIVE STATE ---
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const load = async () => {
      try { 
        const c = await dbAPI.getAll(STORE_COURSES) || [];
        const g = await dbAPI.getAll(STORE_GOALS) || [];
        setCourses(c);
        setGoals(g);
      } 
      catch (e) { console.error("DB Error", e); } 
      finally { setLoadingDB(false); }
    };
    load();
  }, []);

  // --- UI STATE ---
  const [view, setView] = useState('dashboard'); 
  const [activeCourseId, setActiveCourseId] = useState(null);
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSyllabusModal, setShowSyllabusModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  
  // Notes State
  const [showNotesModal, setShowNotesModal] = useState(false); 
  const [activeModuleForNotes, setActiveModuleForNotes] = useState(null);

  // Video State
  const [showVideoModal, setShowVideoModal] = useState(false);
  
  // Accordions & Chat
  const [expandedSyllabusIndex, setExpandedSyllabusIndex] = useState(null);
  const [expandedFileModuleIndex, setExpandedFileModuleIndex] = useState(0); 
  const [showChat, setShowChat] = useState(false); 
  
  // Chat Data
  const [chatHistory, setChatHistory] = useState([{ role: 'model', text: "I'm Study Buddy! I can control the app. Ask me to 'Start a 40 min timer' or 'Go to goals'."}]);
  const [chatInput, setChatInput] = useState("");
  const [isChatting, setIsChatting] = useState(false);
  const chatEndRef = useRef(null);
  const sortFileInputRef = useRef(null);

  // Quiz State
  const [quizData, setQuizData] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  // Video Recommendation State
  const [videoModuleId, setVideoModuleId] = useState("");
  const [videoRec, setVideoRec] = useState(null);
  const [isVideoLoading, setIsVideoLoading] = useState(false);

  // Focus Timer State
  const [focusTime, setFocusTime] = useState(25 * 60);
  const [isFocusRunning, setIsFocusRunning] = useState(false);
  const focusIntervalRef = useRef(null);

  // Inputs
  const [searchQuery, setSearchQuery] = useState("");
  const [syllabusMode, setSyllabusMode] = useState('pdf'); 
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [rawSyllabusText, setRawSyllabusText] = useState("");
  const [manualModuleLines, setManualModuleLines] = useState(""); 
  
  // Goal Inputs
  const [goalTitle, setGoalTitle] = useState("");
  const [goalDate, setGoalDate] = useState("");
  const [goalCourseId, setGoalCourseId] = useState("");

  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirmConfig, setConfirmConfig] = useState(null);
  const [manualSortState, setManualSortState] = useState(null);

  const [currentModelIndex, setCurrentModelIndex] = useState(() => {
    return parseInt(localStorage.getItem('sb_model_index') || '0');
  });

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };
  const activeCourse = courses.find(c => c.id === activeCourseId);

  // --- CENTRALIZED BRAIN (all AI goes through here) ---
  const getAppStateRef = useRef(() => ({}));
  const dispatchRef = useRef(() => {});
  getAppStateRef.current = () => ({
    view,
    activeCourseId,
    activeCourse: activeCourse ? { id: activeCourse.id, name: activeCourse.name, modules: activeCourse.modules, syllabus: activeCourse.syllabus } : null,
    focusTime,
    isFocusRunning,
    goals,
  });
  const brain = useMemo(
    () => new BrainAgent(
      () => getAppStateRef.current?.(),
      (action) => dispatchRef.current?.(action)
    ),
    []
  );
  const callBrainGenerate = async (prompt) => {
    const result = await brain.generateContent(prompt, {
      currentModelIndex,
      setModelIndex: (idx) => {
        setCurrentModelIndex(idx);
        localStorage.setItem('sb_model_index', String(idx));
      },
    });
    return brain.cleanAndParseJSON(result.response.text());
  };
  
  const resetForm = () => { 
    setShowAddModal(false); 
    setNewCode(""); 
    setNewName(""); 
    setRawSyllabusText(""); 
    setManualModuleLines("");
    setStatusMsg(""); 
  };
  
  const readFileAsUrl = (file) => URL.createObjectURL(file);

  // --- MANUAL FALLBACKS (when API key exhausted or AI fails) ---
  /** General heading-based parser (Module/Chapter/Unit, ##, numbered lines). */
  const manualParseSyllabus = (text) => {
    if (!text || !text.trim()) return [{ title: "General", topics: ["Overview"] }];
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const modules = [];
    let current = null;
    for (const line of lines) {
      const isHeading = /^(Module|Chapter|Unit|Part)\s*\d*[.:]?\s*.+$/i.test(line) || /^#+\s+.+/.test(line) || /^\d+[.)]\s+[A-Z]/.test(line);
      if (isHeading && line.length < 120) {
        if (current) modules.push(current);
        current = { title: line.replace(/^#+\s*/, ""), topics: [] };
      } else if (current && line.length > 0) {
        const topic = line.replace(/^[-•*]\s*/, "").trim();
        if (topic) current.topics.push(topic);
      }
    }
    if (current) modules.push(current);
    if (modules.length === 0) return [{ title: "General", topics: lines.slice(0, 20).map((l) => l.substring(0, 80)) }];
    return modules;
  };

  /** Tabular / CO (Course Outcome) style syllabus parser. */
  const improvedManualParse = (text) => {
    if (!text || !text.trim()) return [];
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const modules = [];
    let current = null;
    lines.forEach((line) => {
      const moduleMatch = line.match(/^\d+\s*-\s*.+?- CO:/i);
      const topicMatch = line.match(/^\d+\s*-\s*(.+)$/);
      if (moduleMatch) {
        if (current) modules.push(current);
        current = { title: line.split("\t")[0].trim(), topics: [] };
      } else if (topicMatch && current) {
        const topic = topicMatch[1].split("\t")[0].trim();
        if (topic) current.topics.push(topic);
      }
    });
    if (current) modules.push(current);
    return modules;
  };

  const manualQuizFromModule = (module) => {
    const topics = module.topics?.length ? module.topics : ["key concept 1", "key concept 2", "key concept 3"];
    const questions = topics.slice(0, 5).map((t, i) => ({
      q: `What best describes "${t}" in ${module.title}?`,
      options: ["A key concept in this module.", "Not covered.", "See your notes for details.", "Review the syllabus."],
      answer: 0,
      explanation: `Review "${t}" in your notes and syllabus for ${module.title}.`,
    }));
    return { questions, current: 0, score: 0, showResult: false };
  };

  const manualPlanFromCourse = (course, targetDate) => {
    const start = new Date();
    const end = new Date(targetDate);
    const daysTotal = Math.max(1, Math.ceil((end - start) / (24 * 60 * 60 * 1000)));
    const plan = (course.modules || []).map((m, i) => {
      const dayOffset = Math.floor((i / Math.max(1, course.modules.length)) * daysTotal);
      const d = new Date(start);
      d.setDate(d.getDate() + dayOffset);
      return { date: d.toISOString().split("T")[0], task: m.title, done: false };
    });
    if (plan.length === 0) plan.push({ date: targetDate, task: "Review course", done: false });
    return plan;
  };

  const extractTextFromPDF = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = "";
    for (let i = 1; i <= Math.min(pdf.numPages, 15); i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map(item => item.str).join(" ") + "\n";
    }
    return text;
  };

  // --- TIMER LOGIC ---
  useEffect(() => {
    if (isFocusRunning && focusTime > 0) {
      focusIntervalRef.current = setInterval(() => {
        setFocusTime((prev) => prev - 1);
      }, 1000);
    } else if (focusTime === 0) {
      setIsFocusRunning(false);
      showToast("Focus Session Complete!");
      clearInterval(focusIntervalRef.current);
    }
    return () => clearInterval(focusIntervalRef.current);
  }, [isFocusRunning, focusTime]);

  const toggleFocus = () => setIsFocusRunning(!isFocusRunning);
  const resetFocus = () => { setIsFocusRunning(false); setFocusTime(25 * 60); };
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // --- 🧠 AI AGENCY: THE CONTROLLER LOGIC ---
  const handleAiAction = async (action) => {
    if (!action) return;

    switch (action.type) {
      case 'SET_TIMER':
        setFocusTime(action.minutes * 60);
        setIsFocusRunning(true);
        showToast(`Timer set for ${action.minutes}m`);
        break;
      case 'STOP_TIMER':
        setIsFocusRunning(false);
        showToast("Timer Paused");
        break;
      case 'NAVIGATE':
        if(action.view === 'dashboard') setView('dashboard');
        if(action.view === 'goals') setView('goals');
        if(action.view === 'course' && activeCourse) setView('course-detail');
        break;
      case 'OPEN_RESOURCE':
         // Physical change: Open the modal
         if (action.resource === 'notes' && action.moduleName) {
             setActiveModuleForNotes(action.moduleName);
             setShowNotesModal(true);
         }
         break;
      case 'ADD_GOAL':
        const newGoal = {
          id: Date.now(),
          title: action.title,
          targetDate: action.date || new Date().toISOString().split('T')[0],
          courseName: activeCourse ? activeCourse.name : "General",
          plan: [{ date: new Date().toISOString().split('T')[0], task: "AI Created Task", done: false }]
        };
        setGoals(prev => [...prev, newGoal]);
        await dbAPI.save(STORE_GOALS, newGoal);
        showToast("Goal Added by AI");
        break;
      default:
        break;
    }
  };
  dispatchRef.current = handleAiAction;

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
      setChatHistory(prev => [...prev, { role: 'model', text: "I'm having trouble connecting to my brain right now." }]);
    }
    setIsChatting(false);
  };

  // --- VIDEO SEARCH LOGIC (Smart Search) ---
  const handleGetVideoRec = async () => {
    if(!videoModuleId && videoModuleId !== 0) return showToast("Select a module", "error");
    setIsVideoLoading(true); setVideoRec(null);
    const mod = activeCourse.modules[videoModuleId];
    try {
      const prompt = `
        Find the single BEST YouTube video tutorial for:
        "${mod.title}: ${mod.topics.slice(0, 3).join(', ')}"
        Return RAW JSON only:
        { "videoTitle": "Exact Title", "channelName": "Channel Name", "reason": "Why this video is good (1 sentence)" }
      `;
      const data = await callBrainGenerate(prompt);
      setVideoRec(data);
    } catch (e) {
      const searchQuery = [mod.title, ...(mod.topics || []).slice(0, 3)].join(" ");
      setVideoRec({
        videoTitle: `${mod.title} – search for a tutorial`,
        channelName: "YouTube Search",
        reason: "AI unavailable. Click to open YouTube and pick a video.",
        searchQuery,
      });
      showToast("Using manual search link", "success");
    }
    setIsVideoLoading(false);
  };

  const openSmartVideoLink = () => {
    if (!videoRec) return;
    const query = videoRec.searchQuery ? encodeURIComponent(videoRec.searchQuery) : encodeURIComponent(`${videoRec.videoTitle} ${videoRec.channelName}`);
    window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank');
  };

  const handleCreateGoal = async () => {
    if (!goalTitle || !goalDate || !goalCourseId) return showToast("Fill all fields", "error");
    setIsProcessing(true); setStatusMsg("Optimizing Schedule...");
    const course = courses.find(c => c.id === parseInt(goalCourseId));
    try {
      const prompt = `
        Act as an Elite Study Strategist.
        Course: "${course.name}"
        Modules: ${course.modules.map(m => m.title).join(", ")}.
        Target Date: ${goalDate}.
        Current Date: ${new Date().toISOString().split('T')[0]}.
        TASK: Create a strategic checklist.
        Return RAW JSON: { "plan": [ { "date": "YYYY-MM-DD", "task": "Strategy Name", "done": false } ] }
      `;
      let plan;
      try {
        const data = await callBrainGenerate(prompt);
        plan = Array.isArray(data.plan) ? data.plan : manualPlanFromCourse(course, goalDate);
      } catch (e) {
        plan = manualPlanFromCourse(course, goalDate);
        showToast("AI unavailable; plan generated from modules.", "success");
      }
      const newGoal = { id: Date.now(), title: goalTitle, targetDate: goalDate, courseName: course.name, plan };
      setGoals(prev => [...prev, newGoal]);
      await dbAPI.save(STORE_GOALS, newGoal);
      setShowGoalModal(false);
      showToast("Plan Created!");
    } catch (e) { showToast("Planning Failed", "error"); }
    setIsProcessing(false);
  };

  const toggleGoalTask = async (goalId, taskIndex) => {
    const updatedGoals = goals.map(g => {
      if (g.id === goalId) {
        const newPlan = [...g.plan];
        newPlan[taskIndex].done = !newPlan[taskIndex].done;
        return { ...g, plan: newPlan };
      }
      return g;
    });
    setGoals(updatedGoals);
    await dbAPI.save(STORE_GOALS, updatedGoals.find(g => g.id === goalId));
  };

  const deleteGoal = async (id) => {
    setGoals(prev => prev.filter(g => g.id !== id));
    await dbAPI.delete(STORE_GOALS, id);
  };

  const handleGenerateQuiz = async (module) => {
    setQuizLoading(true); setQuizData(null); setSelectedOption(null);
    try {
      const prompt = `Create 5 MCQs for "${module.title}". Topics: ${module.topics?.join(", ")}. Return RAW JSON ONLY. Format: { "questions": [{ "q": "", "options": ["","","",""], "answer": 0, "explanation": "" }] }`;
      const data = await callBrainGenerate(prompt);
      setQuizData({ ...data, current: 0, score: 0, showResult: false });
    } catch (e) {
      setQuizData(manualQuizFromModule(module));
      showToast("AI unavailable; using manual quiz.", "success");
    }
    setQuizLoading(false);
  };

  const handleQuizAnswer = (idx) => {
    if (selectedOption !== null) return;
    setSelectedOption(idx);
  };

  const handleNextQuestion = () => {
    if (!quizData) return;
    const isCorrect = selectedOption === quizData.questions[quizData.current].answer;
    const nextScore = isCorrect ? quizData.score + 1 : quizData.score;

    if (quizData.current + 1 < quizData.questions.length) {
      setQuizData(prev => ({ ...prev, current: prev.current + 1, score: nextScore }));
      setSelectedOption(null);
    } else {
      setQuizData(prev => ({ ...prev, score: nextScore, showResult: true }));
    }
  };

  const closeQuiz = () => {
    setQuizData(null);
    setQuizLoading(false);
  };

  const handleCreateCourse = async (fileUpload = null) => {
    if (!newCode?.trim() || !newName?.trim()) return showToast("Enter details", "error");
    setIsProcessing(true);
    setStatusMsg("Reading Syllabus...");
    let text = "";
    try {
      if (syllabusMode === "pdf" && fileUpload) text = await extractTextFromPDF(fileUpload);
      else text = rawSyllabusText || "";
      text = (text || "").trim();

      if (syllabusMode === "manual") {
        const lines = manualModuleLines.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
        const finalModules = lines.length ? lines.map((t) => ({ title: t, topics: ["Review this module"] })) : [{ title: "General", topics: ["Overview"] }];
        const newCourse = { id: Date.now(), code: newCode.trim().toUpperCase(), name: newName.trim(), syllabus: "", modules: finalModules, files: {}, moduleNotes: {} };
        newCourse.modules.forEach(m => { newCourse.files[m.title] = []; newCourse.moduleNotes[m.title] = ""; });
        setCourses(prev => [...prev, newCourse]);
        await dbAPI.save(STORE_COURSES, newCourse);
        resetForm();
        setManualModuleLines("");
        showToast("Course Added Successfully");
        setIsProcessing(false);
        return;
      }

      if (!text) {
        showToast("No syllabus text found.", "error");
        setIsProcessing(false);
        return;
      }

      const looksTabular = text.includes("\t") || text.includes("Bloom") || /Module Detail/i.test(text);
      let finalModules = null;

      if (!looksTabular) {
        try {
          setStatusMsg("AI extracting structure...");
          const cleanedText = text.replace(/\t/g, " | ").replace(/\s{2,}/g, " ").substring(0, 20000);
          const prompt = `Analyze syllabus and return RAW JSON ONLY. Format: { "syllabus": [ { "title": "Module 1: Name", "topics": ["Topic A", "Topic B"] } ] } INPUT: "${cleanedText}"`;
          const data = await callBrainGenerate(prompt);
          if (Array.isArray(data?.syllabus) && data.syllabus.length > 0) finalModules = data.syllabus;
        } catch (e) {
          console.warn("AI parsing failed:", e);
        }
      }

      if (!finalModules || finalModules.length === 0) {
        setStatusMsg("Using structured parser...");
        finalModules = improvedManualParse(text);
        if (!finalModules.length) finalModules = manualParseSyllabus(text);
        if (!finalModules.length) {
          const lines = text.split(/\n/).map((l) => l.trim()).filter(Boolean);
          finalModules = [{ title: "General", topics: lines.slice(0, 10).map((l) => l.substring(0, 80)) }];
        }
        if (looksTabular) showToast("Tabular syllabus parsed; AI skipped.", "success");
        else showToast("AI unavailable; structure parsed manually.", "success");
      }

      const newCourse = { id: Date.now(), code: newCode.trim().toUpperCase(), name: newName.trim(), syllabus: text, modules: finalModules, files: {}, moduleNotes: {} };
      newCourse.modules.forEach(m => { newCourse.files[m.title] = []; newCourse.moduleNotes[m.title] = ""; });
      setCourses(prev => [...prev, newCourse]);
      await dbAPI.save(STORE_COURSES, newCourse);
      resetForm();
      setManualModuleLines("");
      showToast("Course Added Successfully");
    } catch (e) {
      console.error("Course creation failed:", e);
      showToast("Failed to create course.", "error");
    }
    setIsProcessing(false);
  };

  const handleSmartDrop = async (files) => {
    if (!files || files.length === 0) return;
    if (courses.length === 0) return showToast("Create a course first", "error");
    setIsProcessing(true); setStatusMsg(`Analyzing ${files.length} files...`); 
    const updatedList = [...courses];
    const changedIds = new Set();
    const filesData = [];

    for (let i = 0; i < files.length; i++) {
      try {
        const file = files[i];
        let text = file.type === "application/pdf" ? await extractTextFromPDF(file) : await file.text();
        filesData.push({ index: i, name: file.name, preview: text.substring(0, 1000) });
      } catch (e) { console.error("File read error", e); }
    }

    if (filesData.length === 0) { setIsProcessing(false); return; }

    const courseStructure = updatedList.map((c, idx) => `COURSE_ID_${idx}: ${c.code} (${c.name})\nMODULES: ${c.modules.map((m, mIdx) => `[${mIdx}] ${m.title}`).join(", ")}`).join("\n\n");
    const filesInput = filesData.map(f => `FILE_${f.index} Name: "${f.name}"\nContent: "${f.preview}"`).join("\n---\n");

    const prompt = `Match files to Courses. COURSES: ${courseStructure} FILES: ${filesInput} Return RAW JSON: { "matches": [ { "fileIndex": 0, "courseIndex": 1, "moduleIndex": 2 }, ... ] }`;

    const applyMatches = (matches) => {
      matches.forEach(match => {
        const originalFile = files[match.fileIndex];
        const targetCourse = updatedList[match.courseIndex];
        if (targetCourse && originalFile) {
          const targetModule = targetCourse.modules[match.moduleIndex] || targetCourse.modules[0];
          const mKey = targetModule.title;
          if (!targetCourse.files[mKey]) targetCourse.files[mKey] = [];
          targetCourse.files[mKey].push({ id: Date.now() + Math.random(), title: originalFile.name, url: readFileAsUrl(originalFile), type: originalFile.name.split('.').pop().toUpperCase(), date: new Date().toLocaleDateString() });
          changedIds.add(targetCourse.id);
        }
      });
    };
    try {
      setStatusMsg("AI Sorting Batch...");
      const data = await callBrainGenerate(prompt);
      if (data.matches && data.matches.length > 0) {
        applyMatches(data.matches);
        showToast(`Sorted ${data.matches.length} files`);
      } else {
        setManualSortState({ files: filesData.map(f => ({ index: f.index, name: f.name })), fileObjects: files, courses: updatedList });
        showToast("Assign files manually", "success");
      }
    } catch (e) {
      setManualSortState({ files: filesData.map(f => ({ index: f.index, name: f.name })), fileObjects: files, courses: updatedList });
      showToast("AI unavailable; assign files manually.", "success");
    }
    for (const id of changedIds) await dbAPI.save(STORE_COURSES, updatedList.find(c => c.id === id));
    setCourses(updatedList);
    setIsProcessing(false);
  };

  const handleManualSortAssign = async (assignments) => {
    if (!manualSortState) return;
    const { fileObjects, courses: list } = manualSortState;
    const changedIds = new Set();
    assignments.forEach(a => {
      const originalFile = fileObjects[a.fileIndex];
      const targetCourse = list[a.courseIndex];
      if (targetCourse && originalFile) {
        const targetModule = targetCourse.modules[a.moduleIndex ?? 0] || targetCourse.modules[0];
        const mKey = targetModule.title;
        if (!targetCourse.files[mKey]) targetCourse.files[mKey] = [];
        targetCourse.files[mKey].push({ id: Date.now() + Math.random(), title: originalFile.name, url: readFileAsUrl(originalFile), type: originalFile.name.split('.').pop().toUpperCase(), date: new Date().toLocaleDateString() });
        changedIds.add(targetCourse.id);
      }
    });
    for (const id of changedIds) await dbAPI.save(STORE_COURSES, list.find(c => c.id === id));
    setCourses([...list]);
    setManualSortState(null);
    showToast("Files assigned.");
  };

  const handleSaveModuleNotes = async (text) => {
    if (!activeCourse || !activeModuleForNotes) return;
    const updatedNotes = { ...(activeCourse.moduleNotes || {}), [activeModuleForNotes]: text };
    const updatedCourse = { ...activeCourse, moduleNotes: updatedNotes };
    setCourses(prev => prev.map(c => c.id === activeCourse.id ? updatedCourse : c));
    await dbAPI.save(STORE_COURSES, updatedCourse);
  };

  const openModuleNotes = (moduleTitle) => {
    setActiveModuleForNotes(moduleTitle);
    setShowNotesModal(true);
  };

  const handleDeleteCourse = (id) => {
    setConfirmConfig({ title: "Delete Course?", message: "This removes data permanently.", onConfirm: async () => { setCourses(prev => prev.filter(c => c.id !== id)); await dbAPI.delete(STORE_COURSES, id); if (activeCourseId === id) setView('dashboard'); showToast("Deleted"); setConfirmConfig(null); } });
  };

  const handleDeleteFile = (cid, mt, fid) => {
    setConfirmConfig({ title: "Delete File?", message: "Remove file?", onConfirm: async () => { const c = courses.find(x => x.id === cid); if (c) { const u = { ...c, files: { ...c.files, [mt]: c.files[mt].filter(f => f.id !== fid) } }; setCourses(p => p.map(x => x.id === cid ? u : x)); await dbAPI.save(STORE_COURSES, u); showToast("Removed"); } setConfirmConfig(null); } });
  };

  const toggleSyllabusAccordion = (idx) => setExpandedSyllabusIndex(expandedSyllabusIndex === idx ? null : idx);

  // --- RENDER HELPERS ---
  if (loadingDB) return <div className="glass-panel" style={{...containerStyle, alignItems:'center', justifyContent:'center'}}><Loader className="spin-anim" /></div>;

  return (
    <div className="glass-panel" style={containerStyle}>
      <style>
        {`
          .spin-anim { animation: spin 1s linear infinite; } 
          @keyframes spin { 100% { transform: rotate(360deg); } }
          .interactive-card { transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.2s ease; }
          .interactive-card:active { transform: scale(0.98); }
          @media (hover: hover) {
            .interactive-card:hover { transform: translateY(-5px); box-shadow: 0 15px 30px rgba(0,0,0,0.4) !important; background: rgba(255,255,255,0.08) !important; }
          }
          textarea::-webkit-scrollbar { width: 8px; }
          textarea::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 4px; }
        `}
      </style>

      {toast && <div style={{ ...toastStyle, background: toast.type === 'error' ? '#ef4444' : '#10b981' }}>{toast.msg}</div>}
      
      {/* GLOBAL FILE INPUT */}
      <input type="file" multiple ref={sortFileInputRef} style={{display:'none'}} onChange={(e) => handleSmartDrop(e.target.files)} />

      {/* GLOBAL CHAT "STUDY BUDDY" OVERLAY */}
      {showChat && (
        <div style={{position:'fixed', bottom: 80, right: 20, width: 350, height: 500, background: '#2e1065', borderRadius: 16, boxShadow: '0 10px 40px rgba(0,0,0,0.5)', zIndex: 4000, display: 'flex', flexDirection: 'column', border: '1px solid rgba(255,255,255,0.2)'}}>
          <div style={{padding: 15, background: '#4c1d95', borderTopLeftRadius: 16, borderTopRightRadius: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <div style={{display:'flex', alignItems:'center', gap: 10}}>
              <Bot size={20} color="#f472b6"/>
              <strong>Study Buddy AI</strong>
            </div>
            <X size={18} style={{cursor:'pointer'}} onClick={()=>setShowChat(false)}/>
          </div>
          <div style={{flex: 1, overflowY: 'auto', padding: 15, display: 'flex', flexDirection: 'column', gap: 10}}>
            {chatHistory.map((msg, i) => (
              <div key={i} style={{alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', background: msg.role === 'user' ? '#f472b6' : 'rgba(255,255,255,0.1)', padding: '8px 12px', borderRadius: 10, maxWidth: '85%', fontSize: '0.9rem'}}>
                {msg.text}
              </div>
            ))}
            {isChatting && <div style={{alignSelf: 'flex-start', fontSize: '0.8rem', opacity: 0.7}}>Thinking...</div>}
            <div ref={chatEndRef} />
          </div>
          <div style={{padding: 10, display: 'flex', gap: 10, borderTop: '1px solid rgba(255,255,255,0.1)'}}>
            <input 
              value={chatInput} 
              onChange={e=>setChatInput(e.target.value)} 
              onKeyDown={e=>e.key==='Enter' && handleSendMessage()} 
              placeholder="Ask to set timer, add goals..." 
              style={inputStyle}
            />
            <button onClick={handleSendMessage} style={{...primaryBtnStyle, width: 40, padding: 0}}><Send size={16}/></button>
          </div>
        </div>
      )}

      {/* FLOATING ACTION BUTTON FOR STUDY BUDDY */}
      {/* <div onClick={()=>setShowChat(!showChat)} style={{position: 'fixed', bottom: 20, right: 20, width: 50, height: 50, borderRadius: '50%', background: 'var(--button-gradient)',
        boxShadow: 'var(--glow-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', zIndex: 3999}}>
        <Bot size={28} color="white"/>
      </div> */}

      {/* MODALS */}
      {/* 1. Video Recommendation Modal */}
      {showVideoModal && activeCourse && (
        <div style={modalOverlayStyle}>
          <div style={{...modalContentStyle(isMobile), textAlign: 'center'}}>
            <h3 style={{marginBottom:15}}><Youtube style={{marginBottom:-3, marginRight:8}}/> Video Recommender</h3>
            {!videoRec ? (
              <>
                <p style={{opacity:0.7, marginBottom:15}}>Select a module to find the best tutorial.</p>
                <select value={videoModuleId} onChange={e => setVideoModuleId(e.target.value)} style={{...inputStyle, background: 'rgba(0,0,0,0.3)'}}>
                  <option value="">Select Module...</option>
                  {activeCourse.modules.map((m, i) => <option key={i} value={i}>{m.title}</option>)}
                </select>
                <button onClick={handleGetVideoRec} disabled={isVideoLoading} style={{...primaryBtnStyle, width:'100%', marginTop:10}}>
                  {isVideoLoading ? <Loader className="spin-anim"/> : "Find Best Video"}
                </button>
              </>
            ) : (
              <div className="interactive-card" style={{marginTop: 15, background: 'rgba(255,255,255,0.1)', padding: 15, borderRadius: 12, cursor: 'pointer'}} onClick={openSmartVideoLink}>
                <div style={{width:'100%', height:120, background: '#000', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent:'center', marginBottom:10}}>
                  <Play size={40} fill="white" />
                </div>
                <div style={{textAlign:'left'}}>
                  <div style={{fontWeight:'bold', fontSize:'1rem', marginBottom: 4}}>{videoRec.videoTitle}</div>
                  <div style={{fontSize:'0.8rem', opacity:0.7, marginBottom: 8}}>by {videoRec.channelName}</div>
                  <div style={{fontSize:'0.8rem', color: '#f472b6'}}>AI Reason: {videoRec.reason}</div>
                  <div style={{fontSize:'0.7rem', color: '#10b981', marginTop: 5}}>Click to Watch Best Match →</div>
                </div>
              </div>
            )}
            <button onClick={() => {setShowVideoModal(false); setVideoRec(null); setVideoModuleId("")}} style={{...secondaryBtnStyle, width:'100%', marginTop:15}}>Close</button>
          </div>
        </div>
      )}

      {/* 2. Quiz Modal */}
      {(quizLoading || quizData) && (
        <div style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: '#1e1b4b', zIndex: 3000, borderRadius: '16px', display: 'flex', flexDirection: 'column'}}>
          <div style={{padding: '25px', height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column'}}>
            {quizLoading ? (
              <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent: 'center', height: '100%', gap:20}}>
                <Brain size={64} className="spin-anim" color="#f472b6"/>
                <h2 style={{color: 'white'}}>Generating Exam...</h2>
              </div>
            ) : quizData.showResult ? (
              <div style={{textAlign:'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%'}}>
                <div style={{fontSize:'5rem', marginBottom:20}}>{quizData.score >= 4 ? '🏆' : '📚'}</div>
                <h1>Score: {quizData.score} / 5</h1>
                <p style={{color: 'rgba(255,255,255,0.7)'}}>{quizData.score >= 4 ? "Mastery Achieved!" : "Keep Studying!"}</p>
                <button onClick={closeQuiz} style={{...primaryBtnStyle, width:'200px', marginTop:30}}>Done</button>
              </div>
            ) : (
              <div style={{display:'flex', flexDirection:'column', height:'100%', overflow:'hidden'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, flexShrink:0}}>
                  <span style={{opacity:0.6, fontSize: '1.1rem'}}>Question {quizData.current + 1} of 5</span>
                  <button onClick={closeQuiz} style={{background: 'transparent', border:'none', cursor:'pointer', color:'white'}}><X size={28}/></button>
                </div>
                <h2 style={{marginBottom:30, flexShrink:0, lineHeight: 1.4}}>{quizData.questions[quizData.current].q}</h2>
                <div style={{display:'flex', flexDirection:'column', gap:15, flexShrink:0}}>
                  {quizData.questions[quizData.current].options.map((opt, i) => {
                    let bg = 'rgba(255,255,255,0.05)';
                    let border = '1px solid rgba(255,255,255,0.1)';
                    if (selectedOption !== null) {
                      if (i === quizData.questions[quizData.current].answer) { bg = 'rgba(16, 185, 129, 0.2)'; border = '1px solid #10b981'; } 
                      else if (i === selectedOption) { bg = 'rgba(239, 68, 68, 0.2)'; border = '1px solid #ef4444'; }
                    }
                    return (
                      <button key={i} onClick={() => handleQuizAnswer(i)} disabled={selectedOption !== null} style={{...btnStyle, background: bg, border: border, justifyContent:'flex-start', padding:20, textAlign:'left', fontSize: '1rem'}}>
                        <span style={{marginRight:15, fontWeight:'bold', color: 'rgba(255,255,255,0.5)'}}>{String.fromCharCode(65+i)}</span> {opt}
                      </button>
                    );
                  })}
                </div>
                {selectedOption !== null && (
                  <div style={{display:'flex', flexDirection:'column', flex:1, overflow:'hidden', marginTop: 20}}>
                    <div style={{flex:1, overflowY:'auto', padding:20, background:'rgba(255,255,255,0.05)', borderRadius:12, marginBottom:15, borderLeft: '4px solid #f472b6'}}>
                      <strong style={{color:'#f472b6', display:'block', marginBottom:8, fontSize: '1.1rem'}}>Why?</strong>
                      <p style={{fontSize:'1rem', lineHeight:'1.6', margin:0, opacity:0.9}}>{quizData.questions[quizData.current].explanation}</p>
                    </div>
                    <button onClick={handleNextQuestion} style={{...primaryBtnStyle, padding: '15px', fontSize: '1.1rem'}}>
                      {quizData.current + 1 === quizData.questions.length ? "Finish Quiz" : "Next Question →"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Goal Modal */}
      {showGoalModal && <div style={modalOverlayStyle}><div style={modalContentStyle(isMobile)}><h3 style={{marginBottom:20}}>New Study Plan</h3><input placeholder="Goal Name (e.g. CAT2)" value={goalTitle} onChange={e=>setGoalTitle(e.target.value)} style={inputStyle}/><input type="date" value={goalDate} onChange={e=>setGoalDate(e.target.value)} style={inputStyle}/><select value={goalCourseId} onChange={e=>setGoalCourseId(e.target.value)} style={{...inputStyle, background:'#1e1b4b', border:'1px solid #ffffff22'}}><option value="">Select Course</option>{courses.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select><button onClick={handleCreateGoal} style={{...primaryBtnStyle, marginTop:20}} disabled={isProcessing}>{isProcessing?<Loader className="spin-anim"/>:"Generate Plan"}</button><button onClick={()=>setShowGoalModal(false)} style={{...secondaryBtnStyle, width:'100%', marginTop:10}}>Cancel</button></div></div>}

      {/* 4. Add Course Modal */}
      {showAddModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle(isMobile)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}><h3>Add Course</h3><X onClick={resetForm} style={{cursor:'pointer'}}/></div>
            <input placeholder="Code" value={newCode} onChange={e=>setNewCode(e.target.value)} style={inputStyle}/>
            <input placeholder="Name" value={newName} onChange={e=>setNewName(e.target.value)} style={inputStyle}/>
            <div style={{display:'flex', gap:10, margin:'15px 0', flexWrap:'wrap'}}>
              <span onClick={()=>setSyllabusMode('pdf')} style={{color:syllabusMode==='pdf'?'#f472b6':'grey', cursor:'pointer'}}>PDF Upload</span>
              <span onClick={()=>setSyllabusMode('text')} style={{color:syllabusMode==='text'?'#f472b6':'grey', cursor:'pointer'}}>Paste Text</span>
              <span onClick={()=>setSyllabusMode('manual')} style={{color:syllabusMode==='manual'?'#f472b6':'grey', cursor:'pointer'}}>Manual (no AI)</span>
            </div>
            {syllabusMode === 'pdf' ? (
              <div style={dropZoneStyle}>
                <input type="file" id="syl" accept=".pdf" onChange={e=>handleCreateCourse(e.target.files[0])} style={{display:'none'}}/>
                <label htmlFor="syl" style={{cursor:'pointer', width:'100%', height:'100%', display:'flex', justifyContent:'center', alignItems:'center'}}>
                  {isProcessing ? <div style={{display:'flex',gap:'10px'}}><Loader className="spin-anim"/> {statusMsg}</div> : "Upload PDF"}
                </label>
              </div>
            ) : syllabusMode === 'manual' ? (
              <>
                <textarea placeholder="Module names (one per line). No PDF or AI needed." value={manualModuleLines} onChange={e=>setManualModuleLines(e.target.value)} style={{...inputStyle, height:100, resize:'none'}}/>
                <button onClick={()=>handleCreateCourse()} disabled={isProcessing} style={{...primaryBtnStyle, width:'100%', marginTop:15}}>{isProcessing ? <div style={{display:'flex',gap:'10px', justifyContent:'center'}}><Loader className="spin-anim"/> {statusMsg}</div> : 'Create course'}</button>
              </>
            ) : (
              <>
                <textarea placeholder="Paste syllabus text..." value={rawSyllabusText} onChange={e=>setRawSyllabusText(e.target.value)} style={{...inputStyle, height:100, resize:'none'}}/>
                <button onClick={()=>handleCreateCourse()} disabled={isProcessing} style={{...primaryBtnStyle, width:'100%', marginTop:15}}>{isProcessing ? <div style={{display:'flex',gap:'10px', justifyContent:'center'}}><Loader className="spin-anim"/> {statusMsg}</div> : 'Create'}</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* 5. Syllabus Modal */}
      {showSyllabusModal && activeCourse && (
        <div style={modalOverlayStyle}>
          <div style={{...modalContentStyle(isMobile), height:'80vh', overflowY:'auto'}}>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:20}}><h3>Syllabus</h3><X onClick={()=>setShowSyllabusModal(false)} style={{cursor:'pointer'}}/></div>
            {activeCourse.modules.map((m,i)=>(
              <div key={i} style={{marginBottom:10, border:'1px solid #ffffff11', borderRadius:8}}>
                <div onClick={()=>toggleSyllabusAccordion(i)} style={{padding:15, background:'rgba(255,255,255,0.05)', display:'flex', justifyContent:'space-between', cursor:'pointer'}}><span>{m.title}</span>{expandedSyllabusIndex===i?<ChevronUp size={16}/>:<ChevronDown size={16}/>}</div>
                {expandedSyllabusIndex===i && <div style={{padding:15, background:'rgba(0,0,0,0.2)'}}><ol style={{margin:0, paddingLeft:20}}>{m.topics.map((t,j)=><li key={j}>{t}</li>)}</ol></div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Module Notes Modal (Large Size) */}
      {showNotesModal && activeCourse && activeModuleForNotes && (
        <div style={modalOverlayStyle}>
          <div style={{...modalContentStyle(isMobile), height: '85vh', width: isMobile ? '95%' : '80%', maxWidth: '1000px', display: 'flex', flexDirection: 'column'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                <FileText size={20} color="#f472b6"/>
                <h3 style={{margin: 0}}>{activeModuleForNotes} Notes</h3>
              </div>
              <div style={{display: 'flex', gap: 10}}>
                <button onClick={() => showToast("Notes Saved")} style={{...btnStyle, background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', fontSize: '0.8rem'}}><Save size={14} style={{marginRight:5}}/> Auto-Saved</button>
                <X onClick={() => setShowNotesModal(false)} style={{cursor: 'pointer'}} />
              </div>
            </div>
            <textarea
              value={(activeCourse.moduleNotes && activeCourse.moduleNotes[activeModuleForNotes]) || ""}
              onChange={(e) => handleSaveModuleNotes(e.target.value)}
              placeholder={`Type notes for ${activeModuleForNotes}...`}
              style={{
                flex: 1,
                background: 'rgba(0,0,0,0.2)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'white',
                resize: 'none',
                padding: '20px',
                borderRadius: '8px',
                fontSize: '1.1rem', 
                lineHeight: '1.6',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
          </div>
        </div>
      )}

      {confirmConfig && <div style={modalOverlayStyle}><div style={modalContentStyle(isMobile)}><h3>{confirmConfig.title}</h3><div style={{display:'flex', gap:10, marginTop:20}}><button onClick={()=>setConfirmConfig(null)} style={secondaryBtnStyle}>Cancel</button><button onClick={confirmConfig.onConfirm} style={{...primaryBtnStyle, background:'#ef4444'}}>Confirm</button></div></div></div>}

      {/* Manual file assign modal */}
      {manualSortState && (
        <ManualFileSortModal
          files={manualSortState.files}
          courses={manualSortState.courses}
          onAssign={handleManualSortAssign}
          onCancel={() => setManualSortState(null)}
          inputStyle={inputStyle}
          primaryBtnStyle={primaryBtnStyle}
          secondaryBtnStyle={secondaryBtnStyle}
          modalOverlayStyle={modalOverlayStyle}
          modalContentStyle={modalContentStyle(isMobile)}
        />
      )}

      {/* --- HEADER --- */}
      {view === 'course-detail' ? (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexShrink: 0, background: '#7b1fa2', padding: '12px 20px', borderRadius: 12, boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ArrowLeft onClick={() => setView('dashboard')} style={{ cursor: 'pointer' }} size={20} />
            <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#ff80ab' }}>{activeCourse?.code}</h2>
          </div>
          <div style={{display:'flex', gap: 15}}>
            <button onClick={()=>sortFileInputRef.current.click()} style={btnStyleCompact}><UploadCloud size={16}/></button>
            <button onClick={()=>setShowVideoModal(true)} style={btnStyleCompact}>
              <Youtube size={16}/> Video
            </button>
            <button onClick={()=>setShowSyllabusModal(true)} style={btnStyleCompact}><TableIcon size={16}/> Syllabus</button>
            <button onClick={()=>handleDeleteCourse(activeCourseId)} style={{...btnStyleCompact, background: 'rgba(255,0,0,0.2)', color: '#ff80ab'}}><Trash2 size={16}/></button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: isMobile ? '1.2rem' : '1.5rem' }}>{view === 'goals' ? 'Timeline' : 'Study Vault'}</h2>
            </div>
          </div>
          <div style={{display:'flex', gap:10}}>
            <button onClick={()=>setView(view==='goals'?'dashboard':'goals')} style={{...btnStyle, background: view==='goals'?'#f472b6':'#ffffff11'}}><Calendar size={16}/><span style={{display:isMobile?'none':'block', marginLeft:5}}>Goals</span></button>
            {view === 'dashboard' && <button onClick={()=>setShowAddModal(true)} style={btnStyle}><Plus size={16}/></button>}
          </div>
        </div>
      )}

      {/* --- MAIN CONTENT --- */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        
        {/* FOCUS SESSION (Restored for AI control) */}
        

        {view === 'goals' && (
          <div style={{display:'flex', flexDirection:'column', gap:20}}>
            {goals.length === 0 ? <div style={{textAlign:'center', marginTop:50, opacity:0.5}}>No study plans yet. <br/><button onClick={()=>setShowGoalModal(true)} style={{...primaryBtnStyle, width:'auto', marginTop:20}}>Create One</button></div> :
            goals.map(g => (
              <div key={g.id} className="interactive-card" style={goalCardStyle}>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:15}}>
                  <div><h3 style={{margin:0}}>{g.title}</h3><span style={{fontSize:'0.8rem', opacity:0.6}}>{g.courseName} • Due {g.targetDate}</span></div>
                  <Trash2 size={16} style={{cursor:'pointer', opacity:0.5}} onClick={()=>deleteGoal(g.id)}/>
                </div>
                <div style={{display:'flex', flexDirection:'column', gap:8}}>
                  {g.plan.map((task, ti) => (
                    <div key={ti} onClick={()=>toggleGoalTask(g.id, ti)} style={{display:'flex', alignItems:'center', gap:10, cursor:'pointer', opacity: task.done?0.4:1}}>
                      {task.done ? <CheckCircle size={18} color="#10b981"/> : <CheckSquare size={18} color="#ffffff55"/>}
                      <span style={{textDecoration: task.done?'line-through':'none'}}>{task.date}: {task.task}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {view === 'dashboard' && (
          <>
            {!showAddModal && <div onClick={()=>sortFileInputRef.current.click()} style={{...globalDropStyle, borderColor: dragActive ? '#f472b6' : '#ffffff22', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', padding:30}} onDragOver={e=>{e.preventDefault();setDragActive(true)}} onDragLeave={()=>setDragActive(false)} onDrop={e=>{e.preventDefault();setDragActive(false);handleSmartDrop(e.dataTransfer.files)}}>{isProcessing?<div style={{display:'flex',gap:10}}><Loader className="spin-anim"/>{statusMsg}</div>:<><UploadCloud size={32} style={{marginBottom:10, opacity:0.5}}/><div>{isMobile?"Tap to Upload":"Drop Files"}</div><div style={{fontSize:'0.7rem', opacity:0.5}}>Auto-sorted by AI</div></>}</div>}
            <div style={{display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(250px, 1fr))', gap:15}}>
              {courses.map(c => <div key={c.id} className="interactive-card" onClick={()=>{setActiveCourseId(c.id); setView('course-detail')}} style={courseCardStyle}><span style={codeBadgeStyle}>{c.code}</span><h3 style={{margin:'10px 0'}}>{c.name}</h3><div style={{fontSize:'0.8rem', opacity:0.5}}>{c.modules.length} Modules • {Object.values(c.files).flat().length} Files</div></div>)}
            </div>
          </>
        )}

        {view === 'course-detail' && (
          <>
            {/* MODULE LIST */}
            {activeCourse.modules.map((mod, i) => (
              <div key={i} style={{marginBottom:10, border:'1px solid #ffffff11', borderRadius:8}}>
                <div style={{padding:15, background:'#ffffff05', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <div onClick={()=>{setExpandedFileModuleIndex(i===expandedFileModuleIndex?null:i)}} style={{cursor:'pointer', flex:1}}><strong>{mod.title}</strong></div>
                  <div style={{display:'flex', gap: 5}}>
                    <button onClick={()=>openModuleNotes(mod.title)} style={{...btnStyle, padding:'4px 8px', fontSize:'0.7rem', color:'white'}}><FileText size={14}/> Notes</button>
                    <button onClick={()=>handleGenerateQuiz(mod)} style={{...btnStyle, padding:'4px 8px', fontSize:'0.7rem', color:'#f472b6'}}><Brain size={14}/> Quiz</button>
                  </div>
                </div>
                {expandedFileModuleIndex===i && <div style={{padding:15}}>{activeCourse.files[mod.title]?.length===0 ? <span style={{opacity:0.3, fontSize:'0.8rem'}}>No files</span> : activeCourse.files[mod.title]?.map(f=><div key={f.id} style={{padding:'10px', display:'flex', justifyContent:'space-between', borderBottom:'1px solid #ffffff11'}}><a href={f.url} target="_blank" style={{color:'white'}}>{f.title}</a><Trash2 size={14} onClick={()=>handleDeleteFile(activeCourseId, mod.title, f.id)} style={{cursor:'pointer', opacity:0.5}}/></div>)}</div>}
              </div>
            ))}
            <div style={{height:150}}></div>
          </>
        )}
      </div>
    </div>
  );
}

// --- STYLES ---
const containerStyle = {
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  padding: '24px',
  minHeight: '600px',
  position: 'relative',
  color: 'var(--text-primary)',
  background: 'transparent'
};

const toastStyle = {
  position: 'fixed',
  bottom: '24px',
  right: '24px',
  padding: '14px 22px',
  borderRadius: '12px',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  zIndex: 9999,
  boxShadow: '0 15px 40px rgba(0,0,0,0.4)'
};

const btnStyle = {
  background: 'var(--bg-tertiary)',
  border: 'var(--border-soft)',
  borderRadius: '14px',
  padding: '10px 16px',
  color: 'var(--text-primary)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  fontWeight: '500',
  transition: 'all 0.25s ease',
  backdropFilter: 'blur(10px)'
};

const btnStyleCompact = {
  ...btnStyle,
  padding: '8px 12px',
  fontSize: '0.85rem'
};

const primaryBtnStyle = {
  background: 'var(--button-gradient)',
  border: 'none',
  borderRadius: '12px',
  padding: '12px 20px',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  cursor: 'pointer',
  fontWeight: '600',
  boxShadow: '0 8px 30px rgba(124,58,237,0.4)',
  transition: 'all 0.25s ease'
};

const secondaryBtnStyle = {
  background: 'var(--bg-secondary)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '12px',
  padding: '10px 14px',
  color: 'var(--text-primary)',
  cursor: 'pointer',
  display: 'flex',
  gap: '8px',
  alignItems: 'center',
  justifyContent: 'center'
};

const inputStyle = {
  background: 'var(--bg-secondary)',
  border: '1px solid rgba(255,255,255,0.08)',
  padding: '14px',
  borderRadius: '12px',
  color: 'var(--text-primary)',
  outline: 'none',
  boxSizing: 'border-box',
  width:'100%',
  marginBottom:12,
  fontSize: '0.95rem'
};

const dropZoneStyle = {
  border: '2px dashed rgba(255,255,255,0.15)',
  borderRadius: '16px',
  padding: '24px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  cursor: 'pointer',
  background: 'var(--bg-secondary)'
};

const globalDropStyle = {
  border: '2px dashed rgba(255,255,255,0.15)',
  borderRadius: '16px',
  padding: '30px',
  display: 'flex',
  justifyContent: 'center',
  marginBottom: '28px',
  transition: 'all 0.2s',
  color: 'var(--text-secondary)',
  fontSize: '0.95rem',
  background: 'var(--bg-secondary)'
};

const courseCardStyle = {
  background: 'var(--bg-secondary)',
  borderRadius: '18px',
  padding: '24px',
  cursor: 'pointer',
  border: '1px solid rgba(255,255,255,0.05)',
  boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
  transition: 'all 0.25s ease'
};

const goalCardStyle = {
  background: 'var(--bg-secondary)',
  borderRadius: '16px',
  padding: '22px',
  border: '1px solid rgba(255,255,255,0.05)',
  boxShadow: '0 10px 25px rgba(0,0,0,0.25)'
};

const codeBadgeStyle = {
  background: 'var(--accent-primary)',
  color: 'white',
  padding: '5px 10px',
  borderRadius: '8px',
  fontSize: '0.75rem',
  fontWeight: '600'
};

const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0,0,0,0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 3000,
  backdropFilter: 'blur(8px)'
};

const modalContentStyle = (isMobile) => ({
  background: 'var(--bg-secondary)',
  width: isMobile ? '95%' : '90%',
  maxWidth: '450px',
  borderRadius: '20px',
  padding: '28px',
  border: '1px solid rgba(255,255,255,0.08)',
  color: 'var(--text-primary)',
  boxShadow: '0 30px 60px rgba(0,0,0,0.5)'
});
