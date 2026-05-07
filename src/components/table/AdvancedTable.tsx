/**
 * Advanced Table Component
 * 
 * Features:
 * - Sticky header
 * - Scrollable body with fixed height
 * - Column sorting (A-Z, 0-9)
 * - Optional pagination
 */

import React, { useState, useMemo } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react';

export interface AdvancedTableColumn<T> {
    key: keyof T | string;
    header: string;
    sortable?: boolean;
    width?: string;
    align?: 'left' | 'center' | 'right';
    render?: (value: unknown, row: T, index: number) => React.ReactNode;
}

interface AdvancedTableProps<T> {
    data: T[];
    columns: AdvancedTableColumn<T>[];
    title?: string;
    subtitle?: string;
    maxHeight?: string;
    pageSize?: number;
    showPagination?: boolean;
    className?: string;
    onRowClick?: (row: T) => void;
    rowClassName?: (row: T, index: number) => string;
}

type SortDirection = 'asc' | 'desc' | null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function AdvancedTable<T extends Record<string, any>>({
    data,
    columns,
    title,
    subtitle,
    maxHeight = '600px',
    pageSize = 20,
    showPagination = true,
    className = '',
    onRowClick,
    rowClassName,
}: AdvancedTableProps<T>) {
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>(null);
    const [currentPage, setCurrentPage] = useState(1);

    // Sort data
    const sortedData = useMemo(() => {
        if (!sortKey || !sortDirection) return data;

        return [...data].sort((a, b) => {
            const aVal = a[sortKey as keyof T];
            const bVal = b[sortKey as keyof T];

            // Handle null/undefined
            if (aVal == null && bVal == null) return 0;
            if (aVal == null) return sortDirection === 'asc' ? 1 : -1;
            if (bVal == null) return sortDirection === 'asc' ? -1 : 1;

            // Compare
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
            }

            const aStr = String(aVal).toLowerCase();
            const bStr = String(bVal).toLowerCase();
            return sortDirection === 'asc'
                ? aStr.localeCompare(bStr)
                : bStr.localeCompare(aStr);
        });
    }, [data, sortKey, sortDirection]);

    // Pagination
    const totalPages = Math.ceil(sortedData.length / pageSize);
    const paginatedData = useMemo(() => {
        if (!showPagination) return sortedData;
        const start = (currentPage - 1) * pageSize;
        return sortedData.slice(start, start + pageSize);
    }, [sortedData, currentPage, pageSize, showPagination]);

    // Handle sort
    const handleSort = (key: string) => {
        if (sortKey === key) {
            // Cycle: asc -> desc -> null
            setSortDirection(prev =>
                prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc'
            );
            if (sortDirection === 'desc') setSortKey(null);
        } else {
            setSortKey(key);
            setSortDirection('asc');
        }
    };

    // Get sort icon
    const getSortIcon = (key: string) => {
        if (sortKey !== key) return <ArrowUpDown size={14} className="text-white/60" />;
        if (sortDirection === 'asc') return <ArrowUp size={14} className="text-white" />;
        if (sortDirection === 'desc') return <ArrowDown size={14} className="text-white" />;
        return <ArrowUpDown size={14} className="text-white/60" />;
    };

    // Get cell value
    const getCellValue = (row: T, column: AdvancedTableColumn<T>, index: number) => {
        const value = row[column.key as keyof T];
        if (column.render) {
            return column.render(value, row, index);
        }
        return value != null ? String(value) : '-';
    };

    return (
        <div className={`table-shell bg-white ${className}`}>
            {/* Header */}
            {(title || subtitle) && (
                <div className="table-caption-bar">
                    {title && <h3 className="font-semibold text-gray-900">{title}</h3>}
                    {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
                </div>
            )}

            {/* Table Container */}
            <div className="table-scroll">
                <div style={{ maxHeight }} className="overflow-y-auto">
                    <table className="data-table">
                        {/* Sticky Header */}
                        <thead className="sticky top-0 z-10 shadow-sm">
                            <tr>
                                {columns.map(column => (
                                    <th
                                        key={String(column.key)}
                                        className={`whitespace-nowrap
                                            ${column.align === 'center' ? 'text-center' :
                                                column.align === 'right' ? 'text-right' : 'text-left'}
                                            ${column.sortable ? 'cursor-pointer select-none' : ''}
                                        `}
                                        style={{ width: column.width }}
                                        onClick={() => column.sortable && handleSort(String(column.key))}
                                    >
                                        <div className={`flex items-center gap-1.5
                                            ${column.align === 'center' ? 'justify-center' :
                                                column.align === 'right' ? 'justify-end' : 'justify-start'}
                                        `}>
                                            <span>{column.header}</span>
                                            {column.sortable && getSortIcon(String(column.key))}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        {/* Body */}
                        <tbody>
                            {paginatedData.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length} className="px-4 py-12 text-center text-gray-400">
                                        No data available
                                    </td>
                                </tr>
                            ) : (
                                paginatedData.map((row, index) => (
                                    <tr
                                        key={index}
                                        onClick={() => onRowClick?.(row)}
                                        className={`transition-colors
                                            ${onRowClick ? 'cursor-pointer' : ''}
                                            ${rowClassName ? rowClassName(row, index) : ''}
                                        `}
                                    >
                                        {columns.map(column => (
                                            <td
                                                key={String(column.key)}
                                                className={`
                                                    ${column.align === 'center' ? 'text-center' :
                                                        column.align === 'right' ? 'text-right' : 'text-left'}
                                                    ${column.align === 'right' ? 'numeric' : ''}
                                                `}
                                            >
                                                {getCellValue(row, column, index)}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {showPagination && totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-white">
                    <span className="text-sm text-gray-500">
                        Menampilkan {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, sortedData.length)} dari {sortedData.length} data
                    </span>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={18} />
                        </button>

                        {/* Page numbers */}
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum: number;
                            if (totalPages <= 5) {
                                pageNum = i + 1;
                            } else if (currentPage <= 3) {
                                pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                            } else {
                                pageNum = currentPage - 2 + i;
                            }
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`w-8 h-8 rounded text-sm font-medium transition-colors
                                        ${currentPage === pageNum
                                            ? 'bg-[#F13B4B] text-white'
                                            : 'hover:bg-gray-200 text-gray-600'
                                        }
                                    `}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}

                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdvancedTable;
