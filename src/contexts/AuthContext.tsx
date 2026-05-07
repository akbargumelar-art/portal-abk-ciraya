/**
 * Authentication Context
 * 
 * Provides authentication state and methods throughout the application.
 * Uses the authService for all authentication operations.
 * 
 * @example
 * ```tsx
 * // In a component
 * const { user, login, logout, isAuthenticated } = useAuth();
 * ```
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { authService } from '../services/auth.service';
import type {
    User,
    AuthState,
    Role,
    Permission,
    LoginCredentials
} from '../types/auth';
import { ROLE_PERMISSIONS, ROLE_HIERARCHY } from '../types/auth';
import { normalizeRole } from '../utils/roleAccess';

// For backward compatibility with existing code
import type { UserRole } from '../types';

// ============================================================================
// CONTEXT TYPE DEFINITION
// ============================================================================

interface AuthContextType extends AuthState {
    /**
     * Login with username and password.
     * @returns true if login successful
     */
    login: (username: string, password: string) => Promise<boolean>;

    /**
     * Logout current user.
     */
    logout: () => void;

    /**
     * Check if user has one of the specified roles.
     * @param roles - Array of roles to check
     */
    hasRole: (roles: (Role | UserRole)[]) => boolean;

    /**
     * Check if user has a specific permission.
     */
    hasPermission: (permission: Permission) => boolean;

    /**
     * Check if user has at least the specified role level.
     */
    hasMinimumRole: (role: Role) => boolean;

    /**
     * Update current user profile.
     */
    updateUser: (updates: Partial<User>) => void;

    /**
     * Get demo users for login screen.
     */
    getDemoUsers: () => Array<{ username: string; role: Role; name: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// AUTH PROVIDER COMPONENT
// ============================================================================

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [state, setState] = useState<AuthState>({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: true,
    });

    // ========================================================================
    // SESSION RESTORATION
    // ========================================================================

    /**
     * Restore session from localStorage on app mount.
     */
    useEffect(() => {
        const restoreSession = async () => {
            try {
                const storedUser = authService.getStoredUser();
                const storedToken = authService.getStoredToken();

                if (storedUser && storedToken) {
                    // Optionally validate token with backend
                    // const isValid = await authService.validateToken();
                    // if (!isValid) throw new Error('Token expired');

                    setState({
                        user: storedUser,
                        token: storedToken,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                } else {
                    setState(prev => ({ ...prev, isLoading: false }));
                }
            } catch {
                // Clear invalid session
                authService.logout();
                setState({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    isLoading: false,
                });
            }
        };

        restoreSession();
    }, []);

    // ========================================================================
    // AUTH METHODS
    // ========================================================================

    /**
     * Login with credentials.
     */
    const login = useCallback(async (username: string, password: string): Promise<boolean> => {
        setState(prev => ({ ...prev, isLoading: true }));

        try {
            const credentials: LoginCredentials = { username, password };
            const response = await authService.login(credentials);

            if (response.success && response.user && response.token) {
                // Store session
                authService.storeSession(response.user, response.token);

                setState({
                    user: response.user,
                    token: response.token,
                    isAuthenticated: true,
                    isLoading: false,
                });
                return true;
            }

            setState(prev => ({ ...prev, isLoading: false }));
            return false;
        } catch {
            setState(prev => ({ ...prev, isLoading: false }));
            return false;
        }
    }, []);

    /**
     * Logout current user.
     */
    const logout = useCallback(() => {
        authService.logout();
        setState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
        });
    }, []);

    /**
     * Check if user has one of the specified roles.
     */
    const hasRole = useCallback((roles: (Role | UserRole)[]): boolean => {
        if (!state.user) return false;

        const normalizedRoles = roles.map((role) => normalizeRole(role as string));
        const userRole = normalizeRole(state.user.role as string);
        return normalizedRoles.includes(userRole);
    }, [state.user]);

    /**
     * Check if user has a specific permission.
     */
    const hasPermission = useCallback((permission: Permission): boolean => {
        if (!state.user) return false;

        const userPermissions = ROLE_PERMISSIONS[state.user.role as Role];
        if (!userPermissions) return false;

        return userPermissions.includes('*') || userPermissions.includes(permission);
    }, [state.user]);

    /**
     * Check if user has at least the specified role level.
     */
    const hasMinimumRole = useCallback((requiredRole: Role): boolean => {
        if (!state.user) return false;

        const userLevel = ROLE_HIERARCHY[state.user.role as Role];
        const requiredLevel = ROLE_HIERARCHY[requiredRole];

        return userLevel >= requiredLevel;
    }, [state.user]);

    /**
     * Update user profile.
     */
    const updateUser = useCallback((updates: Partial<User>) => {
        if (!state.user) return;

        const updatedUser = authService.updateStoredUser(updates);
        if (updatedUser) {
            setState(prev => ({
                ...prev,
                user: updatedUser,
            }));
        }
    }, [state.user]);

    /**
     * Get demo users for login screen.
     */
    const getDemoUsers = useCallback(() => {
        return authService.getDemoUsers();
    }, []);

    // ========================================================================
    // CONTEXT VALUE
    // ========================================================================

    const contextValue = useMemo<AuthContextType>(() => ({
        ...state,
        login,
        logout,
        hasRole,
        hasPermission,
        hasMinimumRole,
        updateUser,
        getDemoUsers,
    }), [state, login, logout, hasRole, hasPermission, hasMinimumRole, updateUser, getDemoUsers]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook to access authentication context.
 * Must be used within AuthProvider.
 * 
 * @throws Error if used outside AuthProvider
 */
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// ============================================================================
// EXPORTS FOR BACKWARD COMPATIBILITY
// ============================================================================

// Re-export role constants for backward compatibility
export { ROLE_HIERARCHY as roleHierarchy, ROLE_PERMISSIONS as rolePermissions };
