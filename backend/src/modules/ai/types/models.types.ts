export enum AIModel {
  Gemini20Flash = 'gemini-2.0-flash',
  Gemini15Flash = 'gemini-1.5-flash',
}

export interface ModelConfig {
  temperature: number;
  maxOutputTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
}