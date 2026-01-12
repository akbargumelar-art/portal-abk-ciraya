import { startOfMonth, format, subMonths, parseISO } from 'date-fns';

export type KPITier = 'black' | 'bronze' | 'silver' | 'gold' | 'platinum';

export interface HistoricalKPI {
    month: string; // Format: 'YYYY-MM'
    tier: KPITier;
    tierValue: number; // 0-4
    score: number; // Cumulative sum of tierValues
}

// Generate historical KPI data from January 2022 to current month
export const generateHistoricalKPI = (): HistoricalKPI[] => {
    const data: HistoricalKPI[] = [];
    const startDate = parseISO('2022-01-01');
    const currentDate = new Date();

    let currentMonth = startDate;

    while (currentMonth <= currentDate) {
        // Generate semi-realistic tier progression
        const monthsSinceStart = Math.floor((currentMonth.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30));

        // Simulate improvement over time with some variation
        let baseScore = 45 + (monthsSinceStart * 1.2);
        baseScore += Math.sin(monthsSinceStart / 3) * 10; // Add some variation
        baseScore = Math.min(95, Math.max(30, baseScore)); // Clamp between 30-95

        // Determine tier based on score
        let tier: KPITier;
        let tierValue: number;

        if (baseScore >= 85) {
            tier = 'platinum';
            tierValue = 4;
        } else if (baseScore >= 70) {
            tier = 'gold';
            tierValue = 3;
        } else if (baseScore >= 55) {
            tier = 'silver';
            tierValue = 2;
        } else if (baseScore >= 40) {
            tier = 'bronze';
            tierValue = 1;
        } else {
            tier = 'black';
            tierValue = 0;
        }

        data.push({
            month: format(currentMonth, 'yyyy-MM'),
            tier,
            tierValue,
            score: 0, // Will be calculated cumulatively later
        });

        currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    }

    return data;
};

// Calculate cumulative scores for historical data
export const calculateCumulativeScores = (data: HistoricalKPI[]): HistoricalKPI[] => {
    let cumulativeSum = 0;
    return data.map(item => {
        cumulativeSum += item.tierValue;
        return {
            ...item,
            score: cumulativeSum
        };
    });
};

// Get tier color classes for badges
export const getTierColor = (tier: KPITier): string => {
    switch (tier) {
        case 'platinum':
            return 'bg-purple-100 text-purple-800 border-purple-300';
        case 'gold':
            return 'bg-yellow-100 text-yellow-800 border-yellow-300';
        case 'silver':
            return 'bg-gray-200 text-gray-800 border-gray-400';
        case 'bronze':
            return 'bg-orange-100 text-orange-800 border-orange-300';
        case 'black':
            return 'bg-gray-800 text-white border-gray-900';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-300';
    }
};

// Get tier display name
export const getTierName = (tier: KPITier): string => {
    return tier.charAt(0).toUpperCase() + tier.slice(1);
};

// Get unique years from historical data
export const getAvailableYears = (data: HistoricalKPI[]): number[] => {
    const years = new Set<number>();
    data.forEach(item => {
        const year = parseInt(item.month.split('-')[0]);
        years.add(year);
    });
    return Array.from(years).sort();
};
