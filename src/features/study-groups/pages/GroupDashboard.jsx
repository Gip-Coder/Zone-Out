import React from 'react';
import StudyGroupsLayout from '../components/layout/StudyGroupsLayout';
import Sidebar from '../components/Sidebar';
import Feed from '../components/Feed';
import RightPanel from '../components/RightPanel';
import { StudyGroupProvider } from '../context/StudyGroupContext';
import { ThreadProvider } from '../context/ThreadContext';

const MOCK_CURRENT_USER = {
    id: 'user_123',
    name: 'Alex Developer',
    avatarUrl: null
};

export const GroupDashboard = ({ groupId = 'MATH101' }) => {
    return (
        <StudyGroupProvider groupId={groupId} currentUser={MOCK_CURRENT_USER}>
            <ThreadProvider groupId={groupId} currentUser={MOCK_CURRENT_USER}>
                <StudyGroupsLayout
                    sidebar={<Sidebar />}
                    feed={<Feed currentUser={MOCK_CURRENT_USER} />}
                    rightPanel={<RightPanel />}
                />
            </ThreadProvider>
        </StudyGroupProvider>
    );
};

export default GroupDashboard;
