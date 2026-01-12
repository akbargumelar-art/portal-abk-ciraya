// Sell Thru Module Types - Enhanced with Performance Metrics

// ===========================================
// PRODUCT DEFINITIONS
// ===========================================

// Perdana Products (shared by Nota and Digipos)
export const PERDANA_PRODUCTS = [
    { id: 'simpati_3gb', name: 'Simpati 3GB', brand: 'simpati' },
    { id: 'simpati_segel', name: 'Simpati Segel', brand: 'simpati' },
    { id: 'byu_3gb', name: 'byU 3GB', brand: 'byu' },
    { id: 'byu_segel', name: 'byU Segel', brand: 'byu' },
] as const;

// Voucher Validity Types (aggregated, not SKU level)
export const VOUCHER_VALIDITIES = ['vo', '1d', '3d', '5d', '7d', '14d', '30d'] as const;
export const VOUCHER_BRANDS = ['simpati', 'byu'] as const;

// Voucher Products (Brand + Validity combinations)
export const VOUCHER_PRODUCTS = VOUCHER_BRANDS.flatMap(brand =>
    VOUCHER_VALIDITIES.map(validity => ({
        id: `${brand}_${validity}`,
        name: `${brand === 'simpati' ? 'Simpati' : 'byU'} ${validity.toUpperCase()}`,
        brand,
        validity,
    }))
);

// D2C Products (specific to D2C page)
export const D2C_PRODUCTS = [
    { id: 'perdana_simpati_3gb', name: 'Perdana Simpati 3GB', category: 'perdana' },
    { id: 'perdana_byu_3gb', name: 'Perdana byU 3GB', category: 'perdana' },
    { id: 'voucher_simpati', name: 'Voucher Simpati', category: 'voucher' },
    { id: 'voucher_byu', name: 'Voucher byU', category: 'voucher' },
    { id: 'orbit', name: 'Orbit', category: 'd2c' },
    { id: 'nomor_special', name: 'Nomor Special', category: 'd2c' },
    { id: 'recharge_digipos', name: 'Recharge Digipos', category: 'd2c' },
] as const;

// Validity Labels
export const VALIDITY_LABELS: Record<string, string> = {
    vo: 'VO',
    '1d': '1 Hari',
    '3d': '3 Hari',
    '5d': '5 Hari',
    '7d': '7 Hari',
    '14d': '14 Hari',
    '30d': '30 Hari',
};

// ===========================================
// ENHANCED METRICS (with Target, Ach, Gap, M-1, MoM)
// ===========================================

// Full metric for most products
export interface SellThruMetric {
    target: number;
    actual: number;
    achievement_pct: number;
    gap: number;           // actual - target
    prev_month: number;    // M-1 (same date last month)
    mom_growth: number;    // (actual - prev_month) / prev_month * 100
    gap_mom: number;       // actual - prev_month
}

// D2C metric with revenue
export interface D2CMetric {
    target: number;
    actual: number;
    achievement_pct: number;
    gap: number;
    prev_month: number;
    mom_growth: number;
    gap_mom: number;
    revenue_target: number;
    revenue_actual: number;
    revenue_ach_pct: number;
}

// ===========================================
// OUTLET LEVEL DATA
// ===========================================

export interface OutletSellThruData {
    outlet_id: string;
    id_digipos: string;
    rs_number: string;
    outlet_name: string;
    tap_name: string;
    salesforce_name: string;
    kabupaten: string;
    kecamatan: string;
    fisik_status: 'Fisik' | 'Non Fisik';
    flag: string; // Add flag (Retail, Pareto, D2C, etc.)
    hari_pjp: string;
    lokasi_outlet: 'Ring 1' | 'Ring 2' | 'Ring 3';
    perdana: Record<string, SellThruMetric>;
    voucher: Record<string, SellThruMetric>;
}

// ===========================================
// SUMMARY ROW (for TAP and SF tables)
// ===========================================

export interface SummaryRow {
    name: string;
    outlet_total: number;
    // Per-product outlet aktif and rate PJP
    perdana_outlet_aktif: Record<string, number>;  // product_id -> count of active outlets
    perdana_rate_pjp: Record<string, number>;      // product_id -> aktif/total * 100
    voucher_outlet_aktif: Record<string, number>;
    voucher_rate_pjp: Record<string, number>;
    perdana: Record<string, SellThruMetric>;
    voucher: Record<string, SellThruMetric>;
}

// ===========================================
// D2C STRUCTURES
// ===========================================

export interface D2CSalesforceData {
    salesforce_name: string;
    tap_name: string;
    products: Record<string, D2CMetric>;
}

export interface D2CSummaryRow {
    name: string;
    sf_count?: number;
    products: Record<string, D2CMetric>;
}

// ===========================================
// COLUMN DEFINITIONS
// ===========================================

export interface ColumnGroup {
    key: string;
    label: string;
    brand?: string;
    columns: ColumnDef[];
}

export interface ColumnDef {
    key: string;
    label: string;
    width?: number;
    headerBg?: string;
}
