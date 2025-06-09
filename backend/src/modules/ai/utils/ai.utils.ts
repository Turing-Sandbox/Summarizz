import { env } from '../../../shared/config/environment';
import { AppError } from '../../../shared/errors';

export enum AIProvider {
    GEMINI = 'gemini',
    TOGETHER = 'together'
}

export function checkGeminiEnvironmentVariables(source: string): void {
    if (!env.ai.geminiKey) {
        throw new AppError(
            500,
            'Gemini API key not found in environment variables, to prevent this please set GEMINI_API_KEY.',
            source
        );
    }

    if (!env.ai.googleUseVertexAI) {
        throw new AppError(
            500,
            'Google Use Vertex AI not found in environment variables, to prevent this please set GOOGLE_USE_VERTEX_AI.',
            source
        );
    }

    /**
     * NOTE: Uncomment these if we want to use Google Project ID and Location for SummarizationService | ImageGenerationService.
     * 
     * if (!env.ai.googleProjectId) {
     *  throw new AppError(
     *      500, 
     *      'Google Project ID not found in environment variables, to prevent this please set GOOGLE_PROJECT_ID.', 
     *      source
     *  );
     * }
     *
     * if (!env.ai.googleLocation) {
     *  throw new AppError(
     *      500,
     *      'Google Location not found in environment variables, to prevent this please set GOOGLE_LOCATION.',
     *      source
     *  );
     * }
     **/
}

export function checkTogetherEnvironmentVariables(source: string): void {
    if (!env.ai.togetherKey) {
        throw new AppError(
            500,
            'Together AI API key not found in environment variables, to prevent this please set TOGETHER_API_KEY.',
            source
        );
    }

    if (!env.ai.togetherBaseUrl) {
        throw new AppError(
            500,
            'Together AI Base URL not found in environment variables, to prevent this please set TOGETHER_BASE_URL.',
            source
        );
    }
}

export function checkEnvironmentVariables(source: string, provider: AIProvider = AIProvider.GEMINI): void {
    switch (provider) {
        case AIProvider.GEMINI:
            checkGeminiEnvironmentVariables(source);
            break;

        case AIProvider.TOGETHER:
            checkTogetherEnvironmentVariables(source);
            break;

        default:
            throw new AppError(
                500,
                `Unknown AI provider: ${provider}. Please check your environment variables.`,
                source
            );
    }
}
