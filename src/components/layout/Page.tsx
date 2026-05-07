import React from 'react';
import Header from './Header';
import { Card } from '../ui';

interface PageShellProps {
    title: string;
    subtitle?: string;
    actions?: React.ReactNode;
    children: React.ReactNode;
    hideHeader?: boolean;
    className?: string;
    contentClassName?: string;
}

export const PageShell: React.FC<PageShellProps> = ({
    title,
    subtitle,
    actions,
    children,
    hideHeader = false,
    className = '',
    contentClassName = '',
}) => (
    <div className={`min-h-screen animate-fade-in ${className}`}>
        {!hideHeader && <Header title={title} subtitle={subtitle} actions={actions} />}
        <div className={`p-4 sm:p-6 ${contentClassName}`}>
            {children}
        </div>
    </div>
);

interface ContentPanelProps {
    title?: string;
    subtitle?: string;
    actions?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const ContentPanel: React.FC<ContentPanelProps> = ({
    title,
    subtitle,
    actions,
    children,
    className = '',
    padding = 'none',
}) => (
    <Card padding={padding} className={`overflow-hidden ${className}`}>
        {(title || subtitle || actions) && (
            <div className="flex flex-col gap-3 border-b border-gray-100 bg-gray-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    {title && <h3 className="font-semibold text-gray-900">{title}</h3>}
                    {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
                </div>
                {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
            </div>
        )}
        {children}
    </Card>
);
