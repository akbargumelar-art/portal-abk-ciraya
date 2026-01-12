import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Search, Download } from 'lucide-react';
import type { TableColumn, SortState } from '../../types';
import * as XLSX from 'xlsx';

interface DataTableProps<T> {
    data: T[];
    columns: TableColumn<T>[];
    title?: string;
    searchable?: boolean;
    exportable?: boolean;
    pageSize?: number;
    groupedHeaders?: { label: string; colspan: number }[];
    onRowClick?: (row: T) => void;
    emptyMessage?: string;
    loading?: boolean;
}

function DataTable<T extends Record<string, any>>({
    data,
    columns,
    title,
    searchable = true,
    exportable = true,
    pageSize = 10,
    groupedHeaders,
    onRowClick,
    emptyMessage = 'No data available',
    loading = false,
}: DataTableProps<T>) {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortState, setSortState] = useState<SortState | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    // Filter and sort data
    const processedData = useMemo(() => {
        let result = [...data];

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(row =>
                columns.some(col => {
                    const value = row[col.key as keyof T];
                    return value?.toString().toLowerCase().includes(query);
                })
            );
        }

        // Sort
        if (sortState) {
            result.sort((a, b) => {
                const aVal = a[sortState.key as keyof T];
                const bVal = b[sortState.key as keyof T];

                if (typeof aVal === 'number' && typeof bVal === 'number') {
                    return sortState.direction === 'asc' ? aVal - bVal : bVal - aVal;
                }

                const aStr = aVal?.toString() || '';
                const bStr = bVal?.toString() || '';
                return sortState.direction === 'asc'
                    ? aStr.localeCompare(bStr)
                    : bStr.localeCompare(aStr);
            });
        }

        return result;
    }, [data, searchQuery, sortState, columns]);

    // Pagination
    const totalPages = Math.ceil(processedData.length / pageSize);
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return processedData.slice(start, start + pageSize);
    }, [processedData, currentPage, pageSize]);

    // Handle sort
    const handleSort = (key: string) => {
        setSortState(prev => {
            if (prev?.key === key) {
                if (prev.direction === 'asc') {
                    return { key, direction: 'desc' };
                }
                return null;
            }
            return { key, direction: 'asc' };
        });
    };

    // Export to Excel
    const handleExport = () => {
        const exportData = processedData.map(row => {
            const exportRow: Record<string, any> = {};
            columns.forEach(col => {
                exportRow[col.header] = row[col.key as keyof T];
            });
            return exportRow;
        });

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Data');
        XLSX.writeFile(wb, `${title || 'export'}_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    return (
        <div className="card overflow-hidden">
            {/* Header */}
            {(title || searchable || exportable) && (
                <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
                    {title && <h3 className="font-semibold text-gray-900">{title}</h3>}

                    <div className="flex items-center gap-3 ml-auto">
                        {searchable && (
                            <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
                                <Search size={16} className="text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={e => {
                                        setSearchQuery(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="bg-transparent border-none outline-none text-sm w-40 placeholder-gray-400"
                                />
                            </div>
                        )}

                        {exportable && (
                            <button
                                onClick={handleExport}
                                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                <Download size={16} />
                                <span className="hidden sm:inline">Export</span>
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    {/* Grouped Headers */}
                    {groupedHeaders && (
                        <thead>
                            <tr className="bg-[#2c4a6a]">
                                {groupedHeaders.map((group, idx) => (
                                    <th
                                        key={idx}
                                        colSpan={group.colspan}
                                        className="px-4 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider border-b border-gray-700"
                                    >
                                        {group.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                    )}

                    <thead>
                        <tr className="bg-[#2c4a6a]">
                            {columns.map((col, idx) => (
                                <th
                                    key={idx}
                                    className={`px-4 py-3 text-${col.align || 'left'} text-xs font-semibold text-white uppercase tracking-wider border-b border-gray-700 ${col.sortable ? 'cursor-pointer hover:bg-[#3d5f85] select-none' : ''
                                        }`}
                                    style={{ width: col.width }}
                                    onClick={() => col.sortable && handleSort(col.key as string)}
                                >
                                    <div className={`flex items-center gap-1 ${col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : ''}`}>
                                        <span>{col.header}</span>
                                        {col.sortable && sortState?.key === col.key && (
                                            sortState.direction === 'asc'
                                                ? <ChevronUp size={14} />
                                                : <ChevronDown size={14} />
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            // Loading skeleton
                            Array.from({ length: 5 }).map((_, rowIdx) => (
                                <tr key={rowIdx}>
                                    {columns.map((_, colIdx) => (
                                        <td key={colIdx} className="px-4 py-3">
                                            <div className="skeleton h-4 w-full rounded" />
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : paginatedData.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="px-4 py-12 text-center text-gray-500">
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            paginatedData.map((row, rowIdx) => (
                                <tr
                                    key={rowIdx}
                                    className={`border-b border-gray-50 table-row-hover ${onRowClick ? 'cursor-pointer' : ''}`}
                                    onClick={() => onRowClick?.(row)}
                                >
                                    {columns.map((col, colIdx) => (
                                        <td
                                            key={colIdx}
                                            className={`px-4 py-3 text-sm text-${col.align || 'left'}`}
                                        >
                                            {col.render
                                                ? col.render(row[col.key as keyof T], row)
                                                : row[col.key as keyof T]?.toString() || '-'
                                            }
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                        Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, processedData.length)} of {processedData.length} entries
                    </p>

                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={16} />
                        </button>

                        {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
                            let pageNum: number;
                            if (totalPages <= 5) {
                                pageNum = idx + 1;
                            } else if (currentPage <= 3) {
                                pageNum = idx + 1;
                            } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + idx;
                            } else {
                                pageNum = currentPage - 2 + idx;
                            }

                            return (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${currentPage === pageNum
                                        ? 'bg-[#F13B4B] text-white'
                                        : 'hover:bg-gray-100 text-gray-600'
                                        }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}

                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DataTable;
