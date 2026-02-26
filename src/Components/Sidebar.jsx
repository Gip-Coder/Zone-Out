import React, { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  ListTodo,
  Book,
  Timer,
  Music,
  MessageSquare,
  FileText,
  BarChart3,
  Users,
  Settings,
  Menu,
  X,
} from 'lucide-react';

export default function Sidebar() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
    { icon: ListTodo, label: 'Goals', href: '/timeline' },
    { icon: Book, label: 'Courses', href: '/course-vault' },
    { icon: Timer, label: 'Timer', href: '/timer' },
    { icon: Music, label: 'Music', href: '/music' },
    { icon: MessageSquare, label: 'AI Chat', href: '/ai' },
    { icon: FileText, label: 'Notes', href: '/flashcards' },
    { icon: BarChart3, label: 'Progress', href: '/progress' },
    { icon: Users, label: 'Groups', href: '/study-groups' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ];

  const isActive = (href) => location.pathname === href;

  const containerVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { staggerChildren: 0.05, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <>
      {/* Mobile Menu Toggle */}
      <div className={`lg:hidden fixed top-4 left-4 z-50 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 hover:bg-white/10 rounded-lg">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <motion.aside
        className={`fixed left-0 top-0 h-screen w-64 lg:w-72 transform transition-transform lg:translate-x-0 z-40 ${
          isDark ? 'bg-gradient-to-b from-slate-900 to-slate-800 border-r border-white/10' : 'bg-white border-r border-gray-200'
        } ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        initial={false}
        animate={{ x: isOpen || window.innerWidth >= 1024 ? 0 : -300 }}
        transition={{ type: 'tween', duration: 0.3 }}
      >
        <motion.div className="flex flex-col h-full p-6" variants={containerVariants} initial="hidden" animate="visible">
          {/* Logo */}
          <motion.div variants={itemVariants} className="mb-12">
            <Link to="/" className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg bg-gradient-to-br ${isDark ? 'from-indigo-500 to-blue-500' : 'from-green-500 to-emerald-500'} flex items-center justify-center text-white font-bold`}
              >
                Z
              </div>
              <span className="text-xl font-bold">ZoneOut</span>
            </Link>
          </motion.div>

          {/* Menu Items */}
          <motion.nav className="flex-1 space-y-2" variants={containerVariants} initial="hidden" animate="visible">
            {menuItems.map((item, idx) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <motion.div key={idx} variants={itemVariants}>
                  <Link
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      active
                        ? isDark
                          ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                          : 'bg-green-100 text-green-700 border border-green-300'
                        : isDark
                          ? 'text-gray-400 hover:text-white hover:bg-white/10'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </motion.div>
              );
            })}
          </motion.nav>

          {/* Footer */}
          <motion.div variants={itemVariants} className="pt-6 border-t border-white/10 dark:border-gray-700">
            <button
              onClick={toggleTheme}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                isDark
                  ? 'bg-white/10 text-white hover:bg-white/20'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
            >
              {isDark ? '☀️' : '🌙'} {isDark ? 'Light Mode' : 'Dark Mode'}
            </button>
          </motion.div>
        </motion.div>
      </motion.aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 lg:hidden z-30"
          onClick={() => setIsOpen(false)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}
    </>
  );
}
