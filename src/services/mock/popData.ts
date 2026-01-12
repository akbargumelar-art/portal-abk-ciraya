/**
 * Mock POP Data
 * 
 * Generates realistic mock data for POP items, transactions,
 * and installation records with placeholder images.
 */

import type {
    POPItem,
    POPTransaction,
    POPRecord,
    POPCategory,
    POPStatus,
    POPTransactionType
} from '../../types/pop';

// ============================================================================
// PLACEHOLDER IMAGES (Using picsum.photos for variety)
// ============================================================================

const PLACEHOLDER_IMAGES = {
    banner: [
        'https://picsum.photos/seed/banner1/400/300',
        'https://picsum.photos/seed/banner2/400/300',
        'https://picsum.photos/seed/banner3/400/300',
    ],
    neon_box: [
        'https://picsum.photos/seed/neon1/400/300',
        'https://picsum.photos/seed/neon2/400/300',
    ],
    poster: [
        'https://picsum.photos/seed/poster1/400/300',
        'https://picsum.photos/seed/poster2/400/300',
        'https://picsum.photos/seed/poster3/400/300',
    ],
    x_banner: [
        'https://picsum.photos/seed/xbanner1/400/300',
        'https://picsum.photos/seed/xbanner2/400/300',
    ],
    spanduk: [
        'https://picsum.photos/seed/spanduk1/400/300',
        'https://picsum.photos/seed/spanduk2/400/300',
    ],
    sticker: [
        'https://picsum.photos/seed/sticker1/400/300',
        'https://picsum.photos/seed/sticker2/400/300',
    ],
    flag: [
        'https://picsum.photos/seed/flag1/400/300',
    ],
    standee: [
        'https://picsum.photos/seed/standee1/400/300',
    ],
};

const PROOF_PHOTOS = [
    'https://picsum.photos/seed/proof1/400/300',
    'https://picsum.photos/seed/proof2/400/300',
    'https://picsum.photos/seed/proof3/400/300',
    'https://picsum.photos/seed/proof4/400/300',
    'https://picsum.photos/seed/proof5/400/300',
];

// ============================================================================
// MOCK POP ITEMS (CATALOG)
// ============================================================================

export const MOCK_POP_ITEMS: POPItem[] = [
    {
        id: 'POP-001',
        name: 'Banner 4G LTE Promo',
        category: 'banner',
        description: 'Banner promosi paket 4G LTE ukuran 3x1 meter',
        referencePhotoUrl: PLACEHOLDER_IMAGES.banner[0],
        stock: 25,
        minStock: 5,
        unit: 'lembar',
        isActive: true,
        createdAt: '2024-01-15T08:00:00Z',
        updatedAt: '2024-12-01T10:30:00Z',
    },
    {
        id: 'POP-002',
        name: 'Neon Box Telkomsel',
        category: 'neon_box',
        description: 'Neon box logo Telkomsel ukuran 60x80cm',
        referencePhotoUrl: PLACEHOLDER_IMAGES.neon_box[0],
        stock: 8,
        minStock: 2,
        unit: 'unit',
        isActive: true,
        createdAt: '2024-02-20T09:00:00Z',
        updatedAt: '2024-11-15T14:20:00Z',
    },
    {
        id: 'POP-003',
        name: 'Poster Paket Internet',
        category: 'poster',
        description: 'Poster A2 promo paket internet bulanan',
        referencePhotoUrl: PLACEHOLDER_IMAGES.poster[0],
        stock: 50,
        minStock: 10,
        unit: 'lembar',
        isActive: true,
        createdAt: '2024-03-10T07:30:00Z',
        updatedAt: '2024-12-10T08:45:00Z',
    },
    {
        id: 'POP-004',
        name: 'X-Banner Produk Baru',
        category: 'x_banner',
        description: 'X-Banner 60x160cm untuk produk baru',
        referencePhotoUrl: PLACEHOLDER_IMAGES.x_banner[0],
        stock: 15,
        minStock: 3,
        unit: 'unit',
        isActive: true,
        createdAt: '2024-04-05T10:00:00Z',
        updatedAt: '2024-12-05T11:00:00Z',
    },
    {
        id: 'POP-005',
        name: 'Spanduk Promo Akhir Tahun',
        category: 'spanduk',
        description: 'Spanduk 5x1 meter promo akhir tahun',
        referencePhotoUrl: PLACEHOLDER_IMAGES.spanduk[0],
        stock: 12,
        minStock: 3,
        unit: 'lembar',
        isActive: true,
        createdAt: '2024-11-01T08:00:00Z',
        updatedAt: '2024-12-15T09:30:00Z',
    },
    {
        id: 'POP-006',
        name: 'Sticker Logo Outlet',
        category: 'sticker',
        description: 'Sticker logo untuk ditempel di etalase',
        referencePhotoUrl: PLACEHOLDER_IMAGES.sticker[0],
        stock: 100,
        minStock: 20,
        unit: 'lembar',
        isActive: true,
        createdAt: '2024-05-15T08:00:00Z',
        updatedAt: '2024-12-01T10:00:00Z',
    },
    {
        id: 'POP-007',
        name: 'Flag Banner Event',
        category: 'flag',
        description: 'Bendera/flag untuk event outdoor',
        referencePhotoUrl: PLACEHOLDER_IMAGES.flag[0],
        stock: 20,
        minStock: 5,
        unit: 'unit',
        isActive: true,
        createdAt: '2024-06-20T09:00:00Z',
        updatedAt: '2024-12-10T11:00:00Z',
    },
    {
        id: 'POP-008',
        name: 'Standee Karakter',
        category: 'standee',
        description: 'Standing display karakter maskot',
        referencePhotoUrl: PLACEHOLDER_IMAGES.standee[0],
        stock: 5,
        minStock: 2,
        unit: 'unit',
        isActive: true,
        createdAt: '2024-07-10T10:00:00Z',
        updatedAt: '2024-11-20T14:00:00Z',
    },
    {
        id: 'POP-009',
        name: 'Poster Harga Paket',
        category: 'poster',
        description: 'Poster daftar harga paket data',
        referencePhotoUrl: PLACEHOLDER_IMAGES.poster[1],
        stock: 45,
        minStock: 10,
        unit: 'lembar',
        isActive: true,
        createdAt: '2024-08-05T08:30:00Z',
        updatedAt: '2024-12-12T09:00:00Z',
    },
    {
        id: 'POP-010',
        name: 'Banner Voucher Fisik',
        category: 'banner',
        description: 'Banner promosi voucher fisik',
        referencePhotoUrl: PLACEHOLDER_IMAGES.banner[1],
        stock: 18,
        minStock: 4,
        unit: 'lembar',
        isActive: true,
        createdAt: '2024-09-01T07:00:00Z',
        updatedAt: '2024-12-08T10:30:00Z',
    },
];

// ============================================================================
// MOCK POP TRANSACTIONS
// ============================================================================

export const MOCK_POP_TRANSACTIONS: POPTransaction[] = [
    {
        id: 'TRX-001',
        type: 'inbound',
        itemId: 'POP-001',
        itemName: 'Banner 4G LTE Promo',
        quantity: 30,
        notes: 'Pengiriman dari gudang pusat',
        date: '2024-12-01',
        createdAt: '2024-12-01T08:00:00Z',
    },
    {
        id: 'TRX-002',
        type: 'installation',
        itemId: 'POP-001',
        itemName: 'Banner 4G LTE Promo',
        quantity: 1,
        proofPhotoUrl: PROOF_PHOTOS[0],
        toOutletId: 'OUT-001',
        toOutletName: 'Toko Maju Jaya',
        salesforceId: 'SF-001',
        salesforceName: 'Eko Prasetyo',
        notes: 'Terpasang di depan toko',
        date: '2024-12-05',
        createdAt: '2024-12-05T10:30:00Z',
    },
    {
        id: 'TRX-003',
        type: 'transfer',
        itemId: 'POP-003',
        itemName: 'Poster Paket Internet',
        quantity: 10,
        proofPhotoUrl: PROOF_PHOTOS[1],
        fromLocation: 'Gudang Cirebon',
        toOutletId: 'OUT-002',
        toOutletName: 'Cell Center',
        salesforceId: 'SF-002',
        salesforceName: 'Rudi Hartono',
        notes: 'Serah terima di outlet',
        date: '2024-12-10',
        createdAt: '2024-12-10T14:00:00Z',
    },
    {
        id: 'TRX-004',
        type: 'installation',
        itemId: 'POP-002',
        itemName: 'Neon Box Telkomsel',
        quantity: 1,
        proofPhotoUrl: PROOF_PHOTOS[2],
        toOutletId: 'OUT-003',
        toOutletName: 'Ponsel Mart',
        salesforceId: 'SF-001',
        salesforceName: 'Eko Prasetyo',
        notes: 'Dipasang di atas pintu masuk',
        date: '2024-12-12',
        createdAt: '2024-12-12T09:00:00Z',
    },
    {
        id: 'TRX-005',
        type: 'installation',
        itemId: 'POP-004',
        itemName: 'X-Banner Produk Baru',
        quantity: 1,
        proofPhotoUrl: PROOF_PHOTOS[3],
        toOutletId: 'OUT-004',
        toOutletName: 'Gadget Zone',
        salesforceId: 'SF-003',
        salesforceName: 'Dewi Sartika',
        notes: 'Di samping kasir',
        date: '2024-12-15',
        createdAt: '2024-12-15T11:00:00Z',
    },
    {
        id: 'TRX-006',
        type: 'inbound',
        itemId: 'POP-005',
        itemName: 'Spanduk Promo Akhir Tahun',
        quantity: 15,
        notes: 'Stock untuk promo Desember',
        date: '2024-12-01',
        createdAt: '2024-12-01T07:30:00Z',
    },
];

// ============================================================================
// MOCK POP RECORDS (INSTALLATION STATUS)
// ============================================================================

export const MOCK_POP_RECORDS: POPRecord[] = [
    {
        id: 'REC-001',
        date: '2024-12-20',
        outletId: 'OUT-001',
        outletName: 'Toko Maju Jaya',
        outletAddress: 'Jl. Kartini No. 15, Cirebon',
        itemId: 'POP-001',
        itemName: 'Banner 4G LTE Promo',
        itemCategory: 'banner',
        referencePhotoUrl: PLACEHOLDER_IMAGES.banner[0],
        proofPhotoUrl: PROOF_PHOTOS[0],
        status: 'installed',
        salesforceId: 'SF-001',
        salesforceName: 'Eko Prasetyo',
        installedAt: '2024-12-05T10:30:00Z',
        lastCheckedAt: '2024-12-20T09:00:00Z',
    },
    {
        id: 'REC-002',
        date: '2024-12-20',
        outletId: 'OUT-002',
        outletName: 'Cell Center',
        outletAddress: 'Jl. Siliwangi No. 88, Cirebon',
        itemId: 'POP-002',
        itemName: 'Neon Box Telkomsel',
        itemCategory: 'neon_box',
        referencePhotoUrl: PLACEHOLDER_IMAGES.neon_box[0],
        proofPhotoUrl: PROOF_PHOTOS[2],
        status: 'installed',
        salesforceId: 'SF-002',
        salesforceName: 'Rudi Hartono',
        installedAt: '2024-11-20T14:00:00Z',
        lastCheckedAt: '2024-12-20T10:30:00Z',
    },
    {
        id: 'REC-003',
        date: '2024-12-19',
        outletId: 'OUT-003',
        outletName: 'Ponsel Mart',
        outletAddress: 'Jl. Dr. Cipto No. 45, Cirebon',
        itemId: 'POP-001',
        itemName: 'Banner 4G LTE Promo',
        itemCategory: 'banner',
        referencePhotoUrl: PLACEHOLDER_IMAGES.banner[0],
        proofPhotoUrl: PROOF_PHOTOS[1],
        status: 'damaged',
        salesforceId: 'SF-001',
        salesforceName: 'Eko Prasetyo',
        notes: 'Sobek kena angin kencang',
        installedAt: '2024-11-15T09:00:00Z',
        lastCheckedAt: '2024-12-19T11:00:00Z',
    },
    {
        id: 'REC-004',
        date: '2024-12-19',
        outletId: 'OUT-004',
        outletName: 'Gadget Zone',
        outletAddress: 'Jl. Veteran No. 12, Kuningan',
        itemId: 'POP-003',
        itemName: 'Poster Paket Internet',
        itemCategory: 'poster',
        referencePhotoUrl: PLACEHOLDER_IMAGES.poster[0],
        status: 'missing',
        salesforceId: 'SF-003',
        salesforceName: 'Dewi Sartika',
        notes: 'Tidak ditemukan saat pengecekan',
        installedAt: '2024-10-20T10:00:00Z',
        lastCheckedAt: '2024-12-19T14:00:00Z',
    },
    {
        id: 'REC-005',
        date: '2024-12-18',
        outletId: 'OUT-005',
        outletName: 'Phone Expert',
        outletAddress: 'Jl. Pemuda No. 67, Majalengka',
        itemId: 'POP-004',
        itemName: 'X-Banner Produk Baru',
        itemCategory: 'x_banner',
        referencePhotoUrl: PLACEHOLDER_IMAGES.x_banner[0],
        status: 'pending',
        salesforceId: 'SF-003',
        salesforceName: 'Dewi Sartika',
        notes: 'Menunggu konfirmasi dari outlet',
        lastCheckedAt: '2024-12-18T09:00:00Z',
    },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all POP items.
 */
export const getPOPItems = (): POPItem[] => MOCK_POP_ITEMS;

/**
 * Get POP item by ID.
 */
export const getPOPItemById = (id: string): POPItem | undefined =>
    MOCK_POP_ITEMS.find(item => item.id === id);

/**
 * Get POP items by category.
 */
export const getPOPItemsByCategory = (category: POPCategory): POPItem[] =>
    MOCK_POP_ITEMS.filter(item => item.category === category);

/**
 * Get all transactions.
 */
export const getPOPTransactions = (): POPTransaction[] => MOCK_POP_TRANSACTIONS;

/**
 * Get transactions by type.
 */
export const getPOPTransactionsByType = (type: POPTransactionType): POPTransaction[] =>
    MOCK_POP_TRANSACTIONS.filter(t => t.type === type);

/**
 * Get all POP records.
 */
export const getPOPRecords = (): POPRecord[] => MOCK_POP_RECORDS;

/**
 * Get POP records by status.
 */
export const getPOPRecordsByStatus = (status: POPStatus): POPRecord[] =>
    MOCK_POP_RECORDS.filter(r => r.status === status);

/**
 * Category options for dropdowns.
 */
export const CATEGORY_OPTIONS = [
    { value: '', label: 'Semua Kategori' },
    { value: 'banner', label: 'Banner' },
    { value: 'neon_box', label: 'Neon Box' },
    { value: 'poster', label: 'Poster' },
    { value: 'x_banner', label: 'X-Banner' },
    { value: 'spanduk', label: 'Spanduk' },
    { value: 'sticker', label: 'Sticker' },
    { value: 'flag', label: 'Flag/Bendera' },
    { value: 'standee', label: 'Standee' },
];

/**
 * Status options for dropdowns.
 */
export const STATUS_OPTIONS = [
    { value: '', label: 'Semua Status' },
    { value: 'installed', label: 'Terpasang' },
    { value: 'damaged', label: 'Rusak' },
    { value: 'missing', label: 'Hilang' },
    { value: 'pending', label: 'Pending' },
];
