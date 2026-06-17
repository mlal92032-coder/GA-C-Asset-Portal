'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import PageHeader from '@/components/PageHeader';
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, Calendar, User, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

interface DeleteRequest {
  id: string;
  assetId: string;
  assetType: string;
  assetName: string;
  reason?: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  requestedBy: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  };
}

export default function DeleteRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<DeleteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/delete-requests');
      const json = await res.json();
      if (json.success) {
        setRequests(json.data);
      }
    } catch (error) {
      console.error('Failed to fetch delete requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (requestId: string, action: 'APPROVE' | 'REJECT') => {
    setProcessing(requestId);
    try {
      const res = await fetch(`/api/delete-requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          action,
          reviewedById: 'system', // In production, get from session
        }),
      });

      const json = await res.json();
      if (json.success) {
        fetchRequests();
      }
    } catch (error) {
      console.error('Failed to process request:', error);
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="badge badge-warning">Pending</span>;
      case 'APPROVED':
        return <span className="badge badge-success">Approved</span>;
      case 'REJECTED':
        return <span className="badge badge-danger">Rejected</span>;
      default:
        return <span className="badge badge-secondary">{status}</span>;
    }
  };

  const pendingCount = requests.filter(r => r.status === 'PENDING').length;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
      <PageHeader
        title="Delete Requests"
        subtitle="Review and manage asset deletion requests"
        icon={Trash2}
        badge="Administration"
        gradientFrom="from-rose-100"
        gradientTo="to-red-100"
        iconColor="text-rose-600"
        stats={[
          { label: 'Total Requests', value: requests.length },
          { label: 'Pending', value: pendingCount },
        ]}
      />

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : requests.length === 0 ? (
          <div className="empty-state py-24">
            <AlertTriangle className="w-20 h-20 text-slate-300 mb-4 mx-auto" />
            <p className="empty-state-title text-lg font-semibold text-slate-600">No delete requests</p>
            <p className="empty-state-text mt-1">All assets are in good standing</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Asset Name</th>
                  <th>Type</th>
                  <th>Requested By</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id}>
                    <td className="font-medium">{request.assetName}</td>
                    <td>
                      <span className="badge badge-blue">{request.assetType}</span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="font-medium text-sm">{request.requestedBy.fullName}</p>
                          <p className="text-xs text-slate-500">{request.requestedBy.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-sm max-w-xs truncate">
                      {request.reason || '-'}
                    </td>
                    <td>{getStatusBadge(request.status)}</td>
                    <td>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {format(new Date(request.createdAt), 'PP')}
                      </div>
                    </td>
                    <td>
                      {request.status === 'PENDING' ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleReview(request.id, 'APPROVE')}
                            disabled={processing === request.id}
                            className="btn btn-approve btn-sm"
                          >
                            <CheckCircle className="w-3 h-3" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleReview(request.id, 'REJECT')}
                            disabled={processing === request.id}
                            className="btn btn-reject btn-sm"
                          >
                            <XCircle className="w-3 h-3" />
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">Reviewed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </div>
    </DashboardLayout>
  );
}

