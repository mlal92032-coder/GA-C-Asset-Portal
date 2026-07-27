'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/contexts/ToastContext';
import DashboardLayout from '@/components/DashboardLayout';
import PageHeader from '@/components/PageHeader';
import FilterBar from '@/components/FilterBar';
import { Pagination } from '@/components/Pagination';
import { SortableHeader } from '@/components/SortableHeader';
import ModernVehiclesModal from '@/components/ModernVehiclesModal';
import VehicleMaintenanceModal from '@/components/VehicleMaintenanceModal';
import { Button, IconButton } from '@/components/ui';
import { buildImageUrl } from '@/lib/image-upload';
import type { VehicleAsset, Company, Manufacturer, Location, User, VehicleFormData } from '@/types';
import {
  Plus, Edit, Trash2, Eye, Loader2, Filter, X, AlertTriangle,
  Wrench, Car, DollarSign, Calendar,
} from 'lucide-react';
import { isBefore, format } from 'date-fns';

type Tab = 'vehicles' | 'maintenance';

interface Maintenance {
  id: string;
  assetId: string;
  assetType: string;
  maintenanceDate: string;
  description: string;
  cost?: number | null;
  performedBy?: string | null;
  nextDueDate?: string | null;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}

export default function VehicleHubPage() {
  // Tab state
  const [activeTab, setActiveTab] = useState<Tab>('vehicles');

  // Vehicle state
  const [assets, setAssets] = useState<VehicleAsset[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ condition: '', status: '', locationId: '', companyId: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [sort, setSort] = useState('createdAt');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  // Vehicle modal state
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<VehicleAsset | null>(null);
  const [saving, setSaving] = useState(false);

  // Maintenance state
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [loadingMaintenance, setLoadingMaintenance] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [editingMaintenance, setEditingMaintenance] = useState<Maintenance | null>(null);
  const [maintenancePageNum, setMaintenancePageNum] = useState(1);
  const [maintenanceItemsPerPage, setMaintenanceItemsPerPage] = useState(10);
  const [totalMaintenanceItems, setTotalMaintenanceItems] = useState(0);
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);
  const [selectedMaintenanceVehicle, setSelectedMaintenanceVehicle] = useState('');

  // Toast state

  const { data: session } = useSession();
  const { success, error } = useToast();
  const canAddEditDelete = session?.user?.role === 'SUPER_ADMIN' || session?.user?.role === 'USER';
  const canDeleteItem = session?.user?.role === 'SUPER_ADMIN';

  // Fetch vehicles
  const fetchVehicles = async () => {
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
        fetch(`/api/vehicles?${params}`),
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
      error('Failed to fetch vehicles');
    } finally {
      setLoading(false);
    }
  };

  // Fetch maintenances
  const fetchMaintenances = async () => {
    setMaintenanceLoading(true);
    try {
      const params = new URLSearchParams({
        page: maintenancePageNum.toString(),
        limit: maintenanceItemsPerPage.toString(),
      });
      if (selectedMaintenanceVehicle) {
        params.set('assetId', selectedMaintenanceVehicle);
      }
      const res = await fetch(`/api/maintenances?${params}`);
      const json = await res.json();
      if (json.success) {
        const filtered = selectedMaintenanceVehicle
          ? json.data.filter((m: any) => m.assetId === selectedMaintenanceVehicle)
          : json.data;
        setMaintenances(filtered || []);
        setTotalMaintenanceItems(filtered?.length || 0);
      }
    } catch {
      error('Failed to fetch maintenance records');
    } finally {
      setMaintenanceLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [currentPage, itemsPerPage, sort, order, filters]);

  useEffect(() => {
    if (activeTab === 'maintenance') {
      fetchMaintenances();
    }
  }, [activeTab, maintenancePageNum, maintenanceItemsPerPage, selectedMaintenanceVehicle]);

const handleSaveVehicle = async (vehicleData: any) => {
    setSaving(true);
    try {
      const url = editingAsset ? `/api/vehicles/${editingAsset.id}` : '/api/vehicles';
      const method = editingAsset ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vehicleData),
      });
      const json = await res.json();
      if (json.success) {
        success(json.message || `Vehicle ${editingAsset ? 'updated' : 'created'}`);
        fetchVehicles();
        setShowVehicleModal(false);
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

  const handleSaveMaintenance = async (maintenanceData: any) => {
    try {
      const url = editingMaintenance
        ? `/api/maintenances/${editingMaintenance.id}`
        : '/api/maintenances';
      const method = editingMaintenance ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...maintenanceData,
          assetType: 'VEHICLE',
        }),
      });
      const json = await res.json();
      if (json.success) {
        success(`Maintenance ${editingMaintenance ? 'updated' : 'added'}`);
        fetchMaintenances();
        setShowMaintenanceModal(false);
        setEditingMaintenance(null);
      } else {
        error(json.error);
      }
    } catch {
      error('An error occurred');
    }
  };

  const handleDeleteVehicle = async (id: string, assetName: string) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;
    try {
      const res = await fetch(`/api/vehicles/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        success('Vehicle deleted successfully');
        fetchVehicles();
      } else {
        error(json.error);
      }
    } catch {
      error('An error occurred');
    }
  };

  const handleDeleteMaintenance = async (id: string) => {
    if (!confirm('Are you sure you want to delete this maintenance record?')) return;
    try {
      const res = await fetch(`/api/maintenances/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        success('Maintenance record deleted');
        fetchMaintenances();
      } else {
        error(json.error);
      }
    } catch {
      error('An error occurred');
    }
  };

  const openEditVehicle = (asset: VehicleAsset) => {
    setEditingAsset(asset);
    setShowVehicleModal(true);
  };

  const openCreateVehicle = () => {
    setEditingAsset(null);
    setShowVehicleModal(true);
  };

  const openEditMaintenance = (maintenance: Maintenance) => {
    setEditingMaintenance(maintenance);
    setShowMaintenanceModal(true);
  };

  const openCreateMaintenance = () => {
    setEditingMaintenance(null);
    setShowMaintenanceModal(true);
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

  const isInsuranceExpired = (date?: string | null) => {
    if (!date) return false;
    return isBefore(new Date(date), new Date());
  };

  const conditionBadge = (c: string) => {
    if (c === 'GOOD') return <span className="badge badge-success">Good</span>;
    if (c === 'REPAIR') return <span className="badge badge-warning">Repair</span>;
    if (c === 'DAMAGED') return <span className="badge badge-danger">Damaged</span>;
    return <span className="badge badge-secondary">{c}</span>;
  };

  const statusBadge = (s: string) => {
    if (s === 'IN_USE') return <span className="badge badge-info">In Use</span>;
    if (s === 'IN_STORE') return <span className="badge badge-success">In Store</span>;
    if (s === 'DISPOSED') return <span className="badge badge-danger">Disposed</span>;
    return <span className="badge badge-secondary">{s}</span>;
  };

  const getMaintenanceStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-amber-100 text-amber-700';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-700';
      case 'COMPLETED':
        return 'bg-emerald-100 text-emerald-700';
      case 'CANCELLED':
        return 'bg-slate-100 text-slate-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getVehicleName = (assetId: string) => {
    return assets.find(a => a.id === assetId)?.assetName || 'Unknown Vehicle';
  };

  // Calculate maintenance stats
  const totalMaintenanceCost = maintenances.reduce((sum, m) => sum + (m.cost || 0), 0);
  const completedCount = maintenances.filter(m => m.status === 'COMPLETED').length;

  if (loading && activeTab === 'vehicles') {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="w-48 h-9 bg-slate-200 skeleton mb-2" />
            <div className="w-64 h-5 bg-slate-200 skeleton" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Vehicle Management Hub"
          subtitle="Manage vehicles and maintenance records"
          icon={Car}
          badge="Complete Asset Management"
          gradientFrom="from-orange-100"
          gradientTo="to-amber-100"
          iconColor="text-orange-600"
        />

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('vehicles')}
            className={`px-6 py-3 font-medium border-b-2 transition-all ${
              activeTab === 'vehicles'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Car className="w-5 h-5" />
              Vehicles
            </div>
          </button>
          <button
            onClick={() => setActiveTab('maintenance')}
            className={`px-6 py-3 font-medium border-b-2 transition-all ${
              activeTab === 'maintenance'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Wrench className="w-5 h-5" />
              Maintenance
            </div>
          </button>
        </div>

        {/* TAB 1: VEHICLES */}
        {activeTab === 'vehicles' && (
          <>
            <FilterBar
              hasActiveFilters={!!(filters.condition || filters.status || filters.locationId || filters.companyId)}
              onClearFilters={clearFilters}
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-0.5">Condition</label>
                  <select value={filters.condition} onChange={(e) => handleFilterChange('condition', e.target.value)} className="py-1.5 text-sm">
                    <option value="">All</option>
                    <option value="GOOD">Good</option>
                    <option value="REPAIR">Repair</option>
                    <option value="DAMAGED">Damaged</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-0.5">Status</label>
                  <select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)} className="py-1.5 text-sm">
                    <option value="">All</option>
                    <option value="IN_USE">In Use</option>
                    <option value="IN_STORE">In Store</option>
                    <option value="DISPOSED">Disposed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-0.5">Location</label>
                  <select value={filters.locationId} onChange={(e) => handleFilterChange('locationId', e.target.value)} className="py-1.5 text-sm">
                    <option value="">All</option>
                    {locations.map((loc) => (<option key={loc.id} value={loc.id}>{loc.locationName}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-0.5">Office</label>
                  <select value={filters.companyId} onChange={(e) => handleFilterChange('companyId', e.target.value)} className="py-1.5 text-sm">
                    <option value="">All</option>
                    {companies.map((comp) => (<option key={comp.id} value={comp.id}>{comp.companyName}</option>))}
                  </select>
                </div>
              </div>
            </FilterBar>

            {/* Vehicles Header with Add Button */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Vehicles</h2>
              {canAddEditDelete && (
                <Button
                  onClick={openCreateVehicle}
                  variant="primary"
                  icon={<Plus className="w-4 h-4" />}
                >
                  Add Vehicle
                </Button>
              )}
            </div>

            {/* Vehicles Table */}
            <div className="card overflow-hidden">
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>SN</th>
                      <th>Image</th>
                      <SortableHeader label="Asset Name" sortKey="assetName" currentSort={sort} currentOrder={order} onSort={handleSort} />
                      <SortableHeader label="Type" sortKey="vehicleType" currentSort={sort} currentOrder={order} onSort={handleSort} />
                      <SortableHeader label="Brand / Model" sortKey="brand" currentSort={sort} currentOrder={order} onSort={handleSort} />
                      <SortableHeader label="Registration" sortKey="registrationNumber" currentSort={sort} currentOrder={order} onSort={handleSort} />
                      <SortableHeader label="Condition" sortKey="condition" currentSort={sort} currentOrder={order} onSort={handleSort} />
                      <SortableHeader label="Status" sortKey="status" currentSort={sort} currentOrder={order} onSort={handleSort} />
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assets.map((asset, index) => (
                      <tr key={asset.id}>
                        <td className="font-medium text-gray-600">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                        <td>
                          {buildImageUrl(asset.imageUrl) ? (
                            <img
                              src={buildImageUrl(asset.imageUrl)!}
                              alt={asset.assetName}
                              className="w-12 h-12 object-cover border border-slate-200"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-slate-100 flex items-center justify-center">
                              <Car className="w-6 h-6 text-slate-400" />
                            </div>
                          )}
                        </td>
                        <td className="font-medium">{asset.assetName}</td>
                        <td>{asset.vehicleType || '-'}</td>
                        <td>{asset.brand} {asset.model}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            {asset.registrationNumber}
                            {asset.insuranceExpiryDate && isInsuranceExpired(asset.insuranceExpiryDate) && (
                              <AlertTriangle className="w-4 h-4 text-red-500" />
                            )}
                          </div>
                        </td>
                        <td>{conditionBadge(asset.condition)}</td>
                        <td>{statusBadge(asset.status)}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            {canAddEditDelete && (
                              <>
                                <IconButton onClick={() => openEditVehicle(asset)} variant="secondary" icon={<Edit className="w-4 h-4" />} tooltip="Edit" />
                                {canDeleteItem && (
                                  <IconButton onClick={() => handleDeleteVehicle(asset.id, asset.assetName)} variant="danger" icon={<Trash2 className="w-4 h-4" />} tooltip="Delete" />
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {assets.length === 0 && (
                <div className="empty-state border-t border-slate-100">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center mb-4">
                    <Car className="w-10 h-10 text-orange-300" />
                  </div>
                  <p className="empty-state-title text-lg font-semibold text-slate-600">No vehicles found</p>
                  {canAddEditDelete && (
                    <button
                      onClick={openCreateVehicle}
                      className="btn btn-warning mt-4"
                    >
                      <Plus className="w-4 h-4" />
                      Add Vehicle
                    </button>
                  )}
                </div>
              )}
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(totalItems / itemsPerPage)}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={(page) => setCurrentPage(page)}
                onItemsPerPageChange={(perPage) => { setItemsPerPage(perPage); setCurrentPage(1); }}
              />
            </div>
          </>
        )}

        {/* TAB 2: MAINTENANCE */}
        {activeTab === 'maintenance' && (
          <>
            {/* Vehicle Selector */}
            <div className="card p-4 mb-6">
              <div className="flex items-center gap-4">
                <label className="block font-semibold text-slate-700 text-sm whitespace-nowrap">Select Vehicle:</label>
                <select
                  value={selectedMaintenanceVehicle}
                  onChange={(e) => {
                    setSelectedMaintenanceVehicle(e.target.value);
                    setMaintenancePageNum(1);
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Vehicles</option>
                  {assets.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.assetName} ({vehicle.brand} {vehicle.model}) - {vehicle.assetTag || 'No Tag'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Maintenance Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="card p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Wrench className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Total Records</p>
                    <p className="text-2xl font-bold text-slate-900">{totalMaintenanceItems}</p>
                  </div>
                </div>
              </div>
              <div className="card p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Completed</p>
                    <p className="text-2xl font-bold text-slate-900">{completedCount}</p>
                  </div>
                </div>
              </div>
              <div className="card p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Total Cost</p>
                    <p className="text-2xl font-bold text-slate-900">Rs. {totalMaintenanceCost.toLocaleString('en-PK')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Maintenance Header with Add Button */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Maintenance Records</h2>
              {canAddEditDelete && (
                <Button
                  onClick={openCreateMaintenance}
                  variant="primary"
                  icon={<Plus className="w-4 h-4" />}
                >
                  Add Maintenance
                </Button>
              )}
            </div>

            {/* Maintenance Table */}
            <div className="card overflow-hidden">
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>SN</th>
                      <th>Vehicle</th>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Cost (PKR)</th>
                      <th>Status</th>
                      <th>Next Due</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {maintenances.map((maint, index) => (
                      <tr key={maint.id}>
                        <td className="font-medium text-gray-600">{(maintenancePageNum - 1) * maintenanceItemsPerPage + index + 1}</td>
                        <td className="font-medium">{getVehicleName(maint.assetId)}</td>
                        <td className="text-sm">{format(new Date(maint.maintenanceDate), 'MMM d, yyyy')}</td>
                        <td className="text-sm text-slate-600">{maint.description}</td>
                        <td className="font-medium">{maint.cost ? `Rs. ${maint.cost.toLocaleString('en-PK')}` : '-'}</td>
                        <td>
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded ${getMaintenanceStatusColor(maint.status)}`}>
                            {maint.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="text-sm">{maint.nextDueDate ? format(new Date(maint.nextDueDate), 'MMM d, yyyy') : '-'}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            {canAddEditDelete && (
                              <>
                                <IconButton onClick={() => openEditMaintenance(maint)} variant="secondary" icon={<Edit className="w-4 h-4" />} tooltip="Edit" />
                                {canDeleteItem && (
                                  <IconButton onClick={() => handleDeleteMaintenance(maint.id)} variant="danger" icon={<Trash2 className="w-4 h-4" />} tooltip="Delete" />
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {maintenances.length === 0 && (
                <div className="empty-state border-t border-slate-100">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center mb-4">
                    <Wrench className="w-10 h-10 text-blue-300" />
                  </div>
                  <p className="empty-state-title text-lg font-semibold text-slate-600">No maintenance records</p>
                  {canAddEditDelete && (
                    <button
                      onClick={openCreateMaintenance}
                      className="btn btn-primary mt-4"
                    >
                      <Plus className="w-4 h-4" />
                      Add Maintenance
                    </button>
                  )}
                </div>
              )}
              <Pagination
                currentPage={maintenancePageNum}
                totalPages={Math.ceil(totalMaintenanceItems / maintenanceItemsPerPage)}
                totalItems={totalMaintenanceItems}
                itemsPerPage={maintenanceItemsPerPage}
                onPageChange={(page) => setMaintenancePageNum(page)}
                onItemsPerPageChange={(perPage) => { setMaintenanceItemsPerPage(perPage); setMaintenancePageNum(1); }}
              />
            </div>
          </>
        )}

        {/* Vehicle Modal */}
        <ModernVehiclesModal
          isOpen={showVehicleModal}
          onClose={() => { setShowVehicleModal(false); setEditingAsset(null); }}
          onSave={handleSaveVehicle}
          editingAsset={editingAsset}
          saving={saving}
          companies={companies}
          manufacturers={manufacturers}
          locations={locations}
          users={users}
        />

        {/* Maintenance Modal */}
        {showMaintenanceModal && (
          <VehicleMaintenanceModal
            isOpen={showMaintenanceModal}
            onClose={() => { setShowMaintenanceModal(false); setEditingMaintenance(null); }}
            onSave={handleSaveMaintenance}
            vehicles={assets}
            editingMaintenance={editingMaintenance}
          />
        )}
      </div>
    </DashboardLayout>
  );
}


