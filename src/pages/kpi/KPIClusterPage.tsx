import React, { useState, useMemo } from 'react';
import Header from '../../components/layout/Header';
import { Card } from '../../components/ui/index';
import { Award, Filter } from 'lucide-react';
import { useTableSort } from '../../hooks/useTableSort.tsx';
import SortableHeader from '../../components/table/SortableHeader';
import {
    generateHistoricalKPI,
    calculateCumulativeScores,
    getTierColor,
    getTierName,
    getAvailableYears,
    type HistoricalKPI,
    type KPITier,
} from '../../services/mock/kpiService';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

const KPIClusterPage: React.FC = () => {
    const [rawHistoricalData] = useState<HistoricalKPI[]>(generateHistoricalKPI());
    const [selectedTier, setSelectedTier] = useState<KPITier | 'all'>('all');
    const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');

    // Get available years from data
    const availableYears = useMemo(() => getAvailableYears(rawHistoricalData), [rawHistoricalData]);

    // Filter data based on selections
    const filteredData = useMemo(() => {
        let filtered = [...rawHistoricalData];

        // Filter by tier
        if (selectedTier !== 'all') {
            filtered = filtered.filter(item => item.tier === selectedTier);
        }

        // Filter by year
        if (selectedYear !== 'all') {
            filtered = filtered.filter(item => {
                const year = parseInt(item.month.split('-')[0]);
                return year === selectedYear;
            });
        }

        return filtered;
    }, [rawHistoricalData, selectedTier, selectedYear]);

    // Calculate cumulative scores for filtered data
    const historicalData = useMemo(() => {
        return calculateCumulativeScores(filteredData);
    }, [filteredData]);

    // Get recent 12 items for quick view (from filtered data)
    const recentData = historicalData.slice(-12);

    // Sorting for historical data
    const {
        sortedData: sortedHistoricalData,
        sortColumn: histSortColumn,
        sortDirection: histSortDirection,
        handleSort: handleHistSort,
    } = useTableSort(historicalData);

    // Tier options
    const tierOptions: Array<{ value: KPITier | 'all'; label: string }> = [
        { value: 'all', label: 'Semua Tier' },
        { value: 'black', label: 'Black (0)' },
        { value: 'bronze', label: 'Bronze (1)' },
        { value: 'silver', label: 'Silver (2)' },
        { value: 'gold', label: 'Gold (3)' },
        { value: 'platinum', label: 'Platinum (4)' },
    ];

    return (
        <div className="p-6 animate-fade-in">
            <Header title="KPI Cluster" subtitle="Monitoring Pencapaian KPI Historis" />

            {/* Historical KPI Achievement Table */}
            <Card className="mt-6">
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center gap-2">
                        <Award className="text-indigo-600" size={20} />
                        <h2 className="text-lg font-semibold text-gray-900">Pencapaian KPI Historis</h2>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                        Data pencapaian dari Januari 2022 hingga sekarang
                    </p>
                </div>

                {/* Filter Section */}
                <div className="p-4 bg-slate-50 border-b border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                        <Filter size={16} className="text-gray-600" />
                        <span className="text-sm font-semibold text-gray-700">Filter:</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                        {/* Tier Filter */}
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Tier Level
                            </label>
                            <select
                                value={selectedTier}
                                onChange={(e) => setSelectedTier(e.target.value as KPITier | 'all')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            >
                                {tierOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Year Filter */}
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Tahun
                            </label>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            >
                                <option value="all">Semua Tahun</option>
                                {availableYears.map((year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Clear Filters Button */}
                        {(selectedTier !== 'all' || selectedYear !== 'all') && (
                            <div className="flex items-end">
                                <button
                                    onClick={() => {
                                        setSelectedTier('all');
                                        setSelectedYear('all');
                                    }}
                                    className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Reset Filter
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Filter Results Info */}
                    <div className="mt-3 text-xs text-gray-600">
                        Menampilkan <span className="font-semibold text-gray-900">{historicalData.length}</span> dari{' '}
                        <span className="font-semibold text-gray-900">{rawHistoricalData.length}</span> bulan
                    </div>
                </div>

                {/* Tier Legend */}
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="text-sm font-medium text-gray-700">Tier Level:</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getTierColor('black')}`}>
                            Black (0)
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getTierColor('bronze')}`}>
                            Bronze (1)
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getTierColor('silver')}`}>
                            Silver (2)
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getTierColor('gold')}`}>
                            Gold (3)
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getTierColor('platinum')}`}>
                            Platinum (4)
                        </span>
                    </div>
                </div>

                {/* Recent 12 Months Quick View */}
                {recentData.length > 0 && (
                    <div className="p-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">
                            {filteredData.length === rawHistoricalData.length ? '12 Bulan Terakhir' : '12 Data Terakhir (Filtered)'}
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                            {recentData.map((data) => (
                                <div key={data.month} className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                                    <div className="text-xs text-gray-500 mb-1">
                                        {format(parseISO(data.month + '-01'), 'MMMM yyyy', { locale: id })}
                                    </div>
                                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold border ${getTierColor(data.tier)}`}>
                                        {getTierName(data.tier)}
                                    </span>
                                    <div className="text-xs text-gray-600 mt-1">
                                        Score: <span className="font-semibold">{data.score}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Full Historical Table */}
                <div className="p-4 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">
                        {filteredData.length === rawHistoricalData.length ? 'Semua Data Historis' : 'Data Historis (Filtered)'}
                    </h3>

                    {historicalData.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            Tidak ada data yang sesuai dengan filter yang dipilih.
                        </div>
                    ) : (
                        <div className="overflow-x-auto max-h-96 border border-gray-200 rounded-lg">
                            <table className="data-table">
                                <thead className="bg-[#2c4a6a] sticky top-0 z-10">
                                    <tr>
                                        <SortableHeader
                                            label="Bulan"
                                            column="month"
                                            sortColumn={histSortColumn}
                                            sortDirection={histSortDirection}
                                            onSort={handleHistSort}
                                            className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider"
                                        />
                                        <SortableHeader
                                            label="Tier"
                                            column="tier"
                                            sortColumn={histSortColumn}
                                            sortDirection={histSortDirection}
                                            onSort={handleHistSort}
                                            className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider"
                                        />
                                        <SortableHeader
                                            label="Nilai"
                                            column="tierValue"
                                            sortColumn={histSortColumn}
                                            sortDirection={histSortDirection}
                                            onSort={handleHistSort}
                                            className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider"
                                        />
                                        <SortableHeader
                                            label="Score (Kumulatif)"
                                            column="score"
                                            sortColumn={histSortColumn}
                                            sortDirection={histSortDirection}
                                            onSort={handleHistSort}
                                            className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider"
                                        />
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {sortedHistoricalData.map((data, idx) => (
                                        <tr key={data.month} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                            <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                                                {format(parseISO(data.month + '-01'), 'MMMM yyyy', { locale: id })}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getTierColor(data.tier)}`}>
                                                    {getTierName(data.tier)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                                                {data.tierValue}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-700 font-semibold">
                                                {data.score}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default KPIClusterPage;
