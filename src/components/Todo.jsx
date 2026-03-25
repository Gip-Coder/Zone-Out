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
            <h2 style={{ color: 'var(--accent-primary)', marginBottom: '15px' }}>Study Goals</h2>

            <form onSubmit={addTask} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <input
                    value={input} onChange={(e) => setInput(e.target.value)}
                    placeholder="Add a new goal..."
                    style={{ flex: 1, background: 'var(--bg-secondary)', border: '1px solid var(--glass)', padding: '12px', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none' }}
                />
                <button type="submit" style={{ background: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)', padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
                    <Plus size={20} />
                </button>
            </form>

            <div style={{ flex: 1, overflowY: 'auto' }}>
                {goals.map(task => (
                    <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--glass)', padding: '12px', borderRadius: '10px', marginBottom: '10px' }}>
                        <CheckCircle
                            size={20}
                            onClick={() => toggleTask(task.id)}
                            style={{ cursor: 'pointer', color: task.completed ? '#4ade80' : 'var(--text-secondary)' }}
                        />
                        <span style={{ flex: 1, textDecoration: task.completed ? 'line-through' : 'none', opacity: task.completed ? 0.5 : 1, fontSize: '14px', color: 'var(--text-primary)' }}>
                            {task.text}
                        </span>

                        {!task.completed && (
                            <button
                                onClick={() => onMagicClick(task.text)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-primary)' }}
                            >
                                <Sparkles size={18} />
                            </button>
                        )}

                        <Trash2 size={16} onClick={() => deleteTask(task.id)} style={{ cursor: 'pointer', color: 'var(--text-secondary)' }} />
                    </div>
                ))}
            </div>
        </div>
    );
}