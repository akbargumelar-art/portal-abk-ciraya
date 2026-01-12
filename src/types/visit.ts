/**
 * Visit Types
 * 
 * Types for the Monitoring Visit page and related features.
 */

/**
 * Visit status types.
 */
export type VisitStatus = 'visited' | 'closed' | 'issue';

/**
 * GPS Coordinates.
 */
export interface GPSCoords {
    latitude: number;
    longitude: number;
}

/**
 * Visit record for salesforce field visits.
 */
export interface Visit {
    id: string;
    outletId: string;
    outletName: string;
    outletAddress: string;
    salesforceId: string;
    salesforceName: string;
    checkInTime: string;      // ISO date string
    checkOutTime?: string;    // ISO date string, optional if still ongoing
    status: VisitStatus;
    gpsCoords: GPSCoords;
    outletCoords: GPSCoords;  // Expected outlet location
    distanceError: number;    // Distance in km from expected location
    notes?: string;
    hasPhoto: boolean;
    photoUrl?: string;
    duration?: number;        // Duration in minutes
}

/**
 * Visit summary statistics.
 */
export interface VisitSummary {
    targetVisit: number;
    actualVisit: number;
    successRate: number;      // Percentage
    averageDuration: number;  // In minutes
    closedCount: number;
    issueCount: number;
}

/**
 * Filter options for visit list.
 */
export interface VisitFilter {
    date: string;             // YYYY-MM-DD
    salesforceId: string;
    status: VisitStatus | 'all';
}
