'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import axios from 'axios'
import { Button } from '@/components/ui'
import { toast } from 'sonner'
import {
  Loader2,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Users,
  Shield,
  CheckCircle2,
  Circle,
} from 'lucide-react'
import { getPermissionGroups, PERMISSIONS } from '@/lib/advanced-permissions'

const CreateRoleSchema = z.object({
  name: z.string().min(1, 'Role name is required').max(100),
  description: z.string().optional(),
  permissions: z.array(z.string()).default([]),
})

type CreateRoleData = z.infer<typeof CreateRoleSchema>

interface CustomRole {
  id: string
  name: string
  description?: string
  permissions: string[]
  isActive: boolean
  userCount: number
  createdAt: string
  createdBy: { fullName: string }
}

const permissionGroups = getPermissionGroups()

export default function RolesPage() {
  const [roles, setRoles] = useState<CustomRole[]>([])
  const [loading, setLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<CreateRoleData>({
    resolver: zodResolver(CreateRoleSchema),
    defaultValues: {
      name: '',
      description: '',
      permissions: [],
    },
  })

  // Fetch roles on mount
  useEffect(() => {
    fetchRoles()
  }, [])

  const fetchRoles = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/admin/roles')
      setRoles(response.data.data || [])
    } catch (error) {
      console.error('Error fetching roles:', error)
      toast.error('Failed to load roles')
    } finally {
      setLoading(false)
    }
  }

  const onCreateRole = async (data: CreateRoleData) => {
    try {
      setLoading(true)

      await axios.post('/api/admin/roles', {
        name: data.name,
        description: data.description,
        permissions: selectedPermissions,
      })

      toast.success('Role created successfully')
      reset()
      setSelectedPermissions([])
      setShowCreateForm(false)
      fetchRoles()
    } catch (error) {
      console.error('Error creating role:', error)
      toast.error('Failed to create role')
    } finally {
      setLoading(false)
    }
  }

  const onDeleteRole = async (roleId: string) => {
    try {
      setDeletingId(roleId)
      await axios.delete(`/api/admin/roles/${roleId}`)
      toast.success('Role deleted successfully')
      fetchRoles()
    } catch (error) {
      console.error('Error deleting role:', error)
      toast.error('Failed to delete role')
    } finally {
      setDeletingId(null)
    }
  }

  const togglePermission = (permission: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    )
  }

  const toggleAllPermissionsInGroup = (groupPermissions: string[]) => {
    const allSelected = groupPermissions.every(p => selectedPermissions.includes(p))

    if (allSelected) {
      setSelectedPermissions(prev =>
        prev.filter(p => !groupPermissions.includes(p))
      )
    } else {
      const missingPermissions = groupPermissions.filter(
        p => !selectedPermissions.includes(p)
      )
      setSelectedPermissions(prev => [...prev, ...missingPermissions])
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold">Role Management</h1>
          </div>
          {!showCreateForm && (
            <Button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Create Role
            </Button>
          )}
        </div>

        {/* Create Role Form */}
        {showCreateForm && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 mb-2 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold">Create New Role</h2>
              <button
                onClick={() => {
                  setShowCreateForm(false)
                  setSelectedPermissions([])
                  reset()
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onCreateRole)} className="space-y-2">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Role Name *
                </label>
                <input
                  {...register('name')}
                  placeholder="e.g., Asset Manager, Finance Officer"
                  className="w-full px-4 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  placeholder="Describe the purpose of this role..."
                  className="w-full px-4 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent h-20 resize-none"
                />
              </div>

              {/* Permissions */}
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                  Permissions
                </h3>

                <div className="space-y-2">
                  {Object.entries(permissionGroups).map(([groupKey, group]) => {
                    const groupPermissions = group.permissions.filter(p => typeof p === 'string')
                    const allSelected = groupPermissions.every(p => selectedPermissions.includes(p))

                    return (
                      <div
                        key={groupKey}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <button
                            type="button"
                            onClick={() => toggleAllPermissionsInGroup(groupPermissions)}
                            className="flex items-center gap-1.5 hover:opacity-80"
                          >
                            {allSelected ? (
                              <CheckCircle2 className="h-5 w-5 text-blue-600" />
                            ) : (
                              <Circle className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                          <label className="font-medium text-gray-900 dark:text-white cursor-pointer">
                            {group.label}
                          </label>
                        </div>

                        <div className="ml-8 grid grid-cols-1 md:grid-cols-2 gap-2">
                          {groupPermissions.map(permission => (
                            <label
                              key={permission}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={selectedPermissions.includes(permission)}
                                onChange={() => togglePermission(permission)}
                                className="w-4 h-4 text-blue-600 rounded"
                              />
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {permission.replace(/[._]/g, ' ').toUpperCase()}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={loading || selectedPermissions.length === 0}
                  className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  <Save className="h-4 w-4" />
                  Create Role
                </Button>

                <Button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false)
                    setSelectedPermissions([])
                    reset()
                  }}
                  className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Roles List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : roles.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-12 text-center border border-gray-200 dark:border-gray-700">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 dark:text-gray-400 mb-2">No custom roles created yet</p>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Create First Role
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map(role => (
              <div
                key={role.id}
                className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
              >
                <div className="mb-2">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                    {role.name}
                  </h3>
                  {role.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {role.description}
                    </p>
                  )}
                </div>

                <div className="space-y-2 mb-2">
                  <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                    <Users className="h-4 w-4" />
                    <span>{role.userCount} user(s) assigned</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                    <Shield className="h-4 w-4" />
                    <span>{role.permissions.length} permission(s)</span>
                  </div>
                </div>

                <div className="mb-2">
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Created by: {role.createdBy.fullName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {new Date(role.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex gap-1.5">
                  <Button
                    disabled={true}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 cursor-not-allowed opacity-50"
                    size="sm"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit (Coming Soon)
                  </Button>

                  <Button
                    onClick={() => onDeleteRole(role.id)}
                    disabled={role.userCount > 0 || deletingId === role.id}
                    className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    size="sm"
                  >
                    {deletingId === role.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {role.userCount > 0 && (
                  <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                    Cannot delete while users are assigned
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

