/**
 * MobileFilterCard — Wrapper untuk filter section yang collapsible di mobile.
 *
 * - Di mobile (< 1024px): collapsed by default, tap header to expand
 * - Di desktop (>= 1024px): always expanded
 * - Shows active filter count badge
 * - Smooth height animation
 */
import React, { useState, useRef, useEffect } from 'react';
import { Filter, ChevronDown, X } from 'lucide-react';
import { Card } from '../ui/index';
import { useIsMobile } from '../../hooks/useIsMobile';

interface MobileFilterCardProps {
    children: React.ReactNode;
    /** Number of active filters (shown as badge) */
    activeCount?: number;
    /** Whether any filter is active */
    hasActiveFilters?: boolean;
    /** Callback when "Clear All" is clicked */
    onClearAll?: () => void;
    /** Additional class names */
    className?: string;
    /** Title — defaults to "Filter Options" */
    title?: string;
}

const MobileFilterCard: React.FC<MobileFilterCardProps> = ({
    children,
    activeCount = 0,
    hasActiveFilters = false,
    onClearAll,
    className = '',
    title = 'Filter Options',
}) => {
    const isMobile = useIsMobile();
    const [isExpanded, setIsExpanded] = useState(!isMobile);
    const contentRef = useRef<HTMLDivElement>(null);
    const [contentHeight, setContentHeight] = useState<number | undefined>(undefined);

    // Auto-collapse on mobile, auto-expand on desktop
    useEffect(() => {
        setIsExpanded(!isMobile);
    }, [isMobile]);

    // Measure content height for animation
    useEffect(() => {
        if (contentRef.current) {
            const observer = new ResizeObserver(entries => {
                for (const entry of entries) {
                    setContentHeight(entry.contentRect.height);
                }
            });
            observer.observe(contentRef.current);
            return () => observer.disconnect();
        }
    }, []);

    const handleToggle = () => {
        if (isMobile) {
            setIsExpanded(prev => !prev);
        }
    };

    return (
        <Card padding="none" className={`bg-slate-100 overflow-hidden ${className}`}>
            {/* Header — clickable on mobile */}
            <button
                type="button"
                onClick={handleToggle}
                className={`w-full flex items-center justify-between px-4 py-3 ${
                    isMobile ? 'cursor-pointer active:bg-slate-200' : 'cursor-default'
                } transition-colors`}
                aria-expanded={isExpanded}
                aria-controls="filter-content"
            >
                <div className="flex items-center gap-2">
                    <Filter
                        size={16}
                        className={hasActiveFilters ? 'text-[#F13B4B]' : 'text-gray-500'}
                    />
                    <span className="text-sm font-medium text-gray-700">{title}</span>
                    {hasActiveFilters && activeCount > 0 && (
                        <span className="px-1.5 py-0.5 bg-[#F13B4B] text-white text-[10px] font-bold rounded-full min-w-[18px] text-center leading-tight">
                            {activeCount}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {hasActiveFilters && onClearAll && (
                        <span
                            role="button"
                            tabIndex={0}
                            onClick={(e) => { e.stopPropagation(); onClearAll(); }}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); onClearAll?.(); }}}
                            className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 transition-colors"
                        >
                            <X size={14} />
                            Clear
                        </span>
                    )}
                    {isMobile && (
                        <ChevronDown
                            size={18}
                            className={`text-gray-400 transition-transform duration-200 ${
                                isExpanded ? 'rotate-180' : ''
                            }`}
                        />
                    )}
                </div>
            </button>

            {/* Content — animated on mobile */}
            <div
                id="filter-content"
                style={{
                    height: isMobile
                        ? isExpanded
                            ? contentHeight !== undefined ? contentHeight + 16 : 'auto'
                            : 0
                        : 'auto',
                    opacity: isMobile ? (isExpanded ? 1 : 0) : 1,
                    overflow: 'hidden',
                    transition: isMobile ? 'height 250ms cubic-bezier(0.4,0,0.2,1), opacity 200ms ease' : 'none',
                }}
            >
                <div ref={contentRef} className="px-4 pb-4">
                    {children}
                </div>
            </div>
        </Card>
    );
};

export default MobileFilterCard;
