import React, { useState, useRef, useEffect } from 'react';
import { Category } from '../types';
import { getConstructionInfo } from '../services/geminiService';
import ResponseDisplay from './ResponseDisplay';
import { BackIcon, CheckIcon } from './icons';

interface CategoryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  categoryIcon: React.ReactNode;
}

// Data mapping for sub-branches
const SUB_BRANCHES: Record<Category, string[]> = {
  'Buildings': [
    'Excavation & Earthwork',
    'Foundation (Isolated/Footing)',
    'Raft Foundation',
    'Plinth Beam & DPC',
    'Ground Floor Structure',
    'Superstructure (Columns/Beams)',
    'Slab & Roofing',
    'Finishing (Plaster/Paint)'
  ],
  'Roads': [
    'Flexible Pavement (Bituminous)',
    'Rigid Pavement (Concrete)',
    'Subgrade & Embankment',
    'Highway Drainage Systems',
    'Road Safety Furniture'
  ],
  'Bridges & Culverts': [
    'PCC (Plain Cement Concrete)',
    'Raft Foundation',
    'Pile/Well Foundation',
    'Substructure (Piers/Abutments)',
    'Girders (Superstructure)',
    'Deck Slab & Pavement',
    'Bearings & Expansion Joints'
  ],
  'Dams': [
    'Site Investigation',
    'Foundation Treatment',
    'Gravity Dam Design',
    'Spillways & Gates',
    'Earthen Dam Embankment'
  ],
  'Water Tanks': [
    'Underground Water Tanks',
    'Overhead Intze Tanks',
    'Waterproofing & Joints',
    'Reinforcement Detailing'
  ],
  'Material Testing': [
    'Concrete Testing (Cube/Slump)',
    'Steel Tensile Strength',
    'Soil Mechanics & Testing',
    'Bitumen Testing'
  ],
  'Structural Audits': [
    'Visual Inspection',
    'Non-Destructive Testing (NDT)',
    'Distress Mapping',
    'Rehabilitation Recommendations'
  ],
  'Pipelines & Drainage': [
    'Trench Excavation',
    'Pipe Bedding & Laying',
    'Hydrostatic Testing',
    'Manhole Construction'
  ],
  'Electrical Systems': [
    'Conduiting & Wiring',
    'Earthing & Lightning Protection',
    'Load Calculation',
    'Switchgear Installation'
  ],
  'Fire Safety': [
    'Active Fire Protection',
    'Passive Fire Protection',
    'Fire Exits & Signage',
    'Hydrant Systems'
  ],
  'Earthquake Resistance': [
    'Seismic Zones in India',
    'Ductile Detailing (IS 13920)',
    'Shear Walls',
    'Base Isolation'
  ],
  'Wind Load Analysis': [
    'Basic Wind Speed Calculation',
    'Design Wind Pressure',
    'Gust Factor',
    'Cladding & Facade Loads'
  ]
};

const CategoryDetailModal: React.FC<CategoryDetailModalProps> = ({ isOpen, onClose, category, categoryIcon }) => {
  const [activeSubBranch, setActiveSubBranch] = useState<string | null>(null);
  const [response, setResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [customQuery, setCustomQuery] = useState('');
  
  const responseEndRef = useRef<HTMLDivElement>(null);

  // Scroll to response when it updates
  useEffect(() => {
    if (response && responseEndRef.current) {
        responseEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [response]);

  // Reset state when category changes
  useEffect(() => {
    if (isOpen) {
        setActiveSubBranch(null);
        setResponse('');
        setCustomQuery('');
        setError(null);
    }
  }, [isOpen, category]);

  if (!isOpen || !category) return null;

  const subBranches = SUB_BRANCHES[category] || [];

  const handleSubBranchClick = async (subBranch: string) => {
    setActiveSubBranch(subBranch);
    setIsLoading(true);
    setResponse('');
    setError(null);

    const prompt = `Act as a senior civil engineer. Regarding "${subBranch}" for "${category}":
    1. Provide detailed technical construction information based on IS Codes.
    2. List exactly 5 key suggestions or best practices for this specific element.
    3. Cite relevant IS Code numbers.`;

    try {
      const result = await getConstructionInfo(prompt);
      setResponse(result);
    } catch (err) {
      setError('Failed to fetch information. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuery.trim()) return;

    setIsLoading(true);
    // Don't clear previous response, append to it or replace depending on UX preference. 
    // Here we replace to keep it clean, or we could act like a chat.
    // Let's replace but keep context.
    
    const context = activeSubBranch 
        ? `Context: User is asking about ${activeSubBranch} in ${category}.` 
        : `Context: User is asking about ${category}.`;
    
    const prompt = `${context} Question: ${customQuery}`;

    try {
      const result = await getConstructionInfo(prompt);
      setResponse(result);
    } catch (err) {
      setError('Failed to fetch answer.');
    } finally {
      setIsLoading(false);
      setCustomQuery('');
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
        className="bg-slate-50 rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-white rounded-t-2xl">
            <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    {categoryIcon}
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-900">{category} Construction</h2>
                    <p className="text-sm text-slate-500">Select an element to view details & IS Codes</p>
                </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
            {/* Sidebar: Sub-branches */}
            <div className="w-full md:w-1/3 p-4 bg-white border-r border-slate-200 overflow-y-auto">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Essential Elements</h3>
                <div className="space-y-2">
                    {subBranches.map((branch) => (
                        <button
                            key={branch}
                            onClick={() => handleSubBranchClick(branch)}
                            className={`w-full text-left p-3 rounded-lg flex items-center justify-between transition-all duration-200 ${
                                activeSubBranch === branch 
                                ? 'bg-blue-600 text-white shadow-md' 
                                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 hover:pl-4'
                            }`}
                        >
                            <span className="font-medium text-sm">{branch}</span>
                            {activeSubBranch === branch && <CheckIcon />}
                        </button>
                    ))}
                </div>
                
                {/* Empty state hint */}
                {!activeSubBranch && (
                    <div className="mt-8 p-4 bg-blue-50 text-blue-800 rounded-lg text-sm">
                        <p>👈 Select a specific element from the list to get detailed IS Code requirements, suggestions, and specifications.</p>
                    </div>
                )}
            </div>

            {/* Main Content Area */}
            <div className="w-full md:w-2/3 flex flex-col bg-slate-50">
                <div className="flex-grow overflow-y-auto p-6">
                    {isLoading ? (
                         <div className="flex flex-col items-center justify-center h-full space-y-4">
                            <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="text-slate-500 font-medium">Analyzing IS Codes for {activeSubBranch}...</p>
                        </div>
                    ) : response ? (
                        <div className="animate-fade-in">
                            <div className="flex items-center space-x-2 mb-4">
                                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">AI Analysis</span>
                                <h3 className="text-lg font-bold text-slate-800">{activeSubBranch}</h3>
                            </div>
                            <ResponseDisplay isLoading={false} error={null} response={response} />
                            <div ref={responseEndRef} />
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                             <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                             </div>
                             <p>Select an element to view details.</p>
                        </div>
                    )}
                </div>

                {/* Chat Input Area */}
                <div className="p-4 bg-white border-t border-slate-200">
                    <form onSubmit={handleCustomQuerySubmit} className="relative">
                        <input 
                            type="text" 
                            value={customQuery}
                            onChange={(e) => setCustomQuery(e.target.value)}
                            placeholder={activeSubBranch ? `Ask specific questions about ${activeSubBranch}...` : `Ask specific questions about ${category}...`}
                            className="w-full pl-4 pr-12 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow shadow-sm"
                        />
                        <button 
                            type="submit"
                            disabled={isLoading || !customQuery}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </form>
                    <p className="text-xs text-slate-400 mt-2 text-center">
                        AI can make mistakes. Verify critical code requirements.
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryDetailModal;
