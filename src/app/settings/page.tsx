'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import PageHeader from '@/components/PageHeader';
import {
  Settings as SettingsIcon, Save, Database, Lock, Users, AlertCircle, CheckCircle,
  Download, Upload, RefreshCw, Bell, Shield, Trash2, Plus, Search, Clock, Activity,
  QrCode, BarChart3, HardDrive, Zap, Package
} from 'lucide-react';

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('qr');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(false);

  // QR Code States
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [allAssets, setAllAssets] = useState<any[]>([]);
  const [assetsLoading, setAssetsLoading] = useState(true);
  const [assetsError, setAssetsError] = useState<string | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  // General Settings
  const [companyName, setCompanyName] = useState('Sindh Education Foundation');
  const [companyEmail, setCompanyEmail] = useState('admin@company.com');
  const [companyPhone, setCompanyPhone] = useState('+92 300 1234567');

  // System Stats
  const [systemStats, setSystemStats] = useState({
    totalAssets: 0,
    totalUsers: 0,
    lastBackup: '2 hours ago',
    systemUptime: '15 days',
    databaseSize: '245 MB'
  });

  // Fetch real assets from database
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setAssetsLoading(true);
        setAssetsError(null);

        const [furnitureRes, electronicsRes, vehiclesRes] = await Promise.all([
          fetch('/api/furniture?page=1&limit=10000'),
          fetch('/api/electronics?page=1&limit=10000'),
          fetch('/api/vehicles?page=1&limit=10000'),
        ]);

        if (!furnitureRes.ok || !electronicsRes.ok || !vehiclesRes.ok) {
          throw new Error('Failed to fetch assets from API');
        }

        const furnitureData = await furnitureRes.json();
        const electronicsData = await electronicsRes.json();
        const vehiclesData = await vehiclesRes.json();

        const transformedAssets: any[] = [];

        if (furnitureData?.data && Array.isArray(furnitureData.data)) {
          furnitureData.data.forEach((asset: any) => {
            if (asset.assetTag && asset.assetName) {
              transformedAssets.push({
                id: asset.assetTag,
                name: asset.assetName,
                category: 'FURNITURE',
                status: asset.status || 'Unknown',
                location: asset.location?.locationName || 'Unknown',
                icon: '🪑',
              });
            }
          });
        }

        if (electronicsData?.data && Array.isArray(electronicsData.data)) {
          electronicsData.data.forEach((asset: any) => {
            if (asset.assetTag && asset.assetName) {
              transformedAssets.push({
                id: asset.assetTag,
                name: asset.assetName,
                category: 'ELECTRONICS',
                status: asset.status || 'Unknown',
                location: asset.location?.locationName || 'Unknown',
                icon: '💻',
              });
            }
          });
        }

        if (vehiclesData?.data && Array.isArray(vehiclesData.data)) {
          vehiclesData.data.forEach((asset: any) => {
            if (asset.assetTag && asset.assetName) {
              transformedAssets.push({
                id: asset.assetTag,
                name: asset.assetName,
                category: 'VEHICLES',
                status: asset.status || 'Unknown',
                location: asset.location?.locationName || 'Unknown',
                icon: '🚗',
              });
            }
          });
        }

        setAllAssets(transformedAssets);
        setSystemStats(prev => ({
          ...prev,
          totalAssets: transformedAssets.length
        }));
      } catch (error: any) {
        setAssetsError(error.message || 'Failed to load assets');
      } finally {
        setAssetsLoading(false);
      }
    };

    fetchAssets();
  }, []);

  const uniqueLocations = Array.from(new Set(allAssets.map(a => a.location)));

  const filteredAssets = allAssets.filter(asset => {
    if (filterCategory !== 'all' && asset.category !== filterCategory) return false;
    if (filterStatus !== 'all' && asset.status !== filterStatus) return false;
    if (filterLocation !== 'all' && asset.location !== filterLocation) return false;
    return true;
  });

  const toggleAsset = (assetId: string) => {
    setSelectedAssets(prev =>
      prev.includes(assetId) ? prev.filter(id => id !== assetId) : [...prev, assetId]
    );
  };

  const handleSelectAll = () => {
    setSelectedAssets(filteredAssets.map(a => a.id));
  };

  const handleDownloadSingleQR = (assetId: string, assetName: string) => {
    setMessage({ text: `📱 Generating QR for ${assetId}...`, type: 'success' });
    setLoading(true);

    setTimeout(() => {
      try {
        const qrValue = `${assetId}|${assetName}`;
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>QR Code - ${assetId}</title>
  <style>
    body { font-family: Arial, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f0f0f0; }
    .container { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); text-align: center; }
    h1 { color: #2563eb; margin: 0 0 10px 0; }
    img { border: 2px solid #2563eb; padding: 10px; background: white; }
    p { color: #666; font-size: 12px; margin: 15px 0 0 0; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${assetId}</h1>
    <p>${assetName}</p>
    <img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrValue)}" alt="QR Code" />
    <p>Scan this QR code to view asset details</p>
  </div>
</body>
</html>`;

        const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `qr-${assetId}.html`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setMessage({ text: `✅ Downloaded QR for ${assetId}!`, type: 'success' });
        setLoading(false);
      } catch (error) {
        setMessage({ text: `❌ Failed to download QR`, type: 'error' });
        setLoading(false);
      }
    }, 800);
  };

  const handleDownloadQR = () => {
    if (selectedAssets.length === 0) {
      setMessage({ text: 'Please select at least one asset', type: 'error' });
      return;
    }

    const selectedAssetObjects = allAssets.filter(a => selectedAssets.includes(a.id));

    let printContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Print QR Labels</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 10px; }
    .label { display: inline-block; width: 120px; height: 150px; border: 1px solid #ccc; padding: 10px; margin: 5px; text-align: center; page-break-inside: avoid; }
    .label img { width: 80px; height: 80px; }
    .label p { margin: 5px 0; font-size: 10px; }
  </style>
</head>
<body>
  <div style="text-align: center; margin-bottom: 20px;">
    <h1>QR Code Labels - ${new Date().toLocaleDateString()}</h1>
  </div>
  <div>`;

    selectedAssetObjects.forEach(asset => {
      const qrValue = `${asset.id}|${asset.name}`;
      printContent += `
    <div class="label">
      <p><strong>${asset.id}</strong></p>
      <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(qrValue)}" alt="QR Code" />
      <p>${asset.name.substring(0, 15)}</p>
    </div>`;
    });

    printContent += `
  </div>
  <script>
    setTimeout(() => window.print(), 500);
  </script>
</body>
</html>`;

    const blob = new Blob([printContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const tabConfig = [
    { id: 'qr', label: 'QR Codes', icon: QrCode },
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'backup', label: 'Backup', icon: Database },
    { id: 'users', label: 'Users', icon: Users },
  ];

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <PageHeader
          title="System Settings"
          subtitle="Configure system, security, and QR codes"
          icon={SettingsIcon}
          gradientFrom="from-blue-600"
          gradientTo="to-indigo-900"
        />

        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-lg border flex items-center gap-3 ${
              message.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            {message.text}
          </motion.div>
        )}

        {/* System Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          {[
            { label: 'Total Assets', value: systemStats.totalAssets, icon: Package, color: 'from-blue-500 to-blue-600' },
            { label: 'Total Users', value: systemStats.totalUsers, icon: Users, color: 'from-purple-500 to-purple-600' },
            { label: 'System Uptime', value: systemStats.systemUptime, icon: Zap, color: 'from-green-500 to-green-600' },
            { label: 'Last Backup', value: systemStats.lastBackup, icon: Database, color: 'from-orange-500 to-orange-600' },
            { label: 'DB Size', value: systemStats.databaseSize, icon: HardDrive, color: 'from-pink-500 to-pink-600' },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -4 }}
              className={`bg-gradient-to-br ${stat.color} text-white rounded-lg p-4 shadow-md`}
            >
              <div className="flex items-center justify-between mb-2">
                <stat.icon className="w-5 h-5 opacity-80" />
              </div>
              <p className="text-sm opacity-90">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="flex border-b border-slate-200 overflow-x-auto">
            {tabConfig.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                type="button"
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* QR Codes Tab */}
            {activeTab === 'qr' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                {/* Filters */}
                <div className="bg-white rounded-lg border border-slate-200 p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Filter Assets</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase">Category</label>
                      <select
                        value={filterCategory}
                        onChange={(e) => { setFilterCategory(e.target.value); setSelectedAssets([]); }}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="all">All Categories</option>
                        <option value="FURNITURE">🪑 Furniture</option>
                        <option value="ELECTRONICS">💻 Electronics</option>
                        <option value="VEHICLES">🚗 Vehicles</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase">Status</label>
                      <select
                        value={filterStatus}
                        onChange={(e) => { setFilterStatus(e.target.value); setSelectedAssets([]); }}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="all">All Status</option>
                        <option value="IN_USE">In Use</option>
                        <option value="IN_STORE">In Store</option>
                        <option value="DISPOSED">Disposed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase">Location</label>
                      <select
                        value={filterLocation}
                        onChange={(e) => { setFilterLocation(e.target.value); setSelectedAssets([]); }}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="all">All Locations</option>
                        {uniqueLocations.map(location => (
                          <option key={location} value={location}>{location}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Select/Clear Buttons */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="px-4 py-2 bg-blue-50 border border-blue-300 text-blue-700 font-semibold rounded-lg hover:bg-blue-100 active:scale-95 transition-all text-sm cursor-pointer"
                    >
                      ✓ Select All
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedAssets([])}
                      className="px-4 py-2 bg-slate-50 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 active:scale-95 transition-all text-sm cursor-pointer"
                    >
                      ✕ Clear All
                    </button>
                    <div className="flex-1"></div>
                    <span className="text-sm text-slate-600 font-semibold self-center">
                      {selectedAssets.length} selected of {filteredAssets.length}
                    </span>
                  </div>
                </div>

                {/* Assets Grid */}
                <div className="bg-white rounded-lg border border-slate-200 p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Assets ({filteredAssets.length})</h3>

                  {assetsLoading ? (
                    <div className="text-center py-12">
                      <div className="w-10 h-10 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-sm text-slate-500">Loading assets...</p>
                    </div>
                  ) : assetsError ? (
                    <div className="text-center py-12 bg-red-50 border border-red-200 rounded-lg p-4">
                      <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
                      <p className="text-red-700 font-semibold mb-2">Error Loading Assets</p>
                      <p className="text-sm text-red-600">{assetsError}</p>
                    </div>
                  ) : filteredAssets.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                      <QrCode className="w-12 h-12 mx-auto mb-4 opacity-30" />
                      <p>No assets found matching your filters</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {filteredAssets.map((asset) => (
                        <motion.div
                          key={asset.id}
                          whileHover={{ y: -4 }}
                          className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all bg-white shadow-sm hover:shadow-lg ${
                            selectedAssets.includes(asset.id)
                              ? 'border-blue-500 bg-blue-50 shadow-md'
                              : 'border-slate-200 hover:border-blue-400'
                          }`}
                          onClick={() => toggleAsset(asset.id)}
                        >
                          <div className="absolute top-3 right-3 z-10">
                            <input
                              type="checkbox"
                              checked={selectedAssets.includes(asset.id)}
                              onChange={() => toggleAsset(asset.id)}
                              className="w-5 h-5 accent-blue-600 cursor-pointer"
                            />
                          </div>

                          <div className="flex justify-center items-center mb-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg h-32 p-2 border border-slate-200 overflow-hidden">
                            {failedImages.has(asset.id) ? (
                              <div className="text-center">
                                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 mb-2">
                                  <QrCode className="w-10 h-10 text-white mx-auto" />
                                </div>
                                <p className="text-xs text-slate-600 font-semibold">{asset.id}</p>
                              </div>
                            ) : (
                              <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(`${asset.id}|${asset.name}`)}`}
                                alt={`QR-${asset.id}`}
                                className="w-28 h-28 object-contain"
                                onLoad={() => setLoadedImages(prev => new Set([...prev, asset.id]))}
                                onError={() => setFailedImages(prev => new Set([...prev, asset.id]))}
                              />
                            )}
                          </div>

                          <div className="text-center mb-3">
                            <p className="text-xs font-bold text-blue-600 truncate">{asset.id}</p>
                            <p className="text-xs text-slate-700 font-semibold line-clamp-2">{asset.name}</p>
                            <p className="text-xs text-slate-500 mt-1">{asset.category}</p>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadSingleQR(asset.id, asset.name);
                            }}
                            className="w-full px-2 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-semibold rounded-lg hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Download className="w-3 h-3" />
                            Download
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Download Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200 p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Download className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">Bulk Download</h4>
                        <p className="text-xs text-slate-600 mt-1">Download selected QRs as HTML</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleDownloadQR}
                      disabled={loading || selectedAssets.length === 0}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-2 px-4 rounded-lg hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      {loading ? 'Generating...' : `Download ${selectedAssets.length} QRs`}
                    </button>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200 p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">Print Labels</h4>
                        <p className="text-xs text-slate-600 mt-1">Print selected QR codes</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleDownloadQR}
                      disabled={selectedAssets.length === 0}
                      className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-2 px-4 rounded-lg hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm cursor-pointer"
                    >
                      🖨️ Print {selectedAssets.length} Labels
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* General Settings Tab */}
            {activeTab === 'general' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-3xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Company Name</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Company Email</label>
                    <input
                      type="email"
                      value={companyEmail}
                      onChange={(e) => setCompanyEmail(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Company Phone</label>
                    <input
                      type="tel"
                      value={companyPhone}
                      onChange={(e) => setCompanyPhone(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </motion.div>
            )}

            {/* Other Tabs (simplified) */}
            {activeTab === 'security' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl">
                <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                  <h3 className="font-bold text-slate-900 mb-4">Security Settings</h3>
                  <p className="text-slate-600 text-sm">Password policies and session management</p>
                </div>
              </motion.div>
            )}

            {activeTab === 'backup' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl space-y-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
                  <h3 className="font-bold text-slate-900 mb-3">Manual Backup</h3>
                  <button
                    type="button"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    Backup Now
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'users' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl">
                <div className="space-y-3">
                  {[
                    { name: 'System Administrator', email: 'admin@company.com', role: 'SUPER_ADMIN' },
                    { name: 'Asset Manager', email: 'manager@company.com', role: 'ADMIN' },
                  ].map((user, idx) => (
                    <div key={idx} className="bg-slate-50 rounded-lg p-4 border border-slate-200 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{user.name}</p>
                        <p className="text-sm text-slate-600">{user.email}</p>
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold">{user.role}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

const FileText = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);
