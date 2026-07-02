'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface Card3DProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  hoverable?: boolean;
  color?: 'blue' | 'green' | 'purple' | 'indigo';
}

export default function Card3D({
  children,
  className = '',
  delay = 0,
  hoverable = true,
  color = 'blue'
}: Card3DProps) {
  const colorStyles = {
    blue: 'bg-gradient-to-br from-blue-50/50 to-blue-50/30 border-blue-100',
    green: 'bg-gradient-to-br from-green-50/50 to-green-50/30 border-green-100',
    purple: 'bg-gradient-to-br from-purple-50/50 to-purple-50/30 border-purple-100',
    indigo: 'bg-gradient-to-br from-indigo-50/50 to-indigo-50/30 border-indigo-100',
  };

  return (
    <motion.div
      initial={{ opacity: 0, rotateX: 90, y: 20 }}
      animate={{ opacity: 1, rotateX: 0, y: 0 }}
      transition={{ duration: 0.5, delay, type: 'spring', stiffness: 100 }}
      whileHover={hoverable ? {
        rotateX: 4,
        rotateY: -4,
        scale: 1.01,
        y: -3,
        boxShadow: '0 12px 35px rgba(59, 130, 246, 0.2)'
      } : {}}
      style={{
        perspective: 1200,
        transformStyle: 'preserve-3d'
      }}
      className={`relative ${className}`}
    >
      <div
        style={{
          transform: 'translateZ(0px)',
          transformStyle: 'preserve-3d',
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
        }}
        className={`w-full h-full rounded-lg border ${colorStyles[color]}`}
      >
        {/* 3D Top Light */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent rounded-t-lg"
             style={{ transform: 'translateZ(8px)' }} />

        {/* Main Content */}
        <div className="relative z-10">
          {children}
        </div>

        {/* 3D Bottom Shadow */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-200/20 to-transparent rounded-b-lg"
             style={{ transform: 'translateZ(2px)' }} />
      </div>
    </motion.div>
  );
}
