/**
 * Monitoring Visit Page
 * 
 * Tracks Salesforce field visits in a timeline format with:
 * - Stats summary cards
 * - Filters (date, salesforce, status)
 * - Timeline view of visits
 * - Map placeholder
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
    Calendar,
    MapPin,
    Clock,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Camera,
    Target,
    Users,
    TrendingUp,
    Timer,
    ChevronRight,
    RefreshCw,
} from 'lucide-react';
import Header from '../../components/layout/Header';
import { Card, Button, Select, Badge } from '../../components/ui/index';
import {
    generateMockVisits,
    calculateVisitSummary,
    getSalesforceOptions,
    getStatusOptions,
} from '../../services/mock/visitData';
import type { Visit, VisitStatus, VisitSummary } from '../../types/visit';

// ============================================================================
// SKELETON COMPONENTS
// ============================================================================

const StatCardSkeleton: React.FC = () => (
    <div className="bg-white rounded-lg p-5 border border-slate-100 animate-pulse">
        <div className="flex items-start justify-between">
            <div className="flex-1">
                <div className="h-4 bg-slate-200 rounded w-24 mb-2" />
                <div className="h-8 bg-slate-200 rounded w-16" />
            </div>
            <div className="w-12 h-12 bg-slate-200 rounded-xl" />
        </div>
    </div>
);

const TimelineItemSkeleton: React.FC = () => (
    <div className="flex gap-4 animate-pulse">
        <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-slate-200" />
            <div className="w-0.5 flex-1 bg-slate-200 my-2" />
        </div>
        <div className="flex-1 bg-white rounded-lg p-4 border border-slate-100 mb-4">
            <div className="h-5 bg-slate-200 rounded w-48 mb-2" />
            <div className="h-4 bg-slate-200 rounded w-32 mb-3" />
            <div className="h-4 bg-slate-200 rounded w-24" />
        </div>
    </div>
);

// ============================================================================
// STAT CARD COMPONENT
// ============================================================================

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    iconBgColor: string;
    subtitle?: string;
    trend?: 'up' | 'down' | 'neutral';
}

const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    icon,
    iconBgColor,
    subtitle,
}) => (
    <Card className="hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
                {subtitle && (
                    <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
                )}
            </div>
            <div className={`p-3 rounded-xl ${iconBgColor}`}>
                {icon}
            </div>
        </div>
    </Card>
);

// ============================================================================
// TIMELINE ITEM COMPONENT
// ============================================================================

interface TimelineItemProps {
    visit: Visit;
    isLast?: boolean;
    onViewPhoto?: () => void;
}

const getStatusConfig = (status: VisitStatus) => {
    switch (status) {
        case 'visited':
            return {
                icon: <CheckCircle size={20} className="text-white" />,
                bgColor: 'bg-emerald-500',
                badgeVariant: 'success' as const,
                label: 'Berhasil',
            };
        case 'closed':
            return {
                icon: <XCircle size={20} className="text-white" />,
                bgColor: 'bg-red-500',
                badgeVariant: 'error' as const,
                label: 'Toko Tutup',
            };
        case 'issue':
            return {
                icon: <AlertTriangle size={20} className="text-white" />,
                bgColor: 'bg-amber-500',
                badgeVariant: 'warning' as const,
                label: 'Ada Kendala',
            };
    }
};

const TimelineItem: React.FC<TimelineItemProps> = ({ visit, isLast, onViewPhoto }) => {
    const config = getStatusConfig(visit.status);
    const checkInTime = new Date(visit.checkInTime).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
    });
    const checkOutTime = visit.checkOutTime
        ? new Date(visit.checkOutTime).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
        })
        : '-';

    // Distance indicator styling
    const isDistanceOk = visit.distanceError < 0.5;
    const distanceColor = isDistanceOk ? 'text-emerald-600' : 'text-amber-600';
    const distanceBg = isDistanceOk ? 'bg-emerald-50' : 'bg-amber-50';

    return (
        <div className="flex gap-4">
            {/* Timeline indicator */}
            <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center shadow-md`}>
                    {config.icon}
                </div>
                {!isLast && <div className="w-0.5 flex-1 bg-slate-200 my-2" />}
            </div>

            {/* Content Card */}
            <div className="flex-1 bg-white rounded-lg p-4 border border-slate-100 mb-4 hover:shadow-md transition-shadow">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                    <div>
                        <h4 className="font-semibold text-slate-900">{visit.outletName}</h4>
                        <p className="text-sm text-slate-500">{visit.outletAddress}</p>
                    </div>
                    <Badge variant={config.badgeVariant}>{config.label}</Badge>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                    <div className="flex items-center gap-2 text-sm">
                        <Clock size={14} className="text-slate-400" />
                        <span className="text-slate-600">
                            {checkInTime} - {checkOutTime}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Timer size={14} className="text-slate-400" />
                        <span className="text-slate-600">{visit.duration} menit</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Users size={14} className="text-slate-400" />
                        <span className="text-slate-600">{visit.salesforceName}</span>
                    </div>
                </div>

                {/* Distance Indicator */}
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${distanceBg} ${distanceColor} mb-3`}>
                    <MapPin size={14} />
                    <span>{visit.distanceError.toFixed(2)} km dari lokasi</span>
                    {isDistanceOk ? (
                        <CheckCircle size={14} />
                    ) : (
                        <AlertTriangle size={14} />
                    )}
                </div>

                {/* Notes & Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <p className="text-sm text-slate-500 italic">
                        {visit.notes || 'Tidak ada catatan'}
                    </p>
                    {visit.hasPhoto && (
                        <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<Camera size={14} />}
                            onClick={onViewPhoto}
                        >
                            Lihat Foto
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// MAP PLACEHOLDER
// ============================================================================

const MapPlaceholder: React.FC<{ visits: Visit[] }> = ({ visits }) => {
    const visitedCount = visits.filter(v => v.status === 'visited').length;

    return (
        <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl h-full min-h-[400px] flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-blue-200/30 rounded-full" />
            <div className="absolute bottom-1/3 left-1/3 w-24 h-24 bg-emerald-200/30 rounded-full" />

            <div className="relative z-10 text-center">
                <div className="w-16 h-16 bg-white rounded-lg shadow-md flex items-center justify-center mx-auto mb-4">
                    <MapPin size={32} className="text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">
                    Peta Kunjungan
                </h3>
                <p className="text-sm text-slate-500 max-w-xs">
                    Integrasi Google Maps akan tersedia untuk menampilkan lokasi kunjungan real-time
                </p>
                <div className="mt-4 flex items-center justify-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                        <span className="text-slate-600">{visitedCount} Sukses</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full" />
                        <span className="text-slate-600">{visits.filter(v => v.status === 'closed').length} Tutup</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-amber-500 rounded-full" />
                        <span className="text-slate-600">{visits.filter(v => v.status === 'issue').length} Kendala</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const MonitoringVisitPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [visits, setVisits] = useState<Visit[]>([]);
    const [summary, setSummary] = useState<VisitSummary | null>(null);

    // Filters
    const [selectedDate, setSelectedDate] = useState(
        new Date().toISOString().split('T')[0]
    );
    const [selectedSalesforce, setSelectedSalesforce] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<VisitStatus | 'all'>('all');

    // Load data
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);

            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 800));

            const date = new Date(selectedDate);
            const mockVisits = generateMockVisits(date, selectedSalesforce);
            const visitSummary = calculateVisitSummary(mockVisits);

            setVisits(mockVisits);
            setSummary(visitSummary);
            setIsLoading(false);
        };

        loadData();
    }, [selectedDate, selectedSalesforce]);

    // Filter visits by status
    const filteredVisits = useMemo(() => {
        if (selectedStatus === 'all') return visits;
        return visits.filter(v => v.status === selectedStatus);
    }, [visits, selectedStatus]);

    const handleRefresh = () => {
        setIsLoading(true);
        setTimeout(() => {
            const date = new Date(selectedDate);
            const mockVisits = generateMockVisits(date, selectedSalesforce);
            const visitSummary = calculateVisitSummary(mockVisits);
            setVisits(mockVisits);
            setSummary(visitSummary);
            setIsLoading(false);
        }, 500);
    };

    const handleViewPhoto = () => {
        alert('Fitur galeri foto akan tersedia segera!');
    };

    return (
        <div className="p-6 animate-fade-in">
            <Header
                title="Monitoring Visit"
            />

            {/* Stats Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                {isLoading ? (
                    <>
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                    </>
                ) : summary && (
                    <>
                        <StatCard
                            title="Target Visit"
                            value={summary.targetVisit}
                            subtitle="Kunjungan per hari"
                            icon={<Target size={24} className="text-blue-600" />}
                            iconBgColor="bg-blue-100"
                        />
                        <StatCard
                            title="Actual Visit"
                            value={summary.actualVisit}
                            subtitle={`${summary.closedCount} tutup, ${summary.issueCount} kendala`}
                            icon={<Users size={24} className="text-emerald-600" />}
                            iconBgColor="bg-emerald-100"
                        />
                        <StatCard
                            title="Success Rate"
                            value={`${summary.successRate}%`}
                            subtitle="Kunjungan berhasil"
                            icon={<TrendingUp size={24} className="text-purple-600" />}
                            iconBgColor="bg-purple-100"
                        />
                        <StatCard
                            title="Rata-rata Durasi"
                            value={`${summary.averageDuration} min`}
                            subtitle="Per kunjungan"
                            icon={<Timer size={24} className="text-amber-600" />}
                            iconBgColor="bg-amber-100"
                        />
                    </>
                )}
            </div>

            {/* Filters */}
            <Card className="mt-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Calendar size={18} className="text-slate-400" />
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={e => setSelectedDate(e.target.value)}
                            className="input py-2"
                        />
                    </div>
                    <Select
                        value={selectedSalesforce}
                        onChange={e => setSelectedSalesforce(e.target.value)}
                        options={getSalesforceOptions()}
                        className="min-w-[180px]"
                    />
                    <Select
                        value={selectedStatus}
                        onChange={e => setSelectedStatus(e.target.value as VisitStatus | 'all')}
                        options={getStatusOptions()}
                        className="min-w-[180px]"
                    />
                    <div className="flex-1" />
                    <Button
                        variant="outline"
                        leftIcon={<RefreshCw size={16} />}
                        onClick={handleRefresh}
                        isLoading={isLoading}
                    >
                        Refresh
                    </Button>
                </div>
            </Card>

            {/* Main Content: Timeline + Map */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-6">
                {/* Timeline */}
                <div className="lg:col-span-3">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-slate-900">
                            Timeline Kunjungan
                        </h3>
                        <span className="text-sm text-slate-500">
                            {filteredVisits.length} kunjungan
                        </span>
                    </div>

                    <div className="space-y-0">
                        {isLoading ? (
                            <>
                                <TimelineItemSkeleton />
                                <TimelineItemSkeleton />
                                <TimelineItemSkeleton />
                            </>
                        ) : filteredVisits.length === 0 ? (
                            <Card className="text-center py-12">
                                <MapPin size={48} className="text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-500">
                                    Tidak ada kunjungan untuk filter yang dipilih
                                </p>
                            </Card>
                        ) : (
                            filteredVisits.map((visit, index) => (
                                <TimelineItem
                                    key={visit.id}
                                    visit={visit}
                                    isLast={index === filteredVisits.length - 1}
                                    onViewPhoto={handleViewPhoto}
                                />
                            ))
                        )}
                    </div>

                    {filteredVisits.length > 0 && (
                        <div className="text-center mt-4">
                            <Button
                                variant="ghost"
                                rightIcon={<ChevronRight size={16} />}
                            >
                                Lihat Semua Riwayat
                            </Button>
                        </div>
                    )}
                </div>

                {/* Map Placeholder */}
                <div className="lg:col-span-2">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">
                        Lokasi Kunjungan
                    </h3>
                    <MapPlaceholder visits={visits} />
                </div>
            </div>
        </div>
    );
};

export default MonitoringVisitPage;
