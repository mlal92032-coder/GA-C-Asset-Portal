'use client';

import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useState } from 'react';

interface BarData {
  name: string;
  value: number;
  [key: string]: string | number;
}

interface BarChart3DProps {
  data: BarData[];
  title?: string;
  dataKey?: string;
  color?: string;
  height?: number;
}

export default function BarChart3D({
  data,
  title,
  dataKey = 'value',
  color = '#3B82F6',
  height = 400
}: BarChart3DProps) {
  const [activeBar, setActiveBar] = useState<number | null>(null);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        type: 'spring',
        stiffness: 80,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{
        perspective: 1200,
        transformStyle: 'preserve-3d',
      }}
      className="relative w-full"
    >
      {/* 3D Container */}
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
        {/* Top Light */}
        <div
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"
          style={{ transform: 'translateZ(20px)' }}
        />

        {/* Title */}
        {title && (
          <motion.h3
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg font-bold text-gray-900 mb-4"
          >
            {title}
          </motion.h3>
        )}

        {/* Chart */}
        <div style={{ height }} className="relative">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.9} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.6} />
                </linearGradient>
                <filter id="barShadow">
                  <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.3" />
                </filter>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(59, 130, 246, 0.1)"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={{ fill: '#6B7280', fontSize: 12 }}
                axisLine={{ stroke: 'rgba(59, 130, 246, 0.1)' }}
              />
              <YAxis
                tick={{ fill: '#6B7280', fontSize: 12 }}
                axisLine={{ stroke: 'rgba(59, 130, 246, 0.1)' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '2px solid #3B82F6',
                  borderRadius: '8px',
                  boxShadow: '0 15px 40px rgba(59, 130, 246, 0.3)',
                  backdropFilter: 'blur(10px)',
                }}
                cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
              />
              <Legend
                wrapperStyle={{
                  paddingTop: '20px',
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '16px',
                }}
              />
              <Bar
                dataKey={dataKey}
                fill="url(#barGradient)"
                radius={[8, 8, 0, 0]}
                filter="url(#barShadow)"
                animationDuration={800}
                onMouseEnter={(_, index) => setActiveBar(index)}
                onMouseLeave={() => setActiveBar(null)}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Stats Summary */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 pt-4 border-t border-gray-100 grid grid-cols-3 gap-4"
        >
          {[
            {
              label: 'Total',
              value: data.reduce((sum, item) => sum + (item[dataKey] as number), 0),
            },
            {
              label: 'Average',
              value: Math.round(
                data.reduce((sum, item) => sum + (item[dataKey] as number), 0) / data.length
              ),
            },
            {
              label: 'Peak',
              value: Math.max(...data.map(item => item[dataKey] as number)),
            },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.05 }}
              className="p-3 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 text-center"
            >
              <p className="text-xs text-gray-600 mb-1">{stat.label}</p>
              <p className="text-lg font-bold text-blue-600">{stat.value}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom Shine */}
        <div
          className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-200/20 to-transparent"
          style={{ transform: 'translateZ(10px)' }}
        />
      </div>
    </motion.div>
  );
}
