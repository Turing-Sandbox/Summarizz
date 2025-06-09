import { env } from '../../../shared/config/environment';
import { AppError } from '../../../shared/errors';

export function checkEnvironmentVariables(source: string): void {
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
     *
     **/
}
