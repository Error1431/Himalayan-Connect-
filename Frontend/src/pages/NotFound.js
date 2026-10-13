// src/pages/NotFound.js
import React from 'react';
import { Link } from 'react-router-dom';
import { FaExclamationTriangle } from 'react-icons/fa';

const NotFound = () => {
    return (
        <div className="min-h-[75vh] flex flex-col items-center justify-center bg-surface-alt dark:bg-app-bg px-4 text-center pt-24">
            <div className="relative mb-6">
                <div className="absolute inset-0 bg-amber-500/10 blur-3xl rounded-full w-32 h-32 mx-auto" />
                <FaExclamationTriangle className="text-6xl text-amber-500 relative z-10 animate-pulse mx-auto" />
            </div>

            <h1 className="text-7xl font-black text-ink-soft dark:text-ink-soft tracking-tight">404</h1>
            <h2 className="text-2xl font-bold text-ink-soft dark:text-ink-soft mt-2">Page Not Found</h2>

            <p className="text-gray-500 dark:text-ink-soft-soft text-sm mt-2 max-w-md mx-auto leading-relaxed">
                The path you requested seems to have been lost in the mountain mist. It might have been moved or doesn't exist in this build matrix.
            </p>

            <Link
                to="/"
                className="mt-8 bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-3.5 rounded-2xl text-sm transition-all shadow-lg shadow-green-900/20 active:scale-95"
            >
                Return to Base Camp (Home)
            </Link>
        </div>
    );
};

export default NotFound;