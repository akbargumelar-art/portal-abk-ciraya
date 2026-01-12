/**
 * DOA (Delivery Order Allocation) Types
 * 
 * Data structures for DOA List SN and related pages
 */

// ===========================================
// DOA RECORD - Grouped/Range View
// ===========================================
export interface DOARecord {
    id: string;                 // Unique ID
    do_number: string;          // "DO#" column
    do_date: string;            // "Tanggal DO" column
    product_code: string;       // "Kode" column
    product_name: string;       // "Deskripsi Barang" column
    sn_start: string;           // "Blok Awal" column
    sn_end: string;             // "Blok Akhir" column
    qty: number;                // "Jml" column
    expiry_date: string;        // "Tgl Kadaluarsa" column
    location: string;           // "Lokasi" column
}

// ===========================================
// DOA SUMMARY - Aggregate Statistics
// ===========================================
export interface DOASummary {
    total_qty: number;
    total_do_count: number;
    latest_do_date: string;
    total_products: number;
    expiring_soon_count: number; // Items expiring in 30 days
}

// ===========================================
// FILTER STATE
// ===========================================
export interface DOAFilterState {
    do_number: string;
    product_code: string;
    location: string;
    date_from: string;
    date_to: string;
    search_sn: string;
}
