import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ListTodo, Book, Timer, Music, Bot, ArrowRight, Zap, Calendar, TrendingUp } from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext';
import Card from '../Components/Card';
import Button from '../Components/Button';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const features = [
    {
      icon: Zap,
      title: 'Focus Timer',
      description: 'Boost productivity with Pomodoro-style focus sessions.',
      href: '/timer',
      color: 'var(--accent-tertiary)',
      gradient: isDark ? 'from-blue-500 to-cyan-500' : 'from-green-400 to-emerald-500',
    },
    {
      icon: ListTodo,
      title: 'Study Goals',
      description: 'Track and manage your learning objectives.',
      href: '/timeline',
      color: 'var(--accent-primary)',
      gradient: isDark ? 'from-indigo-500 to-blue-500' : 'from-green-500 to-teal-500',
    },
    {
      icon: Book,
      title: 'Course Vault',
      description: 'Organize notes, modules, and course materials.',
      href: '/course-vault',
      color: 'var(--accent-secondary)',
      gradient: isDark ? 'from-pink-500 to-rose-500' : 'from-green-600 to-emerald-600',
    },
    {
      icon: Music,
      title: 'Focus Music',
      description: 'Curated playlists to enhance concentration.',
      href: '/music',
      color: 'var(--accent-primary)',
      gradient: isDark ? 'from-purple-500 to-pink-500' : 'from-green-500 to-teal-500',
    },
    {
      icon: Bot,
      title: 'AI Assistant',
      description: 'Get instant help with Study Buddy chatbot.',
      href: '/ai',
      color: 'var(--accent-secondary)',
      gradient: isDark ? 'from-indigo-500 to-pink-500' : 'from-green-600 to-emerald-500',
    },
    {
      icon: TrendingUp,
      title: 'Progress',
      description: 'Monitor your study progress and achievements.',
      href: '/progress',
      color: 'var(--accent-success)',
      gradient: isDark ? 'from-green-500 to-cyan-500' : 'from-green-500 to-emerald-500',
    },
  ];

  return (
    <motion.div
      className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gradient-to-br from-slate-900 via-slate-800' : 'bg-gradient-to-br from-white to-green-50'}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-16"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <h1
            className={`text-5xl font-bold mb-4 text-balance ${
              isDark
                ? 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400'
                : 'text-gray-900'
            }`}
          >
            Welcome Back, Scholar
          </h1>
          <p className="text-xl text-gray-500 dark:text-gray-300 mb-8">
            Your AI-powered study companion awaits. Let's make today productive.
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-12">
            <Card variant={isDark ? 'glass' : 'light-glass'} className="p-4 text-center">
              <div className="text-2xl font-bold text-green-500">47</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Hours Studied</div>
            </Card>
            <Card variant={isDark ? 'glass' : 'light-glass'} className="p-4 text-center">
              <div className="text-2xl font-bold text-indigo-500">12</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Goals Active</div>
            </Card>
            <Card variant={isDark ? 'glass' : 'light-glass'} className="p-4 text-center">
              <div className="text-2xl font-bold text-cyan-500">89%</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Completion</div>
            </Card>
          </div>
        </motion.div>

        {/* Feature Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div key={index} variants={itemVariants}>
                <Link to={feature.href} className="h-full block">
                  <Card
                    variant={isDark ? 'glass' : 'light-glass'}
                    interactive
                    className={`h-full p-6 flex flex-col ${isDark ? 'hover:border-indigo-500/50' : 'hover:border-green-300'}`}
                  >
                    <div
                      className={`w-14 h-14 rounded-xl mb-4 flex items-center justify-center bg-gradient-to-br ${feature.gradient} shadow-lg mb-4`}
                    >
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className={`text-sm flex-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {feature.description}
                    </p>
                    <div className="flex items-center gap-2 mt-4 text-sm font-semibold text-indigo-500 dark:text-green-500">
                      Explore <ArrowRight className="w-4 h-4" />
                    </div>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          className={`mt-16 p-8 rounded-3xl text-center ${isDark ? 'bg-gradient-to-r from-indigo-900/30 to-blue-900/30 border border-indigo-500/20' : 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200'}`}
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-2xl font-bold mb-4">Ready to Ace Your Studies?</h2>
          <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Start a focus session now and unlock your full potential.
          </p>
          <Link to="/timer">
            <Button variant="primary" size="lg">
              <Zap className="w-5 h-5" />
              Start Focus Timer
            </Button>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}

const pageStyle = { padding: '32px', maxWidth: '1000px', margin: '0 auto' };
const titleStyle = { fontSize: '28px', fontWeight: '700', marginBottom: '8px' };
const subStyle = { color: 'var(--text-secondary)', marginBottom: '28px' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' };
const cardStyle = {
  background: 'var(--bg-secondary)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 'var(--radius-lg)',
  padding: '24px',
  textDecoration: 'none',
  color: 'inherit',
  transition: 'transform 0.2s, box-shadow 0.2s',
};
const linkStyle = { display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--accent-primary)', fontSize: '14px', marginTop: '8px' };
