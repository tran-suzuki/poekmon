import { create } from 'zustand';
import { SavedEntry } from '../../../types';
import { getEntriesFromDB, saveEntryToDB, deleteEntryFromDB, migrateFromLocalStorage } from './repository';

interface CollectionState {
    entries: SavedEntry[];
    isLoading: boolean;
    loadEntries: () => Promise<void>;
    saveEntry: (entry: SavedEntry) => Promise<void>;
    deleteEntry: (id: string) => Promise<void>;
    migrate: () => Promise<void>;
}

export const useCollectionStore = create<CollectionState>((set, get) => ({
    entries: [],
    isLoading: false,
    loadEntries: async () => {
        set({ isLoading: true });
        const entries = await getEntriesFromDB();
        set({ entries, isLoading: false });
    },
    saveEntry: async (entry) => {
        await saveEntryToDB(entry);
        await get().loadEntries();
    },
    deleteEntry: async (id) => {
        await deleteEntryFromDB(id);
        await get().loadEntries();
    },
    migrate: async () => {
        await migrateFromLocalStorage();
        await get().loadEntries();
    }
}));
