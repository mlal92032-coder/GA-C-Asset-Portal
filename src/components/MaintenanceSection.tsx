'use client';

import { useState } from 'react';
import { Wrench, Plus, Calendar, DollarSign, Trash2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface Maintenance {
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

interface MaintenanceSectionProps {
  assetId: string;
  assetType: 'FURNITURE' | 'ELECTRONIC' | 'VEHICLE';
  maintenances: Maintenance[];
}

export default function MaintenanceSection({ assetId, assetType, maintenances: initialMaintenances }: MaintenanceSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('');
  const [performedBy, setPerformedBy] = useState('');
  const [nextDueDate, setNextDueDate] = useState('');
  const [status, setStatus] = useState<'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED'>('SCHEDULED');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [localMaintenances, setLocalMaintenances] = useState<Maintenance[]>(initialMaintenances);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Please enter a description');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetId,
          assetType,
          description,
          cost: cost ? parseFloat(cost) : null,
          performedBy: performedBy || null,
          nextDueDate: nextDueDate || null,
          status,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const json = await res.json();
      if (json.success) {
        setLocalMaintenances([json.data, ...localMaintenances]);
        setDescription('');
        setCost('');
        setPerformedBy('');
        setNextDueDate('');
        setStatus('SCHEDULED');
        setShowForm(false);
      } else {
        setError(json.error || 'Failed to add maintenance');
      }
    } catch {
      setError('Failed to add maintenance');
    } finally {
      setSubmitting(false);
    }
  };

  const totalCost = localMaintenances.reduce((sum, m) => sum + (m.cost || 0), 0);
  const completedCount = localMaintenances.filter((m) => m.status === 'COMPLETED').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-amber-100 text-amber-700';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-700';
      case 'COMPLETED':
        return 'bg-emerald-100 text-emerald-700';
      case 'CANCELLED':
        return 'bg-slate-100 text-slate-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="bg-white border border-slate-200 p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-900">Maintenance History</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
        >
          <Plus className="w-4 h-4" />
          Add Maintenance
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-2 mb-1">
            <Wrench className="w-5 h-5 text-slate-500" />
            <p className="text-xs text-slate-500">Total Records</p>
          </div>
          <p className="text-2xl font-bold text-slate-900">{localMaintenances.length}</p>
        </div>
        <div className="p-4 bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-5 h-5 text-slate-500" />
            <p className="text-xs text-slate-500">Completed</p>
          </div>
          <p className="text-2xl font-bold text-slate-900">{completedCount}</p>
        </div>
        <div className="p-4 bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-5 h-5 text-slate-500" />
            <p className="text-xs text-slate-500">Total Cost</p>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            Rs. {totalCost.toLocaleString('en-PK')}
          </p>
        </div>
      </div>

      {/* Add Maintenance Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-slate-50 border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the maintenance work done..."
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Cost (Rs.)
              </label>
              <input
                type="number"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="0"
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Performed By
              </label>
              <input
                type="text"
                value={performedBy}
                onChange={(e) => setPerformedBy(e.target.value)}
                placeholder="Technician name"
                className="w-full px-3 py-2 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Maintenance Date
              </label>
              <input
                type="date"
                value={new Date().toISOString().split('T')[0]}
                disabled
                className="w-full px-3 py-2 border border-slate-300 bg-slate-100 text-slate-600 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Next Due Date
              </label>
              <input
                type="date"
                value={nextDueDate}
                onChange={(e) => setNextDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="SCHEDULED">Scheduled</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4" />
              {submitting ? 'Adding...' : 'Add Maintenance'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Maintenance List */}
      {localMaintenances.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <Wrench className="w-12 h-12 mx-auto mb-2 text-slate-300" />
          <p>No maintenance records</p>
          <p className="text-xs mt-1">Add maintenance records to track service history</p>
        </div>
      ) : (
        <div className="space-y-3">
          {localMaintenances.map((maint) => (
            <div
              key={maint.id}
              className="p-4 border border-slate-200 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold ${getStatusColor(maint.status)}`}>
                      {maint.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-slate-500">
                      {format(new Date(maint.maintenanceDate), 'PPP')}
                    </span>
                  </div>
                  <p className="text-sm text-slate-900 font-medium">{maint.description}</p>
                  {maint.performedBy && (
                    <p className="text-xs text-slate-500 mt-1">
                      Performed by: {maint.performedBy}
                    </p>
                  )}
                </div>
                {maint.cost && (
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">
                      Rs. {maint.cost.toLocaleString('en-PK')}
                    </p>
                  </div>
                )}
              </div>
              {maint.nextDueDate && (
                <div className="flex items-center gap-1 mt-2 text-xs text-amber-600">
                  <Calendar className="w-3 h-3" />
                  Next due: {format(new Date(maint.nextDueDate), 'PPP')}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
