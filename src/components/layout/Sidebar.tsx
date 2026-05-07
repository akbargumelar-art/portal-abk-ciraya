import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, useLocation } from 'react-router-dom';
import {
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    LogOut,
    LayoutDashboard,
    Store,
    Package,
    CreditCard,
    TrendingUp,
    ClipboardList,
    FileText,
    BarChart3,
    Users,
    Link,
    Settings,
    MessageSquare,
    Image,
    Zap,
    Target,
    Award,
    Gift,
    DollarSign,
    Upload,
    FolderOpen,
    Database,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSidebar } from '../../contexts/SidebarContext';
import { getNavigationForRole } from '../../config/navigation';
import type { NavItem } from '../../types';

// Floating popup component using Portal
interface FloatingPopupProps {
    item: NavItem;
    anchorRect: DOMRect | null;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    getIcon: (iconName: string) => React.ReactNode;
    onNavigate: () => void;
}

const FloatingPopup: React.FC<FloatingPopupProps> = ({
    item,
    anchorRect,
    onMouseEnter,
    onMouseLeave,
    getIcon,
    onNavigate
}) => {
    if (!anchorRect || !item.children) return null;

    const style: React.CSSProperties = {
        position: 'fixed',
        left: anchorRect.right + 8,
        top: anchorRect.top,
        zIndex: 9999,
    };

    return createPortal(
        <div
            style={style}
            className="min-w-[200px] bg-white rounded-lg shadow-xl border border-gray-200 py-2"
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            {/* Menu header */}
            <div className="px-4 py-2 border-b border-gray-100">
                <span className="text-sm font-semibold text-gray-900">{item.label}</span>
            </div>
            {/* Submenu items */}
            <ul className="py-1">
                {item.children.map(child => (
                    <li key={child.id}>
                        <NavLink
                            to={child.path}
                            onClick={onNavigate}
                            className={({ isActive }) => `
                                flex items-center gap-3 px-4 py-2 transition-all duration-200
                                ${isActive
                                    ? 'bg-gradient-to-r from-[#F13B4B] to-[#FF6B78] text-white'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                }
                            `}
                        >
                            {getIcon(child.icon)}
                            <span className="text-sm font-medium whitespace-nowrap">{child.label}</span>
                        </NavLink>
                    </li>
                ))}
            </ul>
        </div>,
        document.body
    );
};

// Tooltip component using Portal
interface TooltipProps {
    label: string;
    anchorRect: DOMRect | null;
}

const Tooltip: React.FC<TooltipProps> = ({ label, anchorRect }) => {
    if (!anchorRect) return null;

    const style: React.CSSProperties = {
        position: 'fixed',
        left: anchorRect.right + 8,
        top: anchorRect.top + anchorRect.height / 2,
        transform: 'translateY(-50%)',
        zIndex: 9999,
    };

    return createPortal(
        <div
            style={style}
            className="bg-gray-900 text-white px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap shadow-lg"
        >
            {label}
            {/* Arrow */}
            <div
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"
            />
        </div>,
        document.body
    );
};

const Sidebar: React.FC = () => {
    const { isCollapsed, toggleSidebar, isMobileOpen, closeMobileSidebar } = useSidebar();
    const { user, logout } = useAuth();
    const location = useLocation();
    const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});
    const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
    const [hoveredRect, setHoveredRect] = useState<DOMRect | null>(null);
    const menuRefs = useRef<Record<string, HTMLLIElement | null>>({});
    const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    if (!user) return null;

    const navItems = getNavigationForRole(user.role);

    const getIcon = (iconName: string) => {
        const icons: Record<string, React.ReactNode> = {
            dashboard: <LayoutDashboard size={20} />,
            outlet: <Store size={20} />,
            stock: <Package size={20} />,
            voucher: <CreditCard size={20} />,
            omzet: <TrendingUp size={20} />,
            salesPlan: <ClipboardList size={20} />,
            visit: <FileText size={20} />,
            reports: <BarChart3 size={20} />,
            users: <Users size={20} />,
            links: <Link size={20} />,
            settings: <Settings size={20} />,
            complaint: <MessageSquare size={20} />,
            pop: <Image size={20} />,
            sellThru: <Zap size={20} />,
            performance: <Target size={20} />,
            kpi: <Award size={20} />,
            program: <Gift size={20} />,
            fee: <DollarSign size={20} />,
            upload: <Upload size={20} />,
            docs: <FolderOpen size={20} />,
            doa: <Database size={20} />,
        };
        return icons[iconName] || <LayoutDashboard size={20} />;
    };

    const toggleMenu = (menuId: string) => {
        setExpandedMenus(prev => ({
            ...prev,
            [menuId]: !prev[menuId]
        }));
    };

    const isMenuActive = (item: NavItem): boolean => {
        if (item.children) {
            return item.children.some(child => location.pathname === child.path || location.pathname.startsWith(child.path + '/'));
        }
        return location.pathname === item.path || location.pathname.startsWith(item.path + '/');
    };

    const handleMouseEnter = (itemId: string) => {
        if (isCollapsed) {
            // Clear any pending timeout to close the menu
            if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
                hoverTimeoutRef.current = null;
            }
            const ref = menuRefs.current[itemId];
            if (ref) {
                setHoveredRect(ref.getBoundingClientRect());
            }
            setHoveredMenu(itemId);
        }
    };

    const handleMouseLeave = () => {
        if (isCollapsed) {
            // Add delay before closing the popup to give user time to move cursor
            hoverTimeoutRef.current = setTimeout(() => {
                setHoveredMenu(null);
                setHoveredRect(null);
            }, 150); // 150ms delay
        }
    };


    const renderNavItem = (item: NavItem) => {
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = expandedMenus[item.id] || isMenuActive(item);
        const isActive = isMenuActive(item);
        const isHovered = hoveredMenu === item.id;

        if (hasChildren) {
            return (
                <li
                    key={item.id}
                    ref={el => { menuRefs.current[item.id] = el; }}
                    className="relative"
                    onMouseEnter={() => handleMouseEnter(item.id)}
                    onMouseLeave={handleMouseLeave}
                >
                    <button
                        onClick={() => !isCollapsed && toggleMenu(item.id)}
                        className={`
                            flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 w-full
                            ${isActive
                                ? 'bg-red-50 text-[#F13B4B]'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                            }
                            ${isCollapsed ? 'justify-center' : ''}
                        `}
                        title={isCollapsed ? item.label : undefined}
                    >
                        {getIcon(item.icon)}
                        {!isCollapsed && (
                            <>
                                <span className="text-sm font-medium whitespace-nowrap flex-1 text-left">{item.label}</span>
                                <ChevronDown
                                    size={16}
                                    className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                                />
                            </>
                        )}
                    </button>

                    {/* Expanded submenu for normal sidebar */}
                    {!isCollapsed && isExpanded && (
                        <ul className="mt-1 ml-4 pl-4 border-l border-gray-200 space-y-1">
                            {item.children!.map(child => (
                                <li key={child.id}>
                                    <NavLink
                                        to={child.path}
                                        className={({ isActive }) => `
                                            flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200
                                            ${isActive
                                                ? 'bg-gradient-to-r from-[#F13B4B] to-[#FF6B78] text-white shadow-md'
                                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                            }
                                        `}
                                    >
                                        {getIcon(child.icon)}
                                        <span className="text-sm font-medium whitespace-nowrap">{child.label}</span>
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    )}

                    {/* Floating popup for collapsed sidebar - using Portal */}
                    {isCollapsed && isHovered && (
                        <FloatingPopup
                            item={item}
                            anchorRect={hoveredRect}
                            onMouseEnter={() => setHoveredMenu(item.id)}
                            onMouseLeave={handleMouseLeave}
                            getIcon={getIcon}
                            onNavigate={handleMouseLeave}
                        />
                    )}
                </li>
            );
        }

        return (
            <li
                key={item.id}
                ref={el => { menuRefs.current[item.id] = el; }}
                className="relative"
                onMouseEnter={() => handleMouseEnter(item.id)}
                onMouseLeave={handleMouseLeave}
            >
                <NavLink
                    to={item.path}
                    className={({ isActive }) => `
                        flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                        ${isActive
                            ? 'bg-gradient-to-r from-[#F13B4B] to-[#FF6B78] text-white shadow-md'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }
                        ${isCollapsed ? 'justify-center' : ''}
                    `}
                    title={isCollapsed ? item.label : undefined}
                >
                    {getIcon(item.icon)}
                    {!isCollapsed && (
                        <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
                    )}
                </NavLink>

                {/* Tooltip for collapsed sidebar (single items) - using Portal */}
                {isCollapsed && isHovered && (
                    <Tooltip label={item.label} anchorRect={hoveredRect} />
                )}
            </li>
        );
    };

    return (
        <>
            {/* Mobile Backdrop */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-30 lg:hidden"
                    onClick={closeMobileSidebar}
                    aria-hidden="true"
                />
            )}

            <aside
                className={`
                    fixed left-0 top-0 h-screen bg-white border-r border-gray-200 z-40 flex flex-col
                    transition-all duration-300
                    ${isCollapsed ? 'lg:w-[72px]' : 'lg:w-64'}
                    w-64
                    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}
            >
                {/* Logo Section */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F13B4B] to-[#D92939] flex items-center justify-center shadow-lg flex-shrink-0">
                            <span className="text-white font-bold text-lg">CR</span>
                        </div>
                        {!isCollapsed && (
                            <div className="overflow-hidden">
                                <h1 className="font-bold text-gray-900 text-sm whitespace-nowrap">Portal Cirebon Raya</h1>
                                <p className="text-xs text-gray-500 whitespace-nowrap">PT Agrabudi Komunika</p>
                            </div>
                        )}
                    </div>
                    {/* Close button on mobile */}
                    <button
                        onClick={closeMobileSidebar}
                        className="lg:hidden p-1.5 hover:bg-gray-100 rounded-lg text-gray-500"
                        aria-label="Tutup sidebar"
                    >
                        ✕
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-4 px-3 overflow-y-auto" aria-label="Navigasi utama">
                    <ul className="space-y-1">
                        {navItems.map((item) => renderNavItem(item))}
                    </ul>
                </nav>

                {/* User Section */}
                <div className="p-3 border-t border-gray-200">
                    {!isCollapsed && (
                        <div className="flex items-center gap-3 px-3 py-2 mb-2">
                            <img
                                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=F13B4B&color=fff`}
                                alt={`Avatar ${user.name}`}
                                className="w-9 h-9 rounded-full object-cover ring-2 ring-gray-100 flex-shrink-0"
                            />
                            <div className="overflow-hidden flex-1">
                                <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                                <p className="text-xs text-gray-500 truncate capitalize">{user.role.replace('_', ' ')}</p>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={logout}
                        className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors ${isCollapsed ? 'justify-center' : ''}`}
                        title={isCollapsed ? 'Logout' : undefined}
                    >
                        <LogOut size={20} />
                        {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
                    </button>
                </div>

                {/* Collapse Toggle — desktop only */}
                <button
                    onClick={toggleSidebar}
                    className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 rounded-full items-center justify-center shadow-sm hover:bg-gray-50 transition-colors z-50"
                    aria-label={isCollapsed ? 'Buka sidebar' : 'Tutup sidebar'}
                >
                    {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>
            </aside>
        </>
    );
};

export default Sidebar;

