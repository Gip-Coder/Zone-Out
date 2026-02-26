import React, { useContext, useState } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import Timer from '../Components/Timer';
import Card from '../Components/Card';
import Button from '../Components/Button';
import { motion } from 'framer-motion';
import { Clock, Zap, Target } from 'lucide-react';

export default function FocusTimerPage({ focusTime, setFocusTime, isFocusRunning, setIsFocusRunning, onSessionComplete }) {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const [sessionHistory, setSessionHistory] = useState([
    { duration: 25, completed: true, date: 'Today, 2:30 PM' },
    { duration: 25, completed: true, date: 'Today, 1:00 PM' },
    { duration: 50, completed: false, date: 'Yesterday, 10:30 AM' },
  ]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const motivationalQuotes = [
    "The mind grows by what it feeds on - Let's feed it knowledge.",
    "You've got this! Focus leads to success.",
    "Every minute of focus brings you closer to your goals.",
    "Stay in the zone - distractions are temporary, growth is forever.",
  ];

  const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

  return (
    <motion.div
      className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gradient-to-br from-slate-900 via-slate-800' : 'bg-gradient-to-br from-white to-green-50'}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div className="text-center mb-12" variants={itemVariants} initial="hidden" animate="visible">
          <h1 className="text-5xl font-bold mb-4">Focus Timer</h1>
          <p className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Lock in and boost your productivity
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Main Timer */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card variant={isDark ? 'glass' : 'light-glass'} className="p-12 text-center">
              <div className="flex justify-center mb-8">
                <Timer
                  focusTime={focusTime}
                  setFocusTime={setFocusTime}
                  isRunning={isFocusRunning}
                  setIsRunning={setIsFocusRunning}
                  onSessionComplete={onSessionComplete}
                />
              </div>

              {/* Motivational Quote */}
              <motion.div
                className={`p-6 rounded-xl mb-6 border ${isDark ? 'bg-indigo-900/20 border-indigo-500/30' : 'bg-green-50 border-green-200'}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <p className={`text-lg italic ${isDark ? 'text-indigo-300' : 'text-green-700'}`}>
                  "{randomQuote}"
                </p>
              </motion.div>

              {/* Quick Presets */}
              <div className="flex gap-3 flex-wrap justify-center">
                <Button onClick={() => setFocusTime(5 * 60)} variant="secondary" size="sm">
                  5 min
                </Button>
                <Button onClick={() => setFocusTime(15 * 60)} variant="secondary" size="sm">
                  15 min
                </Button>
                <Button onClick={() => setFocusTime(25 * 60)} variant="secondary" size="sm">
                  25 min
                </Button>
                <Button onClick={() => setFocusTime(50 * 60)} variant="secondary" size="sm">
                  50 min
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Stats Sidebar */}
          <motion.div variants={itemVariants} className="space-y-4">
            <Card variant={isDark ? 'glass' : 'light-glass'} className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Zap className={`w-6 h-6 ${isDark ? 'text-indigo-400' : 'text-green-600'}`} />
                <h3 className="font-semibold">Today</h3>
              </div>
              <div className="text-3xl font-bold mb-2">120</div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>minutes focused</p>
            </Card>

            <Card variant={isDark ? 'glass' : 'light-glass'} className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Target className={`w-6 h-6 ${isDark ? 'text-cyan-400' : 'text-green-600'}`} />
                <h3 className="font-semibold">Streak</h3>
              </div>
              <div className="text-3xl font-bold mb-2">5</div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>days of focus</p>
            </Card>

            <Card variant={isDark ? 'glass' : 'light-glass'} className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Clock className={`w-6 h-6 ${isDark ? 'text-pink-400' : 'text-green-600'}`} />
                <h3 className="font-semibold">This Week</h3>
              </div>
              <div className="text-3xl font-bold mb-2">8.5</div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>hours studied</p>
            </Card>
          </motion.div>
        </motion.div>

        {/* Session History */}
        <motion.div variants={itemVariants} initial="hidden" animate="visible">
          <h2 className="text-2xl font-bold mb-6">Recent Sessions</h2>
          <Card variant={isDark ? 'glass' : 'light-glass'}>
            <div className="divide-y divide-white/10 dark:divide-gray-200">
              {sessionHistory.map((session, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Clock className={`w-5 h-5 ${session.completed ? 'text-green-500' : 'text-gray-400'}`} />
                    <div>
                      <div className="font-semibold">{session.duration} minutes</div>
                      <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{session.date}</div>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      session.completed
                        ? isDark
                          ? 'bg-green-900/30 text-green-300'
                          : 'bg-green-100 text-green-700'
                        : isDark
                          ? 'bg-gray-700/30 text-gray-400'
                          : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {session.completed ? 'Completed' : 'Paused'}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
