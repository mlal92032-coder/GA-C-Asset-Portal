'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, Package } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import type { VehicleAsset } from '@/types';

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

interface SparePartsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  vehicles: VehicleAsset[];
  editingSparePart?: SparePartRecord | null;
}

export default function SparePartsModal({
  isOpen,
  onClose,
  onSave,
  vehicles,
  editingSparePart,
}: SparePartsModalProps) {
  const [formData, setFormData] = useState({
    partDate: new Date().toISOString().split('T')[0],
    partName: '',
    quantity: '',
    unitPrice: '',
    supplierName: '',
    vehicleId: '',
    remarks: '',
  });

  const [calculatedTotal, setCalculatedTotal] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const { success, error: errorToast } = useToast();

  useEffect(() => {
    if (editingSparePart) {
      setFormData({
        partDate: editingSparePart.partDate.split('T')[0],
        partName: editingSparePart.partName,
        quantity: editingSparePart.quantity.toString(),
        unitPrice: editingSparePart.unitPrice.toString(),
        supplierName: editingSparePart.supplierName,
        vehicleId: editingSparePart.vehicleId || '',
        remarks: editingSparePart.remarks || '',
      });
      setCalculatedTotal(editingSparePart.totalCost);
    } else {
      setFormData({
        partDate: new Date().toISOString().split('T')[0],
        partName: '',
        quantity: '',
        unitPrice: '',
        supplierName: '',
        vehicleId: '',
        remarks: '',
      });
      setCalculatedTotal(0);
    }
    setErrors({});
  }, [editingSparePart, isOpen]);

  useEffect(() => {
    const quantity = parseFloat(formData.quantity) || 0;
    const unitPrice = parseFloat(formData.unitPrice) || 0;
    setCalculatedTotal(quantity * unitPrice);
  }, [formData.quantity, formData.unitPrice]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.partName.trim()) {
      newErrors.partName = 'Part name is required';
    }
    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }
    if (!formData.unitPrice || parseFloat(formData.unitPrice) < 0) {
      newErrors.unitPrice = 'Unit price must be valid';
    }
    if (!formData.supplierName.trim()) {
      newErrors.supplierName = 'Supplier name is required';
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
        partDate: formData.partDate,
        partName: formData.partName,
        quantity: parseFloat(formData.quantity),
        unitPrice: parseFloat(formData.unitPrice),
        supplierName: formData.supplierName,
        vehicleId: formData.vehicleId || null,
        remarks: formData.remarks || null,
      });
      success(
        editingSparePart
          ? 'Spare part record updated successfully'
          : 'Spare part record created successfully'
      );
      onClose();
    } catch (err: any) {
      errorToast(
        err?.message ||
        (editingSparePart
          ? 'Failed to update spare part record'
          : 'Failed to create spare part record')
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
        <div className="sticky top-0 z-10 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {editingSparePart ? 'Edit Spare Part' : 'Add Spare Part'}
                </h2>
                <p className="text-sm text-emerald-100 mt-0.5">
                  {editingSparePart ? 'Update spare part details' : 'Record spare parts purchase'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={submitting}
              className="text-white/70 hover:text-white transition-colors p-1"
            >
              <span className="text-2xl font-light">×</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="modal-body space-y-5 overflow-y-auto">
            {/* Date & Part Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-3">
                  Date <span className="text-red-600">*</span>
                </label>
                <input
                  type="date"
                  value={formData.partDate}
                  onChange={(e) => handleInputChange('partDate', e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-slate-300 hover:border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm font-medium transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-3">
                  Part Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.partName}
                  onChange={(e) => handleInputChange('partName', e.target.value)}
                  placeholder="e.g., Engine Oil, Brake Pads"
                  className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm font-medium transition-all ${
                    errors.partName ? 'border-red-500 bg-red-50' : 'border-slate-300 hover:border-slate-400'
                  }`}
                />
                {errors.partName && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.partName}
                  </p>
                )}
              </div>
            </div>

            {/* Quantity & Unit Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-3">
                  Quantity <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', e.target.value)}
                  placeholder="0"
                  min="1"
                  step="0.01"
                  className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm font-medium transition-all ${
                    errors.quantity ? 'border-red-500 bg-red-50' : 'border-slate-300 hover:border-slate-400'
                  }`}
                />
                {errors.quantity && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.quantity}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-3">
                  Unit Price (PKR) <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  value={formData.unitPrice}
                  onChange={(e) => handleInputChange('unitPrice', e.target.value)}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm font-medium transition-all ${
                    errors.unitPrice ? 'border-red-500 bg-red-50' : 'border-slate-300 hover:border-slate-400'
                  }`}
                />
                {errors.unitPrice && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.unitPrice}
                  </p>
                )}
              </div>
            </div>

            {/* Total Cost (Auto-calculated) */}
            <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-lg">
              <p className="text-sm font-semibold text-slate-600 mb-1">
                Total Cost (Auto-calculated)
              </p>
              <p className="text-3xl font-bold text-emerald-700">
                PKR {calculatedTotal.toLocaleString('en-PK', { maximumFractionDigits: 0 })}
              </p>
            </div>

            {/* Supplier Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-3">
                Supplier Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.supplierName}
                onChange={(e) => handleInputChange('supplierName', e.target.value)}
                placeholder="e.g., Castrol Pakistan, Auto Parts Store"
                className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm font-medium transition-all ${
                  errors.supplierName ? 'border-red-500 bg-red-50' : 'border-slate-300 hover:border-slate-400'
                }`}
              />
              {errors.supplierName && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.supplierName}
                </p>
              )}
            </div>

            {/* Vehicle Link */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-3">
                Vehicle Linked (Optional)
              </label>
              <select
                value={formData.vehicleId}
                onChange={(e) => handleInputChange('vehicleId', e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-slate-300 hover:border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm font-medium transition-all"
              >
                <option value="">N/A - Not linked to specific vehicle</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.assetName} ({vehicle.brand} {vehicle.model})
                  </option>
                ))}
              </select>
            </div>

            {/* Remarks */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-3">
                Remarks
              </label>
              <textarea
                value={formData.remarks}
                onChange={(e) => handleInputChange('remarks', e.target.value)}
                placeholder="e.g., Bulk purchase, OEM parts, warranty info..."
                rows={2}
                className="w-full px-4 py-2.5 border-2 border-slate-300 hover:border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm font-medium resize-none transition-all"
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
                ) : editingSparePart ? (
                  'Update Part'
                ) : (
                  'Add Part'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

