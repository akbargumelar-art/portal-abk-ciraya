import React from 'react';

/**
 * PageLoadingOverlay - Displays a loading overlay during page transitions
 * Shows animated spinner and skeleton placeholder to indicate loading state
 */
const PageLoadingOverlay: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#F8FAFC] p-6 animate-pulse">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between mb-6">
                <div className="space-y-2">
                    <div className="h-8 w-64 bg-gray-200 rounded-lg"></div>
                    <div className="h-4 w-48 bg-gray-200 rounded"></div>
                </div>
                <div className="flex gap-3">
                    <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
                    <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                </div>
            </div>

            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                        <div className="h-8 w-32 bg-gray-200 rounded"></div>
                    </div>
                ))}
            </div>

            {/* Loading Spinner Overlay */}
            <div className="flex items-center justify-center py-16">
                <div className="flex flex-col items-center gap-4">
                    {/* Animated Spinner */}
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-[#E11D48] rounded-full animate-spin"></div>
                    </div>
                    <p className="text-gray-500 font-medium">Memuat data...</p>
                </div>
            </div>

            {/* Table Skeleton */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-6">
                <div className="p-4 border-b border-gray-100">
                    <div className="h-6 w-48 bg-gray-200 rounded"></div>
                </div>
                <div className="divide-y divide-gray-100">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="flex items-center gap-4 p-4">
                            <div className="h-4 w-20 bg-gray-200 rounded"></div>
                            <div className="h-4 w-32 bg-gray-200 rounded"></div>
                            <div className="h-4 w-24 bg-gray-200 rounded"></div>
                            <div className="h-4 w-16 bg-gray-200 rounded"></div>
                            <div className="flex-1"></div>
                            <div className="h-4 w-20 bg-gray-200 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PageLoadingOverlay;
