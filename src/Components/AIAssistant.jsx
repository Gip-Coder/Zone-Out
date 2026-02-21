import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, X, MessageSquare, BookOpen, Brain, ListCheck, Sparkles, Trash2, Copy, RefreshCw } from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";

export default function AIAssistant({ goals = [], activeAIAction, setActiveAIAction }) {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const INITIAL_MESSAGE = { role: 'assistant', content: 'Hi! I am your ZoneOut Study Buddy. Need a quick explanation or a study tip?' };
    const [messages, setMessages] = useState([INITIAL_MESSAGE]);
    const [loading, setLoading] = useState(false);
    const [resetKey, setResetKey] = useState(0); 
    const messagesEndRef = useRef(null);

    // Initialize Gemini API
    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        systemInstruction: `You are a study expert. ${
            goals.length > 0 ? `Student goals: ${goals.map(g => g.text).join(", ")}.` : ""
        } Use bullet points and line breaks for clarity. Keep responses helpful and under 4 sentences.`
    });

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);

    useEffect(() => {
        if (activeAIAction) {
            setIsOpen(true);
            setMessages(prev => [
                ...prev, 
                { 
                    role: 'assistant', 
                    content: `✨ Magic Mode: "${activeAIAction}"\nHow should we tackle this?`,
                    isMenu: true,
                    goalContext: activeAIAction
                }
            ]);
        }
    }, [activeAIAction]);

    const clearHistory = () => {
        if (window.confirm("Clear our conversation?")) {
            setMessages([INITIAL_MESSAGE]);
            setActiveAIAction(null);
        }
    };

    const handleResetSize = () => {
        setResetKey(prev => prev + 1);
    };

    const handleSend = async (customInput = null) => {
        const textToSend = customInput || input;
        if (!textToSend.trim() || loading) return;

        const userMessage = { role: 'user', content: textToSend };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);
        setActiveAIAction(null);

        try {
            // FIX: .slice(1) ensures the first 'model' greeting is removed from history
            const chatSession = model.startChat({
                history: messages
                    .slice(1) 
                    .filter(m => !m.isMenu)
                    .map(m => ({
                        role: m.role === "assistant" ? "model" : "user",
                        parts: [{ text: m.content }],
                    })),
            });

            const result = await chatSession.sendMessage(textToSend);
            const aiResponse = result.response.text();
            
            setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
        } catch (error) {
            console.error("Gemini Error:", error);
            setMessages(prev => [...prev, { role: 'assistant', content: "Connection error! Check your API key or internet." }]);
        } finally {
            setLoading(false);
        }
    };

    const handleMenuChoice = (choice, savedGoal) => {
        const fullPrompt = `${choice} for my goal: "${savedGoal}"`;
        handleSend(fullPrompt);
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert("Copied to clipboard!");
    };

    return (
        <div style={{ position: 'fixed', bottom: '80px', right: '20px', zIndex: 1000 }}>
            {isOpen ? (
                <div key={resetKey} style={{
                    resize: 'both',
                    overflow: 'hidden',
                    direction: 'rtl',      
                    transform: 'rotate(180deg)',
                    width: '350px',
                    height: '500px',
                    minWidth: '300px',
                    minHeight: '400px',
                    maxWidth: '85vw',
                    maxHeight: '80vh',
                    borderRadius: '16px'
                }}>
                    <div className="glass-panel" style={{ 
                        transform: 'rotate(180deg)', 
                        direction: 'ltr',
                        width: '100%',
                        height: '100%',
                        display: 'flex', 
                        flexDirection: 'column', 
                        padding: '15px', 
                        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                        boxSizing: 'border-box'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', flexShrink: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Bot size={22} style={{ color: '#f472b6' }} />
                                <span style={{ fontWeight: 'bold', color: 'white' }}>Study Buddy</span>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <RefreshCw size={16} onClick={handleResetSize} style={{ cursor: 'pointer', color: 'rgba(255,255,255,0.4)' }} title="Reset Size" />
                                <Trash2 size={16} onClick={clearHistory} style={{ cursor: 'pointer', color: 'rgba(255,255,255,0.4)' }} title="Clear Chat" />
                                <X size={20} onClick={() => setIsOpen(false)} style={{ cursor: 'pointer', color: 'rgba(255,255,255,0.6)' }} />
                            </div>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', marginBottom: '10px', fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '15px', paddingRight: '5px' }}>
                            {messages.map((msg, i) => (
                                <div key={i} style={{ position: 'relative', alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                                    <div style={{ 
                                        background: msg.role === 'user' ? 'rgba(244,114,182,0.25)' : 'rgba(255,255,255,0.08)',
                                        padding: '12px', 
                                        borderRadius: '12px', 
                                        color: 'white',
                                        border: msg.role === 'user' ? '1px solid rgba(244,114,182,0.3)' : '1px solid rgba(255,255,255,0.1)',
                                        whiteSpace: 'pre-wrap',
                                        lineHeight: '1.5'
                                    }}>
                                        {msg.content}
                                    </div>

                                    {msg.role === 'assistant' && !msg.isMenu && (
                                        <button onClick={() => copyToClipboard(msg.content)} style={copyBtnStyle} title="Copy to clipboard">
                                            <Copy size={12} color="white" />
                                        </button>
                                    )}

                                    {msg.isMenu && (
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '10px' }}>
                                            <button onClick={() => handleMenuChoice('Generate 3 MCQs', msg.goalContext)} style={menuBtnStyle}><Brain size={14}/> MCQs</button>
                                            <button onClick={() => handleMenuChoice('Summarize', msg.goalContext)} style={menuBtnStyle}><BookOpen size={14}/> Summarize</button>
                                            <button onClick={() => handleMenuChoice('Give me a Study Plan', msg.goalContext)} style={menuBtnStyle}><ListCheck size={14}/> Plan</button>
                                            <button onClick={() => handleMenuChoice('Explain simply', msg.goalContext)} style={menuBtnStyle}><Sparkles size={14}/> Simplify</button>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {loading && (
                                <div style={{ fontSize: '12px', color: '#f472b6', marginLeft: '5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div className="pulse-dot"></div>
                                    Buddy is thinking...
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} style={{ display: 'flex', gap: '8px', marginTop: 'auto', flexShrink: 0 }}>
                            <input disabled={loading} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message..." style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: '8px', padding: '8px 12px', outline: 'none' }} />
                            <button disabled={loading} type="submit" style={{ background: '#f472b6', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', opacity: loading ? 0.5 : 1 }}><Send size={18} color="white" /></button>
                        </form>
                    </div>
                </div>
            ) : (
                <button onClick={() => setIsOpen(true)} style={{ background: '#f472b6', border: 'none', borderRadius: '50%', width: '56px', height: '56px', cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MessageSquare color="white" size={26} /></button>
            )}

            <style>{`
                .pulse-dot { width: 6px; height: 6px; background-color: #f472b6; border-radius: 50%; animation: pulse 1.5s infinite; }
                @keyframes pulse { 0% { opacity: 0.4; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.1); } 100% { opacity: 0.4; transform: scale(0.8); } }
                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); }
                ::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 10px; }
            `}</style>
        </div>
    );
}

const menuBtnStyle = { background: 'rgba(244,114,182,0.15)', color: '#f472b6', border: '1px solid rgba(244,114,182,0.3)', borderRadius: '8px', padding: '8px', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' };
const copyBtnStyle = { position: 'absolute', bottom: '-5px', right: '-10px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', padding: '5px', cursor: 'pointer', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' };