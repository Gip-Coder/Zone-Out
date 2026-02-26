import React, { useContext, useState } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import MusicPlayer from '../Components/MusicPlayer';
import Card from '../Components/Card';
import Button from '../Components/Button';
import { motion } from 'framer-motion';
import { Music, Play, Pause, Volume2, Radio, Headphones } from 'lucide-react';

export default function MusicPage() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const [selectedPlaylist, setSelectedPlaylist] = useState('focus');
  const [isPlaying, setIsPlaying] = useState(false);

  const playlists = [
    {
      id: 'focus',
      name: 'Deep Focus',
      description: 'Ambient music for maximum concentration',
      duration: '∞',
      tracks: 47,
      icon: '🎹',
      gradient: isDark ? 'from-indigo-500 to-blue-500' : 'from-green-400 to-emerald-500',
    },
    {
      id: 'lofi',
      name: 'Lofi Hip Hop',
      description: 'Chill beats for studying',
      duration: '∞',
      tracks: 53,
      icon: '🎧',
      gradient: isDark ? 'from-pink-500 to-rose-500' : 'from-green-500 to-teal-500',
    },
    {
      id: 'jazz',
      name: 'Jazz Classics',
      description: 'Smooth jazz for productive work',
      duration: '∞',
      tracks: 38,
      icon: '🎷',
      gradient: isDark ? 'from-cyan-500 to-blue-500' : 'from-green-600 to-emerald-600',
    },
    {
      id: 'nature',
      name: 'Nature Sounds',
      description: 'Rain, forest, and ocean ambience',
      duration: '∞',
      tracks: 25,
      icon: '🌿',
      gradient: isDark ? 'from-green-500 to-teal-500' : 'from-green-500 to-cyan-500',
    },
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div className="text-center mb-12" variants={itemVariants} initial="hidden" animate="visible">
          <h1 className="text-5xl font-bold mb-4">Focus Music</h1>
          <p className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Curated playlists to enhance your focus
          </p>
        </motion.div>

        <motion.div className="grid grid-cols-1 lg:grid-cols-3 gap-8" variants={containerVariants} initial="hidden" animate="visible">
          {/* Now Playing / Music Player */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <div className={`relative h-96 rounded-3xl overflow-hidden mb-8 ${isDark ? 'bg-gradient-to-br from-indigo-900 to-blue-900' : 'bg-gradient-to-br from-green-400 to-emerald-500'}`}>
              {/* Animated Background */}
              <div className="absolute inset-0 opacity-30">
                <motion.div
                  className="absolute w-96 h-96 rounded-full"
                  style={{ background: `${isDark ? 'radial-gradient(circle, #a78bfa, transparent)' : 'radial-gradient(circle, rgba(255,255,255,0.3), transparent)'}` }}
                  animate={{
                    x: [0, 100, 0],
                    y: [0, 50, 0],
                  }}
                  transition={{ duration: 15, repeat: Infinity }}
                />
              </div>

              {/* Content */}
              <div className="relative h-full flex flex-col items-center justify-center text-white p-8">
                <motion.div
                  className="w-48 h-48 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center mb-8"
                  animate={{ scale: isPlaying ? [1, 1.02, 1] : 1 }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Music className="w-20 h-20" />
                </motion.div>
                <h2 className="text-3xl font-bold mb-2">{playlists.find((p) => p.id === selectedPlaylist)?.name}</h2>
                <p className="text-white/70 mb-8">{playlists.find((p) => p.id === selectedPlaylist)?.description}</p>
                <Button onClick={() => setIsPlaying(!isPlaying)} variant="primary" size="lg">
                  {isPlaying ? (
                    <>
                      <Pause className="w-5 h-5" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      Play
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Mini Player */}
            <Card variant={isDark ? 'glass' : 'light-glass'} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${playlists.find((p) => p.id === selectedPlaylist)?.gradient} flex items-center justify-center text-2xl`}>
                    {playlists.find((p) => p.id === selectedPlaylist)?.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold">{playlists.find((p) => p.id === selectedPlaylist)?.name}</h3>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {playlists.find((p) => p.id === selectedPlaylist)?.tracks} tracks
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="secondary" size="sm">
                    <Volume2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className={`w-full h-2 rounded-full ${isDark ? 'bg-white/10' : 'bg-gray-200'} overflow-hidden`}>
                  <motion.div
                    className={`h-full bg-gradient-to-r ${playlists.find((p) => p.id === selectedPlaylist)?.gradient}`}
                    animate={{ width: isPlaying ? '65%' : '0%' }}
                    transition={{ duration: 10, repeat: Infinity }}
                  />
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Playlist Sidebar */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className="text-lg font-bold mb-4">Playlists</h3>
            {playlists.map((playlist) => (
              <motion.button
                key={playlist.id}
                onClick={() => setSelectedPlaylist(playlist.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  variant={isDark ? 'glass' : 'light-glass'}
                  interactive
                  className={`p-4 text-left ${
                    selectedPlaylist === playlist.id
                      ? isDark
                        ? 'ring-2 ring-indigo-500 bg-indigo-500/10'
                        : 'ring-2 ring-green-500 bg-green-50'
                      : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{playlist.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate">{playlist.name}</h4>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{playlist.tracks} tracks</p>
                    </div>
                  </div>
                </Card>
              </motion.button>
            ))}
          </motion.div>
        </motion.div>

        {/* The Existing Music Player */}
        <motion.div variants={itemVariants} initial="hidden" animate="visible" className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Music Player</h2>
          <Card variant={isDark ? 'glass' : 'light-glass'} className="p-8">
            <MusicPlayer />
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
