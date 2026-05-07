import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'portal_sidebar_collapsed';

interface SidebarContextType {
    isCollapsed: boolean;
    toggleSidebar: () => void;
    setIsCollapsed: (collapsed: boolean) => void;
    /** True jika sidebar harus tampil sebagai overlay mobile (< lg) */
    isMobileOpen: boolean;
    openMobileSidebar: () => void;
    closeMobileSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isCollapsed, setIsCollapsedState] = useState<boolean>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved === 'true';
        } catch {
            return false;
        }
    });

    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const setIsCollapsed = useCallback((collapsed: boolean) => {
        setIsCollapsedState(collapsed);
    }, []);

    // Persist to localStorage whenever state changes
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, String(isCollapsed));
        } catch {
            // ignore quota errors
        }
    }, [isCollapsed]);

    // Close mobile sidebar on resize to desktop
    useEffect(() => {
        const mql = window.matchMedia('(min-width: 1024px)');
        const handler = (e: MediaQueryListEvent) => {
            if (e.matches) setIsMobileOpen(false);
        };
        mql.addEventListener('change', handler);
        return () => mql.removeEventListener('change', handler);
    }, []);

    const toggleSidebar = useCallback(() => {
        setIsCollapsedState(prev => !prev);
    }, []);

    const openMobileSidebar = useCallback(() => setIsMobileOpen(true), []);
    const closeMobileSidebar = useCallback(() => setIsMobileOpen(false), []);

    return (
        <SidebarContext.Provider value={{
            isCollapsed,
            toggleSidebar,
            setIsCollapsed,
            isMobileOpen,
            openMobileSidebar,
            closeMobileSidebar,
        }}>
            {children}
        </SidebarContext.Provider>
    );
};

export const useSidebar = (): SidebarContextType => {
    const context = useContext(SidebarContext);
    if (context === undefined) {
        throw new Error('useSidebar must be used within a SidebarProvider');
    }
    return context;
};
