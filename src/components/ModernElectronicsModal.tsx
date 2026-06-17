'use client';

import { useState, useEffect } from 'react';
import { X, Monitor, DollarSign, Calendar, MapPin, User, AlertCircle, CheckCircle, Cpu, Wrench } from 'lucide-react';
import ImageUpload from './ImageUpload';
import { useFocusTrap } from '@/hooks/useFocusTrap';

interface ModernElectronicsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (electronicsData: any) => Promise<void>;
  editingAsset?: any;
  saving: boolean;
  companies: any[];
  manufacturers: any[];
  locations: any[];
  users: any[];
}

export default function ModernElectronicsModal({
  isOpen,
  onClose,
  onSave,
  editingAsset,
  saving,
  companies,
  manufacturers,
  locations,
  users,
}: ModernElectronicsModalProps) {
  const [formData, setFormData] = useState({
    assetName: '',
    assetTag: '',
    deviceType: '',
    brand: '',
    model: '',
    serialNumber: '',
    purchaseDate: '',
    purchasePrice: '',
    warrantyEndDate: '',
    companyId: '',
    manufacturerId: '',
    locationId: '',
    assignedUserId: '',
    condition: 'GOOD',
    status: 'IN_STORE',
    lastMaintenanceDate: '',
    remarks: '',
    usefulLifeYears: '5',
    salvageValue: '',
    imageUrl: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const modalRef = useFocusTrap({ isOpen, onClose });

  useEffect(() => {
    if (editingAsset) {
      setFormData({
        assetName: editingAsset.assetName || '',
        assetTag: editingAsset.assetTag || '',
        deviceType: editingAsset.deviceType || '',
        brand: editingAsset.brand || '',
        model: editingAsset.model || '',
        serialNumber: editingAsset.serialNumber || '',
        purchaseDate: editingAsset.purchaseDate?.split('T')[0] || '',
        purchasePrice: editingAsset.purchasePrice?.toString() || '',
        warrantyEndDate: editingAsset.warrantyEndDate?.split('T')[0] || '',
        companyId: editingAsset.companyId || '',
        manufacturerId: editingAsset.manufacturerId || '',
        locationId: editingAsset.locationId || '',
        assignedUserId: editingAsset.assignedUserId || '',
        condition: editingAsset.condition || 'GOOD',
        status: editingAsset.status || 'IN_STORE',
        lastMaintenanceDate: editingAsset.lastMaintenanceDate?.split('T')[0] || '',
        remarks: editingAsset.remarks || '',
        usefulLifeYears: editingAsset.usefulLifeYears?.toString() || '5',
        salvageValue: editingAsset.salvageValue?.toString() || '',
        imageUrl: editingAsset.imageUrl || '',
      });
    } else {
      resetForm();
    }
  }, [editingAsset, isOpen]);

  const resetForm = () => {
    setFormData({
      assetName: '',
      assetTag: '',
      deviceType: '',
      brand: '',
      model: '',
      serialNumber: '',
      purchaseDate: '',
      purchasePrice: '',
      warrantyEndDate: '',
      companyId: '',
      manufacturerId: '',
      locationId: '',
      assignedUserId: '',
      condition: 'GOOD',
      status: 'IN_STORE',
      lastMaintenanceDate: '',
      remarks: '',
      usefulLifeYears: '5',
      salvageValue: '',
      imageUrl: '',
    });
    setErrors({});
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.assetName.trim()) newErrors.assetName = 'Asset name is required';
    if (!formData.assetTag.trim()) newErrors.assetTag = 'Asset tag is required';
    if (!formData.deviceType.trim()) newErrors.deviceType = 'Device type is required';
    if (!formData.purchaseDate) newErrors.purchaseDate = 'Purchase date is required';
    if (!formData.purchasePrice) newErrors.purchasePrice = 'Purchase price is required';
    if (!formData.companyId) newErrors.companyId = 'Office is required';
    if (!formData.locationId) newErrors.locationId = 'Location is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        ref={modalRef}
        className="modal w-full max-w-2xl mx-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="electronics-modal-title"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Monitor className="w-5 h-5" />
              </div>
              <div>
                <h2 id="electronics-modal-title" className="text-xl font-bold">
                  {editingAsset ? 'Edit Electronics Asset' : 'Add New Electronics Asset'}
                </h2>
                <p className="text-sm text-blue-100 mt-0.5">
                  {editingAsset ? 'Update electronics asset information' : 'Create a new electronics asset record'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={saving}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 max-h-[70vh] overflow-y-auto">
          {/* Asset Details Section */}
          <div className="mb-6">
            <h3 className="form-section-heading text-lg font-semibold text-slate-700">
              <Monitor className="w-5 h-5 text-blue-600" />
              Asset Details
            </h3>

            {/* Image Upload */}
            <div className="mb-4">
              <ImageUpload
                value={formData.imageUrl}
                onChange={(url) => handleChange('imageUrl', url || '')}
                label="Asset Image"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label required">Asset Name</label>
                <div className="relative">
                  <Monitor className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={formData.assetName}
                    onChange={(e) => handleChange('assetName', e.target.value)}
                    className={`pl-10 ${errors.assetName ? 'error' : ''}`}
                    placeholder="e.g., Dell Laptop"
                    disabled={saving}
                  />
                </div>
                {errors.assetName && (
                  <p className="form-error">
                    <AlertCircle className="w-3 h-3" />
                    {errors.assetName}
                  </p>
                )}
              </div>

              <div>
                <label className="form-label required">Asset Tag</label>
                <div className="relative">
                  <Cpu className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={formData.assetTag}
                    onChange={(e) => handleChange('assetTag', e.target.value)}
                    className={`pl-10 ${errors.assetTag ? 'error' : ''}`}
                    placeholder="e.g., ELC-001"
                    disabled={saving}
                  />
                </div>
                {errors.assetTag && (
                  <p className="form-error">
                    <AlertCircle className="w-3 h-3" />
                    {errors.assetTag}
                  </p>
                )}
              </div>

              <div>
                <label className="form-label required">Device Type</label>
                <select
                  value={formData.deviceType}
                  onChange={(e) => handleChange('deviceType', e.target.value)}
                  className={errors.deviceType ? 'error' : ''}
                  disabled={saving}
                >
                  <option value="">Select type</option>
                  <option value="Laptop">Laptop</option>
                  <option value="Desktop">Desktop</option>
                  <option value="Monitor">Monitor</option>
                  <option value="Printer">Printer</option>
                  <option value="Scanner">Scanner</option>
                  <option value="Projector">Projector</option>
                  <option value="Other">Other</option>
                </select>
                {errors.deviceType && (
                  <p className="form-error">
                    <AlertCircle className="w-3 h-3" />
                    {errors.deviceType}
                  </p>
                )}
              </div>

              <div>
                <label className="form-label">Brand</label>
                <div className="relative">
                  <Wrench className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => handleChange('brand', e.target.value)}
                    className="pl-10"
                    placeholder="e.g., Dell, HP, Lenovo"
                    disabled={saving}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Model</label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => handleChange('model', e.target.value)}
                  placeholder="e.g., Latitude 5520"
                  disabled={saving}
                />
              </div>

              <div>
                <label className="form-label">Serial Number</label>
                <input
                  type="text"
                  value={formData.serialNumber}
                  onChange={(e) => handleChange('serialNumber', e.target.value)}
                  placeholder="e.g., SN123456789"
                  disabled={saving}
                />
              </div>
            </div>
          </div>

          {/* Purchase Information Section */}
          <div className="mb-6">
            <h3 className="form-section-heading text-lg font-semibold text-slate-700">
              <DollarSign className="w-5 h-5 text-blue-600" />
              Purchase Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="form-label required">Purchase Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) => handleChange('purchaseDate', e.target.value)}
                    className={`pl-10 ${errors.purchaseDate ? 'error' : ''}`}
                    disabled={saving}
                  />
                </div>
                {errors.purchaseDate && (
                  <p className="form-error">
                    <AlertCircle className="w-3 h-3" />
                    {errors.purchaseDate}
                  </p>
                )}
              </div>

              <div>
                <label className="form-label required">Purchase Price (PKR)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    value={formData.purchasePrice}
                    onChange={(e) => handleChange('purchasePrice', e.target.value)}
                    className={`pl-10 ${errors.purchasePrice ? 'error' : ''}`}
                    placeholder="0.00"
                    disabled={saving}
                  />
                </div>
                {errors.purchasePrice && (
                  <p className="form-error">
                    <AlertCircle className="w-3 h-3" />
                    {errors.purchasePrice}
                  </p>
                )}
              </div>

              <div>
                <label className="form-label">Warranty End Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="date"
                    value={formData.warrantyEndDate}
                    onChange={(e) => handleChange('warrantyEndDate', e.target.value)}
                    className="pl-10"
                    disabled={saving}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Manufacturer</label>
                <select
                  value={formData.manufacturerId}
                  onChange={(e) => handleChange('manufacturerId', e.target.value)}
                  disabled={saving}
                >
                  <option value="">Select manufacturer</option>
                  {manufacturers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.manufacturerName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Useful Life (Years)</label>
                <input
                  type="number"
                  value={formData.usefulLifeYears}
                  onChange={(e) => handleChange('usefulLifeYears', e.target.value)}
                  placeholder="5"
                  disabled={saving}
                />
              </div>

              <div>
                <label className="form-label">Salvage Value (PKR)</label>
                <input
                  type="number"
                  value={formData.salvageValue}
                  onChange={(e) => handleChange('salvageValue', e.target.value)}
                  placeholder="0.00"
                  disabled={saving}
                />
              </div>
            </div>
          </div>

          {/* Location & Assignment Section */}
          <div className="mb-6">
            <h3 className="form-section-heading text-lg font-semibold text-slate-700">
              <MapPin className="w-5 h-5 text-blue-600" />
              Location & Assignment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="form-label required">Office</label>
                <select
                  value={formData.companyId}
                  onChange={(e) => handleChange('companyId', e.target.value)}
                  className={errors.companyId ? 'error' : ''}
                  disabled={saving}
                >
                  <option value="">Select office</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.companyName}
                    </option>
                  ))}
                </select>
                {errors.companyId && (
                  <p className="form-error">
                    <AlertCircle className="w-3 h-3" />
                    {errors.companyId}
                  </p>
                )}
              </div>

              <div>
                <label className="form-label required">Location</label>
                <select
                  value={formData.locationId}
                  onChange={(e) => handleChange('locationId', e.target.value)}
                  className={errors.locationId ? 'error' : ''}
                  disabled={saving}
                >
                  <option value="">Select location</option>
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.locationName}
                    </option>
                  ))}
                </select>
                {errors.locationId && (
                  <p className="form-error">
                    <AlertCircle className="w-3 h-3" />
                    {errors.locationId}
                  </p>
                )}
              </div>

              <div>
                <label className="form-label">Assigned To</label>
                <select
                  value={formData.assignedUserId}
                  onChange={(e) => handleChange('assignedUserId', e.target.value)}
                  disabled={saving}
                >
                  <option value="">Not assigned</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Condition & Status Section */}
          <div className="mb-6">
            <h3 className="form-section-heading text-lg font-semibold text-slate-700">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              Condition & Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label required">Condition</label>
                <select
                  value={formData.condition}
                  onChange={(e) => handleChange('condition', e.target.value)}
                  disabled={saving}
                >
                  <option value="GOOD">Good</option>
                  <option value="REPAIR">Needs Repair</option>
                  <option value="DAMAGED">Damaged</option>
                </select>
              </div>

              <div>
                <label className="form-label required">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  disabled={saving}
                >
                  <option value="IN_STORE">In Store</option>
                  <option value="IN_USE">In Use</option>
                  <option value="DISPOSED">Disposed</option>
                </select>
              </div>

              <div>
                <label className="form-label">Last Maintenance Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="date"
                    value={formData.lastMaintenanceDate}
                    onChange={(e) => handleChange('lastMaintenanceDate', e.target.value)}
                    className="pl-10"
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="form-label">Remarks</label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => handleChange('remarks', e.target.value)}
                  rows={3}
                  placeholder="Additional notes or comments..."
                  disabled={saving}
                />
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="sticky bottom-0 z-10 bg-slate-50 px-6 py-4 border-t border-slate-200 rounded-b-lg flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="btn btn-primary"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                {editingAsset ? 'Update Asset' : 'Create Asset'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
