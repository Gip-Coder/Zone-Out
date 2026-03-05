import React from 'react';
import { Search, Bell } from 'lucide-react';
import Sidebar from '../template/Sidebar';
import RightSidebar from '../template/RightSidebar';
import CreatePost from '../template/CreatePost';
import PostItem from '../template/PostItem';

export const StudyGroupApp = () => {
    <div style={{height:"200px", background:"red"}}></div>
    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-transparent relative">
            {/* Ambient Background Glow (matching previous styling) */}
            <div className="absolute top-1/4 left-[-10%] w-[500px] h-[500px] bg-[var(--neon-pink)]/5 rounded-full blur-[140px] pointer-events-none -z-10" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[var(--neon-purple)]/5 rounded-full blur-[150px] pointer-events-none -z-10" />

            <Sidebar />

            <main className="flex-1 max-w-4xl mx-auto p-4 lg:p-8 overflow-y-auto custom-scrollbar">
                {/* Header */}
                <header className="flex flex-wrap lg:flex-nowrap items-center justify-between mb-8 gap-4">
                    <h2 className="text-3xl font-bold text-[var(--text-primary)]">Study Group Feed</h2>
                    <div className="flex items-center gap-4">
                      <div className="relative w-72">
    <Search
        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        size={18}/>

    <input
        type="text"
        placeholder="Search groups..."
        className="w-full py-3 pl-11 pr-5 text-sm text-white
        bg-white/5 backdrop-blur-md
        border border-red-500/70 rounded-full
        placeholder-gray-400
        focus:outline-none focus:border-red-500
        focus:ring-2 focus:ring-red-500/40
        transition-all duration-200"/>
</div>
                        <button className="p-2 rounded-full bg-[var(--glass)] border border-[var(--glass)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all relative">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-[var(--neon-pink)] rounded-full border border-black/20"></span>
                        </button>
                        <img
                            src="https://picsum.photos/seed/me/100/100"
                            alt="Profile"
                            className="w-10 h-10 rounded-full border-2 border-[var(--neon-purple)] object-cover"
                            referrerPolicy="no-referrer"
                        />
                    </div>
                </header>

                <CreatePost />

                <div className="space-y-50">
                    <PostItem
                        user={{ name: 'Sarah K.', avatar: 'https://picsum.photos/seed/sarah/100/100' }}
                        likes={124}
                        comments={12}
                        content={
                            <div className="space-y-3">
                                <p>
                                    'Deep Work' a book on the perfect maternity book of Isamamnt to data bansales, and the boards of 'Deep Work' recommendation... <span className="text-[var(--neon-purple)] cursor-pointer hover:underline">Read more</span>
                                </p>
                                <img
                                    src="https://picsum.photos/seed/book/800/400"
                                    alt="Post content"
                                    className="rounded-xl w-full h-64 object-cover border border-[var(--glass)]"
                                    referrerPolicy="no-referrer"
                                />
                            </div>
                        }
                    />

                    <PostItem
                        user={{ name: 'Devon B.', avatar: 'https://picsum.photos/seed/devon/100/100' }}
                        likes={89}
                        comments={4}
                        content={
                            <div className="space-y-4">
                                <p>Just finished this Python script for automated data cleaning. Thoughts?</p>
                                <div className="bg-[var(--overlay-bg)] rounded-xl p-4 font-mono text-sm border border-[var(--glass)] overflow-x-auto">
                                    <pre className="text-[var(--neon-blue)]">
                                        {`def clean_data(df):
    # Remove duplicates
    df = df.drop_duplicates()
    
    # Handle missing values
    df = df.fillna(df.mean())
    
    print("Data cleaning complete!")
    return df`}
                                    </pre>
                                </div>
                            </div>
                        }
                    />

                    <PostItem
                        user={{ name: 'Maria L.', avatar: 'https://picsum.photos/seed/maria/100/100' }}
                        likes={245}
                        comments={31}
                        content={
                            <div className="space-y-2">
                                <h5 className="text-xl font-bold text-[var(--text-primary)]">Pomodoro Timer</h5>
                                <a href="#" className="text-[var(--neon-blue)] hover:underline block text-sm">https://www.youtube.com/watch?v=Pomodoro-Timer</a>
                                <div className="p-4 rounded-xl bg-[var(--glass)] border border-[var(--glass)] flex items-center gap-4">
                                    <div className="w-12 h-12 rounded bg-red-500/20 flex items-center justify-center text-red-500 shrink-0">
                                        <span className="font-bold">YT</span>
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">Study with Me: 2 Hour Pomodoro</p>
                                        <p className="text-xs text-[var(--text-secondary)] truncate">YouTube • 1.2M views</p>
                                    </div>
                                </div>
                            </div>
                        }
                    />
                </div>
            </main>

            <RightSidebar />
        </div>
    );
};
