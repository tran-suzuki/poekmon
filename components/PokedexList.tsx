
import React, { useState, useEffect } from 'react';
import { SavedEntry } from '../types';
import { getEntries, deleteEntry } from '../utils/storage';

interface PokedexListProps {
  onSelect: (entry: SavedEntry) => void;
}

const PokedexList: React.FC<PokedexListProps> = ({ onSelect }) => {
  const [entries, setEntries] = useState<SavedEntry[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setEntries(getEntries());
  }, []);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('このデータを削除しますか？')) {
      const updated = deleteEntry(id);
      setEntries(updated);
    }
  };

  const filtered = entries.filter(entry => 
    entry.speciesName.includes(search) || 
    entry.types.some(t => t.includes(search)) ||
    entry.description.includes(search)
  );

  return (
    <div className="w-full h-full bg-[#98CB98] border-8 border-gray-700 rounded-lg p-2 shadow-[inset_0_0_20px_rgba(0,0,0,0.1)] font-mono relative flex flex-col overflow-hidden">
      {/* Scanlines effect */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_4px,3px_100%]"></div>

      {/* Search Bar */}
      <div className="relative z-20 mb-2 shrink-0">
        <input 
          type="text" 
          placeholder="SEARCH..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-green-900/10 border border-green-800 rounded px-2 py-1 text-gray-900 placeholder-gray-600 focus:outline-none focus:bg-green-900/20 font-bold uppercase"
        />
      </div>

      {/* List */}
      <div className="relative z-20 flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
        {filtered.length === 0 ? (
          <div className="text-center text-gray-600 mt-10">NO DATA FOUND</div>
        ) : (
          filtered.map((entry) => (
            <div 
              key={entry.id}
              onClick={() => onSelect(entry)}
              className="flex items-center bg-green-800/5 border border-green-800/20 rounded p-2 hover:bg-green-800/20 cursor-pointer transition-colors group"
            >
              {/* Thumbnail */}
              <div className="w-12 h-12 bg-black rounded overflow-hidden border border-green-900 shrink-0">
                <img src={`data:image/jpeg;base64,${entry.imageBase64}`} alt="" className="w-full h-full object-cover opacity-80" />
              </div>
              
              {/* Info */}
              <div className="ml-3 flex-1 min-w-0">
                <div className="font-bold text-gray-900 truncate">{entry.speciesName}</div>
                <div className="flex gap-1 mt-0.5">
                  {entry.types.map(t => (
                    <span key={t} className="text-[10px] bg-green-900 text-[#98CB98] px-1 rounded">{t}</span>
                  ))}
                </div>
              </div>

              {/* Delete Button */}
              <button 
                onClick={(e) => handleDelete(e, entry.id)}
                className="p-2 text-green-900 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PokedexList;
