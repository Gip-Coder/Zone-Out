import { TrendingUp, Book, Timer, Music, Bot } from 'lucide-react';

export const WIDGET_REGISTRY = {
    timeline: {
        id: "timeline",
        title: "Timeline",
        component: "TimelineWidget",
        icon: TrendingUp,
        defaultSize: "medium"
    },
    vault: {
        id: "vault",
        title: "Course Vault",
        component: "VaultWidget",
        icon: Book,
        defaultSize: "medium"
    },
    timer: {
        id: "timer",
        title: "Focus Timer",
        component: "TimerWidget",
        icon: Timer,
        defaultSize: "medium",
        desc: "Start a focus session with a customizable Pomodoro timer.",
        linkText: "Open Timer"
    },
    music: {
        id: "music",
        title: "Music",
        component: "MusicWidget",
        icon: Music,
        defaultSize: "medium",
        desc: "Listen to lo-fi beats and ambient sounds while you study.",
        linkText: "Open Music"
    },
    ai: {
        id: "ai",
        title: "AI Assistant",
        component: "AIWidget",
        icon: Bot,
        defaultSize: "medium",
        desc: "Chat with Study Buddy to control your timer, goals, and more.",
        linkText: "Open Chat"
    }
};

export const DEFAULT_LAYOUT = [
    { id: "timeline", order: 0, size: "medium" },
    { id: "vault", order: 1, size: "medium" },
    { id: "timer", order: 2, size: "medium" },
    { id: "music", order: 3, size: "medium" },
    { id: "ai", order: 4, size: "medium" }
];
