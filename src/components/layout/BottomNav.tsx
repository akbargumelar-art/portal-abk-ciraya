/**
 * BottomNav — Navigasi bawah bergaya aplikasi mobile native.
 *
 * Menampilkan 5 tab terpenting. Tab "More" membuka drawer navigasi lengkap.
 * Menggunakan React Router NavLink untuk active state otomatis.
 */
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Store,
    TrendingUp,
    MoreHorizontal,
    Package,
} from 'lucide-react';
import { useSidebar } from '../../contexts/SidebarContext';

interface BottomTab {
    id: string;
    label: string;
    icon: React.ReactNode;
    path: string;
    /** Paths yang dianggap aktif untuk tab ini */
    matchPaths?: string[];
}

const BOTTOM_TABS: BottomTab[] = [
    {
        id: 'dashboard',
        label: 'Beranda',
        icon: <LayoutDashboard size={22} />,
        path: '/dashboard',
    },
    {
        id: 'outlet',
        label: 'Outlet',
        icon: <Store size={22} />,
        path: '/outlets',
        matchPaths: ['/outlets'],
    },
    {
        id: 'stock',
        label: 'Stock',
        icon: <Package size={22} />,
        path: '/stock/perdana',
        matchPaths: ['/stock/perdana', '/stock/voucher'],
    },
    {
        id: 'omzet',
        label: 'Omzet',
        icon: <TrendingUp size={22} />,
        path: '/omzet',
    },
    {
        id: 'more',
        label: 'Lainnya',
        icon: <MoreHorizontal size={22} />,
        path: '__more__',
    },
];

const BottomNav: React.FC = () => {
    const { openMobileSidebar } = useSidebar();
    const location = useLocation();

    const isTabActive = (tab: BottomTab): boolean => {
        if (tab.matchPaths) {
            return tab.matchPaths.some(p => location.pathname.startsWith(p));
        }
        return location.pathname === tab.path || location.pathname.startsWith(tab.path + '/');
    };

    return (
        <nav
            className="bottom-nav"
            aria-label="Navigasi utama"
        >
            {BOTTOM_TABS.map(tab => {
                if (tab.path === '__more__') {
                    return (
                        <button
                            key={tab.id}
                            onClick={openMobileSidebar}
                            className="bottom-nav-item"
                            aria-label="Menu lainnya"
                        >
                            <span className="bottom-nav-icon">{tab.icon}</span>
                            <span className="bottom-nav-label">{tab.label}</span>
                        </button>
                    );
                }

                const active = isTabActive(tab);
                return (
                    <NavLink
                        key={tab.id}
                        to={tab.path}
                        className={`bottom-nav-item ${active ? 'active' : ''}`}
                        aria-label={tab.label}
                    >
                        <span className={`bottom-nav-icon ${active ? 'active' : ''}`}>
                            {tab.icon}
                        </span>
                        <span className={`bottom-nav-label ${active ? 'active' : ''}`}>
                            {tab.label}
                        </span>
                        {active && <span className="bottom-nav-indicator" />}
                    </NavLink>
                );
            })}
        </nav>
    );
};

export default BottomNav;
