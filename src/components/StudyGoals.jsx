import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, CheckCircle, Circle } from 'lucide-react';
import { api } from '../services/apiClient';
import { useProgressContext } from '../context/ProgressContext';

const STORAGE_KEY = "zoneout_goals";

function loadLocalGoals() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function saveLocalGoals(goals) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(goals)); } catch {
    // Storage full or unavailable (private mode) — the in-memory list still works
  }
}

/**
 * Goals list. When `goals`/`setGoals` are passed (Timeline page), state is
 * shared with App so goals the AI assistant adds appear here immediately.
 */
export default function StudyGoals({ goals: goalsProp, setGoals: setGoalsProp }) {
  const [localGoals, setLocalGoals] = useState([]);
  const goals = goalsProp ?? localGoals;
  const setGoals = setGoalsProp ?? setLocalGoals;
  const [newGoal, setNewGoal] = useState("");
  const [useLocal, setUseLocal] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const busyIdsRef = useRef(new Set());
  const { pushProgressEvent } = useProgressContext();

  // Persist goals to localStorage whenever they change
  useEffect(() => {
    if (goals.length > 0 || useLocal) {
      saveLocalGoals(goals);
    }
  }, [goals, useLocal]);

  // ===============================
  // LOAD GOALS — API first, localStorage fallback
  // ===============================
  useEffect(() => {
    let cancelled = false;
    const fetchGoals = async () => {
      try {
        const data = await api.get("/goals");
        if (cancelled) return;
        if (Array.isArray(data)) {
          setGoals(data);
          saveLocalGoals(data);
        } else {
          setGoals([]);
        }
      } catch (err) {
        if (cancelled) return;
        console.warn("API unavailable, using local goals:", err.message);
        setUseLocal(true);
        setGoals(loadLocalGoals());
      }
    };

    fetchGoals();
    return () => { cancelled = true; };
    // Load once on mount; the parent's setGoals is a stable state setter
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Runs one mutation per goal at a time so double-clicks can't race. */
  const withGoalLock = async (id, fn) => {
    if (busyIdsRef.current.has(id)) return;
    busyIdsRef.current.add(id);
    try { await fn(); } finally { busyIdsRef.current.delete(id); }
  };

  // ===============================
  // ADD GOAL
  // ===============================
  const addGoal = async () => {
    const text = newGoal.trim();
    // Guard against duplicate submissions from double clicks / repeated Enter
    if (!text || isAdding) return;
    setIsAdding(true);

    const localGoal = {
      _id: `local_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      text,
      targetDate: "",
      plan: [],
      completed: false,
      createdAt: new Date().toISOString(),
    };

    try {
      if (!useLocal) {
        try {
          const data = await api.post("/goals", {
            text,
            targetDate: "",
            plan: []
          });

          setGoals(prev => [data, ...prev]);
          setNewGoal("");

          // Update progress bar
          if (pushProgressEvent) {
            pushProgressEvent({
              eventType: "goal_updated",
              value: { goalId: data._id }
            });
          }
          return;
        } catch (error) {
          console.warn("API add failed, saving locally:", error.message);
          setUseLocal(true);
        }
      }

      // Fallback: add to local state
      setGoals(prev => [localGoal, ...prev]);
      setNewGoal("");
    } finally {
      setIsAdding(false);
    }
  };

  // ===============================
  // TOGGLE MAIN GOAL
  // ===============================
  const toggleMainGoal = (goal) => withGoalLock(goal._id, async () => {
    const toggled = { ...goal, completed: !goal.completed };

    if (!useLocal) {
      try {
        const updated = await api.put(`/goals/${goal._id}`, {
          completed: !goal.completed
        });

        setGoals(prev =>
          prev.map(g => g._id === goal._id ? (updated || toggled) : g)
        );

        // Log event for any toggle (recalculates percentage)
        if (pushProgressEvent) {
          pushProgressEvent({
            eventType: "goal_completed",
            value: { goalId: goal._id, completed: updated?.completed }
          });
        }

        return;
      } catch (error) {
        console.warn("API toggle failed, updating locally:", error.message);
        setUseLocal(true);
      }
    }

    // Fallback
    setGoals(prev =>
      prev.map(g => g._id === goal._id ? toggled : g)
    );
  });

  // ===============================
  // DELETE GOAL
  // ===============================
  const deleteGoal = (id) => withGoalLock(id, async () => {
    if (!useLocal) {
      try {
        await api.delete(`/goals/${id}`);

        setGoals(prev =>
          prev.filter(goal => goal._id !== id)
        );

        // Update progress bar
        if (pushProgressEvent) {
          pushProgressEvent({
            eventType: "goal_updated",
            value: { goalId: id, deleted: true }
          });
        }
        return;
      } catch (error) {
        console.warn("API delete failed, removing locally:", error.message);
        setUseLocal(true);
      }
    }

    // Fallback
    setGoals(prev =>
      prev.filter(goal => goal._id !== id)
    );
  });

  // ===============================
  // HELPER
  // ===============================
  const getTimeLeft = (dateString) => {
    if (!dateString) return null;
    // Deadlines are calendar dates: count down to the END of that local day,
    // not to midnight UTC at its start.
    const deadline = /^\d{4}-\d{2}-\d{2}$/.test(dateString)
      ? new Date(`${dateString}T23:59:59`)
      : new Date(dateString);
    const diff = deadline - new Date();
    if (Number.isNaN(diff)) return null;
    if (diff < 0) return "Overdue";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    if (days > 0) return `${days}d left`;
    return `${hours}h left`;
  };

  const styles = {

    wrapper: {
      padding: '10px 0',
      maxWidth: '900px',
      margin: '0 auto'
    },

    heading: {
      fontSize: '1.8rem',
      fontWeight: '700',
      marginBottom: '28px',
      letterSpacing: '-0.5px'
    },

    inputRow: {
      display: 'flex',
      gap: '12px',
      marginBottom: '32px'
    },

    input: {
      flex: 1,
      minWidth: 0,
      padding: '14px',
      borderRadius: '12px',
      border: '1px solid var(--glass)',
      background: 'var(--bg-secondary)',
      color: 'var(--text-primary)',
      fontSize: '0.95rem'
    },

    addBtn: {
      background: 'var(--btn-primary-bg)',
      color: 'var(--btn-primary-text)',
      border: 'none',
      borderRadius: '12px',
      width: '48px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      boxShadow: '0 6px 20px rgba(124,58,237,0.4)'
    },

    goalCard: {
      background: 'var(--bg-secondary)',
      padding: '22px',
      borderRadius: 'var(--radius-lg)',
      marginBottom: '20px',
      border: '1px solid var(--glass)',
      transition: '0.25s ease',
      boxShadow: '0 10px 30px rgba(0,0,0,0.25)'
    },

    goalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '12px'
    },

    goalLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      minWidth: 0
    },

    checkbox: {
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      background: 'none',
      border: 'none',
      padding: 0,
      flexShrink: 0
    },

    iconBtn: {
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      background: 'none',
      border: 'none',
      padding: 4,
      flexShrink: 0
    },

    goalText: {
      fontSize: '1rem',
      fontWeight: '500',
      overflowWrap: 'anywhere'
    },

    deadline: {
      marginTop: '10px',
      fontSize: '0.85rem',
      color: 'var(--text-secondary)'
    },

    emptyState: {
      textAlign: 'center',
      color: 'var(--text-secondary)',
      padding: '50px',
      fontSize: '0.95rem'
    }
  };

  // ===============================
  // UI
  // ===============================
  return (
    <div style={styles.wrapper}>
      <h2 style={styles.heading}>Study Timeline</h2>

      {/* Input */}
      <div style={styles.inputRow}>
        <input
          type="text"
          aria-label="New goal"
          maxLength={500}
          value={newGoal}
          onChange={(e) => setNewGoal(e.target.value)}
          placeholder="Add a new goal..."
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.repeat) addGoal(); }}
          style={styles.input}
        />
        <button
          type="button"
          onClick={addGoal}
          disabled={isAdding}
          aria-label="Add goal"
          style={{ ...styles.addBtn, opacity: isAdding ? 0.6 : 1 }}
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Goals */}
      {goals.map(goal => (
        <div
          key={goal._id}
          style={{
            ...styles.goalCard,
            opacity: goal.completed ? 0.6 : 1
          }}
        >
          <div style={styles.goalHeader}>
            <div style={styles.goalLeft}>
              <button
                type="button"
                role="checkbox"
                aria-checked={!!goal.completed}
                aria-label={`Mark "${goal.text}" as ${goal.completed ? 'not done' : 'done'}`}
                onClick={() => toggleMainGoal(goal)}
                style={styles.checkbox}
              >
                {goal.completed
                  ? <CheckCircle size={22} color="var(--accent-primary)" />
                  : <Circle size={22} color="var(--text-secondary)" />
                }
              </button>

              <span
                style={{
                  ...styles.goalText,
                  textDecoration: goal.completed ? 'line-through' : 'none'
                }}
              >
                {goal.text}
              </span>
            </div>

            <button
              type="button"
              aria-label={`Delete goal "${goal.text}"`}
              onClick={() => deleteGoal(goal._id)}
              style={styles.iconBtn}
            >
              <Trash2 size={18} color="var(--text-secondary)" style={{ transition: "0.2s ease" }} />
            </button>
          </div>

          {goal.targetDate && (
            <div style={styles.deadline}>
              {getTimeLeft(goal.targetDate)}
            </div>
          )}
        </div>
      ))}

      {goals.length === 0 && (
        <div style={styles.emptyState}>
          No goals yet.
        </div>
      )}
    </div>
  );

}
