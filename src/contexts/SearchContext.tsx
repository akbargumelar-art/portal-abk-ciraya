/**
 * Search Context
 * 
 * Provides global search functionality across all pages.
 * Pages can subscribe to searchQuery to filter their content.
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

interface SearchContextType {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    clearSearch: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

interface SearchProviderProps {
    children: ReactNode;
}

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const clearSearch = useCallback(() => {
        setSearchQuery('');
    }, []);

    return (
        <SearchContext.Provider value={{ searchQuery, setSearchQuery, clearSearch }}>
            {children}
        </SearchContext.Provider>
    );
};

export const useSearch = (): SearchContextType => {
    const context = useContext(SearchContext);
    if (!context) {
        throw new Error('useSearch must be used within a SearchProvider');
    }
    return context;
};

// Hook for pages to easily filter data based on search query
export const useSearchFilter = <T,>(
    data: T[],
    searchFields: (keyof T)[],
    additionalFilter?: (item: T, query: string) => boolean
): T[] => {
    const { searchQuery } = useSearch();

    if (!searchQuery.trim()) {
        return data;
    }

    const query = searchQuery.toLowerCase();

    return data.filter(item => {
        // Check specified fields
        const matchesFields = searchFields.some(field => {
            const value = item[field];
            if (typeof value === 'string') {
                return value.toLowerCase().includes(query);
            }
            if (typeof value === 'number') {
                return value.toString().includes(query);
            }
            return false;
        });

        // Check additional filter if provided
        if (additionalFilter) {
            return matchesFields || additionalFilter(item, query);
        }

        return matchesFields;
    });
};

export default SearchContext;
