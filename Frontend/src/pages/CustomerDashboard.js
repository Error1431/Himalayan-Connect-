import React from 'react';
import { FaShoppingBag, FaHeart, FaHistory } from 'react-icons/fa';

const CustomerDashboard = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 py-12 pt-24">
            <h1 className="text-4xl font-black text-ink-soft dark:text-ink-soft mb-8">Traveler Dashboard</h1>
            <div className="bg-surface dark:bg-surface p-8 rounded-3xl border border-gray-100 dark:border-outline shadow-sm dark:shadow-none">
                <h2 className="text-2xl font-bold text-ink-soft dark:text-ink-soft mb-6">Your Activity</h2>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-surface-alt dark:bg-app-bg rounded-2xl">
                        <div className="flex items-center gap-4">
                            <FaShoppingBag className="text-xl text-ink-soft-soft dark:text-ink-soft-soft" />
                            <p className="font-semibold text-ink-soft dark:text-ink-soft">Recent Organic Purchase</p>
                        </div>
                        <span className="text-sm font-bold text-green-600">Delivered</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-surface-alt dark:bg-app-bg rounded-2xl">
                        <div className="flex items-center gap-4">
                            <FaHistory className="text-xl text-ink-soft-soft dark:text-ink-soft-soft" />
                            <p className="font-semibold text-ink-soft dark:text-ink-soft">Last Homestay Stay</p>
                        </div>
                        <span className="text-sm font-bold text-ink-soft-soft dark:text-ink-soft-soft">Chopta Valley</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default CustomerDashboard;