'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import axios from 'axios'
import { Button } from '@/components/ui'
import { toast } from 'sonner'
import { Loader2, Download, Trash2, Plus, Calendar, FileText, TrendingUp } from 'lucide-react'

const reportTypes = [
  { value: 'inventory', label: 'Asset Inventory Report', description: 'Complete asset listing with QR codes and values' },
  { value: 'maintenance', label: 'Maintenance Report', description: 'Maintenance history and cost tracking' },
  { value: 'financial', label: 'Financial Report', description: 'Asset values, depreciation, and financial summary' },
  { value: 'checkout', label: 'Checkout Report', description: 'Asset checkout analytics and overdue tracking' },
]

const reportStatuses = [
  { value: 'IN_USE', label: 'In Use' },
  { value: 'IN_STORE', label: 'In Store' },
  { value: 'DISPOSED', label: 'Disposed' },
  { value: 'AUCTION', label: 'Auction' },
]

const reportConditions = [
  { value: 'GOOD', label: 'Good' },
  { value: 'REPAIR', label: 'Repair' },
  { value: 'DAMAGED', label: 'Damaged' },
]

// Validation Schema
const ReportFormSchema = z.object({
  name: z.string().min(1, 'Report name is required').max(255),
  reportType: z.enum(['inventory', 'maintenance', 'financial', 'checkout']),
  status: z.string().optional(),
  condition: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  schedule: z.string().optional(),
})

type ReportFormData = z.infer<typeof ReportFormSchema>

interface ReportTemplate {
  id: string
  reportName: string
  reportType: string
  description?: string
  schedule?: string
  isScheduled: boolean
  createdAt: string
  updatedAt: string
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('generate')
  const [templates, setTemplates] = useState<ReportTemplate[]>([])
  const [loading, setLoading] = useState(false)
  const [generatingReport, setGeneratingReport] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ReportFormData>({
    resolver: zodResolver(ReportFormSchema),
    defaultValues: {
      name: '',
      reportType: 'inventory',
      status: undefined,
      condition: undefined,
      startDate: undefined,
      endDate: undefined,
      schedule: undefined,
    },
  })

  const reportType = watch('reportType')

  // Fetch templates on component mount
  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/reports/templates')
      setTemplates(response.data.data || [])
    } catch (error) {
      toast.error('Failed to load report templates')
      console.error('Error fetching templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const onGenerateReport = async (data: ReportFormData) => {
    try {
      setGeneratingReport(true)

      const filters: any = {}
      if (data.status) filters.status = data.status
      if (data.condition) filters.condition = data.condition
      if (data.startDate) filters.startDate = new Date(data.startDate).toISOString()
      if (data.endDate) filters.endDate = new Date(data.endDate).toISOString()

      const response = await axios.post(
        '/api/reports/generate',
        {
          reportType: data.reportType,
          filters,
        },
        {
          responseType: 'blob',
        },
      )

      // Create download link
      const url = window.URL.createObjectURL(response.data)
      const link = document.createElement('a')
      link.href = url
      link.download = `${data.reportType}-report-${Date.now()}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success('Report generated and downloaded successfully')
    } catch (error) {
      console.error('Error generating report:', error)
      toast.error('Failed to generate report')
    } finally {
      setGeneratingReport(false)
    }
  }

  const onSaveTemplate = async (data: ReportFormData) => {
    try {
      setLoading(true)

      const filters: any = {}
      if (data.status) filters.status = data.status
      if (data.condition) filters.condition = data.condition

      await axios.post('/api/reports/templates', {
        name: data.name,
        type: data.reportType,
        filters,
        schedule: data.schedule,
        metrics: [],
      })

      toast.success('Report template saved successfully')
      reset()
      fetchTemplates()
      setActiveTab('saved')
    } catch (error) {
      console.error('Error saving template:', error)
      toast.error('Failed to save report template')
    } finally {
      setLoading(false)
    }
  }

  const deleteTemplate = async (templateId: string) => {
    try {
      setDeletingId(templateId)
      await axios.delete(`/api/reports/templates/${templateId}`)
      toast.success('Report template deleted successfully')
      fetchTemplates()
    } catch (error) {
      console.error('Error deleting template:', error)
      toast.error('Failed to delete report template')
    } finally {
      setDeletingId(null)
    }
  }

  const generateFromTemplate = async (template: ReportTemplate) => {
    try {
      setGeneratingReport(true)

      const response = await axios.post(
        '/api/reports/generate',
        {
          reportType: template.reportType,
          filters: {},
        },
        {
          responseType: 'blob',
        },
      )

      const url = window.URL.createObjectURL(response.data)
      const link = document.createElement('a')
      link.href = url
      link.download = `${template.reportType}-report-${Date.now()}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success('Report generated from template')
    } catch (error) {
      console.error('Error generating report from template:', error)
      toast.error('Failed to generate report')
    } finally {
      setGeneratingReport(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-2">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold">Reports</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Generate and manage asset reports</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-2 border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('generate')}
              className={`px-4 py-1 font-medium border-b-2 transition-colors ${
                activeTab === 'generate'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Generate Report
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`px-4 py-1 font-medium border-b-2 transition-colors ${
                activeTab === 'saved'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Saved Templates ({templates.length})
            </button>
          </div>
        </div>

        {/* Generate Report Tab */}
        {activeTab === 'generate' && (
          <div className="space-y-2">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-2">Create New Report</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Generate a custom report with filters applied
              </p>

              <form onSubmit={handleSubmit(onGenerateReport)} className="space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Report Name
                    </label>
                    <input
                      {...register('name')}
                      placeholder="e.g., September Asset Inventory"
                      className="w-full px-4 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Report Type *
                    </label>
                    <select
                      {...register('reportType')}
                      className="w-full px-4 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {reportTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Conditional filters based on report type */}
                {['inventory', 'checkout'].includes(reportType) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Status
                      </label>
                      <select
                        {...register('status')}
                        className="w-full px-4 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">All statuses</option>
                        {reportStatuses.map(status => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Condition
                      </label>
                      <select
                        {...register('condition')}
                        className="w-full px-4 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">All conditions</option>
                        {reportConditions.map(cond => (
                          <option key={cond.value} value={cond.value}>
                            {cond.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {['maintenance', 'financial'].includes(reportType) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Start Date
                      </label>
                      <input
                        {...register('startDate')}
                        type="date"
                        className="w-full px-4 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        End Date
                      </label>
                      <input
                        {...register('endDate')}
                        type="date"
                        className="w-full px-4 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Schedule (Optional)
                  </label>
                  <select
                    {...register('schedule')}
                    className="w-full px-4 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Don't schedule</option>
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                  </select>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={generatingReport || loading}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700"
                  >
                    {generatingReport && <Loader2 className="h-4 w-4 animate-spin" />}
                    <Download className="h-4 w-4" />
                    Generate & Download PDF
                  </Button>

                  <Button
                    type="button"
                    onClick={handleSubmit(onSaveTemplate)}
                    disabled={loading || !watch('name')}
                    className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="h-4 w-4" />
                    Save as Template
                  </Button>
                </div>
              </form>
            </div>

            {/* Quick Report Types */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reportTypes.map(type => (
                <div
                  key={type.value}
                  className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{type.label}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{type.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Saved Templates Tab */}
        {activeTab === 'saved' && (
          <div className="space-y-2">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            ) : templates.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 dark:text-gray-400 mb-2">No saved report templates yet</p>
                <Button
                  onClick={() => setActiveTab('generate')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Create First Template
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map(template => (
                  <div
                    key={template.id}
                    className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
                  >
                    <div className="mb-2">
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                        {template.reportName}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {reportTypes.find(t => t.value === template.reportType)?.label}
                      </p>
                    </div>

                    {template.isScheduled && (
                      <div className="flex items-center gap-1.5 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded mb-2">
                        <Calendar className="h-4 w-4" />
                        Scheduled: {template.schedule}
                      </div>
                    )}

                    <div className="flex gap-1.5">
                      <Button
                        onClick={() => generateFromTemplate(template)}
                        disabled={generatingReport}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700"
                        size="sm"
                      >
                        {generatingReport && <Loader2 className="h-3 w-3 animate-spin" />}
                        <Download className="h-4 w-4" />
                        Generate
                      </Button>

                      <Button
                        onClick={() => deleteTemplate(template.id)}
                        disabled={deletingId === template.id}
                        className="bg-red-600 hover:bg-red-700"
                        size="sm"
                      >
                        {deletingId === template.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                      Created: {new Date(template.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

