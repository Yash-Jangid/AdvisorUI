'use client';

import React, { useState } from 'react';
import { ShieldCheck, Plus, Pencil, Trash2 } from 'lucide-react';
import { Text } from '@/components/atoms/Text';
import { useRoles } from '@/lib/api/hooks/useRoles';
import { type Role } from '@/lib/api/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils/cn';

export default function RolesAdminPage() {
  const { roles, isLoadingAll } = useRoles();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
        
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Text variant="h2" className="flex items-center gap-2">
              <ShieldCheck className="text-primary" size={28} />
              Dynamic Roles
            </Text>
            <Text variant="body" className="mt-1 text-text-secondary">
              Manage hierarchy levels, commission defaults, and role access dynamically.
            </Text>
          </div>
          <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-white transition-colors hover:bg-primary/90">
            <Plus size={18} />
            Create Role
          </button>
        </div>

        {/* Roles Table */}
        <div className="glass-card overflow-hidden rounded-2xl border border-border p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-background-tertiary text-xs uppercase text-text-secondary">
                <tr>
                  <th className="px-6 py-4 font-medium">Level</th>
                  <th className="px-6 py-4 font-medium">Display Name</th>
                  <th className="px-6 py-4 font-medium">Internal Name</th>
                  <th className="px-6 py-4 font-medium text-center">Can Have Downline</th>
                  <th className="px-6 py-4 font-medium text-right">Default Comm.</th>
                  <th className="px-6 py-4 font-medium text-center">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoadingAll ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-text-secondary">
                      Loading roles...
                    </td>
                  </tr>
                ) : roles.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-text-secondary">
                      No roles found. You need to run the database migration.
                    </td>
                  </tr>
                ) : (
                  roles.map((role) => (
                    <tr
                      key={role.id}
                      className="transition-colors hover:bg-background-tertiary/50"
                    >
                      <td className="px-6 py-4 text-center font-bold text-text-primary">
                        {role.level}
                      </td>
                      <td className="px-6 py-4 text-primary font-medium">
                        {role.displayName}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-text-secondary">
                        {role.name}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {role.canHaveChild ? (
                          <span className="rounded bg-green-500/10 px-2 py-1 text-xs font-medium text-green-500">
                            Yes
                          </span>
                        ) : (
                          <span className="rounded bg-red-500/10 px-2 py-1 text-xs font-medium text-red-500">
                            No
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {(role.defaultCommissionPct * 100).toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 text-center">
                        {role.isActive ? (
                          <span className="rounded bg-green-500/10 px-2 py-1 text-xs font-medium text-green-500">
                            Active
                          </span>
                        ) : (
                          <span className="rounded bg-red-500/10 px-2 py-1 text-xs font-medium text-red-500">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            className="p-2 text-text-tertiary transition-colors hover:bg-background-tertiary hover:text-text-primary rounded"
                            onClick={() => toast('Edit coming soon')}
                          >
                            <Pencil size={16} />
                          </button>
                          <button 
                            className="p-2 rounded text-red-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                            onClick={() => toast('Delete coming soon')}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

    </div>
  );
}
