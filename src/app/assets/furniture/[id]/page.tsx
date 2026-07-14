'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import CheckoutModal, { CheckinModal } from '@/components/CheckoutModal';
import QRCode from '@/components/QRCode';
import ReviewSection from '@/components/ReviewSection';
import MaintenanceSection from '@/components/MaintenanceSection';
import { buildImageUrl } from '@/lib/image-upload';
import { getCurrentBookValue, formatCurrency } from '@/lib/depreciation';
import {
  ArrowLeft,
  Edit,
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
  Download,
  Upload,
  FileText,
  Trash2 as TrashIcon,
  QrCode,
} from 'lucide-react';
import { format } from 'date-fns';

interface FurnitureDetail {
  id: string;
  assetTag: string | null;
  serialNumber: string | null;
  assetName: string;
  imageUrl: string | null;
  furnitureType: string | null;
  material: string | null;
  purchaseDate: string | null;
  purchasePrice: number | null;
  companyId: string | null;
  manufacturerId: string | null;
  locationId: string | null;
  assignedUserId: string | null;
  condition: string;
  status: string;
  remarks: string | null;
  usefulLifeYears: number | null;
  salvageValue: number | null;
  depreciationMethod: string | null;
  createdAt: string;
  updatedAt: string;
  company: { id: string; companyName: string } | null;
  manufacturer: { id: string; manufacturerName: string } | null;
  location: { id: string; locationName: string } | null;
  assignedUser: { id: string; fullName: string; email: string; department: string | null; designation: string | null; status: string } | null;
}

interface User {
  id: string;
  fullName: string;
  email: string;
}

interface Attachment {
  id: string;
  assetId: string;
  assetType: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  fileType: string;
  createdAt: string;
}

export default function FurnitureDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [asset, setAsset] = useState<FurnitureDetail | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCheckedOut, setIsCheckedOut] = useState(false);
  const [checkoutId, setCheckoutId] = useState<string | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showCheckin, setShowCheckin] = useState(false);
  const [currentBookValue, setCurrentBookValue] = useState<number | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadToast, setUploadToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [imageError, setImageError] = useState(false);
  const [qrMessage, setQrMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [maintenances, setMaintenances] = useState<any[]>([]);

  useEffect(() => {
    fetchAssetDetail();
    fetchUsers();
    fetchCheckedOutStatus();
    fetchAttachments();
    fetchReviews();
    fetchMaintenances();
  }, [id]);

  const fetchAssetDetail = async () => {
    try {
      const res = await fetch(`/api/furniture/${id}`);
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
          c.assetId === id && c.assetType === 'FURNITURE' && !c.checkInDate
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

  const fetchAttachments = async () => {
    try {
      const res = await fetch(`/api/upload?assetId=${id}&assetType=FURNITURE`);
      const json = await res.json();
      if (json.success) {
        setAttachments(json.data);
      }
    } catch (error) {
      console.error('Failed to fetch attachments:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews?assetId=${id}&assetType=FURNITURE`);
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
      const res = await fetch(`/api/maintenance?assetId=${id}&assetType=FURNITURE`);
      if (!res.ok) return;
      const json = await res.json();
      if (json.success) {
        setMaintenances(json.data);
      }
    } catch (error) {
      console.error('Failed to fetch maintenances:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('assetId', id);
      formData.append('assetType', 'FURNITURE');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (json.success) {
        setUploadToast({ message: 'File uploaded successfully', type: 'success' });
        fetchAttachments();
      } else {
        setUploadToast({ message: json.error || 'Upload failed', type: 'error' });
      }
    } catch {
      setUploadToast({ message: 'Upload failed', type: 'error' });
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = '';
      setTimeout(() => setUploadToast(null), 3000);
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!confirm('Delete this attachment?')) return;
    try {
      const res = await fetch(`/api/upload?id=${attachmentId}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setUploadToast({ message: 'Attachment deleted', type: 'success' });
        fetchAttachments();
      } else {
        setUploadToast({ message: json.error || 'Delete failed', type: 'error' });
      }
    } catch {
      setUploadToast({ message: 'Delete failed', type: 'error' });
    }
    setTimeout(() => setUploadToast(null), 3000);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const calculateCurrentValue = (assetData: FurnitureDetail) => {
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

  const handleDownloadQR = () => {
    if (!asset?.assetTag || !asset?.assetName) return;

    try {
      const qrValue = `${asset.assetTag}|${asset.assetName}`;
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>QR Code - ${asset.assetTag}</title>
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
    <h1>${asset.assetTag}</h1>
    <p>${asset.assetName}</p>
    <img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrValue)}" alt="QR Code" />
    <p>Scan this QR code to view asset details</p>
  </div>
</body>
</html>`;

      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `qr-${asset.assetTag}.html`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setQrMessage({ text: `✅ QR code downloaded!`, type: 'success' });
      setTimeout(() => setQrMessage(null), 3000);
    } catch (error) {
      setQrMessage({ text: `❌ Failed to download QR code`, type: 'error' });
      setTimeout(() => setQrMessage(null), 3000);
    }
  };

  const handlePrintQR = () => {
    if (!asset?.assetTag || !asset?.assetName) return;

    try {
      const qrValue = `${asset.assetTag}|${asset.assetName}`;
      const printContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Print QR Label</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 10px; }
    .label { display: inline-block; width: 120px; height: 150px; border: 1px solid #ccc; padding: 10px; margin: 5px; text-align: center; page-break-inside: avoid; }
    .label-id { font-weight: bold; font-size: 12px; color: #2563eb; }
    .label-name { font-size: 10px; color: #666; }
    .qr-img { width: 80px; height: 80px; margin: 5px 0; }
    @media print { body { margin: 0; } .label { margin: 2px; } }
  </style>
</head>
<body>
  <div class="label">
    <div class="label-id">${asset.assetTag}</div>
    <div class="label-name">${asset.assetName}</div>
    <img class="qr-img" src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(qrValue)}" />
  </div>
</body>
</html>`;

      const printWindow = window.open('', '', 'width=800,height=600');
      printWindow?.document.write(printContent);
      printWindow?.document.close();
      printWindow?.focus();
      setTimeout(() => printWindow?.print(), 250);
    } catch (error) {
      setQrMessage({ text: `❌ Failed to print QR code`, type: 'error' });
      setTimeout(() => setQrMessage(null), 3000);
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
            onClick={() => router.push('/assets/furniture')}
            className="btn btn-primary"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Furniture
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
      {/* Toast Message */}
      {qrMessage && (
        <div className={`mb-6 p-4 rounded-lg border font-semibold flex items-center gap-3 ${
          qrMessage.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {qrMessage.text}
        </div>
      )}
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
              <Package className="w-16 h-16 text-slate-400" />
            </div>
          </div>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/assets/furniture')}
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
              onClick={() => router.push(`/assets/furniture?edit=${asset.id}`)}
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
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Details */}
        <div className="lg:col-span-3 bg-white border border-slate-200 p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Asset Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Furniture Type</label>
              <p className="font-semibold text-slate-900">{asset.furnitureType || '-'}</p>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Material</label>
              <p className="font-semibold text-slate-900">{asset.material || '-'}</p>
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
                <Package className="w-3 h-3" />
                Serial Number
              </label>
              <p className="font-semibold text-slate-900 font-mono">{asset.serialNumber || '-'}</p>
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

          {/* Employee Assignment Card */}
          {asset.assignedUser ? (
            <div className="mt-6 pt-6 border-t border-slate-200">
              <label className="text-xs text-slate-500 mb-3 block flex items-center gap-2">
                <User className="w-3 h-3" />
                Assigned Employee
              </label>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Name</p>
                      <p className="font-bold text-lg text-slate-900">{asset.assignedUser.fullName}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${asset.assignedUser.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {asset.assignedUser.status === 'ACTIVE' ? '✓ Active' : '✗ Inactive'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Email</p>
                      <p className="text-sm font-medium text-slate-800">{asset.assignedUser.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Office</p>
                      <p className="text-sm font-medium text-slate-800">{asset.company?.companyName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Department</p>
                      <p className="text-sm font-medium text-slate-800">{asset.assignedUser.department || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Designation</p>
                      <p className="text-sm font-medium text-slate-800">{asset.assignedUser.designation || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-6 pt-6 border-t border-slate-200">
              <label className="text-xs text-slate-500 mb-3 block flex items-center gap-2">
                <User className="w-3 h-3" />
                Assigned Employee
              </label>
              <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg p-4 text-center">
                <p className="text-sm text-slate-500">No employee assigned to this asset</p>
              </div>
            </div>
          )}
        </div>

        {/* QR Code */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6 flex flex-col items-center justify-center">
          <div className="flex items-center gap-2 mb-4">
            <QrCode className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">QR Code</h3>
          </div>
          {asset.assetTag ? (
            <>
              <div className="bg-white p-4 rounded border border-slate-200 mb-4">
                <QRCode
                  asset={{
                    id: asset.id,
                    assetTag: asset.assetTag,
                    assetName: asset.assetName,
                    type: 'Furniture',
                    location: asset.location?.locationName,
                    condition: asset.condition,
                    status: asset.status,
                  }}
                  size={150}
                />
              </div>
              <div className="flex gap-2 w-full">
                <button
                  onClick={handleDownloadQR}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white text-xs font-semibold rounded hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={handlePrintQR}
                  className="flex-1 px-3 py-2 bg-slate-600 text-white text-xs font-semibold rounded hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
                >
                  🖨️ Print
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-6 text-slate-400">
              <Package className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-xs">No QR available</p>
            </div>
          )}
        </div>
      </div>


      {/* Maintenance Section */}
      <div className="mt-6">
        <MaintenanceSection
          assetId={asset.id}
          assetType="FURNITURE"
          maintenances={maintenances}
        />
      </div>

      {/* Reviews Section */}
      <div className="mt-6">
        <ReviewSection
          assetId={asset.id}
          assetType="FURNITURE"
          reviews={reviews}
          currentUserId={undefined}
        />
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <CheckoutModal
          assetId={asset.id}
          assetName={asset.assetName}
          assetType="FURNITURE"
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

      {/* Upload Toast */}
      {uploadToast && (
        <div className={`fixed bottom-4 right-4 px-4 py-3 shadow-lg text-sm font-medium z-50 ${
          uploadToast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {uploadToast.message}
        </div>
      )}
      </div>
    </DashboardLayout>
  );
}
