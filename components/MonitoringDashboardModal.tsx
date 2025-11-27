
import React, { useState, useEffect } from 'react';
import { updateMonitoringDashboard } from '../services/geminiService';
import { MonitoringDashboardData } from '../types';
import { CameraIcon, CheckIcon } from './icons';

interface MonitoringDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MonitoringDashboardModal: React.FC<MonitoringDashboardModalProps> = ({ isOpen, onClose }) => {
    const [data, setData] = useState<MonitoringDashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [simulatedUpdateCount, setSimulatedUpdateCount] = useState(0);

    // Initial dummy state to start the process
    useEffect(() => {
        if (isOpen && !data) {
            setData({
                dashboard_state: {
                    project_id: "PROJ-2024-LIVE",
                    last_update: new Date().toISOString(),
                    kpis: {
                        overall_progress_percent: 45,
                        schedule_variance_days: 2,
                        cost_risk_level: "low",
                        safety_incidents_today: 0
                    },
                    views: {},
                    widgets: { gantt_summary: [], boq_status: [], issue_log: [], photo_evidence: [] }
                },
                new_issues: [],
                events_processed: [],
                client_report_snippet: "System initialized. Waiting for camera feeds..."
            });
        }
    }, [isOpen]);

    const handleSimulateLiveUpdate = async () => {
        if (!data) return;
        setIsLoading(true);

        // Simulate a camera detection event
        const mockDetection = {
            timestamp: new Date().toISOString(),
            source: `tower_cam_0${Math.floor(Math.random() * 3) + 1}`,
            detections: [
                {
                    element_type: Math.random() > 0.5 ? "RCC_slab" : "Brickwork",
                    location: `Level_${Math.floor(Math.random() * 5) + 1}_Zone_${Math.random() > 0.5 ? 'A' : 'B'}`,
                    status: "work_in_progress",
                    confidence: 0.9 + (Math.random() * 0.1)
                }
            ]
        };

        try {
            const updatedDashboard = await updateMonitoringDashboard(data.dashboard_state, mockDetection);
            setData(updatedDashboard);
            setSimulatedUpdateCount(prev => prev + 1);
        } catch (error) {
            console.error("Failed to update monitoring dashboard", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div 
                className="bg-slate-900 text-white rounded-2xl shadow-2xl w-full max-w-7xl h-[95vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800 rounded-t-2xl">
                    <div className="flex items-center space-x-4">
                        <div className="p-2 bg-red-600 rounded-lg animate-pulse">
                            <CameraIcon />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">AI Live Site Monitoring</h2>
                            <p className="text-sm text-slate-400">
                                Project ID: {data?.dashboard_state.project_id} | Live Updates: {simulatedUpdateCount}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                         <button 
                            onClick={handleSimulateLiveUpdate}
                            disabled={isLoading}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-semibold transition-colors disabled:opacity-50 flex items-center"
                        >
                            {isLoading ? 'Processing...' : 'Simulate Camera Feed'}
                        </button>
                        <button onClick={onClose} className="text-slate-400 hover:text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Dashboard Content */}
                <div className="flex-grow overflow-y-auto p-6 bg-slate-900 grid grid-cols-12 gap-6">
                    
                    {/* Top Row: KPIs */}
                    <div className="col-span-12 grid grid-cols-4 gap-4">
                        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                            <p className="text-slate-400 text-xs uppercase">Overall Progress</p>
                            <p className="text-3xl font-bold text-blue-400">{data?.dashboard_state.kpis.overall_progress_percent}%</p>
                        </div>
                        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                            <p className="text-slate-400 text-xs uppercase">Schedule Variance</p>
                            <p className={`text-3xl font-bold ${data?.dashboard_state.kpis.schedule_variance_days! > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {data?.dashboard_state.kpis.schedule_variance_days} Days
                            </p>
                        </div>
                        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                            <p className="text-slate-400 text-xs uppercase">Cost Risk</p>
                            <p className={`text-3xl font-bold uppercase ${data?.dashboard_state.kpis.cost_risk_level === 'low' ? 'text-green-400' : 'text-amber-400'}`}>
                                {data?.dashboard_state.kpis.cost_risk_level}
                            </p>
                        </div>
                         <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                            <p className="text-slate-400 text-xs uppercase">Safety Incidents (Today)</p>
                            <p className={`text-3xl font-bold ${data?.dashboard_state.kpis.safety_incidents_today === 0 ? 'text-green-400' : 'text-red-500'}`}>
                                {data?.dashboard_state.kpis.safety_incidents_today}
                            </p>
                        </div>
                    </div>

                    {/* Middle Row: Main Views */}
                    <div className="col-span-12 md:col-span-8 bg-slate-800 rounded-xl border border-slate-700 p-6">
                        <h3 className="text-lg font-bold mb-4 text-white">Client Report Snippet (Auto-Generated)</h3>
                        <div className="bg-slate-900 p-4 rounded-lg border border-slate-600 text-slate-300 italic">
                            "{data?.client_report_snippet}"
                        </div>
                        
                        <h3 className="text-lg font-bold mt-6 mb-4 text-white">Latest Issues Detected</h3>
                        <div className="space-y-2">
                            {data?.dashboard_state.widgets.issue_log.length === 0 ? (
                                <p className="text-slate-500">No open issues.</p>
                            ) : (
                                data?.dashboard_state.widgets.issue_log.map((issue: any, idx: number) => (
                                    <div key={idx} className="bg-red-900/20 border border-red-900/50 p-3 rounded flex justify-between items-center">
                                        <div>
                                            <p className="text-red-300 font-semibold text-sm">{issue.type.toUpperCase()}: {issue.description}</p>
                                            <p className="text-red-400/70 text-xs mt-1">Action: {issue.suggested_action}</p>
                                        </div>
                                        <span className="px-2 py-1 bg-red-600 text-white text-xs rounded uppercase">{issue.severity}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Right Column: Live Feed / Events */}
                    <div className="col-span-12 md:col-span-4 bg-slate-800 rounded-xl border border-slate-700 p-6 flex flex-col">
                         <h3 className="text-lg font-bold mb-4 text-white">Live Camera Events</h3>
                         <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                             {data?.events_processed && data.events_processed.length > 0 ? (
                                 [...data.events_processed].reverse().map((event: any, idx: number) => (
                                     <div key={idx} className="text-sm p-3 bg-slate-700 rounded border border-slate-600">
                                         <p className="text-slate-300"><span className="text-blue-400 font-mono">[{new Date().toLocaleTimeString()}]</span> Detection:</p>
                                         <p className="text-white mt-1">{JSON.stringify(event.detections)}</p>
                                     </div>
                                 ))
                             ) : (
                                 <div className="text-center text-slate-500 mt-10">
                                     <p>No recent events.</p>
                                     <p className="text-xs mt-2">Click "Simulate Camera Feed" to generate data.</p>
                                 </div>
                             )}
                         </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default MonitoringDashboardModal;
