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
import { LowerTierImageGenerationRequest } from '../../types';

const APP_ERROR_SOURCE = 'image.together.generation.service';

export class TogetherImageGenerationService implements ImageGenerationStrategy {
    private readonly defaultModelType: AIGenerationModel;
    private prompt: PromptTemplate;
    private encoding: Tiktoken;
    
    constructor() {
        checkEnvironmentVariables(APP_ERROR_SOURCE, AIProvider.TOGETHER);
    
        this.defaultModelType = AIGenerationModel.TogetherVQGAN;
        this.prompt = PromptTemplate.fromTemplate(IMAGE_GENERATION_USER_PROMPT);
        this.encoding = getEncoding('cl100k_base');
    }
    
    setupTogetherAIClient(): Together {
        const togetherAI = new Together({
        apiKey: env.ai.togetherKey,
        baseURL: env.ai.togetherBaseUrl,
        });
    
        if (!togetherAI) {
        throw new AppError(
            500,
            'Failed to initialize Together AI client. Please check your environment variables.',
            APP_ERROR_SOURCE
        );
        }
    
        return togetherAI;
    }

    async generate(
        request: LowerTierImageGenerationRequest | HigherTierImageGenerationRequest
    ): Promise<LowerTierImageGenerationResponse | HigherTierImageGenerationRequest> {
        const startTime = Date.now();
        const modelType = request.options?.model || this.defaultModelType;

        try {
            /**
             * TODO: Implement Together AI Image Generation Logc
             */
            return {};

        } catch (error) {
            logger.error(`Error generating image using model ${modelType}`, { error });
            if (error instanceof AppError) {
                throw error;
            }

            throw new AppError(
                500,
                'Failed to generate image. Please try again later.',
                APP_ERROR_SOURCE
            );
        }
    }
}
