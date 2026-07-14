// Charts and Analytics Data Service

export interface ChartData {
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
    borderColor?: string
    backgroundColor?: string
    fill?: boolean
    tension?: number
  }>
}

export interface PieChartData {
  labels: string[]
  datasets: Array<{
    data: number[]
    backgroundColor: string[]
    borderColor: string[]
  }>
}

export class ChartsService {
  // Asset status distribution chart
  static getAssetStatusChart(
    inUse: number,
    inStore: number,
    disposed: number,
    auction: number,
  ): PieChartData {
    return {
      labels: ['In Use', 'In Store', 'Disposed', 'Auction'],
      datasets: [
        {
          data: [inUse, inStore, disposed, auction],
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)', // blue-500
            'rgba(34, 197, 94, 0.8)', // green-500
            'rgba(107, 114, 128, 0.8)', // gray-500
            'rgba(234, 179, 8, 0.8)', // yellow-500
          ],
          borderColor: [
            'rgb(59, 130, 246)',
            'rgb(34, 197, 94)',
            'rgb(107, 114, 128)',
            'rgb(234, 179, 8)',
          ],
        },
      ],
    }
  }

  // Asset condition chart
  static getAssetConditionChart(good: number, repair: number, damaged: number): PieChartData {
    return {
      labels: ['Good', 'Needs Repair', 'Damaged'],
      datasets: [
        {
          data: [good, repair, damaged],
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)', // green
            'rgba(234, 179, 8, 0.8)', // yellow
            'rgba(239, 68, 68, 0.8)', // red
          ],
          borderColor: ['rgb(34, 197, 94)', 'rgb(234, 179, 8)', 'rgb(239, 68, 68)'],
        },
      ],
    }
  }

  // Asset type distribution
  static getAssetTypeChart(
    furniture: number,
    electronics: number,
    vehicles: number,
  ): PieChartData {
    return {
      labels: ['Furniture', 'Electronics', 'Vehicles'],
      datasets: [
        {
          data: [furniture, electronics, vehicles],
          backgroundColor: [
            'rgba(139, 92, 246, 0.8)', // violet
            'rgba(34, 197, 94, 0.8)', // green
            'rgba(59, 130, 246, 0.8)', // blue
          ],
          borderColor: ['rgb(139, 92, 246)', 'rgb(34, 197, 94)', 'rgb(59, 130, 246)'],
        },
      ],
    }
  }

  // Checkout trends (line chart)
  static getCheckoutTrends(data: Array<{ date: string; checkouts: number; returns: number }>): ChartData {
    return {
      labels: data.map(d => d.date),
      datasets: [
        {
          label: 'Checkouts',
          data: data.map(d => d.checkouts),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Returns',
          data: data.map(d => d.returns),
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          fill: true,
          tension: 0.4,
        },
      ],
    }
  }

  // Depreciation forecast chart
  static getDepreciationChart(
    years: number[],
    values: number[],
    assetName: string,
  ): ChartData {
    return {
      labels: years.map(y => `Year ${y}`),
      datasets: [
        {
          label: `${assetName} Depreciation`,
          data: values,
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          fill: true,
          tension: 0.4,
        },
      ],
    }
  }

  // Cost analysis chart
  static getCostAnalysisChart(
    furnitureSpent: number,
    electronicsSpent: number,
    vehiclesSpent: number,
  ): ChartData {
    return {
      labels: ['Furniture', 'Electronics', 'Vehicles'],
      datasets: [
        {
          label: 'Total Cost',
          data: [furnitureSpent, electronicsSpent, vehiclesSpent],
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: [
            'rgba(139, 92, 246, 0.8)',
            'rgba(34, 197, 94, 0.8)',
            'rgba(59, 130, 246, 0.8)',
          ],
          fill: false,
        },
      ],
    }
  }

  // ROI chart
  static getROIChart(
    data: Array<{ asset: string; purchasePrice: number; currentValue: number }>,
  ): ChartData {
    return {
      labels: data.map(d => d.asset),
      datasets: [
        {
          label: 'Purchase Price',
          data: data.map(d => d.purchasePrice),
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgb(59, 130, 246)',
          fill: false,
        },
        {
          label: 'Current Value',
          data: data.map(d => d.currentValue),
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgb(34, 197, 94)',
          fill: false,
        },
      ],
    }
  }

  // Utilization chart
  static getUtilizationChart(
    assetName: string,
    data: Array<{ month: string; usage: number }>,
  ): ChartData {
    return {
      labels: data.map(d => d.month),
      datasets: [
        {
          label: `${assetName} Utilization %`,
          data: data.map(d => d.usage),
          borderColor: 'rgb(139, 92, 246)',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          fill: true,
          tension: 0.4,
        },
      ],
    }
  }

  // Format large numbers for display
  static formatNumber(num: number): string {
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
      return `$${(num / 1000).toFixed(1)}K`
    }
    return `$${num.toFixed(0)}`
  }

  // Calculate percentage change
  static calculatePercentageChange(previous: number, current: number): number {
    if (previous === 0) return 0
    return ((current - previous) / previous) * 100
  }
}
