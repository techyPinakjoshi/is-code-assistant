import React from 'react';
import { User } from '../types';
import { CheckIcon, PremiumIcon, LockIcon, TeamIcon, AnalyticsIcon, ApiKeyIcon, UploadIcon, UserIcon, CameraIcon } from './icons';

interface UserDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUpgradeClick: () => void;
  onOpenAnalysis: () => void;
  onOpenBoqAnalysis: () => void;
}

const StatCard: React.FC<{ title: string; value: string | number; children?: React.ReactNode }> = ({ title, value, children }) => (
    <div className="bg-slate-100 p-4 rounded-lg text-center">
        <p className="text-sm text-slate-500">{title}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        {children}
    </div>
);

const FeatureLink: React.FC<{ 
    icon: React.ReactNode; 
    title: string; 
    description: string; 
    isLocked?: boolean; 
    onUpgradeClick: () => void;
    onActivate?: () => void;
}> = ({ icon, title, description, isLocked, onUpgradeClick, onActivate }) => (
    <div 
        onClick={() => {
            if (isLocked) {
                onUpgradeClick();
            } else if (onActivate) {
                onActivate();
            } else {
                alert(`Navigating to ${title}`);
            }
        }}
        className={`group flex items-center p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${isLocked ? 'border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-blue-400' : 'bg-white border-slate-200 hover:shadow-md'}`}
    >
        <div className={`flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg mr-4 transition-transform duration-300 group-hover:scale-110 ${isLocked ? 'text-slate-400' : 'bg-blue-100 text-blue-600'}`}>
            {icon}
        </div>
        <div className="flex-grow">
            <h4 className="font-semibold text-slate-800">{title}</h4>
            <p className="text-sm text-slate-500">{description}</p>
        </div>
        {isLocked && <LockIcon />}
    </div>
);

const UserDashboardModal: React.FC<UserDashboardModalProps> = ({ isOpen, onClose, user, onUpgradeClick, onOpenAnalysis, onOpenBoqAnalysis }) => {
  if (!isOpen) return null;

  const maxQueriesDisplay = user.usage.maxQueries === Infinity ? 'Unlimited' : user.usage.maxQueries;

  const renderFreeDashboard = () => (
    <>
        <div className="grid grid-cols-2 gap-4">
            <StatCard title="Today's Queries" value={`${user.usage.queriesToday} / ${maxQueriesDisplay}`} >
                <progress 
                    value={user.usage.queriesToday} 
                    max={user.usage.maxQueries as number}
                    className="w-full h-1.5 mt-2 [&::-webkit-progress-bar]:rounded-lg [&::-webkit-progress-value]:rounded-lg [&::-webkit-progress-bar]:bg-slate-300 [&::-webkit-progress-value]:bg-blue-500 [&::-moz-progress-bar]:bg-blue-500"
                />
            </StatCard>
            <StatCard title="Plan Expires On" value={user.planExpiry || 'N/A'} />
        </div>
        <div className="mt-6 bg-blue-50 border-2 border-blue-200 border-dashed p-6 rounded-lg text-center">
            <h3 className="text-xl font-bold text-blue-800">Unlock Your Full Potential</h3>
            <p className="text-blue-700 mt-2 mb-4">Upgrade to Pro for unlimited queries, saved conversations, and powerful AI analysis tools.</p>
            <button onClick={onUpgradeClick} className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200">
                Upgrade Now
            </button>
        </div>
        <div className="mt-6 space-y-3">
             <h4 className="text-lg font-semibold text-slate-700 mb-2">Features (Unlocked for Demo)</h4>
             {/* Unlocked for testing as requested */}
             <FeatureLink icon={<UploadIcon />} title="AI Project Dashboard" description="Verify BOQs and Plan Projects." onActivate={onOpenBoqAnalysis} />
             <FeatureLink icon={<TeamIcon />} title="Team Management" description="Collaborate with your colleagues." onActivate={() => alert('Team management is coming soon!')} />
        </div>
    </>
  );

  const renderProDashboard = () => (
    <>
        <div className="grid grid-cols-2 gap-4">
            <StatCard title="Query Usage" value="Unlimited" />
            <StatCard title="Plan Status" value="Active" />
        </div>
        
        <div className="mt-6 bg-amber-50 border-2 border-amber-200 border-dashed p-6 rounded-lg">
            <h3 className="text-xl font-bold text-amber-800">Need Team Features?</h3>
            <p className="text-amber-700 mt-2 mb-4">Upgrade to the Business Plan for team management, AI design analysis, and priority support.</p>
            <button onClick={onUpgradeClick} className="px-6 py-2 bg-amber-500 text-white font-semibold rounded-lg shadow-sm hover:bg-amber-600">
                Explore Business Plan
            </button>
        </div>
        <div className="mt-6 space-y-3">
             <h4 className="text-lg font-semibold text-slate-700 mb-2">Tools</h4>
             <FeatureLink icon={<UploadIcon />} title="AI Project Dashboard" description="Verify BOQs and Plan Projects." onActivate={onOpenBoqAnalysis} />
        </div>
    </>
  );

  const renderBusinessDashboard = () => (
     <>
        <div className="grid grid-cols-2 gap-4">
            <StatCard title="Team Seats" value="5 / 10 Used" />
            <StatCard title="Plan Status" value="Active" />
        </div>
        <div className="mt-6">
            <h4 className="text-lg font-semibold text-slate-700 mb-3">Your Quick Access Tools</h4>
            <div className="space-y-3">
                <FeatureLink icon={<UploadIcon />} title="AI Bill of Quantities Analysis" description="Upload plans and get instant analysis." onUpgradeClick={onUpgradeClick} onActivate={onOpenBoqAnalysis} />
                <FeatureLink icon={<TeamIcon />} title="Manage Your Team" description="Add or remove team members." onUpgradeClick={onUpgradeClick}/>
                <FeatureLink icon={<AnalyticsIcon />} title="View Progress Dashboard" description="Monitor project analytics." onUpgradeClick={onUpgradeClick}/>
            </div>
        </div>
         <div className="mt-6 text-center text-sm text-slate-500">
            <p>Need API access or live camera monitoring? <a href="#" onClick={(e) => { e.preventDefault(); onUpgradeClick(); }} className="font-semibold text-blue-600 hover:underline">Explore the Enterprise Plan</a>.</p>
        </div>
     </>
  );

  const renderEnterpriseDashboard = () => (
    <>
        <div className="bg-slate-800 text-white p-6 rounded-lg">
            <h3 className="text-xl font-bold">Welcome to the Enterprise Suite</h3>
            <p className="text-slate-300 mt-1">You have access to all our premium features and dedicated support.</p>
        </div>
        <div className="mt-6 grid md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg border">
                <h4 className="font-semibold text-slate-800">Your Account Manager</h4>
                <div className="flex items-center mt-3">
                    <div className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-200 mr-3"><UserIcon /></div>
                    <div>
                        <p className="font-medium text-slate-700">Aditya Sharma</p>
                        <a href="mailto:aditya.s@example.com" className="text-sm text-blue-600 hover:underline">aditya.s@example.com</a>
                    </div>
                </div>
            </div>
            <div className="bg-white p-4 rounded-lg border flex flex-col justify-center">
                 <h4 className="font-semibold text-slate-800">Support</h4>
                 <p className="text-sm text-slate-500 mt-1">Contact your dedicated support line for any assistance.</p>
            </div>
        </div>
         <div className="mt-6">
            <h4 className="text-lg font-semibold text-slate-700 mb-3">Enterprise Tools</h4>
            <div className="space-y-3">
                <FeatureLink icon={<ApiKeyIcon />} title="Access API Keys" description="Integrate our services into your workflow." onUpgradeClick={onUpgradeClick}/>
                <FeatureLink 
                  icon={<CameraIcon />} 
                  title="Live Camera Monitoring" 
                  description="Access the AI-powered site monitoring dashboard." 
                  onUpgradeClick={onUpgradeClick}
                  onActivate={onOpenAnalysis}
                />
                <FeatureLink icon={<AnalyticsIcon />} title="Usage & Analytics" description="Generate custom reports for your organization." onUpgradeClick={onUpgradeClick}/>
            </div>
        </div>
    </>
  );

  const renderDashboard = () => {
    switch (user.planId) {
        case 'free': return renderFreeDashboard(); // Now shows unlocked links
        case 'pro': return renderProDashboard();
        case 'business': return renderBusinessDashboard();
        case 'enterprise': return renderEnterpriseDashboard();
        default: return null;
    }
  };

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
        aria-modal="true"
        role="dialog"
    >
      <div 
        className="bg-slate-50 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 md:p-8">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                        Welcome, {user.name}!
                    </h2>
                    <p className="text-slate-500 mt-1">
                        Here's an overview of your <span className="font-semibold text-blue-600">{user.planName}</span> plan.
                    </p>
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            
            {renderDashboard()}

        </div>
      </div>
    </div>
  );
};

export default UserDashboardModal;