import React, { useRef, useEffect, useState } from 'react';

interface CameraCaptureProps {
  onCapture: (base64Image: string) => void;
  isProcessing: boolean;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, isProcessing }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' },
          audio: false 
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("カメラへのアクセスが拒否されました。");
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
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

  if (error) {
    return <div className="text-white bg-black p-4 rounded border border-red-500">{error}</div>;
  }

  return (
    <div className="relative w-full aspect-[4/3] bg-black rounded-lg border-4 border-gray-700 shadow-inner overflow-hidden group">
      {/* Video Feed */}
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted 
        className={`w-full h-full object-cover ${isProcessing ? 'opacity-50 filter grayscale' : ''}`}
      />
      
      {/* Scanning Overlay Animation */}
      {!isProcessing && (
        <div className="absolute inset-0 pointer-events-none opacity-30 bg-[linear-gradient(transparent_50%,rgba(0,255,0,0.25)_50%)] bg-[length:100%_4px]"></div>
      )}
      
      {/* Capture Button Overlay */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <button
          onClick={handleCapture}
          disabled={isProcessing}
          className={`
            w-16 h-16 rounded-full border-4 border-white flex items-center justify-center shadow-lg transition-all
            ${isProcessing ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-400 active:scale-95'}
          `}
        >
          <div className="w-full h-full rounded-full opacity-50 animate-pulse bg-white"></div>
        </button>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraCapture;
