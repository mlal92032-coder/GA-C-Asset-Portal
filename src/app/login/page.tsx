'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Eye, EyeOff, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) setEmail(savedEmail);
  }, []);

  const slides = [
    {
      id: 1,
      title: 'Learn & Grow',
      description: 'Empower your institution with intelligent asset management',
      icon: 'student'
    },
    {
      id: 2,
      title: 'Secure Systems',
      description: 'Enterprise-grade security protecting your valuable resources',
      icon: 'shield'
    },
    {
      id: 3,
      title: 'Smart Technology',
      description: 'Advanced tools designed for modern educational institutions',
      icon: 'tech'
    },
    {
      id: 4,
      title: 'Team Collaboration',
      description: 'Work together efficiently across your entire organization',
      icon: 'team'
    }
  ];

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await signIn('credentials', { email, password, redirect: false });
      if (result?.error) {
        setError(result.error);
      } else if (result?.ok) {
        localStorage.setItem('rememberedEmail', email);
        await new Promise(resolve => setTimeout(resolve, 500)); // Brief delay to ensure session is set
        router.push('/dashboard');
      }
    } catch { setError('An unexpected error occurred.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen w-full flex overflow-hidden">
      {/* Left Side - Carousel Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="hidden lg:flex w-1/2 relative items-center justify-center p-8 bg-gradient-to-br from-blue-600 to-blue-800 flex-col"
      >
        {/* Carousel Content */}
        <div className="w-full max-w-md relative">
          {/* Carousel Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 0.85, rotateY: 60 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.85, rotateY: -60 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative w-full"
              style={{ perspective: 2500, transformStyle: "preserve-3d" }}
            >
              <div
                className="bg-white rounded-3xl shadow-2xl border border-white/30 overflow-hidden relative"
                style={{
                  boxShadow: '0 30px 60px rgba(0, 0, 0, 0.2), 0 0 100px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255,255,255,0.8)',
                  background: 'linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(240, 249, 255, 0.98) 100%)'
                }}
              >
                {/* Animated Background Gradient */}
                <motion.div
                  animate={{
                    background: [
                      'linear-gradient(0deg, rgba(59,130,246,0.05) 0%, transparent 100%)',
                      'linear-gradient(180deg, rgba(99,102,241,0.05) 0%, transparent 100%)',
                      'linear-gradient(0deg, rgba(59,130,246,0.05) 0%, transparent 100%)'
                    ]
                  }}
                  transition={{ duration: 6, repeat: Infinity }}
                  className="absolute inset-0 pointer-events-none"
                />

                {/* Slide Visualization */}
                <motion.div
                  className="w-full h-96 flex items-center justify-center relative bg-gradient-to-br from-blue-50/80 via-indigo-50/60 to-cyan-50/80 p-8"
                  initial={{ rotateX: 25, opacity: 0 }}
                  animate={{ rotateX: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.7 }}
                  style={{ perspective: 1500, transformStyle: 'preserve-3d' }}
                >
                  <div className="text-center">
                    <motion.div
                      animate={{
                        y: [0, -20, 0],
                        rotate: [0, 8, -8, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="text-8xl mb-6 drop-shadow-lg"
                    >
                      {slides[currentSlide].icon === 'student' && '📚'}
                      {slides[currentSlide].icon === 'shield' && '🛡️'}
                      {slides[currentSlide].icon === 'tech' && '💻'}
                      {slides[currentSlide].icon === 'team' && '🤝'}
                    </motion.div>
                  </div>
                </motion.div>

                {/* Slide Text */}
                <motion.div
                  className="text-center px-8 py-8 relative z-10"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  <motion.h2
                    className="text-4xl font-black text-transparent bg-clip-text mb-3"
                    style={{
                      backgroundImage: 'linear-gradient(135deg, #1E40AF 0%, #2563EB 50%, #6366F1 100%)',
                      letterSpacing: '-0.5px'
                    }}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.45, duration: 0.5 }}
                  >
                    {slides[currentSlide].title}
                  </motion.h2>
                  <motion.p
                    className="text-gray-600 text-base font-semibold leading-relaxed tracking-wide"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                  >
                    {slides[currentSlide].description}
                  </motion.p>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-center gap-4 mt-8">
            {/* Left Arrow Button */}
            <motion.button
              whileHover={{ scale: 1.12, boxShadow: '0 10px 30px rgba(255,255,255,0.4)' }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePrevSlide}
              className="w-12 h-12 rounded-full bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-md border border-white/70 text-white
                         flex items-center justify-center hover:from-white/50 hover:to-white/30 transition-all duration-300 shadow-xl"
            >
              <ChevronLeft className="w-6 h-6 font-bold" />
            </motion.button>

            {/* Slide Indicators */}
            <div className="flex gap-3">
              {slides.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  animate={{
                    scale: currentSlide === index ? 1.4 : 1,
                    backgroundColor: currentSlide === index ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.5)'
                  }}
                  transition={{ duration: 0.3 }}
                  className="w-3 h-3 rounded-full shadow-lg"
                />
              ))}
            </div>

            {/* Right Arrow Button */}
            <motion.button
              whileHover={{ scale: 1.12, boxShadow: '0 10px 30px rgba(255,255,255,0.4)' }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNextSlide}
              className="w-12 h-12 rounded-full bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-md border border-white/70 text-white
                         flex items-center justify-center hover:from-white/50 hover:to-white/30 transition-all duration-300 shadow-xl"
            >
              <ChevronRight className="w-6 h-6 font-bold" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Right Side - Welcome & Login Form */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="w-full lg:w-1/2 bg-white flex flex-col items-center justify-center p-8 sm:p-16 relative overflow-hidden"
      >

        <div className="w-full max-w-md relative z-10">
          {/* Logo Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.0, delay: 0.1, ease: "easeOut" }}
            style={{ perspective: 3000, transformStyle: 'preserve-3d' }}
            className="mb-12 flex gap-14 items-center justify-center relative w-full"
          >
            {/* Professional Background Glow */}
            <motion.div
              animate={{
                opacity: [0.12, 0.2, 0.12],
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 blur-3xl bg-gradient-to-r from-blue-500/25 via-indigo-500/15 to-blue-500/25 rounded-full -z-10"
              style={{ width: '380px', height: '150px', left: '50%', transform: 'translateX(-50%)' }}
            />

            {/* SEF Logo Container */}
            <motion.div
              initial={{ opacity: 0, x: -40, rotateY: -60 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ duration: 1.0, delay: 0.2, ease: "easeOut" }}
              whileHover={{ y: -12, boxShadow: '0 25px 60px rgba(59, 130, 246, 0.25)' }}
              style={{ perspective: 1600, transformStyle: 'preserve-3d' }}
              className="flex flex-col items-center"
            >
              <motion.div
                animate={{
                  rotateY: [0, 6, 0],
                  rotateX: [0, 3, 0],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                style={{ perspective: 1400, transformStyle: 'preserve-3d' }}
                className="w-36 h-36 bg-gradient-to-br from-white via-slate-50 to-slate-100 rounded-3xl p-5 flex items-center justify-center shadow-xl relative overflow-hidden group cursor-pointer"
              >
                {/* Professional Double Border */}
                <div className="absolute inset-0 rounded-3xl border border-slate-200/80" />
                <div className="absolute inset-1 rounded-3xl border border-slate-100/50 pointer-events-none" />

                {/* Sophisticated Depth Layer */}
                <motion.div
                  animate={{
                    opacity: [0.06, 0.12, 0.06],
                  }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 bg-gradient-to-br from-blue-600/8 via-transparent to-transparent rounded-3xl pointer-events-none"
                />

                <Image
                  src="/sef-logo.png"
                  alt="SEF Logo"
                  width={112}
                  height={112}
                  className="object-contain relative z-10 group-hover:scale-115 transition-transform duration-400"
                />

                {/* Refined Light Edge */}
                <div className="absolute inset-0 rounded-3xl border border-white/60 pointer-events-none" />
              </motion.div>
            </motion.div>

            {/* Enterprise Divider */}
            <motion.div
              initial={{ scaleY: 0, opacity: 0 }}
              animate={{ scaleY: 1, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.7, ease: "easeOut" }}
              className="flex flex-col items-center h-32"
            >
              <motion.div
                animate={{
                  opacity: [0.4, 0.65, 0.4],
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="w-0.5 h-28 bg-gradient-to-b from-slate-200 via-slate-400 to-slate-200 rounded-full"
              />
            </motion.div>

            {/* Sindh Government Logo Container */}
            <motion.div
              initial={{ opacity: 0, x: 40, rotateY: 60 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ duration: 1.0, delay: 0.25, ease: "easeOut" }}
              whileHover={{ y: -12, boxShadow: '0 25px 60px rgba(59, 130, 246, 0.25)' }}
              style={{ perspective: 1600, transformStyle: 'preserve-3d' }}
              className="flex flex-col items-center"
            >
              <motion.div
                animate={{
                  rotateY: [0, -6, 0],
                  rotateX: [0, -3, 0],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                style={{ perspective: 1400, transformStyle: 'preserve-3d' }}
                className="w-36 h-36 bg-gradient-to-br from-white via-slate-50 to-slate-100 rounded-3xl p-5 flex items-center justify-center shadow-xl relative overflow-hidden group cursor-pointer"
              >
                {/* Professional Double Border */}
                <div className="absolute inset-0 rounded-3xl border border-slate-200/80" />
                <div className="absolute inset-1 rounded-3xl border border-slate-100/50 pointer-events-none" />

                {/* Sophisticated Depth Layer */}
                <motion.div
                  animate={{
                    opacity: [0.06, 0.12, 0.06],
                  }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
                  className="absolute inset-0 bg-gradient-to-br from-green-600/8 via-transparent to-transparent rounded-3xl pointer-events-none"
                />

                <Image
                  src="/sindh-logo.png"
                  alt="Sindh Government Logo"
                  width={112}
                  height={112}
                  className="object-contain relative z-10 group-hover:scale-115 transition-transform duration-400"
                />

                {/* Refined Light Edge */}
                <div className="absolute inset-0 rounded-3xl border border-white/60 pointer-events-none" />
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Welcome Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-10 text-center"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-3 leading-tight whitespace-nowrap">
              Sindh Education Foundation
            </h1>
            <div className="mb-6">
              <p className="text-lg font-semibold text-gray-600 mb-2">Government of Sindh</p>
              <p className="text-2xl font-bold text-blue-700">GA&C Asset Portal</p>
            </div>
          </motion.div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6"
              >
                <div className="flex items-center gap-2.5 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                disabled={loading}
                autoComplete="off"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500
                           focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200
                           disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </motion.div>

            {/* Password Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45, duration: 0.5 }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  autoComplete="new-password"
                  className="w-full px-4 py-3 pr-10 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500
                             focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200
                             disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </motion.div>

            {/* Sign In Button */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.5 }}
              className="pt-4"
            >
              <motion.button
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 bg-blue-600 text-white font-bold text-base rounded-lg
                           transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed
                           hover:bg-blue-700 shadow-lg hover:shadow-xl
                           flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </motion.button>
            </motion.div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
