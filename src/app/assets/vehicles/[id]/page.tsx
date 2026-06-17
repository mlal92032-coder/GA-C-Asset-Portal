'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import CheckoutModal, { CheckinModal } from '@/components/CheckoutModal';
import BarcodeComponent from '@/components/Barcode';
import ReviewSection from '@/components/ReviewSection';
import MaintenanceSection from '@/components/MaintenanceSection';
import { buildImageUrl } from '@/lib/image-upload';
import { getCurrentBookValue, formatCurrency } from '@/lib/depreciation';
import {
  ArrowLeft,
  Edit,
  Trash2,
  ArrowUpCircle,
  ArrowDownCircle,
  MapPin,
  Building2,
  User,
  Calendar,
  DollarSign,
  Package,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingDown,
  Copy,
  Car,
} from 'lucide-react';
import { format, isBefore } from 'date-fns';

interface VehicleDetail {
  id: string;
  assetTag: string | null;
  assetName: string;
  imageUrl: string | null;
  vehicleType: string | null;
  brand: string | null;
  model: string | null;
  registrationNumber: string;
  engineNumber: string | null;
  fuelType: string | null;
  purchaseDate: string | null;
  purchasePrice: number | null;
  companyId: string | null;
  manufacturerId: string | null;
  locationId: string | null;
  assignedUserId: string | null;
  condition: string;
  status: string;
  lastServiceDate: string | null;
  insuranceExpiryDate: string | null;
  remarks: string | null;
  usefulLifeYears: number | null;
  salvageValue: number | null;
  depreciationMethod: string | null;
  createdAt: string;
  updatedAt: string;
  company: { id: string; companyName: string } | null;
  manufacturer: { id: string; manufacturerName: string } | null;
  location: { id: string; locationName: string } | null;
  assignedUser: { id: string; fullName: string; email: string } | null;
}

interface User {
  id: string;
  fullName: string;
  email: string;
}

export default function VehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [asset, setAsset] = useState<VehicleDetail | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCheckedOut, setIsCheckedOut] = useState(false);
  const [checkoutId, setCheckoutId] = useState<string | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showCheckin, setShowCheckin] = useState(false);
  const [currentBookValue, setCurrentBookValue] = useState<number | null>(null);
  const [imageError, setImageError] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [maintenances, setMaintenances] = useState<any[]>([]);

  useEffect(() => {
    fetchAssetDetail();
    fetchUsers();
    fetchCheckedOutStatus();
    fetchReviews();
    fetchMaintenances();
  }, [id]);

  const fetchAssetDetail = async () => {
    try {
      const res = await fetch(`/api/vehicles/${id}`);
      const json = await res.json();
      if (json.success) {
        setAsset(json.data);
        calculateCurrentValue(json.data);
      } else {
        setError(json.error || 'Failed to fetch asset details');
      }
    } catch {
      setError('Failed to fetch asset details');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const json = await res.json();
      if (json.success) {
        setUsers(json.data);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchCheckedOutStatus = async () => {
    try {
      const res = await fetch('/api/assets/checked-out');
      const json = await res.json();
      if (json.success) {
        const checkout = json.data.find((c: any) =>
          c.assetId === id && c.assetType === 'VEHICLE' && !c.checkInDate
        );
        if (checkout) {
          setIsCheckedOut(true);
          setCheckoutId(checkout.id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch checkout status:', error);
    }
  };

  const calculateCurrentValue = (assetData: VehicleDetail) => {
    if (!assetData.purchasePrice || !assetData.purchaseDate || !assetData.usefulLifeYears) {
      setCurrentBookValue(null);
      return;
    }

    const purchaseDate = new Date(assetData.purchaseDate);
    const result = getCurrentBookValue(
      assetData.purchasePrice,
      purchaseDate,
      assetData.usefulLifeYears,
      assetData.salvageValue || 0,
      assetData.depreciationMethod || 'STRAIGHT_LINE'
    );

    setCurrentBookValue(result.currentBookValue);
  };

  const handleCheckoutSuccess = () => {
    setShowCheckout(false);
    fetchCheckedOutStatus();
    fetchAssetDetail();
  };

  const handleCheckinSuccess = () => {
    setShowCheckin(false);
    fetchCheckedOutStatus();
    fetchAssetDetail();
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews?assetId=${id}&assetType=VEHICLE`);
      if (!res.ok) return;
      const json = await res.json();
      if (json.success) {
        setReviews(json.data);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    }
  };

  const fetchMaintenances = async () => {
    try {
      const res = await fetch(`/api/maintenance?assetId=${id}&assetType=VEHICLE`);
      if (!res.ok) return;
      const json = await res.json();
      if (json.success) {
        setMaintenances(json.data);
      }
    } catch (error) {
      console.error('Failed to fetch maintenances:', error);
    }
  };

  const copyAssetTag = () => {
    if (asset?.assetTag) {
      navigator.clipboard.writeText(asset.assetTag);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_USE':
        return 'from-blue-500 to-blue-600';
      case 'IN_STORE':
        return 'from-emerald-500 to-emerald-600';
      case 'DISPOSED':
        return 'from-gray-500 to-gray-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'GOOD':
        return 'from-emerald-500 to-emerald-600';
      case 'REPAIR':
        return 'from-amber-500 to-amber-600';
      case 'DAMAGED':
        return 'from-red-500 to-red-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getConditionIcon = (condition: string) => {
    switch (condition) {
      case 'GOOD':
        return <CheckCircle className="w-4 h-4" />;
      case 'REPAIR':
        return <AlertTriangle className="w-4 h-4" />;
      case 'DAMAGED':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const isInsuranceExpired = (date?: string | null) => {
    if (!date) return false;
    return isBefore(new Date(date), new Date());
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 animate-pulse">
          <div className="h-8 bg-slate-200 w-1/4" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-slate-200" />
            ))}
          </div>
          <div className="h-96 bg-slate-200" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !asset) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center mb-6 shadow-lg">
            <AlertTriangle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Asset Not Found</h2>
          <p className="text-slate-500 mb-6 text-center max-w-md">
            {error || 'The asset you\'re looking for doesn\'t exist or has been removed.'}
          </p>
          <button
            onClick={() => router.push('/assets/vehicles')}
            className="btn btn-warning"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Vehicles
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
      {/* Header with Image */}
      <div className="mb-8">
        {/* Asset Image */}
        {(buildImageUrl(asset.imageUrl) && !imageError) && (
          <div className="mb-4">
            <img
              src={buildImageUrl(asset.imageUrl)!}
              alt={asset.assetName}
              className="w-40 h-40 object-cover border-2 border-slate-200 shadow-lg rounded-lg"
              onError={() => setImageError(true)}
            />
          </div>
        )}
        {(!buildImageUrl(asset.imageUrl) || imageError) && (
          <div className="mb-4">
            <div className="w-40 h-40 bg-gradient-to-br from-slate-100 to-slate-200 border-2 border-slate-200 shadow-lg rounded-lg flex items-center justify-center">
              <Car className="w-16 h-16 text-slate-400" />
            </div>
          </div>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/assets/vehicles')}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{asset.assetName}</h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="font-mono text-sm text-slate-600 bg-slate-100 px-3 py-1">
                  {asset.assetTag || 'No tag assigned'}
                </span>
                <button
                  onClick={copyAssetTag}
                  className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded transition-all"
                  title="Copy asset tag"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isCheckedOut && checkoutId ? (
              <button
                onClick={() => setShowCheckin(true)}
                className="btn btn-success"
              >
                <ArrowDownCircle className="w-5 h-5" />
                Check In
              </button>
            ) : (
              <button
                onClick={() => setShowCheckout(true)}
                className="btn btn-primary"
              >
                <ArrowUpCircle className="w-5 h-5" />
                Check Out
              </button>
            )}
            <button
              onClick={() => router.push(`/assets/vehicles?edit=${asset.id}`)}
              className="btn btn-secondary"
            >
              <Edit className="w-5 h-5" />
              Edit
            </button>
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Status */}
        <div className="bg-white border border-slate-200 p-6 hover:shadow-lg transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 bg-gradient-to-br ${getStatusColor(asset.status)} flex items-center justify-center`}>
              <Clock className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mb-1">Status</p>
          <p className="text-lg font-bold text-slate-900">{asset.status.replace('_', ' ')}</p>
        </div>

        {/* Condition */}
        <div className="bg-white border border-slate-200 p-6 hover:shadow-lg transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 bg-gradient-to-br ${getConditionColor(asset.condition)} flex items-center justify-center`}>
              {getConditionIcon(asset.condition)}
            </div>
          </div>
          <p className="text-xs text-slate-500 mb-1">Condition</p>
          <p className="text-lg font-bold text-slate-900">{asset.condition}</p>
        </div>

        {/* Current Value */}
        <div className="bg-white border border-slate-200 p-6 hover:shadow-lg transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mb-1">Current Book Value</p>
          <p className="text-lg font-bold text-slate-900">
            {currentBookValue !== null ? formatCurrency(currentBookValue) : 'N/A'}
          </p>
        </div>

        {/* Purchase Price */}
        <div className="bg-white border border-slate-200 p-6 hover:shadow-lg transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mb-1">Purchase Price</p>
          <p className="text-lg font-bold text-slate-900">
            {asset.purchasePrice ? formatCurrency(asset.purchasePrice) : 'N/A'}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Details */}
        <div className="lg:col-span-2 bg-white border border-slate-200 p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Asset Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Vehicle Type</label>
              <p className="font-semibold text-slate-900">{asset.vehicleType || '-'}</p>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Brand</label>
              <p className="font-semibold text-slate-900">{asset.brand || '-'}</p>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Model</label>
              <p className="font-semibold text-slate-900">{asset.model || '-'}</p>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Registration Number</label>
              <p className="font-semibold text-slate-900">{asset.registrationNumber}</p>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Engine Number</label>
              <p className="font-semibold text-slate-900">{asset.engineNumber || '-'}</p>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Fuel Type</label>
              <p className="font-semibold text-slate-900">{asset.fuelType || '-'}</p>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block flex items-center gap-2">
                <Building2 className="w-3 h-3" />
                Office
              </label>
              <p className="font-semibold text-slate-900">{asset.company?.companyName || '-'}</p>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block flex items-center gap-2">
                <Shield className="w-3 h-3" />
                Manufacturer
              </label>
              <p className="font-semibold text-slate-900">{asset.manufacturer?.manufacturerName || '-'}</p>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block flex items-center gap-2">
                <MapPin className="w-3 h-3" />
                Location
              </label>
              <p className="font-semibold text-slate-900">{asset.location?.locationName || '-'}</p>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block flex items-center gap-2">
                <User className="w-3 h-3" />
                Assigned To
              </label>
              <p className="font-semibold text-slate-900">{asset.assignedUser?.fullName || 'Unassigned'}</p>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                Purchase Date
              </label>
              <p className="font-semibold text-slate-900">
                {asset.purchaseDate ? format(new Date(asset.purchaseDate), 'PPP') : '-'}
              </p>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                Insurance Expiry
              </label>
              <p className="font-semibold text-slate-900">
                {asset.insuranceExpiryDate
                  ? isInsuranceExpired(asset.insuranceExpiryDate)
                    ? <span className="text-red-600">Expired</span>
                    : format(new Date(asset.insuranceExpiryDate), 'PPP')
                  : '-'}
              </p>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Last Service Date</label>
              <p className="font-semibold text-slate-900">
                {asset.lastServiceDate ? format(new Date(asset.lastServiceDate), 'PPP') : '-'}
              </p>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Useful Life</label>
              <p className="font-semibold text-slate-900">
                {asset.usefulLifeYears ? `${asset.usefulLifeYears} years` : '-'}
              </p>
            </div>
          </div>

          {asset.remarks && (
            <div className="mt-6 pt-6 border-t border-slate-200">
              <label className="text-xs text-slate-500 mb-2 block">Remarks</label>
              <p className="text-slate-700 whitespace-pre-wrap">{asset.remarks}</p>
            </div>
          )}
        </div>

        {/* Barcode & QR */}
        <div className="bg-white border border-slate-200 p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Barcode</h2>
          {asset.assetTag ? (
            <div className="flex flex-col items-center">
              <BarcodeComponent value={asset.assetTag} />
              <p className="text-sm text-slate-600 mt-4 font-mono">{asset.assetTag}</p>
              <button
                onClick={copyAssetTag}
                className="btn btn-secondary btn-sm mt-4"
              >
                <Copy className="w-4 h-4" />
                Copy Tag
              </button>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <Car className="w-12 h-12 mx-auto mb-2 text-slate-300" />
              <p className="text-sm">No barcode generated</p>
            </div>
          )}
        </div>
      </div>

      {/* Metadata */}
      <div className="mt-6 bg-white border border-slate-200 p-8">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Metadata</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-500">Created:</span>{' '}
            <span className="font-semibold text-slate-900">
              {format(new Date(asset.createdAt), 'PPP pp')}
            </span>
          </div>
          <div>
            <span className="text-slate-500">Last Updated:</span>{' '}
            <span className="font-semibold text-slate-900">
              {format(new Date(asset.updatedAt), 'PPP pp')}
            </span>
          </div>
          <div>
            <span className="text-slate-500">Asset ID:</span>{' '}
            <span className="font-mono font-semibold text-slate-900">{asset.id}</span>
          </div>
        </div>
      </div>

      {/* Maintenance Section */}
      <div className="mt-6">
        <MaintenanceSection
          assetId={asset.id}
          assetType="VEHICLE"
          maintenances={maintenances}
        />
      </div>

      {/* Reviews Section */}
      <div className="mt-6">
        <ReviewSection
          assetId={asset.id}
          assetType="VEHICLE"
          reviews={reviews}
          currentUserId={undefined}
        />
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <CheckoutModal
          assetId={asset.id}
          assetName={asset.assetName}
          assetType="VEHICLE"
          users={users}
          onClose={() => setShowCheckout(false)}
          onSuccess={handleCheckoutSuccess}
        />
      )}

      {/* Checkin Modal */}
      {showCheckin && checkoutId && (
        <CheckinModal
          checkoutId={checkoutId}
          assetName={asset.assetName}
          onClose={() => setShowCheckin(false)}
          onSuccess={handleCheckinSuccess}
        />
      )}
      </div>
    </DashboardLayout>
  );
}
