
import { PERDANA_PRODUCTS, VOUCHER_BRANDS, VOUCHER_VALIDITIES } from '../types/sellthru';
import type { SummaryRow, SellThruMetric } from '../types/sellthru';

export interface SmartSummaryStats {
    totalTarget: number;
    totalActual: number;
    achievementPct: number;
    totalPrevMonth: number;
    momGrowth: number;
    gap: number;
    bestPerformer: { name: string; ach: number } | null;
    worstPerformer: { name: string; ach: number } | null;
    topProduct: { name: string; growth: number } | null;
    // Additional metrics for enhanced display
    totalOutlets: number;
    activeOutletsPct: number;
}

const emptyStats: SmartSummaryStats = {
    totalTarget: 0,
    totalActual: 0,
    achievementPct: 0,
    totalPrevMonth: 0,
    momGrowth: 0,
    gap: 0,
    bestPerformer: null,
    worstPerformer: null,
    topProduct: null,
    totalOutlets: 0,
    activeOutletsPct: 0,
};

export const analyzeSummaryData = (data: SummaryRow[] | null | undefined, mode: 'perdana' | 'voucher'): SmartSummaryStats => {
    // Defensive check for data
    if (!data || !Array.isArray(data) || data.length === 0) {
        return { ...emptyStats };
    }

    try {
        let totalTarget = 0;
        let totalActual = 0;
        let totalPrevMonth = 0;
        let totalOutlets = 0;
        let activeOutlets = 0;

        // To track best/worst areas (TAP/SF)
        let bestPerf = { name: '', ach: -Infinity };
        let worstPerf = { name: '', ach: Infinity };

        // To track product performance
        const productStats: Record<string, { name: string; prev: number; actual: number }> = {};

        // Initialize product keys safely
        if (mode === 'perdana') {
            PERDANA_PRODUCTS.forEach(p => {
                productStats[p.id] = { name: p.name, prev: 0, actual: 0 };
            });
        } else {
            VOUCHER_BRANDS.forEach(brand => {
                VOUCHER_VALIDITIES.forEach(validity => {
                    const id = `${brand}_${validity}`;
                    productStats[id] = { name: `${brand.toUpperCase()} ${validity}`, prev: 0, actual: 0 };
                });
            });
        }

        data.forEach(row => {
            if (!row) return; // Skip null/undefined rows

            const metricsMap: Record<string, SellThruMetric> | undefined = mode === 'perdana' ? row.perdana : row.voucher;

            // Defensive check for metrics map
            if (!metricsMap || typeof metricsMap !== 'object') return;

            let rowTarget = 0;
            let rowActual = 0;
            let hasActivity = false;

            // Safely iterate through metrics
            Object.entries(metricsMap).forEach(([key, m]) => {
                if (m && typeof m === 'object' && 'target' in m && 'actual' in m) {
                    const target = Number(m.target) || 0;
                    const actual = Number(m.actual) || 0;
                    const prevMonth = Number(m.prev_month) || 0;

                    rowTarget += target;
                    rowActual += actual;
                    totalTarget += target;
                    totalActual += actual;
                    totalPrevMonth += prevMonth;

                    if (actual > 0) hasActivity = true;

                    // Aggregate Product Stats
                    if (productStats[key]) {
                        productStats[key].actual += actual;
                        productStats[key].prev += prevMonth;
                    }
                }
            });

            // Count outlets
            totalOutlets += row.outlet_total || 0;
            if (hasActivity) activeOutlets++;

            // Row Achievement
            const rowAch = rowTarget > 0 ? (rowActual / rowTarget) * 100 : 0;

            // Update Best/Worst
            if (rowTarget > 0 && row.name) {
                if (rowAch > bestPerf.ach) bestPerf = { name: row.name, ach: rowAch };
                if (rowAch < worstPerf.ach) worstPerf = { name: row.name, ach: rowAch };
            }
        });

        const achievementPct = totalTarget > 0 ? (totalActual / totalTarget) * 100 : 0;
        const momGrowth = totalPrevMonth > 0 ? ((totalActual - totalPrevMonth) / totalPrevMonth) * 100 : 0;
        const gap = totalActual - totalTarget;
        const activeOutletsPct = data.length > 0 ? (activeOutlets / data.length) * 100 : 0;

        // Find Top Product by Growth
        let topProd = { name: '', growth: -Infinity };
        Object.values(productStats).forEach(p => {
            const g = p.prev > 0 ? ((p.actual - p.prev) / p.prev) * 100 : 0;
            if (g > topProd.growth && p.actual > 0) topProd = { name: p.name, growth: g };
        });

        return {
            totalTarget,
            totalActual,
            achievementPct,
            totalPrevMonth,
            momGrowth,
            gap,
            bestPerformer: bestPerf.ach !== -Infinity ? bestPerf : null,
            worstPerformer: worstPerf.ach !== Infinity ? worstPerf : null,
            topProduct: topProd.growth !== -Infinity ? topProd : null,
            totalOutlets,
            activeOutletsPct,
        };
    } catch (error) {
        console.error('Error in analyzeSummaryData:', error);
        return { ...emptyStats };
    }
};
