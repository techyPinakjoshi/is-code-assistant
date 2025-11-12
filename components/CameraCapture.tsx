import React, { useRef, useEffect, useCallback } from 'react';

interface CameraCaptureProps {
  onCapture: (dataUrl: string) => void;
  onCancel: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = useCallback(async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
        alert("Could not access camera. Please ensure permissions are granted.");
        onCancel();
      }
    }
  }, [onCancel]);

  useEffect(() => {
    startCamera();
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [startCamera]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/jpeg');
        onCapture(dataUrl);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-4">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="max-w-full max-h-[80vh] rounded-lg"
      ></video>
      <canvas ref={canvasRef} className="hidden"></canvas>
      <div className="absolute bottom-8 flex space-x-6">
        <button
          onClick={onCancel}
          className="px-6 py-3 bg-white text-black font-semibold rounded-lg shadow-lg hover:bg-slate-200"
        >
          Cancel
        </button>
        <button
          onClick={handleCapture}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700"
        >
          Capture
        </button>
      </div>
    </div>
  );
};

export default CameraCapture;
