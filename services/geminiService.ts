
import { GoogleGenAI, Type } from "@google/genai";
import { HeroProfile } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateHero = async (themePreference?: string): Promise<HeroProfile> => {
  const prompt = themePreference 
    ? `Create a unique superhero based on the theme: ${themePreference}. Give them a name, alias, detailed backstory, and specific power.`
    : "Create a unique superhero with a name, alias, detailed backstory, and specific power.";

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          alias: { type: Type.STRING },
          backstory: { type: Type.STRING },
          powerName: { type: Type.STRING },
          powerDescription: { type: Type.STRING },
          color: { type: Type.STRING, description: "A hex color code representing the hero's suit" },
          stats: {
            type: Type.OBJECT,
            properties: {
              strength: { type: Type.INTEGER },
              agility: { type: Type.INTEGER },
              intelligence: { type: Type.INTEGER },
              power: { type: Type.INTEGER }
            },
            required: ["strength", "agility", "intelligence", "power"]
          }
        },
        required: ["name", "alias", "backstory", "powerName", "powerDescription", "color", "stats"]
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Failed to parse hero profile", e);
    // Fallback hero
    return {
      name: "Solara",
      alias: "The Solar Sentinel",
      backstory: "Born in the heart of a dying star...",
      powerName: "Plasma Burst",
      powerDescription: "Shoots intense beams of solar energy.",
      color: "#f59e0b",
      stats: { strength: 80, agility: 70, intelligence: 90, power: 100 }
    };
  }
};
