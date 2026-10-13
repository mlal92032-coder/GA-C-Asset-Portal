'use client';

import { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import PageHeader from '@/components/PageHeader';
import { Trash2, Plus, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface DeleteRequest {
  id: string;
  assetType: string;
  assetName: string;
  reason?: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  requestedBy: { id: string; fullName: string; email: string };
}

interface AssetAddRequest {
  id: string;
  assetType: string;
  assetData: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  requestedBy: { id: string; fullName: string; email: string };
}

export default function RequestsPage() {
  const [addRequests, setAddRequests] = useState<AssetAddRequest[]>([]);
  const [deleteRequests, setDeleteRequests] = useState<DeleteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);

  // Parse asset data safely
  const getAssetName = (assetData: string) => {
    try {
      const data = JSON.parse(assetData);
      return data.assetName || 'Unnamed Asset';
    } catch {
      return 'Unnamed Asset';
    }
  };

  // Fetch all requests
  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const [addRes, delRes] = await Promise.all([
        fetch(`/api/asset-add-requests?t=${Date.now()}`),
        fetch(`/api/delete-requests?t=${Date.now()}`),
      ]);

      const addJson = await addRes.json();
      const delJson = await delRes.json();

      if (addJson.success) setAddRequests(addJson.data || []);
      if (delJson.success) setDeleteRequests(delJson.data || []);
    } catch (error) {
      console.error('Error fetching:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount and when refresh count changes
  useEffect(() => {
    fetchRequests();
  }, [fetchRequests, refreshCount]);

  // Setup visibility listener
  useEffect(() => {
    const handleVisibility = () => {
      if (!document.hidden) {
        fetchRequests();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', fetchRequests);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', fetchRequests);
    };
  }, [fetchRequests]);

  // Handle approval/rejection
  const handleReview = useCallback(
    async (
      requestId: string,
      type: 'add' | 'delete',
      action: 'APPROVE' | 'REJECT'
    ) => {
      setProcessing(requestId);
      try {
        const endpoints: Record<string, string> = {
          add: '/api/asset-add-requests',
          delete: '/api/delete-requests',
        };

        const endpoint = endpoints[type];
        if (!endpoint) throw new Error('Invalid type');

        const res = await fetch(`${endpoint}/${requestId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ requestId, action, reviewedById: 'system' }),
        });

        const json = await res.json();
        if (json.success) {
          // Wait a bit then refresh
          await new Promise(resolve => setTimeout(resolve, 800));
          setRefreshCount(prev => prev + 1);
        } else {
          alert(json.error || 'Failed to process request');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error processing request');
      } finally {
        setProcessing(null);
      }
    },
    []
  );

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      PENDING: 'badge-warning',
      APPROVED: 'badge-success',
      REJECTED: 'badge-danger',
    };
    return <span className={`badge ${badges[status] || 'badge-secondary'}`}>{status}</span>;
  };

  const pendingAdds = addRequests.filter(r => r.status === 'PENDING').length;
  const pendingDeletes = deleteRequests.filter(r => r.status === 'PENDING').length;

  return (
    <DashboardLayout>
      <div className="w-full max-w-full px-1.5 sm:px-2 lg:px-3 overflow-x-hidden">
        <PageHeader
          title="Approval Requests"
          subtitle="Review pending asset creation and deletion requests"
          icon={CheckCircle}
          badge="Administration"
          gradientFrom="from-green-100"
          gradientTo="to-emerald-100"
          iconColor="text-green-600"
          stats={[
            { label: 'Add Requests', value: addRequests.filter(r => r.status === 'PENDING').length },
            { label: 'Delete Requests', value: deleteRequests.filter(r => r.status === 'PENDING').length },
          ]}
        />

        <div className="mb-2 flex justify-end gap-1.5">
          <button
            onClick={() => setRefreshCount(prev => prev + 1)}
            disabled={loading}
            className="btn btn-secondary btn-sm flex items-center gap-1.5"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {loading && <div className="text-center py-12"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent mx-auto" /></div>}

        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ADD ASSET REQUESTS (LEFT) */}
            <div className="card overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-b-2 border-emerald-200 p-4 flex items-center gap-1.5">
                <Plus className="w-5 h-5 text-emerald-600" />
                <h2 className="text-lg font-bold text-slate-900">Add Asset Approvals</h2>
                <span className="ml-auto badge badge-warning">{pendingAdds}</span>
              </div>

              <div className="divide-y max-h-[700px] overflow-y-auto">
                {addRequests.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">No requests</div>
                ) : (
                  addRequests.map((req) => {
                    const assetName = getAssetName(req.assetData);
                    return (
                      <div key={req.id} className="p-4 hover:bg-slate-50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <p className="font-bold text-slate-900">{assetName}</p>
                            <p className="text-xs text-slate-500 mt-1">Type: {req.assetType}</p>
                            <p className="text-xs text-slate-500">Requested by: {req.requestedBy.fullName}</p>
                          </div>
                          {getStatusBadge(req.status)}
                        </div>
                        {req.status === 'PENDING' && (
                          <div className="flex gap-1.5 mt-3">
                            <button
                              onClick={() => handleReview(req.id, 'add', 'APPROVE')}
                              disabled={processing === req.id}
                              className="btn btn-approve btn-sm text-xs flex-1"
                            >
                              <CheckCircle className="w-3 h-3" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleReview(req.id, 'add', 'REJECT')}
                              disabled={processing === req.id}
                              className="btn btn-reject btn-sm text-xs flex-1"
                            >
                              <XCircle className="w-3 h-3" />
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* DELETE ASSET REQUESTS (RIGHT) */}
            <div className="card overflow-hidden">
              <div className="bg-gradient-to-r from-rose-50 to-red-50 border-b-2 border-rose-200 p-4 flex items-center gap-1.5">
                <Trash2 className="w-5 h-5 text-rose-600" />
                <h2 className="text-lg font-bold text-slate-900">Delete Asset Approvals</h2>
                <span className="ml-auto badge badge-warning">{pendingDeletes}</span>
              </div>

              <div className="divide-y max-h-[700px] overflow-y-auto">
                {deleteRequests.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">No requests</div>
                ) : (
                  deleteRequests.map((req) => (
                    <div key={req.id} className="p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <p className="font-bold text-slate-900">{req.assetName}</p>
                          <p className="text-xs text-slate-500 mt-1">Type: {req.assetType}</p>
                          <p className="text-xs text-slate-500">Requested by: {req.requestedBy.fullName}</p>
                        </div>
                        {getStatusBadge(req.status)}
                      </div>
                      {req.reason && (
                        <p className="text-xs text-slate-600 mb-2">Reason: {req.reason}</p>
                      )}
                      {req.status === 'PENDING' && (
                        <div className="flex gap-1.5 mt-3">
                          <button
                            onClick={() => handleReview(req.id, 'delete', 'APPROVE')}
                            disabled={processing === req.id}
                            className="btn btn-approve btn-sm text-xs flex-1"
                          >
                            <CheckCircle className="w-3 h-3" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleReview(req.id, 'delete', 'REJECT')}
                            disabled={processing === req.id}
                            className="btn btn-reject btn-sm text-xs flex-1"
                          >
                            <XCircle className="w-3 h-3" />
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
