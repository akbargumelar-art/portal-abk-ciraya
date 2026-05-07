/**
 * useMobilePageTitle — Mapping pathname ke judul halaman yang ringkas untuk mobile header.
 */
const PATH_TITLE_MAP: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/outlets': 'Register Outlet',
    '/stock/perdana': 'Stok Perdana',
    '/stock/voucher': 'Stok Voucher',
    '/omzet': 'Omzet Outlet',
    '/sales-plan/perdana': 'Plan Perdana',
    '/sales-plan/voucher': 'Plan Voucher',
    '/sales-plan/cvm': 'Plan CVM',
    '/sales-plan/pop-material': 'Material POP',
    '/sell-thru/nota': 'ST Nota',
    '/sell-thru/digipos': 'ST Digipos',
    '/sell-thru/d2c': 'Penjualan D2C',
    '/performance/topline': 'Top Line',
    '/performance/5s4r': '5s-4r',
    '/performance/marketshare': 'Market Share',
    '/performance/aktifasi': 'Aktivasi',
    '/performance/sellout': 'Sellout',
    '/performance/inject-voucher': 'Inject Voucher',
    '/performance/redeem-voucher': 'Redeem Voucher',
    '/kpi/cluster': 'KPI Cluster',
    '/kpi/sf': 'KPI SF',
    '/program/scs': 'Program SCS',
    '/program/retina': 'Program Retina',
    '/fee/management': 'Management Fee',
    '/fee/marketing': 'Marketing Fee',
    '/fee/gross-profit': 'Gross Profit',
    '/doa/alokasi': 'DOA Alokasi',
    '/doa/list-sn': 'DOA List SN',
    '/doa/stock': 'DOA Stok',
    '/complaint': 'Komplain',
    '/pop-monitoring': 'Monitoring POP',
    '/data-upload/sales': 'Unggah Sales',
    '/data-upload/inventory': 'Unggah Inventory',
    '/docs/visit': 'Monitoring Visit',
    '/docs/documents': 'Dokumen',
    '/docs/video': 'Video Roleplay',
    '/links': 'Link Penting',
    '/reports': 'Laporan Looker',
    '/users': 'Pengguna',
    '/settings': 'Pengaturan',
};

export function useMobilePageTitle(pathname: string): string {
    // Exact match dulu
    if (PATH_TITLE_MAP[pathname]) return PATH_TITLE_MAP[pathname];

    // Prefix match untuk dynamic routes
    const match = Object.keys(PATH_TITLE_MAP).find(p => pathname.startsWith(p + '/'));
    if (match) return PATH_TITLE_MAP[match];

    return 'Portal CR';
}
