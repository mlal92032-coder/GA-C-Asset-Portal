'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { TrendingDown } from 'lucide-react'

interface Props {
  assetName: string
  purchasePrice: number
  salvageValue?: number
  usefulLife: number
  method: 'STRAIGHT_LINE' | 'DECLINING_BALANCE'
}

export const DepreciationChart = ({
  assetName,
  purchasePrice,
  salvageValue = 0,
  usefulLife,
  method,
}: Props) => {
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    const data = []
    for (let year = 0; year <= usefulLife; year++) {
      let value: number

      if (method === 'STRAIGHT_LINE') {
        const annualDepreciation = (purchasePrice - salvageValue) / usefulLife
        value = Math.max(salvageValue, purchasePrice - annualDepreciation * year)
      } else {
        // Declining balance
        const rate = 2 / usefulLife
        value = purchasePrice * Math.pow(1 - rate, year)
      }

      data.push({
        year,
        value: Math.max(salvageValue, value),
        formattedValue: `$${Math.max(salvageValue, value).toFixed(0)}`,
      })
    }
    setChartData(data)
  }, [purchasePrice, salvageValue, usefulLife, method])

  if (chartData.length === 0)
    return <div className="animate-pulse h-96 bg-gray-200 rounded" />

  const currentValue = chartData[0]?.value || purchasePrice
  const totalDepreciation = currentValue - (chartData[chartData.length - 1]?.value || salvageValue)
  const deprecationPercentage = (totalDepreciation / purchasePrice) * 100

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center gap-2 mb-6">
        <TrendingDown size={24} className="text-red-500" />
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Depreciation Forecast</h3>
          <p className="text-sm text-gray-600">{assetName}</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-3 bg-blue-50 rounded">
          <p className="text-xs text-gray-600">Purchase Price</p>
          <p className="text-xl font-bold text-blue-600">${purchasePrice.toLocaleString()}</p>
        </div>

        <div className="p-3 bg-red-50 rounded">
          <p className="text-xs text-gray-600">Salvage Value</p>
          <p className="text-xl font-bold text-red-600">${salvageValue.toLocaleString()}</p>
        </div>

        <div className="p-3 bg-orange-50 rounded">
          <p className="text-xs text-gray-600">Total Depreciation</p>
          <p className="text-xl font-bold text-orange-600">
            ${totalDepreciation.toLocaleString()}
          </p>
        </div>

        <div className="p-3 bg-purple-50 rounded">
          <p className="text-xs text-gray-600">Depreciation %</p>
          <p className="text-xl font-bold text-purple-600">{deprecationPercentage.toFixed(1)}%</p>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="year"
            label={{ value: 'Year', position: 'insideBottomRight', offset: -5 }}
          />
          <YAxis label={{ value: 'Value ($)', angle: -90, position: 'insideLeft' }} />
          <Tooltip
            formatter={(value: number) => `$${value.toFixed(0)}`}
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#ef4444"
            dot={false}
            name="Asset Value"
            strokeWidth={2}
          />
          <Line
            type="stepAfter"
            dataKey={() => salvageValue}
            stroke="#6b7280"
            strokeDasharray="5 5"
            name="Salvage Value"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Method Info */}
      <div className="mt-6 p-4 bg-gray-50 rounded">
        <p className="text-sm font-semibold text-gray-900">Depreciation Method</p>
        <p className="text-sm text-gray-600 mt-1">
          {method === 'STRAIGHT_LINE'
            ? `Straight-line: $${((purchasePrice - salvageValue) / usefulLife).toFixed(2)}/year`
            : `Declining Balance: ${((2 / usefulLife) * 100).toFixed(1)}% annual rate`}
        </p>
        <p className="text-xs text-gray-500 mt-2">Useful life: {usefulLife} years</p>
      </div>
    </motion.div>
  )
}
