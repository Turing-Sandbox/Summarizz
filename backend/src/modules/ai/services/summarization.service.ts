import { getEncoding, Tiktoken } from 'js-tiktoken';

import { GoogleGenAI, Modality } from '@google/genai';
import { PromptTemplate } from '@langchain/core/prompts';

import { AppError } from '../../../shared/errors';
import { logger } from '../../../shared/utils/logger';
import { SUMMARY_USER_PROMPT } from '../config/prompts';
import { SUMMARIZATION_MODEL_CONFIGS } from '../config/models';
import { AIModel, SummarizationRequest, SummarizationResponse, SummarizationStreamResponse } from '../types';
import { checkEnvironmentVariables } from '../utils/ai.utils';

const APP_ERROR_SOURCE = 'summarization.service';

export class SummarizationService {
  private readonly defaultModelType: AIModel;
  private prompt: PromptTemplate;
  private encoding: Tiktoken;

  constructor() {
    checkEnvironmentVariables(APP_ERROR_SOURCE);

    this.defaultModelType = AIModel.Gemini20Flash;
    this.prompt = PromptTemplate.fromTemplate(SUMMARY_USER_PROMPT);
    this.encoding = getEncoding('cl100k_base');
  }

  setupGenAIClient(): GoogleGenAI {
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

  calculateTokenUsage(formattedPrompt: string, summary: string): number {
    const promptTokens = this.encoding.encode(formattedPrompt).length;
    const summaryTokens = this.encoding.encode(summary).length;
    const tokenCount = promptTokens + summaryTokens;

    return tokenCount;
  }

  async summarize(request: SummarizationRequest): Promise<SummarizationResponse> {
    const startTime = Date.now();
    const modelType = request.options?.model || this.defaultModelType;

    try {
      const genAI = this.setupGenAIClient();
      const formattedPrompt = await this.prompt.format({
        text: request.text,
      });

      /**
       * NOTE: 
       * Generate content using genAI (from above) with proper 
       * configurations (GenerateContentParameters). To view the 
       * full parameters, I referred to the source code 
       * (ctrl-left click on generateContent method).
       *
       * GenerateContentParameters: {
       *    model: string;
       *    contents: ContentListUnion;
       *    config?: GenerateContentConfig;
       * }
       **/
      const result = await genAI.models.generateContent({
        model: this.defaultModelType,
        contents: formattedPrompt,
        config: {
          ...SUMMARIZATION_MODEL_CONFIGS[modelType],
        }
      });

      const summary = result.text;

      if (!summary) {
        throw new AppError(
          500,
          'Failed to generate summary, the model returned an empty response which was unexpected.',
          APP_ERROR_SOURCE
        );
      }

      const endTime = Date.now();
      const processingTime = endTime - startTime;

      // NOTE: Calculate the token usage for the summary response
      const tokenCount = this.calculateTokenUsage(formattedPrompt, summary);

      return {
        summary,
        metadata: {
          model: modelType,
          processingTime: processingTime,
          tokenCount: tokenCount
        }
      };
    } catch (error) {
      logger.error('Error occurred in summarization service', { error });
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(
        500, 
        'An error occurred while generating a summary, please try again.', 
        APP_ERROR_SOURCE
      );
    }
  }

  async summarizeStream(request: SummarizationRequest): Promise<SummarizationStreamResponse> {
    const startTime = Date.now();
    const modelType = request.options?.model || this.defaultModelType;

    try {
      const genAI = this.setupGenAIClient();
      const formattedPrompt = await this.prompt.format({
        text: request.text,
      });

      // NOTE: Call the model to generate the content stream
      const result = await genAI.models.generateContentStream({
        model: modelType,
        contents: formattedPrompt,
        config: {
          ...SUMMARIZATION_MODEL_CONFIGS[modelType],
          responseModalities: [Modality.TEXT]
        }
      });

      if (!result) {
        throw new AppError(
          500,
          'Failed to generate summary stream, the model returned an empty response which was unexpected.',
          APP_ERROR_SOURCE
        );
      }

      const stream = [];
      for await (const chunk of result) {
        const summaryChunk = chunk.text;

        if (!summaryChunk) {
          throw new AppError(
            500,
            'Failed to generate summary stream, the model returned an empty response which was unexpected.',
            APP_ERROR_SOURCE
          );
        }

        logger.debug('Received chunk from summarization stream', { summaryChunk });
        stream.push(summaryChunk);
      }
      
      const endTime = Date.now();
      const processingTime = endTime - startTime;

      // NOTE: Calculate the token usage for the summary response
      const tokenCount = this.calculateTokenUsage(formattedPrompt, stream.join(''));

      return {
        stream,
        metadata: {
          model: modelType,
          processingTime,
          tokenCount
        }
      };

    } catch (error) {
      logger.error('Error occurred in summarization service', { error });
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(
        500, 
        'An error occurred while generating a summary, please try again.', 
        APP_ERROR_SOURCE
      );
    }
  }
}