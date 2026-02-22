import React, { useState } from 'react';
import { useThreads } from '../../hooks/useThreads';
import { useStudyGroup } from '../../context/StudyGroupContext';
import { ThreadPost } from './ThreadPost';
import { CreateThreadModal } from './CreateThreadModal';

export const ThreadFeed = ({ currentUser }) => {
    const { group } = useStudyGroup();
    const { threads, createThread } = useThreads(group.id);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleCreate = (title, body) => {
        createThread(currentUser.id, title, body);
    };

    return (
        <div className="sg-view-container">
            <div className="sg-panel-header">
                <h2 className="sg-panel-title">Discussion Board</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="sg-btn-primary"
                    style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width={16} height={16}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    New Post
                </button>
            </div>

            <div className="sg-scrollable">
                {threads.length === 0 ? (
                    <div className="sg-empty">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width={48} height={48}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                        </svg>
                        <p>No discussions yet. Be the first to post!</p>
                    </div>
                ) : (
                    threads.map(thread => <ThreadPost key={thread.id} post={thread} />)
                )}
            </div>

            <CreateThreadModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreate}
            />
        </div>
    );
};
