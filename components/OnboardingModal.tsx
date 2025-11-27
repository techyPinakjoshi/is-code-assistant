
import React from 'react';
import { DashboardIcon, CheckIcon } from './icons';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose, userName }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in">
        <div className="bg-blue-600 p-6 text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <DashboardIcon />
            </div>
            <h2 className="text-2xl font-bold text-white">Welcome, {userName}!</h2>
            <p className="text-blue-100 mt-2">Your secure workspace is ready.</p>
        </div>
        
        <div className="p-8">
            <div className="space-y-6">
                <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-4">
                        <CheckIcon />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800">Projects are Auto-Saved</h3>
                        <p className="text-sm text-slate-600">Any project plan you generate is automatically saved to your account. Access them anytime from the Sidebar.</p>
                    </div>
                </div>
                <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-4">
                        <CheckIcon />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800">Chat History Persists</h3>
                        <p className="text-sm text-slate-600">Your queries with the AI assistant are stored securely locally. You can pick up right where you left off.</p>
                    </div>
                </div>
                <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-4">
                        <CheckIcon />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800">Secure Access</h3>
                        <p className="text-sm text-slate-600">Your data is linked to your email credentials. Simply log in again on any session to retrieve your work.</p>
                    </div>
                </div>
            </div>

            <button
                onClick={onClose}
                className="w-full mt-8 py-3 px-6 bg-slate-900 text-white font-bold rounded-lg shadow-lg hover:bg-slate-800 transition-transform transform hover:scale-[1.02]"
            >
                Get Started
            </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;
