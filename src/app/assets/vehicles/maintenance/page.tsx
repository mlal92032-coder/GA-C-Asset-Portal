'use client';

import { Suspense } from 'react';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';
import DashboardLayout from '@/components/DashboardLayout';
import MaintenanceHistoryModal from '@/components/MaintenanceHistoryModal';
import SparePartsModal from '@/components/SparePartsModal';
import PageHeader from '@/components/PageHeader';
import { Button, IconButton } from '@/components/ui';
import type { VehicleAsset } from '@/types';
import {
  Plus, Edit2, Trash2, Wrench, Package, TrendingUp, Calendar, DollarSign, AlertCircle, ChevronLeft, Download, Upload, Loader2, FileText, X
} from 'lucide-react';
import { format, parseISO, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';
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
  const [maintenanceDateFrom, setMaintenanceDateFrom] = useState('');
  const [maintenanceDateTo, setMaintenanceDateTo] = useState('');
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
        const data = await response.json();
        if (!response.ok) {
          console.error('API response error:', response.status, data.error || data);
          return;
        }
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

  // Sync filters with selected vehicle
  useEffect(() => {
    if (selectedVehicle) {
      setMaintenanceVehicleFilter(selectedVehicle);
      setSparePartsVehicleFilter(selectedVehicle);
    }
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

  // PDF Export handler
  const generateMaintenancePDF = () => {
    if (maintenances.length === 0) {
      toastError('No maintenance records to export');
      return;
    }

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

      let matchesDateRange = true;
      if (maintenanceDateFrom || maintenanceDateTo) {
        const mainDate = parseISO(m.maintenanceDate);
        if (maintenanceDateFrom && isBefore(mainDate, startOfDay(parseISO(maintenanceDateFrom)))) {
          matchesDateRange = false;
        }
        if (maintenanceDateTo && isAfter(mainDate, endOfDay(parseISO(maintenanceDateTo)))) {
          matchesDateRange = false;
        }
      }

      return matchesSearch && matchesVehicle && matchesStatus && matchesDepartment && matchesDateRange;
    });

    if (filteredMaintenances.length === 0) {
      toastError('No records match the applied filters');
      return;
    }

    // Create HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; line-height: 1.6; }
          .container { max-width: 1000px; margin: 0 auto; padding: 40px; }
          .header { background: linear-gradient(135deg, #1e40af 0%, #0284c7 100%); color: white; padding: 30px; border-radius: 8px; margin-bottom: 30px; }
          .header h1 { font-size: 28px; margin-bottom: 10px; }
          .header-info { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-top: 20px; font-size: 13px; }
          .header-item { background: rgba(255,255,255,0.1); padding: 12px; border-radius: 5px; }
          .header-item strong { display: block; font-size: 11px; opacity: 0.9; margin-bottom: 4px; }
          .filter-summary { background: #f0f9ff; border-left: 4px solid #0284c7; padding: 15px; margin-bottom: 25px; border-radius: 4px; font-size: 13px; }
          .filter-summary strong { color: #0284c7; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          table thead { background-color: #f3f4f6; }
          table th { padding: 12px; text-align: left; font-weight: 600; font-size: 12px; color: #374151; border-bottom: 2px solid #d1d5db; text-transform: uppercase; letter-spacing: 0.5px; }
          table td { padding: 11px 12px; border-bottom: 1px solid #e5e7eb; font-size: 12px; }
          table tbody tr:nth-child(even) { background-color: #f9fafb; }
          table tbody tr:hover { background-color: #f3f4f6; }
          .status { padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
          .status-completed { background-color: #dcfce7; color: #166534; }
          .status-scheduled { background-color: #fef3c7; color: #92400e; }
          .status-in_progress { background-color: #dbeafe; color: #0c4a6e; }
          .status-cancelled { background-color: #fee2e2; color: #7f1d1d; }
          .worktype { padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; }
          .worktype-maintenance { background-color: #e0e7ff; color: #3730a3; }
          .worktype-repair { background-color: #fed7aa; color: #92400e; }
          .worktype-service { background-color: #c7d2fe; color: #3730a3; }
          .worktype-other { background-color: #e5e7eb; color: #374151; }
          .summary { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-top: 30px; }
          .summary-card { background: #f3f4f6; padding: 20px; border-radius: 6px; border-left: 4px solid #0284c7; }
          .summary-card strong { display: block; font-size: 11px; color: #6b7280; margin-bottom: 8px; text-transform: uppercase; }
          .summary-card .value { font-size: 24px; font-weight: 700; color: #1f2937; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #6b7280; text-align: center; }
          .page-break { page-break-after: always; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Maintenance Report</h1>
            <p style="font-size: 14px; opacity: 0.95;">Asset Management System</p>
            <div class="header-info">
              <div class="header-item">
                <strong>Vehicle:</strong>
                ${currentVehicle?.assetName || 'N/A'}
              </div>
              <div class="header-item">
                <strong>Registration:</strong>
                ${currentVehicle?.registrationNumber || 'N/A'}
              </div>
              <div class="header-item">
                <strong>Type:</strong>
                ${currentVehicle?.assetType || 'N/A'}
              </div>
            </div>
          </div>

          ${maintenanceDateFrom || maintenanceDateTo ? `
          <div class="filter-summary">
            <strong>Date Range Applied:</strong> ${maintenanceDateFrom ? format(parseISO(maintenanceDateFrom), 'dd MMM yyyy') : 'From beginning'} to ${maintenanceDateTo ? format(parseISO(maintenanceDateTo), 'dd MMM yyyy') : 'Present'}
            ${maintenanceStatusFilter !== 'ALL' ? `<br><strong>Status:</strong> ${maintenanceStatusFilter}` : ''}
            ${maintenanceDepartmentFilter !== 'ALL' ? `<br><strong>Department:</strong> ${maintenanceDepartmentFilter}` : ''}
          </div>
          ` : ''}

          <table>
            <thead>
              <tr>
                <th style="width: 8%;">SN</th>
                <th style="width: 12%;">Date</th>
                <th style="width: 12%;">Type</th>
                <th style="width: 20%;">Description</th>
                <th style="width: 12%;">Cost</th>
                <th style="width: 10%;">Odometer</th>
                <th style="width: 12%;">Status</th>
                <th style="width: 14%;">Next Due</th>
              </tr>
            </thead>
            <tbody>
              ${filteredMaintenances.map((m, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${format(parseISO(m.maintenanceDate), 'dd MMM yyyy')}</td>
                <td><span class="worktype worktype-${(m.workType || 'other').toLowerCase().replace(/_/g, '-')}">${m.workType || 'Other'}</span></td>
                <td>${m.description.substring(0, 50)}</td>
                <td style="font-weight: 600;">PKR ${(m.cost || 0).toLocaleString('en-PK')}</td>
                <td>${m.odometerReading ? `${m.odometerReading} km` : '-'}</td>
                <td><span class="status status-${m.status.toLowerCase().replace(/_/g, '-')}">${m.status}</span></td>
                <td>${m.nextDueDate ? format(parseISO(m.nextDueDate), 'dd MMM yyyy') : '-'}</td>
              </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="summary">
            <div class="summary-card">
              <strong>Total Records</strong>
              <div class="value">${filteredMaintenances.length}</div>
            </div>
            <div class="summary-card">
              <strong>Total Cost</strong>
              <div class="value">PKR ${filteredMaintenances.reduce((sum, m) => sum + (m.cost || 0), 0).toLocaleString('en-PK')}</div>
            </div>
            <div class="summary-card">
              <strong>Average Cost/Record</strong>
              <div class="value">PKR ${(filteredMaintenances.reduce((sum, m) => sum + (m.cost || 0), 0) / filteredMaintenances.length).toLocaleString('en-PK', { maximumFractionDigits: 0 })}</div>
            </div>
          </div>

          <div class="footer">
            <p>Generated on ${format(new Date(), 'dd MMM yyyy HH:mm:ss')}</p>
            <p style="margin-top: 8px;">This is an official maintenance report from the Asset Management System</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '', 'width=1200,height=800');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
    toastSuccess('PDF exported successfully');
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="w-full max-w-full px-1.5 sm:px-2 lg:px-3 overflow-x-hidden px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-2"></div>
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
        <div className="w-full max-w-full px-1.5 sm:px-2 lg:px-3 overflow-x-hidden px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-2" />
            <p className="text-slate-600">No vehicles found. Please add vehicles first.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!selectedVehicle) {
    return (
      <DashboardLayout>
        <div className="w-full max-w-full px-1.5 sm:px-2 lg:px-3 overflow-x-hidden px-4 sm:px-6 lg:px-8">
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
            <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-600 mb-2">Please select a vehicle to view maintenance details</p>
            <div className="inline-block">
              <select
                onChange={(e) => setSelectedVehicle(e.target.value)}
                className="px-4 py-1 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
      <div className="w-full max-w-full px-1.5 sm:px-2 lg:px-3 overflow-x-hidden px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-2 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-1.5">
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

        {/* Vehicle Selector and Search Card */}
        <div className="bg-gradient-to-r from-blue-50 via-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-6 mb-6 shadow-md">
          <div>
            <label className="block text-xs font-bold text-blue-700 mb-3 uppercase tracking-widest">📍 SELECT VEHICLE FOR DETAILED RECORDS</label>

            {/* Search by vehicle name or registration */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-600 mb-2">SEARCH VEHICLES</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by vehicle name or registration number..."
                  value={vehicleSearch}
                  onChange={(e) => {
                    setVehicleSearch(e.target.value);
                    setShowVehicleSuggestions(true);
                  }}
                  onFocus={() => setShowVehicleSuggestions(true)}
                  className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white text-slate-900 hover:border-blue-400 transition-colors"
                />
                {vehicleSearch && (
                  <button
                    onClick={() => setVehicleSearch('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                {showVehicleSuggestions && vehicleSearch && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-blue-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                    {vehicles
                      .filter(v =>
                        v.assetName.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
                        v.registrationNumber.toLowerCase().includes(vehicleSearch.toLowerCase())
                      )
                      .map(v => (
                        <button
                          key={v.id}
                          onClick={() => {
                            setSelectedVehicle(v.id);
                            setVehicleSearch('');
                            setShowVehicleSuggestions(false);
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-blue-50 border-b border-slate-100 text-sm text-slate-900"
                        >
                          <span className="font-semibold">{v.assetName}</span>
                          <span className="text-xs text-slate-500 ml-2">({v.registrationNumber})</span>
                        </button>
                      ))}
                    {vehicles.filter(v =>
                      v.assetName.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
                      v.registrationNumber.toLowerCase().includes(vehicleSearch.toLowerCase())
                    ).length === 0 && (
                      <div className="px-4 py-2 text-sm text-slate-500">No vehicles found</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Direct selection dropdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">OR SELECT FROM LIST</label>
                <select
                  value={selectedVehicle}
                  onChange={(e) => setSelectedVehicle(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white text-slate-900 hover:border-blue-400 transition-colors"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.assetName} ({v.registrationNumber})
                    </option>
                  ))}
                </select>
              </div>
              {selectedVehicle && vehicles.find(v => v.id === selectedVehicle) && (
                <>
                  <div className="bg-white rounded-lg p-3 border-2 border-blue-200 shadow-sm">
                    <p className="text-xs text-slate-500 font-semibold mb-1">REGISTRATION</p>
                    <p className="text-base font-bold text-blue-700">{vehicles.find(v => v.id === selectedVehicle)?.registrationNumber}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border-2 border-blue-200 shadow-sm">
                    <p className="text-xs text-slate-500 font-semibold mb-1">ASSET TYPE</p>
                    <p className="text-base font-bold text-slate-900">{vehicles.find(v => v.id === selectedVehicle)?.assetType || 'N/A'}</p>
                  </div>
                </>
              )}
            </div>
            {selectedVehicle && vehicles.find(v => v.id === selectedVehicle) && (
              <div className="mt-4 p-3 bg-blue-100 rounded-lg border border-blue-300">
                <p className="text-xs text-blue-800">
                  ✓ <span className="font-semibold">Now viewing all records for:</span> {vehicles.find(v => v.id === selectedVehicle)?.assetName}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="flex border-b-2 border-slate-100">
            {[
              { id: 'maintenance', label: 'Maintenance History', icon: Wrench },
              { id: 'spareparts', label: 'Spare Parts', icon: Package },
              { id: 'summary', label: 'Summary & Calculations', icon: TrendingUp },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as Tab)}
                className={`flex-1 px-6 py-4 font-semibold flex items-center justify-center gap-2 transition-all text-sm ${
                  activeTab === id
                    ? 'border-b-3 border-blue-600 text-blue-700 bg-blue-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
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
              <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/30 border-2 border-blue-200 rounded-lg p-5 mb-4 shadow-sm">
                <h4 className="text-xs font-bold text-slate-700 mb-4 uppercase tracking-wider">Filter Maintenance Records</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {/* Search Description */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">Search Description</label>
                    <input
                      type="text"
                      placeholder="Description..."
                      value={maintenanceSearch}
                      onChange={(e) => setMaintenanceSearch(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white hover:border-slate-400 transition-colors"
                    />
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">Status</label>
                    <select
                      value={maintenanceStatusFilter}
                      onChange={(e) => setMaintenanceStatusFilter(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white hover:border-slate-400 transition-colors"
                    >
                      <option value="ALL">All Status</option>
                      <option value="SCHEDULED">Scheduled</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>

                  {/* Department Filter */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">Department</label>
                    <select
                      value={maintenanceDepartmentFilter}
                      onChange={(e) => setMaintenanceDepartmentFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white hover:border-slate-400 transition-colors"
                    >
                      <option value="ALL">All Departments</option>
                      <option value="MAINTENANCE">Maintenance</option>
                      <option value="REPAIR">Repair</option>
                      <option value="SERVICE">Service</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  {/* From Date */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">From Date</label>
                    <input
                      type="date"
                      value={maintenanceDateFrom}
                      onChange={(e) => setMaintenanceDateFrom(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white hover:border-slate-400 transition-colors"
                    />
                  </div>

                  {/* To Date */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">To Date</label>
                    <input
                      type="date"
                      value={maintenanceDateTo}
                      onChange={(e) => setMaintenanceDateTo(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white hover:border-slate-400 transition-colors"
                    />
                  </div>

                  {/* Clear Button */}
                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setMaintenanceSearch('');
                        setMaintenanceStatusFilter('ALL');
                        setMaintenanceDepartmentFilter('ALL');
                        setMaintenanceDateFrom('');
                        setMaintenanceDateTo('');
                      }}
                      className="w-full px-3 py-2 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-all font-medium border border-red-300"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                {/* Active Filters Display */}
                {(maintenanceSearch || maintenanceStatusFilter !== 'ALL' || maintenanceDepartmentFilter !== 'ALL' || maintenanceDateFrom || maintenanceDateTo) && (
                  <div className="mt-3 flex flex-wrap gap-2 items-center">
                    <span className="text-xs font-semibold text-slate-600">Active filters:</span>
                    {maintenanceSearch && (
                      <span className="px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded-full">
                        Search: "{maintenanceSearch}"
                      </span>
                    )}
                    {maintenanceStatusFilter !== 'ALL' && (
                      <span className="px-2 py-1 bg-emerald-200 text-emerald-800 text-xs rounded-full">
                        Status: {maintenanceStatusFilter}
                      </span>
                    )}
                    {maintenanceDepartmentFilter !== 'ALL' && (
                      <span className="px-2 py-1 bg-amber-200 text-amber-800 text-xs rounded-full">
                        Dept: {maintenanceDepartmentFilter}
                      </span>
                    )}
                    {(maintenanceDateFrom || maintenanceDateTo) && (
                      <span className="px-2 py-1 bg-purple-200 text-purple-800 text-xs rounded-full">
                        {maintenanceDateFrom ? format(parseISO(maintenanceDateFrom), 'dd MMM') : 'Start'} - {maintenanceDateTo ? format(parseISO(maintenanceDateTo), 'dd MMM') : 'End'}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Maintenance Records</h3>
                  <p className="text-xs text-slate-500 mt-1">{selectedVehicle && vehicles.find(v => v.id === selectedVehicle)?.assetName || 'No vehicle selected'}</p>
                </div>
                <div className="flex gap-2 flex-wrap justify-end">
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
                    onClick={generateMaintenancePDF}
                    variant="secondary"
                    icon={<FileText className="w-4 h-4" />}
                    style={{ backgroundColor: '#1f2937', color: '#ffffff', borderColor: '#1f2937' }}
                  >
                    Export PDF
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

                  let matchesDateRange = true;
                  if (maintenanceDateFrom || maintenanceDateTo) {
                    const mainDate = parseISO(m.maintenanceDate);
                    if (maintenanceDateFrom && isBefore(mainDate, startOfDay(parseISO(maintenanceDateFrom)))) {
                      matchesDateRange = false;
                    }
                    if (maintenanceDateTo && isAfter(mainDate, endOfDay(parseISO(maintenanceDateTo)))) {
                      matchesDateRange = false;
                    }
                  }

                  return matchesSearch && matchesVehicle && matchesStatus && matchesDepartment && matchesDateRange;
                });

                return filteredMaintenances.length === 0 ? (
                  <div className="text-center py-12">
                    <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-2" />
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
                            <div className="flex justify-end gap-1.5">
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
              <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/30 border border-slate-200 rounded-lg p-4 mb-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {/* Search */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">SEARCH</label>
                    <input
                      type="text"
                      placeholder="Search part name or supplier..."
                      value={sparePartsSearch}
                      onChange={(e) => setSparePartsSearch(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>

                  {/* Clear */}
                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setSparePartsSearch('');
                      }}
                      className="w-full px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all font-medium"
                    >
                      Clear Search
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Spare Parts & Purchases</h3>
                  <p className="text-xs text-slate-500 mt-1">{selectedVehicle && vehicles.find(v => v.id === selectedVehicle)?.assetName || 'No vehicle selected'}</p>
                </div>
                <div className="flex gap-2">
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
                    <Package className="w-12 h-12 text-slate-300 mx-auto mb-2" />
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
                            <div className="flex justify-end gap-1.5">
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
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900">Financial Summary</h3>
                <p className="text-sm text-slate-500 mt-1">Complete maintenance and lifecycle cost analysis for {selectedVehicle && vehicles.find(v => v.id === selectedVehicle)?.assetName}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Total Maintenance Cost', value: formatCurrency(vehicleSummary.totalMaintenanceCost), icon: DollarSign, color: 'bg-blue-100 text-blue-600' },
                  { label: 'Service Count', value: vehicleSummary.numberOfServices, icon: Wrench, color: 'bg-emerald-100 text-emerald-600' },
                  { label: 'Last Service', value: vehicleSummary.lastServiceDate ? format(new Date(vehicleSummary.lastServiceDate), 'MMM d, yyyy') : 'N/A', icon: Calendar, color: 'bg-amber-100 text-amber-600' },
                  { label: 'Avg Cost/Service', value: formatCurrency(vehicleSummary.averageCostPerService), icon: DollarSign, color: 'bg-purple-100 text-purple-600' },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium">{label}</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-4">Additional Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: 'Highest Repair Cost', value: formatCurrency(vehicleSummary.highestSingleRepairCost) },
                  { label: 'Total Lifecycle Cost', value: formatCurrency(vehicleSummary.totalLifecycleCost) },
                  { label: 'Days Since Service', value: `${vehicleSummary.daysSinceLastService} days` },
                  { label: 'Spare Parts Cost', value: formatCurrency(vehicleSummary.totalSparePartsCost) },
                  { label: 'Next Service Due', value: vehicleSummary.nextServiceDue ? format(new Date(vehicleSummary.nextServiceDue), 'MMM d, yyyy') : 'N/A' },
                  { label: 'Total w/ Spare Parts', value: formatCurrency(vehicleSummary.totalLifecycleCostWithSpares) },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
                    <p className="text-xs text-slate-600 font-medium mb-2 uppercase tracking-wider">{label}</p>
                    <p className="text-2xl font-bold text-slate-900">{value}</p>
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

