'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import PageHeader from '@/components/PageHeader';
import FilterBar from '@/components/FilterBar';
import { buildImageUrl } from '@/lib/image-upload';
import {
  Plus,
  Eye,
  Loader2,
  Filter,
  X,
  Armchair,
  Monitor,
  Car,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Package,
} from 'lucide-react';

interface Asset {
  id: string;
  assetTag: string | null;
  assetName: string;
  serialNumber?: string | null;
  imageUrl: string | null;
  type: 'FURNITURE' | 'ELECTRONIC' | 'VEHICLE';
  condition: string;
  status: string;
  location?: string;
  locationId?: string;
  company?: string;
  companyId?: string;
  assignedTo?: string;
  assignedUserId?: string;
}

export default function AllAssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    condition: '',
    status: '',
    locationId: '',
    companyId: '',
    assignedUserId: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchAllAssets();
  }, [currentPage]);

  const fetchAllAssets = async () => {
    setLoading(true);
    try {
      const [furnitureRes, electronicsRes, vehiclesRes, companiesRes, locationsRes, usersRes] = await Promise.all([
        fetch('/api/furniture?page=1&limit=10000'),
        fetch('/api/electronics?page=1&limit=10000'),
        fetch('/api/vehicles?page=1&limit=10000'),
        fetch('/api/companies'),
        fetch('/api/locations'),
        fetch('/api/users'),
      ]);

      const furnitureJson = await furnitureRes.json();
      const electronicsJson = await electronicsRes.json();
      const vehiclesJson = await vehiclesRes.json();
      const companiesJson = await companiesRes.json();
      const locationsJson = await locationsRes.json();
      const usersJson = await usersRes.json();

      if (companiesJson.success) setCompanies(companiesJson.data);
      if (locationsJson.success) setLocations(locationsJson.data);
      if (usersJson.success) setUsers(usersJson.data);

      const allAssets: Asset[] = [
        ...(furnitureJson.data || []).map((a: any) => ({
          ...a,
          type: 'FURNITURE' as const,
          serialNumber: a.serialNumber,
          location: a.location?.locationName,
          locationId: a.locationId,
          company: a.company?.companyName,
          companyId: a.companyId,
          assignedTo: a.assignedUser?.fullName,
          assignedUserId: a.assignedUserId,
        })),
        ...(electronicsJson.data || []).map((a: any) => ({
          ...a,
          type: 'ELECTRONIC' as const,
          serialNumber: a.serialNumber,
          location: a.location?.locationName,
          locationId: a.locationId,
          company: a.company?.companyName,
          companyId: a.companyId,
          assignedTo: a.assignedUser?.fullName,
          assignedUserId: a.assignedUserId,
        })),
        ...(vehiclesJson.data || []).map((a: any) => ({
          ...a,
          type: 'VEHICLE' as const,
          serialNumber: a.serialNumber,
          location: a.location?.locationName,
          locationId: a.locationId,
          company: a.company?.companyName,
          companyId: a.companyId,
          assignedTo: a.assignedUser?.fullName,
          assignedUserId: a.assignedUserId,
        })),
      ];

      setTotalItems(allAssets.length);
      setAssets(allAssets);
    } catch (error) {
      console.error('Failed to fetch assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredAssets = () => {
    let filtered = assets;

    if (filters.type) {
      filtered = filtered.filter((a) => a.type === filters.type);
    }

    if (filters.condition) {
      filtered = filtered.filter((a) => a.condition === filters.condition);
    }

    if (filters.status) {
      filtered = filtered.filter((a) => a.status === filters.status);
    }

    if (filters.locationId) {
      filtered = filtered.filter((a) => a.locationId === filters.locationId);
    }

    if (filters.companyId) {
      filtered = filtered.filter((a) => a.companyId === filters.companyId);
    }

    if (filters.assignedUserId) {
      filtered = filtered.filter((a) => a.assignedUserId === filters.assignedUserId);
    }

    return filtered;
  };

  const filteredAssets = getFilteredAssets();
  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);
  const paginatedAssets = filteredAssets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'FURNITURE':
        return <Armchair className="w-4 h-4 text-purple-600" />;
      case 'ELECTRONIC':
        return <Monitor className="w-4 h-4 text-blue-600" />;
      case 'VEHICLE':
        return <Car className="w-4 h-4 text-orange-600" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'FURNITURE':
        return <span className="badge badge-purple">Furniture</span>;
      case 'ELECTRONIC':
        return <span className="badge badge-blue">Electronic</span>;
      case 'VEHICLE':
        return <span className="badge badge-orange">Vehicle</span>;
      default:
        return <span className="badge badge-secondary">{type}</span>;
    }
  };

  const conditionBadge = (condition: string) => {
    switch (condition) {
      case 'GOOD':
        return <span className="badge badge-success">Good</span>;
      case 'REPAIR':
        return <span className="badge badge-warning">Repair</span>;
      case 'DAMAGED':
        return <span className="badge badge-danger">Damaged</span>;
      default:
        return <span className="badge badge-secondary">{condition}</span>;
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'IN_USE':
        return <span className="badge badge-info">In Use</span>;
      case 'IN_STORE':
        return <span className="badge badge-success">In Store</span>;
      case 'DISPOSED':
        return <span className="badge badge-danger">Disposed</span>;
      case 'AUCTION':
        return <span className="badge badge-warning">Auction</span>;
      default:
        return <span className="badge badge-secondary">{status}</span>;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-slate-600">Loading all assets...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      currentPage={currentPage}
      totalPages={totalPages}
      itemsPerPage={itemsPerPage}
      totalItems={filteredAssets.length}
      onPageChange={setCurrentPage}
      onItemsPerPageChange={(perPage) => { setItemsPerPage(perPage); setCurrentPage(1); }}
    >
      <div className="max-w-7xl mx-auto">
      <PageHeader
        title="All Assets"
        subtitle="View and manage all assets across all categories"
        icon={Package}
        badge="Asset Management"
        gradientFrom="from-teal-100"
        gradientTo="to-cyan-100"
        iconColor="text-teal-600"
        stats={[{ label: 'Total Assets', value: assets.length }]}
      />

      <FilterBar
        hasActiveFilters={!!(filters.type || filters.condition || filters.status || filters.locationId || filters.companyId || filters.assignedUserId)}
        onClearFilters={() => {
          setFilters({ type: '', condition: '', status: '', locationId: '', companyId: '', assignedUserId: '' });
          setCurrentPage(1);
        }}
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-0.5">Type</label>
            <select
              value={filters.type}
              onChange={(e) => { setFilters({ ...filters, type: e.target.value }); setCurrentPage(1); }}
              className="py-1.5 text-sm"
            >
              <option value="">All Types</option>
              <option value="FURNITURE">Furniture</option>
              <option value="ELECTRONIC">Electronic</option>
              <option value="VEHICLE">Vehicle</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-0.5">Condition</label>
            <select
              value={filters.condition}
              onChange={(e) => { setFilters({ ...filters, condition: e.target.value }); setCurrentPage(1); }}
              className="py-1.5 text-sm"
            >
              <option value="">All Conditions</option>
              <option value="GOOD">Good</option>
              <option value="REPAIR">Repair</option>
              <option value="DAMAGED">Damaged</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-0.5">Status</label>
            <select
              value={filters.status}
              onChange={(e) => { setFilters({ ...filters, status: e.target.value }); setCurrentPage(1); }}
              className="py-1.5 text-sm"
            >
              <option value="">All Status</option>
              <option value="IN_USE">In Use</option>
              <option value="IN_STORE">In Store</option>
              <option value="DISPOSED">Disposed</option>
              <option value="AUCTION">Auction</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-0.5">Location</label>
            <select
              value={filters.locationId}
              onChange={(e) => { setFilters({ ...filters, locationId: e.target.value }); setCurrentPage(1); }}
              className="py-1.5 text-sm"
            >
              <option value="">All Locations</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>{loc.locationName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-0.5">Company</label>
            <select
              value={filters.companyId}
              onChange={(e) => { setFilters({ ...filters, companyId: e.target.value }); setCurrentPage(1); }}
              className="py-1.5 text-sm"
            >
              <option value="">All Companies</option>
              {companies.map((comp) => (
                <option key={comp.id} value={comp.id}>{comp.companyName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-0.5">Assigned To</label>
            <select
              value={filters.assignedUserId}
              onChange={(e) => { setFilters({ ...filters, assignedUserId: e.target.value }); setCurrentPage(1); }}
              className="py-1.5 text-sm"
            >
              <option value="">All Users</option>
              {users.filter((u) => u.status === 'ACTIVE').map((user) => (
                <option key={user.id} value={user.id}>{user.fullName}</option>
              ))}
            </select>
          </div>
        </div>
      </FilterBar>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>SN</th>
                <th>Image</th>
                <th>Type</th>
                <th>Asset Name</th>
                <th>Asset Tag</th>
                <th>Condition</th>
                <th>Status</th>
                <th>Location</th>
                <th>Company</th>
                <th>Assigned To</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAssets.map((asset, index) => (
                <tr key={asset.id}>
                  <td className="font-medium text-gray-600">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td>
                    {buildImageUrl(asset.imageUrl) ? (
                      <img
                        src={buildImageUrl(asset.imageUrl)!}
                        alt={asset.assetName}
                        className="w-12 h-12 object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-slate-100 flex items-center justify-center">
                        {getTypeIcon(asset.type)}
                      </div>
                    )}
                  </td>
                  <td>{getTypeBadge(asset.type)}</td>
                  <td className="font-medium">{asset.assetName}</td>
                  <td className="font-mono text-sm">{asset.assetTag || '-'}</td>
                  <td>{conditionBadge(asset.condition)}</td>
                  <td>{statusBadge(asset.status)}</td>
                  <td>{asset.location || '-'}</td>
                  <td>{asset.company || '-'}</td>
                  <td>
                    {asset.assignedTo ? (
                      <span className="text-slate-900 font-medium">
                        {asset.assignedTo}
                      </span>
                    ) : (
                      <span className="text-gray-400">Unassigned</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAssets.length === 0 && (
          <div className="empty-state border-t border-slate-100">
            <Package className="w-20 h-20 text-slate-300 mb-4" />
            <p className="empty-state-title text-lg font-semibold text-slate-600">No assets found</p>
            <p className="empty-state-text mt-1">Add assets from their respective pages</p>
          </div>
        )}
      </div>
      </div>
    </DashboardLayout>
  );
}
