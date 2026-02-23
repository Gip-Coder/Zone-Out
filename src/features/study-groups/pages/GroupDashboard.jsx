import React from 'react';
import StudyGroupApp from '../components/layout/StudyGroupApp';

const MOCK_CURRENT_USER = {
    id: 'user_123',
    name: 'Alex Developer',
    avatarUrl: null
};

export const GroupDashboard = ({ groupId = 'demo_group_1' }) => {
    return (
        <StudyGroupApp groupId={groupId} currentUser={MOCK_CURRENT_USER} />
    );
};

export default GroupDashboard;
