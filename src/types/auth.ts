/**
 * Authentication Types
 * 
 * This file contains all types related to authentication and authorization.
 * Separated from main types for better modularity and scalability.
 */

// ============================================================================
// ROLE DEFINITIONS
// ============================================================================

/**
 * User roles in the system.
 * Each role has different access levels and permissions.
 */
export type Role =
    | 'admin_super'     // Full system access
    | 'admin'           // Data management without structure changes
    | 'manager'         // View all data, reports, limited user management
    | 'spv_ids'         // Supervisor IDS - manages IDS salesforce team
    | 'spv_d2c'         // Supervisor D2C - manages Direct to Customer team
    | 'supervisor_ids'  // Alias for spv_ids (backward compatibility)
    | 'supervisor_d2c'  // Alias for spv_d2c (backward compatibility)
    | 'salesforce'      // Field sales - outlet management, visits
    | 'direct_sales';   // D2C field team - visits, event notes

/**
 * Legacy role type for backward compatibility.
 * Maps to the new Role type.
 */
export type UserRole =
    | 'admin_super'
    | 'admin'
    | 'manager'
    | 'supervisor_ids'
    | 'supervisor_d2c'
    | 'salesforce'
    | 'direct_sales';

// ============================================================================
// USER INTERFACES
// ============================================================================

/**
 * User object returned from authentication.
 */
export interface User {
    id: string;
    name: string;
    username: string;
    email?: string;
    role: Role;
    avatar?: string;
    tap?: string;           // TAP assignment for field roles
    createdAt: string;
}

/**
 * Credentials for login request.
 */
export interface LoginCredentials {
    username: string;
    password: string;
}

/**
 * Response from login API/service.
 */
export interface LoginResponse {
    success: boolean;
    user?: User;
    token?: string;         // JWT token (mock for now)
    error?: string;
}

// ============================================================================
// AUTH STATE
// ============================================================================

/**
 * Authentication state managed by AuthContext.
 */
export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

// ============================================================================
// PERMISSION SYSTEM
// ============================================================================

/**
 * Available permissions in the system.
 */
export type Permission =
    | '*'                   // All permissions (admin)
    | 'view_all'
    | 'edit_all'
    | 'view_ids'
    | 'edit_ids'
    | 'view_d2c'
    | 'edit_d2c'
    | 'view_own'
    | 'edit_own'
    | 'export'
    | 'reports'
    | 'user_management'
    | 'user_management_read'
    | 'settings'
    | 'visit_form'
    | 'outlet_management'
    | 'event_notes';

/**
 * Role hierarchy for permission inheritance.
 * Higher number = more permissions.
 */
export const ROLE_HIERARCHY: Record<Role, number> = {
    admin_super: 100,
    admin: 90,
    manager: 80,
    spv_ids: 60,
    spv_d2c: 60,
    supervisor_ids: 60,  // Alias for spv_ids
    supervisor_d2c: 60,  // Alias for spv_d2c
    salesforce: 40,
    direct_sales: 20,
};

/**
 * Permission mapping for each role.
 */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
    admin_super: ['*'],
    admin: ['view_all', 'edit_all', 'export', 'reports', 'user_management_read', 'outlet_management', 'settings'],
    manager: ['view_all', 'edit_all', 'export', 'reports', 'user_management_read'],
    spv_ids: ['view_ids', 'edit_ids', 'export', 'reports', 'outlet_management'],
    spv_d2c: ['view_d2c', 'edit_d2c', 'export', 'reports', 'outlet_management'],
    supervisor_ids: ['view_ids', 'edit_ids', 'export', 'reports', 'outlet_management'],
    supervisor_d2c: ['view_d2c', 'edit_d2c', 'export', 'reports', 'outlet_management'],
    salesforce: ['view_own', 'edit_own', 'visit_form', 'outlet_management'],
    direct_sales: ['view_own', 'visit_form', 'event_notes'],
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get display name for a role.
 */
export const getRoleDisplayName = (role: Role): string => {
    const roleNames: Record<Role, string> = {
        admin_super: 'Admin Super',
        admin: 'Admin',
        manager: 'Manager',
        spv_ids: 'Supervisor IDS',
        spv_d2c: 'Supervisor D2C',
        supervisor_ids: 'Supervisor IDS',
        supervisor_d2c: 'Supervisor D2C',
        salesforce: 'Salesforce',
        direct_sales: 'Direct Sales',
    };
    return roleNames[role];
};

/**
 * Get badge color class for a role.
 */
export const getRoleBadgeColor = (role: Role): string => {
    const roleColors: Record<Role, string> = {
        admin_super: 'badge-error',
        admin: 'badge-warning',
        manager: 'badge-info',
        spv_ids: 'badge-success',
        spv_d2c: 'badge-warning',
        supervisor_ids: 'badge-success',
        supervisor_d2c: 'badge-warning',
        salesforce: 'badge-info',
        direct_sales: 'badge-neutral',
    };
    return roleColors[role];
};

/**
 * Map legacy role names to new role names.
 * Used for backward compatibility.
 */
export const mapLegacyRole = (role: UserRole): Role => {
    const mapping: Record<UserRole, Role> = {
        admin_super: 'admin_super',
        admin: 'admin',
        manager: 'manager',
        supervisor_ids: 'spv_ids',
        supervisor_d2c: 'spv_d2c',
        salesforce: 'salesforce',
        direct_sales: 'direct_sales',
    };
    return mapping[role] || role as Role;
};

/**
 * Check if a role has a specific permission.
 */
export const hasPermission = (role: Role, permission: Permission): boolean => {
    const permissions = ROLE_PERMISSIONS[role];
    return permissions.includes('*') || permissions.includes(permission);
};

/**
 * Check if a role has sufficient hierarchy level.
 */
export const hasMinimumRole = (userRole: Role, requiredRole: Role): boolean => {
    return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
};
