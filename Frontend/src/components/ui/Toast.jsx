import React, { createContext, useCallback, useContext, useState } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';

const ToastContext = createContext(null);

const icons = {
    success: <FaCheckCircle className="text-green-500" />,
    error: <FaExclamationCircle className="text-red-500" />,
    info: <FaInfoCircle className="text-blue-500" />,
    warning: <FaExclamationCircle className="text-yellow-500" />
};

const bgColors = {
    success: 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-900/50',
    error: 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900/50',
    info: 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900/50',
    warning: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-900/50'
};

export const Toast = ({ message, type = 'info', onClose }) => {
    return (
        <div className={`${bgColors[type]} border rounded-xl p-4 shadow-xl flex items-center gap-3 animate-slideIn transition-all duration-300 backdrop-blur-sm min-w-[300px]`}>
            <div className="text-xl shrink-0">
                {icons[type]}
            </div>
            <p className="flex-1 text-sm font-semibold text-ink-soft dark:border-outline leading-relaxed">{message}</p>
            {onClose && (
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-ink-soft-soft dark:hover:border-outline transition p-1 rounded-lg hover:bg-black/5 dark:hover:bg-surface/5"
                >
                    <FaTimes />
                </button>
            )}
        </div>
    );
};

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 3000) => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-3 max-w-md w-full sm:w-auto">
                {toasts.map((t) => (
                    <Toast
                        key={t.id}
                        message={t.message}
                        type={t.type}
                        onClose={() => removeToast(t.id)}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return ctx;
}

export default Toast;