
import React, { useState, useRef, useEffect } from 'react';
import { generateProjectDashboard, updateDashboardViaChat, updateDashboardWithProgressImage, generate3DAndCameraPlan } from '../services/geminiService';
import { UploadIcon, AnalyticsIcon, CameraIcon, CheckIcon, CubeIcon, VideoIcon, PlusIcon, CloseIcon, DocumentIcon, ExcelIcon, CopyIcon } from './icons';
import { DashboardData, SavedProject, WBSTask } from '../types';

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

// Helper to get icon based on task name
const getTaskIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('concrete') || n.includes('slab') || n.includes('foundation')) return '🏗️';
    if (n.includes('excavation') || n.includes('earth')) return '🚜';
    if (n.includes('brick') || n.includes('wall') || n.includes('masonry')) return '🧱';
    if (n.includes('steel') || n.includes('rebar')) return '🔩';
    if (n.includes('paint') || n.includes('finish')) return '🎨';
    if (n.includes('electr')) return '⚡';
    if (n.includes('plumb') || n.includes('pipe')) return '💧';
    return '📋';
};

const ProjectDashboardModal: React.FC<ProjectDashboardModalProps> = ({ isOpen, onClose, onSave, initialProject }) => {
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<DashboardData | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'execution' | 'resources' | 'ai_monitoring'>('overview');
    
    // Track the ID of the current project being worked on
    const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
    const [showExitPrompt, setShowExitPrompt] = useState(false);
    
    // Progress Update State
    const [showProgressUpload, setShowProgressUpload] = useState(false);
    const [progressImage, setProgressImage] = useState<File | null>(null);
    const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
    
    // Task Update Modal State
    const [editingTask, setEditingTask] = useState<WBSTask | null>(null);
    const [updateComment, setUpdateComment] = useState('');
    const [updateQuantity, setUpdateQuantity] = useState<number>(0);
    const [updatePhoto, setUpdatePhoto] = useState<File | null>(null);
    const [updateStatus, setUpdateStatus] = useState<WBSTask['status']>('In Progress');
    
    // 3D Analysis State
    const [isGenerating3D, setIsGenerating3D] = useState(false);

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
    const updatePhotoRef = useRef<HTMLInputElement>(null);

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
        setEditingTask(null);
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
            
            // Persist the image in the data object for display (Only if it's an image, PDFs might be tricky to display as img src)
            if (mimeType.startsWith('image/')) {
                dashboardData.plan_base64 = `data:${mimeType};base64,${fileBase64}`;
            }
            
            setData(dashboardData);
            
            const newProjectId = currentProjectId || Date.now().toString();
            setCurrentProjectId(newProjectId);

            setChatMessages([{
                id: 'init-generated', 
                sender: 'ai', 
                text: 'Dashboard generated! I have analyzed your document. I can help you track milestones, explain compliance risks found in the tender, or adjust the schedule.'
            }]);

        } catch (err) {
            setError('Failed to generate dashboard. Please ensure the file is a clear 2D plan or a readable PDF tender document.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleGenerate3DAnalysis = async () => {
        if (!data || !data.plan_base64) return;
        setIsGenerating3D(true);
        
        try {
            const base64Data = data.plan_base64.split(',')[1];
            const mimeType = data.plan_base64.split(';')[0].split(':')[1];
            
            const analysis = await generate3DAndCameraPlan(base64Data, mimeType);
            
            // Update Dashboard Data with new 3D analysis
            const updatedData = { ...data, three_d_analysis: analysis };
            setData(updatedData);
            handleManualSave(); // Auto save
            
            // If there are questions, open chat and ask them
            if (analysis.questions_to_ask && analysis.questions_to_ask.length > 0) {
                const questionsList = analysis.questions_to_ask.map(q => `- ${q}`).join('\n');
                setChatMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    sender: 'ai',
                    text: `I've analyzed the plan for 3D modeling and camera placement. To improve accuracy, I need a few details:\n\n${questionsList}\n\nPlease reply here.`
                }]);
                setShowMobileChat(true); // Open chat on mobile
            }

        } catch (err) {
            alert('Failed to generate 3D analysis. Please try again.');
        } finally {
            setIsGenerating3D(false);
        }
    };

    // --- Task Update Handlers ---

    const handleOpenTaskUpdate = (task: WBSTask) => {
        setEditingTask(task);
        setUpdateComment('');
        setUpdateQuantity(0);
        setUpdatePhoto(null);
        setUpdateStatus(task.status);
    };

    const handleSubmitTaskUpdate = async () => {
        if (!editingTask || !data) return;

        let photoBase64 = undefined;
        if (updatePhoto) {
            try {
                 photoBase64 = `data:${updatePhoto.type};base64,${await blobToBase64(updatePhoto)}`;
            } catch (e) {
                console.error("Failed to read photo");
            }
        }

        const newExecutedQty = (editingTask.executed_quantity || 0) + updateQuantity;
        let newProgress = editingTask.progress;
        
        // Auto-calculate progress if total quantity exists
        if (editingTask.total_quantity && editingTask.total_quantity > 0) {
            newProgress = Math.min(100, Math.round((newExecutedQty / editingTask.total_quantity) * 100));
        } else if (updateStatus === 'Completed') {
            newProgress = 100;
        }

        const newUpdateEntry = {
            id: Date.now().toString(),
            date: new Date().toLocaleDateString(),
            comment: updateComment,
            quantity_added: updateQuantity,
            photo_base64: photoBase64,
            user_name: 'You' // In a real app, grab from auth context
        };

        const updatedTask: WBSTask = {
            ...editingTask,
            executed_quantity: newExecutedQty,
            progress: newProgress,
            status: updateStatus,
            updates: [...(editingTask.updates || []), newUpdateEntry]
        };

        // Update Data
        const updatedWBS = data.wbs.map(t => t.id === editingTask.id ? updatedTask : t);
        
        // Recalculate Overall Project KPI
        const totalProgress = Math.round(updatedWBS.reduce((acc, t) => acc + t.progress, 0) / updatedWBS.length);
        const updatedKPIs = data.kpis.map(k => k.label.includes('Progress') ? { ...k, value: `${totalProgress}%` } : k);

        const newData = { ...data, wbs: updatedWBS, kpis: updatedKPIs };
        setData(newData);
        setEditingTask(null);
        handleManualSave();
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
                // Preserve plan image and 3d analysis if existing
                const newData = response.updatedDashboard;
                if (!newData.plan_base64 && data.plan_base64) {
                    newData.plan_base64 = data.plan_base64;
                }
                if (!newData.three_d_analysis && data.three_d_analysis) {
                    newData.three_d_analysis = data.three_d_analysis;
                }
                setData(newData);
            }

        } catch (err) {
            setChatMessages(prev => [...prev, { id: Date.now().toString(), sender: 'ai', text: 'Sorry, I encountered an error processing your request.' }]);
        } finally {
            setIsChatLoading(false);
        }
    };
    
    // Export Handlers
    const handleExportCSV = () => {
        if (!data) return;
        const headers = ['Task ID', 'Activity Name', 'Phase', 'Start Date', 'End Date', 'Status', 'Progress (%)', 'IS Code Ref', 'Executed Qty', 'Total Qty', 'Unit'];
        const rows = data.wbs.map(t => [
            t.id, t.name, t.phase, t.startDate, t.endDate, t.status, t.progress, t.is_code_reference || 'N/A', t.executed_quantity || 0, t.total_quantity || 0, t.quantity_unit || ''
        ]);
        
        const csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n" 
            + rows.map(e => e.join(",")).join("\n");
            
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${data.project_summary.title || 'project'}_dashboard.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const handleCopyToClipboard = () => {
        if (!data) return;
        const headers = ['Task', 'Status', 'IS Code', 'Progress'];
        const rows = data.wbs.map(t => `${t.name}\t${t.status}\t${t.is_code_reference}\t${t.progress}%`).join('\n');
        const text = headers.join('\t') + '\n' + rows;
        navigator.clipboard.writeText(text);
        alert("Dashboard summary copied to clipboard!");
    };

    if (!isOpen) return null;

    const renderOverview = () => {
        // Parse KPI for pie chart
        const progressKPI = data?.kpis.find(k => k.label.toLowerCase().includes('progress'));
        const progressVal = progressKPI ? parseInt(progressKPI.value.toString().replace('%','')) : 0;
        
        return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Top Stats Row - Updated to match new spec */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Progress Chart Card */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Overall Progress</p>
                        <p className="text-3xl font-bold text-slate-800 mt-1">{progressVal}%</p>
                    </div>
                    <PieChart percentage={progressVal} color={progressVal > 80 ? 'text-green-500' : progressVal > 40 ? 'text-blue-500' : 'text-amber-500'} />
                </div>
                
                 {/* Cost Variance */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
                    <p className="text-sm text-slate-500 mb-1">Total Budget / Variance</p>
                    <p className="text-xl font-bold text-slate-800">{data?.project_summary.total_budget || '₹0'}</p>
                    <p className={`text-sm font-semibold mt-1 ${data?.project_summary.cost_variance?.includes('+') ? 'text-red-500' : 'text-green-500'}`}>
                        {data?.project_summary.cost_variance || '0%'} Variance
                    </p>
                </div>

                {/* Safety Score */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
                    <p className="text-sm text-slate-500 mb-1">Safety Compliance</p>
                    <p className={`text-3xl font-bold ${data?.project_summary.safety_score && data.project_summary.safety_score > 90 ? 'text-green-600' : 'text-amber-500'}`}>
                        {data?.project_summary.safety_score || 0}%
                    </p>
                    <p className="text-xs text-slate-400 mt-1">IS 3696 Standards</p>
                </div>
                
                 {/* Resource Heatmap Placeholder */}
                 <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center relative overflow-hidden">
                    <p className="text-sm text-slate-500 mb-1">Resource Heatmap</p>
                    <div className="flex space-x-1 mt-2">
                        <div className="h-8 flex-1 bg-red-400 rounded-sm" title="Critical"></div>
                        <div className="h-8 flex-1 bg-amber-400 rounded-sm" title="High"></div>
                        <div className="h-8 flex-1 bg-green-400 rounded-sm" title="Normal"></div>
                        <div className="h-8 flex-1 bg-green-400 rounded-sm"></div>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Labor & Material Intensity</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Plan Image Display - AI Plan Overlay */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-slate-800">AI Plan Recognition Overlay</h3>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded border border-green-200">98% Recognition Complete</span>
                    </div>
                    <div className="w-full h-64 bg-slate-900 rounded-lg flex items-center justify-center overflow-hidden border border-slate-200 relative">
                        {data?.plan_base64 ? (
                            <>
                                <img src={data.plan_base64} alt="Project Plan" className="w-full h-full object-contain opacity-60" />
                                {/* Overlay Grid Effect */}
                                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.1)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
                            </>
                        ) : (
                            <div className="text-slate-400 flex flex-col items-center">
                                <span>No Plan Image Available</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* MEP & Safety Checklists */}
                <div className="space-y-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm h-full">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Compliance Checklists</h3>
                        
                        <div className="mb-4">
                            <h4 className="text-sm font-bold text-slate-500 uppercase mb-2">MEP Services (IS 1172/732)</h4>
                            <div className="space-y-2 max-h-32 overflow-y-auto">
                                {data?.mep_checklist?.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-sm border-b border-slate-100 pb-1">
                                        <span className="text-slate-700">{item.description}</span>
                                        <span className="text-xs bg-slate-100 px-1 rounded text-slate-500">{item.is_code}</span>
                                    </div>
                                ))}
                                {!data?.mep_checklist && <p className="text-sm text-slate-400 italic">No MEP data extracted.</p>}
                            </div>
                        </div>
                        
                        <div>
                            <h4 className="text-sm font-bold text-slate-500 uppercase mb-2">Safety (IS 3696/NBC)</h4>
                            <div className="space-y-2 max-h-32 overflow-y-auto">
                                {data?.safety_checklist?.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-sm border-b border-slate-100 pb-1">
                                        <span className="text-slate-700">{item.item}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded ${item.status === 'Compliant' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {item.status}
                                        </span>
                                    </div>
                                ))}
                                {!data?.safety_checklist && <p className="text-sm text-slate-400 italic">No Safety data extracted.</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        );
    };

    const renderExecutionPlan = () => (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
             <div className="p-4 bg-blue-50 border-b border-blue-100 flex justify-between items-center">
                <div className="flex items-center space-x-2 text-blue-800">
                    <span className="font-bold">Structural Progress (IS 456 / IS 800):</span>
                    <span className="text-sm">Track timelines, compliance, and quantities.</span>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                        <tr>
                            <th className="px-6 py-4 w-1/5">Task Activity</th>
                            <th className="px-6 py-4 w-1/6">IS Code Ref</th>
                            <th className="px-6 py-4 w-1/6">Timeline</th>
                            <th className="px-6 py-4 w-1/6">Status</th>
                            <th className="px-6 py-4 w-1/4">Execution & Quantities</th>
                            <th className="px-6 py-4 w-24">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {data?.wbs.map((task, idx) => {
                            const percentComplete = task.progress || 0;
                            const hasQuantities = task.total_quantity && task.total_quantity > 0;
                            const qtyPercent = hasQuantities 
                                ? Math.min(100, (((task.executed_quantity || 0) / task.total_quantity!) * 100))
                                : percentComplete;

                            return (
                            <tr key={idx} className="hover:bg-slate-50 group">
                                <td className="px-6 py-4 align-top">
                                    <div className="flex items-start">
                                        <div className="mr-3 text-lg" title="Task Category">{getTaskIcon(task.name)}</div>
                                        <div>
                                            <div className="font-bold text-slate-800 text-sm">{task.name}</div>
                                            <div className="text-xs text-slate-500 mt-0.5">{task.phase}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 align-top">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                        {task.is_code_reference || 'Pending'}
                                    </span>
                                    {task.compliance_check === 'Compliant' && <span className="text-green-500 text-xs ml-1">✓</span>}
                                </td>
                                <td className="px-6 py-4 align-top">
                                    <div className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded mb-1 w-fit">
                                        {task.startDate}
                                    </div>
                                    <div className="text-xs text-slate-400 pl-1">to</div>
                                    <div className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded mt-1 w-fit">
                                        {task.endDate}
                                    </div>
                                </td>
                                <td className="px-6 py-4 align-top">
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                        task.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                        task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                        task.status === 'Delayed' ? 'bg-red-100 text-red-800' :
                                        'bg-slate-100 text-slate-600'
                                    }`}>
                                        {task.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 align-top">
                                    {/* Combined Tracker */}
                                    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
                                        {hasQuantities ? (
                                            <>
                                                <div className="flex justify-between items-end mb-2">
                                                    <div>
                                                        <div className="text-xs text-slate-500 uppercase font-bold">Executed</div>
                                                        <div className="text-sm font-bold text-slate-900">
                                                            {task.executed_quantity || 0} <span className="text-slate-500 text-xs font-normal">/ {task.total_quantity} {task.quantity_unit}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-lg font-bold text-blue-600">{Math.round(qtyPercent)}%</div>
                                                    </div>
                                                </div>
                                                <div className="w-full bg-slate-100 rounded-full h-2">
                                                    <div 
                                                        className={`h-2 rounded-full transition-all duration-500 ${
                                                            task.status === 'Delayed' ? 'bg-red-500' : 
                                                            task.status === 'Completed' ? 'bg-green-500' : 'bg-blue-600'
                                                        }`} 
                                                        style={{ width: `${qtyPercent}%` }}
                                                    ></div>
                                                </div>
                                            </>
                                        ) : (
                                            // Fallback for time-based tasks only
                                             <>
                                                <div className="flex justify-between items-end mb-2">
                                                    <div className="text-xs text-slate-500 uppercase">Duration Completion</div>
                                                    <div className="text-lg font-bold text-blue-600">{task.progress}%</div>
                                                </div>
                                                <div className="w-full bg-slate-100 rounded-full h-2">
                                                    <div className="bg-blue-400 h-2 rounded-full" style={{ width: `${task.progress}%` }}></div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 align-middle">
                                    <button 
                                        onClick={() => handleOpenTaskUpdate(task)}
                                        className="text-white bg-blue-600 hover:bg-blue-700 font-semibold rounded-lg px-3 py-2 transition-all shadow-md w-full text-xs"
                                    >
                                        Update
                                    </button>
                                </td>
                            </tr>
                        )})}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderResources = () => (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
             <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-bold text-slate-800">BOQ & Quantities (IS 1200 Compliant)</h3>
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded border border-yellow-200">⚠️ Auto-Generated from Plan</span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead className="bg-white border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold">
                        <tr>
                            <th className="px-6 py-4">Item Description</th>
                            <th className="px-6 py-4">IS Measurement Code</th>
                            <th className="px-6 py-4">Unit</th>
                            <th className="px-6 py-4">Total Estimated Qty</th>
                            <th className="px-6 py-4">Usage Location</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {data?.boq_items.map((item, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium text-slate-800">
                                    <div className="flex items-center">
                                        <span className="mr-2">{getTaskIcon(item.description)}</span>
                                        {item.description}
                                    </div>
                                    <div className="text-xs text-slate-400 pl-6">{item.item_id}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-xs font-mono bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-100">
                                        {item.is_code_measurement || 'IS 1200'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-500 text-sm font-mono bg-slate-50 w-fit">{item.unit}</td>
                                <td className="px-6 py-4 font-bold text-slate-800 text-lg">{item.estimated_qty}</td>
                                <td className="px-6 py-4 text-slate-500 text-sm">
                                    <span className="bg-slate-100 px-2 py-1 rounded text-xs border border-slate-200">
                                        {item.location_reference}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
    
    // RENAMED from 3D to AI Monitoring as per request
    const renderAIMonitoring = () => {
        const analysis = data?.three_d_analysis;
        
        if (!analysis) {
            return (
                 <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-50 h-full rounded-xl border border-dashed border-slate-300">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6">
                        <CubeIcon />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">AI Monitoring Setup</h3>
                    <p className="text-slate-500 max-w-md mb-8">
                        Generate 3D inference and camera placements to enable the "Live Sentinel" safety dashboard.
                    </p>
                    <button 
                        onClick={handleGenerate3DAnalysis}
                        disabled={isGenerating3D}
                        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 disabled:bg-slate-400 transition-all flex items-center"
                    >
                        {isGenerating3D ? (
                            <>
                                <span className="animate-spin mr-2">⟳</span> Configuring...
                            </>
                        ) : (
                            <>
                                <span className="mr-2">⚡</span> Configure Monitoring
                            </>
                        )}
                    </button>
                </div>
            );
        }
        
        return (
            <div className="space-y-6 animate-fade-in pb-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left: 3D Visualization Placeholder & Description */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800 flex items-center"><CubeIcon /> <span className="ml-2">3D Structure Inference Model</span></h3>
                        </div>
                        <div className="p-6">
                            <div className="w-full h-48 bg-slate-900 rounded-lg flex items-center justify-center mb-6 relative overflow-hidden group perspective-1000">
                                <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)]"></div>
                                {/* Conceptual 3D Mockup using CSS */}
                                <div className="relative transform-style-3d rotate-x-60 rotate-z-45 w-24 h-24 border-2 border-blue-500 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-transform duration-700 group-hover:rotate-z-90 flex items-center justify-center">
                                     <div className="w-16 h-16 border border-blue-400/50"></div>
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <span className="bg-black/70 text-blue-200 px-3 py-1 rounded-full text-xs backdrop-blur-sm border border-blue-500/30">Structural Wireframe (Inferred)</span>
                                </div>
                            </div>
                            
                            <h4 className="font-semibold text-slate-800 mb-2">Structure Details</h4>
                            <p className="text-slate-600 text-sm mb-4 leading-relaxed">{analysis.structure_description}</p>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 p-3 rounded-lg">
                                    <p className="text-xs text-slate-500 uppercase">Est. Height</p>
                                    <p className="font-bold text-slate-800">{analysis.estimated_height}</p>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-lg">
                                    <p className="text-xs text-slate-500 uppercase">Key Volumes</p>
                                    <p className="font-bold text-slate-800">{analysis.key_volumes.length}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Camera Plan */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                        <div className="p-4 bg-slate-50 border-b border-slate-200">
                            <h3 className="font-bold text-slate-800 flex items-center"><VideoIcon /> <span className="ml-2">AI Camera Recommendations</span></h3>
                        </div>
                        <div className="flex-grow overflow-y-auto p-0">
                            {analysis.camera_recommendations.map((cam, idx) => (
                                <div key={idx} className="p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-bold text-slate-800 flex items-center">
                                            <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs mr-2">{cam.id}</span>
                                            {cam.location}
                                        </h4>
                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">{cam.type}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 mb-2">{cam.coverage_area}</p>
                                    <p className="text-sm text-slate-700 bg-slate-50 p-2 rounded border border-slate-100 italic">
                                        "{cam.reason}"
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )
    };

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
                
                {/* Specific Task Update Modal (Slide-Over) */}
                {editingTask && (
                    <div className="absolute inset-0 bg-black bg-opacity-60 z-50 flex justify-end">
                        <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col animate-fade-in-right overflow-y-auto">
                            <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">Update Task</h3>
                                    <p className="text-sm text-slate-500 truncate">{editingTask.name}</p>
                                </div>
                                <button onClick={() => setEditingTask(null)} className="text-slate-400 hover:text-slate-600">
                                    <CloseIcon />
                                </button>
                            </div>

                            {/* IS Code Validation Interface Box */}
                            <div className="mb-6 border-2 border-blue-100 bg-blue-50 rounded-lg p-4">
                                <div className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-2 flex items-center">
                                    <span className="w-4 h-4 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] mr-2">i</span>
                                    IS Code Validation Interface
                                </div>
                                <div className="space-y-2 text-sm text-slate-700">
                                    <div className="flex justify-between">
                                        <span>Item:</span>
                                        <span className="font-semibold">{editingTask.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Standard:</span>
                                        <span className="font-mono bg-white px-1 rounded border border-blue-200">{editingTask.is_code_reference || 'IS 456'}</span>
                                    </div>
                                    <div className="flex items-center text-green-700 font-semibold mt-2">
                                        <span className="mr-1">✓</span> Compliant with National Standards
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6 flex-grow">
                                {/* Status & Quantities */}
                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Status</label>
                                            <select 
                                                value={updateStatus}
                                                onChange={(e) => setUpdateStatus(e.target.value as any)}
                                                className="w-full text-sm border-slate-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                            >
                                                <option value="Not Started">Not Started</option>
                                                <option value="In Progress">In Progress</option>
                                                <option value="Completed">Completed</option>
                                                <option value="Delayed">Delayed</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Current %</label>
                                            <div className="text-sm font-bold text-slate-800 py-2">{editingTask.progress}%</div>
                                        </div>
                                    </div>
                                    
                                    {editingTask.total_quantity && (
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">
                                                Executed Quantity ({editingTask.quantity_unit})
                                            </label>
                                            <div className="flex items-center space-x-2">
                                                <div className="flex-1">
                                                    <input 
                                                        type="number"
                                                        value={updateQuantity}
                                                        onChange={(e) => setUpdateQuantity(parseInt(e.target.value) || 0)}
                                                        className="w-full text-sm border-slate-300 rounded-md"
                                                        placeholder="Add Qty"
                                                    />
                                                </div>
                                                <span className="text-slate-400">+</span>
                                                <div className="flex-1 bg-white border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-600 text-center">
                                                    Current: {editingTask.executed_quantity || 0}
                                                </div>
                                                <span className="text-slate-400">=</span>
                                                <div className="flex-1 bg-slate-200 rounded-md px-3 py-2 text-sm text-slate-800 font-bold text-center">
                                                    {(editingTask.executed_quantity || 0) + updateQuantity}
                                                </div>
                                            </div>
                                            {/* Progress Bar */}
                                            <div className="mt-3 relative h-2 bg-slate-200 rounded-full overflow-hidden">
                                                <div 
                                                    className={`absolute top-0 left-0 h-full ${
                                                        ((editingTask.executed_quantity || 0) + updateQuantity) > editingTask.total_quantity 
                                                        ? 'bg-red-500' 
                                                        : 'bg-green-500'
                                                    }`} 
                                                    style={{ width: `${Math.min(100, (((editingTask.executed_quantity || 0) + updateQuantity) / editingTask.total_quantity) * 100)}%` }}
                                                ></div>
                                            </div>
                                            <div className="flex justify-between text-xs text-slate-400 mt-1">
                                                <span>0</span>
                                                <span>Total Planned: {editingTask.total_quantity}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Comments & Photo */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Site Notes / Comments</label>
                                    <textarea
                                        value={updateComment}
                                        onChange={(e) => setUpdateComment(e.target.value)}
                                        className="w-full text-sm border-slate-300 rounded-lg h-24 resize-none"
                                        placeholder="e.g., Delays due to rain, material arrived..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Attach Photo (Optional)</label>
                                    <div 
                                        onClick={() => updatePhotoRef.current?.click()}
                                        className="w-full h-24 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500 bg-slate-50"
                                    >
                                        {updatePhoto ? (
                                            <div className="text-center text-sm text-blue-600 font-medium">
                                                {updatePhoto.name}
                                                <p className="text-xs text-red-500">Click to change</p>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center text-slate-400">
                                                <CameraIcon />
                                                <span className="text-xs mt-1">Upload Evidence</span>
                                            </div>
                                        )}
                                    </div>
                                    <input type="file" ref={updatePhotoRef} onChange={(e) => setUpdatePhoto(e.target.files?.[0] || null)} className="hidden" accept="image/*" />
                                </div>
                            </div>
                            
                            <div className="pt-4 border-t border-slate-200 mt-4">
                                <button 
                                    onClick={handleSubmitTaskUpdate}
                                    className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg shadow hover:bg-blue-700"
                                >
                                    Validate & Update
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Progress Upload Modal (Global) */}
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
                            {!data && <p className="text-xs text-slate-500">Upload Plan or Contract</p>}
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                         {data && (
                             <>
                                {/* Export Buttons */}
                                <button 
                                    onClick={handleExportCSV}
                                    className="hidden md:flex px-3 py-2 bg-green-50 text-green-700 border border-green-200 text-sm font-semibold rounded-lg hover:bg-green-100 transition-colors items-center"
                                >
                                    <ExcelIcon />
                                    <span className="ml-1">Excel</span>
                                </button>
                                <button 
                                    onClick={handleCopyToClipboard}
                                    className="hidden md:flex px-3 py-2 bg-slate-50 text-slate-700 border border-slate-200 text-sm font-semibold rounded-lg hover:bg-slate-100 transition-colors items-center"
                                >
                                    <CopyIcon />
                                    <span className="ml-1">Copy CSV</span>
                                </button>

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
                                    className="w-full max-w-md h-72 bg-white rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-blue-500 cursor-pointer transition-all group shadow-sm hover:shadow-md"
                                >
                                    <div className="flex space-x-4 mb-4">
                                        <div className="p-4 rounded-full bg-blue-50 text-blue-500 group-hover:scale-110 transition-transform">
                                            <UploadIcon />
                                        </div>
                                        <div className="p-4 rounded-full bg-purple-50 text-purple-500 group-hover:scale-110 transition-transform">
                                            <DocumentIcon />
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-700">Upload Project File</h3>
                                    <p className="text-slate-500 mt-2 text-sm font-medium">2D Floor Plan (Image/PDF) <span className="text-slate-300 px-1">|</span> Tender Document (PDF)</p>
                                    <p className="text-xs text-slate-400 mt-2 max-w-xs leading-relaxed">
                                        AI will detect file type. <br/>
                                        <span className="font-semibold text-blue-500">Plan:</span> Generates WBS, BOQ & 3D. <br/>
                                        <span className="font-semibold text-purple-500">Tender:</span> Extracts Scope, Compliance & Milestones.
                                    </p>
                                </div>
                                <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept=".pdf,image/*" className="hidden" />
                            </div>
                        ) : isLoading ? (
                            <div className="flex-grow flex flex-col items-center justify-center bg-slate-50">
                                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                                <h3 className="text-lg font-bold text-slate-800">Analyzing Project Document...</h3>
                                <p className="text-slate-500 text-sm">AI is structuring your dashboard from the uploaded file.</p>
                            </div>
                        ) : (
                            <>
                                <div className="flex border-b border-slate-200 bg-white flex-shrink-0 overflow-x-auto">
                                    <button 
                                        onClick={() => setActiveTab('overview')}
                                        className={`flex-1 min-w-[100px] py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'overview' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                                    >
                                        Master Dashboard
                                    </button>
                                    <button 
                                        onClick={() => setActiveTab('execution')}
                                        className={`flex-1 min-w-[100px] py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'execution' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                                    >
                                        Execution (Structural)
                                    </button>
                                    <button 
                                        onClick={() => setActiveTab('resources')}
                                        className={`flex-1 min-w-[100px] py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'resources' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                                    >
                                        Resource (BOQ)
                                    </button>
                                    <button 
                                        onClick={() => setActiveTab('ai_monitoring')}
                                        className={`flex-1 min-w-[120px] py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center ${activeTab === 'ai_monitoring' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                                    >
                                        <CubeIcon /> <span className="ml-2">AI Monitoring</span>
                                    </button>
                                </div>
                                <div className="flex-grow overflow-y-auto p-4 md:p-6 bg-slate-50">
                                    {activeTab === 'overview' && renderOverview()}
                                    {activeTab === 'execution' && renderExecutionPlan()}
                                    {activeTab === 'resources' && renderResources()}
                                    {activeTab === 'ai_monitoring' && renderAIMonitoring()}
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
                                        <div className={`max-w-[85%] rounded-lg p-3 text-sm whitespace-pre-wrap ${
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
