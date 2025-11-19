export interface PokemonStats {
  hp: number;
  attack: number;
  defense: number;
  spAtk: number;
  spDef: number;
  speed: number;
}

export interface PokemonData {
  speciesName: string; // The "name" of the human-pokemon
  types: string[];
  stats: PokemonStats;
  moves: string[]; // List of 4 moves
  description: string; // The sarcastic remark
}

export interface AnalysisResult {
  pokemonData: PokemonData;
  audioBase64?: string;
}
