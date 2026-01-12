/**
 * Market Share Mock Data Generator
 * 
 * Generates data for City and Kecamatan views
 */

import type { MarketShareCity, MarketShareKecamatan, TrendFBData } from '../../types/marketshare';

// ===========================================
// CONSTANTS
// ===========================================
const CITIES = ['KUNINGAN', 'CIREBON', 'INDRAMAYU', 'SUBANG'];

const KECAMATAN_MAP: Record<string, { tap: string; kab: string; kecs: string[] }> = {
    'CIREBON': {
        tap: 'TAP PEMUDA',
        kab: 'Kota Cirebon',
        kecs: ['Harjamukti', 'Kejaksan', 'Kesambi', 'Lemahwungkuk', 'Pekalipan'],
    },
    'CIREBON_KAB': {
        tap: 'TAP PALIMANAN',
        kab: 'Kab. Cirebon',
        kecs: ['Arjawinangun', 'Astanajapura', 'Babakan', 'Ciledug', 'Gebang', 'Losari', 'Palimanan', 'Plered', 'Sumber', 'Weru'],
    },
    'LEMAHABANG': {
        tap: 'TAP LEMAHABANG',
        kab: 'Kab. Cirebon',
        kecs: ['Lemahabang', 'Karangwareng', 'Astanajapura', 'Depok', 'Pangenan'],
    },
    'KUNINGAN': {
        tap: 'TAP KUNINGAN',
        kab: 'Kab. Kuningan',
        kecs: ['Kuningan', 'Cigugur', 'Cilimus', 'Ciawigebang', 'Luragung', 'Kadugede', 'Jalaksana', 'Kramatmulya', 'Lebakwangi', 'Cibingbin'],
    },
};

// ===========================================
// HELPERS
// ===========================================
const randomFloat = (min: number, max: number, decimals: number = 1): number =>
    parseFloat((Math.random() * (max - min) + min).toFixed(decimals));

const randomInt = (min: number, max: number): number =>
    Math.floor(Math.random() * (max - min + 1)) + min;

// ===========================================
// CITY DATA GENERATOR
// ===========================================
export const generateCityData = (): MarketShareCity[] => {
    return CITIES.map(city => {
        // Generate shares that sum to ~100%
        const tsel = randomFloat(35, 50);
        const isat = randomFloat(15, 25);
        const xl = randomFloat(12, 22);
        const three = randomFloat(8, 18);
        const sf = parseFloat((100 - tsel - isat - xl - three).toFixed(1));

        // Find highest competitor
        const competitors = [
            { name: 'Indosat', share: isat },
            { name: 'XL', share: xl },
            { name: 'Three', share: three },
            { name: 'SmartFren', share: sf },
        ].sort((a, b) => b.share - a.share);

        const highestComp = competitors[0];
        const gap = parseFloat((tsel - highestComp.share).toFixed(1));

        // Generate trend diffs
        const genDiff = () => ({
            tsel: randomFloat(-3, 5),
            isat: randomFloat(-3, 3),
            xl: randomFloat(-3, 3),
            three: randomFloat(-3, 3),
        });

        return {
            city_name: city,
            tsel_share: tsel,
            isat_share: isat,
            xl_share: xl,
            three_share: three,
            sf_share: sf,
            wow_diff: genDiff(),
            mom_diff: genDiff(),
            yoy_diff: genDiff(),
            rank_tsel: 1, // Tsel usually rank 1
            highest_competitor: highestComp.name,
            gap_to_highest: gap,
        };
    });
};

// ===========================================
// KECAMATAN DATA GENERATOR
// ===========================================
export const generateKecamatanData = (): MarketShareKecamatan[] => {
    const data: MarketShareKecamatan[] = [];

    Object.entries(KECAMATAN_MAP).forEach(([cluster, info]) => {
        info.kecs.forEach(kec => {
            // Generate shares
            const tsel = randomFloat(30, 55);
            const ioh = randomFloat(20, 40);
            const xlPlus = parseFloat((100 - tsel - ioh).toFixed(1));

            // Historical data
            const tselW1 = tsel + randomFloat(-3, 3);
            const tselM1 = tsel + randomFloat(-5, 5);
            const iohW1 = ioh + randomFloat(-2, 2);
            const iohM1 = ioh + randomFloat(-3, 3);
            const xlPlusW1 = xlPlus + randomFloat(-2, 2);
            const xlPlusM1 = xlPlus + randomFloat(-3, 3);

            // Growth calculations
            const wowGrowth = parseFloat((tsel - tselW1).toFixed(1));
            const momGrowth = parseFloat((tsel - tselM1).toFixed(1));

            // Determine rank
            const shares = [
                { op: 'Tsel', share: tsel },
                { op: 'IOH', share: ioh },
                { op: 'XL+', share: xlPlus },
            ].sort((a, b) => b.share - a.share);

            const rankTsel = shares.findIndex(s => s.op === 'Tsel') + 1;
            const gapToHighest = rankTsel === 1 ? tsel - shares[1].share : tsel - shares[0].share;
            const winLose = rankTsel === 1 ? 'WIN' : 'LOSE';

            data.push({
                cluster: cluster.replace('_KAB', ''),
                tap_name: info.tap,
                kabupaten: info.kab,
                kecamatan: kec,
                tsel_share: tsel,
                ioh_share: ioh,
                xl_plus_share: xlPlus,
                tsel_w1: parseFloat(tselW1.toFixed(1)),
                ioh_w1: parseFloat(iohW1.toFixed(1)),
                xl_plus_w1: parseFloat(xlPlusW1.toFixed(1)),
                tsel_m1: parseFloat(tselM1.toFixed(1)),
                ioh_m1: parseFloat(iohM1.toFixed(1)),
                xl_plus_m1: parseFloat(xlPlusM1.toFixed(1)),
                wow_tsel_growth: wowGrowth,
                mom_tsel_growth: momGrowth,
                win_lose_status: winLose,
                gap_to_highest: parseFloat(gapToHighest.toFixed(1)),
                rank_tsel: rankTsel,
            });
        });
    });

    return data;
};

// ===========================================
// TREND CHART DATA GENERATOR
// ===========================================
export const generateTrendData = (): TrendFBData[] => {
    const baseShares = {
        tsel: randomFloat(38, 45),
        ioh: randomFloat(25, 32),
        xlPlus: randomFloat(20, 28),
    };

    return ['W1', 'W2', 'W3', 'W4'].map((week, idx) => ({
        week,
        tsel: parseFloat((baseShares.tsel + idx * randomFloat(-0.5, 1.5)).toFixed(1)),
        ioh: parseFloat((baseShares.ioh + idx * randomFloat(-0.8, 0.8)).toFixed(1)),
        xl_plus: parseFloat((baseShares.xlPlus + idx * randomFloat(-0.5, 0.5)).toFixed(1)),
    }));
};

// Pre-generated data
export const marketShareCityData = generateCityData();
export const marketShareKecData = generateKecamatanData();
export const trendFBData = generateTrendData();
