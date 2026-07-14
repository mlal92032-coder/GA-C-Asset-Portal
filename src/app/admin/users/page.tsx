'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/DashboardLayout';
import PageHeader from '@/components/PageHeader';
import ModernUserModal from '@/components/ModernUserModal';
import { Button, IconButton } from '@/components/Button';
import { Plus, Search, Edit, Trash2, Users as UsersIcon, Shield, CheckCircle, XCircle } from 'lucide-react';

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  permissions: string | null;
  status: string;
  department: string | null;
  designation: string | null;
  phone: string | null;
  createdAt: string;
}

export default function UsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const isSuperAdmin = session?.user?.role === 'SUPER_ADMIN';
  const canManageUsers = isSuperAdmin; // Only SUPER_ADMIN can manage users
  const isViewOnly = session?.user?.role === 'VIEW_USER';

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const json = await res.json();
      if (json.success) setUsers(json.data);
    } catch {
      showToast('Failed to fetch users', 'error');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async (userData: any) => {
    setSaving(true);
    try {
      // If creating new user, submit a request instead
      if (!editingUser) {
        const res = await fetch('/api/user-requests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData),
        });

        const json = await res.json();

        if (json.success) {
          showToast('User request submitted for approval', 'success');
          setShowModal(false);
          setEditingUser(null);
        } else {
          showToast(json.error || 'Failed to submit request', 'error');
        }
      } else {
        // For editing existing users, update directly
        const res = await fetch(`/api/users/${editingUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData),
        });

        const json = await res.json();

        if (json.success) {
          showToast('User updated successfully', 'success');
          fetchUsers();
          setShowModal(false);
          setEditingUser(null);
        } else {
          showToast(json.error || 'Failed to update user', 'error');
        }
      }
    } catch {
      showToast('An error occurred', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user: User) => {
    if (!confirm(`Delete request for ${user.fullName}?\nThis will be sent for approval.`)) return;

    try {
      const res = await fetch('/api/user-delete-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          userName: user.fullName,
          userEmail: user.email,
          reason: 'User deletion requested',
        }),
      });

      const json = await res.json();
      if (json.success) {
        showToast('Delete request submitted for approval', 'success');
      } else {
        showToast(json.error || 'Failed to submit delete request', 'error');
      }
    } catch {
      showToast('An error occurred', 'error');
    }
  };

  const openCreate = () => {
    setEditingUser(null);
    setShowModal(true);
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const filteredUsers = users.filter(u =>
    u.fullName.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return <span className="badge badge-danger">Super Admin</span>;
      case 'USER':
        return <span className="badge badge-blue">User</span>;
      case 'VIEW_USER':
        return <span className="badge badge-secondary">View Only</span>;
      default:
        return <span className="badge badge-secondary">{role}</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="badge badge-success">Active</span>;
      case 'INACTIVE':
        return <span className="badge badge-warning">Inactive</span>;
      default:
        return <span className="badge badge-secondary">{status}</span>;
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
      {toast && (
        <div className={`fixed top-20 right-4 z-[10001] px-6 py-3 rounded-lg shadow-lg animate-slide-in ${
          toast.type === 'success'
            ? 'bg-emerald-500 text-white'
            : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center gap-2">
            {toast.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
            {toast.message}
          </div>
        </div>
      )}

      <PageHeader
        title="User Management"
        subtitle="Manage system users and permissions"
        icon={UsersIcon}
        badge="Administration"
        gradientFrom="from-indigo-100"
        gradientTo="to-blue-100"
        iconColor="text-indigo-600"
        actions={
          canManageUsers && (
            <Button
              onClick={openCreate}
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
            >
              Add New User
            </Button>
          )
        }
        stats={[
          { label: 'Total Users', value: users.length },
          { label: 'Active', value: users.filter(u => u.status === 'ACTIVE').length },
          { label: 'Admins', value: users.filter(u => u.role === 'SUPER_ADMIN').length },
        ]}
      />

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name or email..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Department</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center text-white font-semibold">
                        {user.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{user.fullName}</p>
                        {user.designation && (
                          <p className="text-xs text-slate-500">{user.designation}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="text-slate-600">{user.email}</td>
                  <td>{getRoleBadge(user.role)}</td>
                  <td className="text-slate-600">{user.department || '-'}</td>
                  <td>{getStatusBadge(user.status)}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      {canManageUsers ? (
                        <>
                          <IconButton
                            onClick={() => openEdit(user)}
                            variant="secondary"
                            size="sm"
                            icon={<Edit className="w-4 h-4" />}
                            tooltip="Edit User"
                          />
                          <IconButton
                            onClick={() => handleDelete(user)}
                            variant="danger"
                            size="sm"
                            icon={<Trash2 className="w-4 h-4" />}
                            tooltip="Delete User"
                          />
                        </>
                      ) : (
                        <span className="text-xs text-slate-400 px-2">View Only</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modern Modal */}
      <ModernUserModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingUser(null);
        }}
        onSave={handleSave}
        editingUser={editingUser as Record<string, unknown> | null}
        saving={saving}
      />
      </div>
    </DashboardLayout>
  );
}

