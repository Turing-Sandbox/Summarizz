import { getEncoding, Tiktoken } from 'js-tiktoken';

import { GoogleGenAI } from '@google/genai';
import { PromptTemplate } from '@langchain/core/prompts';
import Together from 'together-ai';

import { AppError } from '../../../shared/errors';
import { env } from '../../../shared/config/environment';
import { logger } from '../../../shared/utils/logger';

import { AIGenerationModel, HigherTierImageGenerationRequest, LowerTierImageGenerationResponse } from '../types';
import { IMAGE_GENERATION_USER_PROMPT } from '../config/prompts';
import { IMAGE_GENERATION_MODEL_CONFIGS } from '../config/models';
import { AIProvider, checkEnvironmentVariables } from '../utils/ai.utils';
import { ImageGenerationStrategy } from '../strategy/generation.strategy';

const APP_ERROR_SOURCE = 'image.google.generation.service';

export class GeminiImageGenerationService implements ImageGenerationStrategy {
    private readonly defaultModelType: AIGenerationModel;
    private prompt: PromptTemplate;
    private encoding: Tiktoken;

    constructor() {
        checkEnvironmentVariables(APP_ERROR_SOURCE, AIProvider.GOOGLE);

        this.defaultModelType = AIGenerationModel.Gemini20FlashImageGenPreview;
        this.prompt = PromptTemplate.fromTemplate(IMAGE_GENERATION_USER_PROMPT);
        this.encoding = getEncoding('cl100k_base');
    }

    setupGoogleGenAIClient(): GoogleGenAI {
        const genAI = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY!,
            vertexai: process.env.GOOGLE_USE_VERTEX_AI === 'true'
        });

        if (!genAI) {
            throw new AppError(
                500,
                'Failed to initialize Google GenAI client. Please check your environment variables.',
                APP_ERROR_SOURCE
            );
        }

        return genAI;
    }

    async generate(
        request: LowerTierImageGenerationResponse | HigherTierImageGenerationRequest
    ): Promise<LowerTierImageGenerationResponse | HigherTierImageGenerationRequest> {
        const startTime = Date.now();
        const modelType = request.options?.model || this.defaultModelType;

        try {
            const genAI = this.setupGoogleGenAIClient();
            const formattedPrompt = await this.prompt.format({
                text: request.text,
            });

            const result = await genAI.models.generateImages({
                model: this.defaultModelType,
                prompt: formattedPrompt,
                config: {
                    ...IMAGE_GENERATION_MODEL_CONFIGS[modelType],
                }
            });

            const imageUrl = result?.generatedImages?.[0]?.image?.imageBytes;
            if (!imageUrl) {
                throw new AppError(
                    500,
                    'Image generation was unsuccessful, there was no image returned for the request.',
                    APP_ERROR_SOURCE
                );
            }

            const endTime = Date.now();
            const tokenCount = this.encoding.encode(formattedPrompt).length;
            const response: LowerTierImageGenerationResponse = {};

            // TODO: Finish implementation for generate method in GeminiImageGenerationService

        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            } else {
                logger.error(
                    APP_ERROR_SOURCE,
                    'An unexpected error occurred during image generation.',
                    error
                );
                throw new AppError(
                    500,
                    'An unexpected error occurred during image generation. Please try again later.',
                    APP_ERROR_SOURCE
                );
            }
        }
    }
}
