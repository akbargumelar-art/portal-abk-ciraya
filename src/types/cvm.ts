/**
 * CVM (Customer Value Management) Types
 * 
 * Simplified metric structure for monthly-only tracking.
 * CVM products do NOT have daily/weekly targets.
 */

export interface CVMMetric {
    target_mtd: number;
    actual_mtd: number;
    last_month_actual: number; // For MoM comparison
    // Computed on frontend:
    // achievement_pct = (actual_mtd / target_mtd) * 100
    // gap = actual_mtd - target_mtd
    // growth_num = actual_mtd - last_month_actual
}

export interface OutletCVMData {
    outlet_id: string;
    id_digipos: string;
    outlet_name: string;
    salesforce_name: string;
    tap_name: string;
    rs_number: string;
    kabupaten: string;
    kecamatan: string;
    outlet_location: string;
    outlet_flag: string;
    pjp_status: string;
    products: {
        cvm: CVMMetric;
        super_seru: CVMMetric;
    };
}

// Product definitions for CVM page
export const CVM_PRODUCTS = [
    { key: 'cvm', label: 'CVM' },
    { key: 'super_seru', label: 'Super Seru' },
] as const;

export type CVMProductKey = typeof CVM_PRODUCTS[number]['key'];
