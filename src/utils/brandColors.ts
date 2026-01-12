/**
 * Brand Color Utilities for Telkomsel Products
 * 
 * Simpati (Telkomsel): Red theme based on telkomsel.com
 * byU: Cyan/Sky Blue theme based on byu.id
 */

// Telkomsel/Simpati brand colors (red theme) - #E31937
export const SIMPATI_COLORS = {
    primary: '#E31937',      // Telkomsel Red
    light: '#FEE2E2',        // Soft red background
    lighter: '#FEF2F2',      // Very light red
    border: '#FECACA',       // Red border
    text: '#DC2626',         // Red text
    // Tailwind equivalents
    bg: 'bg-red-50',
    bgLight: 'bg-red-100',
    bgMedium: 'bg-red-200',
    borderClass: 'border-red-200',
    textClass: 'text-red-600',
    // Main header - Telkomsel Red
    headerBg: 'bg-[#E31937]',
    headerText: 'text-white',
    // Sub-header - lighter red
    subHeaderBg: 'bg-[#EF4444]',
};

// byU brand colors (cyan/sky blue theme - based on byu.id) - #00A9E0
export const BYU_COLORS = {
    primary: '#00A9E0',      // byU Cyan Blue
    light: '#F0F9FF',        // Very soft sky background
    lighter: '#F0F9FF',      // Very light sky
    border: '#BAE6FD',       // Sky border
    text: '#0284C7',         // Sky text
    // Tailwind equivalents (using sky for softer look)
    bg: 'bg-sky-50',
    bgLight: 'bg-sky-100',
    bgMedium: 'bg-sky-200',
    borderClass: 'border-sky-200',
    textClass: 'text-sky-600',
    // Main header - byU Cyan Blue
    headerBg: 'bg-[#00A9E0]',
    headerText: 'text-white',
    // Sub-header - lighter cyan
    subHeaderBg: 'bg-[#38BDF8]',
};

// Default/neutral colors for other products - Dark Blue theme
export const DEFAULT_COLORS = {
    bg: 'bg-[#2c4a6a]/10',
    bgLight: 'bg-[#4a6a8a]',
    bgMedium: 'bg-[#3d5f85]',
    borderClass: 'border-[#4a6a8a]',
    textClass: 'text-[#2c4a6a]',
    // Main header - Dark blue
    headerBg: 'bg-[#2c4a6a]',
    headerText: 'text-white',
    // Sub-header - lighter dark blue
    subHeaderBg: 'bg-[#4a6a8a]',
};

// Total/aggregate column colors - Dark Blue theme
export const TOTAL_COLORS = {
    bg: 'bg-[#2c4a6a]/10',
    bgLight: 'bg-[#4a6a8a]',
    headerBg: 'bg-[#2c4a6a]',
    headerText: 'text-white',
    subHeaderBg: 'bg-[#3d5f85]',
};

/**
 * Get brand colors based on product key or label
 */
export function getBrandColors(productKey: string): typeof SIMPATI_COLORS {
    const key = productKey.toLowerCase();

    if (key.includes('simpati')) {
        return SIMPATI_COLORS;
    }
    if (key.includes('byu') || key.includes('by.u') || key.includes('by_u')) {
        return BYU_COLORS;
    }

    return DEFAULT_COLORS as typeof SIMPATI_COLORS;
}

/**
 * Get header background class based on product key (main header with text-white)
 */
export function getProductHeaderBg(productKey: string): string {
    const key = productKey.toLowerCase();

    if (key === 'total') {
        return `${TOTAL_COLORS.headerBg} text-white`;
    }
    if (key.includes('simpati')) {
        return `${SIMPATI_COLORS.headerBg} text-white`;
    }
    if (key.includes('byu') || key.includes('by.u') || key.includes('by_u')) {
        return `${BYU_COLORS.headerBg} text-white`;
    }

    return `${DEFAULT_COLORS.headerBg} text-white`;
}

/**
 * Get sub-header background class based on product key (lighter shade with text-white)
 */
export function getProductSubHeaderBg(productKey: string): string {
    const key = productKey.toLowerCase();

    if (key === 'total') {
        return `${TOTAL_COLORS.subHeaderBg} text-white`;
    }
    if (key.includes('simpati')) {
        return `${SIMPATI_COLORS.subHeaderBg} text-white`;
    }
    if (key.includes('byu') || key.includes('by.u') || key.includes('by_u')) {
        return `${BYU_COLORS.subHeaderBg} text-white`;
    }

    return `${DEFAULT_COLORS.subHeaderBg} text-white`;
}

/**
 * Get cell background class based on product key
 */
export function getProductCellBg(productKey: string, isHeader: boolean = false): string {
    const key = productKey.toLowerCase();

    if (key === 'total') {
        return isHeader ? `${TOTAL_COLORS.bgLight} text-white` : TOTAL_COLORS.bg;
    }
    if (key.includes('simpati')) {
        return isHeader ? `${SIMPATI_COLORS.subHeaderBg} text-white` : SIMPATI_COLORS.bg;
    }
    if (key.includes('byu') || key.includes('by.u') || key.includes('by_u')) {
        return isHeader ? `${BYU_COLORS.subHeaderBg} text-white` : BYU_COLORS.bg;
    }

    return isHeader ? `${DEFAULT_COLORS.subHeaderBg} text-white` : DEFAULT_COLORS.bg;
}

/**
 * Get Target column background (very light/near-white with black text)
 */
export function getProductTargetBg(productKey: string): string {
    const key = productKey.toLowerCase();

    if (key === 'total') {
        return 'bg-slate-50 text-gray-900';
    }
    if (key.includes('simpati')) {
        return 'bg-red-50/50 text-gray-900';
    }
    if (key.includes('byu') || key.includes('by.u') || key.includes('by_u')) {
        return 'bg-sky-50/50 text-gray-900';
    }

    return 'bg-blue-50/50 text-gray-900';
}
