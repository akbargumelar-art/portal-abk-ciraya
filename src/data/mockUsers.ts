import type { User, UserRole } from '../types';
import { salesforceUsers, d2cUsers } from '../services/mock/dataGenerator';

// Core admin/management users
const adminUsers: User[] = [
    {
        id: 'USR001',
        name: 'Ahmad Sudrajat',
        username: 'admin',
        role: 'admin_super',
        email: 'admin@agrabudi.com',
        avatar: 'https://ui-avatars.com/api/?name=Ahmad+Sudrajat&background=F13B4B&color=fff',
        createdAt: '2023-01-01',
    },
    {
        id: 'USR007',
        name: 'Indra Kusuma',
        username: 'admin_data',
        role: 'admin',
        email: 'indra@agrabudi.com',
        avatar: 'https://ui-avatars.com/api/?name=Indra+Kusuma&background=E67E22&color=fff',
        createdAt: '2023-01-05',
    },
    {
        id: 'USR002',
        name: 'Budi Santoso',
        username: 'manager',
        role: 'manager',
        email: 'budi@agrabudi.com',
        avatar: 'https://ui-avatars.com/api/?name=Budi+Santoso&background=1E3A5F&color=fff',
        createdAt: '2023-01-15',
    },
    {
        id: 'USR003',
        name: 'Citra Dewi',
        username: 'spv_ids',
        role: 'supervisor_ids',
        email: 'citra@agrabudi.com',
        tap: 'TAP Pemuda',
        avatar: 'https://ui-avatars.com/api/?name=Citra+Dewi&background=10B981&color=fff',
        createdAt: '2023-02-01',
    },
    {
        id: 'USR004',
        name: 'Deni Firmansyah',
        username: 'spv_d2c',
        role: 'supervisor_d2c',
        email: 'deni@agrabudi.com',
        tap: 'Cluster Cirebon',
        avatar: 'https://ui-avatars.com/api/?name=Deni+Firmansyah&background=F59E0B&color=fff',
        createdAt: '2023-02-15',
    },
];

// Combined mock users: admin/managers + salesforce (37) + D2C (15) = total 57 users
export const mockUsers: User[] = [
    ...adminUsers,
    ...salesforceUsers,
    ...d2cUsers,
];


// Helper function to get role display name
export const getRoleDisplayName = (role: UserRole): string => {
    const roleNames: Record<UserRole, string> = {
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

// Helper function to get role badge color
export const getRoleBadgeColor = (role: UserRole): string => {
    const roleColors: Record<UserRole, string> = {
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
