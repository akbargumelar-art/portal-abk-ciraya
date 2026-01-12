/**
 * Mock Visit Data Generator
 * 
 * Generates realistic dummy visits for testing the Monitoring Visit page.
 */

import type { Visit, VisitSummary, VisitStatus } from '../../types/visit';

// Salesforce data for generating visits
const salesforceList = [
    { id: 'SF001', name: 'Eko Prasetyo' },
    { id: 'SF002', name: 'Rudi Hartono' },
    { id: 'SF003', name: 'Dewi Sartika' },
    { id: 'SF004', name: 'Budi Setiawan' },
    { id: 'SF005', name: 'Ahmad Fauzi' },
];

// Outlet data for generating visits
const outletList = [
    { id: 'OUT001', name: 'Toko Berkah Jaya', address: 'Jl. Kartini No. 15, Cirebon' },
    { id: 'OUT002', name: 'Cell Center', address: 'Jl. Siliwangi No. 88, Cirebon' },
    { id: 'OUT003', name: 'Ponsel Makmur', address: 'Jl. Dr. Cipto No. 45, Cirebon' },
    { id: 'OUT004', name: 'Gadget Store', address: 'Jl. Veteran No. 12, Kuningan' },
    { id: 'OUT005', name: 'Digital Corner', address: 'Jl. Pemuda No. 67, Majalengka' },
    { id: 'OUT006', name: 'Mega Cellular', address: 'Jl. Sudirman No. 23, Cirebon' },
    { id: 'OUT007', name: 'Prima Phone', address: 'Jl. Ahmad Yani No. 56, Indramayu' },
    { id: 'OUT008', name: 'Telco Mart', address: 'Jl. Diponegoro No. 34, Cirebon' },
    { id: 'OUT009', name: 'Mobile Station', address: 'Jl. Kesambi No. 78, Cirebon' },
    { id: 'OUT010', name: 'Phone Galaxy', address: 'Jl. Tuparev No. 90, Cirebon' },
    { id: 'OUT011', name: 'Sinar Cellular', address: 'Jl. Karanggetas No. 11, Cirebon' },
    { id: 'OUT012', name: 'Jaya Ponsel', address: 'Jl. Lawanggada No. 55, Cirebon' },
];

// Status distribution weights
const statusWeights: { status: VisitStatus; weight: number }[] = [
    { status: 'visited', weight: 70 },  // 70% success
    { status: 'closed', weight: 20 },   // 20% toko tutup
    { status: 'issue', weight: 10 },    // 10% issues
];

// Notes templates
const visitNotes = [
    'Stok diisi ulang, target tercapai',
    'Transaksi lancar, owner ramah',
    'Outlet aktif, penjualan bagus',
    'Sudah dilakukan pendataan stok',
    'Material POP dipasang',
];

const closedNotes = [
    'Toko tutup, besok buka',
    'Outlet libur hari ini',
    'Pindah lokasi sementara',
    'Renovasi toko',
];

const issueNotes = [
    'Owner tidak ada di tempat',
    'Stok habis, belum restock',
    'Masalah jaringan Digipos',
    'Komplain harga kurang kompetitif',
];

/**
 * Get random item from array.
 */
const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

/**
 * Get weighted random status.
 */
const getRandomStatus = (): VisitStatus => {
    const totalWeight = statusWeights.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;

    for (const item of statusWeights) {
        random -= item.weight;
        if (random <= 0) return item.status;
    }

    return 'visited';
};

/**
 * Generate random time between start and end hours.
 */
const generateRandomTime = (date: Date, startHour: number, endHour: number): Date => {
    const hour = startHour + Math.floor(Math.random() * (endHour - startHour));
    const minute = Math.floor(Math.random() * 60);
    const result = new Date(date);
    result.setHours(hour, minute, 0, 0);
    return result;
};

/**
 * Generate random GPS coordinates near Cirebon area.
 */
const generateCoords = (baseLatLng: { lat: number; lng: number }, errorKm: number = 0) => {
    // Approximate: 1 degree ≈ 111 km
    const errorDegree = errorKm / 111;
    return {
        latitude: baseLatLng.lat + (Math.random() - 0.5) * errorDegree * 2,
        longitude: baseLatLng.lng + (Math.random() - 0.5) * errorDegree * 2,
    };
};

/**
 * Generate mock visits for a specific date and salesforce.
 */
export const generateMockVisits = (
    date: Date = new Date(),
    salesforceId: string = ''
): Visit[] => {
    const visits: Visit[] = [];
    const dateStr = date.toISOString().split('T')[0];

    // Random number of visits (8-15)
    const numVisits = 8 + Math.floor(Math.random() * 8);

    // Filter salesforce if specified
    const salesforces = salesforceId
        ? salesforceList.filter(sf => sf.id === salesforceId)
        : salesforceList;

    // Shuffle outlets and pick random ones
    const shuffledOutlets = [...outletList].sort(() => Math.random() - 0.5);

    // Base coordinates (Cirebon city center)
    const baseCirebon = { lat: -6.7324, lng: 108.5523 };

    // Generate visits throughout the day (08:00 - 17:00)
    for (let i = 0; i < numVisits; i++) {
        const sf = getRandomItem(salesforces);
        const outlet = shuffledOutlets[i % shuffledOutlets.length];
        const status = getRandomStatus();

        // Distance error: usually small (0-0.1km), sometimes large (for issues)
        const distanceError = status === 'issue'
            ? 1 + Math.random() * 3  // 1-4 km for issues
            : Math.random() * 0.15;   // 0-150m for normal visits

        // Generate check-in time spread throughout the day
        const baseHour = 8 + Math.floor((i / numVisits) * 9);  // 08:00 - 17:00
        const checkIn = generateRandomTime(date, baseHour, baseHour + 1);

        // Duration based on status
        let duration = 15 + Math.floor(Math.random() * 30); // 15-45 minutes
        if (status === 'closed') duration = 5 + Math.floor(Math.random() * 10); // 5-15 min
        if (status === 'issue') duration = 10 + Math.floor(Math.random() * 20); // 10-30 min

        const checkOut = new Date(checkIn.getTime() + duration * 60000);

        // Notes based on status
        let notes: string;
        if (status === 'visited') notes = getRandomItem(visitNotes);
        else if (status === 'closed') notes = getRandomItem(closedNotes);
        else notes = getRandomItem(issueNotes);

        // Outlet expected location
        const outletCoords = generateCoords(baseCirebon, 0);

        // Actual GPS (with potential error)
        const gpsCoords = generateCoords(
            { lat: outletCoords.latitude, lng: outletCoords.longitude },
            distanceError
        );

        visits.push({
            id: `VIS${dateStr.replace(/-/g, '')}${String(i + 1).padStart(3, '0')}`,
            outletId: outlet.id,
            outletName: outlet.name,
            outletAddress: outlet.address,
            salesforceId: sf.id,
            salesforceName: sf.name,
            checkInTime: checkIn.toISOString(),
            checkOutTime: checkOut.toISOString(),
            status,
            gpsCoords,
            outletCoords,
            distanceError: Math.round(distanceError * 100) / 100,
            notes,
            hasPhoto: status === 'visited' && Math.random() > 0.3,
            duration,
        });
    }

    // Sort by check-in time
    visits.sort((a, b) => new Date(a.checkInTime).getTime() - new Date(b.checkInTime).getTime());

    return visits;
};

/**
 * Calculate visit summary statistics.
 */
export const calculateVisitSummary = (visits: Visit[], targetVisit: number = 15): VisitSummary => {
    const actualVisit = visits.length;
    const successfulVisits = visits.filter(v => v.status === 'visited').length;
    const closedCount = visits.filter(v => v.status === 'closed').length;
    const issueCount = visits.filter(v => v.status === 'issue').length;

    const totalDuration = visits
        .filter(v => v.duration)
        .reduce((sum, v) => sum + (v.duration || 0), 0);
    const averageDuration = visits.length > 0
        ? Math.round(totalDuration / visits.length)
        : 0;

    return {
        targetVisit,
        actualVisit,
        successRate: actualVisit > 0
            ? Math.round((successfulVisits / actualVisit) * 100)
            : 0,
        averageDuration,
        closedCount,
        issueCount,
    };
};

/**
 * Get all available salesforce for filtering.
 */
export const getSalesforceOptions = () => [
    { value: '', label: 'Semua Salesforce' },
    ...salesforceList.map(sf => ({ value: sf.id, label: sf.name })),
];

/**
 * Get status options for filtering.
 */
export const getStatusOptions = () => [
    { value: 'all', label: 'Semua Status' },
    { value: 'visited', label: 'Berhasil Dikunjungi' },
    { value: 'closed', label: 'Toko Tutup' },
    { value: 'issue', label: 'Ada Kendala' },
];
