/**
 * useBidirectionalFilter
 *
 * Generic hook untuk filter bi-directional:
 * - Setiap filter option di-derive dari data yang sudah difilter filter lain
 * - Otomatis clear pilihan yang tidak lagi valid saat opsi berubah
 * - Menghasilkan data akhir yang sudah di-filter semua kombinasi
 *
 * Contoh pemakaian: StockPage, OmzetOutletPage, dan halaman serupa.
 */

import { useState, useMemo, useEffect, useCallback } from 'react';

export interface FilterOption {
    value: string;
    label: string;
}

/**
 * Definisi satu filter dimension: key field di data T + label placeholder.
 */
export interface FilterDimension<T> {
    key: keyof T;
    placeholder: string;
    /** Jika true, nilai kosong ('') atau '-' akan dikeluarkan dari opsi */
    excludeEmpty?: boolean;
}

interface UseBidirectionalFilterResult<T> {
    /** Nilai filter aktif saat ini: Record<keyof T, string> */
    filters: Record<string, string>;
    /** Setter untuk satu filter */
    setFilter: (key: string, value: string) => void;
    /** Clear semua filter */
    clearAll: () => void;
    /** Apakah ada filter aktif */
    hasActiveFilters: boolean;
    /** Opsi per filter dimension — sudah disesuaikan dengan filter lain */
    options: Record<string, FilterOption[]>;
    /** Data yang sudah di-filter seluruhnya */
    filteredData: T[];
}

function buildOptions<T>(
    data: T[],
    dim: FilterDimension<T>,
    allFilters: Record<string, string>,
    dimensions: FilterDimension<T>[],
): FilterOption[] {
    // Data subset: apply semua filter KECUALI filter dimension ini sendiri
    const subset = data.filter(item =>
        dimensions.every(d => {
            if (d.key === dim.key) return true; // skip self
            const v = allFilters[d.key as string];
            if (!v) return true;
            return String((item as Record<string, unknown>)[d.key as string] ?? '') === v;
        })
    );

    const unique = [...new Set(
        subset.map(item => String((item as Record<string, unknown>)[dim.key as string] ?? ''))
    )]
        .filter(v => dim.excludeEmpty ? v && v !== '-' : true)
        .sort();

    return [
        { value: '', label: dim.placeholder },
        ...unique.map(v => ({ value: v, label: v })),
    ];
}

export function useBidirectionalFilter<T>(
    data: T[],
    dimensions: FilterDimension<T>[],
    /** Filter tambahan yang tidak melalui mekanisme bi-directional (e.g. search text) */
    extraFilter?: (item: T) => boolean,
): UseBidirectionalFilterResult<T> {
    // Inisialisasi state semua filter ke ''
    const [filters, setFilters] = useState<Record<string, string>>(() =>
        Object.fromEntries(dimensions.map(d => [d.key as string, '']))
    );

    /** Setter individual */
    const setFilter = useCallback((key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    }, []);

    /** Clear semua */
    const clearAll = useCallback(() => {
        setFilters(Object.fromEntries(dimensions.map(d => [d.key as string, ''])));
    }, [dimensions]);

    /** Derive options per dimension */
    const options = useMemo<Record<string, FilterOption[]>>(() => {
        return Object.fromEntries(
            dimensions.map(dim => [
                dim.key as string,
                buildOptions(data, dim, filters, dimensions),
            ])
        );
    }, [data, dimensions, filters]);

    /** Auto-clear: jika pilihan tidak ada di opsi baru, reset ke '' */
    useEffect(() => {
        const invalid = dimensions.filter(dim => {
            const current = filters[dim.key as string];
            if (!current) return false;
            const opts = options[dim.key as string] ?? [];
            return !opts.some(o => o.value === current);
        });

        if (invalid.length > 0) {
            setFilters(prev => ({
                ...prev,
                ...Object.fromEntries(invalid.map(d => [d.key as string, ''])),
            }));
        }
    }, [options, filters, dimensions]);

    /** Data akhir setelah semua filter aktif */
    const filteredData = useMemo<T[]>(() => {
        return data.filter(item => {
            const passFilters = dimensions.every(dim => {
                const v = filters[dim.key as string];
                if (!v) return true;
                return String((item as Record<string, unknown>)[dim.key as string] ?? '') === v;
            });
            if (!passFilters) return false;
            if (extraFilter && !extraFilter(item)) return false;
            return true;
        });
    }, [data, dimensions, filters, extraFilter]);

    const hasActiveFilters = dimensions.some(d => !!filters[d.key as string]);

    return { filters, setFilter, clearAll, hasActiveFilters, options, filteredData };
}
