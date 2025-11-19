import { GoogleGenAI, Type, Modality } from "@google/genai";
import { PokemonData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// 1. Analyze Image to get Pokemon Data
export const analyzeHuman = async (base64Image: string): Promise<PokemonData> => {
  const prompt = `
  この写真を「人間ポケモン」として分析してください。
  非常に辛辣で皮肉屋なポケモン図鑑として振る舞ってください。
  
  以下のルールに従ってJSONを生成してください：
  1. speciesName: 写真の人物の見た目に基づいた、少し面白いまたは不名誉な種族名（例：「万年平社員」「カフェイン中毒」）。
  2. types: 見た目や雰囲気から判断したタイプ（例：「ノーマル」「どく」「ゴースト」「社畜」など）。既存のタイプ以外も可。
  3. stats: 種族値 (HP, Attack, Defense, SpAtk, SpDef, Speed). 0-255の範囲。見た目で適当に決める。
  4. moves: 覚える技4つ。生活感あふれる、または情けない技名（例：「愛想笑い」「責任転嫁」「ドカ食い」）。
  5. description: 写真の人物に対する、短いが強烈な皮肉や悪口を含んだ解説文。100文字以内。
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image,
          },
        },
        { text: prompt },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          speciesName: { type: Type.STRING },
          types: { type: Type.ARRAY, items: { type: Type.STRING } },
          stats: {
            type: Type.OBJECT,
            properties: {
              hp: { type: Type.INTEGER },
              attack: { type: Type.INTEGER },
              defense: { type: Type.INTEGER },
              spAtk: { type: Type.INTEGER },
              spDef: { type: Type.INTEGER },
              speed: { type: Type.INTEGER },
            },
            required: ["hp", "attack", "defense", "spAtk", "spDef", "speed"],
          },
          moves: { type: Type.ARRAY, items: { type: Type.STRING } },
          description: { type: Type.STRING },
        },
        required: ["speciesName", "types", "stats", "moves", "description"],
      },
    },
  });

  const jsonText = response.text;
  if (!jsonText) throw new Error("Failed to generate analysis");
  
  return JSON.parse(jsonText) as PokemonData;
};

// 2. Generate Speech from Description
export const generatePokedexVoice = async (text: string): Promise<string | undefined> => {
  // Instruct the model to read it in a specific way
  const prompt = `以下のテキストを、感情を一切込めずに、機械的かつ冷淡に読み上げてください。\n\n"${text}"`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: { parts: [{ text: prompt }] },
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { 
            voiceName: 'Kore' // Kore is often deeper/stern. Alternatives: Puck, Charon.
          },
        },
      },
    },
  });

  const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  return audioData;
};
