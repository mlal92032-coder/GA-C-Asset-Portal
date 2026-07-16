'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/contexts/ToastContext';
import DashboardLayout from '@/components/DashboardLayout';
import PageHeader from '@/components/PageHeader';
import FilterBar from '@/components/FilterBar';
import DataTable, { type DataColumn } from '@/components/DataTable';
import BarcodeComponent from '@/components/Barcode';
import QRCode from '@/components/QRCode';
import CheckoutModal, { CheckinModal } from '@/components/CheckoutModal';
import BulkImportExport from '@/components/BulkImportExport';
import ModernElectronicsModal from '@/components/ModernElectronicsModal';
import { BulkActionBar } from '@/components/BulkActionBar';
import BulkStatusUpdateModal, { type BulkStatusUpdateData } from '@/components/BulkStatusUpdateModal';
import { Button, IconButton } from '@/components/Button';
import { uploadImage, resolveImageUrl, buildImageUrl } from '@/lib/image-upload';
import type { ElectronicAsset, Company, Manufacturer, Location, User, ElectronicFormData } from '@/types';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Loader2,
  Filter,
  X,
  AlertTriangle,
  Barcode,
  QrCode,
  Download,
  ArrowUpCircle,
  ArrowDownCircle,
  Monitor,
  DollarSign,
} from 'lucide-react';
import { isBefore } from 'date-fns';

export default function ElectronicsPage() {
  const [assets, setAssets] = useState<ElectronicAsset[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ condition: '', status: '', locationId: '', companyId: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<ElectronicAsset | null>(null);
  const [viewingAsset, setViewingAsset] = useState<ElectronicAsset | null>(null);
  const [viewingBarcode, setViewingBarcode] = useState<ElectronicAsset | null>(null);
  const [viewingQRCode, setViewingQRCode] = useState<ElectronicAsset | null>(null);
  const [showBulkBarcode, setShowBulkBarcode] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showCheckin, setShowCheckin] = useState(false);
  const [checkoutAsset, setCheckoutAsset] = useState<{ id: string; name: string; location?: string } | null>(null);
  const [checkinCheckout, setCheckinCheckout] = useState<{ id: string; assetName: string } | null>(null);
  const [checkedOutAssets, setCheckedOutAssets] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [sort, setSort] = useState('createdAt');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [showBulkStatusUpdate, setShowBulkStatusUpdate] = useState(false);
  const [bulkUpdating, setBulkUpdating] = useState(false);

  const [formData, setFormData] = useState<ElectronicFormData>({
    assetName: '',
    assetTag: '',
    deviceType: '',
    brand: '',
    model: '',
    purchaseDate: '',
    warrantyEndDate: '',
    companyId: '',
    manufacturerId: '',
    locationId: '',
    assignedUserId: '',
    condition: 'GOOD',
    status: 'IN_STORE',
    lastMaintenanceDate: '',
    remarks: '',
  });

  const { data: session } = useSession();
  const { success, error } = useToast();
  const canAddEditDelete = session?.user?.role === 'SUPER_ADMIN' || session?.user?.role === 'USER';
  const canDeleteItem = session?.user?.role === 'SUPER_ADMIN';
  const canRequestDelete = session?.user?.role === 'USER';
  const canViewOnly = session?.user?.role === 'VIEW_USER';

  useEffect(() => {
    fetchAll();
    fetchCheckedOutAssets();
  }, [currentPage, itemsPerPage, sort, order, filters]);

  const fetchCheckedOutAssets = async () => {
    try {
      const res = await fetch('/api/assets/checked-out');
      const json = await res.json();
      if (json.success) {
        const checkedOutMap: Record<string, string> = {};
        json.data.forEach((checkout: any) => {
          if (checkout.assetType === 'ELECTRONIC') {
            checkedOutMap[checkout.assetId] = checkout.id;
          }
        });
        setCheckedOutAssets(checkedOutMap);
      }
    } catch (error) {
      console.error('Failed to fetch checked out assets:', error);
    }
  };

  const handleCheckoutSuccess = () => {
    setShowCheckout(false);
    setCheckoutAsset(null);
    fetchAll();
    fetchCheckedOutAssets();
    success('Asset checked out successfully');
  };

  const handleCheckinSuccess = () => {
    setShowCheckin(false);
    setCheckinCheckout(null);
    fetchAll();
    fetchCheckedOutAssets();
    success('Asset checked in successfully');
  };

  const openCheckoutModal = (asset: ElectronicAsset) => {
    setCheckoutAsset({
      id: asset.id,
      name: asset.assetName,
      location: asset.location?.locationName || asset.location?.room
    });
    setShowCheckout(true);
  };

  const openCheckinModal = (assetId: string, assetName: string) => {
    const checkoutId = checkedOutAssets[assetId];
    if (checkoutId) {
      setCheckinCheckout({ id: checkoutId, assetName });
      setShowCheckin(true);
    }
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        sort,
        order,
      });

      if (filters.condition) params.set('condition', filters.condition);
      if (filters.status) params.set('status', filters.status);
      if (filters.locationId) params.set('locationId', filters.locationId);
      if (filters.companyId) params.set('companyId', filters.companyId);

      const [assetsRes, companiesRes, manufacturersRes, locationsRes, usersRes] = await Promise.all([
        fetch(`/api/electronics?${params}`),
        fetch('/api/companies'),
        fetch('/api/manufacturers'),
        fetch('/api/locations'),
        fetch('/api/users'),
      ]);

      const assetsData = await assetsRes.json();
      const companiesJson = await companiesRes.json();
      const manufacturersJson = await manufacturersRes.json();
      const locationsJson = await locationsRes.json();
      const usersJson = await usersRes.json();

      setAssets(assetsData.data || []);
      setTotalItems(assetsData.pagination?.total || 0);
      if (companiesJson.success) setCompanies(companiesJson.data);
      if (manufacturersJson.success) setManufacturers(manufacturersJson.data);
      if (locationsJson.success) setLocations(locationsJson.data);
      if (usersJson.success) setUsers(usersJson.data);
    } catch {
      error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({ condition: '', status: '', locationId: '', companyId: '' });
    setCurrentPage(1);
  };

  const handleSort = (sortKey: string) => {
    if (sort === sortKey) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSort(sortKey);
      setOrder('asc');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editingAsset ? `/api/electronics/${editingAsset.id}` : '/api/electronics';
      const method = editingAsset ? 'PUT' : 'POST';

      // Convert empty strings to null for API
      const dataToSend = {
        ...formData,
        assetTag: formData.assetTag || null,
        imageUrl: formData.imageUrl || null,
        deviceType: formData.deviceType || null,
        brand: formData.brand || null,
        model: formData.model || null,
        purchaseDate: formData.purchaseDate || null,
        warrantyEndDate: formData.warrantyEndDate || null,
        companyId: formData.companyId || null,
        manufacturerId: formData.manufacturerId || null,
        locationId: formData.locationId || null,
        assignedUserId: formData.assignedUserId || null,
        lastMaintenanceDate: formData.lastMaintenanceDate || null,
        remarks: formData.remarks || null,
        usefulLifeYears: formData.usefulLifeYears || null,
        salvageValue: formData.salvageValue || null,
        depreciationMethod: formData.depreciationMethod || null,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });
      const json = await res.json();

      if (json.success) {
        success(json.message || `Asset ${editingAsset ? 'updated' : 'created'} successfully`);
        fetchAll();
        resetForm();
      } else {
        error(json.error);
      }
    } catch {
      error('An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (electronicsData: any) => {
    setSaving(true);
    try {
      const url = editingAsset ? `/api/electronics/${editingAsset.id}` : '/api/electronics';
      const method = editingAsset ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(electronicsData),
      });
      const json = await res.json();
      if (json.success) {
        success(json.message || `Asset ${editingAsset ? 'updated' : 'created'} successfully`);
        fetchAll();
        setShowModal(false);
        setEditingAsset(null);
      } else {
        error(json.error);
      }
    } catch {
      error('An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, assetName: string) => {
    // If USER role, create delete request
    if (canRequestDelete && !canDeleteItem) {
      const reason = prompt('Please provide a reason for deletion:');
      if (!reason) return;

      try {
        const res = await fetch('/api/delete-requests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            assetId: id,
            assetType: 'ELECTRONIC',
            assetName: assetName,
            requestedById: session?.user?.id,
            reason: reason,
          }),
        });
        const json = await res.json();

        if (json.success) {
          success('Delete request submitted successfully');
        } else {
          error(json.error || 'Failed to submit delete request');
        }
      } catch {
        error('An error occurred');
      }
      return;
    }

    // If SUPER_ADMIN, delete directly
    if (!confirm('Are you sure you want to delete this asset?')) return;

    try {
      const res = await fetch(`/api/electronics/${id}`, { method: 'DELETE' });
      const json = await res.json();

      if (json.success) {
        success('Asset deleted successfully');
        fetchAll();
      } else {
        error(json.error);
      }
    } catch {
      error('An error occurred');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedAssets.length === 0) return;

    const reason = prompt(
      `Delete ${selectedAssets.length} asset(s)? This cannot be undone.\n\nReason for deletion:`
    );
    if (!reason) return;

    try {
      const res = await fetch('/api/assets/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetIds: selectedAssets,
          assetType: 'ELECTRONICS',
          reason,
        }),
      });

      const json = await res.json();
      if (json.success) {
        success(`${json.deleted || 0} asset(s) deleted successfully`);
        setSelectedAssets([]);
        fetchAll();
      } else {
        error(json.error || 'Failed to delete assets');
      }
    } catch {
      error('An error occurred');
    }
  };

  const handleBulkExport = async () => {
    if (selectedAssets.length === 0) return;

    try {
      const res = await fetch('/api/assets/bulk-export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetIds: selectedAssets,
          assetType: 'ELECTRONICS',
          format: 'csv',
        }),
      });

      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `electronics-assets-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      success('Assets exported successfully');
    } catch {
      error('Failed to export assets');
    }
  };

  const handleBulkStatusUpdate = async (data: BulkStatusUpdateData) => {
    if (selectedAssets.length === 0) return;

    setBulkUpdating(true);
    try {
      const res = await fetch('/api/assets/bulk-update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetIds: selectedAssets,
          assetType: 'ELECTRONICS',
          ...data,
        }),
      });

      const json = await res.json();
      if (json.success) {
        success(`${json.updated} asset(s) updated successfully`);
        setSelectedAssets([]);
        fetchAll();
      } else {
        error(json.error || 'Failed to update assets');
      }
    } catch {
      error('An error occurred');
    } finally {
      setBulkUpdating(false);
    }
  };

  const handleBulkPrint = async () => {
    if (selectedAssets.length === 0) return;

    try {
      const res = await fetch('/api/assets/bulk-print', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetIds: selectedAssets,
          assetType: 'ELECTRONICS',
        }),
      });

      if (!res.ok) throw new Error('Print generation failed');

      const html = await res.text();
      const printWindow = window.open('', '', 'width=800,height=600');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.print();
      }

      success('Labels sent to printer');
    } catch {
      error('Failed to generate labels');
    }
  };

  const fetchAttachments = async (assetId: string) => {
    try {
      const res = await fetch(`/api/attachments?assetId=${assetId}&assetType=ELECTRONIC`);
      const json = await res.json();
      if (json.success) {
        setAttachments(json.data);
      }
    } catch (error) {
      console.error('Failed to fetch attachments:', error);
    }
  };

  const handleFileUpload = async (assetId: string, file: File) => {
    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('assetId', assetId);
      formData.append('assetType', 'ELECTRONIC');

      const res = await fetch('/api/attachments', {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();
      if (json.success) {
        success('File uploaded successfully');
        fetchAttachments(assetId);
      } else {
        error(json.error || 'Failed to upload file');
      }
    } catch {
      error('An error occurred');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId: string, assetId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;
    try {
      const res = await fetch(`/api/attachments/${attachmentId}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        success('File deleted successfully');
        fetchAttachments(assetId);
      } else {
        error(json.error || 'Failed to delete file');
      }
    } catch {
      error('An error occurred');
    }
  };

  const openEdit = async (asset: ElectronicAsset) => {
    setEditingAsset(asset);
    // Resolve image URL for preview (handles both base64 and file paths)
    let previewUrl = asset.imageUrl || '';
    if (asset.imageUrl && !asset.imageUrl.startsWith('data:') && !asset.imageUrl.startsWith('http')) {
      previewUrl = await resolveImageUrl(asset.imageUrl) || '';
    }
    setImagePreviewUrl(previewUrl || null);
    setFormData({
      assetName: asset.assetName,
      assetTag: asset.assetTag || '',
      imageUrl: asset.imageUrl || '',
      deviceType: asset.deviceType || '',
      brand: asset.brand || '',
      model: asset.model || '',
      purchaseDate: asset.purchaseDate ? new Date(asset.purchaseDate).toISOString().split('T')[0] : '',
      warrantyEndDate: asset.warrantyEndDate ? new Date(asset.warrantyEndDate).toISOString().split('T')[0] : '',
      companyId: asset.companyId || '',
      manufacturerId: asset.manufacturerId || '',
      locationId: asset.locationId || '',
      assignedUserId: asset.assignedUserId || '',
      condition: asset.condition,
      status: asset.status,
      lastMaintenanceDate: asset.lastMaintenanceDate ? new Date(asset.lastMaintenanceDate).toISOString().split('T')[0] : '',
      remarks: asset.remarks || '',
    });
    setShowModal(true);
  };

  const openCreate = () => {
    setEditingAsset(null);
    setFormData({
      assetName: '',
      assetTag: '',
      imageUrl: '',
      deviceType: '',
      brand: '',
      model: '',
      purchaseDate: '',
      warrantyEndDate: '',
      companyId: '',
      manufacturerId: '',
      locationId: '',
      assignedUserId: '',
      condition: 'GOOD',
      status: 'IN_STORE',
      lastMaintenanceDate: '',
      remarks: '',
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setShowModal(false);
    setEditingAsset(null);
    setImagePreviewUrl(null);
  };

  const fetchAllAssetsForBarcode = async (): Promise<ElectronicAsset[]> => {
    try {
      const params = new URLSearchParams({ page: '1', limit: '10000' });
      if (filters.condition) params.set('condition', filters.condition);
      if (filters.status) params.set('status', filters.status);
      if (filters.locationId) params.set('locationId', filters.locationId);
      if (filters.companyId) params.set('companyId', filters.companyId);

      const res = await fetch(`/api/electronics?${params}`);
      const data = await res.json();
      return data.data || [];
    } catch {
      error('Failed to fetch assets for barcode');
      return [];
    }
  };

  const handleBulkBarcodePrint = useCallback(async () => {
    setShowBulkBarcode(true);
  }, []);

  const isWarrantyExpired = (warrantyEndDate?: string | null) => {
    if (!warrantyEndDate) return false;
    return isBefore(new Date(warrantyEndDate), new Date());
  };

  const conditionBadge = (condition: string) => {
    switch (condition) {
      case 'GOOD':
        return <span className="badge badge-success">Good</span>;
      case 'REPAIR':
        return <span className="badge badge-warning">Repair</span>;
      case 'DAMAGED':
        return <span className="badge badge-danger">Damaged</span>;
      default:
        return <span className="badge badge-secondary">{condition}</span>;
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'IN_USE':
        return <span className="badge badge-info">In Use</span>;
      case 'IN_STORE':
        return <span className="badge badge-success">In Store</span>;
      case 'DISPOSED':
        return <span className="badge badge-danger">Disposed</span>;
      default:
        return <span className="badge badge-secondary">{status}</span>;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        {/* Skeleton page header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="w-48 h-9 bg-slate-200 skeleton mb-2" />
            <div className="w-64 h-5 bg-slate-200 skeleton" />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-36 h-10 bg-slate-200 skeleton" />
            <div className="w-28 h-10 bg-slate-200 skeleton" />
          </div>
        </div>

        {/* Skeleton search and filters */}
        <div className="card p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-64 h-10 bg-slate-200 skeleton" />
            <div className="w-24 h-10 bg-slate-200 skeleton" />
          </div>
        </div>

        {/* Skeleton table */}
        <div className="card overflow-hidden">
          <div className="table-container p-4">
            <div className="h-10 bg-slate-200 skeleton mb-4" />
            <div className="skeleton-table">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton-table-row" style={{ animationDelay: `${i * 100}ms` }} />
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      currentPage={currentPage}
      totalPages={Math.ceil(totalItems / itemsPerPage)}
      itemsPerPage={itemsPerPage}
      totalItems={totalItems}
      onPageChange={setCurrentPage}
      onItemsPerPageChange={(perPage) => { setItemsPerPage(perPage); setCurrentPage(1); }}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-2">
      <PageHeader
        title="Electronic Assets"
        subtitle="Manage electronic and electrical equipment"
        icon={Monitor}
        badge="Asset Category"
        gradientFrom="from-blue-100"
        gradientTo="to-cyan-100"
        iconColor="text-blue-600"
        actions={
          <>
            {canAddEditDelete && <BulkImportExport assetType="ELECTRONIC" onImportSuccess={fetchAll} />}
            <Button
              onClick={openCreate}
              disabled={!canAddEditDelete}
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
            >
              <span className="hidden sm:inline">Add Electronic</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </>
        }
        stats={[{ label: 'Total Assets', value: totalItems }]}
      />

      <FilterBar
        hasActiveFilters={!!(filters.condition || filters.status || filters.locationId || filters.companyId)}
        onClearFilters={clearFilters}
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-0.5">Condition</label>
            <select
              value={filters.condition}
              onChange={(e) => handleFilterChange('condition', e.target.value)}
              className="py-1.5 text-sm"
            >
              <option value="">All</option>
              <option value="GOOD">Good</option>
              <option value="REPAIR">Repair</option>
              <option value="DAMAGED">Damaged</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-0.5">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="py-1.5 text-sm"
            >
              <option value="">All</option>
              <option value="IN_USE">In Use</option>
              <option value="IN_STORE">In Store</option>
              <option value="DISPOSED">Disposed</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-0.5">Location</label>
            <select
              value={filters.locationId}
              onChange={(e) => handleFilterChange('locationId', e.target.value)}
              className="py-1.5 text-sm"
            >
              <option value="">All</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.locationName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-0.5">Office</label>
            <select
              value={filters.companyId}
              onChange={(e) => handleFilterChange('companyId', e.target.value)}
              className="py-1.5 text-sm"
            >
              <option value="">All</option>
              {companies.map((comp) => (
                <option key={comp.id} value={comp.id}>
                  {comp.companyName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </FilterBar>

      {/* BulkActionBar */}
      <BulkActionBar
        selectedCount={selectedAssets.length}
        onClose={() => setSelectedAssets([])}
        onEdit={() => setShowBulkStatusUpdate(true)}
        onDelete={handleBulkDelete}
        onExport={handleBulkExport}
        onPrint={handleBulkPrint}
        isLoading={saving || bulkUpdating}
      />

      {/* DataTable */}
      <DataTable<ElectronicAsset>
        data={assets}
        selectable={true}
        selectedIds={selectedAssets}
        onSelectionChange={setSelectedAssets}
        columns={[
          {
            key: 'imageUrl',
            label: 'Image',
            sortable: false,
            width: '80px',
            render: (value, row) => (
              buildImageUrl(row.imageUrl) ? (
                <img
                  src={buildImageUrl(row.imageUrl)!}
                  alt={row.assetName}
                  className="w-12 h-12 object-cover border border-slate-200 rounded"
                />
              ) : (
                <div className="w-12 h-12 bg-slate-100 flex items-center justify-center rounded border border-slate-200">
                  <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )
            ),
          },
          {
            key: 'assetName',
            label: 'Asset Name',
            sortable: true,
            render: (value) => <span className="font-medium">{value}</span>,
          },
          {
            key: 'assetTag',
            label: 'Asset Tag',
            sortable: true,
            render: (value) => <span className="font-mono text-sm">{value || '-'}</span>,
          },
          {
            key: 'deviceType',
            label: 'Device Type',
            sortable: true,
            render: (value) => value || '-',
          },
          {
            key: 'brand',
            label: 'Brand / Model',
            sortable: true,
            render: (value, row) => `${value} ${row.model}`,
          },
          {
            key: 'location',
            label: 'Location',
            sortable: false,
            render: (_, row) => row.location?.locationName || '-',
          },
          {
            key: 'condition',
            label: 'Condition',
            sortable: true,
            render: (value) => conditionBadge(value),
          },
          {
            key: 'status',
            label: 'Status',
            sortable: true,
            render: (value) => statusBadge(value),
          },
          {
            key: 'id',
            label: 'Actions',
            sortable: false,
            width: '200px',
            render: (_, row) => (
              <div className="flex items-center gap-1.5">
                <IconButton
                  onClick={() => {
                    setViewingAsset(row);
                    fetchAttachments(row.id);
                  }}
                  variant="secondary"
                  size="sm"
                  icon={<Eye className="w-4 h-4" />}
                  tooltip="View Details"
                />
                {checkedOutAssets[row.id] ? (
                  <IconButton
                    onClick={() => openCheckinModal(row.id, row.assetName)}
                    variant="success"
                    size="sm"
                    icon={<ArrowDownCircle className="w-4 h-4" />}
                    tooltip="Check In"
                  />
                ) : (
                  <IconButton
                    onClick={() => openCheckoutModal(row)}
                    variant="primary"
                    size="sm"
                    icon={<ArrowUpCircle className="w-4 h-4" />}
                    tooltip="Check Out"
                  />
                )}
                {canAddEditDelete && (
                  <>
                    <IconButton
                      onClick={() => openEdit(row)}
                      variant="secondary"
                      size="sm"
                      icon={<Edit className="w-4 h-4" />}
                      tooltip="Edit"
                    />
                    {(canDeleteItem || canRequestDelete) && (
                      <IconButton
                        onClick={() => handleDelete(row.id, row.assetName)}
                        variant="danger"
                        size="sm"
                        icon={<Trash2 className="w-4 h-4" />}
                        tooltip={canRequestDelete ? "Request Delete" : "Delete"}
                      />
                    )}
                  </>
                )}
                {canViewOnly && (
                  <span className="text-xs text-slate-400">View Only</span>
                )}
              </div>
            ),
          },
        ]}
        isLoading={loading}
        emptyMessage="No electronic assets found"
      />

      {/* Create/Edit Modal */}
      <ModernElectronicsModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingAsset(null); }}
        onSave={handleSave}
        editingAsset={editingAsset}
        saving={saving}
        companies={companies}
        manufacturers={manufacturers}
        locations={locations}
        users={users}
      />

      {/* View Modal */}
      {viewingAsset && (
        <div className="modal-overlay" onClick={() => setViewingAsset(null)}>
          <div className="modal w-full max-w-2xl mx-auto" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Electronic Asset Details</h2>
                <div className="flex items-center gap-2">
                  {viewingAsset.assetTag && (
                    <button
                      onClick={() => setViewingQRCode(viewingAsset)}
                      className="btn btn-secondary btn-sm flex items-center gap-1"
                    >
                      <QrCode className="w-4 h-4" />QR Code
                    </button>
                  )}
                  <button onClick={() => setViewingAsset(null)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                </div>
              </div>
            </div>
            <div className="modal-body">
              {/* Display Image */}
              <div className="mb-6 flex justify-center">
                {buildImageUrl(viewingAsset.imageUrl) ? (
                  <img
                    src={buildImageUrl(viewingAsset.imageUrl)!}
                    alt={viewingAsset.assetName}
                    className="w-48 h-48 object-cover border-2 border-slate-200 shadow-lg"
                  />
                ) : (
                  <div className="w-48 h-48 bg-slate-100 flex items-center justify-center border-2 border-slate-200">
                    <Monitor className="w-16 h-16 text-slate-400" />
                  </div>
                )}
              </div>

              {viewingAsset.assetTag && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-gray-500">Asset Tag</p>
                  <p className="font-mono text-lg font-semibold text-blue-900">{viewingAsset.assetTag}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500">Asset Name</p>
                  <p className="font-medium">{viewingAsset.assetName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Device Type</p>
                  <p className="font-medium">{viewingAsset.deviceType || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Brand</p>
                  <p className="font-medium">{viewingAsset.brand || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Model</p>
                  <p className="font-medium">{viewingAsset.model || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Warranty Status</p>
                  <p className="font-medium">
                    {viewingAsset.warrantyEndDate
                      ? isWarrantyExpired(viewingAsset.warrantyEndDate)
                        ? 'Expired'
                        : new Date(viewingAsset.warrantyEndDate).toLocaleDateString()
                      : 'No warranty info'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Company</p>
                  <p className="font-medium">{viewingAsset.company?.companyName || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Manufacturer</p>
                  <p className="font-medium">{viewingAsset.manufacturer?.manufacturerName || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">{viewingAsset.location?.locationName || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Assigned To</p>
                  <p className="font-medium">{viewingAsset.assignedUser?.fullName || 'Unassigned'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Condition</p>
                  <div className="mt-1">{conditionBadge(viewingAsset.condition)}</div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <div className="mt-1">{statusBadge(viewingAsset.status)}</div>
                </div>
                {viewingAsset.remarks && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Remarks</p>
                    <p className="font-medium">{viewingAsset.remarks}</p>
                  </div>
                )}
              </div>

              {/* Attachments Section */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Attachments</h3>

                {/* Upload Area */}
                <div className="mb-4">
                  <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-all">
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(viewingAsset.id, file);
                        }
                      }}
                      disabled={uploadingFile}
                    />
                    {uploadingFile ? (
                      <div className="flex items-center gap-2 text-blue-600">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="text-sm font-medium">Uploading...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Download className="w-5 h-5" />
                        <span className="text-sm font-medium">Click to upload file (Max 10MB)</span>
                      </div>
                    )}
                  </label>
                </div>

                {/* Attachments List */}
                {attachments.length > 0 ? (
                  <div className="space-y-2">
                    {attachments.map((att) => (
                      <div key={att.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                            <Download className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{att.fileName}</p>
                            <p className="text-xs text-gray-500">{(att.fileSize / 1024).toFixed(1)} KB</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <a
                            href={`/uploads/attachments/${att.fileName}`}
                            download
                            className="btn btn-secondary btn-sm"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                          {canDeleteItem && (
                            <button
                              onClick={() => handleDeleteAttachment(att.id, viewingAsset.id)}
                              className="btn btn-danger btn-sm"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No attachments</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Single QR Code Modal */}
      {viewingQRCode && (
        <div className="modal-overlay" onClick={() => setViewingQRCode(null)}>
          <div className="modal w-full max-w-md mx-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Asset QR Code</h2>
              <button onClick={() => setViewingQRCode(null)} className="text-gray-400 hover:text-gray-600 text-2xl">
                &times;
              </button>
            </div>
            <div className="p-6 flex flex-col items-center">
              <QRCode
                asset={{
                  id: viewingQRCode.id,
                  assetTag: viewingQRCode.assetTag!,
                  assetName: viewingQRCode.assetName,
                  type: 'Electronics',
                  purchaseDate: viewingQRCode.purchaseDate || undefined,
                  assignedTo: viewingQRCode.assignedUser?.fullName,
                  location: viewingQRCode.location?.locationName,
                  condition: viewingQRCode.condition,
                  status: viewingQRCode.status,
                  company: viewingQRCode.company?.companyName,
                }}
                size={200}
                showDownload={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* Bulk Barcode Export Modal */}
      {showBulkBarcode && (
        <BulkBarcodeModal
          onClose={() => setShowBulkBarcode(false)}
          fetchAssets={fetchAllAssetsForBarcode}
          assetType="Electronics"
        />
      )}

      {/* Bulk Status Update Modal */}
      <BulkStatusUpdateModal
        isOpen={showBulkStatusUpdate}
        onClose={() => setShowBulkStatusUpdate(false)}
        onUpdate={handleBulkStatusUpdate}
        locations={locations}
        users={users}
        isLoading={bulkUpdating}
      />

      {/* Checkout Modal */}
      {showCheckout && checkoutAsset && (
        <CheckoutModal
          assetId={checkoutAsset.id}
          assetName={checkoutAsset.name}
          assetType="ELECTRONIC"
          assetLocation={checkoutAsset.location}
          users={users}
          onClose={() => {
            setShowCheckout(false);
            setCheckoutAsset(null);
          }}
          onSuccess={handleCheckoutSuccess}
        />
      )}

      {/* Checkin Modal */}
      {showCheckin && checkinCheckout && (
        <CheckinModal
          checkoutId={checkinCheckout.id}
          assetName={checkinCheckout.assetName}
          onClose={() => {
            setShowCheckin(false);
            setCheckinCheckout(null);
          }}
          onSuccess={handleCheckinSuccess}
        />
      )}
      </div>
    </DashboardLayout>
  );
}

// Bulk Barcode Modal Component
function BulkBarcodeModal({
  onClose,
  fetchAssets,
  assetType,
}: {
  onClose: () => void;
  fetchAssets: () => Promise<ElectronicAsset[]>;
  assetType: string;
}) {
  const [assets, setAssets] = useState<ElectronicAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAssets().then((data) => {
      setAssets(data.filter((a) => a.assetTag));
      setLoading(false);
    });
  }, [fetchAssets]);

  const handlePrintAll = () => {
    if (!containerRef.current) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const barcodesHtml = Array.from(containerRef.current.querySelectorAll('.barcode-label-print')).map((el) => el.innerHTML).join('<div style="page-break-after: always;"></div>');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print All Barcodes - ${assetType}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .barcode-label { text-align: center; margin-bottom: 20px; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; page-break-inside: avoid; }
            .label-title { font-size: 14px; font-weight: bold; margin-bottom: 8px; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <h1 style="text-align: center; margin-bottom: 30px;">${assetType} Asset Barcodes</h1>
          ${barcodesHtml}
          <script>
            window.onload = function() { window.print(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal w-full max-w-2xl mx-auto max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Export Barcodes - {assetType}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
            &times;
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-3 text-gray-500">Loading assets...</span>
            </div>
          ) : assets.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>No assets with asset tags found</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-500">{assets.length} asset(s) found</p>
                <button onClick={handlePrintAll} className="btn btn-primary flex items-center gap-2">
                  <Download className="w-4 h-4" />Print All Barcodes
                </button>
              </div>
              <div ref={containerRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {assets.map((asset) => (
                  <div key={asset.id} className="barcode-label-print bg-white border border-gray-200 p-4 text-center">
                    <div className="label-title text-sm font-medium text-gray-700 truncate">{asset.assetName}</div>
                    <div className="overflow-hidden">
                      <BarcodeComponent value={asset.assetTag!} width={1.5} height={40} fontSize={10} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

