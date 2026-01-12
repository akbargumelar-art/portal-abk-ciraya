/**
 * Date Utilities for Fixed Date Reporting
 */

/**
 * Determines which week bucket a day belongs to based on the 1-7 rule.
 * Days 1-7 = Week 1
 * Days 8-14 = Week 2
 * Days 15-21 = Week 3
 * Days 22-28 = Week 4
 * Days 29-End = Week 5
 * 
 * @param day - Day of the month (1-31)
 * @returns Week number (1-5)
 */
export const getWeekBucket = (day: number): number => {
    if (day <= 7) return 1;
    if (day <= 14) return 2;
    if (day <= 21) return 3;
    if (day <= 28) return 4;
    return 5;
};

/**
 * Checks if a specific month/year has a 5th week (has more than 28 days).
 * Basically returns true for all months except non-leap February.
 * 
 * @param month - Month index (1-12)
 * @param year - Year (e.g., 2025)
 * @returns boolean
 */
export const hasWeek5 = (month: number, year: number): boolean => {
    // efficient check: months with > 28 days have week 5.
    // Feb is the only one that might not.
    if (month !== 2) return true;

    // Check for leap year
    const isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    return isLeap; // Feb has 29 days in leap year (Week 5 exists for 1 day: 29th)
};

/**
 * Returns the name of the month given its number index (1-12)
 */
export const getMonthName = (month: number): string => {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1] || '';
};
