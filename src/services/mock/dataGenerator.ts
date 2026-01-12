/**
 * Mock Data Generator for Portal Cirebon Raya
 * Generates realistic, large-scale dataset for PT Agrabudi Komunika (Distributor)
 * 
 * Configuration:
 * - Total Salesforce: 37 personnel across 4 TAPs
 * - Total D2C: 15 personnel across 2 clusters
 * - Total Outlets: 6,858 (Pool A: 2,358 PJP, Pool B: 4,500 Regular)
 */

import type { User, Outlet } from '../../types';

// =============================================================================
// CONFIGURATION CONSTANTS
// =============================================================================

/**
 * Territory & Salesforce Structure (Total 37 SF)
 */
export const TAP_CONFIG = {
    'TAP Pemuda': {
        headcount: 9,
        area: 'Kota Cirebon & sebagian Kab Cirebon',
        kabupaten: ['Kota Cirebon', 'Kab. Cirebon']
    },
    'TAP Palimanan': {
        headcount: 9,
        area: 'Kab Cirebon Barat',
        kabupaten: ['Kab. Cirebon']
    },
    'TAP Lemahabang': {
        headcount: 8,
        area: 'Kab Cirebon Timur',
        kabupaten: ['Kab. Cirebon']
    },
    'TAP Kuningan': {
        headcount: 11,
        area: 'Kab Kuningan',
        kabupaten: ['Kab. Kuningan']
    }
} as const;

/**
 * Direct Sales (D2C) Structure (Total 15 Personnel)
 */
export const D2C_CONFIG = {
    'Cluster Cirebon': {
        headcount: 9,
        kabupaten: ['Kota Cirebon', 'Kab. Cirebon']
    },
    'Cluster Kuningan': {
        headcount: 6,
        kabupaten: ['Kab. Kuningan']
    }
} as const;

/**
 * Outlet Distribution
 * Total: 6,858 outlets
 */
export const OUTLET_CONFIG = {
    POOL_A_PJP: 2358,      // PJP outlets with physical status Gold/Silver/Bronze
    POOL_B_REGULAR: 4500,  // Regular outlets with Regular/Basic status
    TOTAL: 6858
} as const;

/**
 * Geographic Mapping - Kecamatan per Kabupaten
 */
export const KECAMATAN_MAP: Record<string, string[]> = {
    'Kota Cirebon': [
        'Harjamukti', 'Kejaksan', 'Kesambi', 'Lemahwungkuk', 'Pekalipan'
    ],
    'Kab. Cirebon': [
        'Weru', 'Plumbon', 'Arjawinangun', 'Palimanan', 'Lemahabang',
        'Astanajapura', 'Babakan', 'Ciledug', 'Gebang', 'Losari',
        'Plered', 'Sumber', 'Tengahtani', 'Kapetakan', 'Klangenan'
    ],
    'Kab. Kuningan': [
        'Kramatmulya', 'Cilimus', 'Cigugur', 'Kuningan', 'Ciawigebang',
        'Luragung', 'Lebakwangi', 'Mandirancan', 'Pancalang', 'Pasawahan'
    ]
};

/**
 * Kelurahan per Kecamatan
 */
export const KELURAHAN_MAP: Record<string, string[]> = {
    // Kota Cirebon
    'Harjamukti': ['Harjamukti', 'Kecapi', 'Argasunya', 'Kalijaga'],
    'Kejaksan': ['Kejaksan', 'Kebonbaru', 'Kesenden', 'Sukapura'],
    'Kesambi': ['Kesambi', 'Sunyaragi', 'Pekiringan', 'Drajat'],
    'Lemahwungkuk': ['Lemahwungkuk', 'Kesepuhan', 'Panjunan', 'Pegambiran'],
    'Pekalipan': ['Pekalipan', 'Jagasatru', 'Pulasaren', 'Kampungdalem'],
    // Kab. Cirebon
    'Weru': ['Weru Kidul', 'Weru Lor', 'Megu Cilik', 'Megu Gede', 'Karangwangi'],
    'Plumbon': ['Plumbon', 'Kebarepan', 'Purbawinangun', 'Warungasem'],
    'Arjawinangun': ['Arjawinangun', 'Jungjang', 'Tegalgubug', 'Sende'],
    'Palimanan': ['Palimanan', 'Balerante', 'Cirebon Girang', 'Semplo'],
    'Lemahabang': ['Lemahabang', 'Sigong', 'Asem', 'Cipeujeuh'],
    'Astanajapura': ['Astanajapura', 'Buntet', 'Munjul', 'Kanci'],
    'Babakan': ['Babakan', 'Gembongan', 'Karangwangi', 'Serang'],
    'Ciledug': ['Ciledug', 'Bojongnegara', 'Damarguna', 'Jatisura'],
    'Gebang': ['Gebang', 'Kalimaro', 'Pelayangan', 'Gagasari'],
    'Losari': ['Losari', 'Ambulu', 'Panggangsari', 'Tawangsari'],
    'Plered': ['Plered', 'Panembahan', 'Tegalsari', 'Trusmi'],
    'Sumber': ['Sumber', 'Kemantren', 'Sidawangi', 'Sendang'],
    'Tengahtani': ['Tengahtani', 'Kamarang', 'Kertasura'],
    'Kapetakan': ['Kapetakan', 'Bungko', 'Karangreja'],
    'Klangenan': ['Klangenan', 'Danawinangun', 'Jemaras'],
    // Kab. Kuningan
    'Kramatmulya': ['Kramatmulya', 'Cimara', 'Tarikolot', 'Sangkanmulya'],
    'Cilimus': ['Cilimus', 'Bandorasa', 'Cilimus Kulon', 'Setianegara'],
    'Cigugur': ['Cigugur', 'Sukamulya', 'Cipari', 'Cisantana'],
    'Kuningan': ['Kuningan', 'Purwawinangun', 'Windusengkahan', 'Cigintung'],
    'Ciawigebang': ['Ciawigebang', 'Ciawilor', 'Karangkamulyan', 'Cihaur'],
    'Luragung': ['Luragung', 'Cikaduwetan', 'Paninggaran', 'Dukuhbadag'],
    'Lebakwangi': ['Lebakwangi', 'Cikeusal', 'Margasari'],
    'Mandirancan': ['Mandirancan', 'Cikubangsari', 'Randobawailir'],
    'Pancalang': ['Pancalang', 'Cimahitri', 'Rajadanu'],
    'Pasawahan': ['Pasawahan', 'Padaherang', 'Singkup']
};

/**
 * Outlet naming components
 */
const OUTLET_PREFIXES = [
    'Berkah', 'Jaya', 'Makmur', 'Sejahtera', 'Sukses', 'Maju',
    'Abadi', 'Prima', 'Utama', 'Mandiri', 'Barokah', 'Rezeki',
    'Mulia', 'Sentosa', 'Gemilang', 'Cahaya', 'Bintang', 'Sinar',
    'Harapan', 'Karya', 'Anugerah', 'Melati', 'Indah', 'Murni'
];

const OUTLET_SUFFIXES = [
    'Cell', 'Store', 'Pulsa', 'Cellular', 'Telekom', 'Selular',
    'Ponsel', 'Phone', 'Mobile', 'Gadget', 'Communication', 'Net'
];

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

const randomInt = (min: number, max: number): number =>
    Math.floor(Math.random() * (max - min + 1)) + min;

const randomElement = <T>(arr: readonly T[] | T[]): T =>
    arr[Math.floor(Math.random() * arr.length)];

const generateId = (prefix: string, index: number, padLength: number = 4): string =>
    `${prefix}${String(index).padStart(padLength, '0')}`;

const generateAvatarUrl = (name: string, bgColor: string): string =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name.replace(/\s+/g, '+'))}&background=${bgColor}&color=fff`;



/**
 * Generate Salesforce Users
 * Total: 37 users across 4 TAPs
 */
export const generateSalesforceUsers = (): User[] => {
    const users: User[] = [];
    let globalIndex = 1;

    Object.entries(TAP_CONFIG).forEach(([tapName, config]) => {
        for (let i = 1; i <= config.headcount; i++) {
            const displayName = `SF ${tapName.replace('TAP ', '')} ${i}`;
            const username = `sf_${tapName.toLowerCase().replace(/\s+/g, '_')}_${i}`;

            users.push({
                id: generateId('SF', globalIndex),
                name: displayName,
                username,
                role: 'salesforce',
                email: `${username}@agrabudi.com`,
                tap: tapName,
                avatar: generateAvatarUrl(displayName, '3B82F6'),
                createdAt: '2023-01-01',
            });

            globalIndex++;
        }
    });

    return users;
};

/**
 * Generate D2C (Direct Sales) Users
 * Total: 15 users across 2 clusters
 */
export const generateD2CUsers = (): User[] => {
    const users: User[] = [];
    let globalIndex = 1;

    Object.entries(D2C_CONFIG).forEach(([clusterName, config]) => {
        for (let i = 1; i <= config.headcount; i++) {
            const area = clusterName.replace('Cluster ', '');
            const displayName = `D2C ${area} ${i}`;
            const username = `d2c_${area.toLowerCase()}_${i}`;

            users.push({
                id: generateId('D2C', globalIndex),
                name: displayName,
                username,
                role: 'direct_sales',
                email: `${username}@agrabudi.com`,
                tap: clusterName, // Store cluster info in tap field for D2C
                avatar: generateAvatarUrl(displayName, '8B5CF6'),
                createdAt: '2023-01-01',
            });

            globalIndex++;
        }
    });

    return users;
};

// =============================================================================
// OUTLET GENERATORS
// =============================================================================


/**
 * Get kabupaten list for a given TAP
 */
const getKabupatenForTAP = (tapName: string): string[] => {
    const config = TAP_CONFIG[tapName as keyof typeof TAP_CONFIG];
    return config?.kabupaten ? [...config.kabupaten] : [];
};

/**
 * Generate a single outlet
 */
const generateSingleOutlet = (
    index: number,
    salesforceUser: User,
    isPoolA: boolean
): Outlet => {
    const tapName = salesforceUser.tap || 'TAP Pemuda';
    const kabupatenList = getKabupatenForTAP(tapName);
    const kabupaten = randomElement(kabupatenList) || 'Kab. Cirebon';

    const kecamatanList = KECAMATAN_MAP[kabupaten] || ['Sumber'];
    const kecamatan = randomElement(kecamatanList);

    const kelurahanList = KELURAHAN_MAP[kecamatan] || [kecamatan];
    const kelurahan = randomElement(kelurahanList);

    // Generate realistic outlet name
    const prefix = randomElement(OUTLET_PREFIXES);
    const suffix = randomElement(OUTLET_SUFFIXES);
    const outletName = `${prefix} ${suffix}`;

    // Pool A: PJP = 'PJP', Fisik = 'Fisik', Grade = Gold/Silver/Bronze
    // Pool B: PJP = 'Non PJP', Fisik = 'Non Fisik'
    const pjpStatus: 'PJP' | 'Non PJP' = isPoolA ? 'PJP' : 'Non PJP';
    const physicalStatus: 'Fisik' | 'Non Fisik' = isPoolA ? 'Fisik' : 'Non Fisik';
    const physicalGrade: 'Gold' | 'Silver' | 'Bronze' = isPoolA
        ? randomElement(['Gold', 'Silver', 'Bronze'] as const)
        : 'Bronze';

    const hariPJPOptions = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const lokasiOptions: ('Ring 1' | 'Ring 2' | 'Ring 3')[] = ['Ring 1', 'Ring 2', 'Ring 3'];
    const flagOptions: ('Retail' | 'Pareto Retail' | 'Big Pareto' | 'Office')[] = ['Retail', 'Pareto Retail', 'Big Pareto', 'Office'];
    const phonePrefix = ['12', '13', '21', '22', '52', '53', '57', '58', '77', '78', '81', '82', '85', '87', '88', '89'];

    // ID Digipos: minimum 10 digits (format: 10-digit number)
    const idDigipos = `${randomInt(1000000000, 9999999999)}`;

    return {
        id: generateId('OUT', index, 5),
        name: outletName,
        idDigipos,
        rsNumber: `${randomInt(10000000, 999999999999)}`.slice(0, randomInt(8, 12)),
        address: `Jl. ${randomElement(['Raya', 'Utama', 'Merdeka', 'Sudirman', 'Gatot Subroto', 'Ahmad Yani', 'Pangeran', 'Diponegoro'])} No. ${randomInt(1, 200)}, ${kecamatan}`,
        kabupaten,
        kecamatan,
        kelurahan,
        tap: tapName,
        salesforceId: salesforceUser.id,
        salesforceName: salesforceUser.name,
        pjpStatus,
        physicalStatus,
        physicalGrade,
        digiposStatus: Math.random() > 0.1 ? 'active' : 'inactive',
        hariPJP: isPoolA ? randomElement(hariPJPOptions) : '-',
        nomorKonfirmasi: isPoolA ? `KNF${String(randomInt(10000, 99999))}` : '-',
        ownerPhone: `08${randomElement(phonePrefix)}${String(randomInt(10000000, 99999999))}`,
        lokasiOutlet: randomElement(lokasiOptions),
        flag: randomElement(flagOptions),
        latitude: -6.7 + (Math.random() * 0.4 - 0.2),
        longitude: 108.5 + (Math.random() * 0.4 - 0.2),
        lastVisit: isPoolA
            ? new Date(Date.now() - randomInt(1, 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            : undefined,
        createdAt: `2023-${String(randomInt(1, 12)).padStart(2, '0')}-${String(randomInt(1, 28)).padStart(2, '0')}`,
    };
};

/**
 * Generate all outlets according to pool distribution
 * Pool A (PJP & Fisik): 2,358 outlets - distributed evenly among 37 SF
 * Pool B (Regular): 4,500 outlets - distributed evenly among 37 SF
 */
export const generateOutlets = (salesforceUsers: User[]): Outlet[] => {
    const outlets: Outlet[] = [];
    const sfCount = salesforceUsers.length; // Should be 37

    // Calculate distribution per salesforce
    const poolAPerSF = Math.floor(OUTLET_CONFIG.POOL_A_PJP / sfCount);
    const poolAExtra = OUTLET_CONFIG.POOL_A_PJP % sfCount;

    const poolBPerSF = Math.floor(OUTLET_CONFIG.POOL_B_REGULAR / sfCount);
    const poolBExtra = OUTLET_CONFIG.POOL_B_REGULAR % sfCount;

    let outletIndex = 1;

    // Generate Pool A outlets (PJP)
    salesforceUsers.forEach((sf, sfIndex) => {
        const count = poolAPerSF + (sfIndex < poolAExtra ? 1 : 0);
        for (let i = 0; i < count; i++) {
            outlets.push(generateSingleOutlet(outletIndex++, sf, true));
        }
    });

    // Generate Pool B outlets (Regular)
    salesforceUsers.forEach((sf, sfIndex) => {
        const count = poolBPerSF + (sfIndex < poolBExtra ? 1 : 0);
        for (let i = 0; i < count; i++) {
            outlets.push(generateSingleOutlet(outletIndex++, sf, false));
        }
    });

    return outlets;
};

// =============================================================================
// STATISTICS & VALIDATION
// =============================================================================

/**
 * Get statistics about the generated data
 */
export const getDataStatistics = (
    sfUsers: User[],
    d2cUsers: User[],
    outlets: Outlet[]
) => {
    const tapBreakdown: Record<string, { sfCount: number; outletCount: number; pjpCount: number }> = {};

    // Initialize TAP breakdown
    Object.keys(TAP_CONFIG).forEach(tap => {
        tapBreakdown[tap] = { sfCount: 0, outletCount: 0, pjpCount: 0 };
    });

    // Count SF per TAP
    sfUsers.forEach(user => {
        if (user.tap && tapBreakdown[user.tap]) {
            tapBreakdown[user.tap].sfCount++;
        }
    });

    // Count outlets per TAP
    outlets.forEach(outlet => {
        if (tapBreakdown[outlet.tap]) {
            tapBreakdown[outlet.tap].outletCount++;
            if (outlet.pjpStatus === 'PJP') {
                tapBreakdown[outlet.tap].pjpCount++;
            }
        }
    });

    const clusterBreakdown: Record<string, number> = {};
    d2cUsers.forEach(user => {
        const cluster = user.tap || 'Unknown'; // D2C cluster is stored in tap field
        clusterBreakdown[cluster] = (clusterBreakdown[cluster] || 0) + 1;
    });

    return {
        totalSalesforce: sfUsers.length,
        totalD2C: d2cUsers.length,
        totalOutlets: outlets.length,
        pjpOutlets: outlets.filter(o => o.pjpStatus === 'PJP').length,
        regularOutlets: outlets.filter(o => o.pjpStatus === 'Non PJP').length,
        tapBreakdown,
        clusterBreakdown,
        expectedValues: {
            totalSalesforce: 37,
            totalD2C: 15,
            totalOutlets: OUTLET_CONFIG.TOTAL,
            pjpOutlets: OUTLET_CONFIG.POOL_A_PJP,
            regularOutlets: OUTLET_CONFIG.POOL_B_REGULAR
        }
    };
};

// =============================================================================
// EXPORTED DATA (Generated on module load)
// =============================================================================

/** All Salesforce users (37 total) */
export const salesforceUsers: User[] = generateSalesforceUsers();

/** All D2C users (15 total) */
export const d2cUsers: User[] = generateD2CUsers();

/** All users combined */
export const allUsers: User[] = [...salesforceUsers, ...d2cUsers];

/** All outlets (6,858 total) */
export const outlets: Outlet[] = generateOutlets(salesforceUsers);

/** Data statistics for validation */
export const dataStats = getDataStatistics(salesforceUsers, d2cUsers, outlets);

// =============================================================================
// HELPER EXPORTS
// =============================================================================

/** Get outlets for a specific salesforce user */
export const getOutletsBySalesforce = (salesforceId: string): Outlet[] =>
    outlets.filter(outlet => outlet.salesforceId === salesforceId);

/** Get outlets for a specific TAP */
export const getOutletsByTAP = (tap: string): Outlet[] =>
    outlets.filter(outlet => outlet.tap === tap);

/** Get PJP outlets only (Pool A) */
export const getPJPOutlets = (): Outlet[] =>
    outlets.filter(outlet => outlet.pjpStatus === 'PJP');

/** Get Regular outlets only (Pool B) */
export const getRegularOutlets = (): Outlet[] =>
    outlets.filter(outlet => outlet.pjpStatus === 'Non PJP');

/** Get outlets by Kabupaten */
export const getOutletsByKabupaten = (kabupaten: string): Outlet[] =>
    outlets.filter(outlet => outlet.kabupaten === kabupaten);

/** Get SF users by TAP */
export const getSalesforceByTAP = (tap: string): User[] =>
    salesforceUsers.filter(user => user.tap === tap);

/** Get D2C users by Cluster (stored in tap field) */
export const getD2CByCluster = (cluster: string): User[] =>
    d2cUsers.filter(user => user.tap === cluster);

// Log statistics in development
if (typeof window !== 'undefined' && import.meta.env.DEV) {
    console.log('📊 Mock Data Generator Statistics:', dataStats);
}
