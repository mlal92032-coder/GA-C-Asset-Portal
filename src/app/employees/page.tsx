'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/DashboardLayout';
import PageHeader from '@/components/PageHeader';
import {
  Users, Search, ChevronDown, ChevronUp, Package,
  Armchair, Monitor, Car, MapPin, AlertCircle, UserCheck, Building2,
} from 'lucide-react';

interface Asset {
  id: string;
  assetTag: string | null;
  assetName: string;
  condition: string;
  status: string;
  location?: { locationName: string } | null;
}

interface FurnitureAsset extends Asset { furnitureType?: string | null }
interface ElectronicAsset extends Asset { deviceType?: string | null; brand?: string | null; model?: string | null }
interface VehicleAsset extends Asset { vehicleType?: string | null; brand?: string | null; model?: string | null; registrationNumber: string }

interface Employee {
  id: string; fullName: string; email: string;
  department?: string | null; designation?: string | null; phone?: string | null;
  role: string; status: 'ACTIVE' | 'INACTIVE'; permissions?: string | null; createdAt: string;
  furnitureAssets: FurnitureAsset[]; electronicAssets: ElectronicAsset[]; vehicleAssets: VehicleAsset[];
  totalAssets: number;
}

export default function EmployeesPage() {
  const { data: session } = useSession();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterDepartment, setFilterDepartment] = useState<string>('');
  const [expandedEmployee, setExpandedEmployee] = useState<string | null>(null);

  useEffect(() => { fetchEmployees(); }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filterStatus) params.append('status', filterStatus);
      if (filterDepartment) params.append('department', filterDepartment);
      const res = await fetch(`/api/employees?${params}`);
      const data = await res.json();
      if (data.success) setEmployees(data.data);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const timer = setTimeout(() => { fetchEmployees(); }, 300);
    return () => clearTimeout(timer);
  }, [search, filterStatus, filterDepartment]);

  const departments = Array.from(new Set(employees.map(e => e.department).filter((d): d is string => !!d)));

  const toggleEmployee = (id: string) => setExpandedEmployee(expandedEmployee === id ? null : id);

  const getConditionBadge = (c: string) => {
    switch (c) {
      case 'GOOD': return <span className="badge badge-success">Good</span>;
      case 'REPAIR': return <span className="badge badge-warning">Repair</span>;
      case 'DAMAGED': return <span className="badge badge-danger">Damaged</span>;
      default: return <span className="badge">{c}</span>;
    }
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'IN_USE': return <span className="badge badge-blue">In Use</span>;
      case 'IN_STORE': return <span className="badge badge-success">In Store</span>;
      case 'DISPOSED': return <span className="badge badge-secondary">Disposed</span>;
      default: return <span className="badge">{s}</span>;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center"><div className="spinner mx-auto mb-3" /><p className="text-sm text-slate-500">Loading employees...</p></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
      <PageHeader
        title="Employees & Assets"
        subtitle="View employees and their assigned assets"
        icon={Users}
        badge="HR Management"
        gradientFrom="from-cyan-100"
        gradientTo="to-sky-100"
        iconColor="text-cyan-600"
        stats={[
          { label: 'Total Employees', value: employees.length },
          { label: 'Active', value: employees.filter(e => e.status === 'ACTIVE').length },
          { label: 'Total Assets', value: employees.reduce((s, e) => s + e.totalAssets, 0) },
        ]}
      />

      {/* Search + Filters */}
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search employees..." className="pl-8 py-2 text-sm" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="py-2 text-sm w-28">
          <option value="">All Status</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option>
        </select>
        <select value={filterDepartment} onChange={e => setFilterDepartment(e.target.value)} className="py-2 text-sm w-36">
          <option value="">All Depts</option>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        {(search || filterStatus || filterDepartment) && (
          <button onClick={() => { setSearch(''); setFilterStatus(''); setFilterDepartment(''); }} className="text-xs text-blue-600 hover:text-blue-700 font-medium">Clear</button>
        )}
      </div>

      {/* Employee List */}
      <div className="space-y-2">
        {employees.map(employee => (
          <div key={employee.id} className="card overflow-hidden">
            <div className="p-3 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => toggleEmployee(employee.id)}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-violet-500 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">{employee.fullName.charAt(0)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-semibold text-slate-800 truncate">{employee.fullName}</span>
                      <span className={`badge ${employee.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>{employee.status === 'ACTIVE' ? 'Active' : 'Inactive'}</span>
                      {employee.role === 'SUPER_ADMIN' && <span className="badge badge-blue">Admin</span>}
                    </div>
                    <div className="flex flex-wrap gap-x-3 text-[11px] text-slate-500 mt-0.5">
                      <span>{employee.email}</span>
                      {employee.department && <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{employee.department}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="text-right"><span className="text-sm font-bold text-blue-600">{employee.totalAssets}</span><span className="text-[10px] text-slate-400 ml-0.5">assets</span></div>
                  {expandedEmployee === employee.id ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                </div>
              </div>
            </div>

            {expandedEmployee === employee.id && (
              <div className="border-t border-slate-100 bg-slate-50/50 p-4">
                {employee.totalAssets === 0 ? (
                  <div className="text-center py-6"><AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" /><p className="text-sm text-slate-500">No assets assigned</p></div>
                ) : (
                  <div className="space-y-4">
                    {employee.furnitureAssets.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1.5"><Armchair className="w-3.5 h-3.5 text-purple-500" />Furniture ({employee.furnitureAssets.length})</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {employee.furnitureAssets.map(a => (
                            <div key={a.id} className="bg-white p-2.5 rounded-lg border border-slate-100 flex items-center justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-slate-700 truncate">{a.assetName}</p>
                                <p className="text-[11px] text-slate-400">{a.assetTag || '-'}</p>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0">{getConditionBadge(a.condition)}{getStatusBadge(a.status)}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {employee.electronicAssets.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1.5"><Monitor className="w-3.5 h-3.5 text-blue-500" />Electronics ({employee.electronicAssets.length})</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {employee.electronicAssets.map(a => (
                            <div key={a.id} className="bg-white p-2.5 rounded-lg border border-slate-100 flex items-center justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-slate-700 truncate">{a.assetName}</p>
                                <p className="text-[11px] text-slate-400">{a.assetTag || '-'}</p>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0">{getConditionBadge(a.condition)}{getStatusBadge(a.status)}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {employee.vehicleAssets.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1.5"><Car className="w-3.5 h-3.5 text-emerald-500" />Vehicles ({employee.vehicleAssets.length})</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {employee.vehicleAssets.map(a => (
                            <div key={a.id} className="bg-white p-2.5 rounded-lg border border-slate-100 flex items-center justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-slate-700 truncate">{a.assetName}</p>
                                <p className="text-[11px] text-slate-400">{a.registrationNumber}</p>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0">{getConditionBadge(a.condition)}{getStatusBadge(a.status)}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {employees.length === 0 && (
        <div className="card p-12 text-center">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-base font-medium text-slate-600 mb-1">No employees found</p>
          <p className="text-sm text-slate-400">Try adjusting your search or filters</p>
        </div>
      )}
      </div>
    </DashboardLayout>
  );
}
