
import React, { useEffect, useState } from 'react';
import { TeamIcon, PremiumIcon, RevenueIcon, AnalyticsIcon } from './icons';
import { getAllUsers } from '../services/authService';
import { User } from '../types';

interface AdminInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string; }> = ({ icon, title, value }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
        <div className="bg-slate-100 p-3 rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-sm text-slate-500">{title}</p>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
        </div>
    </div>
);

const AdminInsightsModal: React.FC<AdminInsightsModalProps> = ({ isOpen, onClose }) => {
    const [users, setUsers] = useState<User[]>([]);
    
    // Refresh data whenever modal opens
    useEffect(() => {
        if (isOpen) {
            const realUsers = getAllUsers();
            setUsers(realUsers);
        }
    }, [isOpen]);

    if (!isOpen) return null;
    
    // Calculate Real Metrics
    const totalUsers = users.length;
    const activeSubscriptions = users.filter(u => u.planId !== 'free').length;
    
    // Approximate MRR Calculation
    const mrr = users.reduce((acc, user) => {
        if (user.planId === 'pro') return acc + 999;
        if (user.planId === 'business') return acc + 5000;
        return acc;
    }, 0);

    // Calculate Breakdown
    const breakdown = {
        free: users.filter(u => u.planId === 'free').length,
        pro: users.filter(u => u.planId === 'pro').length,
        business: users.filter(u => u.planId === 'business').length,
        enterprise: users.filter(u => u.planId === 'enterprise').length,
    };

    const subBreakdownConfig = [
        { plan: 'Free', count: breakdown.free, color: 'bg-slate-400' },
        { plan: 'Pro', count: breakdown.pro, color: 'bg-blue-500' },
        { plan: 'Business', count: breakdown.business, color: 'bg-amber-500' },
        { plan: 'Enterprise', count: breakdown.enterprise, color: 'bg-purple-500' },
    ].filter(item => item.count > 0); // Only show active plans

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div
                className="bg-slate-50 rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-slate-200 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-2xl font-bold text-slate-900">App Management & Insights</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <div className="flex-grow p-6 overflow-y-auto space-y-6">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard icon={<TeamIcon />} title="Total Users" value={totalUsers.toLocaleString()} />
                        <StatCard icon={<PremiumIcon />} title="Active Subscriptions" value={activeSubscriptions.toLocaleString()} />
                        <StatCard icon={<RevenueIcon />} title="Est. Monthly Revenue" value={`₹${mrr.toLocaleString()}`} />
                        <StatCard icon={<AnalyticsIcon />} title="Total Database Records" value={totalUsers.toString()} />
                    </div>

                    {/* Subscription Breakdown */}
                    {totalUsers > 0 && (
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">Subscription Breakdown</h3>
                            <div className="space-y-3">
                            <div className="w-full flex rounded-full h-6 bg-slate-200 overflow-hidden">
                                    {subBreakdownConfig.map(sub => (
                                        <div 
                                            key={sub.plan}
                                            className={sub.color}
                                            style={{ width: `${(sub.count / totalUsers) * 100}%` }}
                                            title={`${sub.plan}: ${sub.count}`}
                                        ></div>
                                    ))}
                                </div>
                                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                                    {subBreakdownConfig.map(sub => (
                                        <div key={sub.plan} className="flex items-center">
                                            <span className={`h-3 w-3 rounded-full mr-2 ${sub.color}`}></span>
                                            <span className="text-slate-700 font-medium">{sub.plan}</span>
                                            <span className="text-slate-500 ml-2">{sub.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Recent Signups */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">Real Registered Users</h3>
                        {users.length === 0 ? (
                            <p className="text-slate-500 italic">No users registered yet.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-slate-500 uppercase bg-slate-100">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 rounded-l-lg">User</th>
                                            <th scope="col" className="px-6 py-3">Plan</th>
                                            <th scope="col" className="px-6 py-3 rounded-r-lg">Joined At</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.slice(0, 10).map((user, idx) => (
                                            <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-slate-800">{user.name}</div>
                                                    <div className="text-slate-500">{user.email}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                        user.planId === 'pro' ? 'bg-blue-100 text-blue-800' :
                                                        user.planId === 'business' ? 'bg-amber-100 text-amber-800' :
                                                        user.planId === 'enterprise' ? 'bg-purple-100 text-purple-800' :
                                                        'bg-slate-100 text-slate-800'
                                                    }`}>{user.planName}</span>
                                                </td>
                                                <td className="px-6 py-4 text-slate-500">
                                                    {user.joinedAt || 'N/A'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminInsightsModal;
