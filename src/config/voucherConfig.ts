/**
 * Voucher Product Configuration
 * 
 * Contains all 35+ voucher SKU products with brand and validity classification.
 */

export interface VoucherProduct {
    id: string;
    name: string;
    brand: 'simpati' | 'byu' | 'common';
    validity: string; // 'vo' | '1d' | '2d' | '3d' | '5d' | '7d' | '14d' | '30d'
}

export const VOUCHER_PRODUCTS: VoucherProduct[] = [
    // Voucher Kosong
    { id: 'vo_simpati', name: 'Voucher Kosong Simpati', brand: 'simpati', validity: 'vo' },
    { id: 'vo_byu', name: 'Voucher Kosong byU', brand: 'byu', validity: 'vo' },

    // Simpati 1 Hari
    { id: 'sim_2gb_1d', name: 'Simpati 2GB 1 Hari', brand: 'simpati', validity: '1d' },
    { id: 'sim_4gb_1d', name: 'Simpati 4GB 1 Hari', brand: 'simpati', validity: '1d' },
    { id: 'sim_5gb_1d', name: 'Simpati 5GB 1 Hari', brand: 'simpati', validity: '1d' },

    // Simpati 2 Hari
    { id: 'sim_5gb_2d', name: 'Simpati 5GB 2 Hari', brand: 'simpati', validity: '2d' },

    // Simpati 3 Hari
    { id: 'sim_1_5gb_3d', name: 'Simpati 1.5GB 3 Hari', brand: 'simpati', validity: '3d' },
    { id: 'sim_2gb_3d', name: 'Simpati 2GB 3 Hari', brand: 'simpati', validity: '3d' },
    { id: 'sim_3gb_3d', name: 'Simpati 3GB 3 Hari', brand: 'simpati', validity: '3d' },

    // Simpati 5 Hari
    { id: 'sim_2_5gb_5d', name: 'Simpati 2.5GB 5 Hari', brand: 'simpati', validity: '5d' },
    { id: 'sim_3gb_5d', name: 'Simpati 3GB 5 Hari', brand: 'simpati', validity: '5d' },
    { id: 'sim_5gb_5d', name: 'Simpati 5GB 5 Hari', brand: 'simpati', validity: '5d' },
    { id: 'sim_4_5gb_5d', name: 'Simpati 4.5GB 5 Hari', brand: 'simpati', validity: '5d' },
    { id: 'sim_5_5gb_5d', name: 'Simpati 5.5GB 5 Hari', brand: 'simpati', validity: '5d' },

    // Simpati 7 Hari
    { id: 'sim_4_5gb_7d', name: 'Simpati 4.5GB 7 Hari', brand: 'simpati', validity: '7d' },
    { id: 'sim_6gb_7d', name: 'Simpati 6GB 7 Hari', brand: 'simpati', validity: '7d' },
    { id: 'sim_8gb_7d', name: 'Simpati 8GB 7 Hari', brand: 'simpati', validity: '7d' },
    { id: 'sim_13gb_7d', name: 'Simpati 13GB 7 Hari', brand: 'simpati', validity: '7d' },
    { id: 'sim_16gb_7d', name: 'Simpati 16GB 7 Hari', brand: 'simpati', validity: '7d' },
    { id: 'sim_19gb_7d', name: 'Simpati 19GB 7 Hari', brand: 'simpati', validity: '7d' },

    // Simpati 30 Hari
    { id: 'sim_7gb_30d', name: 'Simpati 7GB 30 Hari', brand: 'simpati', validity: '30d' },
    { id: 'sim_10gb_30d', name: 'Simpati 10GB 30 Hari', brand: 'simpati', validity: '30d' },
    { id: 'sim_12gb_30d', name: 'Simpati 12GB 30 Hari', brand: 'simpati', validity: '30d' },
    { id: 'sim_20gb_30d', name: 'Simpati 20GB 30 Hari', brand: 'simpati', validity: '30d' },
    { id: 'sim_30gb_30d', name: 'Simpati 30GB 30 Hari', brand: 'simpati', validity: '30d' },

    // byU 1 Hari
    { id: 'byu_10gb_1d', name: 'byU 10GB 1 Hari', brand: 'byu', validity: '1d' },

    // byU 3 Hari
    { id: 'byu_4gb_3d', name: 'byU 4GB 3 Hari', brand: 'byu', validity: '3d' },

    // byU 5 Hari
    { id: 'byu_7_5gb_5d', name: 'byU 7.5GB 5 Hari', brand: 'byu', validity: '5d' },

    // byU 7 Hari
    { id: 'byu_3gb_7d', name: 'byU 3GB 7 Hari', brand: 'byu', validity: '7d' },
    { id: 'byu_5gb_7d', name: 'byU 5GB 7 Hari', brand: 'byu', validity: '7d' },
    { id: 'byu_6_5gb_7d', name: 'byU 6.5GB 7 Hari', brand: 'byu', validity: '7d' },

    // byU 14 Hari
    { id: 'byu_4gb_14d', name: 'byU 4GB 14 Hari', brand: 'byu', validity: '14d' },
    { id: 'byu_10gb_14d', name: 'byU 10GB 14 Hari', brand: 'byu', validity: '14d' },

    // byU 30 Hari
    { id: 'byu_10gb_30d', name: 'byU 10GB 30 Hari', brand: 'byu', validity: '30d' },
    { id: 'byu_15gb_30d', name: 'byU 15GB 30 Hari', brand: 'byu', validity: '30d' },
];

// Validity options for filter
export const VALIDITY_OPTIONS = [
    { value: 'vo', label: 'VO' },
    { value: '1d', label: '1D' },
    { value: '2d', label: '2D' },
    { value: '3d', label: '3D' },
    { value: '5d', label: '5D' },
    { value: '7d', label: '7D' },
    { value: '14d', label: '14D' },
    { value: '30d', label: '30D' },
];

// Brand options for filter
export const BRAND_OPTIONS = [
    { value: 'all', label: 'Semua' },
    { value: 'simpati', label: 'Simpati' },
    { value: 'byu', label: 'byU' },
];

// Validity display names
export const VALIDITY_LABELS: Record<string, string> = {
    'vo': 'Voucher Kosong',
    '1d': '1 Hari',
    '2d': '2 Hari',
    '3d': '3 Hari',
    '5d': '5 Hari',
    '7d': '7 Hari',
    '14d': '14 Hari',
    '30d': '30 Hari',
};

// Get short product name (without validity)
export const getShortProductName = (name: string): string => {
    return name
        .replace(/\s+\d+\s+Hari$/i, '')
        .replace('Voucher Kosong ', '')
        .trim();
};
