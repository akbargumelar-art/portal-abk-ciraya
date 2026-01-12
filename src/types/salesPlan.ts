/**
 * Sales Plan Types
 * Phase 2 Data Model
 */

export interface ProductMetric {
    target: {
        weekly: number[]; // Index 0-4 for weeks 1-5
        mtd: number
    };
    actual: {
        weekly: number[]; // Index 0-4
        mtd: number
    };
    gap: {
        weekly: number[]; // Index 0-4
        mtd: number
    };
    achievement_pct: number;
    mom_growth: number;
}

export interface OutletSalesPlan {
    outlet_id: string;
    outlet_name: string;
    id_digipos: string; // Added to match previous usage
    salesforce_name: string;
    tap_name: string;
    rs_number: string;
    kabupaten: string;
    kecamatan: string;
    pjp_status: string;
    physical_status: string;
    outlet_location: string;
    outlet_flag: string;
    products: {
        [key: string]: ProductMetric; // 'simpati_3gb', 'byu_segel', etc.
    };
}
