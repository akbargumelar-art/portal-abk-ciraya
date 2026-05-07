/**
 * TableMicroComponents
 *
 * Micro-components yang sebelumnya didefinisikan ulang di dalam setiap
 * page component (anti-pattern). Dipindah ke sini agar bisa di-reuse
 * tanpa menyebabkan remount pada setiap parent re-render.
 */

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { getRateBadgeClass, getGrowthColor } from '../../utils/formatters';

// ─────────────────────────────────────────
// RateBadge — persentase dengan warna threshold
// ─────────────────────────────────────────

interface RateBadgeProps {
    value: number;
    /** Jika true, logika warna dibalik: rendah = hijau (untuk stock-0) */
    invert?: boolean;
    decimals?: number;
}

export const RateBadge: React.FC<RateBadgeProps> = ({ value, invert = false, decimals = 1 }) => (
    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${getRateBadgeClass(value, invert)}`}>
        {value.toFixed(decimals)}%
    </span>
);

// ─────────────────────────────────────────
// GrowthBadge — pertumbuhan dengan ikon trend
// ─────────────────────────────────────────

interface GrowthBadgeProps {
    value: number;
    showIcon?: boolean;
    decimals?: number;
}

export const GrowthBadge: React.FC<GrowthBadgeProps> = ({ value, showIcon = true, decimals = 1 }) => {
    const colorClass = getGrowthColor(value);
    return (
        <span className={`flex items-center justify-center gap-0.5 ${colorClass} font-medium text-[9px]`}>
            {showIcon && (
                value > 0
                    ? <TrendingUp size={10} />
                    : value < 0 ? <TrendingDown size={10} /> : null
            )}
            {value > 0 ? '+' : ''}{value.toFixed(decimals)}%
        </span>
    );
};

// ─────────────────────────────────────────
// StatusChip — badge teks kecil dengan warna
// ─────────────────────────────────────────

interface StatusChipProps {
    label: string;
    colorClass?: string;
    /** Preset warna berdasarkan nilai umum */
    preset?: 'pjp' | 'fisik' | 'lokasi' | 'flag' | 'keterangan';
}

const LOKASI_COLORS: Record<string, string> = {
    'Ring 1': 'bg-green-100 text-green-700',
    'Ring 2': 'bg-yellow-100 text-yellow-700',
};

const FLAG_COLORS: Record<string, string> = {
    'Big Pareto':    'bg-orange-100 text-orange-700',
    'Pareto Retail': 'bg-purple-100 text-purple-700',
};

const KETERANGAN_COLORS: Record<string, string> = {
    'Growth':     'bg-green-100 text-green-700',
    'Minus':      'bg-red-100 text-red-700',
    'Push Order': 'bg-red-100 text-red-700',
    'Cukup':      'bg-green-100 text-green-700',
};

export const StatusChip: React.FC<StatusChipProps> = ({ label, colorClass, preset }) => {
    let cls = colorClass ?? 'bg-gray-100 text-gray-500';

    if (preset === 'pjp')
        cls = label === 'PJP' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500';
    else if (preset === 'fisik')
        cls = label === 'Fisik' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500';
    else if (preset === 'lokasi')
        cls = LOKASI_COLORS[label] ?? 'bg-orange-100 text-orange-600';
    else if (preset === 'flag')
        cls = FLAG_COLORS[label] ?? 'bg-blue-100 text-blue-700';
    else if (preset === 'keterangan')
        cls = KETERANGAN_COLORS[label] ?? 'bg-gray-100 text-gray-700';

    return (
        <span className={`px-1.5 py-0.5 rounded text-[8px] font-medium ${cls}`}>
            {label}
        </span>
    );
};

// ─────────────────────────────────────────
// PageLoadingSpinner — spinner loading standar
// ─────────────────────────────────────────

export const PageLoadingSpinner: React.FC<{ message?: string }> = ({
    message = 'Memuat data...',
}) => (
    <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-gray-200 rounded-full" />
                <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-[#F13B4B] rounded-full animate-spin" />
            </div>
            <p className="text-gray-700 font-medium text-lg">{message}</p>
            <p className="text-sm text-gray-400">Mohon tunggu sebentar</p>
        </div>
    </div>
);
