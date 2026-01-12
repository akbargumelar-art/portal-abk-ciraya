import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

export type SortDirection = 'asc' | 'desc' | null;

export interface SortState {
    column: string | null;
    direction: SortDirection;
}

export function useTableSort<T extends Record<string, any>>(
    data: T[],
    initialColumn: string | null = null,
    initialDirection: SortDirection = null
) {
    const [sortState, setSortState] = useState<SortState>({
        column: initialColumn,
        direction: initialDirection,
    });

    // Sort data based on current sort state
    const sortedData = useMemo(() => {
        if (!sortState.column || !sortState.direction) {
            return data;
        }

        return [...data].sort((a, b) => {
            const aVal = a[sortState.column!];
            const bVal = b[sortState.column!];

            // Handle null/undefined values
            if (aVal == null && bVal == null) return 0;
            if (aVal == null) return sortState.direction === 'asc' ? 1 : -1;
            if (bVal == null) return sortState.direction === 'asc' ? -1 : 1;

            // Numeric comparison
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return sortState.direction === 'asc' ? aVal - bVal : bVal - aVal;
            }

            // String comparison
            const aStr = String(aVal).toLowerCase();
            const bStr = String(bVal).toLowerCase();

            if (sortState.direction === 'asc') {
                return aStr.localeCompare(bStr, 'id-ID');
            } else {
                return bStr.localeCompare(aStr, 'id-ID');
            }
        });
    }, [data, sortState]);

    // Handle column click
    const handleSort = (column: string) => {
        setSortState((prev) => {
            // If clicking the same column, cycle through: asc -> desc -> null
            if (prev.column === column) {
                if (prev.direction === 'asc') {
                    return { column, direction: 'desc' };
                } else if (prev.direction === 'desc') {
                    return { column: null, direction: null };
                }
            }
            // New column, start with ascending
            return { column, direction: 'asc' };
        });
    };

    // Get sort icon for a column
    const getSortIcon = (column: string) => {
        if (sortState.column !== column) {
            return null;
        }

        if (sortState.direction === 'asc') {
            return <ChevronUp size={14} className="inline ml-1" />;
        } else if (sortState.direction === 'desc') {
            return <ChevronDown size={14} className="inline ml-1" />;
        }

        return null;
    };

    // Check if column is being sorted
    const isColumnSorted = (column: string) => {
        return sortState.column === column;
    };

    return {
        sortedData,
        sortColumn: sortState.column,
        sortDirection: sortState.direction,
        handleSort,
        getSortIcon,
        isColumnSorted,
    };
}
