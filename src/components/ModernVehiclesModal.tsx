'use client';

import { useState, useEffect } from 'react';
import { X, Car, DollarSign, Calendar, MapPin, User, AlertCircle, CheckCircle, Wrench, FileText } from 'lucide-react';
import ImageUpload from './ImageUpload';
import { useFocusTrap } from '@/hooks/useFocusTrap';

interface ModernVehiclesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (vehicleData: any) => Promise<void>;
  editingAsset?: any;
  saving: boolean;
  companies: any[];
  manufacturers: any[];
  locations: any[];
  users: any[];
}

export default function ModernVehiclesModal({
  isOpen,
  onClose,
  onSave,
  editingAsset,
  saving,
  companies,
  manufacturers,
  locations,
  users,
}: ModernVehiclesModalProps) {
  const [formData, setFormData] = useState({
    assetName: '',
    assetTag: '',
    vehicleType: '',
    brand: '',
    model: '',
    registrationNumber: '',
    engineNumber: '',
    chassisNumber: '',
    fuelType: '',
    purchaseDate: '',
    purchasePrice: '',
    companyId: '',
    manufacturerId: '',
    locationId: '',
    assignedUserId: '',
    condition: 'GOOD',
    status: 'IN_STORE',
    lastServiceDate: '',
    insuranceExpiryDate: '',
    remarks: '',
    usefulLifeYears: '10',
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
        vehicleType: editingAsset.vehicleType || '',
        brand: editingAsset.brand || '',
        model: editingAsset.model || '',
        registrationNumber: editingAsset.registrationNumber || '',
        engineNumber: editingAsset.engineNumber || '',
        chassisNumber: editingAsset.chassisNumber || '',
        fuelType: editingAsset.fuelType || '',
        purchaseDate: editingAsset.purchaseDate?.split('T')[0] || '',
        purchasePrice: editingAsset.purchasePrice?.toString() || '',
        companyId: editingAsset.companyId || '',
        manufacturerId: editingAsset.manufacturerId || '',
        locationId: editingAsset.locationId || '',
        assignedUserId: editingAsset.assignedUserId || '',
        condition: editingAsset.condition || 'GOOD',
        status: editingAsset.status || 'IN_STORE',
        lastServiceDate: editingAsset.lastServiceDate?.split('T')[0] || '',
        insuranceExpiryDate: editingAsset.insuranceExpiryDate?.split('T')[0] || '',
        remarks: editingAsset.remarks || '',
        usefulLifeYears: editingAsset.usefulLifeYears?.toString() || '10',
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
      vehicleType: '',
      brand: '',
      model: '',
      registrationNumber: '',
      engineNumber: '',
      chassisNumber: '',
      fuelType: '',
      purchaseDate: '',
      purchasePrice: '',
      companyId: '',
      manufacturerId: '',
      locationId: '',
      assignedUserId: '',
      condition: 'GOOD',
      status: 'IN_STORE',
      lastServiceDate: '',
      insuranceExpiryDate: '',
      remarks: '',
      usefulLifeYears: '10',
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
    if (!formData.vehicleType.trim()) newErrors.vehicleType = 'Vehicle type is required';
    if (!formData.registrationNumber.trim()) newErrors.registrationNumber = 'Registration number is required';
    if (!formData.purchaseDate) newErrors.purchaseDate = 'Purchase date is required';
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
        className="modal w-full max-w-2xl mx-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="vehicles-modal-title"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <h2 id="vehicles-modal-title" className="text-xl font-bold">
                  {editingAsset ? 'Edit Vehicle Asset' : 'Add New Vehicle Asset'}
                </h2>
                <p className="text-sm text-emerald-100 mt-0.5">
                  {editingAsset ? 'Update vehicle asset information' : 'Create a new vehicle asset record'}
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
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="modal-body space-y-5 overflow-y-auto">
          {/* Asset Details Section */}
          <div className="mb-6">
            <h3 className="form-section-heading text-lg font-semibold text-slate-700">
              <Car className="w-5 h-5 text-emerald-600" />
              Vehicle Details
            </h3>

            {/* Image Upload */}
            <div className="mb-4">
              <ImageUpload
                value={formData.imageUrl}
                onChange={(url) => handleChange('imageUrl', url || '')}
                label="Vehicle Image"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label required">Asset Name</label>
                <div className="form-input-wrapper">
                  <Car className="form-input-icon w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={formData.assetName}
                    onChange={(e) => handleChange('assetName', e.target.value)}
                    className={`pl-10 ${errors.assetName ? 'error' : ''}`}
                    placeholder="e.g., Company Car"
                    disabled={saving}
                    autoComplete="off"
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
                <div className="form-input-wrapper">
                  <FileText className="form-input-icon w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={formData.assetTag}
                    onChange={(e) => handleChange('assetTag', e.target.value)}
                    className={`pl-10 ${errors.assetTag ? 'error' : ''}`}
                    placeholder="e.g., VEH-001"
                    disabled={saving}
                    autoComplete="off"
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
                <label className="form-label required">Vehicle Type</label>
                <select
                  value={formData.vehicleType}
                  onChange={(e) => handleChange('vehicleType', e.target.value)}
                  className={errors.vehicleType ? 'error' : ''}
                  disabled={saving}
                  autoComplete="off"
                >
                  <option value="">Select type</option>
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="Van">Van</option>
                  <option value="Truck">Truck</option>
                  <option value="Motorcycle">Motorcycle</option>
                  <option value="Other">Other</option>
                </select>
                {errors.vehicleType && (
                  <p className="form-error">
                    <AlertCircle className="w-3 h-3" />
                    {errors.vehicleType}
                  </p>
                )}
              </div>

              <div>
                <label className="form-label required">Registration Number</label>
                <div className="form-input-wrapper">
                  <FileText className="form-input-icon w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={formData.registrationNumber}
                    onChange={(e) => handleChange('registrationNumber', e.target.value)}
                    className={`pl-10 ${errors.registrationNumber ? 'error' : ''}`}
                    placeholder="e.g., ABC-1234"
                    disabled={saving}
                    autoComplete="off"
                  />
                </div>
                {errors.registrationNumber && (
                  <p className="form-error">
                    <AlertCircle className="w-3 h-3" />
                    {errors.registrationNumber}
                  </p>
                )}
              </div>

              <div>
                <label className="form-label">Brand</label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => handleChange('brand', e.target.value)}
                  placeholder="e.g., Toyota, Honda"
                  disabled={saving}
                  autoComplete="off"
                />
              </div>

              <div>
                <label className="form-label">Model</label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => handleChange('model', e.target.value)}
                  placeholder="e.g., Corolla, Civic"
                  disabled={saving}
                  autoComplete="off"
                />
              </div>

              <div>
                <label className="form-label">Engine Number</label>
                <input
                  type="text"
                  value={formData.engineNumber}
                  onChange={(e) => handleChange('engineNumber', e.target.value)}
                  placeholder="e.g., ENG123456"
                  disabled={saving}
                  autoComplete="off"
                />
              </div>

              <div>
                <label className="form-label">Chassis Number</label>
                <input
                  type="text"
                  value={formData.chassisNumber}
                  onChange={(e) => handleChange('chassisNumber', e.target.value)}
                  placeholder="e.g., CHAS123456"
                  disabled={saving}
                  autoComplete="off"
                />
              </div>

              <div>
                <label className="form-label">Fuel Type</label>
                <select
                  value={formData.fuelType}
                  onChange={(e) => handleChange('fuelType', e.target.value)}
                  disabled={saving}
                  autoComplete="off"
                >
                  <option value="">Select fuel type</option>
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Electric">Electric</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="CNG">CNG</option>
                </select>
              </div>
            </div>
          </div>

          {/* Purchase Information Section */}
          <div className="mb-6">
            <h3 className="form-section-heading text-lg font-semibold text-slate-700">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              Purchase Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="form-label required">Purchase Date</label>
                <div className="form-input-wrapper">
                  <Calendar className="form-input-icon w-4 h-4 text-slate-400" />
                  <input
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) => handleChange('purchaseDate', e.target.value)}
                    className={`pl-10 ${errors.purchaseDate ? 'error' : ''}`}
                    disabled={saving}
                    autoComplete="off"
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
                <label className="form-label">Purchase Price (PKR)</label>
                <div className="form-input-wrapper">
                  <DollarSign className="form-input-icon w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    value={formData.purchasePrice}
                    onChange={(e) => handleChange('purchasePrice', e.target.value)}
                    className="pl-10"
                    placeholder="0.00"
                    disabled={saving}
                    autoComplete="off"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Manufacturer</label>
                <select
                  value={formData.manufacturerId}
                  onChange={(e) => handleChange('manufacturerId', e.target.value)}
                  disabled={saving}
                  autoComplete="off"
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
                  placeholder="10"
                  disabled={saving}
                  autoComplete="off"
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
                  autoComplete="off"
                />
              </div>
            </div>
          </div>

          {/* Location & Assignment Section */}
          <div className="mb-6">
            <h3 className="form-section-heading text-lg font-semibold text-slate-700">
              <MapPin className="w-5 h-5 text-emerald-600" />
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
                  autoComplete="off"
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
                  autoComplete="off"
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
                  autoComplete="off"
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

          {/* Condition & Maintenance Section */}
          <div className="mb-6">
            <h3 className="form-section-heading text-lg font-semibold text-slate-700">
              <Wrench className="w-5 h-5 text-emerald-600" />
              Condition & Maintenance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label required">Condition</label>
                <select
                  value={formData.condition}
                  onChange={(e) => handleChange('condition', e.target.value)}
                  disabled={saving}
                  autoComplete="off"
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
                  autoComplete="off"
                >
                  <option value="IN_STORE">In Store</option>
                  <option value="IN_USE">In Use</option>
                  <option value="DISPOSED">Disposed</option>
                  <option value="AUCTION">Auction</option>
                </select>
              </div>

              <div>
                <label className="form-label">Last Service Date</label>
                <div className="form-input-wrapper">
                  <Calendar className="form-input-icon w-4 h-4 text-slate-400" />
                  <input
                    type="date"
                    value={formData.lastServiceDate}
                    onChange={(e) => handleChange('lastServiceDate', e.target.value)}
                    className="pl-10"
                    disabled={saving}
                    autoComplete="off"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Insurance Expiry Date</label>
                <div className="form-input-wrapper">
                  <Calendar className="form-input-icon w-4 h-4 text-slate-400" />
                  <input
                    type="date"
                    value={formData.insuranceExpiryDate}
                    onChange={(e) => handleChange('insuranceExpiryDate', e.target.value)}
                    className="pl-10"
                    disabled={saving}
                    autoComplete="off"
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
                  autoComplete="off"
                />
              </div>
            </div>
          </div>
          </div>

        {/* Footer */}
        <div className="modal-footer">
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary flex items-center justify-center gap-2"
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
        </form>
      </div>
    </div>
  );
}
