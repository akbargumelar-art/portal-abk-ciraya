import type { UserRole } from '../types';

const ROLE_ALIASES: Record<string, string> = {
    supervisor_ids: 'spv_ids',
    supervisor_d2c: 'spv_d2c',
};

export function normalizeRole(role: string): string {
    return ROLE_ALIASES[role] ?? role;
}

/** True if `allowed` is undefined (any authenticated user) or user role matches. */
export function roleHasAccess(userRole: string, allowed?: UserRole[]): boolean {
    if (!allowed || allowed.length === 0) return true;
    const u = normalizeRole(userRole);
    return allowed.some((r) => normalizeRole(r as string) === u);
}
