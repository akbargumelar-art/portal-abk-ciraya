/**
 * CVM Sales Plan Mock Data Generator
 * 
 * Generates monthly-only sales data for CVM and Super Seru products.
 */

import { outlets } from '../../data/mockData';
import type { CVMMetric, OutletCVMData } from '../../types/cvm';

// Helper to generate random integer
const randomInt = (min: number, max: number): number =>
    Math.floor(Math.random() * (max - min + 1)) + min;

// Generate CVM metric
const generateCVMMetric = (): CVMMetric => {
    const targetMtd = randomInt(50, 300);
    const actualMtd = randomInt(Math.floor(targetMtd * 0.6), Math.floor(targetMtd * 1.3));
    const lastMonthActual = randomInt(Math.floor(actualMtd * 0.7), Math.floor(actualMtd * 1.2));

    return {
        target_mtd: targetMtd,
        actual_mtd: actualMtd,
        last_month_actual: lastMonthActual
    };
};

// Generate CVM data for all outlets
export const generateCVMSalesData = (): OutletCVMData[] => {
    // Use first 50 outlets for performance
    const subsetOutlets = outlets.slice(0, 50);

    return subsetOutlets.map(outlet => ({
        outlet_id: outlet.id,
        id_digipos: outlet.idDigipos,
        outlet_name: outlet.name,
        salesforce_name: outlet.salesforceName,
        tap_name: outlet.tap,
        rs_number: outlet.rsNumber,
        kabupaten: outlet.kabupaten,
        kecamatan: outlet.kecamatan,
        outlet_location: outlet.lokasiOutlet,
        outlet_flag: outlet.flag,
        pjp_status: outlet.pjpStatus,
        products: {
            cvm: generateCVMMetric(),
            super_seru: generateCVMMetric()
        }
    }));
};

// Export pre-generated data
export const cvmSalesData = generateCVMSalesData();
