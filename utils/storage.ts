import { SavedEntry, PokemonData } from '../types';
import { saveEntryToDB, getEntriesFromDB, deleteEntryFromDB } from './db';

// Re-export for compatibility, but now they are async
export const saveEntry = async (data: PokemonData, imageBase64: string): Promise<SavedEntry> => {
  const newEntry: SavedEntry = {
    ...data,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    imageBase64
  };

  await saveEntryToDB(newEntry);
  return newEntry;
};

export const getEntries = async (): Promise<SavedEntry[]> => {
  return await getEntriesFromDB();
};

export const deleteEntry = async (id: string): Promise<SavedEntry[]> => {
  await deleteEntryFromDB(id);
  return await getEntriesFromDB();
};
