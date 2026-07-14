'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Modal from './Modal';
import { Button } from './Button';
import type { Location, User } from '@/types';

interface BulkStatusUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (data: BulkStatusUpdateData) => Promise<void>;
  locations: Location[];
  users: User[];
  isLoading: boolean;
}

export interface BulkStatusUpdateData {
  newStatus?: string;
  newCondition?: string;
  newLocationId?: string;
  newAssigneeId?: string;
}

export default function BulkStatusUpdateModal({
  isOpen,
  onClose,
  onUpdate,
  locations,
  users,
  isLoading,
}: BulkStatusUpdateModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<BulkStatusUpdateData>();

  const onSubmit = async (data: BulkStatusUpdateData) => {
    // Filter out empty values
    const updateData = Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== '' && value !== undefined)
    );

    if (Object.keys(updateData).length === 0) {
      alert('Please select at least one field to update');
      return;
    }

    setSubmitting(true);
    try {
      await onUpdate(updateData as BulkStatusUpdateData);
      reset();
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bulk Update Status"
      size="md"
      footer={
        <>
          <Button
            onClick={onClose}
            disabled={submitting}
            variant="secondary"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={submitting || isLoading}
            variant="primary"
          >
            {submitting ? 'Updating...' : 'Update'}
          </Button>
        </>
      }
    >
      <form className="space-y-4">
        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status (optional)
          </label>
          <select
            {...register('newStatus')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">No change</option>
            <option value="IN_USE">In Use</option>
            <option value="IN_STORE">In Store</option>
            <option value="DISPOSED">Disposed</option>
            <option value="AUCTION">Auction</option>
          </select>
        </div>

        {/* Condition */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Condition (optional)
          </label>
          <select
            {...register('newCondition')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">No change</option>
            <option value="GOOD">Good</option>
            <option value="REPAIR">Repair</option>
            <option value="DAMAGED">Damaged</option>
          </select>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location (optional)
          </label>
          <select
            {...register('newLocationId')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">No change</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.locationName}
              </option>
            ))}
          </select>
        </div>

        {/* Assignee */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assign To (optional)
          </label>
          <select
            {...register('newAssigneeId')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">No change</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.fullName} ({user.email})
              </option>
            ))}
          </select>
        </div>

        <p className="text-sm text-gray-500 mt-4">
          Leave fields empty to keep existing values unchanged.
        </p>
      </form>
    </Modal>
  );
}
