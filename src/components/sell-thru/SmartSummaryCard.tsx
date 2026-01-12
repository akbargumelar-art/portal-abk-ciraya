import React, { memo } from 'react';
import type { SmartSummaryStats } from '../../utils/sellThruAnalytics';
import { TrendingUp, TrendingDown, Award, AlertCircle, Target, BarChart3, Users } from 'lucide-react';

interface SellThruSummaryCardProps {
    stats: SmartSummaryStats | null | undefined;
    mode: 'perdana' | 'voucher';
    source: 'nota' | 'digipos';
}

/**
 * Clean, informative summary card for Sell Thru pages
 * Shows 4 key metrics in a horizontal layout
 */
export const SellThruSummaryCard: React.FC<SellThruSummaryCardProps> = memo(({ stats, mode, source }) => {
    // Handle null/undefined stats gracefully
    if (!stats) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
                <div className="text-center text-gray-400 py-4">Memuat data...</div>
            </div>
        );
    }

    const isPositiveGrowth = stats.momGrowth >= 0;
    const isTargetMet = stats.achievementPct >= 100;
    const isOnTrack = stats.achievementPct >= 80;

    // Color schemes
    const achievementColor = isTargetMet ? 'text-green-600' : isOnTrack ? 'text-blue-600' : 'text-orange-600';
    const achievementBg = isTargetMet ? 'bg-green-500' : isOnTrack ? 'bg-blue-500' : 'bg-orange-500';
    const growthColor = isPositiveGrowth ? 'text-green-600' : 'text-red-500';
    const growthBg = isPositiveGrowth ? 'bg-green-100' : 'bg-red-100';

    // Mode-specific styling
    const modeLabel = mode === 'perdana' ? 'Perdana' : 'Voucher';
    const sourceLabel = source === 'nota' ? 'Nota' : 'Digipos';
    const headerBg = mode === 'perdana' ? 'from-red-600 to-red-700' : 'from-emerald-500 to-emerald-600';

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-4 overflow-hidden">
            {/* Header Strip */}
            <div className={`bg-gradient-to-r ${headerBg} px-4 py-2 flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                    <BarChart3 size={16} className="text-white/80" />
                    <span className="text-white font-medium text-sm">Ringkasan {modeLabel} - {sourceLabel}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/20 px-2 py-0.5 rounded text-xs text-white">
                    <Users size={12} />
                    <span>{stats.totalOutlets?.toLocaleString() || 0} outlet</span>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                    {/* Card 1: Achievement */}
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                        <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-2">
                            <Target size={12} />
                            <span>Achievement</span>
                        </div>
                        <div className="flex items-baseline gap-2 mb-2">
                            <span className={`text-2xl font-bold ${achievementColor}`}>
                                {Math.round(stats.achievementPct)}%
                            </span>
                            <span className="text-xs text-gray-400">of target</span>
                        </div>
                        {/* Progress bar */}
                        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${achievementBg} transition-all duration-500`}
                                style={{ width: `${Math.min(stats.achievementPct, 100)}%` }}
                            />
                        </div>
                        <div className="flex justify-between mt-1.5 text-[10px] text-gray-400">
                            <span>Actual: <b className="text-gray-600">{stats.totalActual?.toLocaleString() || 0}</b></span>
                            <span>Target: <b className="text-gray-600">{stats.totalTarget?.toLocaleString() || 0}</b></span>
                        </div>
                    </div>

                    {/* Card 2: Growth */}
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                        <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-2">
                            {isPositiveGrowth ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            <span>Growth vs Bulan Lalu</span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-bold ${growthBg} ${growthColor}`}>
                                {isPositiveGrowth ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                {isPositiveGrowth ? '+' : ''}{Math.round(stats.momGrowth)}%
                            </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                            <span>Gap: </span>
                            <span className={`font-semibold ${stats.gap >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                {stats.gap > 0 ? '+' : ''}{stats.gap?.toLocaleString() || 0}
                            </span>
                            <span className="text-gray-400 ml-1">unit</span>
                        </div>
                        <div className="text-[10px] text-gray-400 mt-0.5">
                            M-1: {stats.totalPrevMonth?.toLocaleString() || 0}
                        </div>
                    </div>

                    {/* Card 3: Top Performer */}
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                        <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-2">
                            <Award size={12} className="text-yellow-500" />
                            <span>Top Performer</span>
                        </div>
                        {stats.bestPerformer ? (
                            <>
                                <div className="text-sm font-bold text-gray-800 truncate" title={stats.bestPerformer.name}>
                                    {stats.bestPerformer.name}
                                </div>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <span className="text-green-600 font-bold text-lg">
                                        {Math.round(stats.bestPerformer.ach)}%
                                    </span>
                                    <span className="text-[10px] text-gray-400">achievement</span>
                                </div>
                            </>
                        ) : (
                            <div className="text-gray-400 text-sm">-</div>
                        )}
                    </div>

                    {/* Card 4: Needs Attention */}
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                        <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-2">
                            <AlertCircle size={12} className="text-red-500" />
                            <span>Perlu Perhatian</span>
                        </div>
                        {stats.worstPerformer ? (
                            <>
                                <div className="text-sm font-bold text-gray-800 truncate" title={stats.worstPerformer.name}>
                                    {stats.worstPerformer.name}
                                </div>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <span className="text-red-500 font-bold text-lg">
                                        {Math.round(stats.worstPerformer.ach)}%
                                    </span>
                                    <span className="text-[10px] text-gray-400">achievement</span>
                                </div>
                            </>
                        ) : (
                            <div className="text-gray-400 text-sm">-</div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
});

// Re-export the old component for backward compatibility
export { SellThruSummaryCard as SmartSummaryCard };
