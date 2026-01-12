/**
 * Voucher Sales Plan Mock Data Generator
 * 
 * Generates random sales data for all voucher products with weekly/MTD structure.
 */

import { outlets } from '../../data/mockData';
import { VOUCHER_PRODUCTS } from '../../config/voucherConfig';
import type { VoucherProduct } from '../../config/voucherConfig';
import type { ProductMetric } from '../../types/salesPlan';

export interface VoucherOutletSalesPlan {
    outlet_id: string;
    id_digipos: string;
    outlet_name: string;
    salesforce_name: string;
    tap_name: string;
    rs_number: string;
    kabupaten: string;
    outlet_flag: string;
    outlet_location: 'Ring 1' | 'Ring 2' | 'Ring 3';
    products: { [productId: string]: ProductMetric };
}

// Helper to generate random integer
const randomInt = (min: number, max: number): number =>
    Math.floor(Math.random() * (max - min + 1)) + min;

// Generate product metrics for a single product
const generateProductMetric = (): ProductMetric => {
    const mtdTarget = randomInt(20, 100);

    // Distribute target across 5 weeks
    const w1Target = Math.floor(mtdTarget * 0.2);
    const w2Target = Math.floor(mtdTarget * 0.25);
    const w3Target = Math.floor(mtdTarget * 0.25);
    const w4Target = Math.floor(mtdTarget * 0.2);
    const w5Target = mtdTarget - w1Target - w2Target - w3Target - w4Target;

    const targetWeekly = [w1Target, w2Target, w3Target, w4Target, w5Target];

    // Actuals (random variance from target)
    const actualWeekly = targetWeekly.map(t => randomInt(Math.floor(t * 0.5), Math.floor(t * 1.5)));
    const mtdActual = actualWeekly.reduce((a, b) => a + b, 0);

    // Gaps
    const gapWeekly = actualWeekly.map((act, i) => act - targetWeekly[i]);
    const mtdGap = mtdActual - mtdTarget;

    // Achievement %
    const achievementPct = mtdTarget > 0 ? (mtdActual / mtdTarget) * 100 : 0;

    // MoM (Random)
    const momGrowth = randomInt(-30, 50);

    return {
        target: { weekly: targetWeekly, mtd: mtdTarget },
        actual: { weekly: actualWeekly, mtd: mtdActual },
        gap: { weekly: gapWeekly, mtd: mtdGap },
        achievement_pct: achievementPct,
        mom_growth: momGrowth
    };
};

// Generate sales data for all outlets
export const generateVoucherSalesData = (): VoucherOutletSalesPlan[] => {
    // Use first 50 outlets for performance
    const subsetOutlets = outlets.slice(0, 50);

    return subsetOutlets.map(outlet => {
        const products: { [productId: string]: ProductMetric } = {};

        // Generate data for each voucher product
        VOUCHER_PRODUCTS.forEach((product: VoucherProduct) => {
            products[product.id] = generateProductMetric();
        });

        return {
            outlet_id: outlet.id,
            id_digipos: outlet.idDigipos,
            outlet_name: outlet.name,
            salesforce_name: outlet.salesforceName,
            tap_name: outlet.tap,
            rs_number: (outlet as any).rs_number || `RS${randomInt(10000, 99999)}`,
            kabupaten: (outlet as any).kabupaten || ['Cirebon', 'Indramayu', 'Majalengka', 'Kuningan'][randomInt(0, 3)],
            outlet_flag: (outlet as any).outlet_flag || ['GOLD', 'SILVER', 'BRONZE'][randomInt(0, 2)],
            outlet_location: (['Ring 1', 'Ring 2', 'Ring 3'] as const)[randomInt(0, 2)],
            products
        };
    });
};

// Export pre-generated data
export const voucherSalesData = generateVoucherSalesData();
