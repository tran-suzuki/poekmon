import React, { useEffect } from 'react';
import CameraCapture from './src/domains/capture/CameraCapture';
import PokedexScreen from './src/domains/analysis/PokedexScreen';
import PokedexList from './src/domains/collection/PokedexList';
import { useAnalysisStore } from './src/domains/analysis/store';
import { useCaptureStore } from './src/domains/capture/store';
import { useCollectionStore } from './src/domains/collection/store';
import { useUIStore } from './src/domains/ui/store';
import { SavedEntry } from './types';

const App: React.FC = () => {
  const {
    pokemonData,
    isProcessing,
    currentAudio,
    analysisStyle,
    setAnalysisStyle,
    analyzeImage,
    generateVoice,
    playAudio,
    setPokemonData,
    setCurrentAudio
  } = useAnalysisStore();

  const {
    previewImage
  } = useCaptureStore();

  const {
    saveEntry,
    migrate
  } = useCollectionStore();

  const {
    viewMode,
    setViewMode
  } = useUIStore();

  useEffect(() => {
    migrate();
  }, [migrate]);

  const handleCapture = async (base64Image: string) => {
    if (isProcessing) return;

    // 1. Analyze Image
    const data = await analyzeImage(base64Image);

    if (data) {
      // Save to storage
      await saveEntry({ ...data, id: crypto.randomUUID(), timestamp: Date.now(), imageBase64: base64Image });

      // 2. Generate Voice
      if (data.description) {
        await generateVoice(data.description);
      }
    }
  };

  const handleSelectFromList = (entry: SavedEntry) => {
    setPokemonData(entry);
    setPreviewImage(entry.imageBase64);
    setCurrentAudio(null); // Reset audio
    setViewMode('scan');
  };

  const handleReplayAudio = async () => {
    if (currentAudio) {
      await playAudio(currentAudio);
    } else if (pokemonData?.description) {
      await generateVoice(pokemonData.description);
    }
  };

  const toggleStyle = () => {
    if (analysisStyle === 'spicy') setAnalysisStyle('faithful');
    else if (analysisStyle === 'faithful') setAnalysisStyle('normal');
    else setAnalysisStyle('spicy');
  };

  const getStyleLabel = () => {
    switch (analysisStyle) {
      case 'faithful': return '忠実';
      case 'normal': return '普通';
      case 'spicy': return '辛口';
    }
  };

  const getStyleColor = () => {
    switch (analysisStyle) {
      case 'faithful': return 'bg-blue-500';
      case 'normal': return 'bg-green-500';
      case 'spicy': return 'bg-red-500';
    }
  };

  return (
    <div className="min-h-screen w-full bg-red-700 flex items-start justify-center p-4 py-8 overflow-y-auto">
      {/* Main Pokedex Body */}
      <div className="w-full max-w-md bg-red-600 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-b-8 border-r-8 border-red-900 relative p-4 sm:p-6 flex flex-col gap-6 mb-8 shrink-0">

        {/* Top Decor */}
        <div className="absolute top-0 left-0 w-full h-16 flex items-center px-6 gap-4 z-10 pointer-events-none">
          {/* Big Blue Lens */}
          <div className="w-16 h-16 bg-white rounded-full border-4 border-gray-200 flex items-center justify-center shadow-lg -mt-4 pointer-events-auto cursor-pointer hover:scale-105 transition-transform" onClick={toggleStyle} title={`Current Style: ${getStyleLabel()}`}>
            <div className={`w-12 h-12 ${getStyleColor()} rounded-full border-2 border-white/50 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)] relative overflow-hidden transition-colors duration-300`}>
              <div className="absolute top-2 left-2 w-4 h-4 bg-white rounded-full opacity-60 blur-[1px]"></div>
              {isProcessing && <div className="absolute inset-0 bg-white opacity-50 animate-ping"></div>}
              <div className="absolute bottom-1 right-0 left-0 text-center text-[8px] text-white font-bold drop-shadow-md">{getStyleLabel()}</div>
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

        {/* Screen Container (Left/Top) - Camera or Image Preview */}
        <div className="bg-gray-200 p-4 rounded-bl-[40px] rounded-lg shadow-inner border border-gray-400 shrink-0">
          <div className="flex justify-center mb-2 gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          </div>

          <CameraCapture
            onCapture={handleCapture}
            isProcessing={isProcessing}
          />

          <div className="flex justify-between mt-2 px-2 items-center">
            <button
              onClick={() => {
                setPreviewImage(null);
                setPokemonData(null);
                setViewMode('scan');
              }}
              className="w-6 h-6 bg-red-600 rounded-full border border-red-800 active:bg-red-700 shadow-sm flex items-center justify-center"
              title="Reset Camera"
            >
              <span className="text-[10px] text-white font-bold">R</span>
            </button>
            <div className="flex flex-col gap-[2px]">
              <div className="w-6 h-[2px] bg-gray-600"></div>
              <div className="w-6 h-[2px] bg-gray-600"></div>
              <div className="w-6 h-[2px] bg-gray-600"></div>
            </div>
          </div>
        </div>

        {/* Data Screen (Right/Bottom) - Toggles between Info and List */}
        {/* Fixed height ensures internal scrolling works and doesn't expand the whole page improperly */}
        <div className="h-[400px] flex flex-col shrink-0">
          {viewMode === 'scan' ? (
            <PokedexScreen />
          ) : (
            <PokedexList onSelect={handleSelectFromList} />
          )}

          {/* Controls Decor */}
          <div className="mt-4 flex justify-between items-center px-2 shrink-0">
            {/* D-Pad (Navigation) */}
            <div className="w-24 h-24 relative">
              <div className="absolute top-0 left-1/3 w-1/3 h-full bg-gray-800 rounded shadow-md"></div>
              <div className="absolute top-1/3 left-0 w-full h-1/3 bg-gray-800 rounded shadow-md"></div>
              <div className="absolute top-1/3 left-1/3 w-1/3 h-1/3 bg-gray-700 rounded-full radial-gradient"></div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 items-end">
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('list')}
                  className={`w-12 h-3 rounded-full shadow-inner border text-[8px] flex items-center justify-center font-bold tracking-wider ${viewMode === 'list' ? 'bg-blue-900 border-blue-950 text-blue-200' : 'bg-red-900 border-red-950 text-red-200 hover:bg-red-800'}`}
                >
                  LIST
                </button>
                <button
                  onClick={() => {
                    setViewMode('scan');
                    setPreviewImage(null); // Go back to camera
                  }}
                  className={`w-12 h-3 rounded-full shadow-inner border text-[8px] flex items-center justify-center font-bold tracking-wider ${viewMode === 'scan' ? 'bg-blue-900 border-blue-950 text-blue-200' : 'bg-red-900 border-red-950 text-red-200 hover:bg-red-800'}`}
                >
                  SCAN
                </button>
              </div>
              <button
                onClick={handleReplayAudio}
                disabled={viewMode === 'list' || (!currentAudio && !pokemonData)}
                className={`w-8 h-8 rounded-full border-2 shadow-lg transition-all flex items-center justify-center ${(viewMode === 'scan' && (currentAudio || pokemonData))
                  ? 'bg-yellow-400 border-yellow-600 hover:bg-yellow-300 active:scale-95 cursor-pointer'
                  : 'bg-yellow-600 border-yellow-800 cursor-not-allowed opacity-50'
                  }`}
                aria-label="Replay Audio"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-yellow-900 opacity-75">
                  <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
                  <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
                </svg>
              </button>
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