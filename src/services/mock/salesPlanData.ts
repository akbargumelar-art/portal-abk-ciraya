import { outlets } from '../../data/mockData';
import type { OutletSalesPlan, ProductMetric } from '../../types/salesPlan';

// Helper to generate random integer
const randomInt = (min: number, max: number): number =>
    Math.floor(Math.random() * (max - min + 1)) + min;

// Product Groups keys
const productKeys = ['simpati_3gb', 'simpati_segel', 'byu_3gb', 'byu_segel'];

export const generateSalesPlanData = (): OutletSalesPlan[] => {
    // Generate for shorter list to avoid massive mock file in memory if needed, 
    // but using full outlets list (limited to 50 for this demo purpose if performance is concern, otherwise full)
    // Let's use first 100 outlets for now.
    const subsetOutlets = outlets.slice(0, 100);

    return subsetOutlets.map(outlet => {
        const products: { [key: string]: ProductMetric } = {};

        productKeys.forEach(key => {
            const mtdTarget = randomInt(50, 200);

            // Distribute target across 5 weeks roughly
            // Just random split, summing to mtdTarget
            const w1Target = Math.floor(mtdTarget * 0.2);
            const w2Target = Math.floor(mtdTarget * 0.25);
            const w3Target = Math.floor(mtdTarget * 0.25);
            const w4Target = Math.floor(mtdTarget * 0.2);
            const w5Target = mtdTarget - w1Target - w2Target - w3Target - w4Target;

            const targetWeekly = [w1Target, w2Target, w3Target, w4Target, w5Target];

            // Actuals (Simulate we are in Week 3, so W4 and W5 might be 0 or projected)
            // Let's simulate full month data present for demo

            const w1Actual = randomInt(w1Target * 0.5, w1Target * 1.5);
            const w2Actual = randomInt(w2Target * 0.5, w2Target * 1.5);
            const w3Actual = randomInt(w3Target * 0.5, w3Target * 1.5);
            const w4Actual = randomInt(w4Target * 0.5, w4Target * 1.5);
            const w5Actual = randomInt(w5Target * 0.5, w5Target * 1.5);

            const actualWeekly = [w1Actual, w2Actual, w3Actual, w4Actual, w5Actual];
            const mtdActual = actualWeekly.reduce((a, b) => a + b, 0);

            // Gaps
            const gapWeekly = actualWeekly.map((act, i) => act - targetWeekly[i]);
            const mtdGap = mtdActual - mtdTarget;

            // Ach %
            const achievement_pct = mtdTarget > 0 ? (mtdActual / mtdTarget) * 100 : 0;

            // MoM (Random)
            const mom_growth = randomInt(-30, 50);

            products[key] = {
                target: { weekly: targetWeekly, mtd: mtdTarget },
                actual: { weekly: actualWeekly, mtd: mtdActual },
                gap: { weekly: gapWeekly, mtd: mtdGap },
                achievement_pct,
                mom_growth
            };
        });

        return {
            outlet_id: outlet.id,
            id_digipos: outlet.idDigipos,
            outlet_name: outlet.name,
            salesforce_name: outlet.salesforceName,
            tap_name: outlet.tap,
            rs_number: outlet.rsNumber,
            kabupaten: outlet.kabupaten,
            kecamatan: outlet.kecamatan,
            pjp_status: outlet.pjpStatus,
            physical_status: outlet.physicalStatus,
            outlet_location: outlet.lokasiOutlet,
            outlet_flag: outlet.flag,
            products
        };
    });
};

export const salesPlanData = generateSalesPlanData();
