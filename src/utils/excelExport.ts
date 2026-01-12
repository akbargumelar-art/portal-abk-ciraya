// Excel Export Utility using xlsx library
import * as XLSX from 'xlsx';

interface ExportColumn {
    header: string;
    key: string;
    width?: number;
}

interface ExportOptions {
    filename: string;
    sheetName?: string;
    columns: ExportColumn[];
    data: Record<string, unknown>[];
}

/**
 * Export data to Excel file using xlsx library
 */
export const exportToExcel = ({ filename, sheetName = 'Data', columns, data }: ExportOptions): void => {
    // Create worksheet data with headers
    const headers = columns.map(col => col.header);
    const rows = data.map(row => columns.map(col => {
        const value = row[col.key];
        // Handle nested objects (e.g., metrics.actual)
        if (col.key.includes('.')) {
            const parts = col.key.split('.');
            let current: unknown = row;
            for (const part of parts) {
                if (current && typeof current === 'object') {
                    current = (current as Record<string, unknown>)[part];
                }
            }
            return current ?? '';
        }
        return value ?? '';
    }));

    // Combine headers and data
    const worksheetData = [headers, ...rows];

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Set column widths
    worksheet['!cols'] = columns.map(col => ({ wch: col.width || 15 }));

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 10);
    const fullFilename = `${filename}_${timestamp}.xlsx`;

    // Download file
    XLSX.writeFile(workbook, fullFilename);
};

/**
 * Export table data for Sell Thru Detail Outlet
 */
export const exportDetailOutlet = (
    data: Record<string, unknown>[],
    products: { id: string; name: string }[],
    mode: 'perdana' | 'voucher',
    source: 'nota' | 'digipos'
): void => {
    // Build columns dynamically
    const baseColumns: ExportColumn[] = [
        { header: 'ID Digipos', key: 'id_digipos', width: 15 },
        { header: 'No RS', key: 'rs_number', width: 12 },
        { header: 'Nama Outlet', key: 'outlet_name', width: 25 },
        { header: 'Salesforce', key: 'salesforce_name', width: 20 },
        { header: 'TAP', key: 'tap_name', width: 15 },
        { header: 'Kabupaten', key: 'kabupaten', width: 15 },
        { header: 'Kecamatan', key: 'kecamatan', width: 15 },
        { header: 'Fisik', key: 'fisik_status', width: 10 },
        { header: 'Hari PJP', key: 'hari_pjp', width: 10 },
        { header: 'Lokasi', key: 'lokasi_outlet', width: 15 },
    ];

    // Add product metric columns
    const productColumns: ExportColumn[] = [];
    products.forEach(product => {
        const metricKey = mode === 'perdana' ? 'perdana' : 'voucher';
        productColumns.push(
            { header: `${product.name} - Target`, key: `${metricKey}.${product.id}.target`, width: 12 },
            { header: `${product.name} - Actual`, key: `${metricKey}.${product.id}.actual`, width: 12 },
            { header: `${product.name} - Ach%`, key: `${metricKey}.${product.id}.achievement_pct`, width: 10 },
            { header: `${product.name} - Gap`, key: `${metricKey}.${product.id}.gap`, width: 10 },
            { header: `${product.name} - M-1`, key: `${metricKey}.${product.id}.prev_month`, width: 10 },
            { header: `${product.name} - MoM%`, key: `${metricKey}.${product.id}.mom_growth`, width: 10 },
        );
    });

    // Process data to flatten nested objects
    const processedData = data.map(row => {
        const flatRow: Record<string, unknown> = { ...row };
        const metrics = (row as Record<string, Record<string, Record<string, unknown>>>)[mode === 'perdana' ? 'perdana' : 'voucher'];
        if (metrics) {
            products.forEach(product => {
                const m = metrics[product.id];
                if (m) {
                    flatRow[`${mode === 'perdana' ? 'perdana' : 'voucher'}.${product.id}.target`] = m.target;
                    flatRow[`${mode === 'perdana' ? 'perdana' : 'voucher'}.${product.id}.actual`] = m.actual;
                    flatRow[`${mode === 'perdana' ? 'perdana' : 'voucher'}.${product.id}.achievement_pct`] = typeof m.achievement_pct === 'number' ? Math.round(m.achievement_pct as number) : m.achievement_pct;
                    flatRow[`${mode === 'perdana' ? 'perdana' : 'voucher'}.${product.id}.gap`] = m.gap;
                    flatRow[`${mode === 'perdana' ? 'perdana' : 'voucher'}.${product.id}.prev_month`] = m.prev_month;
                    flatRow[`${mode === 'perdana' ? 'perdana' : 'voucher'}.${product.id}.mom_growth`] = typeof m.mom_growth === 'number' ? Math.round(m.mom_growth as number) : m.mom_growth;
                }
            });
        }
        return flatRow;
    });

    exportToExcel({
        filename: `SellThru_${source.toUpperCase()}_${mode}_DetailOutlet`,
        sheetName: `${mode} Detail`,
        columns: [...baseColumns, ...productColumns],
        data: processedData,
    });
};

/**
 * Export D2C Summary data
 */
export const exportD2CSummary = (
    data: Record<string, unknown>[],
    products: { id: string; name: string }[],
    tableType: 'TAP' | 'SF'
): void => {
    const baseColumns: ExportColumn[] = [
        { header: 'Nama', key: 'name', width: 25 },
        { header: 'Jumlah SF', key: 'sf_count', width: 10 },
    ];

    const productColumns: ExportColumn[] = [];
    products.forEach(product => {
        productColumns.push(
            { header: `${product.name} - Target`, key: `products.${product.id}.target`, width: 12 },
            { header: `${product.name} - Actual`, key: `products.${product.id}.actual`, width: 12 },
            { header: `${product.name} - Ach%`, key: `products.${product.id}.achievement_pct`, width: 10 },
            { header: `${product.name} - Gap`, key: `products.${product.id}.gap`, width: 10 },
            { header: `${product.name} - Revenue`, key: `products.${product.id}.revenue_actual`, width: 15 },
        );
    });

    // Flatten data
    const processedData = data.map(row => {
        const flatRow: Record<string, unknown> = { ...row };
        const products_data = (row as Record<string, Record<string, Record<string, unknown>>>).products;
        if (products_data) {
            products.forEach(product => {
                const m = products_data[product.id];
                if (m) {
                    flatRow[`products.${product.id}.target`] = m.target;
                    flatRow[`products.${product.id}.actual`] = m.actual;
                    flatRow[`products.${product.id}.achievement_pct`] = typeof m.achievement_pct === 'number' ? Math.round(m.achievement_pct as number) : m.achievement_pct;
                    flatRow[`products.${product.id}.gap`] = m.gap;
                    flatRow[`products.${product.id}.revenue_actual`] = m.revenue_actual;
                }
            });
        }
        return flatRow;
    });

    exportToExcel({
        filename: `D2C_Summary_${tableType}`,
        sheetName: `${tableType} Summary`,
        columns: [...baseColumns, ...productColumns],
        data: processedData,
    });
};
