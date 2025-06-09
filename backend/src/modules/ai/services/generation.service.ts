import { GenerativeModel, GoogleGenerativeAI } from "@google/generative-ai";
import { PromptTemplate } from '@langchain/core/prompts';
import { AIGenerationModel, HigherTierImageGenerationRequest, LowerTierImageGenerationResponse, SummarizationRequest, SummarizationResponse } from '../types';
import { IMAGE_GENERATION_USER_PROMPT } from '../config/prompts';
import { IMAGE_GENERATION_MODEL_CONFIGS } from '../config/models';
import { AppError } from '../../../shared/errors';
import { logger } from '../../../shared/utils/logger';
import { env } from '../../../shared/config/environment';
import { getEncoding } from 'js-tiktoken';

const APP_ERROR_SOURCE = 'image.generation.service';

export class ImageGenerationService {
    private readonly defaultModelType: AIGenerationModel;
    private prompt: PromptTemplate;

    constructor() {
        if (!env.ai.geminiKey) {
            throw new AppError(500, 'Gemini API key not found in environment variables. Please set GEMINI_API_KEY.', 'image.generation.service');
        }

        this.defaultModelType = AIGenerationModel.Gemini20FlashImageGenPreview;
        this.prompt = PromptTemplate.fromTemplate(IMAGE_GENERATION_USER_PROMPT);
    }

    async generateImageSingle(request: LowerTierImageGenerationResponse | HigherTierImageGenerationRequest): Promise<LowerTierImageGenerationResponse | HigherTierImageGenerationRequest> {
        return [];
    }

    async generateImageMultiple(request: LowerTierImageGenerationResponse | HigherTierImageGenerationRequest): Promise<LowerTierImageGenerationResponse | HigherTierImageGenerationRequest> {
        return [];
    }

    async generateImageStream(request: LowerTierImageGenerationResponse | HigherTierImageGenerationRequest): Promise<LowerTierImageGenerationResponse | HigherTierImageGenerationRequest> {
        return [];
    }        
}