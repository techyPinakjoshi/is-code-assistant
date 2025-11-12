import React, { useState } from 'react';
import { GoogleIcon, AppleIcon } from './icons';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, password?: string) => Promise<void>;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleAuthAttempt = async (authEmail: string, authPassword?: string) => {
    setIsLoading(true);
    setError('');
    try {
      await onLogin(authEmail, authPassword);
      onClose();
    } catch (err) {
      setError('Failed to authenticate. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAuthAttempt(email, password);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8 relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center rounded-2xl">
              <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Login or Sign Up</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-3">
             <button
              onClick={() => handleAuthAttempt('user@google.com')}
              className="group w-full flex items-center justify-center py-3 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <span className="block transition-transform duration-300 group-hover:scale-125">
                <GoogleIcon />
              </span>
              Continue with Google
            </button>
            <button
              onClick={() => handleAuthAttempt('user@apple.com')}
              className="group w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
            >
              <span className="block transition-transform duration-300 group-hover:scale-125">
                <AppleIcon />
              </span>
              Continue with Apple
            </button>
          </div>

          <div className="my-6 flex items-center">
            <div className="flex-grow border-t border-slate-300"></div>
            <span className="flex-shrink mx-4 text-slate-400 text-sm">OR</span>
            <div className="flex-grow border-t border-slate-300"></div>
          </div>
          
          <form onSubmit={handleEmailSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 sr-only">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full px-3 py-3 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Email Address"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 sr-only">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-3 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Password (optional)"
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>
            <div className="mt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400"
              >
                Continue with Email
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
