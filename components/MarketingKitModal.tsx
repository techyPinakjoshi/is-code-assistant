import React, { useState } from 'react';
import { generateMarketingPrompt } from '../services/geminiService';
import ResponseDisplay from './ResponseDisplay';

interface MarketingKitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MarketingKitModal: React.FC<MarketingKitModalProps> = ({ isOpen, onClose }) => {
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<string>('');
    const [isCopied, setIsCopied] = useState(false);

    const handleClose = () => {
        // Reset state on close for next time
        setDescription('');
        setIsLoading(false);
        setError(null);
        setResult('');
        setIsCopied(false);
        onClose();
    };

    const handleSubmit = async () => {
        if (!description || isLoading) return;

        setIsLoading(true);
        setError(null);
        setResult('');

        try {
            const promptResult = await generateMarketingPrompt(description);
            setResult(promptResult);
        } catch (err) {
            setError('Failed to generate prompt. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(result);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };
    
    const handleStartOver = () => {
        setDescription('');
        setResult('');
        setError(null);
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
                className="bg-slate-50 rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-slate-200 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-2xl font-bold text-slate-900">AI Marketing & Brand Kit Assistant</h2>
                    <button onClick={handleClose} className="text-slate-400 hover:text-slate-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <div className="flex-grow p-6 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full">
                            <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <h3 className="text-xl font-bold text-slate-800 mt-4">Generating your design prompt...</h3>
                            <p className="mt-2 text-slate-600">Our AI is crafting a professional brief based on your input.</p>
                        </div>
                    ) : result ? (
                        <div>
                             <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-slate-800">Your Generated Design Prompt</h3>
                                <div>
                                    <button onClick={handleStartOver} className="text-sm font-semibold text-blue-600 hover:underline mr-4">Start Over</button>
                                    <button onClick={handleCopyToClipboard} className="px-4 py-2 bg-blue-600 text-white font-semibold text-sm rounded-lg shadow-sm hover:bg-blue-700">
                                        {isCopied ? 'Copied!' : 'Copy Prompt'}
                                    </button>
                                </div>
                            </div>
                            <ResponseDisplay isLoading={false} error={null} response={result} />
                        </div>
                    ) : (
                        <div>
                            <p className="text-slate-600 mb-4">
                                Describe your company, project, or service below. Our AI will generate a detailed, professional prompt you can use with design tools (like Midjourney, DALL-E) or give to a designer to create a complete brand kit and marketing materials.
                            </p>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="e.g., We are 'TerraForm', a construction company specializing in sustainable, eco-friendly urban development. Our target audience is environmentally conscious city planners and real estate developers. We want our brand to feel modern, trustworthy, and innovative, with a touch of nature..."
                                className="w-full h-48 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-200 resize-none"
                            />
                             {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
                            <div className="mt-4 flex justify-end">
                                <button
                                    onClick={handleSubmit}
                                    disabled={!description}
                                    className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors duration-200"
                                >
                                    Generate Prompt
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MarketingKitModal;