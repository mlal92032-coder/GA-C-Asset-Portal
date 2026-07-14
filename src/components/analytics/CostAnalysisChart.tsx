'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { DollarSign } from 'lucide-react'

interface CostData {
  category: string
  spent: number
  budget?: number
  percentage: number
}

interface Props {
  data: CostData[]
  totalBudget?: number
  totalSpent?: number
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export const CostAnalysisChart = ({ data, totalBudget = 0, totalSpent = 0 }: Props) => {
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    const formattedData = data.map(item => ({
      name: item.category,
      Spent: item.spent,
      Budget: item.budget || item.spent * 1.2,
      percentage: item.percentage,
    }))
    setChartData(formattedData)
  }, [data])

  if (chartData.length === 0)
    return <div className="animate-pulse h-96 bg-gray-200 rounded" />

  const variance = totalBudget - totalSpent
  const variancePercent = totalBudget > 0 ? (variance / totalBudget) * 100 : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center gap-2 mb-6">
        <DollarSign size={24} className="text-green-500" />
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Cost Analysis</h3>
          <p className="text-sm text-gray-600">Budget vs Actual Spending</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-3 bg-blue-50 rounded">
          <p className="text-xs text-gray-600">Total Budget</p>
          <p className="text-lg font-bold text-blue-600">${totalBudget.toLocaleString()}</p>
        </div>

        <div className="p-3 bg-green-50 rounded">
          <p className="text-xs text-gray-600">Total Spent</p>
          <p className="text-lg font-bold text-green-600">${totalSpent.toLocaleString()}</p>
        </div>

        <div
          className={`p-3 rounded ${variance >= 0 ? 'bg-green-50' : 'bg-red-50'}`}
        >
          <p className="text-xs text-gray-600">Variance</p>
          <p className={`text-lg font-bold ${variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${variance.toLocaleString()}
          </p>
        </div>

        <div className={`p-3 rounded ${variancePercent >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
          <p className="text-xs text-gray-600">Variance %</p>
          <p
            className={`text-lg font-bold ${variancePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}
          >
            {variancePercent.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis label={{ value: 'Amount ($)', angle: -90, position: 'insideLeft' }} />
          <Tooltip
            formatter={(value: number) => `$${value.toLocaleString()}`}
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
          />
          <Legend />
          <Bar dataKey="Spent" fill="#10b981" name="Actual Spent" />
          <Bar dataKey="Budget" fill="#3b82f6" name="Budget" />
        </BarChart>
      </ResponsiveContainer>

      {/* Category Breakdown */}
      <div className="mt-6">
        <h4 className="font-semibold text-gray-900 mb-3">Category Breakdown</h4>
        <div className="space-y-2">
          {data.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.category}</p>
                  <p className="text-xs text-gray-600">
                    ${item.spent.toLocaleString()} ({item.percentage.toFixed(1)}%)
                  </p>
                </div>
              </div>
              <div className="text-right">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.percentage}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-2 bg-gray-300 rounded mb-1"
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
