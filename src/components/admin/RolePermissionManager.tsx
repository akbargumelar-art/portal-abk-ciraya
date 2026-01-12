/**
 * Role Permission Manager Component
 * 
 * Allows admin_super to configure which pages each role can access.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Save, RotateCcw, Shield, Check, ChevronDown, ChevronRight } from 'lucide-react';
import { Card, Button, Badge } from '../ui/index';
import { permissionService, getAllPages } from '../../services/permission.service';
import { getRoleDisplayName } from '../../data/mockUsers';
import type { UserRole } from '../../types';
import type { RolePermissions, PagePermission } from '../../services/permission.service';

// ============================================================================
// ROLE CARD
// ============================================================================

interface RoleCardProps {
    role: UserRole;
    permissions: string[];
    allPages: PagePermission[];
    onTogglePage: (pageId: string) => void;
    onSelectAll: () => void;
    onDeselectAll: () => void;
    isExpanded: boolean;
    onToggleExpand: () => void;
}

const RoleCard: React.FC<RoleCardProps> = ({
    role,
    permissions,
    allPages,
    onTogglePage,
    onSelectAll,
    onDeselectAll,
    isExpanded,
    onToggleExpand,
}) => {
    // Group pages by parent
    const groupedPages = useMemo(() => {
        const groups: Record<string, PagePermission[]> = {};

        allPages.forEach(page => {
            const group = page.parentLabel || 'Menu Utama';
            if (!groups[group]) {
                groups[group] = [];
            }
            groups[group].push(page);
        });

        return groups;
    }, [allPages]);

    const selectedCount = permissions.length;
    const totalCount = allPages.length;

    return (
        <Card className="overflow-hidden">
            {/* Header */}
            <button
                onClick={onToggleExpand}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <Shield size={20} className="text-blue-600" />
                    </div>
                    <div className="text-left">
                        <h3 className="font-semibold text-gray-900">
                            {getRoleDisplayName(role)}
                        </h3>
                        <p className="text-sm text-gray-500">
                            {selectedCount} dari {totalCount} halaman
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant={selectedCount === totalCount ? 'success' : 'neutral'}>
                        {Math.round((selectedCount / totalCount) * 100)}% akses
                    </Badge>
                    {isExpanded ? (
                        <ChevronDown size={20} className="text-gray-400" />
                    ) : (
                        <ChevronRight size={20} className="text-gray-400" />
                    )}
                </div>
            </button>

            {/* Content */}
            {isExpanded && (
                <div className="border-t border-gray-100 p-4">
                    {/* Quick Actions */}
                    <div className="flex gap-2 mb-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onSelectAll}
                        >
                            Pilih Semua
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onDeselectAll}
                        >
                            Hapus Semua
                        </Button>
                    </div>

                    {/* Page Groups */}
                    <div className="space-y-4">
                        {Object.entries(groupedPages).map(([groupName, pages]) => (
                            <div key={groupName}>
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                    {groupName}
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {pages.map(page => {
                                        const isSelected = permissions.includes(page.pageId);
                                        return (
                                            <button
                                                key={page.pageId}
                                                onClick={() => onTogglePage(page.pageId)}
                                                className={`
                                                    flex items-center gap-2 p-2 rounded-lg text-left text-sm
                                                    transition-colors border
                                                    ${isSelected
                                                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                                                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                                                    }
                                                `}
                                            >
                                                <div className={`
                                                    w-4 h-4 rounded border flex items-center justify-center
                                                    ${isSelected
                                                        ? 'bg-blue-500 border-blue-500'
                                                        : 'bg-white border-gray-300'
                                                    }
                                                `}>
                                                    {isSelected && (
                                                        <Check size={12} className="text-white" />
                                                    )}
                                                </div>
                                                <span className="truncate">{page.pageLabel}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </Card>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const RolePermissionManager: React.FC = () => {
    const [permissions, setPermissions] = useState<RolePermissions[]>([]);
    const [expandedRole, setExpandedRole] = useState<UserRole | null>(null);
    const [hasChanges, setHasChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const allPages = useMemo(() => getAllPages(), []);

    const roles: UserRole[] = [
        'admin',
        'manager',
        'supervisor_ids',
        'supervisor_d2c',
        'salesforce',
        'direct_sales',
    ];

    // Load permissions on mount
    useEffect(() => {
        const loaded = permissionService.getPermissions();
        setPermissions(loaded);
    }, []);

    const handleTogglePage = (role: UserRole, pageId: string) => {
        setPermissions(prev => {
            const updated = prev.map(p => {
                if (p.role !== role) return p;

                const hasPage = p.allowedPages.includes(pageId);
                return {
                    ...p,
                    allowedPages: hasPage
                        ? p.allowedPages.filter(id => id !== pageId)
                        : [...p.allowedPages, pageId],
                };
            });
            return updated;
        });
        setHasChanges(true);
    };

    const handleSelectAll = (role: UserRole) => {
        setPermissions(prev => {
            return prev.map(p => {
                if (p.role !== role) return p;
                return {
                    ...p,
                    allowedPages: allPages.map(page => page.pageId),
                };
            });
        });
        setHasChanges(true);
    };

    const handleDeselectAll = (role: UserRole) => {
        setPermissions(prev => {
            return prev.map(p => {
                if (p.role !== role) return p;
                return {
                    ...p,
                    allowedPages: [],
                };
            });
        });
        setHasChanges(true);
    };

    const handleSave = async () => {
        setIsSaving(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        permissionService.savePermissions(permissions);
        setHasChanges(false);
        setIsSaving(false);
        alert('Pengaturan permission berhasil disimpan! Perubahan akan berlaku setelah user login ulang.');
    };

    const handleReset = () => {
        if (confirm('Reset semua permission ke default? Perubahan yang belum disimpan akan hilang.')) {
            permissionService.resetToDefaults();
            const loaded = permissionService.getPermissions();
            setPermissions(loaded);
            setHasChanges(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                        Pengaturan Akses Halaman
                    </h2>
                    <p className="text-sm text-gray-500">
                        Atur halaman yang dapat diakses oleh masing-masing role
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        leftIcon={<RotateCcw size={16} />}
                        onClick={handleReset}
                    >
                        Reset Default
                    </Button>
                    <Button
                        variant="primary"
                        leftIcon={<Save size={16} />}
                        onClick={handleSave}
                        disabled={!hasChanges}
                        isLoading={isSaving}
                    >
                        Simpan Perubahan
                    </Button>
                </div>
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <p className="text-sm text-blue-700">
                    <strong>Admin Super</strong> memiliki akses penuh ke semua halaman dan tidak dapat dibatasi.
                    Pengaturan ini hanya berlaku untuk role lainnya.
                </p>
            </div>

            {/* Role Cards */}
            <div className="space-y-4">
                {roles.map(role => {
                    const rolePerms = permissions.find(p => p.role === role);
                    return (
                        <RoleCard
                            key={role}
                            role={role}
                            permissions={rolePerms?.allowedPages || []}
                            allPages={allPages}
                            onTogglePage={(pageId) => handleTogglePage(role, pageId)}
                            onSelectAll={() => handleSelectAll(role)}
                            onDeselectAll={() => handleDeselectAll(role)}
                            isExpanded={expandedRole === role}
                            onToggleExpand={() => setExpandedRole(
                                expandedRole === role ? null : role
                            )}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default RolePermissionManager;
