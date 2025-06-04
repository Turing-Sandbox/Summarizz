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

export interface ImageLora {
  path?: string;
  scale: number;
}

export interface ModelConfig {
  temperature: number;
  maxOutputTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
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
