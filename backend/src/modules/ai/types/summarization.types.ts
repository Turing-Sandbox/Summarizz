import { z } from 'zod';
import { AIModel } from './models.types';

// Define the schema for the request body
export const SummarizationRequestSchema = z.object({
  body: z.object({
    text: z.string().min(1, 'Text cannot be empty').max(10000, 'Text is too long'),
    options: z.object({
      maxLength: z.number().positive().optional(),
      format: z.enum(['concise', 'detailed']).optional(),
      model: z.nativeEnum(AIModel).optional(),
    }).optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const LowerTierImageGenerationRequestSchema = z.object({
  body: z.object({
    prompt: z.string().min(1, 'Prompt cannot be empty').max(500, 'Prompt is too long'),
    options: z.object({
      model: z.nativeEnum(AIModel).optional(),
      width: z.number().positive().optional(),
      height: z.number().positive().optional(),
      steps: z.number().int().positive().optional(),
      disable_safety_checker: z.boolean().optional(),
    }).optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});


export const HigherTierImageGenerationRequestSchema = z.object({
  body: z.object({
    prompt: z.string().min(1, 'Prompt cannot be empty').max(500, 'Prompt is too long'),
    options: z.object({
      model: z.nativeEnum(AIModel).optional(),
      width: z.number().positive().optional(),
      height: z.number().positive().optional(),
      steps: z.number().int().positive().optional(),
      disable_safety_checker: z.boolean().optional(),
    }).optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export type SummarizationRequest = {
  text: string;
  options?: {
    maxLength?: number;
    format?: 'concise' | 'detailed';
    model?: AIModel;
  };
};

export interface SummarizationResponse {
  summary: string;
  metadata: {
    model: string;
    processingTime: number;
    tokenCount: number;
  };
}

export interface SummarizationError {
  code: string;
  message: string;
  details?: unknown;
}

// NOTE: Lower tier image generation using Imagen 3/Gemini 2.0 Flash (Image Generation) models
export interface LowerTierImageGenerationRequest {
  
}

export interface LowerTierImageGenerationResponse {
  
}

// NOTE: Higher tier image generation using FLUX.1-dev/FLUX.1-schnell-free models
export interface HigherTierImageGenerationRequest {
  prompt: string;
  options?: {
    model?: AIModel;
    width?: number;
    height?: number;
    steps?: number;
    disable_safety_checker?: boolean;
  };
}

export interface HigherTierImageGenerationResponse {
  imageUrl: string;
  metadata: {
    model: string;
    processingTime: number;
    tokenCount: number;
  };
}

export interface ImageGenerationError {
  code: string;
  message: string;
  details?: unknown;
}

/**
 * export interface ExpensivelyHighForAbsolutelyNoReasonOtherThanToShowOffWeAreAbleToMakeHighQualityImagesFromTheirAPIImageGenerationRequest {}
 */
