import React, { useState, useRef, useCallback } from 'react';
import { analyzeBoq } from '../services/geminiService';
import ResponseDisplay from './ResponseDisplay';
import { UploadIcon } from './icons';

interface BoqAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
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

const BoqAnalysisModal: React.FC<BoqAnalysisModalProps> = ({ isOpen, onClose }) => {
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const resetState = useCallback(() => {
        setFile(null);
        setIsLoading(false);
        setError(null);
        setResult('');
    }, []);

    const handleClose = () => {
        resetState();
        onClose();
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
        }
    };

    const handleSubmit = async () => {
        if (!file) {
            setError('Please upload a file first.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setResult('');

        try {
            const fileBase64 = await blobToBase64(file);
            const mimeType = file.type;
            
            const prompt = `As an expert quantity surveyor, analyze the attached Bill of Quantities (BOQ) document. Provide a detailed verification and analysis, including:
            1.  A summary of the key quantities and materials.
            2.  Identification of any potential discrepancies, inconsistencies, or missing items.
            3.  Comparison of quantities against standard industry benchmarks for a project of this type (if discernible).
            4.  Highlight any items that seem unusually high or low in cost or quantity.
            5.  Suggestions for optimization or clarification.`;

            const analysisResult = await analyzeBoq(prompt, fileBase64, mimeType);
            setResult(analysisResult);

        } catch (err) {
            setError('Failed to get analysis. The uploaded file might be too large or in an unsupported format. Please try again with a smaller PDF or image file.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={handleClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="bg-slate-50 rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-slate-900">AI Bill of Quantities Analysis</h2>
                    <button onClick={handleClose} className="text-slate-400 hover:text-slate-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
                    {/* Left Side - Inputs */}
                    <div className="w-full md:w-1/3 p-6 border-r border-slate-200 overflow-y-auto flex flex-col space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">1. Upload your BOQ file</label>
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full h-48 bg-white rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-blue-500 cursor-pointer transition-colors"
                            >
                                {file ? (
                                    <div className="text-center p-4">
                                        <p className="font-semibold text-slate-700">{file.name}</p>
                                        <p className="text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                        <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="mt-2 text-xs text-red-500 hover:underline">Remove file</button>
                                    </div>
                                ) : (
                                    <>
                                        <UploadIcon />
                                        <span className="text-slate-500 mt-2">Click to browse</span>
                                        <span className="text-xs text-slate-400 mt-1">PDF, PNG, JPG up to 10MB</span>
                                    </>
                                )}
                            </div>
                            <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept=".pdf,image/*" className="hidden" />
                        </div>
                        
                        <div className="flex-grow"></div>

                        <button
                            onClick={handleSubmit}
                            disabled={!file || isLoading}
                            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 disabled:bg-slate-400"
                        >
                            {isLoading ? 'Analyzing...' : 'Analyze BOQ'}
                        </button>
                    </div>

                    {/* Right Side - Output */}
                    <div className="w-full md:w-2/3 p-6 overflow-y-auto">
                       <ResponseDisplay isLoading={isLoading} error={error} response={result} />
                       {!isLoading && !error && !result && (
                            <div className="text-center text-slate-500 h-full flex flex-col items-center justify-center">
                                <h3 className="text-lg font-semibold">Awaiting Analysis</h3>
                                <p className="max-w-md mt-2">Upload your Bill of Quantities file (.pdf, .png, .jpg) to get an AI-powered verification report.</p>
                            </div>
                       )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BoqAnalysisModal;