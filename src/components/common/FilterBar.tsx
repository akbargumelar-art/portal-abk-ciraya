/**
 * Filter Bar Component (Updated)
 * 
 * Reusable component for page-level filtering with date range,
 * multi-select TAP and Salesforce filters.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Calendar, MapPin, User, X, Filter } from 'lucide-react';
import { Button } from '../ui/index';
import MultiSelect from '../ui/MultiSelect';
import type { MultiSelectOption } from '../ui/MultiSelect';
import { getMonthName } from '../../utils/dateUtils';

// Types
export interface DateRange {
    start: string;
    end: string;
}

export interface FilterState {
    date: DateRange;
    month?: number;     // 1-12
    year?: number;      // e.g. 2025
    tap: string[];      // Changed to array for multi-select
    salesforce: string[]; // Changed to array for multi-select
    kabupaten: string[];
    flag: string[];
    pjpStatus?: string[]; // PJP Status / Lokasi Outlet
}

interface FilterBarProps {
    onFilterChange: (filters: FilterState) => void;
    showDate?: boolean;
    useMonthPicker?: boolean; // Toggle for Month/Year picker
    showTAP?: boolean;
    showSalesforce?: boolean;
    showKabupaten?: boolean;
    showFlag?: boolean;
    showPJPStatus?: boolean;
    tapOptions?: MultiSelectOption[];
    salesforceOptions?: MultiSelectOption[];
    kabupatenOptions?: MultiSelectOption[];
    flagOptions?: MultiSelectOption[];
    pjpOptions?: MultiSelectOption[];
    className?: string;
}

const tapOptions: MultiSelectOption[] = [
    { value: 'CIREBON', label: 'CIREBON' },
    { value: 'INDRAMAYU', label: 'INDRAMAYU' },
    { value: 'KUNINGAN', label: 'KUNINGAN' },
    { value: 'MAJALENGKA', label: 'MAJALENGKA' },
];

const salesforceByTAP: Record<string, MultiSelectOption[]> = {
    '': [ // Generic / All List
        { value: 'SF001', label: 'Budi Santoso' },
        { value: 'SF002', label: 'Ahmad Wijaya' },
        { value: 'SF003', label: 'Rina Kartika' },
        { value: 'SF004', label: 'Dewi Lestari' },
        { value: 'SF005', label: 'Eko Pranoto' },
    ],
    'CIREBON': [
        { value: 'SF001', label: 'Budi Santoso' },
        { value: 'SF002', label: 'Ahmad Wijaya' },
    ],
    'INDRAMAYU': [
        { value: 'SF003', label: 'Rina Kartika' },
    ],
    'KUNINGAN': [
        { value: 'SF004', label: 'Dewi Lestari' },
    ],
    'MAJALENGKA': [
        { value: 'SF005', label: 'Eko Pranoto' },
    ]
};

// Get today and 30 days ago for default date range
const getDefaultDateRange = (): DateRange => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    return {
        start: thirtyDaysAgo.toISOString().split('T')[0],
        end: today.toISOString().split('T')[0],
    };
};

const FilterBar: React.FC<FilterBarProps> = ({
    onFilterChange,
    showDate = true,
    useMonthPicker = false, // Default to standard date range
    showTAP = true,
    showSalesforce = true,
    showKabupaten = false,
    showFlag = false,
    showPJPStatus = false,
    tapOptions: propTapOptions = [],
    salesforceOptions: propSfOptions = [],
    kabupatenOptions: propKabOptions = [],
    flagOptions: propFlagOptions = [],
    pjpOptions: propPjpOptions = [],
    className = '',
}) => {
    const defaultFilters: FilterState = {
        date: getDefaultDateRange(),
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        tap: [],
        salesforce: [],
        kabupaten: [],
        flag: [],
        pjpStatus: [],
    };

    const [filters, setFilters] = useState<FilterState>(defaultFilters);
    const [isExpanded, setIsExpanded] = useState(false);

    // Use passed options or fallback to internal/empty (assuming parent handles logic now for this specific use case)
    // For backward compatibility or other pages, we might want to keep internal logic, 
    // but the requirement is specific to dynamic data now. 
    // Let's use props if available, otherwise fallback to defaults if we want to keep it detailed, 
    // but for now let's prioritize props.

    const displayTapOptions = propTapOptions.length > 0 ? propTapOptions : tapOptions;

    // Logic for SF options:
    // If props are provided (cascading handled by parent), use them.
    // Otherwise use internal logic (legacy behavior).
    const displaySfOptions = useMemo(() => {
        if (propSfOptions.length > 0) return propSfOptions;

        // Internal logic fallback
        if (filters.tap.length === 0) {
            return salesforceByTAP[''];
        }
        const combined = new Map<string, MultiSelectOption>();
        filters.tap.forEach(tap => {
            (salesforceByTAP[tap] || []).forEach(sf => {
                combined.set(sf.value, sf);
            });
        });
        return Array.from(combined.values());
    }, [filters.tap, propSfOptions]);

    // Reset salesforce when TAP changes (remove invalid selections)
    useEffect(() => {
        const validSfValues = displaySfOptions.map(sf => sf.value);
        const filteredSf = filters.salesforce.filter(sf => validSfValues.includes(sf));
        if (filteredSf.length !== filters.salesforce.length) {
            setFilters(prev => ({ ...prev, salesforce: filteredSf }));
        }
    }, [filters.tap, displaySfOptions, filters.salesforce]);

    // Memoized callback for filter change
    const notifyFilterChange = useCallback(() => {
        onFilterChange(filters);
    }, [filters, onFilterChange]);

    // Notify parent when filters change
    useEffect(() => {
        notifyFilterChange();
    }, [notifyFilterChange]);

    const handleReset = () => {
        setFilters(defaultFilters);
    };

    const hasActiveFilters = filters.tap.length > 0 ||
        filters.salesforce.length > 0 ||
        filters.kabupaten.length > 0 ||
        filters.flag.length > 0 ||
        (filters.pjpStatus?.length ?? 0) > 0 ||
        (!useMonthPicker && (filters.date.start !== defaultFilters.date.start || filters.date.end !== defaultFilters.date.end)) ||
        (useMonthPicker && (filters.month !== defaultFilters.month || filters.year !== defaultFilters.year));

    const activeCount = filters.tap.length + filters.salesforce.length + filters.kabupaten.length + filters.flag.length + (filters.pjpStatus?.length ?? 0) +
        (hasActiveFilters ? 1 : 0); // Simplified count

    return (
        <div className={`bg-slate-100 rounded-xl border border-gray-200 ${className}`}>
            {/* Compact Header */}
            <div className="flex items-center justify-between px-4 py-3">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                    <Filter size={16} className={hasActiveFilters ? 'text-[#F13B4B]' : 'text-gray-400'} />
                    <span>Filter</span>
                    {hasActiveFilters && (
                        <span className="px-2 py-0.5 bg-[#F13B4B] text-white text-xs rounded-full">
                            {activeCount}
                        </span>
                    )}
                </button>

                <div className="flex items-center gap-2">
                    {/* Quick date display */}
                    {showDate && !isExpanded && (
                        <span className="text-xs text-gray-500 hidden sm:inline">
                            {useMonthPicker
                                ? `${getMonthName(filters.month || 1)} ${filters.year}`
                                : `${filters.date.start} - ${filters.date.end}`
                            }
                        </span>
                    )}

                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleReset}
                            leftIcon={<X size={14} />}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            Reset
                        </Button>
                    )}
                </div>
            </div>

            {/* Expanded Filters */}
            {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-gray-100">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Date Range or Month/Year Picker */}
                        {showDate && (
                            <div className="lg:col-span-2">
                                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                                    <Calendar size={12} className="inline mr-1" />
                                    {useMonthPicker ? 'Bulan & Tahun' : 'Periode'}
                                </label>
                                {useMonthPicker ? (
                                    <div className="flex items-center gap-2">
                                        <select
                                            value={filters.month}
                                            onChange={(e) => setFilters(prev => ({ ...prev, month: parseInt(e.target.value) }))}
                                            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#F13B4B] focus:border-transparent"
                                        >
                                            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                                <option key={m} value={m}>{getMonthName(m)}</option>
                                            ))}
                                        </select>
                                        <select
                                            value={filters.year}
                                            onChange={(e) => setFilters(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                                            className="w-24 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#F13B4B] focus:border-transparent"
                                        >
                                            {[2024, 2025, 2026].map(y => (
                                                <option key={y} value={y}>{y}</option>
                                            ))}
                                        </select>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="date"
                                            value={filters.date.start}
                                            onChange={(e) => setFilters(prev => ({
                                                ...prev,
                                                date: { ...prev.date, start: e.target.value }
                                            }))}
                                            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#F13B4B] focus:border-transparent"
                                        />
                                        <span className="text-gray-400">-</span>
                                        <input
                                            type="date"
                                            value={filters.date.end}
                                            onChange={(e) => setFilters(prev => ({
                                                ...prev,
                                                date: { ...prev.date, end: e.target.value }
                                            }))}
                                            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#F13B4B] focus:border-transparent"
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAP Multi-Select */}
                        {showTAP && (
                            <div>
                                <MultiSelect
                                    label={
                                        <>
                                            <MapPin size={12} className="inline mr-1" />
                                            TAP
                                        </>
                                    }
                                    options={displayTapOptions}
                                    value={filters.tap}
                                    onChange={(values) => setFilters(prev => ({ ...prev, tap: values }))}
                                    placeholder="Semua TAP"
                                />
                            </div>
                        )}

                        {/* Salesforce Multi-Select */}
                        {showSalesforce && (
                            <div>
                                <MultiSelect
                                    label={
                                        <>
                                            <User size={12} className="inline mr-1" />
                                            Salesforce
                                        </>
                                    }
                                    options={displaySfOptions}
                                    value={filters.salesforce}
                                    onChange={(values) => setFilters(prev => ({ ...prev, salesforce: values }))}
                                    placeholder="Semua SF"
                                />
                            </div>
                        )}

                        {/* Kabupaten Multi-Select */}
                        {showKabupaten && (
                            <div>
                                <MultiSelect
                                    label={
                                        <>
                                            <MapPin size={12} className="inline mr-1" />
                                            Kabupaten
                                        </>
                                    }
                                    options={propKabOptions}
                                    value={filters.kabupaten}
                                    onChange={(values) => setFilters(prev => ({ ...prev, kabupaten: values }))}
                                    placeholder="Semua Kab"
                                />
                            </div>
                        )}

                        {/* Flag Multi-Select */}
                        {showFlag && (
                            <div>
                                <MultiSelect
                                    label={
                                        <>
                                            <Filter size={12} className="inline mr-1" />
                                            Flag
                                        </>
                                    }
                                    options={propFlagOptions}
                                    value={filters.flag}
                                    onChange={(values) => setFilters(prev => ({ ...prev, flag: values }))}
                                    placeholder="Semua Flag"
                                />
                            </div>
                        )}

                        {/* PJP Status Multi-Select */}
                        {showPJPStatus && (
                            <div>
                                <MultiSelect
                                    label={
                                        <>
                                            <MapPin size={12} className="inline mr-1" />
                                            Lokasi Outlet
                                        </>
                                    }
                                    options={propPjpOptions}
                                    value={filters.pjpStatus || []}
                                    onChange={(values) => setFilters(prev => ({ ...prev, pjpStatus: values }))}
                                    placeholder="Semua Lokasi"
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FilterBar;
