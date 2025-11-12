import React from 'react';
import { TeamIcon, PremiumIcon, RevenueIcon, AnalyticsIcon } from './icons';

interface AdminInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Mock Data
const insightsData = {
  totalUsers: 1428,
  activeSubscriptions: 312,
  mrr: 156000,
  totalQueries: 25789,
  subscriptionBreakdown: [
    { plan: 'Free', count: 1116, color: 'bg-slate-400' },
    { plan: 'Pro', count: 215, color: 'bg-blue-500' },
    { plan: 'Business', count: 89, color: 'bg-amber-500' },
    { plan: 'Enterprise', count: 8, color: 'bg-purple-500' },
  ],
  recentSignups: [
    { id: 1, name: 'Rohan Sharma', email: 'rohan.s@example.com', plan: 'Pro', date: '2 hours ago' },
    { id: 2, name: 'Priya Patel', email: 'priya.p@example.com', plan: 'Free', date: '5 hours ago' },
    { id: 3, name: 'Amit Kumar', email: 'amit.k@example.com', plan: 'Business', date: '1 day ago' },
    { id: 4, name: 'Sunita Devi', email: 'sunita.d@example.com', plan: 'Free', date: '1 day ago' },
    { id: 5, name: 'Vikram Singh', email: 'vikram.s@example.com', plan: 'Pro', date: '2 days ago' },
  ],
};

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
    if (!isOpen) return null;
    
    const totalSubs = insightsData.subscriptionBreakdown.reduce((acc, sub) => acc + sub.count, 0);

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div
                className="bg-slate-50 rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-slate-200 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-2xl font-bold text-slate-900">App Management & Insights</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <div className="flex-grow p-6 overflow-y-auto space-y-6">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard icon={<TeamIcon />} title="Total Users" value={insightsData.totalUsers.toLocaleString()} />
                        <StatCard icon={<PremiumIcon />} title="Active Subscriptions" value={insightsData.activeSubscriptions.toLocaleString()} />
                        <StatCard icon={<RevenueIcon />} title="Monthly Recurring Revenue" value={`₹${insightsData.mrr.toLocaleString()}`} />
                        <StatCard icon={<AnalyticsIcon />} title="Total Queries" value={insightsData.totalQueries.toLocaleString()} />
                    </div>

                    {/* Subscription Breakdown */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">Subscription Breakdown</h3>
                        <div className="space-y-3">
                           <div className="w-full flex rounded-full h-6 bg-slate-200 overflow-hidden">
                                {insightsData.subscriptionBreakdown.map(sub => (
                                    <div 
                                        key={sub.plan}
                                        className={sub.color}
                                        style={{ width: `${(sub.count / totalSubs) * 100}%` }}
                                        title={`${sub.plan}: ${sub.count}`}
                                    ></div>
                                ))}
                            </div>
                            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                                {insightsData.subscriptionBreakdown.map(sub => (
                                    <div key={sub.plan} className="flex items-center">
                                        <span className={`h-3 w-3 rounded-full mr-2 ${sub.color}`}></span>
                                        <span className="text-slate-700 font-medium">{sub.plan}</span>
                                        <span className="text-slate-500 ml-2">{sub.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    {/* Recent Signups */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Activity</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-100">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 rounded-l-lg">User</th>
                                        <th scope="col" className="px-6 py-3">Plan</th>
                                        <th scope="col" className="px-6 py-3 rounded-r-lg">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {insightsData.recentSignups.map(user => (
                                        <tr key={user.id} className="border-b border-slate-200 hover:bg-slate-50">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-slate-800">{user.name}</div>
                                                <div className="text-slate-500">{user.email}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                    user.plan === 'Pro' ? 'bg-blue-100 text-blue-800' :
                                                    user.plan === 'Business' ? 'bg-amber-100 text-amber-800' :
                                                    'bg-slate-100 text-slate-800'
                                                }`}>{user.plan}</span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500">{user.date}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminInsightsModal;
