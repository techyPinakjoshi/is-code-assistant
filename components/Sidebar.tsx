import React from 'react';
import { SavedProject, SavedChat } from '../types';
import { CameraIcon, DashboardIcon, PlusIcon, CloseIcon } from './icons';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  savedProjects: SavedProject[];
  savedChats: SavedChat[];
  onSelectProject: (project: SavedProject) => void;
  onSelectChat: (chat: SavedChat) => void;
  onOpenMonitoring: () => void;
  onBackToHome: () => void;
  onCreateNewProject: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen,
  onClose,
  savedProjects, 
  savedChats, 
  onSelectProject, 
  onSelectChat,
  onOpenMonitoring,
  onBackToHome,
  onCreateNewProject
}) => {
  return (
    <>
      {/* Overlay for mobile when sidebar is open */}
      {isOpen && (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
            onClick={onClose}
        ></div>
      )}
      
      <div className={`w-64 bg-slate-900 text-slate-300 flex flex-col h-screen fixed left-0 top-0 overflow-hidden border-r border-slate-700 shadow-2xl z-30 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b border-slate-700 bg-slate-800 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white cursor-pointer hover:text-blue-400" onClick={onBackToHome}>IS Code Assistant</h2>
            <p className="text-xs text-slate-500">Professional Suite</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white md:hidden">
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-8">
          
          {/* Main Tools */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Tools</h3>
            <button 
                onClick={onOpenMonitoring}
                className="w-full flex items-center p-3 rounded-lg bg-gradient-to-r from-blue-900 to-slate-800 hover:from-blue-800 hover:to-slate-700 border border-blue-800 text-white transition-all shadow-md group"
              >
                <span className="p-1.5 bg-blue-600 rounded-md mr-3 group-hover:bg-blue-500 transition-colors">
                    <CameraIcon />
                </span>
                <span className="font-medium text-sm">AI Live Monitoring</span>
                <span className="ml-auto w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            </button>
          </div>

          {/* Projects History */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Project Dashboards</h3>
            
            {/* New Project Button */}
            <button 
                onClick={onCreateNewProject}
                className="w-full flex items-center justify-center p-2 mb-3 rounded-lg border border-dashed border-slate-600 hover:border-blue-500 hover:bg-slate-800 hover:text-blue-400 transition-all text-sm group"
            >
                <PlusIcon />
                <span className="ml-2 font-medium">Create New Project</span>
            </button>

            {savedProjects.length === 0 ? (
              <p className="text-sm text-slate-600 italic text-center">No saved projects yet.</p>
            ) : (
              <div className="space-y-1">
                {savedProjects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => onSelectProject(project)}
                    className="w-full text-left p-2 rounded hover:bg-slate-800 transition-colors text-sm truncate flex items-center"
                  >
                    <span className="mr-2 text-slate-500"><DashboardIcon /></span>
                    <div className="overflow-hidden">
                      <p className="truncate text-slate-200">{project.name}</p>
                      <p className="text-xs text-slate-500">{project.date}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Chat History */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Recent Chats</h3>
            {savedChats.length === 0 ? (
              <p className="text-sm text-slate-600 italic text-center">No history yet.</p>
            ) : (
              <div className="space-y-1">
                {savedChats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => onSelectChat(chat)}
                    className="w-full text-left p-2 rounded hover:bg-slate-800 transition-colors text-sm"
                  >
                    <p className="truncate text-slate-300">{chat.query}</p>
                    <p className="text-xs text-slate-500">{chat.date}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="p-4 border-t border-slate-800 bg-slate-900 text-xs text-slate-500 text-center">
          Data auto-saved locally.
        </div>
      </div>
    </>
  );
};

export default Sidebar;