import React, { useState } from 'react';
import { useProgress } from '../../hooks/useProgress';
import { useStudyGroup } from '../../context/StudyGroupContext';
import { ProgressCard } from './ProgressCard';
import { AddProgressForm } from './AddProgressForm';

export const ProgressFeed = ({ currentUser }) => {
    const { group } = useStudyGroup();
    const { updates, postUpdate } = useProgress(group.id);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const handleSubmit = (content, courseTag) => {
        postUpdate(currentUser.id, courseTag, content);
    };

    return (
        <div className="sg-view-container">
            <div className="sg-panel-header">
                <h2 className="sg-panel-title">Study Progress</h2>
                <button
                    onClick={() => setIsFormOpen(true)}
                    className="sg-btn-primary"
                    style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width={16} height={16}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Share Update
                </button>
            </div>

            <div className="sg-scrollable">
                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                    {updates.length === 0 ? (
                        <div className="sg-empty">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width={48} height={48}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                            </svg>
                            <p>No progress shared yet. Be the first to share your wins!</p>
                        </div>
                    ) : (
                        updates.map(update => <ProgressCard key={update.id} update={update} />)
                    )}
                </div>
            </div>

            <AddProgressForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSubmit={handleSubmit}
            />
        </div>
    );
};
