import React from 'react';
import StudyGroupsHeader from '../StudyGroupsHeader';

const StudyGroupsLayout = ({ feed, rightPanel }) => {
    return (
        <div className="w-full h-full relative">
            <div className="flex flex-col h-full overflow-y-auto custom-scrollbar min-w-0 pb-20 pt-4 px-2 lg:px-6">
                <StudyGroupsHeader />

                <div className="study-groups-layout mt-2">
                    <main className="flex flex-col min-w-0">
                        {feed}
                    </main>

                    <aside className="right-panel hidden xl:flex flex-col gap-6 pb-20">
                        {rightPanel}
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default StudyGroupsLayout;
