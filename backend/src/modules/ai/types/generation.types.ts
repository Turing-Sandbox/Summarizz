import { z } from 'zod';
import { AIGenerationModel, } from './models.types';

// Define the schema for the generation request body
export const LowerTierImageGenerationRequestSchema = z.object({
    body: z.object({
        prompt: z.string().min(1, 'Prompt must not be empty.').max(1000, 'Provided prompt is too long.'),
        options: z.object({
            model: z.nativeEnum(AIGenerationModel).optional(),
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
        prompt: z.string().min(1, 'Prompt must not be empty.').max(10000, 'Provided prompt is too long.'),
        options: z.object({
            model: z.nativeEnum(AIGenerationModel).optional(),
            width: z.number().positive().optional(),
            height: z.number().positive().optional(),
            steps: z.number().int().positive().optional(),
            disable_safety_checker: z.boolean().optional(),
        }).optional(),
    }),
    query: z.object({}).optional(),
    params: z.object({}).optional(),
});

// NOTE: Lower tier image generation using Imagen 3/Gemini 2.0 Flash (Image Generation) models
export interface LowerTierImageGenerationRequest {

}

export interface LowerTierImageGenerationResponse {

}

// NOTE: Higher tier image generation using FLUX.1-dev/FLUX.1-schnell-free models
export interface HigherTierImageGenerationRequest {
    prompt: string;
    options?: {
        model?: AIGenerationModel;
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
