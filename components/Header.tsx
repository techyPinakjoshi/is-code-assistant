import React from 'react';
import { PremiumIcon, MenuIcon } from './icons';
import { User } from '../types';
import ProfileDropdown from './ProfileDropdown';

interface HeaderProps {
  onPremiumClick: () => void;
  user: User | null;
  onLoginClick: () => void;
  onLogout: () => void;
  onOpenDashboard: () => void;
  onOpenAdminInsights: () => void;
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onPremiumClick, user, onLoginClick, onLogout, onOpenDashboard, onOpenAdminInsights, onMenuClick }) => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between max-w-4xl">
        <div className="flex items-center space-x-3">
          <button 
            onClick={onMenuClick} 
            className="p-2 -ml-2 rounded-md hover:bg-slate-100 text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-200"
            aria-label="Open Menu"
          >
            <MenuIcon />
          </button>
          <div className="bg-blue-600 p-2 rounded-lg">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
             </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-800 hidden sm:block">
            IS Code Assistant
          </h1>
        </div>
        <div className="flex items-center space-x-4">
            {(!user || user.planId === 'free') && (
                <button 
                    onClick={onPremiumClick}
                    className="group flex items-center space-x-2 px-3 py-2 bg-amber-400 text-amber-900 font-semibold rounded-lg shadow-sm hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors duration-200">
                    <span className="transition-transform duration-300 group-hover:scale-125">
                      <PremiumIcon />
                    </span>
                    <span className="hidden sm:inline">{user ? 'Upgrade' : 'Go Premium'}</span>
                </button>
            )}
           
            {user ? (
                <ProfileDropdown user={user} onLogout={onLogout} onManageSubscription={onPremiumClick} onOpenDashboard={onOpenDashboard} onOpenAdminInsights={onOpenAdminInsights} />
            ) : (
                 <button
                    onClick={onLoginClick}
                    className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                    >
                    Login
                </button>
            )}
        </div>
      </div>
    </header>
  );
};

export default Header;