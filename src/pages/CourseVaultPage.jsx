import React, { useContext, useState } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import NotesSection from '../Components/NotesSection';
import Card from '../Components/Card';
import Button from '../Components/Button';
import { motion } from 'framer-motion';
import { BookOpen, Plus, Search, Filter, TrendingUp, Clock } from 'lucide-react';

export default function CourseVaultPage({
  courses,
  setCourses,
  activeCourseId,
  setActiveCourseId,
}) {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState('all');

  const sampleCourses = [
    { id: 1, title: 'Advanced Calculus', progress: 75, modules: 12, color: 'from-blue-500 to-cyan-500' },
    { id: 2, title: 'Quantum Physics', progress: 60, modules: 8, color: 'from-purple-500 to-pink-500' },
    { id: 3, title: 'Data Science 101', progress: 85, modules: 15, color: 'from-indigo-500 to-blue-500' },
    { id: 4, title: 'Web Development', progress: 45, modules: 20, color: 'from-green-500 to-emerald-500' },
  ];

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

  return (
    <motion.div
      className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gradient-to-br from-slate-900 via-slate-800' : 'bg-gradient-to-br from-white to-green-50'}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div className="mb-12" variants={itemVariants} initial="hidden" animate="visible">
          <h1 className="text-5xl font-bold mb-4">Course Vault</h1>
          <p className={`text-xl mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Your learning library. Courses, modules, notes, and materials.
          </p>

          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border outline-none transition-all ${
                  isDark
                    ? 'bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-indigo-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-green-500'
                }`}
              />
            </div>
            <Button variant="secondary">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
            <Button variant="primary">
              <Plus className="w-4 h-4" />
              Add Course
            </Button>
          </div>
        </motion.div>

        {/* Courses Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {sampleCourses.map((course, idx) => (
            <motion.div key={course.id} variants={itemVariants}>
              <Card variant={isDark ? 'glass' : 'light-glass'} interactive className="h-full overflow-hidden">
                {/* Header with Color */}
                <div className={`h-24 bg-gradient-to-br ${course.color} opacity-90`} />

                <div className="p-6">
                  <h3 className="font-bold text-lg mb-4 -mt-12 relative">
                    <span className={`flex items-center gap-2`}>
                      <span className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br ${course.color} text-white`}>
                        <BookOpen className="w-5 h-5" />
                      </span>
                      {course.title}
                    </span>
                  </h3>

                  <div className="space-y-4">
                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Progress</span>
                        <span className={`text-sm font-semibold ${isDark ? 'text-indigo-400' : 'text-green-600'}`}>
                          {course.progress}%
                        </span>
                      </div>
                      <div className={`w-full h-2 rounded-full ${isDark ? 'bg-white/10' : 'bg-gray-200'} overflow-hidden`}>
                        <motion.div
                          className={`h-full bg-gradient-to-r ${course.color}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${course.progress}%` }}
                          transition={{ duration: 1, delay: idx * 0.1 }}
                        />
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-sm">
                        <BookOpen className={`w-4 h-4 ${isDark ? 'text-indigo-400' : 'text-green-600'}`} />
                        <span>{course.modules} modules</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-green-600'}`} />
                        <span>12 hrs</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Sections */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6">Your Courses</h2>
            <NotesSection
              courses={courses || []}
              setCourses={setCourses || (() => {})}
              activeCourseId={activeCourseId}
              setActiveCourseId={setActiveCourseId ?? (() => {})}
            />
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div variants={itemVariants} initial="hidden" animate="visible">
          <h2 className="text-2xl font-bold mb-6">Learning Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: 'Total Courses', value: '8', icon: BookOpen, color: 'indigo' },
              { label: 'Hours Studied', value: '120+', icon: Clock, color: 'cyan' },
              { label: 'Avg Progress', value: '66%', icon: TrendingUp, color: 'green' },
              { label: 'Certificates', value: '3', icon: BookOpen, color: 'pink' },
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <Card key={idx} variant={isDark ? 'glass' : 'light-glass'} className="p-6 text-center">
                  <Icon className={`w-8 h-8 mx-auto mb-4 text-${stat.color}-500`} />
                  <div className="text-3xl font-bold mb-2">{stat.value}</div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{stat.label}</p>
                </Card>
              );
            })}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
