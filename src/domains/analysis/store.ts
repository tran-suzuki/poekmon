import { create } from 'zustand';
import { PokemonData, AnalysisStyle } from './types';
import { analyzeHuman, generatePokedexVoice } from './service';
import { decode, decodeAudioData } from '../../../utils/audioUtils';

interface AnalysisState {
    pokemonData: PokemonData | null;
    isProcessing: boolean;
    currentAudio: string | null;
    analysisStyle: AnalysisStyle;

    setAnalysisStyle: (style: AnalysisStyle) => void;
    setPokemonData: (data: PokemonData | null) => void;
    setCurrentAudio: (audio: string | null) => void;

    analyzeImage: (base64Image: string) => Promise<PokemonData | null>;
    generateVoice: (text: string) => Promise<void>;
    playAudio: (base64Audio: string) => Promise<void>;
    clearData: () => void;
}

// AudioContext singleton (lazy initialized)
let audioContext: AudioContext | null = null;

const getAudioContext = () => {
    if (!audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    return audioContext;
};

export const useAnalysisStore = create<AnalysisState>((set, get) => ({
    pokemonData: null,
    isProcessing: false,
    currentAudio: null,
    analysisStyle: 'spicy',

    setAnalysisStyle: (style) => set({ analysisStyle: style }),
    setPokemonData: (data) => set({ pokemonData: data }),
    setCurrentAudio: (audio) => set({ currentAudio: audio }),

    analyzeImage: async (base64Image) => {
        const { analysisStyle } = get();
        set({ isProcessing: true, pokemonData: null, currentAudio: null });

        try {
            const data = await analyzeHuman(base64Image, analysisStyle);
            set({ pokemonData: data });
            return data;
        } catch (error) {
            console.error("Analysis failed:", error);
            alert("解析に失敗しました。もう一度試してください。");
            return null;
        } finally {
            set({ isProcessing: false });
        }
    },

    generateVoice: async (text) => {
        try {
            const audioBase64 = await generatePokedexVoice(text);
            if (audioBase64) {
                set({ currentAudio: audioBase64 });
                // Auto-play is often desired after generation
                await get().playAudio(audioBase64);
            }
        } catch (error) {
            console.error("Voice generation failed:", error);
        }
    },

    playAudio: async (base64Audio) => {
        try {
            const ctx = getAudioContext();
            if (ctx.state === 'suspended') {
                await ctx.resume();
            }

            const audioBytes = decode(base64Audio);
            const audioBuffer = await decodeAudioData(audioBytes, ctx);

            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;
            source.playbackRate.value = 1.5;
            source.connect(ctx.destination);
            source.start(0);
        } catch (error) {
            console.error("Audio playback error:", error);
        }
    },

    clearData: () => set({ pokemonData: null, currentAudio: null })
}));
