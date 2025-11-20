import { create } from 'zustand';

interface UIState {
    viewMode: 'scan' | 'list';
    setViewMode: (mode: 'scan' | 'list') => void;
}

export const useUIStore = create<UIState>((set) => ({
    viewMode: 'scan',
    setViewMode: (mode) => set({ viewMode: mode }),
}));
