import React, { useState, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { analyzeProgress } from '../services/geminiService';
import CameraCapture from './CameraCapture';
import ResponseDisplay from './ResponseDisplay';
import { UploadIcon, CameraIcon } from './icons';

interface ProgressAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Geolocation {
  latitude: number;
  longitude: number;
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


const ProgressAnalysisModal: React.FC<ProgressAnalysisModalProps> = ({ isOpen, onClose }) => {
    const [image, setImage] = useState<{file: File | Blob; preview: string} | null>(null);
    const [geolocation, setGeolocation] = useState<Geolocation | null>(null);
    const [showCamera, setShowCamera] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const resetState = useCallback(() => {
        setImage(null);
        setGeolocation(null);
        setShowCamera(false);
        setIsLoading(false);
        setError(null);
        setResult('');
    }, []);

    const handleClose = () => {
        resetState();
        onClose();
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImage({ file, preview: URL.createObjectURL(file) });
        }
    };

    const handleCapture = (dataUrl: string) => {
        fetch(dataUrl)
            .then(res => res.blob())
            .then(blob => {
                setImage({ file: blob, preview: dataUrl });
                setShowCamera(false);
            });
    };

    const handleGetLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setGeolocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                },
                (err) => {
                    setError(`Geolocation error: ${err.message}`);
                }
            );
        } else {
            setError('Geolocation is not supported by this browser.');
        }
    };

    const handleSubmit = async () => {
        if (!image) {
            setError('Please upload or capture an image first.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setResult('');

        try {
            const imageBase64 = await blobToBase64(image.file);
            const mimeType = image.file.type;
            
            let prompt = `As a civil engineering expert, analyze the construction progress shown in this site photo. Compare it against the standard project design practices.`;
            if (geolocation) {
                prompt += ` The photo was taken at coordinates: Latitude ${geolocation.latitude}, Longitude ${geolocation.longitude}.`;
            }
            prompt += ` Provide a detailed report including:
            1. Current status of the project stage.
            2. Any visible deviations from standard construction plans or safety protocols.
            3. Potential risks or issues.
            4. Suggested next steps or recommendations.`

            const analysisResult = await analyzeProgress(prompt, imageBase64, mimeType);
            setResult(analysisResult);

        } catch (err) {
            setError('Failed to get analysis. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    if (showCamera) {
        return <CameraCapture onCapture={handleCapture} onCancel={() => setShowCamera(false)} />;
    }

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
                    <h2 className="text-2xl font-bold text-slate-900">AI Work Progress Analysis</h2>
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
                            <label className="block text-sm font-medium text-slate-700 mb-2">1. Project Design (Simulated)</label>
                            <div className="flex items-center justify-between p-3 bg-white border border-slate-300 rounded-md">
                                <span className="text-sm text-slate-600 truncate">master_design_plan.pdf</span>
                                <button className="text-sm font-semibold text-blue-600 hover:underline" onClick={() => alert('This would open a file browser to select a new design file.')}>Change</button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">2. Site Image</label>
                            <div className="w-full h-48 bg-slate-200 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300 relative">
                                {image ? (
                                    <img src={image.preview} alt="Site preview" className="object-cover w-full h-full rounded-lg" />
                                ) : (
                                    <span className="text-slate-500">Image Preview</span>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-3 mt-3">
                                <button onClick={() => fileInputRef.current?.click()} className="group w-full flex items-center justify-center py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50">
                                    <span className="transition-transform duration-300 group-hover:scale-110"><UploadIcon /></span> <span className="ml-2">Upload</span>
                                </button>
                                <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />
                                <button onClick={() => setShowCamera(true)} className="group w-full flex items-center justify-center py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50">
                                   <span className="transition-transform duration-300 group-hover:scale-110"><CameraIcon /></span> <span className="ml-2">Camera</span>
                                </button>
                            </div>
                        </div>

                        <div>
                             <label className="block text-sm font-medium text-slate-700 mb-2">3. Geolocation (Optional)</label>
                             <button onClick={handleGetLocation} className="w-full py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50">
                                Get Current Location
                            </button>
                            {geolocation && (
                                <div className="mt-2 text-xs text-slate-500 bg-slate-100 p-2 rounded">
                                    Lat: {geolocation.latitude.toFixed(5)}, Lon: {geolocation.longitude.toFixed(5)}
                                </div>
                            )}
                        </div>

                        <div className="flex-grow"></div>

                        <button
                            onClick={handleSubmit}
                            disabled={!image || isLoading}
                            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 disabled:bg-slate-400"
                        >
                            {isLoading ? 'Analyzing...' : 'Analyze Progress'}
                        </button>
                    </div>

                    {/* Right Side - Output */}
                    <div className="w-full md:w-2/3 p-6 overflow-y-auto">
                       <ResponseDisplay isLoading={isLoading} error={error} response={result} />
                       {!isLoading && !error && !result && (
                            <div className="text-center text-slate-500 h-full flex flex-col items-center justify-center">
                                <h3 className="text-lg font-semibold">Awaiting Analysis</h3>
                                <p className="max-w-md mt-2">Upload or capture an image and click "Analyze Progress" to get an AI-powered report on your construction site.</p>
                            </div>
                       )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProgressAnalysisModal;