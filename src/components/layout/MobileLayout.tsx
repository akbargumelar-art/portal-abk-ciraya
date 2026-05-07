/**
 * MobileLayout — Shell layout untuk perangkat mobile.
 *
 * Struktur:
 * ┌─────────────────────┐
 * │     MobileHeader    │  ← sticky top, 56px
 * ├─────────────────────┤
 * │                     │
 * │    Page Content     │  ← scrollable, pb-20 untuk bottom nav
 * │                     │
 * ├─────────────────────┤
 * │      BottomNav      │  ← fixed bottom, 60px
 * └─────────────────────┘
 *
 * Sidebar tetap ada sebagai drawer overlay (full-screen) untuk menu lengkap.
 */
import React, { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import MobileHeader from './MobileHeader';
import BottomNav from './BottomNav';
import Sidebar from './Sidebar';
import ErrorBoundary from '../common/ErrorBoundary';
import PageLoadingOverlay from '../common/PageLoadingOverlay';
import { useMobilePageTitle } from '../../hooks/useMobilePageTitle';

const MobileLayout: React.FC = () => {
    const location = useLocation();
    const pageTitle = useMobilePageTitle(location.pathname);

    return (
        <div className="mobile-shell">
            {/* Sidebar tetap sebagai drawer overlay */}
            <Sidebar />

            {/* Fixed header */}
            <MobileHeader title={pageTitle} />

            {/* Scrollable content area */}
            <main
                id="main-content"
                tabIndex={-1}
                className="mobile-main"
            >
                <ErrorBoundary>
                    <Suspense fallback={<PageLoadingOverlay />}>
                        <Outlet />
                    </Suspense>
                </ErrorBoundary>
            </main>

            {/* Fixed bottom navigation */}
            <BottomNav />
        </div>
    );
};

export default MobileLayout;
