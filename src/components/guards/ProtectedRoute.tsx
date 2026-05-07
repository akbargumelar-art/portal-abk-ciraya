/**
 * Protected Route Guard Component
 * 
 * This component protects routes by checking:
 * 1. If user is authenticated
 * 2. If user has the required role(s)
 * 
 * Supports both wrapper and Outlet patterns for React Router.
 */

import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { Role, UserRole } from '../../types/auth';
import { normalizeRole } from '../../utils/roleAccess';

// ============================================================================
// INTERFACES
// ============================================================================

interface ProtectedRouteProps {
    /**
     * Roles allowed to access this route.
     * Supports both new Role types and legacy UserRole types.
     * If empty or undefined, any authenticated user can access.
     */
    allowedRoles?: (Role | UserRole | string)[];

    /**
     * Children to render if access is granted.
     * If not provided, renders Outlet for nested routes.
     */
    children?: React.ReactNode;

    /**
     * Custom redirect path for unauthenticated users.
     * @default '/login'
     */
    loginPath?: string;

    /**
     * Custom redirect path for unauthorized users.
     * @default '/unauthorized'
     */
    unauthorizedPath?: string;
}

// ============================================================================
// LOADING COMPONENT
// ============================================================================

/**
 * Loading spinner shown while checking authentication.
 */
const AuthLoadingSpinner: React.FC = () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[#F13B4B] border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500">Memeriksa autentikasi...</p>
        </div>
    </div>
);

// ============================================================================
// PROTECTED ROUTE COMPONENT
// ============================================================================

/**
 * ProtectedRoute component that guards routes based on authentication and roles.
 * 
 * @example Basic usage (any authenticated user) with nested routes
 * ```tsx
 * <Route element={<ProtectedRoute />}>
 *   <Route path="/dashboard" element={<DashboardPage />} />
 * </Route>
 * ```
 * 
 * @example Role-based protection with nested routes
 * ```tsx
 * <Route element={<ProtectedRoute allowedRoles={['admin_super']} />}>
 *   <Route path="/settings" element={<SettingsPage />} />
 * </Route>
 * ```
 * 
 * @example Wrapping a single component
 * ```tsx
 * <Route path="/settings" element={
 *   <ProtectedRoute allowedRoles={['admin_super']}>
 *     <SettingsPage />
 *   </ProtectedRoute>
 * } />
 * ```
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    allowedRoles,
    children,
    loginPath = '/login',
    unauthorizedPath = '/unauthorized',
}) => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    // Show loading spinner while checking auth state
    if (isLoading) {
        return <AuthLoadingSpinner />;
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated || !user) {
        // Save the attempted location for redirect after login
        return (
            <Navigate
                to={loginPath}
                state={{ from: location }}
                replace
            />
        );
    }

    // Check role-based access if roles are specified
    if (allowedRoles && allowedRoles.length > 0) {
        // Normalize all roles for comparison
        const normalizedAllowedRoles = allowedRoles.map(r => normalizeRole(r as string));
        const userRole = normalizeRole(user.role as string);
        const hasRequiredRole = normalizedAllowedRoles.includes(userRole);

        if (!hasRequiredRole) {
            return (
                <Navigate
                    to={unauthorizedPath}
                    state={{
                        requiredRoles: allowedRoles,
                        userRole: user.role,
                        attemptedPath: location.pathname
                    }}
                    replace
                />
            );
        }
    }

    // User is authenticated and has required role
    // Render children if provided, otherwise render Outlet for nested routes
    return <>{children || <Outlet />}</>;
};

// ============================================================================
// ROLE CHECK HOOK (OPTIONAL UTILITY)
// ============================================================================

/**
 * Hook to check if current user has specific roles.
 * Useful for conditional rendering within components.
 * 
 * @example
 * ```tsx
 * const { canAccess, isAdmin } = useRoleCheck(['admin_super', 'manager']);
 * 
 * return (
 *   <div>
 *     {canAccess && <AdminPanel />}
 *     {isAdmin && <SuperSecretButton />}
 *   </div>
 * );
 * ```
 */
export const useRoleCheck = (requiredRoles?: (Role | string)[]) => {
    const { user, isAuthenticated } = useAuth();

    const userRole = user?.role ? normalizeRole(user.role as string) : undefined;

    const canAccess = React.useMemo(() => {
        if (!isAuthenticated || !userRole) return false;
        if (!requiredRoles || requiredRoles.length === 0) return true;
        const normalizedRoles = requiredRoles.map(r => normalizeRole(r as string));
        return normalizedRoles.includes(userRole);
    }, [isAuthenticated, userRole, requiredRoles]);

    const isAdmin = userRole === 'admin_super';
    const isManager = userRole === 'manager' || isAdmin;
    const isSupervisor = ['spv_ids', 'spv_d2c'].includes(userRole || '') || isManager;

    return {
        canAccess,
        isAdmin,
        isManager,
        isSupervisor,
        userRole,
    };
};

export default ProtectedRoute;
