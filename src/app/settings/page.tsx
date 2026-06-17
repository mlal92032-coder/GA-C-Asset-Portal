'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import PageHeader from '@/components/PageHeader';
import QRCode from '@/components/QRCode';
import {
  Settings, Building2, DollarSign, Globe, Calendar, Mail,
  AlertTriangle, List, Palette, Save, ArrowLeft, CheckCircle,
  Shield, Database, BarChart3, Image as ImageIcon, Bell, Key,
  HardDrive, Printer, Download, Loader2, QrCode,
} from 'lucide-react';

interface AppSettings {
  // General
  siteName: string;
  siteLogo: string;
  tagPrefix: string;
  itemsPerPage: number;
  
  // Branding
  companyName: string;
  supportEmail: string;
  supportPhone: string;
  
  // Regional
  currency: string;
  language: string;
  dateFormat: string;
  timezone: string;
  
  // Assets
  defaultDepreciationMethod: string;
  defaultUsefulLife: number;
  autoGenerateAssetTag: boolean;
  
  // Notifications
  enableEmailNotifications: boolean;
  warrantyAlertDays: number;
  maintenanceAlertDays: number;
  overdueCheckoutDays: number;
  
  // Security
  sessionTimeout: number;
  maxLoginAttempts: number;
  lockoutDuration: number;
  
  // Theme
  defaultTheme: string;
  
  // QR Code
  barcodeType: string;
  barcodeWidth: number;
  barcodeHeight: number;
  showBarcodeLabel: boolean;
  
  // File Upload
  maxFileSize: number;
  allowedFileTypes: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('general');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // Bulk QR state
  const [qrAssetType, setQrAssetType] = useState('FURNITURE');
  const [qrAssets, setQrAssets] = useState<any[]>([]);
  const [loadingQr, setLoadingQr] = useState(false);
  
  const [settings, setSettings] = useState<AppSettings>({
    siteName: 'Asset Management System',
    siteLogo: '',
    tagPrefix: 'AST',
    itemsPerPage: 20,
    companyName: 'My Organization',
    supportEmail: '',
    supportPhone: '',
    currency: 'PKR',
    language: 'en',
    dateFormat: 'DD/MM/YYYY',
    timezone: 'Asia/Karachi',
    defaultDepreciationMethod: 'STRAIGHT_LINE',
    defaultUsefulLife: 5,
    autoGenerateAssetTag: true,
    enableEmailNotifications: false,
    warrantyAlertDays: 30,
    maintenanceAlertDays: 7,
    overdueCheckoutDays: 14,
    sessionTimeout: 480,
    maxLoginAttempts: 5,
    lockoutDuration: 15,
    defaultTheme: 'light',
    barcodeType: 'CODE128',
    barcodeWidth: 2,
    barcodeHeight: 50,
    showBarcodeLabel: true,
    maxFileSize: 10,
    allowedFileTypes: 'image/jpeg,image/png,image/webp',
  });

  const updateSetting = (key: keyof AppSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const json = await res.json();
      if (json.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setSaving(false);
    }
  };

  const sections = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'branding', label: 'Branding', icon: Building2 },
    { id: 'regional', label: 'Regional', icon: Globe },
    { id: 'assets', label: 'Assets', icon: List },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'barcode', label: 'Bulk QR Codes', icon: BarChart3 },
    { id: 'files', label: 'File Upload', icon: ImageIcon },
  ];

  // Fetch assets for bulk QR
  const fetchAssetsForQr = async (type: string) => {
    setLoadingQr(true);
    try {
      const endpoint = type === 'FURNITURE' ? '/api/furniture' : type === 'ELECTRONIC' ? '/api/electronics' : '/api/vehicles';
      const res = await fetch(`${endpoint}?page=1&limit=10000`);
      const json = await res.json();
      if (json.success) {
        setQrAssets(json.data.filter((a: any) => a.assetTag));
      }
    } catch (error) {
      console.error('Failed to fetch assets:', error);
    } finally {
      setLoadingQr(false);
    }
  };

  const handlePrintAllQr = () => {
    const container = document.getElementById('qr-container');
    if (!container) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const qrHtml = Array.from(container.querySelectorAll('.qr-label')).map((el) => el.innerHTML).join('<div style="page-break-after: always; margin-top: 30px;"></div>');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print All QR Codes</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .qr-label { text-align: center; margin-bottom: 20px; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; page-break-inside: avoid; }
            .label-title { font-size: 14px; font-weight: bold; margin-bottom: 8px; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <h1 style="text-align: center; margin-bottom: 30px;">Asset QR Codes - ${qrAssetType}</h1>
          ${qrHtml}
          <script>
            window.onload = function() { window.print(); window.close(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'general':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="form-section-heading text-lg font-semibold text-slate-900">General Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Site Name</label>
                  <input
                    type="text"
                    value={settings.siteName}
                    onChange={(e) => updateSetting('siteName', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Items Per Page</label>
                  <select
                    value={settings.itemsPerPage}
                    onChange={(e) => updateSetting('itemsPerPage', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Asset Tag Prefix</label>
                  <input
                    type="text"
                    value={settings.tagPrefix}
                    onChange={(e) => updateSetting('tagPrefix', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-slate-500 mt-1">Prefix for auto-generated asset tags</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.autoGenerateAssetTag}
                      onChange={(e) => updateSetting('autoGenerateAssetTag', e.target.checked)}
                      className="w-4 h-4"
                    />
                    Auto-generate Asset Tags
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case 'branding':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="form-section-heading text-lg font-semibold text-slate-900">Branding & Organization</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Organization Name</label>
                  <input
                    type="text"
                    value={settings.companyName}
                    onChange={(e) => updateSetting('companyName', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Support Email (Optional)</label>
                  <input
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => updateSetting('supportEmail', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Support Phone (Optional)</label>
                  <input
                    type="tel"
                    value={settings.supportPhone}
                    onChange={(e) => updateSetting('supportPhone', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'regional':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="form-section-heading text-lg font-semibold text-slate-900">Regional Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Currency</label>
                  <select
                    value={settings.currency}
                    onChange={(e) => updateSetting('currency', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="PKR">PKR - Pakistani Rupee (Rs.)</option>
                    <option value="USD">USD - US Dollar ($)</option>
                    <option value="EUR">EUR - Euro (€)</option>
                    <option value="GBP">GBP - British Pound (£)</option>
                    <option value="INR">INR - Indian Rupee (₹)</option>
                    <option value="AED">AED - UAE Dirham (د.إ)</option>
                    <option value="SAR">SAR - Saudi Riyal (﷼)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Date Format</label>
                  <select
                    value={settings.dateFormat}
                    onChange={(e) => updateSetting('dateFormat', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    <option value="DD-MMM-YYYY">DD-MMM-YYYY</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Language</label>
                  <select
                    value={settings.language}
                    onChange={(e) => updateSetting('language', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="en">English</option>
                    <option value="ur">Urdu</option>
                    <option value="ar">Arabic</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Timezone</label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => updateSetting('timezone', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Asia/Karachi">Asia/Karachi (PKT)</option>
                    <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                    <option value="America/New_York">America/New_York (EST)</option>
                    <option value="Europe/London">Europe/London (GMT)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 'assets':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="form-section-heading text-lg font-semibold text-slate-900">Asset Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Default Depreciation Method</label>
                  <select
                    value={settings.defaultDepreciationMethod}
                    onChange={(e) => updateSetting('defaultDepreciationMethod', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="STRAIGHT_LINE">Straight Line</option>
                    <option value="DECLINING_BALANCE">Declining Balance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Default Useful Life (Years)</label>
                  <input
                    type="number"
                    value={settings.defaultUsefulLife}
                    onChange={(e) => updateSetting('defaultUsefulLife', parseInt(e.target.value))}
                    min="1"
                    max="50"
                    className="w-full px-4 py-2 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="form-section-heading text-lg font-semibold text-slate-900">Notifications & Alerts</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200">
                  <div>
                    <p className="font-medium text-slate-900">Email Notifications</p>
                    <p className="text-sm text-slate-500">Send alerts via email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enableEmailNotifications}
                      onChange={(e) => updateSetting('enableEmailNotifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <AlertTriangle className="w-4 h-4 inline mr-2 text-amber-500" />
                      Warranty Alert (Days Before)
                    </label>
                    <input
                      type="number"
                      value={settings.warrantyAlertDays}
                      onChange={(e) => updateSetting('warrantyAlertDays', parseInt(e.target.value))}
                      min="1"
                      max="365"
                      className="w-full px-4 py-2 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-2 text-blue-500" />
                      Maintenance Reminder (Days Before)
                    </label>
                    <input
                      type="number"
                      value={settings.maintenanceAlertDays}
                      onChange={(e) => updateSetting('maintenanceAlertDays', parseInt(e.target.value))}
                      min="1"
                      max="90"
                      className="w-full px-4 py-2 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <AlertTriangle className="w-4 h-4 inline mr-2 text-red-500" />
                      Overdue Checkout Alert (Days)
                    </label>
                    <input
                      type="number"
                      value={settings.overdueCheckoutDays}
                      onChange={(e) => updateSetting('overdueCheckoutDays', parseInt(e.target.value))}
                      min="1"
                      max="60"
                      className="w-full px-4 py-2 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="form-section-heading text-lg font-semibold text-slate-900">Security Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Session Timeout (Minutes)</label>
                  <input
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value))}
                    min="15"
                    max="1440"
                    className="w-full px-4 py-2 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Max Login Attempts</label>
                  <input
                    type="number"
                    value={settings.maxLoginAttempts}
                    onChange={(e) => updateSetting('maxLoginAttempts', parseInt(e.target.value))}
                    min="3"
                    max="10"
                    className="w-full px-4 py-2 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Lockout Duration (Minutes)</label>
                  <input
                    type="number"
                    value={settings.lockoutDuration}
                    onChange={(e) => updateSetting('lockoutDuration', parseInt(e.target.value))}
                    min="5"
                    max="60"
                    className="w-full px-4 py-2 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'barcode':
        return (
          <div className="space-y-6">
            {/* Bulk QR Code Section */}
            <div>
              <h3 className="form-section-heading text-lg font-semibold text-slate-900">
                <Printer className="w-5 h-5 text-blue-600" />
                Bulk QR Codes
              </h3>
              
              {/* Asset Type Selector */}
              <div className="mb-6 p-4 bg-slate-50 border border-slate-200">
                <label className="block text-sm font-medium text-slate-700 mb-3">Select Asset Type</label>
                <div className="grid grid-cols-3 gap-3">
                  {['FURNITURE', 'ELECTRONIC', 'VEHICLE'].map((type) => (
                    <button
                      key={type}
                      onClick={() => { setQrAssetType(type); setQrAssets([]); }}
                      className={`p-3 border-2 text-sm font-semibold transition-all ${
                        qrAssetType === type
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {type === 'FURNITURE' ? '🪑' : type === 'ELECTRONIC' ? '💻' : '🚗'} {type}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => fetchAssetsForQr(qrAssetType)}
                  disabled={loadingQr}
                  className="btn btn-primary w-full mt-4"
                >
                  {loadingQr ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </span>
                  ) : (
                    'Load Assets for QR Codes'
                  )}
                </button>
              </div>

              {/* Barcode Preview & Print */}
              {qrAssets.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-slate-600">
                      <span className="font-semibold text-slate-900">{qrAssets.length}</span> assets with QR codes
                    </p>
                    <button
                      onClick={handlePrintAllQr}
                      className="btn btn-success"
                    >
                      <Download className="w-4 h-4" />
                      Print All QR Codes
                    </button>
                  </div>
                  
                  <div id="qr-container" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[600px] overflow-y-auto p-4 border border-slate-200">
                    {qrAssets.map((asset) => (
                      <div key={asset.id} className="qr-label bg-white border border-slate-200 p-3 text-center">
                        <p className="text-xs font-semibold text-slate-700 mb-2 truncate">{asset.assetName}</p>
                        <QRCode asset={{ id: asset.id, assetTag: asset.assetTag, assetName: asset.assetName, type: qrAssetType }} size={120} showDownload={false} />
                        <p className="text-[10px] font-mono text-slate-500 mt-1">{asset.assetTag}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {qrAssets.length === 0 && !loadingQr && (
                <div className="text-center py-12 text-slate-400">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                  <p>No assets loaded</p>
                  <p className="text-xs mt-1">Click "Load Assets" to generate QR codes</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'files':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="form-section-heading text-lg font-semibold text-slate-900">File Upload Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Max File Size (MB)</label>
                  <input
                    type="number"
                    value={settings.maxFileSize}
                    onChange={(e) => updateSetting('maxFileSize', parseInt(e.target.value))}
                    min="1"
                    max="50"
                    className="w-full px-4 py-2 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
      <PageHeader
        title="System Settings"
        subtitle="Configure all system preferences and options"
        icon={Settings}
        badge="Configuration"
        gradientFrom="from-slate-100"
        gradientTo="to-gray-100"
        iconColor="text-slate-600"
        actions={
          <button
            onClick={handleSave}
            disabled={saving}
            className={`btn ${saved ? 'btn-success' : 'btn-primary'}`}
          >
            {saved ? (
              <>
                <CheckCircle className="w-5 h-5" />
                Saved!
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {saving ? 'Saving...' : 'Save Settings'}
              </>
            )}
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h3 className="font-semibold text-slate-900">Settings Sections</h3>
            </div>
            <nav className="divide-y divide-slate-100">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all ${
                      activeSection === section.id
                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                        : 'text-slate-700 hover:bg-slate-50 border-l-4 border-transparent'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {section.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-slate-200 p-8">
            {renderSection()}
          </div>
        </div>
      </div>
      </div>
    </DashboardLayout>
  );
}

