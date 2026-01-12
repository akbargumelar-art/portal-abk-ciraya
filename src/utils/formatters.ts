/**
 * Formats a phone number (RS Number) to standard format:
 * - Removes non-digits
 * - Ensures leading '0' (replaces '62' prefix if present)
 * - Pads to minimum 8 digits (with leading 0)
 * - Limits to 12 digits max
 */
export const formatRSNumber = (value: string | undefined | null): string => {
    if (!value) return '-';

    // Remove non-digits
    let clean = value.replace(/\D/g, '');

    // Handle 62 prefix
    if (clean.startsWith('62')) {
        clean = '0' + clean.slice(2);
    }

    // Ensure leading 0 if not empty
    if (clean.length > 0 && !clean.startsWith('0')) {
        clean = '0' + clean;
    }

    // Pad to minimum 8 digits (e.g., "0812345" -> "00812345")
    if (clean.length > 0 && clean.length < 8) {
        clean = clean.padStart(8, '0');
    }

    // Limit to 12 digits
    if (clean.length > 12) {
        clean = clean.slice(0, 12);
    }

    return clean || '-';
};
