/**
 * Permission Service
 * 
 * Manages role-based page access permissions.
 * Permissions are stored in localStorage to allow admin configuration
 * without code changes.
 */

import { navigationItems } from '../config/navigation';
import type { UserRole } from '../types';

// ============================================================================
// TYPES
// ============================================================================

export interface PagePermission {
    pageId: string;
    pagePath: string;
    pageLabel: string;
    parentLabel?: string;
}

export interface RolePermissions {
    role: UserRole;
    allowedPages: string[];  // Array of pageIds
}

// ============================================================================
// STORAGE KEY
// ============================================================================

const PERMISSIONS_STORAGE_KEY = 'portal_role_permissions';

// ============================================================================
// DEFAULT PERMISSIONS
// ============================================================================

/**
 * Get all available pages from navigation config.
 */
export const getAllPages = (): PagePermission[] => {
    const pages: PagePermission[] = [];

    navigationItems.forEach(item => {
        if (item.children && item.children.length > 0) {
            // Add parent as a page option
            pages.push({
                pageId: item.id,
                pagePath: item.path,
                pageLabel: item.label,
            });

            // Add children
            item.children.forEach(child => {
                pages.push({
                    pageId: child.id,
                    pagePath: child.path,
                    pageLabel: child.label,
                    parentLabel: item.label,
                });
            });
        } else {
            pages.push({
                pageId: item.id,
                pagePath: item.path,
                pageLabel: item.label,
            });
        }
    });

    return pages;
};

/**
 * Default permissions based on navigation config.
 */
const getDefaultPermissions = (): RolePermissions[] => {
    const roles: UserRole[] = [
        'admin_super',
        'manager',
        'supervisor_ids',
        'supervisor_d2c',
        'salesforce',
        'direct_sales',
    ];

    return roles.map(role => {
        const allowedPages: string[] = [];

        navigationItems.forEach(item => {
            // Check if role has access based on original nav config
            const hasAccess = !item.roles || item.roles.includes(role);

            if (hasAccess) {
                allowedPages.push(item.id);

                // Also add children
                if (item.children) {
                    item.children.forEach(child => {
                        const childHasAccess = !child.roles || child.roles.includes(role);
                        if (childHasAccess) {
                            allowedPages.push(child.id);
                        }
                    });
                }
            }
        });

        return { role, allowedPages };
    });
};

// ============================================================================
// PERMISSION SERVICE
// ============================================================================

export const permissionService = {
    /**
     * Get all role permissions.
     * Returns stored permissions or defaults if none stored.
     */
    getPermissions: (): RolePermissions[] => {
        try {
            const stored = localStorage.getItem(PERMISSIONS_STORAGE_KEY);
            if (stored) {
                return JSON.parse(stored) as RolePermissions[];
            }
        } catch {
            console.error('Failed to parse stored permissions');
        }
        return getDefaultPermissions();
    },

    /**
     * Get permissions for a specific role.
     */
    getPermissionsForRole: (role: UserRole): string[] => {
        const allPermissions = permissionService.getPermissions();
        const rolePerms = allPermissions.find(p => p.role === role);
        return rolePerms?.allowedPages || [];
    },

    /**
     * Save permissions to localStorage.
     */
    savePermissions: (permissions: RolePermissions[]): void => {
        localStorage.setItem(PERMISSIONS_STORAGE_KEY, JSON.stringify(permissions));
    },

    /**
     * Update permissions for a specific role.
     */
    updateRolePermissions: (role: UserRole, allowedPages: string[]): void => {
        const allPermissions = permissionService.getPermissions();
        const index = allPermissions.findIndex(p => p.role === role);

        if (index >= 0) {
            allPermissions[index].allowedPages = allowedPages;
        } else {
            allPermissions.push({ role, allowedPages });
        }

        permissionService.savePermissions(allPermissions);
    },

    /**
     * Check if a role has access to a specific page.
     */
    hasPageAccess: (role: UserRole, pageId: string): boolean => {
        // Admin super always has access
        if (role === 'admin_super') return true;

        const allowedPages = permissionService.getPermissionsForRole(role);
        return allowedPages.includes(pageId);
    },

    /**
     * Reset permissions to defaults.
     */
    resetToDefaults: (): void => {
        localStorage.removeItem(PERMISSIONS_STORAGE_KEY);
    },

    /**
     * Get page info by path.
     */
    getPageByPath: (path: string): PagePermission | undefined => {
        const allPages = getAllPages();
        return allPages.find(p => p.pagePath === path);
    },
};

export default permissionService;
