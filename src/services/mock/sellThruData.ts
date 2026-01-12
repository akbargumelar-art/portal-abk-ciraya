// Sell Thru Mock Data Generator - Enhanced with Per-Product Stats

import { outlets } from '../../data/mockData';
import type {
    OutletSellThruData,
    SummaryRow,
    D2CSalesforceData,
    D2CSummaryRow,
    SellThruMetric,
    D2CMetric,
} from '../../types/sellthru';
import {
    PERDANA_PRODUCTS,
    VOUCHER_VALIDITIES,
    VOUCHER_BRANDS,
    D2C_PRODUCTS,
} from '../../types/sellthru';

// ===========================================
// HELPER FUNCTIONS
// ===========================================

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const createMetric = (targetBase: number, variance: number = 0.3): SellThruMetric => {
    const target = randomInt(Math.floor(targetBase * 0.8), Math.floor(targetBase * 1.2));
    const actual = randomInt(Math.floor(target * (1 - variance)), Math.floor(target * (1 + variance)));
    const achievement_pct = target > 0 ? (actual / target) * 100 : 0;
    const gap = actual - target;
    const prev_month = randomInt(Math.floor(actual * 0.7), Math.floor(actual * 1.3));
    const mom_growth = prev_month > 0 ? ((actual - prev_month) / prev_month) * 100 : 0;
    const gap_mom = actual - prev_month;

    return { target, actual, achievement_pct, gap, prev_month, mom_growth, gap_mom };
};

const createD2CMetric = (qtyBase: number, revenueMultiplier: number): D2CMetric => {
    const target = randomInt(Math.floor(qtyBase * 0.8), Math.floor(qtyBase * 1.2));
    const actual = randomInt(Math.floor(target * 0.7), Math.floor(target * 1.3));
    const achievement_pct = target > 0 ? (actual / target) * 100 : 0;
    const gap = actual - target;
    const prev_month = randomInt(Math.floor(actual * 0.7), Math.floor(actual * 1.3));
    const mom_growth = prev_month > 0 ? ((actual - prev_month) / prev_month) * 100 : 0;
    const gap_mom = actual - prev_month;

    const revenue_target = target * revenueMultiplier;
    const revenue_actual = actual * revenueMultiplier;
    const revenue_ach_pct = revenue_target > 0 ? (revenue_actual / revenue_target) * 100 : 0;

    return { target, actual, achievement_pct, gap, prev_month, mom_growth, gap_mom, revenue_target, revenue_actual, revenue_ach_pct };
};

const createEmptyMetric = (): SellThruMetric => ({
    target: 0, actual: 0, achievement_pct: 0, gap: 0, prev_month: 0, mom_growth: 0, gap_mom: 0
});

const aggregateMetrics = (metrics: SellThruMetric[]): SellThruMetric => {
    const target = metrics.reduce((sum, m) => sum + m.target, 0);
    const actual = metrics.reduce((sum, m) => sum + m.actual, 0);
    const prev_month = metrics.reduce((sum, m) => sum + m.prev_month, 0);

    return {
        target,
        actual,
        achievement_pct: target > 0 ? (actual / target) * 100 : 0,
        gap: actual - target,
        prev_month,
        mom_growth: prev_month > 0 ? ((actual - prev_month) / prev_month) * 100 : 0,
        gap_mom: actual - prev_month,
    };
};

// ===========================================
// NOTA DATA GENERATOR
// ===========================================

const generateOutletNotaData = (): OutletSellThruData[] => {
    return outlets.map(outlet => {
        const perdana: Record<string, SellThruMetric> = {};
        PERDANA_PRODUCTS.forEach(p => {
            perdana[p.id] = createMetric(30);
        });

        const voucher: Record<string, SellThruMetric> = {};
        VOUCHER_BRANDS.forEach(brand => {
            VOUCHER_VALIDITIES.forEach(validity => {
                let base = 20;
                if (validity === '1d') base = 40;
                else if (validity === '30d') base = 10;
                voucher[`${brand}_${validity}`] = createMetric(base);
            });
        });

        return {
            outlet_id: outlet.id,
            id_digipos: outlet.idDigipos,
            rs_number: outlet.rsNumber,
            outlet_name: outlet.name,
            tap_name: outlet.tap,
            salesforce_name: outlet.salesforceName,
            kabupaten: outlet.kabupaten,
            kecamatan: outlet.kecamatan,
            fisik_status: outlet.physicalStatus,
            flag: outlet.flag,
            hari_pjp: outlet.hariPJP,
            lokasi_outlet: outlet.lokasiOutlet,
            perdana,
            voucher,
        };
    });
};

// ===========================================
// DIGIPOS DATA GENERATOR
// ===========================================

const generateOutletDigiposData = (): OutletSellThruData[] => {
    return outlets.map(outlet => {
        const perdana: Record<string, SellThruMetric> = {};
        PERDANA_PRODUCTS.forEach(p => {
            perdana[p.id] = createMetric(50);
        });

        const voucher: Record<string, SellThruMetric> = {};
        VOUCHER_BRANDS.forEach(brand => {
            VOUCHER_VALIDITIES.forEach(validity => {
                let base = 30;
                if (validity === '1d') base = 60;
                else if (validity === '30d') base = 15;
                voucher[`${brand}_${validity}`] = createMetric(base);
            });
        });

        return {
            outlet_id: outlet.id,
            id_digipos: outlet.idDigipos,
            rs_number: outlet.rsNumber,
            outlet_name: outlet.name,
            tap_name: outlet.tap,
            salesforce_name: outlet.salesforceName,
            kabupaten: outlet.kabupaten,
            kecamatan: outlet.kecamatan,
            fisik_status: outlet.physicalStatus,
            flag: outlet.flag,
            hari_pjp: outlet.hariPJP,
            lokasi_outlet: outlet.lokasiOutlet,
            perdana,
            voucher,
        };
    });
};

// ===========================================
// AGGREGATION TO SUMMARY ROWS (with per-product stats)
// ===========================================

const aggregateToTAPSummary = (outletData: OutletSellThruData[]): SummaryRow[] => {
    const tapMap = new Map<string, OutletSellThruData[]>();
    outletData.forEach(outlet => {
        if (!tapMap.has(outlet.tap_name)) tapMap.set(outlet.tap_name, []);
        tapMap.get(outlet.tap_name)!.push(outlet);
    });

    return Array.from(tapMap.entries()).map(([tapName, tapOutlets]) => {
        const perdana: Record<string, SellThruMetric> = {};
        const voucher: Record<string, SellThruMetric> = {};
        const perdana_outlet_aktif: Record<string, number> = {};
        const perdana_rate_pjp: Record<string, number> = {};
        const voucher_outlet_aktif: Record<string, number> = {};
        const voucher_rate_pjp: Record<string, number> = {};
        const outletTotal = tapOutlets.length;

        // Aggregate perdana
        PERDANA_PRODUCTS.forEach(p => {
            perdana[p.id] = aggregateMetrics(tapOutlets.map(o => o.perdana[p.id] || createEmptyMetric()));
            const aktif = tapOutlets.filter(o => (o.perdana[p.id]?.actual || 0) > 0).length;
            perdana_outlet_aktif[p.id] = aktif;
            perdana_rate_pjp[p.id] = outletTotal > 0 ? (aktif / outletTotal) * 100 : 0;
        });

        // Aggregate voucher
        VOUCHER_BRANDS.forEach(brand => {
            VOUCHER_VALIDITIES.forEach(validity => {
                const key = `${brand}_${validity}`;
                voucher[key] = aggregateMetrics(tapOutlets.map(o => o.voucher[key] || createEmptyMetric()));
                const aktif = tapOutlets.filter(o => (o.voucher[key]?.actual || 0) > 0).length;
                voucher_outlet_aktif[key] = aktif;
                voucher_rate_pjp[key] = outletTotal > 0 ? (aktif / outletTotal) * 100 : 0;
            });
        });

        return {
            name: tapName,
            outlet_total: outletTotal,
            perdana_outlet_aktif,
            perdana_rate_pjp,
            voucher_outlet_aktif,
            voucher_rate_pjp,
            perdana,
            voucher,
        };
    }).sort((a, b) => a.name.localeCompare(b.name));
};

const aggregateToSFSummary = (outletData: OutletSellThruData[]): SummaryRow[] => {
    const sfMap = new Map<string, OutletSellThruData[]>();
    outletData.forEach(outlet => {
        if (!sfMap.has(outlet.salesforce_name)) sfMap.set(outlet.salesforce_name, []);
        sfMap.get(outlet.salesforce_name)!.push(outlet);
    });

    return Array.from(sfMap.entries()).map(([sfName, sfOutlets]) => {
        const perdana: Record<string, SellThruMetric> = {};
        const voucher: Record<string, SellThruMetric> = {};
        const perdana_outlet_aktif: Record<string, number> = {};
        const perdana_rate_pjp: Record<string, number> = {};
        const voucher_outlet_aktif: Record<string, number> = {};
        const voucher_rate_pjp: Record<string, number> = {};
        const outletTotal = sfOutlets.length;

        PERDANA_PRODUCTS.forEach(p => {
            perdana[p.id] = aggregateMetrics(sfOutlets.map(o => o.perdana[p.id] || createEmptyMetric()));
            const aktif = sfOutlets.filter(o => (o.perdana[p.id]?.actual || 0) > 0).length;
            perdana_outlet_aktif[p.id] = aktif;
            perdana_rate_pjp[p.id] = outletTotal > 0 ? (aktif / outletTotal) * 100 : 0;
        });

        VOUCHER_BRANDS.forEach(brand => {
            VOUCHER_VALIDITIES.forEach(validity => {
                const key = `${brand}_${validity}`;
                voucher[key] = aggregateMetrics(sfOutlets.map(o => o.voucher[key] || createEmptyMetric()));
                const aktif = sfOutlets.filter(o => (o.voucher[key]?.actual || 0) > 0).length;
                voucher_outlet_aktif[key] = aktif;
                voucher_rate_pjp[key] = outletTotal > 0 ? (aktif / outletTotal) * 100 : 0;
            });
        });

        return {
            name: sfName,
            outlet_total: outletTotal,
            perdana_outlet_aktif,
            perdana_rate_pjp,
            voucher_outlet_aktif,
            voucher_rate_pjp,
            perdana,
            voucher,
        };
    }).sort((a, b) => a.name.localeCompare(b.name));
};

// ===========================================
// D2C DATA GENERATOR
// ===========================================

const generateD2CData = (): D2CSalesforceData[] => {
    const sfSet = new Set<string>();
    const sfTapMap = new Map<string, string>();
    outlets.forEach(o => {
        sfSet.add(o.salesforceName);
        sfTapMap.set(o.salesforceName, o.tap);
    });

    return Array.from(sfSet).map(sf => {
        const products: Record<string, D2CMetric> = {};
        D2C_PRODUCTS.forEach(p => {
            let qtyBase = 50;
            let revMultiplier = 100000;
            // Perdana products
            if (p.id === 'perdana_simpati_3gb') { qtyBase = 80; revMultiplier = 50000; }
            else if (p.id === 'perdana_byu_3gb') { qtyBase = 60; revMultiplier = 45000; }
            // Voucher products
            else if (p.id === 'voucher_simpati') { qtyBase = 150; revMultiplier = 25000; }
            else if (p.id === 'voucher_byu') { qtyBase = 120; revMultiplier = 22000; }
            // D2C specific products
            else if (p.id === 'orbit') { qtyBase = 30; revMultiplier = 200000; }
            else if (p.id === 'nomor_special') { qtyBase = 20; revMultiplier = 300000; }
            else if (p.id === 'recharge_digipos') { qtyBase = 100; revMultiplier = 50000; }
            products[p.id] = createD2CMetric(qtyBase, revMultiplier);
        });

        return {
            salesforce_name: sf,
            tap_name: sfTapMap.get(sf) || 'Unknown',
            products,
        };
    });
};

const aggregateD2CToTAP = (sfData: D2CSalesforceData[]): D2CSummaryRow[] => {
    const tapMap = new Map<string, D2CSalesforceData[]>();
    sfData.forEach(sf => {
        if (!tapMap.has(sf.tap_name)) tapMap.set(sf.tap_name, []);
        tapMap.get(sf.tap_name)!.push(sf);
    });

    return Array.from(tapMap.entries()).map(([tapName, tapSFs]) => {
        const products: Record<string, D2CMetric> = {};
        D2C_PRODUCTS.forEach(p => {
            const metrics = tapSFs.map(sf => sf.products[p.id]);
            const target = metrics.reduce((sum, m) => sum + m.target, 0);
            const actual = metrics.reduce((sum, m) => sum + m.actual, 0);
            const prev_month = metrics.reduce((sum, m) => sum + m.prev_month, 0);
            const revenue_target = metrics.reduce((sum, m) => sum + m.revenue_target, 0);
            const revenue_actual = metrics.reduce((sum, m) => sum + m.revenue_actual, 0);

            products[p.id] = {
                target, actual,
                achievement_pct: target > 0 ? (actual / target) * 100 : 0,
                gap: actual - target, prev_month,
                mom_growth: prev_month > 0 ? ((actual - prev_month) / prev_month) * 100 : 0,
                gap_mom: actual - prev_month,
                revenue_target, revenue_actual,
                revenue_ach_pct: revenue_target > 0 ? (revenue_actual / revenue_target) * 100 : 0,
            };
        });

        return { name: tapName, sf_count: tapSFs.length, products };
    }).sort((a, b) => a.name.localeCompare(b.name));
};

const aggregateD2CToSF = (sfData: D2CSalesforceData[]): D2CSummaryRow[] => {
    return sfData.map(sf => ({
        name: sf.salesforce_name,
        products: sf.products,
    })).sort((a, b) => a.name.localeCompare(b.name));
};

// ===========================================
// EXPORTED DATA
// ===========================================

export const sellThruNotaOutlets = generateOutletNotaData();
export const sellThruDigiposOutlets = generateOutletDigiposData();

export const notaTAPSummary = aggregateToTAPSummary(sellThruNotaOutlets);
export const notaSFSummary = aggregateToSFSummary(sellThruNotaOutlets);

export const digiposTAPSummary = aggregateToTAPSummary(sellThruDigiposOutlets);
export const digiposSFSummary = aggregateToSFSummary(sellThruDigiposOutlets);

export const d2cSalesforceData = generateD2CData();
export const d2cTAPSummary = aggregateD2CToTAP(d2cSalesforceData);
export const d2cSFSummary = aggregateD2CToSF(d2cSalesforceData);
