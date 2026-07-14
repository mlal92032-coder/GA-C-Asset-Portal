'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Plus, Edit, Trash2, Eye, Loader2, LucideIcon, X } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

export interface FormField {
  key: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select';
  required?: boolean;
  placeholder?: string;
  colSpan?: number;
  options?: { value: string; label: string }[];
}

export interface CrudItem {
  id: string;
  [key: string]: any;
}

interface CrudPageProps {
  title: string;
  subtitle: string;
  apiUrl: string;
  formFields: FormField[];
  tableColumns: { key: string; label: string; render?: (value: any, item: CrudItem) => React.ReactNode }[];
  icon: LucideIcon;
  getInitialFormData: () => Record<string, any>;
  gradientFrom?: string;
  gradientTo?: string;
  iconColor?: string;
  badgeLabel?: string;
  modalHeaderGradient?: string;
}

export default function CrudPage({
  title,
  subtitle,
  apiUrl,
  formFields,
  tableColumns,
  icon: Icon,
  getInitialFormData,
  gradientFrom = 'from-blue-100',
  gradientTo = 'to-indigo-100',
  iconColor = 'text-blue-600',
  badgeLabel = 'Administration',
  modalHeaderGradient = 'from-blue-600 to-indigo-600',
}: CrudPageProps) {
  const { data: session } = useSession();
  const canAddEditDelete = session?.user?.role === 'SUPER_ADMIN' || session?.user?.role === 'USER';
  const canDeleteItem = session?.user?.role === 'SUPER_ADMIN';

  const [items, setItems] = useState<CrudItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<CrudItem | null>(null);
  const [viewingItem, setViewingItem] = useState<CrudItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await fetch(apiUrl);
      const json = await res.json();
      if (json.success) setItems(json.data);
    } catch {
      showToast('Failed to fetch data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editingItem ? `${apiUrl}/${editingItem.id}` : apiUrl;
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();

      if (json.success) {
        showToast(json.message || `Item ${editingItem ? 'updated' : 'created'} successfully`, 'success');
        fetchItems();
        resetForm();
      } else {
        showToast(json.error, 'error');
      }
    } catch {
      showToast('An error occurred', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const res = await fetch(`${apiUrl}/${id}`, { method: 'DELETE' });
      const json = await res.json();

      if (json.success) {
        showToast('Item deleted successfully', 'success');
        fetchItems();
      } else {
        showToast(json.error, 'error');
      }
    } catch {
      showToast('An error occurred', 'error');
    }
  };

  const openEdit = (item: CrudItem) => {
    setEditingItem(item);
    const data: Record<string, any> = {};
    formFields.forEach((field) => {
      data[field.key] = item[field.key] || '';
    });
    setFormData(data);
    setShowModal(true);
  };

  const openCreate = () => {
    setEditingItem(null);
    setFormData(getInitialFormData());
    setShowModal(true);
  };

  const resetForm = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData(getInitialFormData());
  };

  const filteredItems = items;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={title}
        subtitle={subtitle}
        icon={Icon}
        badge={badgeLabel}
        gradientFrom={gradientFrom}
        gradientTo={gradientTo}
        iconColor={iconColor}
        actions={
          <button
            onClick={openCreate}
            className="btn btn-primary"
            disabled={!canAddEditDelete}
            title={!canAddEditDelete ? 'View Only access' : ''}
          >
            <Plus className="w-4 h-4" />
            Add {title.slice(0, -1)}
          </button>
        }
      />

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                {tableColumns.map((col) => (
                  <th key={col.key}>{col.label}</th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  {tableColumns.map((col) => (
                    <td key={col.key}>
                      {col.render ? col.render(item[col.key], item) : item[col.key] || '-'}
                    </td>
                  ))}
                  <td>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewingItem(item)}
                        className="btn btn-secondary btn-sm"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {canAddEditDelete && (
                        <>
                          <button
                            onClick={() => openEdit(item)}
                            className="btn btn-secondary btn-sm"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {canDeleteItem && (
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="btn btn-danger btn-sm"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </>
                      )}
                      {!canAddEditDelete && (
                        <span className="text-xs text-slate-400">View Only</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredItems.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Icon className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No {title.toLowerCase()} found</p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal w-full max-w-2xl mx-auto max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className={`sticky top-0 z-10 bg-gradient-to-r ${modalHeaderGradient} text-white px-6 py-4 rounded-t-lg`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">
                    {editingItem ? `Edit ${title.slice(0, -1)}` : `Create ${title.slice(0, -1)}`}
                  </h2>
                </div>
                <button onClick={resetForm} disabled={saving} className="text-white/70 hover:text-white transition-colors p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
              <div className="modal-body space-y-5 overflow-y-auto">
                {formFields.map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label} {field.required && <span className="text-red-600">*</span>}
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea
                        value={formData[field.key] || ''}
                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                        required={field.required}
                        placeholder={field.placeholder}
                        rows={3}
                      />
                    ) : field.type === 'select' ? (
                      <select
                        value={formData[field.key] || ''}
                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                        required={field.required}
                      >
                        <option value="">Select {field.label.toLowerCase()}</option>
                        {field.options?.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        value={formData[field.key] || ''}
                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                        required={field.required}
                        placeholder={field.placeholder}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="modal-footer">
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={resetForm} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="btn btn-primary">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editingItem ? 'Update' : 'Create'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewingItem && (
        <div className="modal-overlay" onClick={() => setViewingItem(null)}>
          <div className="modal w-full max-w-2xl mx-auto max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className={`sticky top-0 z-10 bg-gradient-to-r ${modalHeaderGradient} text-white px-6 py-4 rounded-t-lg`}>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">{title.slice(0, -1)} Details</h2>
                <button onClick={() => setViewingItem(null)} className="text-white/70 hover:text-white transition-colors p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="modal-body space-y-4">
              {formFields.map((field) => (
                <div key={field.key}>
                  <p className="text-sm text-gray-500">{field.label}</p>
                  <p className="font-medium">{viewingItem[field.key] || '-'}</p>
                </div>
              ))}
              {viewingItem.createdAt && (
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="font-medium">{new Date(viewingItem.createdAt).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
