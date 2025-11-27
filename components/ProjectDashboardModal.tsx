
import React, { useState, useRef, useEffect } from 'react';
import { generateProjectDashboard, updateDashboardViaChat, updateDashboardWithProgressImage } from '../services/geminiService';
import { UploadIcon, AnalyticsIcon, CameraIcon, CheckIcon } from './icons';
import { DashboardData, SavedProject } from '../types';

interface ProjectDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (project: SavedProject) => void;
  initialProject?: SavedProject | null;
}

interface ChatMessage {
    id: string;
    sender: 'user' | 'ai';
    text: string;
}

const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = (reader.result as string).split(',')[1];
            resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

// Simple SVG Pie Chart Component
const PieChart: React.FC<{ percentage: number; color?: string }> = ({ percentage, color = 'text-blue-600' }) => {
    const radius = 35;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
                {/* Background Circle */}
                <circle
                    className="text-slate-200"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="48"
                    cy="48"
                />
                {/* Progress Circle */}
                <circle
                    className={color}
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="48"
                    cy="48"
                />
            </svg>
            <span className={`absolute text-sm font-bold ${color.replace('text-', 'text-slate-800')}`}>
                {percentage}%
            </span>
        </div>
    );
};

const ProjectDashboardModal: React.FC<ProjectDashboardModalProps> = ({ isOpen, onClose, onSave, initialProject }) => {
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<DashboardData | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'boq'>('overview');
    
    // Track the ID of the current project being worked on
    const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
    const [showExitPrompt, setShowExitPrompt] = useState(false);
    
    // Progress Update State
    const [showProgressUpload, setShowProgressUpload] = useState(false);
    const [progressImage, setProgressImage] = useState<File | null>(null);
    const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
    
    // Save State
    const [lastSaved, setLastSaved] = useState<string | null>(null);
    const [showSaveSuccess, setShowSaveSuccess] = useState(false);

    // Chat State
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [showMobileChat, setShowMobileChat] = useState(false); 
    const chatEndRef = useRef<HTMLDivElement>(null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const progressInputRef = useRef<HTMLInputElement>(null);

    // Load initial data if provided (e.g., from history)
    useEffect(() => {
        if (initialProject) {
            setData(initialProject.data);
            setCurrentProjectId(initialProject.id);
            setLastSaved(initialProject.lastModified || initialProject.date);
            setChatMessages([{
                id: 'init', 
                sender: 'ai', 
                text: 'Hello! I am your AI Project Assistant. I can help you adjust the schedule, modify BOQ quantities, or verify compliance with IS Codes. Just ask!'
            }]);
        } else {
            // Reset if opening in "Create New" mode
            setData(null);
            setCurrentProjectId(null);
            setChatMessages([]);
            setFile(null);
            setLastSaved(null);
        }
    }, [initialProject, isOpen]);

    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatMessages, showMobileChat]);

    const handleCloseRequest = () => {
        if (data) {
            setShowExitPrompt(true);
        } else {
            handleClose();
        }
    };

    const handleClose = () => {
        // Clear state on close
        if (!initialProject) {
            setFile(null);
            setData(null);
            setChatMessages([]);
            setCurrentProjectId(null);
        }
        setIsLoading(false);
        setError(null);
        setActiveTab('overview');
        setShowExitPrompt(false);
        setShowMobileChat(false);
        setShowProgressUpload(false);
        setProgressImage(null);
        onClose();
    };

    const handleSaveAndClose = () => {
        handleManualSave();
        handleClose();
    };

    const handleManualSave = () => {
        if (data && onSave) {
            const projectId = currentProjectId || Date.now().toString();
            // Ensure we have an ID for future updates
            if (!currentProjectId) setCurrentProjectId(projectId);
            
            const now = new Date();
            const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const dateString = now.toLocaleDateString();
            const fullTimeStamp = `${dateString} at ${timeString}`;

            onSave({
                id: projectId,
                name: data.project_summary.title || "Untitled Project",
                date: dateString,
                lastModified: fullTimeStamp,
                data: data
            });
            
            setLastSaved(fullTimeStamp);
            setShowSaveSuccess(true);
            setTimeout(() => setShowSaveSuccess(false), 3000);
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            handleSubmit(selectedFile);
        }
    };

    const handleSubmit = async (fileToUpload: File) => {
        setIsLoading(true);
        setError(null);
        setData(null);

        try {
            const fileBase64 = await blobToBase64(fileToUpload);
            const mimeType = fileToUpload.type;
            const dashboardData = await generateProjectDashboard(fileBase64, mimeType);
            
            // Persist the image in the data object for display
            dashboardData.plan_base64 = `data:${mimeType};base64,${fileBase64}`;
            
            setData(dashboardData);
            
            const newProjectId = currentProjectId || Date.now().toString();
            setCurrentProjectId(newProjectId);

            setChatMessages([{
                id: 'init-generated', 
                sender: 'ai', 
                text: 'Dashboard generated successfully! I have analyzed your plan. You can ask me to change timelines, update material quantities, or check for specific IS code requirements.'
            }]);

        } catch (err) {
            setError('Failed to generate dashboard. Please ensure the file is a clear 2D plan.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleProgressImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) setProgressImage(file);
    };

    const handleUpdateProgress = async () => {
        if (!progressImage || !data) return;

        setIsUpdatingProgress(true);
        try {
            const fileBase64 = await blobToBase64(progressImage);
            const mimeType = progressImage.type;
            
            const updatedDashboard = await updateDashboardWithProgressImage(data, fileBase64, mimeType);
            
            // Ensure plan image persists if not returned by API
            if (!updatedDashboard.plan_base64 && data.plan_base64) {
                updatedDashboard.plan_base64 = data.plan_base64;
            }

            setData(updatedDashboard);
            setShowProgressUpload(false);
            setProgressImage(null);
            handleManualSave(); // Auto-save after update
            
            setChatMessages(prev => [...prev, {
                id: Date.now().toString(),
                sender: 'ai',
                text: 'I have updated the project progress based on the site photo you uploaded.'
            }]);

        } catch (err) {
            alert("Failed to update progress. Please try again.");
        } finally {
            setIsUpdatingProgress(false);
        }
    };

    const handleChatSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim() || !data) return;

        const userMsg: ChatMessage = { id: Date.now().toString(), sender: 'user', text: chatInput };
        setChatMessages(prev => [...prev, userMsg]);
        setChatInput('');
        setIsChatLoading(true);

        try {
            const response = await updateDashboardViaChat(data, userMsg.text);
            
            const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), sender: 'ai', text: response.responseText };
            setChatMessages(prev => [...prev, aiMsg]);

            if (response.updatedDashboard) {
                // Preserve plan image
                const newData = response.updatedDashboard;
                if (!newData.plan_base64 && data.plan_base64) {
                    newData.plan_base64 = data.plan_base64;
                }
                setData(newData);
            }

        } catch (err) {
            setChatMessages(prev => [...prev, { id: Date.now().toString(), sender: 'ai', text: 'Sorry, I encountered an error processing your request.' }]);
        } finally {
            setIsChatLoading(false);
        }
    };

    if (!isOpen) return null;

    const renderOverview = () => {
        // Parse KPI for pie chart
        const progressKPI = data?.kpis.find(k => k.label.toLowerCase().includes('progress'));
        const progressVal = progressKPI ? parseInt(progressKPI.value.toString().replace('%','')) : 0;
        
        return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Progress Chart Card */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Overall Progress</p>
                        <p className="text-3xl font-bold text-slate-800 mt-1">{progressVal}%</p>
                        <p className="text-xs text-slate-400 mt-1">Based on WBS status</p>
                    </div>
                    <PieChart percentage={progressVal} color={progressVal > 80 ? 'text-green-500' : progressVal > 40 ? 'text-blue-500' : 'text-amber-500'} />
                </div>

                {data?.kpis.filter(k => !k.label.toLowerCase().includes('progress')).map((kpi, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
                        <p className="text-sm text-slate-500 mb-1">{kpi.label}</p>
                        <p className={`text-2xl font-bold ${
                            kpi.status === 'good' ? 'text-green-600' :
                            kpi.status === 'warning' ? 'text-amber-500' :
                            kpi.status === 'critical' ? 'text-red-500' : 'text-slate-800'
                        }`}>{kpi.value}</p>
                        {kpi.trend && <p className="text-xs text-slate-400 mt-2">{kpi.trend}</p>}
                    </div>
                ))}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Plan Image Display */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-slate-800">2D Plan View</h3>
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">Design Reference</span>
                    </div>
                    <div className="w-full h-64 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden border border-slate-200">
                        {data?.plan_base64 ? (
                            <img src={data.plan_base64} alt="Project Plan" className="w-full h-full object-contain" />
                        ) : (
                            <div className="text-slate-400 flex flex-col items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span>No Plan Image Available</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Update Progress & Summary */}
                <div className="space-y-4">
                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 h-fit">
                        <h3 className="text-lg font-bold text-blue-800 mb-2">Project Summary</h3>
                        <p className="text-blue-700 text-sm leading-relaxed">{data?.project_summary.description}</p>
                        {data?.project_summary.location && (
                            <div className="mt-4 flex items-center text-blue-800 text-sm font-semibold">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                {data.project_summary.location}
                            </div>
                        )}
                    </div>

                    <button 
                        onClick={() => setShowProgressUpload(true)}
                        className="w-full py-3 bg-white border-2 border-dashed border-blue-300 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 hover:border-blue-500 transition-all flex items-center justify-center"
                    >
                        <CameraIcon />
                        <span className="ml-2">Update Progress via Photo</span>
                    </button>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Project Risks & Issues</h3>
                {data?.risk_log && data.risk_log.length > 0 ? (
                    <ul className="space-y-2">
                        {data.risk_log.map((risk, idx) => (
                            <li key={idx} className="flex items-start">
                                <span className="flex-shrink-0 h-5 w-5 rounded-full bg-red-100 flex items-center justify-center mr-3 mt-0.5">
                                    <span className="h-2 w-2 rounded-full bg-red-500"></span>
                                </span>
                                <span className="text-slate-700 text-sm">{risk}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-slate-500 italic text-sm">No major risks identified at this stage.</p>
                )}
            </div>
        </div>
        );
    };

    const renderSchedule = () => (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                        <tr>
                            <th className="px-6 py-4">Task Name</th>
                            <th className="px-6 py-4">Timeline</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Progress</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {data?.wbs.map((task, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-slate-800">{task.name}</div>
                                    <div className="text-xs text-slate-500">{task.phase}</div>
                                </td>
                                <td className="px-6 py-4 text-slate-500 text-sm">
                                    {task.startDate} <br/>↓<br/> {task.endDate}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        task.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                        task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                        task.status === 'Delayed' ? 'bg-red-100 text-red-800' :
                                        'bg-slate-100 text-slate-800'
                                    }`}>
                                        {task.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="w-full bg-slate-200 rounded-full h-2.5 dark:bg-slate-200">
                                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${task.progress}%` }}></div>
                                    </div>
                                    <span className="text-xs text-slate-500 mt-1 inline-block">{task.progress}%</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderBoq = () => (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
             <div className="p-4 bg-yellow-50 border-b border-yellow-100 text-sm text-yellow-800 flex justify-between items-center">
                <span>⚠️ AI-estimated quantities. Verify before tendering.</span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                        <tr>
                            <th className="px-6 py-4">Description</th>
                            <th className="px-6 py-4">Unit</th>
                            <th className="px-6 py-4">Qty</th>
                            <th className="px-6 py-4">Location</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {data?.boq_items.map((item, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium text-slate-800">
                                    {item.description}
                                    <div className="text-xs text-slate-400">{item.item_id}</div>
                                </td>
                                <td className="px-6 py-4 text-slate-500 text-sm">{item.unit}</td>
                                <td className="px-6 py-4 font-bold text-slate-800">{item.estimated_qty}</td>
                                <td className="px-6 py-4 text-slate-500 text-sm">{item.location_reference}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={handleCloseRequest}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="bg-slate-50 rounded-2xl shadow-2xl w-full max-w-full h-[95vh] flex flex-col overflow-hidden relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Save Confirmation Overlay */}
                {showExitPrompt && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl transform scale-100 transition-transform">
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Save Project?</h3>
                            <p className="text-slate-600 mb-6">Do you want to save your changes to "{data?.project_summary.title || 'Untitled'}" before closing?</p>
                            <div className="flex flex-col space-y-3">
                                <button 
                                    onClick={handleSaveAndClose}
                                    className="w-full py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
                                >
                                    Save & Close
                                </button>
                                <button 
                                    onClick={handleClose}
                                    className="w-full py-2 bg-red-100 text-red-700 font-semibold rounded-lg hover:bg-red-200"
                                >
                                    Discard Changes
                                </button>
                                <button 
                                    onClick={() => setShowExitPrompt(false)}
                                    className="w-full py-2 text-slate-500 font-semibold hover:text-slate-700"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Progress Upload Modal */}
                {showProgressUpload && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
                             <h3 className="text-lg font-bold text-slate-900 mb-2">Update Progress</h3>
                             <p className="text-sm text-slate-600 mb-4">Upload a site photo. AI will analyze it against your WBS to update completion percentages.</p>
                             
                             <div 
                                onClick={() => progressInputRef.current?.click()}
                                className="w-full h-32 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500 mb-4"
                             >
                                {progressImage ? (
                                    <div className="text-center">
                                        <p className="text-sm font-semibold">{progressImage.name}</p>
                                        <button onClick={(e) => { e.stopPropagation(); setProgressImage(null); }} className="text-xs text-red-500">Remove</button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center text-slate-400">
                                        <CameraIcon />
                                        <span className="text-xs mt-1">Click to upload</span>
                                    </div>
                                )}
                             </div>
                             <input type="file" ref={progressInputRef} onChange={handleProgressImageSelect} accept="image/*" className="hidden" />

                             <div className="flex space-x-3">
                                <button 
                                    onClick={handleUpdateProgress}
                                    disabled={!progressImage || isUpdatingProgress}
                                    className="flex-1 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-slate-300"
                                >
                                    {isUpdatingProgress ? 'Analyzing...' : 'Analyze & Update'}
                                </button>
                                <button 
                                    onClick={() => { setShowProgressUpload(false); setProgressImage(null); }}
                                    className="px-4 py-2 border border-slate-300 text-slate-600 font-semibold rounded-lg hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                             </div>
                        </div>
                    </div>
                )}
                
                {/* Save Success Toast */}
                {showSaveSuccess && (
                    <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-2 rounded-full shadow-lg z-50 animate-fade-in flex items-center">
                        <CheckIcon />
                        <span className="ml-2 font-semibold">Project Saved!</span>
                    </div>
                )}

                {/* Header */}
                <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white flex-shrink-0">
                    <div className="flex items-center space-x-3 overflow-hidden">
                        <div className="p-2 bg-blue-600 rounded-lg text-white flex-shrink-0">
                            <AnalyticsIcon />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-lg md:text-xl font-bold text-slate-900 truncate">
                                {data ? data.project_summary.title : 'AI Project Dashboard'}
                            </h2>
                            {data && lastSaved && (
                                <p className="text-xs text-slate-500 flex items-center">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
                                    Last saved: {lastSaved}
                                </p>
                            )}
                            {!data && <p className="text-xs text-slate-500">Upload Plan</p>}
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                         {data && (
                             <>
                                <button 
                                    onClick={() => setShowMobileChat(!showMobileChat)}
                                    className="lg:hidden px-3 py-2 bg-slate-100 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-200 transition-colors flex items-center"
                                >
                                    <span className="mr-1">💬</span> {showMobileChat ? 'Close Chat' : 'Assist'}
                                </button>
                                <button 
                                    onClick={handleManualSave}
                                    className="hidden md:block px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
                                >
                                    Save
                                </button>
                             </>
                        )}
                        <button onClick={handleCloseRequest} className="text-slate-400 hover:text-slate-600 p-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Main Body Grid */}
                <div className="flex-grow flex overflow-hidden relative">
                    
                    {/* Left: Dashboard Content (Scrollable) */}
                    <div className={`${data ? 'w-full lg:w-3/4' : 'w-full'} flex flex-col border-r border-slate-200 transition-all duration-300 h-full`}>
                        {!data && !isLoading ? (
                            <div className="flex-grow flex flex-col items-center justify-center p-8 text-center bg-slate-50">
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full max-w-md h-64 bg-white rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-blue-500 cursor-pointer transition-all group shadow-sm hover:shadow-md"
                                >
                                    <div className="p-4 rounded-full bg-blue-50 text-blue-500 group-hover:scale-110 transition-transform mb-4">
                                        <UploadIcon />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-700">Upload 2D Project Plan</h3>
                                    <p className="text-slate-500 mt-2 text-sm">PDF, JPG, PNG (Max 20MB)</p>
                                    <p className="text-xs text-slate-400 mt-1">Generates WBS, Schedule & BOQ</p>
                                </div>
                                <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept=".pdf,image/*" className="hidden" />
                            </div>
                        ) : isLoading ? (
                            <div className="flex-grow flex flex-col items-center justify-center bg-slate-50">
                                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                                <h3 className="text-lg font-bold text-slate-800">Analyzing Project Plan...</h3>
                                <p className="text-slate-500 text-sm">AI is structuring your dashboard.</p>
                            </div>
                        ) : (
                            <>
                                <div className="flex border-b border-slate-200 bg-white flex-shrink-0">
                                    <button 
                                        onClick={() => setActiveTab('overview')}
                                        className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'overview' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                                    >
                                        Overview
                                    </button>
                                    <button 
                                        onClick={() => setActiveTab('schedule')}
                                        className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'schedule' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                                    >
                                        Schedule
                                    </button>
                                    <button 
                                        onClick={() => setActiveTab('boq')}
                                        className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'boq' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                                    >
                                        BOQ
                                    </button>
                                </div>
                                <div className="flex-grow overflow-y-auto p-4 md:p-6 bg-slate-50">
                                    {activeTab === 'overview' && renderOverview()}
                                    {activeTab === 'schedule' && renderSchedule()}
                                    {activeTab === 'boq' && renderBoq()}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Right: AI Assistant Chat (Responsive) */}
                    {data && (
                        <div className={`
                            fixed inset-0 lg:static lg:inset-auto z-40 bg-white
                            lg:flex lg:w-1/4 flex-col border-l border-slate-200
                            transition-transform duration-300 ease-in-out
                            ${showMobileChat ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
                        `}>
                             <div className="lg:hidden p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                                <h3 className="font-bold text-slate-800">AI Assistant</h3>
                                <button onClick={() => setShowMobileChat(false)} className="text-slate-500">Close</button>
                             </div>

                            <div className="p-4 border-b border-slate-200 bg-slate-50 hidden lg:block">
                                <h3 className="font-bold text-slate-800 flex items-center">
                                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                    AI Project Assistant
                                </h3>
                                <p className="text-xs text-slate-500 mt-1">Chat to modify schedule or quantities.</p>
                            </div>
                            
                            <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-slate-50">
                                {chatMessages.map((msg) => (
                                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] rounded-lg p-3 text-sm ${
                                            msg.sender === 'user' 
                                            ? 'bg-blue-600 text-white rounded-br-none' 
                                            : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none shadow-sm'
                                        }`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                ))}
                                {isChatLoading && (
                                     <div className="flex justify-start">
                                        <div className="bg-white border border-slate-200 rounded-lg p-3 rounded-bl-none shadow-sm flex items-center space-x-1">
                                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                                        </div>
                                    </div>
                                )}
                                <div ref={chatEndRef} />
                            </div>

                            <div className="p-4 border-t border-slate-200 bg-white">
                                <form onSubmit={handleChatSubmit} className="relative">
                                    <input
                                        type="text"
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        placeholder="Type to adjust fields..."
                                        className="w-full pl-3 pr-10 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm outline-none"
                                        disabled={isChatLoading}
                                    />
                                    <button 
                                        type="submit"
                                        disabled={!chatInput.trim() || isChatLoading}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-800 disabled:text-slate-300"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                                        </svg>
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjectDashboardModal;
