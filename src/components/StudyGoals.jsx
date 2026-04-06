import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, CheckCircle, Circle } from 'lucide-react';
import { api } from '../services/apiClient';
import { useProgressContext } from '../context/ProgressContext';

const STORAGE_KEY = "zoneout_goals";

function loadLocalGoals() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveLocalGoals(goals) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(goals)); } catch { }
}

export default function StudyGoals() {
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState("");
  const [useLocal, setUseLocal] = useState(false);
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
    const fetchGoals = async () => {
      try {
        const data = await api.get("/goals");
        if (Array.isArray(data)) {
          setGoals(data);
          saveLocalGoals(data);
        } else {
          setGoals([]);
        }
      } catch (err) {
        console.warn("API unavailable, using local goals:", err.message);
        setUseLocal(true);
        setGoals(loadLocalGoals());
      }
    };

    fetchGoals();
  }, []);


  // ===============================
  // ADD GOAL
  // ===============================
  const addGoal = async () => {
    if (!newGoal.trim()) return;

    const localGoal = {
      _id: `local_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      text: newGoal,
      targetDate: "",
      plan: [],
      completed: false,
      createdAt: new Date().toISOString(),
    };

    if (!useLocal) {
      try {
        const data = await api.post("/goals", {
          text: newGoal,
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
  };

  // ===============================
  // TOGGLE MAIN GOAL
  // ===============================
  const toggleMainGoal = async (goal) => {
    const toggled = { ...goal, completed: !goal.completed };

    if (!useLocal) {
      try {
        const updated = await api.put(`/goals/${goal._id}`, {
          completed: !goal.completed
        });

        setGoals(prev =>
          prev.map(g => g._id === goal._id ? updated : g)
        );
        
        // Log event for any toggle (recalculates percentage)
        if (pushProgressEvent) {
          pushProgressEvent({
            eventType: "goal_updated",
            value: { goalId: goal._id, completed: updated.completed }
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
  };

  // ===============================
  // DELETE GOAL
  // ===============================
  const deleteGoal = async (id) => {
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
  };

  // ===============================
  // UPDATE DEADLINE
  // ===============================
  const updateGoalDate = async (goal, newDate) => {
    const updated = { ...goal, targetDate: newDate };

    if (!useLocal) {
      try {
        const serverUpdated = await api.put(`/goals/${goal._id}`, {
          targetDate: newDate
        });

        setGoals(prev =>
          prev.map(g => g._id === goal._id ? serverUpdated : g)
        );
        return;
      } catch (error) {
        console.warn("API date update failed, updating locally:", error.message);
        setUseLocal(true);
      }
    }

    // Fallback
    setGoals(prev =>
      prev.map(g => g._id === goal._id ? updated : g)
    );
  };

  // ===============================
  // HELPER
  // ===============================
  const getTimeLeft = (dateString) => {
    if (!dateString) return null;
    const diff = new Date(dateString) - new Date();
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
      alignItems: 'center'
    },

    goalLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '14px'
    },

    checkbox: {
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center'
    },

    goalText: {
      fontSize: '1rem',
      fontWeight: '500'
    },

    deadline: {
      marginTop: '10px',
      fontSize: '0.85rem',
      color: 'var(--text-secondary)'
    },

    emptyState: {
      textAlign: 'center',
      opacity: 0.5,
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
          value={newGoal}
          onChange={(e) => setNewGoal(e.target.value)}
          placeholder="Add a new goal..."
          onKeyDown={(e) => e.key === 'Enter' && addGoal()}
          style={styles.input}
        />
        <button onClick={addGoal} style={styles.addBtn}>
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
              <div
                onClick={() => toggleMainGoal(goal)}
                style={styles.checkbox}
              >
                {goal.completed
                  ? <CheckCircle size={22} color="var(--accent-primary)" />
                  : <Circle size={22} color="var(--text-secondary)" />
                }
              </div>

              <span
                style={{
                  ...styles.goalText,
                  textDecoration: goal.completed ? 'line-through' : 'none'
                }}
              >
                {goal.text}
              </span>
            </div>

            <Trash2
              size={18}
              color="var(--text-secondary)"
              style={{ cursor: 'pointer', transition: "0.2s ease" }}
              onClick={() => deleteGoal(goal._id)}
            />
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
