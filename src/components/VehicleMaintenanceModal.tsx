'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, Wrench } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
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
}

interface VehicleMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  vehicles: VehicleAsset[];
  editingMaintenance?: MaintenanceRecord | null;
}

export default function VehicleMaintenanceModal({
  isOpen,
  onClose,
  onSave,
  vehicles,
  editingMaintenance,
}: VehicleMaintenanceModalProps) {
  const [formData, setFormData] = useState({
    assetId: '',
    maintenanceDate: new Date().toISOString().split('T')[0],
    description: '',
    cost: '',
    performedBy: '',
    nextDueDate: '',
    status: 'SCHEDULED' as 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const { success, error: errorToast } = useToast();

  useEffect(() => {
    if (editingMaintenance) {
      setFormData({
        assetId: editingMaintenance.assetId,
        maintenanceDate: editingMaintenance.maintenanceDate.split('T')[0],
        description: editingMaintenance.description,
        cost: editingMaintenance.cost?.toString() || '',
        performedBy: editingMaintenance.performedBy || '',
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
      newErrors.maintenanceDate = 'Maintenance date is required';
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
        maintenanceDate: formData.maintenanceDate,
        description: formData.description,
        cost: formData.cost ? parseFloat(formData.cost) : null,
        performedBy: formData.performedBy || null,
        nextDueDate: formData.nextDueDate || null,
        status: formData.status,
      });
      success(
        editingMaintenance
          ? 'Vehicle maintenance updated successfully'
          : 'Vehicle maintenance created successfully'
      );
      onClose();
    } catch (err: any) {
      errorToast(
        err?.message ||
        (editingMaintenance
          ? 'Failed to update vehicle maintenance'
          : 'Failed to create vehicle maintenance')
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field when user starts typing
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
      <div className="modal w-full max-w-2xl mx-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
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
              className="text-white/60 hover:text-white text-2xl font-light"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Vehicle Selection */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Vehicle *
              </label>
              <select
                value={formData.assetId}
                onChange={(e) => handleInputChange('assetId', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                  errors.assetId ? 'border-red-500 bg-red-50' : 'border-slate-300'
                }`}
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

            {/* Maintenance Date */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Maintenance Date *
              </label>
              <input
                type="date"
                value={formData.maintenanceDate}
                onChange={(e) => handleInputChange('maintenanceDate', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                  errors.maintenanceDate ? 'border-red-500 bg-red-50' : 'border-slate-300'
                }`}
              />
              {errors.maintenanceDate && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.maintenanceDate}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the maintenance work done..."
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none ${
                  errors.description ? 'border-red-500 bg-red-50' : 'border-slate-300'
                }`}
              />
              {errors.description && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.description}
                </p>
              )}
            </div>

            {/* Cost */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Cost (PKR)
              </label>
              <input
                type="number"
                value={formData.cost}
                onChange={(e) => handleInputChange('cost', e.target.value)}
                placeholder="0"
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {/* Performed By */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Performed By
              </label>
              <input
                type="text"
                value={formData.performedBy}
                onChange={(e) => handleInputChange('performedBy', e.target.value)}
                placeholder="Technician name or service center"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="SCHEDULED">Scheduled</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {/* Next Due Date */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Next Due Date
              </label>
              <input
                type="date"
                value={formData.nextDueDate}
                onChange={(e) => handleInputChange('nextDueDate', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 btn btn-primary"
              >
                {submitting ? 'Saving...' : editingMaintenance ? 'Update Record' : 'Add Record'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
