'use client';

import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useState } from 'react';

interface PieData {
  name: string;
  value: number;
  color: string;
}

interface PieChart3DProps {
  data: PieData[];
  title?: string;
  height?: number;
}

export default function PieChart3D({ data, title, height = 400 }: PieChart3DProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const handleMouseEnter = (index: number) => {
    setActiveIndex(index);
  };

  const handleMouseLeave = () => {
    setActiveIndex(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, type: 'spring' }}
      style={{
        perspective: 1200,
        transformStyle: 'preserve-3d',
      }}
      className="relative w-full"
    >
      {/* 3D Container with Shadow */}
      <div
        className="relative bg-white rounded-xl p-6 overflow-hidden"
        style={{
          boxShadow: `
            0 0 0 1px rgba(59, 130, 246, 0.1),
            0 10px 30px rgba(59, 130, 246, 0.15),
            0 20px 40px rgba(0, 0, 0, 0.1)
          `,
          transform: 'translateZ(0)',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Top Light Effect */}
        <div
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"
          style={{ transform: 'translateZ(20px)' }}
        />

        {/* Title */}
        {title && (
          <motion.h3
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg font-bold text-gray-900 mb-4"
          >
            {title}
          </motion.h3>
        )}

        {/* Chart Container */}
        <div className="relative" style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  borderRadius: '8px',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
                  backdropFilter: 'blur(10px)',
                }}
                formatter={(value) => `${value}`}
              />
              <Legend
                wrapperStyle={{
                  paddingTop: '20px',
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '16px',
                }}
                iconType="circle"
              />
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                animationBegin={0}
                animationDuration={800}
                animationEasing="ease-out"
                onMouseEnter={(_, index) => handleMouseEnter(index)}
                onMouseLeave={handleMouseLeave}
              >
                {data.map((entry, index) => (
                  <motion.g
                    key={`cell-${index}`}
                    animate={{
                      scale: activeIndex === index ? 1.1 : 1,
                      filter: activeIndex !== null && activeIndex !== index
                        ? 'brightness(0.7)'
                        : 'brightness(1)',
                    }}
                    transition={{ duration: 0.2 }}
                    style={{ transformOrigin: '50% 50%' }}
                  >
                    <Cell
                      fill={entry.color}
                      style={{
                        filter: `drop-shadow(${activeIndex === index ? '0 0 15px rgba(0, 0, 0, 0.3)' : '0 2px 5px rgba(0, 0, 0, 0.1)'})`,
                        cursor: 'pointer',
                        transition: 'filter 0.2s ease',
                      }}
                    />
                  </motion.g>
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bottom Shine Effect */}
        <div
          className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-200/20 to-transparent"
          style={{ transform: 'translateZ(10px)' }}
        />

        {/* Data Summary */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 grid grid-cols-2 gap-4 pt-4 border-t border-gray-100"
        >
          {data.map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.05, x: 5 }}
              className="p-3 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100"
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm font-medium text-gray-700">{item.name}</span>
              </div>
              <p className="text-lg font-bold text-gray-900">{item.value}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
