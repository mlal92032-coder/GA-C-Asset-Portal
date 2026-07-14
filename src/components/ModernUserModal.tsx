'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, User, AlertCircle, CheckSquare, Square, ChevronDown, ChevronRight,
  Crown, Users, EyeIcon, Loader2,
} from 'lucide-react';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useToast } from '@/contexts/ToastContext';
import {
  MODULES, MODULE_LABELS, MODULE_ICONS,
  getAvailableActions, ACTION_LABELS,
  type Module, type PermissionAction,
} from '@/lib/permissions';

const userSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(255),
  email: z.string().email('Invalid email address'),
  password: z.string().refine(v => v.length === 0 || v.length >= 6, 'Password must be at least 6 characters'),
  phone: z.string(),
  department: z.string(),
  designation: z.string(),
  status: z.enum(['ACTIVE', 'INACTIVE']),
});

type UserFormData = z.infer<typeof userSchema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  editingUser?: Record<string, unknown> | null;
  saving: boolean;
}

export default function ModernUserModal({ isOpen, onClose, onSave, editingUser, saving }: Props) {
  const [role, setRole] = useState('USER');
  const [showPassword, setShowPassword] = useState(false);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [modulePermissions, setModulePermissions] = useState<Record<string, string[]>>({});
  const { success, error } = useToast();

  const modalRef = useFocusTrap({ isOpen, onClose });

  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
    reset,
    watch,
    setValue,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    mode: 'onChange',
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      phone: '',
      department: '',
      designation: '',
      status: 'ACTIVE',
    },
  });

  const fullNameValue = watch('fullName');

  const generateEmailFromName = (name: string): string => {
    const cleaned = name.trim().toLowerCase().replace(/\s+/g, '.');
    return `${cleaned}@sef.org.pk`;
  };

  useEffect(() => {
    if (!isOpen) return;
    reset();
    setRole('USER');
    setExpandedModules([]);
    setModulePermissions({});

    if (editingUser && editingUser.id) {
      reset({
        fullName: (editingUser.fullName as string) || '',
        email: (editingUser.email as string) || '',
        password: '',
        phone: (editingUser.phone as string) || '',
        department: (editingUser.department as string) || '',
        designation: (editingUser.designation as string) || '',
        status: (editingUser.status as 'ACTIVE' | 'INACTIVE') || 'ACTIVE',
      });
      setRole((editingUser.role as string) || 'USER');
      try {
        const raw = editingUser.permissions as string;
        if (raw) {
          const p = JSON.parse(raw);
          setModulePermissions(p);
          setExpandedModules(Object.keys(p).filter((m: string) => p[m]?.length > 0));
        }
      } catch {
        setModulePermissions({});
        setExpandedModules([]);
      }
    }
  }, [editingUser, isOpen, reset]);

  const toggleExpand = (m: string) => setExpandedModules(p => p.includes(m) ? p.filter(x => x !== m) : [...p, m]);
  const toggleAction = (m: string, a: string) => setModulePermissions(p => { const c = [...(p[m] || [])]; if (c.includes(a)) { const f = c.filter(x => x !== a); if (!f.length) { const n = { ...p }; delete n[m]; return n; } return { ...p, [m]: f }; } return { ...p, [m]: [...c, a] }; });

  const onSubmit = async (data: UserFormData) => {
    try {
      await onSave({
        fullName: data.fullName,
        email: data.email,
        password: data.password || undefined,
        role,
        status: data.status,
        department: data.department || null,
        designation: data.designation || null,
        phone: data.phone || null,
        permissions: Object.keys(modulePermissions).length > 0 ? modulePermissions : null,
      });
      success(editingUser ? 'User updated successfully' : 'User created successfully');
      reset();
    } catch (err: any) {
      error(err?.message || (editingUser ? 'Failed to update user' : 'Failed to create user'));
    }
  };

  if (!isOpen) return null;

  const roleCards = [
    { id: 'SUPER_ADMIN', label: 'Super Admin', desc: 'Full unrestricted access to all features and settings', icon: Crown, color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
    { id: 'USER', label: 'User', desc: 'Access based on assigned module permissions', icon: Users, color: 'from-blue-500 to-indigo-500', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
    { id: 'VIEW_USER', label: 'View Only', desc: 'Can view all data but cannot make any changes', icon: EyeIcon, color: 'from-slate-500 to-slate-600', bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay" onClick={onClose}>
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="modal w-full max-w-2xl mx-auto max-h-[90vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-4 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{editingUser ? 'Edit User' : 'Add New User'}</h2>
                    <p className="text-sm text-indigo-100 mt-0.5">{editingUser ? 'Update user details and permissions' : 'Create a new user account'}</p>
                  </div>
                </div>
                <button onClick={onClose} disabled={saving} className="text-white/70 hover:text-white transition-colors p-1"><X className="w-5 h-5" /></button>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
              <div className="modal-body space-y-5 overflow-y-auto">
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Full Name <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        {...register('fullName')}
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                          formErrors.fullName ? 'border-red-500 focus:ring-red-500/10' : 'border-slate-200'
                        }`}
                        placeholder="John Doe"
                        disabled={saving}
                        onBlur={(e) => {
                          if (!editingUser && e.target.value.trim()) {
                            setValue('email', generateEmailFromName(e.target.value));
                          }
                        }}
                      />
                      {formErrors.fullName && (
                        <motion.p
                          className="text-xs text-red-500 mt-1 flex items-center gap-1"
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <AlertCircle className="w-3 h-3" />
                          {formErrors.fullName.message}
                        </motion.p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Email <span className="text-red-500">*</span></label>
                      <input
                        type="email"
                        {...register('email')}
                        autoComplete="off"
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                          formErrors.email ? 'border-red-500 focus:ring-red-500/10' : 'border-slate-200'
                        }`}
                        placeholder="john@sef.com"
                        disabled={saving || !!editingUser}
                      />
                      {formErrors.email && (
                        <motion.p
                          className="text-xs text-red-500 mt-1 flex items-center gap-1"
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <AlertCircle className="w-3 h-3" />
                          {formErrors.email.message}
                        </motion.p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">{editingUser ? 'New Password' : 'Password'} {!editingUser && <span className="text-red-500">*</span>}</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          {...register('password')}
                          autoComplete="new-password"
                          className={`w-full px-4 py-2.5 pr-10 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                            formErrors.password ? 'border-red-500 focus:ring-red-500/10' : 'border-slate-200'
                          }`}
                          placeholder={editingUser ? 'Leave blank' : 'Min 6 chars'}
                          disabled={saving}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? '👁️' : '🔒'}
                        </button>
                      </div>
                      {formErrors.password && (
                        <motion.p
                          className="text-xs text-red-500 mt-1 flex items-center gap-1"
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <AlertCircle className="w-3 h-3" />
                          {formErrors.password.message}
                        </motion.p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Phone</label>
                      <input
                        type="tel"
                        {...register('phone')}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        placeholder="+92 300 1234567"
                        disabled={saving}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Department</label>
                      <input
                        type="text"
                        {...register('department')}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        placeholder="e.g., IT, Finance"
                        disabled={saving}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Designation</label>
                      <input
                        type="text"
                        {...register('designation')}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        placeholder="e.g., Manager"
                        disabled={saving}
                      />
                    </div>
                  </div>
                </div>

                {/* Role Cards */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Role</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {roleCards.map(card => (
                      <button
                        key={card.id}
                        type="button"
                        onClick={() => setRole(card.id)}
                        disabled={saving}
                        className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                          role === card.id
                            ? `${card.bg} ${card.border} shadow-sm`
                            : 'border-slate-100 hover:border-slate-200 bg-white'
                        }`}
                      >
                        <div className={`w-9 h-9 bg-gradient-to-br ${card.color} rounded-lg flex items-center justify-center mb-3`}>
                          <card.icon className="w-4 h-4 text-white" />
                        </div>
                        <p className={`text-sm font-semibold mb-1 ${role === card.id ? card.text : 'text-slate-700'}`}>{card.label}</p>
                        <p className="text-[11px] text-slate-500 leading-relaxed">{card.desc}</p>
                        {role === card.id && (
                          <div className="absolute top-3 right-3 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <CheckSquare className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Status</label>
                  <select
                    {...register('status')}
                    disabled={saving}
                    className="max-w-[200px] px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>

                {/* Permissions (only for USER role) */}
                {role === 'USER' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="border-t border-slate-200 pt-5">
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Module Permissions</label>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => { const np: Record<string, string[]> = {}; MODULES.forEach(m => np[m] = ['view']); setModulePermissions(np); setExpandedModules([...MODULES]); }} disabled={saving} className="text-[11px] px-2.5 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium">Grant View All</button>
                          <button type="button" onClick={() => { setModulePermissions({}); setExpandedModules([]); }} disabled={saving} className="text-[11px] px-2.5 py-1.5 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200 transition-colors font-medium">Clear All</button>
                        </div>
                      </div>
                      <div className="space-y-1 max-h-[300px] overflow-y-auto">
                        {MODULES.map(mod => {
                          const expanded = expandedModules.includes(mod);
                          const actions = getAvailableActions(mod);
                          const selected = modulePermissions[mod] || [];
                          const count = selected.length;
                          return (
                            <div key={mod} className={`rounded-lg border transition-colors ${count > 0 ? 'bg-blue-50/50 border-blue-200' : 'border-slate-100 hover:border-slate-200'}`}>
                              <button type="button" onClick={() => toggleExpand(mod)} disabled={saving} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left">
                                {expanded ? <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />}
                                <span className="text-base flex-shrink-0">{MODULE_ICONS[mod]}</span>
                                <span className="flex-1 text-sm font-medium text-slate-700">{MODULE_LABELS[mod]}</span>
                                {count > 0 && <span className="text-[10px] font-semibold bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">{count}/{actions.length}</span>}
                                {count === 0 && <span className="text-[10px] text-slate-400">No access</span>}
                              </button>
                              <AnimatePresence>
                                {expanded && (
                                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                                    <div className="px-10 pb-3 flex flex-wrap gap-2">
                                      {actions.map(action => {
                                        const checked = selected.includes(action);
                                        return (
                                          <button key={action} type="button" onClick={() => toggleAction(mod, action)} disabled={saving}
                                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-medium border transition-all ${
                                              checked ? 'bg-blue-100 border-blue-300 text-blue-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'
                                            }`}>
                                            {checked ? <CheckSquare className="w-3 h-3" /> : <Square className="w-3 h-3" />}
                                            {ACTION_LABELS[action as PermissionAction]}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>
                      {!Object.keys(modulePermissions).length && (
                        <p className="text-xs text-amber-600 mt-3 flex items-center gap-1.5 font-medium"><AlertCircle className="w-3.5 h-3.5" />No permissions assigned — user will only see Dashboard.</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Footer */}
              <div className="modal-footer">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    {role === 'USER' && Object.keys(modulePermissions).length > 0 && `${Object.keys(modulePermissions).length} module${Object.keys(modulePermissions).length !== 1 ? 's' : ''} configured`}
                  </span>
                  <div className="flex gap-3">
                    <button type="button" onClick={onClose} disabled={saving} className="btn btn-secondary">Cancel</button>
                    <button type="submit" disabled={saving} className="btn btn-primary">
                      {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : <>{editingUser ? 'Update User' : 'Create User'}</>}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}