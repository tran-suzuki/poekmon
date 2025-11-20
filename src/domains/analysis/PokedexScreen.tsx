import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { useAnalysisStore } from './store';

const StatRow = ({ label, value }: { label: string; value: number }) => (
    <div className="flex items-center text-xs mb-1">
        <span className="w-12 font-bold text-green-900">{label}</span>
        <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
                className="h-full bg-green-500 transition-all duration-1000 ease-out"
                style={{ width: `${Math.min((value / 255) * 100, 100)}%` }}
            />
        </div>
        <span className="w-8 text-right text-gray-900 font-mono">{value}</span>
    </div>
);

const PokedexScreen: React.FC = () => {
    const { pokemonData, isProcessing, currentAudio, playAudio, generateVoice } = useAnalysisStore();

    const handlePlayAudio = async () => {
        if (currentAudio) {
            playAudio(currentAudio);
        } else if (pokemonData?.description) {
            await generateVoice(pokemonData.description);
        }
    };

    if (isProcessing) {
        return (
            <div className="w-full h-full bg-green-100 border-4 border-gray-600 rounded-lg p-4 flex flex-col items-center justify-center shadow-[inset_0_0_20px_rgba(0,0,0,0.2)]">
                <div className="text-green-900 animate-pulse font-mono text-xl">ANALYZING...</div>
                <div className="w-full h-2 bg-green-200 mt-4 rounded overflow-hidden">
                    <div className="h-full bg-green-800 animate-shimmer w-1/2 mx-auto"></div>
                </div>
            </div>
        );
    }

    if (!pokemonData) {
        return (
            <div className="w-full h-full bg-gray-900 border-4 border-gray-600 rounded-lg p-4 flex items-center justify-center shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
                <div className="text-gray-500 pixel-font text-center">
                    WAITING FOR TARGET...
                    <br />
                    <span className="text-xs">Press the blue button to scan.</span>
                </div>
            </div>
        );
    }

    const chartData = [
        { subject: 'HP', A: pokemonData.stats.hp, fullMark: 255 },
        { subject: 'ATK', A: pokemonData.stats.attack, fullMark: 255 },
        { subject: 'DEF', A: pokemonData.stats.defense, fullMark: 255 },
        { subject: 'SPD', A: pokemonData.stats.speed, fullMark: 255 },
        { subject: 'S.DEF', A: pokemonData.stats.spDef, fullMark: 255 },
        { subject: 'S.ATK', A: pokemonData.stats.spAtk, fullMark: 255 },
    ];

    return (
        <div className="w-full h-full bg-[#98CB98] border-8 border-gray-700 rounded-lg p-2 shadow-[inset_0_0_20px_rgba(0,0,0,0.1)] font-mono relative overflow-hidden flex flex-col">
            {/* Scanlines effect */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_4px,3px_100%]"></div>

            <div className="relative z-20 text-gray-900 h-full overflow-y-auto pb-4 custom-scrollbar">

                {/* Header */}
                <div className="border-b-2 border-gray-800 pb-1 mb-2 flex justify-between items-end">
                    <h2 className="text-xl font-bold truncate">{pokemonData.speciesName}</h2>
                    <div className="flex gap-1">
                        {pokemonData.types.map((type) => (
                            <span key={type} className="px-1.5 py-0.5 bg-gray-800 text-[#98CB98] text-[10px] uppercase rounded">
                                {type}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Description */}
                <div className="bg-green-800/10 p-2 rounded mb-3 border border-green-800/20 relative group">
                    <div className="text-sm leading-snug italic pr-6">"{pokemonData.description}"</div>

                    {/* Play Button in description box */}
                    <button
                        onClick={handlePlayAudio}
                        className="absolute top-2 right-1 text-green-900 hover:text-green-700 transition-colors p-1 bg-green-800/20 rounded-full"
                        title="音声を再生"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                        </svg>
                    </button>
                </div>

                {/* Stats & Chart Layout */}
                <div className="grid grid-cols-2 gap-2 mb-2">
                    <div className="col-span-1">
                        <StatRow label="HP" value={pokemonData.stats.hp} />
                        <StatRow label="攻" value={pokemonData.stats.attack} />
                        <StatRow label="防" value={pokemonData.stats.defense} />
                        <StatRow label="特攻" value={pokemonData.stats.spAtk} />
                        <StatRow label="特防" value={pokemonData.stats.spDef} />
                        <StatRow label="素早" value={pokemonData.stats.speed} />
                    </div>
                    <div className="col-span-1 h-32 -ml-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                                <PolarGrid stroke="#374151" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#111827', fontSize: 8, fontWeight: 'bold' }} />
                                <Radar
                                    name="Stats"
                                    dataKey="A"
                                    stroke="#111827"
                                    fill="#111827"
                                    fillOpacity={0.3}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Moves */}
                <div className="mt-2">
                    <div className="text-xs font-bold mb-1 border-b border-gray-800 inline-block">覚える技</div>
                    <div className="grid grid-cols-2 gap-2">
                        {pokemonData.moves.map((move, idx) => (
                            <div key={idx} className="bg-gray-800 text-[#98CB98] px-2 py-1 text-xs rounded text-center truncate">
                                {move}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PokedexScreen;
