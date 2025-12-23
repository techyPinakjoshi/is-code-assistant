
import React, { useEffect, useState } from 'react';
import { TeamIcon, PremiumIcon, RevenueIcon, AnalyticsIcon, PlusIcon, DocumentIcon, LockIcon, CheckIcon, CopyIcon, CubeIcon } from './icons';
import { getAllUsers } from '../services/authService';
import { User } from '../types';
import RAGUploadModal from './RAGUploadModal';

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
    const [isRAGModalOpen, setIsRAGModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'insights' | 'domain' | 'fix'>('insights');
    
    useEffect(() => {
        if (isOpen) {
            const realUsers = getAllUsers();
            setUsers(realUsers);
        }
    }, [isOpen]);

    if (!isOpen) return null;
    
    const totalUsers = users.length;
    const activeSubscriptions = users.filter(u => u.planId !== 'free').length;
    
    const mrr = users.reduce((acc, user) => {
        if (user.planId === 'pro') return acc + 999;
        if (user.planId === 'business') return acc + 5000;
        return acc;
    }, 0);

    const envStatus = {
        supabaseUrl: !!process.env.VITE_SUPABASE_URL,
        supabaseKey: !!process.env.VITE_SUPABASE_ANON_KEY,
        geminiKey: !!process.env.API_KEY
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert(`Copied: ${text}`);
    };

    return (
        <>
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
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Admin Console</h2>
                        <div className="flex mt-2 space-x-4">
                            <button 
                                onClick={() => setActiveTab('insights')}
                                className={`text-sm font-semibold pb-1 border-b-2 transition-colors ${activeTab === 'insights' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                            >
                                Usage Insights
                            </button>
                            <button 
                                onClick={() => setActiveTab('domain')}
                                className={`text-sm font-semibold pb-1 border-b-2 transition-colors ${activeTab === 'domain' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                            >
                                Domain Setup
                            </button>
                            <button 
                                onClick={() => setActiveTab('fix')}
                                className={`text-sm font-bold pb-1 border-b-2 transition-colors ${activeTab === 'fix' ? 'border-red-600 text-red-600' : 'border-transparent text-red-400 hover:text-red-500'}`}
                            >
                                🆘 Fix Connection Error
                            </button>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <div className="flex-grow p-6 overflow-y-auto space-y-6">
                    {activeTab === 'insights' ? (
                        <>
                            <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-bold text-blue-900">Knowledge Base (RAG)</h3>
                                    <p className="text-sm text-blue-700 mt-1">Upload IS Code clauses to the vector database to improve AI accuracy.</p>
                                </div>
                                <button onClick={() => setIsRAGModalOpen(true)} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-colors font-semibold text-sm">
                                    <span className="mr-2"><PlusIcon /></span> Add Document
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <StatCard icon={<TeamIcon />} title="Total Users" value={totalUsers.toLocaleString()} />
                                <StatCard icon={<PremiumIcon />} title="Active Subscriptions" value={activeSubscriptions.toLocaleString()} />
                                <StatCard icon={<RevenueIcon />} title="Est. Monthly Revenue" value={`₹${mrr.toLocaleString()}`} />
                                <StatCard icon={<AnalyticsIcon />} title="Database Records" value={totalUsers.toString()} />
                            </div>
                        </>
                    ) : activeTab === 'domain' ? (
                        <div className="animate-fade-in space-y-6">
                            {/* Architecture Map */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                <h3 className="text-lg font-semibold text-slate-800 mb-6 text-center">Correct Setup for weautomates.com</h3>
                                <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8">
                                    <div className="text-center w-40">
                                        <div className="p-4 bg-slate-100 rounded-lg border border-slate-200 flex flex-col items-center">
                                            <span className="text-2xl mb-1">🌍</span>
                                            <span className="text-xs font-bold text-slate-700 uppercase">BigRock</span>
                                        </div>
                                        <p className="text-[10px] text-slate-500 mt-2">A-Record: 76.76.21.21</p>
                                    </div>
                                    <div className="text-slate-300 hidden md:block">➔</div>
                                    <div className="text-center w-40">
                                        <div className="p-4 bg-blue-600 rounded-lg border border-blue-700 flex flex-col items-center text-white shadow-lg">
                                            <span className="text-2xl mb-1">🚀</span>
                                            <span className="text-xs font-bold uppercase">Vercel</span>
                                        </div>
                                        <p className="text-[10px] text-blue-600 mt-2 font-bold uppercase">Add Domain Here!</p>
                                    </div>
                                    <div className="text-slate-300 hidden md:block">➔</div>
                                    <div className="text-center w-40">
                                        <div className="p-4 bg-emerald-100 rounded-lg border border-emerald-200 flex flex-col items-center">
                                            <span className="text-2xl mb-1">⚡</span>
                                            <span className="text-xs font-bold text-emerald-800 uppercase">Supabase</span>
                                        </div>
                                        <p className="text-[10px] text-emerald-600 mt-2">Database & Auth</p>
                                    </div>
                                </div>
                            </div>

                            {/* BigRock Setup Checklist */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                <h3 className="text-lg font-semibold text-slate-800 mb-4">Step 1: BigRock DNS Settings</h3>
                                <div className="overflow-hidden border border-slate-200 rounded-lg">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-100 text-slate-500 uppercase text-xs">
                                            <tr>
                                                <th className="px-6 py-3">Type</th>
                                                <th className="px-6 py-3">Host</th>
                                                <th className="px-6 py-3">Value</th>
                                                <th className="px-6 py-3">Copy</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            <tr>
                                                <td className="px-6 py-4 font-bold text-blue-600">A</td>
                                                <td className="px-6 py-4 font-mono">@</td>
                                                <td className="px-6 py-4 font-mono">76.76.21.21</td>
                                                <td className="px-6 py-4">
                                                    <button onClick={() => copyToClipboard('76.76.21.21')} className="p-1 hover:text-blue-600"><CopyIcon /></button>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="px-6 py-4 font-bold text-blue-600">CNAME</td>
                                                <td className="px-6 py-4 font-mono">www</td>
                                                <td className="px-6 py-4 font-mono">cname.vercel-dns.com</td>
                                                <td className="px-6 py-4">
                                                    <button onClick={() => copyToClipboard('cname.vercel-dns.com')} className="p-1 hover:text-blue-600"><CopyIcon /></button>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="animate-fade-in space-y-6">
                            <div className="bg-red-50 border border-red-100 p-6 rounded-xl">
                                <h3 className="text-xl font-bold text-red-800 flex items-center mb-2">
                                    <span className="mr-2">🛠️</span> Fixing "Connection Closed" (Kid-Style)
                                </h3>
                                
                                <div className="bg-blue-600 text-white p-4 rounded-lg shadow-md mb-6">
                                    <h4 className="font-bold flex items-center uppercase text-sm tracking-widest">
                                        <span className="mr-2">📍</span> The Correct Path in Vercel
                                    </h4>
                                    <div className="flex items-center space-x-2 mt-3 overflow-x-auto pb-2 text-xs md:text-sm whitespace-nowrap">
                                        <div className="bg-white/20 px-3 py-1 rounded">Vercel Home</div>
                                        <span>➜</span>
                                        <div className="bg-white px-3 py-1 rounded text-blue-600 font-bold">Your Project</div>
                                        <span>➜</span>
                                        <div className="bg-white/20 px-3 py-1 rounded">Settings</div>
                                        <span>➜</span>
                                        <div className="bg-white/20 px-3 py-1 rounded underline">Domains</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                                    {/* Detailed Vercel Guide to fix "No project found" search confusion */}
                                    <div className="bg-white p-6 rounded-lg border border-blue-200 shadow-sm border-l-8 border-l-blue-500">
                                        <h4 className="font-bold text-blue-800 mb-4 flex items-center">
                                            <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center mr-2 text-xs">!</span>
                                            Stop using the Search Bar!
                                        </h4>
                                        <div className="space-y-4 text-slate-700">
                                            <div className="flex items-start">
                                                <div className="bg-slate-100 text-slate-600 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs mr-3 mt-0.5 flex-shrink-0">1</div>
                                                <p className="text-sm"><b>Don't search at the top.</b> That search bar is broken for what we need. It will just say "No Project Found".</p>
                                            </div>
                                            <div className="flex items-start">
                                                <div className="bg-slate-100 text-slate-600 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs mr-3 mt-0.5 flex-shrink-0">2</div>
                                                <p className="text-sm">Instead, scroll down and find your project folder card (it looks like a white box with your app name) and <b>click on it</b>.</p>
                                            </div>
                                            <div className="flex items-start">
                                                <div className="bg-slate-100 text-slate-600 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs mr-3 mt-0.5 flex-shrink-0">3</div>
                                                <p className="text-sm">Now look at the top menu bar. Click the word <b>Settings</b>. It's next to "Deployments" and "Analytics".</p>
                                            </div>
                                            <div className="flex items-start">
                                                <div className="bg-slate-100 text-slate-600 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs mr-3 mt-0.5 flex-shrink-0">4</div>
                                                <p className="text-sm">On the left side of the screen, click <b>Domains</b>.</p>
                                            </div>
                                            <div className="flex items-start border-t border-slate-100 pt-4 mt-4">
                                                <div className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs mr-3 mt-0.5 flex-shrink-0">✔</div>
                                                <p className="text-sm font-bold text-blue-700">Type "weautomates.com" in the big box. The blue ADD button will finally appear!</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-white p-5 rounded-lg border border-red-200 shadow-sm">
                                            <h4 className="font-bold text-slate-800 text-sm">A: Check BigRock</h4>
                                            <p className="text-xs text-slate-500 mt-1">Make sure A-Record is <b>76.76.21.21</b>.</p>
                                        </div>
                                        <div className="bg-white p-5 rounded-lg border border-red-200 shadow-sm">
                                            <h4 className="font-bold text-slate-800 text-sm">B: SSL Lock</h4>
                                            <p className="text-xs text-slate-500 mt-1">Wait 10 mins for Vercel to make the lock 🔒 symbol green.</p>
                                        </div>
                                        <div className="bg-white p-5 rounded-lg border border-red-200 shadow-sm">
                                            <h4 className="font-bold text-slate-800 text-sm">C: Magic Refresh</h4>
                                            <p className="text-xs text-slate-500 mt-1">Wait for a short nap (5 mins) then refresh your page.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 p-4 bg-white rounded-lg border border-slate-200 text-center">
                                    <p className="text-sm font-bold text-slate-700">Still stuck?</p>
                                    <p className="text-xs text-slate-500 mt-1">Sometimes the internet takes up to 24 hours to "wake up" to new domain names in India. Just wait one night!</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
        
        <RAGUploadModal isOpen={isRAGModalOpen} onClose={() => setIsRAGModalOpen(false)} />
        </>
    );
};

export default AdminInsightsModal;
