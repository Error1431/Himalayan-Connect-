import React from 'react';

export default function Button({
    variant = 'primary',
    size = 'md',
    disabled = false,
    onClick,
    children,
    className = '',
    type = 'button',
    loading = false,
    fullWidth = false,
    icon: Icon,
    ...props
}) {
    const baseStyles = 'inline-flex items-center justify-center gap-2 font-bold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none';

    const variants = {
        primary: 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md shadow-green-900/10 hover:shadow-green-900/20 focus:ring-green-500 dark:from-green-500 dark:to-emerald-500 dark:hover:from-green-600 dark:hover:to-emerald-600',
        secondary: 'bg-surface-alt hover:bg-gray-200 text-ink-soft focus:ring-gray-400 dark:bg-surface dark:hover:bg-surface dark:text-white dark:focus:ring-slate-500',
        outline: 'bg-transparent border-2 border-green-600 text-green-600 hover:bg-green-50 focus:ring-green-500 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-400/10 dark:focus:ring-green-400',
        danger: 'bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-900/10 focus:ring-red-500',
        ghost: 'text-ink-soft-soft hover:bg-surface-alt dark:text-gray-400 dark:hover:bg-gray-800 focus:ring-gray-400'
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-3.5 text-lg'
    };

    return (
        <button
            type={type}
            disabled={disabled || loading}
            onClick={onClick}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
            {...props}
        >
            {Icon && !loading && <Icon className="text-lg" />}
            {loading && (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            )}
            {children}
        </button>
    );
}