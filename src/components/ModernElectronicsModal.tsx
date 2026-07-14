'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Monitor, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import ImageUpload from './ImageUpload';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useToast } from '@/contexts/ToastContext';
import { electronicsAssetSchema } from '@/schemas/electronics';

// Form-specific schema that adapts modal data to API expectations
const electronicsFormSchema = z.object({
  assetName: z.string().min(2, 'Asset name must be at least 2 characters').max(255),
  assetTag: z.string().min(1, 'Asset tag is required').max(50),
  deviceType: z.string().min(1, 'Device type is required'),
  brand: z.string().default(''),
  model: z.string().default(''),
  serialNumber: z.string().default(''),
  purchaseDate: z.string().min(1, 'Purchase date is required'),
  purchasePrice: z.string().refine(v => !isNaN(Number(v)) && Number(v) > 0, 'Purchase price must be a positive number'),
  warrantyEndDate: z.string().default(''),
  companyId: z.string().min(1, 'Office is required'),
  manufacturerId: z.string().default(''),
  locationId: z.string().min(1, 'Location is required'),
  assignedUserId: z.string().default(''),
  condition: z.enum(['GOOD', 'REPAIR', 'DAMAGED']).default('GOOD'),
  status: z.enum(['IN_STORE', 'IN_USE', 'DISPOSED', 'AUCTION']).default('IN_STORE'),
  lastMaintenanceDate: z.string().default(''),
  remarks: z.string().default(''),
  usefulLifeYears: z.string().default('5'),
  salvageValue: z.string().default(''),
  imageUrl: z.string().default(''),
});

type ElectronicsFormData = z.infer<typeof electronicsFormSchema>;

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
  const { success, error } = useToast();
  const modalRef = useFocusTrap({ isOpen, onClose });

  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(electronicsFormSchema),
    mode: 'onChange',
    defaultValues: {
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
    },
  });

  const imageUrlValue = watch('imageUrl');

  useEffect(() => {
    if (editingAsset) {
      reset({
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
      reset();
    }
  }, [editingAsset, isOpen, reset]);

  const onSubmit = async (data: ElectronicsFormData) => {
    try {
      // Validate form data against schema before submission
      const validatedData = electronicsFormSchema.parse(data);
      await onSave(validatedData);
      success(
        editingAsset
          ? 'Electronics asset updated successfully'
          : 'Electronics asset created successfully'
      );
      reset();
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        // Show first validation error via toast
        const firstError = err.issues[0];
        error(`Validation error: ${firstError.message}`);
      } else {
        error(
          err?.message ||
          (editingAsset ? 'Failed to update electronics asset' : 'Failed to create electronics asset')
        );
      }
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
        aria-labelledby="electronics-modal-title"
      >
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
              className="text-white/70 hover:text-white transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
          <div className="modal-body space-y-5 overflow-y-auto">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <Monitor className="w-5 h-5 text-blue-600" />
                Asset Details
              </h3>

              <div className="mb-4">
                <ImageUpload
                  value={imageUrlValue || ''}
                  onChange={(url) => setValue('imageUrl', url || '')}
                  label="Asset Image"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Asset Name *</label>
                  <input
                    type="text"
                    {...register('assetName')}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      formErrors.assetName ? 'border-red-500 focus:ring-red-500/10' : 'border-slate-200'
                    }`}
                    placeholder="e.g., Dell Laptop"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Asset Tag *</label>
                  <input
                    type="text"
                    {...register('assetTag')}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm transition-all ${
                      formErrors.assetTag ? 'border-red-500 focus:ring-red-500/10' : 'border-slate-200'
                    }`}
                    placeholder="e.g., ELC-001"
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Device Type *</label>
                  <select
                    {...register('deviceType')}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      formErrors.deviceType ? 'border-red-500 focus:ring-red-500/10' : 'border-slate-200'
                    }`}
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
                  {formErrors.deviceType && (
                    <motion.p
                      className="text-red-500 text-sm mt-1 flex items-center gap-1"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <AlertCircle className="w-3 h-3" />
                      {formErrors.deviceType.message}
                    </motion.p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                  <input
                    type="text"
                    {...register('brand')}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="e.g., Dell, HP, Lenovo"
                    disabled={saving}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                  <input
                    type="text"
                    {...register('model')}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="e.g., Latitude 5520"
                    disabled={saving}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
                  <input
                    type="text"
                    {...register('serialNumber')}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="e.g., SN123456789"
                    disabled={saving}
                  />
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                Purchase Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date *</label>
                  <input
                    type="date"
                    {...register('purchaseDate')}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
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
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Warranty End Date</label>
                  <input
                    type="date"
                    {...register('warrantyEndDate')}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    disabled={saving}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
                  <select
                    {...register('manufacturerId')}
                    disabled={saving}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Useful Life (Years)</label>
                  <input
                    type="number"
                    {...register('usefulLifeYears')}
                    placeholder="5"
                    disabled={saving}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salvage Value (PKR)</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('salvageValue')}
                    placeholder="0.00"
                    disabled={saving}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
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
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                Location & Assignment
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Office *</label>
                  <select
                    {...register('companyId')}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                  <select
                    {...register('locationId')}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
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
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                Condition & Status
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                  <select
                    {...register('condition')}
                    disabled={saving}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="IN_STORE">In Store</option>
                    <option value="IN_USE">In Use</option>
                    <option value="DISPOSED">Disposed</option>
                    <option value="AUCTION">Auction</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Maintenance Date</label>
                  <input
                    type="date"
                    {...register('lastMaintenanceDate')}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    disabled={saving}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                  <textarea
                    {...register('remarks')}
                    rows={3}
                    placeholder="Additional notes or comments..."
                    disabled={saving}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
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
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
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
