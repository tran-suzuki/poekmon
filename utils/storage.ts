
import { SavedEntry, PokemonData } from '../types';

const STORAGE_KEY = 'human_pokedex_db_v1';

export const saveEntry = (data: PokemonData, imageBase64: string): SavedEntry => {
  const existingData = getEntries();
  
  const newEntry: SavedEntry = {
    ...data,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    imageBase64
  };

  // Add to beginning
  const updatedData = [newEntry, ...existingData];
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
  } catch (e) {
    console.error("Storage full or error", e);
    // If full, remove oldest
    if (existingData.length > 0) {
      const sliced = existingData.slice(0, existingData.length - 1);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([newEntry, ...sliced]));
    }
  }

  return newEntry;
};

export const getEntries = (): SavedEntry[] => {
  try {
    const json = localStorage.getItem(STORAGE_KEY);
    return json ? JSON.parse(json) : [];
  } catch (e) {
    console.error("Error reading storage", e);
    return [];
  }
};

export const deleteEntry = (id: string): SavedEntry[] => {
  const entries = getEntries();
  const updated = entries.filter(e => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};
