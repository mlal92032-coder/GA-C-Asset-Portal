'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, DollarSign, AlertCircle, Armchair, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import ImageUpload from './ImageUpload';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useToast } from '@/contexts/ToastContext';

const furnitureAssetSchema = z.object({
  assetName: z.string().min(2, 'Asset name must be at least 2 characters').max(255),
  assetTag: z.string().min(1, 'Asset tag is required').max(50),
  furnitureType: z.string().min(1, 'Furniture type is required'),
  material: z.string(),
  purchaseDate: z.string().min(1, 'Purchase date is required'),
  purchasePrice: z.string().refine(v => !isNaN(Number(v)) && Number(v) > 0, 'Purchase price must be a positive number'),
  companyId: z.string().min(1, 'Office is required'),
  manufacturerId: z.string(),
  locationId: z.string().min(1, 'Location is required'),
  assignedUserId: z.string(),
  condition: z.enum(['GOOD', 'REPAIR', 'DAMAGED']),
  status: z.enum(['IN_STORE', 'IN_USE', 'DISPOSED', 'AUCTION']),
  remarks: z.string(),
  usefulLifeYears: z.string(),
  salvageValue: z.string(),
  depreciationMethod: z.string(),
  imageUrl: z.string(),
});

type FurnitureFormData = z.infer<typeof furnitureAssetSchema>;

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
  const { success, error } = useToast();
  const modalRef = useFocusTrap({ isOpen, onClose });

  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
    reset,
    watch,
    setValue,
  } = useForm<FurnitureFormData>({
    resolver: zodResolver(furnitureAssetSchema),
    mode: 'onChange',
    defaultValues: {
      assetName: '',
      assetTag: '',
      furnitureType: '',
      material: '',
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
      depreciationMethod: '',
      imageUrl: '',
    },
  });

  const imageUrlValue = watch('imageUrl');

  useEffect(() => {
    if (editingAsset) {
      reset({
        assetName: editingAsset.assetName || '',
        assetTag: editingAsset.assetTag || '',
        furnitureType: editingAsset.furnitureType || '',
        material: editingAsset.material || '',
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
        depreciationMethod: editingAsset.depreciationMethod || '',
        imageUrl: editingAsset.imageUrl || '',
      });
    } else {
      reset();
    }
  }, [editingAsset, isOpen, reset]);

  const onSubmit = async (data: FurnitureFormData) => {
    try {
      await onSave(data);
      success(
        editingAsset
          ? 'Furniture asset updated successfully'
          : 'Furniture asset created successfully'
      );
      reset();
    } catch (err: any) {
      error(
        err?.message ||
        (editingAsset ? 'Failed to update furniture asset' : 'Failed to create furniture asset')
      );
    }
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

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
          <div className="modal-body space-y-5 overflow-y-auto">
            {/* Asset Tag */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Asset Tag <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('assetTag')}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm transition-all ${
                  formErrors.assetTag ? 'border-red-500 focus:ring-red-500/10' : 'border-slate-200'
                }`}
                placeholder="e.g., FUR-001"
                disabled={saving}
              />
              {formErrors.assetTag && (
                <motion.p
                  className="text-red-500 text-sm mt-1 flex items-center gap-1"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <AlertCircle className="w-3 h-3" />
                  {formErrors.assetTag.message}
                </motion.p>
              )}
              <p className="text-xs text-slate-400 mt-1">Enter a unique identifier for this asset</p>
            </div>

            {/* Image Upload */}
            <div>
              <ImageUpload
                value={imageUrlValue}
                onChange={(url) => setValue('imageUrl', url || '')}
                label="Asset Image (Optional)"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Asset Name *</label>
                <input
                  type="text"
                  {...register('assetName')}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                    formErrors.assetName ? 'border-red-500 focus:ring-red-500/10' : 'border-slate-200'
                  }`}
                  placeholder="e.g., Executive Office Desk"
                  disabled={saving}
                />
                {formErrors.assetName && (
                  <motion.p
                    className="text-red-500 text-sm mt-1 flex items-center gap-1"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <AlertCircle className="w-3 h-3" />
                    {formErrors.assetName.message}
                  </motion.p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Furniture Type *</label>
                <select
                  {...register('furnitureType')}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                    formErrors.furnitureType ? 'border-red-500 focus:ring-red-500/10' : 'border-slate-200'
                  }`}
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
                {formErrors.furnitureType && (
                  <motion.p
                    className="text-red-500 text-sm mt-1 flex items-center gap-1"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <AlertCircle className="w-3 h-3" />
                    {formErrors.furnitureType.message}
                  </motion.p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Material</label>
                <input
                  type="text"
                  {...register('material')}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="e.g., Wood, Metal, Plastic"
                  disabled={saving}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date *</label>
                <input
                  type="date"
                  {...register('purchaseDate')}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                    formErrors.purchaseDate ? 'border-red-500 focus:ring-red-500/10' : 'border-slate-200'
                  }`}
                  disabled={saving}
                />
                {formErrors.purchaseDate && (
                  <motion.p
                    className="text-red-500 text-sm mt-1 flex items-center gap-1"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <AlertCircle className="w-3 h-3" />
                    {formErrors.purchaseDate.message}
                  </motion.p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Price (PKR) *</label>
                <input
                  type="number"
                  step="0.01"
                  {...register('purchasePrice')}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                    formErrors.purchasePrice ? 'border-red-500 focus:ring-red-500/10' : 'border-slate-200'
                  }`}
                  placeholder="0.00"
                  disabled={saving}
                />
                {formErrors.purchasePrice && (
                  <motion.p
                    className="text-red-500 text-sm mt-1 flex items-center gap-1"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <AlertCircle className="w-3 h-3" />
                    {formErrors.purchasePrice.message}
                  </motion.p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
                <select
                  {...register('manufacturerId')}
                  disabled={saving}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
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
                  {...register('companyId')}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                    formErrors.companyId ? 'border-red-500 focus:ring-red-500/10' : 'border-slate-200'
                  }`}
                  disabled={saving}
                >
                  <option value="">Select office</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.companyName}
                    </option>
                  ))}
                </select>
                {formErrors.companyId && (
                  <motion.p
                    className="text-red-500 text-sm mt-1 flex items-center gap-1"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <AlertCircle className="w-3 h-3" />
                    {formErrors.companyId.message}
                  </motion.p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                <select
                  {...register('locationId')}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                    formErrors.locationId ? 'border-red-500 focus:ring-red-500/10' : 'border-slate-200'
                  }`}
                  disabled={saving}
                >
                  <option value="">Select location</option>
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.locationName}
                    </option>
                  ))}
                </select>
                {formErrors.locationId && (
                  <motion.p
                    className="text-red-500 text-sm mt-1 flex items-center gap-1"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <AlertCircle className="w-3 h-3" />
                    {formErrors.locationId.message}
                  </motion.p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                <select
                  {...register('assignedUserId')}
                  disabled={saving}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
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
                  {...register('condition')}
                  disabled={saving}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  <option value="GOOD">Good</option>
                  <option value="REPAIR">Needs Repair</option>
                  <option value="DAMAGED">Damaged</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  {...register('status')}
                  disabled={saving}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  <option value="IN_STORE">In Store</option>
                  <option value="IN_USE">In Use</option>
                  <option value="DISPOSED">Disposed</option>
                  <option value="AUCTION">Auction</option>
                </select>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-200">
              <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-purple-600" />
                Depreciation Settings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Useful Life (Years)</label>
                  <input
                    type="number"
                    {...register('usefulLifeYears')}
                    placeholder="10"
                    disabled={saving}
                    className={`text-sm w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                      formErrors.usefulLifeYears ? 'border-red-500 focus:ring-red-500/10' : 'border-slate-200'
                    }`}
                  />
                  {formErrors.usefulLifeYears && (
                    <motion.p
                      className="text-red-500 text-xs mt-1 flex items-center gap-1"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <AlertCircle className="w-2 h-2" />
                      {formErrors.usefulLifeYears.message}
                    </motion.p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Salvage Value (PKR)</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('salvageValue')}
                    placeholder="0.00"
                    disabled={saving}
                    className={`text-sm w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                      formErrors.salvageValue ? 'border-red-500 focus:ring-red-500/10' : 'border-slate-200'
                    }`}
                  />
                  {formErrors.salvageValue && (
                    <motion.p
                      className="text-red-500 text-xs mt-1 flex items-center gap-1"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <AlertCircle className="w-2 h-2" />
                      {formErrors.salvageValue.message}
                    </motion.p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Depreciation Method</label>
                  <select
                    {...register('depreciationMethod')}
                    disabled={saving}
                    className="text-sm w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select method</option>
                    <option value="STRAIGHT_LINE">Straight Line</option>
                    <option value="DECLINING_BALANCE">Declining Balance</option>
                    <option value="UNITS_OF_PRODUCTION">Units of Production</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
              <textarea
                {...register('remarks')}
                rows={3}
                placeholder="Additional notes or comments..."
                disabled={saving}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
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
