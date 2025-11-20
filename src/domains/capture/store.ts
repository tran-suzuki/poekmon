import { create } from 'zustand';

interface CaptureState {
    previewImage: string | null;
    inputMode: 'camera' | 'upload';
    setPreviewImage: (image: string | null) => void;
    setInputMode: (mode: 'camera' | 'upload') => void;
}

export const useCaptureStore = create<CaptureState>((set) => ({
    previewImage: null,
    inputMode: 'camera',
    setPreviewImage: (image) => set({ previewImage: image }),
    setInputMode: (mode) => set({ inputMode: mode }),
}));
