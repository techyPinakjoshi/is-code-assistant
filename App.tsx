import React, { useState, useCallback, useRef } from 'react';
import { getConstructionInfo } from './services/geminiService';
import { login, updateUserPlan } from './services/authService';
import { Category, User, Plan, PlanId } from './types';
import Header from './components/Header';
import CategoryButton from './components/CategoryButton';
import ResponseDisplay from './components/ResponseDisplay';
import SubscriptionModal from './components/SubscriptionModal';
import LoginModal from './components/LoginModal';
import PaymentModal from './components/PaymentModal';
import UserDashboardModal from './components/UserDashboardModal';
import ProgressAnalysisModal from './components/ProgressAnalysisModal';
import AdminInsightsModal from './components/AdminInsightsModal';
import { BuildingIcon, RoadIcon, DamIcon, WaterTankIcon, MaterialIcon, AuditIcon, BridgeIcon, PipelineIcon, ElectricalIcon, FireSafetyIcon, EarthquakeIcon, WindLoadIcon, UploadIcon, LockIcon, SiteAnalysisIcon } from './components/icons';

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [response, setResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isDashboardModalOpen, setIsDashboardModalOpen] = useState(false);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [isAdminInsightsModalOpen, setIsAdminInsightsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const responseRef = useRef<HTMLDivElement>(null);

  const categories: { name: Category; icon: React.ReactNode; prompt: string }[] = [
    // Core Structures
    { name: 'Buildings', icon: <BuildingIcon />, prompt: 'What are the key IS codes for concrete mix design in residential buildings?' },
    { name: 'Roads', icon: <RoadIcon />, prompt: 'Provide a summary of material specifications for flexible pavement construction as per Indian standards.' },
    { name: 'Bridges & Culverts', icon: <BridgeIcon />, prompt: 'What are the primary IS codes governing the design and construction of reinforced concrete bridges in India?' },
    { name: 'Dams', icon: <DamIcon />, prompt: 'Explain the standard safety audit procedures for concrete gravity dams in India.' },
    { name: 'Water Tanks', icon: <WaterTankIcon />, prompt: 'What are the design and construction guidelines for reinforced concrete water tanks according to IS codes?' },
    // Structural Analysis
    { name: 'Earthquake Resistance', icon: <EarthquakeIcon />, prompt: 'Explain the principles of ductile detailing for reinforced concrete structures in seismic zones according to IS 13920.' },
    { name: 'Wind Load Analysis', icon: <WindLoadIcon />, prompt: 'How is the basic wind speed and design wind pressure calculated for a building in India as per IS 875 (Part 3)?' },
    // Building Systems
    { name: 'Pipelines & Drainage', icon: <PipelineIcon />, prompt: 'What are the IS codes for laying and testing of water supply pipelines and drainage systems?' },
    { name: 'Electrical Systems', icon: <ElectricalIcon />, prompt: 'Summarize the key IS codes for electrical wiring and installations in residential buildings.' },
    // Safety & Quality
    { name: 'Fire Safety', icon: <FireSafetyIcon />, prompt: 'Outline the fire safety requirements for high-rise buildings as per the National Building Code of India.' },
    { name: 'Material Testing', icon: <MaterialIcon />, prompt: 'Describe the standard test for compressive strength of concrete cubes as per IS 516.' },
    { name: 'Structural Audits', icon: <AuditIcon />, prompt: 'Outline the process for a structural audit of a 30-year-old building based on Indian standards.' },
  ];
  
  const handleCategorySelect = useCallback((category: Category, prompt: string) => {
    setActiveCategory(category);
    setQuery(prompt);
    setResponse('');
    setError(null);
  }, []);

  const handleSubmit = useCallback(async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (!query || isLoading) return;

    setIsLoading(true);
    setError(null);
    setResponse('');

    try {
      const result = await getConstructionInfo(query);
      setResponse(result);
      setTimeout(() => {
         responseRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      setError('Failed to get information. Please check your connection and API key.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [query, isLoading]);

  const handleLogin = async (email: string, password?: string) => {
    const loggedInUser = await login(email, password);
    setUser(loggedInUser);
    setIsLoginModalOpen(false);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const handlePlanUpgradeSelect = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsSubscriptionModalOpen(false);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = (newPlan: Plan) => {
    if (user) {
      const updatedUser = updateUserPlan(user, newPlan);
      setUser(updatedUser);
    }
    setIsPaymentModalOpen(false);
  };

  const handleFeatureHighlightClick = () => {
    if (!user || user.planId === 'free' || user.planId === 'pro') {
      setIsSubscriptionModalOpen(true);
    } else {
      // In a real app, this would open a file upload interface.
      alert('This would open the file upload modal for Bill of Quantities analysis.');
    }
  };

  const handleAnalysisFeatureClick = () => {
    if (user?.planId === 'enterprise') {
      setIsAnalysisModalOpen(true);
    } else {
      setIsSubscriptionModalOpen(true);
    }
  };
  
  return (
    <div className="bg-slate-50 min-h-screen text-slate-800">
      <Header 
        user={user}
        onPremiumClick={() => setIsSubscriptionModalOpen(true)}
        onLoginClick={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        onOpenDashboard={() => setIsDashboardModalOpen(true)}
        onOpenAdminInsights={() => setIsAdminInsightsModalOpen(true)}
      />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <section className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">Your AI Assistant for Indian Construction Standards</h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Get instant, accurate information on IS codes, construction processes, materials, and testing procedures.
          </p>
        </section>

        <section className="mb-10">
          <h3 className="text-xl font-semibold mb-4 text-center text-slate-700">Select a Category to Start</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4 mb-8">
              {categories.map(({ name, icon, prompt }) => (
                  <CategoryButton 
                      key={name}
                      name={name}
                      icon={icon}
                      isActive={activeCategory === name}
                      onClick={() => handleCategorySelect(name, prompt)}
                  />
              ))}
          </div>
        </section>

        <section className="mb-10">
            <div 
                onClick={handleFeatureHighlightClick}
                className="relative bg-white p-6 rounded-xl shadow-md border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 cursor-pointer group"
            >
                {(!user || user.planId === 'free' || user.planId === 'pro') && (
                    <div className="absolute top-3 right-3 flex items-center bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded-full border border-amber-300">
                        <LockIcon />
                        Business Plan
                    </div>
                )}
                <div className="flex flex-col md:flex-row items-center text-center md:text-left">
                    <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6 text-slate-400 group-hover:text-blue-500 transition-all duration-300 group-hover:scale-105">
                        <UploadIcon />
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-slate-800">AI Analysis of Bill of Quantities</h4>
                        <p className="text-slate-600 mt-1">
                            Upload your plan files (.pdf, .dwg) to get an AI-powered analysis and verification of your Bill of Quantities. Save time and reduce errors.
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <section className="mb-10">
            <div 
                onClick={handleAnalysisFeatureClick}
                className="relative bg-white p-6 rounded-xl shadow-md border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 cursor-pointer group"
            >
                {(!user || user.planId !== 'enterprise') && (
                    <div className="absolute top-3 right-3 flex items-center bg-purple-100 text-purple-800 text-xs font-bold px-2 py-1 rounded-full border border-purple-300">
                        <LockIcon />
                        Enterprise Plan
                    </div>
                )}
                <div className="flex flex-col md:flex-row items-center text-center md:text-left">
                    <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6 text-slate-400 group-hover:text-blue-500 transition-all duration-300 group-hover:scale-105">
                        <SiteAnalysisIcon />
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-slate-800">AI Work Progress Analysis</h4>
                        <p className="text-slate-600 mt-1">
                            Monitor construction progress in real-time. Upload site photos or use your camera for AI analysis against project designs.
                        </p>
                    </div>
                </div>
            </div>
        </section>


        <section className="mb-10">
          <h3 className="text-xl font-semibold mb-4 text-center text-slate-700">Or Ask a Custom Question</h3>
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
            <textarea
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (activeCategory) setActiveCategory(null);
              }}
              placeholder="e.g., Explain the slump test procedure as per IS 1199..."
              className="w-full h-28 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-200 resize-none"
              disabled={isLoading}
            />
            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                disabled={isLoading || !query}
                className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </div>
                ) : 'Get Info'}
              </button>
            </div>
          </form>
        </section>
        
        <div ref={responseRef}>
          <ResponseDisplay isLoading={isLoading} error={error} response={response} />
        </div>
      </main>
      <footer className="text-center py-6 text-slate-500 text-sm">
        <p>Powered by Google Gemini. For informational purposes only.</p>
      </footer>
      <SubscriptionModal 
        isOpen={isSubscriptionModalOpen} 
        onClose={() => setIsSubscriptionModalOpen(false)}
        currentUserPlan={user?.planId || 'free'}
        onUpgradeSelect={handlePlanUpgradeSelect}
      />
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
      />
      {user && (
        <UserDashboardModal
            isOpen={isDashboardModalOpen}
            onClose={() => setIsDashboardModalOpen(false)}
            user={user}
            onUpgradeClick={() => {
                setIsDashboardModalOpen(false);
                setIsSubscriptionModalOpen(true);
            }}
            onOpenAnalysis={() => {
              setIsDashboardModalOpen(false);
              setIsAnalysisModalOpen(true);
            }}
        />
      )}
      {selectedPlan && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          plan={selectedPlan}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
      <ProgressAnalysisModal 
        isOpen={isAnalysisModalOpen}
        onClose={() => setIsAnalysisModalOpen(false)}
      />
      <AdminInsightsModal
        isOpen={isAdminInsightsModalOpen}
        onClose={() => setIsAdminInsightsModalOpen(false)}
      />
    </div>
  );
};

export default App;