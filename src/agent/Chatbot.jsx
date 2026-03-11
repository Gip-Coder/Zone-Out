import React, { useState, useEffect, useRef } from "react";
import { Bot, Send, X, Copy } from "lucide-react";

const INITIAL_MESSAGE = {
  role: "assistant",
  content:
    "Hi! I'm your ZoneOut AI assistant.\nI can help explain study concepts and also control the app.\nTry asking a question or say something like 'start a 25 minute timer'.",
};

/**
 * Detect whether user input looks like an app-control command (timer, navigation, goals, etc.)
 * rather than a conversational study question.
 */
function looksLikeCommand(input) {
  const lower = input.toLowerCase().trim();
  const commandPatterns = [
    // Timer
    /\btimer\b/, /\bstart\b/, /\bstop\b/, /\bpause\b/, /\bresume\b/, /\bpomodoro\b/,
    /\bfocus\b.*\b(session|time|minute|min)\b/,
    /\bset\b.*\b(timer|time|minute|min)\b/,
    /\b\d+\s*(min|minute|minutes|m)\b/,
    // Navigation
    /\bnavigate\b/, /\bgo\s*to\b/, /\bopen\b/, /\bswitch\s*to\b/, /\bshow\b.*\b(page|tab|view)\b/,
    /\b(timeline|vault|course|flashcard|progress|setting|profile|dashboard|music|resource)\b/,
    // Goals
    /\badd\s*goal\b/, /\bgoal\b/, /\bremove\s*goal\b/, /\bdelete\s*goal\b/, /\btoggle\s*goal\b/,
    // General control
    /\bturn\s*(on|off)\b/, /\benable\b/, /\bdisable\b/,
  ];
  return commandPatterns.some((pattern) => pattern.test(lower));
}

/**
 * Unified AI Chatbot — single interface for both study Q&A and app control.
 * Controlled component: open/close state is managed externally via isOpen + onToggle.
 */
export default function Chatbot({ brain, isOpen, onToggle, placeholder = "Ask anything or give a command..." }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const effectiveBrain = brain;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const clearHistory = () => {
    if (window.confirm("Clear conversation?")) {
      setMessages([INITIAL_MESSAGE]);
    }
  };

  const handleSend = async (customInput = null) => {
    const textToSend = customInput ?? input;
    if (!textToSend?.trim() || loading || !effectiveBrain) return;

    const userMessage = { role: "user", content: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      let reply;

      if (looksLikeCommand(textToSend)) {
        // Intent looks like app control → use brain.think()
        try {
          reply = await effectiveBrain.think(textToSend);
        } catch (thinkErr) {
          // think() failed → graceful fallback to chat()
          console.warn("brain.think() failed, falling back to chat():", thinkErr.message);
          const history = messages
            .filter((m) => m.role && m.content)
            .map((m) => ({ role: m.role, content: m.content }));
          reply = await effectiveBrain.chat(textToSend, history);
        }
      } else {
        // Conversational Q&A → use brain.chat()
        const history = messages
          .filter((m) => m.role && m.content)
          .map((m) => ({ role: m.role, content: m.content }));
        reply = await effectiveBrain.chat(textToSend, history);
      }

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      console.error("AI error:", err);
      const errorDetail = err.message || "Unknown error";
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `⚠️ AI request failed: ${errorDetail}\n\nPlease check your internet connection or try again later.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  if (!effectiveBrain) return null;

  return (
    <div style={containerStyle}>
      {isOpen ? (
        <div style={panelStyle}>
          <div style={headerStyle}>
            <span style={titleStyle}>ZoneOut AI</span>
            <div style={headerActionsStyle}>
              <button
                type="button"
                onClick={clearHistory}
                style={iconBtnStyle}
                title="Clear chat"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => onToggle(false)}
                style={iconBtnStyle}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div style={messagesStyle} className="chatbot-messages-container">
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  ...bubbleStyle,
                  ...(msg.role === "user" ? userBubbleStyle : assistantBubbleStyle),
                }}
              >
                <span style={bubbleContentStyle}>{msg.content}</span>
                {msg.role === "assistant" && (
                  <button
                    type="button"
                    onClick={() => copyToClipboard(msg.content)}
                    style={copyBtnStyle}
                    title="Copy"
                  >
                    <Copy size={12} />
                  </button>
                )}
              </div>
            ))}
            {loading && (
              <div style={loadingStyle}>
                <span className="chatbot-pulse-dot" />
                Thinking...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            style={formStyle}
          >
            <input
              disabled={loading}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={placeholder}
              style={inputStyle}
              aria-label="Message"
            />
            <button
              type="submit"
              disabled={loading}
              style={sendBtnStyle}
              aria-label="Send"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => onToggle(true)}
          style={fabStyle}
          aria-label="Open AI assistant"
        >
          <Bot size={28} />
        </button>
      )}

      <style>{`
        .chatbot-pulse-dot {
          width: 6px; height: 6px;
          background: var(--accent-secondary, #a78bfa);
          border-radius: 50%;
          animation: chatbot-pulse 1.2s infinite;
        }
        @keyframes chatbot-pulse {
          0%, 100% { opacity: 0.4; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        .chatbot-messages-container::-webkit-scrollbar {
          width: 6px;
        }
        .chatbot-messages-container::-webkit-scrollbar-track {
          background: transparent;
        }
        .chatbot-messages-container::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }
        .chatbot-messages-container::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
}

/* ============================
   STYLES
   ============================ */

const containerStyle = {
  position: "fixed",
  bottom: "24px",
  right: "24px",
  zIndex: 999,
};

const panelStyle = {
  width: "380px",
  maxWidth: "calc(100vw - 32px)",
  height: "500px",
  maxHeight: "75vh",
  borderRadius: "16px",
  background: "var(--bg-secondary, rgba(30, 30, 40, 0.95))",
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px 14px",
  borderBottom: "1px solid rgba(255,255,255,0.06)",
  flexShrink: 0,
};

const titleStyle = {
  fontWeight: "700",
  color: "var(--text-primary, #fff)",
  fontSize: "15px",
};

const headerActionsStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

const iconBtnStyle = {
  background: "none",
  border: "none",
  color: "rgba(255,255,255,0.6)",
  cursor: "pointer",
  padding: "4px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const messagesStyle = {
  flex: 1,
  overflowY: "auto",
  padding: "12px",
  display: "flex",
  flexDirection: "column",
  gap: "12px",
};

const bubbleStyle = {
  padding: "10px 12px",
  borderRadius: "12px",
  maxWidth: "90%",
  position: "relative",
  whiteSpace: "pre-wrap",
  lineHeight: 1.5,
};

const userBubbleStyle = {
  alignSelf: "flex-end",
  background: "var(--accent-secondary, rgba(124, 58, 237, 0.25))",
  border: "1px solid rgba(124, 58, 237, 0.4)",
};

const assistantBubbleStyle = {
  alignSelf: "flex-start",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
};

const bubbleContentStyle = {
  color: "var(--text-primary, #fff)",
  fontSize: "14px",
};

const copyBtnStyle = {
  position: "absolute",
  bottom: "4px",
  right: "4px",
  background: "rgba(255,255,255,0.1)",
  border: "none",
  borderRadius: "50%",
  padding: "4px",
  cursor: "pointer",
  color: "rgba(255,255,255,0.7)",
};

const loadingStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  fontSize: "12px",
  color: "var(--accent-secondary, #a78bfa)",
};

const formStyle = {
  display: "flex",
  gap: "8px",
  padding: "12px",
  borderTop: "1px solid rgba(255,255,255,0.06)",
  flexShrink: 0,
};

const inputStyle = {
  flex: 1,
  background: "rgba(0,0,0,0.25)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "var(--text-primary, #fff)",
  borderRadius: "8px",
  padding: "10px 12px",
  outline: "none",
  fontSize: "14px",
};

const sendBtnStyle = {
  background: "var(--button-gradient, linear-gradient(135deg, #7c3aed, #a78bfa))",
  border: "none",
  borderRadius: "8px",
  padding: "10px",
  cursor: "pointer",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const fabStyle = {
  width: "56px",
  height: "56px",
  borderRadius: "50%",
  background: "var(--button-gradient, linear-gradient(135deg, #7c3aed, #a78bfa))",
  border: "none",
  color: "#fff",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 4px 20px rgba(124, 58, 237, 0.4)",
};
