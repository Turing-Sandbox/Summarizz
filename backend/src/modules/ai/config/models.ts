import { AIGenerationModel, AIModel, GenerationModelConfig, ModelConfig } from '../types';
import { HarmBlockMethod, HarmBlockThreshold, HarmCategory } from '@google/genai';
import { SUMMARY_SYSTEM_PROMPT } from './prompts';

const MAX_OUTPUT_TOKENS = 1500;

export const SUMMARIZATION_MODEL_CONFIGS: Record<AIModel, ModelConfig> = {
  [AIModel.Gemini20Flash]: {
    safetySettings: [
      {
        method: HarmBlockMethod.SEVERITY,
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE
      },
      {
        method: HarmBlockMethod.SEVERITY,
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE
      },
      {
        method: HarmBlockMethod.SEVERITY,
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE
      },
      {
        method: HarmBlockMethod.SEVERITY,
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE
      }
    ],
    systemInstruction: SUMMARY_SYSTEM_PROMPT,
    temperature: 0.2,
    maxOutputTokens: MAX_OUTPUT_TOKENS,
    topP: 1,
  },
  [AIModel.Gemini15Flash]: {
    safetySettings: [
      {
        method: HarmBlockMethod.SEVERITY,
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE
      },
      {
        method: HarmBlockMethod.SEVERITY,
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE
      },
      {
        method: HarmBlockMethod.SEVERITY,
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE
      },
      {
        method: HarmBlockMethod.SEVERITY,
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE
      }
    ],
    systemInstruction: SUMMARY_SYSTEM_PROMPT,
    temperature: 0.2,
    maxOutputTokens: MAX_OUTPUT_TOKENS,
    topP: 1,
  },
  [AIModel.Gemini15FlashLite]: {
    safetySettings: [
      {
        method: HarmBlockMethod.SEVERITY,
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE
      },
      {
        method: HarmBlockMethod.SEVERITY,
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE
      },
      {
        method: HarmBlockMethod.SEVERITY,
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE
      },
      {
        method: HarmBlockMethod.SEVERITY,
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE
      }
    ],
    systemInstruction: SUMMARY_SYSTEM_PROMPT,
    temperature: 0.2,
    maxOutputTokens: MAX_OUTPUT_TOKENS,
    topP: 1,
  }
};

export const IMAGE_GENERATION_MODEL_CONFIGS: Record<AIGenerationModel, GenerationModelConfig> = {
  [AIGenerationModel.Gemini20FlashImageGenPreview]: {},
  [AIGenerationModel.TogetherFlux1SchnellFree]: {},
  [AIGenerationModel.TogetherFlux1Schnell]: {},
  [AIGenerationModel.TogetherFlux1Dev]: {}
};
