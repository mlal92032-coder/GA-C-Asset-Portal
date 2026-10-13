'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/DashboardLayout';
import PageHeader from '@/components/PageHeader';
import {
  Settings as SettingsIcon, Save, Package, Users, Database, Zap,
  CheckCircle, AlertCircle, QrCode, Download, FileSpreadsheet, Eye, EyeOff,
  Bell, Lock, Shield, Wrench, BarChart3, Plug, Upload, Copy, RefreshCw,
  HardDrive, Trash2, Calendar, TrendingUp, Key, LinkIcon, Cloud, FileJson,
  ToggleRight, ToggleLeft, ChevronRight, Menu, X, Loader2
} from 'lucide-react';

// ============= TYPES =============
interface AdvancedSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  notificationFrequency: 'realtime' | 'daily' | 'weekly';
  notificationCategories: {
    assetAlerts: boolean;
    userRequests: boolean;
    maintenanceAlerts: boolean;
    auditAlerts: boolean;
  };
  twoFactorAuth: boolean;
  sessionDuration: number;
  ipWhitelist: string;
  loginAttemptRestrictions: number;
  passwordMinLength: number;
  passwordComplexity: boolean;
  backupSchedule: 'daily' | 'weekly' | 'monthly';
  lastBackup: string;
  logRetentionDays: number;
  autoDepreciation: boolean;
  depreciationRate: number;
  assetLifecycleRules: 'standard' | 'accelerated' | 'custom';
  auditFrequency: 'monthly' | 'quarterly' | 'annually';
  checkoutLimitPerUser: number;
  defaultReportFormat: 'pdf' | 'excel' | 'csv';
  autoGenerateReports: boolean;
  reportSchedule: 'daily' | 'weekly' | 'monthly';
  dataRetentionMonths: number;
  analyticsRefreshRate: number;
  apiKeyMasked: string;
  webhookUrl: string;
  importFormatPreference: 'csv' | 'excel' | 'json';
  exportCompression: boolean;
  scheduledExports: boolean;
  scheduledExportFrequency: 'daily' | 'weekly' | 'monthly';
  cloudStorageEnabled: boolean;
  cloudStorageProvider: 'aws' | 'gcp' | 'azure' | 'none';
}

interface SettingsSection {
  id: string;
  icon: any;
  label: string;
  title: string;
  description: string;
  color: string;
  bgGradient: string;
}

// ============= SETTINGS SECTIONS =============
const SETTINGS_SECTIONS: SettingsSection[] = [
  {
    id: 'notifications',
    icon: Bell,
    label: 'Notifications',
    title: 'Notification Settings',
    description: 'Configure how and when you receive system notifications',
    color: 'from-blue-50 to-cyan-50',
    bgGradient: 'group-hover:from-blue-100 group-hover:to-cyan-100'
  },
  {
    id: 'security',
    icon: Lock,
    label: 'Security',
    title: 'Security Settings',
    description: 'Configure authentication, session management, and password policies',
    color: 'from-red-50 to-orange-50',
    bgGradient: 'group-hover:from-red-100 group-hover:to-orange-100'
  },
  {
    id: 'maintenance',
    icon: Wrench,
    label: 'System Maintenance',
    title: 'System Maintenance',
    description: 'Manage backups, database optimization, and log retention',
    color: 'from-yellow-50 to-amber-50',
    bgGradient: 'group-hover:from-yellow-100 group-hover:to-amber-100'
  },
  {
    id: 'assetRules',
    icon: Package,
    label: 'Asset Rules',
    title: 'Asset Management Rules',
    description: 'Configure depreciation, lifecycle rules, and audit policies',
    color: 'from-green-50 to-emerald-50',
    bgGradient: 'group-hover:from-green-100 group-hover:to-emerald-100'
  },
  {
    id: 'reporting',
    icon: BarChart3,
    label: 'Reporting',
    title: 'Reporting & Analytics',
    description: 'Configure report generation, formats, and data retention',
    color: 'from-violet-50 to-purple-50',
    bgGradient: 'group-hover:from-violet-100 group-hover:to-purple-100'
  },
  {
    id: 'integration',
    icon: Plug,
    label: 'Integrations',
    title: 'Integration Settings',
    description: 'Manage API keys, webhooks, and third-party connections',
    color: 'from-pink-50 to-rose-50',
    bgGradient: 'group-hover:from-pink-100 group-hover:to-rose-100'
  },
  {
    id: 'exportImport',
    icon: Upload,
    label: 'Export/Import',
    title: 'Export/Import Settings',
    description: 'Configure data export formats, compression, and cloud storage',
    color: 'from-indigo-50 to-blue-50',
    bgGradient: 'group-hover:from-indigo-100 group-hover:to-blue-100'
  },
  {
    id: 'general',
    icon: SettingsIcon,
    label: 'General',
    title: 'General Settings',
    description: 'Basic system configuration and organization settings',
    color: 'from-slate-50 to-gray-50',
    bgGradient: 'group-hover:from-slate-100 group-hover:to-gray-100'
  },
  {
    id: 'qrCode',
    icon: QrCode,
    label: 'QR Codes',
    title: 'QR Code Management',
    description: 'Download individual or bulk QR codes by category',
    color: 'from-cyan-50 to-blue-50',
    bgGradient: 'group-hover:from-cyan-100 group-hover:to-blue-100'
  },
  {
    id: 'dataExport',
    icon: FileSpreadsheet,
    label: 'Data Export',
    title: 'Data Export & Analysis',
    description: 'Export comprehensive data from all sources',
    color: 'from-emerald-50 to-green-50',
    bgGradient: 'group-hover:from-emerald-100 group-hover:to-green-100'
  },
];

// ============= MAIN COMPONENT =============
export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('general');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // General Settings
  const [settings, setSettings] = useState({
    siteName: 'Asset Management System',
    companyName: 'My Organization',
    supportEmail: 'support@company.com',
    supportPhone: '+92 300 1234567',
    timezone: 'Asia/Karachi',
    language: 'English',
    currency: 'PKR',
    sessionTimeout: 480,
    maxLoginAttempts: 5,
    autoGenerateAssetTag: true,
  });

  // Advanced Settings
  const [advancedSettings, setAdvancedSettings] = useState<AdvancedSettings>({
    emailNotifications: true,
    smsNotifications: false,
    notificationFrequency: 'realtime',
    notificationCategories: {
      assetAlerts: true,
      userRequests: true,
      maintenanceAlerts: true,
      auditAlerts: false,
    },
    twoFactorAuth: true,
    sessionDuration: 60,
    ipWhitelist: '',
    loginAttemptRestrictions: 5,
    passwordMinLength: 8,
    passwordComplexity: true,
    backupSchedule: 'daily',
    lastBackup: '2026-07-15 14:30:00',
    logRetentionDays: 90,
    autoDepreciation: true,
    depreciationRate: 15,
    assetLifecycleRules: 'standard',
    auditFrequency: 'quarterly',
    checkoutLimitPerUser: 5,
    defaultReportFormat: 'pdf',
    autoGenerateReports: false,
    reportSchedule: 'weekly',
    dataRetentionMonths: 24,
    analyticsRefreshRate: 5,
    apiKeyMasked: 'sk_live_••••••••••••••••••••••••',
    webhookUrl: '',
    importFormatPreference: 'excel',
    exportCompression: true,
    scheduledExports: false,
    scheduledExportFrequency: 'weekly',
    cloudStorageEnabled: false,
    cloudStorageProvider: 'none',
  });

  // QR Code Management
  const [qrCategory, setQrCategory] = useState<'all' | 'furniture' | 'electronics' | 'vehicles'>('all');
  const [qrDownloading, setQrDownloading] = useState(false);

  // Data Export
  const [exportRowCount, setExportRowCount] = useState(100);
  const [exportDataTypes, setExportDataTypes] = useState({
    assets: true,
    users: true,
    manufacturers: true,
    locations: true,
    offices: true,
    checkouts: false,
    maintenance: false,
    audits: false
  });
  const [exportColumns, setExportColumns] = useState({
    assetId: true,
    assetName: true,
    category: true,
    status: true,
    location: true,
    assignedTo: true,
    value: true,
    purchaseDate: true,
    condition: false,
    department: false,
    notes: false
  });
  const [exporting, setExporting] = useState(false);

  // ============= API HANDLERS =============
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setSettings(prev => ({ ...prev, ...data.data }));
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const handleSaveSettings = async (section?: string) => {
    setLoading(true);
    try {
      const payload = section === 'general'
        ? settings
        : { ...settings, ...advancedSettings };

      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setMessage({ text: 'Settings saved successfully!', type: 'success' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ text: 'Failed to save settings', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Error saving settings', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateApiKey = async () => {
    try {
      const res = await fetch('/api/settings/regenerate-api-key', {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setAdvancedSettings(prev => ({
          ...prev,
          apiKeyMasked: data.maskedKey
        }));
        setMessage({ text: 'API key regenerated successfully!', type: 'success' });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      setMessage({ text: 'Failed to regenerate API key', type: 'error' });
    }
  };

  const handleOptimizeDatabase = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings/optimize-database', {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        setMessage({ text: 'Database optimization completed!', type: 'success' });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      setMessage({ text: 'Database optimization failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleClearCache = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings/clear-cache', {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        setMessage({ text: 'Cache cleared successfully!', type: 'success' });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      setMessage({ text: 'Cache clearing failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings/test-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ webhookUrl: advancedSettings.webhookUrl })
      });
      if (res.ok) {
        setMessage({ text: 'Webhook connection test successful!', type: 'success' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ text: 'Webhook connection test failed', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Connection test error', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadBulkQrCodes = async () => {
    setQrDownloading(true);
    try {
      const res = await fetch('/api/export/qr-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ category: qrCategory })
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `qr-codes-${qrCategory}-${new Date().toISOString().split('T')[0]}.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        setMessage({ text: 'QR codes downloaded successfully!', type: 'success' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ text: 'Failed to download QR codes', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Error downloading QR codes', type: 'error' });
    } finally {
      setQrDownloading(false);
    }
  };

  const handleExportData = async () => {
    setExporting(true);
    try {
      const res = await fetch('/api/export/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          rows: exportRowCount,
          dataTypes: Object.keys(exportDataTypes).filter(k => exportDataTypes[k as keyof typeof exportDataTypes]),
          columns: Object.keys(exportColumns).filter(k => exportColumns[k as keyof typeof exportColumns])
        })
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `export-${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        setMessage({ text: 'Data exported successfully!', type: 'success' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ text: 'Failed to export data', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Error exporting data', type: 'error' });
    } finally {
      setExporting(false);
    }
  };

  // ============= SECTION RENDERERS =============
  const renderSection = () => {
    switch (activeSection) {
      case 'notifications':
        return <NotificationsSection settings={advancedSettings} setSettings={setAdvancedSettings} onSave={() => handleSaveSettings('notifications')} loading={loading} />;
      case 'security':
        return <SecuritySection settings={advancedSettings} setSettings={setAdvancedSettings} onSave={() => handleSaveSettings('security')} loading={loading} />;
      case 'maintenance':
        return <MaintenanceSection settings={advancedSettings} setSettings={setAdvancedSettings} onSave={() => handleSaveSettings('maintenance')} loading={loading} onOptimize={handleOptimizeDatabase} onClearCache={handleClearCache} />;
      case 'assetRules':
        return <AssetRulesSection settings={advancedSettings} setSettings={setAdvancedSettings} onSave={() => handleSaveSettings('assetRules')} loading={loading} />;
      case 'reporting':
        return <ReportingSection settings={advancedSettings} setSettings={setAdvancedSettings} onSave={() => handleSaveSettings('reporting')} loading={loading} />;
      case 'integration':
        return <IntegrationSection settings={advancedSettings} setSettings={setAdvancedSettings} onSave={() => handleSaveSettings('integration')} loading={loading} onRegenerate={handleRegenerateApiKey} onTestConnection={handleTestConnection} />;
      case 'exportImport':
        return <ExportImportSection settings={advancedSettings} setSettings={setAdvancedSettings} onSave={() => handleSaveSettings('exportImport')} loading={loading} />;
      case 'general':
        return <GeneralSection settings={settings} setSettings={setSettings} onSave={() => handleSaveSettings('general')} loading={loading} />;
      case 'qrCode':
        return <QRCodeSection qrCategory={qrCategory} setQrCategory={setQrCategory} onDownload={handleDownloadBulkQrCodes} downloading={qrDownloading} />;
      case 'dataExport':
        return <DataExportSection exportRowCount={exportRowCount} setExportRowCount={setExportRowCount} exportDataTypes={exportDataTypes} setExportDataTypes={setExportDataTypes} exportColumns={exportColumns} setExportColumns={setExportColumns} onExport={handleExportData} exporting={exporting} />;
      default:
        return null;
    }
  };

  const currentSection = SETTINGS_SECTIONS.find(s => s.id === activeSection);

  return (
    <DashboardLayout>
      <div className="w-full max-w-full h-screen flex flex-col overflow-hidden">
        {/* Page Header */}
        <div className="px-1.5 sm:px-2 lg:px-3 py-2 flex-shrink-0">
          <PageHeader
            title="Settings & Configuration"
            subtitle="Manage your system preferences, security, and integrations"
            icon={SettingsIcon}
            badge="Professional"
            gradientFrom="from-slate-100"
            gradientTo="to-gray-100"
            iconColor="text-slate-600"
          />
        </div>

        {/* Status Message */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mx-1.5 sm:mx-2 lg:mx-3 mb-3 p-4 rounded-lg border flex items-center gap-2 flex-shrink-0 ${
                message.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <span className="text-sm font-medium">{message.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden gap-0.5 sm:gap-1 px-1.5 sm:px-2 lg:px-3 pb-2">
          {/* ============= LEFT SIDEBAR ============= */}
          <motion.div
            initial={false}
            animate={{ width: sidebarOpen ? 280 : 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="hidden md:flex overflow-hidden"
          >
            <div className="w-[280px] bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 rounded-lg flex flex-col overflow-hidden shadow-lg border border-slate-700">
              {/* Sidebar Header */}
              <div className="px-4 py-4 border-b border-slate-700 flex-shrink-0">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <SettingsIcon className="w-4 h-4 text-blue-400" />
                  Settings Menu
                </h3>
              </div>

              {/* Sidebar Navigation */}
              <nav className="flex-1 overflow-y-auto space-y-1 px-3 py-3">
                {SETTINGS_SECTIONS.map(section => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;

                  return (
                    <motion.button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full group relative px-3 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-3 text-left ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'text-slate-300 hover:text-white hover:bg-slate-700'
                      }`}
                    >
                      {/* Active Indicator */}
                      {isActive && (
                        <motion.div
                          layoutId="sidebar-indicator"
                          className="absolute left-0 top-2 bottom-2 w-1 bg-blue-400 rounded-r-full"
                        />
                      )}

                      <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-blue-200' : 'text-slate-400 group-hover:text-blue-400'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{section.label}</p>
                        <p className={`text-xs truncate ${isActive ? 'text-blue-100' : 'text-slate-500'}`}>{section.title}</p>
                      </div>
                      {isActive && <ChevronRight className="w-4 h-4 flex-shrink-0 text-blue-200" />}
                    </motion.button>
                  );
                })}
              </nav>

              {/* Sidebar Footer */}
              <div className="px-3 py-3 border-t border-slate-700 flex-shrink-0">
                <p className="text-xs text-slate-400 text-center">v1.0.0</p>
              </div>
            </div>
          </motion.div>

          {/* ============= MAIN CONTENT ============= */}
          <motion.div
            layout
            className="flex-1 flex flex-col overflow-hidden"
          >
            {/* Mobile Menu Toggle */}
            <div className="md:hidden flex-shrink-0 flex items-center justify-between bg-slate-800 text-white px-3 py-2 rounded-t-lg gap-2">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-1.5 hover:bg-slate-700 rounded transition-colors"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <span className="text-sm font-semibold flex-1">{currentSection?.label}</span>
              <div className="w-5" />
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto bg-white/50 rounded-lg border border-slate-200">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSection}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="h-full"
                >
                  {/* Section Header */}
                  {currentSection && (
                    <div className={`bg-gradient-to-r ${currentSection.color} border-b border-slate-200 px-6 py-4 sticky top-0 z-10`}>
                      <div className="flex items-start gap-3">
                        {currentSection && <currentSection.icon className="w-6 h-6 text-slate-700 mt-0.5 flex-shrink-0" />}
                        <div>
                          <h2 className="text-xl font-bold text-slate-900">{currentSection.title}</h2>
                          <p className="text-sm text-slate-600 mt-0.5">{currentSection.description}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Section Content */}
                  <div className="px-6 py-6">
                    {renderSection()}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// ============= SECTION COMPONENTS =============

// General Settings
function GeneralSection({ settings, setSettings, onSave, loading }: any) {
  return (
    <div className="max-w-3xl space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">Organization Name</label>
          <input
            type="text"
            value={settings.companyName}
            onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">Site Name</label>
          <input
            type="text"
            value={settings.siteName}
            onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">Support Email</label>
          <input
            type="email"
            value={settings.supportEmail}
            onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">Support Phone</label>
          <input
            type="tel"
            value={settings.supportPhone}
            onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">Timezone</label>
          <select
            value={settings.timezone}
            onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="Asia/Karachi">Asia/Karachi</option>
            <option value="UTC">UTC</option>
            <option value="US/Eastern">US/Eastern</option>
            <option value="Europe/London">Europe/London</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">Language</label>
          <select
            value={settings.language}
            onChange={(e) => setSettings({ ...settings, language: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="English">English</option>
            <option value="Urdu">Urdu</option>
            <option value="Spanish">Spanish</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">Currency</label>
          <select
            value={settings.currency}
            onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="PKR">PKR</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">Session Timeout (minutes)</label>
          <input
            type="number"
            value={settings.sessionTimeout}
            onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">Max Login Attempts</label>
          <input
            type="number"
            value={settings.maxLoginAttempts}
            onChange={(e) => setSettings({ ...settings, maxLoginAttempts: parseInt(e.target.value) })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 flex items-center justify-between">
        <div>
          <p className="font-semibold text-slate-900">Auto-Generate Asset Tags</p>
          <p className="text-xs text-slate-600 mt-1">Automatically create tags for new assets</p>
        </div>
        <button
          onClick={() => setSettings({ ...settings, autoGenerateAssetTag: !settings.autoGenerateAssetTag })}
          className="cursor-pointer"
        >
          {settings.autoGenerateAssetTag ? (
            <ToggleRight className="w-6 h-6 text-blue-600" />
          ) : (
            <ToggleLeft className="w-6 h-6 text-slate-400" />
          )}
        </button>
      </div>

      <button
        onClick={onSave}
        disabled={loading}
        className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold py-2.5 px-6 rounded-lg active:scale-95 transition-all flex items-center justify-center gap-2"
      >
        <Save className="w-4 h-4" />
        {loading ? 'Saving...' : 'Save General Settings'}
      </button>
    </div>
  );
}

// Notifications Section
function NotificationsSection({ settings, setSettings, onSave, loading }: any) {
  return (
    <div className="max-w-3xl space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 flex items-center justify-between">
          <div>
            <p className="font-semibold text-slate-900">Email Notifications</p>
            <p className="text-xs text-slate-600 mt-1">Receive alerts via email</p>
          </div>
          <button
            onClick={() => setSettings({...settings, emailNotifications: !settings.emailNotifications})}
            className="cursor-pointer"
          >
            {settings.emailNotifications ? (
              <ToggleRight className="w-6 h-6 text-blue-600" />
            ) : (
              <ToggleLeft className="w-6 h-6 text-slate-400" />
            )}
          </button>
        </div>

        <div className="bg-purple-50 rounded-lg border border-purple-200 p-4 flex items-center justify-between">
          <div>
            <p className="font-semibold text-slate-900">SMS Notifications</p>
            <p className="text-xs text-slate-600 mt-1">Receive text message alerts</p>
          </div>
          <button
            onClick={() => setSettings({...settings, smsNotifications: !settings.smsNotifications})}
            className="cursor-pointer"
          >
            {settings.smsNotifications ? (
              <ToggleRight className="w-6 h-6 text-purple-600" />
            ) : (
              <ToggleLeft className="w-6 h-6 text-slate-400" />
            )}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-900 mb-3">Notification Frequency</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { value: 'realtime', label: 'Real-time', desc: 'Instant notifications' },
            { value: 'daily', label: 'Daily Digest', desc: 'Once per day' },
            { value: 'weekly', label: 'Weekly', desc: 'Once per week' }
          ].map(option => (
            <button
              key={option.value}
              onClick={() => setSettings({...settings, notificationFrequency: option.value})}
              className={`p-3 rounded-lg border-2 transition-all text-left ${
                settings.notificationFrequency === option.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 bg-white hover:border-blue-300'
              }`}
            >
              <p className="font-semibold text-sm">{option.label}</p>
              <p className="text-xs text-slate-600">{option.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-900 mb-3">Notification Categories</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { key: 'assetAlerts', label: 'Asset Alerts', icon: Package },
            { key: 'userRequests', label: 'User Requests', icon: Users },
            { key: 'maintenanceAlerts', label: 'Maintenance Alerts', icon: Wrench },
            { key: 'auditAlerts', label: 'Audit Alerts', icon: Shield }
          ].map(cat => (
            <button
              key={cat.key}
              onClick={() => setSettings({
                ...settings,
                notificationCategories: {
                  ...settings.notificationCategories,
                  [cat.key]: !settings.notificationCategories[cat.key as keyof typeof settings.notificationCategories]
                }
              })}
              className={`p-3 rounded-lg border-2 flex items-center gap-2 transition-all ${
                settings.notificationCategories[cat.key as keyof typeof settings.notificationCategories]
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <cat.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onSave}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2.5 px-6 rounded-lg active:scale-95 transition-all flex items-center justify-center gap-2"
      >
        <Save className="w-4 h-4" />
        {loading ? 'Saving...' : 'Save Notification Settings'}
      </button>
    </div>
  );
}

// Security Section
function SecuritySection({ settings, setSettings, onSave, loading }: any) {
  return (
    <div className="max-w-3xl space-y-6">
      <div className="bg-red-50 rounded-lg border border-red-200 p-4 flex items-center justify-between">
        <div>
          <p className="font-semibold text-slate-900">Two-Factor Authentication</p>
          <p className="text-xs text-slate-600 mt-1">Add an extra layer of security to your account</p>
        </div>
        <button
          onClick={() => setSettings({...settings, twoFactorAuth: !settings.twoFactorAuth})}
          className="cursor-pointer"
        >
          {settings.twoFactorAuth ? (
            <ToggleRight className="w-6 h-6 text-red-600" />
          ) : (
            <ToggleLeft className="w-6 h-6 text-slate-400" />
          )}
        </button>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-900 mb-3">Session Duration (minutes)</label>
        <select
          value={settings.sessionDuration}
          onChange={(e) => setSettings({...settings, sessionDuration: parseInt(e.target.value)})}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
        >
          <option value={15}>15 minutes</option>
          <option value={30}>30 minutes</option>
          <option value={60}>1 hour</option>
          <option value={120}>2 hours</option>
          <option value={480}>8 hours</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-900 mb-2">IP Whitelist</label>
        <p className="text-xs text-slate-600 mb-2">One IP address per line</p>
        <textarea
          value={settings.ipWhitelist}
          onChange={(e) => setSettings({...settings, ipWhitelist: e.target.value})}
          placeholder="192.168.1.1&#10;10.0.0.1"
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 h-24 font-mono text-xs"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">Login Attempt Restrictions</label>
          <input
            type="number"
            value={settings.loginAttemptRestrictions}
            onChange={(e) => setSettings({...settings, loginAttemptRestrictions: parseInt(e.target.value)})}
            min="1"
            max="20"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
          />
          <p className="text-xs text-slate-600 mt-1">Attempts before lockout</p>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">Minimum Password Length</label>
          <input
            type="number"
            value={settings.passwordMinLength}
            onChange={(e) => setSettings({...settings, passwordMinLength: parseInt(e.target.value)})}
            min="6"
            max="20"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
          />
          <p className="text-xs text-slate-600 mt-1">Minimum characters required</p>
        </div>
      </div>

      <div className="bg-orange-50 rounded-lg border border-orange-200 p-4 flex items-center justify-between">
        <div>
          <p className="font-semibold text-slate-900">Require Complex Passwords</p>
          <p className="text-xs text-slate-600 mt-1">Mix of uppercase, lowercase, numbers, and symbols</p>
        </div>
        <button
          onClick={() => setSettings({...settings, passwordComplexity: !settings.passwordComplexity})}
          className="cursor-pointer"
        >
          {settings.passwordComplexity ? (
            <ToggleRight className="w-6 h-6 text-orange-600" />
          ) : (
            <ToggleLeft className="w-6 h-6 text-slate-400" />
          )}
        </button>
      </div>

      <button
        onClick={onSave}
        disabled={loading}
        className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold py-2.5 px-6 rounded-lg active:scale-95 transition-all flex items-center justify-center gap-2"
      >
        <Save className="w-4 h-4" />
        {loading ? 'Saving...' : 'Save Security Settings'}
      </button>
    </div>
  );
}

// Maintenance Section
function MaintenanceSection({ settings, setSettings, onSave, loading, onOptimize, onClearCache }: any) {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <label className="block text-sm font-semibold text-slate-900 mb-3">Backup Schedule</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { value: 'daily', label: 'Daily' },
            { value: 'weekly', label: 'Weekly' },
            { value: 'monthly', label: 'Monthly' }
          ].map(option => (
            <button
              key={option.value}
              onClick={() => setSettings({...settings, backupSchedule: option.value})}
              className={`p-3 rounded-lg border-2 transition-all ${
                settings.backupSchedule === option.value
                  ? 'border-yellow-500 bg-yellow-50'
                  : 'border-slate-200 bg-white hover:border-yellow-300'
              }`}
            >
              <span className="font-medium">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-4">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-slate-900">Last Backup</p>
            <p className="text-sm text-slate-600 mt-1">{settings.lastBackup}</p>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-900 mb-3">Log Retention Period (days)</label>
        <select
          value={settings.logRetentionDays}
          onChange={(e) => setSettings({...settings, logRetentionDays: parseInt(e.target.value)})}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
        >
          <option value={7}>7 days</option>
          <option value={30}>30 days</option>
          <option value={90}>90 days</option>
          <option value={365}>1 year</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={onOptimize}
          disabled={loading}
          className="bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white font-semibold py-2.5 px-4 rounded-lg active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <HardDrive className="w-4 h-4" />
          {loading ? 'Optimizing...' : 'Optimize Database'}
        </button>
        <button
          onClick={onClearCache}
          disabled={loading}
          className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-semibold py-2.5 px-4 rounded-lg active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          {loading ? 'Clearing...' : 'Clear Cache'}
        </button>
      </div>

      <button
        onClick={onSave}
        disabled={loading}
        className="bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white font-semibold py-2.5 px-6 rounded-lg active:scale-95 transition-all flex items-center justify-center gap-2"
      >
        <Save className="w-4 h-4" />
        {loading ? 'Saving...' : 'Save Maintenance Settings'}
      </button>
    </div>
  );
}

// Asset Rules Section
function AssetRulesSection({ settings, setSettings, onSave, loading }: any) {
  return (
    <div className="max-w-3xl space-y-6">
      <div className="bg-green-50 rounded-lg border border-green-200 p-4 flex items-center justify-between">
        <div>
          <p className="font-semibold text-slate-900">Enable Auto-Depreciation</p>
          <p className="text-xs text-slate-600 mt-1">Automatically calculate asset depreciation</p>
        </div>
        <button
          onClick={() => setSettings({...settings, autoDepreciation: !settings.autoDepreciation})}
          className="cursor-pointer"
        >
          {settings.autoDepreciation ? (
            <ToggleRight className="w-6 h-6 text-green-600" />
          ) : (
            <ToggleLeft className="w-6 h-6 text-slate-400" />
          )}
        </button>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-900 mb-2">Depreciation Rate</label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="5"
            max="50"
            step="1"
            value={settings.depreciationRate}
            onChange={(e) => setSettings({...settings, depreciationRate: parseInt(e.target.value)})}
            className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-green-600"
          />
          <span className="text-lg font-bold text-green-600 min-w-fit">{settings.depreciationRate}%</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-900 mb-3">Asset Lifecycle Rules</label>
        <select
          value={settings.assetLifecycleRules}
          onChange={(e) => setSettings({...settings, assetLifecycleRules: e.target.value})}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
        >
          <option value="standard">Standard Rules</option>
          <option value="accelerated">Accelerated Rules</option>
          <option value="custom">Custom Rules</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-3">Audit Frequency</label>
          <select
            value={settings.auditFrequency}
            onChange={(e) => setSettings({...settings, auditFrequency: e.target.value})}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="annually">Annually</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">Checkout Limit Per User</label>
          <input
            type="number"
            value={settings.checkoutLimitPerUser}
            onChange={(e) => setSettings({...settings, checkoutLimitPerUser: parseInt(e.target.value)})}
            min="1"
            max="50"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      <button
        onClick={onSave}
        disabled={loading}
        className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-2.5 px-6 rounded-lg active:scale-95 transition-all flex items-center justify-center gap-2"
      >
        <Save className="w-4 h-4" />
        {loading ? 'Saving...' : 'Save Asset Rules'}
      </button>
    </div>
  );
}

// Reporting Section
function ReportingSection({ settings, setSettings, onSave, loading }: any) {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <label className="block text-sm font-semibold text-slate-900 mb-3">Default Report Format</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { value: 'pdf', label: 'PDF', desc: 'Portable Document' },
            { value: 'excel', label: 'Excel', desc: 'Spreadsheet' },
            { value: 'csv', label: 'CSV', desc: 'Plain Text' }
          ].map(option => (
            <button
              key={option.value}
              onClick={() => setSettings({...settings, defaultReportFormat: option.value})}
              className={`p-3 rounded-lg border-2 transition-all text-left ${
                settings.defaultReportFormat === option.value
                  ? 'border-violet-500 bg-violet-50'
                  : 'border-slate-200 bg-white hover:border-violet-300'
              }`}
            >
              <p className="font-semibold text-sm">{option.label}</p>
              <p className="text-xs text-slate-600">{option.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-violet-50 rounded-lg border border-violet-200 p-4 flex items-center justify-between">
        <div>
          <p className="font-semibold text-slate-900">Auto-Generate Reports</p>
          <p className="text-xs text-slate-600 mt-1">Automatically create reports on schedule</p>
        </div>
        <button
          onClick={() => setSettings({...settings, autoGenerateReports: !settings.autoGenerateReports})}
          className="cursor-pointer"
        >
          {settings.autoGenerateReports ? (
            <ToggleRight className="w-6 h-6 text-violet-600" />
          ) : (
            <ToggleLeft className="w-6 h-6 text-slate-400" />
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-3">Report Schedule</label>
          <select
            value={settings.reportSchedule}
            onChange={(e) => setSettings({...settings, reportSchedule: e.target.value})}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">Data Retention (months)</label>
          <input
            type="number"
            value={settings.dataRetentionMonths}
            onChange={(e) => setSettings({...settings, dataRetentionMonths: parseInt(e.target.value)})}
            min="6"
            max="120"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-900 mb-2">Analytics Dashboard Refresh Rate</label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="1"
            max="60"
            step="1"
            value={settings.analyticsRefreshRate}
            onChange={(e) => setSettings({...settings, analyticsRefreshRate: parseInt(e.target.value)})}
            className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
          />
          <span className="text-lg font-bold text-violet-600 min-w-fit">{settings.analyticsRefreshRate}s</span>
        </div>
        <p className="text-xs text-slate-600 mt-2">Refresh interval in seconds</p>
      </div>

      <button
        onClick={onSave}
        disabled={loading}
        className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-semibold py-2.5 px-6 rounded-lg active:scale-95 transition-all flex items-center justify-center gap-2"
      >
        <Save className="w-4 h-4" />
        {loading ? 'Saving...' : 'Save Reporting Settings'}
      </button>
    </div>
  );
}

// Integration Section
function IntegrationSection({ settings, setSettings, onSave, loading, onRegenerate, onTestConnection }: any) {
  return (
    <div className="max-w-3xl space-y-6">
      <div className="bg-pink-50 rounded-lg border border-pink-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Key className="w-5 h-5 text-pink-600" />
          <h3 className="font-semibold text-slate-900">API Key</h3>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <code className="flex-1 bg-slate-100 px-3 py-2 rounded font-mono text-sm text-slate-600">
            {settings.apiKeyMasked}
          </code>
          <button
            onClick={() => {
              navigator.clipboard.writeText(settings.apiKeyMasked);
            }}
            className="p-2 hover:bg-pink-100 rounded transition-colors"
          >
            <Copy className="w-4 h-4 text-pink-600" />
          </button>
        </div>
        <button
          onClick={onRegenerate}
          disabled={loading}
          className="bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-lg active:scale-95 transition-all flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          {loading ? 'Regenerating...' : 'Regenerate API Key'}
        </button>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-900 mb-2">Webhook URL</label>
        <p className="text-xs text-slate-600 mb-2">Configure where to send webhook events</p>
        <input
          type="url"
          value={settings.webhookUrl}
          onChange={(e) => setSettings({...settings, webhookUrl: e.target.value})}
          placeholder="https://example.com/webhooks"
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 mb-3"
        />
        <button
          onClick={onTestConnection}
          disabled={loading || !settings.webhookUrl}
          className="bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-lg active:scale-95 transition-all flex items-center gap-2"
        >
          <LinkIcon className="w-4 h-4" />
          {loading ? 'Testing...' : 'Test Connection'}
        </button>
      </div>

      <button
        onClick={onSave}
        disabled={loading}
        className="bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white font-semibold py-2.5 px-6 rounded-lg active:scale-95 transition-all flex items-center justify-center gap-2"
      >
        <Save className="w-4 h-4" />
        {loading ? 'Saving...' : 'Save Integration Settings'}
      </button>
    </div>
  );
}

// Export/Import Section
function ExportImportSection({ settings, setSettings, onSave, loading }: any) {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <label className="block text-sm font-semibold text-slate-900 mb-3">Import Format Preference</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { value: 'csv', label: 'CSV' },
            { value: 'excel', label: 'Excel' },
            { value: 'json', label: 'JSON' }
          ].map(option => (
            <button
              key={option.value}
              onClick={() => setSettings({...settings, importFormatPreference: option.value})}
              className={`p-3 rounded-lg border-2 transition-all ${
                settings.importFormatPreference === option.value
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-slate-200 bg-white hover:border-indigo-300'
              }`}
            >
              <span className="font-medium">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-indigo-50 rounded-lg border border-indigo-200 p-4 flex items-center justify-between">
        <div>
          <p className="font-semibold text-slate-900">Enable Export Compression</p>
          <p className="text-xs text-slate-600 mt-1">Compress exported files (ZIP format)</p>
        </div>
        <button
          onClick={() => setSettings({...settings, exportCompression: !settings.exportCompression})}
          className="cursor-pointer"
        >
          {settings.exportCompression ? (
            <ToggleRight className="w-6 h-6 text-indigo-600" />
          ) : (
            <ToggleLeft className="w-6 h-6 text-slate-400" />
          )}
        </button>
      </div>

      <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 flex items-center justify-between">
        <div>
          <p className="font-semibold text-slate-900">Enable Scheduled Exports</p>
          <p className="text-xs text-slate-600 mt-1">Automatically export data on a schedule</p>
        </div>
        <button
          onClick={() => setSettings({...settings, scheduledExports: !settings.scheduledExports})}
          className="cursor-pointer"
        >
          {settings.scheduledExports ? (
            <ToggleRight className="w-6 h-6 text-blue-600" />
          ) : (
            <ToggleLeft className="w-6 h-6 text-slate-400" />
          )}
        </button>
      </div>

      {settings.scheduledExports && (
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-3">Export Frequency</label>
          <select
            value={settings.scheduledExportFrequency}
            onChange={(e) => setSettings({...settings, scheduledExportFrequency: e.target.value})}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      )}

      <div className="bg-indigo-50 rounded-lg border border-indigo-200 p-4 flex items-center justify-between">
        <div>
          <p className="font-semibold text-slate-900">Cloud Storage Integration</p>
          <p className="text-xs text-slate-600 mt-1">Automatically backup to cloud storage</p>
        </div>
        <button
          onClick={() => setSettings({...settings, cloudStorageEnabled: !settings.cloudStorageEnabled})}
          className="cursor-pointer"
        >
          {settings.cloudStorageEnabled ? (
            <ToggleRight className="w-6 h-6 text-indigo-600" />
          ) : (
            <ToggleLeft className="w-6 h-6 text-slate-400" />
          )}
        </button>
      </div>

      {settings.cloudStorageEnabled && (
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-3">Cloud Storage Provider</label>
          <select
            value={settings.cloudStorageProvider}
            onChange={(e) => setSettings({...settings, cloudStorageProvider: e.target.value})}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="aws">Amazon S3</option>
            <option value="gcp">Google Cloud Storage</option>
            <option value="azure">Azure Blob Storage</option>
          </select>
        </div>
      )}

      <button
        onClick={onSave}
        disabled={loading}
        className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-2.5 px-6 rounded-lg active:scale-95 transition-all flex items-center justify-center gap-2"
      >
        <Save className="w-4 h-4" />
        {loading ? 'Saving...' : 'Save Export/Import Settings'}
      </button>
    </div>
  );
}

// QR Code Section
function QRCodeSection({ qrCategory, setQrCategory, onDownload, downloading }: any) {
  const { data: session } = useSession();
  const [assets, setAssets] = useState<any[]>([]);
  const [qrLoading, setQrLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) {
      setError('Loading authentication...');
      setQrLoading(false);
      return;
    }

    fetchAllAssets();
    // Auto-refresh QR codes every 30 seconds to get latest data
    const interval = setInterval(() => {
      fetchAllAssets();
    }, 30000);

    return () => clearInterval(interval);
  }, [session]);

  const fetchAllAssets = async () => {
    try {
      setQrLoading(true);
      console.log('Fetching all assets for QR codes...');

      // Fetch from correct API endpoints with high limit to get all assets
      const fetchOptions = {
        credentials: 'include' as const,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const [furnitureRes, electronicsRes, vehiclesRes] = await Promise.all([
        fetch('/api/furniture?limit=1000&page=1', fetchOptions).catch(e => {
          console.error('Furniture fetch error:', e);
          return null;
        }),
        fetch('/api/electronics?limit=1000&page=1', fetchOptions).catch(e => {
          console.error('Electronics fetch error:', e);
          return null;
        }),
        fetch('/api/vehicles?limit=1000&page=1', fetchOptions).catch(e => {
          console.error('Vehicles fetch error:', e);
          return null;
        })
      ]);

      let allAssets: any[] = [];

      if (furnitureRes && furnitureRes.ok) {
        try {
          const data = await furnitureRes.json();
          console.log('Furniture data:', data);
          const furnitureAssets = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
          console.log('Furniture assets count:', furnitureAssets.length);
          allAssets.push(...furnitureAssets.map((a: any) => ({ ...a, assetCategory: 'furniture' })));
        } catch (e) {
          console.error('Error parsing furniture JSON:', e);
        }
      } else if (furnitureRes) {
        const errorMsg = await furnitureRes.text().catch(() => 'Unknown error');
        if (furnitureRes.status === 401) {
          console.error('Furniture: Unauthorized (401) - Session may have expired');
        } else {
          console.log('Furniture response not ok:', furnitureRes.status, furnitureRes.statusText);
        }
      } else {
        console.error('Furniture: No response received');
      }

      if (electronicsRes && electronicsRes.ok) {
        try {
          const data = await electronicsRes.json();
          console.log('Electronics data:', data);
          const electronicsAssets = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
          console.log('Electronics assets count:', electronicsAssets.length);
          allAssets.push(...electronicsAssets.map((a: any) => ({ ...a, assetCategory: 'electronics' })));
        } catch (e) {
          console.error('Error parsing electronics JSON:', e);
        }
      } else if (electronicsRes) {
        if (electronicsRes.status === 401) {
          console.error('Electronics: Unauthorized (401)');
        } else {
          console.log('Electronics response not ok:', electronicsRes.status, electronicsRes.statusText);
        }
      } else {
        console.error('Electronics: No response received');
      }

      if (vehiclesRes && vehiclesRes.ok) {
        try {
          const data = await vehiclesRes.json();
          console.log('Vehicles data:', data);
          const vehicleAssets = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
          console.log('Vehicles assets count:', vehicleAssets.length);
          allAssets.push(...vehicleAssets.map((a: any) => ({ ...a, assetCategory: 'vehicles' })));
        } catch (e) {
          console.error('Error parsing vehicles JSON:', e);
        }
      } else if (vehiclesRes) {
        if (vehiclesRes.status === 401) {
          console.error('Vehicles: Unauthorized (401)');
        } else {
          console.log('Vehicles response not ok:', vehiclesRes.status, vehiclesRes.statusText);
        }
      } else {
        console.error('Vehicles: No response received');
      }

      console.log('Total assets fetched:', allAssets.length);
      setAssets(allAssets);
      setError(null);
      if (allAssets.length === 0) {
        setError('No assets found. Make sure you are logged in and have added assets to the system.');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('Error fetching assets:', error);
      setAssets([]);

      if (errorMsg.includes('Unauthorized') || errorMsg.includes('401')) {
        setError('Session expired or not authenticated. Please refresh the page or log in again.');
      } else {
        setError(`Error loading assets: ${errorMsg}`);
      }
    } finally {
      setQrLoading(false);
    }
  };

  const filteredAssets = qrCategory === 'all'
    ? assets
    : assets.filter(a => a.assetCategory === qrCategory);

  const generateQRCodeUrl = (assetId: string) => {
    // Generate QR code URL using qr-server API
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(assetId)}`;
  };

  const handleDownloadQR = (assetId: string, assetName: string) => {
    const qrUrl = generateQRCodeUrl(assetId);
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `qr-${assetId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintQR = (assetId: string, assetName: string) => {
    const printWindow = window.open('', '', 'height=400,width=600');
    if (printWindow) {
      printWindow.document.write(`
        <html><head><title>QR Code - ${assetId}</title></head><body>
        <div style="text-align: center; padding: 20px;">
          <h2>${assetName}</h2>
          <p style="margin: 10px 0;">${assetId}</p>
          <img src="${generateQRCodeUrl(assetId)}" style="border: 2px solid #000; padding: 10px;" />
        </div>
        </body></html>
      `);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 100);
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Category Filter, Refresh, and Bulk Download */}
      <div className="flex flex-col gap-3 pb-4 border-b border-slate-200">
        {/* Top Row: Filter and Buttons */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-slate-900 mb-2">Filter by Category</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { value: 'all', label: 'All' },
                { value: 'furniture', label: 'Furniture' },
                { value: 'electronics', label: 'Electronics' },
                { value: 'vehicles', label: 'Vehicles' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setQrCategory(option.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    qrCategory === option.value
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => fetchAllAssets()}
            disabled={qrLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-lg active:scale-95 transition-all flex items-center justify-center gap-2 text-sm"
            title="Refresh QR codes with latest data"
          >
            <RefreshCw className={`w-4 h-4 ${qrLoading ? 'animate-spin' : ''}`} />
            {qrLoading ? 'Refreshing...' : 'Refresh Data'}
          </button>

          <button
            onClick={onDownload}
            disabled={downloading || qrLoading || assets.length === 0}
            className="bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-lg active:scale-95 transition-all flex items-center justify-center gap-2 text-sm flex-1 sm:flex-none"
          >
            <Download className="w-4 h-4" />
            {downloading ? 'Downloading...' : 'Bulk Download'}
          </button>
        </div>

        {/* Status Info */}
        <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3">
          <p className="text-xs text-cyan-900">
            <span className="font-bold">Total Assets:</span> {assets.length} |
            <span className="font-bold ml-2">Showing:</span> {filteredAssets.length}
          </p>
        </div>
      </div>

      {/* QR Codes Gallery */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-4">
          QR Codes ({qrLoading ? 'Loading...' : filteredAssets.length})
        </h3>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-700 text-sm font-medium">{error}</p>
              {error.includes('Loading authentication') && (
                <p className="text-xs text-red-600 mt-1">Please wait a moment for the page to initialize...</p>
              )}
            </div>
          </div>
        )}

        {qrLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-cyan-600 animate-spin" />
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="text-center py-12">
            <QrCode className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-600 font-semibold">No QR codes found</p>
            <p className="text-sm text-slate-500">Try selecting a different category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAssets.map((asset) => (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Actual QR Code */}
                <div className="bg-white p-4 flex items-center justify-center border-b border-slate-200">
                  <img
                    src={generateQRCodeUrl(asset.assetTag || asset.id)}
                    alt={`QR Code for ${asset.assetName}`}
                    className="w-40 h-40 border-2 border-slate-300 rounded"
                  />
                </div>

                {/* Asset Info */}
                <div className="p-4 space-y-3">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Asset ID</p>
                    <p className="font-bold text-slate-900 truncate">{asset.assetTag || asset.id}</p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-1">Asset Name</p>
                    <p className="text-sm text-slate-700 truncate">{asset.assetName || asset.name}</p>
                  </div>

                  <div>
                    <span className="inline-block px-2.5 py-1 bg-slate-100 rounded text-xs font-medium text-slate-700">
                      {asset.assetCategory?.charAt(0).toUpperCase() + asset.assetCategory?.slice(1) || 'Unknown'}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-3 border-t border-slate-200">
                    <button
                      onClick={() => handleDownloadQR(asset.assetTag || asset.id, asset.assetName || asset.name)}
                      className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold py-2 rounded transition-all flex items-center justify-center gap-1"
                      title="Download individual QR code"
                    >
                      <Download className="w-3 h-3" />
                      Download
                    </button>
                    <button
                      onClick={() => handlePrintQR(asset.assetTag || asset.id, asset.assetName || asset.name)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 rounded transition-all flex items-center justify-center gap-1"
                      title="Print QR code"
                    >
                      🖨️ Print
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Data Export Section
function DataExportSection({ exportRowCount, setExportRowCount, exportDataTypes, setExportDataTypes, exportColumns, setExportColumns, onExport, exporting }: any) {
  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-3">Number of Rows to Export</label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="10"
            max="1000"
            step="10"
            value={exportRowCount}
            onChange={(e) => setExportRowCount(parseInt(e.target.value))}
            className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
          <span className="text-lg font-bold text-emerald-600 min-w-fit">{exportRowCount}</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-3">Select Data Sources</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {[
            { key: 'assets', label: 'Assets' },
            { key: 'users', label: 'Users' },
            { key: 'manufacturers', label: 'Manufacturers' },
            { key: 'locations', label: 'Locations' },
            { key: 'offices', label: 'Offices' },
            { key: 'checkouts', label: 'Checkouts' },
            { key: 'maintenance', label: 'Maintenance' },
            { key: 'audits', label: 'Audits' }
          ].map(type => (
            <button
              key={type.key}
              onClick={() => setExportDataTypes({
                ...exportDataTypes,
                [type.key]: !exportDataTypes[type.key]
              })}
              className={`p-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                exportDataTypes[type.key]
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-300'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-3">Select Columns</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
          {[
            { key: 'assetId', label: 'Asset ID' },
            { key: 'assetName', label: 'Asset Name' },
            { key: 'category', label: 'Category' },
            { key: 'status', label: 'Status' },
            { key: 'location', label: 'Location' },
            { key: 'assignedTo', label: 'Assigned To' },
            { key: 'value', label: 'Asset Value' },
            { key: 'purchaseDate', label: 'Purchase Date' },
            { key: 'condition', label: 'Condition' },
            { key: 'department', label: 'Department' },
            { key: 'notes', label: 'Notes' }
          ].map(col => (
            <button
              key={col.key}
              onClick={() => setExportColumns({
                ...exportColumns,
                [col.key]: !exportColumns[col.key]
              })}
              className={`p-2 rounded-lg border transition-all text-xs font-medium flex items-center gap-1.5 ${
                exportColumns[col.key]
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 bg-white text-slate-600'
              }`}
            >
              {exportColumns[col.key] ? (
                <Eye className="w-3 h-3" />
              ) : (
                <EyeOff className="w-3 h-3" />
              )}
              {col.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
        <p className="text-xs text-slate-700">
          <span className="font-bold">Export Summary:</span> {exportRowCount} rows from{' '}
          {Object.keys(exportDataTypes).filter(k => exportDataTypes[k]).length} data source(s) with{' '}
          {Object.keys(exportColumns).filter(k => exportColumns[k]).length} column(s)
        </p>
      </div>

      <button
        onClick={onExport}
        disabled={exporting || Object.values(exportDataTypes).every((v: any) => !v)}
        className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold py-2.5 px-6 rounded-lg active:scale-95 transition-all flex items-center justify-center gap-2"
      >
        <Download className="w-4 h-4" />
        {exporting ? 'Exporting...' : 'Export Data'}
      </button>

      {Object.values(exportDataTypes).every((v: any) => !v) && (
        <p className="text-xs text-red-600 text-center">Select at least one data source to export</p>
      )}
    </div>
  );
}
