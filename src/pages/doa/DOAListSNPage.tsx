/**
 * DOA List SN Page
 * 
 * High-performance table with Grouped/Range View for Serial Numbers
 * Features: Smart filtering, Summary cards, Search by SN range
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
    Clock, Search, Filter, Package, Calendar, MapPin, Hash,
    ChevronDown, ChevronUp, AlertTriangle, FileText, Boxes, Download
} from 'lucide-react';
import Header from '../../components/layout/Header';
import { Card } from '../../components/ui/index';
import type { DOARecord, DOASummary } from '../../types/doa';

// ===========================================
// MOCK DATA - Grouped/Range View
// ===========================================
const mockDOAData: DOARecord[] = [
    // DO #1 - Desember 2024
    { id: '1', do_number: 'DO-2024120001', do_date: '2024-12-02', product_code: 'SP10K', product_name: 'Simpati 10K', sn_start: '628110000001', sn_end: '628110005000', qty: 5000, expiry_date: '2025-06-30', location: 'Gudang Cirebon' },
    { id: '2', do_number: 'DO-2024120001', do_date: '2024-12-02', product_code: 'SP25K', product_name: 'Simpati 25K', sn_start: '628125000001', sn_end: '628125002500', qty: 2500, expiry_date: '2025-06-30', location: 'Gudang Cirebon' },
    { id: '3', do_number: 'DO-2024120001', do_date: '2024-12-02', product_code: 'BYUL', product_name: 'byU Lite', sn_start: '628140000001', sn_end: '628140003000', qty: 3000, expiry_date: '2025-07-31', location: 'Gudang Cirebon' },

    // DO #2 - Desember 2024
    { id: '4', do_number: 'DO-2024120002', do_date: '2024-12-05', product_code: 'SP50K', product_name: 'Simpati 50K', sn_start: '628150000001', sn_end: '628150001500', qty: 1500, expiry_date: '2025-05-31', location: 'Gudang Kuningan' },
    { id: '5', do_number: 'DO-2024120002', do_date: '2024-12-05', product_code: 'BYUM', product_name: 'byU Max', sn_start: '628160000001', sn_end: '628160002000', qty: 2000, expiry_date: '2025-06-30', location: 'Gudang Kuningan' },

    // DO #3 - Desember 2024
    { id: '6', do_number: 'DO-2024120003', do_date: '2024-12-09', product_code: 'SP10K', product_name: 'Simpati 10K', sn_start: '628110005001', sn_end: '628110010000', qty: 5000, expiry_date: '2025-07-31', location: 'Gudang Cirebon' },
    { id: '7', do_number: 'DO-2024120003', do_date: '2024-12-09', product_code: 'SP25K', product_name: 'Simpati 25K', sn_start: '628125002501', sn_end: '628125005000', qty: 2500, expiry_date: '2025-07-31', location: 'Gudang Cirebon' },
    { id: '8', do_number: 'DO-2024120003', do_date: '2024-12-09', product_code: 'BYUL', product_name: 'byU Lite', sn_start: '628140003001', sn_end: '628140006000', qty: 3000, expiry_date: '2025-08-31', location: 'Gudang Cirebon' },

    // DO #4 - Desember 2024 (Majalengka)
    { id: '9', do_number: 'DO-2024120004', do_date: '2024-12-12', product_code: 'SP10K', product_name: 'Simpati 10K', sn_start: '628110010001', sn_end: '628110014000', qty: 4000, expiry_date: '2025-06-30', location: 'Gudang Majalengka' },
    { id: '10', do_number: 'DO-2024120004', do_date: '2024-12-12', product_code: 'SP50K', product_name: 'Simpati 50K', sn_start: '628150001501', sn_end: '628150003000', qty: 1500, expiry_date: '2025-05-31', location: 'Gudang Majalengka' },
    { id: '11', do_number: 'DO-2024120004', do_date: '2024-12-12', product_code: 'BYUM', product_name: 'byU Max', sn_start: '628160002001', sn_end: '628160004500', qty: 2500, expiry_date: '2025-07-31', location: 'Gudang Majalengka' },

    // DO #5 - Desember 2024
    { id: '12', do_number: 'DO-2024120005', do_date: '2024-12-16', product_code: 'SP10K', product_name: 'Simpati 10K', sn_start: '628110014001', sn_end: '628110020000', qty: 6000, expiry_date: '2025-08-31', location: 'Gudang Cirebon' },
    { id: '13', do_number: 'DO-2024120005', do_date: '2024-12-16', product_code: 'SP25K', product_name: 'Simpati 25K', sn_start: '628125005001', sn_end: '628125008000', qty: 3000, expiry_date: '2025-08-31', location: 'Gudang Cirebon' },

    // DO #6 - Desember 2024
    { id: '14', do_number: 'DO-2024120006', do_date: '2024-12-19', product_code: 'BYUL', product_name: 'byU Lite', sn_start: '628140006001', sn_end: '628140010000', qty: 4000, expiry_date: '2025-09-30', location: 'Gudang Kuningan' },
    { id: '15', do_number: 'DO-2024120006', do_date: '2024-12-19', product_code: 'BYUM', product_name: 'byU Max', sn_start: '628160004501', sn_end: '628160007000', qty: 2500, expiry_date: '2025-08-31', location: 'Gudang Kuningan' },

    // DO #7 - Desember 2024 (Items expiring soon for demo)
    { id: '16', do_number: 'DO-2024120007', do_date: '2024-12-23', product_code: 'SP10K', product_name: 'Simpati 10K', sn_start: '628110020001', sn_end: '628110025000', qty: 5000, expiry_date: '2025-01-15', location: 'Gudang Cirebon' },
    { id: '17', do_number: 'DO-2024120007', do_date: '2024-12-23', product_code: 'SP50K', product_name: 'Simpati 50K', sn_start: '628150003001', sn_end: '628150004500', qty: 1500, expiry_date: '2025-01-20', location: 'Gudang Cirebon' },

    // DO #8 - Desember 2024
    { id: '18', do_number: 'DO-2024120008', do_date: '2024-12-26', product_code: 'SP25K', product_name: 'Simpati 25K', sn_start: '628125008001', sn_end: '628125011000', qty: 3000, expiry_date: '2025-09-30', location: 'Gudang Majalengka' },
    { id: '19', do_number: 'DO-2024120008', do_date: '2024-12-26', product_code: 'BYUL', product_name: 'byU Lite', sn_start: '628140010001', sn_end: '628140013500', qty: 3500, expiry_date: '2025-09-30', location: 'Gudang Majalengka' },
    { id: '20', do_number: 'DO-2024120008', do_date: '2024-12-26', product_code: 'BYUM', product_name: 'byU Max', sn_start: '628160007001', sn_end: '628160010000', qty: 3000, expiry_date: '2025-10-31', location: 'Gudang Majalengka' },
];

// ===========================================
// HELPERS
// ===========================================
const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatNumber = (value: number): string => value.toLocaleString('id-ID');

const isExpiringSoon = (expiryDate: string): boolean => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
};

const isExpired = (expiryDate: string): boolean => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    return expiry < today;
};

const getExpiryStatus = (expiryDate: string): { color: string; text: string } => {
    if (isExpired(expiryDate)) return { color: 'bg-red-100 text-red-700', text: 'Expired' };
    if (isExpiringSoon(expiryDate)) return { color: 'bg-amber-100 text-amber-700', text: 'Segera Expire' };
    return { color: 'bg-green-100 text-green-700', text: 'Active' };
};

const getProductColor = (code: string): string => {
    const colors: Record<string, string> = {
        'SP10K': 'bg-red-50 text-red-700 border-red-200',
        'SP25K': 'bg-orange-50 text-orange-700 border-orange-200',
        'SP50K': 'bg-amber-50 text-amber-700 border-amber-200',
        'BYUL': 'bg-purple-50 text-purple-700 border-purple-200',
        'BYUM': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    };
    return colors[code] || 'bg-gray-50 text-gray-700 border-gray-200';
};

// ===========================================
// MAIN COMPONENT
// ===========================================
const DOAListSNPage: React.FC = () => {
    // Filter states
    const [searchDO, setSearchDO] = useState('');
    const [searchSN, setSearchSN] = useState('');
    const [filterProduct, setFilterProduct] = useState('ALL');
    const [filterLocation, setFilterLocation] = useState('ALL');
    const [filterExpiry, setFilterExpiry] = useState('ALL');
    const [expandedDO, setExpandedDO] = useState<string | null>(null);

    // Get unique values for filters
    const productOptions = useMemo(() => [...new Set(mockDOAData.map(d => d.product_code))], []);
    const locationOptions = useMemo(() => [...new Set(mockDOAData.map(d => d.location))], []);

    // Filtered data
    const filteredData = useMemo(() => {
        return mockDOAData.filter(d => {
            if (searchDO && !d.do_number.toLowerCase().includes(searchDO.toLowerCase())) return false;
            if (searchSN) {
                const sn = searchSN.replace(/\D/g, '');
                const start = parseInt(d.sn_start.slice(-6));
                const end = parseInt(d.sn_end.slice(-6));
                const searchNum = parseInt(sn.slice(-6));
                if (sn.length >= 4 && (searchNum < start || searchNum > end)) return false;
            }
            if (filterProduct !== 'ALL' && d.product_code !== filterProduct) return false;
            if (filterLocation !== 'ALL' && d.location !== filterLocation) return false;
            if (filterExpiry === 'EXPIRING' && !isExpiringSoon(d.expiry_date)) return false;
            if (filterExpiry === 'EXPIRED' && !isExpired(d.expiry_date)) return false;
            if (filterExpiry === 'ACTIVE' && (isExpired(d.expiry_date) || isExpiringSoon(d.expiry_date))) return false;
            return true;
        });
    }, [searchDO, searchSN, filterProduct, filterLocation, filterExpiry]);

    // Summary calculation
    const summary: DOASummary = useMemo(() => {
        const uniqueDOs = new Set(filteredData.map(d => d.do_number));
        const uniqueProducts = new Set(filteredData.map(d => d.product_code));
        const expiringCount = filteredData.filter(d => isExpiringSoon(d.expiry_date) || isExpired(d.expiry_date)).length;
        const latestDate = filteredData.reduce((max, d) => d.do_date > max ? d.do_date : max, '');

        return {
            total_qty: filteredData.reduce((sum, d) => sum + d.qty, 0),
            total_do_count: uniqueDOs.size,
            total_products: uniqueProducts.size,
            latest_do_date: latestDate,
            expiring_soon_count: expiringCount,
        };
    }, [filteredData]);

    // Group by DO number
    const groupedByDO = useMemo(() => {
        const groups: Record<string, DOARecord[]> = {};
        filteredData.forEach(d => {
            if (!groups[d.do_number]) groups[d.do_number] = [];
            groups[d.do_number].push(d);
        });
        return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
    }, [filteredData]);

    // Export to Excel (CSV format)
    const handleExportExcel = useCallback(() => {
        const headers = ['DO Number', 'Tanggal DO', 'Kode Produk', 'Nama Produk', 'SN Start', 'SN End', 'Qty', 'Expiry Date', 'Lokasi'];
        const csvContent = [
            headers.join(','),
            ...filteredData.map(row => [
                row.do_number,
                formatDate(row.do_date),
                row.product_code,
                `"${row.product_name}"`,
                row.sn_start,
                row.sn_end,
                row.qty,
                formatDate(row.expiry_date),
                `"${row.location}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `DOA_ListSN_${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(link.href);
    }, [filteredData]);

    const dataUpdateTime = new Date().toLocaleString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    return (
        <div className="p-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <Header title="DOA - List SN" subtitle="Daftar Serial Number per Delivery Order (Grouped View)" />
                <button
                    onClick={handleExportExcel}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                    <Download size={16} />
                    Export Excel
                </button>
            </div>

            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                <Clock size={14} />
                <span>Data diperbarui: <span className="font-medium text-gray-700">{dataUpdateTime}</span></span>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mt-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500 rounded-lg">
                            <Boxes size={20} className="text-white" />
                        </div>
                        <div>
                            <div className="text-xs text-blue-600 font-medium">Total Qty</div>
                            <div className="text-xl font-bold text-blue-800">{formatNumber(summary.total_qty)}</div>
                        </div>
                    </div>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500 rounded-lg">
                            <FileText size={20} className="text-white" />
                        </div>
                        <div>
                            <div className="text-xs text-green-600 font-medium">Total DO</div>
                            <div className="text-xl font-bold text-green-800">{summary.total_do_count}</div>
                        </div>
                    </div>
                </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500 rounded-lg">
                            <Package size={20} className="text-white" />
                        </div>
                        <div>
                            <div className="text-xs text-purple-600 font-medium">Jenis Produk</div>
                            <div className="text-xl font-bold text-purple-800">{summary.total_products}</div>
                        </div>
                    </div>
                </Card>
                <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-500 rounded-lg">
                            <Calendar size={20} className="text-white" />
                        </div>
                        <div>
                            <div className="text-xs text-amber-600 font-medium">DO Terakhir</div>
                            <div className="text-lg font-bold text-amber-800">{summary.latest_do_date ? formatDate(summary.latest_do_date) : '-'}</div>
                        </div>
                    </div>
                </Card>
                <Card className={`bg-gradient-to-br ${summary.expiring_soon_count > 0 ? 'from-red-50 to-red-100 border-red-200' : 'from-gray-50 to-gray-100 border-gray-200'}`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 ${summary.expiring_soon_count > 0 ? 'bg-red-500' : 'bg-gray-400'} rounded-lg`}>
                            <AlertTriangle size={20} className="text-white" />
                        </div>
                        <div>
                            <div className={`text-xs font-medium ${summary.expiring_soon_count > 0 ? 'text-red-600' : 'text-white'}`}>Segera Expire</div>
                            <div className={`text-xl font-bold ${summary.expiring_soon_count > 0 ? 'text-red-800' : 'text-gray-800'}`}>{summary.expiring_soon_count}</div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Filters */}
            <Card className="mt-4">
                <div className="flex items-center gap-2 mb-3">
                    <Filter size={16} className="text-gray-500" />
                    <span className="font-semibold text-gray-700 text-sm">Filter & Search</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-500">Cari DO#</label>
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="DO-202412..."
                                value={searchDO}
                                onChange={(e) => setSearchDO(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-500">Cari Serial Number</label>
                        <div className="relative">
                            <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="6281100..."
                                value={searchSN}
                                onChange={(e) => setSearchSN(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-500">Produk</label>
                        <select
                            value={filterProduct}
                            onChange={(e) => setFilterProduct(e.target.value)}
                            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="ALL">Semua Produk</option>
                            {productOptions.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-500">Lokasi</label>
                        <select
                            value={filterLocation}
                            onChange={(e) => setFilterLocation(e.target.value)}
                            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="ALL">Semua Lokasi</option>
                            {locationOptions.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-500">Status Expiry</label>
                        <select
                            value={filterExpiry}
                            onChange={(e) => setFilterExpiry(e.target.value)}
                            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="ALL">Semua Status</option>
                            <option value="ACTIVE">Active</option>
                            <option value="EXPIRING">Segera Expire</option>
                            <option value="EXPIRED">Expired</option>
                        </select>
                    </div>
                </div>
            </Card>

            {/* Grouped Table */}
            <Card className="mt-4">
                <h3 className="font-semibold text-gray-800 text-sm mb-3">
                    List DO & Serial Number Range ({filteredData.length} records dari {groupedByDO.length} DO)
                </h3>
                <div className="space-y-3">
                    {groupedByDO.map(([doNumber, items]) => {
                        const isExpanded = expandedDO === doNumber;
                        const totalQty = items.reduce((sum, i) => sum + i.qty, 0);
                        const doDate = items[0]?.do_date;
                        const location = items[0]?.location;

                        return (
                            <div key={doNumber} className="border border-gray-200 rounded-lg overflow-hidden">
                                {/* DO Header */}
                                <button
                                    onClick={() => setExpandedDO(isExpanded ? null : doNumber)}
                                    className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-white hover:from-blue-100 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <FileText size={16} className="text-blue-600" />
                                            <span className="font-semibold text-blue-800">{doNumber}</span>
                                        </div>
                                        <span className="text-xs text-gray-500 flex items-center gap-1">
                                            <Calendar size={12} />
                                            {formatDate(doDate)}
                                        </span>
                                        <span className="text-xs text-gray-500 flex items-center gap-1">
                                            <MapPin size={12} />
                                            {location}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                                            {items.length} Produk
                                        </span>
                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                                            Qty: {formatNumber(totalQty)}
                                        </span>
                                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                    </div>
                                </button>

                                {/* DO Detail Table */}
                                {isExpanded && (
                                    <div className="border-t border-gray-200 overflow-x-auto">
                                        <table className="w-full text-xs">
                                            <thead className="bg-[#3d5f85]">
                                                <tr>
                                                    <th className="p-2 text-left border-b font-semibold">Kode</th>
                                                    <th className="p-2 text-left border-b font-semibold">Produk</th>
                                                    <th className="p-2 text-center border-b font-semibold">SN Start</th>
                                                    <th className="p-2 text-center border-b font-semibold">SN End</th>
                                                    <th className="p-2 text-right border-b font-semibold">Qty</th>
                                                    <th className="p-2 text-center border-b font-semibold">Expiry Date</th>
                                                    <th className="p-2 text-center border-b font-semibold">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {items.map((item, idx) => {
                                                    const expStatus = getExpiryStatus(item.expiry_date);
                                                    return (
                                                        <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                            <td className="p-2 border-b">
                                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getProductColor(item.product_code)}`}>
                                                                    {item.product_code}
                                                                </span>
                                                            </td>
                                                            <td className="p-2 border-b font-medium text-gray-700">{item.product_name}</td>
                                                            <td className="p-2 border-b text-center font-mono text-blue-600">{item.sn_start}</td>
                                                            <td className="p-2 border-b text-center font-mono text-blue-600">{item.sn_end}</td>
                                                            <td className="p-2 border-b text-right font-bold text-green-700">{formatNumber(item.qty)}</td>
                                                            <td className="p-2 border-b text-center">{formatDate(item.expiry_date)}</td>
                                                            <td className="p-2 border-b text-center">
                                                                <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${expStatus.color}`}>
                                                                    {expStatus.text}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {groupedByDO.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            <Package size={48} className="mx-auto text-gray-300 mb-3" />
                            <p>Tidak ada data yang ditemukan</p>
                            <p className="text-xs mt-1">Coba ubah filter atau kata kunci pencarian</p>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default DOAListSNPage;
