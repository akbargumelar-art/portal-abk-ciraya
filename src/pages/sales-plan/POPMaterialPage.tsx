/**
 * POP Material Page
 * 
 * Shows outlet data with installed POP materials (branding, poster, layar toko,
 * papan harga, flyer, thinplate, sticker etalase, etc.)
 * Related to Monitoring POP page
 */

import React, { useMemo, useState, useEffect } from 'react';
import {
    Search,
    Filter,
    X,
    Image,
    CheckCircle,
    XCircle,
    Camera,
    LayoutDashboard,
    Table as TableIcon,
    MapPin,
    User,
    ChevronDown,
    ChevronRight,
    ChevronLeft,
} from 'lucide-react';
import { Tabs, TabList, Tab, TabPanel } from '../../components/ui/Tabs';
import Header from '../../components/layout/Header';
import { Card, Input, Select, Badge } from '../../components/ui/index';
import { useRoleBasedOutlets } from '../../hooks/useRoleBasedData';
import { MOCK_POP_RECORDS } from '../../services/mock/popData';

// Brand Options
const BRAND_OPTIONS = [
    'Telkomsel',
    'byU',
    'Indosat',
    'XL',
    'Axis',
    'Smartfren',
    'Three',
    'BriLink',
    'Netral' // For non-exclusive or general branding
];

// POP Material Categories
const POP_MATERIAL_TYPES = [
    { value: 'branding_full', label: 'Full Branding' },
    { value: 'branding_partial', label: 'Branding Sebagian' },
    { value: 'poster', label: 'Poster' },
    { value: 'layar_toko', label: 'Layar Toko' },
    { value: 'papan_harga', label: 'Papan Harga' },
    { value: 'flyer', label: 'Flyer' },
    { value: 'thinplate', label: 'Thinplate' },
    { value: 'sticker_etalase', label: 'Sticker Etalase' },
    { value: 'neon_box', label: 'Neon Box' },
    { value: 'banner', label: 'Banner' },
    { value: 'x_banner', label: 'X-Banner' },
    { value: 'spanduk', label: 'Spanduk' },
];

// Lokasi Options
const LOKASI_OPTIONS = ['Ring 1', 'Ring 2', 'Ring 3'];

// Flag Options
const FLAG_OPTIONS = ['Office', 'D2C', 'Retail', 'Pareto Retail', 'Big Pareto'];

interface OutletPOPStatus {
    outletId: string;
    outletName: string;
    salesforce: string;
    tap: string;
    kabupaten: string;
    kecamatan: string;
    address: string;
    lokasi: string;  // Ring 1 / Ring 2 / Ring 3
    flag: string;    // Office / D2C / Retail / Pareto Retail / Big Pareto
    popMaterials: {
        type: string;
        installed: boolean;
        brand?: string;
        lastChecked?: string;
        proofPhotoUrl?: string;
    }[];
    totalInstalled: number;
    installRate: number;
}

interface POPSummaryRow {
    name: string;
    count: number;
    materials: { [key: string]: { installed: number; total: number; pct: number } };
    avgInstallRate: number;
    fullCoverageCount: number; // Outlets with >= 80%
}

const ImageModal = ({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) => {
    if (!src) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
            <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-lg p-2" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-md">
                    <X size={20} />
                </button>
                <img src={src} alt={alt} className="max-w-full max-h-[85vh] object-contain rounded" />
                <p className="mt-2 text-center text-sm font-medium text-gray-700">{alt}</p>
            </div>
        </div>
    );
};

const POPMaterialPage: React.FC = () => {
    const outlets = useRoleBasedOutlets();
    const popRecords = MOCK_POP_RECORDS;

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [tapFilter, setTapFilter] = useState('');
    const [salesforceFilter, setSalesforceFilter] = useState('');
    const [popTypeFilter, setPopTypeFilter] = useState('');
    const [lokasiFilter, setLokasiFilter] = useState('');

    // UI State
    const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string } | null>(null);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);

    // Reset page when filters change
    useEffect(() => {
        setPage(1);
    }, [tapFilter, salesforceFilter, searchTerm, popTypeFilter, lokasiFilter]);
    const [tapExpanded, setTapExpanded] = useState(true);
    const [sfExpanded, setSfExpanded] = useState(true);

    // Build outlet POP status data
    const outletPOPData = useMemo((): OutletPOPStatus[] => {
        // Optimize: Create a Map of POP records by Outlet ID
        const recordsByOutlet = new Map<string, typeof popRecords>();
        popRecords.forEach(r => {
            if (!recordsByOutlet.has(r.outletId)) {
                recordsByOutlet.set(r.outletId, []);
            }
            recordsByOutlet.get(r.outletId)?.push(r);
        });

        return outlets.map(outlet => {
            // Optimize: Direct lookup instead of filter
            const outletRecords = recordsByOutlet.get(outlet.id) || [];

            // Create POP material status for each type
            const popMaterials = POP_MATERIAL_TYPES.map(type => {
                // Special handling for Mock Branding
                if (type.value.includes('branding')) {
                    // Deterministic random based on outlet ID char code sum
                    const seed = outlet.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                    const isFull = type.value === 'branding_full';

                    // Simulate installation probability (30% chance for full, 40% for partial, exclusive)
                    // If Full Branding is installed, simulate Partial as NOT installed to avoid logical clash if desired, 
                    // or allow both. Here we treat them as independent data points for simulation.

                    let installed = false;
                    let brand = undefined;

                    // deterministic psuedo-random
                    const rand = Math.sin(seed + (isFull ? 0 : 100)) * 10000;
                    const randVal = rand - Math.floor(rand);

                    if (isFull && randVal > 0.7) {
                        installed = true;
                    } else if (!isFull && randVal > 0.6) {
                        installed = true;
                    }

                    if (installed) {
                        // Assign random brand
                        const brandIndex = Math.floor(randVal * 100) % BRAND_OPTIONS.length;
                        brand = BRAND_OPTIONS[brandIndex];
                    }

                    return {
                        type: type.value,
                        installed,
                        brand,
                        lastChecked: new Date().toISOString(), // Mock dates
                        proofPhotoUrl: installed ? `https://picsum.photos/seed/${outlet.id}_${type.value}/400/300` : undefined
                    };
                }

                // Standard matching for other types
                const record = outletRecords.find(r =>
                    r.itemCategory === type.value ||
                    r.itemName.toLowerCase().includes(type.label.toLowerCase())
                );
                return {
                    type: type.value,
                    installed: record?.status === 'installed',
                    lastChecked: record?.lastCheckedAt,
                    proofPhotoUrl: record?.proofPhotoUrl,
                };
            });

            const totalInstalled = popMaterials.filter(m => m.installed).length;
            const installRate = (totalInstalled / POP_MATERIAL_TYPES.length) * 100;

            // Generate deterministic lokasi and flag based on outlet ID
            const idSum = outlet.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const lokasiIndex = idSum % LOKASI_OPTIONS.length;
            const flagIndex = (idSum * 7) % FLAG_OPTIONS.length;

            return {
                outletId: outlet.id,
                outletName: outlet.name,
                salesforce: outlet.salesforceName,
                tap: outlet.tap,
                kabupaten: outlet.kabupaten,
                kecamatan: outlet.kecamatan,
                address: `${outlet.kecamatan}, ${outlet.kabupaten}`,
                lokasi: LOKASI_OPTIONS[lokasiIndex],
                flag: FLAG_OPTIONS[flagIndex],
                popMaterials,
                totalInstalled,
                installRate,
            };
        });
    }, [outlets, popRecords]);

    // Filter options (Bidirectional)
    const tapOptions = useMemo(() => {
        // If SF selected, only show TAPs for that SF
        let data = outletPOPData;
        if (salesforceFilter) {
            data = data.filter(o => o.salesforce === salesforceFilter);
        }
        const unique = [...new Set(data.map(o => o.tap))].sort();
        return [{ value: '', label: 'Semua TAP' }, ...unique.map(t => ({ value: t, label: t }))];
    }, [outletPOPData, salesforceFilter]);

    const salesforceOptions = useMemo(() => {
        // If TAP selected, only show SFs for that TAP
        let data = outletPOPData;
        if (tapFilter) {
            data = data.filter(o => o.tap === tapFilter);
        }
        const unique = [...new Set(data.map(o => o.salesforce))].sort();
        return [{ value: '', label: 'Semua Salesforce' }, ...unique.map(s => ({ value: s, label: s }))];
    }, [outletPOPData, tapFilter]);

    // Lokasi filter options
    const lokasiOptions = useMemo(() => {
        return [{ value: '', label: 'Semua Lokasi' }, ...LOKASI_OPTIONS.map(l => ({ value: l, label: l }))];
    }, []);

    // Filtered data
    const filteredData = useMemo(() => {
        return outletPOPData.filter(outlet => {
            if (tapFilter && outlet.tap !== tapFilter) return false;
            if (salesforceFilter && outlet.salesforce !== salesforceFilter) return false;
            if (popTypeFilter && !outlet.popMaterials.find(m => m.type === popTypeFilter)?.installed) return false;
            if (lokasiFilter && outlet.lokasi !== lokasiFilter) return false;

            if (searchTerm) {
                const search = searchTerm.toLowerCase();
                if (!outlet.outletName.toLowerCase().includes(search) &&
                    !outlet.salesforce.toLowerCase().includes(search)) {
                    return false;
                }
            }
            return true;
        });
    }, [outletPOPData, tapFilter, salesforceFilter, searchTerm, popTypeFilter, lokasiFilter]);

    // Pagination
    const totalPages = Math.ceil(filteredData.length / pageSize);
    const paginatedData = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filteredData.slice(start, start + pageSize);
    }, [filteredData, page, pageSize]);

    // Summary stats
    const stats = useMemo(() => {
        const total = filteredData.length;
        const withPOP = filteredData.filter(o => o.totalInstalled > 0).length;
        const fullCoverage = filteredData.filter(o => o.installRate >= 80).length;
        const avgRate = filteredData.length > 0
            ? filteredData.reduce((sum, o) => sum + o.installRate, 0) / filteredData.length
            : 0;
        return { total, withPOP, fullCoverage, avgRate };
    }, [filteredData]);

    // Aggregate Summaries
    const tapSummary = useMemo(() => {
        const groups: { [key: string]: typeof filteredData } = {};
        filteredData.forEach(item => {
            const key = item.tap || 'Unknown';
            if (!groups[key]) groups[key] = [];
            groups[key].push(item);
        });

        return Object.entries(groups).map(([tap, items]) => {
            const materialsStats: any = {};
            POP_MATERIAL_TYPES.forEach(type => {
                const installedCount = items.reduce((sum, item) => {
                    const mat = item.popMaterials.find(m => m.type === type.value);
                    return sum + (mat?.installed ? 1 : 0);
                }, 0);
                materialsStats[type.value] = {
                    installed: installedCount,
                    total: items.length,
                    pct: items.length > 0 ? (installedCount / items.length) * 100 : 0
                };
            });

            return {
                name: tap,
                count: items.length,
                materials: materialsStats,
                avgInstallRate: items.reduce((sum, i) => sum + i.installRate, 0) / items.length,
                fullCoverageCount: items.filter(i => i.installRate >= 80).length
            };
        }).sort((a, b) => a.name.localeCompare(b.name));
    }, [filteredData]);

    const sfSummary = useMemo(() => {
        const groups: { [key: string]: typeof filteredData } = {};
        filteredData.forEach(item => {
            const key = item.salesforce || 'Unknown';
            if (!groups[key]) groups[key] = [];
            groups[key].push(item);
        });

        return Object.entries(groups).map(([sf, items]) => {
            const materialsStats: any = {};
            POP_MATERIAL_TYPES.forEach(type => {
                const installedCount = items.reduce((sum, item) => {
                    const mat = item.popMaterials.find(m => m.type === type.value);
                    return sum + (mat?.installed ? 1 : 0);
                }, 0);
                materialsStats[type.value] = {
                    installed: installedCount,
                    total: items.length,
                    pct: items.length > 0 ? (installedCount / items.length) * 100 : 0
                };
            });

            return {
                name: sf,
                count: items.length,
                materials: materialsStats,
                avgInstallRate: items.reduce((sum, i) => sum + i.installRate, 0) / items.length,
                fullCoverageCount: items.filter(i => i.installRate >= 80).length
            };
        }).sort((a, b) => a.name.localeCompare(b.name));
    }, [filteredData]);

    const hasActiveFilters = tapFilter || salesforceFilter || searchTerm || popTypeFilter || lokasiFilter;

    const clearAllFilters = () => {
        setTapFilter('');
        setSalesforceFilter('');
        setSearchTerm('');
        setPopTypeFilter('');
        setLokasiFilter('');
    };

    const handleTapChange = (val: string) => {
        setTapFilter(val);
        // If new TAP is selected, check if current Salesforce is still valid. If not, clear it.
        if (val && salesforceFilter) {
            const isValid = outletPOPData.some(o => o.tap === val && o.salesforce === salesforceFilter);
            if (!isValid) setSalesforceFilter('');
        }
    };

    const handleSalesforceChange = (val: string) => {
        setSalesforceFilter(val);
        // If new SF is selected, check if current TAP is still valid. If not, clear it.
        if (val && tapFilter) {
            const isValid = outletPOPData.some(o => o.salesforce === val && o.tap === tapFilter);
            if (!isValid) setTapFilter('');
        }
    };

    // ... (UI Render)

    const SummaryTable = ({ data, title, icon, expanded, onToggle }: { data: POPSummaryRow[], title: string, icon: React.ReactNode, expanded: boolean, onToggle: () => void }) => (
        <div className="border border-gray-200 rounded-lg mb-4 overflow-hidden">
            <button onClick={onToggle} className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                    {icon}
                    <span className="font-semibold text-gray-800">{title}</span>
                    <span className="text-sm text-gray-500">({data.length} items)</span>
                </div>
                {expanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </button>
            {expanded && (
                <div className="table-scroll">
                    <table className="data-table data-table-compact text-left">
                        <thead className="bg-[#2c4a6a]">
                            <tr className="text-white">
                                <th className="p-3 border-b border-gray-600 min-w-[150px] font-semibold border-r sticky left-0 bg-[#2c4a6a] z-10">Name</th>
                                <th className="p-3 border-b border-gray-600 text-center font-semibold border-r">Outlets</th>
                                <th className="p-3 border-b border-gray-600 text-center font-semibold border-r">Avg Rate</th>
                                {POP_MATERIAL_TYPES.filter(t => !popTypeFilter || t.value === popTypeFilter).map(type => (
                                    <th key={type.value} className="p-2 border-b border-gray-600 text-center border-r min-w-[60px]">
                                        {type.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 border-b">
                                    <td className="p-3 border-r font-medium sticky left-0 bg-white">{row.name}</td>
                                    <td className="p-3 border-r text-center">{row.count}</td>
                                    <td className="p-3 border-r text-center font-bold text-blue-600 bg-blue-50/20">{row.avgInstallRate.toFixed(1)}%</td>
                                    {POP_MATERIAL_TYPES.filter(t => !popTypeFilter || t.value === popTypeFilter).map(type => {
                                        const stats = row.materials[type.value];
                                        const coverageClass = stats.pct >= 80 ? 'text-green-600' :
                                            stats.pct >= 50 ? 'text-yellow-600' : 'text-red-500';
                                        return (
                                            <td key={type.value} className="p-2 border-r text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className={`font-bold ${coverageClass}`}>{Math.round(stats.pct)}%</span>
                                                    <span className="text-[9px] text-gray-400">({stats.installed}/{stats.total})</span>
                                                </div>
                                            </td>
                                        );
                                    })}
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
            <Header title="POP Material" />

            {/* Filters */}
            <Card padding="md" className="mt-6 bg-slate-100">
                <div className="flex items-center gap-2 mb-3">
                    <Filter size={16} className="text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Filter Options</span>
                    {hasActiveFilters && (
                        <button onClick={clearAllFilters} className="ml-auto flex items-center gap-1 text-xs text-red-600 hover:text-red-700">
                            <X size={14} /> Clear All
                        </button>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <Input
                        placeholder="Cari outlet atau salesforce..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        leftIcon={<Search size={16} />}
                    />
                    <Select label="TAP" value={tapFilter} onChange={e => handleTapChange(e.target.value)} options={tapOptions} />
                    <Select label="Salesforce" value={salesforceFilter} onChange={e => handleSalesforceChange(e.target.value)} options={salesforceOptions} />
                    <Select label="Lokasi" value={lokasiFilter} onChange={e => setLokasiFilter(e.target.value)} options={lokasiOptions} />
                    <Select
                        label="Jenis POP Material"
                        value={popTypeFilter}
                        onChange={e => setPopTypeFilter(e.target.value)}
                        options={[{ value: '', label: 'Semua Jenis' }, ...POP_MATERIAL_TYPES]}
                    />
                </div>
            </Card>


            <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="text-center">
                    <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                    <p className="text-sm text-gray-500">Total Outlet</p>
                </Card>
                <Card className="text-center">
                    <p className="text-3xl font-bold text-green-600">{stats.withPOP}</p>
                    <p className="text-sm text-gray-500">Terpasang POP</p>
                </Card>
                <Card className="text-center">
                    <p className="text-3xl font-bold text-blue-600">{stats.fullCoverage}</p>
                    <p className="text-sm text-gray-500">Coverage &gt;80%</p>
                </Card>
                <Card className="text-center">
                    <p className="text-3xl font-bold text-purple-600">{stats.avgRate.toFixed(1)}%</p>
                    <p className="text-sm text-gray-500">Avg Install Rate</p>
                </Card>
            </div>

            {/* Branding Share Cards */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {['branding_full', 'branding_partial'].map(typeKey => {
                    const typeLabel = POP_MATERIAL_TYPES.find(t => t.value === typeKey)?.label || typeKey;

                    // Calculate Share
                    const brandCounts: Record<string, number> = {};
                    let totalInstalled = 0;

                    filteredData.forEach(outlet => {
                        const mat = outlet.popMaterials.find(m => m.type === typeKey);
                        if (mat?.installed && mat.brand) {
                            brandCounts[mat.brand] = (brandCounts[mat.brand] || 0) + 1;
                            totalInstalled++;
                        }
                    });

                    const sortedBrands = Object.entries(brandCounts)
                        .sort((a, b) => b[1] - a[1]); // Sort by count desc

                    return (
                        <Card key={typeKey} padding="md">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <Image size={16} className="text-blue-500" />
                                Share {typeLabel}
                                <span className="text-xs font-normal text-gray-500 ml-auto">Total: {totalInstalled}</span>
                            </h3>
                            <div className="space-y-2">
                                {sortedBrands.length === 0 ? (
                                    <p className="text-xs text-gray-400 italic text-center py-2">Belum ada data branding terpasang.</p>
                                ) : (
                                    sortedBrands.map(([brand, count]) => {
                                        const pct = (count / totalInstalled) * 100;
                                        return (
                                            <div key={brand} className="flex items-center text-xs">
                                                <div className="w-24 font-medium text-gray-700 truncate" title={brand}>{brand}</div>
                                                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden mx-2">
                                                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }}></div>
                                                </div>
                                                <div className="w-10 text-right text-gray-700">{Math.round(pct)}%</div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </Card>
                    );
                })}
            </div>


            {/* Item Summary Cards (Per Type) */}
            <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Status Per Jenis POP</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {POP_MATERIAL_TYPES.filter(t => !t.value.includes('branding')).map(type => {
                        let count = 0;
                        filteredData.forEach(outlet => {
                            const mat = outlet.popMaterials.find(m => m.type === type.value);
                            if (mat?.installed) count++;
                        });

                        const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
                        const colorClass = pct >= 80 ? 'text-green-600' : pct >= 50 ? 'text-yellow-600' : 'text-red-500';
                        const bgClass = pct >= 80 ? 'bg-green-50' : pct >= 50 ? 'bg-yellow-50' : 'bg-red-50';

                        return (
                            <Card key={type.value} padding="sm" className="flex flex-col items-center text-center">
                                <span className={`text-xs font-semibold uppercase mb-1 ${colorClass}`}>{type.label}</span>
                                <span className="text-xl font-bold text-gray-800">{count}</span>
                                <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                                    <div className={`h-full rounded-full ${bgClass.replace('bg-', 'bg-').replace('50', '500')}`} style={{ width: `${pct}%` }}></div>
                                </div>
                                <span className="text-[10px] text-gray-400 mt-1">{Math.round(pct)}% Installed</span>
                            </Card>
                        );
                    })}
                </div>
            </div>

            {/* Filters */}
            <Card padding="md" className="mt-6 bg-slate-100">
                <div className="flex items-center gap-2 mb-3">
                    <Filter size={16} className="text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Filter Options</span>
                    {hasActiveFilters && (
                        <button onClick={clearAllFilters} className="ml-auto flex items-center gap-1 text-xs text-red-600 hover:text-red-700">
                            <X size={14} /> Clear All
                        </button>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <Input
                        placeholder="Cari outlet atau salesforce..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        leftIcon={<Search size={16} />}
                    />
                    <Select label="TAP" value={tapFilter} onChange={e => handleTapChange(e.target.value)} options={tapOptions} />
                    <Select label="Salesforce" value={salesforceFilter} onChange={e => handleSalesforceChange(e.target.value)} options={salesforceOptions} />
                    <Select label="Lokasi" value={lokasiFilter} onChange={e => setLokasiFilter(e.target.value)} options={lokasiOptions} />
                    <Select
                        label="Jenis POP Material"
                        value={popTypeFilter}
                        onChange={e => setPopTypeFilter(e.target.value)}
                        options={[{ value: '', label: 'Semua Jenis' }, ...POP_MATERIAL_TYPES]}
                    />
                </div>
            </Card>

            {/* Modal */}
            {
                selectedImage && (
                    <ImageModal
                        src={selectedImage.src}
                        alt={selectedImage.alt}
                        onClose={() => setSelectedImage(null)}
                    />
                )
            }

            <Card padding="none" className="mt-6 overflow-hidden">
                <Tabs defaultValue="summary">
                    <TabList className="px-4 pt-4 border-b border-gray-100">
                        <Tab value="summary" icon={<LayoutDashboard size={14} />}>Summary</Tab>
                        <Tab value="detail" icon={<TableIcon size={14} />}>Detail Outlet</Tab>
                    </TabList>

                    <TabPanel value="summary" className="p-4">
                        <SummaryTable
                            title="Summary per TAP"
                            icon={<MapPin size={18} className="text-blue-500" />}
                            data={tapSummary}
                            expanded={tapExpanded}
                            onToggle={() => setTapExpanded(!tapExpanded)}
                        />
                        <SummaryTable
                            title="Summary per Salesforce"
                            icon={<User size={18} className="text-purple-500" />}
                            data={sfSummary}
                            expanded={sfExpanded}
                            onToggle={() => setSfExpanded(!sfExpanded)}
                        />
                    </TabPanel>

                    <TabPanel value="detail" className="p-0">
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Image size={20} className="text-[#F13B4B]" />
                                <span className="font-semibold text-gray-800">Status POP Material per Outlet</span>
                                <Badge variant="neutral">{filteredData.length} outlets</Badge>
                            </div>
                        </div>

                        <div className="table-scroll" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                            <table className="data-table data-table-compact whitespace-nowrap">
                                <thead className="sticky top-0 z-10 bg-[#2c4a6a]">
                                    <tr className="border-b">
                                        <th className="px-3 py-2 text-left font-semibold text-white min-w-[150px]">Outlet</th>
                                        <th className="px-3 py-2 text-left font-semibold text-white min-w-[100px]">Salesforce</th>
                                        <th className="px-3 py-2 text-left font-semibold text-white min-w-[80px]">TAP</th>
                                        <th className="px-3 py-2 text-left font-semibold text-white min-w-[100px]">Kabupaten</th>
                                        <th className="px-3 py-2 text-center font-semibold text-purple-800 min-w-[70px] bg-purple-50">Lokasi</th>
                                        <th className="px-3 py-2 text-center font-semibold text-amber-800 min-w-[90px] bg-amber-50">Flag</th>
                                        {/* POP Material Columns */}
                                        {POP_MATERIAL_TYPES.filter(t => !popTypeFilter || t.value === popTypeFilter).map(type => (
                                            <th key={type.value} className="px-2 py-2 text-center font-semibold text-blue-800 min-w-[60px] bg-blue-50">
                                                <span className="text-[8px] leading-tight block">{type.label}</span>
                                            </th>
                                        ))}
                                        <th className="px-3 py-2 text-center font-semibold text-green-800 min-w-[60px] bg-green-50">Total</th>
                                        <th className="px-3 py-2 text-center font-semibold text-green-800 min-w-[60px] bg-green-50">Rate</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {paginatedData.length === 0 ? (
                                        <tr>
                                            <td colSpan={6 + POP_MATERIAL_TYPES.length} className="px-4 py-8 text-center text-gray-400">
                                                Tidak ada data outlet
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedData.map(outlet => (
                                            <tr key={outlet.outletId} className="hover:bg-gray-50">
                                                <td className="px-3 py-2">
                                                    <div>
                                                        <p className="font-medium text-gray-900 truncate max-w-[150px]" title={outlet.outletName}>
                                                            {outlet.outletName}
                                                        </p>
                                                        <p className="text-[9px] text-gray-400">{outlet.kecamatan}</p>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-2 text-gray-700">{outlet.salesforce}</td>
                                                <td className="px-3 py-2">
                                                    <Badge variant="info" className="text-[8px]">{outlet.tap}</Badge>
                                                </td>
                                                <td className="px-3 py-2 text-gray-500 text-[9px]">{outlet.kabupaten}</td>
                                                <td className="px-3 py-2 text-center bg-purple-50/30">
                                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${outlet.lokasi === 'Ring 1' ? 'bg-green-100 text-green-700' :
                                                        outlet.lokasi === 'Ring 2' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-gray-100 text-gray-700'
                                                        }`}>{outlet.lokasi}</span>
                                                </td>
                                                <td className="px-3 py-2 text-center bg-amber-50/30">
                                                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-medium ${outlet.flag === 'Big Pareto' ? 'bg-red-100 text-red-700' :
                                                        outlet.flag === 'Pareto Retail' ? 'bg-orange-100 text-orange-700' :
                                                            outlet.flag === 'D2C' ? 'bg-purple-100 text-purple-700' :
                                                                outlet.flag === 'Office' ? 'bg-cyan-100 text-cyan-700' :
                                                                    'bg-gray-100 text-gray-700'
                                                        }`}>{outlet.flag}</span>
                                                </td>
                                                {/* POP Status Columns */}
                                                {outlet.popMaterials.filter(m => !popTypeFilter || m.type === popTypeFilter).map(material => (
                                                    <td key={material.type} className="px-2 py-2 text-center bg-blue-50/20">
                                                        {material.installed ? (
                                                            <div className="flex flex-col items-center gap-1">
                                                                {material.brand ? (
                                                                    <Badge variant="info" className="text-[9px] px-1 py-0">{material.brand}</Badge>
                                                                ) : (
                                                                    <CheckCircle size={14} className="text-green-500" />
                                                                )}
                                                                {material.proofPhotoUrl && (
                                                                    <button
                                                                        onClick={() => setSelectedImage({
                                                                            src: material.proofPhotoUrl!,
                                                                            alt: `${outlet.outletName} - ${POP_MATERIAL_TYPES.find(t => t.value === material.type)?.label}`
                                                                        })}
                                                                        className="text-blue-500 hover:text-blue-700 transition-colors"
                                                                        title="Lihat Foto Dokumentasi"
                                                                    >
                                                                        <Camera size={12} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <XCircle size={14} className="text-gray-300 mx-auto" />
                                                        )}
                                                    </td>
                                                ))}
                                                <td className="px-3 py-2 text-center bg-green-50/30 font-bold text-green-700">
                                                    {outlet.totalInstalled}
                                                </td>
                                                <td className="px-3 py-2 text-center bg-green-50/30">
                                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${outlet.installRate >= 80 ? 'bg-green-100 text-green-700' :
                                                        outlet.installRate >= 50 ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-red-100 text-red-700'
                                                        }`}>
                                                        {outlet.installRate.toFixed(0)}%
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Footer */}
                        <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
                            <div className="text-xs text-gray-500">
                                Showing {paginatedData.length > 0 ? (page - 1) * pageSize + 1 : 0} to {Math.min(page * pageSize, filteredData.length)} of {filteredData.length} entries
                            </div>
                            <div className="flex items-center gap-2">
                                <select
                                    className="text-xs border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                                    value={pageSize}
                                    onChange={(e) => setPageSize(Number(e.target.value))}
                                >
                                    <option value={20}>20 / page</option>
                                    <option value={50}>50 / page</option>
                                    <option value={100}>100 / page</option>
                                </select>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <span className="text-xs font-medium px-2">
                                        Page {page} of {totalPages || 1}
                                    </span>
                                    <button
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages || totalPages === 0}
                                        className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </TabPanel>
                </Tabs>
            </Card>

            {/* Legend */}
            <div className="mt-4 flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-500" />
                    <span>Terpasang</span>
                </div>
                <div className="flex items-center gap-2">
                    <XCircle size={16} className="text-gray-300" />
                    <span>Belum terpasang</span>
                </div>
            </div>
        </div >
    );
};

export default POPMaterialPage;
