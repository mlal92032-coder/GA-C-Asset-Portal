'use client';

import { useState, useEffect } from 'react';
import { X, Package, DollarSign, Calendar, MapPin, User, Image as ImageIcon, Paperclip, AlertCircle, CheckCircle, Armchair, Ruler, Wrench, Loader2 } from 'lucide-react';
import ImageUpload from './ImageUpload';
import { useFocusTrap } from '@/hooks/useFocusTrap';

interface ModernFurnitureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (furnitureData: any) => Promise<void>;
  editingAsset?: any;
  saving: boolean;
  companies: any[];
  manufacturers: any[];
  locations: any[];
  users: any[];
}

export default function ModernFurnitureModal({
  isOpen,
  onClose,
  onSave,
  editingAsset,
  saving,
  companies,
  manufacturers,
  locations,
  users,
}: ModernFurnitureModalProps) {
  const [formData, setFormData] = useState({
    assetName: '',
    assetTag: '',
    furnitureType: '',
    material: '',
    dimensions: '',
    purchaseDate: '',
    purchasePrice: '',
    companyId: '',
    manufacturerId: '',
    locationId: '',
    assignedUserId: '',
    condition: 'GOOD',
    status: 'IN_STORE',
    remarks: '',
    usefulLifeYears: '10',
    salvageValue: '',
    imageUrl: '',
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const modalRef = useFocusTrap({ isOpen, onClose });

  useEffect(() => {
    if (editingAsset) {
      setFormData({
        assetName: editingAsset.assetName || '',
        assetTag: editingAsset.assetTag || '',
        furnitureType: editingAsset.furnitureType || '',
        material: editingAsset.material || '',
        dimensions: editingAsset.dimensions || '',
        purchaseDate: editingAsset.purchaseDate?.split('T')[0] || '',
        purchasePrice: editingAsset.purchasePrice?.toString() || '',
        companyId: editingAsset.companyId || '',
        manufacturerId: editingAsset.manufacturerId || '',
        locationId: editingAsset.locationId || '',
        assignedUserId: editingAsset.assignedUserId || '',
        condition: editingAsset.condition || 'GOOD',
        status: editingAsset.status || 'IN_STORE',
        remarks: editingAsset.remarks || '',
        usefulLifeYears: editingAsset.usefulLifeYears?.toString() || '10',
        salvageValue: editingAsset.salvageValue?.toString() || '',
        imageUrl: editingAsset.imageUrl || '',
      });
      if (editingAsset.imageUrl) {
        setImagePreview(editingAsset.imageUrl);
      }
    } else {
      resetForm();
    }
  }, [editingAsset, isOpen]);

  const resetForm = () => {
    setFormData({
      assetName: '',
      assetTag: '',
      furnitureType: '',
      material: '',
      dimensions: '',
      purchaseDate: '',
      purchasePrice: '',
      companyId: '',
      manufacturerId: '',
      locationId: '',
      assignedUserId: '',
      condition: 'GOOD',
      status: 'IN_STORE',
      remarks: '',
      usefulLifeYears: '10',
      salvageValue: '',
      imageUrl: '',
    });
    setImagePreview(null);
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
    if (!formData.furnitureType.trim()) newErrors.furnitureType = 'Furniture type is required';
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
        aria-labelledby="furniture-modal-title"
      >
        <div className="sticky top-0 z-10 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Armchair className="w-5 h-5" />
              </div>
              <div>
                <h2 id="furniture-modal-title" className="text-xl font-bold">
                  {editingAsset ? 'Edit Furniture Asset' : 'Add New Furniture Asset'}
                </h2>
                <p className="text-sm text-purple-100 mt-0.5">
                  {editingAsset ? 'Update furniture asset information' : 'Create a new furniture asset record'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={saving}
              className="text-white/70 hover:text-white transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="space-y-4">
          {/* Asset Tag */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Asset Tag <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={formData.assetTag}
                onChange={(e) => handleChange('assetTag', e.target.value)}
                className={`pl-10 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm ${errors.assetTag ? 'error' : ''}`}
                placeholder="e.g., FUR-001"
                disabled={saving}
              />
            </div>
            {errors.assetTag && (
              <p className="form-error">
                <AlertCircle className="w-3 h-3" />
                {errors.assetTag}
              </p>
            )}
            <p className="text-xs text-slate-400 mt-1">Enter a unique identifier for this asset</p>
          </div>

          {/* Image Upload */}
          <div>
            <ImageUpload
              value={formData.imageUrl}
              onChange={(url) => handleChange('imageUrl', url || '')}
              label="Asset Image (Optional)"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Asset Name *</label>
              <input
                type="text"
                value={formData.assetName}
                onChange={(e) => handleChange('assetName', e.target.value)}
                className={`w-full ${errors.assetName ? 'error' : ''}`}
                placeholder="e.g., Executive Office Desk"
                disabled={saving}
              />
              {errors.assetName && (
                <p className="form-error">
                  <AlertCircle className="w-3 h-3" />
                  {errors.assetName}
                </p>
              )}
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Furniture Type *</label>
              <select
                value={formData.furnitureType}
                onChange={(e) => handleChange('furnitureType', e.target.value)}
                className={`w-full ${errors.furnitureType ? 'error' : ''}`}
                disabled={saving}
              >
                <option value="">Select type</option>
                <option value="Desk">Desk</option>
                <option value="Chair">Chair</option>
                <option value="Table">Table</option>
                <option value="Cabinet">Cabinet</option>
                <option value="Shelf">Shelf</option>
                <option value="Sofa">Sofa</option>
                <option value="Other">Other</option>
              </select>
              {errors.furnitureType && (
                <p className="form-error">
                  <AlertCircle className="w-3 h-3" />
                  {errors.furnitureType}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Material</label>
              <input
                type="text"
                value={formData.material}
                onChange={(e) => handleChange('material', e.target.value)}
                className="w-full"
                placeholder="e.g., Wood, Metal, Plastic"
                disabled={saving}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dimensions</label>
              <input
                type="text"
                value={formData.dimensions}
                onChange={(e) => handleChange('dimensions', e.target.value)}
                className="w-full"
                placeholder="e.g., 120cm x 60cm x 75cm"
                disabled={saving}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date *</label>
              <input
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => handleChange('purchaseDate', e.target.value)}
                className={`w-full ${errors.purchaseDate ? 'error' : ''}`}
                disabled={saving}
              />
              {errors.purchaseDate && (
                <p className="form-error">
                  <AlertCircle className="w-3 h-3" />
                  {errors.purchaseDate}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Price (PKR) *</label>
              <input
                type="number"
                value={formData.purchasePrice}
                onChange={(e) => handleChange('purchasePrice', e.target.value)}
                className={`w-full ${errors.purchasePrice ? 'error' : ''}`}
                placeholder="0.00"
                disabled={saving}
              />
              {errors.purchasePrice && (
                <p className="form-error">
                  <AlertCircle className="w-3 h-3" />
                  {errors.purchasePrice}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
              <select
                value={formData.manufacturerId}
                onChange={(e) => handleChange('manufacturerId', e.target.value)}
                disabled={saving}
                className="w-full"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Office *</label>
              <select
                value={formData.companyId}
                onChange={(e) => handleChange('companyId', e.target.value)}
                className={`w-full ${errors.companyId ? 'error' : ''}`}
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
              <select
                value={formData.locationId}
                onChange={(e) => handleChange('locationId', e.target.value)}
                className={`w-full ${errors.locationId ? 'error' : ''}`}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
              <select
                value={formData.assignedUserId}
                onChange={(e) => handleChange('assignedUserId', e.target.value)}
                disabled={saving}
                className="w-full"
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
              <select
                value={formData.condition}
                onChange={(e) => handleChange('condition', e.target.value)}
                disabled={saving}
                className="w-full"
              >
                <option value="GOOD">Good</option>
                <option value="REPAIR">Needs Repair</option>
                <option value="DAMAGED">Damaged</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                disabled={saving}
                className="w-full"
              >
                <option value="IN_STORE">In Store</option>
                <option value="IN_USE">In Use</option>
                <option value="DISPOSED">Disposed</option>
              </select>
            </div>
          </div>

          {/* Depreciation Fields */}
          <div className="pt-4 mt-4 border-t border-slate-200">
            <h3 className="form-section-heading text-sm font-semibold text-slate-700">
              <DollarSign className="w-4 h-4 text-purple-600" />
              Depreciation Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Useful Life (Years)</label>
                <input
                  type="number"
                  value={formData.usefulLifeYears}
                  onChange={(e) => handleChange('usefulLifeYears', e.target.value)}
                  placeholder="10"
                  disabled={saving}
                  className="text-sm w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Salvage Value (PKR)</label>
                <input
                  type="number"
                  value={formData.salvageValue}
                  onChange={(e) => handleChange('salvageValue', e.target.value)}
                  placeholder="0.00"
                  disabled={saving}
                  className="text-sm w-full"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
            <textarea
              value={formData.remarks}
              onChange={(e) => handleChange('remarks', e.target.value)}
              rows={3}
              placeholder="Additional notes or comments..."
              disabled={saving}
              className="w-full"
            />
          </div>
          </div>
          </div>

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
                className="btn btn-primary"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {editingAsset ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    {editingAsset ? 'Update Furniture' : 'Create Furniture'}
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
