import React, { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle, Sparkles } from 'lucide-react';

export default function Todo({ goals, setGoals, onMagicClick }) {
    const [input, setInput] = useState('');

    useEffect(() => {
        localStorage.setItem('zone-tasks', JSON.stringify(goals));
    }, [goals]);

    const addTask = (e) => {
        if (e) e.preventDefault();
        if (!input.trim()) return;
        setGoals([...goals, { id: Date.now(), text: input, completed: false }]);
        setInput('');
    };

    const toggleTask = (id) => {
        setGoals(goals.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const deleteTask = (id) => {
        setGoals(goals.filter(t => t.id !== id));
    };

    return (
        <div className="glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '20px' }}>
            <h2 style={{ color: '#f472b6', marginBottom: '15px' }}>Study Goals</h2>
            
            <form onSubmit={addTask} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <input 
                    value={input} onChange={(e) => setInput(e.target.value)}
                    placeholder="Add a new goal..." 
                    style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', color: 'white', outline: 'none' }}
                />
                <button type="submit" style={{ background: '#f472b6', color: 'white', padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
                    <Plus size={20} />
                </button>
            </form>

            <div style={{ flex: 1, overflowY: 'auto' }}>
                {goals.map(task => (
                    <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '10px', marginBottom: '10px' }}>
                        <CheckCircle 
                            size={20} 
                            onClick={() => toggleTask(task.id)} 
                            style={{ cursor: 'pointer', color: task.completed ? '#4ade80' : 'rgba(255,255,255,0.2)' }} 
                        />
                        <span style={{ flex: 1, textDecoration: task.completed ? 'line-through' : 'none', opacity: task.completed ? 0.5 : 1, fontSize: '14px', color: 'white' }}>
                            {task.text}
                        </span>
                        
                        {!task.completed && (
                            <button 
                                onClick={() => onMagicClick(task.text)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f472b6' }}
                            >
                                <Sparkles size={18} />
                            </button>
                        )}

                        <Trash2 size={16} onClick={() => deleteTask(task.id)} style={{ cursor: 'pointer', color: 'rgba(255,255,255,0.3)' }} />
                    </div>
                ))}
            </div>
        </div>
    );
}