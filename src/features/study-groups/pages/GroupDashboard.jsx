import React, { useState } from 'react';
import { StudyGroupProvider, useStudyGroup } from '../context/StudyGroupContext';
import { GroupTabs } from '../components/navigation/GroupTabs';
import { ChatLayout } from '../components/chat/ChatLayout';
import { ThreadFeed } from '../components/threads/ThreadFeed';
import { ProgressFeed } from '../components/progress/ProgressFeed';
import '../studyGroups.css';

const MOCK_CURRENT_USER = {
    id: 'user_123',
    name: 'Alex Developer',
    avatarUrl: null
};

const DashboardContent = () => {
    const { group } = useStudyGroup();
    const [activeTab, setActiveTab] = useState('chat');

    if (!group) return null;

    return (
        <div className="sg-dashboard-wrapper">
            <div className="sg-header-card">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-indigo-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
                <div className="sg-header-content">
                    <div className="sg-header-top">
                        <h1 className="sg-title">{group.name}</h1>
                        <span className="sg-badge">{group.privacy}</span>
                    </div>
                    <p className="sg-description">{group.description}</p>
                </div>

                <div className="sg-stats">
                    <div className="sg-avatars">
                        {['#ef4444', '#f59e0b', '#10b981', '#6366f1', '#8b5cf6'].map((color, i) => (
                            <div key={i} className="sg-avatar" style={{ backgroundColor: color }}>
                                U{i + 1}
                            </div>
                        ))}
                    </div>
                    <div className="sg-member-count">
                        <strong>{group.members?.length || 42}</strong>
                        <span>Members</span>
                    </div>
                </div>
            </div>

            <div className="sg-main-content">
                <GroupTabs activeTab={activeTab} onTabChange={setActiveTab} />
                <div className="sg-content-area">
                    {activeTab === 'chat' && <ChatLayout currentUser={MOCK_CURRENT_USER} />}
                    {activeTab === 'threads' && <ThreadFeed currentUser={MOCK_CURRENT_USER} />}
                    {activeTab === 'progress' && <ProgressFeed currentUser={MOCK_CURRENT_USER} />}
                </div>
            </div>
        </div>
    );
};

export const GroupDashboard = ({ groupId = 'demo_group_1' }) => {
    return (
        <StudyGroupProvider groupId={groupId}>
            <DashboardContent />
        </StudyGroupProvider>
    );
};

export default GroupDashboard;
