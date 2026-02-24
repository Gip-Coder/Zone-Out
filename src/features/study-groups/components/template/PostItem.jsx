import React from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, Bookmark } from 'lucide-react';

export default function PostItem({ user, content, likes, comments }) {
    return (
        <div className="glass-card p-6 mb-6 glass-card-hover">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-12 h-12 rounded-full border-2 border-[var(--neon-purple)]/30 object-cover"
                        referrerPolicy="no-referrer"
                    />
                    <div>
                        <h4 className="font-semibold text-white">{user.name}</h4>
                        <p className="text-xs text-slate-500">2 hours ago</p>
                    </div>
                </div>
                <button className="text-slate-500 hover:text-white transition-colors">
                    <MoreHorizontal size={20} />
                </button>
            </div>

            <div className="text-slate-300 mb-6 leading-relaxed">
                {content}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex gap-6">
                    <button className="flex items-center gap-2 text-slate-400 hover:text-[var(--neon-pink)] transition-colors group">
                        <Heart size={18} className="group-hover:fill-[var(--neon-pink)]" />
                        <span className="text-sm font-medium">{likes}</span>
                    </button>
                    <button className="flex items-center gap-2 text-slate-400 hover:text-[var(--neon-blue)] transition-colors">
                        <MessageCircle size={18} />
                        <span className="text-sm font-medium">{comments}</span>
                    </button>
                    <button className="flex items-center gap-2 text-slate-400 hover:text-[var(--neon-purple)] transition-colors">
                        <Share2 size={18} />
                        <span className="text-sm font-medium">Share</span>
                    </button>
                </div>
                <button className="text-slate-400 hover:text-white transition-colors">
                    <Bookmark size={18} />
                </button>
            </div>
        </div>
    );
}
