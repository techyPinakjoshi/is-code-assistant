import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
// FIX: Import AnalyticsIcon to resolve 'Cannot find name' error.
import { UserIcon, LogoutIcon, PremiumIcon, DashboardIcon, AnalyticsIcon } from './icons';

interface ProfileDropdownProps {
  user: User;
  onLogout: () => void;
  onManageSubscription: () => void;
  onOpenDashboard: () => void;
  onOpenAdminInsights: () => void;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ user, onLogout, onManageSubscription, onOpenDashboard, onOpenAdminInsights }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isFreeTrial = user.planId === 'free' && user.planExpiry;
  const maxQueriesDisplay = user.usage.maxQueries === Infinity ? 'Unlimited' : user.usage.maxQueries;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center h-10 w-10 bg-slate-200 text-slate-600 rounded-full hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform duration-300 hover:scale-110"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span className="sr-only">Open user menu</span>
        <UserIcon />
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-72 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-20">
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="user-menu-button">
            <div className="px-4 py-3 border-b border-slate-200">
              <p className="text-sm font-semibold text-slate-900" role="none">
                {user.name}
              </p>
              <p className="text-sm text-slate-500 truncate" role="none">
                {user.email}
              </p>
            </div>
            <div className="px-4 py-3">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-slate-700">Plan: <span className="font-bold text-blue-600">{user.planName}</span></span>
                </div>
                 {isFreeTrial && (
                    <p className="text-xs text-slate-500 mb-2">Trial expires on {user.planExpiry}</p>
                 )}
                <div>
                    <label htmlFor="usage-meter" className="text-sm text-slate-500">
                        Today's Queries: {user.usage.queriesToday} / {maxQueriesDisplay}
                    </label>
                    <progress 
                        id="usage-meter"
                        value={user.usage.maxQueries === Infinity ? 100 : user.usage.queriesToday} 
                        max={user.usage.maxQueries === Infinity ? 100 : user.usage.maxQueries}
                        className="w-full h-2 [&::-webkit-progress-bar]:rounded-lg [&::-webkit-progress-value]:rounded-lg [&::-webkit-progress-bar]:bg-slate-200 [&::-webkit-progress-value]:bg-blue-500 [&::-moz-progress-bar]:bg-blue-500"
                    >
                    </progress>
                </div>
            </div>
            <div className="border-t border-slate-200">
                <button
                    onClick={() => { onOpenDashboard(); setIsOpen(false); }}
                    className="group w-full text-left flex items-center px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"
                    role="menuitem"
                >
                    <span className="block transition-transform duration-300 group-hover:scale-110">
                      <DashboardIcon />
                    </span>
                    My Dashboard
                </button>
                 <button
                    onClick={() => { onManageSubscription(); setIsOpen(false); }}
                    className="group w-full text-left flex items-center px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"
                    role="menuitem"
                >
                    <span className="block transition-transform duration-300 group-hover:scale-110">
                      <PremiumIcon />
                    </span>
                    <span className='ml-2'>Manage Subscription</span>
                </button>
                 <button
                    onClick={() => { onOpenAdminInsights(); setIsOpen(false); }}
                    className="group w-full text-left flex items-center px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"
                    role="menuitem"
                >
                    <span className="block transition-transform duration-300 group-hover:scale-110">
                      <AnalyticsIcon />
                    </span>
                    <span className="ml-2">Manage App & Insights</span>
                </button>
                <button
                    onClick={onLogout}
                    className="group w-full text-left flex items-center px-4 py-3 text-sm text-red-600 hover:bg-slate-50"
                    role="menuitem"
                >
                    <span className="block transition-transform duration-300 group-hover:scale-110">
                      <LogoutIcon />
                    </span>
                    Logout
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;