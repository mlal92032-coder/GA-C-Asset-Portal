'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { ChartsService } from '@/services/charts.service'
import { Package } from 'lucide-react'

interface Props {
  data: {
    inUse: number
    inStore: number
    disposed: number
    auction: number
  }
}

const COLORS = ['#3b82f6', '#22c55e', '#6b7280', '#eab308']

export const AssetDistributionChart = ({ data }: Props) => {
  const [chartData, setChartData] = useState<any>(null)

  useEffect(() => {
    const chart = ChartsService.getAssetStatusChart(
      data.inUse,
      data.inStore,
      data.disposed,
      data.auction,
    )
    setChartData(chart.datasets[0].data)
  }, [data])

  if (!chartData) return <div className="animate-pulse h-96 bg-gray-200 rounded" />

  const pieData = [
    { name: 'In Use', value: data.inUse },
    { name: 'In Store', value: data.inStore },
    { name: 'Disposed', value: data.disposed },
    { name: 'Auction', value: data.auction },
  ]

  const total = data.inUse + data.inStore + data.disposed + data.auction

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center gap-2 mb-6">
        <Package size={24} className="text-blue-500" />
        <h3 className="text-xl font-semibold text-gray-900">Asset Distribution</h3>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value, percent }) => (
              <text fontSize={12} fill="#666">
                {name}: {value} ({(percent * 100).toFixed(0)}%)
              </text>
            )}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {pieData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [`${value} assets`, 'Count']}
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="text-center p-3 bg-blue-50 rounded">
          <p className="text-2xl font-bold text-blue-600">{data.inUse}</p>
          <p className="text-xs text-gray-600 mt-1">In Use</p>
          <p className="text-xs font-semibold text-gray-700">
            {total > 0 ? ((data.inUse / total) * 100).toFixed(0) : 0}%
          </p>
        </div>

        <div className="text-center p-3 bg-green-50 rounded">
          <p className="text-2xl font-bold text-green-600">{data.inStore}</p>
          <p className="text-xs text-gray-600 mt-1">In Store</p>
          <p className="text-xs font-semibold text-gray-700">
            {total > 0 ? ((data.inStore / total) * 100).toFixed(0) : 0}%
          </p>
        </div>

        <div className="text-center p-3 bg-gray-50 rounded">
          <p className="text-2xl font-bold text-gray-600">{data.disposed}</p>
          <p className="text-xs text-gray-600 mt-1">Disposed</p>
          <p className="text-xs font-semibold text-gray-700">
            {total > 0 ? ((data.disposed / total) * 100).toFixed(0) : 0}%
          </p>
        </div>

        <div className="text-center p-3 bg-yellow-50 rounded">
          <p className="text-2xl font-bold text-yellow-600">{data.auction}</p>
          <p className="text-xs text-gray-600 mt-1">Auction</p>
          <p className="text-xs font-semibold text-gray-700">
            {total > 0 ? ((data.auction / total) * 100).toFixed(0) : 0}%
          </p>
        </div>
      </div>
    </motion.div>
  )
}
