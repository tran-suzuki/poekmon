
import React, { useRef, useEffect, useState } from 'react';

interface CameraCaptureProps {
  onCapture: (base64Image: string) => void;
  isProcessing: boolean;
  previewImage?: string | null; // If provided, show this instead of camera
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, isProcessing, previewImage }) => {
  const [inputMode, setInputMode] = useState<'camera' | 'upload'>('camera');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Only start camera if we are NOT in preview mode AND in camera mode
    if (previewImage || inputMode === 'upload') {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      return;
    }

    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false
        });
        streamRef.current = mediaStream;
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setError(''); // Clear error on success
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("カメラへのアクセスが拒否されました。");
        setInputMode('upload'); // Auto switch to upload on error
      }
    };

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [previewImage, inputMode]); // Re-run when previewImage or inputMode changes

  // Resume video when processing finishes (only if not in preview mode and in camera mode)
  useEffect(() => {
    if (!previewImage && !isProcessing && inputMode === 'camera' && videoRef.current && videoRef.current.srcObject) {
      videoRef.current.play().catch(e => console.log("Resume error:", e));
    }
  }, [isProcessing, previewImage, inputMode]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      // Freeze the video frame
      video.pause();

      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        // Get base64 data (remove the "data:image/jpeg;base64," part for Gemini)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        const base64Data = dataUrl.split(',')[1];
        onCapture(base64Data);
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        // result is data:image/jpeg;base64,...
        const base64Data = result.split(',')[1];
        onCapture(base64Data);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative w-full aspect-[4/3] bg-black rounded-lg border-4 border-gray-700 shadow-inner overflow-hidden group">
      {previewImage ? (
        <img
          src={`data:image/jpeg;base64,${previewImage}`}
          className="w-full h-full object-cover filter contrast-125"
          alt="Stored subject"
        />
      ) : inputMode === 'upload' ? (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 p-4">
          <div className="border-2 border-dashed border-green-500/50 rounded-lg w-full h-full flex flex-col items-center justify-center gap-4 bg-green-900/10 relative overflow-hidden">
            {/* Grid Background */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_95%,rgba(0,255,0,0.1)_95%)] bg-[length:20px_20px]"></div>
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(90deg,transparent_95%,rgba(0,255,0,0.1)_95%)] bg-[length:20px_20px]"></div>

            <div className="text-green-500 font-mono text-xs tracking-widest animate-pulse">{error || "NO SIGNAL"}</div>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="z-10 px-6 py-3 bg-gray-800 border-2 border-green-500 text-green-400 font-mono text-sm rounded hover:bg-gray-700 active:bg-green-900 transition-colors shadow-[0_0_10px_rgba(0,255,0,0.3)] flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
              </svg>
              LOAD IMAGE
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            <div className="text-green-700/50 text-[10px] font-mono mt-2">SUPPORTED FORMATS: JPG, PNG</div>
          </div>
        </div>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover transition-all duration-300 ${isProcessing ? 'filter grayscale contrast-125' : ''}`}
        />
      )}

      {/* Scanning Overlay Animation (Only when live camera) */}
      {!isProcessing && !previewImage && inputMode === 'camera' && (
        <div className="absolute inset-0 pointer-events-none opacity-30 bg-[linear-gradient(transparent_50%,rgba(0,255,0,0.25)_50%)] bg-[length:100%_4px]"></div>
      )}

      {/* Processing Overlay */}
      {isProcessing && (
        <div className="absolute inset-0 pointer-events-none bg-green-900/20 flex flex-col items-center justify-center z-20">
          <div className="w-full h-0.5 bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.8)] animate-pulse mb-2"></div>
          <div className="text-green-400 font-mono text-sm tracking-widest animate-pulse bg-black/50 px-2">PROCESSING...</div>
        </div>
      )}

      {/* Capture Button Overlay - Hide when processing OR in preview mode OR in upload mode */}
      {!isProcessing && !previewImage && inputMode === 'camera' && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
          <button
            onClick={handleCapture}
            className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center shadow-lg transition-all bg-blue-500 hover:bg-blue-400 active:scale-95"
          >
            <div className="w-full h-full rounded-full opacity-50 animate-pulse bg-white"></div>
          </button>
        </div>
      )}

      {/* Mode Toggle Button */}
      {!isProcessing && !previewImage && (
        <button
          onClick={() => setInputMode(prev => prev === 'camera' ? 'upload' : 'camera')}
          className="absolute top-2 right-2 z-20 p-2 bg-black/50 rounded-full border border-gray-500 text-white hover:bg-black/80 transition-colors"
          title={inputMode === 'camera' ? "Switch to Upload" : "Switch to Camera"}
        >
          {inputMode === 'camera' ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
            </svg>
          )}
        </button>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraCapture;
