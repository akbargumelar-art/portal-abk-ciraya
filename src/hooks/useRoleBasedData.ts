/**
 * Role-Based Data Filtering Hook
 * Filters outlets and other data based on the current user's role
 * 
 * - Salesforce users: Only see outlets assigned to them
 * - D2C users: Only see outlets in their cluster
 * - Admin/Manager/Supervisor: See all data
 */

import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { outlets as allOutlets, salesforceUsers } from '../data/mockData';
import type { Outlet, User } from '../types';

// Roles that have full access to all data
const FULL_ACCESS_ROLES = ['admin_super', 'admin', 'manager', 'spv_ids', 'spv_d2c', 'supervisor_ids', 'supervisor_d2c'];

/**
 * Hook to get filtered outlets based on user role
 */
export const useRoleBasedOutlets = (): Outlet[] => {
    const { user } = useAuth();

    return useMemo(() => {
        if (!user) return [];

        // Full access roles see all outlets
        if (FULL_ACCESS_ROLES.includes(user.role)) {
            return allOutlets;
        }

        // Salesforce users only see their assigned outlets
        if (user.role === 'salesforce') {
            // Find the SF user from mock data that matches the logged-in user
            const sfUser = salesforceUsers.find(sf =>
                sf.name === user.name || sf.id === user.id || sf.username === user.username
            );

            if (sfUser) {
                return allOutlets.filter(outlet => outlet.salesforceId === sfUser.id);
            }

            // Fallback: filter by TAP if no direct match
            if (user.tap) {
                return allOutlets.filter(outlet => outlet.tap === user.tap);
            }

            return [];
        }

        // D2C users see outlets in their cluster (stored in tap field)
        if (user.role === 'direct_sales') {
            // D2C cluster corresponds to specific kabupaten
            const clusterKabupaten: Record<string, string[]> = {
                'Cluster Cirebon': ['Kota Cirebon', 'Kab. Cirebon'],
                'Cluster Kuningan': ['Kab. Kuningan'],
            };

            const cluster = user.tap; // D2C cluster is stored in tap field
            if (cluster && clusterKabupaten[cluster]) {
                return allOutlets.filter(outlet =>
                    clusterKabupaten[cluster].includes(outlet.kabupaten)
                );
            }

            return [];
        }

        // Default: return all outlets for unknown roles
        return allOutlets;
    }, [user]);
};

/**
 * Hook to check if current user has full data access
 */
export const useHasFullAccess = (): boolean => {
    const { user } = useAuth();
    return user ? FULL_ACCESS_ROLES.includes(user.role) : false;
};

/**
 * Hook to get the current user's filter context for display
 */
export const useUserFilterContext = (): { label: string; value: string } | null => {
    const { user } = useAuth();

    return useMemo(() => {
        if (!user) return null;

        if (FULL_ACCESS_ROLES.includes(user.role)) {
            return null; // No filter applied for full access
        }

        if (user.role === 'salesforce') {
            return {
                label: 'Salesforce',
                value: user.name,
            };
        }

        if (user.role === 'direct_sales') {
            return {
                label: 'Cluster',
                value: user.tap || 'Unknown',
            };
        }

        return null;
    }, [user]);
};

/**
 * Get salesforce users for the current user's TAP (for supervisors)
 */
export const useRoleBasedSalesforce = (): User[] => {
    const { user } = useAuth();

    return useMemo(() => {
        if (!user) return [];

        // Full access roles see all salesforce
        if (FULL_ACCESS_ROLES.includes(user.role)) {
            return salesforceUsers;
        }

        // Salesforce users only see themselves
        if (user.role === 'salesforce') {
            return salesforceUsers.filter(sf =>
                sf.name === user.name || sf.id === user.id
            );
        }

        // D2C users don't need salesforce list
        if (user.role === 'direct_sales') {
            return [];
        }

        return salesforceUsers;
    }, [user]);
};

export default useRoleBasedOutlets;
