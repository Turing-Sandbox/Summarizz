import {GenerativeModel, GoogleGenerativeAI} from "@google/generative-ai";
import { PromptTemplate } from '@langchain/core/prompts';
import { AIModel, SummarizationRequest, SummarizationResponse } from '../types';
import { SUMMARY_SYSTEM_PROMPT, SUMMARY_USER_PROMPT } from '../config/prompts';
import { MODEL_CONFIGS } from '../config/models';
import { AppError } from '../../../shared/errors';
import { logger } from '../../../shared/utils/logger';
import { env } from '../../../shared/config/environment';
import { getEncoding } from 'js-tiktoken';

export class SummarizationService {
  private model: GenerativeModel;
  private prompt: PromptTemplate;

  constructor() {
    // Validate Gemini API key
    if (!env.ai.geminiKey) {
      throw new AppError(500, 'Gemini API key not found in environment variables. Please set GEMINI_API_KEY.', 'summarization.service');
    }

    // Initialize Gemini model
    const defaultModel = AIModel.Gemini20Flash;
    const genAI = new GoogleGenerativeAI(env.ai.geminiKey);
    this.model = genAI.getGenerativeModel({
      model: defaultModel,
      systemInstruction: SUMMARY_SYSTEM_PROMPT,
      generationConfig: MODEL_CONFIGS[defaultModel],
    });

    // Initialize prompt template
    this.prompt = PromptTemplate.fromTemplate(SUMMARY_USER_PROMPT);
  }

  async summarize(request: SummarizationRequest): Promise<SummarizationResponse> {
    const startTime = Date.now();
    const model = request.options?.model || AIModel.Gemini15Flash;

    try {
      // Format the prompt with system and user messages combined
      const formattedPrompt = await this.prompt.format({
        text: request.text,
      });

      // Call the model
      const result = await this.model.generateContent(formattedPrompt);
      const summary = result.response.text();

      const endTime = Date.now();
      const processingTime = endTime - startTime;

      // Calculate token usage
      const encoding = getEncoding('cl100k_base');
      const promptTokens = encoding.encode(formattedPrompt).length;
      const summaryTokens = encoding.encode(summary).length;
      const tokenCount = promptTokens + summaryTokens;

      return {
        summary,
        metadata: {
          model,
          processingTime,
          tokenCount
        }
      };
    } catch (error) {
      logger.error('Error in summarization service', { error });
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(500, 'Failed to generate summary', 'summarization.service');
    }
  }
}