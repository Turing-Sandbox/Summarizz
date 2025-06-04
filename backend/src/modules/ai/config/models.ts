import { AIGenerationModel, AIModel, GenerationModelConfig, ModelConfig } from '../types';

export const SUMMARIZATION_MODEL_CONFIGS: Record<AIModel, ModelConfig> = {
  [AIModel.Gemini20Flash]: {
    temperature: 0.2,
    maxOutputTokens: 1500,
    topP: 1,
    frequencyPenalty: 0.1,
    presencePenalty: 0.1,
  },
  [AIModel.Gemini15Flash]: {
    temperature: 0.2,
    maxOutputTokens: 1500,
    topP: 1,
    frequencyPenalty: 0.1,
    presencePenalty: 0.1,
  },
  [AIModel.Gemini15FlashLite]: {
    temperature: 0.2,
    maxOutputTokens: 1500,
    topP: 1,
    frequencyPenalty: 0.1,
    presencePenalty: 0.1,
  }
};

export const IMAGE_GENERATION_MODEL_CONFIGS: Record<AIGenerationModel, GenerationModelConfig> = {
  [AIGenerationModel.Gemini20FlashImageGenPreview]: {},
  [AIGenerationModel.TogetherFlux1SchnellFree]: {},
  [AIGenerationModel.TogetherFlux1Schnell]: {},
  [AIGenerationModel.TogetherFlux1Dev]: {}
};
