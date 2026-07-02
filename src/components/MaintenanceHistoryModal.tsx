'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, Wrench } from 'lucide-react';
import type { VehicleAsset } from '@/types';

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

interface MaintenanceHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  vehicles: VehicleAsset[];
  editingMaintenance?: MaintenanceRecord | null;
}

const workTypes = [
  'Oil Change',
  'Repair',
  'Service',
  'Inspection',
  'Tire Change',
  'Battery',
  'Brake Service',
  'Engine Service',
  'General Maintenance',
  'Other',
];

const paymentMethods = ['Cash', 'Bank Transfer', 'Card'];

export default function MaintenanceHistoryModal({
  isOpen,
  onClose,
  onSave,
  vehicles,
  editingMaintenance,
}: MaintenanceHistoryModalProps) {
  const [formData, setFormData] = useState({
    assetId: '',
    maintenanceDate: new Date().toISOString().split('T')[0],
    description: '',
    cost: '',
    performedBy: '',
    vendorName: '',
    odometerReading: '',
    workType: '',
    paymentMethod: '',
    remarks: '',
    nextDueDate: '',
    status: 'SCHEDULED' as 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingMaintenance) {
      setFormData({
        assetId: editingMaintenance.assetId,
        maintenanceDate: editingMaintenance.maintenanceDate.split('T')[0],
        description: editingMaintenance.description,
        cost: editingMaintenance.cost?.toString() || '',
        performedBy: editingMaintenance.performedBy || '',
        vendorName: editingMaintenance.vendorName || '',
        odometerReading: editingMaintenance.odometerReading?.toString() || '',
        workType: editingMaintenance.workType || '',
        paymentMethod: editingMaintenance.paymentMethod || '',
        remarks: editingMaintenance.remarks || '',
        nextDueDate: editingMaintenance.nextDueDate?.split('T')[0] || '',
        status: editingMaintenance.status,
      });
    } else {
      setFormData({
        assetId: '',
        maintenanceDate: new Date().toISOString().split('T')[0],
        description: '',
        cost: '',
        performedBy: '',
        vendorName: '',
        odometerReading: '',
        workType: '',
        paymentMethod: '',
        remarks: '',
        nextDueDate: '',
        status: 'SCHEDULED',
      });
    }
    setErrors({});
  }, [editingMaintenance, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.assetId.trim()) {
      newErrors.assetId = 'Vehicle is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.maintenanceDate) {
      newErrors.maintenanceDate = 'Service date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      await onSave({
        assetId: formData.assetId,
        assetType: 'VEHICLE',
        maintenanceDate: formData.maintenanceDate,
        description: formData.description,
        cost: formData.cost ? parseFloat(formData.cost) : null,
        performedBy: formData.performedBy || null,
        vendorName: formData.vendorName || null,
        odometerReading: formData.odometerReading ? parseInt(formData.odometerReading) : null,
        workType: formData.workType || null,
        paymentMethod: formData.paymentMethod || null,
        remarks: formData.remarks || null,
        nextDueDate: formData.nextDueDate || null,
        status: formData.status,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal w-full max-w-2xl mx-auto max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {editingMaintenance ? 'Edit Maintenance Record' : 'Add Maintenance Record'}
                </h2>
                <p className="text-sm text-blue-100 mt-0.5">
                  {editingMaintenance ? 'Update maintenance details' : 'Record vehicle maintenance activity'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={submitting}
              className="text-white/70 hover:text-white transition-colors p-1"
            >
              <Wrench className="w-5 h-5 hidden" />
              <span className="text-2xl font-light">×</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="modal-body space-y-5 overflow-y-auto">
            {/* Vehicle Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-3">
                  Vehicle <span className="text-red-600">*</span>
                </label>
                <select
                  value={formData.assetId}
                  onChange={(e) => handleInputChange('assetId', e.target.value)}
                  className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium transition-all ${
                    errors.assetId ? 'border-red-500 bg-red-50' : 'border-slate-300 hover:border-slate-400'
                  }`}
                  autoComplete="off"
                >
                  <option value="">Select a vehicle</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.assetName} ({vehicle.brand} {vehicle.model})
                    </option>
                  ))}
                </select>
                {errors.assetId && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.assetId}
                  </p>
                )}
              </div>

              {/* Service Date */}
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-3">
                  Service Date <span className="text-red-600">*</span>
                </label>
                <input
                  type="date"
                  value={formData.maintenanceDate}
                  onChange={(e) => handleInputChange('maintenanceDate', e.target.value)}
                  className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium transition-all ${
                    errors.maintenanceDate ? 'border-red-500 bg-red-50' : 'border-slate-300 hover:border-slate-400'
                  }`}
                  autoComplete="off"
                />
                {errors.maintenanceDate && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.maintenanceDate}
                  </p>
                )}
              </div>
            </div>

            {/* Type of Work & Odometer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-3">
                  Type of Work
                </label>
                <select
                  value={formData.workType}
                  onChange={(e) => handleInputChange('workType', e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-slate-300 hover:border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium transition-all"
                  autoComplete="off"
                >
                  <option value="">Select work type</option>
                  {workTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-3">
                  Odometer Reading (km)
                </label>
                <input
                  type="number"
                  value={formData.odometerReading}
                  onChange={(e) => handleInputChange('odometerReading', e.target.value)}
                  placeholder="0"
                  min="0"
                  className="w-full px-4 py-2.5 border-2 border-slate-300 hover:border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium transition-all"
                  autoComplete="off"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-3">
                Description of Work Done <span className="text-red-600">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the maintenance work done..."
                rows={3}
                className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium resize-none transition-all ${
                  errors.description ? 'border-red-500 bg-red-50' : 'border-slate-300 hover:border-slate-400'
                }`}
                autoComplete="off"
              />
              {errors.description && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.description}
                </p>
              )}
            </div>

            {/* Vendor & Cost */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-3">
                  Vendor/Workshop Name
                </label>
                <input
                  type="text"
                  value={formData.vendorName}
                  onChange={(e) => handleInputChange('vendorName', e.target.value)}
                  placeholder="e.g., Ahmed Auto Service"
                  className="w-full px-4 py-2.5 border-2 border-slate-300 hover:border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium transition-all"
                  autoComplete="off"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-3">
                  Cost of Service (PKR)
                </label>
                <input
                  type="number"
                  value={formData.cost}
                  onChange={(e) => handleInputChange('cost', e.target.value)}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2.5 border-2 border-slate-300 hover:border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium transition-all"
                  autoComplete="off"
                />
              </div>
            </div>

            {/* Payment Method & Performed By */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-3">
                  Payment Method
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-slate-300 hover:border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium transition-all"
                  autoComplete="off"
                >
                  <option value="">Select payment method</option>
                  {paymentMethods.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-3">
                  Performed By
                </label>
                <input
                  type="text"
                  value={formData.performedBy}
                  onChange={(e) => handleInputChange('performedBy', e.target.value)}
                  placeholder="Technician name"
                  className="w-full px-4 py-2.5 border-2 border-slate-300 hover:border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium transition-all"
                  autoComplete="off"
                />
              </div>
            </div>

            {/* Remarks */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-3">
                Remarks
              </label>
              <textarea
                value={formData.remarks}
                onChange={(e) => handleInputChange('remarks', e.target.value)}
                placeholder="Any additional notes..."
                rows={2}
                className="w-full px-4 py-2.5 border-2 border-slate-300 hover:border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium resize-none transition-all"
                autoComplete="off"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-3">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-slate-300 hover:border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium transition-all"
                autoComplete="off"
              >
                <option value="SCHEDULED">Scheduled</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {/* Next Due Date */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-3">
                Next Due Date
              </label>
              <input
                type="date"
                value={formData.nextDueDate}
                onChange={(e) => handleInputChange('nextDueDate', e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-slate-300 hover:border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium transition-all"
                autoComplete="off"
              />
            </div>

          </div>

          {/* Footer */}
          <div className="modal-footer">
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : editingMaintenance ? (
                  'Update Record'
                ) : (
                  'Add Record'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
