import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface SortableHeaderProps {
    label: string;
    column: string;
    sortColumn: string | null;
    sortDirection: 'asc' | 'desc' | null;
    onSort: (column: string) => void;
    align?: 'left' | 'center' | 'right';
    className?: string;
}

const SortableHeader: React.FC<SortableHeaderProps> = ({
    label,
    column,
    sortColumn,
    sortDirection,
    onSort,
    align = 'left',
    className = '',
}) => {
    const isActive = sortColumn === column;

    const alignClass = {
        left: 'justify-start',
        center: 'justify-center',
        right: 'justify-end',
    }[align];

    return (
        <th
            onClick={() => onSort(column)}
            className={`cursor-pointer hover:bg-gray-100 select-none transition-colors ${className}`}
        >
            <div className={`flex items-center gap-1 ${alignClass}`}>
                <span>{label}</span>
                {isActive && sortDirection === 'asc' && (
                    <ChevronUp size={14} className="text-blue-600" />
                )}
                {isActive && sortDirection === 'desc' && (
                    <ChevronDown size={14} className="text-blue-600" />
                )}
            </div>
        </th>
    );
};

export default SortableHeader;
