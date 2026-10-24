import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FileText, Plus, Trash2, X, UploadCloud, Loader, ChevronDown, ChevronUp, Table as TableIcon, Send, ArrowLeft, Brain, Calendar, CheckSquare, Save, Youtube, Play, CheckCircle, Bot } from 'lucide-react';
import { Brain as BrainAgent } from '../agent';
import { validateAction } from '../agent/actions';
import { useProgressContext } from '../context/ProgressContext';
import { dbAPI, STORE_COURSES, STORE_GOALS } from '../utils/studyVaultDb';
import { localDateString } from '../utils/date';
import { normalizeModules, normalizeQuiz, normalizePlan, normalizeVideoRec, validFileMatches, makeFileRecord, openStoredFile } from './notesSectionUtils';

// --- CONFIGURATION ---
// pdfjsLib is loaded dynamically inside extractTextFromPDF to optimize bundle size

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

export default function NotesSection() {
  const [courses, setCourses] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loadingDB, setLoadingDB] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const { pushProgressEvent } = useProgressContext();

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
      catch (e) {
        console.error("DB Error", e);
        setLoadError(e?.message || "Could not open your Course Vault storage.");
      }
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
  const [chatHistory, setChatHistory] = useState([{ role: 'model', text: "I'm Study Buddy! I can control the app. Ask me to 'Start a 40 min timer' or 'Go to goals'." }]);
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

  // Inputs
  const [syllabusMode, setSyllabusMode] = useState('pdf');
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [rawSyllabusText, setRawSyllabusText] = useState("");

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

  const toastTimerRef = useRef(null);
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 3000);
  };
  useEffect(() => () => clearTimeout(toastTimerRef.current), []);
  const activeCourse = courses.find(c => c.id === activeCourseId);

  // --- CENTRALIZED BRAIN (all AI goes through here) ---
  const getAppStateRef = useRef(() => ({}));
  const dispatchRef = useRef(() => { });
  getAppStateRef.current = () => ({
    view,
    activeCourseId,
    activeCourse: activeCourse ? { id: activeCourse.id, name: activeCourse.name, modules: activeCourse.modules, syllabus: activeCourse.syllabus } : null,
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
    const text = await brain.generateWithRouter(prompt);
    return brain.cleanAndParseJSON(text);
  };

  const resetForm = () => {
    setShowAddModal(false);
    setNewCode("");
    setNewName("");
    setRawSyllabusText("");
    setStatusMsg("");
  };

  // --- MANUAL FALLBACKS (when API key exhausted or AI fails) ---
  /** General heading-based parser (Module/Chapter/Unit, ##, numbered lines). */
  const manualParseSyllabus = (text) => {
    if (!text || !text.trim()) return [{ title: "General", topics: ["Overview"] }];
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const modules = [];
    let current = null;
    for (const line of lines) {
      const isHeading = /^(Module|Chapter|Unit|Part)\s*\d*[.:]?\s*.+$/i.test(line) || /^#+\s+.+/.test(line) || /^\d+\s*[-.)]\s+[A-Z]/i.test(line);
      if (isHeading && line.length < 120) {
        if (current) modules.push(current);
        current = { title: line.replace(/^#+\s*/, ""), topics: [] };
      } else if (current && line.length > 0) {
        const topic = line.replace(/^[-•*]\s*/, "").trim();
        if (topic) current.topics.push(topic);
      }
    }
    if (current) modules.push(current);

    // If no headings were found, it might be a simple pasted list of names (old Manual mode) or a blob
    if (modules.length === 0) {
      const avgLength = lines.length ? lines.reduce((acc, l) => acc + l.length, 0) / lines.length : 0;
      // If it looks like a list of module titles (short lines, not a big paragraph of text)
      if (avgLength < 80 && lines.length <= 40) {
        return lines.map(line => ({ title: line, topics: ["Review this module"], completed: false }));
      }
      // Otherwise fallback to a single unstructured module
      return [{ title: "General", topics: lines.slice(0, 20).map((l) => l.substring(0, 80)), completed: false }];
    }
    return modules.map(m => ({ ...m, completed: false }));
  };

  /** Tabular / CO / PDF style syllabus parser. */
  const improvedManualParse = (text) => {
    if (!text || !text.trim()) return [];
    const lines = text.split(/\r?\n/).map((l) => l.trim().replace(/\s{2,}/g, ' ')).filter(Boolean);
    const modules = [];
    let current = null;
    
    // Check if the document has explicit markers like "Module 1", "Module:1", "Unit 2"
    const hasExplicitModules = lines.some(l => /^(?:Module|Unit|Chapter|Part)[\s-:]*\d+/i.test(l));

    lines.forEach((line) => {
      // Stop capturing topics if we hit the bibliography or standard metadata sections often found at the bottom of a syllabus
      if (/^(Total Lecture hours|Text\s*Books?|Reference\s*Books?|Mode of Evaluation|Course Objectives?|Course Outcomes?)/i.test(line)) {
         if (current) modules.push(current);
         current = null;
         return; // skip line
      }

      // Looks for "1 - Intro - CO: 1", etc.
      const isCoModule = /^\d+\s*[-.]+\s*.+?(?:\bCO\s*[:\s]\s*\d+)/i.test(line);
      
      let isStandardHeading = false;
      if (hasExplicitModules) {
        // If explicit modules exist,ONLY trust explicit labels to avoid falsely matching "1. Course outcome"
        isStandardHeading = /^(?:Module|Unit|Chapter|Part)[\s-:]*\d+[.:]?\s*(.*)/i.test(line) || /^#+\s+(.+)/.test(line);
      } else {
        // Fallback to trusting any leading number format
        isStandardHeading = /^(?:Module|Unit|Chapter|Part)[\s-:]*\d+[.:]?\s*(.*)/i.test(line) || /^#+\s+(.+)/.test(line) || /^\d+\s*[-.)]\s+[A-Z]/i.test(line);
      }

      if (isCoModule || isStandardHeading) {
        if (current) modules.push(current);
        // Clean title: remove trailing CO stuff, and optionally trailing "X hours"
        let title = line.replace(/[-–\s]*CO[:\s]*\d+.*$/i, "").trim();
        title = title.replace(/\s+\d+\s*hours?$/i, "").trim();
        current = { title: title, topics: [] };
      } else if (current) {
        // Remove leading dashes, dots, or numbers if it's a list item
        const topic = line.replace(/^[\d•*\-.)]+\s*/, "").trim();
        if (topic.length > 3 && !/^(hours|credits|marks|page|syllabus|pre-requisite)/i.test(topic)) {
          current.topics.push(topic);
        }
      }
    });
    
    if (current) modules.push(current);
    return modules;
  };

  const manualQuizFromModule = (module) => {
    const topics = module.topics?.length ? module.topics : ["key concept 1", "key concept 2", "key concept 3"];
    const questions = topics.slice(0, 5).map((t) => ({
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
      return { date: localDateString(d), task: m.title, done: false };
    });
    if (plan.length === 0) plan.push({ date: targetDate, task: "Review course", done: false });
    return plan;
  };

  const extractTextFromPDF = async (file) => {
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.624/build/pdf.worker.min.mjs`;
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = "";
    for (let i = 1; i <= Math.min(pdf.numPages, 15); i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      
      let lastY = -1;
      content.items.forEach(item => {
        // If Y coordinate changes, it's a new line
        if (lastY !== item.transform[5] && lastY !== -1) {
          text += "\n";
        }
        text += item.str + " ";
        lastY = item.transform[5];
      });
      text += "\n\n";
    }
    return text.replace(/\s+\n/g, "\n");
  };

  // --- 🧠 AI AGENCY: THE CONTROLLER LOGIC ---
  const handleAiAction = async (rawAction) => {
    // Model output is untrusted: ignore anything off the allowlist
    const action = validateAction(rawAction);
    if (!action) return;

    switch (action.type) {
      case 'SET_TIMER':
      case 'STOP_TIMER':
      case 'PAUSE_TIMER':
        // The focus timer lives at the app level (App.jsx); forward to it
        window.dispatchEvent(new CustomEvent('zoneout:ai-action', { detail: action }));
        showToast(action.type === 'SET_TIMER' ? `Timer set for ${action.minutes}m` : "Timer Paused");
        break;
      case 'NAVIGATE':
        if (action.view === 'dashboard') setView('dashboard');
        if (action.view === 'goals') setView('goals');
        if (action.view === 'course' && activeCourse) setView('course-detail');
        break;
      case 'OPEN_RESOURCE':
        // Physical change: Open the modal
        if (action.resource === 'notes' && action.moduleName) {
          setActiveModuleForNotes(action.moduleName);
          setShowNotesModal(true);
        }
        break;
      case 'ADD_GOAL': {
        const today = localDateString();
        const newGoal = {
          id: Date.now(),
          title: action.title,
          targetDate: action.date || today,
          courseName: activeCourse ? activeCourse.name : "General",
          plan: action.plan.length
            ? action.plan.map(p => ({ date: today, task: p.task, done: false }))
            : [{ date: today, task: "AI Created Task", done: false }]
        };
        setGoals(prev => [...prev, newGoal]);
        await dbAPI.save(STORE_GOALS, newGoal);
        showToast("Goal Added by AI");
        break;
      }
      default:
        break;
    }
  };
  const toggleModuleCompletion = async (courseId, moduleIndex) => {
    const updated = courses.map(c => {
      if (c.id !== courseId) return c;
      const newModules = [...c.modules];
      newModules[moduleIndex] = { ...newModules[moduleIndex], completed: !newModules[moduleIndex].completed };
      return { ...c, modules: newModules };
    });
    setCourses(updated);
    const course = updated.find(c => c.id === courseId);
    await dbAPI.save(STORE_COURSES, course);

    // Calculate new global module counts
    const totalModules = updated.reduce((sum, c) => sum + (c.modules?.length || 0), 0);
    const completedModules = updated.reduce((sum, c) => 
      sum + (c.modules?.filter(m => m.completed).length || 0), 0
    );

    // Update global progress
    if (pushProgressEvent) {
      pushProgressEvent({
        eventType: "module_completed",
        value: { total: totalModules, completed: completedModules }
      });
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
    if (!videoModuleId && videoModuleId !== 0) return showToast("Select a module", "error");
    setIsVideoLoading(true); setVideoRec(null);
    const mod = activeCourse.modules[videoModuleId];
    try {
      const prompt = `
        Find the single BEST YouTube video tutorial for:
        "${mod.title}: ${mod.topics.slice(0, 3).join(', ')}"
        Return RAW JSON only:
        { "videoTitle": "Exact Title", "channelName": "Channel Name", "reason": "Why this video is good (1 sentence)" }
      `;
      const data = normalizeVideoRec(await callBrainGenerate(prompt));
      if (!data) throw new Error("Unusable video recommendation");
      setVideoRec(data);
    } catch {
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
    const course = courses.find(c => String(c.id) === String(goalCourseId));
    if (!course) { setIsProcessing(false); return showToast("Select a course", "error"); }
    try {
      const prompt = `
        Act as an Elite Study Strategist.
        Course: "${course.name}"
        Modules: ${course.modules.map(m => m.title).join(", ")}.
        Target Date: ${goalDate}.
        Current Date: ${localDateString()}.
        TASK: Create a strategic checklist.
        Return RAW JSON: { "plan": [ { "date": "YYYY-MM-DD", "task": "Strategy Name", "done": false } ] }
      `;
      let plan;
      try {
        const data = await callBrainGenerate(prompt);
        plan = normalizePlan(data?.plan) || manualPlanFromCourse(course, goalDate);
      } catch {
        plan = manualPlanFromCourse(course, goalDate);
        showToast("AI unavailable; plan generated from modules.", "success");
      }
      const newGoal = { id: Date.now(), title: goalTitle, targetDate: goalDate, courseName: course.name, plan };
      setGoals(prev => [...prev, newGoal]);
      await dbAPI.save(STORE_GOALS, newGoal);
      setShowGoalModal(false);
      setGoalTitle(""); setGoalDate(""); setGoalCourseId("");
      showToast("Plan Created!");
    } catch { showToast("Planning Failed", "error"); }
    setIsProcessing(false);
  };

  const toggleGoalTask = async (goalId, taskIndex) => {
    // Copy the task object too: mutating it in place changed the previous
    // state snapshot and skipped re-renders.
    const updatedGoals = goals.map(g => {
      if (g.id !== goalId) return g;
      const newPlan = g.plan.map((task, i) => i === taskIndex ? { ...task, done: !task.done } : task);
      return { ...g, plan: newPlan };
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
      // Malformed questions (missing options, out-of-range answer) used to
      // crash the quiz modal; normalizeQuiz drops them or rejects the quiz.
      const quiz = normalizeQuiz(await callBrainGenerate(prompt));
      if (!quiz) throw new Error("Unusable quiz");
      setQuizData(quiz);
    } catch {
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
          finalModules = normalizeModules(data?.syllabus);
        } catch (e) {
          console.warn("AI parsing failed:", e);
        }
      }

      if (!finalModules || finalModules.length === 0) {
        setStatusMsg("Using structured parser...");
        finalModules = normalizeModules(improvedManualParse(text));
        if (!finalModules) finalModules = normalizeModules(manualParseSyllabus(text));
        if (!finalModules) {
          const lines = text.split(/\n/).map((l) => l.trim()).filter(Boolean);
          finalModules = normalizeModules([{ title: "General", topics: lines.slice(0, 10).map((l) => l.substring(0, 80)) }]);
        }
        if (looksTabular) showToast("Tabular syllabus parsed; AI skipped.", "success");
        else showToast("AI unavailable; structure parsed manually.", "success");
      }

      // Module titles key files and notes, so normalizeModules guarantees they are unique strings
      const newCourse = { id: Date.now(), code: newCode.trim().toUpperCase(), name: newName.trim(), syllabus: text, modules: finalModules, files: {}, moduleNotes: {} };
      newCourse.modules.forEach(m => { newCourse.files[m.title] = []; newCourse.moduleNotes[m.title] = ""; });
      const updated = [...courses, newCourse];
      setCourses(updated);
      await dbAPI.save(STORE_COURSES, newCourse);
      
      // Update progress totals
      if (pushProgressEvent) {
        const totalMod = updated.reduce((s, c) => s + (c.modules?.length || 0), 0);
        const compMod = updated.reduce((s, c) => s + (c.modules?.filter(m => m.completed).length || 0), 0);
        pushProgressEvent({ eventType: "module_completed", value: { total: totalMod, completed: compMod } });
      }

      resetForm();
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

    try {
      setStatusMsg("AI Sorting Batch...");
      const data = await callBrainGenerate(prompt);
      // Only accept integer indices that point at real files/courses/modules
      const matches = validFileMatches(data?.matches, files.length, updatedList);
      if (matches.length > 0) {
        const { list, changedIds } = assignFiles(updatedList, matches, files);
        for (const id of changedIds) await dbAPI.save(STORE_COURSES, list.find(c => c.id === id));
        setCourses(list);
        showToast(`Sorted ${matches.length} files`);
      } else {
        setManualSortState({ files: filesData.map(f => ({ index: f.index, name: f.name })), fileObjects: files, courses: updatedList });
        showToast("Assign files manually", "success");
      }
    } catch {
      setManualSortState({ files: filesData.map(f => ({ index: f.index, name: f.name })), fileObjects: files, courses: updatedList });
      showToast("AI unavailable; assign files manually.", "success");
    }
    setIsProcessing(false);
  };

  /**
   * Returns new course objects with the files attached (never mutates state).
   * Each file's Blob is stored in IndexedDB; the old code stored a blob: URL
   * that stopped working after a page reload, so every upload was lost.
   */
  const assignFiles = (courseList, matches, fileObjects) => {
    const changedIds = new Set();
    const list = courseList.map(c => ({ ...c, files: { ...c.files } }));
    matches.forEach(match => {
      const originalFile = fileObjects[match.fileIndex];
      const targetCourse = list[match.courseIndex];
      if (!targetCourse || !originalFile || !targetCourse.modules?.length) return;
      const targetModule = targetCourse.modules[match.moduleIndex ?? 0] || targetCourse.modules[0];
      const mKey = targetModule.title;
      targetCourse.files[mKey] = [...(targetCourse.files[mKey] || []), makeFileRecord(originalFile)];
      changedIds.add(targetCourse.id);
    });
    return { list, changedIds };
  };

  const handleManualSortAssign = async (assignments) => {
    if (!manualSortState) return;
    const { fileObjects } = manualSortState;
    // Apply to the latest state, not the snapshot taken when the modal opened
    const { list, changedIds } = assignFiles(courses, assignments, fileObjects);
    for (const id of changedIds) await dbAPI.save(STORE_COURSES, list.find(c => c.id === id));
    setCourses(list);
    setManualSortState(null);
    showToast("Files assigned.");
  };

  const handleOpenFile = (file) => {
    if (!openStoredFile(file)) {
      showToast("This file was uploaded before files were saved offline. Please re-upload it.", "error");
    }
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
    setConfirmConfig({ 
      title: "Delete Course?", 
      message: "This removes data permanently.", 
      onConfirm: async () => { 
        if (activeCourseId === id) { 
          setView('dashboard'); 
          setActiveCourseId(null); 
        } 
        const updated = courses.filter(c => c.id !== id);
        setCourses(updated); 
        await dbAPI.delete(STORE_COURSES, id); 

        // Update progress totals
        if (pushProgressEvent) {
          const totalMod = updated.reduce((s, c) => s + (c.modules?.length || 0), 0);
          const compMod = updated.reduce((s, c) => s + (c.modules?.filter(m => m.completed).length || 0), 0);
          pushProgressEvent({ eventType: "module_completed", value: { total: totalMod, completed: compMod } });
        }

        showToast("Deleted"); 
        setConfirmConfig(null); 
      } 
    });
  };

  const handleDeleteFile = (cid, mt, fid) => {
    setConfirmConfig({ title: "Delete File?", message: "Remove file?", onConfirm: async () => { const c = courses.find(x => x.id === cid); if (c) { const u = { ...c, files: { ...c.files, [mt]: c.files[mt].filter(f => f.id !== fid) } }; setCourses(p => p.map(x => x.id === cid ? u : x)); await dbAPI.save(STORE_COURSES, u); showToast("Removed"); } setConfirmConfig(null); } });
  };

  const toggleSyllabusAccordion = (idx) => setExpandedSyllabusIndex(expandedSyllabusIndex === idx ? null : idx);

  // --- RENDER HELPERS ---
  if (loadingDB) return <div className="glass-panel" style={{ ...containerStyle, alignItems: 'center', justifyContent: 'center' }}><Loader className="spin-anim" /></div>;
  if (loadError) return <div className="glass-panel" role="alert" style={{ ...containerStyle, alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}><p>Couldn’t open your Course Vault.</p><p style={{ opacity: 0.7, fontSize: '0.9rem' }}>{loadError}</p></div>;

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
      <input type="file" multiple ref={sortFileInputRef} style={{ display: 'none' }} onChange={(e) => { const picked = Array.from(e.target.files || []); e.target.value = ""; handleSmartDrop(picked); }} />

      {/* GLOBAL CHAT "STUDY BUDDY" OVERLAY */}
      {showChat && (
        <div style={{ position: 'fixed', bottom: 80, right: 20, width: 350, height: 500, background: 'var(--bg-secondary)', borderRadius: 16, boxShadow: '0 10px 40px rgba(0,0,0,0.5)', zIndex: 4000, display: 'flex', flexDirection: 'column', border: '1px solid var(--glass)' }}>
          <div style={{ padding: 15, background: 'var(--overlay-bg)', borderTopLeftRadius: 16, borderTopRightRadius: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Bot size={20} color="#f472b6" />
              <strong>Study Buddy AI</strong>
            </div>
            <X size={18} style={{ cursor: 'pointer' }} onClick={() => setShowChat(false)} />
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 15, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {chatHistory.map((msg, i) => (
              <div key={i} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', background: msg.role === 'user' ? 'var(--accent-primary)' : 'var(--glass)', padding: '8px 12px', borderRadius: 10, maxWidth: '85%', fontSize: '0.9rem' }}>
                {msg.text}
              </div>
            ))}
            {isChatting && <div style={{ alignSelf: 'flex-start', fontSize: '0.8rem', opacity: 0.7 }}>Thinking...</div>}
            <div ref={chatEndRef} />
          </div>
          <div style={{ padding: 10, display: 'flex', gap: 10, borderTop: '1px solid var(--glass)' }}>
            <input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask to set timer, add goals..."
              style={inputStyle}
            />
            <button onClick={handleSendMessage} style={{ ...primaryBtnStyle, width: 40, padding: 0 }}><Send size={16} /></button>
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
          <div style={{ ...modalContentStyle(isMobile), textAlign: 'center' }}>
            <h3 style={{ marginBottom: 15 }}><Youtube style={{ marginBottom: -3, marginRight: 8 }} /> Video Recommender</h3>
            {!videoRec ? (
              <>
                <p style={{ opacity: 0.7, marginBottom: 15 }}>Select a module to find the best tutorial.</p>
                <select value={videoModuleId} onChange={e => setVideoModuleId(e.target.value)} style={{ ...inputStyle, background: 'var(--overlay-bg)' }}>
                  <option value="">Select Module...</option>
                  {activeCourse.modules.map((m, i) => <option key={i} value={i}>{m.title}</option>)}
                </select>
                <button onClick={handleGetVideoRec} disabled={isVideoLoading} style={{ ...primaryBtnStyle, width: '100%', marginTop: 10 }}>
                  {isVideoLoading ? <Loader className="spin-anim" /> : "Find Best Video"}
                </button>
              </>
            ) : (
              <div className="interactive-card" style={{ marginTop: 15, background: 'var(--glass)', padding: 15, borderRadius: 12, cursor: 'pointer' }} onClick={openSmartVideoLink}>
                <div style={{ width: '100%', height: 120, background: 'var(--bg-primary)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                  <Play size={40} fill="var(--text-primary)" />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: 4 }}>{videoRec.videoTitle}</div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: 8 }}>by {videoRec.channelName}</div>
                  <div style={{ fontSize: '0.8rem', color: '#f472b6' }}>AI Reason: {videoRec.reason}</div>
                  <div style={{ fontSize: '0.7rem', color: '#10b981', marginTop: 5 }}>Click to Watch Best Match →</div>
                </div>
              </div>
            )}
            <button onClick={() => { setShowVideoModal(false); setVideoRec(null); setVideoModuleId("") }} style={{ ...secondaryBtnStyle, width: '100%', marginTop: 15 }}>Close</button>
          </div>
        </div>
      )}

      {/* 2. Quiz Modal */}
      {(quizLoading || quizData) && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'var(--bg-secondary)', zIndex: 3000, borderRadius: '16px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '25px', height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
            {quizLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 20 }}>
                <Brain size={64} className="spin-anim" color="var(--accent-primary)" />
                <h2 style={{ color: 'var(--text-primary)' }}>Generating Exam...</h2>
              </div>
            ) : quizData.showResult ? (
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <div style={{ fontSize: '5rem', marginBottom: 20 }}>{quizData.score >= 4 ? '🏆' : '📚'}</div>
                <h1>Score: {quizData.score} / {quizData.questions.length}</h1>
                <p style={{ color: 'var(--text-secondary)' }}>{quizData.score >= 4 ? "Mastery Achieved!" : "Keep Studying!"}</p>
                <button onClick={closeQuiz} style={{ ...primaryBtnStyle, width: '200px', marginTop: 30 }}>Done</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexShrink: 0 }}>
                  <span style={{ opacity: 0.6, fontSize: '1.1rem' }}>Question {quizData.current + 1} of {quizData.questions.length}</span>
                  <button onClick={closeQuiz} aria-label="Close quiz" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}><X size={28} /></button>
                </div>
                <h2 style={{ marginBottom: 30, flexShrink: 0, lineHeight: 1.4 }}>{quizData.questions[quizData.current].q}</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 15, flexShrink: 0 }}>
                  {quizData.questions[quizData.current].options.map((opt, i) => {
                    let bg = 'var(--glass)';
                    let border = '1px solid var(--glass)';
                    if (selectedOption !== null) {
                      if (i === quizData.questions[quizData.current].answer) { bg = 'rgba(16, 185, 129, 0.2)'; border = '1px solid #10b981'; }
                      else if (i === selectedOption) { bg = 'rgba(239, 68, 68, 0.2)'; border = '1px solid #ef4444'; }
                    }
                    return (
                      <button key={i} onClick={() => handleQuizAnswer(i)} disabled={selectedOption !== null} style={{ ...btnStyle, background: bg, border: border, justifyContent: 'flex-start', padding: 20, textAlign: 'left', fontSize: '1rem' }}>
                        <span style={{ marginRight: 15, fontWeight: 'bold', color: 'var(--text-secondary)' }}>{String.fromCharCode(65 + i)}</span> {opt}
                      </button>
                    );
                  })}
                </div>
                {selectedOption !== null && (
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', marginTop: 20 }}>
                    <div style={{ flex: 1, overflowY: 'auto', padding: 20, background: 'var(--bg-secondary)', borderRadius: 12, marginBottom: 15, borderLeft: '4px solid var(--accent-primary)' }}>
                      <strong style={{ color: 'var(--accent-primary)', display: 'block', marginBottom: 8, fontSize: '1.1rem' }}>Why?</strong>
                      <p style={{ fontSize: '1rem', lineHeight: '1.6', margin: 0, opacity: 0.9 }}>{quizData.questions[quizData.current].explanation}</p>
                    </div>
                    <button onClick={handleNextQuestion} style={{ ...primaryBtnStyle, padding: '15px', fontSize: '1.1rem' }}>
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
      {showGoalModal && <div style={modalOverlayStyle}><div style={modalContentStyle(isMobile)}><h3 style={{ marginBottom: 20 }}>New Study Plan</h3><input placeholder="Goal Name (e.g. CAT2)" value={goalTitle} onChange={e => setGoalTitle(e.target.value)} style={inputStyle} /><input type="date" value={goalDate} onChange={e => setGoalDate(e.target.value)} style={inputStyle} /><select value={goalCourseId} onChange={e => setGoalCourseId(e.target.value)} style={{ ...inputStyle, background: 'var(--bg-primary)', border: '1px solid var(--glass)' }}><option value="">Select Course</option>{courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select><button onClick={handleCreateGoal} style={{ ...primaryBtnStyle, marginTop: 20 }} disabled={isProcessing}>{isProcessing ? <Loader className="spin-anim" /> : "Generate Plan"}</button><button onClick={() => setShowGoalModal(false)} style={{ ...secondaryBtnStyle, width: '100%', marginTop: 10 }}>Cancel</button></div></div>}

      {/* 4. Add Course Modal */}
      {showAddModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle(isMobile)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}><h3>Add Course</h3><X onClick={resetForm} style={{ cursor: 'pointer' }} /></div>
            <input placeholder="Code" value={newCode} onChange={e => setNewCode(e.target.value)} style={inputStyle} />
            <input placeholder="Name" value={newName} onChange={e => setNewName(e.target.value)} style={inputStyle} />
            <div style={{ display: 'flex', gap: 10, margin: '15px 0', flexWrap: 'wrap' }}>
              <span onClick={() => setSyllabusMode('pdf')} style={{ color: syllabusMode === 'pdf' ? '#f472b6' : 'grey', cursor: 'pointer' }}>PDF Upload</span>
              <span onClick={() => setSyllabusMode('text')} style={{ color: syllabusMode === 'text' ? '#f472b6' : 'grey', cursor: 'pointer' }}>Paste Text</span>
            </div>
            {syllabusMode === 'pdf' ? (
              <div style={dropZoneStyle}>
                <input type="file" id="syl" accept=".pdf" onChange={e => { const f = e.target.files[0]; e.target.value = ""; if (f) handleCreateCourse(f); }} style={{ display: 'none' }} />
                <label htmlFor="syl" style={{ cursor: 'pointer', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  {isProcessing ? <div style={{ display: 'flex', gap: '10px' }}><Loader className="spin-anim" /> {statusMsg}</div> : "Upload PDF"}
                </label>
              </div>
            ) : (
              <>
                <textarea placeholder="Paste full syllabus text or list module names block..." value={rawSyllabusText} onChange={e => setRawSyllabusText(e.target.value)} style={{ ...inputStyle, height: 100, resize: 'none' }} />
                <button onClick={() => handleCreateCourse()} disabled={isProcessing} style={{ ...primaryBtnStyle, width: '100%', marginTop: 15 }}>{isProcessing ? <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}><Loader className="spin-anim" /> {statusMsg}</div> : 'Create course'}</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* 5. Syllabus Modal */}
      {showSyllabusModal && activeCourse && (
        <div style={{ ...modalOverlayStyle, zIndex: 5000 }}>
          <div style={{ ...modalContentStyle(isMobile), padding: 0, display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 140px)', marginTop: '60px', maxWidth: '750px', overflow: 'hidden' }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 28px', borderBottom: '1px solid var(--glass)' }}>
              <h3 style={{ margin: 0 }}>Syllabus</h3>
              <X onClick={() => setShowSyllabusModal(false)} style={{ cursor: 'pointer' }} />
            </div>

            {/* Scrollable Body */}
            <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {activeCourse.modules.map((m, i) => (
                <div key={i} style={{ border: '1px solid var(--glass)', borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}>
                  <div onClick={() => toggleSyllabusAccordion(i)} style={{ padding: '18px 24px', background: 'var(--glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', gap: 16 }}>
                    <span style={{ flex: 1, lineHeight: 1.5, fontSize: '1.05rem', fontWeight: 500 }}>{m.title}</span>
                    {expandedSyllabusIndex === i ? <ChevronUp size={18} style={{ flexShrink: 0 }} /> : <ChevronDown size={18} style={{ flexShrink: 0 }} />}
                  </div>
                  {expandedSyllabusIndex === i && (
                    <div style={{ padding: '20px 24px', background: 'var(--overlay-bg)' }}>
                      <ol style={{ margin: 0, paddingLeft: 24, paddingRight: 12, lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {m.topics.map((t, j) => <li key={j} style={{ color: 'var(--text-secondary)' }}>{t}</li>)}
                      </ol>
                    </div>
                  )}
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* 6. Module Notes Modal (Large Size) */}
      {showNotesModal && activeCourse && activeModuleForNotes && (
        <div style={{ ...modalOverlayStyle, zIndex: 5000 }}>
          <div style={{ ...modalContentStyle(isMobile), padding: 0, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 140px)', marginTop: '60px', width: isMobile ? '95%' : '80%', maxWidth: '1000px', overflow: 'hidden' }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 28px', borderBottom: '1px solid var(--glass)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <FileText size={20} color="#f472b6" />
                <h3 style={{ margin: 0 }}>{activeModuleForNotes} Notes</h3>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <button onClick={() => showToast("Notes Saved")} style={{ ...btnStyle, background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', fontSize: '0.8rem', padding: '6px 12px' }}><Save size={14} style={{ marginRight: 5 }} /> Auto-Saved</button>
                <X onClick={() => setShowNotesModal(false)} style={{ cursor: 'pointer', marginLeft: 8 }} />
              </div>
            </div>

            {/* Scrollable Text Area */}
            <div style={{ flex: 1, padding: '24px 28px', display: 'flex', flexDirection: 'column' }}>
              <textarea
                className="custom-scrollbar"
                value={(activeCourse.moduleNotes && activeCourse.moduleNotes[activeModuleForNotes]) || ""}
                onChange={(e) => handleSaveModuleNotes(e.target.value)}
                placeholder={`Type notes for ${activeModuleForNotes}...`}
                style={{
                  flex: 1,
                  background: 'var(--overlay-bg)',
                  border: '1px solid var(--glass)',
                  color: 'var(--text-primary)',
                  resize: 'none',
                  padding: '24px',
                  borderRadius: '12px',
                  fontSize: '1.05rem',
                  lineHeight: '1.6',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              />
            </div>

          </div>
        </div>
      )}

      {confirmConfig && <div style={modalOverlayStyle}><div style={modalContentStyle(isMobile)}><h3>{confirmConfig.title}</h3><div style={{ display: 'flex', gap: 10, marginTop: 20 }}><button onClick={() => setConfirmConfig(null)} style={secondaryBtnStyle}>Cancel</button><button onClick={confirmConfig.onConfirm} style={{ ...primaryBtnStyle, background: '#ef4444' }}>Confirm</button></div></div></div>}

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
      {view === 'course-detail' && activeCourse ? (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexShrink: 0, background: 'var(--bg-secondary)', border: '1px solid var(--glass)', padding: '12px 20px', borderRadius: 12, boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button type="button" onClick={() => setView('dashboard')} aria-label="Back to courses" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'inherit', display: 'flex' }}><ArrowLeft size={20} /></button>
            <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--accent-primary)' }}>{activeCourse?.code}</h2>
          </div>
          <div style={{ display: 'flex', gap: 15 }}>
            <button onClick={() => sortFileInputRef.current.click()} aria-label="Upload files" style={btnStyleCompact}><UploadCloud size={16} /></button>
            <button onClick={() => setShowVideoModal(true)} style={btnStyleCompact}>
              <Youtube size={16} /> Video
            </button>
            <button onClick={() => setShowSyllabusModal(true)} style={btnStyleCompact}><TableIcon size={16} /> Syllabus</button>
            <button onClick={() => handleDeleteCourse(activeCourseId)} aria-label="Delete course" style={{ ...btnStyleCompact, background: 'rgba(255,0,0,0.2)', color: 'var(--accent-primary)' }}><Trash2 size={16} /></button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: isMobile ? '1.2rem' : '1.5rem' }}>{view === 'goals' ? 'Timeline' : 'Study Vault'}</h2>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setView(view === 'goals' ? 'dashboard' : 'goals')} aria-label="Goals" aria-pressed={view === 'goals'} style={{ ...btnStyle, background: view === 'goals' ? 'var(--accent-primary)' : 'var(--glass)' }}><Calendar size={16} /><span style={{ display: isMobile ? 'none' : 'block', marginLeft: 5 }}>Goals</span></button>
            {view === 'dashboard' && <button onClick={() => setShowAddModal(true)} aria-label="Add course" style={btnStyle}><Plus size={16} /></button>}
          </div>
        </div>
      )}

      {/* --- MAIN CONTENT --- */}
      <div style={{ flex: 1, overflowY: 'auto' }}>

        {/* FOCUS SESSION (Restored for AI control) */}


        {view === 'goals' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {goals.length === 0 ? <div style={{ textAlign: 'center', marginTop: 50, opacity: 0.5 }}>No study plans yet. <br /><button onClick={() => setShowGoalModal(true)} style={{ ...primaryBtnStyle, width: 'auto', marginTop: 20 }}>Create One</button></div> :
              goals.map(g => (
                <div key={g.id} className="interactive-card" style={goalCardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15 }}>
                    <div><h3 style={{ margin: 0 }}>{g.title}</h3><span style={{ fontSize: '0.8rem', opacity: 0.6 }}>{g.courseName} • Due {g.targetDate}</span></div>
                    <Trash2 size={16} style={{ cursor: 'pointer', opacity: 0.5 }} onClick={() => deleteGoal(g.id)} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {g.plan.map((task, ti) => (
                      <div key={ti} onClick={() => toggleGoalTask(g.id, ti)} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', opacity: task.done ? 0.4 : 1 }}>
                        {task.done ? <CheckCircle size={18} color="#10b981" /> : <CheckSquare size={18} color="var(--text-secondary)" />}
                        <span style={{ textDecoration: task.done ? 'line-through' : 'none' }}>{task.date}: {task.task}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}

        {view === 'dashboard' && (
          <>
            {!showAddModal && <div onClick={() => sortFileInputRef.current.click()} style={{ ...globalDropStyle, borderColor: dragActive ? 'var(--accent-primary)' : 'var(--glass)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 30 }} onDragOver={e => { e.preventDefault(); setDragActive(true) }} onDragLeave={() => setDragActive(false)} onDrop={e => { e.preventDefault(); setDragActive(false); handleSmartDrop(e.dataTransfer.files) }}>{isProcessing ? <div style={{ display: 'flex', gap: 10 }}><Loader className="spin-anim" />{statusMsg}</div> : <><UploadCloud size={32} style={{ marginBottom: 10, opacity: 0.5 }} /><div>{isMobile ? "Tap to Upload" : "Drop Files"}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Auto-sorted by AI</div></>}</div>}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(250px, 1fr))', gap: 15 }}>
              {courses.map(c => <div key={c.id} className="interactive-card" onClick={() => { setActiveCourseId(c.id); setView('course-detail') }} style={courseCardStyle}><span style={codeBadgeStyle}>{c.code}</span><h3 style={{ margin: '10px 0' }}>{c.name}</h3><div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{c.modules.length} Modules • {Object.values(c.files).flat().length} Files</div></div>)}
            </div>
          </>
        )}

        {view === 'course-detail' && activeCourse && (
          <>
            {/* MODULE LIST */}
            {activeCourse.modules.map((mod, i) => (
              <div key={i} style={{ marginBottom: 10, border: '1px solid var(--glass)', borderRadius: 8 }}>
                <div style={{ padding: 15, background: 'var(--glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div 
                    onClick={() => toggleModuleCompletion(activeCourseId, i)} 
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}
                  >
                    {mod.completed ? <CheckCircle size={18} color="#10b981" /> : <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid var(--text-secondary)' }} />}
                    <strong style={{ opacity: mod.completed ? 0.5 : 1, textDecoration: mod.completed ? 'line-through' : 'none' }}>{mod.title}</strong>
                  </div>
                  <div onClick={() => { setExpandedFileModuleIndex(i === expandedFileModuleIndex ? null : i) }} style={{ cursor: 'pointer', padding: '0 10px', opacity: 0.5 }}>
                    {expandedFileModuleIndex === i ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                  <div style={{ display: 'flex', gap: 5 }}>
                    <button onClick={() => openModuleNotes(mod.title)} style={{ ...btnStyle, padding: '4px 8px', fontSize: '0.7rem', color: 'var(--text-primary)' }}><FileText size={14} /> Notes</button>
                    <button onClick={() => handleGenerateQuiz(mod)} style={{ ...btnStyle, padding: '4px 8px', fontSize: '0.7rem', color: 'var(--accent-primary)' }}><Brain size={14} /> Quiz</button>
                  </div>
                </div>
                {expandedFileModuleIndex === i && <div style={{ padding: 15 }}>{activeCourse.files[mod.title]?.length === 0 ? <span style={{ opacity: 0.3, fontSize: '0.8rem' }}>No files</span> : activeCourse.files[mod.title]?.map(f => <div key={f.id} style={{ padding: '10px', display: 'flex', justifyContent: 'space-between', gap: 10, borderBottom: '1px solid var(--glass)' }}><button type="button" onClick={() => handleOpenFile(f)} style={fileLinkStyle}>{f.title}{!f.blob && <span style={{ opacity: 0.5, fontSize: '0.75rem' }}> (re-upload needed)</span>}</button><button type="button" aria-label={`Delete file ${f.title}`} onClick={() => handleDeleteFile(activeCourseId, mod.title, f.id)} style={iconButtonStyle}><Trash2 size={14} /></button></div>)}</div>}
              </div>
            ))}
            <div style={{ height: 150 }}></div>
          </>
        )}
      </div>
    </div>
  );
}

// --- STYLES ---
const fileLinkStyle = {
  background: 'none',
  border: 'none',
  padding: 0,
  color: 'var(--text-primary)',
  textDecoration: 'underline',
  cursor: 'pointer',
  textAlign: 'left',
  font: 'inherit',
  overflowWrap: 'anywhere'
};

const iconButtonStyle = {
  background: 'none',
  border: 'none',
  padding: 2,
  color: 'var(--text-primary)',
  cursor: 'pointer',
  opacity: 0.5,
  flexShrink: 0
};

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
  color: 'var(--bg-primary)',
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
  background: 'var(--btn-primary-bg)',
  border: 'none',
  borderRadius: '12px',
  padding: '12px 20px',
  color: 'var(--btn-primary-text)',
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
  border: '1px solid var(--glass)',
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
  border: '1px solid var(--glass)',
  padding: '14px',
  borderRadius: '12px',
  color: 'var(--text-primary)',
  outline: 'none',
  boxSizing: 'border-box',
  width: '100%',
  marginBottom: 12,
  fontSize: '0.95rem'
};

const dropZoneStyle = {
  border: '2px dashed var(--glass)',
  borderRadius: '16px',
  padding: '24px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  cursor: 'pointer',
  background: 'var(--bg-secondary)'
};

const globalDropStyle = {
  border: '2px dashed var(--glass)',
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
  border: '1px solid var(--glass)',
  boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
  transition: 'all 0.25s ease'
};

const goalCardStyle = {
  background: 'var(--bg-secondary)',
  borderRadius: '16px',
  padding: '22px',
  border: '1px solid var(--glass)',
  boxShadow: '0 10px 25px rgba(0,0,0,0.25)'
};

const codeBadgeStyle = {
  background: 'var(--accent-primary)',
  color: 'var(--bg-primary)',
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
  border: '1px solid var(--glass)',
  color: 'var(--text-primary)',
  boxShadow: '0 30px 60px rgba(0,0,0,0.5)'
});
