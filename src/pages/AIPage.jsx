import React, { useContext, useState, useRef, useEffect } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import Card from '../Components/Card';
import Button from '../Components/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, MessageSquare, Send, Zap, BookOpen, HelpCircle, Sparkles } from 'lucide-react';

export default function AIPage() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', text: 'Hi! I\'m your AI Study Buddy. Ask me anything about your subjects, and I\'ll help you learn faster.' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', text: input };
    setChatMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        'That\'s a great question! Let me break it down for you...',
        'I\'d recommend focusing on understanding the core concept first, then practice with examples.',
        'Here\'s a helpful tip: Create a mind map to visualize the connections between topics.',
        'Remember, consistent practice is key to mastering this topic!',
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      setChatMessages((prev) => [...prev, { role: 'assistant', text: randomResponse }]);
      setIsLoading(false);
    }, 1000);
  };

  const suggestedQuestions = [
    { icon: BookOpen, text: 'Explain quantum mechanics', category: 'Physics' },
    { icon: HelpCircle, text: 'How do I solve derivatives?', category: 'Calculus' },
    { icon: Sparkles, text: 'Study tips for exams', category: 'Productivity' },
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div className="text-center mb-12" variants={itemVariants} initial="hidden" animate="visible">
          <h1 className="text-5xl font-bold mb-4">AI Study Buddy</h1>
          <p className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Your intelligent learning companion, 24/7
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Chat Interface */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card variant={isDark ? 'glass' : 'light-glass'} className="h-[600px] flex flex-col overflow-hidden">
              {/* Chat Messages */}
              <div className={`flex-1 overflow-y-auto p-6 space-y-4 ${isDark ? 'bg-gradient-to-b from-slate-800/50' : 'bg-white/30'}`}>
                <AnimatePresence>
                  {chatMessages.map((msg, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-xl ${
                          msg.role === 'user'
                            ? isDark
                              ? 'bg-indigo-600/80 text-white'
                              : 'bg-green-500/90 text-white'
                            : isDark
                              ? 'bg-white/10 text-gray-100'
                              : 'bg-gray-200 text-gray-900'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isLoading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                    <div className={`px-4 py-3 rounded-xl ${isDark ? 'bg-white/10 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                      <div className="flex gap-2">
                        <div className="w-2 h-2 rounded-full bg-current animate-bounce" />
                        <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input Area */}
              <div className={`p-4 border-t ${isDark ? 'border-white/10 bg-slate-800/50' : 'border-gray-200 bg-white/50'}`}>
                <div className="flex gap-2">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask me anything..."
                    className={`flex-1 px-4 py-2 rounded-lg border outline-none transition-all ${
                      isDark
                        ? 'bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-indigo-500'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-green-500'
                    }`}
                  />
                  <Button onClick={handleSendMessage} variant="primary" size="md" disabled={!input.trim() || isLoading}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Sidebar */}
          <motion.div variants={itemVariants} className="space-y-6">
            {/* Features */}
            <Card variant={isDark ? 'glass' : 'light-glass'} className="p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Zap className={`w-5 h-5 ${isDark ? 'text-indigo-400' : 'text-green-600'}`} />
                Features
              </h3>
              <ul className={`space-y-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <li className="flex items-start gap-2">
                  <span className={`text-lg ${isDark ? 'text-indigo-400' : 'text-green-600'}`}>✓</span>
                  <span>Answer study questions instantly</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className={`text-lg ${isDark ? 'text-indigo-400' : 'text-green-600'}`}>✓</span>
                  <span>Explain complex topics simply</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className={`text-lg ${isDark ? 'text-indigo-400' : 'text-green-600'}`}>✓</span>
                  <span>Provide study tips & resources</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className={`text-lg ${isDark ? 'text-indigo-400' : 'text-green-600'}`}>✓</span>
                  <span>Generate practice questions</span>
                </li>
              </ul>
            </Card>

            {/* Suggested Questions */}
            <div>
              <h3 className="font-bold mb-3">Try asking:</h3>
              <div className="space-y-2">
                {suggestedQuestions.map((q, idx) => {
                  const Icon = q.icon;
                  return (
                    <motion.button
                      key={idx}
                      onClick={() => setInput(q.text)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full p-3 rounded-lg border text-left transition-all ${
                        isDark
                          ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-indigo-500/50'
                          : 'bg-white/50 border-gray-200 hover:bg-white/70 hover:border-green-400'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <Icon className={`w-4 h-4 mt-1 flex-shrink-0 ${isDark ? 'text-indigo-400' : 'text-green-600'}`} />
                        <div>
                          <div className="text-sm font-medium">{q.text}</div>
                          <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{q.category}</div>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
