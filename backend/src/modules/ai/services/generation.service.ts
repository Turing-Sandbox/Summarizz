import { AppError } from '../../../shared/errors';

import { HigherTierImageGenerationRequest, LowerTierImageGenerationRequest, LowerTierImageGenerationResponse } from '../types';
import { AIProvider, checkEnvironmentVariables } from '../utils/ai.utils';
import { ImageGenerationStrategy } from '../strategy/generation.strategy';

const APP_ERROR_SOURCE = 'image.generation.service';

export class ImageGenerationService {
    private strategy: ImageGenerationStrategy;

    constructor(strategy?: ImageGenerationStrategy) {
        checkEnvironmentVariables(APP_ERROR_SOURCE, AIProvider.GEMINI);
        checkEnvironmentVariables(APP_ERROR_SOURCE, AIProvider.TOGETHER);

        if (!strategy) {
            throw new AppError(
                400,
                'Invalid strategy provided. Please provide a valid ImageGenerationStrategy instance.',
                APP_ERROR_SOURCE
            );
        }
        this.strategy = strategy;
    }

    getStrategy = (): ImageGenerationStrategy => {
        return this.strategy;
    }

    setStrategy = (strategy: ImageGenerationStrategy): boolean => {
        if (!strategy) {
            throw new AppError(
                400,
                'Invalid strategy provided. Please provide a valid ImageGenerationStrategy instance.',
                APP_ERROR_SOURCE
            );
        }

        this.strategy = strategy;
        return true;
    }

    async generate(
        request: LowerTierImageGenerationRequest | HigherTierImageGenerationRequest
    ): Promise<LowerTierImageGenerationResponse | HigherTierImageGenerationRequest> {
        if (!request) {
            throw new AppError(
                400,
                'Invalid request provided. Please provide a valid image generation request.',
                APP_ERROR_SOURCE
            );
        }
        return this.strategy.generate(request);
    }
}
