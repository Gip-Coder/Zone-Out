import React from 'react';
import { Users, UserPlus, Timer, BarChart3, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
    { icon: Users, label: 'Groups', active: true },
    { icon: UserPlus, label: 'Friends', active: false },
    { icon: Timer, label: 'Focus Sessions', active: false },
    { icon: BarChart3, label: 'Analytics', active: false },
];

const Sidebar = () => {
    return (
        <div className="flex flex-col h-full w-full p-6">
            <div className="flex items-center gap-3 mb-10 px-2 lg:justify-start justify-center">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--neon-purple)] to-[var(--neon-pink)] flex items-center justify-center shadow-lg neon-glow-purple shrink-0">
                    <span className="font-bold text-white text-xl">Z</span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-white neon-text-purple hidden lg:block">ZoneOut</h1>
            </div>

            <nav className="flex-1 space-y-3">
                {navItems.map((item) => (
                    <motion.button
                        key={item.label}
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${item.active
                                ? 'bg-white/10 text-white border border-white/10 shadow-lg'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <item.icon size={20} className={`shrink-0 ${item.active ? 'text-[var(--neon-purple)]' : ''}`} />
                        <span className="font-medium hidden lg:block">{item.label}</span>
                    </motion.button>
                ))}
            </nav>

            <div className="mt-auto pt-6 border-t border-white/5">
                <button className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                    <LogOut size={20} className="shrink-0" />
                    <span className="font-medium hidden lg:block">Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
