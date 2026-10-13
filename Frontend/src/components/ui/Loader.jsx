import React from 'react';

export function Spinner({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'h-4 w-4 w-6 h-6',
    md: 'h-8 w-8 w-10 h-10',
    lg: 'h-12 w-12 w-16 h-16'
  };
  return (
    <div
      className={`animate-spin rounded-full border-2 border-4  border-gray-200 dark:border-gray-700 border-t-green-600 dark:border-t-green-400 ${sizeClasses[size]} ${className}`}
    />
  );
}

export function Skeleton({ className = '' }) {
  return (
    <div className="space-y-3 w-full">
      <div className={`animate-pulse rounded-md bg-surface-alt bg-gray-200 dark:bg-gray-700 h-4 ${className}`} />
      {[...Array(2)].map((_, i) => (
        <div key={i} className={`h-4 rounded-lg animate-pulse bg-gray-200 dark:bg-gray-700 ${className}`} />
      ))}
    </div>
  );
}

const Loader = ({
  type = 'spinner',
  size = 'md',
  fullScreen = false,
  label = 'Loading...',
  className = '',
}) => {
  const content = type === 'skeleton' ? <Skeleton className={className} /> : <Spinner size={size} className={className} />;

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center z-50 bg-surface/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="text-center space-y-4 text-ink-soft dark:text-white">
          {content}
          {label && <p className="font-medium text-sm">{label}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      {content}
      {label && <p className="font-medium text-sm text-ink-soft-soft dark:text-gray-400">{label}</p>}
    </div>
  );
};

export default Loader;