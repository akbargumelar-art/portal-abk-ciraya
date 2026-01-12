import type { Outlet, Transaction, StockItem, SalesPlan, KPISummary, SalesTrendData, ChartDataPoint } from '../types';
import { outlets as generatedOutlets, salesforceUsers as sfUsersFromGenerator } from '../services/mock/dataGenerator';

// TAP names (Territory Activation Point)
const tapNames = [
    'TAP-CRB-01', 'TAP-CRB-02', 'TAP-CRB-03', 'TAP-CRB-04', 'TAP-CRB-05',
    'TAP-KNG-01', 'TAP-KNG-02', 'TAP-MJL-01', 'TAP-MJL-02', 'TAP-IDR-01',
];

// Kabupaten/Kota in Cirebon area (only Cirebon & Kuningan)
const kabupatenList = [
    'Kota Cirebon', 'Kab. Cirebon', 'Kab. Kuningan'
];

// Kecamatan per Kabupaten
const kecamatanMap: Record<string, string[]> = {
    'Kota Cirebon': ['Harjamukti', 'Kejaksan', 'Kesambi', 'Lemahwungkuk', 'Pekalipan'],
    'Kab. Cirebon': ['Arjawinangun', 'Astanajapura', 'Babakan', 'Ciledug', 'Gebang', 'Losari', 'Palimanan', 'Plered', 'Sumber', 'Weru'],
    'Kab. Kuningan': ['Kuningan', 'Cigugur', 'Cilimus', 'Ciawigebang', 'Luragung']
};

// Salesforce names
const salesforceNames = [
    'Eko Prasetyo', 'Rizki Maulana', 'Dian Permana', 'Yusuf Hidayat', 'Rudi Hartono',
    'Agung Wijaya', 'Bambang Susilo', 'Cahyo Nugroho', 'Dwi Santoso', 'Fajar Kurniawan',
    'Galih Pratama', 'Hendra Saputra', 'Irfan Fadillah', 'Joko Widodo', 'Kurnia Ramadhan',
    'Lukman Hakim', 'Mulyadi Surya', 'Nanda Prasetyo', 'Oscar Firmansyah', 'Putra Mahardika',
];

// Product names
const perdanaProducts = [
    'SP Halo', 'SP Combo', 'SP Data', 'SP Unlimited', 'Kartu As', 'simPATI', 'Loop'
];

const voucherProducts = [
    'Pulsa 5K', 'Pulsa 10K', 'Pulsa 25K', 'Pulsa 50K', 'Pulsa 100K',
    'Data 1GB', 'Data 3GB', 'Data 5GB', 'Data 10GB', 'Data 20GB',
    'Combo 10K', 'Combo 25K', 'Combo 50K'
];

// Random utility functions
const randomInt = (min: number, max: number): number =>
    Math.floor(Math.random() * (max - min + 1)) + min;

const randomFloat = (min: number, max: number, decimals: number = 2): number =>
    parseFloat((Math.random() * (max - min) + min).toFixed(decimals));

const randomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const generateId = (prefix: string, index: number): string =>
    `${prefix}${String(index).padStart(4, '0')}`;

// Generate ~2300 outlets
export const generateOutlets = (): Outlet[] => {
    const outlets: Outlet[] = [];
    let index = 1;

    // Kelurahan per Kecamatan
    const kelurahanMap: Record<string, string[]> = {
        'Harjamukti': ['Harjamukti', 'Kecapi', 'Argasunya', 'Kalijaga'],
        'Kejaksan': ['Kejaksan', 'Kebonbaru', 'Kesenden'],
        'Kesambi': ['Kesambi', 'Sunyaragi', 'Pekiringan', 'Drajat'],
        'Lemahwungkuk': ['Lemahwungkuk', 'Kesepuhan', 'Panjunan'],
        'Pekalipan': ['Pekalipan', 'Jagasatru', 'Pulasaren'],
        'Arjawinangun': ['Arjawinangun', 'Jungjang', 'Tegalgubug'],
        'Astanajapura': ['Astanajapura', 'Buntet', 'Munjul'],
        'Babakan': ['Babakan', 'Gembongan', 'Karangwangi'],
        'Ciledug': ['Ciledug', 'Bojongnegara', 'Damarguna'],
        'Gebang': ['Gebang', 'Kalimaro', 'Pelayangan'],
        'Losari': ['Losari', 'Ambulu', 'Panggangsari'],
        'Palimanan': ['Palimanan', 'Balerante', 'Cirebon Girang'],
        'Plered': ['Plered', 'Panembahan', 'Tegalsari'],
        'Sumber': ['Sumber', 'Kemantren', 'Sidawangi'],
        'Weru': ['Weru', 'Megu Cilik', 'Megu Gede'],
        'Kuningan': ['Kuningan', 'Purwawinangun', 'Windusengkahan'],
        'Cigugur': ['Cigugur', 'Sukamulya', 'Cipari'],
        'Cilimus': ['Cilimus', 'Bandorasa', 'Cilimus Kulon'],
        'Ciawigebang': ['Ciawigebang', 'Ciawilor', 'Karangkamulyan'],
        'Luragung': ['Luragung', 'Cikaduwetan', 'Paninggaran'],
        'Majalengka': ['Majalengka', 'Cikasarung', 'Tarikolot'],
        'Kadipaten': ['Kadipaten', 'Heuleut', 'Karangsambung'],
        'Jatiwangi': ['Jatiwangi', 'Surawangi', 'Burujul'],
        'Kertajati': ['Kertajati', 'Mekarmulya', 'Babakan'],
        'Ligung': ['Ligung', 'Bantarjati', 'Majasari'],
        'Indramayu': ['Indramayu', 'Pekandangan', 'Margadadi'],
        'Jatibarang': ['Jatibarang', 'Bulak', 'Pawidean'],
        'Haurgeulis': ['Haurgeulis', 'Mekarjaya', 'Kertanegara'],
        'Lohbener': ['Lohbener', 'Kertasmaya', 'Segeran'],
        'Sindang': ['Sindang', 'Dermayu', 'Penganjang'],
    };

    const hariPJPOptions = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const gradeOptions: ('Gold' | 'Silver' | 'Bronze')[] = ['Gold', 'Silver', 'Bronze'];

    kabupatenList.forEach(kabupaten => {
        const kecamatanArr = kecamatanMap[kabupaten];
        const outletsPerKabupaten = kabupaten === 'Kab. Cirebon' ? 600 :
            kabupaten === 'Kota Cirebon' ? 400 :
                kabupaten === 'Kab. Indramayu' ? 500 : 400;

        for (let i = 0; i < outletsPerKabupaten; i++) {
            const kecamatan = randomElement(kecamatanArr);
            const kelurahanArr = kelurahanMap[kecamatan] || [kecamatan];
            const kelurahan = randomElement(kelurahanArr);
            const tap = randomElement(tapNames);
            const salesforceIdx = randomInt(0, salesforceNames.length - 1);

            outlets.push({
                id: generateId('OUT', index),
                name: `Outlet ${randomElement(['Jaya', 'Makmur', 'Sejahtera', 'Berkah', 'Sukses', 'Maju', 'Abadi', 'Prima', 'Utama', 'Mandiri'])} ${index}`,
                idDigipos: `${randomInt(1000000000, 9999999999)}`,
                rsNumber: `${randomInt(10000000, 999999999999)}`.slice(0, randomInt(8, 12)),
                address: `Jl. ${randomElement(['Raya', 'Utama', 'Merdeka', 'Sudirman', 'Gatot Subroto', 'Ahmad Yani'])} No. ${randomInt(1, 200)}, ${kecamatan}`,
                kabupaten,
                kecamatan,
                kelurahan,
                tap,
                salesforceId: `SF${String(salesforceIdx + 1).padStart(3, '0')}`,
                salesforceName: salesforceNames[salesforceIdx],
                pjpStatus: Math.random() > 0.15 ? 'PJP' : 'Non PJP',
                physicalStatus: Math.random() > 0.15 ? 'Fisik' : 'Non Fisik',
                physicalGrade: randomElement(gradeOptions),
                digiposStatus: Math.random() > 0.2 ? 'active' : 'inactive',
                hariPJP: randomElement(hariPJPOptions),
                nomorKonfirmasi: `KNF${String(randomInt(10000, 99999))}`,
                ownerPhone: `08${randomElement(['12', '13', '21', '22', '52', '53', '57', '58', '77', '78', '81', '82', '85', '87', '88', '89'])}${String(randomInt(10000000, 99999999))}`,
                lokasiOutlet: randomElement(['Ring 1', 'Ring 2', 'Ring 3'] as const),
                flag: randomElement(['Retail', 'Pareto Retail', 'Big Pareto', 'Office', 'D2C'] as const),
                latitude: randomFloat(-6.8, -6.6),
                longitude: randomFloat(108.4, 108.7),
                lastVisit: new Date(Date.now() - randomInt(1, 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                createdAt: `2023-${String(randomInt(1, 12)).padStart(2, '0')}-${String(randomInt(1, 28)).padStart(2, '0')}`,
            });
            index++;
        }
    });

    return outlets;
};

// Generate transactions for outlets
export const generateTransactions = (outlets: Outlet[]): Transaction[] => {
    const transactions: Transaction[] = [];
    const periods = ['2024-07', '2024-08', '2024-09', '2024-10', '2024-11', '2024-12'];

    outlets.forEach(outlet => {
        periods.forEach(period => {
            const basePerdana = randomInt(50, 500);
            const baseVoucher = randomInt(100, 1000);
            transactions.push({
                id: `TRX${outlet.id.slice(3)}-${period.replace('-', '')}`,
                outletId: outlet.id,
                period,
                perdanaSales: basePerdana + randomInt(-50, 100),
                voucherSales: baseVoucher + randomInt(-100, 200),
                digiposTrx: randomInt(10, 200),
                omzet: (basePerdana * 15000) + (baseVoucher * 8000) + randomInt(100000, 1000000),
                createdAt: `${period}-${String(randomInt(1, 28)).padStart(2, '0')}`,
            });
        });
    });

    return transactions;
};

// Generate stock items
export const generateStockItems = (outlets: Outlet[]): StockItem[] => {
    const stockItems: StockItem[] = [];
    let index = 1;

    // Product groups: A = Simpati/Voucher Internet, B = byU/Voucher Game
    const perdanaGroupA = ['SP Halo', 'SP Combo', 'simPATI']; // Simpati group
    const perdanaGroupB = ['byU', 'Loop', 'Kartu As']; // byU group
    const voucherGroupA = ['Data 1GB', 'Data 3GB', 'Data 5GB', 'Data 10GB']; // Voucher Internet
    const voucherGroupB = ['Pulsa 5K', 'Pulsa 10K', 'Combo 10K', 'Combo 25K']; // Voucher Game/Lain

    outlets.slice(0, 500).forEach(outlet => { // Limit for performance
        // Perdana stock - Group A (Simpati)
        perdanaGroupA.slice(0, 2).forEach(product => {
            const baseStock = randomInt(2, 15);
            const baseSellOut = randomInt(5, 20);
            const baseBeli = randomInt(10, 30);
            stockItems.push({
                id: generateId('STK', index++),
                outletId: outlet.id,
                productType: 'perdana',
                productGroup: 'A',
                productName: product,
                productCode: `PDA${String(perdanaGroupA.indexOf(product) + 1).padStart(3, '0')}`,
                stockFM1: baseStock + randomInt(-2, 5),
                stockM1: baseStock + randomInt(-2, 5),
                stockM: baseStock + randomInt(-2, 5),
                beliM: baseBeli + randomInt(-5, 10),
                targetM: Math.round(baseSellOut * 1.2),
                sellOutFM1: baseSellOut + randomInt(-3, 5),
                sellOutM1: baseSellOut + randomInt(-3, 5),
                sellOutM: baseSellOut + randomInt(-3, 8),
                period: '2024-12',
            });
        });

        // Perdana stock - Group B (byU)
        perdanaGroupB.slice(0, 2).forEach(product => {
            const baseStock = randomInt(2, 12);
            const baseSellOut = randomInt(3, 15);
            const baseBeli = randomInt(8, 25);
            stockItems.push({
                id: generateId('STK', index++),
                outletId: outlet.id,
                productType: 'perdana',
                productGroup: 'B',
                productName: product,
                productCode: `PDB${String(perdanaGroupB.indexOf(product) + 1).padStart(3, '0')}`,
                stockFM1: baseStock + randomInt(-2, 4),
                stockM1: baseStock + randomInt(-2, 4),
                stockM: baseStock + randomInt(-2, 4),
                beliM: baseBeli + randomInt(-4, 8),
                targetM: Math.round(baseSellOut * 1.2),
                sellOutFM1: baseSellOut + randomInt(-2, 4),
                sellOutM1: baseSellOut + randomInt(-2, 4),
                sellOutM: baseSellOut + randomInt(-2, 6),
                period: '2024-12',
            });
        });

        // Voucher stock - Group A (Voucher Internet)
        voucherGroupA.slice(0, 2).forEach(product => {
            const baseStock = randomInt(5, 20);
            const baseSellOut = randomInt(10, 40);
            const baseBeli = randomInt(15, 50);
            stockItems.push({
                id: generateId('STK', index++),
                outletId: outlet.id,
                productType: 'voucher',
                productGroup: 'A',
                productName: product,
                productCode: `VCA${String(voucherGroupA.indexOf(product) + 1).padStart(3, '0')}`,
                stockFM1: baseStock + randomInt(-3, 8),
                stockM1: baseStock + randomInt(-3, 6),
                stockM: baseStock + randomInt(-3, 6),
                beliM: baseBeli + randomInt(-8, 15),
                targetM: Math.round(baseSellOut * 1.15),
                sellOutFM1: baseSellOut + randomInt(-5, 10),
                sellOutM1: baseSellOut + randomInt(-5, 8),
                sellOutM: baseSellOut + randomInt(-5, 12),
                period: '2024-12',
            });
        });

        // Voucher stock - Group B (Voucher Game/Lain)
        voucherGroupB.slice(0, 2).forEach(product => {
            const baseStock = randomInt(3, 15);
            const baseSellOut = randomInt(8, 30);
            const baseBeli = randomInt(12, 40);
            stockItems.push({
                id: generateId('STK', index++),
                outletId: outlet.id,
                productType: 'voucher',
                productGroup: 'B',
                productName: product,
                productCode: `VCB${String(voucherGroupB.indexOf(product) + 1).padStart(3, '0')}`,
                stockFM1: baseStock + randomInt(-2, 6),
                stockM1: baseStock + randomInt(-2, 5),
                stockM: baseStock + randomInt(-2, 5),
                beliM: baseBeli + randomInt(-6, 12),
                targetM: Math.round(baseSellOut * 1.15),
                sellOutFM1: baseSellOut + randomInt(-4, 8),
                sellOutM1: baseSellOut + randomInt(-4, 7),
                sellOutM: baseSellOut + randomInt(-4, 10),
                period: '2024-12',
            });
        });
    });

    return stockItems;
};

// Generate sales plans using salesforce users from dataGenerator
export const generateSalesPlans = (): SalesPlan[] => {
    const salesPlans: SalesPlan[] = [];
    let index = 1;

    sfUsersFromGenerator.forEach((sf) => {
        const tap = sf.tap || 'TAP Pemuda';

        // Perdana plans
        perdanaProducts.forEach(product => {
            const target = randomInt(100, 500);
            const actualM1 = Math.round(target * randomFloat(0.7, 1.1));
            salesPlans.push({
                id: generateId('SPL', index++),
                salesforceId: sf.id,
                salesforceName: sf.name,
                tap,
                category: 'perdana',
                productName: product,
                targetM: target,
                actualM1,
                actualM: Math.round(target * randomFloat(0.65, 1.15)),
                period: '2024-12',
            });
        });

        // Voucher plans
        voucherProducts.slice(0, 5).forEach(product => {
            const target = randomInt(200, 1000);
            const actualM1 = Math.round(target * randomFloat(0.75, 1.05));
            salesPlans.push({
                id: generateId('SPL', index++),
                salesforceId: sf.id,
                salesforceName: sf.name,
                tap,
                category: 'voucher',
                productName: product,
                targetM: target,
                actualM1,
                actualM: Math.round(target * randomFloat(0.7, 1.1)),
                period: '2024-12',
            });
        });

        // CVM plans
        ['CVM Retention', 'CVM Upsell', 'CVM Winback'].forEach(product => {
            const target = randomInt(30, 100);
            const actualM1 = Math.round(target * randomFloat(0.6, 1.0));
            salesPlans.push({
                id: generateId('SPL', index++),
                salesforceId: sf.id,
                salesforceName: sf.name,
                tap,
                category: 'cvm',
                productName: product,
                targetM: target,
                actualM1,
                actualM: Math.round(target * randomFloat(0.55, 1.05)),
                period: '2024-12',
            });
        });
    });

    return salesPlans;
};

// Calculate KPI Summary
export const calculateKPISummary = (transactions: Transaction[]): KPISummary => {
    const currentMonth = '2024-12';
    const prevMonth = '2024-11';

    const currentTrx = transactions.filter(t => t.period === currentMonth);
    const prevTrx = transactions.filter(t => t.period === prevMonth);

    const totalSalesM = currentTrx.reduce((sum, t) => sum + t.omzet, 0);
    const totalSalesM1 = prevTrx.reduce((sum, t) => sum + t.omzet, 0);

    const activeOutletsM = new Set(currentTrx.map(t => t.outletId)).size;
    const activeOutletsM1 = new Set(prevTrx.map(t => t.outletId)).size;

    const digiposTrxM = currentTrx.reduce((sum, t) => sum + t.digiposTrx, 0);
    const digiposTrxM1 = prevTrx.reduce((sum, t) => sum + t.digiposTrx, 0);

    const sellOutM = currentTrx.reduce((sum, t) => sum + t.perdanaSales + t.voucherSales, 0);
    const sellOutM1 = prevTrx.reduce((sum, t) => sum + t.perdanaSales + t.voucherSales, 0);

    const calcGrowth = (current: number, prev: number) =>
        prev > 0 ? ((current - prev) / prev) * 100 : 0;

    return {
        totalSales: totalSalesM,
        totalSalesGrowth: calcGrowth(totalSalesM, totalSalesM1),
        activeOutlets: activeOutletsM,
        activeOutletsGrowth: calcGrowth(activeOutletsM, activeOutletsM1),
        digiposTrx: digiposTrxM,
        digiposTrxGrowth: calcGrowth(digiposTrxM, digiposTrxM1),
        sellOutQty: sellOutM,
        sellOutQtyGrowth: calcGrowth(sellOutM, sellOutM1),
    };
};

// Get outlet distribution by PJP
export const getOutletDistributionByPJP = (outlets: Outlet[]): ChartDataPoint[] => {
    const distribution: Record<string, number> = {};

    outlets.forEach(outlet => {
        const salesforce = outlet.salesforceName;
        if (!distribution[salesforce]) {
            distribution[salesforce] = 0;
        }
        distribution[salesforce]++;
    });

    return Object.entries(distribution)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([label, value]) => ({ label, value }));
};

// Get 6-month sales trend
export const getSalesTrend = (transactions: Transaction[]): SalesTrendData[] => {
    const months = ['2024-07', '2024-08', '2024-09', '2024-10', '2024-11', '2024-12'];

    return months.map(month => {
        const monthTrx = transactions.filter(t => t.period === month);
        return {
            month: new Date(month + '-01').toLocaleDateString('id-ID', { month: 'short' }),
            perdana: monthTrx.reduce((sum, t) => sum + t.perdanaSales, 0),
            voucher: monthTrx.reduce((sum, t) => sum + t.voucherSales, 0),
            digipos: monthTrx.reduce((sum, t) => sum + t.digiposTrx, 0),
        };
    });
};
// Export all generated data
// Use outlets from dataGenerator for the main outlet list
export const outlets = generatedOutlets;
export const transactions = generateTransactions(outlets);
export const stockItems = generateStockItems(outlets);
export const salesPlans = generateSalesPlans();
export const kpiSummary = calculateKPISummary(transactions);
export const outletDistribution = getOutletDistributionByPJP(outlets);
export const salesTrend = getSalesTrend(transactions);

// Re-export salesforce users for convenience
export { sfUsersFromGenerator as salesforceUsers };
