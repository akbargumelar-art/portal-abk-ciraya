/**
 * useSortableTable
 *
 * Generic hook untuk sortable table:
 * - Menyimpan state kolom aktif & arah sort
 * - Menghasilkan data sorted
 * - Menghasilkan handler & icon helper
 *
 * Menggantikan duplikasi di StockPage, OmzetOutletPage, dan lainnya.
 */

import { useState, useMemo } from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import React from 'react';

export type SortDirection = 'asc' | 'desc';

interface UseSortableTableResult<T> {
    sortColumn: keyof T | null;
    sortDirection: SortDirection;
    sortedData: T[];
    handleSort: (column: keyof T) => void;
    getSortIcon: (column: keyof T) => React.ReactNode;
}

export function useSortableTable<T>(data: T[]): UseSortableTableResult<T> {
    const [sortColumn, setSortColumn] = useState<keyof T | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

    const handleSort = (column: keyof T) => {
        if (sortColumn === column) {
            setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    const sortedData = useMemo<T[]>(() => {
        if (!sortColumn) return data;

        return [...data].sort((a, b) => {
            const aVal = a[sortColumn];
            const bVal = b[sortColumn];

            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
            }

            const aStr = String(aVal ?? '').toLowerCase();
            const bStr = String(bVal ?? '').toLowerCase();
            return sortDirection === 'asc'
                ? aStr.localeCompare(bStr)
                : bStr.localeCompare(aStr);
        });
    }, [data, sortColumn, sortDirection]);

    const getSortIcon = (column: keyof T): React.ReactNode => {
        if (sortColumn !== column)
            return React.createElement(ArrowUpDown, { size: 10, className: 'ml-1 opacity-40' });
        return sortDirection === 'asc'
            ? React.createElement(ArrowUp, { size: 10, className: 'ml-1 text-yellow-300' })
            : React.createElement(ArrowDown, { size: 10, className: 'ml-1 text-yellow-300' });
    };

    return { sortColumn, sortDirection, sortedData, handleSort, getSortIcon };
}
