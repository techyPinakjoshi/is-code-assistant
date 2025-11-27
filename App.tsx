
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { getConstructionInfo } from './services/geminiService';
import { login, signup, updateUserPlan } from './services/authService';
import { Category, User, Plan, SavedProject, SavedChat, DashboardData } from './types';
import Header from './components/Header';
import CategoryButton from './components/CategoryButton';
import ResponseDisplay from './components/ResponseDisplay';
import SubscriptionModal from './components/SubscriptionModal';
import LoginModal from './components/LoginModal';
import PaymentModal from './components/PaymentModal';
import UserDashboardModal from './components/UserDashboardModal';
import ProgressAnalysisModal from './components/ProgressAnalysisModal';
import AdminInsightsModal from './components/AdminInsightsModal';
import ProjectDashboardModal from './components/ProjectDashboardModal';
import CategoryDetailModal from './components/CategoryDetailModal';
import MonitoringDashboardModal from './components/MonitoringDashboardModal';
import Sidebar from './components/Sidebar';
import OnboardingModal from './components/OnboardingModal'; // New Import
import { BuildingIcon, RoadIcon, DamIcon, WaterTankIcon, MaterialIcon, AuditIcon, BridgeIcon, PipelineIcon, ElectricalIcon, FireSafetyIcon, EarthquakeIcon, WindLoadIcon, UploadIcon, SiteAnalysisIcon } from './components/icons';

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
  const [isProjectDashboardOpen, setIsProjectDashboardOpen] = useState(false);
  const [isCategoryDetailOpen, setIsCategoryDetailOpen] = useState(false);
  const [isMonitoringModalOpen, setIsMonitoringModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false); // New State
  
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [user, setUser] = useState<User | null>(null);
  
  // Persistence States
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const [savedChats, setSavedChats] = useState<SavedChat[]>([]);
  // We need to track the current project ID to ensure we load the right one
  const [currentProject, setCurrentProject] = useState<SavedProject | null>(null);

  const responseRef = useRef<HTMLDivElement>(null);

  // Load user from local storage if exists (simple session persistence)
  useEffect(() => {
    const savedUser = localStorage.getItem('is_code_user');
    if (savedUser) {
        setUser(JSON.parse(savedUser));
    }
  }, []);

  // Load Data based on User
  useEffect(() => {
    const userKey = user ? user.email : 'guest';
    const projectKey = `is_code_projects_${userKey}`;
    const chatKey = `is_code_chats_${userKey}`;

    const loadedProjects = localStorage.getItem(projectKey);
    const loadedChats = localStorage.getItem(chatKey);

    if (loadedProjects) {
        setSavedProjects(JSON.parse(loadedProjects));
    } else {
        setSavedProjects([]);
    }

    if (loadedChats) {
        setSavedChats(JSON.parse(loadedChats));
    } else {
        setSavedChats([]);
    }
  }, [user]);

  const saveProject = (project: SavedProject) => {
    const userKey = user ? user.email : 'guest';
    const storageKey = `is_code_projects_${userKey}`;
    
    // Ensure project has userId attached
    const projectWithUser = { ...project, userId: userKey };

    // Check if project exists and update it, otherwise add new
    const existingIndex = savedProjects.findIndex(p => p.id === project.id);
    let updated;
    if (existingIndex >= 0) {
        updated = [...savedProjects];
        updated[existingIndex] = projectWithUser;
    } else {
        updated = [projectWithUser, ...savedProjects];
    }
    
    setSavedProjects(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const saveChat = (chat: SavedChat) => {
    const userKey = user ? user.email : 'guest';
    const storageKey = `is_code_chats_${userKey}`;
    
    const chatWithUser = { ...chat, userId: userKey };

    const updated = [chatWithUser, ...savedChats].slice(0, 20); // Keep last 20
    setSavedChats(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

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
  
  const handleCategorySelect = useCallback((category: Category) => {
    setActiveCategory(category);
    setIsCategoryDetailOpen(true);
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
      
      // Auto-save chat
      saveChat({
          id: Date.now().toString(),
          query: query,
          response: result,
          date: new Date().toLocaleDateString()
      });

      setTimeout(() => {
         responseRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      setError('Failed to get information. Please check your connection and API key.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [query, isLoading, savedChats, user]);

  const handleLogin = async (email: string, password?: string) => {
    try {
        const loggedInUser = await login(email, password);
        setUser(loggedInUser);
        setIsLoginModalOpen(false);
    } catch (error: any) {
        throw error; // Let the modal handle the error display
    }
  };

  const handleSignup = async (name: string, email: string, password?: string) => {
      try {
          const newUser = await signup(name, email, password);
          setUser(newUser);
          setIsLoginModalOpen(false);
          setIsOnboardingOpen(true); // Trigger onboarding for new users
      } catch (error: any) {
          throw error;
      }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('is_code_user');
    setSavedProjects([]); // Clear visible projects immediately (will reload guest data on effect)
    setSavedChats([]);
    setIsSidebarOpen(false);
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
    setIsDashboardModalOpen(true);
  };

  const getActiveCategoryIcon = () => {
      const cat = categories.find(c => c.name === activeCategory);
      return cat ? cat.icon : null;
  };
  
  // Sidebar Handlers
  const handleSelectProject = (project: SavedProject) => {
      setCurrentProject(project);
      setIsProjectDashboardOpen(true);
  };

  const handleSelectChat = (chat: SavedChat) => {
      setQuery(chat.query);
      setResponse(chat.response);
      setTimeout(() => {
         responseRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
  };

  const handleCreateNewProject = () => {
    setCurrentProject(null); // Reset current project to trigger upload mode
    setIsProjectDashboardOpen(true);
  };
  
  return (
    <div className="flex bg-slate-50 min-h-screen text-slate-800">
      
      {/* Left Sidebar */}
      <Sidebar 
         isOpen={isSidebarOpen}
         onClose={() => setIsSidebarOpen(false)}
         savedProjects={savedProjects}
         savedChats={savedChats}
         onSelectProject={handleSelectProject}
         onSelectChat={handleSelectChat}
         onOpenMonitoring={() => setIsMonitoringModalOpen(true)}
         onBackToHome={() => window.scrollTo({top: 0, behavior: 'smooth'})}
         onCreateNewProject={handleCreateNewProject}
      />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : 'ml-0'}`}>
          <Header 
            user={user}
            onPremiumClick={() => setIsSubscriptionModalOpen(true)}
            onLoginClick={() => setIsLoginModalOpen(true)}
            onLogout={handleLogout}
            onOpenDashboard={() => setIsDashboardModalOpen(true)}
            onOpenAdminInsights={() => setIsAdminInsightsModalOpen(true)}
            onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
          />
          <main className="container mx-auto px-4 py-8 max-w-4xl relative">
            <section className="text-center mb-6">
              <h2 className="text-3xl md:text-4xl font-bold mb-2 text-slate-900">AI Construction Assistant</h2>
              <p className="text-base text-slate-600 max-w-3xl mx-auto">
                Get instant, accurate information on IS codes, construction processes, materials, and testing procedures.
              </p>
            </section>

            <form onSubmit={handleSubmit} className="mb-8 bg-white p-4 rounded-xl shadow-md border border-slate-200">
                <label htmlFor="query-textarea" className="block text-sm font-semibold text-slate-700 mb-2">General Query</label>
                <div className="relative">
                    <textarea
                      id="query-textarea"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Type your general construction query here..."
                      className="w-full p-3 pr-24 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-200 resize-none text-sm"
                      rows={2}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit();
                        }
                      }}
                      aria-label="Query Input"
                    />
                    <button
                      type="submit"
                      disabled={isLoading || !query}
                      className="absolute top-1/2 right-2 -translate-y-1/2 px-4 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors duration-200"
                      aria-label="Submit Query"
                    >
                      {isLoading ? (
                         <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                      ) : 'Ask AI'}
                    </button>
                </div>
            </form>

            <section className="mb-10">
              <h3 className="text-xl font-semibold mb-4 text-center text-slate-700">Select a Category to Explore</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4 mb-8">
                  {categories.map(({ name, icon, prompt }) => (
                      <CategoryButton 
                          key={name}
                          name={name}
                          icon={icon}
                          isActive={activeCategory === name}
                          onClick={() => handleCategorySelect(name)}
                      />
                  ))}
              </div>
            </section>
            
            <section className="mb-10">
                <div 
                    onClick={handleCreateNewProject}
                    className="relative bg-white p-6 rounded-xl shadow-md border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 cursor-pointer group"
                >
                    <div className="flex flex-col md:flex-row items-center text-center md:text-left">
                        <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6 text-slate-400 group-hover:text-blue-500 transition-all duration-300 group-hover:scale-105">
                            <UploadIcon />
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-slate-800">AI Project Planning & Dashboard</h4>
                            <p className="text-slate-600 mt-1">
                                Upload your 2D plan files (.pdf, images) to instantly generate a construction schedule (Gantt), WBS, and Bill of Quantities.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
            
            <section className="mb-10">
                <div 
                    onClick={() => setIsAnalysisModalOpen(true)}
                    className="relative bg-white p-6 rounded-xl shadow-md border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 cursor-pointer group"
                >
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
            
            <div ref={responseRef}>
              <ResponseDisplay isLoading={isLoading} error={error} response={response} />
            </div>
          </main>
          
          {/* Floating Chat Button for quick access */}
          <button 
             onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
             className="fixed bottom-6 right-6 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 z-40 transition-transform hover:scale-110 md:hidden"
             aria-label="Scroll to chat"
          >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </button>
      </div>

      {/* Modals */}
      {isSubscriptionModalOpen && (
        <SubscriptionModal
          isOpen={isSubscriptionModalOpen}
          onClose={() => setIsSubscriptionModalOpen(false)}
          currentUserPlan={user?.planId || 'free'}
          onUpgradeSelect={handlePlanUpgradeSelect}
        />
      )}
      {isLoginModalOpen && (
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onLogin={handleLogin}
          onSignup={handleSignup}
        />
      )}
      {isOnboardingOpen && user && (
          <OnboardingModal 
            isOpen={isOnboardingOpen}
            onClose={() => setIsOnboardingOpen(false)}
            userName={user.name}
          />
      )}
      {isPaymentModalOpen && selectedPlan && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          plan={selectedPlan}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
      {isDashboardModalOpen && user && (
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
          onOpenBoqAnalysis={() => {
              setIsDashboardModalOpen(false);
              handleCreateNewProject();
          }}
        />
      )}
       {isAnalysisModalOpen && (
        <ProgressAnalysisModal
          isOpen={isAnalysisModalOpen}
          onClose={() => setIsAnalysisModalOpen(false)}
        />
       )}
       {isAdminInsightsModalOpen && (
        <AdminInsightsModal
            isOpen={isAdminInsightsModalOpen}
            onClose={() => setIsAdminInsightsModalOpen(false)}
        />
       )}
       {isProjectDashboardOpen && (
        <ProjectDashboardModal
            isOpen={isProjectDashboardOpen}
            onClose={() => setIsProjectDashboardOpen(false)}
            onSave={saveProject}
            initialProject={currentProject} // Pass the full saved project object
        />
       )}
       {isCategoryDetailOpen && (
        <CategoryDetailModal 
            isOpen={isCategoryDetailOpen}
            onClose={() => setIsCategoryDetailOpen(false)}
            category={activeCategory}
            categoryIcon={getActiveCategoryIcon()}
        />
       )}
       {isMonitoringModalOpen && (
         <MonitoringDashboardModal 
            isOpen={isMonitoringModalOpen}
            onClose={() => setIsMonitoringModalOpen(false)}
         />
       )}
    </div>
  );
};

export default App;
