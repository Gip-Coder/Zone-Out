import React from 'react';
import ActiveGroupsCard from './ActiveGroupsCard';
import LeaderboardCard from './LeaderboardCard';

const RightPanel = () => {
    return (
        <div className="flex flex-col gap-6 w-full h-full">
            <ActiveGroupsCard />
            <LeaderboardCard />
        </div>
    );
};

export default RightPanel;
