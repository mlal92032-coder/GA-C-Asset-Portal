'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ReactNode } from 'react';

interface MenuItem {
  label: string;
  href: string;
  icon: ReactNode;
  badge?: number;
}

interface MenuBar3DProps {
  items: MenuItem[];
  activeItem?: string;
}

export default function MenuBar3D({ items, activeItem }: MenuBar3DProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20, rotateY: 90 },
    visible: {
      opacity: 1,
      x: 0,
      rotateY: 0,
      transition: { type: 'spring', stiffness: 100, damping: 20 },
    },
  };

  return (
    <motion.nav
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative"
      style={{ perspective: 1200 }}
    >
      <div className="flex flex-col gap-2">
        {items.map((item) => {
          const isActive = activeItem === item.label;

          return (
            <motion.div
              key={item.label}
              variants={itemVariants}
              whileHover={{
                rotateX: -5,
                rotateY: 10,
                scale: 1.05,
                x: 5,
                boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)',
              }}
              whileTap={{
                scale: 0.95,
              }}
              style={{
                transformStyle: 'preserve-3d',
              }}
            >
              <Link href={item.href}>
                <motion.div
                  className={`relative p-4 rounded-lg cursor-pointer transition-all duration-300 group overflow-hidden ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-white/10 text-gray-700 hover:bg-white/20'
                  }`}
                  style={{
                    perspective: 1200,
                    transformStyle: 'preserve-3d',
                  }}
                >
                  {/* 3D Top Light */}
                  <div
                    className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    style={{ transform: 'translateZ(10px)' }}
                  />

                  {/* Flex Container */}
                  <div className="flex items-center gap-3 relative z-10">
                    {/* Icon with 3D effect */}
                    <motion.div
                      whileHover={{ scale: 1.2, rotateZ: 15 }}
                      style={{ transformStyle: 'preserve-3d' }}
                      className="text-xl"
                    >
                      {item.icon}
                    </motion.div>

                    {/* Text */}
                    <span className="font-semibold text-sm">{item.label}</span>

                    {/* Badge with 3D */}
                    {item.badge !== undefined && (
                      <motion.span
                        initial={{ scale: 0, rotateZ: -180 }}
                        animate={{ scale: 1, rotateZ: 0 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                        className="ml-auto bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{
                          transform: 'translateZ(5px)',
                          boxShadow: '0 5px 15px rgba(239, 68, 68, 0.4)',
                        }}
                      >
                        {item.badge}
                      </motion.span>
                    )}
                  </div>

                  {/* 3D Depth shadow */}
                  <div
                    className="absolute inset-0 bg-black/10 rounded-lg"
                    style={{ transform: 'translateZ(-5px)' }}
                  />

                  {/* Hover gradient overlay */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ transform: 'translateZ(5px)' }}
                  />
                </motion.div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.nav>
  );
}
