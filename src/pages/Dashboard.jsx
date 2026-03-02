import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Book, Timer, Music, Bot, Plus, ArrowRight } from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext';
import './Dashboard.css';

export default function Dashboard() {
  const { theme } = useContext(ThemeContext);

  const cards = [
    {
      id: "timeline",
      title: "Timeline",
      route: "/timeline",
      icon: TrendingUp,
      accent: {
        dark: "var(--accent-primary)",
        light: "#10b981"
      },
      content: {
        dark: {
          desc: "View and manage your study goals and upcoming deadlines.",
          link: "Open Timeline"
        },
        light: {
          desc: "View and manage your study goals. Track your progress across modules effectively.",
          link: "Open Timeline"
        }
      }
    },
    {
      id: "vault",
      title: "Course Vault",
      route: "/course-vault",
      icon: Book,
      accent: {
        dark: "var(--accent-secondary)", // pink
        light: "#10b981"
      },
      content: {
        dark: {
          desc: "Access all your notes, modules, and archived course materials.",
          link: "Open Vault"
        },
        light: {
          desc: "Access all your notes, modules, and course materials in one secure location.",
          link: "Open Vault"
        }
      }
    },
    {
      id: "timer",
      title: "Focus Timer",
      route: "/timer",
      icon: Timer,
      accent: {
        dark: "var(--accent-tertiary)", // blue
        light: "#10b981"
      },
      content: {
        dark: {
          desc: "Start a Pomodoro-style focus session to boost productivity.",
          link: "Start Session"
        },
        light: {
          desc: "Start a Pomodoro-style focus session to maximize your productivity.",
          link: "Start Session"
        }
      }
    },
    {
      id: "music",
      title: "Music",
      route: "/music",
      icon: Music,
      accent: {
        dark: "#10b981", // green
        light: "#10b981"
      },
      content: {
        dark: {
          desc: "Curated Lo-Fi and ambient background music for deep work.",
          link: "Play Music"
        },
        light: {
          desc: "Lo-fi and ambient background music curated for deep studying sessions.",
          link: "Play Music"
        }
      }
    },
    {
      id: "ai",
      title: "AI Assistant",
      route: "/ai",
      icon: Bot,
      accent: {
        dark: "#f43f5e", // rose
        light: "#10b981"
      },
      content: {
        dark: {
          desc: "Your personalized Study Buddy and Q&A chatbot.",
          link: "Ask AI"
        },
        light: {
          desc: "Your personal Study Buddy and Q&A chatbot to help clarify difficult concepts.",
          link: "Ask AI"
        }
      }
    }
  ];

  return (
    <div className="dashboard-container">
      {/* Ambient background orbs */}
      <div className="dashboard-ambient-bg">
        <div className="dashboard-orb-primary"></div>
        <div className="dashboard-orb-secondary"></div>
      </div>

      <header className="dashboard-header">
        <h1 className="dashboard-title">Dashboard</h1>
        <p className="dashboard-subtitle">
          {theme === "light"
            ? "Your study hub. Jump to any feature below to start your focus session."
            : "Your centralized study hub. Jump back into your workflow below."}
        </p>
      </header>

      <div className="dashboard-grid">
        {cards.map((card) => {
          const IconComponent = card.icon;
          const currentContent = theme === "light" ? card.content.light : card.content.dark;

          return (
            <Link
              key={card.id}
              to={card.route}
              className={`dashboard-card dashboard-card-${card.id}`}
              style={{
                "--card-accent": theme === "light" ? card.accent.light : card.accent.dark
              }}
            >
              <div className="dashboard-card-glow"></div>
              <div className="dashboard-card-content">
                <div className="dashboard-card-icon-wrapper">
                  <IconComponent size={24} color="var(--card-accent)" strokeWidth={2.5} />
                </div>
                <h3 className="dashboard-card-title">{card.title}</h3>
                <p className="dashboard-card-desc">{currentContent.desc}</p>
                <span className="dashboard-card-link">
                  {currentContent.link} <ArrowRight size={14} />
                </span>
              </div>
            </Link>
          );
        })}

        {/* Add Widget placeholder */}
        <div className="dashboard-card dashboard-card-add">
          <div className="dashboard-card-content">
            <div className="dashboard-card-icon-wrapper dashboard-card-add-icon">
              <Plus size={24} strokeWidth={2.5} color={theme === "light" ? "#9ca3af" : "var(--text-secondary)"} />
            </div>
            <h3 className="dashboard-card-title dashboard-card-add-title" style={{ color: theme === "light" ? "#6b7280" : "var(--text-secondary)" }}>
              Add Widget
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}
