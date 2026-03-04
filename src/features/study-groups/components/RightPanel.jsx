import React from 'react';
import ActiveGroupsCard from './ActiveGroupsCard';
import LeaderboardCard from './LeaderboardCard';
import OnlineFriendsCard from './OnlineFriendsCard';

const RightPanel = () => {
    return (
        <>
            <LeaderboardCard />
            <ActiveGroupsCard />
            <OnlineFriendsCard />
        </>
    );
};

export default RightPanel;
