/**
 * Aktifasi Mock Data Generator
 * 
 * Generates data for 3 areas + TOTAL with Revenue and Quantity metrics
 */

import type { AreaSummary, DailyTrend, AktifasiData, MetricSet } from '../../types/aktifasi';

// ===========================================
// CONSTANTS
// ===========================================
const AREAS = ['Cirebon', 'Kota Cirebon', 'Kuningan'];

// ===========================================
// HELPERS
// ===========================================
const randomInt = (min: number, max: number): number =>
    Math.floor(Math.random() * (max - min + 1)) + min;

const randomFloat = (min: number, max: number, decimals: number = 2): number =>
    parseFloat((Math.random() * (max - min) + min).toFixed(decimals));

// Generate a MetricSet with realistic values
const generateMetricSet = (baseValue: number, isRevenue: boolean): MetricSet => {
    const multiplier = isRevenue ? 1000000 : 1; // Revenue in millions
    const variance = 0.15;

    const target = Math.round(baseValue * multiplier * randomFloat(0.9, 1.1));
    const targetCommit = Math.round(target * randomFloat(0.85, 0.95));
    const actual = Math.round(target * randomFloat(0.8, 1.05));
    const lastMonthFull = Math.round(target * randomFloat(0.85, 1.0));
    const lmsd = Math.round(actual * randomFloat(0.85, 1.1));

    return {
        target,
        target_commit: targetCommit,
        actual,
        last_month_full: Math.round(lastMonthFull),
        lmsd,
    };
};

// Sum MetricSets
const sumMetricSet = (sets: MetricSet[]): MetricSet => ({
    target: sets.reduce((s, m) => s + m.target, 0),
    target_commit: sets.reduce((s, m) => s + m.target_commit, 0),
    actual: sets.reduce((s, m) => s + m.actual, 0),
    last_month_full: sets.reduce((s, m) => s + m.last_month_full, 0),
    lmsd: sets.reduce((s, m) => s + m.lmsd, 0),
});

// ===========================================
// AREA SUMMARY GENERATOR
// ===========================================
const generateAreaSummaries = (isRevenue: boolean): AreaSummary[] => {
    const baseValueSimpati = isRevenue ? 500 : 2000;
    const baseValueByu = isRevenue ? 300 : 1500;

    const areas = AREAS.map(area => {
        const areaMultiplier = area === 'Cirebon' ? 1.2 : area === 'Kota Cirebon' ? 1.0 : 0.8;

        const simpati = generateMetricSet(baseValueSimpati * areaMultiplier, isRevenue);
        const byu = generateMetricSet(baseValueByu * areaMultiplier, isRevenue);
        const total = sumMetricSet([simpati, byu]);

        return {
            area_name: area,
            simpati,
            byu,
            total,
        };
    });

    // Calculate TOTAL row
    const totalRow: AreaSummary = {
        area_name: 'TOTAL',
        simpati: sumMetricSet(areas.map(a => a.simpati)),
        byu: sumMetricSet(areas.map(a => a.byu)),
        total: sumMetricSet(areas.map(a => a.total)),
    };

    return [...areas, totalRow];
};

// ===========================================
// DAILY TREND GENERATOR
// ===========================================
const generateDailyTrend = (areaName: string, isRevenue: boolean): DailyTrend[] => {
    const daysInMonth = 31;
    const currentDay = new Date().getDate();
    const baseMultiplier = isRevenue ? 50000 : 200;
    const areaMultiplier = areaName === 'Cirebon' ? 1.2 : areaName === 'Kota Cirebon' ? 1.0 : areaName === 'TOTAL' ? 3.0 : 0.8;

    return Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const isFuture = day > currentDay;

        // Generate with some variance
        const simpatiCurrent = isFuture ? 0 : Math.round(baseMultiplier * areaMultiplier * randomFloat(0.8, 1.2));
        const simpatiLM = Math.round(baseMultiplier * areaMultiplier * randomFloat(0.75, 1.1));
        const byuCurrent = isFuture ? 0 : Math.round(baseMultiplier * areaMultiplier * 0.6 * randomFloat(0.8, 1.2));
        const byuLM = Math.round(baseMultiplier * areaMultiplier * 0.6 * randomFloat(0.75, 1.1));

        return {
            date: `2025-12-${String(day).padStart(2, '0')}`,
            day,
            simpati: { current: simpatiCurrent, last_month: simpatiLM },
            byu: { current: byuCurrent, last_month: byuLM },
            total: {
                current: simpatiCurrent + byuCurrent,
                last_month: simpatiLM + byuLM
            },
        };
    });
};

// ===========================================
// MAIN DATA GENERATOR
// ===========================================
export const generateAktifasiData = (): AktifasiData => {
    const allAreas = [...AREAS, 'TOTAL'];

    return {
        revenue: generateAreaSummaries(true),
        quantity: generateAreaSummaries(false),
        dailyTrendRevenue: allAreas.reduce((acc, area) => {
            acc[area] = generateDailyTrend(area, true);
            return acc;
        }, {} as Record<string, DailyTrend[]>),
        dailyTrendQuantity: allAreas.reduce((acc, area) => {
            acc[area] = generateDailyTrend(area, false);
            return acc;
        }, {} as Record<string, DailyTrend[]>),
    };
};

// Pre-generated data
export const aktifasiData = generateAktifasiData();
