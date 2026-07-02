'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface StatCard3DProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  delay?: number;
}

export default function StatCard3D({
  title,
  value,
  icon,
  color,
  trend,
  delay = 0,
}: StatCard3DProps) {
  const gradientMap = {
    blue: 'from-blue-50/70 to-blue-100/40 border-blue-200/50',
    green: 'from-green-50/70 to-green-100/40 border-green-200/50',
    purple: 'from-purple-50/70 to-purple-100/40 border-purple-200/50',
    red: 'from-red-50/70 to-red-100/40 border-red-200/50',
    yellow: 'from-yellow-50/70 to-yellow-100/40 border-yellow-200/50',
    indigo: 'from-indigo-50/70 to-indigo-100/40 border-indigo-200/50',
  };

  const colorClass = gradientMap[color as keyof typeof gradientMap] || gradientMap.blue;

  return (
    <motion.div
      initial={{ opacity: 0, rotateX: 90, rotateY: 20, y: 30 }}
      animate={{ opacity: 1, rotateX: 0, rotateY: 0, y: 0 }}
      transition={{
        duration: 0.7,
        delay,
        type: 'spring',
        stiffness: 100,
        damping: 20,
      }}
      whileHover={{
        rotateX: 8,
        rotateY: -8,
        scale: 1.03,
        y: -8,
      }}
      style={{
        perspective: 1200,
        transformStyle: 'preserve-3d',
      }}
      className="relative"
    >
      <div className="relative group">
        {/* 3D Shadow layers */}
        <div className="absolute -inset-2 bg-gradient-to-br from-black/20 to-black/5 rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute -inset-1 bg-gradient-to-br from-black/10 to-black/0 rounded-2xl blur-xl opacity-0 group-hover:opacity-75 transition-opacity duration-500" />

        {/* Main Card */}
        <div
          className={`relative bg-gradient-to-br ${colorClass} border backdrop-blur-xl rounded-2xl p-6 overflow-hidden`}
          style={{
            boxShadow: `
              0 0 0 1px rgba(255,255,255,0.2) inset,
              0 10px 30px rgba(0,0,0,0.1),
              0 0 20px ${color === 'blue' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(0, 0, 0, 0.1)'}
            `,
            transform: 'translateZ(0)',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Top light effect */}
          <div
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
            style={{ transform: 'translateZ(10px)' }}
          />

          {/* Content container */}
          <div className="relative z-10 flex justify-between items-start">
            {/* Left side - Text */}
            <div className="flex-1">
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: delay + 0.2 }}
                className="text-sm font-medium text-gray-700 mb-2"
              >
                {title}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: delay + 0.3, type: 'spring', stiffness: 120 }}
                className="flex items-baseline gap-2"
              >
                <span className="text-4xl font-black text-gray-900">{value}</span>

                {/* Trend indicator */}
                {trend && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: delay + 0.4, type: 'spring' }}
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
                      trend.isPositive
                        ? 'bg-green-100/80 text-green-700'
                        : 'bg-red-100/80 text-red-700'
                    }`}
                  >
                    <span>{trend.isPositive ? '↑' : '↓'}</span>
                    <span>{Math.abs(trend.value)}%</span>
                  </motion.div>
                )}
              </motion.div>
            </div>

            {/* Right side - Icon */}
            <motion.div
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              transition={{ delay: delay + 0.2, type: 'spring' }}
              whileHover={{
                rotate: 20,
                scale: 1.2,
              }}
              style={{
                perspective: 1200,
                transformStyle: 'preserve-3d',
              }}
              className={`p-4 rounded-xl bg-gradient-to-br ${colorClass} text-3xl`}
            >
              {icon}

              {/* Icon shine effect */}
              <div
                className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ transform: 'translateZ(5px)' }}
              />
            </motion.div>
          </div>

          {/* Animated background gradient */}
          <motion.div
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100"
            style={{
              backgroundSize: '200% 200%',
              transform: 'translateZ(-5px)',
            }}
          />

          {/* Bottom shine */}
          <div
            className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
            style={{ transform: 'translateZ(5px)' }}
          />
        </div>
      </div>
    </motion.div>
  );
}
