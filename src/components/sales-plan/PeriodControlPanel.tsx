/**
 * Period Control Panel
 * 
 * A toolbar for controlling visible week columns in the Sales Plan table.
 * Supports multi-select weekly toggles (W1-W5) and custom date range inputs.
 */

import React from 'react';
import { Calendar, Filter } from 'lucide-react';
import { hasWeek5 } from '../../utils/dateUtils';

interface PeriodControlPanelProps {
    month: number; // 1-12
    year: number;
    selectedWeeks: number[];
    onSelectedWeeksChange: (weeks: number[]) => void;
    customRange: { start: number; end: number } | null;
    onCustomRangeChange: (range: { start: number; end: number } | null) => void;
    showCustomDate?: boolean;
}

const PeriodControlPanel: React.FC<PeriodControlPanelProps> = ({
    month,
    year,
    selectedWeeks,
    onSelectedWeeksChange,
    customRange,
    onCustomRangeChange,
    showCustomDate = true,
}) => {
    const showWeek5 = hasWeek5(month, year);
    const weeks = showWeek5 ? [1, 2, 3, 4, 5] : [1, 2, 3, 4];

    // Get max days in month
    const getMaxDays = () => new Date(year, month, 0).getDate();

    const toggleWeek = (weekNum: number) => {
        if (selectedWeeks.includes(weekNum)) {
            onSelectedWeeksChange(selectedWeeks.filter(w => w !== weekNum));
        } else {
            onSelectedWeeksChange([...selectedWeeks, weekNum].sort((a, b) => a - b));
        }
    };

    const selectAll = () => {
        onSelectedWeeksChange([...weeks]);
    };

    const selectNone = () => {
        onSelectedWeeksChange([]);
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

    const clearCustomRange = () => {
        onCustomRangeChange(null);
    };

    // Week color mapping for visual distinction
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

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-4">
                {/* Weekly Toggles Section */}
                <div className="flex items-center gap-2">
                    <Filter size={16} className="text-gray-500" />
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

                    <div className="flex gap-1 ml-2 border-l border-gray-200 pl-2">
                        <button
                            onClick={selectAll}
                            className="px-2 py-1 text-xs text-blue-600 hover:underline"
                        >
                            Semua
                        </button>
                        <button
                            onClick={selectNone}
                            className="px-2 py-1 text-xs text-gray-500 hover:underline"
                        >
                            Kosong
                        </button>
                    </div>
                </div>

                {/* Divider */}
                <div className="h-8 w-px bg-gray-200 hidden md:block"></div>

                {/* Custom Date Range Section */}
                {showCustomDate && (
                    <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Custom Tanggal:</span>

                        <div className="flex items-center gap-1">
                            <input
                                type="number"
                                min={1}
                                max={getMaxDays()}
                                placeholder="1"
                                value={customRange?.start || ''}
                                onChange={(e) => handleRangeStartChange(e.target.value)}
                                className="w-14 px-2 py-1 text-sm border border-green-300 rounded focus:ring-1 focus:ring-green-500 focus:border-green-500 bg-green-50"
                            />
                            <span className="text-gray-400">—</span>
                            <input
                                type="number"
                                min={1}
                                max={getMaxDays()}
                                placeholder={String(getMaxDays())}
                                value={customRange?.end || ''}
                                onChange={(e) => handleRangeEndChange(e.target.value)}
                                className="w-14 px-2 py-1 text-sm border border-green-300 rounded focus:ring-1 focus:ring-green-500 focus:border-green-500 bg-green-50"
                            />
                        </div>

                        {customRange && (
                            <button
                                onClick={clearCustomRange}
                                className="px-2 py-1 text-xs text-red-500 hover:text-red-700 hover:underline"
                            >
                                Hapus
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Active Filters Display */}
            <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                <span>Aktif:</span>
                {selectedWeeks.length > 0 ? (
                    <div className="flex gap-1">
                        {selectedWeeks.map(w => (
                            <span
                                key={w}
                                className={`px-1.5 py-0.5 rounded text-white text-[10px] ${weekColors[w].split(' ')[0]}`}
                            >
                                W{w}
                            </span>
                        ))}
                    </div>
                ) : (
                    <span className="text-gray-400 italic">Tidak ada minggu dipilih (MTD saja)</span>
                )}
                {customRange && (
                    <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                        Tgl {customRange.start} - {customRange.end}
                    </span>
                )}
            </div>
        </div>
    );
};

export default PeriodControlPanel;
