import { HarmBlockMethod, HarmBlockThreshold, HarmCategory } from "@google/genai";

export enum AIModel {
  Gemini20Flash = 'gemini-2.0-flash',
  Gemini15Flash = 'gemini-1.5-flash',
  Gemini15FlashLite = 'gemini-1.5-flash-lite',
}

export enum AIGenerationModel {
  Gemini20FlashImageGenPreview = 'gemini-2.0-flash-preview-image-generation',
  TogetherFlux1Dev = 'black-forest-labs/FLUX.1-dev',
  TogetherFlux1Schnell = 'black-forest-labs/FLUX.1-schnell',
  TogetherFlux1SchnellFree = 'black-forest-labs/FLUX.1-schnell-Free',
}

export interface SafetySetting {
  method?: HarmBlockMethod;
  category: HarmCategory;
  threshold: HarmBlockThreshold;
}

export interface ThinkingConfig {
  includeThoughts?: boolean;
  thinkingBudget?: number;
}

export interface HttpOptions {
  baseUrl?: string;
  apiVersion?: string;
  headers?: Record<string, string>;
  timeout?: number;
}

export interface ModelConfig {
  safetySettings?: SafetySetting[];
  systemInstruction?: string;
  temperature?: number;
  topP?: number;
  topK?: number;
  maxOutputTokens?: number;
  stopSequences?: string[];
  thinkingConfig?: ThinkingConfig;
  httpOptions?: HttpOptions;
}

export interface ImageLora {
  path?: string;
  scale: number;
}

export interface GenerationModelConfig {
  steps?: number;
  width?: number;
  height?: number;
  n?: number;
  responseFormat?: string;
  image_loras?: ImageLora[];
  disableSafetyChecker?: boolean;
}
