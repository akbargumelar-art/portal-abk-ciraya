/**
 * excelTemplates.ts — Generator template Excel (.xlsx) untuk import data.
 *
 * Menggunakan library `xlsx` (SheetJS) yang sudah terinstall.
 * Setiap template berisi:
 * - Header row dengan nama kolom
 * - 2-3 baris contoh data
 * - Komentar/instruksi di sheet kedua
 */
import * as XLSX from 'xlsx';

interface TemplateConfig {
    id: string;
    name: string;
    sheetName: string;
    description: string;
    headers: string[];
    sampleData: (string | number)[][];
    notes: string[];
}

// ─── Template Definitions ─────────────────────────────────────────────────────

const TEMPLATES: TemplateConfig[] = [
    {
        id: 'register_outlet',
        name: 'Register Outlet',
        sheetName: 'Register Outlet',
        description: 'Data registrasi outlet termasuk info lokasi, PJP, dan flag.',
        headers: [
            'ID Outlet', 'Nama Outlet', 'ID Digipos', 'No RS', 'Alamat',
            'Kabupaten', 'Kecamatan', 'Kelurahan', 'TAP',
            'ID Salesforce', 'Nama Salesforce',
            'Status PJP', 'Status Fisik', 'Grade Fisik',
            'Status Digipos', 'Hari PJP', 'Nomor Konfirmasi', 'No HP Owner',
            'Lokasi Outlet', 'Flag', 'Latitude', 'Longitude',
        ],
        sampleData: [
            ['OT001', 'Toko Berkah Jaya', 'DGP-001234', 'RS-000001', 'Jl. Merdeka No. 10',
             'CIREBON', 'Harjamukti', 'Kalijaga', 'CIREBON',
             'SF001', 'Budi Santoso',
             'PJP', 'Fisik', 'Gold',
             'active', 'Senin', 'KNF-12345', '081234567890',
             'Ring 1', 'Retail', -6.7320, 108.5523],
            ['OT002', 'Cell Corner Indramayu', 'DGP-005678', 'RS-000002', 'Jl. Pahlawan No. 5',
             'INDRAMAYU', 'Sindang', 'Dermayu', 'INDRAMAYU',
             'SF003', 'Rina Kartika',
             'Non PJP', 'Non Fisik', 'Silver',
             'inactive', 'Selasa', 'KNF-67890', '087654321098',
             'Ring 2', 'Pareto Retail', -6.3276, 108.3247],
        ],
        notes: [
            'Status PJP: PJP | Non PJP',
            'Status Fisik: Fisik | Non Fisik',
            'Grade Fisik: Gold | Silver | Bronze',
            'Status Digipos: active | inactive',
            'Lokasi Outlet: Ring 1 | Ring 2 | Ring 3',
            'Flag: Retail | Pareto Retail | Big Pareto | Office | D2C',
            'Hari PJP: Senin | Selasa | Rabu | Kamis | Jumat | Sabtu',
            'TAP: CIREBON | INDRAMAYU | KUNINGAN | MAJALENGKA',
        ],
    },
    {
        id: 'stock_perdana',
        name: 'Stock Perdana',
        sheetName: 'Stock Perdana',
        description: 'Data stok kartu perdana per outlet per produk.',
        headers: [
            'ID Outlet', 'Tipe Produk', 'Group Produk', 'Nama Produk', 'Kode Produk',
            'Stock FM-1', 'Stock M-1', 'Stock M (Sisa)',
            'Beli M', 'Target M',
            'Sell Out FM-1', 'Sell Out M-1', 'Sell Out M',
            'Periode (YYYY-MM)',
        ],
        sampleData: [
            ['OT001', 'perdana', 'A', 'Simpati 5K', 'SP-5K', 50, 40, 35, 20, 30, 15, 18, 25, '2024-12'],
            ['OT001', 'perdana', 'B', 'byU 10K', 'BYU-10K', 30, 25, 20, 15, 25, 10, 12, 20, '2024-12'],
            ['OT002', 'perdana', 'A', 'Simpati 10K', 'SP-10K', 40, 35, 28, 18, 25, 12, 15, 22, '2024-12'],
        ],
        notes: [
            'Tipe Produk: perdana',
            'Group Produk: A (Simpati) | B (byU)',
            'Periode format: YYYY-MM (contoh: 2024-12)',
            'ID Outlet harus sesuai dengan data di Register Outlet',
        ],
    },
    {
        id: 'stock_voucher',
        name: 'Stock Voucher',
        sheetName: 'Stock Voucher',
        description: 'Data stok voucher per outlet per produk.',
        headers: [
            'ID Outlet', 'Tipe Produk', 'Group Produk', 'Nama Produk', 'Kode Produk',
            'Stock FM-1', 'Stock M-1', 'Stock M (Sisa)',
            'Beli M', 'Target M',
            'Redeem FM-1', 'Redeem M-1', 'Redeem M',
            'Periode (YYYY-MM)',
        ],
        sampleData: [
            ['OT001', 'voucher', 'A', 'Voucher Internet 5GB', 'VI-5G', 100, 80, 60, 50, 70, 30, 40, 70, '2024-12'],
            ['OT001', 'voucher', 'B', 'Voucher Game 10K', 'VG-10K', 50, 40, 30, 25, 35, 15, 20, 35, '2024-12'],
        ],
        notes: [
            'Tipe Produk: voucher',
            'Group Produk: A (Voucher Internet) | B (Voucher Game)',
            'Periode format: YYYY-MM',
            'Redeem = Sell Out untuk voucher',
        ],
    },
    {
        id: 'omzet_outlet',
        name: 'Omzet Outlet',
        sheetName: 'Omzet Outlet',
        description: 'Data transaksi omzet outlet per periode.',
        headers: [
            'ID Outlet', 'Periode (YYYY-MM)',
            'Penjualan Perdana', 'Penjualan Voucher', 'Transaksi Digipos', 'Omzet Total',
        ],
        sampleData: [
            ['OT001', '2024-12', 2500000, 1800000, 150, 4300000],
            ['OT001', '2024-11', 2200000, 1500000, 120, 3700000],
            ['OT002', '2024-12', 1800000, 1200000, 90, 3000000],
        ],
        notes: [
            'Periode format: YYYY-MM',
            'Semua nilai omzet dalam Rupiah (tanpa titik/koma)',
            'Transaksi Digipos = jumlah transaksi (bukan nominal)',
            'ID Outlet harus sesuai dengan data di Register Outlet',
        ],
    },
    {
        id: 'salesplan_perdana',
        name: 'Salesplan Perdana',
        sheetName: 'SP Perdana',
        description: 'Target dan realisasi sales plan kartu perdana.',
        headers: [
            'ID Salesforce', 'Nama Salesforce', 'TAP',
            'Nama Produk', 'Kategori',
            'Target M', 'Aktual M-1', 'Aktual M',
            'Periode (YYYY-MM)',
        ],
        sampleData: [
            ['SF001', 'Budi Santoso', 'CIREBON', 'Simpati 5K', 'perdana', 500, 420, 380, '2024-12'],
            ['SF001', 'Budi Santoso', 'CIREBON', 'byU 10K', 'perdana', 300, 280, 250, '2024-12'],
            ['SF003', 'Rina Kartika', 'INDRAMAYU', 'Simpati 10K', 'perdana', 400, 350, 320, '2024-12'],
        ],
        notes: [
            'Kategori: perdana',
            'Periode format: YYYY-MM',
            'Target dan aktual dalam satuan unit',
        ],
    },
    {
        id: 'salesplan_voucher',
        name: 'Salesplan Voucher Fisik',
        sheetName: 'SP Voucher',
        description: 'Target dan realisasi sales plan voucher fisik.',
        headers: [
            'ID Salesforce', 'Nama Salesforce', 'TAP',
            'Nama Produk', 'Kategori',
            'Target M', 'Aktual M-1', 'Aktual M',
            'Periode (YYYY-MM)',
        ],
        sampleData: [
            ['SF001', 'Budi Santoso', 'CIREBON', 'Voucher Internet 5GB', 'voucher', 800, 720, 650, '2024-12'],
            ['SF001', 'Budi Santoso', 'CIREBON', 'Voucher Game 10K', 'voucher', 200, 180, 150, '2024-12'],
        ],
        notes: [
            'Kategori: voucher',
            'Periode format: YYYY-MM',
            'Voucher fisik = voucher dalam bentuk kartu gosok',
        ],
    },
    {
        id: 'salesplan_cvm',
        name: 'CVM (Customer Value Management)',
        sheetName: 'CVM',
        description: 'Target dan realisasi program CVM.',
        headers: [
            'ID Salesforce', 'Nama Salesforce', 'TAP',
            'Nama Program', 'Kategori',
            'Target M', 'Aktual M-1', 'Aktual M',
            'Periode (YYYY-MM)',
        ],
        sampleData: [
            ['SF001', 'Budi Santoso', 'CIREBON', 'CVM Retensi', 'cvm', 100, 85, 72, '2024-12'],
            ['SF003', 'Rina Kartika', 'INDRAMAYU', 'CVM Akuisisi', 'cvm', 150, 130, 110, '2024-12'],
        ],
        notes: [
            'Kategori: cvm',
            'Program CVM meliputi: CVM Retensi, CVM Akuisisi, CVM Upgrade',
            'Target dan aktual dalam satuan outlet/pelanggan',
        ],
    },
    {
        id: 'st_nota',
        name: 'ST Nota (Sell-Thru Nota)',
        sheetName: 'ST Nota',
        description: 'Data sell-through berdasarkan nota penjualan.',
        headers: [
            'ID Outlet', 'Nama Outlet', 'TAP', 'Salesforce',
            'Tanggal Nota', 'No Nota',
            'Nama Produk', 'Kategori', 'Qty', 'Harga Satuan', 'Total',
            'Periode (YYYY-MM)',
        ],
        sampleData: [
            ['OT001', 'Toko Berkah Jaya', 'CIREBON', 'Budi Santoso',
             '2024-12-15', 'NT-001234',
             'Simpati 5K', 'perdana', 10, 5000, 50000, '2024-12'],
            ['OT001', 'Toko Berkah Jaya', 'CIREBON', 'Budi Santoso',
             '2024-12-15', 'NT-001234',
             'Voucher Internet 5GB', 'voucher', 5, 25000, 125000, '2024-12'],
        ],
        notes: [
            'Tanggal format: YYYY-MM-DD',
            'Kategori: perdana | voucher',
            'Harga Satuan dan Total dalam Rupiah',
            'Satu nota bisa memiliki banyak baris (multi-produk)',
        ],
    },
    {
        id: 'st_digipos',
        name: 'ST Digipos (Sell-Thru Digipos)',
        sheetName: 'ST Digipos',
        description: 'Data sell-through transaksi Digipos.',
        headers: [
            'ID Outlet', 'Nama Outlet', 'ID Digipos', 'TAP', 'Salesforce',
            'Tanggal Transaksi', 'ID Transaksi',
            'Nama Produk', 'Kategori', 'Qty', 'Nominal',
            'Status', 'Periode (YYYY-MM)',
        ],
        sampleData: [
            ['OT001', 'Toko Berkah Jaya', 'DGP-001234', 'CIREBON', 'Budi Santoso',
             '2024-12-15', 'TXN-00001',
             'Paket Internet 5GB', 'data', 1, 50000,
             'Success', '2024-12'],
            ['OT002', 'Cell Corner Indramayu', 'DGP-005678', 'INDRAMAYU', 'Rina Kartika',
             '2024-12-16', 'TXN-00002',
             'Pulsa 25K', 'pulsa', 1, 25000,
             'Success', '2024-12'],
        ],
        notes: [
            'Tanggal format: YYYY-MM-DD',
            'Kategori: data | pulsa | voice | sms | digital',
            'Status: Success | Failed | Pending',
            'Nominal dalam Rupiah',
        ],
    },
    {
        id: 'penjualan_d2c',
        name: 'Penjualan D2C (Direct to Consumer)',
        sheetName: 'Penjualan D2C',
        description: 'Data penjualan langsung ke konsumen (D2C).',
        headers: [
            'ID Salesforce', 'Nama Salesforce', 'TAP',
            'Tanggal', 'Nama Pelanggan', 'No HP Pelanggan',
            'Nama Produk', 'Kategori', 'Qty', 'Nominal',
            'Metode Pembayaran', 'Status',
            'Periode (YYYY-MM)',
        ],
        sampleData: [
            ['SF001', 'Budi Santoso', 'CIREBON',
             '2024-12-15', 'Ahmad Fadli', '081234567890',
             'Paket Bundling 30GB', 'bundling', 1, 150000,
             'Cash', 'Completed', '2024-12'],
            ['SF003', 'Rina Kartika', 'INDRAMAYU',
             '2024-12-16', 'Siti Nurhaliza', '087654321098',
             'Simpati Perdana + Kuota', 'starter_pack', 1, 75000,
             'Transfer', 'Completed', '2024-12'],
        ],
        notes: [
            'Tanggal format: YYYY-MM-DD',
            'Kategori: bundling | starter_pack | device | accessory',
            'Metode Pembayaran: Cash | Transfer | QRIS',
            'Status: Completed | Pending | Cancelled',
            'Nominal dalam Rupiah',
        ],
    },
];

// ─── Generator Functions ──────────────────────────────────────────────────────

/**
 * Generate dan download satu template Excel.
 */
export function downloadTemplate(templateId: string): void {
    const template = TEMPLATES.find(t => t.id === templateId);
    if (!template) {
        console.error(`Template "${templateId}" not found`);
        return;
    }

    const wb = XLSX.utils.book_new();

    // Sheet 1: Data template
    const wsData = [template.headers, ...template.sampleData];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Set column widths
    ws['!cols'] = template.headers.map(h => ({ wch: Math.max(h.length + 4, 15) }));

    XLSX.utils.book_append_sheet(wb, ws, template.sheetName);

    // Sheet 2: Instruksi
    const notesData = [
        ['INSTRUKSI PENGISIAN'],
        [''],
        [`Template: ${template.name}`],
        [`Deskripsi: ${template.description}`],
        [''],
        ['CATATAN:'],
        ...template.notes.map((n, i) => [`${i + 1}. ${n}`]),
        [''],
        ['PENTING:'],
        ['- Jangan mengubah nama kolom di baris pertama'],
        ['- Hapus baris contoh sebelum mengisi data asli'],
        ['- Pastikan ID Outlet konsisten antar sheet'],
        ['- Simpan file dalam format .xlsx'],
    ];
    const wsNotes = XLSX.utils.aoa_to_sheet(notesData);
    wsNotes['!cols'] = [{ wch: 60 }];
    XLSX.utils.book_append_sheet(wb, wsNotes, 'Instruksi');

    // Download
    const fileName = `Template_${template.name.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`;
    XLSX.writeFile(wb, fileName);
}

/**
 * Generate dan download semua template dalam satu file Excel (multi-sheet).
 */
export function downloadAllTemplates(): void {
    const wb = XLSX.utils.book_new();

    TEMPLATES.forEach(template => {
        const wsData = [template.headers, ...template.sampleData];
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        ws['!cols'] = template.headers.map(h => ({ wch: Math.max(h.length + 4, 15) }));
        XLSX.utils.book_append_sheet(wb, ws, template.sheetName);
    });

    // Instruksi sheet
    const allNotes = [
        ['INSTRUKSI PENGISIAN TEMPLATE DATA'],
        ['Portal Cirebon Raya - PT Agrabudi Komunika'],
        [''],
        ...TEMPLATES.flatMap(t => [
            [`═══ ${t.name.toUpperCase()} ═══`],
            [`Sheet: ${t.sheetName}`],
            [`Deskripsi: ${t.description}`],
            ...t.notes.map((n, i) => [`  ${i + 1}. ${n}`]),
            [''],
        ]),
        ['CATATAN UMUM:'],
        ['- Jangan mengubah nama kolom di baris pertama'],
        ['- Hapus baris contoh sebelum mengisi data asli'],
        ['- Pastikan ID Outlet konsisten antar sheet'],
        ['- Simpan file dalam format .xlsx'],
    ];
    const wsNotes = XLSX.utils.aoa_to_sheet(allNotes);
    wsNotes['!cols'] = [{ wch: 70 }];
    XLSX.utils.book_append_sheet(wb, wsNotes, 'Instruksi');

    XLSX.writeFile(wb, `Template_All_Data_Portal_ABK.xlsx`);
}

/**
 * Get list of available templates (for UI rendering).
 */
export function getTemplateList(): { id: string; name: string; description: string; columnCount: number }[] {
    return TEMPLATES.map(t => ({
        id: t.id,
        name: t.name,
        description: t.description,
        columnCount: t.headers.length,
    }));
}

export default TEMPLATES;
