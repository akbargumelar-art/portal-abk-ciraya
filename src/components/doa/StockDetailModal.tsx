/**
 * Stock Detail Modal Component
 * 
 * Shows detailed Serial Numbers for a specific product group
 * Features: Virtual scrolling, SN search, Copy to clipboard
 */

import React, { useState, useMemo, useCallback } from 'react';
import { X, Search, Copy, CheckCircle, Package, MapPin, Calendar, Hash } from 'lucide-react';

interface StockGroup {
    id: string;
    product_code: string;
    product_name: string;
    location: string;
    total_qty: number;
    expiry_date: string;
    sn_prefix: string;
}

interface StockDetailModalProps {
    group: StockGroup;
    onClose: () => void;
}

// Generate dummy SNs for the group
const generateSNList = (group: StockGroup): string[] => {
    const snList: string[] = [];
    const prefix = group.sn_prefix || '62811';
    const baseNum = parseInt(group.id) * 100000;

    for (let i = 0; i < group.total_qty; i++) {
        snList.push(`${prefix}${String(baseNum + i).padStart(10, '0')}`);
    }
    return snList;
};

const StockDetailModal: React.FC<StockDetailModalProps> = ({ group, onClose }) => {
    const [searchSN, setSearchSN] = useState('');
    const [copied, setCopied] = useState(false);

    // Generate SN list for this group
    const allSNs = useMemo(() => generateSNList(group), [group]);

    // Filter SNs based on search
    const filteredSNs = useMemo(() => {
        if (!searchSN) return allSNs;
        return allSNs.filter(sn => sn.includes(searchSN));
    }, [allSNs, searchSN]);

    // Copy all SNs to clipboard
    const handleCopyAll = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(filteredSNs.join('\n'));
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    }, [filteredSNs]);

    // Format expiry date
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    // Visible items for virtual scrolling (show first 500 items)
    const visibleSNs = useMemo(() => filteredSNs.slice(0, 500), [filteredSNs]);
    const hasMore = filteredSNs.length > 500;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
                    <div>
                        <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                            <Package size={20} className="text-blue-600" />
                            Detail SN: {group.product_name}
                        </h2>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                                <MapPin size={12} />
                                {group.location}
                            </span>
                            <span className="flex items-center gap-1">
                                <Calendar size={12} />
                                Exp: {formatDate(group.expiry_date)}
                            </span>
                            <span className="font-semibold text-blue-600">
                                {group.total_qty.toLocaleString('id-ID')} SN
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Search & Actions */}
                <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                    <div className="flex-1 relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari SN dalam grup ini..."
                            value={searchSN}
                            onChange={(e) => setSearchSN(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button
                        onClick={handleCopyAll}
                        className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${copied
                                ? 'bg-green-100 text-green-700'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                    >
                        {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                        {copied ? 'Tersalin!' : 'Copy All'}
                    </button>
                </div>

                {/* Stats */}
                <div className="px-4 py-2 bg-gray-50 text-xs text-gray-500 flex items-center justify-between">
                    <span>
                        Menampilkan {visibleSNs.length.toLocaleString('id-ID')} dari {filteredSNs.length.toLocaleString('id-ID')} SN
                        {hasMore && <span className="text-amber-600 ml-2">(scroll untuk lihat lebih)</span>}
                    </span>
                    {searchSN && (
                        <span className="text-blue-600">Filter: "{searchSN}"</span>
                    )}
                </div>

                {/* SN List with Virtual Scrolling */}
                <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: '400px' }}>
                    {filteredSNs.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <Hash size={48} className="mx-auto mb-3 opacity-50" />
                            <p>SN tidak ditemukan</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {visibleSNs.map((sn, idx) => (
                                <div
                                    key={idx}
                                    className="px-3 py-2 bg-gray-50 rounded text-xs font-mono text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer"
                                    onClick={() => navigator.clipboard.writeText(sn)}
                                    title="Klik untuk copy"
                                >
                                    {sn}
                                </div>
                            ))}
                        </div>
                    )}
                    {hasMore && (
                        <div className="text-center py-4 text-xs text-gray-400">
                            ... dan {(filteredSNs.length - 500).toLocaleString('id-ID')} SN lainnya
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StockDetailModal;
