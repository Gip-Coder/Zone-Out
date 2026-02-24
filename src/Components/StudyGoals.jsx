import React, { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle, Circle } from 'lucide-react';

export default function StudyGoals() {
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState("");

  const API_BASE = import.meta.env.DEV ? "http://localhost:5000" : (import.meta.env.VITE_API_URL || "");
  const API_URL = `${API_BASE}/api/goals`;

  // ===============================
  // LOAD GOALS FROM BACKEND
  // ===============================
  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const res = await fetch(API_URL, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });

        if (res.status === 401) {
          console.log("Unauthorized. Token missing or invalid.");
          return;
        }

        const data = await res.json();

        if (Array.isArray(data)) {
          setGoals(data);
        } else {
          setGoals([]);
        }

      } catch (err) {
        console.error("Error fetching goals:", err);
        setGoals([]);
      }
    };

    fetchGoals();
  }, [API_URL]);


  // ===============================
  // ADD GOAL
  // ===============================
  const addGoal = async () => {
    if (!newGoal.trim()) return;

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          text: newGoal,
          targetDate: "",
          plan: []
        }),
      });

      const data = await res.json();

      // safer state update
      setGoals(prev => [data, ...prev]);
      setNewGoal("");
    } catch (error) {
      console.error("Error adding goal:", error);
    }
  };

  // ===============================
  // TOGGLE MAIN GOAL
  // ===============================
  const toggleMainGoal = async (goal) => {
    try {
      const res = await fetch(`${API_URL}/${goal._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          completed: !goal.completed
        }),
      });

      const updated = await res.json();

      setGoals(prev =>
        prev.map(g => g._id === goal._id ? updated : g)
      );
    } catch (error) {
      console.error("Error toggling goal:", error);
    }
  };

  // ===============================
  // DELETE GOAL
  // ===============================
  const deleteGoal = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      setGoals(prev =>
        prev.filter(goal => goal._id !== id)
      );
    } catch (error) {
      console.error("Error deleting goal:", error);
    }
  };

  // ===============================
  // UPDATE DEADLINE
  // ===============================
  const updateGoalDate = async (goal, newDate) => {
    try {
      const res = await fetch(`${API_URL}/${goal._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetDate: newDate
        }),
      });

      const updated = await res.json();

      setGoals(prev =>
        prev.map(g => g._id === goal._id ? updated : g)
      );
    } catch (error) {
      console.error("Error updating date:", error);
    }
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
      border: '1px solid rgba(255,255,255,0.08)',
      background: 'var(--bg-secondary)',
      color: 'var(--text-primary)',
      fontSize: '0.95rem'
    },

    addBtn: {
      background: 'var(--button-gradient)',
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
      border: '1px solid rgba(255,255,255,0.05)',
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
