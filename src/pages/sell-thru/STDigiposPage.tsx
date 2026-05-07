import React, { useState, useMemo, memo } from 'react';
import { Clock, Smartphone, ChevronDown, ChevronUp, MapPin, User, Store, Download } from 'lucide-react';
import Header from '../../components/layout/Header';
import { Card } from '../../components/ui';
import { Tabs, TabList, Tab, TabPanel } from '../../components/ui/Tabs';
import FilterBar, { type FilterState } from '../../components/common/FilterBar';
import {
    digiposTAPSummary,
    digiposSFSummary,
    sellThruDigiposOutlets,
} from '../../services/mock/sellThruData';
import {
    PERDANA_PRODUCTS,
    VOUCHER_BRANDS,
    VOUCHER_VALIDITIES,
    VALIDITY_LABELS,
    type SummaryRow,
    type OutletSellThruData,
    type SellThruMetric,
} from '../../types/sellthru';
import { exportDetailOutlet } from '../../utils/excelExport';
import { analyzeSummaryData } from '../../utils/sellThruAnalytics';
import { SellThruSummaryCard } from '../../components/sell-thru/SmartSummaryCard';

// ===========================================
// PROGRESS BAR COMPONENT
// ===========================================
const ProgressBar = memo(({ value }: { value: number }) => {
    const color = value >= 100 ? 'bg-green-500' : value >= 80 ? 'bg-yellow-500' : 'bg-red-500';
    return (
        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div className={`h-full ${color} transition-all`} style={{ width: `${Math.min(value, 100)}%` }} />
        </div>
    );
});

// ===========================================
// METRIC CELL COMPONENT
// ===========================================
const MetricCell = memo(({ metric, outletAktif, ratePjp }: {
    metric: SellThruMetric; outletAktif?: number; ratePjp?: number;
}) => {
    if (!metric) return null;

    return (
        <>
            {outletAktif !== undefined && (
                <>
                    <td className="p-1 text-center text-[9px] border-l bg-blue-50">
                        <span className="font-semibold text-blue-700">{outletAktif}</span>
                    </td>
                    <td className="p-1 text-center text-[9px] bg-blue-50">
                        <span className={`px-1 py-0.5 rounded text-[8px] font-bold ${ratePjp! >= 80 ? 'bg-green-100 text-green-700' : ratePjp! >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                            {Math.round(ratePjp!)}%
                        </span>
                    </td>
                </>
            )}
            <td className="p-1 text-center text-white border-l">{metric.target}</td>
            <td className="p-1 text-center font-semibold text-blue-700">{metric.actual}</td>
            <td className="p-1 text-center">
                <div className="flex flex-col gap-0.5">
                    <span className={`text-[9px] font-semibold ${metric.achievement_pct >= 100 ? 'text-green-600' : metric.achievement_pct >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {Math.round(metric.achievement_pct)}%
                    </span>
                    <ProgressBar value={metric.achievement_pct} />
                </div>
            </td>
            <td className={`p-1 text-center ${metric.gap >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {metric.gap > 0 ? '+' : ''}{metric.gap}
            </td>
            <td className="p-1 text-center text-gray-500 bg-amber-50">{metric.prev_month}</td>
            <td className={`p-1 text-center bg-amber-50 ${metric.mom_growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {metric.mom_growth > 0 ? '+' : ''}{Math.round(metric.mom_growth)}%
            </td>
            <td className={`p-1 text-center bg-amber-50 ${metric.gap_mom >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {metric.gap_mom > 0 ? '+' : ''}{metric.gap_mom}
            </td>
        </>
    );
});

// ===========================================
// SUMMARY TABLE COMPONENT
// ===========================================
interface SummaryTableProps { data: SummaryRow[]; title: string; icon: React.ReactNode; mode: 'perdana' | 'voucher'; }

const SummaryTable: React.FC<SummaryTableProps> = ({ data, title, icon, mode }) => {
    const [expanded, setExpanded] = useState(true);

    const products = mode === 'perdana'
        ? PERDANA_PRODUCTS.map(p => ({ id: p.id, name: p.name, brand: p.brand }))
        : VOUCHER_BRANDS.flatMap(brand => VOUCHER_VALIDITIES.map(validity => ({ id: `${brand}_${validity}`, name: VALIDITY_LABELS[validity], brand })));

    const getMetric = (row: SummaryRow, productId: string): SellThruMetric => mode === 'perdana' ? row.perdana[productId] : row.voucher[productId];
    const getOutletAktif = (row: SummaryRow, productId: string): number => mode === 'perdana' ? row.perdana_outlet_aktif[productId] || 0 : row.voucher_outlet_aktif[productId] || 0;
    const getRatePjp = (row: SummaryRow, productId: string): number => mode === 'perdana' ? row.perdana_rate_pjp[productId] || 0 : row.voucher_rate_pjp[productId] || 0;

    const getAggregatedMetric = (row: SummaryRow, productIds: string[]): SellThruMetric => {
        const metrics = productIds.map(id => getMetric(row, id)).filter(Boolean);
        if (metrics.length === 0) return { target: 0, actual: 0, achievement_pct: 0, gap: 0, prev_month: 0, mom_growth: 0, gap_mom: 0 };

        const target = metrics.reduce((sum, m) => sum + m.target, 0);
        const actual = metrics.reduce((sum, m) => sum + m.actual, 0);
        const prev_month = metrics.reduce((sum, m) => sum + m.prev_month, 0);
        const gap = actual - target;
        const achievement_pct = target > 0 ? (actual / target) * 100 : 0;
        const mom_growth = prev_month > 0 ? ((actual - prev_month) / prev_month) * 100 : 0;
        const gap_mom = actual - prev_month;

        return { target, actual, achievement_pct, gap, prev_month, mom_growth, gap_mom };
    };

    const aggregatedGroups = [
        { name: 'Total', ids: products.map(p => p.id), bg: 'bg-gray-100' },
        { name: 'Total Simpati', ids: products.filter(p => p.brand === 'simpati').map(p => p.id), bg: 'bg-red-50' },
        { name: 'Total byU', ids: products.filter(p => p.brand === 'byu').map(p => p.id), bg: 'bg-purple-50' },
    ];

    const metricColSpan = 9;

    return (
        <div className="border border-gray-200 rounded-lg mb-4 overflow-hidden">
            <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-2">
                    {icon}
                    <span className="font-semibold text-gray-800 text-sm">{title}</span>
                    <span className="text-xs text-gray-500">({data.length} items)</span>
                </div>
                {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {expanded && (
                <div className="overflow-x-auto max-h-[400px]">
                    <table className="data-table data-table-compact whitespace-nowrap">
                        <thead className="sticky top-0 z-20 bg-[#2c4a6a]">
                            {mode === 'voucher' && (
                                <tr>
                                    <th className="p-2 border-b border-r min-w-[120px] sticky left-0 bg-gray-100 z-30" rowSpan={3}>Nama</th>
                                    <th className="p-2 border-b border-r text-center" rowSpan={3}>PJP</th>
                                    {/* Aggregated Columns Headers */}
                                    {aggregatedGroups.map(group => (
                                        <th key={group.name} colSpan={7} className={`p-2 border-b border-l-2 text-center border-gray-300 font-bold ${group.bg}`} rowSpan={2}>{group.name}</th>
                                    ))}
                                    {VOUCHER_BRANDS.map(brand => (
                                        <th key={brand} colSpan={VOUCHER_VALIDITIES.length * metricColSpan}
                                            className={`p-2 border-b border-l-2 text-center ${brand === 'simpati' ? 'bg-red-100 text-red-800' : 'bg-purple-100 text-purple-800'}`}>
                                            {brand === 'simpati' ? 'SIMPATI' : 'byU'}
                                        </th>
                                    ))}
                                </tr>
                            )}
                            <tr className="bg-[#3d5f85]">
                                {mode === 'perdana' && <>
                                    <th className="p-2 border-b border-r sticky left-0 bg-gray-50 z-30" rowSpan={2}>Nama</th>
                                    <th className="p-2 border-b border-r text-center" rowSpan={2}>PJP</th>
                                    {/* Aggregated Columns Headers for Perdana */}
                                    {aggregatedGroups.map(group => (
                                        <th key={group.name} colSpan={7} className={`p-2 border-b border-l-2 text-center border-gray-300 font-bold ${group.bg}`}>{group.name}</th>
                                    ))}
                                </>}
                                {products.map((product, idx) => (
                                    <th key={product.id} colSpan={metricColSpan}
                                        className={`p-2 border-b text-center ${idx === 0 || (mode === 'voucher' && idx === VOUCHER_VALIDITIES.length) ? 'border-l-2' : 'border-l'} ${product.brand === 'simpati' ? 'bg-red-50' : 'bg-purple-50'}`}>
                                        {product.name}
                                    </th>
                                ))}
                            </tr>
                            <tr className="bg-white text-gray-500 text-[9px]">
                                {/* Aggregated Metric Headers */}
                                {aggregatedGroups.map((group) => (
                                    <React.Fragment key={group.name}>
                                        <th className={`p-1 border-b text-center border-l-2 border-gray-300 ${group.bg}`}>Tgt</th>
                                        <th className={`p-1 border-b text-center ${group.bg}`}>Act</th>
                                        <th className={`p-1 border-b text-center ${group.bg}`}>Ach%</th>
                                        <th className={`p-1 border-b text-center ${group.bg}`}>Gap</th>
                                        <th className={`p-1 border-b text-center ${group.bg}`}>M-1</th>
                                        <th className={`p-1 border-b text-center ${group.bg}`}>MoM</th>
                                        <th className={`p-1 border-b text-center border-r-2 border-gray-300 ${group.bg}`}>G.MoM</th>
                                    </React.Fragment>
                                ))}
                                {products.map((product, idx) => (
                                    <React.Fragment key={product.id}>
                                        <th className={`p-1 border-b text-center bg-blue-50 ${idx === 0 || (mode === 'voucher' && idx === VOUCHER_VALIDITIES.length) ? 'border-l-2' : 'border-l'}`}>Aktif</th>
                                        <th className="p-1 border-b text-center bg-blue-50">Rate</th>
                                        <th className="p-1 border-b text-center border-l">Tgt</th>
                                        <th className="p-1 border-b text-center">Act</th>
                                        <th className="p-1 border-b text-center">Ach%</th>
                                        <th className="p-1 border-b text-center">Gap</th>
                                        <th className="p-1 border-b text-center bg-amber-50">M-1</th>
                                        <th className="p-1 border-b text-center bg-amber-50">MoM</th>
                                        <th className="p-1 border-b text-center bg-amber-50">G.MoM</th>
                                    </React.Fragment>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map(row => (
                                <tr key={row.name} className="hover:bg-gray-50 border-b">
                                    <td className="p-2 font-medium border-r sticky left-0 bg-white z-10">{row.name}</td>
                                    <td className="p-2 text-center border-r font-semibold">{row.outlet_total}</td>
                                    {/* Aggregated Cells */}
                                    {aggregatedGroups.map(group => {
                                        const m = getAggregatedMetric(row, group.ids);
                                        return (
                                            <React.Fragment key={group.name}>
                                                <td className={`p-1 text-center border-l-2 border-gray-300 ${group.bg}`}>{m.target}</td>
                                                <td className={`p-1 text-center font-semibold text-blue-700 ${group.bg}`}>{m.actual}</td>
                                                <td className={`p-1 text-center ${group.bg}`}>
                                                    <span className={`text-[9px] font-bold ${m.achievement_pct >= 100 ? 'text-green-600' : m.achievement_pct >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>{Math.round(m.achievement_pct)}%</span>
                                                </td>
                                                <td className={`p-1 text-center ${m.gap >= 0 ? 'text-green-600' : 'text-red-600'} ${group.bg}`}>{m.gap > 0 ? '+' : ''}{m.gap}</td>
                                                <td className={`p-1 text-center text-gray-400 ${group.bg}`}>{m.prev_month}</td>
                                                <td className={`p-1 text-center ${m.mom_growth >= 0 ? 'text-green-600' : 'text-red-600'} ${group.bg}`}>{Math.round(m.mom_growth)}%</td>
                                                <td className={`p-1 text-center border-r-2 border-gray-300 ${m.gap_mom >= 0 ? 'text-green-600' : 'text-red-600'} ${group.bg}`}>{m.gap_mom > 0 ? '+' : ''}{m.gap_mom}</td>
                                            </React.Fragment>
                                        );
                                    })}
                                    {products.map(product => (
                                        <MetricCell key={product.id} metric={getMetric(row, product.id)}
                                            outletAktif={getOutletAktif(row, product.id)} ratePjp={getRatePjp(row, product.id)} />
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

// ===========================================
// DETAIL TABLE COMPONENT
// ===========================================
interface DetailTableProps { data: OutletSellThruData[]; mode: 'perdana' | 'voucher'; }

const DetailTable: React.FC<DetailTableProps> = ({ data, mode }) => {
    const [expanded, setExpanded] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredData = useMemo(() => {
        if (!searchQuery) return data;
        const q = searchQuery.toLowerCase();
        return data.filter(o => o.outlet_name.toLowerCase().includes(q) || o.id_digipos.toLowerCase().includes(q) || o.salesforce_name.toLowerCase().includes(q) || o.rs_number.toLowerCase().includes(q));
    }, [data, searchQuery]);

    const products = mode === 'perdana'
        ? PERDANA_PRODUCTS.map(p => ({ id: p.id, name: p.name, brand: p.brand }))
        : VOUCHER_BRANDS.flatMap(brand => VOUCHER_VALIDITIES.map(validity => ({ id: `${brand}_${validity}`, name: VALIDITY_LABELS[validity], brand })));

    const getMetric = (row: OutletSellThruData, productId: string): SellThruMetric => mode === 'perdana' ? row.perdana[productId] : row.voucher[productId];

    const getFisikBadge = (status: string) => {
        const colors = { exist: 'bg-green-100 text-green-700', closed: 'bg-red-100 text-red-700', relocated: 'bg-yellow-100 text-yellow-700' };
        const labels = { exist: 'Ada', closed: 'Tutup', relocated: 'Pindah' };
        return <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${colors[status as keyof typeof colors] || 'bg-gray-100'}`}>{labels[status as keyof typeof labels] || status}</span>;
    };

    const getFlagBadge = (flag: string) => {
        const colors: Record<string, string> = {
            'Retail': 'bg-blue-100 text-blue-700',
            'Pareto Retail': 'bg-purple-100 text-purple-700',
            'Big Pareto': 'bg-indigo-100 text-indigo-700',
            'Office': 'bg-gray-100 text-gray-700',
            'D2C': 'bg-orange-100 text-orange-700',
        };
        return (
            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${colors[flag] || 'bg-gray-100'}`}>
                {flag}
            </span>
        );
    };

    const getAggregatedMetric = (row: OutletSellThruData, productIds: string[]): SellThruMetric => {
        const metrics = productIds.map(id => getMetric(row, id)).filter(Boolean);
        if (metrics.length === 0) return { target: 0, actual: 0, achievement_pct: 0, gap: 0, prev_month: 0, mom_growth: 0, gap_mom: 0 };

        const target = metrics.reduce((sum, m) => sum + m.target, 0);
        const actual = metrics.reduce((sum, m) => sum + m.actual, 0);
        const prev_month = metrics.reduce((sum, m) => sum + m.prev_month, 0);
        const gap = actual - target;
        const achievement_pct = target > 0 ? (actual / target) * 100 : 0;
        const mom_growth = prev_month > 0 ? ((actual - prev_month) / prev_month) * 100 : 0;
        const gap_mom = actual - prev_month;

        return { target, actual, achievement_pct, gap, prev_month, mom_growth, gap_mom };
    };

    const aggregatedGroups = [
        { name: 'Total', ids: products.map(p => p.id), bg: 'bg-gray-100' },
        { name: 'Total Simpati', ids: products.filter(p => p.brand === 'simpati').map(p => p.id), bg: 'bg-red-50' },
        { name: 'Total byU', ids: products.filter(p => p.brand === 'byu').map(p => p.id), bg: 'bg-purple-50' },
    ];

    const metricColSpan = 6;

    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-2">
                    <Store size={16} className="text-orange-600" />
                    <span className="font-semibold text-gray-800 text-sm">Detail Outlet</span>
                    <span className="text-xs text-gray-500">({data.length} outlets)</span>
                </div>
                {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {expanded && (
                <>
                    <div className="p-3 border-b bg-white flex items-center justify-between gap-4">
                        <input type="text" placeholder="Cari ID Digipos, Nomor RS, outlet, salesforce..."
                            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                            className="flex-1 max-w-md px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                        <button
                            onClick={() => exportDetailOutlet(filteredData as unknown as Record<string, unknown>[], products, mode, 'digipos')}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors shadow-sm"
                        >
                            <Download size={16} />
                            Export Excel
                        </button>
                    </div>
                    <div className="overflow-x-auto max-h-[500px]">
                        <table className="data-table data-table-compact whitespace-nowrap">
                            <thead className="sticky top-0 z-20 bg-[#2c4a6a]">
                                {/* Row 1: Brand Groups (only for voucher mode) */}
                                {mode === 'voucher' && (
                                    <tr>
                                        <th className="p-1.5 border-b text-center sticky left-0 bg-gray-100 z-30 min-w-[70px]" rowSpan={3}>ID Digipos</th>
                                        <th className="p-1.5 border-b text-center sticky left-[70px] bg-gray-100 z-30 min-w-[70px]" rowSpan={3}>No RS</th>
                                        <th className="p-1.5 border-b text-center sticky left-[140px] bg-gray-100 z-30 min-w-[120px]" rowSpan={3}>Outlet</th>
                                        <th className="p-1.5 border-b text-center sticky left-[260px] bg-gray-100 z-30 min-w-[90px]" rowSpan={3}>SF</th>
                                        <th className="p-1.5 border-b text-center min-w-[70px]" rowSpan={3}>TAP</th>
                                        <th className="p-1.5 border-b text-center min-w-[80px]" rowSpan={3}>Kab.</th>
                                        <th className="p-1.5 border-b text-center min-w-[70px]" rowSpan={3}>Kec.</th>
                                        <th className="p-1.5 border-b text-center min-w-[45px]" rowSpan={3}>Fisik</th>
                                        <th className="p-1.5 border-b text-center min-w-[45px]" rowSpan={3}>PJP</th>
                                        <th className="p-1.5 border-b text-center min-w-[60px]" rowSpan={3}>Flag</th>
                                        <th className="p-1.5 border-b text-center min-w-[55px]" rowSpan={3}>Lokasi</th>
                                        {/* Aggregated Columns Headers */}
                                        {aggregatedGroups.map(group => (
                                            <th key={group.name} colSpan={6} className={`p-1.5 border-b border-l-2 text-center border-gray-300 font-bold ${group.bg}`} rowSpan={2}>{group.name}</th>
                                        ))}
                                        {VOUCHER_BRANDS.map(brand => (
                                            <th key={brand} colSpan={VOUCHER_VALIDITIES.length * metricColSpan}
                                                className={`p-1.5 border-b border-l-2 text-center ${brand === 'simpati' ? 'bg-red-100' : 'bg-purple-100'}`}>
                                                {brand === 'simpati' ? 'SIMPATI' : 'byU'}
                                            </th>
                                        ))}
                                    </tr>
                                )}
                                {/* Row for Product Names */}
                                <tr className={mode === 'voucher' ? 'bg-gray-50' : 'bg-gray-100'}>
                                    {mode === 'perdana' && (
                                        <>
                                            <th className="p-1.5 border-b text-center sticky left-0 bg-gray-100 z-30 min-w-[70px]" rowSpan={2}>ID Digipos</th>
                                            <th className="p-1.5 border-b text-center sticky left-[70px] bg-gray-100 z-30 min-w-[70px]" rowSpan={2}>No RS</th>
                                            <th className="p-1.5 border-b text-center sticky left-[140px] bg-gray-100 z-30 min-w-[120px]" rowSpan={2}>Outlet</th>
                                            <th className="p-1.5 border-b text-center sticky left-[260px] bg-gray-100 z-30 min-w-[90px]" rowSpan={2}>SF</th>
                                            <th className="p-1.5 border-b text-center min-w-[70px]" rowSpan={2}>TAP</th>
                                            <th className="p-1.5 border-b text-center min-w-[80px]" rowSpan={2}>Kab.</th>
                                            <th className="p-1.5 border-b text-center min-w-[70px]" rowSpan={2}>Kec.</th>
                                            <th className="p-1.5 border-b text-center min-w-[45px]" rowSpan={2}>Fisik</th>
                                            <th className="p-1.5 border-b text-center min-w-[45px]" rowSpan={2}>PJP</th>
                                            <th className="p-1.5 border-b text-center min-w-[60px]" rowSpan={2}>Flag</th>
                                            <th className="p-1.5 border-b text-center min-w-[55px]" rowSpan={2}>Lokasi</th>
                                            {/* Aggregated Columns Headers for Perdana */}
                                            {aggregatedGroups.map(group => (
                                                <th key={group.name} colSpan={6} className={`p-1.5 border-b border-l-2 text-center border-gray-300 font-bold ${group.bg}`}>{group.name}</th>
                                            ))}
                                        </>
                                    )}
                                    {products.map((product, idx) => (
                                        <th key={product.id} colSpan={metricColSpan}
                                            className={`p-1 border-b text-center ${idx === 0 || (mode === 'voucher' && idx === VOUCHER_VALIDITIES.length) ? 'border-l-2' : 'border-l'} ${product.brand === 'simpati' ? 'bg-red-50' : 'bg-purple-50'}`}>
                                            {product.name}
                                        </th>
                                    ))}
                                </tr>
                                {/* Row for Metric Headers */}
                                <tr className="bg-white text-[8px] text-gray-500">
                                    {/* Aggregated Metric Headers */}
                                    {aggregatedGroups.map((group) => (
                                        <React.Fragment key={group.name}>
                                            <th className={`p-1 border-b text-center border-l-2 border-gray-300 ${group.bg}`}>Tgt</th>
                                            <th className={`p-1 border-b text-center ${group.bg}`}>Act</th>
                                            <th className={`p-1 border-b text-center ${group.bg}`}>Ach%</th>
                                            <th className={`p-1 border-b text-center ${group.bg}`}>Gap</th>
                                            <th className={`p-1 border-b text-center ${group.bg}`}>M-1</th>
                                            <th className={`p-1 border-b text-center border-r-2 border-gray-300 ${group.bg}`}>MoM</th>
                                        </React.Fragment>
                                    ))}
                                    {products.map((product, idx) => (
                                        <React.Fragment key={product.id}>
                                            <th className={`p-1 border-b text-center ${idx === 0 || (mode === 'voucher' && idx === VOUCHER_VALIDITIES.length) ? 'border-l-2' : 'border-l'}`}>Tgt</th>
                                            <th className="p-1 border-b text-center">Act</th>
                                            <th className="p-1 border-b text-center">Ach%</th>
                                            <th className="p-1 border-b text-center">Gap</th>
                                            <th className="p-1 border-b text-center bg-amber-50">M-1</th>
                                            <th className="p-1 border-b text-center bg-amber-50">MoM</th>
                                        </React.Fragment>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.slice(0, 150).map(row => (
                                    <tr key={row.outlet_id} className="hover:bg-gray-50 border-b">
                                        <td className="p-1.5 font-mono text-[8px] sticky left-0 bg-white border-r">{row.id_digipos}</td>
                                        <td className={`p-1.5 font-mono text-[8px] sticky left-[70px] bg-white border-r ${/^\d{8,12}$/.test(row.rs_number) ? '' : 'text-red-500'}`} title={/^\d{8,12}$/.test(row.rs_number) ? '' : 'Format harus 8-12 digit'}>
                                            {row.rs_number}
                                        </td>
                                        <td className="p-1.5 font-medium sticky left-[140px] bg-white border-r truncate max-w-[120px]" title={row.outlet_name}>{row.outlet_name}</td>
                                        <td className="p-1.5 text-gray-700 sticky left-[260px] bg-white border-r truncate">{row.salesforce_name}</td>
                                        <td className="p-1.5 text-gray-500 border-r">{row.tap_name}</td>
                                        <td className="p-1.5 text-gray-500 border-r text-[8px]">{row.kabupaten}</td>
                                        <td className="p-1.5 text-gray-500 border-r text-[8px]">{row.kecamatan}</td>
                                        <td className="p-1.5 text-center border-r">{getFisikBadge(row.fisik_status)}</td>
                                        <td className="p-1.5 text-center border-r text-[8px]">{row.hari_pjp}</td>
                                        <td className="p-1.5 text-center border-r">{getFlagBadge(row.flag)}</td>
                                        <td className="p-1.5 text-center border-r">
                                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-medium ${row.lokasi_outlet === 'Ring 1' ? 'bg-green-100 text-green-700' :
                                                row.lokasi_outlet === 'Ring 2' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-gray-100 text-gray-700'
                                                }`}>{row.lokasi_outlet}</span>
                                        </td>
                                        {/* Aggregated Cells */}
                                        {aggregatedGroups.map(group => {
                                            const m = getAggregatedMetric(row, group.ids);
                                            return (
                                                <React.Fragment key={group.name}>
                                                    <td className={`p-1 text-center border-l-2 border-gray-300 ${group.bg}`}>{m.target}</td>
                                                    <td className={`p-1 text-center font-semibold text-blue-700 ${group.bg}`}>{m.actual}</td>
                                                    <td className={`p-1 text-center ${group.bg}`}>
                                                        <span className={`text-[9px] font-bold ${m.achievement_pct >= 100 ? 'text-green-600' : m.achievement_pct >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>{Math.round(m.achievement_pct)}%</span>
                                                    </td>
                                                    <td className={`p-1 text-center ${m.gap >= 0 ? 'text-green-600' : 'text-red-600'} ${group.bg}`}>{m.gap > 0 ? '+' : ''}{m.gap}</td>
                                                    <td className={`p-1 text-center text-gray-400 ${group.bg}`}>{m.prev_month}</td>
                                                    <td className={`p-1 text-center border-r-2 border-gray-300 ${m.mom_growth >= 0 ? 'text-green-600' : 'text-red-600'} ${group.bg}`}>{Math.round(m.mom_growth)}%</td>
                                                </React.Fragment>
                                            );
                                        })}
                                        {products.map((product, idx) => {
                                            const m = getMetric(row, product.id);
                                            if (!m) return <td key={product.id} colSpan={metricColSpan} className="text-center text-gray-300">-</td>;
                                            return (
                                                <React.Fragment key={product.id}>
                                                    <td className={`p-1 text-center text-gray-500 ${idx === 0 || (mode === 'voucher' && idx === VOUCHER_VALIDITIES.length) ? 'border-l-2' : 'border-l'}`}>{m.target}</td>
                                                    <td className="p-1 text-center font-semibold text-blue-700">{m.actual}</td>
                                                    <td className="p-1 text-center">
                                                        <span className={`text-[8px] font-bold ${m.achievement_pct >= 100 ? 'text-green-600' : m.achievement_pct >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>
                                                            {Math.round(m.achievement_pct)}%
                                                        </span>
                                                    </td>
                                                    <td className={`p-1 text-center ${m.gap >= 0 ? 'text-green-600' : 'text-red-600'}`}>{m.gap > 0 ? '+' : ''}{m.gap}</td>
                                                    <td className="p-1 text-center text-gray-400 bg-amber-50">{m.prev_month}</td>
                                                    <td className={`p-1 text-center bg-amber-50 ${m.mom_growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>{Math.round(m.mom_growth)}%</td>
                                                </React.Fragment>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

// ===========================================
// MAIN PAGE COMPONENT
// ===========================================
const STDigiposPage: React.FC = () => {
    const [filters, setFilters] = useState<FilterState>({
        date: { start: '', end: '' }, month: new Date().getMonth() + 1, year: new Date().getFullYear(), tap: [], salesforce: [], kabupaten: [], flag: [],
    });
    const dataUpdateTime = new Date().toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    // Cascading Filter Logic
    const availableTapOptions = useMemo(() => {
        const taps = new Set<string>();
        // If Salesforce selected, filter TAPs. Else show all.
        const sourceData = filters.salesforce.length > 0
            ? sellThruDigiposOutlets.filter(o => filters.salesforce.includes(o.salesforce_name))
            : sellThruDigiposOutlets;

        sourceData.forEach(o => taps.add(o.tap_name));
        return Array.from(taps).sort().map(tap => ({ value: tap, label: tap }));
    }, [filters.salesforce]);

    const availableSfOptions = useMemo(() => {
        const sfs = new Set<string>();
        // If TAP selected, filter SFs. Else show all.
        const sourceData = filters.tap.length > 0
            ? sellThruDigiposOutlets.filter(o => filters.tap.includes(o.tap_name))
            : sellThruDigiposOutlets;

        sourceData.forEach(o => sfs.add(o.salesforce_name));
        return Array.from(sfs).sort().map(sf => ({ value: sf, label: sf }));
    }, [filters.tap]);

    // Extract Location Options
    const locationOptions = useMemo(() => {
        const locs = new Set<string>();
        sellThruDigiposOutlets.forEach(o => { if (o.lokasi_outlet) locs.add(o.lokasi_outlet); });
        return Array.from(locs).sort().map(l => ({ value: l, label: l }));
    }, []);

    const filteredTAPSummary = useMemo(() => {
        if (!filters.tap || filters.tap.length === 0) return digiposTAPSummary;
        return digiposTAPSummary.filter(t => filters.tap!.includes(t.name));
    }, [filters.tap]);

    const filteredSFSummary = useMemo(() => {
        if (!filters.salesforce || filters.salesforce.length === 0) return digiposSFSummary;
        return digiposSFSummary.filter(s => filters.salesforce!.includes(s.name));
    }, [filters.salesforce]);

    const filteredOutlets = useMemo(() => {
        let result = sellThruDigiposOutlets;
        if (filters.tap && filters.tap.length > 0) result = result.filter(o => filters.tap!.includes(o.tap_name));
        if (filters.salesforce && filters.salesforce.length > 0) result = result.filter(o => filters.salesforce!.includes(o.salesforce_name));
        if (filters.pjpStatus && filters.pjpStatus.length > 0) result = result.filter(o => filters.pjpStatus!.includes(o.lokasi_outlet));
        return result;
    }, [filters.tap, filters.salesforce, filters.pjpStatus]);


    return (
        <div className="p-6 animate-fade-in">
            <Header title="Sell Thru Digipos" subtitle="Tracking transaksi digital dari Digipos" />

            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                <Clock size={14} />
                <span>Data diperbarui: <span className="font-medium text-gray-700">{dataUpdateTime}</span></span>
                <span className="ml-4 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs flex items-center gap-1">
                    <Smartphone size={12} />
                    Sumber: App Digipos Aja!
                </span>
            </div>


            <FilterBar
                onFilterChange={setFilters}
                useMonthPicker={true}
                className="mt-4"
                showKabupaten
                showFlag
                showPJPStatus
                kabupatenOptions={['Kota Cirebon', 'Kab. Cirebon', 'Kab. Kuningan', 'Kab. Majalengka', 'Kab. Indramayu'].map(k => ({ value: k, label: k }))}
                flagOptions={['Retail', 'Pareto Retail', 'Big Pareto', 'Office', 'D2C'].map(f => ({ value: f, label: f }))}
                pjpOptions={locationOptions}
                tapOptions={availableTapOptions}
                salesforceOptions={availableSfOptions}
            />

            <Card padding="none" className="mt-4">
                <Tabs defaultValue="perdana">
                    <TabList>
                        <Tab value="perdana">Perdana</Tab>
                        <Tab value="voucher">Voucher</Tab>
                    </TabList>

                    <TabPanel value="perdana" className="p-4">
                        <SellThruSummaryCard
                            stats={analyzeSummaryData(filteredTAPSummary, 'perdana')}
                            mode="perdana"
                            source="digipos"
                        />
                        <SummaryTable data={filteredTAPSummary} title="Summary per TAP" icon={<MapPin size={16} className="text-blue-600" />} mode="perdana" />
                        <SummaryTable data={filteredSFSummary} title="Summary per Salesforce" icon={<User size={16} className="text-green-600" />} mode="perdana" />
                        <DetailTable data={filteredOutlets} mode="perdana" />
                    </TabPanel>

                    <TabPanel value="voucher" className="p-4">
                        <SellThruSummaryCard
                            stats={analyzeSummaryData(filteredTAPSummary, 'voucher')}
                            mode="voucher"
                            source="digipos"
                        />
                        <SummaryTable data={filteredTAPSummary} title="Summary per TAP" icon={<MapPin size={16} className="text-blue-600" />} mode="voucher" />
                        <SummaryTable data={filteredSFSummary} title="Summary per Salesforce" icon={<User size={16} className="text-green-600" />} mode="voucher" />
                        <DetailTable data={filteredOutlets} mode="voucher" />
                    </TabPanel>
                </Tabs>
            </Card>
        </div >
    );
};

export default STDigiposPage;
