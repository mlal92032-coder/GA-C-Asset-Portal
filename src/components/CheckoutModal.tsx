'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Loader2,
  User,
  Calendar,
  FileText,
  ArrowUpCircle,
  ArrowDownCircle,
  AlertTriangle,
} from 'lucide-react';
import { format } from 'date-fns';
import { useFocusTrap } from '@/hooks/useFocusTrap';

interface CheckoutModalProps {
  assetId: string;
  assetName: string;
  assetType: 'FURNITURE' | 'ELECTRONIC' | 'VEHICLE';
  users: Array<{ id: string; fullName: string; email: string }>;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CheckoutModal({
  assetId,
  assetName,
  assetType,
  users,
  onClose,
  onSuccess,
}: CheckoutModalProps) {
  const [userId, setUserId] = useState('');
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const modalRef = useFocusTrap({ isOpen: true, onClose });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/assets/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetId,
          assetType,
          userId,
          expectedReturnDate: expectedReturnDate || null,
          notes: notes || null,
        }),
      });

      const json = await res.json();

      if (json.success) {
        onSuccess();
      } else {
        setError(json.error || 'Failed to checkout asset');
      }
    } catch {
      setError('An error occurred while checking out the asset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay fixed inset-0 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center z-[9998] p-4">
      <div
        ref={modalRef}
        className="modal bg-white shadow-2xl max-w-md w-full animate-scale-in z-[10000]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <ArrowUpCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 id="checkout-modal-title" className="text-lg font-bold text-slate-900">Checkout Asset</h2>
              <p className="text-xs text-slate-500">{assetName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Assign To *
            </label>
            <select
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50/50"
            >
              <option value="">Select a user...</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.fullName} ({user.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Expected Return Date
            </label>
            <input
              type="date"
              value={expectedReturnDate}
              onChange={(e) => setExpectedReturnDate(e.target.value)}
              min={format(new Date(), 'yyyy-MM-dd')}
              className="w-full px-4 py-3 border-2 border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50/50"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Add any notes about this checkout..."
              className="w-full px-4 py-3 border-2 border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50/50 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !userId}
              className="btn btn-primary flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Checking out...
                </>
              ) : (
                <>
                  <ArrowUpCircle className="w-5 h-5" />
                  Checkout
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Checkin Modal
interface CheckinModalProps {
  checkoutId: string;
  assetName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function CheckinModal({
  checkoutId,
  assetName,
  onClose,
  onSuccess,
}: CheckinModalProps) {
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/assets/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkoutId,
          notes: notes || null,
        }),
      });

      const json = await res.json();

      if (json.success) {
        onSuccess();
      } else {
        setError(json.error || 'Failed to checkin asset');
      }
    } catch {
      setError('An error occurred while checking in the asset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay fixed inset-0 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center z-[9998] p-4">
      <div className="modal bg-white shadow-2xl max-w-md w-full animate-scale-in z-[10000]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
              <ArrowDownCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Checkin Asset</h2>
              <p className="text-xs text-slate-500">{assetName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              Checkin Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Add any notes about the asset condition..."
              className="w-full px-4 py-3 border-2 border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50/50 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-success flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Checking in...
                </>
              ) : (
                <>
                  <ArrowDownCircle className="w-5 h-5" />
                  Checkin
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
