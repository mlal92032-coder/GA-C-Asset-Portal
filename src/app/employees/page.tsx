'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/DashboardLayout';
import PageHeader from '@/components/PageHeader';
import FilterBar from '@/components/FilterBar';
import {
  Users, Search, ChevronDown, ChevronUp, Package,
  Armchair, Monitor, Car, MapPin, AlertCircle, UserCheck, Building2,
} from 'lucide-react';

interface Asset {
  id: string;
  assetTag: string | null;
  serialNumber?: string | null;
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
  const router = useRouter();
  const { data: session } = useSession();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterOffice, setFilterOffice] = useState<string>('');
  const [filterDepartment, setFilterDepartment] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
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

  const offices = Array.from(new Set(employees.map(e => 'Company').filter((o): o is string => !!o)));
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
          <div className="text-center"><div className="spinner mx-auto mb-2" /><p className="text-sm text-slate-500">Loading employees...</p></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="w-full max-w-full px-1.5 sm:px-2 lg:px-3 overflow-x-hidden">
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

      <FilterBar
        hasActiveFilters={!!(search || filterStatus || filterDepartment || filterOffice)}
        onClearFilters={() => { setSearch(''); setFilterStatus(''); setFilterDepartment(''); setFilterOffice(''); }}
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-0.5">Search</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="pl-8 py-1.5 text-sm w-full" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-0.5">Office</label>
            <select value={filterOffice} onChange={e => setFilterOffice(e.target.value)} className="py-1.5 text-sm">
              <option value="">All</option>
              <option value="Company">Company</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-0.5">Department</label>
            <select value={filterDepartment} onChange={e => setFilterDepartment(e.target.value)} className="py-1.5 text-sm">
              <option value="">All</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-0.5">Status</label>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="py-1.5 text-sm">
              <option value="">All</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>
      </FilterBar>

      {/* Employee List */}
      <div className="space-y-2">
        {employees.map((employee, empIdx) => (
          <div key={employee.id} className="card overflow-hidden">
            <div className="p-3 cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-colors" onClick={() => toggleEmployee(employee.id)}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5.5 flex-1 min-w-0">
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-violet-600 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0">{empIdx + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-bold text-slate-900 truncate">{empIdx + 1}. {employee.fullName}</span>
                      <span className={`badge text-xs ${employee.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>{employee.status === 'ACTIVE' ? '✓ Active' : '✗ Inactive'}</span>
                      {employee.role === 'SUPER_ADMIN' && <span className="badge badge-blue text-xs">Admin</span>}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600 mt-1">
                      <span><strong>Dept:</strong> {employee.department || '-'}</span>
                      <span><strong>Designation:</strong> {employee.designation || '-'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-600">{employee.totalAssets}</p>
                    <p className="text-xs text-slate-400">Assets</p>
                  </div>
                  {expandedEmployee === employee.id ? <ChevronUp className="w-4 h-4 text-blue-600" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
              </div>
            </div>

            {expandedEmployee === employee.id && (
              <div className="border-t-2 border-blue-200 bg-gradient-to-b from-blue-50/50 to-white p-6">
                {employee.totalAssets === 0 ? (
                  <div className="text-center py-8"><AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" /><p className="text-sm text-slate-500">No assets assigned</p></div>
                ) : (
                  <div className="space-y-2">
                    {employee.furnitureAssets.length > 0 && (
                      <div>
                        <div className="flex items-center gap-1.5 mb-2 pb-3 border-b-2 border-purple-300">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Armchair className="w-4 h-4 text-white" />
                          </div>
                          <h4 className="text-sm font-bold text-slate-900">Furniture Assets</h4>
                          <span className="ml-auto text-xs font-semibold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">{employee.furnitureAssets.length} items</span>
                        </div>
                        <div className="space-y-2.5">
                          {employee.furnitureAssets.map((a) => (
                            <div key={a.id} onClick={() => router.push(`/assets/furniture/${a.id}`)} className="bg-gradient-to-r from-white to-purple-50 p-4 rounded-lg border-2 border-purple-200 hover:border-purple-500 hover:shadow-lg hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100 transition-all cursor-pointer">
                              <div className="flex items-start gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-1.5 mb-2">
                                    <div>
                                      <p className="text-sm font-bold text-slate-900">{a.assetName}</p>
                                    </div>
                                    <div className="flex items-center gap-1 flex-shrink-0">{getConditionBadge(a.condition)}{getStatusBadge(a.status)}</div>
                                  </div>
                                  <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                                    <div>
                                      <p className="text-slate-500 font-semibold">Serial No.</p>
                                      <p className="text-slate-800 font-mono font-bold">{a.serialNumber || '-'}</p>
                                    </div>
                                    <div>
                                      <p className="text-slate-500 font-semibold">Asset Tag</p>
                                      <p className="text-slate-800 font-mono font-bold">{a.assetTag || '-'}</p>
                                    </div>
                                    <div>
                                      <p className="text-slate-500 font-semibold">Location</p>
                                      <p className="text-slate-800 font-bold">{a.location?.locationName || '-'}</p>
                                    </div>
                                  </div>
                                  <p className="text-xs text-blue-600 font-medium hover:text-blue-800">Click for details →</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {employee.electronicAssets.length > 0 && (
                      <div>
                        <div className="flex items-center gap-1.5 mb-2 pb-3 border-b-2 border-blue-300">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <Monitor className="w-4 h-4 text-white" />
                          </div>
                          <h4 className="text-sm font-bold text-slate-900">Electronics Assets</h4>
                          <span className="ml-auto text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">{employee.electronicAssets.length} items</span>
                        </div>
                        <div className="space-y-2.5">
                          {employee.electronicAssets.map((a) => (
                            <div key={a.id} onClick={() => router.push(`/assets/electronics/${a.id}`)} className="bg-gradient-to-r from-white to-blue-50 p-4 rounded-lg border-2 border-blue-200 hover:border-blue-500 hover:shadow-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 transition-all cursor-pointer">
                              <div className="flex items-start gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-1.5 mb-2">
                                    <div>
                                      <p className="text-sm font-bold text-slate-900">{a.assetName}</p>
                                      {(a.brand || a.model) && <p className="text-xs text-slate-500 mt-0.5">{a.brand} {a.model}</p>}
                                    </div>
                                    <div className="flex items-center gap-1 flex-shrink-0">{getConditionBadge(a.condition)}{getStatusBadge(a.status)}</div>
                                  </div>
                                  <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                                    <div>
                                      <p className="text-slate-500 font-semibold">Serial No.</p>
                                      <p className="text-slate-800 font-mono font-bold">{a.serialNumber || '-'}</p>
                                    </div>
                                    <div>
                                      <p className="text-slate-500 font-semibold">Asset Tag</p>
                                      <p className="text-slate-800 font-mono font-bold">{a.assetTag || '-'}</p>
                                    </div>
                                    <div>
                                      <p className="text-slate-500 font-semibold">Location</p>
                                      <p className="text-slate-800 font-bold">{a.location?.locationName || '-'}</p>
                                    </div>
                                  </div>
                                  <p className="text-xs text-blue-600 font-medium hover:text-blue-800">Click for details →</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {employee.vehicleAssets.length > 0 && (
                      <div>
                        <div className="flex items-center gap-1.5 mb-2 pb-3 border-b-2 border-emerald-300">
                          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                            <Car className="w-4 h-4 text-white" />
                          </div>
                          <h4 className="text-sm font-bold text-slate-900">Vehicle Assets</h4>
                          <span className="ml-auto text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">{employee.vehicleAssets.length} items</span>
                        </div>
                        <div className="space-y-2.5">
                          {employee.vehicleAssets.map((a) => (
                            <div key={a.id} onClick={() => router.push(`/assets/vehicles/${a.id}`)} className="bg-gradient-to-r from-white to-emerald-50 p-4 rounded-lg border-2 border-emerald-200 hover:border-emerald-500 hover:shadow-lg hover:bg-gradient-to-r hover:from-emerald-50 hover:to-emerald-100 transition-all cursor-pointer">
                              <div className="flex items-start gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-1.5 mb-2">
                                    <div>
                                      <p className="text-sm font-bold text-slate-900">{a.assetName}</p>
                                      {(a.brand || a.model) && <p className="text-xs text-slate-500 mt-0.5">{a.brand} {a.model}</p>}
                                    </div>
                                    <div className="flex items-center gap-1 flex-shrink-0">{getConditionBadge(a.condition)}{getStatusBadge(a.status)}</div>
                                  </div>
                                  <div className="grid grid-cols-4 gap-2 text-xs mb-2">
                                    <div>
                                      <p className="text-slate-500 font-semibold">Serial No.</p>
                                      <p className="text-slate-800 font-mono font-bold">{a.serialNumber || '-'}</p>
                                    </div>
                                    <div>
                                      <p className="text-slate-500 font-semibold">Reg No.</p>
                                      <p className="text-slate-800 font-mono font-bold">{a.registrationNumber}</p>
                                    </div>
                                    <div>
                                      <p className="text-slate-500 font-semibold">Type</p>
                                      <p className="text-slate-800 font-bold">{a.vehicleType || '-'}</p>
                                    </div>
                                    <div>
                                      <p className="text-slate-500 font-semibold">Location</p>
                                      <p className="text-slate-800 font-bold">{a.location?.locationName || '-'}</p>
                                    </div>
                                  </div>
                                  <p className="text-xs text-blue-600 font-medium hover:text-blue-800">Click for details →</p>
                                </div>
                              </div>
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
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <p className="text-base font-medium text-slate-600 mb-1">No employees found</p>
          <p className="text-sm text-slate-400">Try adjusting your search or filters</p>
        </div>
      )}
      </div>
    </DashboardLayout>
  );
}
