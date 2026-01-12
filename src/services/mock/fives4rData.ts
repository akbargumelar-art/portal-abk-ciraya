/**
 * 5S & 4R Mock Data Generator
 * 
 * Generates realistic data for 4 TAPs + CLUSTER TOTAL
 */

import type { FiveSData, FourRData } from '../../types/fives4r';

// ===========================================
// CONSTANTS
// ===========================================
const TAPS = ['TAP PEMUDA', 'TAP PALIMANAN', 'TAP LEMAHABANG', 'TAP KUNINGAN'];

// ===========================================
// HELPERS
// ===========================================
const randomInt = (min: number, max: number): number =>
    Math.floor(Math.random() * (max - min + 1)) + min;

const randomFloat = (min: number, max: number, decimals: number = 1): number =>
    parseFloat((Math.random() * (max - min) + min).toFixed(decimals));

const randomPct = (base: number = 100, variance: number = 30): number =>
    Math.round(base + (Math.random() - 0.5) * variance * 2);

const sumField = <T>(arr: T[], field: keyof T): number =>
    arr.reduce((sum, item) => sum + (typeof item[field] === 'number' ? item[field] as number : 0), 0);

const avgField = <T>(arr: T[], field: keyof T): number => {
    const sum = sumField(arr, field);
    return arr.length > 0 ? Math.round(sum / arr.length) : 0;
};

// ===========================================
// 5S DATA GENERATOR
// ===========================================
const generate5SRow = (tapName: string, scale: number = 1): FiveSData => {
    // SA < ST < SO typically
    const saActual = randomInt(800, 1500) * scale;
    const stActual = saActual + randomInt(200, 500) * scale;
    const soActual = stActual + randomInt(300, 800) * scale;

    const saM1 = Math.round(saActual * randomFloat(0.85, 1.15));
    const stM1 = Math.round(stActual * randomFloat(0.85, 1.15));
    const soM1 = Math.round(soActual * randomFloat(0.85, 1.15));

    const saTarget = Math.round(saActual * randomFloat(0.9, 1.1));
    const stTarget = Math.round(stActual * randomFloat(0.9, 1.1));
    const soTarget = Math.round(soActual * randomFloat(0.9, 1.1));

    const revNsActual = randomFloat(0.5, 2.5, 2) * scale;
    const revSaActual = randomFloat(0.3, 1.5, 2) * scale;
    const revSoActual = randomFloat(0.8, 3.0, 2) * scale;

    return {
        tap_name: tapName,

        // SA
        sa_m1: saM1,
        sa_actual: saActual,
        sa_mom_pct: saM1 > 0 ? Math.round(((saActual - saM1) / saM1) * 100) : 0,
        sa_target: saTarget,
        sa_ach_pct: saTarget > 0 ? Math.round((saActual / saTarget) * 100) : 0,

        // ST
        st_m1: stM1,
        st_actual: stActual,
        st_daily: Math.round(stActual / 26),
        st_mom_pct: stM1 > 0 ? Math.round(((stActual - stM1) / stM1) * 100) : 0,
        st_target: stTarget,
        st_ach_pct: stTarget > 0 ? Math.round((stActual / stTarget) * 100) : 0,

        // SO
        so_m1: soM1,
        so_actual: soActual,
        so_daily: Math.round(soActual / 26),
        so_mom_pct: soM1 > 0 ? Math.round(((soActual - soM1) / soM1) * 100) : 0,
        so_target: soTarget,
        so_ach_pct: soTarget > 0 ? Math.round((soActual / soTarget) * 100) : 0,
        ratio_st_so: stActual > 0 ? Math.round((soActual / stActual) * 100) : 0,
        ratio_sa_so: saActual > 0 ? Math.round((soActual / saActual) * 100) : 0,

        // Ratio
        stock_qty: randomInt(5000, 15000) * scale,
        stock_days: randomInt(15, 45),
        cluster_domination: randomPct(75, 20),
        cluster_healthy: randomPct(80, 15),

        // Sales Renewal
        sr_pct: randomPct(65, 20),
        so_qty: soActual,
        renewal_qty: Math.round(soActual * randomFloat(0.4, 0.7)),
        renewal_mom_pct: randomPct(0, 15),

        // Rev New Sales
        rev_ns_m1: randomFloat(0.4, 2.0, 2) * scale,
        rev_ns_actual: revNsActual,
        rev_ns_mom_pct: randomPct(0, 20),
        rev_ns_target: randomFloat(0.5, 2.0, 2) * scale,
        rev_ns_ach_pct: randomPct(95, 20),

        // Rev SA
        rev_sa_m1: randomFloat(0.2, 1.2, 2) * scale,
        rev_sa_actual: revSaActual,
        rev_sa_mom_pct: randomPct(0, 15),

        // Rev SO
        rev_so_m1: randomFloat(0.6, 2.5, 2) * scale,
        rev_so_actual: revSoActual,
        rev_so_mom_pct: randomPct(0, 15),
        rev_so_target: randomFloat(0.7, 2.8, 2) * scale,
        rev_so_ach_pct: randomPct(98, 18),
    };
};

export const generate5SData = (): FiveSData[] => {
    const tapData = TAPS.map(tap => generate5SRow(tap, 1));

    // Calculate CLUSTER TOTAL
    const total: FiveSData = {
        tap_name: 'CLUSTER TOTAL',

        sa_m1: sumField(tapData, 'sa_m1'),
        sa_actual: sumField(tapData, 'sa_actual'),
        sa_mom_pct: avgField(tapData, 'sa_mom_pct'),
        sa_target: sumField(tapData, 'sa_target'),
        sa_ach_pct: avgField(tapData, 'sa_ach_pct'),

        st_m1: sumField(tapData, 'st_m1'),
        st_actual: sumField(tapData, 'st_actual'),
        st_daily: sumField(tapData, 'st_daily'),
        st_mom_pct: avgField(tapData, 'st_mom_pct'),
        st_target: sumField(tapData, 'st_target'),
        st_ach_pct: avgField(tapData, 'st_ach_pct'),

        so_m1: sumField(tapData, 'so_m1'),
        so_actual: sumField(tapData, 'so_actual'),
        so_daily: sumField(tapData, 'so_daily'),
        so_mom_pct: avgField(tapData, 'so_mom_pct'),
        so_target: sumField(tapData, 'so_target'),
        so_ach_pct: avgField(tapData, 'so_ach_pct'),
        ratio_st_so: avgField(tapData, 'ratio_st_so'),
        ratio_sa_so: avgField(tapData, 'ratio_sa_so'),

        stock_qty: sumField(tapData, 'stock_qty'),
        stock_days: avgField(tapData, 'stock_days'),
        cluster_domination: avgField(tapData, 'cluster_domination'),
        cluster_healthy: avgField(tapData, 'cluster_healthy'),

        sr_pct: avgField(tapData, 'sr_pct'),
        so_qty: sumField(tapData, 'so_qty'),
        renewal_qty: sumField(tapData, 'renewal_qty'),
        renewal_mom_pct: avgField(tapData, 'renewal_mom_pct'),

        rev_ns_m1: parseFloat(tapData.reduce((s, d) => s + d.rev_ns_m1, 0).toFixed(2)),
        rev_ns_actual: parseFloat(tapData.reduce((s, d) => s + d.rev_ns_actual, 0).toFixed(2)),
        rev_ns_mom_pct: avgField(tapData, 'rev_ns_mom_pct'),
        rev_ns_target: parseFloat(tapData.reduce((s, d) => s + d.rev_ns_target, 0).toFixed(2)),
        rev_ns_ach_pct: avgField(tapData, 'rev_ns_ach_pct'),

        rev_sa_m1: parseFloat(tapData.reduce((s, d) => s + d.rev_sa_m1, 0).toFixed(2)),
        rev_sa_actual: parseFloat(tapData.reduce((s, d) => s + d.rev_sa_actual, 0).toFixed(2)),
        rev_sa_mom_pct: avgField(tapData, 'rev_sa_mom_pct'),

        rev_so_m1: parseFloat(tapData.reduce((s, d) => s + d.rev_so_m1, 0).toFixed(2)),
        rev_so_actual: parseFloat(tapData.reduce((s, d) => s + d.rev_so_actual, 0).toFixed(2)),
        rev_so_mom_pct: avgField(tapData, 'rev_so_mom_pct'),
        rev_so_target: parseFloat(tapData.reduce((s, d) => s + d.rev_so_target, 0).toFixed(2)),
        rev_so_ach_pct: avgField(tapData, 'rev_so_ach_pct'),
    };

    return [...tapData, total];
};

// ===========================================
// 4R DATA GENERATOR
// ===========================================
const generate4RRow = (tapName: string, scale: number = 1): FourRData => {
    const register = randomInt(400, 800) * scale;
    const pjpFisikActual = Math.round(register * randomFloat(0.7, 0.9));
    const pjpFisikM1 = Math.round(pjpFisikActual * randomFloat(0.9, 1.1));

    const oaSpActual = Math.round(pjpFisikActual * randomFloat(0.5, 0.75));
    const opSpActual = Math.round(oaSpActual * randomFloat(0.6, 0.85));

    const oaPvActual = Math.round(pjpFisikActual * randomFloat(0.4, 0.65));
    const opPvActual = Math.round(oaPvActual * randomFloat(0.5, 0.8));

    const omsetActual = Math.round(pjpFisikActual * randomFloat(0.6, 0.85));

    return {
        tap_name: tapName,

        // RS Coverage
        register,
        pjp_fisik_m1: pjpFisikM1,
        pjp_fisik_actual: pjpFisikActual,
        cov_mom_pct: pjpFisikM1 > 0 ? Math.round(((pjpFisikActual - pjpFisikM1) / pjpFisikM1) * 100) : 0,
        rate_to_register: register > 0 ? Math.round((pjpFisikActual / register) * 100) : 0,

        // RS ST-SP (OA)
        oa_sp_m1: Math.round(oaSpActual * randomFloat(0.9, 1.1)),
        oa_sp_actual: oaSpActual,
        oa_sp_mom: randomPct(0, 12),
        rate_oa_sp_pjp: pjpFisikActual > 0 ? Math.round((oaSpActual / pjpFisikActual) * 100) : 0,
        qty_st: randomInt(3000, 8000) * scale,
        avg_st_outlet: randomFloat(8, 20, 1),

        // RS ST-SP (OP)
        op_sp_m1: Math.round(opSpActual * randomFloat(0.9, 1.1)),
        op_sp_actual: opSpActual,
        op_sp_mom: randomPct(0, 10),
        rate_op_sp_pjp: pjpFisikActual > 0 ? Math.round((opSpActual / pjpFisikActual) * 100) : 0,

        // RS ST PV (OA)
        oa_pv_m1: Math.round(oaPvActual * randomFloat(0.9, 1.1)),
        oa_pv_actual: oaPvActual,
        oa_pv_mom: randomPct(0, 12),
        rate_oa_pv_pjp: pjpFisikActual > 0 ? Math.round((oaPvActual / pjpFisikActual) * 100) : 0,
        qty_st_pv: randomInt(5000, 15000) * scale,
        avg_st_pv_outlet: randomFloat(15, 40, 1),

        // RS ST PV (OP)
        op_pv_m1: Math.round(opPvActual * randomFloat(0.9, 1.1)),
        op_pv_actual: opPvActual,
        op_pv_mom: randomPct(0, 10),
        rate_op_pv_pjp: pjpFisikActual > 0 ? Math.round((opPvActual / pjpFisikActual) * 100) : 0,

        // RS Omset
        omset_m1: Math.round(omsetActual * randomFloat(0.9, 1.1)),
        omset_actual: omsetActual,
        omset_mom: randomPct(0, 12),
        rate_omset_pjp: pjpFisikActual > 0 ? Math.round((omsetActual / pjpFisikActual) * 100) : 0,
        rev_m1: randomFloat(0.8, 3.0, 2) * scale,
        rev_actual: randomFloat(1.0, 3.5, 2) * scale,
        rev_mom: randomPct(0, 15),
    };
};

export const generate4RData = (): FourRData[] => {
    const tapData = TAPS.map(tap => generate4RRow(tap, 1));

    // Calculate CLUSTER TOTAL
    const total: FourRData = {
        tap_name: 'CLUSTER TOTAL',

        register: sumField(tapData, 'register'),
        pjp_fisik_m1: sumField(tapData, 'pjp_fisik_m1'),
        pjp_fisik_actual: sumField(tapData, 'pjp_fisik_actual'),
        cov_mom_pct: avgField(tapData, 'cov_mom_pct'),
        rate_to_register: avgField(tapData, 'rate_to_register'),

        oa_sp_m1: sumField(tapData, 'oa_sp_m1'),
        oa_sp_actual: sumField(tapData, 'oa_sp_actual'),
        oa_sp_mom: avgField(tapData, 'oa_sp_mom'),
        rate_oa_sp_pjp: avgField(tapData, 'rate_oa_sp_pjp'),
        qty_st: sumField(tapData, 'qty_st'),
        avg_st_outlet: avgField(tapData, 'avg_st_outlet'),

        op_sp_m1: sumField(tapData, 'op_sp_m1'),
        op_sp_actual: sumField(tapData, 'op_sp_actual'),
        op_sp_mom: avgField(tapData, 'op_sp_mom'),
        rate_op_sp_pjp: avgField(tapData, 'rate_op_sp_pjp'),

        oa_pv_m1: sumField(tapData, 'oa_pv_m1'),
        oa_pv_actual: sumField(tapData, 'oa_pv_actual'),
        oa_pv_mom: avgField(tapData, 'oa_pv_mom'),
        rate_oa_pv_pjp: avgField(tapData, 'rate_oa_pv_pjp'),
        qty_st_pv: sumField(tapData, 'qty_st_pv'),
        avg_st_pv_outlet: avgField(tapData, 'avg_st_pv_outlet'),

        op_pv_m1: sumField(tapData, 'op_pv_m1'),
        op_pv_actual: sumField(tapData, 'op_pv_actual'),
        op_pv_mom: avgField(tapData, 'op_pv_mom'),
        rate_op_pv_pjp: avgField(tapData, 'rate_op_pv_pjp'),

        omset_m1: sumField(tapData, 'omset_m1'),
        omset_actual: sumField(tapData, 'omset_actual'),
        omset_mom: avgField(tapData, 'omset_mom'),
        rate_omset_pjp: avgField(tapData, 'rate_omset_pjp'),
        rev_m1: parseFloat(tapData.reduce((s, d) => s + d.rev_m1, 0).toFixed(2)),
        rev_actual: parseFloat(tapData.reduce((s, d) => s + d.rev_actual, 0).toFixed(2)),
        rev_mom: avgField(tapData, 'rev_mom'),
    };

    return [...tapData, total];
};

// Pre-generated data
export const fiveSData = generate5SData();
export const fourRData = generate4RData();
