/**
 * Formats a phone number (RS Number) to standard format:
 * - Removes non-digits
 * - Ensures leading '0' (replaces '62' prefix if present)
 * - Pads to minimum 8 digits (with leading 0)
 * - Limits to 12 digits max
 */
export const formatRSNumber = (value: string | undefined | null): string => {
    if (!value) return '-';

    let clean = value.replace(/\D/g, '');
    if (clean.startsWith('62')) clean = '0' + clean.slice(2);
    if (clean.length > 0 && !clean.startsWith('0')) clean = '0' + clean;
    if (clean.length > 0 && clean.length < 8) clean = clean.padStart(8, '0');
    if (clean.length > 12) clean = clean.slice(0, 12);

    return clean || '-';
};

/**
 * Format angka ke format Rupiah singkat (B/M/K).
 * Contoh: 1_500_000 → "Rp 1.5M"
 */
export const formatCurrency = (value: number): string => {
    const abs = Math.abs(value);
    if (abs >= 1_000_000_000) return `Rp ${(value / 1_000_000_000).toFixed(2)}B`;
    if (abs >= 1_000_000)     return `Rp ${(value / 1_000_000).toFixed(1)}M`;
    if (abs >= 1_000)         return `Rp ${(value / 1_000).toFixed(0)}K`;
    return `Rp ${value.toLocaleString('id-ID')}`;
};

/**
 * Format persentase dengan tanda '+' untuk positif.
 * Contoh: 12.5 → "+12.5%"
 */
export const formatPct = (value: number, decimals = 1): string => {
    const str = value.toFixed(decimals) + '%';
    return value > 0 ? '+' + str : str;
};

/**
 * Format angka biasa dengan pemisah ribuan.
 * Contoh: 12500 → "12.500"
 */
export const formatNumber = (value: number): string =>
    value.toLocaleString('id-ID');

/**
 * Warna pertumbuhan: hijau positif, merah negatif, abu netral.
 */
export const getGrowthColor = (value: number): string => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-500';
};

/**
 * Warna achievement/rate badge berdasarkan threshold.
 * @param invert - jika true, logika dibalik (rendah = baik, untuk stock-0)
 */
export const getRateBadgeClass = (value: number, invert = false): string => {
    if (invert) {
        if (value <= 5)  return 'bg-green-100 text-green-700';
        if (value <= 20) return 'bg-yellow-100 text-yellow-700';
        return 'bg-red-100 text-red-700';
    }
    if (value >= 80) return 'bg-green-100 text-green-700';
    if (value >= 50) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
};

