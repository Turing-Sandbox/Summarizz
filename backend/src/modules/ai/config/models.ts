import { AIModel, ModelConfig } from '../types';

export const MODEL_CONFIGS: Record<AIModel, ModelConfig> = {
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
};
