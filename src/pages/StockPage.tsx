import React, { useMemo, useState, useCallback } from 'react';
import { ChevronDown, ChevronRight, Package, Search, Store, MapPin, User, Filter, X, Download, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import Header from '../components/layout/Header';
import { Card, Input, Select, Button } from '../components/ui/index';
import { Tabs, TabList, Tab, TabPanel } from '../components/ui/Tabs';
import { stockItems, outlets } from '../data/mockData';
import { formatRSNumber } from '../utils/formatters';
import type { StockItem, Outlet } from '../types';

interface StockPageProps {
    type: 'perdana' | 'voucher';
}

// Stock per qty ranges for summary
const STOCK_QTY_RANGES = [
    { label: '1', min: 1, max: 1 },
    { label: '2-5', min: 2, max: 5 },
    { label: '6-10', min: 6, max: 10 },
    { label: '11-20', min: 11, max: 20 },
    { label: '>20', min: 21, max: Infinity },
];

// Summary row interface - new structure
interface SummaryRow {
    tap: string;
    salesforce?: string;
    pjpCount: number;
    outletBelanja: number;
    qtyBelanja: number;
    // Stock >0
    stockGt0Outlet: number;
    stockGt0RateToPJP: number;
    stockGt0Qty: number;
    stockGt0QtyPerOutlet: number;
    // Stock 0
    stock0ToOutletBelanja: number;
    stock0RateToBelanja: number;
    stock0ToOutletPJP: number;
    stock0RateToPJP: number;
    // SO & Stock Days
    soDaily: number;
    stockDays: number;
    // Stock per Qty
    stockQty1: number;
    stockQty2to5: number;
    stockQty6to10: number;
    stockQty11to20: number;
    stockQtyGt20: number;
}

// Outlet detail interface - matches OutletRegister columns
interface OutletStockDetail {
    outletId: string;
    createdAt: string;
    idDigipos: string;
    rsNumber: string;
    outletName: string;
    salesforce: string;
    tap: string;
    kabupaten: string;
    kecamatan: string;
    kelurahan: string;
    pjpStatus: string;
    physicalStatus: string;
    hariPJP: string;
    lokasiOutlet: string;
    flag: string;
    longitude: number | undefined;
    latitude: number | undefined;
    // Stock data
    groupABeli: number;
    groupASO: number;
    groupASisa: number;
    groupBBeli: number;
    groupBSO: number;
    groupBSisa: number;
    totalBeli: number;
    totalSO: number;
    totalSisa: number;
    infoKeterangan: string;
}

const StockPage: React.FC<StockPageProps> = ({ type }) => {
    // Filter state
    const [tapFilter, setTapFilter] = useState('');
    const [salesforceFilter, setSalesforceFilter] = useState('');
    const [kabupatenFilter, setKabupatenFilter] = useState('');
    const [lokasiFilter, setLokasiFilter] = useState('');
    const [flagFilter, setFlagFilter] = useState('');
    const [hariPJPFilter, setHariPJPFilter] = useState('');
    const [infoFilter, setInfoFilter] = useState('');
    const [outletSearch, setOutletSearch] = useState('');

    // Summary tab lokasi filter
    const [summaryLokasiFilter, setSummaryLokasiFilter] = useState('');

    // Collapsible state
    const [tapExpanded, setTapExpanded] = useState(true);
    const [sfExpanded, setSfExpanded] = useState(true);

    // Sorting state for Detail Outlet table
    const [sortColumn, setSortColumn] = useState<keyof OutletStockDetail | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    const title = type === 'perdana' ? 'Stock Perdana' : 'Stock Voucher';
    const soLabel = type === 'perdana' ? 'SO' : 'Redeem';

    // Filter stock by type
    const filteredStock = useMemo(() => {
        return stockItems.filter(s => s.productType === type);
    }, [type]);

    // Get all outlets that have stock
    const outletsWithStock = useMemo(() => {
        const outletIds = new Set(filteredStock.map(s => s.outletId));
        return outlets.filter(o => outletIds.has(o.id));
    }, [filteredStock]);

    // ===========================================
    // Bi-directional Filter Options
    // ===========================================

    const tapOptions = useMemo(() => {
        const subset = outletsWithStock.filter(o => {
            if (salesforceFilter && o.salesforceName !== salesforceFilter) return false;
            if (kabupatenFilter && o.kabupaten !== kabupatenFilter) return false;
            if (lokasiFilter && o.lokasiOutlet !== lokasiFilter) return false;
            if (flagFilter && o.flag !== flagFilter) return false;
            if (hariPJPFilter && o.hariPJP !== hariPJPFilter) return false;
            return true;
        });
        const unique = [...new Set(subset.map(o => o.tap))].sort();
        return [{ value: '', label: 'Semua TAP' }, ...unique.map(t => ({ value: t, label: t }))];
    }, [outletsWithStock, salesforceFilter, kabupatenFilter, lokasiFilter, flagFilter, hariPJPFilter]);

    const salesforceOptions = useMemo(() => {
        const subset = outletsWithStock.filter(o => {
            if (tapFilter && o.tap !== tapFilter) return false;
            if (kabupatenFilter && o.kabupaten !== kabupatenFilter) return false;
            if (lokasiFilter && o.lokasiOutlet !== lokasiFilter) return false;
            if (flagFilter && o.flag !== flagFilter) return false;
            if (hariPJPFilter && o.hariPJP !== hariPJPFilter) return false;
            return true;
        });
        const unique = [...new Set(subset.map(o => o.salesforceName))].sort();
        return [{ value: '', label: 'Semua Salesforce' }, ...unique.map(s => ({ value: s, label: s }))];
    }, [outletsWithStock, tapFilter, kabupatenFilter, lokasiFilter, flagFilter, hariPJPFilter]);

    const kabupatenOptions = useMemo(() => {
        const subset = outletsWithStock.filter(o => {
            if (tapFilter && o.tap !== tapFilter) return false;
            if (salesforceFilter && o.salesforceName !== salesforceFilter) return false;
            if (lokasiFilter && o.lokasiOutlet !== lokasiFilter) return false;
            if (flagFilter && o.flag !== flagFilter) return false;
            if (hariPJPFilter && o.hariPJP !== hariPJPFilter) return false;
            return true;
        });
        const unique = [...new Set(subset.map(o => o.kabupaten))].sort();
        return [{ value: '', label: 'Semua Kabupaten' }, ...unique.map(k => ({ value: k, label: k }))];
    }, [outletsWithStock, tapFilter, salesforceFilter, lokasiFilter, flagFilter, hariPJPFilter]);

    const lokasiOptions = useMemo(() => {
        const subset = outletsWithStock.filter(o => {
            if (tapFilter && o.tap !== tapFilter) return false;
            if (salesforceFilter && o.salesforceName !== salesforceFilter) return false;
            if (kabupatenFilter && o.kabupaten !== kabupatenFilter) return false;
            if (flagFilter && o.flag !== flagFilter) return false;
            if (hariPJPFilter && o.hariPJP !== hariPJPFilter) return false;
            return true;
        });
        const unique = [...new Set(subset.map(o => o.lokasiOutlet))].filter(Boolean).sort();
        return [{ value: '', label: 'Semua Lokasi' }, ...unique.map(l => ({ value: l, label: l }))];
    }, [outletsWithStock, tapFilter, salesforceFilter, kabupatenFilter, flagFilter, hariPJPFilter]);

    const flagOptions = useMemo(() => {
        const subset = outletsWithStock.filter(o => {
            if (tapFilter && o.tap !== tapFilter) return false;
            if (salesforceFilter && o.salesforceName !== salesforceFilter) return false;
            if (kabupatenFilter && o.kabupaten !== kabupatenFilter) return false;
            if (lokasiFilter && o.lokasiOutlet !== lokasiFilter) return false;
            if (hariPJPFilter && o.hariPJP !== hariPJPFilter) return false;
            return true;
        });
        const unique = [...new Set(subset.map(o => o.flag))].filter(Boolean).sort();
        return [{ value: '', label: 'Semua Flag' }, ...unique.map(f => ({ value: f, label: f }))];
    }, [outletsWithStock, tapFilter, salesforceFilter, kabupatenFilter, lokasiFilter, hariPJPFilter]);

    const hariPJPOptions = useMemo(() => {
        const subset = outletsWithStock.filter(o => {
            if (tapFilter && o.tap !== tapFilter) return false;
            if (salesforceFilter && o.salesforceName !== salesforceFilter) return false;
            if (kabupatenFilter && o.kabupaten !== kabupatenFilter) return false;
            if (lokasiFilter && o.lokasiOutlet !== lokasiFilter) return false;
            if (flagFilter && o.flag !== flagFilter) return false;
            return true;
        });
        const unique = [...new Set(subset.map(o => o.hariPJP))].filter(Boolean).sort();
        return [{ value: '', label: 'Semua Hari' }, ...unique.map(h => ({ value: h, label: h }))];
    }, [outletsWithStock, tapFilter, salesforceFilter, kabupatenFilter, lokasiFilter, flagFilter]);

    const infoOptions = [
        { value: '', label: 'Semua' },
        { value: 'Push Order', label: 'Push Order' },
        { value: 'Cukup', label: 'Cukup' },
    ];

    // Auto-clear if selection not in options
    React.useEffect(() => {
        if (tapFilter && !tapOptions.some(o => o.value === tapFilter)) setTapFilter('');
    }, [tapOptions, tapFilter]);

    React.useEffect(() => {
        if (salesforceFilter && !salesforceOptions.some(o => o.value === salesforceFilter)) setSalesforceFilter('');
    }, [salesforceOptions, salesforceFilter]);

    React.useEffect(() => {
        if (kabupatenFilter && !kabupatenOptions.some(o => o.value === kabupatenFilter)) setKabupatenFilter('');
    }, [kabupatenOptions, kabupatenFilter]);

    React.useEffect(() => {
        if (lokasiFilter && !lokasiOptions.some(o => o.value === lokasiFilter)) setLokasiFilter('');
    }, [lokasiOptions, lokasiFilter]);

    React.useEffect(() => {
        if (flagFilter && !flagOptions.some(o => o.value === flagFilter)) setFlagFilter('');
    }, [flagOptions, flagFilter]);

    React.useEffect(() => {
        if (hariPJPFilter && !hariPJPOptions.some(o => o.value === hariPJPFilter)) setHariPJPFilter('');
    }, [hariPJPOptions, hariPJPFilter]);

    const hasActiveFilters = tapFilter || salesforceFilter || kabupatenFilter || lokasiFilter || flagFilter || hariPJPFilter || infoFilter;

    const clearAllFilters = () => {
        setTapFilter('');
        setSalesforceFilter('');
        setKabupatenFilter('');
        setLokasiFilter('');
        setFlagFilter('');
        setHariPJPFilter('');
        setInfoFilter('');
    };

    // ===========================================
    // Filtered Outlet Data with Stock
    // ===========================================
    const getOutletStock = useMemo(() => {
        const outletMap = new Map<string, { outlet: Outlet; items: StockItem[] }>();

        filteredStock.forEach(item => {
            const outlet = outlets.find(o => o.id === item.outletId);
            if (!outlet) return;

            // Apply all filters
            if (tapFilter && outlet.tap !== tapFilter) return;
            if (salesforceFilter && outlet.salesforceName !== salesforceFilter) return;
            if (kabupatenFilter && outlet.kabupaten !== kabupatenFilter) return;
            if (lokasiFilter && outlet.lokasiOutlet !== lokasiFilter) return;
            if (flagFilter && outlet.flag !== flagFilter) return;
            if (hariPJPFilter && outlet.hariPJP !== hariPJPFilter) return;

            if (!outletMap.has(outlet.id)) {
                outletMap.set(outlet.id, { outlet, items: [] });
            }
            outletMap.get(outlet.id)!.items.push(item);
        });

        return outletMap;
    }, [filteredStock, tapFilter, salesforceFilter, kabupatenFilter, lokasiFilter, flagFilter, hariPJPFilter]);

    // ===========================================
    // Outlet Detail Data - matches OutletRegister columns
    // ===========================================
    const outletDetailData: OutletStockDetail[] = useMemo(() => {
        const result: OutletStockDetail[] = [];

        getOutletStock.forEach(({ outlet, items }) => {
            let groupABeli = 0, groupASO = 0, groupASisa = 0;
            let groupBBeli = 0, groupBSO = 0, groupBSisa = 0;

            items.forEach(item => {
                if (item.productGroup === 'A') {
                    groupABeli += item.beliM;
                    groupASO += item.sellOutM;
                    groupASisa += item.stockM;
                } else {
                    groupBBeli += item.beliM;
                    groupBSO += item.sellOutM;
                    groupBSisa += item.stockM;
                }
            });

            const totalSisa = groupASisa + groupBSisa;
            // Push Order if stock <= 5, Cukup if > 5
            const infoKeterangan = totalSisa <= 5 ? 'Push Order' : 'Cukup';

            // Apply info filter
            if (infoFilter && infoFilter !== infoKeterangan) return;

            result.push({
                outletId: outlet.id,
                createdAt: outlet.createdAt,
                idDigipos: outlet.idDigipos,
                rsNumber: outlet.rsNumber,
                outletName: outlet.name,
                salesforce: outlet.salesforceName,
                tap: outlet.tap,
                kabupaten: outlet.kabupaten,
                kecamatan: outlet.kecamatan,
                kelurahan: outlet.kelurahan,
                pjpStatus: outlet.pjpStatus,
                physicalStatus: outlet.physicalStatus,
                hariPJP: outlet.hariPJP,
                lokasiOutlet: outlet.lokasiOutlet || '-',
                flag: outlet.flag || '-',
                longitude: outlet.longitude,
                latitude: outlet.latitude,
                groupABeli, groupASO, groupASisa,
                groupBBeli, groupBSO, groupBSisa,
                totalBeli: groupABeli + groupBBeli,
                totalSO: groupASO + groupBSO,
                totalSisa,
                infoKeterangan,
            });
        });

        // Apply search filter
        if (outletSearch) {
            const search = outletSearch.toLowerCase();
            return result.filter(o =>
                o.outletName.toLowerCase().includes(search) ||
                o.tap.toLowerCase().includes(search) ||
                o.salesforce.toLowerCase().includes(search) ||
                o.idDigipos.includes(search)
            );
        }

        return result.sort((a, b) => a.totalSisa - b.totalSisa);
    }, [getOutletStock, outletSearch, infoFilter]);

    // Sorted outlet detail data
    const sortedOutletData = useMemo(() => {
        if (!sortColumn) return outletDetailData;

        return [...outletDetailData].sort((a, b) => {
            const aVal = a[sortColumn];
            const bVal = b[sortColumn];

            // Handle numbers
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
            }

            // Handle strings
            const aStr = String(aVal || '').toLowerCase();
            const bStr = String(bVal || '').toLowerCase();

            if (sortDirection === 'asc') {
                return aStr.localeCompare(bStr);
            }
            return bStr.localeCompare(aStr);
        });
    }, [outletDetailData, sortColumn, sortDirection]);

    // Sort handler
    const handleSort = (column: keyof OutletStockDetail) => {
        if (sortColumn === column) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    // Get sort icon for column
    const getSortIcon = (column: keyof OutletStockDetail) => {
        if (sortColumn !== column) {
            return <ArrowUpDown size={10} className="ml-1 opacity-40" />;
        }
        return sortDirection === 'asc'
            ? <ArrowUp size={10} className="ml-1 text-yellow-300" />
            : <ArrowDown size={10} className="ml-1 text-yellow-300" />;
    };

    // Data for Summary tab (with Lokasi filter)
    const summaryData = useMemo(() => {
        if (!summaryLokasiFilter) return outletDetailData;
        return outletDetailData.filter(o => o.lokasiOutlet === summaryLokasiFilter);
    }, [outletDetailData, summaryLokasiFilter]);

    // Export to Excel function
    const exportToExcel = useCallback(() => {
        const headers = [
            'Created At', 'ID Digipos', 'No RS', 'Nama Outlet', 'Salesforce', 'TAP',
            'Kabupaten', 'Kecamatan', 'Kelurahan', 'PJP', 'Fisik', 'Hari PJP',
            'Lokasi', 'Flag', 'Longitude', 'Latitude',
            `Simpati Beli`, `Simpati ${soLabel}`, 'Simpati Sisa',
            `byU Beli`, `byU ${soLabel}`, 'byU Sisa',
            'Total Beli', `Total ${soLabel}`, 'Total Sisa', 'Keterangan'
        ];

        const rows = outletDetailData.map(o => [
            o.createdAt, o.idDigipos, formatRSNumber(o.rsNumber), o.outletName, o.salesforce, o.tap,
            o.kabupaten, o.kecamatan, o.kelurahan, o.pjpStatus, o.physicalStatus, o.hariPJP,
            o.lokasiOutlet, o.flag, o.longitude?.toFixed(4) || '', o.latitude?.toFixed(4) || '',
            o.groupABeli, o.groupASO, o.groupASisa,
            o.groupBBeli, o.groupBSO, o.groupBSisa,
            o.totalBeli, o.totalSO, o.totalSisa, o.infoKeterangan
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
            .join('\n');

        const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${title.replace(' ', '_')}_Detail_Outlet_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, [outletDetailData, title, soLabel]);

    // ===========================================
    // Calculate Summary Row Helper
    // ===========================================
    const calculateSummaryRow = (tap: string, salesforce: string | undefined, outletList: OutletStockDetail[]): SummaryRow => {
        const pjpCount = outletList.filter(o => o.pjpStatus === 'PJP').length;
        const outletBelanja = outletList.filter(o => o.totalBeli > 0).length;
        const qtyBelanja = outletList.reduce((sum, o) => sum + o.totalBeli, 0);

        // Stock > 0
        const stockGt0Outlets = outletList.filter(o => o.totalSisa > 0);
        const stockGt0Outlet = stockGt0Outlets.length;
        const stockGt0RateToPJP = pjpCount > 0 ? (stockGt0Outlet / pjpCount) * 100 : 0;
        const stockGt0Qty = stockGt0Outlets.reduce((sum, o) => sum + o.totalSisa, 0);
        const stockGt0QtyPerOutlet = stockGt0Outlet > 0 ? stockGt0Qty / stockGt0Outlet : 0;

        // Stock = 0
        const stock0Outlets = outletList.filter(o => o.totalSisa === 0);
        const stock0OutletsBelanja = stock0Outlets.filter(o => o.totalBeli > 0);
        const stock0OutletsPJP = stock0Outlets.filter(o => o.pjpStatus === 'PJP');
        const stock0ToOutletBelanja = stock0OutletsBelanja.length;
        const stock0RateToBelanja = outletBelanja > 0 ? (stock0ToOutletBelanja / outletBelanja) * 100 : 0;
        const stock0ToOutletPJP = stock0OutletsPJP.length;
        const stock0RateToPJP = pjpCount > 0 ? (stock0ToOutletPJP / pjpCount) * 100 : 0;

        // SO Daily (average daily SO based on 30 days)
        const totalSO = outletList.reduce((sum, o) => sum + o.totalSO, 0);
        const soDaily = totalSO / 30;

        // Stock Days = total sisa / SO daily
        const totalSisa = outletList.reduce((sum, o) => sum + o.totalSisa, 0);
        const stockDays = soDaily > 0 ? totalSisa / soDaily : 0;

        // Stock per Qty ranges
        const stockQty1 = outletList.filter(o => o.totalSisa === 1).length;
        const stockQty2to5 = outletList.filter(o => o.totalSisa >= 2 && o.totalSisa <= 5).length;
        const stockQty6to10 = outletList.filter(o => o.totalSisa >= 6 && o.totalSisa <= 10).length;
        const stockQty11to20 = outletList.filter(o => o.totalSisa >= 11 && o.totalSisa <= 20).length;
        const stockQtyGt20 = outletList.filter(o => o.totalSisa > 20).length;

        return {
            tap,
            salesforce,
            pjpCount,
            outletBelanja,
            qtyBelanja,
            stockGt0Outlet,
            stockGt0RateToPJP,
            stockGt0Qty,
            stockGt0QtyPerOutlet,
            stock0ToOutletBelanja,
            stock0RateToBelanja,
            stock0ToOutletPJP,
            stock0RateToPJP,
            soDaily,
            stockDays,
            stockQty1,
            stockQty2to5,
            stockQty6to10,
            stockQty11to20,
            stockQtyGt20,
        };
    };

    // ===========================================
    // Summary per TAP
    // ===========================================
    const tapSummary: SummaryRow[] = useMemo(() => {
        const tapMap = new Map<string, OutletStockDetail[]>();

        summaryData.forEach(outlet => {
            if (!tapMap.has(outlet.tap)) tapMap.set(outlet.tap, []);
            tapMap.get(outlet.tap)!.push(outlet);
        });

        return Array.from(tapMap.entries())
            .map(([tap, outletList]) => calculateSummaryRow(tap, undefined, outletList))
            .sort((a, b) => a.tap.localeCompare(b.tap));
    }, [summaryData]);

    // ===========================================
    // Summary per Salesforce
    // ===========================================
    const sfSummary: SummaryRow[] = useMemo(() => {
        const sfMap = new Map<string, { tap: string; outlets: OutletStockDetail[] }>();

        summaryData.forEach(outlet => {
            if (!sfMap.has(outlet.salesforce)) {
                sfMap.set(outlet.salesforce, { tap: outlet.tap, outlets: [] });
            }
            sfMap.get(outlet.salesforce)!.outlets.push(outlet);
        });

        return Array.from(sfMap.entries())
            .map(([sf, data]) => calculateSummaryRow(data.tap, sf, data.outlets))
            .sort((a, b) => a.tap.localeCompare(b.tap) || (a.salesforce || '').localeCompare(b.salesforce || ''));
    }, [summaryData]);

    // byU blue color
    const byuBgClass = 'bg-sky-50';
    const byuHeaderBgClass = 'bg-sky-100 text-sky-800';

    // Rate badge
    const RateBadge = ({ value, invert = false }: { value: number; invert?: boolean }) => {
        const color = invert
            ? (value <= 5 ? 'bg-green-100 text-green-700' : value <= 20 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700')
            : (value >= 80 ? 'bg-green-100 text-green-700' : value >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700');
        return (
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${color}`}>
                {value.toFixed(1)}%
            </span>
        );
    };

    // ===========================================
    // Summary Table Component
    // ===========================================
    const SummaryTable = ({ data, title, icon, expanded, onToggle, showSalesforce = false }: {
        data: SummaryRow[];
        title: string;
        icon: React.ReactNode;
        expanded: boolean;
        onToggle: () => void;
        showSalesforce?: boolean;
    }) => (
        <div className="border border-gray-200 rounded-lg mb-4 overflow-hidden">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
                <div className="flex items-center gap-2">
                    {icon}
                    <span className="font-semibold text-gray-800 text-sm">{title}</span>
                    <span className="text-xs text-gray-500">({data.length} items)</span>
                </div>
                {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </button>

            {expanded && (
                <div className="overflow-x-auto max-h-[500px]">
                    <table className="w-full text-[9px] border-collapse whitespace-nowrap">
                        <thead className="sticky top-0 z-10 bg-[#2c4a6a]">
                            {/* Level 1 Main Headers */}
                            <tr className="border-b border-gray-700">
                                <th className="p-2 text-left bg-[#2c4a6a] text-white" rowSpan={2}>TAP</th>
                                {showSalesforce && <th className="p-2 text-left bg-[#2c4a6a] text-white" rowSpan={2}>Salesforce</th>}
                                <th className="p-2 text-center bg-[#2c4a6a] text-white" rowSpan={2}>PJP</th>
                                <th className="p-2 text-center bg-[#3d5f85] text-orange-300 border-l border-gray-700" colSpan={2}>Belanja (ST)</th>
                                <th className="p-2 text-center bg-[#3d5f85] text-green-300 border-l border-gray-700" colSpan={4}>Stock &gt;0</th>
                                <th className="p-2 text-center bg-[#3d5f85] text-red-300 border-l border-gray-700" colSpan={4}>Stock 0</th>
                                <th className="p-2 text-center bg-[#2c4a6a] text-blue-300 border-l border-gray-700" rowSpan={2}>{type === 'voucher' ? 'Redeem Daily' : 'SO Daily'}</th>
                                <th className="p-2 text-center bg-[#2c4a6a] text-blue-300" rowSpan={2}>Stock Days</th>
                                <th className="p-2 text-center bg-[#3d5f85] text-amber-300 border-l border-gray-700" colSpan={5}>Stock per Qty</th>
                            </tr>
                            {/* Level 2: Sub Headers */}
                            <tr className="bg-[#3d5f85] text-white/90 border-b border-gray-700">
                                {/* Belanja */}
                                <th className="p-1.5 text-center border-l border-gray-700">Outlet</th>
                                <th className="p-1.5 text-center">Qty</th>
                                {/* Stock >0 */}
                                <th className="p-1.5 text-center border-l border-gray-700">Outlet</th>
                                <th className="p-1.5 text-center">Rate</th>
                                <th className="p-1.5 text-center">Qty</th>
                                <th className="p-1.5 text-center">Qty/O</th>
                                {/* Stock 0 */}
                                <th className="p-1.5 text-center border-l border-gray-700">to Belanja</th>
                                <th className="p-1.5 text-center">Rate</th>
                                <th className="p-1.5 text-center">to PJP</th>
                                <th className="p-1.5 text-center">Rate</th>
                                {/* Stock per Qty */}
                                <th className="p-1.5 text-center border-l border-gray-700">1</th>
                                <th className="p-1.5 text-center">2-5</th>
                                <th className="p-1.5 text-center">6-10</th>
                                <th className="p-1.5 text-center">11-20</th>
                                <th className="p-1.5 text-center">&gt;20</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 border-b">
                                    <td className="p-2 font-medium">{row.tap}</td>
                                    {showSalesforce && <td className="p-2 text-gray-700">{row.salesforce}</td>}
                                    <td className="p-2 text-center font-semibold text-blue-700">{row.pjpCount}</td>
                                    {/* Belanja */}
                                    <td className="p-2 text-center bg-orange-50/20">{row.outletBelanja}</td>
                                    <td className="p-2 text-center bg-orange-50/20 font-medium">{row.qtyBelanja.toLocaleString()}</td>
                                    {/* Stock >0 */}
                                    <td className="p-2 text-center bg-green-50/20 border-l">{row.stockGt0Outlet}</td>
                                    <td className="p-2 text-center bg-green-50/20"><RateBadge value={row.stockGt0RateToPJP} /></td>
                                    <td className="p-2 text-center bg-green-50/20">{row.stockGt0Qty.toLocaleString()}</td>
                                    <td className="p-2 text-center bg-green-50/20 font-medium">{row.stockGt0QtyPerOutlet.toFixed(1)}</td>
                                    {/* Stock 0 */}
                                    <td className="p-2 text-center bg-red-50/20 border-l">{row.stock0ToOutletBelanja}</td>
                                    <td className="p-2 text-center bg-red-50/20"><RateBadge value={row.stock0RateToBelanja} invert /></td>
                                    <td className="p-2 text-center bg-red-50/20">{row.stock0ToOutletPJP}</td>
                                    <td className="p-2 text-center bg-red-50/20"><RateBadge value={row.stock0RateToPJP} invert /></td>
                                    {/* SO & Stock Days */}
                                    <td className="p-2 text-center bg-blue-50/20 border-l font-medium">{row.soDaily.toFixed(1)}</td>
                                    <td className="p-2 text-center bg-blue-50/20 font-bold">{row.stockDays.toFixed(0)}</td>
                                    {/* Stock per Qty */}
                                    <td className={`p-2 text-center border-l ${row.stockQty1 > 0 ? 'text-red-600 font-bold bg-red-50' : 'text-gray-400'}`}>{row.stockQty1 || '-'}</td>
                                    <td className={`p-2 text-center ${row.stockQty2to5 > 0 ? 'text-orange-600 font-medium bg-orange-50/30' : 'text-gray-400'}`}>{row.stockQty2to5 || '-'}</td>
                                    <td className={`p-2 text-center ${row.stockQty6to10 > 0 ? 'text-yellow-600' : 'text-gray-400'}`}>{row.stockQty6to10 || '-'}</td>
                                    <td className={`p-2 text-center ${row.stockQty11to20 > 0 ? 'text-green-600' : 'text-gray-400'}`}>{row.stockQty11to20 || '-'}</td>
                                    <td className={`p-2 text-center ${row.stockQtyGt20 > 0 ? 'text-green-700 font-medium' : 'text-gray-400'}`}>{row.stockQtyGt20 || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );

    return (
        <div className="p-6 animate-fade-in">
            <Header
                title={title}
                subtitle={`Data Updated: 22 Des 2025 09:00 WIB`}
            />

            {/* Filter Bar */}
            <Card padding="md" className="mt-6 bg-slate-100">
                <div className="flex items-center gap-2 mb-3">
                    <Filter size={16} className="text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Filter Options</span>
                    {hasActiveFilters && (
                        <button
                            onClick={clearAllFilters}
                            className="ml-auto flex items-center gap-1 text-xs text-red-600 hover:text-red-700 transition-colors"
                        >
                            <X size={14} />
                            Clear All
                        </button>
                    )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                    <Select label="TAP" value={tapFilter} onChange={e => setTapFilter(e.target.value)} options={tapOptions} />
                    <Select label="Salesforce" value={salesforceFilter} onChange={e => setSalesforceFilter(e.target.value)} options={salesforceOptions} />
                    <Select label="Kabupaten" value={kabupatenFilter} onChange={e => setKabupatenFilter(e.target.value)} options={kabupatenOptions} />
                    <Select label="Lokasi" value={lokasiFilter} onChange={e => setLokasiFilter(e.target.value)} options={lokasiOptions} />
                    <Select label="Flag" value={flagFilter} onChange={e => setFlagFilter(e.target.value)} options={flagOptions} />
                    <Select label="Hari PJP" value={hariPJPFilter} onChange={e => setHariPJPFilter(e.target.value)} options={hariPJPOptions} />
                    <Select label="Info" value={infoFilter} onChange={e => setInfoFilter(e.target.value)} options={infoOptions} />
                </div>
            </Card>

            <Card padding="none" className="mt-6 overflow-hidden">
                <Tabs defaultValue="summary">
                    <TabList>
                        <Tab value="summary" icon={<Package size={16} />}>Summary</Tab>
                        <Tab value="detail" icon={<Store size={16} />}>Detail Outlet</Tab>
                    </TabList>

                    {/* Tab 1: Summary */}
                    <TabPanel value="summary" className="p-4">
                        {/* Lokasi Filter Buttons */}
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-sm text-white">Lokasi Outlet:</span>
                            <div className="flex gap-2">
                                <Button
                                    variant={summaryLokasiFilter === '' ? 'primary' : 'outline'}
                                    size="sm"
                                    onClick={() => setSummaryLokasiFilter('')}
                                >
                                    Semua
                                </Button>
                                <Button
                                    variant={summaryLokasiFilter === 'Ring 1' ? 'primary' : 'outline'}
                                    size="sm"
                                    onClick={() => setSummaryLokasiFilter('Ring 1')}
                                >
                                    Ring 1
                                </Button>
                                <Button
                                    variant={summaryLokasiFilter === 'Ring 2' ? 'primary' : 'outline'}
                                    size="sm"
                                    onClick={() => setSummaryLokasiFilter('Ring 2')}
                                >
                                    Ring 2
                                </Button>
                                <Button
                                    variant={summaryLokasiFilter === 'Ring 3' ? 'primary' : 'outline'}
                                    size="sm"
                                    onClick={() => setSummaryLokasiFilter('Ring 3')}
                                >
                                    Ring 3
                                </Button>
                            </div>
                        </div>

                        <SummaryTable
                            data={tapSummary}
                            title="Summary per TAP"
                            icon={<MapPin size={16} className="text-blue-600" />}
                            expanded={tapExpanded}
                            onToggle={() => setTapExpanded(!tapExpanded)}
                        />
                        <SummaryTable
                            data={sfSummary}
                            title="Summary per Salesforce"
                            icon={<User size={16} className="text-green-600" />}
                            expanded={sfExpanded}
                            onToggle={() => setSfExpanded(!sfExpanded)}
                            showSalesforce={true}
                        />
                    </TabPanel>

                    {/* Tab 2: Detail Outlet */}
                    <TabPanel value="detail" className="p-4">
                        <div className="flex items-center justify-between mb-4">
                            <Input
                                placeholder="Search outlet, TAP, salesforce, or ID Digipos..."
                                value={outletSearch}
                                onChange={(e) => setOutletSearch(e.target.value)}
                                leftIcon={<Search size={16} />}
                                className="max-w-md"
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                leftIcon={<Download size={16} />}
                                onClick={exportToExcel}
                                className="ml-4"
                            >
                                Export Excel
                            </Button>
                        </div>

                        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                            <div className="overflow-x-auto" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                                <table className="w-full text-[10px]">
                                    <thead className="sticky top-0 z-10 bg-[#2c4a6a] text-xs font-semibold text-white uppercase">
                                        <tr className="border-b border-gray-700 divide-x divide-gray-700">
                                            <th colSpan={15} className="px-2 py-2 text-center bg-[#2c4a6a]">Basic Info</th>
                                            <th colSpan={3} className="px-2 py-2 text-center bg-[#4a6a8a] text-white">
                                                {type === 'perdana' ? 'Simpati' : 'Voucher Simpati'}
                                            </th>
                                            <th colSpan={3} className="px-2 py-2 text-center bg-[#4a6a8a] text-white">
                                                {type === 'perdana' ? 'byU' : 'Voucher byU'}
                                            </th>
                                            <th colSpan={3} className="px-2 py-2 text-center bg-[#4a6a8a] text-white">Total</th>
                                            <th colSpan={1} className="px-2 py-2 text-center bg-[#2c4a6a]">Info</th>
                                        </tr>
                                        <tr className="bg-[#4a6a8a] border-b border-gray-700">
                                            <th onClick={() => handleSort('createdAt')} className="px-2 py-2 text-left min-w-[80px] cursor-pointer hover:bg-[#5a7a9a]"><div className="flex items-center">Created At{getSortIcon('createdAt')}</div></th>
                                            <th onClick={() => handleSort('idDigipos')} className="px-2 py-2 text-left min-w-[90px] cursor-pointer hover:bg-[#5a7a9a]"><div className="flex items-center">ID Digipos{getSortIcon('idDigipos')}</div></th>
                                            <th onClick={() => handleSort('rsNumber')} className="px-2 py-2 text-left min-w-[100px] cursor-pointer hover:bg-[#5a7a9a]"><div className="flex items-center">No RS{getSortIcon('rsNumber')}</div></th>
                                            <th onClick={() => handleSort('outletName')} className="px-2 py-2 text-left min-w-[150px] cursor-pointer hover:bg-[#5a7a9a]"><div className="flex items-center">Nama Outlet{getSortIcon('outletName')}</div></th>
                                            <th onClick={() => handleSort('salesforce')} className="px-2 py-2 text-left min-w-[100px] cursor-pointer hover:bg-[#5a7a9a]"><div className="flex items-center">Salesforce{getSortIcon('salesforce')}</div></th>
                                            <th onClick={() => handleSort('tap')} className="px-2 py-2 text-left min-w-[80px] cursor-pointer hover:bg-[#5a7a9a]"><div className="flex items-center">TAP{getSortIcon('tap')}</div></th>
                                            <th onClick={() => handleSort('kabupaten')} className="px-2 py-2 text-left min-w-[80px] cursor-pointer hover:bg-[#5a7a9a]"><div className="flex items-center">Kabupaten{getSortIcon('kabupaten')}</div></th>
                                            <th onClick={() => handleSort('kecamatan')} className="px-2 py-2 text-left min-w-[80px] cursor-pointer hover:bg-[#5a7a9a]"><div className="flex items-center">Kecamatan{getSortIcon('kecamatan')}</div></th>
                                            <th onClick={() => handleSort('kelurahan')} className="px-2 py-2 text-left min-w-[80px] cursor-pointer hover:bg-[#5a7a9a]"><div className="flex items-center">Kelurahan{getSortIcon('kelurahan')}</div></th>
                                            <th onClick={() => handleSort('pjpStatus')} className="px-2 py-2 text-center min-w-[50px] cursor-pointer hover:bg-[#5a7a9a]"><div className="flex items-center justify-center">PJP{getSortIcon('pjpStatus')}</div></th>
                                            <th onClick={() => handleSort('physicalStatus')} className="px-2 py-2 text-center min-w-[50px] cursor-pointer hover:bg-[#5a7a9a]"><div className="flex items-center justify-center">Fisik{getSortIcon('physicalStatus')}</div></th>
                                            <th onClick={() => handleSort('hariPJP')} className="px-2 py-2 text-center min-w-[60px] cursor-pointer hover:bg-[#5a7a9a]"><div className="flex items-center justify-center">Hari PJP{getSortIcon('hariPJP')}</div></th>
                                            <th onClick={() => handleSort('lokasiOutlet')} className="px-2 py-2 text-center min-w-[50px] cursor-pointer hover:bg-[#5a7a9a]"><div className="flex items-center justify-center">Lokasi{getSortIcon('lokasiOutlet')}</div></th>
                                            <th onClick={() => handleSort('flag')} className="px-2 py-2 text-center min-w-[70px] cursor-pointer hover:bg-[#5a7a9a]"><div className="flex items-center justify-center">Flag{getSortIcon('flag')}</div></th>
                                            <th className="px-2 py-2 text-center min-w-[100px]">Long-Lat</th>
                                            <th onClick={() => handleSort('groupABeli')} className="px-2 py-2 text-right bg-[#5a7a9a] cursor-pointer hover:bg-[#6a8aaa]"><div className="flex items-center justify-end">Beli{getSortIcon('groupABeli')}</div></th>
                                            <th onClick={() => handleSort('groupASO')} className="px-2 py-2 text-right bg-[#5a7a9a] cursor-pointer hover:bg-[#6a8aaa]"><div className="flex items-center justify-end">{soLabel}{getSortIcon('groupASO')}</div></th>
                                            <th onClick={() => handleSort('groupASisa')} className="px-2 py-2 text-right bg-[#5a7a9a] cursor-pointer hover:bg-[#6a8aaa]"><div className="flex items-center justify-end">Sisa{getSortIcon('groupASisa')}</div></th>
                                            <th onClick={() => handleSort('groupBBeli')} className="px-2 py-2 text-right bg-[#5a7a9a] cursor-pointer hover:bg-[#6a8aaa]"><div className="flex items-center justify-end">Beli{getSortIcon('groupBBeli')}</div></th>
                                            <th onClick={() => handleSort('groupBSO')} className="px-2 py-2 text-right bg-[#5a7a9a] cursor-pointer hover:bg-[#6a8aaa]"><div className="flex items-center justify-end">{soLabel}{getSortIcon('groupBSO')}</div></th>
                                            <th onClick={() => handleSort('groupBSisa')} className="px-2 py-2 text-right bg-[#5a7a9a] cursor-pointer hover:bg-[#6a8aaa]"><div className="flex items-center justify-end">Sisa{getSortIcon('groupBSisa')}</div></th>
                                            <th onClick={() => handleSort('totalBeli')} className="px-2 py-2 text-right bg-[#5a7a9a] font-bold cursor-pointer hover:bg-[#6a8aaa]"><div className="flex items-center justify-end">Beli{getSortIcon('totalBeli')}</div></th>
                                            <th onClick={() => handleSort('totalSO')} className="px-2 py-2 text-right bg-[#5a7a9a] font-bold cursor-pointer hover:bg-[#6a8aaa]"><div className="flex items-center justify-end">{soLabel}{getSortIcon('totalSO')}</div></th>
                                            <th onClick={() => handleSort('totalSisa')} className="px-2 py-2 text-right bg-[#5a7a9a] font-bold cursor-pointer hover:bg-[#6a8aaa]"><div className="flex items-center justify-end">Sisa{getSortIcon('totalSisa')}</div></th>
                                            <th onClick={() => handleSort('infoKeterangan')} className="px-2 py-2 text-center cursor-pointer hover:bg-[#5a7a9a]"><div className="flex items-center justify-center">Keterangan{getSortIcon('infoKeterangan')}</div></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {sortedOutletData.length === 0 ? (
                                            <tr>
                                                <td colSpan={25} className="px-4 py-8 text-center text-gray-400">No outlets found</td>
                                            </tr>
                                        ) : (
                                            sortedOutletData.map((outlet) => (
                                                <tr key={outlet.outletId} className="hover:bg-gray-50">
                                                    <td className="px-2 py-1.5 text-[9px]">{outlet.createdAt}</td>
                                                    <td className="px-2 py-1.5 font-mono text-[9px]">{outlet.idDigipos}</td>
                                                    <td className="px-2 py-1.5 font-mono text-[9px]">{formatRSNumber(outlet.rsNumber)}</td>
                                                    <td className="px-2 py-1.5 font-medium text-gray-900 truncate max-w-[150px]" title={outlet.outletName}>{outlet.outletName}</td>
                                                    <td className="px-2 py-1.5 text-gray-900 truncate">{outlet.salesforce}</td>
                                                    <td className="px-2 py-1.5">
                                                        <span className="text-[9px] font-medium text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded">{outlet.tap}</span>
                                                    </td>
                                                    <td className="px-2 py-1.5 text-gray-500 text-[9px]">{outlet.kabupaten}</td>
                                                    <td className="px-2 py-1.5 text-gray-500 text-[9px]">{outlet.kecamatan}</td>
                                                    <td className="px-2 py-1.5 text-gray-500 text-[9px]">{outlet.kelurahan}</td>
                                                    <td className="px-2 py-1.5 text-center">
                                                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-medium ${outlet.pjpStatus === 'PJP' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{outlet.pjpStatus}</span>
                                                    </td>
                                                    <td className="px-2 py-1.5 text-center">
                                                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-medium ${outlet.physicalStatus === 'Fisik' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{outlet.physicalStatus}</span>
                                                    </td>
                                                    <td className="px-2 py-1.5 text-center text-[9px]">{outlet.hariPJP}</td>
                                                    <td className="px-2 py-1.5 text-center">
                                                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-medium ${outlet.lokasiOutlet === 'Ring 1' ? 'bg-green-100 text-green-700' : outlet.lokasiOutlet === 'Ring 2' ? 'bg-yellow-100 text-yellow-700' : 'bg-orange-100 text-orange-600'}`}>{outlet.lokasiOutlet}</span>
                                                    </td>
                                                    <td className="px-2 py-1.5 text-center">
                                                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-medium ${outlet.flag === 'Big Pareto' ? 'bg-orange-100 text-orange-700' : outlet.flag === 'Pareto Retail' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{outlet.flag}</span>
                                                    </td>
                                                    <td className="px-2 py-1.5 font-mono text-[8px] text-gray-500">
                                                        {outlet.longitude?.toFixed(4)}, {outlet.latitude?.toFixed(4)}
                                                    </td>
                                                    <td className="px-2 py-1.5 text-right text-[9px] bg-red-50/20">{outlet.groupABeli}</td>
                                                    <td className="px-2 py-1.5 text-right text-[9px] bg-red-50/20">{outlet.groupASO}</td>
                                                    <td className="px-2 py-1.5 text-right text-[9px] font-medium bg-red-50/30">{outlet.groupASisa}</td>
                                                    <td className={`px-2 py-1.5 text-right text-[9px] ${byuBgClass}`}>{outlet.groupBBeli}</td>
                                                    <td className={`px-2 py-1.5 text-right text-[9px] ${byuBgClass}`}>{outlet.groupBSO}</td>
                                                    <td className={`px-2 py-1.5 text-right text-[9px] font-medium ${byuBgClass}`}>{outlet.groupBSisa}</td>
                                                    <td className="px-2 py-1.5 text-right text-[9px] font-semibold bg-gray-50">{outlet.totalBeli}</td>
                                                    <td className="px-2 py-1.5 text-right text-[9px] font-semibold bg-gray-50">{outlet.totalSO}</td>
                                                    <td className="px-2 py-1.5 text-right text-[9px] font-bold bg-gray-50">{outlet.totalSisa}</td>
                                                    <td className="px-2 py-1.5 text-center">
                                                        <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-bold ${outlet.infoKeterangan === 'Push Order' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                            {outlet.infoKeterangan}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </TabPanel>
                </Tabs>
            </Card>
        </div>
    );
};

export default StockPage;
