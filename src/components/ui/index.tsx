import React from 'react';

// Badge component
interface BadgeProps {
    variant: 'success' | 'warning' | 'error' | 'info' | 'neutral';
    children: React.ReactNode;
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant, children, className = '' }) => {
    return (
        <span className={`badge badge-${variant} ${className}`}>
            {children}
        </span>
    );
};

// Status Badge with dot
interface StatusBadgeProps {
    status: 'active' | 'inactive' | 'pending' | 'exist' | 'closed' | 'relocated';
    showDot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, showDot = true }) => {
    const config: Record<string, { variant: BadgeProps['variant']; label: string }> = {
        active: { variant: 'success', label: 'Active' },
        inactive: { variant: 'neutral', label: 'Inactive' },
        pending: { variant: 'warning', label: 'Pending' },
        exist: { variant: 'success', label: 'Exist' },
        closed: { variant: 'error', label: 'Closed' },
        relocated: { variant: 'warning', label: 'Relocated' },
    };

    const { variant, label } = config[status] || { variant: 'neutral', label: status };

    return (
        <Badge variant={variant}>
            {showDot && (
                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${variant === 'success' ? 'bg-green-500' :
                    variant === 'warning' ? 'bg-yellow-500' :
                        variant === 'error' ? 'bg-red-500' :
                            variant === 'info' ? 'bg-blue-500' : 'bg-gray-400'
                    }`} />
            )}
            {label}
        </Badge>
    );
};

// Growth Indicator
interface GrowthIndicatorProps {
    value: number;
    showIcon?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export const GrowthIndicator: React.FC<GrowthIndicatorProps> = ({
    value,
    showIcon = true,
    size = 'md'
}) => {
    const isPositive = value > 0;
    const isNeutral = value === 0;

    const sizeClasses = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
    };

    return (
        <span className={`inline-flex items-center gap-1 font-medium ${sizeClasses[size]} ${isNeutral ? 'text-gray-500' : isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
            {showIcon && (
                <span className={`${isPositive ? '↑' : isNeutral ? '→' : '↓'}`} />
            )}
            <span>{isPositive ? '+' : ''}{value.toFixed(1)}%</span>
        </span>
    );
};

// Achievement Badge
interface AchievementBadgeProps {
    value: number; // percentage
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({ value }) => {
    const getVariant = (): BadgeProps['variant'] => {
        if (value >= 100) return 'success';
        if (value >= 80) return 'info';
        if (value >= 60) return 'warning';
        return 'error';
    };

    return (
        <Badge variant={getVariant()}>
            {value.toFixed(1)}%
        </Badge>
    );
};

// Button component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    children,
    className = '',
    disabled,
    ...props
}) => {
    const sizeClasses = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
    };

    return (
        <button
            className={`btn btn-${variant} ${sizeClasses[size]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
            ) : (
                <>
                    {leftIcon}
                    {children}
                    {rightIcon}
                </>
            )}
        </button>
    );
};

// Card component
interface CardProps {
    children: React.ReactNode;
    className?: string;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    padding = 'md',
    onClick
}) => {
    const paddingClasses = {
        none: '',
        sm: 'p-3',
        md: 'p-5',
        lg: 'p-6',
    };

    return (
        <div
            className={`card ${paddingClasses[padding]} ${className} ${onClick ? 'cursor-pointer' : ''}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
};

// Modal component
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
}) => {
    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className={`bg-white rounded-lg shadow-lg ${sizeClasses[size]} w-full mx-4 animate-fade-in`}
                onClick={e => e.stopPropagation()}
            >
                {title && (
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">{title}</h3>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

// Input component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    leftIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    helperText,
    leftIcon,
    className = '',
    ...props
}) => {
    return (
        <div className="space-y-1">
            {label && (
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}
            <div className="relative">
                {leftIcon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        {leftIcon}
                    </div>
                )}
                <input
                    className={`input ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''} ${className}`}
                    style={leftIcon ? { paddingLeft: '2.75rem' } : undefined}
                    {...props}
                />
            </div>
            {error && (
                <p className="text-xs text-red-500">{error}</p>
            )}
            {helperText && !error && (
                <p className="text-xs text-gray-500">{helperText}</p>
            )}
        </div>
    );
};

// Select component
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({
    label,
    error,
    options,
    className = '',
    ...props
}) => {
    return (
        <div className="space-y-1">
            {label && (
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}
            <select
                className={`input ${error ? 'border-red-500' : ''} ${className}`}
                {...props}
            >
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            {error && (
                <p className="text-xs text-red-500">{error}</p>
            )}
        </div>
    );
};
