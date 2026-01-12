/**
 * MultiSelect Component
 * 
 * A dropdown component that allows selecting multiple options
 * with chips display and search functionality.
 */

import React, { useState, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';

export interface MultiSelectOption {
    value: string;
    label: string;
}

interface MultiSelectProps {
    options: MultiSelectOption[];
    value: string[];
    onChange: (values: string[]) => void;
    placeholder?: string;
    label?: ReactNode;
    maxDisplay?: number;
    className?: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
    options,
    value,
    onChange,
    placeholder = 'Select...',
    label,
    maxDisplay = 2,
    className = '',
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearch('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filter options based on search
    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(search.toLowerCase())
    );

    // Toggle option selection
    const toggleOption = (optValue: string) => {
        if (value.includes(optValue)) {
            onChange(value.filter(v => v !== optValue));
        } else {
            onChange([...value, optValue]);
        }
    };

    // Remove a selected value
    const removeValue = (optValue: string, e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(value.filter(v => v !== optValue));
    };

    // Select all
    const selectAll = () => {
        onChange(options.map(o => o.value));
    };

    // Clear all
    const clearAll = () => {
        onChange([]);
    };

    // Get labels for selected values
    const selectedLabels = value.map(v => options.find(o => o.value === v)?.label || v);

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            {label && (
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    {label}
                </label>
            )}

            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-sm border rounded-lg transition-all
                    ${isOpen
                        ? 'ring-2 ring-[#F13B4B] border-transparent'
                        : 'border-gray-200 hover:border-gray-300'
                    }
                    ${value.length > 0 ? 'bg-white' : 'bg-gray-50'}
                `}
            >
                <div className="flex-1 flex flex-wrap items-center gap-1 min-h-[20px]">
                    {value.length === 0 ? (
                        <span className="text-gray-400">{placeholder}</span>
                    ) : value.length <= maxDisplay ? (
                        selectedLabels.map((label, idx) => (
                            <span
                                key={value[idx]}
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#F13B4B]/10 text-[#F13B4B] text-xs rounded-full"
                            >
                                {label}
                                <X
                                    size={12}
                                    className="cursor-pointer hover:text-red-700"
                                    onClick={(e) => removeValue(value[idx], e)}
                                />
                            </span>
                        ))
                    ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#F13B4B]/10 text-[#F13B4B] text-xs rounded-full">
                            {value.length} selected
                            <X
                                size={12}
                                className="cursor-pointer hover:text-red-700"
                                onClick={(e) => { e.stopPropagation(); clearAll(); }}
                            />
                        </span>
                    )}
                </div>
                <ChevronDown
                    size={16}
                    className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                    {/* Search */}
                    <div className="p-2 border-b border-gray-100">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search..."
                            className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-[#F13B4B] focus:border-transparent outline-none"
                            autoFocus
                        />
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 bg-gray-50">
                        <button
                            type="button"
                            onClick={selectAll}
                            className="text-xs text-[#F13B4B] hover:underline"
                        >
                            Select All
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                            type="button"
                            onClick={clearAll}
                            className="text-xs text-gray-500 hover:underline"
                        >
                            Clear
                        </button>
                    </div>

                    {/* Options */}
                    <div className="max-h-48 overflow-y-auto">
                        {filteredOptions.length === 0 ? (
                            <div className="px-3 py-4 text-sm text-gray-400 text-center">
                                No options found
                            </div>
                        ) : (
                            filteredOptions.map(option => {
                                const isSelected = value.includes(option.value);
                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => toggleOption(option.value)}
                                        className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-left transition-colors
                                            ${isSelected
                                                ? 'bg-[#F13B4B]/5 text-[#F13B4B]'
                                                : 'hover:bg-gray-50 text-gray-700'
                                            }
                                        `}
                                    >
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center
                                            ${isSelected
                                                ? 'bg-[#F13B4B] border-[#F13B4B]'
                                                : 'border-gray-300'
                                            }
                                        `}>
                                            {isSelected && <Check size={12} className="text-white" />}
                                        </div>
                                        <span className="flex-1">{option.label}</span>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MultiSelect;
