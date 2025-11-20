export type AnalysisStyle = 'faithful' | 'normal' | 'spicy';

export interface PokemonStats {
    hp: number;
    attack: number;
    defense: number;
    spAtk: number;
    spDef: number;
    speed: number;
}

export interface PokemonData {
    speciesName: string;
    types: string[];
    stats: PokemonStats;
    moves: string[];
    description: string;
}
