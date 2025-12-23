
import React, { useState } from 'react';
import { addToKnowledgeBase } from '../services/geminiService';
import { DocumentIcon, CheckIcon } from './icons';

interface RAGUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RAGUploadModal: React.FC<RAGUploadModalProps> = ({ isOpen, onClose }) => {
    const [code, setCode] = useState('');
    const [clause, setClause] = useState('');
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setStatus('idle');
        setErrorMessage('');

        try {
            await addToKnowledgeBase(code, clause, content);
            setStatus('success');
            // Clear form after success
            setTimeout(() => {
                setCode('');
                setClause('');
                setContent('');
                setStatus('idle');
            }, 2000);
        } catch (error: any) {
            console.error("Upload failed", error);
            setStatus('error');
            setErrorMessage(error.message || "Failed to upload to Knowledge Base");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <DocumentIcon />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Add to Knowledge Base</h3>
                            <p className="text-xs text-slate-500">Train the AI with specific IS Codes</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">IS Code Name</label>
                            <input 
                                type="text" 
                                required
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="e.g. IS 456:2000"
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Clause No.</label>
                            <input 
                                type="text" 
                                required
                                value={clause}
                                onChange={(e) => setClause(e.target.value)}
                                placeholder="e.g. 26.5.1"
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Clause Text / Rule</label>
                        <textarea 
                            required
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={6}
                            placeholder="Paste the exact text from the PDF here..."
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
                        />
                        <p className="text-xs text-slate-400 mt-1">This text will be vectorized and indexed for retrieval.</p>
                    </div>

                    {status === 'success' && (
                        <div className="p-3 bg-green-50 text-green-700 rounded-lg flex items-center text-sm animate-fade-in">
                            <CheckIcon />
                            <span className="ml-2 font-semibold">Success! Added to Knowledge Base.</span>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm animate-fade-in">
                            <span className="font-bold">Error:</span> {errorMessage}
                        </div>
                    )}

                    <div className="pt-2">
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 disabled:bg-slate-300 transition-colors"
                        >
                            {isLoading ? 'Generating Embeddings...' : 'Upload & Index'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RAGUploadModal;
