import React from 'react';
import { Search, Bell } from 'lucide-react';
import Sidebar from '../template/Sidebar';
import RightSidebar from '../template/RightSidebar';
import CreatePost from '../template/CreatePost';
import PostItem from '../template/PostItem';

export const StudyGroupApp = () => {
    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-transparent relative">
            {/* Ambient Background Glow (matching previous styling) */}
            <div className="absolute top-1/4 left-[-10%] w-[500px] h-[500px] bg-[var(--neon-pink)]/5 rounded-full blur-[140px] pointer-events-none -z-10" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[var(--neon-purple)]/5 rounded-full blur-[150px] pointer-events-none -z-10" />

            <Sidebar />

            <main className="flex-1 max-w-4xl mx-auto p-4 lg:p-8 overflow-y-auto custom-scrollbar">
                {/* Header */}
                <header className="flex flex-wrap lg:flex-nowrap items-center justify-between mb-8 gap-4">
                    <h2 className="text-3xl font-bold text-white">Study Group Feed</h2>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input
                                type="text"
                                placeholder="Search groups..."
                                className="bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:border-[var(--neon-purple)]/50 w-48 lg:w-64 transition-all"
                            />
                        </div>
                        <button className="p-2 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all relative">
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

                <div className="space-y-6">
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
                                    className="rounded-xl w-full h-64 object-cover border border-white/10"
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
                                <div className="bg-black/40 rounded-xl p-4 font-mono text-sm border border-white/5 overflow-x-auto">
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
                                <h5 className="text-xl font-bold text-white">Pomodoro Timer</h5>
                                <a href="#" className="text-[var(--neon-blue)] hover:underline block text-sm">https://www.youtube.com/watch?v=Pomodoro-Timer</a>
                                <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded bg-red-500/20 flex items-center justify-center text-red-500 shrink-0">
                                        <span className="font-bold">YT</span>
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-sm font-medium text-white truncate">Study with Me: 2 Hour Pomodoro</p>
                                        <p className="text-xs text-slate-500 truncate">YouTube • 1.2M views</p>
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
