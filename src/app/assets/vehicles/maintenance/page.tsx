'use client';

import { Suspense } from 'react';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';
import DashboardLayout from '@/components/DashboardLayout';
import PageHeader from '@/components/PageHeader';
import MaintenanceHistoryModal from '@/components/MaintenanceHistoryModal';
import SparePartsModal from '@/components/SparePartsModal';
import { Button, IconButton } from '@/components/Button';
import type { VehicleAsset } from '@/types';
import {
  Plus, Edit2, Trash2, Wrench, Package, TrendingUp, Calendar, DollarSign, AlertCircle, ChevronLeft, Download, Upload, Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import {
  formatCurrency, formatDate, getStatusColor, getWorkTypeColor
} from '@/lib/vehicleCalculations';

export const dynamic = 'force-dynamic';

type Tab = 'maintenance' | 'spareparts' | 'summary';

interface MaintenanceRecord {
  id: string;
  assetId: string;
  assetType: string;
  maintenanceDate: string;
  description: string;
  cost?: number | null;
  performedBy?: string | null;
  nextDueDate?: string | null;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  odometerReading?: number | null;
  workType?: string | null;
  vendorName?: string | null;
  paymentMethod?: string | null;
  remarks?: string | null;
}

interface SparePartRecord {
  id: string;
  partDate: string;
  partName: string;
  quantity: number;
  unitPrice: number;
  totalCost: number;
  supplierName: string;
  vehicleId?: string | null;
  remarks?: string | null;
}

interface VehicleSummary {
  totalMaintenanceCost: number;
  numberOfServices: number;
  lastServiceDate: string | null;
  nextServiceDue: string | null;
  averageCostPerService: number;
  highestSingleRepairCost: number;
  totalLifecycleCost: number;
  daysSinceLastService: number;
  currentOdometer: number | null;
  totalSparePartsCost: number;
  totalLifecycleCostWithSpares: number;
}

function VehicleMaintenanceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { success: toastSuccess, error: toastError } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('maintenance');
  const [vehicles, setVehicles] = useState<VehicleAsset[]>([]);
  const [maintenances, setMaintenances] = useState<MaintenanceRecord[]>([]);
  const [spareParts, setSpareParts] = useState<SparePartRecord[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [vehicleSummary, setVehicleSummary] = useState<VehicleSummary | null>(null);

  const [maintenanceModal, setMaintenanceModal] = useState(false);
  const [sparePartsModal, setSparePartsModal] = useState(false);
  const [editingMaintenance, setEditingMaintenance] = useState<MaintenanceRecord | null>(null);
  const [editingSparePart, setEditingSparePart] = useState<SparePartRecord | null>(null);

  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState('');
  const [maintenancePage, setMaintenancePage] = useState(1);
  const [sparePartsPage, setSparePartsPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const maintenanceFileInputRef = useRef<HTMLInputElement>(null);
  const sparePartsFileInputRef = useRef<HTMLInputElement>(null);

  // Search and filter states
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [maintenanceSearch, setMaintenanceSearch] = useState('');
  const [maintenanceStatusFilter, setMaintenanceStatusFilter] = useState<'ALL' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [maintenanceDepartmentFilter, setMaintenanceDepartmentFilter] = useState('ALL');
  const [maintenanceVehicleFilter, setMaintenanceVehicleFilter] = useState('ALL');
  const [sparePartsSearch, setSparePartsSearch] = useState('');
  const [sparePartsVehicleFilter, setSparePartsVehicleFilter] = useState('ALL');
  const [showVehicleSuggestions, setShowVehicleSuggestions] = useState(false);

  // Fetch vehicles
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await fetch('/api/vehicles?limit=100');
        const data = await response.json();
        if (data.success) {
          setVehicles(data.data);
          const vehicleIdParam = searchParams.get('vehicleId');
          if (vehicleIdParam && data.data.some((v: any) => v.id === vehicleIdParam)) {
            setSelectedVehicle(vehicleIdParam);
          } else if (data.data.length > 0) {
            setSelectedVehicle(data.data[0].id);
          }
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to fetch vehicles:', err);
        setLoading(false);
      }
    };
    fetchVehicles();
  }, [searchParams]);

  // Fetch ALL maintenance records (no vehicle filtering)
  useEffect(() => {
    const fetchMaintenances = async () => {
      setDataLoading(true);
      try {
        const response = await fetch(`/api/maintenances?assetType=VEHICLE&page=1&limit=10000`);
        if (!response.ok) {
          console.error('API response error:', response.status);
          toastError('Failed to load maintenance records');
          setDataLoading(false);
          return;
        }
        const data = await response.json();
        if (data.success) {
          setMaintenances(data.data || []);
        } else {
          console.error('API error:', data.error);
          toastError('Failed to load maintenance records');
        }
      } catch (err) {
        console.error('Failed to fetch maintenances:', err);
        toastError('Error loading maintenance records');
      } finally {
        setDataLoading(false);
      }
    };
    fetchMaintenances();
  }, []);

  // Fetch ALL spare parts (no vehicle filtering)
  useEffect(() => {
    const fetchSpareParts = async () => {
      try {
        const response = await fetch(`/api/spare-parts?page=1&limit=10000`);
        if (!response.ok) {
          console.error('API response error:', response.status);
          return;
        }
        const data = await response.json();
        if (data.success) {
          setSpareParts(data.data || []);
        } else {
          console.error('API error:', data.error);
        }
      } catch (err) {
        console.error('Failed to fetch spare parts:', err);
      }
    };
    fetchSpareParts();
  }, []);

  // Fetch vehicle summary
  useEffect(() => {
    if (!selectedVehicle) return;
    const fetchSummary = async () => {
      try {
        const response = await fetch(`/api/vehicle-summary?vehicleId=${selectedVehicle}`);
        const data = await response.json();
        if (data.success && data.data?.summary) {
          setVehicleSummary(data.data.summary);
        } else {
          console.error('API error:', data.error);
        }
      } catch (err) {
        console.error('Failed to fetch summary:', err);
      }
    };
    fetchSummary();
  }, [selectedVehicle]);

  const handleSaveMaintenance = async (data: any) => {
    try {
      const url = editingMaintenance ? `/api/maintenances/${editingMaintenance.id}` : '/api/maintenances';
      const method = editingMaintenance ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
      });
      const result = await response.json();
      if (result.success) {
        setMaintenanceModal(false);
        setEditingMaintenance(null);
        toastSuccess(editingMaintenance ? 'Maintenance record updated successfully!' : 'Maintenance record added successfully!');
        const res = await fetch(`/api/maintenances?assetType=VEHICLE&page=1&limit=${itemsPerPage}`);
        const updated = await res.json();
        if (updated.success) {
          const filtered = updated.data.filter((m: any) => m.assetId === selectedVehicle);
          setMaintenances(filtered);
        }
      } else {
        toastError(result.error || 'Failed to save maintenance record');
      }
    } catch (err) {
      toastError('Failed to save maintenance record');
    }
  };

  const handleDeleteMaintenance = async (id: string) => {
    if (!confirm('Delete this maintenance record?')) return;
    try {
      const response = await fetch(`/api/maintenances/${id}`, { method: 'DELETE' });
      const result = await response.json();
      if (result.success) {
        setMaintenances(maintenances.filter((m) => m.id !== id));
      }
    } catch (err) {
      setError('Failed to delete maintenance record');
    }
  };

  const handleSaveSparepart = async (data: any) => {
    try {
      const url = editingSparePart ? `/api/spare-parts/${editingSparePart.id}` : '/api/spare-parts';
      const method = editingSparePart ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
      });
      const result = await response.json();
      if (result.success) {
        setSparePartsModal(false);
        setEditingSparePart(null);
        toastSuccess(editingSparePart ? 'Spare part record updated successfully!' : 'Spare part record added successfully!');
        const res = await fetch(`/api/spare-parts?vehicleId=${selectedVehicle}&page=1&limit=${itemsPerPage}`);
        const updated = await res.json();
        if (updated.success) setSpareParts(updated.data);
      } else {
        toastError(result.error || 'Failed to save spare part');
      }
    } catch (err) {
      toastError('Failed to save spare part');
    }
  };

  const handleDeleteSparepart = async (id: string) => {
    if (!confirm('Delete this spare part record?')) return;
    try {
      const response = await fetch(`/api/spare-parts/${id}`, { method: 'DELETE' });
      const result = await response.json();
      if (result.success) {
        setSpareParts(spareParts.filter((sp) => sp.id !== id));
      }
    } catch (err) {
      setError('Failed to delete spare part');
    }
  };

  const handleExportMaintenance = () => {
    if (maintenances.length === 0) {
      toastError('No maintenance records to export');
      return;
    }

    const headers = ['Date', 'Type', 'Description', 'Vendor', 'Cost (PKR)', 'Odometer', 'Status', 'Next Due Date', 'Remarks'];
    const rows = maintenances.map(m => [
      formatDate(new Date(m.maintenanceDate)),
      m.workType || '',
      m.description,
      m.vendorName || '',
      m.cost || '',
      m.odometerReading || '',
      m.status,
      m.nextDueDate ? formatDate(new Date(m.nextDueDate)) : '',
      m.remarks || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `maintenance_${currentVehicle?.assetName || 'all'}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    toastSuccess(`Exported ${maintenances.length} maintenance records`);
  };

  const handleImportMaintenance = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const csv = event.target?.result as string;
        const lines = csv.split('\n').filter(line => line.trim());
        if (lines.length < 2) {
          toastError('CSV file is empty');
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const records: any[] = [];

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
          if (values.length < 3) continue;

          records.push({
            maintenanceDate: values[0] || new Date().toISOString().split('T')[0],
            description: values[2] || 'Imported maintenance record',
            cost: parseFloat(values[4]) || 0,
            vendorName: values[3] || '',
            workType: values[1] || 'General',
            status: values[6] || 'COMPLETED',
            odometerReading: values[5] ? parseInt(values[5]) : null,
            nextDueDate: values[7] || null,
            remarks: values[8] || '',
            performedBy: values[3] || '',
            paymentMethod: 'Bank Transfer',
            assetId: selectedVehicle,
            assetType: 'VEHICLE',
          });
        }

        let successCount = 0;
        for (const record of records) {
          try {
            const response = await fetch('/api/maintenance', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(record),
            });
            if (response.ok) successCount++;
          } catch (err) {
            console.error('Error importing record:', err);
          }
        }

        const res = await fetch(`/api/maintenance?assetId=${selectedVehicle}&page=1&limit=${itemsPerPage}`);
        const updated = await res.json();
        if (updated.success) setMaintenances(updated.data);

        toastSuccess(`Imported ${successCount} maintenance records successfully!`);
      } catch (err) {
        toastError('Error importing CSV file');
      }
    };
    reader.readAsText(file);
    if (maintenanceFileInputRef.current) maintenanceFileInputRef.current.value = '';
  };

  const handleExportSpareParts = () => {
    if (spareParts.length === 0) {
      toastError('No spare parts records to export');
      return;
    }

    const headers = ['Date', 'Part Name', 'Quantity', 'Unit Price (PKR)', 'Total Cost (PKR)', 'Supplier', 'Remarks'];
    const rows = spareParts.map(p => [
      formatDate(new Date(p.partDate)),
      p.partName,
      p.quantity,
      p.unitPrice,
      p.totalCost,
      p.supplierName,
      p.remarks || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spare_parts_${currentVehicle?.assetName || 'all'}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    toastSuccess(`Exported ${spareParts.length} spare parts records`);
  };

  const handleImportSpareParts = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const csv = event.target?.result as string;
        const lines = csv.split('\n').filter(line => line.trim());
        if (lines.length < 2) {
          toastError('CSV file is empty');
          return;
        }

        const records: any[] = [];

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
          if (values.length < 3) continue;

          const quantity = parseFloat(values[2]) || 0;
          const unitPrice = parseFloat(values[3]) || 0;

          records.push({
            partDate: values[0] || new Date().toISOString().split('T')[0],
            partName: values[1] || 'Imported part',
            quantity: quantity,
            unitPrice: unitPrice,
            totalCost: quantity * unitPrice,
            supplierName: values[5] || '',
            remarks: values[6] || '',
            vehicleId: selectedVehicle || null,
          });
        }

        let successCount = 0;
        for (const record of records) {
          try {
            const response = await fetch('/api/spare-parts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(record),
            });
            if (response.ok) successCount++;
          } catch (err) {
            console.error('Error importing record:', err);
          }
        }

        const res = await fetch(`/api/spare-parts?vehicleId=${selectedVehicle}&page=1&limit=${itemsPerPage}`);
        const updated = await res.json();
        if (updated.success) setSpareParts(updated.data);

        toastSuccess(`Imported ${successCount} spare parts records successfully!`);
      } catch (err) {
        toastError('Error importing CSV file');
      }
    };
    reader.readAsText(file);
    if (sparePartsFileInputRef.current) sparePartsFileInputRef.current.value = '';
  };

  const currentVehicle = vehicles.find((v) => v.id === selectedVehicle);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading vehicles...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (vehicles.length === 0) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <p className="text-slate-600">No vehicles found. Please add vehicles first.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!selectedVehicle) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PageHeader
            title="Vehicle Maintenance Management"
            subtitle="Manage maintenance records, spare parts, and lifecycle costs"
            icon={Wrench}
            badge="Maintenance Hub"
            gradientFrom="from-blue-100"
            gradientTo="to-cyan-100"
            iconColor="text-blue-600"
          />
          <div className="card p-8 text-center">
            <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 mb-6">Please select a vehicle to view maintenance details</p>
            <div className="inline-block">
              <select
                onChange={(e) => setSelectedVehicle(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoComplete="off"
              >
                <option value="">Select a vehicle...</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.assetName} ({vehicle.brand} {vehicle.model}) - {vehicle.assetTag || 'No Tag'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const getPaginationData = () => {
    if (activeTab === 'maintenance') {
      const filteredMaintenances = maintenances.filter((m) => {
        const matchesSearch = maintenanceSearch === '' ||
          m.description.toLowerCase().includes(maintenanceSearch.toLowerCase()) ||
          m.remarks?.toLowerCase().includes(maintenanceSearch.toLowerCase());
        const matchesVehicle = maintenanceVehicleFilter === 'ALL' || m.assetId === maintenanceVehicleFilter;
        const matchesStatus = maintenanceStatusFilter === 'ALL' || m.status === maintenanceStatusFilter;
        const matchesDepartment = maintenanceDepartmentFilter === 'ALL' ||
          (maintenanceDepartmentFilter === 'MAINTENANCE' && m.workType === 'MAINTENANCE') ||
          (maintenanceDepartmentFilter === 'REPAIR' && m.workType === 'REPAIR') ||
          (maintenanceDepartmentFilter === 'SERVICE' && m.workType === 'SERVICE') ||
          (maintenanceDepartmentFilter === 'OTHER' && !['MAINTENANCE', 'REPAIR', 'SERVICE'].includes(m.workType || ''));
        return matchesSearch && matchesVehicle && matchesStatus && matchesDepartment;
      });
      return {
        currentPage: maintenancePage,
        totalPages: Math.ceil(filteredMaintenances.length / itemsPerPage),
        itemsPerPage,
        totalItems: filteredMaintenances.length,
      };
    } else if (activeTab === 'spareparts') {
      const filteredSpareParts = spareParts.filter((p) => {
        const matchesSearch = sparePartsSearch === '' ||
          p.partName.toLowerCase().includes(sparePartsSearch.toLowerCase()) ||
          p.supplierName.toLowerCase().includes(sparePartsSearch.toLowerCase()) ||
          p.remarks?.toLowerCase().includes(sparePartsSearch.toLowerCase());
        const matchesVehicle = sparePartsVehicleFilter === 'ALL' || p.vehicleId === sparePartsVehicleFilter;
        return matchesSearch && matchesVehicle;
      });
      return {
        currentPage: sparePartsPage,
        totalPages: Math.ceil(filteredSpareParts.length / itemsPerPage),
        itemsPerPage,
        totalItems: filteredSpareParts.length,
      };
    }
    return {
      currentPage: 1,
      totalPages: 1,
      itemsPerPage,
      totalItems: 0,
    };
  };

  const paginationData = getPaginationData();

  return (
    <DashboardLayout
      currentPage={paginationData.currentPage}
      totalPages={paginationData.totalPages}
      itemsPerPage={paginationData.itemsPerPage}
      totalItems={paginationData.totalItems}
      onPageChange={(page) => {
        if (activeTab === 'maintenance') {
          setMaintenancePage(page);
        } else if (activeTab === 'spareparts') {
          setSparePartsPage(page);
        }
      }}
      onItemsPerPageChange={(perPage) => {
        // Would need to modify itemsPerPage state if we want per-page changes
        // For now, keeping fixed itemsPerPage
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        <PageHeader
          title="Vehicle Maintenance Management"
          subtitle="Manage maintenance records, spare parts, and lifecycle costs"
          icon={Wrench}
          badge="Maintenance Hub"
          gradientFrom="from-blue-100"
          gradientTo="to-cyan-100"
          iconColor="text-blue-600"
        />


        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="flex border-b border-slate-200">
            {[
              { id: 'maintenance', label: 'Maintenance History', icon: Wrench },
              { id: 'spareparts', label: 'Spare Parts', icon: Package },
              { id: 'summary', label: 'Summary & Calculations', icon: TrendingUp },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as Tab)}
                className={`flex-1 px-6 py-4 font-medium flex items-center justify-center gap-2 transition-all ${
                  activeTab === id
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </button>
            ))}
          </div>

          {/* TAB: Maintenance History */}
          {activeTab === 'maintenance' && (
            <div className="p-6">
              {dataLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-slate-600 text-sm">Loading maintenance records...</p>
                  </div>
                </div>
              )}
              {!dataLoading && (
              <div>
              {/* Maintenance Filters */}
              <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/30 border border-slate-200 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  {/* Search Description */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">SEARCH</label>
                    <input
                      type="text"
                      placeholder="Description..."
                      value={maintenanceSearch}
                      onChange={(e) => setMaintenanceSearch(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>

                  {/* Vehicle Filter */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">VEHICLE</label>
                    <select
                      value={maintenanceVehicleFilter}
                      onChange={(e) => setMaintenanceVehicleFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="ALL">All Vehicles</option>
                      {vehicles.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.assetName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">STATUS</label>
                    <select
                      value={maintenanceStatusFilter}
                      onChange={(e) => setMaintenanceStatusFilter(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="ALL">All</option>
                      <option value="SCHEDULED">Scheduled</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>

                  {/* Department Filter */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">DEPT</label>
                    <select
                      value={maintenanceDepartmentFilter}
                      onChange={(e) => setMaintenanceDepartmentFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="ALL">All</option>
                      <option value="MAINTENANCE">Maintenance</option>
                      <option value="REPAIR">Repair</option>
                      <option value="SERVICE">Service</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  {/* Clear Button */}
                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setMaintenanceSearch('');
                        setMaintenanceStatusFilter('ALL');
                        setMaintenanceDepartmentFilter('ALL');
                        setMaintenanceVehicleFilter('ALL');
                      }}
                      className="w-full px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all font-medium"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-slate-900">Maintenance Records</h3>
                <div className="flex gap-3">
                  <input
                    ref={maintenanceFileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleImportMaintenance}
                    className="hidden"
                  />
                  <Button
                    onClick={() => maintenanceFileInputRef.current?.click()}
                    variant="secondary"
                    icon={<Upload className="w-4 h-4" />}
                  >
                    Import CSV
                  </Button>
                  <Button
                    onClick={handleExportMaintenance}
                    variant="secondary"
                    icon={<Download className="w-4 h-4" />}
                  >
                    Export CSV
                  </Button>
                  <Button
                    onClick={() => {
                      setEditingMaintenance(null);
                      setMaintenanceModal(true);
                    }}
                    variant="primary"
                    icon={<Plus className="w-4 h-4" />}
                  >
                    Add Record
                  </Button>
                </div>
              </div>

              {(() => {
                const filteredMaintenances = maintenances.filter((m) => {
                  const matchesSearch = maintenanceSearch === '' ||
                    m.description.toLowerCase().includes(maintenanceSearch.toLowerCase()) ||
                    m.remarks?.toLowerCase().includes(maintenanceSearch.toLowerCase());

                  const matchesVehicle = maintenanceVehicleFilter === 'ALL' || m.assetId === maintenanceVehicleFilter;

                  const matchesStatus = maintenanceStatusFilter === 'ALL' || m.status === maintenanceStatusFilter;

                  const matchesDepartment = maintenanceDepartmentFilter === 'ALL' ||
                    (maintenanceDepartmentFilter === 'MAINTENANCE' && m.workType === 'MAINTENANCE') ||
                    (maintenanceDepartmentFilter === 'REPAIR' && m.workType === 'REPAIR') ||
                    (maintenanceDepartmentFilter === 'SERVICE' && m.workType === 'SERVICE') ||
                    (maintenanceDepartmentFilter === 'OTHER' && !['MAINTENANCE', 'REPAIR', 'SERVICE'].includes(m.workType || ''));

                  return matchesSearch && matchesVehicle && matchesStatus && matchesDepartment;
                });

                return filteredMaintenances.length === 0 ? (
                  <div className="text-center py-12">
                    <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">No maintenance records found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">SN</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Vehicle</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Date</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Type</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Description</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Odometer</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Cost</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Status</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredMaintenances.slice((maintenancePage - 1) * itemsPerPage, maintenancePage * itemsPerPage).map((m, i) => {
                          const vehicleRecord = vehicles.find((v) => v.id === m.assetId);
                          return (
                            <tr key={m.id} className="border-b border-slate-200 hover:bg-slate-50">
                              <td className="px-4 py-3 text-sm font-medium text-slate-600">{(maintenancePage - 1) * itemsPerPage + i + 1}</td>
                              <td className="px-4 py-3 text-sm font-medium text-slate-900">{vehicleRecord?.assetName || 'Unknown'}</td>
                              <td className="px-4 py-3 text-sm text-slate-900">{formatDate(new Date(m.maintenanceDate))}</td>
                          <td className="px-4 py-3 text-sm">
                            {m.workType && (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getWorkTypeColor(m.workType)}`}>
                                {m.workType}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-700">{m.description.substring(0, 30)}</td>
                          <td className="px-4 py-3 text-sm text-slate-700">{m.vendorName || '-'}</td>
                          <td className="px-4 py-3 text-sm text-slate-700">{m.odometerReading ? `${m.odometerReading} km` : '-'}</td>
                          <td className="px-4 py-3 text-sm font-medium text-slate-900">{formatCurrency(m.cost)}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(m.status)}`}>
                              {m.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-right">
                            <div className="flex justify-end gap-2">
                              <IconButton
                                onClick={() => {
                                  setEditingMaintenance(m);
                                  setMaintenanceModal(true);
                                }}
                                variant="secondary"
                                icon={<Edit2 className="w-4 h-4" />}
                                tooltip="Edit"
                              />
                              <IconButton
                                onClick={() => handleDeleteMaintenance(m.id)}
                                variant="danger"
                                icon={<Trash2 className="w-4 h-4" />}
                                tooltip="Delete"
                              />
                            </div>
                          </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })()}

              </div>
              )}
            </div>
          )}

          {/* TAB: Spare Parts */}
          {activeTab === 'spareparts' && (
            <div className="p-6">
              {/* Spare Parts Filters */}
              <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/30 border border-slate-200 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Search */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">SEARCH</label>
                    <input
                      type="text"
                      placeholder="Part name..."
                      value={sparePartsSearch}
                      onChange={(e) => setSparePartsSearch(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>

                  {/* Vehicle Filter */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">VEHICLE</label>
                    <select
                      value={sparePartsVehicleFilter}
                      onChange={(e) => setSparePartsVehicleFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="ALL">All Vehicles</option>
                      {vehicles.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.assetName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Clear */}
                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setSparePartsSearch('');
                        setSparePartsVehicleFilter('ALL');
                      }}
                      className="w-full px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all font-medium"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-slate-900">Spare Parts & Purchases</h3>
                <div className="flex gap-3">
                  <input
                    ref={sparePartsFileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleImportSpareParts}
                    className="hidden"
                  />
                  <Button
                    onClick={() => sparePartsFileInputRef.current?.click()}
                    variant="secondary"
                    icon={<Upload className="w-4 h-4" />}
                  >
                    Import CSV
                  </Button>
                  <Button
                    onClick={handleExportSpareParts}
                    variant="secondary"
                    icon={<Download className="w-4 h-4" />}
                  >
                    Export CSV
                  </Button>
                  <Button
                    onClick={() => {
                      setEditingSparePart(null);
                      setSparePartsModal(true);
                    }}
                    variant="primary"
                    icon={<Plus className="w-4 h-4" />}
                  >
                    Add Part
                  </Button>
                </div>
              </div>

              {(() => {
                const filteredSpareParts = spareParts.filter((p) => {
                  const matchesSearch = sparePartsSearch === '' ||
                    p.partName.toLowerCase().includes(sparePartsSearch.toLowerCase()) ||
                    p.supplierName.toLowerCase().includes(sparePartsSearch.toLowerCase()) ||
                    p.remarks?.toLowerCase().includes(sparePartsSearch.toLowerCase());

                  const matchesVehicle = sparePartsVehicleFilter === 'ALL' || p.vehicleId === sparePartsVehicleFilter;

                  return matchesSearch && matchesVehicle;
                });

                return filteredSpareParts.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">No spare parts records found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">SN</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Vehicle</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Date</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Part Name</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Qty</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Unit Price</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Total Cost</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Supplier</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredSpareParts.slice((sparePartsPage - 1) * itemsPerPage, sparePartsPage * itemsPerPage).map((p, i) => {
                          const vehicleRecord = vehicles.find((v) => v.id === p.vehicleId);
                          return (
                            <tr key={p.id} className="border-b border-slate-200 hover:bg-slate-50">
                              <td className="px-4 py-3 text-sm font-medium text-slate-600">{(sparePartsPage - 1) * itemsPerPage + i + 1}</td>
                              <td className="px-4 py-3 text-sm font-medium text-slate-900">{vehicleRecord?.assetName || 'Unknown'}</td>
                              <td className="px-4 py-3 text-sm text-slate-900">{formatDate(new Date(p.partDate))}</td>
                          <td className="px-4 py-3 text-sm font-medium text-slate-900">{p.partName}</td>
                          <td className="px-4 py-3 text-sm text-slate-700">{p.quantity}</td>
                          <td className="px-4 py-3 text-sm text-slate-700">{formatCurrency(p.unitPrice)}</td>
                          <td className="px-4 py-3 text-sm font-medium text-slate-900">{formatCurrency(p.totalCost)}</td>
                          <td className="px-4 py-3 text-sm text-slate-700">{p.supplierName}</td>
                          <td className="px-4 py-3 text-sm text-right">
                            <div className="flex justify-end gap-2">
                              <IconButton
                                onClick={() => {
                                  setEditingSparePart(p);
                                  setSparePartsModal(true);
                                }}
                                variant="secondary"
                                icon={<Edit2 className="w-4 h-4" />}
                                tooltip="Edit"
                              />
                              <IconButton
                                onClick={() => handleDeleteSparepart(p.id)}
                                variant="danger"
                                icon={<Trash2 className="w-4 h-4" />}
                                tooltip="Delete"
                              />
                            </div>
                            </td>
                            </tr>
                          );
                        })}
                      </tbody>
                  </table>
                  </div>
                );
              })()}

            </div>
          )}

          {/* TAB: Summary */}
          {activeTab === 'summary' && vehicleSummary && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Total Maintenance Cost', value: formatCurrency(vehicleSummary.totalMaintenanceCost), icon: DollarSign, color: 'bg-blue-100 text-blue-600' },
                  { label: 'Service Count', value: vehicleSummary.numberOfServices, icon: Wrench, color: 'bg-emerald-100 text-emerald-600' },
                  { label: 'Last Service', value: vehicleSummary.lastServiceDate ? format(new Date(vehicleSummary.lastServiceDate), 'MMM d, yyyy') : 'N/A', icon: Calendar, color: 'bg-amber-100 text-amber-600' },
                  { label: 'Avg Cost/Service', value: formatCurrency(vehicleSummary.averageCostPerService), icon: DollarSign, color: 'bg-purple-100 text-purple-600' },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="card p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">{label}</p>
                        <p className="text-lg font-bold text-slate-900">{value}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: 'Highest Repair Cost', value: formatCurrency(vehicleSummary.highestSingleRepairCost) },
                  { label: 'Total Lifecycle Cost', value: formatCurrency(vehicleSummary.totalLifecycleCost) },
                  { label: 'Days Since Service', value: `${vehicleSummary.daysSinceLastService} days` },
                  { label: 'Spare Parts Cost', value: formatCurrency(vehicleSummary.totalSparePartsCost) },
                  { label: 'Next Service Due', value: vehicleSummary.nextServiceDue ? format(new Date(vehicleSummary.nextServiceDue), 'MMM d, yyyy') : 'N/A' },
                  { label: 'Total w/ Spare Parts', value: formatCurrency(vehicleSummary.totalLifecycleCostWithSpares) },
                ].map(({ label, value }) => (
                  <div key={label} className="card p-4">
                    <p className="text-xs text-slate-500 mb-1">{label}</p>
                    <p className="text-xl font-bold text-slate-900">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modals */}
        {maintenanceModal && (
          <MaintenanceHistoryModal
            isOpen={maintenanceModal}
            onClose={() => { setMaintenanceModal(false); setEditingMaintenance(null); }}
            onSave={handleSaveMaintenance}
            vehicles={vehicles}
            editingMaintenance={editingMaintenance}
          />
        )}

        {sparePartsModal && (
          <SparePartsModal
            isOpen={sparePartsModal}
            onClose={() => { setSparePartsModal(false); setEditingSparePart(null); }}
            onSave={handleSaveSparepart}
            vehicles={vehicles}
            editingSparePart={editingSparePart}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

export default function VehicleMaintenancePage() {
  return (
    <Suspense fallback={
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Upload className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-slate-600">Loading maintenance data...</span>
        </div>
      </DashboardLayout>
    }>
      <VehicleMaintenanceContent />
    </Suspense>
  );
}
