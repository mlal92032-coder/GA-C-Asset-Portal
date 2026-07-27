'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Package, MapPin, Building2, Calendar, Tag, User, AlertCircle } from 'lucide-react';

interface AssetInfo {
  id: string; assetTag: string | null; assetName: string; type: string;
  condition?: string; status?: string; purchaseDate?: string; purchasePrice?: number;
  company?: string; location?: string; assignedTo?: string; manufacturer?: string;
  serialNumber?: string; model?: string; brand?: string; registrationNumber?: string;
  furnitureType?: string; deviceType?: string; vehicleType?: string;
  material?: string; engineNumber?: string; fuelType?: string;
}

export default function QRDetailPage() {
  const params = useParams();
  const assetId = params?.assetId as string;
  const [asset, setAsset] = useState<AssetInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/qr/${assetId}`)
      .then(r => r.json())
      .then(j => { if (j.success) setAsset(j.data); else setError(j.error || 'Asset not found'); })
      .catch(() => setError('Failed to load asset'))
      .finally(() => setLoading(false));
  }, [assetId]);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-2" />
        <h2 className="text-xl font-bold text-slate-800 mb-1">Asset Not Found</h2>
        <p className="text-sm text-slate-500">{error}</p>
      </div>
    </div>
  );

  if (!asset) return null;

  const getTypeIcon = () => {
    if (asset.vehicleType) return '🚗';
    if (asset.deviceType) return '💻';
    return '🪑';
  };

  const getTypeLabel = () => {
    if (asset.vehicleType) return asset.vehicleType;
    if (asset.deviceType) return asset.deviceType;
    return asset.furnitureType || asset.type;
  };

  const formatStatus = (s?: string) => s?.replace('_', ' ') || '-';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-1.5 sm:px-2 lg:px-3 py-6">
        <div className="w-full max-w-lg mx-auto">
          <div className="flex items-center gap-1.5 mb-1">
            <Package className="w-4 h-4 text-blue-200" />
            <span className="text-blue-200 text-xs font-medium uppercase tracking-wide">{getTypeLabel()}</span>
          </div>
          <h1 className="text-2xl font-bold text-white">{asset.assetName}</h1>
          {asset.assetTag && <p className="text-blue-200 text-sm font-mono mt-1">{asset.assetTag}</p>}
        </div>
      </div>

      {/* Content */}
      <div className="w-full max-w-lg mx-auto px-1.5 sm:px-2 lg:px-3 py-5 space-y-2">
        {/* Status Row */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white rounded-xl p-4 border border-slate-100">
            <p className="text-xs text-slate-400 mb-1">Condition</p>
            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
              asset.condition === 'GOOD' ? 'bg-emerald-50 text-emerald-700' :
              asset.condition === 'REPAIR' ? 'bg-amber-50 text-amber-700' :
              'bg-red-50 text-red-700'
            }`}>{asset.condition || '-'}</span>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-100">
            <p className="text-xs text-slate-400 mb-1">Status</p>
            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
              asset.status === 'IN_USE' ? 'bg-blue-50 text-blue-700' :
              asset.status === 'IN_STORE' ? 'bg-emerald-50 text-emerald-700' :
              'bg-slate-100 text-slate-600'
            }`}>{formatStatus(asset.status)}</span>
          </div>
        </div>

        {/* Details */}
        <div className="bg-white rounded-xl border border-slate-100 divide-y divide-slate-50">
          {asset.location && (
            <div className="flex items-center gap-2 px-4 py-3">
              <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <div><p className="text-xs text-slate-400">Location</p><p className="text-sm font-medium text-slate-700">{asset.location}</p></div>
            </div>
          )}
          {asset.company && (
            <div className="flex items-center gap-2 px-4 py-3">
              <Building2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <div><p className="text-xs text-slate-400">Office</p><p className="text-sm font-medium text-slate-700">{asset.company}</p></div>
            </div>
          )}
          {asset.assignedTo && (
            <div className="flex items-center gap-2 px-4 py-3">
              <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <div><p className="text-xs text-slate-400">Assigned To</p><p className="text-sm font-medium text-slate-700">{asset.assignedTo}</p></div>
            </div>
          )}
          {asset.purchaseDate && (
            <div className="flex items-center gap-2 px-4 py-3">
              <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <div><p className="text-xs text-slate-400">Purchase Date</p><p className="text-sm font-medium text-slate-700">{new Date(asset.purchaseDate).toLocaleDateString('en-PK')}</p></div>
            </div>
          )}
          {asset.purchasePrice && (
            <div className="flex items-center gap-2 px-4 py-3">
              <Tag className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <div><p className="text-xs text-slate-400">Price</p><p className="text-sm font-medium text-slate-700">Rs. {asset.purchasePrice.toLocaleString()}</p></div>
            </div>
          )}
          {asset.brand && (
            <div className="flex items-center gap-2 px-4 py-3">
              <span className="text-lg flex-shrink-0">{getTypeIcon()}</span>
              <div><p className="text-xs text-slate-400">Brand</p><p className="text-sm font-medium text-slate-700">{asset.brand}{asset.model ? ` - ${asset.model}` : ''}</p></div>
            </div>
          )}
          {asset.serialNumber && (
            <div className="flex items-center gap-2 px-4 py-3">
              <Tag className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <div><p className="text-xs text-slate-400">Serial No.</p><p className="text-sm font-medium text-slate-700">{asset.serialNumber}</p></div>
            </div>
          )}
          {asset.registrationNumber && (
            <div className="flex items-center gap-2 px-4 py-3">
              <Tag className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <div><p className="text-xs text-slate-400">Registration</p><p className="text-sm font-medium text-slate-700">{asset.registrationNumber}</p></div>
            </div>
          )}
          {asset.engineNumber && (
            <div className="flex items-center gap-2 px-4 py-3">
              <Tag className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <div><p className="text-xs text-slate-400">Engine</p><p className="text-sm font-medium text-slate-700">{asset.engineNumber}</p></div>
            </div>
          )}
          {asset.manufacturer && (
            <div className="flex items-center gap-2 px-4 py-3">
              <Building2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <div><p className="text-xs text-slate-400">Manufacturer</p><p className="text-sm font-medium text-slate-700">{asset.manufacturer}</p></div>
            </div>
          )}
        </div>

        <p className="text-center text-[11px] text-slate-400 pt-1">Scanned via QR • {new Date().toLocaleDateString('en-PK')}</p>
      </div>
    </div>
  );
}