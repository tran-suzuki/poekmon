import React, { useState, useRef } from 'react';
import CameraCapture from './components/CameraCapture';
import PokedexScreen from './components/PokedexScreen';
import { analyzeHuman, generatePokedexVoice } from './services/geminiService';
import { decode, decodeAudioData } from './utils/audioUtils';
import { PokemonData } from './types';

const App: React.FC = () => {
  const [pokemonData, setPokemonData] = useState<PokemonData | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  // Audio Context for playback
  const audioContextRef = useRef<AudioContext | null>(null);

  const playAudio = async (base64Audio: string) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const audioBytes = decode(base64Audio);
      const audioBuffer = await decodeAudioData(audioBytes, ctx);
      
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.start(0);

    } catch (error) {
      console.error("Audio playback error:", error);
    }
  };

  const handleCapture = async (base64Image: string) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    setPokemonData(null); // Reset display

    try {
      // 1. Analyze Image
      const data = await analyzeHuman(base64Image);
      setPokemonData(data);

      // 2. Generate Voice (Parallel or Sequential - Sequential is safer for flow)
      if (data.description) {
        const audioBase64 = await generatePokedexVoice(data.description);
        if (audioBase64) {
          await playAudio(audioBase64);
        }
      }

    } catch (error) {
      console.error("Analysis failed:", error);
      alert("解析に失敗しました。もう一度試してください。");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-red-700 flex items-center justify-center p-2 sm:p-4">
      {/* Main Pokedex Body */}
      <div className="w-full max-w-md bg-red-600 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-b-8 border-r-8 border-red-900 relative p-4 sm:p-6 flex flex-col gap-6">
        
        {/* Top Decor */}
        <div className="absolute top-0 left-0 w-full h-16 flex items-center px-6 gap-4 z-10 pointer-events-none">
           {/* Big Blue Lens */}
           <div className="w-16 h-16 bg-white rounded-full border-4 border-gray-200 flex items-center justify-center shadow-lg -mt-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full border-2 border-blue-300 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)] relative overflow-hidden">
                 <div className="absolute top-2 left-2 w-4 h-4 bg-white rounded-full opacity-60 blur-[1px]"></div>
                 {isProcessing && <div className="absolute inset-0 bg-blue-300 opacity-50 animate-ping"></div>}
              </div>
           </div>
           {/* Three small lights */}
           <div className="flex gap-2 -mt-8">
              <div className="w-3 h-3 bg-red-900 rounded-full border border-red-950"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full border border-yellow-700 animate-pulse"></div>
              <div className="w-3 h-3 bg-green-600 rounded-full border border-green-800"></div>
           </div>
        </div>

        {/* Container spacing for top decor */}
        <div className="mt-8"></div>

        {/* Screen Container (Left/Top) - Camera */}
        <div className="bg-gray-200 p-4 rounded-bl-[40px] rounded-lg shadow-inner border border-gray-400">
          <div className="flex justify-center mb-2 gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          </div>
          <CameraCapture onCapture={handleCapture} isProcessing={isProcessing} />
          <div className="flex justify-between mt-2 px-2 items-center">
             <div className="w-6 h-6 bg-red-600 rounded-full border border-red-800 animate-pulse"></div>
             <div className="flex flex-col gap-[2px]">
               <div className="w-6 h-[2px] bg-gray-600"></div>
               <div className="w-6 h-[2px] bg-gray-600"></div>
               <div className="w-6 h-[2px] bg-gray-600"></div>
             </div>
          </div>
        </div>

        {/* Data Screen (Right/Bottom) */}
        <div className="flex-1 min-h-[300px] flex flex-col">
          <PokedexScreen data={pokemonData} loading={isProcessing} />
          
          {/* Controls Decor */}
          <div className="mt-4 flex justify-between items-center px-2">
             {/* D-Pad */}
             <div className="w-24 h-24 relative">
                <div className="absolute top-0 left-1/3 w-1/3 h-full bg-gray-800 rounded shadow-md"></div>
                <div className="absolute top-1/3 left-0 w-full h-1/3 bg-gray-800 rounded shadow-md"></div>
                <div className="absolute top-1/3 left-1/3 w-1/3 h-1/3 bg-gray-700 rounded-full radial-gradient"></div>
             </div>
             
             {/* Action Buttons */}
             <div className="flex flex-col gap-2 items-end">
                <div className="flex gap-2">
                   <div className="w-10 h-2 bg-red-900 rounded-full shadow-inner"></div>
                   <div className="w-10 h-2 bg-blue-900 rounded-full shadow-inner"></div>
                </div>
                <div className="w-8 h-8 bg-yellow-400 rounded-full border-2 border-yellow-600 shadow-lg"></div>
             </div>
          </div>
        </div>

        {/* Hinge Decor */}
        <div className="absolute -bottom-8 left-0 w-full flex justify-center opacity-50">
           <div className="w-1/2 h-8 bg-red-800 rounded-b-xl border-b-4 border-red-950"></div>
        </div>

      </div>
    </div>
  );
};

export default App;
