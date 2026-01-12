import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPICardProps {
    title: string;
    value: string | number;
    growth?: number;
    icon: React.ReactNode;
    iconBgColor?: string;
    prefix?: string;
    suffix?: string;
    loading?: boolean;
}

const KPICard: React.FC<KPICardProps> = ({
    title,
    value,
    growth,
    icon,
    iconBgColor = 'bg-[#F13B4B]/10',
    prefix,
    suffix,
    loading = false,
}) => {
    const formatValue = (val: string | number) => {
        if (typeof val === 'number') {
            if (val >= 1000000000) {
                return `${(val / 1000000000).toFixed(1)}B`;
            }
            if (val >= 1000000) {
                return `${(val / 1000000).toFixed(1)}M`;
            }
            if (val >= 1000) {
                return `${(val / 1000).toFixed(1)}K`;
            }
            return val.toLocaleString('id-ID');
        }
        return val;
    };

    const getGrowthColor = () => {
        if (!growth || growth === 0) return 'text-gray-500';
        return growth > 0 ? 'text-green-600' : 'text-red-600';
    };

    const getGrowthBgColor = () => {
        if (!growth || growth === 0) return 'bg-gray-100';
        return growth > 0 ? 'bg-green-50' : 'bg-red-50';
    };

    const getGrowthIcon = () => {
        if (!growth || growth === 0) return <Minus size={14} />;
        return growth > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />;
    };

    if (loading) {
        return (
            <div className="card p-5">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="skeleton h-4 w-24 mb-3" />
                        <div className="skeleton h-8 w-32 mb-2" />
                        <div className="skeleton h-5 w-20" />
                    </div>
                    <div className="skeleton w-12 h-12 rounded-xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="card p-3 sm:p-5 card-interactive">
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-500 mb-0.5 sm:mb-1 truncate">{title}</p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900">
                        {prefix}
                        {formatValue(value)}
                        {suffix}
                    </p>

                    {growth !== undefined && (
                        <div className={`inline-flex items-center gap-1 mt-1.5 sm:mt-2 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${getGrowthBgColor()} ${getGrowthColor()}`}>
                            {getGrowthIcon()}
                            <span>{growth > 0 ? '+' : ''}{growth.toFixed(1)}%</span>
                            <span className="text-gray-400 ml-0.5 sm:ml-1 hidden xs:inline">vs M-1</span>
                        </div>
                    )}
                </div>

                <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${iconBgColor} flex-shrink-0`}>
                    {icon}
                </div>
            </div>
        </div>
    );
};

export default KPICard;
