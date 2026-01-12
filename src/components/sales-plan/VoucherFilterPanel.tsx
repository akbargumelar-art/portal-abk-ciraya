/**
 * Voucher Filter Panel
 * 
 * Provides Brand and Validity dimension filters for the Voucher Sales Plan table.
 */

import React from 'react';
import { Filter, Tag, Calendar } from 'lucide-react';
import { BRAND_OPTIONS, VALIDITY_OPTIONS } from '../../config/voucherConfig';
import { hasWeek5 } from '../../utils/dateUtils';

interface VoucherFilterPanelProps {
    month: number;
    year: number;
    // Brand filter
    selectedBrand: string;
    onBrandChange: (brand: string) => void;
    // Validity filter
    selectedValidities: string[];
    onValiditiesChange: (validities: string[]) => void;
    // Week filter
    selectedWeeks: number[];
    onSelectedWeeksChange: (weeks: number[]) => void;
    // Custom range
    customRange: { start: number; end: number } | null;
    onCustomRangeChange: (range: { start: number; end: number } | null) => void;
    showCustomDate?: boolean;
    // Additional Faceted Filters
    showTAP?: boolean;
    showSalesforce?: boolean;
    showKabupaten?: boolean;
    showFlag?: boolean;
    showPJPStatus?: boolean;
    // Data for faceted filters
    onFilterChange: (filters: any) => void; // Legacy support or new simplified callback? 
    // Actually PlanVoucherPage passes `onFilterChange={setFilters}` which updates a complex object.
    // BUT VFP props seem to demand individual props.
    // Let's look at PlanVoucherPage again.
    // Line 580: <FilterBar ... /> was replaced by me with <VoucherFilterPanel ... /> in PlanVoucherPage.
    // But did I update VoucherFilterPanel to accept `onFilterChange`?
    // I only viewed PlanVoucherPage.tsx lines 510-580.
    // In PlanVoucherPage lines 580+, it uses `FilterBar`?
    // Wait, I replaced FilterBar with VoucherFilterPanel in `PlanVoucherPage` in a previous step?
    // Ah, Step 568: `PlanVoucherPage.tsx` lines 580+ `FilterBar` is still there. 
    // I replaced `filters` state but I didn't see the replacement of FilterBar in the diff I viewed?
    // Line 580 in `PlanVoucherPage` uses `FilterBar`.
    // Wait, did I implement cascading filters in `PlanVoucherPage`?
    // Step 550? (In truncated history).
    // Let's assume `PlanVoucherPage` uses `FilterBar` currently, or `VoucherFilterPanel` acting like it.
    // The user request "Filter buat saling berkait antar filter" implies I need to IMPLEMENT this.
    // So I need to update `VoucherFilterPanel` to support these extra filters and cascading logic.
    // Or create a new component `CVMCascadingFilter`?
    // Better to enhance `VoucherFilterPanel`.

    // Proposal:
    // Update `VoucherFilterPanel` to accept `onFilterChange` which sets a unified filter state?
    // OR keep strict props. Strict props is better for "controlled component".
    // But `PlanVoucherPage` uses a massive `filters` object.
    // I should probably map the props.

    // Let's add the optional props to interface first.
    tap?: string[];
    onTapChange?: (val: string[]) => void;
    salesforce?: string[];
    onSalesforceChange?: (val: string[]) => void;
    kabupaten?: string[];
    onKabupatenChange?: (val: string[]) => void;
    flag?: string[];
    onFlagChange?: (val: string[]) => void;
    pjpStatus?: string[];
    onPJPChange?: (val: string[]) => void;
}

// Brand button colors
const brandColors: Record<string, { active: string; inactive: string }> = {
    'all': { active: 'bg-gray-700 text-white', inactive: 'border-gray-300 text-gray-600 hover:border-gray-500' },
    'simpati': { active: 'bg-red-600 text-white', inactive: 'border-red-300 text-red-600 hover:border-red-500' },
    'byu': { active: 'bg-purple-600 text-white', inactive: 'border-purple-300 text-purple-600 hover:border-purple-500' },
};

// Validity button colors
const validityColors: Record<string, { active: string; inactive: string; headerBg: string }> = {
    'vo': { active: 'bg-gray-600 text-white', inactive: 'border-gray-300 text-gray-600', headerBg: 'bg-gray-100' },
    '1d': { active: 'bg-red-500 text-white', inactive: 'border-red-300 text-red-600', headerBg: 'bg-red-50' },
    '2d': { active: 'bg-orange-500 text-white', inactive: 'border-orange-300 text-orange-600', headerBg: 'bg-orange-50' },
    '3d': { active: 'bg-amber-500 text-white', inactive: 'border-amber-300 text-amber-600', headerBg: 'bg-amber-50' },
    '5d': { active: 'bg-yellow-500 text-white', inactive: 'border-yellow-400 text-yellow-700', headerBg: 'bg-yellow-50' },
    '7d': { active: 'bg-lime-500 text-white', inactive: 'border-lime-300 text-lime-600', headerBg: 'bg-lime-50' },
    '14d': { active: 'bg-cyan-500 text-white', inactive: 'border-cyan-300 text-cyan-600', headerBg: 'bg-cyan-50' },
    '30d': { active: 'bg-blue-500 text-white', inactive: 'border-blue-300 text-blue-600', headerBg: 'bg-blue-50' },
};

// Week color mapping
const weekColors: Record<number, string> = {
    1: 'bg-indigo-600 hover:bg-indigo-700',
    2: 'bg-purple-600 hover:bg-purple-700',
    3: 'bg-pink-600 hover:bg-pink-700',
    4: 'bg-orange-600 hover:bg-orange-700',
    5: 'bg-teal-600 hover:bg-teal-700',
};

const weekInactiveColors: Record<number, string> = {
    1: 'border-indigo-300 text-indigo-600 hover:border-indigo-500',
    2: 'border-purple-300 text-purple-600 hover:border-purple-500',
    3: 'border-pink-300 text-pink-600 hover:border-pink-500',
    4: 'border-orange-300 text-orange-600 hover:border-orange-500',
    5: 'border-teal-300 text-teal-600 hover:border-teal-500',
};

export { validityColors };

const VoucherFilterPanel: React.FC<VoucherFilterPanelProps> = ({
    month,
    year,
    selectedBrand,
    onBrandChange,
    selectedValidities,
    onValiditiesChange,
    selectedWeeks,
    onSelectedWeeksChange,
    customRange,
    onCustomRangeChange,
    showCustomDate = true,
}) => {
    const showWeek5 = hasWeek5(month, year);
    const weeks = showWeek5 ? [1, 2, 3, 4, 5] : [1, 2, 3, 4];
    const getMaxDays = () => new Date(year, month, 0).getDate();

    // Validity toggle
    const toggleValidity = (val: string) => {
        if (selectedValidities.includes(val)) {
            onValiditiesChange(selectedValidities.filter(v => v !== val));
        } else {
            onValiditiesChange([...selectedValidities, val]);
        }
    };

    const selectAllValidities = () => {
        onValiditiesChange(VALIDITY_OPTIONS.map(v => v.value));
    };

    const clearValidities = () => {
        onValiditiesChange([]);
    };

    // Week toggle
    const toggleWeek = (weekNum: number) => {
        if (selectedWeeks.includes(weekNum)) {
            onSelectedWeeksChange(selectedWeeks.filter(w => w !== weekNum));
        } else {
            onSelectedWeeksChange([...selectedWeeks, weekNum].sort((a, b) => a - b));
        }
    };

    const handleRangeStartChange = (value: string) => {
        const start = parseInt(value, 10);
        if (!isNaN(start) && start >= 1 && start <= getMaxDays()) {
            onCustomRangeChange({
                start,
                end: customRange?.end || getMaxDays()
            });
        }
    };

    const handleRangeEndChange = (value: string) => {
        const end = parseInt(value, 10);
        if (!isNaN(end) && end >= 1 && end <= getMaxDays()) {
            onCustomRangeChange({
                start: customRange?.start || 1,
                end
            });
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm space-y-3">
            {/* Row 1: Brand & Validity Filters */}
            <div className="flex flex-wrap items-center gap-4">
                {/* Brand Filter */}
                <div className="flex items-center gap-2">
                    <Tag size={16} className="text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Brand:</span>
                    <div className="flex gap-1">
                        {BRAND_OPTIONS.map(brand => (
                            <button
                                key={brand.value}
                                onClick={() => onBrandChange(brand.value)}
                                className={`
                                    px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-150
                                    ${selectedBrand === brand.value
                                        ? brandColors[brand.value].active
                                        : `bg-white border ${brandColors[brand.value].inactive}`
                                    }
                                `}
                            >
                                {brand.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Divider */}
                <div className="h-8 w-px bg-gray-200 hidden md:block"></div>

                {/* Validity Filter */}
                <div className="flex items-center gap-2">
                    <Filter size={16} className="text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Validity:</span>
                    <div className="flex flex-wrap gap-1">
                        {VALIDITY_OPTIONS.map(validity => (
                            <button
                                key={validity.value}
                                onClick={() => toggleValidity(validity.value)}
                                className={`
                                    px-2.5 py-1 text-xs font-semibold rounded-md transition-all duration-150
                                    ${selectedValidities.includes(validity.value)
                                        ? validityColors[validity.value].active
                                        : `bg-white border ${validityColors[validity.value].inactive}`
                                    }
                                `}
                            >
                                {validity.label}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-1 ml-1 border-l border-gray-200 pl-2">
                        <button onClick={selectAllValidities} className="px-2 py-1 text-xs text-blue-600 hover:underline">
                            Semua
                        </button>
                        <button onClick={clearValidities} className="px-2 py-1 text-xs text-gray-500 hover:underline">
                            Kosong
                        </button>
                    </div>
                </div>
            </div>

            {/* Row 2: Period Controls */}
            <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-gray-100">
                {/* Weekly Toggles */}
                <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Minggu:</span>
                    <div className="flex gap-1">
                        {weeks.map(weekNum => (
                            <button
                                key={weekNum}
                                onClick={() => toggleWeek(weekNum)}
                                className={`
                                    px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-150
                                    ${selectedWeeks.includes(weekNum)
                                        ? `${weekColors[weekNum]} text-white shadow-sm`
                                        : `bg-white border ${weekInactiveColors[weekNum]}`
                                    }
                                `}
                            >
                                W{weekNum}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Divider */}
                {showCustomDate && <div className="h-8 w-px bg-gray-200 hidden md:block"></div>}

                {/* Custom Date Range */}
                {showCustomDate && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">Custom Tanggal:</span>
                        <div className="flex items-center gap-1">
                            <input
                                type="number"
                                min={1}
                                max={getMaxDays()}
                                placeholder="1"
                                value={customRange?.start || ''}
                                onChange={(e) => handleRangeStartChange(e.target.value)}
                                className="w-12 px-2 py-1 text-sm border border-green-300 rounded focus:ring-1 focus:ring-green-500 bg-green-50"
                            />
                            <span className="text-gray-400">—</span>
                            <input
                                type="number"
                                min={1}
                                max={getMaxDays()}
                                placeholder={String(getMaxDays())}
                                value={customRange?.end || ''}
                                onChange={(e) => handleRangeEndChange(e.target.value)}
                                className="w-12 px-2 py-1 text-sm border border-green-300 rounded focus:ring-1 focus:ring-green-500 bg-green-50"
                            />
                        </div>
                        {customRange && (
                            <button
                                onClick={() => onCustomRangeChange(null)}
                                className="px-2 py-1 text-xs text-red-500 hover:underline"
                            >
                                Hapus
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Active Status */}
            <div className="flex items-center gap-3 text-xs text-gray-500 pt-2 border-t border-gray-100">
                <span>Aktif:</span>
                <span className="text-gray-700 font-medium">
                    {selectedBrand === 'all' ? 'Semua Brand' : selectedBrand.charAt(0).toUpperCase() + selectedBrand.slice(1)}
                </span>
                <span className="text-gray-400">|</span>
                {selectedValidities.length > 0 ? (
                    <div className="flex gap-1">
                        {selectedValidities.map(v => (
                            <span key={v} className={`px-1.5 py-0.5 rounded text-white text-[10px] ${validityColors[v].active.split(' ')[0]}`}>
                                {v.toUpperCase()}
                            </span>
                        ))}
                    </div>
                ) : (
                    <span className="text-gray-400 italic">Tidak ada validity</span>
                )}
                <span className="text-gray-400">|</span>
                {selectedWeeks.length > 0 ? (
                    <span className="text-blue-600 font-medium">{selectedWeeks.map(w => `W${w}`).join(', ')}</span>
                ) : (
                    <span className="text-gray-400 italic">MTD saja</span>
                )}
            </div>
        </div>
    );
};

export default VoucherFilterPanel;
