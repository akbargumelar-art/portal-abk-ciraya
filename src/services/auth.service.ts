/**
 * Authentication Service Layer
 * 
 * This service handles all authentication-related operations.
 * Currently uses mock data, designed to be easily swapped with real API calls.
 * 
 * @example Swapping to Real API:
 * Replace the mock implementation with Axios calls:
 * ```
 * import axios from 'axios';
 * const API_BASE = import.meta.env.VITE_API_URL;
 * 
 * export const authService = {
 *   login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
 *     const response = await axios.post(`${API_BASE}/auth/login`, credentials);
 *     return response.data;
 *   },
 *   // ... other methods
 * };
 * ```
 */

import type { User, LoginCredentials, LoginResponse, Role } from '../types/auth';

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Simulated network delay in milliseconds.
 * Set to 0 in production when using real API.
 */
const MOCK_DELAY_MS = 800;

/**
 * Storage keys for persisting auth data.
 */
export const AUTH_STORAGE_KEYS = {
    USER: 'portal_auth_user',
    TOKEN: 'portal_auth_token',
} as const;

// ============================================================================
// MOCK DATA
// ============================================================================

/**
 * Mock users database.
 * In production, this will be fetched from the backend.
 * 
 * Password for all users: 'password' (for testing purposes)
 */
interface MockUser extends User {
    password: string; // Only in mock, never expose in real API
}

const MOCK_USERS: MockUser[] = [
    {
        id: 'USR001',
        name: 'Ahmad Sudrajat',
        username: 'admin',
        password: 'password',
        role: 'admin_super',
        email: 'admin@agrabudi.com',
        avatar: 'https://ui-avatars.com/api/?name=Ahmad+Sudrajat&background=F13B4B&color=fff',
        createdAt: '2023-01-01',
    },
    {
        id: 'USR002',
        name: 'Budi Santoso',
        username: 'manager',
        password: 'password',
        role: 'manager',
        email: 'budi@agrabudi.com',
        avatar: 'https://ui-avatars.com/api/?name=Budi+Santoso&background=1E3A5F&color=fff',
        createdAt: '2023-01-15',
    },
    {
        id: 'USR003',
        name: 'Citra Dewi',
        username: 'spv_ids',
        password: 'password',
        role: 'spv_ids',
        email: 'citra@agrabudi.com',
        tap: 'TAP-CRB-01',
        avatar: 'https://ui-avatars.com/api/?name=Citra+Dewi&background=10B981&color=fff',
        createdAt: '2023-02-01',
    },
    {
        id: 'USR004',
        name: 'Deni Firmansyah',
        username: 'spv_d2c',
        password: 'password',
        role: 'spv_d2c',
        email: 'deni@agrabudi.com',
        tap: 'TAP-CRB-02',
        avatar: 'https://ui-avatars.com/api/?name=Deni+Firmansyah&background=F59E0B&color=fff',
        createdAt: '2023-02-15',
    },
    {
        id: 'USR005',
        name: 'Eko Prasetyo',
        username: 'sales',
        password: 'password',
        role: 'salesforce',
        email: 'eko@agrabudi.com',
        tap: 'TAP-CRB-01',
        avatar: 'https://ui-avatars.com/api/?name=Eko+Prasetyo&background=3B82F6&color=fff',
        createdAt: '2023-03-01',
    },
    {
        id: 'USR006',
        name: 'Fitri Handayani',
        username: 'ds',
        password: 'password',
        role: 'direct_sales',
        email: 'fitri@agrabudi.com',
        tap: 'TAP-CRB-01',
        avatar: 'https://ui-avatars.com/api/?name=Fitri+Handayani&background=8B5CF6&color=fff',
        createdAt: '2023-03-15',
    },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Simulate network delay for mock API calls.
 */
const delay = (ms: number): Promise<void> =>
    new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generate a mock JWT-like token.
 * In production, this will be a real JWT from the backend.
 */
const generateMockToken = (user: User): string => {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
        sub: user.id,
        username: user.username,
        role: user.role,
        iat: Date.now(),
        exp: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
    }));
    const signature = btoa('mock-signature-' + user.id);
    return `${header}.${payload}.${signature}`;
};

/**
 * Sanitize user object to remove sensitive data.
 */
const sanitizeUser = (mockUser: MockUser): User => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...user } = mockUser;
    return user;
};

// ============================================================================
// AUTH SERVICE
// ============================================================================

/**
 * Authentication service object.
 * All authentication operations should go through this service.
 */
export const authService = {
    /**
     * Login with username and password.
     * 
     * @param credentials - Username and password
     * @returns Login response with user and token on success
     * 
     * @example
     * const result = await authService.login({ username: 'admin', password: 'password' });
     * if (result.success) {
     *   console.log('Logged in as:', result.user);
     * }
     */
    login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
        // Simulate API call delay
        await delay(MOCK_DELAY_MS);

        // Find user by username (case-insensitive)
        const mockUser = MOCK_USERS.find(
            u => u.username.toLowerCase() === credentials.username.toLowerCase()
        );

        // Validate credentials
        if (!mockUser) {
            return {
                success: false,
                error: 'Username tidak ditemukan',
            };
        }

        if (mockUser.password !== credentials.password) {
            return {
                success: false,
                error: 'Password salah',
            };
        }

        // Generate token and sanitize user
        const user = sanitizeUser(mockUser);
        const token = generateMockToken(user);

        return {
            success: true,
            user,
            token,
        };
    },

    /**
     * Logout the current user.
     * Clears all stored authentication data.
     */
    logout: (): void => {
        localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
        localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
    },

    /**
     * Get stored user from localStorage.
     * Used to restore session on page refresh.
     * 
     * @returns User object or null if not found/invalid
     */
    getStoredUser: (): User | null => {
        try {
            const stored = localStorage.getItem(AUTH_STORAGE_KEYS.USER);
            if (!stored) return null;
            return JSON.parse(stored) as User;
        } catch {
            return null;
        }
    },

    /**
     * Get stored token from localStorage.
     * 
     * @returns Token string or null if not found
     */
    getStoredToken: (): string | null => {
        return localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
    },

    /**
     * Store user and token in localStorage.
     * Called after successful login.
     */
    storeSession: (user: User, token: string): void => {
        localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(user));
        localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, token);
    },

    /**
     * Update stored user data.
     * Used when user updates their profile.
     */
    updateStoredUser: (updates: Partial<User>): User | null => {
        const currentUser = authService.getStoredUser();
        if (!currentUser) return null;

        const updatedUser = { ...currentUser, ...updates };
        localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(updatedUser));
        return updatedUser;
    },

    /**
     * Validate if current token is still valid.
     * In production, this would call the backend to verify the token.
     * 
     * @returns true if token is valid
     */
    validateToken: async (): Promise<boolean> => {
        const token = authService.getStoredToken();
        if (!token) return false;

        // TODO: Replace with real API validation
        // const response = await axios.post(`${API_BASE}/auth/validate`, { token });
        // return response.data.valid;

        // Mock validation: check if token exists and is not expired
        try {
            const parts = token.split('.');
            if (parts.length !== 3) return false;

            const payload = JSON.parse(atob(parts[1]));
            return payload.exp > Date.now();
        } catch {
            return false;
        }
    },

    /**
     * Get all available demo users.
     * Only used for demo/testing login screen.
     */
    getDemoUsers: (): Array<{ username: string; role: Role; name: string }> => {
        return MOCK_USERS.map(u => ({
            username: u.username,
            role: u.role,
            name: u.name,
        }));
    },
};

export default authService;
