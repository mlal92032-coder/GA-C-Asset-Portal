'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Eye, EyeOff, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  {
    id: 1,
    title: 'Asset Management',
    description: 'Track and manage all your assets efficiently',
    icon: '📊',
    logo: '/logo1.png'
  },
  {
    id: 2,
    title: 'Real-time Updates',
    description: 'Live tracking with instant notifications',
    icon: '⚡',
    logo: '/logo2.png'
  },
  {
    id: 3,
    title: 'Secure & Reliable',
    description: 'Enterprise-grade security for your data',
    icon: '🔒',
    logo: '/logo1.png'
  },
  {
    id: 4,
    title: 'Analytics Dashboard',
    description: 'Powerful insights and detailed reports',
    icon: '📈',
    logo: '/logo2.png'
  }
];

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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error || 'Login failed');
      } else if (result?.ok) {
        localStorage.setItem('rememberedEmail', email);
        router.push('/dashboard');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const currentSlideData = slides[currentSlide];

  return (
    <div className="min-h-screen w-full flex overflow-hidden">
      {/* Left Side - Blue Background with Carousel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 flex-col items-center justify-center p-8 relative">
        {/* Animated Background Orbs */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <motion.div
            animate={{
              x: [0, 100, 0],
              y: [0, 50, 0],
            }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute -top-40 -left-40 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl"
          />
          <motion.div
            animate={{
              x: [0, -100, 0],
              y: [0, 100, 0],
            }}
            transition={{ duration: 12, repeat: Infinity, delay: 2 }}
            className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl"
          />
        </div>

        {/* Carousel Content */}
        <div className="w-full max-w-md relative z-10">
          {/* Carousel Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, rotateY: 90, scale: 0.8 }}
              animate={{ opacity: 1, rotateY: 0, scale: 1 }}
              exit={{ opacity: 0, rotateY: -90, scale: 0.8 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="relative"
            >
              <motion.div
                className="bg-white/20 backdrop-blur-xl rounded-3xl p-12 border border-white/40 shadow-2xl relative overflow-hidden min-h-96 flex flex-col items-center justify-center"
                whileHover={{ scale: 1.05 }}
              >
                {/* Animated background pattern */}
                <motion.div
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{ duration: 20, repeat: Infinity, linear: true }}
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: 'radial-gradient(circle at 20% 50%, transparent 20%, white 100%)',
                  }}
                />


                {/* Content */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="text-8xl mb-6 relative z-10"
                >
                  {currentSlideData.icon}
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="text-4xl font-bold mb-4 text-center relative z-10 text-white"
                >
                  {currentSlideData.title}
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="text-lg text-white/90 text-center relative z-10"
                >
                  {currentSlideData.description}
                </motion.p>

                {/* Glow effect */}
                <motion.div
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute inset-0 rounded-3xl"
                  style={{
                    boxShadow: '0 0 50px rgba(255, 255, 255, 0.2) inset',
                  }}
                />
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="flex items-center justify-center gap-4 mt-12">
            {/* Previous Button */}
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={handlePrevSlide}
              className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md border border-white/40 text-white flex items-center justify-center hover:bg-white/30 transition-all shadow-lg"
            >
              <ChevronLeft className="w-6 h-6" />
            </motion.button>

            {/* Slide Indicators */}
            <div className="flex gap-3">
              {slides.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  animate={{
                    scale: currentSlide === index ? 1.2 : 1,
                    opacity: currentSlide === index ? 1 : 0.5,
                  }}
                  className={`w-3 h-3 rounded-full transition-all ${
                    currentSlide === index ? 'bg-white' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>

            {/* Next Button */}
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleNextSlide}
              className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md border border-white/40 text-white flex items-center justify-center hover:bg-white/30 transition-all shadow-lg"
            >
              <ChevronRight className="w-6 h-6" />
            </motion.button>
          </div>

          {/* Slide counter */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-8 text-white/60"
          >
            {currentSlide + 1} / {slides.length}
          </motion.div>
        </div>
      </div>

      {/* Right Side - White Background with Login Form */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 bg-white relative"
      >
        <div className="w-full max-w-md">
          {/* Header with Logos and Organization Info */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-10 text-center"
          >
            {/* Logos */}
            <div className="flex items-center justify-center gap-8 mb-10">
              <div className="w-24 h-24 relative">
                <Image
                  src="/logo1.png"
                  alt="Logo 1"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="w-24 h-24 relative">
                <Image
                  src="/logo2.png"
                  alt="Logo 2"
                  fill
                  className="object-contain"
                />
              </div>
            </div>

            {/* Organization Info */}
            <p className="text-base font-black text-gray-900 mb-2">Sindh Education Foundation</p>
            <p className="text-sm font-bold text-gray-800 mb-3">Government of Sindh</p>

            <div className="relative mb-4">
              <p className="text-sm font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-3">
                GA&C Asset Portal Professional
              </p>
              <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
            </div>
          </motion.div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6"
              >
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-center gap-3 backdrop-blur-sm">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@company.com"
                required
                disabled={loading}
                autoComplete="email"
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-400
                           focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all
                           disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-400"
              />
            </motion.div>

            {/* Password Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  autoComplete="current-password"
                  className="w-full px-4 py-3 pr-12 bg-gray-50 border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-400
                             focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all
                             disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </motion.div>

            {/* Sign In Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="pt-4"
            >
              <motion.button
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-lg
                           hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all
                           shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </motion.button>
            </motion.div>
          </form>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-8 pt-8 border-t border-gray-200 text-center text-xs text-gray-600"
          >
            <p>
              Need help?{' '}
              <a href="mailto:support@assetmanagement.com" className="text-blue-600 hover:text-blue-700 font-semibold">
                support@assetmanagement.com
              </a>
            </p>
          </motion.div>

          {/* Security badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-600"
          >
            <span>🔒</span>
            <span>Secure SSL Connection</span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
