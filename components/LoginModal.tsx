
import React, { useState } from 'react';
import { GoogleIcon, AppleIcon } from './icons';
import { loginWithGoogle } from '../services/authService';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, password?: string) => Promise<void>;
  onSignup: (name: string, email: string, password?: string) => Promise<void>;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin, onSignup }) => {
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isSignupMode) {
        if (password.length < 6) {
             throw new Error("Password must be at least 6 characters long.");
        }
        await onSignup(name, email, password);
      } else {
        await onLogin(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
        await loginWithGoogle();
        // Redirect happens automatically
    } catch (err: any) {
        setError(err.message || 'Google login failed.');
        setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignupMode(!isSignupMode);
    setError('');
    setPassword('');
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8 relative">
          
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
                 <h2 className="text-2xl font-bold text-slate-900">{isSignupMode ? 'Create Account' : 'Welcome Back'}</h2>
                 <p className="text-sm text-slate-500 mt-1">{isSignupMode ? 'Join to save your projects securely.' : 'Log in to access your dashboard.'}</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Social Auth */}
          <div className="space-y-3">
             <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center py-2.5 px-4 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              <GoogleIcon />
              <span className="ml-2">Continue with Google</span>
            </button>
             <button
              onClick={() => alert("Apple Auth is under maintenance. Please use Google or Email.")}
              className="w-full flex items-center justify-center py-2.5 px-4 bg-slate-900 rounded-lg shadow-sm text-sm font-medium text-white hover:bg-slate-800 transition-colors"
            >
              <AppleIcon />
              <span className="ml-2">Continue with Apple</span>
            </button>
          </div>

          <div className="my-6 flex items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-slate-400 text-xs font-semibold tracking-wide uppercase">Or continue with email</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>
          
          {/* Email Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignupMode && (
                <div className="animate-fade-in">
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                    <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="John Doe"
                    required={isSignupMode}
                    />
                </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="you@example.com"
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="••••••••"
                required
              />
              {isSignupMode && <p className="text-xs text-slate-500 mt-1">Must be at least 6 characters.</p>}
            </div>

            {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-center">
                    <svg className="h-5 w-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? 'Processing...' : (isSignupMode ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          {/* Footer Toggle */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              {isSignupMode ? 'Already have an account?' : "Don't have an account?"}
              <button 
                onClick={toggleMode}
                className="ml-1 font-semibold text-blue-600 hover:text-blue-500 focus:outline-none hover:underline"
              >
                {isSignupMode ? 'Log In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
