import React, { useState } from 'react';

export const AddProgressForm = ({ isOpen, onClose, onSubmit }) => {
    const [content, setContent] = useState('');
    const [courseTag, setCourseTag] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!content.trim()) return;
        onSubmit(content, courseTag);
        setContent('');
        setCourseTag('');
        onClose();
    };

    return (
        <div className="sg-modal-overlay">
            <div className="sg-modal">
                <div className="sg-modal-header">
                    <h2 className="sg-modal-title">Share Progress</h2>
                    <button onClick={onClose} className="sg-close-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width={24} height={24}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="sg-form-group">
                        <label htmlFor="courseTag" className="sg-label">Course / Topic Tag (Optional)</label>
                        <input
                            id="courseTag"
                            type="text"
                            className="sg-input-full"
                            placeholder="e.g., #Calc101, React Module 3"
                            value={courseTag}
                            onChange={(e) => setCourseTag(e.target.value)}
                        />
                    </div>
                    <div className="sg-form-group">
                        <label htmlFor="content" className="sg-label">Update Details</label>
                        <textarea
                            id="content"
                            rows={4}
                            autoFocus
                            className="sg-input-full"
                            style={{ resize: 'none' }}
                            placeholder="What did you achieve today? Share your code, notes, or milestones..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                    </div>

                    <div style={{ background: 'rgba(124, 58, 237, 0.1)', color: 'var(--accent-primary)', padding: '12px', borderRadius: '8px', fontSize: '13px', display: 'flex', gap: '8px', marginTop: '16px' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width={20} height={20}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                        </svg>
                        <p style={{ margin: 0 }}>Pictures and screenshot attachments are coming in a future update!</p>
                    </div>

                    <div className="sg-modal-actions">
                        <button type="button" onClick={onClose} className="sg-btn-cancel">
                            Cancel
                        </button>
                        <button type="submit" disabled={!content.trim()} className="sg-btn-submit">
                            Post Update
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
