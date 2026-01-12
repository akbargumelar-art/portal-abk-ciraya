import React, { createContext, useContext, useState } from 'react';

// Tab Context
interface TabsContextType {
    activeTab: string;
    setActiveTab: (id: string) => void;
}

const TabsContext = createContext<TabsContextType | null>(null);

// Tabs Container
interface TabsProps {
    defaultValue: string;
    children: React.ReactNode;
    className?: string;
    onValueChange?: (value: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({ defaultValue, children, className = '', onValueChange }) => {
    const [activeTab, setActiveTabState] = useState(defaultValue);

    const setActiveTab = (value: string) => {
        setActiveTabState(value);
        if (onValueChange) onValueChange(value);
    };

    return (
        <TabsContext.Provider value={{ activeTab, setActiveTab }}>
            <div className={className}>{children}</div>
        </TabsContext.Provider>
    );
};

// TabList - Container for Tab buttons
interface TabListProps {
    children: React.ReactNode;
    className?: string;
}

export const TabList: React.FC<TabListProps> = ({ children, className = '' }) => {
    return (
        <div className={`flex border-b border-gray-200 bg-gray-50 rounded-t-lg overflow-hidden ${className}`}>
            {children}
        </div>
    );
};

// Tab - Individual tab button
interface TabProps {
    value: string;
    children: React.ReactNode;
    className?: string;
    icon?: React.ReactNode;
}

export const Tab: React.FC<TabProps> = ({ value, children, className = '', icon }) => {
    const context = useContext(TabsContext);
    if (!context) throw new Error('Tab must be used within Tabs');

    const { activeTab, setActiveTab } = context;
    const isActive = activeTab === value;

    return (
        <button
            onClick={() => setActiveTab(value)}
            className={`
                relative flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all duration-200
                ${isActive
                    ? 'text-[#F13B4B] bg-white border-b-2 border-[#F13B4B] -mb-[1px]'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }
                ${className}
            `}
        >
            {icon && <span className={isActive ? 'text-[#F13B4B]' : 'text-gray-400'}>{icon}</span>}
            {children}
        </button>
    );
};

// TabPanel - Content container for each tab
interface TabPanelProps {
    value: string;
    children: React.ReactNode;
    className?: string;
}

export const TabPanel: React.FC<TabPanelProps> = ({ value, children, className = '' }) => {
    const context = useContext(TabsContext);
    if (!context) throw new Error('TabPanel must be used within Tabs');

    const { activeTab } = context;

    if (activeTab !== value) return null;

    return (
        <div className={`animate-fade-in ${className}`}>
            {children}
        </div>
    );
};

export default Tabs;
