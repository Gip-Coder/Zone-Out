import React from 'react';
import { StudyGroupProvider } from '../context/StudyGroupContext';
import { ThreadProvider } from '../context/ThreadContext';

import GroupSidebar from '../components/GroupSidebar';
import GroupHeader from '../components/GroupHeader';
import CreatePost from '../components/CreatePost';
import OnlineMembers from '../components/OnlineMembers';

const MOCK_CURRENT_USER = {
    id: 'user_123',
    name: 'Alex Developer',
    avatarUrl: null
};

export const GroupDashboard = ({ groupId = 'MATH101' }) => {
    return (
        <StudyGroupProvider groupId={groupId} currentUser={MOCK_CURRENT_USER}>
            <ThreadProvider groupId={groupId} currentUser={MOCK_CURRENT_USER}>
                <div
                    className="w-full gap-6"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '260px minmax(0, 1fr) 280px',
                        minHeight: 'calc(100vh - 120px)'
                    }}
                >
                    <GroupSidebar />

                    <div className="feed-area custom-scrollbar flex flex-col gap-6 overflow-y-auto min-w-0 pb-6 h-full">
                        <GroupHeader />
                        <CreatePost />

                        {/* Feed section placeholder for future PostCard mapping */}
                        <div className="flex flex-col gap-6">
                            {/* posts.map(post => <PostCard key={post.id} post={post} />) */}
                        </div>
                    </div>

                    <OnlineMembers />
                </div>
            </ThreadProvider>
        </StudyGroupProvider>
    );
};

export default GroupDashboard;
