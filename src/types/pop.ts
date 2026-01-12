/**
 * POP (Point of Purchase) Types
 * 
 * Type definitions for POP module including master data,
 * transactions, and photo documentation.
 */

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

/**
 * POP item categories.
 */
export type POPCategory =
    | 'banner'
    | 'neon_box'
    | 'poster'
    | 'x_banner'
    | 'spanduk'
    | 'sticker'
    | 'flag'
    | 'standee';

/**
 * POP installation status.
 */
export type POPStatus = 'installed' | 'damaged' | 'missing' | 'pending';

/**
 * Transaction types for POP items.
 */
export type POPTransactionType = 'inbound' | 'transfer' | 'installation';

// ============================================================================
// MASTER DATA TYPES
// ============================================================================

/**
 * POP Item Master Data (Catalog).
 * This represents the catalog/reference of available POP items.
 */
export interface POPItem {
    id: string;
    name: string;
    category: POPCategory;
    description?: string;

    /**
     * Reference/catalog photo URL.
     * This shows what the item looks like for identification.
     */
    referencePhotoUrl?: string;

    /**
     * Current stock quantity.
     */
    stock: number;

    /**
     * Minimum stock threshold for alerts.
     */
    minStock?: number;

    /**
     * Unit of measurement (e.g., 'pcs', 'lembar', 'unit').
     */
    unit: string;

    /**
     * Active status.
     */
    isActive: boolean;

    createdAt: string;
    updatedAt: string;
}

// ============================================================================
// TRANSACTION TYPES
// ============================================================================

/**
 * POP Transaction record.
 * Tracks inbound, transfer, and installation of POP items.
 */
export interface POPTransaction {
    id: string;
    type: POPTransactionType;
    itemId: string;
    itemName: string;
    quantity: number;

    /**
     * Proof/evidence photo URL.
     * For installations: photo of the installed POP.
     * For transfers: photo of handover.
     */
    proofPhotoUrl?: string;

    /**
     * Source location (for transfers).
     */
    fromLocation?: string;

    /**
     * Destination outlet (for installations/transfers).
     */
    toOutletId?: string;
    toOutletName?: string;

    /**
     * Salesforce who performed the transaction.
     */
    salesforceId?: string;
    salesforceName?: string;

    notes?: string;
    date: string;
    createdAt: string;
}

// ============================================================================
// INSTALLATION RECORD (EXISTING ENHANCED)
// ============================================================================

/**
 * POP Installation record at an outlet.
 * Combines outlet info with POP item status.
 */
export interface POPRecord {
    id: string;
    date: string;

    // Outlet info
    outletId: string;
    outletName: string;
    outletAddress?: string;

    // POP item info
    itemId: string;
    itemName: string;
    itemCategory: POPCategory;

    /**
     * Reference photo from catalog.
     */
    referencePhotoUrl?: string;

    /**
     * Proof photo of installation.
     */
    proofPhotoUrl?: string;

    status: POPStatus;

    // Salesforce info
    salesforceId?: string;
    salesforceName?: string;

    notes?: string;
    installedAt?: string;
    lastCheckedAt?: string;
}

// ============================================================================
// FORM TYPES
// ============================================================================

/**
 * Form data for creating/updating a POP item.
 */
export interface POPItemFormData {
    name: string;
    category: POPCategory;
    description: string;
    stock: number;
    minStock: number;
    unit: string;
    referencePhoto?: File;
}

/**
 * Form data for recording an installation.
 */
export interface POPInstallationFormData {
    itemId: string;
    outletId: string;
    proofPhoto: File;
    notes: string;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Get display name for POP category.
 */
export const getCategoryDisplayName = (category: POPCategory): string => {
    const names: Record<POPCategory, string> = {
        banner: 'Banner',
        neon_box: 'Neon Box',
        poster: 'Poster',
        x_banner: 'X-Banner',
        spanduk: 'Spanduk',
        sticker: 'Sticker',
        flag: 'Flag/Bendera',
        standee: 'Standee',
    };
    return names[category];
};

/**
 * Get display name for POP status.
 */
export const getStatusDisplayName = (status: POPStatus): string => {
    const names: Record<POPStatus, string> = {
        installed: 'Terpasang',
        damaged: 'Rusak',
        missing: 'Hilang',
        pending: 'Pending',
    };
    return names[status];
};

/**
 * Get badge variant for POP status.
 */
export const getStatusBadgeVariant = (status: POPStatus): 'success' | 'warning' | 'error' | 'neutral' => {
    const variants: Record<POPStatus, 'success' | 'warning' | 'error' | 'neutral'> = {
        installed: 'success',
        damaged: 'warning',
        missing: 'error',
        pending: 'neutral',
    };
    return variants[status];
};

/**
 * Get display name for transaction type.
 */
export const getTransactionTypeDisplayName = (type: POPTransactionType): string => {
    const names: Record<POPTransactionType, string> = {
        inbound: 'Masuk',
        transfer: 'Transfer',
        installation: 'Pemasangan',
    };
    return names[type];
};
