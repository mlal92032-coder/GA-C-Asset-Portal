'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Car, DollarSign, AlertCircle, CheckCircle, Wrench } from 'lucide-react';
import { motion } from 'framer-motion';
import ImageUpload from './ImageUpload';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useToast } from '@/contexts/ToastContext';
import { vehicleAssetSchema } from '@/schemas/vehicles';

// Form-specific schema that adapts modal data to API expectations
const vehicleFormSchema = z.object({
  assetName: z.string().min(2, 'Asset name must be at least 2 characters').max(255),
  assetTag: z.string().min(1, 'Asset tag is required').max(50),
  vehicleType: z.string().default(''),
  brand: z.string().default(''),
  model: z.string().default(''),
  registrationNumber: z.string().min(1, 'Registration number is required').max(50),
  engineNumber: z.string().default(''),
  chassisNumber: z.string().default(''),
  fuelType: z.string().default(''),
  purchaseDate: z.string().min(1, 'Purchase date is required'),
  purchasePrice: z.string().refine(v => v === '' || (!isNaN(Number(v)) && Number(v) > 0), 'Purchase price must be a positive number'),
  companyId: z.string().min(1, 'Office is required'),
  manufacturerId: z.string().default(''),
  locationId: z.string().min(1, 'Location is required'),
  assignedUserId: z.string().default(''),
  condition: z.enum(['GOOD', 'REPAIR', 'DAMAGED']).default('GOOD'),
  status: z.enum(['IN_STORE', 'IN_USE', 'DISPOSED', 'AUCTION']).default('IN_STORE'),
  lastServiceDate: z.string().default(''),
  insuranceExpiryDate: z.string().default(''),
  registrationExpiry: z.string().default(''),
  remarks: z.string().default(''),
  usefulLifeYears: z.string().default('10'),
  salvageValue: z.string().default(''),
  imageUrl: z.string().default(''),
});

type VehicleFormData = z.infer<typeof vehicleFormSchema>;

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
    resolver: zodResolver(vehicleFormSchema),
    mode: 'onChange',
    defaultValues: {
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
      registrationExpiry: '',
      remarks: '',
      usefulLifeYears: '10',
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
        registrationExpiry: editingAsset.registrationExpiry?.split('T')[0] || '',
        remarks: editingAsset.remarks || '',
        usefulLifeYears: editingAsset.usefulLifeYears?.toString() || '10',
        salvageValue: editingAsset.salvageValue?.toString() || '',
        imageUrl: editingAsset.imageUrl || '',
      });
    } else {
      reset();
    }
  }, [editingAsset, isOpen, reset]);

  const onSubmit = async (data: VehicleFormData) => {
    try {
      // Validate form data against schema before submission
      const validatedData = vehicleFormSchema.parse(data);
      await onSave(validatedData);
      success(
        editingAsset
          ? 'Vehicle asset updated successfully'
          : 'Vehicle asset created successfully'
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
          (editingAsset ? 'Failed to update vehicle asset' : 'Failed to create vehicle asset')
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
        aria-labelledby="vehicles-modal-title"
      >
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
                <Car className="w-5 h-5 text-emerald-600" />
                Vehicle Details
              </h3>

              <div className="mb-4">
                <ImageUpload
                  value={imageUrlValue || ''}
                  onChange={(url) => setValue('imageUrl', url || '')}
                  label="Vehicle Image"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Asset Name *</label>
                  <input
                    type="text"
                    {...register('assetName')}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
                      formErrors.assetName ? 'border-red-500 focus:ring-red-500/10' : 'border-slate-200'
                    }`}
                    placeholder="e.g., Company Car"
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
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono text-sm transition-all ${
                      formErrors.assetTag ? 'border-red-500 focus:ring-red-500/10' : 'border-slate-200'
                    }`}
                    placeholder="e.g., VEH-001"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type *</label>
                  <select
                    {...register('vehicleType')}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
                      formErrors.vehicleType ? 'border-red-500 focus:ring-red-500/10' : 'border-slate-200'
                    }`}
                    disabled={saving}
                  >
                    <option value="">Select type</option>
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="Van">Van</option>
                    <option value="Truck">Truck</option>
                    <option value="Motorcycle">Motorcycle</option>
                    <option value="Other">Other</option>
                  </select>
                  {formErrors.vehicleType && (
                    <motion.p
                      className="text-red-500 text-sm mt-1 flex items-center gap-1"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <AlertCircle className="w-3 h-3" />
                      {formErrors.vehicleType.message}
                    </motion.p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number *</label>
                  <input
                    type="text"
                    {...register('registrationNumber')}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
                      formErrors.registrationNumber ? 'border-red-500 focus:ring-red-500/10' : 'border-slate-200'
                    }`}
                    placeholder="e.g., ABC-1234"
                    disabled={saving}
                  />
                  {formErrors.registrationNumber && (
                    <motion.p
                      className="text-red-500 text-sm mt-1 flex items-center gap-1"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <AlertCircle className="w-3 h-3" />
                      {formErrors.registrationNumber.message}
                    </motion.p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                  <input
                    type="text"
                    {...register('brand')}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="e.g., Toyota, Honda"
                    disabled={saving}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                  <input
                    type="text"
                    {...register('model')}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="e.g., Corolla, Civic"
                    disabled={saving}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Engine Number</label>
                  <input
                    type="text"
                    {...register('engineNumber')}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="e.g., ENG123456"
                    disabled={saving}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chassis Number</label>
                  <input
                    type="text"
                    {...register('chassisNumber')}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="e.g., CHAS123456"
                    disabled={saving}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type</label>
                  <select
                    {...register('fuelType')}
                    disabled={saving}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
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

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                Purchase Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date *</label>
                  <input
                    type="date"
                    {...register('purchaseDate')}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
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
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
                  <select
                    {...register('manufacturerId')}
                    disabled={saving}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
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
                    placeholder="10"
                    disabled={saving}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
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
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
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
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
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
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
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
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
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
                <Wrench className="w-5 h-5 text-emerald-600" />
                Condition & Maintenance
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                  <select
                    {...register('condition')}
                    disabled={saving}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
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
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  >
                    <option value="IN_STORE">In Store</option>
                    <option value="IN_USE">In Use</option>
                    <option value="DISPOSED">Disposed</option>
                    <option value="AUCTION">Auction</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Service Date</label>
                  <input
                    type="date"
                    {...register('lastServiceDate')}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    disabled={saving}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Expiry Date</label>
                  <input
                    type="date"
                    {...register('insuranceExpiryDate')}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
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
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
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

