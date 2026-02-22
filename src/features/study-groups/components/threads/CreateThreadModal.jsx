import React, { useState } from 'react';

export const CreateThreadModal = ({ isOpen, onClose, onSubmit }) => {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim() || !body.trim()) return;
        onSubmit(title, body);
        setTitle('');
        setBody('');
        onClose();
    };

    return (
        <div className="sg-modal-overlay">
            <div className="sg-modal">
                <div className="sg-modal-header">
                    <h2 className="sg-modal-title">Create New Thread</h2>
                    <button onClick={onClose} className="sg-close-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width={24} height={24}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="sg-form-group">
                        <label htmlFor="title" className="sg-label">Title</label>
                        <input
                            id="title"
                            type="text"
                            autoFocus
                            className="sg-input-full"
                            placeholder="What's your question or topic?"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                    <div className="sg-form-group">
                        <label htmlFor="body" className="sg-label">Details</label>
                        <textarea
                            id="body"
                            rows={4}
                            className="sg-input-full"
                            style={{ resize: 'none' }}
                            placeholder="Provide more context, share code snippets, or detail your working process..."
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                        />
                    </div>
                    <div className="sg-modal-actions">
                        <button type="button" onClick={onClose} className="sg-btn-cancel">
                            Cancel
                        </button>
                        <button type="submit" disabled={!title.trim() || !body.trim()} className="sg-btn-submit">
                            Post Thread
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
