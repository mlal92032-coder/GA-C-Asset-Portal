'use client';

import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import PageHeader from '@/components/PageHeader';
import { Pagination } from '@/components/Pagination';
import type { User } from '@/types';
import {
  Search,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  Download,
  FileText,
  Loader2,
} from 'lucide-react';

interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entity: string;
  entityId: string | null;
  details: string | null;
  createdAt: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  };
}

interface AuditLogResponse {
  success: boolean;
  data: AuditLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const ACTION_OPTIONS = [
  { value: '', label: 'All Actions' },
  { value: 'CREATE', label: 'Create' },
  { value: 'UPDATE', label: 'Update' },
  { value: 'DELETE', label: 'Delete' },
  { value: 'LOGIN', label: 'Login' },
  { value: 'LOGOUT', label: 'Logout' },
];

const ENTITY_OPTIONS = [
  { value: '', label: 'All Entities' },
  { value: 'USER', label: 'User' },
  { value: 'COMPANY', label: 'Company' },
  { value: 'FURNITURE', label: 'Furniture' },
  { value: 'ELECTRONIC', label: 'Electronic' },
  { value: 'VEHICLE', label: 'Vehicle' },
  { value: 'LOCATION', label: 'Location' },
  { value: 'MANUFACTURER', label: 'Manufacturer' },
];

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [totalItems, setTotalItems] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Filters
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const hasActiveFilters = actionFilter || entityFilter || userFilter || startDate || endDate || search;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      if (actionFilter) params.set('action', actionFilter);
      if (entityFilter) params.set('entity', entityFilter);
      if (userFilter) params.set('userId', userFilter);
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      if (search) params.set('search', search);

      const res = await fetch(`/api/audit-logs?${params}`);
      const json: AuditLogResponse = await res.json();

      if (json.success) {
        setLogs(json.data);
        setTotalItems(json.pagination.total);
      }
    } catch {
      console.error('Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, actionFilter, entityFilter, userFilter, startDate, endDate, search]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const json = await res.json();
      if (json.success) setUsers(json.data);
    } catch {
      console.error('Failed to fetch users');
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const clearFilters = () => {
    setActionFilter('');
    setEntityFilter('');
    setUserFilter('');
    setStartDate('');
    setEndDate('');
    setSearch('');
    setCurrentPage(1);
  };

  const toggleExpand = (id: string) => {
    setExpandedLog(expandedLog === id ? null : id);
  };

  const formatDetails = (details: string | null) => {
    if (!details) return null;
    try {
      const parsed = JSON.parse(details);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return details;
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'badge-success';
      case 'UPDATE':
        return 'badge-info';
      case 'DELETE':
        return 'badge-danger';
      case 'LOGIN':
      case 'LOGOUT':
        return 'badge-secondary';
      default:
        return 'badge-secondary';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const exportToCSV = () => {
    const headers = ['Timestamp', 'User', 'Email', 'Role', 'Action', 'Entity', 'Entity ID', 'Details'];
    const rows = logs.map((log) => [
      formatDate(log.createdAt),
      log.user.fullName,
      log.user.email,
      log.user.role,
      log.action,
      log.entity,
      log.entityId || '',
      log.details || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading && logs.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="spinner" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="w-full max-w-full px-1.5 sm:px-2 lg:px-3 overflow-x-hidden">
        <PageHeader
          title="Audit Logs"
          subtitle="Track all system activities and user actions"
          icon={FileText}
          badge="Administration"
          gradientFrom="from-slate-100"
          gradientTo="to-gray-100"
          iconColor="text-slate-600"
          stats={[
            { label: 'Total Logs', value: totalItems },
          ]}
        />

      {/* Filters */}
      <div className="flex items-center gap-1.5 mb-2">
        <div className="relative w-48">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Search logs..."
            className="pl-8 py-1.5 text-sm"
          />
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className="btn btn-secondary btn-sm">
          <Filter className="w-3.5 h-3.5" /> Filters
        </button>
        {hasActiveFilters && (
          <button onClick={clearFilters} className="btn btn-secondary btn-sm text-red-600">
            <X className="w-3.5 h-3.5" /> Clear
          </button>
        )}
        {hasActiveFilters && (
          <span className="text-xs text-slate-400 ml-2">{totalItems} results</span>
        )}
      </div>

      {showFilters && (
        <div className="flex flex-wrap items-center gap-1.5 mb-2 p-2 bg-slate-50 border border-slate-200 rounded-lg">
          <select value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setCurrentPage(1); }} className="py-1 text-sm w-28">
            {ACTION_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
          </select>
          <select value={entityFilter} onChange={(e) => { setEntityFilter(e.target.value); setCurrentPage(1); }} className="py-1 text-sm w-28">
            {ENTITY_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
          </select>
          <select value={userFilter} onChange={(e) => { setUserFilter(e.target.value); setCurrentPage(1); }} className="py-1 text-sm w-36">
            <option value="">All Users</option>
            {users.map((user) => (<option key={user.id} value={user.id}>{user.fullName}</option>))}
          </select>
          <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }} className="py-1 text-sm w-32" placeholder="Start" />
          <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }} className="py-1 text-sm w-32" placeholder="End" />
        </div>
      )}

      {/* Table Card */}
      <div className="card overflow-hidden">
        {loading && (
          <div className="flex items-center justify-center py-2 bg-gray-50">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span className="ml-2 text-sm text-gray-600">Loading logs...</span>
          </div>
        )}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th style={{ width: '40px' }}></th>
                <th>Timestamp</th>
                <th>User</th>
                <th>Action</th>
                <th>Entity</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <React.Fragment key={log.id}>
                  <tr key={log.id} className="cursor-pointer" onClick={() => toggleExpand(log.id)}>
                    <td className="text-center">
                      {expandedLog === log.id ? (
                        <ChevronUp className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      )}
                    </td>
                    <td className="text-sm text-gray-600 whitespace-nowrap">
                      {formatDate(log.createdAt)}
                    </td>
                    <td>
                      <div>
                        <div className="font-medium text-gray-900">{log.user.fullName}</div>
                        <div className="text-sm text-gray-500">{log.user.email}</div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${getActionBadge(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <span className="badge badge-secondary">{log.entity}</span>
                        {log.entityId && (
                          <span className="text-xs text-gray-500 font-mono">
                            {log.entityId.slice(-8)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="text-sm text-gray-500 max-w-xs truncate">
                      {log.details ? (
                        <span className="font-mono text-xs">
                          {log.details.slice(0, 50)}...
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                  {expandedLog === log.id && log.details && (
                    <tr>
                      <td colSpan={6} className="bg-gray-50 p-4">
                        <div className="bg-white border border-gray-200 p-4">
                          <div className="flex items-center gap-1.5 mb-2">
                            <FileText className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">Details</span>
                          </div>
                          <pre className="text-xs text-gray-700 overflow-x-auto whitespace-pre-wrap break-all bg-gray-50 p-3 max-h-64 overflow-y-auto">
                            {formatDetails(log.details)}
                          </pre>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        {logs.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No audit logs found</p>
          </div>
        )}
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(totalItems / itemsPerPage)}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={(page) => setCurrentPage(page)}
          onItemsPerPageChange={(perPage) => { setItemsPerPage(perPage); setCurrentPage(1); }}
        />
      </div>
      </div>
    </DashboardLayout>
  );
}

