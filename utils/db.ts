import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { SavedEntry } from '../types';

interface HumanPokedexDB extends DBSchema {
    entries: {
        key: string;
        value: SavedEntry;
        indexes: { 'by-date': number };
    };
}

const DB_NAME = 'human-pokedex-db';
const DB_VERSION = 1;
const STORE_NAME = 'entries';
const LOCAL_STORAGE_KEY = 'human_pokedex_db_v1';

let dbPromise: Promise<IDBPDatabase<HumanPokedexDB>> | null = null;

export const initDB = async () => {
    if (!dbPromise) {
        dbPromise = openDB<HumanPokedexDB>(DB_NAME, DB_VERSION, {
            upgrade(db) {
                const store = db.createObjectStore(STORE_NAME, {
                    keyPath: 'id',
                });
                store.createIndex('by-date', 'timestamp');
            },
        });
    }
    return dbPromise;
};

export const saveEntryToDB = async (entry: SavedEntry) => {
    const db = await initDB();
    await db.put(STORE_NAME, entry);
    return entry;
};

export const getEntriesFromDB = async (): Promise<SavedEntry[]> => {
    const db = await initDB();
    // Get all entries and sort by timestamp descending (newest first)
    const entries = await db.getAllFromIndex(STORE_NAME, 'by-date');
    return entries.reverse();
};

export const deleteEntryFromDB = async (id: string) => {
    const db = await initDB();
    await db.delete(STORE_NAME, id);
};

export const migrateFromLocalStorage = async () => {
    try {
        const json = localStorage.getItem(LOCAL_STORAGE_KEY);
        console.log("Migration: Checking localStorage...", json ? "Data found" : "No data");
        if (json) {
            const entries: SavedEntry[] = JSON.parse(json);
            console.log(`Migration: Found ${entries.length} entries.`);
            if (entries.length > 0) {
                console.log(`Migrating ${entries.length} entries from localStorage to IndexedDB...`);
                const db = await initDB();
                const tx = db.transaction(STORE_NAME, 'readwrite');

                for (const entry of entries) {
                    await tx.store.put(entry);
                }

                await tx.done;
                console.log('Migration complete.');

                // Optional: Clear localStorage after successful migration
                // localStorage.removeItem(LOCAL_STORAGE_KEY); 
                // Keeping it for now as backup or until confirmed
            }
        }
    } catch (e) {
        console.error("Migration failed:", e);
    }
};
