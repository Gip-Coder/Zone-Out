import React from 'react';
import { Bot, MessageSquare } from 'lucide-react';

export default function AIPage() {
  return (
    <div style={pageStyle}>
      <h1 style={titleStyle}>AI Assistant</h1>
      <p style={subStyle}>Study Buddy and Q&A are available from the floating buttons.</p>
      <div style={boxStyle}>
        <div style={rowStyle}>
          <Bot size={24} style={{ color: 'var(--accent-primary)' }} />
          <span><strong>Study Buddy (control)</strong> — Open the purple bot button at bottom-right to set timer, navigate, and manage goals.</span>
        </div>
        <div style={rowStyle}>
          <MessageSquare size={24} style={{ color: 'var(--accent-secondary)' }} />
          <span><strong>Chatbot</strong> — Use the chat button for general study questions and doubts.</span>
        </div>
      </div>
    </div>
  );
}

const pageStyle = { padding: '32px', maxWidth: '640px', margin: '0 auto' };
const titleStyle = { fontSize: '28px', fontWeight: '700', marginBottom: '8px' };
const subStyle = { color: 'var(--text-secondary)', marginBottom: '24px' };
const boxStyle = {
  background: 'var(--bg-secondary)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 'var(--radius-lg)',
  padding: '24px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};
const rowStyle = { display: 'flex', alignItems: 'flex-start', gap: '12px', color: 'var(--text-primary)' };
